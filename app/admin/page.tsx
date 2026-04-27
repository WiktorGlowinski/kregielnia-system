'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('rezerwacje');
  const [role, setRole] = useState<string | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [newEmp, setNewEmp] = useState({ email: '', pass: '', name: '' });
  const router = useRouter();

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.push('/login');
      
      const { data } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
      setRole(data?.role || 'employee');
      fetchBookings();
    };
    checkAccess();
  }, []);

  const fetchBookings = async () => {
    const { data } = await supabase.from('bookings').select('*, lanes(number)').order('created_at', { ascending: false });
    if (data) setBookings(data);
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/create-employee', {
      method: 'POST',
      body: JSON.stringify({ email: newEmp.email, password: newEmp.pass, fullName: newEmp.name }),
    });
    if (res.ok) { alert('Pracownik dodany!'); setNewEmp({ email: '', pass: '', name: '' }); }
    else alert('Błąd dodawania.');
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white p-6">
      <header className="flex justify-between items-center mb-10 border-b border-gray-900 pb-6">
        <h1 className="text-xl font-black text-yellow-500 italic uppercase">N&R Management Center</h1>
        <button onClick={() => supabase.auth.signOut().then(() => router.push('/'))} className="text-[10px] bg-red-900/20 text-red-500 px-4 py-2 rounded-lg font-bold uppercase">Wyloguj</button>
      </header>

      <nav className="flex gap-4 mb-10">
        <button onClick={() => setActiveTab('rezerwacje')} className={`px-6 py-2 rounded-full text-xs font-bold uppercase transition-all ${activeTab === 'rezerwacje' ? 'bg-yellow-600 text-black' : 'bg-gray-900 text-gray-500'}`}>Rezerwacje</button>
        {role === 'boss' && (
          <button onClick={() => setActiveTab('ekipa')} className={`px-6 py-2 rounded-full text-xs font-bold uppercase transition-all ${activeTab === 'ekipa' ? 'bg-yellow-600 text-black' : 'bg-gray-900 text-gray-500'}`}>Ekipa</button>
        )}
      </nav>

      {activeTab === 'rezerwacje' && (
        <div className="bg-gray-900/40 rounded-[32px] border border-gray-800 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-800/30 text-[10px] uppercase tracking-[0.2em] text-gray-500">
              <tr>
                <th className="p-6">ID Rezerwacji</th>
                <th className="p-6">Tor</th>
                <th className="p-6">Status</th>
                <th className="p-6">Kwota</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {bookings.map(b => (
                <tr key={b.id} className="border-t border-gray-800/50 hover:bg-white/[0.02]">
                  <td className="p-6 font-mono text-xs">{b.id.substring(0,8)}...</td>
                  <td className="p-6 text-yellow-500 font-bold">Tor #{b.lanes?.number}</td>
                  <td className="p-6"><span className="bg-yellow-900/30 text-yellow-500 px-3 py-1 rounded-full text-[10px] font-black uppercase">{b.payment_status}</span></td>
                  <td className="p-6 font-bold">{b.total_price} PLN</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'ekipa' && role === 'boss' && (
        <div className="max-w-md bg-gray-900/50 p-8 rounded-[32px] border border-gray-800 shadow-2xl">
          <h2 className="text-xl font-black mb-6 italic text-yellow-500">DODAJ PRACOWNIKA</h2>
          <form onSubmit={handleAddEmployee} className="space-y-4">
            <input type="text" placeholder="Imię i Nazwisko" className="w-full bg-black/50 p-4 rounded-xl border border-gray-800" onChange={e => setNewEmp({...newEmp, name: e.target.value})} value={newEmp.name} />
            <input type="email" placeholder="Email" className="w-full bg-black/50 p-4 rounded-xl border border-gray-800" onChange={e => setNewEmp({...newEmp, email: e.target.value})} value={newEmp.email} />
            <input type="password" placeholder="Hasło" className="w-full bg-black/50 p-4 rounded-xl border border-gray-800" onChange={e => setNewEmp({...newEmp, pass: e.target.value})} value={newEmp.pass} />
            <button className="w-full bg-yellow-600 text-black font-black py-4 rounded-xl uppercase tracking-widest">Utwórz konto</button>
          </form>
        </div>
      )}
    </main>
  );
}