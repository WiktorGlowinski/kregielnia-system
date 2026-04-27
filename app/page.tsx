'use client'; // Mówimy Next.js, że to komponent interaktywny

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Dashboard() {
  const [lanes, setLanes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Funkcja pobierająca dane
  const fetchLanes = async () => {
    const { data } = await supabase.from('lanes').select('*').order('number', { ascending: true });
    if (data) setLanes(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchLanes();
  }, []);

  // 2. Funkcja zmiany statusu toru
  const toggleLaneStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'available' ? 'occupied' : 'available';
    
    const { error } = await supabase
      .from('lanes')
      .update({ status: newStatus })
      .eq('id', id);

    if (!error) {
      // Aktualizujemy widok lokalnie, żeby nie przeładowywać strony
      setLanes(lanes.map(lane => lane.id === id ? { ...lane, status: newStatus } : lane));
    }
  };

  if (loading) return <div className="p-10 text-white">Ładowanie torów...</div>;

  return (
    <main className="min-h-screen bg-gray-900 p-8 text-white">
      <header className="mb-10 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-blue-400">Panel Kręgielni 🎳</h1>
        <div className="text-sm text-gray-400">Zalogowany jako: <span className="text-white font-medium">Wiktor</span></div>
      </header>

      {/* Grid z torami */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {lanes.map((lane) => (
          <div 
            key={lane.id} 
            className={`relative overflow-hidden rounded-xl border-2 p-6 transition-all ${
              lane.status === 'available' ? 'border-green-500/50 bg-green-500/10' : 'border-red-500/50 bg-red-500/10'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-4xl font-black opacity-20">#{lane.number}</span>
              <div className={`h-3 w-3 rounded-full ${lane.status === 'available' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]'}`} />
            </div>

            <div className="mt-4">
              <h3 className="text-xl font-bold">Tor {lane.number}</h3>
              <p className="text-sm text-gray-400">
                Status: {lane.status === 'available' ? 'Wolny' : 'Zajęty'}
              </p>
              {lane.has_bumpers && <span className="mt-2 inline-block rounded-full bg-blue-500/20 px-2 py-1 text-[10px] text-blue-300">DLA DZIECI</span>}
            </div>

            <button 
              onClick={() => toggleLaneStatus(lane.id, lane.status)}
              className={`mt-6 w-full rounded-lg py-2 font-bold transition-colors ${
                lane.status === 'available' ? 'bg-green-600 hover:bg-green-500' : 'bg-red-600 hover:bg-red-500'
              }`}
            >
              {lane.status === 'available' ? 'Zajmij tor' : 'Zwolnij tor'}
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}