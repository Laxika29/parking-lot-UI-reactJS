import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ForgetPassword.css';
import parkingLot from '../../parkinglot.jpg';
import logo from '../../logo.svg';
import {FaLock, FaUser} from "react-icons/fa";

const ForgetPassword = () => {
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '']);
    const [email, setEmail] = useState('');
    const [otpVerified, setOtpVerified] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const navigate = useNavigate();

    const handleSendOtp = (e) => {
        e.preventDefault();
        setOtpSent(true);
    };

    const handleOtpChange = (e, idx) => {
        const value = e.target.value.replace(/\D/g, '');
        if (value.length > 1) return;
        const newOtp = [...otp];
        newOtp[idx] = value;
        setOtp(newOtp);
        if (value && idx < 3) {
            document.getElementById(`otp-input-${idx + 1}`).focus();
        }
    };

    const handleVerifyOtp = (e) => {
        e.preventDefault();
        setOtpVerified(true);
    };

    const handleSave = (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setPasswordError('Passwords do not match');
            return;
        }
        setPasswordError('');
        navigate('/login');
    };

    const isSaveEnabled = otpVerified && newPassword && confirmPassword && newPassword === confirmPassword;

    return (
        <div className="login-outer-container">
            <div className="login-header">
                <div className="header-logo-title">
                    <img src={logo} alt="Logo" className="header-logo" />
                    <span className="header-title">Parking</span>
                </div>
                <div className="header-buttons">
                    <button className="admin-btn">Admin Portal</button>
                    <button className="register-btn">Register</button>
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
                    <form className="login-form">
                        <h2>Forgot Password</h2>
                        <div className="input-group">
                            <FaUser className="input-icon" />
                            <input
                                type="text"
                                placeholder="Email ID / Employee ID"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                disabled={otpSent}
                            />
                        </div>
                        {!otpSent && (
                            <button
                                className="send-otp-btn"
                                onClick={handleSendOtp}
                                disabled={!email}
                                type="button"
                            >
                                Send OTP
                            </button>
                        )}
                        {otpSent && !otpVerified && (
                            <>
                                <div className="otp-group">
                                    {otp.map((digit, idx) => (
                                        <input
                                            key={idx}
                                            id={`otp-input-${idx}`}
                                            type="text"
                                            maxLength="1"
                                            className="otp-input"
                                            value={digit}
                                            onChange={e => handleOtpChange(e, idx)}
                                        />
                                    ))}
                                </div>
                                <button
                                    className="verify-otp-btn"
                                    onClick={handleVerifyOtp}
                                    disabled={otp.some(d => d === '')}
                                    type="button"
                                >
                                    Verify OTP
                                </button>
                            </>
                        )}
                        {otpVerified && (
                            <>
                                <div className="input-group">
                                    <FaLock className="input-icon" />
                                    <input
                                        type="password"
                                        placeholder="New Password"
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="input-group">
                                    <FaLock className="input-icon" />
                                    <input
                                        placeholder="Confirm Password"
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                {passwordError && <div className="error-msg">{passwordError}</div>}
                                {newPassword && confirmPassword && newPassword !== confirmPassword && (
                                    <div className="error-msg">password not matched</div>
                                )}
                                <button
                                    className="save-btn"
                                    onClick={handleSave}
                                    disabled={!isSaveEnabled}
                                    type="button"
                                >
                                    Save
                                </button>
                            </>
                        )}
                        <a href="/login" className="forgot-password-link">Back to Login</a>
                        {/*<Link to="" className="back-to-login-link">Back to Login</Link>*/}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForgetPassword;
