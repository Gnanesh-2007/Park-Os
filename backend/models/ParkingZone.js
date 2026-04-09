const mongoose = require('mongoose');

const parkingZoneSchema = new mongoose.Schema({
  zoneName: { type: String, required: true },
  location: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('ParkingZone', parkingZoneSchema);
