'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function BookingWizard() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [bookedLaneIds, setBookedLaneIds] = useState<number[]>([]);
  const router = useRouter();
  
  const [lanes, setLanes] = useState<any[]>([]);
  const [shoePrice, setShoePrice] = useState(0);

  const [booking, setBooking] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '18:00',
    duration: 1,
    laneId: null as number | null,
    selectedLane: null as any,
    peopleCount: 1,
    shoes: {} as Record<number, number>, 
    firstName: '',
    lastName: '',
    phone: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      const { data: laneData } = await supabase.from('lanes').select('*').order('number');
      if (laneData) setLanes(laneData);
      const { data: shoeData } = await supabase.from('shoe_inventory').select('price_per_rental').limit(1).single();
      if (shoeData) setShoePrice(Number(shoeData.price_per_rental));
    };
    fetchData();
  }, []);

  // --- LOGIKA CZASU ZEGAROWEGO (Z) ---
  const formatDateTime = (date: string, time: string, addHours = 0) => {
    const [h, m] = time.split(':');
    let hour = parseInt(h) + addHours;
    return `${date}T${hour.toString().padStart(2, '0')}:${m}:00Z`;
  };

  const checkAvailability = async () => {
    setLoading(true);
    try {
      const startISO = formatDateTime(booking.date, booking.startTime);
      const endISO = formatDateTime(booking.date, booking.startTime, booking.duration);

      const { data, error } = await supabase
        .from('bookings')
        .select('lane_id')
        .eq('status', 'confirmed')
        .lt('start_time', endISO)
        .gt('end_time', startISO);

      if (error) throw error;
      setBookedLaneIds(data?.map(b => b.lane_id) || []);
      setStep(2);
    } catch (err: any) {
      alert("Błąd: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateShoeCount = (size: number, delta: number) => {
    const totalSelected = Object.values(booking.shoes).reduce((a, b) => a + b, 0);
    if (delta > 0 && totalSelected >= booking.peopleCount) return;
    setBooking({ ...booking, shoes: { ...booking.shoes, [size]: Math.max(0, (booking.shoes[size] || 0) + delta) } });
  };

  const totalShoes = Object.values(booking.shoes).reduce((a, b) => a + b, 0);
  const grandTotal = (booking.duration * (booking.selectedLane?.price_per_hour || 0)) + (totalShoes * shoePrice);

  // --- NOWA LOGIKA WALIDACJI (DANE KLIENTA) ---
  const isFormValid = () => {
    const nameRegex = /^[a-zA-ZĄąĆćĘęŁłŃńÓóŚśŹźŻż\s]+$/;
    const phoneRegex = /^[0-9]{9}$/;

    return (
      nameRegex.test(booking.firstName.trim()) &&
      nameRegex.test(booking.lastName.trim()) &&
      phoneRegex.test(booking.phone.trim())
    );
  };

  const handlePayment = async () => {
    if (!isFormValid()) return;
    setLoading(true);
    try {
      const startISO = formatDateTime(booking.date, booking.startTime);
      const endISO = formatDateTime(booking.date, booking.startTime, booking.duration);

      const { data: newBooking, error: bookingError } = await supabase
        .from('bookings')
        .insert([{
          lane_id: booking.laneId,
          start_time: startISO,
          end_time: endISO,
          total_price: grandTotal,
          payment_status: 'pending',
          actual_people_count: booking.peopleCount,
          status: 'confirmed',
          customer_name: `${booking.firstName} ${booking.lastName}`,
          notes: `Tel: ${booking.phone}`
        }]).select().single();

      if (bookingError) throw bookingError;

      const shoeEntries = Object.entries(booking.shoes)
        .filter(([_, qty]) => qty > 0)
        .map(([size, qty]) => ({ booking_id: newBooking.id, quantity: qty }));

      if (shoeEntries.length > 0) await supabase.from('shoe_rentals').insert(shoeEntries);

      alert(`Sukces! Zarezerwowano tor #${booking.selectedLane.number}`);
      router.push('/');
    } catch (err: any) {
      alert("Błąd: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white p-4 font-sans text-center">
      <div className="max-w-3xl mx-auto border border-gray-900 rounded-[40px] p-8 bg-gray-900/10 backdrop-blur-md">
        
        {/* HEADER */}
        <div className="flex justify-between items-start mb-10 text-left">
          <Link href="/" className="text-gray-600 hover:text-yellow-500 text-xs font-black uppercase tracking-widest">← Wróć</Link>
          <div className="text-right">
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Do zapłaty</p>
            <p className="text-3xl font-black text-green-500">{grandTotal} PLN</p>
          </div>
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-500 text-left">
            <h2 className="text-3xl font-bold italic uppercase text-center">Termin</h2>
            <div className="bg-black/40 p-6 rounded-3xl border border-gray-800">
              <label className="text-[10px] uppercase text-gray-500 font-bold mb-2 block tracking-widest">Dzień</label>
              <input type="date" min={new Date().toISOString().split('T')[0]} className="w-full bg-transparent text-xl outline-none" value={booking.date} onChange={e => setBooking({...booking, date: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/40 p-6 rounded-3xl border border-gray-800">
                <label className="text-[10px] uppercase text-gray-500 font-bold mb-2 block tracking-widest">Start</label>
                <select className="w-full bg-transparent text-xl outline-none" value={booking.startTime} onChange={e => setBooking({...booking, startTime: e.target.value})} >
                  {['12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00'].map(t => (<option key={t} value={t} className="bg-black">{t}</option>))}
                </select>
              </div>
              <div className="bg-black/40 p-6 rounded-3xl border border-gray-800">
                <label className="text-[10px] uppercase text-gray-500 font-bold mb-2 block tracking-widest">Czas (h)</label>
                <select className="w-full bg-transparent text-xl outline-none" value={booking.duration} onChange={e => setBooking({...booking, duration: Number(e.target.value)})}>
                  {[1, 2, 3].map(h => <option key={h} value={h} className="bg-black">{h} h</option>)}
                </select>
              </div>
            </div>
            <button onClick={checkAvailability} disabled={loading} className="w-full bg-yellow-600 py-6 rounded-3xl font-black uppercase tracking-widest hover:bg-yellow-500 transition-all">{loading ? 'Sprawdzam...' : 'Wybierz tor'}</button>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold italic uppercase">Wybierz tor</h2>
            <div className="grid grid-cols-2 gap-4">
              {lanes.map(lane => {
                const isBooked = bookedLaneIds.includes(lane.id);
                return (
                  <button key={lane.id} disabled={isBooked} onClick={() => setBooking({...booking, laneId: lane.id, selectedLane: lane})} className={`p-6 rounded-[32px] border-2 text-left transition-all relative overflow-hidden ${isBooked ? 'border-red-900/30 bg-red-900/5 opacity-40 cursor-not-allowed' : booking.laneId === lane.id ? 'border-yellow-500 bg-yellow-500/10' : 'border-gray-800 bg-black/40 hover:border-yellow-500/50'}`}>
                    <span className="text-3xl font-black block tracking-tighter">#{lane.number}</span>
                    <div className="mt-2 space-y-1">
                      <p className="text-[10px] uppercase font-bold text-gray-500">{lane.max_people} os. max</p>
                      <p className="text-sm font-bold text-green-500">{lane.price_per_hour} PLN/h</p>
                    </div>
                    {isBooked && <div className="absolute inset-0 flex items-center justify-center bg-black/40"><span className="bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase">Zajęty</span></div>}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-4">
              <button onClick={() => setStep(1)} className="w-1/3 border border-gray-800 py-6 rounded-3xl font-bold uppercase text-xs">Cofnij</button>
              <button onClick={() => setStep(3)} disabled={!booking.laneId} className="w-2/3 bg-yellow-600 py-6 rounded-3xl font-black uppercase tracking-widest hover:bg-yellow-500 transition-all">Dalej</button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="space-y-8 animate-in fade-in duration-500 text-center">
            <h2 className="text-3xl font-bold italic uppercase">Gracze i Buty</h2>
            <div className="bg-black/40 p-8 rounded-[32px] border border-gray-800 shadow-inner">
              <p className="text-[10px] uppercase text-gray-500 font-black mb-4 tracking-widest">Liczba graczy</p>
              <div className="flex justify-center items-center gap-10">
                <button onClick={() => setBooking({...booking, peopleCount: Math.max(1, booking.peopleCount - 1), shoes: {}})} className="text-4xl text-yellow-500 hover:scale-125 transition-transform">-</button>
                <span className="text-6xl font-black">{booking.peopleCount}</span>
                <button onClick={() => setBooking({...booking, peopleCount: Math.min(booking.selectedLane.max_people, booking.peopleCount + 1)})} className="text-4xl text-yellow-500 hover:scale-125 transition-transform">+</button>
              </div>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-400 text-sm italic text-center">Rozmiary dla {booking.peopleCount} osób:</p>
              <div className="max-h-60 overflow-y-auto pr-2 space-y-2">
                {[36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46].map(size => (
                  <div key={size} className="flex justify-between items-center bg-gray-900/50 p-4 rounded-2xl border border-gray-800">
                    <span className="font-bold text-yellow-500">Rozmiar {size}</span>
                    <div className="flex items-center gap-4">
                      <button onClick={() => updateShoeCount(size, -1)} className="w-8 h-8 rounded-full bg-gray-800">-</button>
                      <span className="w-4 font-bold">{booking.shoes[size] || 0}</span>
                      <button onClick={() => updateShoeCount(size, 1)} className="w-8 h-8 rounded-full bg-gray-800">+</button>
                    </div>
                  </div>
                ))}
              </div>
              <p className={`text-[10px] font-black uppercase tracking-widest text-center ${totalShoes === booking.peopleCount ? 'text-green-500' : 'text-yellow-500'}`}>
                {totalShoes === booking.peopleCount ? '✓ Wybrano wszystkie pary' : `Wybrano: ${totalShoes} / ${booking.peopleCount} par`}
              </p>
            </div>
            
            <div className="flex gap-4">
              <button onClick={() => setStep(2)} className="w-1/3 border border-gray-800 py-6 rounded-3xl font-bold uppercase text-xs hover:bg-white/5 transition-all">Cofnij</button>
              <button onClick={() => setStep(4)} disabled={totalShoes !== booking.peopleCount} className="w-2/3 bg-yellow-600 disabled:opacity-50 py-6 rounded-3xl font-black uppercase tracking-widest hover:bg-yellow-500 transition-all text-black">Twoje dane</button>
            </div>
          </div>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in duration-500 text-left">
            <h2 className="text-3xl font-bold italic uppercase text-center">Dane kontaktowe</h2>
            <div className="grid gap-4">
              {['firstName', 'lastName', 'phone'].map((field, idx) => (
                <div key={field}>
                  <label className="text-[10px] text-gray-500 uppercase font-black ml-4 mb-1 block tracking-widest">{['Imię', 'Nazwisko', 'Telefon'][idx]}</label>
                  <input 
                    placeholder={idx === 2 ? "9 cyfr (bez spacji)" : ""}
                    className="w-full bg-black/40 border border-gray-800 p-6 rounded-2xl outline-none focus:border-yellow-500 text-white transition-all" 
                    value={(booking as any)[field]} 
                    onChange={e => setBooking({...booking, [field]: e.target.value})} 
                  />
                </div>
              ))}
            </div>

            <button 
              onClick={handlePayment} 
              disabled={loading || !isFormValid()} 
              className={`w-full py-8 rounded-[32px] font-black uppercase text-xl transition-all shadow-2xl ${
                loading || !isFormValid() 
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-50' 
                : 'bg-green-600 text-white hover:bg-green-500 hover:scale-[1.01] active:scale-95 shadow-green-900/30'
              }`}
            >
              {loading ? 'Zapisywanie...' : `ZAPŁAĆ ${grandTotal} PLN`}
            </button>
            
            <button onClick={() => setStep(3)} className="w-full text-gray-700 text-[10px] font-black uppercase py-2 hover:text-gray-400 transition-all text-center">Cofnij do butów</button>
          </div>
        )}
      </div>
    </main>
  );
}