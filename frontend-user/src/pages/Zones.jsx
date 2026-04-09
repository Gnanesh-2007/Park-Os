import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { MapPin, Search } from 'lucide-react';

const Zones = () => {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchZones = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/parking/zones`);
        setZones(res.data);
      } catch (error) {
        console.error("Failed to fetch zones", error);
      } finally {
        setLoading(false);
      }
    };
    fetchZones();
  }, []);

  const filteredZones = zones.filter(zone => 
    zone.zoneName.toLowerCase().includes(search.toLowerCase()) || 
    zone.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700/50 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Parking Zones</h1>
          <p className="text-slate-400 mt-1">Explore all available parking areas in the system.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-500" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-slate-500 transition-all outline-none"
            placeholder="Search zones or locations..."
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredZones.length === 0 ? (
            <div className="col-span-full text-center py-10 bg-slate-800/30 rounded-2xl border border-slate-700/50">
              <p className="text-slate-400">No parking zones found.</p>
            </div>
          ) : (
            filteredZones.map(zone => (
              <div 
                key={zone._id} 
                className="bg-slate-800 border border-slate-700 hover:border-blue-500/50 rounded-2xl p-6 transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.1)] group flex flex-col justify-between h-full"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                     <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">{zone.zoneName}</h3>
                     <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 group-hover:bg-blue-600/20 group-hover:text-blue-500 transition-colors">
                        <MapPin size={20} />
                     </div>
                  </div>
                  <p className="text-slate-400 flex items-start gap-2 text-sm leading-relaxed mb-6">
                    <MapPin size={16} className="mt-0.5 shrink-0 text-slate-500" />
                    {zone.location}
                  </p>
                </div>
                
                <Link
                  to="/book"
                  state={{ preSelectedZone: zone._id }}
                  className="w-full py-2.5 rounded-xl bg-slate-700 hover:bg-blue-600 text-white font-medium transition-colors flex items-center justify-center"
                >
                  View Slots & Book
                </Link>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Zones;
