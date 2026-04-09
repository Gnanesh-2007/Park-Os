import { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import UserLayout from './components/UserLayout';
import AdminLayout from './components/AdminLayout';

// Pages
import Portal from './pages/Portal';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Zones from './pages/Zones';
import BookSlot from './pages/BookSlot';
import Sessions from './pages/Sessions';
import AdminDashboard from './pages/AdminDashboard';
import ManageZones from './pages/ManageZones';
import ManageSlots from './pages/ManageSlots';
import AdminSessions from './pages/AdminSessions';
import AiCamera from './pages/AiCamera';
import Billing from './pages/Billing';

// Chatbot Widget
import ChatbotWidget from './components/ChatbotWidget';

// Route Guards
const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-900 text-white">Loading...</div>;
  
  if (!user) return <Navigate to="/login" replace />;
  
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }
  
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-900 text-white">Loading...</div>;
  
  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }
  
  return children;
};

function App() {
  const { user } = useContext(AuthContext);

  return (
    <>
      <Routes>
        {/* Public Auth Routes */}
        <Route path="/" element={<PublicRoute><Portal /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        
        {/* User Workspace */}
        <Route element={<ProtectedRoute role="user"><UserLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/zones" element={<Zones />} />
          <Route path="/book" element={<BookSlot />} />
          <Route path="/session" element={<Sessions />} />
          <Route path="/history" element={<Billing />} />
        </Route>

        {/* Admin Command Center */}
        <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="zones" element={<ManageZones />} />
          <Route path="slots" element={<ManageSlots />} />
          <Route path="sessions" element={<AdminSessions />} />
          <Route path="camera" element={<AiCamera />} />
          <Route path="billing" element={<Billing />} />
        </Route>
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global Chatbot Widget */}
      {user && <ChatbotWidget />}
    </>
  );
}

export default App;
