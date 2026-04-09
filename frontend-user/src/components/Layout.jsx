import { useContext } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Car, LayoutDashboard, MapPin, Clock, History, CreditCard, LogOut, Settings, Camera, Activity } from 'lucide-react';

const Layout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = user?.role === 'admin' ? [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Manage Zones', path: '/admin/zones', icon: MapPin },
    { label: 'Manage Slots', path: '/admin/slots', icon: Car },
    { label: 'Active Sessions', path: '/admin/sessions', icon: Activity },
    { label: 'AI Camera', path: '/admin/camera', icon: Camera },
    { label: 'Billing Records', path: '/admin/billing', icon: CreditCard },
  ] : [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Book Slot', path: '/book', icon: MapPin },
    { label: 'Active Session', path: '/session', icon: Clock },
    { label: 'Parking History', path: '/history', icon: History },
  ];

  if (!user) return <Outlet />; // For login/register pages which don't have a layout

  return (
    <div className="flex bg-slate-900 min-h-screen text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col transition-all duration-300">
        <div className="h-16 flex items-center justify-center border-b border-slate-700">
          <Car className="text-blue-500 mr-2 h-8 w-8" />
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
            ParkOS
          </h1>
        </div>
        
        <div className="p-4 flex flex-col gap-2 flex-grow">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-600 shadow-lg shadow-blue-500/20 text-white' 
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-3 mb-4 px-2 text-slate-300">
            <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-lg text-blue-400">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden whitespace-nowrap overflow-ellipsis">
              <div className="font-medium">{user.name}</div>
              <div className="text-xs text-slate-500 capitalize">{user.role}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-slate-700 hover:bg-red-500/20 hover:text-red-400 text-slate-300 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-slate-900 border-l border-white/5 shadow-[inset_0_2px_20px_rgba(0,0,0,0.5)]">
        <div className="p-8 max-w-7xl mx-auto min-h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
