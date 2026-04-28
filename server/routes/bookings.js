// server/routes/bookings.js
const express = require('express');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const { authenticateToken } = require('../middleware/auth');
const db = require('../db');

const router = express.Router();

// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// ===== THEATER DATA (Simulated) =====
const THEATER_TEMPLATES = {
  default: [
    { name: 'PVR Cinemas', suffix: 'City Center Mall' },
    { name: 'INOX', suffix: 'Metro Junction' },
    { name: 'Cinepolis', suffix: 'Phoenix Mall' },
    { name: 'Carnival Cinemas', suffix: 'Central Plaza' },
    { name: 'Miraj Cinemas', suffix: 'Star Mall' },
  ],
  mumbai: [
    { name: 'PVR Cinemas', suffix: 'Phoenix Palladium, Lower Parel' },
    { name: 'INOX', suffix: 'R-City Mall, Ghatkopar' },
    { name: 'Cinepolis', suffix: 'Viviana Mall, Thane' },
    { name: 'PVR LUXE', suffix: 'High Street Phoenix' },
    { name: 'Carnival Cinemas', suffix: 'Andheri West' },
  ],
  delhi: [
    { name: 'PVR Cinemas', suffix: 'Select Citywalk, Saket' },
    { name: 'INOX', suffix: 'Nehru Place' },
    { name: 'Cinepolis', suffix: 'DLF Mall of India, Noida' },
    { name: 'PVR Director\'s Cut', suffix: 'Ambience Mall, Vasant Kunj' },
    { name: 'Wave Cinemas', suffix: 'Raja Garden' },
  ],
  bangalore: [
    { name: 'PVR Cinemas', suffix: 'Forum Mall, Koramangala' },
    { name: 'INOX', suffix: 'Garuda Mall, MG Road' },
    { name: 'Cinepolis', suffix: 'Royal Meenakshi Mall' },
    { name: 'PVR LUXE', suffix: 'Phoenix Marketcity, Whitefield' },
    { name: 'Innovative Multiplex', suffix: 'Marathahalli' },
  ],
  hyderabad: [
    { name: 'PVR Cinemas', suffix: 'Inorbit Mall, Madhapur' },
    { name: 'INOX', suffix: 'GVK One, Banjara Hills' },
    { name: 'Cinepolis', suffix: 'Mantra Mall, Attapur' },
    { name: 'AMB Cinemas', suffix: 'Gachibowli' },
    { name: 'Carnival Cinemas', suffix: 'Kukatpally' },
  ],
  chennai: [
    { name: 'PVR Cinemas', suffix: 'VR Chennai, Anna Nagar' },
    { name: 'INOX', suffix: 'Chennai Citi Centre' },
    { name: 'SPI Cinemas', suffix: 'Palazzo, Saligramam' },
    { name: 'AGS Cinemas', suffix: 'T. Nagar' },
    { name: 'Rohini Silver Screens', suffix: 'Koyambedu' },
  ],
  kolkata: [
    { name: 'PVR Cinemas', suffix: 'South City Mall' },
    { name: 'INOX', suffix: 'Forum Courtyard, Elgin Road' },
    { name: 'Cinepolis', suffix: 'Acropolis Mall, Kasba' },
    { name: 'Carnival Cinemas', suffix: 'Salt Lake' },
    { name: 'Mani Square INOX', suffix: 'E.M. Bypass' },
  ],
  pune: [
    { name: 'PVR Cinemas', suffix: 'Phoenix Marketcity, Viman Nagar' },
    { name: 'INOX', suffix: 'Bund Garden Road' },
    { name: 'Cinepolis', suffix: 'Westend Mall, Aundh' },
    { name: 'E-Square', suffix: 'University Road' },
    { name: 'Carnival Cinemas', suffix: 'Hinjewadi' },
  ]
};

const SHOWTIMES = ['10:00 AM', '12:30 PM', '03:15 PM', '06:30 PM', '09:45 PM'];
const SCREENS = ['Screen 1', 'Screen 2', 'Screen 3'];

