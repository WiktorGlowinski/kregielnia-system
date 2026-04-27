'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function BookingWizard() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [lanes, setLanes] = useState<any[]>([]);
  const [shoePrice, setShoePrice] = useState(0);

  // --- STAN REZERWACJI ---
  const [booking, setBooking] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '18:00',
    duration: 1,
    laneId: null as number | null,
    selectedLane: null as any,
    peopleCount: 1,
    // Rozmiary butów: { rozmiar: ilość }
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

  // --- LOGIKA BUTÓW ---
  const totalShoesSelected = Object.values(booking.shoes).reduce((a, b) => a + b, 0);
  
  const updateShoeCount = (size: number, delta: number) => {
    const currentQty = booking.shoes[size] || 0;
    const newQty = Math.max(0, currentQty + delta);
    
    // Blokada: nie pozwól dodać więcej butów niż jest osób
    if (delta > 0 && totalShoesSelected >= booking.peopleCount) return;

    setBooking({
      ...booking,
      shoes: { ...booking.shoes, [size]: newQty }
    });
  };

  // --- KALKULACJA CENY ---
  const laneTotal = booking.duration * (booking.selectedLane?.price_per_hour || 0);
  const shoesTotal = totalShoesSelected * shoePrice;
  const grandTotal = laneTotal + shoesTotal;

  const isTimeValid = () => {
    const startHour = parseInt(booking.startTime.split(':')[0]);
    return (startHour + booking.duration <= 23);
  };

  // Walidacja formularza - MUSZĄ być wszystkie dane
  const isFormValid = booking.firstName.trim() !== '' && 
                       booking.lastName.trim() !== '' && 
                       booking.phone.trim().length >= 9;

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  return (
    <main className="min-h-screen bg-[#050505] text-white p-4 font-sans">
      <div className="max-w-3xl mx-auto border border-gray-900 rounded-[40px] p-8 bg-gray-900/10 backdrop-blur-md">
        
        {/* HEADER */}
        <div className="flex justify-between items-start mb-10">
          <Link href="/" className="text-gray-600 hover:text-yellow-500 text-xs font-black uppercase">← Wróć</Link>
          <div className="text-right">
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Suma</p>
            <p className="text-3xl font-black text-green-500">{grandTotal} PLN</p>
          </div>
        </div>

        {/* KROK 1: DATA, GODZINA, CZAS */}
{step === 1 && (
  <div className="space-y-6 animate-in fade-in duration-500">
    <h2 className="text-3xl font-bold text-center">Kiedy gramy?</h2>
    <div className="grid gap-4">
      {/* WYBÓR DATY */}
      <div className="bg-black/40 p-6 rounded-3xl border border-gray-800">
        <label className="text-[10px] uppercase text-gray-500 font-bold mb-2 block tracking-widest">Dzień</label>
        <input 
          type="date" 
          min={new Date().toISOString().split('T')[0]}
          className="w-full bg-transparent text-xl outline-none" 
          value={booking.date}
          onChange={e => setBooking({...booking, date: e.target.value})}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* WYBÓR GODZINY (NAPRAWIONY) */}
        <div className="bg-black/40 p-6 rounded-3xl border border-gray-800">
          <label className="text-[10px] uppercase text-gray-500 font-bold mb-2 block tracking-widest">Start</label>
          <select 
            className="w-full bg-transparent text-xl outline-none" 
            value={booking.startTime} 
            onChange={e => setBooking({...booking, startTime: e.target.value})} 
          >
            <option value="12:00" className="bg-black">12:00</option>
            <option value="13:00" className="bg-black">13:00</option>
            <option value="14:00" className="bg-black">14:00</option>
            <option value="15:00" className="bg-black">15:00</option>
            <option value="16:00" className="bg-black">16:00</option>
            <option value="17:00" className="bg-black">17:00</option>
            <option value="18:00" className="bg-black">18:00</option>
            <option value="19:00" className="bg-black">19:00</option>
            <option value="20:00" className="bg-black">20:00</option>
            <option value="21:00" className="bg-black">21:00</option>
            <option value="22:00" className="bg-black">22:00</option>
          </select>
        </div>

        {/* CZAS TRWANIA */}
        <div className="bg-black/40 p-6 rounded-3xl border border-gray-800">
          <label className="text-[10px] uppercase text-gray-500 font-bold mb-2 block tracking-widest">Czas trwania</label>
          <select 
            className="w-full bg-transparent text-xl outline-none" 
            value={booking.duration} 
            onChange={e => setBooking({...booking, duration: Number(e.target.value)})}
          >
            <option value="1" className="bg-black">1 godzina</option>
            <option value="2" className="bg-black">2 godziny</option>
            <option value="3" className="bg-black">3 godziny</option>
          </select>
        </div>
      </div>
    </div>

    {/* WALIDACJA GODZIN OTWARCIA */}
    {!isTimeValid() && (
      <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-2xl">
        <p className="text-red-500 text-center text-[10px] font-black uppercase italic animate-pulse tracking-tighter">
          Zamykamy o 23:00! Wybierz wcześniejszą godzinę lub krótszy czas gry.
        </p>
      </div>
    )}

    <button 
      onClick={nextStep} 
      disabled={!isTimeValid()}
      className="w-full bg-yellow-600 disabled:bg-gray-800 disabled:opacity-50 py-6 rounded-3xl font-black uppercase tracking-widest transition-all hover:bg-yellow-500 active:scale-95"
    >
      Wybierz tor
    </button>
  </div>
)}

        {/* KROK 2: WYBÓR TORU (Ceny ze screena) */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-center">Wybierz tor</h2>
            <div className="grid grid-cols-2 gap-4">
              {lanes.map(lane => (
                <button 
                  key={lane.id}
                  onClick={() => setBooking({...booking, laneId: lane.id, selectedLane: lane})}
                  className={`p-6 rounded-[32px] border-2 text-left transition-all ${booking.laneId === lane.id ? 'border-yellow-500 bg-yellow-500/10' : 'border-gray-800 bg-black/40'}`}
                >
                  <span className="text-3xl font-black block">#{lane.number}</span>
                  <div className="mt-2 space-y-1">
                    <p className="text-[10px] uppercase font-bold text-gray-500">{lane.max_people} osób max</p>
                    <p className="text-sm font-bold text-green-500">{lane.price_per_hour} PLN/h</p>
                    {lane.has_bumpers && <p className="text-[9px] text-blue-400 font-black uppercase">Bumpers ON</p>}
                  </div>
                </button>
              ))}
            </div>
            <div className="flex gap-4">
              <button onClick={prevStep} className="w-1/3 border border-gray-800 py-6 rounded-3xl font-bold uppercase">Cofnij</button>
              <button onClick={nextStep} disabled={!booking.laneId} className="w-2/3 bg-yellow-600 disabled:bg-gray-800 py-6 rounded-3xl font-black uppercase tracking-widest">Dalej</button>
            </div>
          </div>
        )}

        {/* KROK 3: OSOBY I ROZMIARY BUTÓW */}
        {step === 3 && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <h2 className="text-3xl font-bold text-center">Gracze i Buty</h2>
            
            {/* Wybór liczby osób */}
            <div className="bg-black/40 p-8 rounded-[32px] border border-gray-800 text-center">
              <p className="text-[10px] uppercase text-gray-500 font-black mb-4">Liczba graczy</p>
              <div className="flex justify-center items-center gap-10">
                <button onClick={() => setBooking({...booking, peopleCount: Math.max(1, booking.peopleCount - 1), shoes: {}})} className="text-4xl text-yellow-500">-</button>
                <span className="text-6xl font-black">{booking.peopleCount}</span>
                <button onClick={() => setBooking({...booking, peopleCount: Math.min(booking.selectedLane.max_people, booking.peopleCount + 1)})} className="text-4xl text-yellow-500">+</button>
              </div>
            </div>

            {/* Wybór rozmiarów */}
            <div className="space-y-4">
              <p className="text-center text-gray-400 text-sm italic">Wybierz rozmiary butów dla {booking.peopleCount} osób:</p>
              <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {[36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46].map(size => (
                  <div key={size} className="flex justify-between items-center bg-gray-900/50 p-4 rounded-2xl border border-gray-800">
                    <span className="font-bold text-lg text-yellow-500">Rozmiar {size}</span>
                    <div className="flex items-center gap-4">
                      <button onClick={() => updateShoeCount(size, -1)} className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">-</button>
                      <span className="w-4 text-center font-bold">{booking.shoes[size] || 0}</span>
                      <button onClick={() => updateShoeCount(size, 1)} className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">+</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center">
                <p className={`text-xs font-bold uppercase ${totalShoesSelected === booking.peopleCount ? 'text-green-500' : 'text-yellow-500'}`}>
                  Wybrano: {totalShoesSelected} / {booking.peopleCount} par
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={prevStep} className="w-1/3 border border-gray-800 py-6 rounded-3xl font-bold uppercase">Cofnij</button>
              <button 
                onClick={nextStep} 
                disabled={totalShoesSelected !== booking.peopleCount}
                className="w-2/3 bg-yellow-600 disabled:bg-gray-800 disabled:opacity-50 py-6 rounded-3xl font-black uppercase tracking-widest transition-all"
              >
                Twoje dane
              </button>
            </div>
          </div>
        )}

        {/* KROK 4: DANE KLIENTA I WALIDACJA */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <h2 className="text-3xl font-bold text-center">Dane kontaktowe</h2>
            <div className="grid gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 uppercase font-bold ml-4">Imię</label>
                <input 
                  placeholder="np. Niko" 
                  className="w-full bg-black/40 border border-gray-800 p-6 rounded-2xl outline-none focus:border-yellow-500 transition-all" 
                  value={booking.firstName} 
                  onChange={e => setBooking({...booking, firstName: e.target.value})} 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 uppercase font-bold ml-4">Nazwisko</label>
                <input 
                  placeholder="np. Bellic" 
                  className="w-full bg-black/40 border border-gray-800 p-6 rounded-2xl outline-none focus:border-yellow-500 transition-all" 
                  value={booking.lastName} 
                  onChange={e => setBooking({...booking, lastName: e.target.value})} 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 uppercase font-bold ml-4">Telefon</label>
                <input 
                  type="tel"
                  placeholder="np. 555 010 042" 
                  className="w-full bg-black/40 border border-gray-800 p-6 rounded-2xl outline-none focus:border-yellow-500 transition-all" 
                  value={booking.phone} 
                  onChange={e => setBooking({...booking, phone: e.target.value})} 
                />
              </div>
            </div>
            
            <div className="p-6 bg-yellow-500/5 rounded-3xl border border-yellow-500/10">
              <p className="text-xs text-gray-400 text-center uppercase tracking-widest italic">
                Podsumowanie: Tor #{booking.selectedLane.number}, {booking.duration}h, {booking.peopleCount} os.
              </p>
            </div>

            <button 
              onClick={() => alert(`Inicjalizacja Stripe...`)}
              disabled={!isFormValid}
              className={`w-full py-8 rounded-[32px] font-black uppercase text-xl shadow-2xl transition-all ${
                isFormValid 
                ? 'bg-green-600 hover:bg-green-500 shadow-green-900/30' 
                : 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-50'
              }`}
            >
              {isFormValid ? `ZAPŁAĆ ${grandTotal} PLN` : 'Wypełnij wszystkie dane'}
            </button>
            <button onClick={prevStep} className="w-full text-gray-700 text-[10px] font-bold uppercase tracking-widest py-2">Cofnij do butów</button>
          </div>
        )}

      </div>
    </main>
  );
}