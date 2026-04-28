// src/components/BookingModal.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const API_BASE = process.env.REACT_APP_API_URL || '';
const RAZORPAY_KEY = process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_SirTYs4BKTkbwg';

const POPULAR_CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune'];

const BookingModal = ({ isOpen, onClose, movie }) => {
  const { token } = useAuth();
  const [step, setStep] = useState(1);
  const [city, setCity] = useState('');
  const [theaters, setTheaters] = useState([]);
  const [selectedTheater, setSelectedTheater] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedScreen, setSelectedScreen] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [seatMap, setSeatMap] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);

  // Generate next 7 dates
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      value: d.toISOString().split('T')[0],
      label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
    };
  });

  useEffect(() => {
    if (isOpen) {
      setStep(1); setCity(''); setTheaters([]); setSelectedTheater(null);
      setSelectedTime(null); setSelectedScreen(null); setSelectedDate(dates[0].value);
      setSeatMap([]); setSelectedSeats([]); setError(''); setBookingComplete(false);
      setBookingDetails(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen || !movie) return null;

  const fetchTheaters = async () => {
    if (!city.trim()) { setError('Please enter a city'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_BASE}/api/bookings/theaters?city=${encodeURIComponent(city)}&movieId=${movie.id}`);
      const data = await res.json();
      if (res.ok) { setTheaters(data.theaters || []); setStep(2); }
      else throw new Error(data.error);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const fetchSeats = async () => {
    if (!selectedTheater || !selectedTime || !selectedDate) return;
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_BASE}/api/bookings/seats?theaterId=${selectedTheater.id}&screen=${encodeURIComponent(selectedScreen)}&showtime=${encodeURIComponent(selectedTime)}&date=${selectedDate}`);
      const data = await res.json();
      if (res.ok) { setSeatMap(data.seatMap || []); setSelectedSeats([]); setStep(3); }
      else throw new Error(data.error);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const toggleSeat = (seat) => {
    if (seat.status === 'booked') return;
    setSelectedSeats(prev =>
      prev.find(s => s.id === seat.id) ? prev.filter(s => s.id !== seat.id) : [...prev, seat]
    );
  };

  const totalAmount = selectedSeats.reduce((sum, s) => sum + s.price, 0);

  const handlePayment = async () => {
    if (selectedSeats.length === 0) { setError('Please select at least one seat'); return; }
    setLoading(true); setError('');
    try {
      // Create Razorpay order
      const orderRes = await fetch(`${API_BASE}/api/bookings/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ amount: totalAmount, movieTitle: movie.title, seats: selectedSeats.map(s => s.id) })
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error);

      // Open Razorpay checkout
      const options = {
        key: RAZORPAY_KEY,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'MovieVerse',
        description: `${movie.title} - ${selectedSeats.length} ticket(s)`,
        order_id: orderData.orderId,
        handler: async (response) => {
          // Verify payment on backend
          try {
            const verifyRes = await fetch(`${API_BASE}/api/bookings/verify-payment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                movie_id: movie.id, movie_title: movie.title,
                movie_poster: movie.poster_path,
                theater_name: selectedTheater.name, city,
                show_date: selectedDate, show_time: selectedTime,
                screen: selectedScreen,
                seats: selectedSeats.map(s => s.id), total_amount: totalAmount
              })
            });
            const verifyData = await verifyRes.json();
            if (verifyRes.ok) {
              setBookingDetails(verifyData.booking);
              setBookingComplete(true); setStep(5);
            } else throw new Error(verifyData.error);
          } catch (err) { setError(`Payment verified but booking failed: ${err.message}`); }
        },
        prefill: {},
        theme: { color: '#e50914' }
      };

      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', (resp) => setError(`Payment failed: ${resp.error.description}`));
        rzp.open();
      } else {
        setError('Razorpay SDK not loaded. Please refresh the page.');
      }
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const tierColors = { recliner: '#fbbf24', premium: '#60a5fa', standard: '#4ade80' };
  const tierLabels = { recliner: 'Recliner ₹350', premium: 'Premium ₹250', standard: 'Standard ₹150' };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }} onClick={onClose} className="animate-fade-in" />

      <div className="animate-scale-in" style={{
        position: 'relative', width: '100%', maxWidth: '640px', maxHeight: '90vh',
        background: '#141414', borderRadius: '12px', overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'white', margin: 0 }}>🎟️ Book Tickets</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--netflix-text-muted)', marginTop: '4px' }}>{movie.title}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--netflix-text-muted)', cursor: 'pointer', padding: '4px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Step indicators */}
        {!bookingComplete && (
          <div style={{ display: 'flex', padding: '16px 24px', gap: '8px', flexShrink: 0 }}>
            {['City', 'Theater', 'Seats', 'Pay'].map((label, i) => (
              <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{
                  height: '3px', borderRadius: '2px', marginBottom: '6px',
                  background: step > i + 1 ? '#46d369' : step === i + 1 ? 'var(--netflix-red)' : 'rgba(255,255,255,0.1)',
                  transition: 'all 0.3s'
                }} />
                <span style={{ fontSize: '0.7rem', color: step >= i + 1 ? 'white' : 'var(--netflix-text-muted)' }}>{label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ margin: '0 24px', padding: '10px 16px', borderRadius: '6px', background: 'rgba(229,9,20,0.15)', border: '1px solid rgba(229,9,20,0.3)', color: '#e87c03', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>

          {/* STEP 1: City */}
          {step === 1 && (
            <div className="animate-fade-in">
              <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--netflix-text)', marginBottom: '8px', fontWeight: 600 }}>Enter your city</label>
              <input type="text" value={city} onChange={e => setCity(e.target.value)}
                placeholder="e.g. Mumbai, Delhi, Bangalore..."
                onKeyDown={e => e.key === 'Enter' && fetchTheaters()}
                style={{ width: '100%', padding: '14px', borderRadius: '6px', background: '#333', border: 'none', color: 'white', fontSize: '1rem', fontFamily: 'inherit', outline: 'none' }}
              />
              <div style={{ marginTop: '16px' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--netflix-text-muted)', marginBottom: '8px' }}>Popular Cities</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {POPULAR_CITIES.map(c => (
                    <button key={c} onClick={() => { setCity(c); }}
                      style={{
                        padding: '6px 16px', borderRadius: '20px', fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit',
                        background: city === c ? 'var(--netflix-red)' : 'rgba(255,255,255,0.08)',
                        border: '1px solid', borderColor: city === c ? 'var(--netflix-red)' : 'rgba(255,255,255,0.15)',
                        color: 'white', transition: 'all 0.2s'
                      }}>{c}</button>
                  ))}
                </div>
              </div>
              <button onClick={fetchTheaters} disabled={loading} className="btn-netflix" style={{ width: '100%', marginTop: '24px', justifyContent: 'center', padding: '14px', opacity: loading ? 0.6 : 1 }}>
                {loading ? 'Searching...' : 'Find Theaters'}
              </button>
            </div>
          )}

          {/* STEP 2: Theater & Showtime */}
          {step === 2 && (
            <div className="animate-fade-in">
              {/* Date picker */}
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '16px', scrollbarWidth: 'none' }}>
                {dates.map(d => (
                  <button key={d.value} onClick={() => setSelectedDate(d.value)}
                    style={{
                      flexShrink: 0, padding: '8px 16px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                      background: selectedDate === d.value ? 'var(--netflix-red)' : 'rgba(255,255,255,0.06)', border: '1px solid',
                      borderColor: selectedDate === d.value ? 'var(--netflix-red)' : 'rgba(255,255,255,0.1)', color: 'white'
                    }}>{d.label}</button>
                ))}
              </div>

              {/* Theater list */}
              {theaters.map(theater => (
                <div key={theater.id} style={{
                  background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '16px', marginBottom: '12px',
                  border: selectedTheater?.id === theater.id ? '1px solid var(--netflix-red)' : '1px solid rgba(255,255,255,0.06)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                    <div>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'white', marginBottom: '4px' }}>{theater.name}</h3>
                      <p style={{ fontSize: '0.75rem', color: 'var(--netflix-text-muted)' }}>{theater.distance} • ⭐ {theater.rating}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {theater.facilities.slice(0, 2).map(f => (
                        <span key={f} style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', color: 'var(--netflix-text-muted)' }}>{f}</span>
                      ))}
                    </div>
                  </div>

                  {theater.screens.map(scr => (
                    <div key={scr.screen} style={{ marginBottom: '8px' }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--netflix-text-muted)', marginBottom: '6px' }}>{scr.screen}</p>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {scr.showtimes.map(time => {
                          const isSelected = selectedTheater?.id === theater.id && selectedTime === time && selectedScreen === scr.screen;
                          return (
                            <button key={`${scr.screen}-${time}`}
                              onClick={() => { setSelectedTheater(theater); setSelectedTime(time); setSelectedScreen(scr.screen); }}
                              style={{
                                padding: '6px 14px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                                background: isSelected ? 'var(--netflix-red)' : 'transparent',
                                border: '1px solid', borderColor: isSelected ? 'var(--netflix-red)' : '#46d369', color: isSelected ? 'white' : '#46d369',
                                transition: 'all 0.2s'
                              }}>{time}</button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ))}

              <button onClick={fetchSeats} disabled={!selectedTheater || !selectedTime || loading}
                className="btn-netflix" style={{ width: '100%', marginTop: '8px', justifyContent: 'center', padding: '14px', opacity: !selectedTheater || !selectedTime ? 0.4 : 1 }}>
                {loading ? 'Loading seats...' : 'Select Seats →'}
              </button>
            </div>
          )}

          {/* STEP 3: Seat Selection */}
          {step === 3 && (
            <div className="animate-fade-in">
              {/* Screen indicator */}
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{
                  width: '70%', height: '4px', margin: '0 auto 8px',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)', borderRadius: '2px'
                }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--netflix-text-muted)' }}>SCREEN — {selectedScreen}</span>
              </div>

              {/* Seat map */}
              <div style={{ overflowX: 'auto' }}>
                {seatMap.map(row => (
                  <div key={row.row} style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px', justifyContent: 'center' }}>
                    <span style={{ width: '18px', fontSize: '0.7rem', color: 'var(--netflix-text-muted)', textAlign: 'center' }}>{row.row}</span>
                    {row.seats.map(seat => {
                      const isSelected = selectedSeats.find(s => s.id === seat.id);
                      return (
                        <button key={seat.id} onClick={() => toggleSeat(seat)} disabled={seat.status === 'booked'}
                          title={`${seat.id} - ₹${seat.price}`}
                          style={{
                            width: '28px', height: '28px', borderRadius: '4px 4px 8px 8px', cursor: seat.status === 'booked' ? 'not-allowed' : 'pointer',
                            fontSize: '0.6rem', fontWeight: 600, transition: 'all 0.15s', fontFamily: 'inherit',
                            background: seat.status === 'booked' ? '#333' : isSelected ? 'var(--netflix-red)' : tierColors[seat.tier] + '33',
                            color: seat.status === 'booked' ? '#555' : isSelected ? 'white' : tierColors[seat.tier],
                            border: `1px solid ${seat.status === 'booked' ? '#444' : isSelected ? 'var(--netflix-red)' : tierColors[seat.tier] + '66'}`,
                            transform: isSelected ? 'scale(1.1)' : 'scale(1)'
                          }}>{seat.number}</button>
                      );
                    })}
                    <span style={{ width: '18px', fontSize: '0.7rem', color: 'var(--netflix-text-muted)', textAlign: 'center' }}>{row.row}</span>
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', margin: '20px 0', flexWrap: 'wrap' }}>
                {Object.entries(tierLabels).map(([tier, label]) => (
                  <div key={tier} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem' }}>
                    <div style={{ width: '14px', height: '14px', borderRadius: '3px', background: tierColors[tier] + '44', border: `1px solid ${tierColors[tier]}` }} />
                    <span style={{ color: 'var(--netflix-text-muted)' }}>{label}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem' }}>
                  <div style={{ width: '14px', height: '14px', borderRadius: '3px', background: '#333', border: '1px solid #444' }} />
                  <span style={{ color: 'var(--netflix-text-muted)' }}>Booked</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem' }}>
                  <div style={{ width: '14px', height: '14px', borderRadius: '3px', background: 'var(--netflix-red)', border: '1px solid var(--netflix-red)' }} />
                  <span style={{ color: 'var(--netflix-text-muted)' }}>Selected</span>
                </div>
              </div>

              {/* Selection summary */}
              {selectedSeats.length > 0 && (
                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '14px', marginTop: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--netflix-text)' }}>{selectedSeats.length} seat(s): {selectedSeats.map(s => s.id).join(', ')}</span>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: '#46d369' }}>₹{totalAmount}</span>
                  </div>
                </div>
              )}

              <button onClick={() => setStep(4)} disabled={selectedSeats.length === 0}
                className="btn-netflix" style={{ width: '100%', marginTop: '16px', justifyContent: 'center', padding: '14px', opacity: selectedSeats.length === 0 ? 0.4 : 1 }}>
                Proceed to Pay ₹{totalAmount} →
              </button>
            </div>
          )}

          {/* STEP 4: Payment Summary */}
          {step === 4 && (
            <div className="animate-fade-in">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', marginBottom: '20px' }}>Booking Summary</h3>

              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
                {[
                  { label: 'Movie', value: movie.title },
                  { label: 'Theater', value: selectedTheater?.name },
                  { label: 'Date', value: new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) },
                  { label: 'Time', value: selectedTime },
                  { label: 'Screen', value: selectedScreen },
                  { label: 'Seats', value: selectedSeats.map(s => s.id).join(', ') },
                  { label: 'Tickets', value: `${selectedSeats.length}` },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ color: 'var(--netflix-text-muted)', fontSize: '0.85rem' }}>{item.label}</span>
                    <span style={{ color: 'white', fontSize: '0.85rem', fontWeight: 600, textAlign: 'right', maxWidth: '60%' }}>{item.value}</span>
                  </div>
                ))}

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0 0', marginTop: '8px' }}>
                  <span style={{ fontSize: '1rem', fontWeight: 700, color: 'white' }}>Total Amount</span>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#46d369' }}>₹{totalAmount}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button onClick={() => setStep(3)} className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>← Back</button>
                <button onClick={handlePayment} disabled={loading} className="btn-netflix" style={{ flex: 2, justifyContent: 'center', padding: '14px', opacity: loading ? 0.6 : 1 }}>
                  {loading ? 'Processing...' : `Pay ₹${totalAmount} with Razorpay`}
                </button>
              </div>

              <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--netflix-text-muted)', marginTop: '12px' }}>
                🔒 Secured by Razorpay • Test Mode
              </p>
            </div>
          )}

          {/* STEP 5: Booking Confirmed */}
          {step === 5 && bookingComplete && (
            <div className="animate-scale-in" style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🎉</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#46d369', marginBottom: '8px' }}>Booking Confirmed!</h3>
              <p style={{ color: 'var(--netflix-text-muted)', marginBottom: '24px' }}>Your tickets have been booked successfully</p>

              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '20px', border: '1px solid rgba(255,255,255,0.06)', textAlign: 'left', marginBottom: '20px' }}>
                <p style={{ color: 'white', fontWeight: 700, fontSize: '1.1rem', marginBottom: '12px' }}>{bookingDetails?.movie_title}</p>
                {[
                  { icon: '📍', text: `${bookingDetails?.theater_name}, ${bookingDetails?.city}` },
                  { icon: '📅', text: `${bookingDetails?.show_date} • ${bookingDetails?.show_time}` },
                  { icon: '💺', text: `Seats: ${bookingDetails?.seats?.join(', ')}` },
                  { icon: '💰', text: `₹${bookingDetails?.total_amount}` },
                ].map((item, i) => (
                  <p key={i} style={{ color: 'var(--netflix-text)', fontSize: '0.9rem', marginBottom: '6px' }}>{item.icon} {item.text}</p>
                ))}
              </div>

              <button onClick={onClose} className="btn-netflix" style={{ padding: '12px 40px' }}>Done</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
