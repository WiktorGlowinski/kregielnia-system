'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AdminTeam() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [newEmp, setNewEmp] = useState({ email: '', pass: '', name: '' });
  const [isBoss, setIsBoss] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkBoss = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const { data } = await supabase.from('profiles').select('role').eq('id', session?.user.id).single();
      if (data?.role !== 'boss') {
        router.push('/admin/rezerwacje');
      } else {
        setIsBoss(true);
        fetchEmployees();
      }
      setLoading(false);
    };
    checkBoss();
  }, [router]);

  const fetchEmployees = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('role', 'employee');
    if (data) setEmployees(data);
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/create-employee', {
      method: 'POST',
      body: JSON.stringify({ email: newEmp.email, password: newEmp.pass, fullName: newEmp.name }),
    });
    if (res.ok) { 
      alert('Pracownik dodany!'); 
      setNewEmp({ email: '', pass: '', name: '' }); 
      fetchEmployees();
    } else {
      alert('Błąd dodawania.');
    }
  };

  const deleteEmployee = async (id: string) => {
    if (!confirm('Czy na pewno chcesz usunąć tego pracownika?')) return;
    const res = await fetch('/api/delete-employee', {
      method: 'POST',
      body: JSON.stringify({ userId: id }),
    });
    if (res.ok) fetchEmployees();
  };

  const changePass = async (id: string) => {
    const newPassword = prompt('Wpisz nowe hasło:');
    if (!newPassword || newPassword.length < 6) return alert('Za krótkie!');
    const res = await fetch('/api/update-password', {
      method: 'POST',
      body: JSON.stringify({ userId: id, newPassword }),
    });
    if (res.ok) alert('Hasło zmienione!');
  };

  if (loading) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in slide-in-from-bottom-4 duration-700">
      <h2 className="text-5xl font-black italic uppercase tracking-tighter">Zarządzanie Ekipą</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* FORMULARZ */}
        <div className="bg-gray-900/40 p-10 rounded-[40px] border border-gray-800 shadow-2xl h-fit">
          <h3 className="text-xl font-black mb-8 italic text-yellow-500 uppercase tracking-tighter">Nowy Pracownik</h3>
          <form onSubmit={handleAddEmployee} className="space-y-4 text-center">
            <input type="text" placeholder="Imię i Nazwisko" className="w-full bg-black/50 p-5 rounded-2xl border border-gray-800 text-white outline-none focus:border-yellow-500 transition-all text-center" onChange={e => setNewEmp({...newEmp, name: e.target.value})} value={newEmp.name} />
            <input type="email" placeholder="Email" className="w-full bg-black/50 p-5 rounded-2xl border border-gray-800 text-white outline-none focus:border-yellow-500 transition-all text-center" onChange={e => setNewEmp({...newEmp, email: e.target.value})} value={newEmp.email} />
            <input type="password" placeholder="Tymczasowe Hasło" className="w-full bg-black/50 p-5 rounded-2xl border border-gray-800 text-white outline-none focus:border-yellow-500 transition-all text-center" onChange={e => setNewEmp({...newEmp, pass: e.target.value})} value={newEmp.pass} />
            <button className="w-full bg-yellow-600 text-black font-black py-5 rounded-2xl uppercase tracking-widest hover:bg-yellow-500 transition-all shadow-xl shadow-yellow-600/10">Dodaj do załogi</button>
          </form>
        </div>

        {/* LISTA */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xl font-black mb-8 italic text-gray-500 uppercase tracking-widest">Aktywny Personel</h3>
          {employees.map(emp => (
            <div key={emp.id} className="flex flex-col md:flex-row justify-between items-center bg-gray-900/20 p-8 rounded-[32px] border border-gray-800 hover:border-yellow-500/20 transition-all gap-6">
              <div>
                <p className="font-black text-2xl text-white uppercase italic tracking-tighter">{emp.full_name}</p>
                <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">{emp.email}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => changePass(emp.id)} className="bg-white/5 hover:bg-white/10 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Reset Hasła</button>
                <button onClick={() => deleteEmployee(emp.id)} className="bg-red-900/10 hover:bg-red-600 text-red-500 hover:text-white px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Zwolnij</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}