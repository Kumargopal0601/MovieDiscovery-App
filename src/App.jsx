import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthModal from './components/AuthModal';
import BookingModal from './components/BookingModal';
import Home from './pages/Home';
import MovieDetails from './pages/MovieDetails';
import Favourites from './pages/Favourites';
import MyBookings from './pages/MyBookings';
import './index.css';

const API_BASE = process.env.REACT_APP_API_URL || '';

function AppContent() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedMovieId, setSelectedMovieId] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingMovie, setBookingMovie] = useState(null);
  const [navScrolled, setNavScrolled] = useState(false);
  const { user, token, isAuthenticated, logout, loading: authLoading } = useAuth();

  // Navbar scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setNavScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch favorites from backend when authenticated
  const fetchFavorites = useCallback(async () => {
    if (!token) {
      setFavorites([]);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/favorites`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setFavorites(data.favorites || []);
      }
    } catch (err) {
      console.error('Failed to fetch favorites:', err);
    }
  }, [token]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites();
    } else {
      setFavorites([]);
    }
  }, [isAuthenticated, fetchFavorites]);

  const navigateToHome = () => {
    setCurrentPage('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToMovieDetails = (movieId) => {
    setSelectedMovieId(movieId);
    setCurrentPage('movieDetails');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToFavourites = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    setCurrentPage('favourites');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToBookings = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    setCurrentPage('bookings');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookTickets = (movie) => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    setBookingMovie(movie);
    setShowBookingModal(true);
  };

  const toggleFavorite = async (movie) => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    const isAlreadyFavorite = favorites.some(fav => fav.id === movie.id);

    try {
      if (isAlreadyFavorite) {
        const res = await fetch(`${API_BASE}/api/favorites/${movie.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
          setFavorites(prev => prev.filter(fav => fav.id !== movie.id));
        }
      } else {
        const res = await fetch(`${API_BASE}/api/favorites`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            movie_id: movie.id,
            title: movie.title,
            poster_path: movie.poster_path,
            release_date: movie.release_date,
            vote_average: movie.vote_average,
            overview: movie.overview
          })
        });

        if (res.ok) {
          setFavorites(prev => [...prev, movie]);
        }
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <Home
            onSelectMovie={navigateToMovieDetails}
            onFavouritesClick={navigateToFavourites}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
          />
        );
      case 'movieDetails':
        return (
          <MovieDetails
            movieId={selectedMovieId}
            onBackClick={navigateToHome}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onBookTickets={handleBookTickets}
          />
        );
      case 'favourites':
        return (
          <Favourites
            favorites={favorites}
            onBackClick={navigateToHome}
            onMovieClick={navigateToMovieDetails}
            onToggleFavorite={toggleFavorite}
          />
        );
      case 'bookings':
        return (
          <MyBookings
            onBackClick={navigateToHome}
            onMovieClick={navigateToMovieDetails}
          />
        );
      default:
        return (
          <Home
            onSelectMovie={navigateToMovieDetails}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
          />
        );
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '100vh', background: 'var(--netflix-dark)' }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="App">
      {/* ===== NETFLIX-STYLE NAV ===== */}
      <nav className={`netflix-nav ${navScrolled ? 'scrolled' : ''}`}>
        {/* Left: Logo + Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <button onClick={navigateToHome} className="nav-logo" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            MOVIEVERSE
          </button>
          <div style={{ display: 'flex', gap: '20px' }} className="hidden sm:flex">
            <button
              onClick={navigateToHome}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: currentPage === 'home' ? 'white' : 'var(--netflix-text-muted)',
                fontWeight: currentPage === 'home' ? '600' : '400',
                fontSize: '0.9rem', transition: 'color 0.3s',
                fontFamily: 'inherit'
              }}
            >
              Home
            </button>
            <button
              onClick={navigateToFavourites}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: currentPage === 'favourites' ? 'white' : 'var(--netflix-text-muted)',
                fontWeight: currentPage === 'favourites' ? '600' : '400',
                fontSize: '0.9rem', transition: 'color 0.3s',
                fontFamily: 'inherit'
              }}
            >
              My List
            </button>
            <button
              onClick={navigateToBookings}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: currentPage === 'bookings' ? 'white' : 'var(--netflix-text-muted)',
                fontWeight: currentPage === 'bookings' ? '600' : '400',
                fontSize: '0.9rem', transition: 'color 0.3s',
                fontFamily: 'inherit'
              }}
            >
              My Bookings
            </button>
          </div>
        </div>

        {/* Right: User Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Mobile Favorites */}
          <button
            onClick={navigateToFavourites}
            className="sm:hidden"
            style={{
              background: 'none', border: 'none', cursor: 'pointer', color: 'white',
              position: 'relative', padding: '4px'
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill={favorites.length > 0 ? 'var(--netflix-red)' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M12 4.5C7 -0.5 2 3.5 2 9C2 14 12 20.5 12 20.5C12 20.5 22 14 22 9C22 3.5 17 -0.5 12 4.5Z" />
            </svg>
            {favorites.length > 0 && (
              <span style={{
                position: 'absolute', top: '-4px', right: '-6px',
                background: 'var(--netflix-red)', color: 'white',
                fontSize: '0.65rem', fontWeight: '700',
                width: '18px', height: '18px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {favorites.length}
              </span>
            )}
          </button>

          {/* Auth */}
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '4px',
                background: 'linear-gradient(135deg, var(--netflix-red), #b20710)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: '0.85rem', fontWeight: '700',
                cursor: 'pointer'
              }}>
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <button
                onClick={logout}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--netflix-text-muted)', fontSize: '0.85rem',
                  fontFamily: 'inherit', transition: 'color 0.3s'
                }}
                onMouseEnter={(e) => e.target.style.color = 'white'}
                onMouseLeave={(e) => e.target.style.color = 'var(--netflix-text-muted)'}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button className="btn-netflix" onClick={() => setShowAuthModal(true)}>
              Sign In
            </button>
          )}
        </div>
      </nav>

      {/* Page Content */}
      {renderCurrentPage()}

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {/* Booking Modal */}
      <BookingModal
        isOpen={showBookingModal}
        onClose={() => { setShowBookingModal(false); setBookingMovie(null); }}
        movie={bookingMovie}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