// Seat pricing tiers (INR)
const SEAT_PRICING = {
  recliner: { price: 350, rows: ['A', 'B'] },
  premium: { price: 250, rows: ['C', 'D', 'E'] },
  standard: { price: 150, rows: ['F', 'G', 'H'] }
};

/**
 * GET /api/bookings/theaters
 * Get theaters for a city showing a particular movie
 */
router.get('/theaters', (req, res) => {
  try {
    const { city, movieId } = req.query;

    if (!city) {
      return res.status(400).json({ error: 'City is required.' });
    }

    const cityKey = city.toLowerCase().trim();
    const templates = THEATER_TEMPLATES[cityKey] || THEATER_TEMPLATES.default;

    // Generate theaters with showtimes
    const theaters = templates.map((t, index) => {
      // Each theater gets 2-3 screens with different showtimes
      const screenCount = 2 + (index % 2);
      const screens = SCREENS.slice(0, screenCount).map(screen => {
        // Pick 3-4 showtimes per screen
        const startIdx = index % 2;
        const times = SHOWTIMES.slice(startIdx, startIdx + 3 + (index % 2));
        return { screen, showtimes: times };
      });

      return {
        id: `theater_${cityKey}_${index}`,
        name: `${t.name} - ${t.suffix}`,
        city: city,
        distance: `${(1.5 + index * 2.3).toFixed(1)} km`,
        rating: (3.8 + (index * 0.3) % 1.2).toFixed(1),
        screens,
        facilities: ['Parking', 'Food Court', index % 2 === 0 ? 'Dolby Atmos' : '4DX', 'M-Ticket']
      };
    });

    res.json({ theaters });
  } catch (err) {
    console.error('Error fetching theaters:', err);
    res.status(500).json({ error: 'Failed to fetch theaters.' });
  }
});

/**
 * GET /api/bookings/seats
 * Get seat availability for a specific show
 */
router.get('/seats', (req, res) => {
  try {
    const { theaterId, screen, showtime, date } = req.query;

    if (!theaterId || !screen || !showtime || !date) {
      return res.status(400).json({ error: 'theaterId, screen, showtime, and date are required.' });
    }

    // Generate deterministic seat map based on the combination
    const seed = `${theaterId}-${screen}-${showtime}-${date}`;
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i);
      hash |= 0;
    }

    const rows = Object.entries(SEAT_PRICING).flatMap(([tier, config]) =>
      config.rows.map(row => {
        const seats = [];
        for (let i = 1; i <= 12; i++) {
          // Deterministic "booked" seats based on hash
          const seatHash = Math.abs(hash * (row.charCodeAt(0) + i)) % 100;
          const isBooked = seatHash < 30; // ~30% already booked
          seats.push({
            id: `${row}${i}`,
            row,
            number: i,
            tier,
            price: config.price,
            status: isBooked ? 'booked' : 'available'
          });
        }
        return { row, tier, price: config.price, seats };
      })
    );

    // Check if any seats in this show are already booked by real users
    const existingBookings = db.prepare(
      `SELECT seats FROM bookings
       WHERE show_date = ? AND show_time = ? AND theater_name LIKE ?
       AND booking_status = 'confirmed'`
    ).all(date, showtime, `%${theaterId.split('_').pop()}%`);

    const bookedSeats = new Set();
    existingBookings.forEach(b => {
      try {
        JSON.parse(b.seats).forEach(s => bookedSeats.add(s));
      } catch (e) { /* ignore */ }
    });

    // Mark real user-booked seats
    rows.forEach(row => {
      row.seats.forEach(seat => {
        if (bookedSeats.has(seat.id)) {
          seat.status = 'booked';
        }
      });
    });

    res.json({
      seatMap: rows,
      pricing: SEAT_PRICING,
      totalSeats: rows.reduce((sum, r) => sum + r.seats.length, 0),
      availableSeats: rows.reduce((sum, r) => sum + r.seats.filter(s => s.status === 'available').length, 0)
    });
  } catch (err) {
    console.error('Error fetching seats:', err);
    res.status(500).json({ error: 'Failed to fetch seat availability.' });
  }
});

