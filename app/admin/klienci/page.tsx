'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AdminCRM() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [blockedList, setBlockedList] = useState<any[]>([]);
  const [blockEmail, setBlockEmail] = useState({ email: '', reason: '' });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchCRMData = async () => {
    setLoading(true);
    // Pobieramy rezerwacje, żeby wyliczyć lojalność
    const { data: bookings } = await supabase.from('bookings').select('*');
    // Pobieramy czarną listę
    const { data: blocked } = await supabase.from('blocked_customers').select('*');

    if (bookings) {
      // Grupowanie rezerwacji po emailu klienta
      const cMap: Record<string, any> = {};
      bookings.forEach((b) => {
        if (!b.email) return;
        const email = b.email.toLowerCase().trim();
        if (!cMap[email]) {
          cMap[email] = {
            email: email,
            name: b.customer_name,
            total_spent: 0,
            visits: 0
          };
        }
        if (b.status === 'confirmed') {
          cMap[email].total_spent += Number(b.total_price || 0);
          cMap[email].visits += 1;
        }
      });
      setCustomers(Object.values(cMap).sort((a, b) => b.visits - a.visits));
    }

    if (blocked) setBlockedList(blocked);
    setLoading(false);
  };

  useEffect(() => {
    const checkBoss = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const { data } = await supabase.from('profiles').select('role').eq('id', session?.user.id).single();
      if (data?.role !== 'boss') router.push('/admin/rezerwacje');
      else fetchCRMData();
    };
    checkBoss();
  }, [router]);

  const handleBlockCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockEmail.email) return;

    const { error } = await supabase.from('blocked_customers').insert([{
      email: blockEmail.email.toLowerCase().trim(),
      reason: blockEmail.reason
    }]);

    if (!error) {
      setBlockEmail({ email: '', reason: '' });
      fetchCRMData();
    } else alert("Klient jest już na czarnej liście!");
  };

  const handleUnblock = async (id: string) => {
    const { error } = await supabase.from('blocked_customers').delete().eq('id', id);
    if (!error) fetchCRMData();
  };

  if (loading) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700">
      <h2 className="text-5xl font-black italic uppercase tracking-tighter">Baza Klientów i CRM</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* DODAWANIE DO CZARNEJ LISTY */}
        <div className="bg-gray-900/40 p-10 rounded-[40px] border border-gray-800 shadow-2xl h-fit">
          <h3 className="text-xl font-black mb-8 italic text-red-500 uppercase tracking-tighter">Blokuj Klienta</h3>
          <form onSubmit={handleBlockCustomer} className="space-y-4">
            <div className="bg-black/50 p-4 rounded-2xl border border-white/5 text-center">
              <label className="text-[10px] font-black text-gray-500 uppercase block mb-1">Email do zablokowania</label>
              <input type="email" required className="w-full bg-transparent outline-none font-bold text-white text-center" value={blockEmail.email} onChange={e => setBlockEmail({...blockEmail, email: e.target.value})} />
            </div>
            <div className="bg-black/50 p-4 rounded-2xl border border-white/5 text-center">
              <label className="text-[10px] font-black text-gray-500 uppercase block mb-1">Powód</label>
              <input type="text" placeholder="np. Nie przychodzi na rezerwacje" className="w-full bg-transparent outline-none font-bold text-white text-center" value={blockEmail.reason} onChange={e => setBlockEmail({...blockEmail, reason: e.target.value})} />
            </div>
            <button className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-5 rounded-2xl uppercase tracking-widest transition-all">Dodaj do czarnej listy</button>
          </form>
        </div>

        {/* LISTA KLIENTÓW */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white/5 border border-white/5 rounded-[40px] overflow-hidden backdrop-blur-md">
            <h3 className="text-sm font-black p-6 uppercase text-gray-400 tracking-widest border-b border-white/5">Ranking Lojalności Klientów</h3>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 text-[10px] uppercase text-gray-500 font-black tracking-widest">
                  <th className="p-6">Klient</th>
                  <th className="p-6">Wizyty</th>
                  <th className="p-6">Wydane Łącznie</th>
                  <th className="p-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {customers.map((c, i) => {
                  const isBlocked = blockedList.some(b => b.email === c.email);
                  return (
                    <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-6">
                        <p className="font-bold text-white uppercase text-sm">{c.name}</p>
                        <p className="text-xs text-gray-500 font-mono italic">{c.email}</p>
                      </td>
                      <td className="p-6 font-bold text-white">{c.visits} razy</td>
                      <td className="p-6 font-black text-green-500">{c.total_spent} PLN</td>
                      <td className="p-6">
                        {isBlocked ? (
                          <span className="bg-red-600/20 text-red-500 border border-red-500/30 font-black text-[9px] px-3 py-1 rounded-full uppercase">Zablokowany</span>
                        ) : (
                          <span className="bg-green-600/20 text-green-500 border border-green-500/30 font-black text-[9px] px-3 py-1 rounded-full uppercase">Aktywny VIP</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* LISTA ZABLOKOWANYCH */}
          <div className="bg-white/5 border border-white/5 rounded-[40px] overflow-hidden backdrop-blur-md">
            <h3 className="text-sm font-black p-6 uppercase text-red-500 tracking-widest border-b border-white/5">Czarna Lista (Zablokowane Emaile)</h3>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 text-[10px] uppercase text-gray-500 font-black tracking-widest">
                  <th className="p-6">Email</th>
                  <th className="p-6">Powód</th>
                  <th className="p-6 text-right">Akcja</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {blockedList.map((b) => (
                  <tr key={b.id} className="hover:bg-red-950/10 transition-colors">
                    <td className="p-6 font-bold text-white">{b.email}</td>
                    <td className="p-6 text-gray-400 text-xs font-medium italic">{b.reason || 'Brak powodu'}</td>
                    <td className="p-6 text-right">
                      <button onClick={() => handleUnblock(b.id)} className="text-[10px] font-black uppercase text-red-400 hover:underline">Odblokuj</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {blockedList.length === 0 && <p className="p-10 text-center text-gray-600 uppercase font-black text-[10px] italic">Brak zablokowanych klientów</p>}
          </div>
        </div>
      </div>
    </div>
  );
}