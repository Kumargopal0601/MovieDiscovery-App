// server/routes/favorites.js
const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const db = require('../db');

const router = express.Router();

// All favorites routes require authentication
router.use(authenticateToken);

/**
 * GET /api/favorites
 * Get all favorites for the logged-in user
 */
router.get('/', (req, res) => {
  try {
    const favorites = db.prepare(
      'SELECT * FROM favorites WHERE user_id = ? ORDER BY added_at DESC'
    ).all(req.user.id);

    // Map to TMDB-compatible format for the frontend
    const mapped = favorites.map(fav => ({
      id: fav.movie_id,
      title: fav.title,
      poster_path: fav.poster_path,
      release_date: fav.release_date,
      vote_average: fav.vote_average,
      overview: fav.overview,
      favoriteId: fav.id,
      added_at: fav.added_at
    }));

    res.json({ favorites: mapped });
  } catch (err) {
    console.error('Error fetching favorites:', err);
    res.status(500).json({ error: 'Failed to fetch favorites.' });
  }
});

/**
 * POST /api/favorites
 * Add a movie to favorites
 */
router.post('/', (req, res) => {
  try {
    const { movie_id, title, poster_path, release_date, vote_average, overview } = req.body;

    if (!movie_id || !title) {
      return res.status(400).json({ error: 'movie_id and title are required.' });
    }

    // Check if already favorited
    const existing = db.prepare(
      'SELECT id FROM favorites WHERE user_id = ? AND movie_id = ?'
    ).get(req.user.id, movie_id);

    if (existing) {
      return res.status(409).json({ error: 'Movie is already in your favorites.' });
    }

    const result = db.prepare(
      `INSERT INTO favorites (user_id, movie_id, title, poster_path, release_date, vote_average, overview)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(req.user.id, movie_id, title, poster_path || null, release_date || null, vote_average || 0, overview || '');

    res.status(201).json({
      message: 'Movie added to favorites.',
      favorite: {
        id: result.lastInsertRowid,
        movie_id,
        title,
        poster_path,
        release_date,
        vote_average,
        overview
      }
    });
  } catch (err) {
    console.error('Error adding favorite:', err);
    res.status(500).json({ error: 'Failed to add movie to favorites.' });
  }
});

/**
 * DELETE /api/favorites/:movieId
 * Remove a movie from favorites
 */
router.delete('/:movieId', (req, res) => {
  try {
    const movieId = parseInt(req.params.movieId, 10);

    if (isNaN(movieId)) {
      return res.status(400).json({ error: 'Invalid movie ID.' });
    }

    const result = db.prepare(
      'DELETE FROM favorites WHERE user_id = ? AND movie_id = ?'
    ).run(req.user.id, movieId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Movie not found in your favorites.' });
    }

    res.json({ message: 'Movie removed from favorites.' });
  } catch (err) {
    console.error('Error removing favorite:', err);
    res.status(500).json({ error: 'Failed to remove movie from favorites.' });
  }
});

/**
 * GET /api/favorites/check/:movieId
 * Check if a movie is in the user's favorites
 */
router.get('/check/:movieId', (req, res) => {
  try {
    const movieId = parseInt(req.params.movieId, 10);

    if (isNaN(movieId)) {
      return res.status(400).json({ error: 'Invalid movie ID.' });
    }

    const favorite = db.prepare(
      'SELECT id FROM favorites WHERE user_id = ? AND movie_id = ?'
    ).get(req.user.id, movieId);

    res.json({ isFavorite: !!favorite });
  } catch (err) {
    console.error('Error checking favorite:', err);
    res.status(500).json({ error: 'Failed to check favorite status.' });
  }
});

module.exports = router;
