// src/components/MovieCard.jsx
import React from 'react';

/**
 * MovieCard Component
 * Displays a single movie's information including its poster, title, and release date.
 * It also provides a button to add/remove the movie from favorites.
 *
 * Props:
 * - movie: An object containing movie details (id, title, poster_path, release_date).
 * - onClick: Function to handle clicking on the movie card (e.g., to view details).
 * - onToggleFavorite: Function to handle adding/removing from favorites.
 * - isFavorite: Boolean indicating if the movie is currently a favorite.
 */
const MovieCard = ({ movie, onClick, onToggleFavorite, isFavorite }) => {
  // Base URL for TMDb movie posters
  const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500/';
  // Placeholder image URL for movies without a poster
  const PLACEHOLDER_IMAGE_URL = 'https://placehold.co/300x450/1F2937/F3F4F6?text=No+Image';
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Determine the image source, using a placeholder if poster_path is null
  const imageUrl = movie.poster_path
    ? `${IMAGE_BASE_URL}${movie.poster_path}`
    : PLACEHOLDER_IMAGE_URL;

  return (
    <div
      className="glass-dark rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-500 hover:scale-110 hover:rotate-1 cursor-pointer relative group hover-lift animate-scale-in"
      onClick={() => onClick(movie.id)} // Handle click for movie details
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Shimmer loading effect */}
      {!imageLoaded && (
        <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent z-10"></div>
      )}

      {/* Glow effect on hover */}
      <div className={`absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0`}></div>

      {/* Movie Poster */}
      <div className="relative overflow-hidden">
        <img
          src={imageUrl}
          alt={movie.title}
          className={`w-full h-80 object-cover object-center transition-all duration-700 ${
            isHovered ? 'scale-110 brightness-110' : 'scale-100'
          } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = PLACEHOLDER_IMAGE_URL;
            setImageLoaded(true);
          }}
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      </div>

      {/* Movie Info Overlay */}
      <div className="p-6 flex flex-col justify-between h-auto relative z-10">
        {/* Movie Title */}
        <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all duration-300">
          {movie.title}
        </h3>
        
        {/* Release Date */}
        <p className="text-sm text-gray-300 mb-4 font-medium">
          {movie.release_date ? (
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              {movie.release_date.substring(0, 4)}
            </span>
          ) : 'Release Date Unknown'}
        </p>

        {/* Rating */}
        {movie.vote_average > 0 && (
          <div className="flex items-center mb-4">
            <div className="flex items-center">
              <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-yellow-400 font-semibold">{movie.vote_average.toFixed(1)}</span>
            </div>
          </div>
        )}

        {/* Favorite Button */}
        <button
          className={`absolute top-4 right-4 p-3 rounded-full shadow-xl backdrop-blur-md transition-all duration-300 ease-in-out transform hover:scale-125 ${
            isFavorite 
              ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white animate-heart-beat shadow-red-500/50' 
              : 'bg-white/20 text-gray-300 hover:bg-white/30 hover:text-white'
          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/50`}
          onClick={(e) => {
            e.stopPropagation(); // Prevent card click event from firing
            onToggleFavorite(movie); // Toggle favorite status
          }}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          {/* Animated Heart Icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-6 w-6 transition-all duration-300 ${isFavorite ? 'scale-110' : 'scale-100'}`}
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
    </div>
  );
};

export default MovieCard;
