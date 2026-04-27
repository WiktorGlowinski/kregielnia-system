'use client';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0f172a] text-white font-sans">
      {/* HERO SECTION */}
      <section className="relative h-[70vh] flex flex-col items-center justify-center text-center px-4 bg-gradient-to-b from-blue-900/20 to-[#0f172a]">
  <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-4 italic text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
    NIKO&ROMAN <span className="text-white">BOWLING</span>
  </h1>
  <p className="text-xl md:text-2xl text-gray-300 max-w-2xl font-light mb-10">
    „Cousin! Let’s go bowling!” – Najlepsze tory w Liberty City (i Twoim mieście). 
    Prawdziwa zabawa, bez zbędnych telefonów o trzeciej rano.
  </p>
  
  <Link href="/rezerwacja" className="group relative">
    <div className="absolute -inset-1 bg-yellow-500 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-1000"></div>
    <button className="relative px-12 py-6 bg-yellow-600 hover:bg-yellow-500 text-black text-2xl font-black rounded-2xl shadow-2xl transform transition hover:scale-105 active:scale-95 uppercase tracking-widest">
      REZERWUJ TERAZ
    </button>
  </Link>
</section>

      {/* KONTAKT I ADRES */}
      <section className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-8">
        <div className="bg-gray-800/40 p-10 rounded-3xl border border-gray-700/50">
          <h2 className="text-3xl font-bold mb-6 text-blue-400">O nas</h2>
          <p className="text-gray-300 leading-relaxed text-lg">
            Nasza kręgielnia to 8 profesjonalnych torów, strefa VIP oraz najlepsza obsługa. 
            Organizujemy urodziny, imprezy firmowe i turnieje.
          </p>
        </div>

        <div className="bg-gray-800/40 p-10 rounded-3xl border border-gray-700/50">
          <h2 className="text-3xl font-bold mb-6 text-blue-400">Kontakt</h2>
          <div className="space-y-4">
            <p className="text-xl"><span className="text-gray-500 uppercase text-xs block">Adres:</span> ul. Sportowa 15, Miasto</p>
            <p className="text-xl"><span className="text-gray-500 uppercase text-xs block">Telefon:</span> +48 123 456 789</p>
            <p className="text-xl"><span className="text-gray-500 uppercase text-xs block">Godziny:</span> Codziennie 12:00 - 23:00</p>
          </div>
        </div>
      </section>
    </main>
  );
}