import { useContext } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  Car, LayoutDashboard, MapPin, Clock, History, LogOut, User, Bell, Search 
} from 'lucide-react';

const UserLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Book Slot', path: '/book', icon: MapPin },
    { label: 'Active Session', path: '/session', icon: Clock },
    { label: 'History', path: '/history', icon: History },
  ];

  return (
    <div className="flex bg-slate-950 min-h-screen text-slate-100 font-sans selection:bg-cyan-500/30">
      {/* Sidebar - User Style */}
      <aside className="w-72 bg-slate-900/50 backdrop-blur-2xl border-r border-white/5 flex flex-col active:w-72 transition-all duration-500">
        <div className="h-20 flex items-center px-8 border-b border-white/5">
           <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-2 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.4)] mr-3">
              <Car className="text-white h-6 w-6" />
           </div>
           <h1 className="text-xl font-black tracking-tight text-white">
             Park<span className="text-cyan-400">OS</span>
           </h1>
        </div>
        
        <div className="p-6 flex flex-col gap-1 flex-grow">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[2px] mb-4 px-2">
            Main Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                  isActive 
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-700 text-white shadow-xl shadow-cyan-900/20' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-white' : 'group-hover:text-cyan-400 transition-colors'} />
                <span className="font-semibold text-sm">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* User Card */}
        <div className="p-6 border-t border-white/5">
           <div className="bg-white/5 rounded-3xl p-4 mb-4 flex items-center gap-3 border border-white/5">
              <div className="h-10 w-10 rounded-full bg-cyan-500 flex items-center justify-center font-bold text-white shadow-lg shadow-cyan-500/20">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <div className="text-sm font-bold text-white truncate">{user?.name}</div>
                <div className="text-[10px] text-cyan-400/70 font-mono tracking-tighter uppercase">Standard Member</div>
              </div>
           </div>
           <button
             onClick={handleLogout}
             className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-800 hover:bg-red-500/10 hover:text-red-400 text-slate-400 rounded-2xl transition-all text-sm font-bold"
           >
             <LogOut size={16} />
             <span>Sign Out</span>
           </button>
        </div>
      </aside>

      {/* Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
         {/* Top Bar */}
         <header className="h-20 bg-slate-950/50 backdrop-blur-md border-b border-white/5 px-8 flex items-center justify-between sticky top-0 z-40">
            <div className="relative w-96 group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
               <input 
                 type="text" 
                 placeholder="Search zones, history, slots..." 
                 className="w-full bg-white/5 border border-white/5 rounded-2xl py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:bg-white/10 transition-all"
               />
            </div>
            
            <div className="flex items-center gap-4">
               <button className="bg-white/5 p-2.5 rounded-xl hover:bg-white/10 transition-colors relative border border-white/5">
                  <Bell size={20} className="text-slate-400" />
                  <div className="absolute top-2 right-2 w-2 h-2 bg-cyan-500 rounded-full border-2 border-slate-900"></div>
               </button>
               <div className="h-10 w-[2px] bg-white/5 mx-2"></div>
               <button className="flex items-center gap-2 bg-cyan-500/10 text-cyan-400 px-4 py-2 rounded-xl border border-cyan-500/20 font-bold text-sm hover:bg-cyan-500/20 transition-all">
                  <User size={18} />
                  Profile
               </button>
            </div>
         </header>

         <main className="flex-1 overflow-auto p-8 custom-scrollbar">
            <Outlet />
         </main>
      </div>
    </div>
  );
};

export default UserLayout;
