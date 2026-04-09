import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Clock, Play, Square, MapPin, Tag } from 'lucide-react';

const Sessions = () => {
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchActiveSession();
  }, []);

  const fetchActiveSession = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/parking/session/history`);
      const sessions = res.data;
      const sessionToTrack = sessions.find(s => s.status === 'active' || s.status === 'reserved');
      setActiveSession(sessionToTrack || null);
    } catch (error) {
      console.error("Failed to fetch sessions", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEndSession = async () => {
    setActionLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/parking/session/end`, { sessionId: activeSession._id });
      navigate('/history'); // Redirect to billing/history to pay
    } catch (error) {
      console.error("Failed to end session", error);
    } finally {
      setActionLoading(false);
      fetchActiveSession();
    }
  };

  const handleStartSession = async () => {
    setActionLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/parking/session/start`, { sessionId: activeSession._id });
    } catch (error) {
      console.error("Failed to start session", error);
    } finally {
      setActionLoading(false);
      fetchActiveSession();
    }
  };

  // Live timer logic
  const [elapsedTime, setElapsedTime] = useState('');

  useEffect(() => {
    if (!activeSession || activeSession.status === 'reserved') {
      setElapsedTime('');
      return;
    }
    
    const startTime = new Date(activeSession.startTime).getTime();
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = now - startTime;
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setElapsedTime(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-3xl mx-auto">
      <div className="border-b border-slate-700/50 pb-6 text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Live Parking Tracker</h1>
        <p className="text-slate-400">Monitor your active parking session in real-time.</p>
      </div>

      {!activeSession ? (
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-12 text-center shadow-xl">
          <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock size={40} className="text-slate-500" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No Active Session</h2>
          <p className="text-slate-400 mb-8 max-w-md mx-auto">
            You don't have any vehicle currently parked. Book a slot and start your session to see the live tracker.
          </p>
          <button 
            onClick={() => navigate('/book')}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-medium shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all"
          >
            Find a Slot
          </button>
        </div>
      ) : (
        <div className="bg-slate-800 border border-emerald-500/30 rounded-3xl p-8 shadow-[0_0_50px_rgba(16,185,129,0.1)] relative overflow-hidden">
          {/* Radar animation background */}
          <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none overflow-hidden">
            <div className="w-[500px] h-[500px] bg-emerald-500 rounded-full animate-ping" style={{ animationDuration: '4s' }}></div>
          </div>

          <div className="relative z-10 flex flex-col items-center">
            <div className="w-32 h-32 rounded-full border-4 border-emerald-500/30 border-t-emerald-400 flex items-center justify-center mb-6 animate-[spin_10s_linear_infinite]">
              <div className="w-28 h-28 rounded-full bg-slate-900 flex items-center justify-center animate-[spin_10s_linear_infinite_reverse]">
                <Clock size={40} className="text-emerald-400" />
              </div>
            </div>

            <div className="text-5xl font-mono font-bold text-white tracking-wider mb-2 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]">
              {activeSession.status === 'reserved' ? '--:--:--' : (elapsedTime || '00:00:00')}
            </div>
            
            {activeSession.status === 'reserved' ? (
              <div className="text-yellow-400 font-medium tracking-widest uppercase text-sm mb-10 flex items-center gap-2">
                Slot Reserved - Waiting for Car
              </div>
            ) : (
              <div className="text-emerald-400 font-medium tracking-widest uppercase text-sm mb-10 flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                Session Active
              </div>
            )}

            <div className="w-full grid grid-cols-2 gap-4 mb-10">
              <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-700/50 flex flex-col items-center text-center">
                <MapPin size={24} className="text-blue-500 mb-2" />
                <span className="text-slate-400 text-xs uppercase tracking-wider mb-1">Location</span>
                <span className="text-white font-medium">Slot {activeSession.slotId?.slotNumber || '---'}</span>
              </div>
              
              <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-700/50 flex flex-col items-center text-center">
                <Tag size={24} className="text-purple-500 mb-2" />
                <span className="text-slate-400 text-xs uppercase tracking-wider mb-1">Rate</span>
                <span className="text-white font-medium">₹10 / Hour</span>
              </div>
            </div>

            {activeSession.status === 'reserved' ? (
              <button 
                onClick={handleStartSession}
                disabled={actionLoading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl p-4 font-bold shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all flex items-center justify-center gap-2"
              >
                <Play size={20} />
                Park Car / Start Time
              </button>
            ) : (
              <button 
                onClick={handleEndSession}
                disabled={actionLoading}
                className="w-full bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 rounded-xl p-4 font-bold transition-all flex items-center justify-center gap-2"
              >
                <Square size={20} />
                Remove Car / Generate Bill
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Sessions;
