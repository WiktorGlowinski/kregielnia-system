'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.push('/login');
      
      const { data } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
      setRole(data?.role || 'employee');
      setLoading(false);
    };
    checkAccess();
  }, [router]);

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-yellow-500 font-black uppercase italic">Ładowanie panelu...</div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col lg:flex-row">
      
      {/* 1. SIDEBAR - Elastyczny na telefonach, boczny na desktopie */}
      <aside className="w-full lg:w-72 border-b lg:border-b-0 lg:border-r border-gray-900 p-6 md:p-8 flex flex-col justify-between gap-6 md:gap-10 lg:sticky top-0 lg:h-screen overflow-y-auto shrink-0">
        <div className="flex flex-col gap-6 lg:gap-10">
          <div>
            <h1 className="text-xl md:text-2xl font-black italic text-yellow-500 uppercase tracking-tighter">
              N&R Management
            </h1>
            <div className="mt-4 p-3 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-3 w-fit">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                Rola: <span className="text-white">{role === 'boss' ? 'Szef' : 'Pracownik'}</span>
              </p>
            </div>
          </div>

          {/* Siatka przycisków na mobile, pionowa lista na desktopie */}
          <nav className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-col gap-2">
            <Link href="/admin/rezerwacje" className={`p-3.5 md:p-4 rounded-2xl font-black uppercase text-[10px] md:text-[11px] tracking-widest transition-all text-center lg:text-left ${pathname === '/admin/rezerwacje' ? 'bg-yellow-600 text-black shadow-lg shadow-yellow-600/20' : 'text-gray-500 hover:bg-white/5'}`}>
              📅 Rezerwacje
            </Link>
            
            {role === 'boss' && (
              <>
                <Link href="/admin/tory" className={`p-3.5 md:p-4 rounded-2xl font-black uppercase text-[10px] md:text-[11px] tracking-widest transition-all text-center lg:text-left ${pathname === '/admin/tory' ? 'bg-yellow-600 text-black shadow-lg shadow-yellow-600/20' : 'text-gray-500 hover:bg-white/5'}`}>
                  🎳 Tory
                </Link>
                <Link href="/admin/kody" className={`p-3.5 md:p-4 rounded-2xl font-black uppercase text-[10px] md:text-[11px] tracking-widest transition-all text-center lg:text-left ${pathname === '/admin/kody' ? 'bg-yellow-600 text-black shadow-lg shadow-yellow-600/20' : 'text-gray-500 hover:bg-white/5'}`}>
                  🎟️ Kody Rabatowe
                </Link>
                <Link href="/admin/klienci" className={`p-3.5 md:p-4 rounded-2xl font-black uppercase text-[10px] md:text-[11px] tracking-widest transition-all text-center lg:text-left ${pathname === '/admin/klienci' ? 'bg-yellow-600 text-black shadow-lg shadow-yellow-600/20' : 'text-gray-500 hover:bg-white/5'}`}>
                  👥 Klienci i CRM
                </Link>
                <Link href="/admin/finanse" className={`p-3.5 md:p-4 rounded-2xl font-black uppercase text-[10px] md:text-[11px] tracking-widest transition-all text-center lg:text-left ${pathname === '/admin/finanse' ? 'bg-yellow-600 text-black shadow-lg shadow-yellow-600/20' : 'text-gray-500 hover:bg-white/5'}`}>
                  💰 Finanse
                </Link>
                <Link href="/admin/buty" className={`p-3.5 md:p-4 rounded-2xl font-black uppercase text-[10px] md:text-[11px] tracking-widest transition-all text-center lg:text-left ${pathname === '/admin/buty' ? 'bg-yellow-600 text-black shadow-lg shadow-yellow-600/20' : 'text-gray-500 hover:bg-white/5'}`}>
                  👞 Inwentarz Butów
                </Link>
                <Link href="/admin/ekipa" className={`p-3.5 md:p-4 rounded-2xl font-black uppercase text-[10px] md:text-[11px] tracking-widest transition-all text-center lg:text-left ${pathname === '/admin/ekipa' ? 'bg-yellow-600 text-black shadow-lg shadow-yellow-600/20' : 'text-gray-500 hover:bg-white/5'}`}>
                  👥 Ekipa
                </Link>
              </>
            )}
          </nav>
        </div>

        <button onClick={() => supabase.auth.signOut().then(() => router.push('/'))} className="mt-4 lg:mt-auto p-3.5 md:p-4 rounded-2xl font-black uppercase text-[10px] md:text-[11px] tracking-widest text-red-500 hover:bg-red-500/10 transition-all text-center lg:text-left">
          🚪 Wyloguj
        </button>
      </aside>

      {/* 2. MAIN CONTENT - Elastyczny padding i pełna szerokość na mobile */}
      <main className="flex-1 p-4 sm:p-6 lg:p-12 bg-[radial-gradient(circle_at_top_right,_#111,_#050505)] overflow-y-auto w-full max-w-full">
        {children}
      </main>
    </div>
  );
}