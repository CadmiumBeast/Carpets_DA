// Example App.jsx setup with authentication routes
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './auth/login';
import Signup from './auth/signup';
import { ProtectedRoute } from './auth/ProtectedRoute';
import './App.css';

// Example placeholder components (replace with your actual components)
const CustomerHome = () => <div><h1>Carpets.lk - Home</h1><p>Welcome to Sri Lanka's premium carpet store!</p></div>;
const AdminDashboard = () => <div><h1>Carpets.lk - Admin Dashboard</h1><p>Admin portal content</p></div>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Customer routes - Protected */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <CustomerHome />
            </ProtectedRoute>
          } 
        />
        
        {/* Admin routes - Protected */}
        <Route 
          path="/admin/*" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Catch all - redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
