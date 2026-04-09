const mongoose = require('mongoose');

const parkingSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  slotId: { type: mongoose.Schema.Types.ObjectId, ref: 'ParkingSlot', required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('ParkingSession', parkingSessionSchema);
