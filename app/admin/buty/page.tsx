'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AdminShoes() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [newSize, setNewSize] = useState({ size: '', total_pairs: '', price_per_rental: '5.00' });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchInventory = async () => {
    setLoading(true);
    const { data } = await supabase.from('shoe_inventory').select('*').order('size');
    if (data) setInventory(data);
    setLoading(false);
  };

  useEffect(() => {
    const checkBoss = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const { data } = await supabase.from('profiles').select('role').eq('id', session?.user.id).single();
      if (data?.role !== 'boss') {
        router.push('/admin/rezerwacje');
      } else {
        fetchInventory();
      }
    };
    checkBoss();
  }, [router]);

  const handleUpdate = async () => {
    const { error } = await supabase
      .from('shoe_inventory')
      .update({
        total_pairs: parseInt(editing.total_pairs),
        price_per_rental: parseFloat(editing.price_per_rental)
      })
      .eq('id', editing.id);
    
    if (!error) {
      setEditing(null);
      fetchInventory();
    } else alert(error.message);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase
      .from('shoe_inventory')
      .insert([{
        size: parseFloat(newSize.size),
        total_pairs: parseInt(newSize.total_pairs),
        price_per_rental: parseFloat(newSize.price_per_rental)
      }]);
    
    if (!error) {
      setNewSize({ size: '', total_pairs: '', price_per_rental: '5.00' });
      fetchInventory();
    } else alert(error.message);
  };

  const deleteSize = async (id: string) => {
    if (!confirm("Czy na pewno chcesz usunąć ten rozmiar z inwentarza?")) return;
    const { error } = await supabase.from('shoe_inventory').delete().eq('id', id);
    if (!error) fetchInventory();
  };

  if (loading) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700">
      <h2 className="text-5xl font-black italic uppercase tracking-tighter">Inwentarz Butów</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 text-center">
        {/* DODAWANIE NOWEGO ROZMIARU */}
        <div className="bg-gray-900/40 p-10 rounded-[40px] border border-gray-800 shadow-2xl h-fit">
          <h3 className="text-xl font-black mb-8 italic text-yellow-500 uppercase tracking-tighter">Dodaj Rozmiar</h3>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="bg-black/50 p-4 rounded-2xl border border-white/5">
              <label className="text-[10px] font-black text-gray-500 uppercase block mb-1">Rozmiar (np. 42.5)</label>
              <input type="number" step="0.5" required className="w-full bg-transparent outline-none font-bold text-white text-center" value={newSize.size} onChange={e => setNewSize({...newSize, size: e.target.value})} />
            </div>
            <div className="bg-black/50 p-4 rounded-2xl border border-white/5">
              <label className="text-[10px] font-black text-gray-500 uppercase block mb-1">Ilość par na stanie</label>
              <input type="number" required className="w-full bg-transparent outline-none font-bold text-white text-center" value={newSize.total_pairs} onChange={e => setNewSize({...newSize, total_pairs: e.target.value})} />
            </div>
            <div className="bg-black/50 p-4 rounded-2xl border border-white/5">
              <label className="text-[10px] font-black text-gray-500 uppercase block mb-1">Cena wynajmu (PLN)</label>
              <input type="number" step="0.01" required className="w-full bg-transparent outline-none font-bold text-white text-center" value={newSize.price_per_rental} onChange={e => setNewSize({...newSize, price_per_rental: e.target.value})} />
            </div>
            <button className="w-full bg-yellow-600 text-black font-black py-5 rounded-2xl uppercase tracking-widest hover:bg-yellow-500 transition-all shadow-xl shadow-yellow-600/10">Dodaj do bazy</button>
          </form>
        </div>

        {/* LISTA ROZMIARÓW */}
        <div className="lg:col-span-2 bg-white/5 border border-white/5 rounded-[40px] overflow-hidden backdrop-blur-md">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-[10px] uppercase text-gray-500 font-black tracking-widest">
                <th className="p-6">Rozmiar</th>
                <th className="p-6">Dostępne Pary</th>
                <th className="p-6">Cena Wynajmu</th>
                <th className="p-6 text-right">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {inventory.map((item) => (
                <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-6 text-2xl font-black italic text-white uppercase tracking-tighter">
                    {parseFloat(item.size)}
                  </td>
                  <td className="p-6">
                    <span className={`font-bold ${item.total_pairs < 5 ? 'text-red-500' : 'text-gray-300'}`}>
                      {item.total_pairs} par
                    </span>
                  </td>
                  <td className="p-6 font-bold text-green-500">{item.price_per_rental} PLN</td>
                  <td className="p-6 text-right space-x-3">
                    <button onClick={() => setEditing(item)} className="text-[9px] font-black uppercase text-blue-400 hover:underline">Edytuj</button>
                    <button onClick={() => deleteSize(item.id)} className="text-[9px] font-black uppercase text-red-500 hover:underline">Usuń</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL EDYCJI STANU */}
      {editing && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center p-6 z-50 animate-in zoom-in duration-300">
          <div className="bg-[#0a0a0a] border border-gray-800 p-10 rounded-[40px] max-w-sm w-full space-y-8 shadow-2xl">
            <h3 className="text-3xl font-black italic uppercase tracking-tighter text-yellow-500 text-center text-center">Edytuj Rozmiar {parseFloat(editing.size)}</h3>
            <div className="space-y-4 text-center">
              <div className="bg-black/50 p-4 rounded-2xl border border-white/5 text-center">
                <label className="text-[10px] font-black text-gray-500 uppercase block mb-1">Ilość par na stanie</label>
                <input type="number" className="w-full bg-transparent outline-none font-bold text-white text-center text-xl" value={editing.total_pairs} onChange={e => setEditing({...editing, total_pairs: e.target.value})} />
              </div>
              <div className="bg-black/50 p-4 rounded-2xl border border-white/5 text-center">
                <label className="text-[10px] font-black text-gray-500 uppercase block mb-1">Cena wynajmu (PLN)</label>
                <input type="number" step="0.01" className="w-full bg-transparent outline-none font-bold text-green-500 text-center text-xl" value={editing.price_per_rental} onChange={e => setEditing({...editing, price_per_rental: e.target.value})} />
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setEditing(null)} className="w-1/3 font-black text-[10px] uppercase text-gray-500">Zamknij</button>
              <button onClick={handleUpdate} className="w-2/3 bg-yellow-600 text-black py-5 rounded-2xl font-black uppercase text-xs shadow-xl shadow-yellow-600/20 hover:bg-yellow-500 transition-all">Zapisz</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}