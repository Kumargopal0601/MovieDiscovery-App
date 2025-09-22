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
    <div className="container mx-auto px-4 py-12 animate-fade-in">
      {/* Hero Section */}
      <div className="text-center mb-16 animate-slide-in-up">
        <h1 className="text-6xl md:text-7xl font-bold gradient-text mb-6 animate-float">
          Your Favorites
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Your personally curated collection of amazing movies
        </p>
      </div>

      {/* Conditional rendering for empty favorites list */}
      {favorites.length === 0 ? (
        <div className="text-center my-20 animate-slide-in-up">
          <div className="glass-dark p-12 rounded-3xl max-w-lg mx-auto">
            <div className="mb-8">
              <svg className="w-24 h-24 text-gray-400 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <h3 className="text-2xl font-bold text-white mb-4">No Favorites Yet</h3>
              <p className="text-gray-400 text-lg leading-relaxed">
                You haven't added any movies to your favorites yet.
                <br />
                Discover amazing movies and start building your collection!
              </p>
            </div>
            <button
              onClick={() => window.location.reload()} // Simple way to go back to home
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
            >
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Discover Movies
              </span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Stats Section */}
          <div className="text-center mb-12 animate-slide-in-up stagger-1">
            <div className="glass-dark p-6 rounded-2xl inline-block">
              <p className="text-3xl font-bold gradient-text">
                {favorites.length}
              </p>
              <p className="text-gray-300 font-medium">
                {favorites.length === 1 ? 'Movie' : 'Movies'} in your collection
              </p>
            </div>
          </div>

          {/* Movie Grid for Favorites */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            {favorites.map((movie, index) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onClick={onSelectMovie} // Allow clicking to view details
                onToggleFavorite={onToggleFavorite} // Allow removing from favorites
                isFavorite={true} // Always true for movies in the favorites list
                style={{
                  animationDelay: `${index * 0.1}s`
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Favorites;
