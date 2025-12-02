import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Login/Login.css';
import parkingLot from '../../parkinglot.jpg';
import LoadingOverlay from '../LoadingOverlay';
import Header from '../Header';
import API_BASE_URL from '../../utils/apiConfig';
import Toast from '../Toast';

const Register = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [parkingLotValue, setParkingLot] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleParkingLotChange = (e) => {
    setParkingLot(e.target.value);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) {
      setError('Invalid Name');
      return;
    }
    if (!form.email) {
      setError('Invalid Email ID');
      return;
    }
    if (!parkingLotValue) {
      setError('Invalid Parking Lot ID');
      return;
    }
    if (!form.password) {
      setError('Invalid Password');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Password mismatch');
      return;
    }
    setLoading(true);

    // Map parkingLotValue to parkingLotId
    const parkingLotMap = {
      'GNIOT Parking Lot': 2,
      'DLF Parking': 3,
      'Spectrum Metro Parking': 4,
      'Candor Parking': 1,
      'Logix Parking': 5
    };
    const parkingLotId = parkingLotMap[parkingLotValue] || 0;

    const payload = {
      fullName: form.name,
      emailId: form.email,
      parkingLotId,
      password: form.password
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
      });
      const text = await res.text();
      setLoading(false);
      if (res.ok && text === 'Registration Successful') {
        setToast({ show: true, message: 'Registration Successful!', type: 'success' });
        setTimeout(() => navigate('/login'), 1500);
      } else {
        setToast({ show: true, message: text || 'Registration failed', type: 'error' });
        setError(text);
      }
    } catch (err) {
      setLoading(false);
      setToast({ show: true, message: 'Network error', type: 'error' });
      setError('Network error');
    }
  };

  return (
    <>
      <Toast show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
      <LoadingOverlay show={loading} />
      <div className="login-outer-container">
        <Header showAdmin={true} showEmployee={true} showRegister={false} />
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
            <img src={parkingLot} alt="Parking Lot" className="login-image" style={{ display: 'block' }} />
          </div>
          <div className="login-form-section">
            <form className="login-form" onSubmit={handleSubmit} autoComplete="off">
              <h2>Register</h2>
              <div className="input-group">
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  autoFocus
                />
              </div>
              <div className="input-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Email ID"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-group">
                <select name="parkingLot" value={parkingLotValue} onChange={handleParkingLotChange} required style={{width: '100%', border: 'none', background: 'transparent', fontSize: '1rem', padding: '0.5rem 0'}}>
                  <option value="" disabled>Select Parking Lot</option>
                  <option value="GNIOT Parking Lot">GNIOT Parking Lot</option>
                  <option value="DLF Parking">DLF Parking</option>
                  <option value="Spectrum Metro Parking">Spectrum Metro Parking</option>
                  <option value="Candor Parking">Candor Parking</option>
                  <option value="Logix Parking">Logix Parking</option>
                </select>
              </div>
              <div className="input-group">
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-group">
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
              {error && <div className="error-msg">{error}</div>}
              {form.password && form.confirmPassword && form.password !== form.confirmPassword && (
                <div className="error-msg">Password mismatch</div>
              )}
              <button className="save-btn" type="submit" disabled={loading}>
                {loading ? 'Registering...' : 'Register'}
              </button>
              <a href="/login" className="forgot-password-link">Back to Login</a>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
