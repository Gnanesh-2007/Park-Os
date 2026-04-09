const mongoose = require('mongoose');

const parkingSlotSchema = new mongoose.Schema({
  slotNumber: { type: String, required: true },
  zoneId: { type: mongoose.Schema.Types.ObjectId, ref: 'ParkingZone', required: true },
  status: { type: String, enum: ['available', 'occupied', 'reserved'], default: 'available' }
}, { timestamps: true });

module.exports = mongoose.model('ParkingSlot', parkingSlotSchema);
