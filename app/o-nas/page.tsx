'use client';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#050505] text-white font-sans flex flex-col">
      
      {/* 1. HERO SECTION */}
      <section className="relative h-[65vh] flex flex-col items-center justify-center text-center px-4 bg-gradient-to-b from-yellow-900/20 to-[#050505] border-b border-gray-900">
        
        {/* LOGO W LEWYM GÓRNYM ROGU */}
        <div className="absolute top-8 left-10 z-20">
          <Link href="/" className="text-xl font-black italic tracking-tighter uppercase hover:opacity-80 transition-opacity select-none">
            NIKO & ROMAN <span className="text-yellow-500">BOWLING</span>
          </Link>
        </div>

        {/* 5 ZAKŁADEK NAWIGACYJNYCH - O nas podświetlone */}
        <div className="absolute top-8 right-10 flex gap-6 z-20">
          <Link href="/" className="text-[10px] text-gray-400 hover:text-yellow-500 uppercase font-black tracking-widest transition-colors">
            Strona główna
          </Link>
          <Link href="/o-nas" className="text-[10px] text-yellow-500 uppercase font-black tracking-widest transition-colors">
            O nas
          </Link>
          <Link href="/tory" className="text-[10px] text-gray-400 hover:text-yellow-500 uppercase font-black tracking-widest transition-colors">
            Opis torów
          </Link>
          <Link href="/lokalizacja" className="text-[10px] text-gray-400 hover:text-yellow-500 uppercase font-black tracking-widest transition-colors">
            Lokalizacja
          </Link>
          <Link href="/kontakt" className="text-[10px] text-gray-400 hover:text-yellow-500 uppercase font-black tracking-widest transition-colors">
            Kontakt
          </Link>
        </div>

        <h1 className="text-5xl md:text-8xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-yellow-200 to-yellow-600 mb-2 tracking-tighter uppercase pr-12 overflow-visible select-none">
          KIM JESTEŚMY{" "}
        </h1>
        <p className="text-xl md:text-3xl font-bold mb-6 tracking-[0.4em] uppercase italic text-white/90">
          Nasza <span className="text-yellow-500">Historia</span>
        </p>
      </section>

      {/* 2. INFO SECTION */}
      <section className="max-w-7xl mx-auto px-6 py-24 grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
        <div className="bg-gray-900/30 p-10 rounded-[40px] border border-gray-800/50 backdrop-blur-sm group hover:border-yellow-500/50 transition-colors">
          <h3 className="text-xs font-black text-yellow-500 uppercase tracking-[0.3em] mb-4 text-center md:text-left">Jak to się zaczęło</h3>
          <p className="text-lg md:text-xl font-light text-gray-300 leading-relaxed italic md:text-left text-center">
            Wszystko zaczęło się od marzenia o biznesie, który pozwoli nam zapomnieć o trudach codziennego życia w Liberty City. Roman zawsze powtarzał, że kręgle to świetny sposób na relaks – i miał rację.
          </p>
        </div>

        <div className="bg-gray-900/30 p-10 rounded-[40px] border border-gray-800/50 backdrop-blur-sm group hover:border-yellow-500/50 transition-colors">
          <h3 className="text-xs font-black text-yellow-500 uppercase tracking-[0.3em] mb-4 text-center md:text-left">Nasza misja dzisiaj</h3>
          <p className="text-lg md:text-xl font-light text-gray-300 leading-relaxed italic md:text-left text-center">
            Dziś oferujemy Wam profesjonalne tory, zimne napoje i unikalny klimat, w którym każdy poczuje się jak część naszej ekipy. Nieważne czy rzucasz pierwsze kule, czy grasz od lat – u nas liczy się tylko dobra zabawa.
          </p>
        </div>
      </section>

      {/* 3. QUOTE SECTION */}
      <section className="py-20 text-center px-6">
        <p className="text-3xl md:text-4xl font-light italic text-gray-500 max-w-4xl mx-auto leading-relaxed">
          „Cousin, let's go bowling!” — ten prosty tekst stał się naszą największą inspiracją.
        </p>
        <p className="mt-8 text-yellow-500 font-black tracking-widest uppercase">— Roman Bellic</p>
      </section>

      {/* 4. FOOTER */}
      <footer className="mt-auto border-t border-gray-900 py-12 px-10 flex flex-col md:flex-row justify-between items-center bg-black/80">
        <div className="flex items-center gap-4 mb-6 md:mb-0">
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