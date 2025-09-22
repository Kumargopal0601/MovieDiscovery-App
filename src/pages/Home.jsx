// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import MovieCard from '../components/MovieCard';

/**
 * Home Page Component
 * Displays a search bar, trending movies, and allows navigation to movie details.
 *
 * Props:
 * - onSelectMovie: Callback function to navigate to movie detail page.
 * - favorites: Array of favorite movie objects.
 * - onToggleFavorite: Callback function to add/remove movies from favorites.
 */
const Home = ({ onSelectMovie, favorites, onToggleFavorite }) => {
  const [movies, setMovies] = useState([]); // State to store fetched movies
  const [searchTerm, setSearchTerm] = useState(''); // State for search input
  const [loading, setLoading] = useState(false); // Loading state for API calls
  const [error, setError] = useState(null); // Error state for API calls
  const [searchFocused, setSearchFocused] = useState(false);

  // IMPORTANT: For local development, use process.env.REACT_APP_TMDB_API_KEY.
  // Create a .env file in your project root (MovieDiscoveryApp/) and add:
  // REACT_APP_TMDB_API_KEY=YOUR_ACTUAL_TMDB_API_KEY_HERE
  const API_KEY = process.env.REACT_APP_TMDB_API_KEY;
  const BASE_URL = 'https://api.themoviedb.org/3';

  // Function to fetch movies based on a query or trending
  const fetchMovies = async (query = '') => {
    if (!API_KEY) {
      setError("TMDb API Key is missing. Please set REACT_APP_TMDB_API_KEY in your .env file.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      let url;
      if (query) {
        // Search for movies if a search term is provided
        url = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`;
      } else {
        // Fetch trending movies if no search term
        url = `${BASE_URL}/trending/movie/week?api_key=${API_KEY}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        // Attempt to read error message from response body if available
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP error! Status: ${response.status}. Message: ${errorData.status_message || 'Unknown error'}`);
      }
      const data = await response.json();
      setMovies(data.results || []); // Update movies state with results
    } catch (err) {
      console.error("Failed to fetch movies:", err);
      setError(`Failed to load movies: ${err.message}. Please check your API key and internet connection.`);
      setMovies([]); // Clear movies on error
    } finally {
      setLoading(false); // End loading
    }
  };

  // Fetch trending movies on component mount
  useEffect(() => {
    fetchMovies();
  }, []); // Empty dependency array means this runs once on mount

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    fetchMovies(searchTerm); // Fetch movies based on the search term
  };

  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
      {/* Hero Section */}
      <div className="text-center mb-16 animate-slide-in-up">
        <h1 className="text-6xl md:text-7xl font-bold gradient-text mb-6 animate-float">
          Discover Movies
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed animate-slide-in-up stagger-1">
          Explore the world of cinema with our curated collection of trending movies and timeless classics.
        </p>
      </div>

      {/* Search Bar Section */}
      <form onSubmit={handleSearchSubmit} className="mb-16 flex flex-col sm:flex-row items-center justify-center gap-6 animate-slide-in-up stagger-2">
        <div className="relative w-full sm:w-2/3 md:w-1/2 lg:w-1/3">
          <input
            type="text"
            placeholder="Search for movies..."
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className={`w-full p-4 rounded-2xl glass-dark text-white border-2 transition-all duration-300 focus:outline-none ${
              searchFocused 
                ? 'border-blue-500 shadow-lg shadow-blue-500/25 scale-105' 
                : 'border-white/20 hover:border-white/40'
            }`}
            aria-label="Movie search input"
          />
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
        </div>
        <button
          type="submit"
          className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-blue-500/25 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
        >
          <span className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search
          </span>
        </button>
      </form>

      {/* Loading and Error Messages */}
      {loading && (
        <div className="text-center my-16 animate-fade-in">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-blue-400 text-xl font-semibold">Loading movies...</p>
        </div>
      )}
      {error && (
        <div className="text-center my-16 animate-slide-in-up">
          <div className="glass-dark p-8 rounded-2xl max-w-md mx-auto border border-red-500/30">
            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-red-400 text-lg font-semibold">{error}</p>
          </div>
        </div>
      )}
      {!loading && !error && movies.length === 0 && searchTerm && (
        <div className="text-center my-16 animate-slide-in-up">
          <div className="glass-dark p-8 rounded-2xl max-w-md mx-auto">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-gray-400 text-xl">No movies found for "{searchTerm}"</p>
            <p className="text-gray-500 mt-2">Try searching with different keywords</p>
          </div>
        </div>
      )}
      {!loading && !error && movies.length === 0 && !searchTerm && (
        <div className="text-center my-16 animate-slide-in-up">
          <div className="glass-dark p-8 rounded-2xl max-w-md mx-auto">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h4a1 1 0 011 1v2h4a1 1 0 011 1v1a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1h4z" />
            </svg>
            <p className="text-gray-400 text-xl">No trending movies available</p>
          </div>
        </div>
      )}

      {/* Movie Grid */}
      {movies.length > 0 && (
        <div className="mb-8 animate-slide-in-up stagger-3">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            {searchTerm ? `Search Results for "${searchTerm}"` : 'Trending Movies'}
          </h2>
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
        {movies.map((movie, index) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            onClick={onSelectMovie} // Pass movie ID to parent for detail view
            onToggleFavorite={onToggleFavorite} // Pass toggle favorite function
            isFavorite={favorites.some((fav) => fav.id === movie.id)} // Check if movie is a favorite
            style={{
              animationDelay: `${index * 0.1}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Home;
