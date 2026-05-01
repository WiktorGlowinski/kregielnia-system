'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AdminLanes() {
  const [lanes, setLanes] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchLanes = async () => {
    setLoading(true);
    const { data } = await supabase.from('lanes').select('*').order('number');
    if (data) setLanes(data);
    setLoading(false);
  };

  useEffect(() => {
    const checkBoss = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const { data } = await supabase.from('profiles').select('role').eq('id', session?.user.id).single();
      if (data?.role !== 'boss') router.push('/admin/rezerwacje');
      else fetchLanes();
    };
    checkBoss();
  }, [router]);

  const toggleStatus = async (id: number, currentStatus: boolean) => {
    const { error } = await supabase.from('lanes').update({ is_active: !currentStatus }).eq('id', id);
    if (!error) fetchLanes();
  };

  const saveEdit = async () => {
    const { error } = await supabase
      .from('lanes')
      .update({
        price_per_hour: parseFloat(editing.price_per_hour),
        max_people: parseInt(editing.max_people),
        has_bumpers: editing.has_bumpers
      })
      .eq('id', editing.id);
    if (!error) {
      setEditing(null);
      fetchLanes();
    } else alert(error.message);
  };

  if (loading) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <h2 className="text-5xl font-black italic uppercase tracking-tighter">Zarządzanie Torami</h2>
        <button onClick={fetchLanes} className="text-[10px] font-black uppercase bg-white/5 px-6 py-2 rounded-full hover:bg-white/10 text-gray-400 border border-white/5">Odśwież</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {lanes.map((lane) => (
          <div key={lane.id} className={`bg-white/5 border p-8 rounded-[40px] backdrop-blur-md flex flex-col justify-between transition-all gap-6 ${lane.is_active ? 'border-white/5' : 'border-red-500/30 bg-red-950/10'}`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Tor</p>
                <p className="text-5xl font-black italic text-yellow-500 tracking-tighter">#{lane.number}</p>
              </div>
              <span className={`text-[10px] font-black px-4 py-2 rounded-full uppercase border ${lane.is_active ? 'border-green-500/30 text-green-500 bg-green-500/5' : 'border-red-500/30 text-red-500 bg-red-500/5'}`}>
                {lane.is_active ? 'Aktywny' : 'Wyłączony'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 border-y border-white/5 py-4 my-2 text-left">
              <div>
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-wider">Cena/h</p>
                <p className="font-bold text-white">{lane.price_per_hour} zł</p>
              </div>
              <div>
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-wider">Max graczy</p>
                <p className="font-bold text-white">{lane.max_people} os.</p>
              </div>
              <div>
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-wider">Bumpery (Dzieci)</p>
                <p className="font-bold text-yellow-500">{lane.has_bumpers ? 'TAK' : 'NIE'}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setEditing(lane)} className="flex-1 bg-white/5 hover:bg-white/10 text-white font-black py-4 rounded-2xl text-xs uppercase tracking-widest border border-white/5 transition-all">Edytuj parametry</button>
              <button onClick={() => toggleStatus(lane.id, lane.is_active)} className={`flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${lane.is_active ? 'bg-red-950/40 text-red-400 border border-red-500/20 hover:bg-red-900/30' : 'bg-green-950/40 text-green-400 border border-green-500/20 hover:bg-green-900/30'}`}>
                {lane.is_active ? 'Wyłącz tor' : 'Włącz tor'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center p-6 z-50 animate-in zoom-in duration-300">
          <div className="bg-[#0a0a0a] border border-gray-800 p-10 rounded-[40px] max-w-sm w-full space-y-6 shadow-2xl">
            <h3 className="text-3xl font-black italic uppercase tracking-tighter text-yellow-500 text-center">Tor #{editing.number}</h3>
            
            <div className="space-y-4">
              <div className="bg-black/50 p-4 rounded-2xl border border-white/5">
                <label className="text-[10px] font-black text-gray-500 uppercase block mb-1">Cena za godzinę (PLN)</label>
                <input type="number" className="w-full bg-transparent outline-none font-bold text-white text-center text-xl" value={editing.price_per_hour} onChange={e => setEditing({...editing, price_per_hour: e.target.value})} />
              </div>
              <div className="bg-black/50 p-4 rounded-2xl border border-white/5">
                <label className="text-[10px] font-black text-gray-500 uppercase block mb-1">Maksymalna liczba graczy</label>
                <input type="number" className="w-full bg-transparent outline-none font-bold text-white text-center text-xl" value={editing.max_people} onChange={e => setEditing({...editing, max_people: e.target.value})} />
              </div>
              <div className="bg-black/50 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Bumpery dla dzieci</label>
                <input type="checkbox" className="w-6 h-6 rounded accent-yellow-500 bg-transparent border-white/10" checked={editing.has_bumpers} onChange={e => setEditing({...editing, has_bumpers: e.target.checked})} />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button onClick={() => setEditing(null)} className="w-1/3 font-black text-[10px] uppercase text-gray-500">Zamknij</button>
              <button onClick={saveEdit} className="w-2/3 bg-yellow-600 text-black py-5 rounded-2xl font-black uppercase text-xs hover:bg-yellow-500 transition-all">Zapisz</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}