import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, MapPin, Car } from 'lucide-react';
import ParkingGrid from '../components/ParkingGrid';

const ManageSlots = () => {
  const [zones, setZones] = useState([]);
  const [slotsByZone, setSlotsByZone] = useState({});
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [zoneId, setZoneId] = useState('');
  const [slotNumber, setSlotNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchZonesAndSlots = async () => {
    try {
      setLoading(true);
      const zRes = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/parking/zones`);
      const fetchedZones = zRes.data;
      setZones(fetchedZones);
      
      const slotsData = {};
      for (const zone of fetchedZones) {
         const sRes = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/parking/slots/${zone._id}`);
         slotsData[zone._id] = sRes.data;
      }
      setSlotsByZone(slotsData);
      
      if (fetchedZones.length > 0 && !zoneId) {
         setZoneId(fetchedZones[0]._id);
      }
      
    } catch (error) {
      console.error("Failed to fetch zones and slots", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZonesAndSlots();
  }, []);

  const handleAddSlot = async (e) => {
    e.preventDefault();
    if (!zoneId || !slotNumber) return setError("Please fill all fields");
    
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/slot`, { slotNumber, zoneId });
      setSuccess('Slot added successfully!');
      setSlotNumber('');
      fetchZonesAndSlots(); // Refresh the grid
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to add slot');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="border-b border-slate-700/50 pb-6">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-2">Manage Parking Slots</h1>
        <p className="text-slate-400">Add physical parking spaces to your created zones.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm flex items-center">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 px-4 py-3 rounded-xl text-sm flex items-center">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Add Slot Form */}
        <div className="lg:col-span-1 border border-slate-700">
          <div className="bg-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden h-full">
            <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"></div>
            
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 relative z-10">
              <Plus size={20} className="text-blue-500" />
              Add New Slot
            </h2>
            
            <form onSubmit={handleAddSlot} className="space-y-4 relative z-10">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Select Zone</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-4 w-4 text-slate-500" />
                  </div>
                  <select
                    value={zoneId}
                    onChange={(e) => setZoneId(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white transition-all outline-none appearance-none"
                  >
                    {!zones.length && <option value="">No zones available</option>}
                    {zones.map(z => (
                       <option key={z._id} value={z._id}>{z.zoneName}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Slot Number / Identifier</label>
                <input
                  type="text"
                  value={slotNumber}
                  onChange={(e) => setSlotNumber(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white transition-all outline-none font-mono"
                  placeholder="e.g. A-101"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || zones.length === 0}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'Adding...' : 'Add Parking Slot'}
              </button>
            </form>
          </div>
        </div>

        {/* Dynamic Zone Slot Grid view */}
        <div className="lg:col-span-2">
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 shadow-xl h-full">
             <div className="flex items-center justify-between mb-6 border-b border-slate-700/50 pb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                   <Car size={20} className="text-purple-400" />
                   Zone Visualizer
                </h2>
                
                {/* Zone Filter Dropdown */}
                <select
                  value={zoneId}
                  onChange={(e) => setZoneId(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none"
                >
                  {zones.map(z => <option key={z._id} value={z._id}>{z.zoneName}</option>)}
                </select>
             </div>

             {loading ? (
                <div className="flex justify-center py-12">
                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
             ) : !zoneId ? (
                <p className="text-slate-500 text-center py-8">Please select or create a zone first.</p>
             ) : slotsByZone[zoneId]?.length === 0 ? (
                <div className="text-center py-10 bg-slate-900/50 rounded-xl border border-slate-700 border-dashed">
                   <p className="text-slate-400">No slots added to this zone yet.</p>
                   <p className="text-sm text-slate-500 mt-1">Use the form to add your first slot.</p>
                </div>
             ) : (
                <ParkingGrid 
                  slots={slotsByZone[zoneId]} 
                  onSlotClick={(slot) => console.log("Manage slot:", slot)} 
                />
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageSlots;