/**
 * POST /api/bookings/create-order
 * Create a Razorpay order (auth required)
 */
router.post('/create-order', authenticateToken, async (req, res) => {
  try {
    const { amount, movieTitle, seats } = req.body;

    if (!amount || !movieTitle || !seats) {
      return res.status(400).json({ error: 'Amount, movieTitle, and seats are required.' });
    }

    const options = {
      amount: Math.round(amount * 100), // Razorpay expects amount in paise
      currency: 'INR',
      receipt: `booking_${Date.now()}_${req.user.id}`,
      notes: {
        movieTitle,
        seats: JSON.stringify(seats),
        userId: req.user.id.toString()
      }
    };

    const order = await razorpay.orders.create(options);

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (err) {
    console.error('Error creating Razorpay order:', err);
    res.status(500).json({ error: 'Failed to create payment order. Check Razorpay keys in .env' });
  }
});

/**
 * POST /api/bookings/verify-payment
 * Verify Razorpay payment and confirm booking (auth required)
 */
router.post('/verify-payment', authenticateToken, (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      movie_id, movie_title, movie_poster,
      theater_name, city, show_date, show_time, screen,
      seats, total_amount
    } = req.body;

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Payment verification failed. Invalid signature.' });
    }

    // Save booking
    const result = db.prepare(`
      INSERT INTO bookings (
        user_id, movie_id, movie_title, movie_poster,
        theater_name, city, show_date, show_time, screen,
        seats, seat_count, total_amount,
        razorpay_order_id, razorpay_payment_id, razorpay_signature,
        booking_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed')
    `).run(
      req.user.id, movie_id, movie_title, movie_poster || null,
      theater_name, city, show_date, show_time, screen || 'Screen 1',
      JSON.stringify(seats), seats.length, total_amount,
      razorpay_order_id, razorpay_payment_id, razorpay_signature
    );

    res.status(201).json({
      message: 'Booking confirmed!',
      booking: {
        id: result.lastInsertRowid,
        movie_title,
        theater_name,
        city,
        show_date,
        show_time,
        seats,
        total_amount,
        booking_status: 'confirmed'
      }
    });
  } catch (err) {
    console.error('Error verifying payment:', err);
    res.status(500).json({ error: 'Failed to verify payment and save booking.' });
  }
});

/**
 * GET /api/bookings
 * Get user's booking history (auth required)
 */
router.get('/', authenticateToken, (req, res) => {
  try {
    const bookings = db.prepare(
      'SELECT * FROM bookings WHERE user_id = ? ORDER BY booked_at DESC'
    ).all(req.user.id);

    const mapped = bookings.map(b => ({
      ...b,
      seats: JSON.parse(b.seats || '[]')
    }));

    res.json({ bookings: mapped });
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).json({ error: 'Failed to fetch bookings.' });
  }
});

/**
 * DELETE /api/bookings/:id
 * Cancel a booking (auth required)
 */
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const bookingId = parseInt(req.params.id, 10);

    if (isNaN(bookingId)) {
      return res.status(400).json({ error: 'Invalid booking ID.' });
    }

    const booking = db.prepare(
      'SELECT * FROM bookings WHERE id = ? AND user_id = ?'
    ).get(bookingId, req.user.id);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    if (booking.booking_status === 'cancelled') {
      return res.status(400).json({ error: 'Booking is already cancelled.' });
    }

    db.prepare(
      'UPDATE bookings SET booking_status = ? WHERE id = ?'
    ).run('cancelled', bookingId);

    res.json({ message: 'Booking cancelled successfully.' });
  } catch (err) {
    console.error('Error cancelling booking:', err);
    res.status(500).json({ error: 'Failed to cancel booking.' });
  }
});

module.exports = router;
