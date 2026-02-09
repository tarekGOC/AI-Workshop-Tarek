const express = require('express');
const router = express.Router();
const pool = require('../db');
const { requireAuth, requireRole } = require('../auth');
const { processPayment, processRefund } = require('../stubs/paymentService');

// POST process a payment
router.post('/process', requireAuth, async (req, res) => {
  try {
    const { appointment_id, amount, card_details } = req.body;

    const result = processPayment(amount, card_details, 'Appointment deposit/payment');

    if (result.success) {
      // update payment status on appointment
      await pool.query(
        "UPDATE appointments SET payment_status = 'paid', payment_amount = $1, updated_at = NOW() WHERE id = $2",
        [amount, appointment_id]
      );
    }

    res.json(result);
  } catch (err) {
    console.error('Payment processing error:', err);
    res.status(500).json({ error: 'Payment processing failed' });
  }
});

// POST process a refund
router.post('/refund', requireAuth, requireRole('provider'), async (req, res) => {
  try {
    const { appointment_id, amount, reason, transaction_id } = req.body;

    const result = processRefund(transaction_id || 'unknown', amount, reason);

    if (result.success) {
      await pool.query(
        "UPDATE appointments SET payment_status = 'refunded', refund_amount = $1, updated_at = NOW() WHERE id = $2",
        [amount, appointment_id]
      );
    }

    res.json(result);
  } catch (err) {
    console.error('Refund processing error:', err);
    res.status(500).json({ error: 'Refund processing failed' });
  }
});

module.exports = router;
