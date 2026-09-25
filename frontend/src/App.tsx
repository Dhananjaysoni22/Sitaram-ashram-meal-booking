import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import CalendarView from './pages/CalendarView';
import NewBooking from './pages/NewBooking';
import Login from './pages/Login';
import StaffManagement from './pages/StaffManagement';
import Reports from './pages/Reports';
import Workers from './pages/Workers';
import MandirWorkers from './pages/MandirWorkers';
import Attendance from './pages/Attendance';
import WorkerReports from './pages/WorkerReports';
import Setup from './pages/Setup';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
      
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Home />} />
        <Route path="calendar" element={<CalendarView />} />
        <Route path="booking/new" element={<NewBooking />} />
        <Route path="staff" element={<StaffManagement />} />
        <Route path="reports" element={<Reports />} />
        <Route path="workers" element={<Workers />} />
        <Route path="mandir-workers" element={<MandirWorkers />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="workers/reports" element={<WorkerReports />} />
        <Route path="setup" element={<Setup />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
