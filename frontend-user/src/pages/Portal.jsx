import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Shield, ArrowRight, Cpu, Globe, Lock } from 'lucide-react';

const Portal = () => {
  const navigate = useNavigate();

  const handleChoice = (role) => {
    navigate(`/login?role=${role}`);
  };

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] animate-pulse delay-1000"></div>
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.03] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:60px_60px]"></div>

      <div className="max-w-6xl w-full z-10">
        <div className="text-center mb-16 animate-in slide-in-from-top-10 duration-1000">
          <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-full mb-6">
             <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
             <span className="text-xs font-bold text-slate-400 uppercase tracking-[3px]">System v4.2 Pro Online</span>
          </div>
          <h1 className="text-6xl font-black text-white mb-4 tracking-tighter">
            Next-Gen <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">ParkOS</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto font-medium">
            The most advanced parking orchestration platform. Choose your entry point to access specialized tools.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-[500px]">
          
          {/* User Portal Card */}
          <div 
            onClick={() => handleChoice('user')}
            className="group relative bg-slate-900/40 backdrop-blur-2xl border border-cyan-500/20 rounded-[40px] p-10 cursor-pointer overflow-hidden transition-all duration-700 hover:border-cyan-500/50 hover:shadow-[0_0_50px_rgba(6,182,212,0.15)] flex flex-col justify-between"
          >
             <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[80px] -mr-32 -mt-32 group-hover:bg-cyan-500/10 transition-colors"></div>
             
             <div>
                <div className="w-16 h-16 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-cyan-500/10">
                   <Car size={32} className="text-cyan-400" />
                </div>
                <h2 className="text-4xl font-black text-white mb-4">User Portal</h2>
                <p className="text-slate-400 text-lg leading-relaxed max-w-sm">
                  Access booking, real-time slot availability, and manage your parking sessions with a premium consumer experience.
                </p>
             </div>

             <div className="flex items-center gap-4 mt-8">
                <div className="flex-1 h-[2px] bg-gradient-to-r from-cyan-500/0 via-cyan-500/20 to-cyan-500/0"></div>
                <div className="flex items-center gap-2 text-cyan-400 font-bold uppercase tracking-widest text-xs group-hover:gap-4 transition-all">
                   Enter Workspace <ArrowRight size={18} />
                </div>
             </div>
             
             {/* Decorative Elements */}
             <div className="absolute bottom-10 left-10 opacity-10 group-hover:opacity-30 transition-opacity">
                <Globe size={120} className="text-cyan-500" />
             </div>
          </div>

          {/* Admin Portal Card */}
          <div 
            onClick={() => handleChoice('admin')}
            className="group relative bg-slate-900/40 backdrop-blur-2xl border border-purple-500/20 rounded-[40px] p-10 cursor-pointer overflow-hidden transition-all duration-700 hover:border-purple-500/50 hover:shadow-[0_0_50px_rgba(168,85,247,0.15)] flex flex-col justify-between"
          >
             <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-[80px] -mr-32 -mt-32 group-hover:bg-purple-500/10 transition-colors"></div>
             
             <div>
                <div className="w-16 h-16 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-purple-500/10">
                   <Shield size={32} className="text-purple-400" />
                </div>
                <h2 className="text-4xl font-black text-white mb-4">Admin Command</h2>
                <p className="text-slate-400 text-lg leading-relaxed max-w-sm">
                  Full system orchestration, computer vision monitoring, financial auditing, and advanced infrastructure management.
                </p>
             </div>

             <div className="flex items-center gap-4 mt-8">
                <div className="flex-1 h-[2px] bg-gradient-to-r from-purple-500/0 via-purple-500/20 to-purple-500/0"></div>
                <div className="flex items-center gap-2 text-purple-400 font-bold uppercase tracking-widest text-xs group-hover:gap-4 transition-all">
                   System Access <Lock size={18} />
                </div>
             </div>

             {/* Decorative Elements */}
             <div className="absolute bottom-10 left-10 opacity-10 group-hover:opacity-20 transition-opacity">
                <Cpu size={120} className="text-purple-500" />
             </div>
          </div>

        </div>

        <div className="mt-12 text-center text-slate-500 text-sm font-mono tracking-widest uppercase opacity-50 flex items-center justify-center gap-4">
           <span>TLS 1.3 SECURE CONNECTION</span>
           <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
           <span>AES-256 ENCRYPTED</span>
        </div>
      </div>
    </div>
  );
};

export default Portal;
