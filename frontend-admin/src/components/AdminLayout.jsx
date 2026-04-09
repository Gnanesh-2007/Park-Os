import { useContext } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  Car, LayoutDashboard, MapPin, Activity, Camera, CreditCard, 
  Settings, LogOut, Cpu, Database, Server, Terminal, Shield
} from 'lucide-react';

const AdminLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'System Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'Zone Operations', path: '/admin/zones', icon: MapPin },
    { label: 'Slot Infrastructure', path: '/admin/slots', icon: Car },
    { label: 'Traffic Monitor', path: '/admin/sessions', icon: Activity },
    { label: 'Computer Vision', path: '/admin/camera', icon: Camera },
    { label: 'Financial Audit', path: '/admin/billing', icon: CreditCard },
  ];

  return (
    <div className="flex bg-[#0a0a0c] min-h-screen text-slate-100 font-mono selection:bg-purple-500/40 overflow-hidden">
      {/* Sidebar - Admin Command Center Style */}
      <aside className="w-80 bg-[#111114] border-r border-indigo-500/20 flex flex-col relative z-50">
        <div className="h-20 flex items-center px-8 border-b border-indigo-500/20 bg-gradient-to-r from-purple-900/10 to-transparent">
           <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2 rounded-lg shadow-[0_0_20px_rgba(99,102,241,0.3)] mr-3 border border-indigo-400/30">
              <Cpu className="text-white h-6 w-6" />
           </div>
           <div className="flex flex-col">
              <h1 className="text-lg font-black tracking-widest text-indigo-100 uppercase">
                Park<span className="text-indigo-400 font-bold italic">OS</span>_Core
              </h1>
              <div className="text-[8px] text-emerald-500 font-bold uppercase tracking-tighter opacity-80 leading-none">
                 Secure Administrator Access
              </div>
           </div>
        </div>
        
        <div className="p-6 flex flex-col gap-1.5 flex-grow overflow-y-auto custom-scrollbar">
          <div className="text-[10px] font-bold text-indigo-400/50 uppercase tracking-[3px] mb-6 px-2 flex items-center gap-2">
            <Terminal size={12} />
            Control Hub
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-5 py-4 rounded-lg transition-all duration-300 group border ${
                  isActive 
                    ? 'bg-indigo-600/10 border-indigo-500/50 text-indigo-100 shadow-[inset_0_0_20px_rgba(99,102,241,0.2)]' 
                    : 'text-slate-500 border-transparent hover:bg-white/5 hover:text-indigo-400'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-indigo-400' : 'group-hover:text-indigo-400 transition-colors'} />
                <span className="font-bold text-xs uppercase tracking-wider">{item.label}</span>
                {isActive && <div className="ml-auto w-1 h-4 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,1)]"></div>}
              </Link>
            );
          })}
        </div>

        {/* Admin Footer */}
        <div className="p-6 border-t border-indigo-500/20 bg-black/20">
           <div className="bg-[#1a1a1f] rounded-xl p-4 mb-5 border border-indigo-500/10 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-indigo-600/30 flex items-center justify-center font-bold text-indigo-400 border border-indigo-500/20">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-indigo-100 truncate">{user?.name}</div>
                <div className="flex items-center gap-1.5 mt-1">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                   <span className="text-[9px] text-emerald-400 uppercase tracking-tighter font-black">Auth Level: 0</span>
                </div>
              </div>
           </div>
           
           <div className="grid grid-cols-2 gap-2 mb-4">
              <button className="flex items-center justify-center gap-1.5 py-2 bg-slate-800/50 hover:bg-slate-800 text-slate-500 hover:text-indigo-400 rounded-lg transition-all text-xs border border-white/5">
                 <Shield size={12} />
                 Admin
              </button>
              <button className="flex items-center justify-center gap-1.5 py-2 bg-slate-800/50 hover:bg-slate-800 text-slate-500 hover:text-indigo-400 rounded-lg transition-all text-xs border border-white/5">
                 <Server size={12} />
                 Logs
              </button>
           </div>

           <button
             onClick={handleLogout}
             className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-red-600/10 hover:bg-red-600/20 text-red-400 rounded-lg transition-all text-xs font-black uppercase border border-red-500/20"
           >
             <LogOut size={16} />
             <span>Terminate Session</span>
           </button>
        </div>
      </aside>

      {/* Main Command Display */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
         {/* System Monitor Bar */}
         <header className="h-20 bg-[#111114]/90 backdrop-blur-xl border-b border-indigo-500/20 px-8 flex items-center justify-between z-40">
            <div className="flex items-center gap-10">
               <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Sys_Load</span>
                  <div className="flex items-center gap-3">
                     <div className="h-2 w-32 bg-slate-800 rounded-full overflow-hidden border border-indigo-500/20">
                        <div className="h-full bg-emerald-500/80 w-[42%] shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                     </div>
                     <span className="text-[10px] text-emerald-400 font-bold">42%</span>
                  </div>
               </div>
               <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Net_Status</span>
                  <div className="flex items-center gap-2 text-indigo-400">
                     <Database size={14} />
                     <span className="text-[10px] font-bold">STABLE // 128ms</span>
                  </div>
               </div>
            </div>
            
            <div className="flex items-center gap-4">
               <div className="text-right mr-4 font-mono">
                  <div className="text-[10px] text-slate-500 uppercase font-black">Network Time</div>
                  <div className="text-indigo-100 text-sm font-bold tracking-widest">{new Date().toLocaleTimeString()}</div>
               </div>
               <button className="bg-indigo-600/10 p-3 rounded-lg hover:bg-indigo-600/20 transition-all border border-indigo-500/30 group">
                  <Settings size={20} className="text-indigo-400 group-hover:rotate-90 transition-transform duration-500" />
               </button>
            </div>
         </header>

         {/* Grid background effect */}
         <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
         </div>

         <main className="flex-1 overflow-auto p-10 relative z-10 custom-scrollbar">
            <Outlet />
         </main>
      </div>
    </div>
  );
};

export default AdminLayout;
