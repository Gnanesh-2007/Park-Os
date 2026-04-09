import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapPin, Car, Info } from 'lucide-react';

const BookSlot = () => {
  const { state } = useLocation();
  const preSelectedZone = state?.preSelectedZone || '';
  const navigate = useNavigate();
  
  const [zones, setZones] = useState([]);
  const [slots, setSlots] = useState([]);
  const [selectedZone, setSelectedZone] = useState(preSelectedZone);
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchZones = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/parking/zones');
        setZones(res.data);
      } catch (err) {
        console.error("Failed to fetch zones");
      }
    };
    fetchZones();
  }, []);

  useEffect(() => {
    if (selectedZone) {
      const fetchSlots = async () => {
        setLoading(true);
        try {
          const res = await axios.get(`http://localhost:5000/api/parking/slots/${selectedZone}`);
          setSlots(res.data);
        } catch (err) {
          setError("Failed to fetch slots");
        } finally {
          setLoading(false);
        }
      };
      fetchSlots();
    } else {
      setSlots([]);
    }
  }, [selectedZone]);

  const handleBook = async (slotId) => {
    setBookingLoading(true);
    setError('');
    
    try {
      await axios.post('http://localhost:5000/api/parking/book', { slotId });
      // Upon booking, immediately navigate to Sessions active tracker
      await axios.post('http://localhost:5000/api/parking/session/start', { slotId });
      navigate('/session');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book slot');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="border-b border-slate-700/50 pb-6">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 mb-2">Book a Parking Slot</h1>
        <p className="text-slate-400">Select a zone and reserve an available slot instantly.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm flex items-center shadow-inner">
          <Info className="h-4 w-4 mr-2" />
          {error}
        </div>
      )}

      {/* Zone Selector */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-lg shadow-black/20">
        <label className="block text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
          <MapPin size={16} className="text-blue-500" />
          Select Parking Zone
        </label>
        <select
          value={selectedZone}
          onChange={(e) => setSelectedZone(e.target.value)}
          className="w-full h-12 bg-slate-900 border border-slate-700 rounded-xl px-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all cursor-pointer appearance-none"
        >
          <option value="" disabled>-- Choose a Location --</option>
          {zones.map((zone) => (
            <option key={zone._id} value={zone._id}>{zone.zoneName} - {zone.location}</option>
          ))}
        </select>
      </div>

      {/* Slots Grid */}
      {selectedZone && (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 relative overflow-hidden">
          {/* Subtle bg glow */}
          <div className="absolute inset-0 bg-blue-500/5 mix-blend-overlay"></div>
          
          <div className="flex items-center justify-between mb-8 relative z-10">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Car size={24} className="text-blue-500" />
              Available Slots
            </h2>
            
            {/* Legend */}
            <div className="flex gap-4 text-sm hidden sm:flex">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div><span className="text-slate-400">Available</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div><span className="text-slate-400">Occupied</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]"></div><span className="text-slate-400">Reserved</span></div>
            </div>
          </div>

          {loading ? (
             <div className="flex justify-center p-12 relative z-10">
               <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
             </div>
          ) : slots.length === 0 ? (
             <p className="text-slate-500 text-center p-6 relative z-10">No slots available for this zone.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 relative z-10">
              {slots.map((slot) => {
                const isAvailable = slot.status === 'available';
                
                let bgClass = "bg-slate-700 border-slate-600 text-slate-300";
                let hoverClass = "";
                let indicatorClass = "bg-slate-500";
                
                if (slot.status === 'available') {
                  bgClass = "bg-slate-700 border-emerald-600/50 text-emerald-100 shadow-[inset_0_0_20px_rgba(16,185,129,0.1)]";
                  hoverClass = "hover:bg-emerald-600 hover:border-emerald-500 hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] cursor-pointer hover:-translate-y-1 transform transition-all";
                  indicatorClass = "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]";
                } else if (slot.status === 'occupied') {
                  bgClass = "bg-slate-800/80 border-red-500/30 text-red-400 opacity-60 cursor-not-allowed";
                  indicatorClass = "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]";
                } else if (slot.status === 'reserved') {
                  bgClass = "bg-slate-800/80 border-yellow-500/30 text-yellow-400 opacity-80 cursor-not-allowed";
                  indicatorClass = "bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.8)]";
                }

                return (
                  <button
                    key={slot._id}
                    disabled={!isAvailable || bookingLoading}
                    onClick={() => handleBook(slot._id)}
                    className={`relative w-full aspect-square md:aspect-[4/3] rounded-xl flex flex-col items-center justify-center p-2 border ${bgClass} ${hoverClass}`}
                  >
                    <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${indicatorClass}`}></div>
                    <Car size={32} className={`mb-2 ${isAvailable ? 'text-emerald-400 group-hover:text-white' : slot.status === 'occupied' ? 'text-red-500' : 'text-yellow-500'} opacity-80`} />
                    <span className="font-bold font-mono tracking-wider">{slot.slotNumber}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BookSlot;
