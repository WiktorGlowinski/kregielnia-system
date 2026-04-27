import { supabase } from '@/lib/supabase';

export default async function Home() {
  const { data: lanes, error } = await supabase.from('lanes').select('*');

  // Jeśli jest błąd, wyświetlimy go na samym środku ekranu
  if (error) {
    return (
      <div style={{ color: 'red', padding: '20px', backgroundColor: '#ffdada' }}>
        <h2>❌ Błąd połączenia z bazą!</h2>
        <pre>{JSON.stringify(error, null, 2)}</pre>
      </div>
    );
  }

  return (
    <main style={{ padding: '20px', color: 'white' }}>
      <h1>System Kręgielni - Lista Torów</h1>
      
      {/* Jeśli baza zwróciła pustą listę */}
      {lanes?.length === 0 && (
        <p style={{ color: 'yellow' }}>
          ⚠️ Połączono z bazą, ale tabela "lanes" jest pusta lub RLS ją blokuje.
        </p>
      )}

      {/* Wyświetlanie danych w surowej formie do testu */}
      <pre style={{ background: '#333', padding: '10px' }}>
        {JSON.stringify(lanes, null, 2)}
      </pre>

      <div style={{ display: 'grid', gap: '10px', marginTop: '20px' }}>
        {lanes?.map((lane) => (
          <div key={lane.id} style={{ border: '1px solid #555', padding: '15px' }}>
            Tor {lane.number} - {lane.status}
          </div>
        ))}
      </div>
    </main>
  );
}