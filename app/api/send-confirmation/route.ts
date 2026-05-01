import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Wymuszenie trybu dynamicznego, żeby Vercel nie wywalał błędu przy budowaniu
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { email, firstName, date, startTime, laneNumber, totalPrice } = await req.json();

    // 1. Sprawdzenie, czy klucz w ogóle istnieje
    if (!process.env.RESEND_API_KEY) {
      console.error("Błąd: Brak RESEND_API_KEY w środowisku.");
      return NextResponse.json({ error: "Błąd konfiguracji maili po stronie serwera" }, { status: 500 });
    }

    // 2. Inicjalizacja Resend DOPIERO wewnątrz funkcji POST
    const resend = new Resend(process.env.RESEND_API_KEY);

    // 3. Wysyłka maila
    await resend.emails.send({
      from: 'Niko & Roman Bowling <onboarding@resend.dev>', // Tu możesz podać swoją domenę
      to: email,
      subject: `Potwierdzenie rezerwacji - N&R Bowling`,
      html: `
        <h2>Siema ${firstName}!</h2>
        <p>Twoja rezerwacja toru została potwierdzona i opłacona.</p>
        <ul>
          <li><strong>Data:</strong> ${date}</li>
          <li><strong>Godzina:</strong> ${startTime}</li>
          <li><strong>Tor:</strong> #${laneNumber}</li>
          <li><strong>Kwota:</strong> ${totalPrice} PLN</li>
        </ul>
        <p>Do zobaczenia na torze!<br>Jan Kręglarz</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}