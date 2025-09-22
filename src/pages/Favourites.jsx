// src/pages/Favorites.jsx
import React from 'react';
import MovieCard from '../components/MovieCard';

/**
 * Favorites Page Component
 * Displays a list of movies that the user has marked as favorites.
 *
 * Props:
 * - favorites: Array of favorite movie objects.
 * - onSelectMovie: Callback function to navigate to movie detail page.
 * - onToggleFavorite: Callback function to remove movies from favorites.
 */
const Favorites = ({ favorites, onSelectMovie, onToggleFavorite }) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-white mb-8 text-center">Your Favorite Movies</h1>

      {/* Conditional rendering for empty favorites list */}
      {favorites.length === 0 ? (
        <p className="text-center text-gray-400 text-xl mt-12">
          You haven't added any movies to your favorites yet.
          Go to the Home page to discover and add some!
        </p>
      ) : (
        /* Movie Grid for Favorites */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {favorites.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onClick={onSelectMovie} // Allow clicking to view details
              onToggleFavorite={onToggleFavorite} // Allow removing from favorites
              isFavorite={true} // Always true for movies in the favorites list
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
