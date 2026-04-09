import { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, Car, MapPin, StopCircle } from 'lucide-react';

const AdminSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // stores sessionId being ended

  const fetchActiveSessions = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/sessions/active`);
      setSessions(res.data);
    } catch (error) {
      console.error("Failed to fetch active sessions", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveSessions();
    
    // Auto refresh every 10 seconds to keep timers accurate
    const interval = setInterval(() => {
       fetchActiveSessions();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleEndSession = async (sessionId) => {
    if (!window.confirm("End this session and generate the bill?")) return;
    
    setActionLoading(sessionId);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/session/end`, { sessionId });
      fetchActiveSessions();
    } catch (error) {
      console.error("Failed to end session", error);
      alert(error.response?.data?.message || 'Error ending session');
    } finally {
      setActionLoading(null);
    }
  };

  const calculateDuration = (startTime) => {
     const start = new Date(startTime).getTime();
     const now = new Date().getTime();
     const diffMs = now - start;
     
     const hours = Math.floor(diffMs / (1000 * 60 * 60));
     const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
     return `${hours}h ${mins}m`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="border-b border-slate-700/50 pb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Active Parking Sessions</h1>
          <p className="text-slate-400">Monitor live parked vehicles and manually exit them to issue bills.</p>
        </div>
      </div>

      {loading && sessions.length === 0 ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-20 bg-slate-800/30 rounded-2xl border border-slate-700/50">
          <Car className="mx-auto h-16 w-16 text-slate-500 mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">No Active Vehicles</h2>
          <p className="text-slate-400">There are no ongoing parking sessions currently.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session) => (
            <div key={session._id} className="bg-slate-800 border-2 border-emerald-500/20 rounded-2xl p-6 relative overflow-hidden shadow-lg group hover:border-emerald-500/50 transition-colors">
               <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -mr-8 -mt-8"></div>
               
               <div className="flex items-center justify-between mb-4 border-b border-slate-700/50 pb-4">
                  <div>
                     <span className="text-xs text-emerald-400 uppercase tracking-widest font-bold flex items-center gap-1.5 mb-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Live
                     </span>
                     <h3 className="font-bold text-lg text-white truncate max-w-[150px]" title={session.userId?.name}>
                        {session.userId?.name || 'Unknown User'}
                     </h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center font-bold font-mono text-emerald-400">
                     {session.slotId?.slotNumber || '--'}
                  </div>
               </div>
               
               <div className="space-y-3 mb-6 relative z-10">
                  <div className="flex items-center gap-3 text-slate-300 text-sm">
                     <MapPin size={16} className="text-slate-500" />
                     <span className="truncate">{session.slotId?.zoneId?.zoneName || 'Unknown Zone'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-300 text-sm">
                     <Clock size={16} className="text-slate-500" />
                     <span>Duration: <strong className="text-white">{calculateDuration(session.startTime)}</strong></span>
                  </div>
               </div>
               
               <button
                  onClick={() => handleEndSession(session._id)}
                  disabled={actionLoading === session._id}
                  className="w-full bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/50 py-2.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2 relative z-10"
               >
                  {actionLoading === session._id ? (
                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  ) : (
                     <StopCircle size={18} />
                  )}
                  {actionLoading === session._id ? 'Generating Bill...' : 'Vehicle Exited (End Session)'}
               </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminSessions;
