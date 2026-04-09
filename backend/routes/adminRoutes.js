const express = require('express');
const router = express.Router();
const ParkingZone = require('../models/ParkingZone');
const ParkingSlot = require('../models/ParkingSlot');
const User = require('../models/User');
const Billing = require('../models/Billing');
const ParkingSession = require('../models/ParkingSession');
const { protect, admin } = require('../middleware/authMiddleware');

// @route   POST /api/admin/zone
// @desc    Create a parking zone
router.post('/zone', protect, admin, async (req, res) => {
  try {
    const { zoneName, location } = req.body;
    const zone = await ParkingZone.create({ zoneName, location });
    res.status(201).json(zone);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/admin/slot
// @desc    Add a slot to a zone
router.post('/slot', protect, admin, async (req, res) => {
  try {
    const { slotNumber, zoneId } = req.body;
    
    const zoneExists = await ParkingZone.findById(zoneId);
    if (!zoneExists) {
      return res.status(404).json({ message: 'Zone not found' });
    }

    const slot = await ParkingSlot.create({ slotNumber, zoneId });
    res.status(201).json(slot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users
router.get('/users', protect, admin, async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/admin/billing
// @desc    Get all billing records
router.get('/billing', protect, admin, async (req, res) => {
  try {
    const billings = await Billing.find({}).populate({
      path: 'sessionId',
      populate: ['userId', 'slotId']
    });
    res.json(billings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/admin/zone/:id
// @desc    Delete a parking zone and its slots
router.delete('/zone/:id', protect, admin, async (req, res) => {
  try {
    const zone = await ParkingZone.findByIdAndDelete(req.params.id);
    if (!zone) return res.status(404).json({ message: 'Zone not found' });
    
    await ParkingSlot.deleteMany({ zoneId: req.params.id });
    res.json({ message: 'Zone and slots removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/admin/sessions/active
// @desc    Get all active sessions across all zones
router.get('/sessions/active', protect, admin, async (req, res) => {
  try {
    const activeSessions = await ParkingSession.find({ status: 'active' })
      .populate('userId', 'name email phone')
      .populate({
        path: 'slotId',
        populate: { path: 'zoneId' }
      });
    res.json(activeSessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/admin/session/end
// @desc    Admin manually ends a session (car leaves) & generates bill
router.post('/session/end', protect, admin, async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    const session = await ParkingSession.findById(sessionId);
    if (!session || session.status !== 'active') {
      return res.status(404).json({ message: 'Active session not found' });
    }

    session.endTime = Date.now();
    session.status = 'completed';
    await session.save();

    const slot = await ParkingSlot.findById(session.slotId);
    if (slot) {
      slot.status = 'available';
      await slot.save();
    }

    // Cost logic: 10 RS per hour, minimum 1 hour
    const durationMs = session.endTime - session.startTime;
    const durationHours = Math.max(1, Math.ceil(durationMs / (1000 * 60 * 60)));
    const amount = durationHours * 10;

    const bill = await Billing.create({
      sessionId: session._id,
      amount
    });

    res.json({ session, bill });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/admin/analytics/revenue
// @desc    Get revenue grouped by zone
router.get('/analytics/revenue', protect, admin, async (req, res) => {
  try {
    const zones = await ParkingZone.find({});
    const revenueData = [];

    for (const zone of zones) {
      const slots = await ParkingSlot.find({ zoneId: zone._id });
      const slotIds = slots.map(s => s._id);
      
      const sessions = await ParkingSession.find({ slotId: { $in: slotIds }, status: 'completed' });
      const sessionIds = sessions.map(s => s._id);
      
      const billing = await Billing.find({ sessionId: { $in: sessionIds }, paymentStatus: 'paid' });
      const totalRevenue = billing.reduce((acc, curr) => acc + curr.amount, 0);
      
      revenueData.push({
        name: zone.zoneName,
        value: totalRevenue
      });
    }
    res.json(revenueData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/admin/analytics/occupancy
// @desc    Get historical occupancy data (mocked for demo if no history exists)
router.get('/analytics/occupancy', protect, admin, async (req, res) => {
  try {
    // We'll generate last 7 days of data. 
    // In a real app, we'd query the session table.
    const today = new Date();
    const data = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      // For this demo, let's count completed/active sessions for that day
      // Mocking some variance for better charts
      const baseOccupancy = await ParkingSession.countDocuments({
        createdAt: { 
          $gte: new Date(date.setHours(0,0,0,0)), 
          $lte: new Date(date.setHours(23,59,59,999)) 
        }
      });

      data.push({
        name: dateStr,
        occupancy: baseOccupancy + Math.floor(Math.random() * 5) // Add variance for visual interest
      });
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/admin/simulate-ai-camera
// @desc    Simulate AI camera events (car entry or exit)
router.post('/simulate-ai-camera', protect, admin, async (req, res) => {
  try {
    const { type } = req.body; // 'entry' or 'exit'

    if (type === 'exit') {
      const activeSession = await ParkingSession.findOne({ status: 'active' });
      if (!activeSession) {
        return res.status(404).json({ message: 'No active sessions found to simulate exit.' });
      }

      activeSession.endTime = Date.now();
      activeSession.status = 'completed';
      await activeSession.save();

      const slot = await ParkingSlot.findById(activeSession.slotId);
      if (slot) {
        slot.status = 'available';
        await slot.save();
      }

      const durationMs = activeSession.endTime - activeSession.startTime;
      const durationHours = Math.max(1, Math.ceil(durationMs / (1000 * 60 * 60)));
      const amount = durationHours * 10;

      const bill = await Billing.create({
        sessionId: activeSession._id,
        amount,
        paymentStatus: 'paid' // Automated simulation pays immediately
      });

      return res.json({ message: `AI Detected car leaving slot`, session: activeSession, bill });
    }

    // Default to 'entry' simulation
    // Find a slot that is 'reserved' or 'available'
    const targetSlot = await ParkingSlot.findOne({ status: { $in: ['reserved', 'available'] } });
    if (!targetSlot) {
      return res.status(404).json({ message: 'No available slots found to simulate car arrival.' });
    }

    targetSlot.status = 'occupied';
    await targetSlot.save();

    const someUser = await User.findOne({ role: 'user' });
    if (!someUser) return res.status(404).json({ message: 'No regular users found for simulation' });

    const session = await ParkingSession.create({
      userId: someUser._id,
      slotId: targetSlot._id,
      startTime: Date.now()
    });

    res.json({ message: `AI Detected car at slot ${targetSlot.slotNumber}`, session, slot: targetSlot });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
