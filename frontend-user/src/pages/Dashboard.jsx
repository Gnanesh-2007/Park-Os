import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, Car, Clock, CreditCard, ChevronRight } from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [activeSession, setActiveSession] = useState(null);
  const [stats, setStats] = useState({ totalBookings: 0, totalSpent: 0 });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const historyRes = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/parking/session/history`);
        const sessions = historyRes.data;
        
        const active = sessions.find(s => s.status === 'active');
        if (active) setActiveSession(active);

        const billingRes = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/billing/history`);
        const bills = billingRes.data;
        
        const totalSpent = bills.reduce((acc, bill) => acc + (bill.amount || 0), 0);
        
        setStats({
          totalBookings: sessions.length,
          totalSpent: totalSpent
        });

      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
            Welcome back, {user?.name.split(' ')[0]}
          </h1>
          <p className="text-slate-400 mt-1">Here is what's happening with your parking today.</p>
        </div>
        
        <Link 
          to="/book" 
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-medium shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_25px_rgba(37,99,235,0.6)] transition-all flex items-center justify-center gap-2"
        >
          <Car size={20} />
          Book a Slot
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden group hover:border-blue-500/50 transition-colors">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-blue-500/20 transition-colors"></div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="text-slate-400 font-medium">Active Session</h3>
            <div className={`p-2 rounded-lg transition-all duration-500 ${activeSession ? 'bg-emerald-500/20 text-emerald-400 ring-2 ring-emerald-500/50 animate-pulse' : 'bg-slate-700 text-slate-400'}`}>
              <Clock size={20} />
            </div>
          </div>
          <p className="text-2xl font-bold text-white relative z-10">
            {activeSession ? 'In Progress' : 'None'}
          </p>
          {activeSession && (
             <Link to="/session" className="text-sm text-emerald-400 mt-2 flex items-center gap-1 hover:underline relative z-10">
               View Live Tracker <ChevronRight size={14} />
             </Link>
          )}
        </div>

        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-emerald-500/20 transition-colors"></div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="text-slate-400 font-medium">Total Bookings</h3>
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Car size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-white relative z-10">{stats.totalBookings}</p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden group hover:border-purple-500/50 transition-colors">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-purple-500/20 transition-colors"></div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="text-slate-400 font-medium">Total Spent</h3>
            <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
              <CreditCard size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-white relative z-10">₹{stats.totalSpent}</p>
        </div>
      </div>

      {/* Quick Actions / Getting Started */}
      <div className="bg-slate-800/30 border border-slate-700/30 rounded-2xl p-8">
        <h2 className="text-xl font-semibold mb-6">Getting Started</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div className="bg-slate-800/80 p-5 rounded-xl border border-white/5 hover:bg-slate-700/80 transition-colors">
              <div className="bg-blue-500 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mb-4 shadow-[0_0_15px_rgba(59,130,246,0.5)]">1</div>
              <h3 className="font-semibold text-white mb-2">Find a Parking Zone</h3>
              <p className="text-sm text-slate-400 text-pretty">Browse available parking zones across the city and find the most convenient location for your destination.</p>
           </div>
           <div className="bg-slate-800/80 p-5 rounded-xl border border-white/5 hover:bg-slate-700/80 transition-colors">
              <div className="bg-emerald-500 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mb-4 shadow-[0_0_15px_rgba(16,185,129,0.5)]">2</div>
              <h3 className="font-semibold text-white mb-2">Reserve a Slot</h3>
              <p className="text-sm text-slate-400 text-pretty">Select a green (available) slot to reserve your parking space instantly before arrival to avoid hassle.</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
