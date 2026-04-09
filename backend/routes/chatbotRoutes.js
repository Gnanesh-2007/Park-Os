const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/chatbot
// @desc    Get rule-based NLP response from AI chatbot
router.post('/', async (req, res) => {
  try {
    const { message } = req.body;
    const userMessage = message.toLowerCase();

    let reply = "I'm still learning about ParkOS. Could you rephrase your question? Try asking how to book, how to start a session, or what to do if payment fails.";

    if (userMessage.includes('find') || userMessage.includes('available') || userMessage.includes('zone')) {
      reply = "To find available parking zones: Navigate to your dashboard, click 'View Parking Zones', and you will see the list of zones along with available slots.";
    } else if (userMessage.includes('how to book') || userMessage.includes('booking')) {
      reply = "To book a slot: Select a parking zone, click on an available (green) slot, and confirm the booking. It will be temporarily reserved for you.";
    } else if (userMessage.includes('start') || userMessage.includes('session')) {
      reply = "Once you have booked a slot, you must start your session when you arrive. Go to your active bookings and click 'Start Session'.";
    } else if (userMessage.includes('end') || userMessage.includes('bill') || userMessage.includes('pay')) {
      reply = "To end your session and generate a bill, click 'End Session' on your active parking tracker. You will then see the 'Pay Now' option. We support Mock Paytm and PhonePe payments.";
    } else if (userMessage.includes('fail') || userMessage.includes('retry') || userMessage.includes('payment issue')) {
      reply = "If your payment fails during checkout, simply go back to your billing history and click 'Retry Payment' on the failed transaction record.";
    } else if (userMessage.includes('history') || userMessage.includes('past')) {
      reply = "You can view your past parking history from the 'Parking History' tab in the left sidebar on your dashboard.";
    } else if (userMessage.includes('hello') || userMessage.includes('hi ') || userMessage === 'hi') {
      reply = "Hello! I am your ParkOS AI Assistant. How can I help you with your parking experience today?";
    }

    res.json({ reply });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
