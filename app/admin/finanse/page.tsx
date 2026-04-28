'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AdminFinance() {
  const [stats, setStats] = useState({
    total: 0,
    lanes: 0,
    shoes: 0,
    count: 0
  });
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchFinanceData = async () => {
    setLoading(true);
    // Pobieramy potwierdzone rezerwacje wraz z wynajmem butów
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        *,
        shoe_rentals(quantity, shoe_id, shoe_inventory(price_per_rental))
      `)
      .eq('status', 'confirmed')
      .order('created_at', { ascending: false });

    if (bookings) {
      let totalRev = 0;
      let shoeRev = 0;
      let laneRev = 0;

      bookings.forEach(b => {
        const bTotal = Number(b.total_price);
        totalRev += bTotal;
        
        let currentShoeSum = 0;
        b.shoe_rentals?.forEach((sr: any) => {
          const price = Number(sr.shoe_inventory?.price_per_rental || 5);
          currentShoeSum += sr.quantity * price;
        });

        shoeRev += currentShoeSum;
        laneRev += (bTotal - currentShoeSum);
      });

      setStats({
        total: totalRev,
        lanes: laneRev,
        shoes: shoeRev,
        count: bookings.length
      });
      setHistory(bookings);
    }
    setLoading(false);
  };

  useEffect(() => {
    const checkBoss = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const { data } = await supabase.from('profiles').select('role').eq('id', session?.user.id).single();
      if (data?.role !== 'boss') {
        router.push('/admin/rezerwacje');
      } else {
        fetchFinanceData();
      }
    };
    checkBoss();
  }, [router]);

  if (loading) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <h2 className="text-5xl font-black italic uppercase tracking-tighter">Finanse i Raporty</h2>
        <button onClick={fetchFinanceData} className="text-[10px] font-black uppercase bg-white/5 px-6 py-2 rounded-full hover:bg-white/10 transition-all text-gray-400 border border-white/5">Odśwież raport</button>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/5 border border-white/5 p-8 rounded-[32px] backdrop-blur-md">
          <p className="text-[10px] uppercase font-black text-gray-500 tracking-widest mb-2 text-left">Łączny Przychód</p>
          <p className="text-4xl font-black text-green-500 tracking-tighter text-left">{stats.total} <span className="text-sm">PLN</span></p>
        </div>
        <div className="bg-white/5 border border-white/5 p-8 rounded-[32px] backdrop-blur-md text-left">
          <p className="text-[10px] uppercase font-black text-gray-500 tracking-widest mb-2">Zysk z Torów</p>
          <p className="text-3xl font-black text-white tracking-tighter">{stats.lanes} <span className="text-sm">PLN</span></p>
        </div>
        <div className="bg-white/5 border border-white/5 p-8 rounded-[32px] backdrop-blur-md text-left">
          <p className="text-[10px] uppercase font-black text-gray-500 tracking-widest mb-2">Zysk z Butów</p>
          <p className="text-3xl font-black text-yellow-500 tracking-tighter">{stats.shoes} <span className="text-sm">PLN</span></p>
        </div>
        <div className="bg-white/5 border border-white/5 p-8 rounded-[32px] backdrop-blur-md text-left">
          <p className="text-[10px] uppercase font-black text-gray-500 tracking-widest mb-2">Liczba Rezerwacji</p>
          <p className="text-3xl font-black text-blue-500 tracking-tighter">{stats.count}</p>
        </div>
      </div>

      {/* OSTATNIE WPŁATY */}
      <div className="space-y-6">
        <h3 className="text-xl font-black uppercase italic text-gray-500 tracking-widest text-left">Ostatnie Wpływy</h3>
        <div className="bg-white/5 border border-white/5 rounded-[40px] overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-[10px] uppercase text-gray-500 font-black tracking-widest">
                <th className="p-6">Data</th>
                <th className="p-6">Klient</th>
                <th className="p-6">Tory</th>
                <th className="p-6">Buty</th>
                <th className="p-6 text-right">Suma</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {history.map((b) => {
                let shoeTotal = 0;
                b.shoe_rentals?.forEach((sr: any) => shoeTotal += (sr.quantity * (sr.shoe_inventory?.price_per_rental || 5)));
                return (
                  <tr key={b.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-6 text-xs font-mono text-gray-400">
                      {new Date(b.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-6 font-bold uppercase text-sm">{b.customer_name}</td>
                    <td className="p-6 text-gray-400 font-bold">{b.total_price - shoeTotal} zł</td>
                    <td className="p-6 text-yellow-600 font-bold">{shoeTotal} zł</td>
                    <td className="p-6 text-right font-black text-green-500">{b.total_price} PLN</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {history.length === 0 && <p className="p-10 text-center text-gray-600 uppercase font-black text-[10px] italic">Brak zarejestrowanych przychodów</p>}
        </div>
      </div>
    </div>
  );
}