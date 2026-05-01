'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AdminPromoCodes() {
  const [codes, setCodes] = useState<any[]>([]);
  const [newCode, setNewCode] = useState({ code: '', discount_type: 'percent', discount_value: '' });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchCodes = async () => {
    setLoading(true);
    const { data } = await supabase.from('promo_codes').select('*').order('created_at', { ascending: false });
    if (data) setCodes(data);
    setLoading(false);
  };

  useEffect(() => {
    const checkBoss = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const { data } = await supabase.from('profiles').select('role').eq('id', session?.user.id).single();
      if (data?.role !== 'boss') router.push('/admin/rezerwacje');
      else fetchCodes();
    };
    checkBoss();
  }, [router]);

  const handleAddCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.code || !newCode.discount_value) return;

    const { error } = await supabase.from('promo_codes').insert([{
      code: newCode.code.toUpperCase().trim(),
      discount_type: newCode.discount_type,
      discount_value: parseFloat(newCode.discount_value),
      is_active: true
    }]);

    if (!error) {
      setNewCode({ code: '', discount_type: 'percent', discount_value: '' });
      fetchCodes();
    } else alert(error.message);
  };

  const toggleCodeStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from('promo_codes').update({ is_active: !currentStatus }).eq('id', id);
    if (!error) fetchCodes();
  };

  const deleteCode = async (id: string) => {
    if (!confirm("Na pewno usunąć kod rabatowy?")) return;
    const { error } = await supabase.from('promo_codes').delete().eq('id', id);
    if (!error) fetchCodes();
  };

  if (loading) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700">
      <h2 className="text-5xl font-black italic uppercase tracking-tighter">Kody Rabatowe</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* DODAWANIE KODU */}
        <div className="bg-gray-900/40 p-10 rounded-[40px] border border-gray-800 shadow-2xl h-fit">
          <h3 className="text-xl font-black mb-8 italic text-yellow-500 uppercase tracking-tighter">Nowy Kod</h3>
          <form onSubmit={handleAddCode} className="space-y-4">
            <div className="bg-black/50 p-4 rounded-2xl border border-white/5">
              <label className="text-[10px] font-black text-gray-500 uppercase block mb-1">Kod (np. SIEMA15)</label>
              <input type="text" required className="w-full bg-transparent outline-none font-bold text-white uppercase text-center" value={newCode.code} onChange={e => setNewCode({...newCode, code: e.target.value})} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/50 p-4 rounded-2xl border border-white/5 text-left">
                <label className="text-[10px] font-black text-gray-500 uppercase block mb-1">Typ</label>
                <select className="w-full bg-transparent outline-none font-bold text-white" value={newCode.discount_type} onChange={e => setNewCode({...newCode, discount_type: e.target.value})}>
                  <option value="percent" className="bg-black">Procent (%)</option>
                  <option value="fixed" className="bg-black">Kwota (zł)</option>
                </select>
              </div>
              <div className="bg-black/50 p-4 rounded-2xl border border-white/5 text-center">
                <label className="text-[10px] font-black text-gray-500 uppercase block mb-1">Wartość</label>
                <input type="number" required className="w-full bg-transparent outline-none font-bold text-white text-center" value={newCode.discount_value} onChange={e => setNewCode({...newCode, discount_value: e.target.value})} />
              </div>
            </div>

            <button className="w-full bg-yellow-600 text-black font-black py-5 rounded-2xl uppercase tracking-widest hover:bg-yellow-500 transition-all">Dodaj kod</button>
          </form>
        </div>

        {/* LISTA KODÓW */}
        <div className="lg:col-span-2 bg-white/5 border border-white/5 rounded-[40px] overflow-hidden backdrop-blur-md">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-[10px] uppercase text-gray-500 font-black tracking-widest">
                <th className="p-6">Kod</th>
                <th className="p-6">Rabat</th>
                <th className="p-6">Status</th>
                <th className="p-6 text-right">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {codes.map((c) => (
                <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-6 text-2xl font-black italic uppercase tracking-tighter text-yellow-500">
                    {c.code}
                  </td>
                  <td className="p-6 font-bold text-white">
                    {c.discount_type === 'percent' ? `${c.discount_value}%` : `${c.discount_value} PLN`}
                  </td>
                  <td className="p-6">
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full border uppercase ${c.is_active ? 'border-green-500/30 text-green-500 bg-green-500/5' : 'border-red-500/30 text-red-500 bg-red-500/5'}`}>
                      {c.is_active ? 'Aktywny' : 'Wyłączony'}
                    </span>
                  </td>
                  <td className="p-6 text-right space-x-3">
                    <button onClick={() => toggleCodeStatus(c.id, c.is_active)} className="text-[10px] font-black uppercase tracking-widest hover:underline text-gray-400">Przełącz</button>
                    <button onClick={() => deleteCode(c.id)} className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:underline">Usuń</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {codes.length === 0 && <p className="p-10 text-center text-gray-600 uppercase font-black text-[10px] italic">Brak kodów promocyjnych</p>}
        </div>
      </div>
    </div>
  );
}