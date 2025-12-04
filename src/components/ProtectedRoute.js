import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { CredentialStore } from './Login/Login';
import Toast from './Toast';

/**
 * A wrapper component for routes that should only be accessible to authenticated users.
 * If the user is not authenticated, they will be redirected to the login page.
 */
const ProtectedRoute = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    // Re-validate authentication on route change or when component mounts
    CredentialStore.restore();
  }, [location.pathname]);

  // local state for showing a toast when an unauthenticated user attempts to open an admin route
  const [showToast, setShowToast] = useState(false);
  const toastMessage = 'Please login as admin';

  // Read auth token safely from localStorage
  let auth = null;
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('admin-auth') : null;
    if (raw) auth = JSON.parse(raw);
  } catch (e) {
    auth = null;
  }

  const authRole = (auth && auth.role) || CredentialStore.role || '';
  const isAdmin = typeof authRole === 'string' && authRole.toUpperCase() === 'ADMIN';
  const isEmployee = Boolean(CredentialStore.username);

  const unauthAdminAttempt = Boolean(location.pathname && location.pathname.startsWith('/admin') && !auth && !isEmployee);

  // If the user just attempted to open an admin page without auth, show toast
  useEffect(() => {
    if (unauthAdminAttempt) setShowToast(true);
  }, [unauthAdminAttempt]);

  // If accessing admin routes, require ADMIN role specifically
  if (location.pathname && location.pathname.startsWith('/admin')) {
    // If there's no auth and no employee session, show a side popup (toast) instead of redirecting
    if (!auth && !isEmployee) {
      return (
        <>
          <Toast show={showToast} message={toastMessage} type="error" onClose={() => setShowToast(false)} />
        </>
      );
    }

    // If auth present but role is not ADMIN (including employee sessions), show message
    if (!isAdmin) {
      return (
        <div style={{ padding: 24, textAlign: 'center', color: '#b00020', fontWeight: 600 }}>
          Not authorize
        </div>
      );
    }

    // admin ok
    return children;
  }

  // For non-admin protected routes, allow either employee or admin authenticated sessions
  const isAuthenticated = Boolean(CredentialStore.username || auth);
  if (!isAuthenticated) {
    // Redirect to employee login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, render the child components (protected content)
  return children;
};

export default ProtectedRoute;
