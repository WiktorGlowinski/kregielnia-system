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
    <div className="min-h-screen bg-[#050505] text-white flex">
      <aside className="w-72 border-r border-gray-900 p-8 flex flex-col gap-10 sticky top-0 h-screen">
        <div>
          <h1 className="text-2xl font-black italic text-yellow-500 uppercase tracking-tighter">N&R Management</h1>
          <div className="mt-4 p-3 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              Rola: <span className="text-white">{role === 'boss' ? 'Szef' : 'Pracownik'}</span>
            </p>
          </div>
        </div>

        <nav className="flex flex-col gap-2">
          <Link href="/admin/rezerwacje" className={`p-4 rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all ${pathname === '/admin/rezerwacje' ? 'bg-yellow-600 text-black shadow-lg shadow-yellow-600/20' : 'text-gray-500 hover:bg-white/5'}`}>
            📅 Rezerwacje
          </Link>
          
          {role === 'boss' && (
            <>
              {/* NOWA ZAKŁADKA FINANSE */}
              <Link href="/admin/finanse" className={`p-4 rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all ${pathname === '/admin/finanse' ? 'bg-yellow-600 text-black shadow-lg shadow-yellow-600/20' : 'text-gray-500 hover:bg-white/5'}`}>
                💰 Finanse
              </Link>
              <Link href="/admin/buty" className={`p-4 rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all ${pathname === '/admin/buty' ? 'bg-yellow-600 text-black shadow-lg shadow-yellow-600/20' : 'text-gray-500 hover:bg-white/5'}`}>
                👞 Inwentarz Butów
              </Link>
              <Link href="/admin/ekipa" className={`p-4 rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all ${pathname === '/admin/ekipa' ? 'bg-yellow-600 text-black shadow-lg shadow-yellow-600/20' : 'text-gray-500 hover:bg-white/5'}`}>
                👥 Ekipa
              </Link>
            </>
          )}
        </nav>

        <button onClick={() => supabase.auth.signOut().then(() => router.push('/'))} className="mt-auto p-4 rounded-2xl font-black uppercase text-[11px] tracking-widest text-red-500 hover:bg-red-500/10 transition-all text-left">
          🚪 Wyloguj
        </button>
      </aside>

      <main className="flex-1 p-12 bg-[radial-gradient(circle_at_top_right,_#111,_#050505)]">
        {children}
      </main>
    </div>
  );
}