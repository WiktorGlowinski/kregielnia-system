'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('tory');
  const [lanes, setLanes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchLanes(); }, []);

  const fetchLanes = async () => {
    const { data } = await supabase.from('lanes').select('*').order('number');
    if (data) setLanes(data);
    setLoading(false);
  };

  const toggleStatus = async (id: number, current: string) => {
    const next = current === 'available' ? 'occupied' : 'available';
    await supabase.from('lanes').update({ status: next }).eq('id', id);
    fetchLanes();
  };

  return (
    <main className="min-h-screen bg-black p-8 text-white">
      <header className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <h1 className="text-2xl font-black text-blue-500">ADMIN PANEL 🛠️</h1>
        <nav className="flex bg-gray-900 p-1 rounded-xl">
          {['tory', 'rezerwacje', 'finanse'].map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg text-sm font-bold capitalize ${activeTab === tab ? 'bg-blue-600' : 'text-gray-400'}`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </header>

      {activeTab === 'tory' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {lanes.map(lane => (
            <div key={lane.id} className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
              <p className="text-gray-500 text-xs uppercase">Tor {lane.number}</p>
              <p className={`text-xl font-bold my-2 ${lane.status === 'available' ? 'text-green-500' : 'text-red-500'}`}>
                {lane.status === 'available' ? 'Wolny' : 'Zajęty'}
              </p>
              <button 
                onClick={() => toggleStatus(lane.id, lane.status)}
                className="w-full mt-4 bg-white text-black py-2 rounded-lg font-bold text-sm"
              >
                Zmień status
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab !== 'tory' && (
        <div className="text-center py-20 text-gray-600 border-2 border-dashed border-gray-800 rounded-3xl">
          Moduł {activeTab} w trakcie przygotowania...
        </div>
      )}
    </main>
  );
}