// src/App.jsx
import React, { useState, useEffect } from 'react';
import Home from './pages/Home';
import MovieDetail from './pages/MovieDetails'; // Corrected import: MovieDetails.jsx
import Favorites from './pages/Favourites'; // Corrected import: Favourites.jsx

function App() {
  // State to manage the current page being displayed
  // 'home', 'detail', 'favorites'
  const [currentPage, setCurrentPage] = useState('home');
  const [isLoading, setIsLoading] = useState(true);
  // State to store the ID of the movie currently being viewed in detail
  const [selectedMovieId, setSelectedMovieId] = useState(null);
  // State to store the list of favorite movies.
  // Initialize from localStorage for persistence across sessions.
  const [favorites, setFavorites] = useState(() => {
    try {
      const storedFavorites = localStorage.getItem('movieFavorites');
      return storedFavorites ? JSON.parse(storedFavorites) : [];
    } catch (error) {
      console.error("Failed to parse favorites from localStorage:", error);
      return []; // Return empty array on error
    }
  });

  // Effect to save favorites to localStorage whenever the favorites state changes
  useEffect(() => {
    try {
      localStorage.setItem('movieFavorites', JSON.stringify(favorites));
    } catch (error) {
      console.error("Failed to save favorites to localStorage:", error);
    }
  }, [favorites]); // Dependency array: runs when 'favorites' state changes

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Function to navigate to the MovieDetail page
  const handleSelectMovie = (id) => {
    setSelectedMovieId(id);
    setCurrentPage('detail');
  };

  // Function to navigate back to the Home page
  const handleBackToHome = () => {
    setSelectedMovieId(null); // Clear selected movie ID
    setCurrentPage('home');
  };

  // Function to navigate to the Favorites page
  const handleGoToFavorites = () => {
    setCurrentPage('favorites');
  };

  // Function to toggle a movie's favorite status
  const handleToggleFavorite = (movieToToggle) => {
    setFavorites((prevFavorites) => {
      // Check if the movie is already in favorites
      const isAlreadyFavorite = prevFavorites.some((fav) => fav.id === movieToToggle.id);

      if (isAlreadyFavorite) {
        // If it's a favorite, remove it
        return prevFavorites.filter((fav) => fav.id !== movieToToggle.id);
      } else {
        // If not a favorite, add it
        return [...prevFavorites, movieToToggle];
      }
    });
  };

  // Loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-8"></div>
          <h1 className="text-4xl font-bold gradient-text animate-pulse mb-4">MovieDiscovery</h1>
          <p className="text-gray-300 animate-fade-in">Loading your cinematic experience...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-gray-100 flex flex-col relative overflow-hidden">
      {/* Animated background particles */}
      <div className="particles">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${6 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* Navigation Bar */}
      <header className="glass-dark shadow-2xl py-6 px-4 md:px-8 flex flex-col sm:flex-row justify-between items-center sticky top-0 z-50 animate-slide-in-up border-b border-white/10">
        <h1
          className="text-4xl font-bold gradient-text mb-4 sm:mb-0 cursor-pointer hover:scale-110 transition-all duration-300 animate-float"
          onClick={handleBackToHome} // Click title to go home
        >
          MovieDiscovery
        </h1>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <button
                onClick={handleBackToHome}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                  currentPage === 'home' 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg animate-pulse-glow' 
                    : 'text-gray-300 hover:bg-white/10 hover:text-white glass'
                }`}
              >
                Home
              </button>
            </li>
            <li>
              <button
                onClick={handleGoToFavorites}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 relative ${
                  currentPage === 'favorites' 
                    ? 'bg-gradient-to-r from-pink-600 to-red-600 text-white shadow-lg animate-pulse-glow' 
                    : 'text-gray-300 hover:bg-white/10 hover:text-white glass'
                }`}
              >
                Favorites ({favorites.length})
                <span className="ml-2 bg-white/20 px-2 py-1 rounded-full text-xs animate-bounce">
                  {favorites.length}
                </span>
            </li>
          </ul>
        </nav>
      </header>

      {/* Main Content Area - Conditional Rendering based on currentPage */}
      <main className="flex-grow relative z-10">
        {currentPage === 'home' && (
          <Home
            onSelectMovie={handleSelectMovie}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
          />
        )}
        {currentPage === 'detail' && selectedMovieId && (
          <MovieDetail
            movieId={selectedMovieId}
            onBack={handleBackToHome}
            onToggleFavorite={handleToggleFavorite}
            isFavorite={favorites.some((fav) => fav.id === selectedMovieId)}
          />
        )}
        {currentPage === 'favorites' && (
          <Favorites
            favorites={favorites}
            onSelectMovie={handleSelectMovie}
            onToggleFavorite={handleToggleFavorite}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="glass-dark text-gray-400 text-center py-6 mt-12 shadow-inner border-t border-white/10 animate-fade-in">
        <div className="animate-slide-in-up">
          <p className="text-lg font-medium">&copy; {new Date().getFullYear()} MovieDiscovery App. All rights reserved.</p>
          <p className="text-sm mt-2 opacity-75">Data provided by The Movie Database (TMDb).</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
