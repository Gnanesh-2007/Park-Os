const express = require('express');
const router = express.Router();
const Billing = require('../models/Billing');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/billing/pay
// @desc    Process mock payment
router.post('/pay', protect, async (req, res) => {
  try {
    const { billId, paymentMethod } = req.body;
    
    const bill = await Billing.findById(billId);
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    if (bill.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Bill is already paid' });
    }

    // Mock payment success logic (simulate 90% success rate, 10% failure)
    const isSuccess = Math.random() > 0.1;

    if (isSuccess) {
      bill.paymentStatus = 'paid';
      bill.paymentMethod = paymentMethod || 'Online';
      await bill.save();
      res.json({ message: 'Payment successful', bill });
    } else {
      bill.paymentStatus = 'failed';
      await bill.save();
      res.status(400).json({ message: 'Payment failed, please retry', bill });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/billing/history
// @desc    Get user's billing history
router.get('/history', protect, async (req, res) => {
  try {
    // Populate session, then populate slot inside the session to get location details later
    const bills = await Billing.find({}).populate({
      path: 'sessionId',
      match: { userId: req.user.id },
      populate: { path: 'slotId' }
    });

    // Filter out bills where session doesn't belong to the user
    const userBills = bills.filter(bill => bill.sessionId !== null);

    res.json(userBills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const { Parser } = require('json2csv');
const { admin } = require('../middleware/authMiddleware');

// @route   GET /api/billing/export/csv
// @desc    Export all billing records as CSV (Admin only)
router.get('/export/csv', protect, admin, async (req, res) => {
  try {
    const billings = await Billing.find({}).populate({
      path: 'sessionId',
      populate: ['userId', 'slotId']
    });

    const fields = [
      { label: 'Bill ID', value: '_id' },
      { label: 'Amount', value: 'amount' },
      { label: 'Status', value: 'paymentStatus' },
      { label: 'User', value: 'sessionId.userId.name' },
      { label: 'Slot', value: 'sessionId.slotId.slotNumber' },
      { label: 'Date', value: 'createdAt' }
    ];

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(billings);

    res.header('Content-Type', 'text/csv');
    res.attachment('parking_bills.csv');
    return res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
