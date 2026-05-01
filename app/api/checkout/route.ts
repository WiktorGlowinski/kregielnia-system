import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(req: Request) {
  try {
    const { bookingId, customerName, totalPrice, email } = await req.json();

    // SPRAWDZENIE: Czy klucz w ogóle istnieje
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("Błąd: Brak STRIPE_SECRET_KEY w środowisku.");
      return NextResponse.json({ error: "Błąd konfiguracji po stronie serwera" }, { status: 500 });
    }

    // INICJALIZACJA WEWNĄTRZ FUNKCJI: To chroni przed błędem podczas 'npm run build'
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-01-27-ac' as any,
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'blik', 'p24'],
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'pln',
            product_data: {
              name: `Rezerwacja Toru - N&R Management`,
              description: `Dla: ${customerName}`,
            },
            unit_amount: Math.round(totalPrice * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/rezerwacja?success=true&bookingId=${bookingId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/rezerwacja?canceled=true`,
      metadata: {
        bookingId: bookingId,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}