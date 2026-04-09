const express = require('express');
const router = express.Router();
const ParkingZone = require('../models/ParkingZone');
const ParkingSlot = require('../models/ParkingSlot');
const ParkingSession = require('../models/ParkingSession');
const Billing = require('../models/Billing');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/parking/zones
// @desc    Get all parking zones
router.get('/zones', protect, async (req, res) => {
  try {
    const zones = await ParkingZone.find({});
    res.json(zones);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/parking/slots/:zoneId
// @desc    Get all slots for a specific zone
router.get('/slots/:zoneId', protect, async (req, res) => {
  try {
    const slots = await ParkingSlot.find({ zoneId: req.params.zoneId });
    res.json(slots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/parking/book
// @desc    Book a slot
router.post('/book', protect, async (req, res) => {
  try {
    const { slotId } = req.body;
    const slot = await ParkingSlot.findById(slotId);

    if (!slot) {
      return res.status(404).json({ message: 'Slot not found' });
    }

    if (slot.status !== 'available') {
      return res.status(400).json({ message: 'Slot is not available' });
    }

    // Allocate the slot dynamically and temporarily reserve it
    slot.status = 'reserved';
    await slot.save();

    res.json({ message: 'Slot successfully reserved', slot });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/parking/session/start
// @desc    Start parking session
router.post('/session/start', protect, async (req, res) => {
  try {
    const { slotId } = req.body;
    
    // Check if slot is reserved by this user ideally, but we'll simplify and just check slot
    const slot = await ParkingSlot.findById(slotId);
    if (!slot) return res.status(404).json({ message: 'Slot not found' });
    
    // Mark as occupied
    slot.status = 'occupied';
    await slot.save();

    const session = await ParkingSession.create({
      userId: req.user.id,
      slotId,
      startTime: Date.now()
    });

    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/parking/session/end
// @desc    End parking session & Generate billing
router.post('/session/end', protect, async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    const session = await ParkingSession.findById(sessionId);
    if (!session || session.status !== 'active') {
      return res.status(404).json({ message: 'Active session not found' });
    }

    // Update session
    session.endTime = Date.now();
    session.status = 'completed';
    await session.save();

    // Make slot available again
    const slot = await ParkingSlot.findById(session.slotId);
    if (slot) {
      slot.status = 'available';
      await slot.save();
    }

    // Calculate cost (e.g., $5 flat rate or calculate based on duration)
    // Here we'll do 10 rupees per hour, min 1 hour.
    const durationMs = session.endTime - session.startTime;
    const durationHours = Math.max(1, Math.ceil(durationMs / (1000 * 60 * 60)));
    const amount = durationHours * 10;

    // Generate Bill
    const bill = await Billing.create({
      sessionId: session._id,
      amount
    });

    res.json({ session, bill });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/parking/session/history
// @desc    Get user's parking session history
router.get('/session/history', protect, async (req, res) => {
  try {
    const sessions = await ParkingSession.find({ userId: req.user.id }).populate('slotId');
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
