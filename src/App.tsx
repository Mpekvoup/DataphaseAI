import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard/Dashboard';
import Tickets from './pages/Tickets/Tickets';
import Analytics from './pages/Analytics/Analytics';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import MyAnalytics from './pages/MyAnalytics/MyAnalytics';
import MLTraining from './pages/MLTraining/MLTraining';
import { Loader2 } from 'lucide-react';

// Компонент защиты маршрутов
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary-600" size={48} />
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="tickets" element={<Tickets />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="my-analytics" element={<MyAnalytics />} />
            <Route path="ml-training" element={<MLTraining />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
