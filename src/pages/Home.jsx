// src/pages/Home.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import MovieCard from '../components/MovieCard';

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
    response = await fetch(proxyUrl(url));
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.status_message || `HTTP error: ${response.status}`);
  }

  return response.json();
};

const BACKDROP_BASE = 'https://image.tmdb.org/t/p/original/';

// Genre sections to display
const GENRE_SECTIONS = [
  { id: 'trending', title: '🔥 Trending This Week', endpoint: '/trending/movie/week' },
  { id: 'top_rated', title: '⭐ Top Rated of All Time', endpoint: '/movie/top_rated' },
  { id: 'popular', title: '🎯 Popular Right Now', endpoint: '/movie/popular' },
  { id: 'romance', title: '💘 Romance', endpoint: '/discover/movie', genre: 10749 },
  { id: 'action', title: '💥 Action Packed', endpoint: '/discover/movie', genre: 28 },
  { id: 'war', title: '⚔️ War Movies', endpoint: '/discover/movie', genre: 10752 },
  { id: 'scifi', title: '🚀 Sci-Fi Adventures', endpoint: '/discover/movie', genre: 878 },
  { id: 'comedy', title: '😂 Comedy', endpoint: '/discover/movie', genre: 35 },
  { id: 'horror', title: '🔪 Horror & Thriller', endpoint: '/discover/movie', genre: 27 },
  { id: 'animation', title: '🎨 Animation', endpoint: '/discover/movie', genre: 16 },
  { id: 'drama', title: '🎭 Drama', endpoint: '/discover/movie', genre: 18 },
  { id: 'mystery', title: '🔍 Mystery & Crime', endpoint: '/discover/movie', genre: 80 },
  { id: 'fantasy', title: '🧙 Fantasy', endpoint: '/discover/movie', genre: 14 },
  { id: 'documentary', title: '📽️ Documentaries', endpoint: '/discover/movie', genre: 99 },
  { id: 'family', title: '👨‍👩‍👧‍👦 Family Friendly', endpoint: '/discover/movie', genre: 10751 },
];

