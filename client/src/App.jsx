import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './auth/login';
import Signup from './auth/signup';
import { ProtectedRoute } from './auth/ProtectedRoute';
import Header from './components/Header';
import './App.css';

const CustomerHome = () => (
  <div className="page">
    <h1>Carpets.lk</h1>
    <p>Welcome to Sri Lanka's premium carpet store.</p>
  </div>
);

const AdminDashboard = () => (
  <div className="page">
    <h1>Admin Dashboard</h1>
    <p>Manage products, categories, and orders.</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/"
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <CustomerHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
