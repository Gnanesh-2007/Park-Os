import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Car, Lock, Mail, Shield, ArrowLeft } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Detect role from query param
  const queryParams = new URLSearchParams(location.search);
  const role = queryParams.get('role') || 'user'; // Default to user
  const isAdmin = role === 'admin';

  const theme = isAdmin 
    ? {
        primary: 'indigo-500', 
        gradient: 'from-purple-900/40 via-slate-900 to-indigo-900/40',
        btn: 'from-indigo-600 to-purple-600',
        text: 'text-indigo-400',
        accent: 'purple-500',
        icon: Shield,
        title: 'Admin Command',
        tagline: 'Authenticate to access central control'
      }
    : {
        primary: 'cyan-500',
        gradient: 'from-cyan-900/20 via-slate-950 to-blue-900/20',
        btn: 'from-cyan-600 to-blue-600',
        text: 'text-cyan-400',
        accent: 'cyan-400',
        icon: Car,
        title: 'User Portal',
        tagline: 'Sign in to manage your parking'
      };

  const Icon = theme.icon;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return setError('Please fill all fields');
    
    setLoading(true);
    setError('');
    
    try {
      const fetchedUser = await login(email, password);
      
      // Strict Role Enforcement
      if (isAdmin && fetchedUser.role !== 'admin') {
         logout();
         setLoading(false);
         return setError("Access Denied: Insufficient clearance for Admin Command.");
      }
      
      if (!isAdmin && fetchedUser.role === 'admin') {
         logout();
         setLoading(false);
         return setError("Access Denied: Administrators must use the Admin Command portal.");
      }
      
      if (fetchedUser.role === 'admin') navigate('/admin');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans`}>
      {/* Background decoration */}
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} opacity-50`}></div>
      <div className={`absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-${theme.accent}/10 rounded-full blur-[120px] transition-all duration-1000`}></div>
      <div className={`absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-${theme.primary}/10 rounded-full blur-[120px] transition-all duration-1000`}></div>
      
      <Link 
        to="/" 
        className="absolute top-8 left-8 flex items-center gap-2 text-slate-500 hover:text-white transition-colors z-20 group"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-xs font-bold uppercase tracking-widest">Back to Selection</span>
      </Link>

      <div className="max-w-md w-full relative z-10 bg-slate-900/40 backdrop-blur-3xl rounded-[32px] shadow-2xl overflow-hidden border border-white/5 animate-in zoom-in-95 duration-500">
        <div className="p-10">
          <div className="flex flex-col items-center mb-10 text-center">
            <div className={`h-20 w-20 bg-${theme.primary}/10 rounded-3xl flex items-center justify-center mb-6 border border-${theme.primary}/20 shadow-lg shadow-${theme.primary}/5`}>
              <Icon className={`h-10 w-10 text-${theme.accent}`} />
            </div>
            <h2 className={`text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r ${isAdmin ? 'from-indigo-400 to-purple-400' : 'from-cyan-400 to-blue-400'}`}>
              {theme.title}
            </h2>
            <p className="text-slate-500 mt-2 text-sm font-medium tracking-tight">{theme.tagline}</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-5 py-3 rounded-2xl mb-8 text-sm flex items-center font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[2px] mb-2 px-1">Identity Token / Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors">
                  <Mail className={`h-5 w-5 text-slate-500 group-focus-within:${theme.text}`} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/5 rounded-2xl focus:ring-2 focus:ring-opacity-50 focus:ring-white/20 focus:bg-white/10 text-white placeholder-slate-600 transition-all outline-none font-medium"
                  placeholder="admin@parkos.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[2px] mb-2 px-1">Access Protocol / Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className={`h-5 w-5 text-slate-500 group-focus-within:${theme.text}`} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/5 rounded-2xl focus:ring-2 focus:ring-opacity-50 focus:ring-white/20 focus:bg-white/10 text-white placeholder-slate-600 transition-all outline-none font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-4 px-4 rounded-2xl text-sm font-black text-white bg-gradient-to-r ${theme.btn} hover:opacity-90 focus:outline-none transition-all shadow-xl shadow-black/20 uppercase tracking-widest disabled:opacity-50 mt-4 active:scale-95`}
            >
              {loading ? 'Validating...' : 'Authorize Access'}
            </button>
          </form>

          {!isAdmin && (
            <p className="mt-10 text-center text-sm text-slate-500 font-medium">
              New to ParkOS?{' '}
              <Link to="/register" className="font-bold text-cyan-400 hover:text-cyan-300 transition-colors decoration-cyan-400/30 underline underline-offset-4 decoration-2">
                Create Account
              </Link>
            </p>
          )}
        </div>
      </div>
      
      <div className="mt-12 flex items-center gap-6 opacity-20">
         <div className="h-[1px] w-12 bg-slate-500"></div>
         <span className="text-[10px] font-black text-slate-500 uppercase tracking-[4px]">Verified Infrastructure</span>
         <div className="h-[1px] w-12 bg-slate-500"></div>
      </div>
    </div>
  );
};

export default Login;