// Individual MovieRow component with horizontal scroll
const MovieRow = ({ title, movies, onSelectMovie, onToggleFavorite, favorites, delay = 0 }) => {
  const sliderRef = useRef(null);

  const scroll = (direction) => {
    if (sliderRef.current) {
      const scrollAmount = sliderRef.current.clientWidth * 0.75;
      sliderRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (!movies || movies.length === 0) return null;

  return (
    <div className="movie-row" style={{ marginTop: 0, animationDelay: `${delay}s` }}>
      <div className="row-title">
        {title}
        <span className="explore-arrow">Explore All →</span>
      </div>
      <div style={{ position: 'relative' }}>
        {/* Left scroll button */}
        <button
          onClick={() => scroll('left')}
          aria-label="Scroll left"
          style={{
            position: 'absolute', left: '-16px', top: '50%', transform: 'translateY(-70%)',
            zIndex: 30, width: '40px', height: '90%', maxHeight: '340px',
            background: 'linear-gradient(to right, rgba(20,20,20,0.9), transparent)',
            border: 'none', color: 'white', cursor: 'pointer', borderRadius: '4px 0 0 4px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: 0, transition: 'opacity 0.3s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
          onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <div className="movies-slider" ref={sliderRef}>
          {movies.map((movie, i) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onClick={onSelectMovie}
              onToggleFavorite={onToggleFavorite}
              isFavorite={favorites.some(fav => fav.id === movie.id)}
              index={i}
            />
          ))}
        </div>

        {/* Right scroll button */}
        <button
          onClick={() => scroll('right')}
          aria-label="Scroll right"
          style={{
            position: 'absolute', right: '-16px', top: '50%', transform: 'translateY(-70%)',
            zIndex: 30, width: '40px', height: '90%', maxHeight: '340px',
            background: 'linear-gradient(to left, rgba(20,20,20,0.9), transparent)',
            border: 'none', color: 'white', cursor: 'pointer', borderRadius: '0 4px 4px 0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: 0, transition: 'opacity 0.3s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
          onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
    </div>
  );
};

const Home = ({ onSelectMovie, favorites, onToggleFavorite }) => {
  const [sections, setSections] = useState({});
  const [searchResults, setSearchResults] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [heroMovie, setHeroMovie] = useState(null);
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroTransition, setHeroTransition] = useState(true);

  // Build TMDB URL for each section
  const buildUrl = useCallback((section) => {
    let url = `${TMDB_BASE_URL}${section.endpoint}?api_key=${TMDB_API_KEY}`;
    if (section.genre) {
      url += `&with_genres=${section.genre}&sort_by=popularity.desc&vote_count.gte=100`;
    }
    return url;
  }, []);

  // Fetch all sections
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch all sections in parallel
        const results = await Promise.allSettled(
          GENRE_SECTIONS.map(section => fetchTMDB(buildUrl(section)))
        );

        const newSections = {};
        results.forEach((result, index) => {
          const section = GENRE_SECTIONS[index];
          if (result.status === 'fulfilled' && result.value.results?.length > 0) {
            newSections[section.id] = result.value.results;
          }
        });

        setSections(newSections);

        // Set hero movie from trending
        const trending = newSections.trending || [];
        if (trending.length > 0) {
          const heroOptions = trending.filter(m => m.backdrop_path && m.overview).slice(0, 8);
          const randomIndex = Math.floor(Math.random() * heroOptions.length);
          setHeroIndex(randomIndex);
          setHeroMovie(heroOptions[randomIndex]);
        }
      } catch (err) {
        console.error('Failed to fetch movies:', err);
        setError(`Failed to load movies: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [buildUrl]);

  // Auto-rotate hero every 8 seconds
  useEffect(() => {
    const trending = sections.trending || [];
    const heroOptions = trending.filter(m => m.backdrop_path && m.overview).slice(0, 8);
    if (heroOptions.length <= 1) return;

    const interval = setInterval(() => {
      setHeroTransition(false);
      setTimeout(() => {
        setHeroIndex(prev => {
          const next = (prev + 1) % heroOptions.length;
          setHeroMovie(heroOptions[next]);
          return next;
        });
        setHeroTransition(true);
      }, 500);
    }, 8000);

    return () => clearInterval(interval);
  }, [sections.trending]);

  // Handle search
  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }

    setLoading(true);
    try {
      const data = await fetchTMDB(
        `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`
      );
      setSearchResults(data.results || []);
    } catch (err) {
      console.error('Failed to search:', err);
      setError(`Search failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleSearch(searchTerm);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (!value.trim()) setSearchResults(null);
  };

  // Initial loading
  if (loading && Object.keys(sections).length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="loading-spinner" style={{ margin: '0 auto 20px' }}></div>
          <p style={{ color: 'var(--netflix-text-muted)', fontSize: '1rem' }}>Loading MovieVerse...</p>
        </div>
      </div>
    );
  }

  // Full error
  if (error && Object.keys(sections).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8" style={{ minHeight: '80vh' }}>
        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🎬</div>
        <p style={{ color: 'var(--netflix-red)', fontSize: '1.2rem', marginBottom: '12px', fontWeight: 600 }}>
          {error}
        </p>
        <p style={{ color: 'var(--netflix-text-muted)', marginBottom: '24px' }}>
          Please check your internet connection and try again.
        </p>
        <button className="btn-netflix" onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    );
  }

  // Search results view
  if (searchResults !== null) {
    return (
      <div style={{ paddingTop: '80px', minHeight: '100vh' }}>
        <div style={{ padding: '20px 4% 30px' }}>
          <form onSubmit={handleSearchSubmit} className="search-container" style={{ maxWidth: '600px' }}>
            <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder="Search for movies, shows..."
              value={searchTerm}
              onChange={handleSearchChange}
              autoFocus
            />
          </form>
        </div>

        <h2 className="section-title" style={{ marginBottom: '24px' }}>
          {searchResults.length > 0
            ? `Results for "${searchTerm}"`
            : `No results found for "${searchTerm}"`
          }
        </h2>

        {searchResults.length > 0 ? (
          <div className="movie-grid">
            {searchResults.map((movie, i) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onClick={onSelectMovie}
                onToggleFavorite={onToggleFavorite}
                isFavorite={favorites.some(fav => fav.id === movie.id)}
                index={i}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center" style={{ padding: '80px 20px', color: 'var(--netflix-text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔍</div>
            <p style={{ fontSize: '1.1rem' }}>Try searching for something else</p>
          </div>
        )}
      </div>
    );
  }

  // "Movies For You" - curated from available sections
  const moviesForYou = (() => {
    const all = [];
    ['action', 'scifi', 'drama', 'comedy', 'romance'].forEach(key => {
      if (sections[key]) {
        // Pick 4 random from each genre
        const shuffled = [...sections[key]].sort(() => 0.5 - Math.random());
        all.push(...shuffled.slice(0, 4));
      }
    });
    // Shuffle and return unique
    const unique = all.filter((m, i, arr) => arr.findIndex(x => x.id === m.id) === i);
    return unique.sort(() => 0.5 - Math.random()).slice(0, 20);
  })();

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* ===== HERO BANNER ===== */}
      {heroMovie && (
        <div className="hero-banner">
          <div
            className="hero-backdrop"
            style={{
              backgroundImage: `url(${BACKDROP_BASE}${heroMovie.backdrop_path})`,
              opacity: heroTransition ? 1 : 0,
              transition: 'opacity 0.8s ease-in-out, transform 8s ease-out'
            }}
          />
          <div className="hero-overlay" />
          <div className="hero-bottom-fade" />

          <div className="hero-content" style={{
            opacity: heroTransition ? 1 : 0,
            transform: heroTransition ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.8s ease-in-out'
          }}>
            <h1 className="hero-title">{heroMovie.title}</h1>

            <div className="hero-meta">
              <span className="hero-rating">
                <svg width="16" height="16" viewBox="0 0 20 20" fill="#46d369">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {heroMovie.vote_average?.toFixed(1)}
              </span>
              <span className="hero-year">{heroMovie.release_date?.substring(0, 4)}</span>
              <span style={{
                padding: '2px 8px', border: '1px solid rgba(255,255,255,0.4)',
                borderRadius: '3px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)'
              }}>HD</span>
            </div>

            <p className="hero-overview">{heroMovie.overview}</p>

            <div className="hero-buttons">
              <button className="btn-play" onClick={() => onSelectMovie(heroMovie.id)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4 2.69127C4 1.93067 4.81547 1.44851 5.48192 1.81506L22.4069 11.1238C23.0977 11.5037 23.0977 12.4963 22.4069 12.8762L5.48192 22.1849C4.81546 22.5515 4 22.0693 4 21.3087V2.69127Z" />
                </svg>
                View Details
              </button>
              <button className="btn-more-info" onClick={() => onToggleFavorite(heroMovie)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 4.5C7 -0.5 2 3.5 2 9C2 14 12 20.5 12 20.5C12 20.5 22 14 22 9C22 3.5 17 -0.5 12 4.5Z"
                    fill={favorites.some(f => f.id === heroMovie.id) ? 'currentColor' : 'none'}
                  />
                </svg>
                {favorites.some(f => f.id === heroMovie.id) ? 'Favorited' : 'My List'}
              </button>
            </div>

            {/* Hero indicator dots */}
            <div style={{ display: 'flex', gap: '6px', marginTop: '24px' }}>
              {(sections.trending || []).filter(m => m.backdrop_path && m.overview).slice(0, 8).map((_, i) => (
                <div key={i} style={{
                  width: i === heroIndex ? '24px' : '8px', height: '3px',
                  borderRadius: '2px', transition: 'all 0.5s',
                  background: i === heroIndex ? 'var(--netflix-red)' : 'rgba(255,255,255,0.3)'
                }} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== SEARCH BAR ===== */}
      <div style={{
        padding: heroMovie ? '0 4% 10px' : '100px 4% 10px',
        position: 'relative', zIndex: 20
      }}>
        <form onSubmit={handleSearchSubmit} className="search-container" style={{ maxWidth: '500px' }}>
          <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search movies, genres, actors..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </form>
      </div>

      {/* ===== MOVIE SECTIONS ===== */}
      <div style={{ marginTop: heroMovie ? '-40px' : '20px' }}>
        {/* Trending */}
        <MovieRow
          title="🔥 Trending This Week"
          movies={sections.trending}
          onSelectMovie={onSelectMovie}
          onToggleFavorite={onToggleFavorite}
          favorites={favorites}
        />

        {/* Movies For You */}
        {moviesForYou.length > 0 && (
          <MovieRow
            title="🎯 Movies For You"
            movies={moviesForYou}
            onSelectMovie={onSelectMovie}
            onToggleFavorite={onToggleFavorite}
            favorites={favorites}
          />
        )}

        {/* Top Rated */}
        <MovieRow
          title="⭐ Top Rated of All Time"
          movies={sections.top_rated}
          onSelectMovie={onSelectMovie}
          onToggleFavorite={onToggleFavorite}
          favorites={favorites}
        />

        {/* Popular */}
        <MovieRow
          title="📈 Popular Right Now"
          movies={sections.popular}
          onSelectMovie={onSelectMovie}
          onToggleFavorite={onToggleFavorite}
          favorites={favorites}
        />

        {/* Action */}
        <MovieRow
          title="💥 Action Packed"
          movies={sections.action}
          onSelectMovie={onSelectMovie}
          onToggleFavorite={onToggleFavorite}
          favorites={favorites}
        />

        {/* Romance */}
        <MovieRow
          title="💘 Romance"
          movies={sections.romance}
          onSelectMovie={onSelectMovie}
          onToggleFavorite={onToggleFavorite}
          favorites={favorites}
        />

        {/* War */}
        <MovieRow
          title="⚔️ War Movies"
          movies={sections.war}
          onSelectMovie={onSelectMovie}
          onToggleFavorite={onToggleFavorite}
          favorites={favorites}
        />

        {/* Sci-Fi */}
        <MovieRow
          title="🚀 Sci-Fi Adventures"
          movies={sections.scifi}
          onSelectMovie={onSelectMovie}
          onToggleFavorite={onToggleFavorite}
          favorites={favorites}
        />

        {/* Comedy */}
        <MovieRow
          title="😂 Comedy"
          movies={sections.comedy}
          onSelectMovie={onSelectMovie}
          onToggleFavorite={onToggleFavorite}
          favorites={favorites}
        />

        {/* Horror */}
        <MovieRow
          title="🔪 Horror & Thriller"
          movies={sections.horror}
          onSelectMovie={onSelectMovie}
          onToggleFavorite={onToggleFavorite}
          favorites={favorites}
        />

        {/* Animation */}
        <MovieRow
          title="🎨 Animation"
          movies={sections.animation}
          onSelectMovie={onSelectMovie}
          onToggleFavorite={onToggleFavorite}
          favorites={favorites}
        />

        {/* Drama */}
        <MovieRow
          title="🎭 Drama"
          movies={sections.drama}
          onSelectMovie={onSelectMovie}
          onToggleFavorite={onToggleFavorite}
          favorites={favorites}
        />

        {/* Mystery & Crime */}
        <MovieRow
          title="🔍 Mystery & Crime"
          movies={sections.mystery}
          onSelectMovie={onSelectMovie}
          onToggleFavorite={onToggleFavorite}
          favorites={favorites}
        />

        {/* Fantasy */}
        <MovieRow
          title="🧙 Fantasy"
          movies={sections.fantasy}
          onSelectMovie={onSelectMovie}
          onToggleFavorite={onToggleFavorite}
          favorites={favorites}
        />

        {/* Documentary */}
        <MovieRow
          title="📽️ Documentaries"
          movies={sections.documentary}
          onSelectMovie={onSelectMovie}
          onToggleFavorite={onToggleFavorite}
          favorites={favorites}
        />

        {/* Family */}
        <MovieRow
          title="👨‍👩‍👧‍👦 Family Friendly"
          movies={sections.family}
          onSelectMovie={onSelectMovie}
          onToggleFavorite={onToggleFavorite}
          favorites={favorites}
        />
      </div>

      {/* Footer */}
      <footer className="netflix-footer">
        <div style={{ marginBottom: '16px' }}>
          <span style={{ color: 'var(--netflix-red)', fontWeight: '800', fontSize: '1.2rem', letterSpacing: '-0.5px' }}>
            MovieVerse
          </span>
        </div>
        <p>Your universe of movies — Powered by TMDB API</p>
        <p style={{ marginTop: '8px', fontSize: '0.8rem' }}>
          © {new Date().getFullYear()} MovieVerse. All rights reserved.
        </p>
        <p style={{ marginTop: '6px', fontSize: '0.8rem', color: 'var(--netflix-text-muted)' }}>
          Developed by Kumar_Gopal
        </p>
      </footer>
    </div>
  );
};

export default Home;
