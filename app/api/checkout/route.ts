import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { bookingId, customerName, totalPrice, email } = await req.json();

    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("Błąd: Brak klucza STRIPE_SECRET_KEY na Vercelu");
      return NextResponse.json({ error: "Brak klucza STRIPE_SECRET_KEY w konfiguracji Vercela." }, { status: 500 });
    }

    // Inicjalizacja bez podawania apiVersion – Stripe sam dobierze odpowiednią wersję!
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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
    console.error("Stripe error:", error.message);
    // Zwracamy DOKŁADNY błąd z biblioteki Stripe do frontendu
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}