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
  const [imageLoaded, setImageLoaded] = useState(false);

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
      <div className="flex justify-center items-center min-h-screen animate-fade-in">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-6"></div>
          <p className="text-2xl text-blue-400 font-semibold">Loading movie details...</p>
          <p className="text-gray-400 mt-2">Preparing your cinematic experience</p>
        </div>
      </div>
    );
  }

  // Display error state
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-4 animate-fade-in">
        <div className="glass-dark p-12 rounded-3xl max-w-lg text-center">
          <svg className="w-20 h-20 text-red-500 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-xl text-red-400 mb-6 font-semibold">{error}</p>
          <button
            onClick={onBack}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            <span className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Go Back
            </span>
          </button>
        </div>
      </div>
    );
  }

  // Display message if no movie data
  if (!movie) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-4 animate-fade-in">
        <div className="glass-dark p-12 rounded-3xl max-w-lg text-center">
          <svg className="w-20 h-20 text-gray-400 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.175-5.5-2.709" />
          </svg>
          <p className="text-xl text-gray-400 mb-6">No movie selected or found.</p>
          <button
            onClick={onBack}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            <span className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Go Back
            </span>
          </button>
        </div>
      </div>
    );
  }

  // Determine backdrop image URL
  const backdropUrl = movie.backdrop_path
    ? `${BACKDROP_BASE_URL}${movie.backdrop_path}`
    : PLACEHOLDER_BACKDROP_URL;

  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="mb-8 flex items-center px-6 py-3 glass-dark text-white rounded-2xl hover:bg-white/20 transition-all duration-300 shadow-xl transform hover:scale-105 animate-slide-in-left"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        <span className="font-semibold">Back to Home</span>
      </button>

      {/* Movie Detail Card with Backdrop */}
      <div
        className="relative glass-dark rounded-3xl shadow-2xl overflow-hidden animate-scale-in"
        style={{
          backgroundImage: `url(${backdropUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Overlay to darken backdrop and improve text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/80"></div>
        
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-gradient"></div>

        <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center md:items-start gap-12">
          {/* Movie Poster */}
          <div className="flex-shrink-0 w-64 md:w-80 lg:w-96 animate-slide-in-left">
            {!imageLoaded && (
              <div className="w-full h-96 md:h-[480px] lg:h-[576px] bg-gray-700 rounded-2xl animate-shimmer"></div>
            )}
            <img
              src={movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : PLACEHOLDER_IMAGE_URL}
              alt={movie.title}
              className={`w-full h-auto object-cover rounded-2xl shadow-2xl transition-all duration-700 hover:scale-105 ${
                imageLoaded ? 'opacity-100' : 'opacity-0 absolute'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = PLACEHOLDER_IMAGE_URL;
                setImageLoaded(true);
              }}
            />
          </div>

          {/* Movie Information */}
          <div className="flex-grow text-center md:text-left animate-slide-in-right">
            {/* Title and Favorite Button */}
            <div className="flex flex-col sm:flex-row items-center sm:justify-between mb-8">
              <h1 className="text-4xl md:text-6xl font-bold gradient-text leading-tight mb-4 sm:mb-0 animate-slide-in-up">
                {movie.title}
              </h1>
              <button
                className={`p-4 rounded-full shadow-2xl backdrop-blur-md transition-all duration-300 ease-in-out transform hover:scale-125 ${
                  isFavorite 
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white animate-heart-beat shadow-red-500/50' 
                    : 'bg-white/20 text-gray-300 hover:bg-white/30 hover:text-white'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/50 animate-slide-in-up stagger-1`}
                onClick={() => onToggleFavorite(movie)}
                aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-8 w-8 transition-all duration-300 ${isFavorite ? 'scale-110' : 'scale-100'}`}
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
              <p className="text-xl text-gray-300 italic mb-6 font-light animate-slide-in-up stagger-2">"{movie.tagline}"</p>
            )}

            {/* Overview */}
            <p className="text-lg text-gray-200 mb-8 leading-relaxed animate-slide-in-up stagger-3">
              {movie.overview || 'No overview available.'}
            </p>

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-300 mb-8 animate-slide-in-up stagger-4">
              <div className="glass p-4 rounded-xl hover:bg-white/20 transition-all duration-300">
                <p className="font-bold text-blue-400 mb-2 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  Release Date
                </p>
                <p className="text-white font-semibold">{movie.release_date || 'N/A'}</p>
              </div>
              <div className="glass p-4 rounded-xl hover:bg-white/20 transition-all duration-300">
                <p className="font-bold text-purple-400 mb-2 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  Runtime
                </p>
                <p className="text-white font-semibold">{movie.runtime ? `${movie.runtime} minutes` : 'N/A'}</p>
              </div>
              <div className="glass p-4 rounded-xl hover:bg-white/20 transition-all duration-300">
                <p className="font-bold text-yellow-400 mb-2 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Rating
                </p>
                <p className="text-white font-semibold">{movie.vote_average ? `${movie.vote_average.toFixed(1)} / 10 (${movie.vote_count} votes)` : 'N/A'}</p>
              </div>
              <div className="glass p-4 rounded-xl hover:bg-white/20 transition-all duration-300">
                <p className="font-bold text-green-400 mb-2 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  Genres
                </p>
                <p className="text-white font-semibold">
                  {movie.genres && movie.genres.length > 0
                    ? movie.genres.map((genre) => genre.name).join(', ')
                    : 'N/A'}
                </p>
              </div>
              <div className="glass p-4 rounded-xl hover:bg-white/20 transition-all duration-300">
                <p className="font-bold text-emerald-400 mb-2 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                  </svg>
                  Budget
                </p>
                <p className="text-white font-semibold">
                  {movie.budget > 0
                    ? `$${movie.budget.toLocaleString()}`
                    : 'N/A'}
                </p>
              </div>
              <div className="glass p-4 rounded-xl hover:bg-white/20 transition-all duration-300">
                <p className="font-bold text-pink-400 mb-2 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  Revenue
                </p>
                <p className="text-white font-semibold">
                  {movie.revenue > 0
                    ? `$${movie.revenue.toLocaleString()}`
                    : 'N/A'}
                </p>
              </div>
            </div>

            {/* External Links (if available) */}
            {(movie.homepage || movie.imdb_id) && (
              <div className="flex flex-wrap gap-6 mt-8 animate-slide-in-up stagger-5">
                {movie.homepage && (
                  <a
                    href={movie.homepage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                    </svg>
                    <span>Official Website</span>
                  </a>
                )}
                {movie.imdb_id && (
                  <a
                    href={`https://www.imdb.com/title/${movie.imdb_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-yellow-500/25 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                    </svg>
                    <span>View on IMDb</span>
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
