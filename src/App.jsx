import React, { useState } from 'react';
import Home from './pages/Home';
import MovieDetails from './pages/MovieDetails';
import Favourites from './pages/Favourites';
import './index.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedMovieId, setSelectedMovieId] = useState(null);
  const [favorites, setFavorites] = useState([]);

  const navigateToHome = () => {
    setCurrentPage('home');
  };

  const navigateToMovieDetails = (movieId) => {
    setSelectedMovieId(movieId);
    setCurrentPage('movieDetails');
  };

  const navigateToFavourites = () => {
    setCurrentPage('favourites');
  };

  const toggleFavorite = (movie) => {
    setFavorites(prevFavorites => {
      const isAlreadyFavorite = prevFavorites.some(fav => fav.id === movie.id);
      if (isAlreadyFavorite) {
        return prevFavorites.filter(fav => fav.id !== movie.id);
      } else {
        return [...prevFavorites, movie];
      }
    });
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <Home
            onMovieClick={navigateToMovieDetails}
            onFavouritesClick={navigateToFavourites}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
          />
        );
      case 'movieDetails':
        return (
          <MovieDetails
            movieId={selectedMovieId}
            onBackClick={navigateToHome}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
          />
        );
      case 'favourites':
        return (
          <Favourites
            favorites={favorites}
            onBackClick={navigateToHome}
            onMovieClick={navigateToMovieDetails}
            onToggleFavorite={toggleFavorite}
          />
        );
      default:
        return (
          <Home
            onMovieClick={navigateToMovieDetails}
            onFavouritesClick={navigateToFavourites}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
          />
        );
    }
  };

  return (
    <div className="App">
      {renderCurrentPage()}
    </div>
  );
}

export default App;