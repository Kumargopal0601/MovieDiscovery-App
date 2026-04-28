// src/pages/Favourites.jsx
import React from 'react';
import MovieCard from '../components/MovieCard';

const Favorites = ({ favorites, onBackClick, onMovieClick, onToggleFavorite }) => {
  return (
    <div style={{ paddingTop: '80px', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ padding: '20px 4% 10px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={onBackClick}
          style={{
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
            color: 'white', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem',
            fontWeight: '500', fontFamily: 'inherit', transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back
        </button>
      </div>

      <h1 className="section-title animate-fade-in-up" style={{ fontSize: '2rem', marginBottom: '8px' }}>
        My List
      </h1>
      <p className="animate-fade-in-up" style={{
        padding: '0 4%', color: 'var(--netflix-text-muted)', marginBottom: '30px',
        animationDelay: '0.1s', opacity: 0
      }}>
        {favorites.length > 0
          ? `${favorites.length} title${favorites.length > 1 ? 's' : ''} in your list`
          : 'Your list is empty'
        }
      </p>

      {favorites.length === 0 ? (
        <div className="animate-fade-in-up" style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '80px 20px', animationDelay: '0.2s', opacity: 0
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🎬</div>
          <p style={{ color: 'var(--netflix-text-muted)', fontSize: '1.1rem', textAlign: 'center', maxWidth: '400px', lineHeight: 1.6 }}>
            You haven't added any movies to your list yet.
            Browse movies and click the heart icon to save them here!
          </p>
          <button className="btn-netflix" style={{ marginTop: '24px' }} onClick={onBackClick}>
            Browse Movies
          </button>
        </div>
      ) : (
        <div className="movie-grid">
          {favorites.map((movie, i) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onClick={onMovieClick}
              onToggleFavorite={onToggleFavorite}
              isFavorite={true}
              index={i}
            />
          ))}
        </div>
      )}

      <footer className="netflix-footer">
        <p>MovieVerse — Powered by TMDB API</p>
        <p style={{ marginTop: '6px', fontSize: '0.8rem', color: 'var(--netflix-text-muted)' }}>
          Developed by Kumar_Gopal
        </p>
      </footer>
    </div>
  );
};

export default Favorites;
