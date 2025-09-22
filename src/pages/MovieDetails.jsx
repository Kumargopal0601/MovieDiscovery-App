// src/pages/MovieDetail.jsx
import React, { useState, useEffect } from 'react';

/**
 * MovieDetail Component
 * Displays detailed information for a single movie.
 *
 * Props:
 * - movieId: The ID of the movie to display.
 * - onBack: Callback function to navigate back to the previous page (e.g., Home).
 * - onToggleFavorite: Callback function to add/remove the movie from favorites.
 * - isFavorite: Boolean indicating if the movie is currently a favorite.
 */
const MovieDetail = ({ movieId, onBack, onToggleFavorite, isFavorite }) => {
  const [movie, setMovie] = useState(null); // State to store movie details
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  // IMPORTANT: For local development, use process.env.REACT_APP_TMDB_API_KEY.
  // This value will be read from your .env file in the project root.
  const API_KEY = process.env.REACT_APP_TMDB_API_KEY;
  const BASE_URL = 'https://api.themoviedb.org/3';
  const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500/';
  const BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/w1280/';
  const PLACEHOLDER_IMAGE_URL = 'https://placehold.co/300x450/1F2937/F3F4F6?text=No+Image';
  const PLACEHOLDER_BACKDROP_URL = 'https://placehold.co/1280x720/1F2937/F3F4F6?text=No+Backdrop';


  // Fetch movie details when movieId changes
  useEffect(() => {
    const fetchMovieDetails = async () => {
      if (!API_KEY) {
        setError("TMDb API Key is missing. Please set REACT_APP_TMDB_API_KEY in your .env file.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        // Fetch movie details
        const movieResponse = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}`);
        if (!movieResponse.ok) {
          const errorData = await movieResponse.json().catch(() => ({}));
          throw new Error(`HTTP error! Status: ${movieResponse.status}. Message: ${errorData.status_message || 'Unknown error'}`);
        }
        const movieData = await movieResponse.json();
        setMovie(movieData);
      } catch (err) {
        console.error("Failed to fetch movie details:", err);
        setError(`Failed to load movie details: ${err.message}. Please check your API key and internet connection.`);
      } finally {
        setLoading(false);
      }
    };

    if (movieId) {
      fetchMovieDetails();
    }
  }, [movieId, API_KEY]); // Re-fetch if movieId or API_KEY changes

  // Display loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl text-blue-400">Loading movie details...</p>
      </div>
    );
  }

  // Display error state
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-4">
        <p className="text-xl text-red-500 mb-4">{error}</p>
        <button
          onClick={onBack}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Display message if no movie data
  if (!movie) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-4">
        <p className="text-xl text-gray-400 mb-4">No movie selected or found.</p>
        <button
          onClick={onBack}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Determine backdrop image URL
  const backdropUrl = movie.backdrop_path
    ? `${BACKDROP_BASE_URL}${movie.backdrop_path}`
    : PLACEHOLDER_BACKDROP_URL;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="mb-6 flex items-center px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200 shadow-md"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        Back to Home
      </button>

      {/* Movie Detail Card with Backdrop */}
      <div
        className="relative bg-gray-800 rounded-lg shadow-xl overflow-hidden"
        style={{
          backgroundImage: `url(${backdropUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Overlay to darken backdrop and improve text readability */}
        <div className="absolute inset-0 bg-black opacity-70"></div>

        <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-8">
          {/* Movie Poster */}
          <div className="flex-shrink-0 w-48 md:w-64 lg:w-80">
            <img
              src={movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : PLACEHOLDER_IMAGE_URL}
              alt={movie.title}
              className="w-full h-auto object-cover rounded-lg shadow-lg"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = PLACEHOLDER_IMAGE_URL;
              }}
            />
          </div>

          {/* Movie Information */}
          <div className="flex-grow text-center md:text-left">
            {/* Title and Favorite Button */}
            <div className="flex flex-col sm:flex-row items-center sm:justify-between mb-4">
              <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-2 sm:mb-0">
                {movie.title}
              </h1>
              <button
                className={`
                  p-3 rounded-full shadow-md
                  transition-all duration-300 ease-in-out
                  ${isFavorite ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'}
                  focus:outline-none focus:ring-2 focus:ring-offset-2
                  ${isFavorite ? 'focus:ring-red-500' : 'focus:ring-gray-500'}
                `}
                onClick={() => onToggleFavorite(movie)}
                aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            {/* Tagline */}
            {movie.tagline && (
              <p className="text-lg text-gray-400 italic mb-4">{movie.tagline}</p>
            )}

            {/* Overview */}
            <p className="text-gray-300 mb-6 leading-relaxed">
              {movie.overview || 'No overview available.'}
            </p>

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-300 mb-6">
              <div>
                <p className="font-semibold text-gray-200">Release Date:</p>
                <p>{movie.release_date || 'N/A'}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-200">Runtime:</p>
                <p>{movie.runtime ? `${movie.runtime} minutes` : 'N/A'}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-200">Rating:</p>
                <p>{movie.vote_average ? `${movie.vote_average.toFixed(1)} / 10 (${movie.vote_count} votes)` : 'N/A'}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-200">Genres:</p>
                <p>
                  {movie.genres && movie.genres.length > 0
                    ? movie.genres.map((genre) => genre.name).join(', ')
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="font-semibold text-gray-200">Budget:</p>
                <p>
                  {movie.budget > 0
                    ? `$${movie.budget.toLocaleString()}`
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="font-semibold text-gray-200">Revenue:</p>
                <p>
                  {movie.revenue > 0
                    ? `$${movie.revenue.toLocaleString()}`
                    : 'N/A'}
                </p>
              </div>
            </div>

            {/* External Links (if available) */}
            {(movie.homepage || movie.imdb_id) && (
              <div className="flex flex-wrap gap-4 mt-6">
                {movie.homepage && (
                  <a
                    href={movie.homepage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 transition-colors duration-200 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                    </svg>
                    Homepage
                  </a>
                )}
                {movie.imdb_id && (
                  <a
                    href={`https://www.imdb.com/title/${movie.imdb_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2 bg-yellow-600 text-white font-semibold rounded-lg shadow-md hover:bg-yellow-700 transition-colors duration-200 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l3 3a1 1 0 001.414-1.414L11.414 10H15a1 1 0 100-2h-4V6z" clipRule="evenodd" />
                    </svg>
                    IMDb
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;
