const mongoose = require('mongoose');

const billingSchema = new mongoose.Schema({
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'ParkingSession', required: true },
  amount: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  paymentMethod: { type: String, enum: ['Paytm', 'PhonePe', 'Credit Card', 'Cash', 'None'], default: 'None' }
}, { timestamps: true });

module.exports = mongoose.model('Billing', billingSchema);
