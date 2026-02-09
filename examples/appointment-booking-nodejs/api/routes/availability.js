const express = require('express');
const router = express.Router();
const pool = require('../db');
const { requireAuth, requireRole } = require('../auth');

// GET provider's availability
router.get('/', requireAuth, requireRole('provider'), async (req, res) => {
  try {
    const provider = await pool.query('SELECT * FROM providers WHERE keycloak_id = $1', [req.user.username]);
    if (provider.rows.length === 0) return res.status(404).json({ error: 'Provider not found' });
    const providerId = provider.rows[0].id;

    const availability = await pool.query('SELECT * FROM provider_availability WHERE provider_id = $1 ORDER BY day_of_week, start_time', [providerId]);
    const breaks = await pool.query('SELECT * FROM provider_breaks WHERE provider_id = $1 ORDER BY day_of_week, start_time', [providerId]);
    const blocked = await pool.query('SELECT * FROM blocked_dates WHERE provider_id = $1 ORDER BY blocked_date', [providerId]);

    res.json({
      availability: availability.rows,
      breaks: breaks.rows,
      blocked_dates: blocked.rows
    });
  } catch (err) {
    console.error('Error fetching availability:', err);
    res.status(500).json({ error: 'Failed to fetch availability' });
  }
});

// POST create availability slot
router.post('/', requireAuth, requireRole('provider'), async (req, res) => {
  try {
    const provider = await pool.query('SELECT * FROM providers WHERE keycloak_id = $1', [req.user.username]);
    if (provider.rows.length === 0) return res.status(404).json({ error: 'Provider not found' });
    const providerId = provider.rows[0].id;

    const { day_of_week, start_time, end_time } = req.body;
    const result = await pool.query(
      'INSERT INTO provider_availability (provider_id, day_of_week, start_time, end_time) VALUES ($1, $2, $3, $4) RETURNING *',
      [providerId, day_of_week, start_time, end_time]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating availability:', err);
    res.status(500).json({ error: 'Failed to create availability' });
  }
});

// PUT update availability
router.put('/:id', requireAuth, requireRole('provider'), async (req, res) => {
  try {
    const { day_of_week, start_time, end_time, is_active } = req.body;
    const result = await pool.query(
      'UPDATE provider_availability SET day_of_week = $1, start_time = $2, end_time = $3, is_active = $4 WHERE id = $5 RETURNING *',
      [day_of_week, start_time, end_time, is_active, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Availability not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating availability:', err);
    res.status(500).json({ error: 'Failed to update availability' });
  }
});

// DELETE availability
router.delete('/:id', requireAuth, requireRole('provider'), async (req, res) => {
  try {
    await pool.query('DELETE FROM provider_availability WHERE id = $1', [req.params.id]);
    res.json({ message: 'Availability deleted' });
  } catch (err) {
    console.error('Error deleting availability:', err);
    res.status(500).json({ error: 'Failed to delete availability' });
  }
});

// POST add blocked date
router.post('/blocked-dates', requireAuth, requireRole('provider'), async (req, res) => {
  try {
    const provider = await pool.query('SELECT * FROM providers WHERE keycloak_id = $1', [req.user.username]);
    if (provider.rows.length === 0) return res.status(404).json({ error: 'Provider not found' });
    const providerId = provider.rows[0].id;

    const { blocked_date, reason } = req.body;
    const result = await pool.query(
      'INSERT INTO blocked_dates (provider_id, blocked_date, reason) VALUES ($1, $2, $3) RETURNING *',
      [providerId, blocked_date, reason]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error adding blocked date:', err);
    res.status(500).json({ error: 'Failed to add blocked date' });
  }
});

// DELETE blocked date
router.delete('/blocked-dates/:id', requireAuth, requireRole('provider'), async (req, res) => {
  try {
    await pool.query('DELETE FROM blocked_dates WHERE id = $1', [req.params.id]);
    res.json({ message: 'Blocked date removed' });
  } catch (err) {
    console.error('Error removing blocked date:', err);
    res.status(500).json({ error: 'Failed to remove blocked date' });
  }
});

// POST add break
router.post('/breaks', requireAuth, requireRole('provider'), async (req, res) => {
  try {
    const provider = await pool.query('SELECT * FROM providers WHERE keycloak_id = $1', [req.user.username]);
    if (provider.rows.length === 0) return res.status(404).json({ error: 'Provider not found' });
    const providerId = provider.rows[0].id;

    const { day_of_week, start_time, end_time } = req.body;
    const result = await pool.query(
      'INSERT INTO provider_breaks (provider_id, day_of_week, start_time, end_time) VALUES ($1, $2, $3, $4) RETURNING *',
      [providerId, day_of_week, start_time, end_time]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error adding break:', err);
    res.status(500).json({ error: 'Failed to add break' });
  }
});

// DELETE break
router.delete('/breaks/:id', requireAuth, requireRole('provider'), async (req, res) => {
  try {
    await pool.query('DELETE FROM provider_breaks WHERE id = $1', [req.params.id]);
    res.json({ message: 'Break removed' });
  } catch (err) {
    console.error('Error removing break:', err);
    res.status(500).json({ error: 'Failed to remove break' });
  }
});

module.exports = router;
