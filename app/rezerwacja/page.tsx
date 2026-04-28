'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function BookingWizard() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [bookedLanesInfo, setBookedLanesInfo] = useState<any[]>([]); 
  const [shoeInventory, setShoeInventory] = useState<any[]>([]);
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
    phone: '',
    email: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      // 1. Tory
      const { data: laneData } = await supabase.from('lanes').select('*').order('number');
      if (laneData) setLanes(laneData);
      
      // 2. Buty (Pobieramy wszystko z bazy, żeby lista była dynamiczna)
      const { data: shoeData } = await supabase.from('shoe_inventory').select('*').order('size');
      if (shoeData) {
        setShoeInventory(shoeData);
        // Średnia cena lub cena z pierwszego rekordu
        setShoePrice(Number(shoeData[0]?.price_per_rental || 5));
      }
    };
    fetchData();
  }, []);

  const formatDateTime = (date: string, time: string, addHours = 0) => {
    const [h, m] = time.split(':');
    let hour = parseInt(h) + addHours;
    return `${date}T${hour.toString().padStart(2, '0')}:${m}:00Z`;
  };

  const checkAvailability = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('lane_id, start_time, end_time')
        .eq('status', 'confirmed')
        .gte('start_time', `${booking.date}T00:00:00Z`)
        .lte('start_time', `${booking.date}T23:59:59Z`);
      if (error) throw error;
      setBookedLanesInfo(data || []);
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

  const isFormValid = () => {
    const nameRegex = /^[a-zA-ZĄąĆćĘęŁłŃńÓóŚśŹźŻż\s]+$/;
    const phoneRegex = /^[0-9]{9}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return (
      nameRegex.test(booking.firstName.trim()) &&
      nameRegex.test(booking.lastName.trim()) &&
      phoneRegex.test(booking.phone.trim()) &&
      emailRegex.test(booking.email.trim())
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
          email: booking.email,
          notes: `Tel: ${booking.phone}`
        }]).select().single();

      if (bookingError) throw bookingError;

      const shoeEntries = Object.entries(booking.shoes)
        .filter(([_, qty]) => qty > 0)
        .map(([size, qty]) => {
          const invItem = shoeInventory.find(item => Math.round(parseFloat(item.size.toString()) * 10) === Math.round(parseFloat(size) * 10));
          return invItem ? { booking_id: newBooking.id, shoe_id: invItem.id, quantity: qty, returned: false } : null;
        }).filter(entry => entry !== null);

      if (shoeEntries.length > 0) await supabase.from('shoe_rentals').insert(shoeEntries);

      await fetch('/api/send-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: booking.email,
          firstName: booking.firstName,
          date: booking.date,
          startTime: booking.startTime,
          laneNumber: booking.selectedLane.number,
          totalPrice: grandTotal
        }),
      });

      setStep(5);
    } catch (err: any) {
      alert("Błąd: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white p-4 font-sans text-center">
      <div className="max-w-3xl mx-auto border border-gray-900 rounded-[40px] p-8 bg-gray-900/10 backdrop-blur-md">
        
        {step < 5 && (
          <div className="flex justify-between items-start mb-10 text-left">
            <Link href="/" className="text-gray-600 hover:text-yellow-500 text-xs font-black uppercase tracking-widest">← Wróć</Link>
            <div className="text-right">
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Do zapłaty</p>
              <p className="text-3xl font-black text-green-500">{grandTotal} PLN</p>
            </div>
          </div>
        )}

        {/* STEP 1: TERMIN */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-500 text-left text-center">
            <h2 className="text-3xl font-bold italic uppercase text-center">Termin</h2>
            <div className="bg-black/40 p-6 rounded-3xl border border-gray-800">
              <label className="text-[10px] uppercase text-gray-500 font-bold mb-2 block tracking-widest">Dzień</label>
              <input type="date" min={new Date().toISOString().split('T')[0]} className="w-full bg-transparent text-xl outline-none text-center" value={booking.date} onChange={e => setBooking({...booking, date: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/40 p-6 rounded-3xl border border-gray-800 text-center">
                <label className="text-[10px] uppercase text-gray-500 font-bold mb-2 block tracking-widest">Start</label>
                <select className="w-full bg-transparent text-xl outline-none" value={booking.startTime} onChange={e => setBooking({...booking, startTime: e.target.value})} >
                  {['12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00'].map(t => (<option key={t} value={t} className="bg-black text-white">{t}</option>))}
                </select>
              </div>
              <div className="bg-black/40 p-6 rounded-3xl border border-gray-800 text-center">
                <label className="text-[10px] uppercase text-gray-500 font-bold mb-2 block tracking-widest">Czas</label>
                <select className="w-full bg-transparent text-xl outline-none" value={booking.duration} onChange={e => setBooking({...booking, duration: Number(e.target.value)})}>
                  {[1, 2, 3].map(h => <option key={h} value={h} className="bg-black text-white">{h} h</option>)}
                </select>
              </div>
            </div>
            <button onClick={checkAvailability} disabled={loading} className="w-full bg-yellow-600 py-6 rounded-3xl font-black uppercase tracking-widest hover:bg-yellow-500 transition-all">{loading ? 'Sprawdzam...' : 'Wybierz tor'}</button>
          </div>
        )}

        {/* STEP 2: TOR */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold italic uppercase">Wybierz tor</h2>
            <div className="grid grid-cols-2 gap-4">
              {lanes.map(lane => {
                const laneRes = bookedLanesInfo.filter(b => b.lane_id === lane.id);
                const startISO = formatDateTime(booking.date, booking.startTime);
                const endISO = formatDateTime(booking.date, booking.startTime, booking.duration);
                const isBooked = laneRes.some(b => new Date(b.start_time) < new Date(endISO) && new Date(b.end_time) > new Date(startISO));
                return (
                  <button key={lane.id} disabled={isBooked} onClick={() => setBooking({...booking, laneId: lane.id, selectedLane: lane})} className={`p-6 rounded-[32px] border-2 text-left transition-all relative overflow-hidden flex flex-col ${isBooked ? 'border-red-900/30 bg-red-900/5 opacity-60 cursor-not-allowed' : booking.laneId === lane.id ? 'border-yellow-500 bg-yellow-500/10' : 'border-gray-800 bg-black/40 hover:border-yellow-500/50'}`}>
                    <div className="flex justify-between items-start w-full">
                      <div className="flex flex-col gap-1 text-left">
                        <span className="text-3xl font-black block tracking-tighter">#{lane.number}</span>
                        {lane.has_bumpers && <span className="text-[9px] bg-blue-600/20 text-blue-400 font-black px-2 py-0.5 rounded-full uppercase tracking-tighter w-fit border border-blue-400/30">👶 Dla dzieci</span>}
                      </div>
                      <p className="text-sm font-bold text-green-500">{lane.price_per_hour} zł/h</p>
                    </div>
                    <div className="mt-4 space-y-1">
                      <p className="text-[9px] uppercase font-bold text-gray-500 tracking-widest text-left">Zajęte:</p>
                      {laneRes.length > 0 ? laneRes.map((res, i) => (
                        <p key={i} className="text-[10px] font-mono text-gray-400 text-left">{res.start_time.substring(11, 16)} - {res.end_time.substring(11, 16)}</p>
                      )) : <p className="text-[10px] font-mono text-green-700 uppercase text-left">Wolny</p>}
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="flex gap-4">
              <button onClick={() => setStep(1)} className="w-1/3 border border-gray-800 py-6 rounded-3xl font-bold uppercase text-xs">Cofnij</button>
              <button onClick={() => setStep(3)} disabled={!booking.laneId} className="w-2/3 bg-yellow-600 py-6 rounded-3xl font-black uppercase tracking-widest text-black">Dalej</button>
            </div>
          </div>
        )}

        {/* STEP 3: DYNAMICZNE BUTY (Mapowane z bazy!) */}
        {step === 3 && (
          <div className="space-y-8 animate-in fade-in duration-500 text-center">
            <h2 className="text-3xl font-bold italic uppercase">Gracze i Buty</h2>
            <div className="bg-black/40 p-8 rounded-[32px] border border-gray-800 shadow-inner">
              <p className="text-[10px] uppercase text-gray-500 font-black mb-4 tracking-widest text-center">Liczba graczy</p>
              <div className="flex justify-center items-center gap-10">
                <button onClick={() => setBooking({...booking, peopleCount: Math.max(1, booking.peopleCount - 1), shoes: {}})} className="text-4xl text-yellow-500">-</button>
                <span className="text-6xl font-black">{booking.peopleCount}</span>
                <button onClick={() => setBooking({...booking, peopleCount: Math.min(booking.selectedLane.max_people, booking.peopleCount + 1)})} className="text-4xl text-yellow-500">+</button>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="max-h-60 overflow-y-auto pr-2 space-y-2">
                {/* TUTAJ DZIEJE SIĘ MAGIA: Mapujemy po danych z bazy */}
                {shoeInventory.map((item) => {
                  const size = parseFloat(item.size);
                  return (
                    <div key={item.id} className="flex justify-between items-center bg-gray-900/50 p-4 rounded-2xl border border-gray-800">
                      <span className="font-bold text-yellow-500">Rozmiar {size}</span>
                      <div className="flex items-center gap-4">
                        <button onClick={() => updateShoeCount(size, -1)} className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors">-</button>
                        <span className="w-4 font-bold">{booking.shoes[size] || 0}</span>
                        <button onClick={() => updateShoeCount(size, 1)} className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors">+</button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className={`text-[10px] font-black uppercase tracking-widest text-center ${totalShoes === booking.peopleCount ? 'text-green-500' : 'text-yellow-500'}`}>
                {totalShoes === booking.peopleCount ? '✓ Wszystkie pary wybrane' : `Wybrano: ${totalShoes} / ${booking.peopleCount} par`}
              </p>
            </div>
            
            <div className="flex gap-4">
              <button onClick={() => setStep(2)} className="w-1/3 border border-gray-800 py-6 rounded-3xl font-bold uppercase text-xs">Cofnij</button>
              <button onClick={() => setStep(4)} disabled={totalShoes !== booking.peopleCount} className="w-2/3 bg-yellow-600 disabled:opacity-50 py-6 rounded-3xl font-black uppercase tracking-widest text-black transition-all">Twoje dane</button>
            </div>
          </div>
        )}

        {/* STEP 4: KONTAKT */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in duration-500 text-left text-center">
            <h2 className="text-3xl font-bold italic uppercase text-center">Dane kontaktowe</h2>
            <div className="grid gap-4 text-center">
              {['firstName', 'lastName', 'email', 'phone'].map((field, idx) => (
                <div key={field}>
                  <label className="text-[10px] text-gray-500 uppercase font-black ml-4 mb-1 block tracking-widest text-center">{['Imię', 'Nazwisko', 'Email', 'Telefon'][idx]}</label>
                  <input className="w-full bg-black/40 border border-gray-800 p-6 rounded-2xl outline-none focus:border-yellow-500 text-white transition-all text-center" value={(booking as any)[field]} onChange={e => setBooking({...booking, [field]: e.target.value})} placeholder={field === 'phone' ? "9 cyfr" : field === 'email' ? "twoj@email.pl" : "Tylko litery"} />
                </div>
              ))}
            </div>
            <button onClick={handlePayment} disabled={loading || !isFormValid()} className={`w-full py-8 rounded-[32px] font-black uppercase text-xl transition-all shadow-2xl ${loading || !isFormValid() ? 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-50' : 'bg-green-600 text-white hover:bg-green-500 active:scale-95 shadow-green-900/30'}`}>
              {loading ? 'Przetwarzanie...' : `ZAPŁAĆ ${grandTotal} PLN`}
            </button>
            <button onClick={() => setStep(3)} className="w-full text-gray-700 text-[10px] font-black uppercase py-2 text-center">Cofnij</button>
          </div>
        )}

        {/* STEP 5: SUKCES */}
        {step === 5 && (
          <div className="py-10 space-y-8 animate-in zoom-in duration-500 text-center">
            <div className="w-24 h-24 bg-green-500 rounded-full mx-auto flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
            </div>
            <div className="space-y-2">
              <h2 className="text-4xl font-black italic uppercase tracking-tighter">GOTOWE!</h2>
              <p className="text-gray-400 text-sm">Potwierdzenie wysłaliśmy na: <strong>{booking.email}</strong></p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 text-left space-y-3">
              <div className="flex justify-between border-b border-white/5 pb-2"><span className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Tor</span><span className="font-black">#{booking.selectedLane.number}</span></div>
              <div className="flex justify-between border-b border-white/5 pb-2"><span className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Czas</span><span className="font-black">{booking.date} o {booking.startTime}</span></div>
            </div>
            <button onClick={() => router.push('/')} className="w-full bg-white text-black py-6 rounded-3xl font-black uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-95">Strona Główna</button>
          </div>
        )}
      </div>
    </main>
  );
}