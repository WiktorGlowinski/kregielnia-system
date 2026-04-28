import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email, firstName, date, startTime, laneNumber, totalPrice } = await req.json();

    const data = await resend.emails.send({
      from: 'Bowling Alley <onboarding@resend.dev>', // Jak kupisz domenę, zmienisz to na swoją
      to: [email],
      subject: `Potwierdzenie rezerwacji - Tor #${laneNumber}`,
      html: `
        <div style="font-family: sans-serif; background: #050505; color: white; padding: 40px; border-radius: 20px;">
          <h1 style="color: #eab308; italic: true;">SIEMA ${firstName.toUpperCase()}!</h1>
          <p>Twoja kula jest już gotowa! Potwierdziliśmy rezerwację.</p>
          <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 15px; border: 1px solid #333;">
            <p><strong>Tor:</strong> #${laneNumber}</p>
            <p><strong>Data:</strong> ${date}</p>
            <p><strong>Godzina:</strong> ${startTime}</p>
            <p><strong>Kwota:</strong> ${totalPrice} PLN</p>
          </div>
          <p style="margin-top: 20px; font-size: 12px; color: #666;">Prosimy o przybycie 10 minut przed czasem.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
}