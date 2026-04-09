import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Users, MapPin, Car, CreditCard, TrendingUp, PieChart as PieChartIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    users: 0,
    zones: 0,
    slots: 0,
    revenue: 0,
    activeSessions: 0
  });
  const [revenueData, setRevenueData] = useState([]);
  const [occupancyData, setOccupancyData] = useState([]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [usersRes, zonesRes, billingRes, revenueAnRes, occupancyAnRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/users`),
          axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/parking/zones`),
          axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/billing`),
          axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/analytics/revenue`),
          axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/analytics/occupancy`)
        ]);

        const totalRevenue = billingRes.data
          .filter(b => b.paymentStatus === 'paid')
          .reduce((acc, curr) => acc + curr.amount, 0);

        const activeSessions = billingRes.data.filter(b => b.sessionId?.status === 'active').length;

        // Fetch total slots across all zones
        let totalSlots = 0;
        for (const z of zonesRes.data) {
           const sRes = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/parking/slots/${z._id}`);
           totalSlots += sRes.data.length;
        }

        setStats({
          users: usersRes.data.length,
          zones: zonesRes.data.length,
          slots: totalSlots,
          revenue: totalRevenue,
          activeSessions
        });

        setRevenueData(revenueAnRes.data);
        setOccupancyData(occupancyAnRes.data);

      } catch (error) {
        console.error("Failed to fetch admin stats", error);
      }
    };

    fetchAdminData();
  }, []);

  const StatCard = ({ title, value, icon: Icon, color, link, linkText }) => (
    <div className={`bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden group hover:border-${color}-500/50 transition-colors`}>
      <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-${color}-500/20 transition-colors`}></div>
      <div className="flex items-center justify-between mb-4 relative z-10">
        <h3 className="text-slate-400 font-medium">{title}</h3>
        <div className={`p-2 rounded-lg bg-${color}-500/20 text-${color}-400`}>
          <Icon size={20} />
        </div>
      </div>
      <p className="text-3xl font-bold text-white relative z-10 mb-4">{value}</p>
      {link && (
        <Link to={link} className={`text-sm text-${color}-400 font-medium hover:underline relative z-10`}>
          {linkText}
        </Link>
      )}
    </div>
  );

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
            Admin Dashboard
          </h1>
          <p className="text-slate-400 mt-1">System Overview and Management</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Users" value={stats.users} icon={Users} color="blue" />
        <StatCard title="Parking Zones" value={stats.zones} icon={MapPin} color="emerald" link="/admin/zones" linkText="Manage Zones" />
        <StatCard title="Total Slots" value={stats.slots} icon={Car} color="purple" link="/admin/slots" linkText="Manage Slots" />
        <StatCard title="Total Revenue" value={`₹${stats.revenue}`} icon={CreditCard} color="yellow" link="/admin/billing" linkText="View Records" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Occupancy Trend */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6 shadow-xl backdrop-blur-md">
           <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                 <TrendingUp size={20} className="text-blue-400" />
                 Occupancy Trend (Last 7 Days)
              </h2>
           </div>
           <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={occupancyData}>
                    <defs>
                       <linearGradient id="colorOccupancy" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                       contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }}
                       itemStyle={{ color: '#f8fafc' }}
                    />
                    <Area type="monotone" dataKey="occupancy" stroke="#3b82f6" fillOpacity={1} fill="url(#colorOccupancy)" strokeWidth={3} />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Revenue by Zone */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6 shadow-xl backdrop-blur-md">
           <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                 <PieChartIcon size={20} className="text-emerald-400" />
                 Revenue Distribution
              </h2>
           </div>
           <div className="h-[300px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie
                       data={revenueData}
                       cx="50%"
                       cy="50%"
                       innerRadius={60}
                       outerRadius={100}
                       paddingAngle={5}
                       dataKey="value"
                    >
                       {revenueData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                       ))}
                    </Pie>
                    <Tooltip 
                       contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }}
                    />
                 </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2 ml-4">
                 {revenueData.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2">
                       <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                       <span className="text-xs text-slate-400">{entry.name}</span>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      <div className="bg-slate-800/30 border border-slate-700/30 rounded-2xl p-8 mt-8">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
          Quick Navigation
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <Link to="/admin/zones" className="bg-slate-800/80 p-5 rounded-xl border border-white/5 hover:bg-slate-700/80 transition-colors flex flex-col items-center text-center group">
              <MapPin className="text-emerald-400 mb-3 group-hover:scale-110 transition-transform" size={32} />
              <h3 className="font-semibold text-white mb-1">Add Parking Zone</h3>
              <p className="text-sm text-slate-400">Create a new parking area in the city.</p>
           </Link>
           <Link to="/admin/slots" className="bg-slate-800/80 p-5 rounded-xl border border-white/5 hover:bg-slate-700/80 transition-colors flex flex-col items-center text-center group">
              <Car className="text-blue-400 mb-3 group-hover:scale-110 transition-transform" size={32} />
              <h3 className="font-semibold text-white mb-1">Manage Slots</h3>
              <p className="text-sm text-slate-400">Configure total slots for each zone.</p>
           </Link>
           <Link to="/admin/billing" className="bg-slate-800/80 p-5 rounded-xl border border-white/5 hover:bg-slate-700/80 transition-colors flex flex-col items-center text-center group">
              <CreditCard className="text-purple-400 mb-3 group-hover:scale-110 transition-transform" size={32} />
              <h3 className="font-semibold text-white mb-1">Financial Records</h3>
              <p className="text-sm text-slate-400">View all bills and mock payments.</p>
           </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
