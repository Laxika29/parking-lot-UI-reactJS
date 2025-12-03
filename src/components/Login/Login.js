import React, { useState, useEffect } from 'react';
import './Login.css';
import { FaUser, FaLock } from 'react-icons/fa';
import parkingLot from '../../parkinglot.jpg';
import logo from '../../logo.svg';
import { useNavigate } from 'react-router-dom';
import Toast from '../Toast';
import API_BASE_URL from '../../utils/apiConfig';

// Mock employee credentials (kept for local fallback/testing if needed)
const EMPLOYEE_CREDENTIALS = [
  { username: 'user', password: 'pwd', employeeId: 'EMP001', name: 'John Doe', parkingLot: 'GNIOT' },
  { username: 'user1', password: 'pwd', employeeId: 'EMP002', name: 'Jane Smith', parkingLot: 'Mall Of India' },
  { username: 'laxmi', password: 'laxmi', employeeId: 'LX08686', name: 'Laxmi Singh', parkingLot: 'Candor Parking' },
];

// Store logged-in employee details
export class CredentialStore {
  static username = '';
  static password = '';
  static employeeId = '';
  static parkingLot = '';
  static name = '';
  static role = '';

  static setCredentials(username, password, employeeId = '', name = '', parkingLot = '') {
    CredentialStore.username = username;
    CredentialStore.password = password;
    CredentialStore.employeeId = employeeId;
    CredentialStore.parkingLot = parkingLot;
    CredentialStore.name = name;
    // Persist to localStorage so state survives refresh
    try {
      localStorage.setItem('employeeCredentials', JSON.stringify({
        username,
        password,
        employeeId,
        name,
        parkingLot
      }));
    } catch (e) {
      // ignore storage errors
    }
  }

  static restore() {
    try {
      const data = localStorage.getItem('employeeCredentials');
      if (data) {
        const { username, password, employeeId, name, parkingLot } = JSON.parse(data);
        CredentialStore.username = username || '';
        CredentialStore.password = password || '';
        CredentialStore.employeeId = employeeId || '';
        CredentialStore.name = name || '';
        CredentialStore.parkingLot = parkingLot || '';
      }
    } catch (e) {
      // ignore parse errors
    }
  }

  static clear() {
    CredentialStore.username = '';
    CredentialStore.password = '';
    CredentialStore.employeeId = '';
    CredentialStore.name = '';
    CredentialStore.parkingLot = '';
    try {
      localStorage.removeItem('employeeCredentials');
    } catch (e) {
      // ignore
    }
  }
}

// Restore credentials on module load
CredentialStore.restore();

