'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function ClientBooking() {
  const [lanes, setLanes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLanes = async () => {
      const { data } = await supabase.from('lanes').select('*').order('number');
      if (data) setLanes(data);
      setLoading(false);
    };
    fetchLanes();
  }, []);

  return (
    <main className="min-h-screen bg-[#0f172a] p-6 text-white">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <Link href="/" className="text-blue-400 hover:text-blue-300">← Powrót</Link>
          <h1 className="text-3xl font-black italic">WIKTOR <span className="text-blue-500">BOWLING</span></h1>
          <div />
        </header>

        <h2 className="text-4xl font-bold text-center mb-12">Wybierz dostępny tor</h2>

        {loading ? (
          <div className="text-center py-20 text-gray-500">Sprawdzanie dostępności...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {lanes.map((lane) => (
              <div key={lane.id} className={`relative p-8 rounded-3xl border-2 transition-all ${
                lane.status === 'available' 
                ? 'border-green-500/30 bg-green-500/5 hover:border-green-500' 
                : 'border-red-500/20 bg-red-500/5 opacity-50'
              }`}>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-6xl font-black text-white/10">#{lane.number}</span>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${lane.status === 'available' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                    {lane.status === 'available' ? 'WOLNY' : 'ZAJĘTY'}
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold mb-4 text-white">Tor numer {lane.number}</h3>
                
                {lane.status === 'available' ? (
                  <button className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-xl font-bold transition-colors">
                    Rezerwuj ten tor
                  </button>
                ) : (
                  <button disabled className="w-full bg-gray-700 py-3 rounded-xl font-bold text-gray-500 cursor-not-allowed">
                    Niedostępny
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}