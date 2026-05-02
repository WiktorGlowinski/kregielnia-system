import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';

// Bez sztywnej daty API
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(req: Request) {
  const payload = await req.text();
  const sig = req.headers.get('stripe-signature') || '';

  let event;

  try {
    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Obsługa udanej płatności
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.bookingId;

    if (bookingId) {
      // 1. Pobieramy dane rezerwacji z bazy
      const { data: booking } = await supabase
        .from('bookings')
        .select('*, lanes(number)')
        .eq('id', bookingId)
        .single();

      if (booking) {
        // 2. Aktualizujemy status płatności w bazie na opłacony
        await supabase
          .from('bookings')
          .update({ payment_status: 'paid' })
          .eq('id', bookingId);

        // 3. Wysyłamy potwierdzenie na maila
        const firstName = booking.customer_name.split(' ')[0];
        const date = booking.start_time.split('T')[0];
        const startTime = booking.start_time.substring(11, 16);

        await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://' + req.headers.get('host')}/api/send-confirmation`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: booking.email,
            firstName: firstName,
            date: date,
            startTime: startTime,
            laneNumber: booking.lanes?.number || booking.lane_id,
            totalPrice: booking.total_price
          }),
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}