'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError('Błędne dane.');
    else router.push('/admin');
  };

  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-gray-900/50 p-10 rounded-[40px] border border-gray-800 backdrop-blur-xl">
        <h1 className="text-2xl font-black text-yellow-500 mb-8 italic uppercase tracking-tighter">N&R Login</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" placeholder="Email" className="w-full bg-black/50 p-4 rounded-2xl border border-gray-800 outline-none focus:border-yellow-500 text-white" onChange={e => setEmail(e.target.value)} required />
          <input type="password" placeholder="Hasło" className="w-full bg-black/50 p-4 rounded-2xl border border-gray-800 outline-none focus:border-yellow-500 text-white" onChange={e => setPassword(e.target.value)} required />
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-black py-4 rounded-2xl transition-all uppercase tracking-widest">Wejdź</button>
        </form>
      </div>
    </main>
  );
}