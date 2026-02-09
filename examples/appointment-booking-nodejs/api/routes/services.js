const express = require('express');
const router = express.Router();
const pool = require('../db');
const { requireAuth, requireRole } = require('../auth');

// GET all services for a provider (public)
router.get('/provider/:providerId', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM service_types WHERE provider_id = $1 ORDER BY name', [req.params.providerId]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching services:', err);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// GET provider's own services
router.get('/mine', requireAuth, requireRole('provider'), async (req, res) => {
  try {
    const provider = await pool.query('SELECT * FROM providers WHERE keycloak_id = $1', [req.user.username]);
    if (provider.rows.length === 0) return res.status(404).json({ error: 'Provider not found' });
    
    const result = await pool.query('SELECT * FROM service_types WHERE provider_id = $1 ORDER BY name', [provider.rows[0].id]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching services:', err);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// POST create service type
router.post('/', requireAuth, requireRole('provider'), async (req, res) => {
  try {
    const provider = await pool.query('SELECT * FROM providers WHERE keycloak_id = $1', [req.user.username]);
    if (provider.rows.length === 0) return res.status(404).json({ error: 'Provider not found' });
    const providerId = provider.rows[0].id;

    const { name, duration_minutes, price, buffer_minutes, deposit_percentage, description } = req.body;
    const result = await pool.query(
      `INSERT INTO service_types (provider_id, name, duration_minutes, price, buffer_minutes, deposit_percentage, description) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [providerId, name, duration_minutes || 30, price || 0, buffer_minutes || 0, deposit_percentage || 0, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating service:', err);
    res.status(500).json({ error: 'Failed to create service' });
  }
});

// PUT update service type
router.put('/:id', requireAuth, requireRole('provider'), async (req, res) => {
  try {
    const { name, duration_minutes, price, buffer_minutes, deposit_percentage, description } = req.body;
    const result = await pool.query(
      `UPDATE service_types SET name = $1, duration_minutes = $2, price = $3, buffer_minutes = $4, deposit_percentage = $5, description = $6 WHERE id = $7 RETURNING *`,
      [name, duration_minutes, price, buffer_minutes, deposit_percentage, description, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Service not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating service:', err);
    res.status(500).json({ error: 'Failed to update service' });
  }
});

// DELETE service type
router.delete('/:id', requireAuth, requireRole('provider'), async (req, res) => {
  try {
    await pool.query('DELETE FROM service_types WHERE id = $1', [req.params.id]);
    res.json({ message: 'Service deleted' });
  } catch (err) {
    console.error('Error deleting service:', err);
    res.status(500).json({ error: 'Failed to delete service' });
  }
});

module.exports = router;
