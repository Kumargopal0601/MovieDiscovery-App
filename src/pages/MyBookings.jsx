// src/pages/MyBookings.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const API_BASE = process.env.REACT_APP_API_URL || '';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w200/';

const MyBookings = ({ onBackClick, onMovieClick }) => {
  const { token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/bookings`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setBookings(data.bookings || []);
        }
      } catch (err) { console.error('Failed to fetch bookings:', err); }
      finally { setLoading(false); }
    };
    fetchBookings();
  }, [token]);

  const cancelBooking = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/bookings/${id}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setBookings(prev => prev.map(b => b.id === id ? { ...b, booking_status: 'cancelled' } : b));
      }
    } catch (err) { console.error('Failed to cancel:', err); }
  };

  return (
    <div style={{ paddingTop: '80px', minHeight: '100vh' }}>
      <div style={{ padding: '20px 4% 10px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button onClick={onBackClick} className="btn-ghost" style={{ padding: '8px 16px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
          Back
        </button>
      </div>

      <h1 className="section-title animate-fade-in-up" style={{ fontSize: '2rem', marginBottom: '8px' }}>🎟️ My Bookings</h1>
      <p className="animate-fade-in-up" style={{ padding: '0 4%', color: 'var(--netflix-text-muted)', marginBottom: '30px', animationDelay: '0.1s', opacity: 0 }}>
        {bookings.length > 0 ? `${bookings.length} booking(s)` : 'No bookings yet'}
      </p>

      {loading ? (
        <div className="flex items-center justify-center" style={{ padding: '80px' }}><div className="loading-spinner"></div></div>
      ) : bookings.length === 0 ? (
        <div className="animate-fade-in-up" style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🎬</div>
          <p style={{ color: 'var(--netflix-text-muted)', fontSize: '1.1rem', marginBottom: '24px' }}>You haven't booked any tickets yet.</p>
          <button className="btn-netflix" onClick={onBackClick}>Browse Movies</button>
        </div>
      ) : (
        <div style={{ padding: '0 4%', display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))' }}>
          {bookings.map((booking, i) => (
            <div key={booking.id} className="animate-fade-in-up" style={{
              animationDelay: `${i * 0.05}s`, opacity: 0,
              background: 'rgba(255,255,255,0.04)', borderRadius: '12px', overflow: 'hidden',
              border: `1px solid ${booking.booking_status === 'cancelled' ? 'rgba(229,9,20,0.3)' : 'rgba(255,255,255,0.06)'}`,
              display: 'flex', transition: 'transform 0.3s'
            }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              {/* Poster */}
              {booking.movie_poster && (
                <img src={`${IMAGE_BASE_URL}${booking.movie_poster}`} alt="" style={{ width: '100px', objectFit: 'cover', cursor: 'pointer', flexShrink: 0 }}
                  onClick={() => onMovieClick(booking.movie_id)} />
              )}

              {/* Details */}
              <div style={{ padding: '16px', flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'white', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{booking.movie_title}</h3>
                  <span style={{
                    fontSize: '0.7rem', padding: '2px 10px', borderRadius: '10px', fontWeight: 600, flexShrink: 0, marginLeft: '8px',
                    background: booking.booking_status === 'confirmed' ? 'rgba(70,211,105,0.15)' : 'rgba(229,9,20,0.15)',
                    color: booking.booking_status === 'confirmed' ? '#46d369' : '#e50914'
                  }}>{booking.booking_status === 'confirmed' ? '✓ Confirmed' : '✕ Cancelled'}</span>
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--netflix-text-muted)', lineHeight: 1.8 }}>
                  <p>📍 {booking.theater_name}</p>
                  <p>📅 {booking.show_date} • {booking.show_time}</p>
                  <p>💺 Seats: {Array.isArray(booking.seats) ? booking.seats.join(', ') : booking.seats}</p>
                  <p style={{ color: '#46d369', fontWeight: 700 }}>₹{booking.total_amount}</p>
                </div>

                {booking.booking_status === 'confirmed' && (
                  <button onClick={() => cancelBooking(booking.id)} style={{
                    marginTop: '10px', padding: '6px 16px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600,
                    background: 'rgba(229,9,20,0.1)', border: '1px solid rgba(229,9,20,0.3)', color: '#e50914',
                    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s'
                  }}>Cancel Booking</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <footer className="netflix-footer">
        <p>MovieVerse — Powered by TMDB API</p>
        <p style={{ marginTop: '6px', fontSize: '0.8rem', color: 'var(--netflix-text-muted)' }}>Developed by Kumar_Gopal</p>
      </footer>
    </div>
  );
};

export default MyBookings;
