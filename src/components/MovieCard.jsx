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

  // Determine the image source, using a placeholder if poster_path is null
  const imageUrl = movie.poster_path
    ? `${IMAGE_BASE_URL}${movie.poster_path}`
    : PLACEHOLDER_IMAGE_URL;

  return (
    <div
      className="bg-gray-800 rounded-lg shadow-lg overflow-hidden transform transition-transform duration-300 hover:scale-105 cursor-pointer relative group"
      onClick={() => onClick(movie.id)} // Handle click for movie details
    >
      {/* Movie Poster */}
      <img
        src={imageUrl}
        alt={movie.title}
        className="w-full h-72 object-cover object-center rounded-t-lg"
        // Fallback for broken images
        onError={(e) => {
          e.target.onerror = null; // Prevent infinite loop
          e.target.src = PLACEHOLDER_IMAGE_URL;
        }}
      />

      {/* Movie Info Overlay */}
      <div className="p-4 flex flex-col justify-between h-auto">
        {/* Movie Title */}
        <h3 className="text-lg font-semibold text-white mb-2 truncate">
          {movie.title}
        </h3>
        {/* Release Date */}
        <p className="text-sm text-gray-400 mb-3">
          {movie.release_date ? `Released: ${movie.release_date.substring(0, 4)}` : 'Release Date Unknown'}
        </p>

        {/* Favorite Button */}
        <button
          className={`
            absolute top-3 right-3 p-2 rounded-full shadow-md
            transition-all duration-300 ease-in-out
            ${isFavorite ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'}
            focus:outline-none focus:ring-2 focus:ring-offset-2
            ${isFavorite ? 'focus:ring-red-500' : 'focus:ring-gray-500'}
          `}
          onClick={(e) => {
            e.stopPropagation(); // Prevent card click event from firing
            onToggleFavorite(movie); // Toggle favorite status
          }}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          {/* Heart Icon (Font Awesome via inline SVG for simplicity) */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
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
