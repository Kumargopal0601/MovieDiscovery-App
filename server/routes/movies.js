// server/routes/movies.js
const express = require('express');
const fetch = require('node-fetch');
const AbortController = require('abort-controller');

const router = express.Router();

const TMDB_API_KEY = process.env.REACT_APP_TMDB_API_KEY || process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_TIMEOUT_MS = 5000; // 5 second timeout for TMDB requests

/**
 * Helper: fetch from TMDB with a timeout
 */
async function fetchTMDB(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TMDB_TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.status_message || `TMDB API error: ${response.status}`);
    }

    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * GET /api/movies/trending
 * Get trending movies for the week
 */
router.get('/trending', async (req, res) => {
  try {
    if (!TMDB_API_KEY) {
      return res.status(500).json({ error: 'TMDB API key not configured on server.' });
    }

    const page = req.query.page || 1;
    const data = await fetchTMDB(
      `${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}&page=${page}`
    );

    res.json(data);
  } catch (err) {
    console.error('Error fetching trending movies:', err.message);
    res.status(502).json({ error: `Failed to fetch trending movies: ${err.message}` });
  }
});

/**
 * GET /api/movies/search
 * Search movies by query
 */
router.get('/search', async (req, res) => {
  try {
    if (!TMDB_API_KEY) {
      return res.status(500).json({ error: 'TMDB API key not configured on server.' });
    }

    const { query, page = 1 } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required.' });
    }

    const data = await fetchTMDB(
      `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page}`
    );

    res.json(data);
  } catch (err) {
    console.error('Error searching movies:', err.message);
    res.status(502).json({ error: `Failed to search movies: ${err.message}` });
  }
});

/**
 * GET /api/movies/:id
 * Get movie details by ID
 */
router.get('/:id', async (req, res) => {
  try {
    if (!TMDB_API_KEY) {
      return res.status(500).json({ error: 'TMDB API key not configured on server.' });
    }

    const { id } = req.params;
    const data = await fetchTMDB(
      `${TMDB_BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos,similar`
    );

    res.json(data);
  } catch (err) {
    console.error('Error fetching movie details:', err.message);
    res.status(502).json({ error: `Failed to fetch movie details: ${err.message}` });
  }
});

/**
 * GET /api/movies/:id/credits
 * Get movie credits (cast & crew)
 */
router.get('/:id/credits', async (req, res) => {
  try {
    if (!TMDB_API_KEY) {
      return res.status(500).json({ error: 'TMDB API key not configured on server.' });
    }

    const { id } = req.params;
    const data = await fetchTMDB(
      `${TMDB_BASE_URL}/movie/${id}/credits?api_key=${TMDB_API_KEY}`
    );

    res.json(data);
  } catch (err) {
    console.error('Error fetching movie credits:', err.message);
    res.status(502).json({ error: `Failed to fetch movie credits: ${err.message}` });
  }
});

/**
 * GET /api/movies/:id/similar
 * Get similar movies
 */
router.get('/:id/similar', async (req, res) => {
  try {
    if (!TMDB_API_KEY) {
      return res.status(500).json({ error: 'TMDB API key not configured on server.' });
    }

    const { id } = req.params;
    const data = await fetchTMDB(
      `${TMDB_BASE_URL}/movie/${id}/similar?api_key=${TMDB_API_KEY}`
    );

    res.json(data);
  } catch (err) {
    console.error('Error fetching similar movies:', err.message);
    res.status(502).json({ error: `Failed to fetch similar movies: ${err.message}` });
  }
});

module.exports = router;
