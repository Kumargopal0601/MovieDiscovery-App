// src/components/MovieCard.jsx
import React, { useState } from 'react';

const MovieCard = ({ movie, onClick, onToggleFavorite, isFavorite, index = 0 }) => {
  const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500/';
  const PLACEHOLDER_IMAGE_URL = 'https://placehold.co/300x450/181818/333333?text=No+Image';
  const [imageLoaded, setImageLoaded] = useState(false);

  const imageUrl = movie.poster_path
    ? `${IMAGE_BASE_URL}${movie.poster_path}`
    : PLACEHOLDER_IMAGE_URL;

  const matchPercent = movie.vote_average
    ? Math.round(movie.vote_average * 10)
    : null;

  const year = movie.release_date
    ? movie.release_date.substring(0, 4)
    : '';

  return (
    <div
      className={`movie-card animate-fade-in-up stagger-${Math.min(index % 8 + 1, 8)}`}
    >
      {/* Poster Image */}
      <div className="card-image-wrapper" onClick={() => onClick(movie.id)}>
        {!imageLoaded && (
          <div className="absolute inset-0 animate-shimmer rounded-md" />
        )}
        <img
          src={imageUrl}
          alt={movie.title}
          className="card-image"
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = PLACEHOLDER_IMAGE_URL;
            setImageLoaded(true);
          }}
          style={{ opacity: imageLoaded ? 1 : 0 }}
        />
      </div>

      {/* Hover Info Panel */}
      <div className="card-info">
        {/* Action Buttons Row */}
        <div className="card-buttons">
          {/* Play button */}
          <button
            className="card-btn play-btn"
            onClick={() => onClick(movie.id)}
            aria-label="View details"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 2.69127C4 1.93067 4.81547 1.44851 5.48192 1.81506L22.4069 11.1238C23.0977 11.5037 23.0977 12.4963 22.4069 12.8762L5.48192 22.1849C4.81546 22.5515 4 22.0693 4 21.3087V2.69127Z" />
            </svg>
          </button>

          {/* Favorite button */}
          <button
            className={`card-btn ${isFavorite ? 'fav-active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(movie);
            }}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            {isFavorite ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2 9.1371C2 14 6.01943 16.5914 8.96173 18.9109C10 19.7294 11 20.5 12 20.5C13 20.5 14 19.7294 15.0383 18.9109C17.9806 16.5914 22 14 22 9.1371C22 4.27416 16.4998 0.825464 12 5.50063C7.50016 0.825464 2 4.27416 2 9.1371Z" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 4.5C7 -0.5 2 3.5 2 9C2 14 12 20.5 12 20.5C12 20.5 22 14 22 9C22 3.5 17 -0.5 12 4.5Z" />
              </svg>
            )}
          </button>

          {/* More info button */}
          <button
            className="card-btn"
            onClick={() => onClick(movie.id)}
            aria-label="More info"
            style={{ marginLeft: 'auto' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3C11.4477 3 11 3.44772 11 4V11H4C3.44772 11 3 11.4477 3 12C3 12.5523 3.44772 13 4 13H11V20C11 20.5523 11.4477 21 12 21C12.5523 21 13 20.5523 13 20V13H20C20.5523 13 21 12.5523 21 12C21 11.4477 20.5523 11 20 11H13V4C13 3.44772 12.5523 3 12 3Z" />
            </svg>
          </button>
        </div>

        {/* Movie Info */}
        <div className="card-title">{movie.title}</div>
        <div className="card-meta">
          {matchPercent && (
            <span className="card-match">{matchPercent}% Match</span>
          )}
          {year && <span className="card-year">{year}</span>}
          <span className="card-badge">HD</span>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
