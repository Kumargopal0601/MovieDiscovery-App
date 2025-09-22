// src/App.jsx
import React, { useState, useEffect } from 'react';
import Home from './pages/Home';
import MovieDetail from './pages/MovieDetails'; // Corrected import: MovieDetails.jsx
import Favorites from './pages/Favourites'; // Corrected import: Favourites.jsx

function App() {
  // State to manage the current page being displayed
  // 'home', 'detail', 'favorites'
  const [currentPage, setCurrentPage] = useState('home');
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

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      {/* Navigation Bar */}
      <header className="bg-gray-800 shadow-lg py-4 px-4 md:px-8 flex flex-col sm:flex-row justify-between items-center sticky top-0 z-10">
        <h1
          className="text-3xl font-bold text-blue-400 mb-4 sm:mb-0 cursor-pointer hover:text-blue-300 transition-colors duration-200"
          onClick={handleBackToHome} // Click title to go home
        >
          MovieDiscovery
        </h1>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <button
                onClick={handleBackToHome}
                className={`
                  px-4 py-2 rounded-lg font-medium transition-colors duration-200
                  ${currentPage === 'home' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}
                `}
              >
                Home
              </button>
            </li>
            <li>
              <button
                onClick={handleGoToFavorites}
                className={`
                  px-4 py-2 rounded-lg font-medium transition-colors duration-200
                  ${currentPage === 'favorites' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}
                `}
              >
                Favorites ({favorites.length})
              </button>
            </li>
          </ul>
        </nav>
      </header>

      {/* Main Content Area - Conditional Rendering based on currentPage */}
      <main className="flex-grow">
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
      <footer className="bg-gray-800 text-gray-400 text-center py-4 mt-8 shadow-inner">
        <p>&copy; {new Date().getFullYear()} MovieDiscovery App. All rights reserved.</p>
        <p className="text-sm mt-1">Data provided by The Movie Database (TMDb).</p>
      </footer>
    </div>
  );
}

export default App;
