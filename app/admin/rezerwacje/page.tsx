'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [lanes, setLanes] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    // POBIERAMY: Rezerwacje + Tor + Buty (ilość i rozmiar)
    const { data: bData } = await supabase
      .from('bookings')
      .select(`
        *,
        lanes(number),
        shoe_rentals(
          quantity,
          shoe_inventory(size)
        )
      `)
      .order('start_time', { ascending: false });
    
    const { data: lData } = await supabase.from('lanes').select('*').order('number');
    
    if (bData) setBookings(bData);
    if (lData) setLanes(lData);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const formatDateTime = (date: string, time: string, addHours = 0) => {
    const [h, m] = time.split(':');
    let hour = parseInt(h) + addHours;
    return `${date}T${hour.toString().padStart(2, '0')}:${m}:00Z`;
  };

  const parseFromISO = (iso: string) => {
    const date = iso.split('T')[0];
    const time = iso.split('T')[1].substring(0, 5);
    return { date, time };
  };

  const startEdit = (booking: any) => {
    const { date, time } = parseFromISO(booking.start_time);
    const start = new Date(booking.start_time);
    const end = new Date(booking.end_time);
    const duration = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60));
    
    setEditing({
      ...booking,
      editDate: date,
      editTime: time,
      editDuration: duration
    });
  };

  const handleSaveEdit = async () => {
    const newStart = formatDateTime(editing.editDate, editing.editTime);
    const newEnd = formatDateTime(editing.editDate, editing.editTime, editing.editDuration);

    const { error } = await supabase
      .from('bookings')
      .update({
        customer_name: editing.customer_name,
        status: editing.status,
        total_price: editing.total_price,
        lane_id: editing.lane_id,
        start_time: newStart,
        end_time: newEnd
      })
      .eq('id', editing.id);
    
    if (!error) {
      setEditing(null);
      fetchData();
    } else {
      alert("Błąd zapisu: " + error.message);
    }
  };

  const deleteBooking = async (id: string) => {
    if (!confirm("⚠️ UWAGA: To całkowicie usunie rezerwację z bazy. Kontynuować?")) return;
    const { error } = await supabase.from('bookings').delete().eq('id', id);
    if (!error) fetchData();
  };

  // PRZYWRÓCONA FUNKCJA SZYBKIEGO ANULOWANIA
  const cancelBooking = async (id: string) => {
    if (!confirm("Czy na pewno anulować tę rezerwację? (Buty wrócą do puli)")) return;
    const { error } = await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', id);
    if (!error) fetchData();
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <h2 className="text-5xl font-black italic uppercase tracking-tighter text-white">Rezerwacje</h2>
        <button onClick={fetchData} className="text-[10px] font-black uppercase bg-white/5 px-6 py-2 rounded-full hover:bg-white/10 transition-all text-gray-400 border border-white/5">Odśwież dane</button>
      </div>

      <div className="bg-white/5 border border-white/5 rounded-[32px] overflow-hidden backdrop-blur-md shadow-2xl">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white/5 text-[10px] uppercase text-gray-500 font-black tracking-widest">
              <th className="p-6">Klient</th>
              <th className="p-6">Tor</th>
              <th className="p-6">Buty</th>
              <th className="p-6">Termin</th>
              <th className="p-6">Status</th>
              <th className="p-6 text-right">Zarządzaj</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {bookings.map((b) => (
              <tr key={b.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="p-6">
                  <p className="font-bold text-white uppercase text-sm">{b.customer_name}</p>
                  <p className="text-[10px] text-gray-500 font-mono italic">{b.notes}</p>
                </td>
                <td className="p-6 text-yellow-500 font-black italic">TOR #{b.lanes?.number}</td>
                
                <td className="p-6">
                  <div className="flex flex-wrap gap-1 max-w-[150px]">
                    {b.shoe_rentals && b.shoe_rentals.length > 0 ? (
                      b.shoe_rentals.map((sr: any, idx: number) => (
                        <span key={idx} className="bg-white/5 border border-white/10 px-2 py-1 rounded-md text-[10px] font-bold text-gray-300">
                          r.{Math.round(sr.shoe_inventory.size)} <span className="text-yellow-600">x{sr.quantity}</span>
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-gray-600 italic">Brak butów</span>
                    )}
                  </div>
                </td>

                <td className="p-6">
                  <p className="text-xs font-bold text-white">{b.start_time.split('T')[0]}</p>
                  <p className="text-[10px] text-gray-400 font-mono">{b.start_time.substring(11, 16)} - {b.end_time.substring(11, 16)}</p>
                </td>
                <td className="p-6 uppercase">
                  <span className={`text-[9px] font-black px-3 py-1 rounded-full border ${
                    b.status === 'confirmed' ? 'border-green-500/50 text-green-500 bg-green-500/10' : 
                    b.status === 'cancelled' ? 'border-red-500/50 text-red-500 bg-red-500/10' : 'border-gray-500 text-gray-500'
                  }`}>
                    {b.status}
                  </span>
                </td>
                <td className="p-6 text-right space-x-2">
                  <button onClick={() => startEdit(b)} className="text-[9px] font-black uppercase text-blue-400 hover:bg-blue-400/10 px-3 py-2 rounded-lg transition-all border border-blue-400/20">Edytuj</button>
                  {/* PRZYWRÓCONY PRZYCISK ANULUJ */}
                  {b.status !== 'cancelled' && (
                    <button onClick={() => cancelBooking(b.id)} className="text-[9px] font-black uppercase text-orange-400 hover:bg-orange-400/10 px-3 py-2 rounded-lg transition-all border border-orange-400/20">Anuluj</button>
                  )}
                  <button onClick={() => deleteBooking(b.id)} className="text-[9px] font-black uppercase text-red-500 hover:bg-red-500/10 px-3 py-2 rounded-lg transition-all border border-red-500/20">Usuń</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL PEŁNEJ EDYCJI */}
      {editing && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center p-6 z-50 animate-in zoom-in duration-300">
          <div className="bg-[#0a0a0a] border border-gray-800 p-10 rounded-[40px] max-w-2xl w-full space-y-8 shadow-2xl overflow-y-auto max-h-[90vh]">
            <h3 className="text-3xl font-black italic uppercase tracking-tighter text-yellow-500 text-center">Panel Edycji</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-black/50 p-4 rounded-2xl border border-white/5 text-left">
                  <label className="text-[10px] font-black text-gray-500 uppercase block mb-1">Klient</label>
                  <input className="w-full bg-transparent outline-none font-bold text-white" value={editing.customer_name} onChange={e => setEditing({...editing, customer_name: e.target.value})} />
                </div>
                <div className="bg-black/50 p-4 rounded-2xl border border-white/5 text-left">
                  <label className="text-[10px] font-black text-gray-500 uppercase block mb-1">Dzień</label>
                  <input type="date" className="w-full bg-transparent outline-none font-bold text-white [color-scheme:dark]" value={editing.editDate} onChange={e => setEditing({...editing, editDate: e.target.value})} />
                </div>
                <div className="bg-black/50 p-4 rounded-2xl border border-white/5 text-left">
                  <label className="text-[10px] font-black text-gray-500 uppercase block mb-1">Status</label>
                  <select className="w-full bg-transparent outline-none font-bold text-white" value={editing.status} onChange={e => setEditing({...editing, status: e.target.value})}>
                    <option value="confirmed" className="bg-black text-white text-left">Confirmed</option>
                    <option value="pending" className="bg-black text-white text-left">Pending</option>
                    <option value="cancelled" className="bg-black text-white text-left">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4 text-left">
                <div className="bg-black/50 p-4 rounded-2xl border border-white/5">
                  <label className="text-[10px] font-black text-gray-500 uppercase block mb-1">Tor</label>
                  <select className="w-full bg-transparent outline-none font-bold text-white" value={editing.lane_id} onChange={e => setEditing({...editing, lane_id: e.target.value})}>
                    {lanes.map(l => (
                      <option key={l.id} value={l.id} className="bg-black text-white text-left">Tor #{l.number}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/50 p-4 rounded-2xl border border-white/5">
                    <label className="text-[10px] font-black text-gray-500 uppercase block mb-1">Start</label>
                    <input type="time" className="w-full bg-transparent outline-none font-bold text-white [color-scheme:dark]" value={editing.editTime} onChange={e => setEditing({...editing, editTime: e.target.value})} />
                  </div>
                  <div className="bg-black/50 p-4 rounded-2xl border border-white/5">
                    <label className="text-[10px] font-black text-gray-500 uppercase block mb-1">Czas (h)</label>
                    <input type="number" className="w-full bg-transparent outline-none font-bold text-white" value={editing.editDuration} onChange={e => setEditing({...editing, editDuration: parseInt(e.target.value)})} />
                  </div>
                </div>
                <div className="bg-black/50 p-4 rounded-2xl border border-white/5 text-center">
                  <label className="text-[10px] font-black text-gray-500 uppercase block mb-1">Kwota (PLN)</label>
                  <input type="number" className="w-full bg-transparent outline-none font-bold text-green-500 text-lg text-center" value={editing.total_price} onChange={e => setEditing({...editing, total_price: e.target.value})} />
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button onClick={() => setEditing(null)} className="w-1/3 font-black text-[10px] uppercase text-gray-500">Zamknij</button>
              <button onClick={handleSaveEdit} className="w-2/3 bg-yellow-600 text-black py-5 rounded-2xl font-black uppercase text-xs shadow-xl shadow-yellow-600/20 hover:bg-yellow-500">Zapisz zmiany</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}