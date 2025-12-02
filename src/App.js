import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Login from './components/Login/Login';
import ForgetPassword from './components/ForgetPassword/ForgetPassword';
import Register from './components/Register/Register';
import AdminLogin from './components/Login/AdminLogin';
import AdminDashboard from './components/admin-portal/AdminDashboard';
import EmployeeDashboard from './components/dashboard/EmployeeDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  // Logout helper component
  const Logout = () => {
    const [done, setDone] = React.useState(false);
    React.useEffect(() => {
      // clear all localStorage so no secrets remain
      try {
        localStorage.clear();
      } catch (_) {}
      setDone(true);
    }, []);
    if (done) return <Navigate to="/admin-login" replace />;
    return null;
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forget-password" element={<ForgetPassword />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/logout" element={<Logout />} />
        <Route
          path="/employee-dashboard/*"
          element={
            <ProtectedRoute>
              <EmployeeDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
