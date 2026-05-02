'use client';
import Link from 'next/link';

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-transparent text-white font-sans flex flex-col">
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[65vh] flex flex-col items-center justify-center text-center px-4 pt-28 md:pt-0">
        
        {/* LOGO I MENU */}
        <div className="absolute top-0 left-0 w-full px-4 md:px-10 py-4 md:py-8 flex flex-col md:flex-row justify-between items-center gap-3 md:gap-6 z-20 select-none">
          <Link href="/" className="text-base md:text-xl font-black italic tracking-tighter uppercase hover:opacity-80 transition-opacity whitespace-nowrap">
            NIKO & ROMAN <span className="text-yellow-500">BOWLING</span>
          </Link>
          <div className="flex flex-wrap justify-center gap-3 md:gap-6">
            <Link href="/" className="text-[10px] md:text-[11px] text-gray-400 hover:text-yellow-500 uppercase font-black tracking-widest transition-colors whitespace-nowrap">
              Strona główna
            </Link>
            <Link href="/o-nas" className="text-[10px] md:text-[11px] text-gray-400 hover:text-yellow-500 uppercase font-black tracking-widest transition-colors whitespace-nowrap">
              O nas
            </Link>
            <Link href="/tory" className="text-[10px] md:text-[11px] text-gray-400 hover:text-yellow-500 uppercase font-black tracking-widest transition-colors whitespace-nowrap">
              Opis torów
            </Link>
            <Link href="/lokalizacja" className="text-[10px] md:text-[11px] text-gray-400 hover:text-yellow-500 uppercase font-black tracking-widest transition-colors whitespace-nowrap">
              Lokalizacja
            </Link>
            <Link href="/kontakt" className="text-[10px] md:text-[11px] text-yellow-500 uppercase font-black tracking-widest transition-colors whitespace-nowrap">
              Kontakt
            </Link>
          </div>
        </div>

        <h1 className="text-4xl md:text-8xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-yellow-200 to-yellow-600 mb-2 tracking-tighter uppercase pr-12 overflow-visible select-none">
          KONTAKT{" "}
        </h1>
        <p className="text-lg md:text-3xl font-bold mb-6 tracking-[0.4em] uppercase italic text-white/90">
          Zadzwoń <span className="text-yellow-500">&</span> Napisz
        </p>
      </section>

      {/* 2. KONTAKT CARDS */}
      <section className="max-w-7xl mx-auto px-6 py-16 md:py-24 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 w-full z-10">
        
        {/* Zadzwoń */}
        <div className="bg-gray-900/20 p-8 md:p-10 rounded-[40px] border border-gray-800/40 backdrop-blur-md group hover:border-yellow-500/50 transition-colors">
          <h3 className="text-xs font-black text-yellow-500 uppercase tracking-[0.3em] mb-4 text-center md:text-left">Zadzwoń do nas</h3>
          <p className="text-2xl md:text-3xl font-black text-center md:text-left">+48 555 010 042</p>
        </div>

        {/* E-mail */}
        <div className="bg-gray-900/20 p-8 md:p-10 rounded-[40px] border border-gray-800/40 backdrop-blur-md group hover:border-yellow-500/50 transition-colors">
          <h3 className="text-xs font-black text-yellow-500 uppercase tracking-[0.3em] mb-4 text-center md:text-left">Napisz maila</h3>
          <p className="text-xl md:text-2xl font-bold italic text-center md:text-left break-all">rezerwacje@nrbowling.pl</p>
        </div>

        {/* Social Media */}
        <div className="bg-gray-900/20 p-8 md:p-10 rounded-[40px] border border-gray-800/40 backdrop-blur-md group hover:border-yellow-500/50 transition-colors">
          <h3 className="text-xs font-black text-yellow-500 uppercase tracking-[0.3em] mb-4 text-center md:text-left">Social Media</h3>
          <p className="text-base md:text-xl font-light text-gray-400 text-center md:text-left">Znajdziesz nas pod nazwą <span className="text-white font-bold">@NRBowling</span> na Facebooku.</p>
        </div>

      </section>

      {/* 3. FOOTER */}
      <footer className="mt-auto border-t border-gray-900/80 py-12 px-10 flex flex-col md:flex-row justify-between items-center bg-black/60 backdrop-blur-sm gap-6 md:gap-0 z-10">
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 bg-yellow-600 rounded-lg flex items-center justify-center font-black text-black">N</div>
          <p className="text-gray-600 text-xs tracking-widest uppercase font-bold">
            © 2026 Niko & Roman Entertainment Inc.
          </p>
        </div>
        <Link href="/login" className="group flex items-center gap-2 text-gray-900 hover:text-yellow-900 transition-colors">
          <span className="text-[10px] uppercase tracking-[0.4em] font-black">Logowanie pracownika</span>
          <div className="h-1 w-1 bg-gray-900 group-hover:bg-yellow-900 rounded-full"></div>
        </Link>
      </footer>
    </main>
  );
}