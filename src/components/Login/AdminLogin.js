import React from 'react';
import '../Login/Login.css';
import { FaUser, FaLock } from 'react-icons/fa';
import parkingLot from '../../parkinglot.jpg';
import logo from '../../logo.svg';
import { useNavigate } from 'react-router-dom';
import {CredentialStore} from "./Login";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [debugInfo] = React.useState(null);

  // configurable base URL
  const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:9000';

  // helper to remove/mask sensitive fields before showing debug info
  const sanitizeForDebug = (obj) => {
    if (!obj) return obj;
    try {
      const clone = JSON.parse(JSON.stringify(obj));
      if (clone.password) clone.password = '<REDACTED>';
      if (clone.token) clone.token = '<REDACTED>';
      if (clone.authToken) clone.authToken = '<REDACTED>';
      // redact nested fields if present
      if (clone.data && typeof clone.data === 'object') {
        if (clone.data.token) clone.data.token = '<REDACTED>';
        if (clone.data.password) clone.data.password = '<REDACTED>';
      }
      return clone;
    } catch (_) {
      return '<unserializable>';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const email = e.target.elements.email.value;
    const password = e.target.elements.password.value;

    // ensure no password is accidentally kept in localStorage
    try { localStorage.removeItem('password'); } catch (_) {}

    const payload = {
      email,
      password,
      otpValidation: false,
      otpCode: null,
    };

    // do NOT log sensitive fields like password
    console.debug('AdminLogin - sending payload (masked)', {
      email: payload.email,
      isOtpValidation: payload.otpValidation,
      OTPCode: payload.otpCode,
    });

    setLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/parkinglot/api/v1/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      // attempt to parse body
      let data = null;
      try { data = await resp.json(); } catch (parseErr) {
        console.warn('AdminLogin - response not JSON', parseErr);
      }

      console.debug('AdminLogin - response status', resp.status, 'body (sanitized)', sanitizeForDebug(data));

      if (resp.ok) {
        if (data && data.token) {
          // store only auth related info (no password)
          localStorage.setItem('admin-auth', JSON.stringify({
            token: data.token,
            tokenType: data.tokenType || 'Bearer',
            role: data.role,
            userId: data.userId,
            parkingLotId: data.parkingLotId
          }));
          CredentialStore.name = data.name || 'Admin';
          CredentialStore.employeeId = data.employeeId || '';
          CredentialStore.role = data.role || '';
          // persist user info including employeeId so Header/user-popup can show it
          localStorage.setItem('user', JSON.stringify({ name: data.name || 'Admin', email, employeeId: data.employeeId || '' }));
          // ensure password is not stored anywhere
          try { localStorage.removeItem('password'); } catch (_) {}
          setLoading(false);
          navigate('/admin-dashboard');
        } else {
          const msg = (data && (data.message || data.error)) || 'Invalid login response (no token)';
          setLoading(false);
          setError(msg);
        }
      } else {
        const msg = (data && (data.message || data.error)) || `Login failed (${resp.status})`;
        setLoading(false);
        setError(msg);
      }
    } catch (err) {
      console.error('AdminLogin - error', err);
      setLoading(false);
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div className="login-outer-container">
      <div className="login-header">
        <div className="header-logo-title">
          <img src={logo} alt="Logo" className="header-logo" />
          <span className="header-title">Parking</span>
        </div>
        <div className="header-buttons">
          <button className="admin-btn" onClick={() => navigate('/login')}>Employee Login</button>
          <button className="register-btn" onClick={() => navigate('/register')}>Register</button>
        </div>
      </div>
      <div className="login-container">
        <div className="login-image-section">
          <div className="benefits-overlay">
            <h3>Why Choose Our Parking Lot?</h3>
            <ul>
              <li>Secure and monitored parking</li>
              <li>Easy online booking</li>
              <li>24/7 access</li>
              <li>Convenient locations</li>
              <li>Affordable rates</li>
            </ul>
          </div>
          <img src={parkingLot} alt="Parking Lot" className="login-image" />
        </div>
        <div className="login-form-section">
          <form className="login-form" onSubmit={handleSubmit}>
            <h2>Admin Login</h2>
            <div className="input-group">
              <FaUser className="input-icon" />
              <input type="email" name="email" placeholder="Admin Email" required />
            </div>
            <div className="input-group">
              <FaLock className="input-icon" />
              <input type="password" name="password" placeholder="Password" required />
            </div>
            {error && <div className="error-msg">{error}</div>}
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Signing in...' : 'Login'}
            </button>

            {/* lightweight debug output so you can confirm the API call (sensitive values redacted) */}
            {debugInfo && (
              <div className="debug-box" style={{ marginTop: 12, fontSize: 12, color: '#444' }}>
                <div><strong>Debug:</strong> status {debugInfo.status}</div>
                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {JSON.stringify(debugInfo.body, null, 2)}
                </pre>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
