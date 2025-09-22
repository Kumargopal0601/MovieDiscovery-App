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
    <div className="container mx-auto px-4 py-8">
      {/* Search Bar Section */}
      <form onSubmit={handleSearchSubmit} className="mb-8 flex flex-col sm:flex-row items-center justify-center gap-4">
        <input
          type="text"
          placeholder="Search for movies..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full sm:w-2/3 md:w-1/2 lg:w-1/3 p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
          aria-label="Movie search input"
        />
        <button
          type="submit"
          className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors duration-200"
        >
          Search
        </button>
      </form>

      {/* Loading and Error Messages */}
      {loading && (
        <p className="text-center text-blue-400 text-xl my-8">Loading movies...</p>
      )}
      {error && (
        <p className="text-center text-red-500 text-xl my-8">{error}</p>
      )}
      {!loading && !error && movies.length === 0 && searchTerm && (
        <p className="text-center text-gray-400 text-xl my-8">No movies found for "{searchTerm}".</p>
      )}
      {!loading && !error && movies.length === 0 && !searchTerm && (
        <p className="text-center text-gray-400 text-xl my-8">No trending movies available.</p>
      )}

      {/* Movie Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {movies.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            onClick={onSelectMovie} // Pass movie ID to parent for detail view
            onToggleFavorite={onToggleFavorite} // Pass toggle favorite function
            isFavorite={favorites.some((fav) => fav.id === movie.id)} // Check if movie is a favorite
          />
        ))}
      </div>
    </div>
  );
};

export default Home;
