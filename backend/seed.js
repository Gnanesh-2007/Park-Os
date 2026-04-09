require('dotenv').config();
const mongoose = require('mongoose');
const ParkingZone = require('./models/ParkingZone');
const ParkingSlot = require('./models/ParkingSlot');
const ParkingSession = require('./models/ParkingSession');
const Billing = require('./models/Billing');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/parkos';

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data (optional, but good for demo resets)
    await ParkingZone.deleteMany();
    await ParkingSlot.deleteMany();
    await ParkingSession.deleteMany();
    await Billing.deleteMany();
    console.log('Cleared existing parking data.');

    // Create Zones
    const zonesData = [
      { zoneName: 'VIP Plaza', location: 'North Gate - Entry 1' },
      { zoneName: 'Economy Block', location: 'South Wing - Basement 1' },
      { zoneName: 'Faculty & Staff', location: 'East Wing - Ground Floor' }
    ];

    const createdZones = await ParkingZone.insertMany(zonesData);
    console.log(`Created ${createdZones.length} zones.`);

    // Create Slots for each Zone
    const slotsData = [];
    
    // Zone 1: VIP (10 slots)
    for (let i = 1; i <= 10; i++) {
       slotsData.push({
          slotNumber: `VIP-${String(i).padStart(2, '0')}`,
          zoneId: createdZones[0]._id,
          status: 'available'
       });
    }

    // Zone 2: Economy (20 slots)
    for (let i = 1; i <= 20; i++) {
        // Randomly make a few occupied for realism in the demo
       const status = Math.random() > 0.8 ? 'occupied' : 'available'; 
       slotsData.push({
          slotNumber: `ECO-${String(i).padStart(3, '0')}`,
          zoneId: createdZones[1]._id,
          status: status
       });
    }

    // Zone 3: Faculty (15 slots)
    for (let i = 1; i <= 15; i++) {
        // A few reserved
       const status = Math.random() > 0.85 ? 'reserved' : 
                      Math.random() > 0.7 ? 'occupied' : 'available'; 
       slotsData.push({
          slotNumber: `FAC-${String(i).padStart(2, '0')}`,
          zoneId: createdZones[2]._id,
          status: status
       });
    }

    await ParkingSlot.insertMany(slotsData);
    console.log(`Created ${slotsData.length} slots across zones.`);

    console.log('Database Seeding Completed Successfully! You can now start the server.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
