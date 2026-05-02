'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function LanesPage() {
  const [lanes, setLanes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLanes = async () => {
      const { data } = await supabase.from('lanes').select('*').eq('is_active', true).order('number');
      if (data) setLanes(data);
      setLoading(false);
    };
    fetchLanes();
  }, []);

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
            <Link href="/tory" className="text-[10px] md:text-[11px] text-yellow-500 uppercase font-black tracking-widest transition-colors whitespace-nowrap">
              Opis torów
            </Link>
            <Link href="/lokalizacja" className="text-[10px] md:text-[11px] text-gray-400 hover:text-yellow-500 uppercase font-black tracking-widest transition-colors whitespace-nowrap">
              Lokalizacja
            </Link>
            <Link href="/kontakt" className="text-[10px] md:text-[11px] text-gray-400 hover:text-yellow-500 uppercase font-black tracking-widest transition-colors whitespace-nowrap">
              Kontakt
            </Link>
          </div>
        </div>

        <h1 className="text-4xl md:text-8xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-yellow-200 to-yellow-600 mb-2 tracking-tighter uppercase pr-12 overflow-visible select-none">
          NASZE TORY{" "}
        </h1>
        <p className="text-lg md:text-3xl font-bold mb-6 tracking-[0.4em] uppercase italic text-white/90">
          Bowling <span className="text-yellow-500">&</span> Ceny
        </p>
      </section>

      {/* 2. GRID Z CAŁĄ LISTĄ TORÓW */}
      <section className="max-w-7xl mx-auto px-6 py-16 md:py-24 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 w-full z-10">
        {loading ? (
          <p className="text-yellow-500 text-center py-10 font-bold uppercase text-xl tracking-widest animate-pulse col-span-full">
            Ładowanie cennika...
          </p>
        ) : (
          lanes.map((lane) => (
            <div key={lane.id} className="bg-gray-900/20 p-8 md:p-10 rounded-[40px] border border-gray-800/40 backdrop-blur-md group hover:border-yellow-500/50 transition-colors flex flex-col justify-between min-h-[380px]">
              <div>
                <div className="flex justify-between items-start mb-4 gap-2">
                  <div className="flex flex-col gap-2">
                    <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter italic">Tor #{lane.number}</h3>
                    {lane.has_bumpers ? (
                      <span className="text-[9px] bg-blue-600/20 text-blue-400 font-black px-3 py-1 rounded-full uppercase tracking-widest w-fit border border-blue-400/30 text-center">
                        👶 Posiada bandy dla dzieci
                      </span>
                    ) : (
                      <span className="text-[9px] bg-yellow-600/20 text-yellow-400 font-black px-3 py-1 rounded-full uppercase tracking-widest w-fit border border-yellow-400/30 text-center">
                        🎯 Tor standardowy
                      </span>
                    )}
                  </div>
                  <p className="text-2xl md:text-3xl font-black text-green-500 whitespace-nowrap">{lane.price_per_hour} zł<span className="text-xs text-gray-500 font-light">/h</span></p>
                </div>
                <p className="text-base md:text-lg font-light text-gray-400 italic leading-relaxed mt-4">
                  {lane.has_bumpers 
                    ? "Specjalna wersja toru wyposażona w automatycznie wysuwane bandy boczne. Dzięki nim kule nie wpadają do rynien, co gwarantuje świetną zabawę najmłodszym oraz początkującym graczom."
                    : "W pełni profesjonalny, klasyczny tor bowlingowy. Idealny dla grup dorosłych, młodzieży i wszystkich tych, którzy chcą sprawdzić swoje prawdziwe umiejętności bez ułatwień."
                  }
                </p>

                {/* Specyfikacja toru */}
                <div className="mt-6 pt-4 border-t border-gray-800/60">
                  <h4 className="text-xs font-black text-yellow-500 uppercase tracking-widest mb-2">Specyfikacja</h4>
                  <ul className="text-sm font-light text-gray-300 space-y-1">
                    <li>• Maksymalna liczba graczy: <span className="text-white font-bold">{lane.max_people || 6} osób</span></li>
                    <li>• Typ toru: <span className="text-white font-bold">{lane.has_bumpers ? "Bumper / Dla dzieci" : "Standard"}</span></li>
                  </ul>
                </div>
              </div>

              {/* Wyjaśnienie ceny */}
              <div className="mt-6 pt-4 border-t border-gray-800/60">
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
                  Dlaczego ta cena? 
                  <span className="text-white font-normal lowercase ml-1 normal-case block mt-1 text-xs">
                    {lane.has_bumpers 
                      ? "Wyższa stawka wynika z zastosowania mechanicznych band podnoszonych w locie oraz luksusowej, powiększonej loży kanapowej – idealnej dla całych rodzin."
                      : "Standardowa stawka bez żadnych dopłat. Płacisz wyłącznie za profesjonalny, idealnie naoliwiony tor i czystą, sportową rywalizację."
                    }
                  </span>
                </p>
              </div>
            </div>
          ))
        )}
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