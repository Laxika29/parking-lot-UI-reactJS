import React, { useState, useRef, useEffect } from 'react';
import logo from '../logo.svg';
import { useNavigate } from 'react-router-dom';
import { CredentialStore } from './Login/Login';

const Header = ({ showAdmin = true, showRegister = true, showEmployee = false, showBack = false, user, onHamburgerClick }) => {
  const navigate = useNavigate();
  const [showUserPopup, setShowUserPopup] = useState(false);
  const userCircleRef = useRef(null);
  const popupRef = useRef(null);

  // Close popup on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target) &&
        userCircleRef.current &&
        !userCircleRef.current.contains(event.target)
      ) {
        setShowUserPopup(false);
      }
    }
    if (showUserPopup) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserPopup]);

  const handleLogout = () => {
    // Clear credentials and local cache
    try {
      // remove admin/auth tokens and user info
      localStorage.removeItem('auth');
      localStorage.removeItem('user');
      // also remove any employee credentials cached
      localStorage.removeItem('employeeCredentials');
    } catch (_) {}

    // clear in-memory credential cache used by employee flows
    try {
      CredentialStore.clear();
    } catch (_) {}

    // Redirect to admin login and replace history so Back won't restore protected page
    navigate('/admin-login', { replace: true });
  };

  return (
    <div className="login-header">
      <div className="header-logo-title">
        {/* Hamburger button before logo */}
        <button className="header-hamburger" aria-label="Menu" onClick={onHamburgerClick}>
          &#9776;
        </button>
        <img src={logo} alt="Logo" className="header-logo" />
        <span className="header-title">Parking</span>
      </div>
      <div className="header-buttons" style={{ display: 'flex', alignItems: 'center' }}>
        {/* Admin Portal and Register buttons are now hidden */}
        {showAdmin && (
          <button className="admin-btn" onClick={() => navigate('/admin-login')}>Admin Portal</button>
        )}
        {showRegister && (
          <button className="register-btn" onClick={() => navigate('/register')}>Register</button>
        )}
        {showEmployee && (
          <button className="register-btn" onClick={() => navigate('/login')}>Employee Login</button>
        )}
        {showBack && (
          <button className="register-btn" onClick={() => navigate(-1)}>Back</button>
        )}
        <div style={{ flex: 1 }} />
        {user && user.name && (
          <div
            className="user-circle"
            title={user.name}
            ref={userCircleRef}
            onClick={() => setShowUserPopup((v) => !v)}
            style={{
              cursor: 'pointer',
              position: 'relative',
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: '#a57b0a', // reverted to previous color
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              marginLeft: '1rem',
            }}
          >
            {user.name.charAt(0).toUpperCase()}
            {showUserPopup && (
              <div
                className="user-popup"
                ref={popupRef}
                style={{
                  position: 'absolute',
                  top: '44px',
                  right: 0,
                  left: 'auto',
                  transform: 'none',
                  zIndex: 200,
                  minWidth: '140px',
                  maxWidth: '180px',
                  boxSizing: 'border-box',
                  overflowWrap: 'break-word',
                  direction: 'rtl',
                  border: 'none',
                }}
              >
                <div
                  className="user-popup-card"
                  style={{
                    background: '#fff',
                    borderRadius: '10px',
                    boxShadow: '0 4px 16px rgba(25, 118, 210, 0.13)',
                    padding: '0.5rem 0.8rem',
                    border: '1.2px solid #e0e0e0',
                    textAlign: 'center',
                    minWidth: '120px',
                    maxWidth: '180px',
                  }}
                >
                  <div className="user-popup-detail" style={{ fontSize: '0.82rem', color: '#222', marginBottom: '0.18rem', width: '100%', wordBreak: 'break-word', textAlign: 'left' }}><b>Name:</b> {user && user.name ? user.name : '-'}</div>
                  <div className="user-popup-detail" style={{ fontSize: '0.82rem', color: '#222', marginBottom: '0.18rem', width: '100%', wordBreak: 'break-word', textAlign: 'left' }}><b>Employee ID:</b> {user && user.employeeId ? user.employeeId : '-'}</div>
                  <button className="logout-btn approve-btn" style={{ fontSize: '0.98rem', padding: '0.4rem 0.8rem', marginTop: '0.5rem', display: 'block', marginLeft: 'auto', marginRight: 'auto' }} onClick={handleLogout}>Log Out</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
