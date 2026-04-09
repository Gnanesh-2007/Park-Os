import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, MapPin } from 'lucide-react';

const ManageZones = () => {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [zoneName, setZoneName] = useState('');
  const [location, setLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchZones = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/parking/zones`);
      setZones(res.data);
    } catch (error) {
      console.error("Failed to fetch zones", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  const handleAddZone = async (e) => {
    e.preventDefault();
    if (!zoneName || !location) return setError("Please fill all fields");
    
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/zone`, { zoneName, location });
      setSuccess('Parking zone added successfully!');
      setZoneName('');
      setLocation('');
      fetchZones();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to add zone');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteZone = async (id) => {
    if (!window.confirm("Are you sure you want to delete this zone and ALL its slots?")) return;
    
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/zone/${id}`);
      setSuccess('Zone deleted successfully');
      fetchZones();
    } catch (error) {
      setError('Failed to delete zone');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="border-b border-slate-700/50 pb-6">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-blue-400 mb-2">Manage Parking Zones</h1>
        <p className="text-slate-400">Add new parking areas or remove existing ones from the system.</p>
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
        
        {/* Add Zone Form */}
        <div className="lg:col-span-1">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            {/* Glow */}
            <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl"></div>
            
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Plus size={20} className="text-emerald-500" />
              Create New Zone
            </h2>
            
            <form onSubmit={handleAddZone} className="space-y-4 relative z-10">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Zone Name</label>
                <input
                  type="text"
                  value={zoneName}
                  onChange={(e) => setZoneName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white transition-all outline-none"
                  placeholder="e.g. Area A1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white transition-all outline-none"
                  placeholder="e.g. North Gate"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'Creating...' : 'Add Parking Zone'}
              </button>
            </form>
          </div>
        </div>

        {/* Zones List */}
        <div className="lg:col-span-2">
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-6">Existing Zones</h2>
            
            {loading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
              </div>
            ) : zones.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No parking zones exist yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {zones.map((zone) => (
                  <div key={zone._id} className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 flex flex-col justify-between group hover:border-slate-500 transition-colors">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                         <h3 className="font-bold text-white truncate">{zone.zoneName}</h3>
                         <button 
                           onClick={() => handleDeleteZone(zone._id)}
                           className="text-slate-500 hover:text-red-500 hover:bg-red-500/10 p-1.5 rounded-lg transition-colors"
                           title="Delete Zone"
                         >
                           <Trash2 size={16} />
                         </button>
                      </div>
                      <p className="text-slate-400 text-sm flex items-center gap-1.5">
                        <MapPin size={14} className="text-emerald-500" />
                        {zone.location}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageZones;
