import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Usuwamy apiVersion, żeby Stripe użył domyślnej wersji Twojego konta
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

export async function POST(req: Request) {
  try {
    const { bookingId, customerName, totalPrice, email } = await req.json();

    const host = req.headers.get('host');
    const protocol = host?.includes('localhost') ? 'http' : 'https';
    const origin = `${protocol}://${host}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'blik', 'p24'],
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'pln',
            product_data: {
              name: `Rezerwacja toru - ${customerName}`,
            },
            unit_amount: Math.round(totalPrice * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/rezerwacja?success=true&bookingId=${bookingId}`,
      cancel_url: `${origin}/rezerwacja?canceled=true`,
      metadata: {
        bookingId: bookingId.toString(),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}