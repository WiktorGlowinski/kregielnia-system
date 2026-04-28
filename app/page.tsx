'use client';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#050505] text-white font-sans flex flex-col">
      
      {/* 1. HERO SECTION - Wielki wjazd */}
      <section className="relative h-[85vh] flex flex-col items-center justify-center text-center px-4 bg-gradient-to-b from-yellow-900/20 to-[#050505] border-b border-gray-900">
        <div className="absolute top-10 left-10 opacity-30 hidden md:block">
          <p className="text-[10px] tracking-[0.6em] uppercase font-black text-yellow-500">Liberty City / Broker Area</p>
        </div>

        <h1 className="text-6xl md:text-9xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-yellow-200 to-yellow-600 mb-2 tracking-tighter">
          NIKO & ROMAN
        </h1>
        <p className="text-2xl md:text-4xl font-bold mb-10 tracking-[0.4em] uppercase italic text-white/90">
          Bowling <span className="text-yellow-500">&</span> Fun
        </p>
        
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl font-light mb-12 px-6 italic">
          Profesjonalne tory, zimne napoje i klimat, 
          który sprawi, że zapomnisz o kłopotach w Liberty City.
        </p>
        
        <Link href="/rezerwacja" className="group relative">
          <div className="absolute -inset-1 bg-yellow-500 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-1000"></div>
          <button className="relative px-16 py-8 bg-yellow-600 hover:bg-yellow-500 text-black text-2xl font-black rounded-2xl shadow-2xl transition-all hover:scale-110 active:scale-95 uppercase tracking-widest">
            REZERWUJ TOR
          </button>
        </Link>
      </section>

      {/* 2. INFO SECTION - Dane kontaktowe i adresowe */}
      <section className="max-w-7xl mx-auto px-6 py-24 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Adres */}
        <div className="bg-gray-900/30 p-10 rounded-[40px] border border-gray-800/50 backdrop-blur-sm group hover:border-yellow-500/50 transition-colors">
          <h3 className="text-xs font-black text-yellow-500 uppercase tracking-[0.3em] mb-4 text-center md:text-left">Lokalizacja</h3>
          <p className="text-2xl font-bold italic text-center md:text-left">ul. Wschodnia 12</p>
          <p className="text-xl font-light text-gray-400 text-center md:text-left">Liberty City, Broker</p>
        </div>

        {/* Kontakt */}
        <div className="bg-gray-900/30 p-10 rounded-[40px] border border-gray-800/50 backdrop-blur-sm group hover:border-yellow-500/50 transition-colors">
          <h3 className="text-xs font-black text-yellow-500 uppercase tracking-[0.3em] mb-4 text-center md:text-left">Zadzwoń do nas</h3>
          <p className="text-3xl font-black text-center md:text-left">+48 555 010 042</p>
        </div>

        {/* Godziny otwarcia */}
        <div className="bg-gray-900/30 p-10 rounded-[40px] border border-gray-800/50 backdrop-blur-sm group hover:border-yellow-500/50 transition-colors">
          <h3 className="text-xs font-black text-yellow-500 uppercase tracking-[0.3em] mb-4 text-center md:text-left">Godziny otwarcia</h3>
          <div className="flex justify-between text-lg font-medium">
            <span className="text-gray-400">Codziennie</span>
            <span>12:00 — 23:00</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500 mt-2">
            <span>Weekend</span>
            <span className="italic">Do ostatniego klienta!</span>
          </div>
        </div>

      </section>

      {/* 3. QUOTE SECTION - Klimat Romana */}
      <section className="py-20 text-center px-6">
        <p className="text-3xl md:text-4xl font-light italic text-gray-500 max-w-4xl mx-auto leading-relaxed">
          „Kręgle to nasze życie. Zapraszamy wszystkich, którzy wiedzą, co to dobra zabawa.”
        </p>
        <p className="mt-8 text-yellow-500 font-black tracking-widest uppercase">— Unc Jeff</p>
      </section>

      {/* 4. FOOTER - Wejście dla ekipy */}
      <footer className="mt-auto border-t border-gray-900 py-12 px-10 flex flex-col md:flex-row justify-between items-center bg-black/80">
        <div className="flex items-center gap-4 mb-6 md:mb-0">
          <div className="h-8 w-8 bg-yellow-600 rounded-lg flex items-center justify-center font-black text-black">N</div>
          <p className="text-gray-600 text-xs tracking-widest uppercase font-bold">
            &copy; 2026 Niko & Roman Entertainment Inc.
          </p>
        </div>
        
        {/* Bardzo dyskretny link do logowania dla pracowników */}
        <Link 
          href="/login" 
          className="group flex items-center gap-2 text-gray-900 hover:text-yellow-900 transition-colors"
        >
          <span className="text-[10px] uppercase tracking-[0.4em] font-black">Logowanie pracownika</span>
          <div className="h-1 w-1 bg-gray-900 group-hover:bg-yellow-900 rounded-full"></div>
        </Link>
      </footer>
    </main>
  );
}