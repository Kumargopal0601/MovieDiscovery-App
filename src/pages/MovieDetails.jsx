// src/pages/MovieDetails.jsx
import React, { useState, useEffect } from 'react';

const TMDB_API_KEY = process.env.REACT_APP_TMDB_API_KEY || 'b537a2a6458becf6aed33e3fc3dee208';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// CORS proxy to bypass network restrictions blocking TMDB
const CORS_PROXY = 'https://corsproxy.io/?';
const proxyUrl = (url) => `${CORS_PROXY}${encodeURIComponent(url)}`;

const fetchTMDB = async (url) => {
  let response;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
  } catch (directErr) {
    console.warn('Direct TMDB blocked, using CORS proxy');
    response = await fetch(proxyUrl(url));
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.status_message || `HTTP error: ${response.status}`);
  }

  return response.json();
};

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500/';
const BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/original/';
const PLACEHOLDER_IMAGE_URL = 'https://placehold.co/300x450/181818/333333?text=No+Image';

const MovieDetail = ({ movieId, onBackClick, onToggleFavorite, isFavorite, favorites, onBookTickets }) => {
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const movieData = await fetchTMDB(
          `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos,similar`
        );
        setMovie(movieData);
      } catch (err) {
        console.error('Failed to fetch movie details:', err);
        setError(`Failed to load movie details: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (movieId) fetchMovieDetails();
  }, [movieId]);

  const checkIsFavorite = () => {
    if (!movie || !favorites) return false;
    return favorites.some(fav => fav.id === movie.id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '100vh' }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center" style={{ minHeight: '80vh', padding: '20px' }}>
        <p style={{ color: 'var(--netflix-red)', fontSize: '1.2rem', marginBottom: '20px' }}>{error}</p>
        <button className="btn-netflix" onClick={onBackClick}>Go Back</button>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="flex flex-col items-center justify-center" style={{ minHeight: '80vh', padding: '20px' }}>
        <p style={{ color: 'var(--netflix-text-muted)', fontSize: '1.2rem', marginBottom: '20px' }}>No movie found.</p>
        <button className="btn-netflix" onClick={onBackClick}>Go Back</button>
      </div>
    );
  }

  const movieIsFavorite = checkIsFavorite();
  const backdropUrl = movie.backdrop_path
    ? `${BACKDROP_BASE_URL}${movie.backdrop_path}`
    : null;

  const matchPercent = movie.vote_average ? Math.round(movie.vote_average * 10) : null;

  // Find trailer
  const trailer = movie.videos?.results?.find(
    v => v.type === 'Trailer' && v.site === 'YouTube'
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--netflix-dark)' }} className="animate-fade-in">
      {/* ===== BACKDROP HERO ===== */}
      <div style={{
        position: 'relative',
        width: '100%',
        minHeight: '70vh',
        backgroundImage: backdropUrl ? `url(${backdropUrl})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center 20%',
        backgroundColor: '#181818'
      }}>
        {/* Overlays */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to right, rgba(20,20,20,0.95) 0%, rgba(20,20,20,0.6) 40%, rgba(20,20,20,0.2) 100%)'
        }} />
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '250px',
          background: 'linear-gradient(to top, var(--netflix-dark) 0%, transparent 100%)'
        }} />

        {/* Back button */}
        <button
          onClick={onBackClick}
          style={{
            position: 'absolute', top: '80px', left: '4%', zIndex: 20,
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'rgba(0,0,0,0.6)', border: 'none', color: 'white',
            padding: '10px 20px', borderRadius: '6px', cursor: 'pointer',
            fontSize: '0.9rem', fontWeight: '600', fontFamily: 'inherit',
            backdropFilter: 'blur(10px)', transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.6)'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back
        </button>

        {/* Content */}
        <div style={{
          position: 'relative', zIndex: 10, padding: '140px 4% 60px',
          display: 'flex', gap: '40px', alignItems: 'flex-end', flexWrap: 'wrap'
        }}>
          {/* Poster */}
          <div className="animate-fade-in-up" style={{ flexShrink: 0 }}>
            <img
              src={movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : PLACEHOLDER_IMAGE_URL}
              alt={movie.title}
              style={{
                width: '260px', borderRadius: '8px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                transition: 'transform 0.5s'
              }}
              onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_IMAGE_URL; }}
            />
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: '300px', paddingBottom: '20px' }}>
            <h1 className="animate-text-reveal" style={{
              fontSize: '3rem', fontWeight: '900', lineHeight: 1.1,
              marginBottom: '12px', textShadow: '2px 4px 12px rgba(0,0,0,0.7)'
            }}>
              {movie.title}
            </h1>

            {movie.tagline && (
              <p style={{ color: 'var(--netflix-text-muted)', fontStyle: 'italic', marginBottom: '16px', fontSize: '1.1rem' }}>
                "{movie.tagline}"
              </p>
            )}

            {/* Meta Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
              {matchPercent && (
                <span style={{ color: '#46d369', fontWeight: '700', fontSize: '1rem' }}>
                  {matchPercent}% Match
                </span>
              )}
              <span style={{ color: 'var(--netflix-text-muted)' }}>
                {movie.release_date?.substring(0, 4)}
              </span>
              {movie.runtime > 0 && (
                <span style={{ color: 'var(--netflix-text-muted)' }}>
                  {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                </span>
              )}
              <span style={{
                padding: '2px 8px', border: '1px solid rgba(255,255,255,0.4)',
                borderRadius: '3px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)'
              }}>
                HD
              </span>
            </div>

            {/* Genres */}
            {movie.genres?.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                {movie.genres.map(genre => (
                  <span key={genre.id} style={{
                    padding: '4px 14px', background: 'rgba(255,255,255,0.08)',
                    borderRadius: '20px', fontSize: '0.85rem', color: 'var(--netflix-text)',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    {genre.name}
                  </span>
                ))}
              </div>
            )}

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
              {trailer && (
                <a
                  href={`https://www.youtube.com/watch?v=${trailer.key}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-play"
                  style={{ textDecoration: 'none' }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M4 2.69127C4 1.93067 4.81547 1.44851 5.48192 1.81506L22.4069 11.1238C23.0977 11.5037 23.0977 12.4963 22.4069 12.8762L5.48192 22.1849C4.81546 22.5515 4 22.0693 4 21.3087V2.69127Z" />
                  </svg>
                  Play Trailer
                </a>
              )}
              <button
                className={movieIsFavorite ? 'btn-netflix' : 'btn-more-info'}
                onClick={() => onToggleFavorite(movie)}
                style={movieIsFavorite ? { background: 'var(--netflix-red)' } : {}}
              >
                <svg width="18" height="18" viewBox="0 0 24 24"
                  fill={movieIsFavorite ? 'currentColor' : 'none'}
                  stroke="currentColor" strokeWidth="2"
                >
                  <path d="M12 4.5C7 -0.5 2 3.5 2 9C2 14 12 20.5 12 20.5C12 20.5 22 14 22 9C22 3.5 17 -0.5 12 4.5Z" />
                </svg>
                {movieIsFavorite ? 'Remove from List' : 'Add to My List'}
              </button>
              <button
                className="btn-netflix"
                onClick={() => onBookTickets && onBookTickets(movie)}
                style={{ background: 'linear-gradient(135deg, #e50914, #b20710)', boxShadow: '0 4px 20px rgba(229,9,20,0.3)' }}
              >
                🎟️ Book Tickets
              </button>
            </div>

            {/* Overview */}
            <p style={{ fontSize: '1.05rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.85)', maxWidth: '700px' }}>
              {movie.overview || 'No overview available.'}
            </p>
          </div>
        </div>
      </div>

      {/* ===== DETAILS SECTION ===== */}
      <div style={{ padding: '40px 4%' }}>
        {/* Stats Grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '24px', marginBottom: '50px'
        }}>
          {[
            { label: 'Rating', value: movie.vote_average ? `⭐ ${movie.vote_average.toFixed(1)} / 10` : 'N/A', sub: movie.vote_count ? `${movie.vote_count.toLocaleString()} votes` : '' },
            { label: 'Budget', value: movie.budget > 0 ? `$${(movie.budget / 1000000).toFixed(0)}M` : 'N/A' },
            { label: 'Revenue', value: movie.revenue > 0 ? `$${(movie.revenue / 1000000).toFixed(0)}M` : 'N/A' },
            { label: 'Status', value: movie.status || 'N/A' },
          ].map((stat, i) => (
            <div key={i} className="animate-fade-in-up" style={{
              animationDelay: `${i * 0.1}s`,
              background: 'rgba(255,255,255,0.04)', borderRadius: '12px',
              padding: '20px', border: '1px solid var(--netflix-border)'
            }}>
              <div style={{ color: 'var(--netflix-text-muted)', fontSize: '0.85rem', marginBottom: '6px', fontWeight: '500' }}>
                {stat.label}
              </div>
              <div style={{ fontSize: '1.3rem', fontWeight: '700', color: 'white' }}>
                {stat.value}
              </div>
              {stat.sub && (
                <div style={{ fontSize: '0.8rem', color: 'var(--netflix-text-muted)', marginTop: '4px' }}>
                  {stat.sub}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Cast */}
        {movie.credits?.cast?.length > 0 && (
          <div style={{ marginBottom: '50px' }}>
            <h2 className="section-title" style={{ padding: 0, marginBottom: '20px' }}>Top Cast</h2>
            <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '16px', scrollbarWidth: 'none' }}>
              {movie.credits.cast.slice(0, 10).map((actor, i) => (
                <div key={actor.id} className="animate-fade-in-up" style={{
                  animationDelay: `${i * 0.05}s`,
                  flexShrink: 0, width: '130px', textAlign: 'center'
                }}>
                  {actor.profile_path ? (
                    <img
                      src={`${IMAGE_BASE_URL}${actor.profile_path}`}
                      alt={actor.name}
                      style={{
                        width: '100px', height: '100px', borderRadius: '50%',
                        objectFit: 'cover', margin: '0 auto 10px',
                        border: '3px solid rgba(255,255,255,0.1)',
                        transition: 'all 0.3s'
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '100px', height: '100px', borderRadius: '50%',
                      background: 'rgba(255,255,255,0.08)', margin: '0 auto 10px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.8rem', color: 'var(--netflix-text-muted)',
                      border: '3px solid rgba(255,255,255,0.1)'
                    }}>
                      {actor.name.charAt(0)}
                    </div>
                  )}
                  <p style={{ fontSize: '0.85rem', fontWeight: '600', color: 'white', marginBottom: '2px' }}>
                    {actor.name}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--netflix-text-muted)' }}>
                    {actor.character}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Similar Movies */}
        {movie.similar?.results?.length > 0 && (
          <div style={{ marginBottom: '40px' }}>
            <h2 className="section-title" style={{ padding: 0, marginBottom: '20px' }}>More Like This</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
              {movie.similar.results.slice(0, 8).map((similar, i) => (
                <div
                  key={similar.id}
                  className="animate-fade-in-up"
                  style={{
                    animationDelay: `${i * 0.05}s`,
                    cursor: 'pointer', borderRadius: '8px', overflow: 'hidden',
                    background: '#181818', transition: 'transform 0.3s, box-shadow 0.3s'
                  }}
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    // Small delay to let scroll start
                    setTimeout(() => {
                      // This triggers a re-render with new movieId
                      if (onBackClick) onBackClick();
                      setTimeout(() => {
                        // Navigate to the new movie
                        const event = new CustomEvent('navigateToMovie', { detail: similar.id });
                        window.dispatchEvent(event);
                      }, 100);
                    }, 200);
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <img
                    src={similar.poster_path ? `${IMAGE_BASE_URL}${similar.poster_path}` : PLACEHOLDER_IMAGE_URL}
                    alt={similar.title}
                    style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover' }}
                  />
                  <div style={{ padding: '12px' }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: '600', color: 'white', marginBottom: '4px',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                    }}>
                      {similar.title}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {similar.vote_average > 0 && (
                        <span style={{ color: '#46d369', fontSize: '0.8rem', fontWeight: '600' }}>
                          {Math.round(similar.vote_average * 10)}%
                        </span>
                      )}
                      <span style={{ color: 'var(--netflix-text-muted)', fontSize: '0.8rem' }}>
                        {similar.release_date?.substring(0, 4)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* External Links */}
        {(movie.homepage || movie.imdb_id) && (
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {movie.homepage && (
              <a href={movie.homepage} target="_blank" rel="noopener noreferrer" className="btn-ghost" style={{ textDecoration: 'none' }}>
                🌐 Official Website
              </a>
            )}
            {movie.imdb_id && (
              <a href={`https://www.imdb.com/title/${movie.imdb_id}`} target="_blank" rel="noopener noreferrer" className="btn-ghost" style={{ textDecoration: 'none' }}>
                ⭐ IMDb Page
              </a>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="netflix-footer">
        <p>MovieVerse — Powered by TMDB API</p>
        <p style={{ marginTop: '6px', fontSize: '0.8rem', color: 'var(--netflix-text-muted)' }}>
          Developed by Kumar_Gopal
        </p>
      </footer>
    </div>
  );
};

export default MovieDetail;
