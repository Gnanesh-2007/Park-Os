import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Camera, Play, Activity, Pause, RefreshCw } from 'lucide-react';

const AiCamera = () => {
  const [loading, setLoading] = useState(false);
  const [isAuto, setIsAuto] = useState(false);
  const [logs, setLogs] = useState([]);
  const autoInterval = useRef(null);
  
  const stockVideoUrl = "https://cdn.pixabay.com/video/2016/09/21/5426-183789495_large.mp4";

  const simulateAiEvent = async (type = 'entry') => {
    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/simulate-ai-camera`, { type });
      const { message, slot, session } = res.data;
      
      const newLog = {
        time: new Date().toLocaleTimeString(),
        message: type === 'entry' 
          ? `Vehicle detected entering. Assigned to Slot ${slot.slotNumber}.`
          : `Vehicle detected leaving Slot ${session.slotId.slotNumber || '?'}. Bill generated.`,
        status: 'success',
        type
      };
      
      setLogs(prev => [newLog, ...prev].slice(0, 50));
    } catch (error) {
       const newLog = {
        time: new Date().toLocaleTimeString(),
        message: error.response?.data?.message || 'AI System failed to process event.',
        status: 'error'
      };
      setLogs(prev => [newLog, ...prev].slice(0, 50));
      if (isAuto) setIsAuto(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuto) {
      autoInterval.current = setInterval(() => {
        const type = Math.random() > 0.4 ? 'entry' : 'exit';
        simulateAiEvent(type);
      }, 5000);
    } else {
      if (autoInterval.current) clearInterval(autoInterval.current);
    }
    return () => clearInterval(autoInterval.current);
  }, [isAuto]);

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="border-b border-slate-700/50 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 mb-2 flex items-center gap-3">
            <Camera size={32} className="text-cyan-400" />
            AI Computer Vision
          </h1>
          <p className="text-slate-400">Autonomous traffic simulation and detection system.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsAuto(!isAuto)}
            className={`${isAuto ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'} border px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2`}
          >
            {isAuto ? <Pause size={18} /> : <RefreshCw size={18} className="animate-spin-slow" />}
            {isAuto ? 'Stop Auto-Sim' : 'Start Auto-Sim'}
          </button>

          <button 
            onClick={() => simulateAiEvent('entry')}
            disabled={loading || isAuto}
            className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2.5 rounded-xl font-bold shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Play size={18} className="fill-current" />
            Manual Entry
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
           <div className="bg-slate-800 border-2 border-slate-700 rounded-3xl overflow-hidden shadow-2xl relative group h-[450px]">
              <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2">
                 <div className={`w-2 h-2 rounded-full ${isAuto ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                 <span className="text-white text-xs font-mono font-bold tracking-wider">
                   {isAuto ? 'AUTONOMOUS MODE ACTIVE' : 'LIVE FEED - STANDBY'}
                 </span>
              </div>
              
              <div className="absolute top-4 right-4 z-10 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                 <span className="text-cyan-400 text-xs font-mono">MODEL: ParkNet-v4.0_Pro</span>
              </div>

              {/* Enhanced HUD Overlays */}
              <div className="absolute inset-0 z-0 pointer-events-none">
                 <div className="absolute top-[30%] left-[20%] w-[15%] h-[20%] border-2 border-cyan-500 bg-cyan-500/10 transition-all duration-1000 opacity-40">
                    <div className="absolute -top-6 left-0 text-[10px] text-cyan-400 font-mono bg-black/40 px-1">VEHICLE_01 [98%]</div>
                 </div>
                 <div className="absolute top-[45%] left-[55%] w-[18%] h-[25%] border-2 border-emerald-500 bg-emerald-500/10 transition-all duration-1000 opacity-40">
                    <div className="absolute -top-6 left-0 text-[10px] text-emerald-400 font-mono bg-black/40 px-1">VEHICLE_02 [94%]</div>
                 </div>
              </div>

              <video 
                src={stockVideoUrl} 
                autoPlay 
                loop 
                muted 
                playsInline
                className="w-full h-full object-cover grayscale-[30%] contrast-125"
              ></video>

              {/* Scanning effect */}
              {isAuto && (
                <div className="absolute top-0 left-0 w-full h-[2px] bg-cyan-400/50 shadow-[0_0_15px_rgba(34,211,238,0.8)] animate-scan z-20"></div>
              )}
           </div>
        </div>

        <div className="lg:col-span-1">
           <div className="bg-slate-900 border border-slate-700 rounded-3xl p-0 shadow-xl h-[450px] flex flex-col overflow-hidden">
              <div className="bg-slate-800/80 p-4 border-b border-slate-700 flex items-center justify-between">
                 <h3 className="text-slate-200 font-bold flex items-center gap-2">
                    <Activity size={18} className="text-cyan-400" />
                    AI Intelligence Logs
                 </h3>
                 <span className="text-[10px] text-slate-400 font-mono border border-slate-600 px-2 py-0.5 rounded-full uppercase">Buffer: 50</span>
              </div>
              
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-900 custom-scrollbar">
                 {logs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full opacity-30">
                       <Activity size={48} className="text-slate-600 mb-4 animate-pulse" />
                       <p className="text-sm text-slate-500">Awaiting visual events...</p>
                    </div>
                 ) : (
                    logs.map((log, i) => (
                       <div key={i} className={`p-4 rounded-2xl border text-sm animate-in slide-in-from-right-4 duration-300 ${
                          log.status === 'success' 
                             ? log.type === 'entry' ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-200' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                             : 'bg-red-500/10 border-red-500/30 text-red-200'
                       }`}>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] uppercase font-mono tracking-widest opacity-60 font-bold">{log.time}</span>
                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                               log.type === 'entry' ? 'bg-cyan-500/20' : 'bg-emerald-500/20'
                            }`}>
                               {log.type || 'SYSTEM'}
                            </span>
                          </div>
                          <div className="leading-relaxed font-medium">{log.message}</div>
                       </div>
                    ))
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AiCamera;