const Login = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  // OTP related state
  const [otpMode, setOtpMode] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [email, setEmail] = useState(CredentialStore.username || '');
  const [loading, setLoading] = useState(false);

  // Toast state
  const [toastShow, setToastShow] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('info');

  const showToast = (message, type = 'info') => {
    setToastMsg(message);
    setToastType(type);
    setToastShow(true);
  };

  useEffect(() => {
    // clear toast on unmount
    return () => setToastShow(false);
  }, []);

  const sendOtp = async () => {
    if (!email) {
      setError('Please enter your email or employee id');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password: null,
          otpValidation: true,
          otpCode: ''
        })
      });
      const json = await res.json();
      if (res.ok) {
        const message = json.message || json.msg || 'OTP sent to the email';
        showToast(message, 'success');
        setOtpSent(true);
      } else {
        const errMsg = json.message || json.error || 'Failed to send OTP';
        showToast(errMsg, 'error');
      }
    } catch (err) {
      showToast('Network error while sending OTP', 'error');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!email) {
      setError('Please enter your email or employee id');
      return;
    }
    if (!otpCode) {
      setError('Please enter OTP');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password: null,
          otpValidation: true,
          otpCode: otpCode
        })
      });
      const json = await res.json();
      if (res.ok && json && (json.token || json.userId)) {
        // Successful login with OTP
        CredentialStore.clear();
        CredentialStore.setCredentials(email, '', json.employeeId || '', json.name || '', '');
        showToast('Login successful', 'success');
        setTimeout(() => navigate('/employee-dashboard'), 600);
      } else {
        const errMsg = json.message || json.error || 'Invalid OTP or login failed';
        showToast(errMsg, 'error');
      }
    } catch (err) {
      showToast('Network error while verifying OTP', 'error');
    } finally {
      setLoading(false);
    }
  };

  // New: password-based login that calls backend with otpValidation:false and otpCode:null
  const passwordLogin = async (username, password) => {
    if (!username || !password) {
      setError('Please enter both email/employee id and password');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: username,
          password: password,
          otpValidation: false,
          otpCode: null
        })
      });
      const json = await res.json();
      if (res.ok && json && (json.token || json.userId)) {
        // Successful login via password
        CredentialStore.clear();
        CredentialStore.setCredentials(username, password, json.employeeId || '', json.name || '', json.parkingLot || '');
        showToast('Login successful', 'success');
        setTimeout(() => navigate('/employee-dashboard'), 600);
      } else {
        // Fallback: optionally check local mock credentials for offline testing
        const found = EMPLOYEE_CREDENTIALS.find(emp => emp.username === username && emp.password === password);
        if (found) {
          CredentialStore.clear();
          CredentialStore.setCredentials(username, password, found.employeeId, found.name, found.parkingLot);
          setError('');
          navigate('/employee-dashboard');
        } else {
          const errMsg = json.message || json.error || 'Invalid credentials';
          showToast(errMsg, 'error');
        }
      }
    } catch (err) {
      // On network error, try local mock behavior for developer convenience
      const found = EMPLOYEE_CREDENTIALS.find(emp => emp.username === username && emp.password === password);
      if (found) {
        CredentialStore.clear();
        CredentialStore.setCredentials(username, password, found.employeeId, found.name, found.parkingLot);
        setError('');
        navigate('/employee-dashboard');
      } else {
        showToast('Network error while logging in', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-outer-container">
      <Toast show={toastShow} message={toastMsg} type={toastType} onClose={() => setToastShow(false)} />
      <div className="login-header">
        <div className="header-logo-title">
          <img src={logo} alt="Logo" className="header-logo" />
          <span className="header-title">Parking</span>
        </div>
        <div className="header-buttons">
          <button className="admin-btn" onClick={() => navigate('/admin-login')}>Admin Portal</button>
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
          <form className="login-form" onSubmit={e => {
            e.preventDefault();
            const username = e.target.elements.username.value;
            // If OTP mode, handle OTP flows
            if (otpMode) {
              if (otpSent) {
                verifyOtp();
                return;
              }
              // If OTP mode but OTP not sent, do nothing on submit (user should click Send OTP)
              return;
            }

            // If not in OTP mode, use password-based login that calls backend
            const password = e.target.elements.password ? e.target.elements.password.value : '';
            passwordLogin(username, password);
          }}>
            <h2>Login</h2>
            <div className="input-group">
              <FaUser className="input-icon" />
              <input type="text" name="username" placeholder="Email ID / Employee ID" required value={email} onChange={e => setEmail(e.target.value)} />
            </div>

            {/* Password field only shown when not in OTP mode */}
            {!otpMode && (
              <div className="input-group">
                <FaLock className="input-icon" />
                <input type="password" name="password" placeholder="Password" required />
              </div>
            )}

            {/* When in OTP mode and OTP has been sent, show OTP input */}
            {otpMode && otpSent && (
              <div className="input-group" style={{ justifyContent: 'center', gap: '0.6rem' }}>
                <input type="text" name="otp" placeholder="Enter OTP" value={otpCode} onChange={e => setOtpCode(e.target.value)} style={{ flex: 1 }} />
              </div>
            )}

            {error && <div style={{ color: 'red', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{error}</div>}

            {/* Primary action(s) */}
            {!otpMode && <button type="submit" className="login-btn">Login</button>}

            {/* OTP mode actions */}
            {otpMode && !otpSent && (
              <button type="button" className="send-otp-btn" onClick={sendOtp} disabled={loading}>{loading ? 'Sending...' : 'Send OTP'}</button>
            )}
            {otpMode && otpSent && (
              <button type="button" className="verify-otp-btn" onClick={verifyOtp} disabled={loading}>{loading ? 'Verifying...' : 'Login with OTP'}</button>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
              <a href="/forget-password" className="forgot-password-link">Forgot password?</a>
              {!otpMode ? (
                // Replaced href="#" anchor with button to satisfy accessibility/linter rules
                <button type="button" className="forgot-password-link" onClick={(e) => { e.preventDefault(); setOtpMode(true); setOtpSent(false); setOtpCode(''); setError(''); }}>Login via OTP</button>
              ) : (
                <button type="button" className="forgot-password-link" onClick={(e) => { e.preventDefault(); setOtpMode(false); setOtpSent(false); setOtpCode(''); setError(''); }}>Login via Password</button>
              )}
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
