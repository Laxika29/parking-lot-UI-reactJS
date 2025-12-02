import React, { useState, useEffect } from 'react';
import './Subscription.css';
import '../parking-history/ParkingHistory.css'; // Reuse the same CSS
import { QRCodeSVG } from 'qrcode.react'; // Import QR code component

// Mock subscription data
const MOCK_SUBSCRIPTIONS = [
  {
    subscriptionId: 'SUB001',
    vehicleNumber: 'MH12AB1234',
    subscriptionType: 'PREMIUM',
    vehicleType: 'Car',
    employeeName: 'Rahul Sharma',
    employeeId: 'EMP001',
    startDate: '2025-08-01',
    endDate: '2025-11-01',
    plan: 'Quarterly',
    amount: 24000,
    status: 'Active',
    autoRenew: true,
    parkingLotId: 'A1',
    spotNumber: '23'
  },
  {
    subscriptionId: 'SUB002',
    vehicleNumber: 'MH14XY5678',
    vehicleType: 'Bike',
    subscriptionType: 'ELITE',
    employeeName: 'Priya Patel',
    employeeId: 'EMP002',
    startDate: '2025-09-01',
    endDate: '2025-10-01',
    plan: 'Monthly',
    amount: 3000,
    status: 'Active',
    autoRenew: true,
    parkingLotId: 'B1',
    spotNumber: '45'
  },
  {
    subscriptionId: 'SUB003',
    vehicleNumber: 'MH01CD4567',
    vehicleType: 'SUV',
    employeeName: 'Amit Kumar',
    employeeId: 'EMP003',
    startDate: '2025-07-01',
    endDate: '2026-01-01',
    plan: 'Half-yearly',
    amount: 72000,
    status: 'Active',
    autoRenew: false,
    parkingLotId: 'C1',
    spotNumber: '12'
  },
  {
    subscriptionId: 'SUB004',
    vehicleNumber: 'MH02EF8901',
    vehicleType: 'Car',
    employeeName: 'Sneha Gupta',
    employeeId: 'EMP004',
    startDate: '2025-09-01',
    endDate: '2025-12-01',
    plan: 'Quarterly',
    amount: 24000,
    status: 'Active',
    autoRenew: true,
    parkingLotId: 'A1',
    spotNumber: '34'
  },
  {
    subscriptionId: 'SUB005',
    vehicleNumber: 'MH03GH2345',
    vehicleType: 'Bike',
    employeeName: 'Arun Singh',
    employeeId: 'EMP005',
    startDate: '2025-08-15',
    endDate: '2025-09-15',
    plan: 'Monthly',
    amount: 3000,
    status: 'Expired',
    autoRenew: false,
    parkingLotId: 'B1',
    spotNumber: '56'
  },
  {
    subscriptionId: 'SUB006',
    vehicleNumber: 'MH04IJ6789',
    vehicleType: 'Electric Car',
    employeeName: 'Neha Verma',
    employeeId: 'EMP006',
    startDate: '2025-06-01',
    endDate: '2026-06-01',
    plan: 'Annual',
    amount: 90000,
    status: 'Active',
    autoRenew: true,
    parkingLotId: 'D1',
    spotNumber: '15'
  },
  {
    subscriptionId: 'SUB007',
    vehicleNumber: 'MH05KL0123',
    vehicleType: 'Commercial',
    employeeName: 'Vikram Malhotra',
    employeeId: 'EMP007',
    startDate: '2025-09-01',
    endDate: '2026-03-01',
    plan: 'Half-yearly',
    amount: 90000,
    status: 'Active',
    autoRenew: false,
    parkingLotId: 'E1',
    spotNumber: '08'
  },
  {
    subscriptionId: 'SUB008',
    vehicleNumber: 'MH06MN4567',
    vehicleType: 'Luxury Car',
    employeeName: 'Rajesh Kapoor',
    employeeId: 'EMP008',
    startDate: '2025-09-01',
    endDate: '2025-12-01',
    plan: 'Quarterly',
    amount: 54000,
    status: 'Active',
    autoRenew: true,
    parkingLotId: 'F1',
    spotNumber: '05'
  },
  {
    subscriptionId: 'SUB009',
    vehicleNumber: 'MH07OP8901',
    vehicleType: 'Scooter',
    employeeName: 'Meera Joshi',
    employeeId: 'EMP009',
    startDate: '2025-08-01',
    endDate: '2025-09-01',
    plan: 'Monthly',
    amount: 2500,
    status: 'Expired',
    autoRenew: false,
    parkingLotId: 'G1',
    spotNumber: '67'
  },
  {
    subscriptionId: 'SUB010',
    vehicleNumber: 'MH08QR2345',
    vehicleType: 'Handicapped',
    employeeName: 'Sunil Mehta',
    employeeId: 'EMP010',
    startDate: '2025-07-01',
    endDate: '2026-07-01',
    plan: 'Annual',
    amount: 60000,
    status: 'Active',
    autoRenew: true,
    parkingLotId: 'H1',
    spotNumber: '02'
  },
  {
    subscriptionId: 'SUB011',
    vehicleNumber: 'MH09ST6789',
    vehicleType: 'Electric Bike',
    employeeName: 'Aarti Chawla',
    employeeId: 'EMP011',
    startDate: '2025-09-01',
    endDate: '2025-10-01',
    plan: 'Monthly',
    amount: 2700,
    status: 'Active',
    autoRenew: true,
    parkingLotId: 'B1',
    spotNumber: '78'
  },
  {
    subscriptionId: 'SUB012',
    vehicleNumber: 'MH10UV0123',
    vehicleType: 'Reserved Spot',
    employeeName: 'Dinesh Tiwari',
    employeeId: 'EMP012',
    startDate: '2025-09-01',
    endDate: '2025-12-01',
    plan: 'Quarterly',
    amount: 45000,
    status: 'Pending',
    autoRenew: false,
    parkingLotId: 'A1',
    spotNumber: '01'
  }
];

const Subscription = ({ sidebarCollapsed }) => {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10); // Fixed at exactly 10 rows per page

  // New state for subscription popup
  const [showSubscriptionPopup, setShowSubscriptionPopup] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState({
    vehicleNumber: '',
    vehicleType: 'Car',
    subscriptionType: 'PREMIUM',
    subscriptionFrequency: 'Monthly'
  });
  const [subscriptionErrors, setSubscriptionErrors] = useState({});

  // New state for payment popup
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    method: 'UPI',
    referenceId: ''
  });
  const [paymentErrors, setPaymentErrors] = useState({});

  // New state for payment success popup
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [newSubscriptionId, setNewSubscriptionId] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Function to get subscription benefits based on type
  const getSubscriptionBenefits = (type) => {
    switch(type) {
      case 'PREMIUM':
        return [
          "Priority parking spots",
          "24/7 customer support",
          "20% discount on monthly rates",
          "Free car wash once a month"
        ];
      case 'ELITE':
        return [
          "Reserved premium parking spots",
          "24/7 priority customer support",
          "35% discount on monthly rates",
          "Weekly car wash service",
          "Valet parking service"
        ];
      case 'SUPER':
        return [
          "VIP reserved parking spots",
          "Dedicated customer relationship manager",
          "50% discount on monthly rates",
          "Bi-weekly car wash and detailing",
          "Valet parking service",
          "Vehicle maintenance reminders",
          "Complimentary roadside assistance"
        ];
      default:
        return ["No benefits available"];
    }
  };

  // Function to calculate subscription charge based on type and frequency
  const calculateSubscriptionCharge = (type, frequency, vehicleType) => {
    // Base monthly rates
    let baseRate = 0;

    // Set base rate according to vehicle type
    switch(vehicleType) {
      case 'Bike':
        baseRate = 500; // Base rate for bike
        break;
      case 'Car':
        baseRate = 1000; // Base rate for car
        break;
      case 'SUV':
        baseRate = 1500; // Base rate for SUV
        break;
      case 'Truck':
        baseRate = 2000; // Base rate for truck
        break;
      default:
        baseRate = 1000;
    }

    // Multiply by subscription type factor
    let typeFactor = 1;
    switch(type) {
      case 'PREMIUM':
        typeFactor = 1.2; // 20% premium
        break;
      case 'ELITE':
        typeFactor = 1.5; // 50% premium
        break;
      case 'SUPER':
        typeFactor = 2; // 100% premium
        break;
      default:
        typeFactor = 1;
    }

    // Calculate based on frequency with discount for longer subscriptions
    let frequencyFactor = 1;
    let months = 1;

    switch(frequency) {
      case 'Monthly':
        months = 1;
        frequencyFactor = 1; // No discount for monthly
        break;
      case 'Quarterly':
        months = 3;
        frequencyFactor = 0.9; // 10% discount for quarterly
        break;
      case 'Half-yearly':
        months = 6;
        frequencyFactor = 0.85; // 15% discount for half-yearly
        break;
      case 'Yearly':
        months = 12;
        frequencyFactor = 0.8; // 20% discount for yearly
        break;
      default:
        months = 1;
        frequencyFactor = 1;
    }

    // Calculate total charge
    const monthlyCharge = baseRate * typeFactor * frequencyFactor;
    const totalCharge = monthlyCharge * months;

    return {
      monthly: Math.round(monthlyCharge),
      total: Math.round(totalCharge)
    };
  };

  // Handle Subscription button click
  const handleSubscriptionClick = () => {
    setSubscriptionData({
      vehicleNumber: '',
      vehicleType: 'Car',
      subscriptionType: 'PREMIUM',
      subscriptionFrequency: 'Monthly'
    });
    setShowSubscriptionPopup(true);
  };

  // Handle Subscription form field change
  const handleSubscriptionFormChange = (e) => {
    const { name, value } = e.target;
    setSubscriptionData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  // Validate Subscription form
  const validateSubscriptionForm = () => {
    const errors = {};

    // Check vehicle number
    if (!subscriptionData.vehicleNumber.trim()) {
      errors.vehicleNumber = "Vehicle number is required";
    }

    // Check vehicle type
    if (!subscriptionData.vehicleType) {
      errors.vehicleType = "Please select a vehicle type";
    }

    // Check subscription type
    if (!subscriptionData.subscriptionType) {
      errors.subscriptionType = "Please select a subscription type";
    }

    // Check subscription frequency
    if (!subscriptionData.subscriptionFrequency) {
      errors.subscriptionFrequency = "Please select a subscription frequency";
    }

    setSubscriptionErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Subscription form submission
  const handleSubscriptionSubmit = () => {
    // Validate form
    const isValid = validateSubscriptionForm();

    if (!isValid) {
      return; // Don't proceed if validation fails
    }

    // Calculate the amount based on subscription data
    const charge = calculateSubscriptionCharge(
      subscriptionData.subscriptionType,
      subscriptionData.subscriptionFrequency,
      subscriptionData.vehicleType
    );

    // Set payment data
    setPaymentData({
      amount: charge.total,
      method: 'UPI',
      referenceId: ''
    });

    // Close subscription popup and open payment popup
    setShowSubscriptionPopup(false);
    setShowPaymentPopup(true);
  };

  // Handle Payment button click
  const handlePaymentClick = () => {
    // Calculate the amount based on subscription data
    const charge = calculateSubscriptionCharge(
      subscriptionData.subscriptionType,
      subscriptionData.subscriptionFrequency,
      subscriptionData.vehicleType
    );

    setPaymentData({
      amount: charge.total,
      method: 'UPI',
      referenceId: ''
    });
    setShowPaymentPopup(true);
  };

  // Handle Payment form field change
  const handlePaymentFormChange = (e) => {
    const { name, value } = e.target;
    setPaymentData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  // Validate Payment form
  const validatePaymentForm = () => {
    const errors = {};

    // Check amount
    if (paymentData.amount <= 0) {
      errors.amount = "Amount must be greater than 0";
    }

    // Check reference ID
    if (!paymentData.referenceId.trim()) {
      errors.referenceId = "Reference ID is required";
    }

    setPaymentErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Payment form submission
  const handlePaymentSubmit = () => {
    // Validate form
    const isValid = validatePaymentForm();

    if (!isValid) {
      return; // Don't proceed if validation fails
    }

    // Here you would typically send the payment data to your backend
    // For demo, just show success message and close popup
    setPaymentSuccess(true);
    setShowPaymentPopup(false);

    // Show a success message
    alert("Payment successful! Subscription activated.");

    // Create a new subscription entry to add to the table
    const newSubscriptionId = `SUB${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    const today = new Date();

    // Calculate end date based on subscription frequency
    let endDate = new Date(today);
    switch(subscriptionData.subscriptionFrequency) {
      case 'Monthly':
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case 'Quarterly':
        endDate.setMonth(endDate.getMonth() + 3);
        break;
      case 'Half-yearly':
        endDate.setMonth(endDate.getMonth() + 6);
        break;
      case 'Yearly':
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
      default:
        endDate.setMonth(endDate.getMonth() + 1);
    }

    const formatDate = (date) => {
      return date.toISOString().split('T')[0];
    };

    // Create new subscription
    const newSubscription = {
      subscriptionId: newSubscriptionId,
      vehicleNumber: subscriptionData.vehicleNumber,
      vehicleType: subscriptionData.vehicleType,
      subscriptionType: subscriptionData.subscriptionType,
      employeeName: "Current User",
      employeeId: "EMP-CURRENT",
      startDate: formatDate(today),
      endDate: formatDate(endDate),
      plan: subscriptionData.subscriptionFrequency,
      amount: calculateSubscriptionCharge(
        subscriptionData.subscriptionType,
        subscriptionData.subscriptionFrequency,
        subscriptionData.vehicleType
      ).total,
      status: 'Active',
      autoRenew: true,
      parkingLotId: 'A1',
      spotNumber: '01'
    };

    // Add to mock data
    MOCK_SUBSCRIPTIONS.unshift(newSubscription);

    // Set new subscription ID for success popup
    setNewSubscriptionId(newSubscriptionId);

    // Show success popup
    setShowSuccessPopup(true);
  };

  // Filter subscriptions based on search (vehicle number, employee name, or subscription ID)
  const filteredSubscriptions = MOCK_SUBSCRIPTIONS.filter(sub =>
    sub.vehicleNumber.toLowerCase().includes(search.toLowerCase()) ||
    sub.employeeName.toLowerCase().includes(search.toLowerCase()) ||
    sub.subscriptionId.toLowerCase().includes(search.toLowerCase())
  );

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Get current rows for pagination
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredSubscriptions.slice(indexOfFirstRow, indexOfLastRow);

  // Ensure we always have exactly 10 rows (or fill with empty rows)
  const rowsToDisplay = [...currentRows];
  while (rowsToDisplay.length < rowsPerPage) {
    rowsToDisplay.push(null); // Add empty rows to maintain exactly 10 items
  }

  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(filteredSubscriptions.length / rowsPerPage));

  // If current page is beyond total pages (e.g., after search filter), reset to page 1
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  // Change page
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  // Get status class for styling
  const getStatusClass = (status) => {
    switch(status.toLowerCase()) {
      case 'active': return 'status-active';
      case 'expired': return 'status-expired';
      case 'pending': return 'status-pending';
      default: return '';
    }
  };

  return (
    <div className={`parking-history-container ${sidebarCollapsed ? 'collapsed' : 'expanded'}`}>
      <h2 className="parking-history-title">Subscription</h2>
      <div className="parking-history-search-bar">
        <div className="search-input-wrapper">
          <span className="search-icon"></span>
          <input
            type="text"
            placeholder="Search by Vehicle Number"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="parking-history-search-input"
          />
        </div>
        <div className="button-container">
          <button className="activate-button" onClick={handleSubscriptionClick}>
            Activate Subscription
          </button>
        </div>
      </div>
      <div className="table-wrapper">
        <table className="parking-history-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Vehicle Number</th>
              <th>Subscription Type</th>
              <th>Plan</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Amount (₹)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rowsToDisplay.map((subscription, index) => (
              subscription ? (
                <tr key={`${subscription.subscriptionId}-${index}`}>
                  <td>{subscription.subscriptionId}</td>
                  <td>{subscription.vehicleNumber}</td>
                  <td>{subscription.subscriptionType}</td>
                  <td>{subscription.plan}</td>
                  <td>{subscription.startDate}</td>
                  <td>{subscription.endDate}</td>
                  <td>{subscription.amount}</td>
                  <td className={getStatusClass(subscription.status)}>{subscription.status}</td>
                </tr>
              ) : (
                <tr key={`empty-${index}`}>
                  <td colSpan="9">&nbsp;</td>
                </tr>
              )
            ))}
          </tbody>
        </table>
      </div>
      <div className="pagination-controls">
        <button onClick={prevPage} disabled={currentPage === 1}>
          Prev
        </button>
        <span className="pagination-info">
          Page {currentPage} of {totalPages}
        </span>
        <button onClick={nextPage} disabled={currentPage === totalPages || filteredSubscriptions.length === 0}>
          Next
        </button>
      </div>

      {/* Subscription Popup Form */}
      {showSubscriptionPopup && (
        <>
          <div className="exit-popup-overlay" onClick={() => setShowSubscriptionPopup(false)}></div>
          <div className="exit-popup-card logo-theme" style={{ maxWidth: '500px' }}>
            <span className="exit-popup-close" onClick={() => setShowSubscriptionPopup(false)} title="Close">&#10005;</span>
            <div className="exit-popup-title">Activate Subscription</div>
            <div className="subscription-form">
              <div className="form-field">
                <label htmlFor="subscription-vehicle-number" className="form-label">Vehicle Number:</label>
                <input
                  type="text"
                  id="subscription-vehicle-number"
                  name="vehicleNumber"
                  className="form-input"
                  value={subscriptionData.vehicleNumber}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase();
                    handleSubscriptionFormChange({
                      target: {
                        name: 'vehicleNumber',
                        value: value
                      }
                    });
                  }}
                />
                {subscriptionErrors.vehicleNumber && (
                  <div className="form-error">{subscriptionErrors.vehicleNumber}</div>
                )}
              </div>

              {/* Horizontal layout for Vehicle Type and Subscription Frequency */}
              <div style={{ display: 'flex', gap: '15px' }}>
                <div className="form-field" style={{ flex: 1 }}>
                  <label htmlFor="subscription-vehicle-type" className="form-label">Vehicle Type:</label>
                  <select
                    id="subscription-vehicle-type"
                    name="vehicleType"
                    className="form-select"
                    value={subscriptionData.vehicleType}
                    onChange={handleSubscriptionFormChange}
                    style={{ width: '100%' }}
                  >
                    <option value="Car">Car</option>
                    <option value="Bike">Bike</option>
                    <option value="Truck">Truck</option>
                    <option value="SUV">SUV</option>
                  </select>
                  {subscriptionErrors.vehicleType && (
                    <div className="form-error">{subscriptionErrors.vehicleType}</div>
                  )}
                </div>

                <div className="form-field" style={{ flex: 1 }}>
                  <label htmlFor="subscription-frequency" className="form-label">Subscription Frequency:</label>
                  <select
                    id="subscription-frequency"
                    name="subscriptionFrequency"
                    className="form-select"
                    value={subscriptionData.subscriptionFrequency}
                    onChange={handleSubscriptionFormChange}
                    style={{ width: '100%' }}
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Half-yearly">Half-yearly</option>
                    <option value="Yearly">Yearly</option>
                  </select>
                  {subscriptionErrors.subscriptionFrequency && (
                    <div className="form-error">{subscriptionErrors.subscriptionFrequency}</div>
                  )}
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="subscription-type" className="form-label">Subscription Type:</label>
                <select
                  id="subscription-type"
                  name="subscriptionType"
                  className="form-select"
                  value={subscriptionData.subscriptionType}
                  onChange={handleSubscriptionFormChange}
                >
                  <option value="PREMIUM">PREMIUM</option>
                  <option value="ELITE">ELITE</option>
                  <option value="SUPER">SUPER</option>
                </select>
                {subscriptionErrors.subscriptionType && (
                  <div className="form-error">{subscriptionErrors.subscriptionType}</div>
                )}
              </div>

              {/* Subscription Charge Field */}
              <div className="form-field" style={{ backgroundColor: '#f8f8f8', padding: '10px', borderRadius: '4px', marginTop: '10px' }}>
                <label className="form-label"><b>Subscription Charge:</b></label>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
                  <div>
                    <span className="form-value" style={{ fontSize: '1.1em' }}>
                      ₹{calculateSubscriptionCharge(
                        subscriptionData.subscriptionType,
                        subscriptionData.subscriptionFrequency,
                        subscriptionData.vehicleType
                      ).monthly}
                    </span>
                    <span style={{ fontSize: '0.9em', color: '#666' }}> / month</span>
                  </div>
                  <div>
                    <span className="form-label" style={{ fontWeight: 'bold', color: '#a57b0a' }}>Total: </span>
                    <span className="form-value" style={{ fontWeight: 'bold', fontSize: '1.1em', color: '#a57b0a' }}>
                      ₹{calculateSubscriptionCharge(
                        subscriptionData.subscriptionType,
                        subscriptionData.subscriptionFrequency,
                        subscriptionData.vehicleType
                      ).total}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Benefits Section */}
            <div className="subscription-benefits" style={{ marginTop: '15px', marginBottom: '15px', border: '1px solid #ddd', padding: '10px', borderRadius: '4px' }}>
              <h4 style={{ marginTop: '0', marginBottom: '10px' }}>Benefits:</h4>
              <ul style={{ paddingLeft: '20px', margin: '0' }}>
                {getSubscriptionBenefits(subscriptionData.subscriptionType).map((benefit, index) => (
                  <li key={index} style={{ marginBottom: '5px' }}>{benefit}</li>
                ))}
              </ul>
            </div>

            <button
              className="confirm-exit-btn"
              onClick={handleSubscriptionSubmit}
            >
              Subscribe
            </button>
          </div>
        </>
      )}

      {/* Payment Popup Form */}
      {showPaymentPopup && (
        <>
          <div className="exit-popup-overlay" onClick={() => setShowPaymentPopup(false)}></div>
          <div className="exit-popup-card logo-theme" style={{ maxWidth: '500px' }}>
            <span className="exit-popup-close" onClick={() => setShowPaymentPopup(false)} title="Close">&#10005;</span>
            <div className="exit-popup-title">Subscription Payment</div>
            <table className="exit-popup-details-table">
              <tbody>
                <tr>
                  <td className="exit-popup-detail-label"><b>Vehicle Number:</b></td>
                  <td className="exit-popup-detail-value">{subscriptionData.vehicleNumber}</td>
                </tr>
                <tr>
                  <td className="exit-popup-detail-label"><b>Subscription Type:</b></td>
                  <td className="exit-popup-detail-value">{subscriptionData.subscriptionType}</td>
                </tr>
                <tr>
                  <td className="exit-popup-detail-label"><b>Plan:</b></td>
                  <td className="exit-popup-detail-value">{subscriptionData.subscriptionFrequency}</td>
                </tr>
                <tr>
                  <td className="exit-popup-detail-label"><b>Amount:</b></td>
                  <td className="exit-popup-detail-value">₹{paymentData.amount}</td>
                </tr>
              </tbody>
            </table>

            <div className="exit-popup-payment-method">
              <label htmlFor="payment-method" className="exit-popup-detail-label">Payment Method:</label>
              <select
                id="payment-method"
                className="exit-popup-payment-dropdown"
                value={paymentData.method}
                onChange={e => handlePaymentFormChange({
                  target: {
                    name: 'method',
                    value: e.target.value
                  }
                })}
              >
                <option value="UPI">UPI</option>
                <option value="Card">Card</option>
                <option value="CASH">Cash</option>
                <option value="Net Banking">Net Banking</option>
              </select>
            </div>

            {paymentData.method === 'UPI' && (
              <div className="exit-popup-qr-section">
                <div className="exit-popup-detail-label" style={{marginBottom: '0.5rem'}}>Scan to pay via UPI:</div>
                <QRCodeSVG
                  value={`upi://pay?pa=test@upi&pn=ParkingSubscription&am=${paymentData.amount}`}
                  size={128}
                  bgColor="#fffbe6"
                  fgColor="#a57b0a"
                  className="exit-popup-qr-code"
                />
                <div style={{ marginTop: '10px', fontSize: '0.9em', color: '#666' }}>
                  After payment, enter the UPI reference ID below
                </div>
              </div>
            )}

            {paymentData.method === 'Card' && (
              <div className="card-payment-section" style={{ margin: '15px 0' }}>
                <div className="form-field">
                  <label className="form-label">Card Number:</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="XXXX XXXX XXXX XXXX"
                  />
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <div className="form-field" style={{ flex: 1 }}>
                    <label className="form-label">Expiry Date:</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="MM/YY"
                    />
                  </div>
                  <div className="form-field" style={{ flex: 1 }}>
                    <label className="form-label">CVV:</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="***"
                      maxLength="3"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="form-field">
              <label htmlFor="payment-reference-id" className="form-label">
                {paymentData.method === 'UPI' ? 'UPI Reference ID:' :
                 paymentData.method === 'Card' ? 'Transaction ID:' : 'Reference ID:'}
              </label>
              <input
                type="text"
                id="payment-reference-id"
                name="referenceId"
                className="form-input"
                value={paymentData.referenceId}
                onChange={handlePaymentFormChange}
              />
              {paymentErrors.referenceId && (
                <div className="form-error">{paymentErrors.referenceId}</div>
              )}
            </div>

            <button
              className="confirm-exit-btn"
              onClick={handlePaymentSubmit}
              style={{ marginTop: '20px' }}
            >
              Confirm Payment
            </button>
          </div>
        </>
      )}

      {/* Success Popup - Shown only on successful subscription activation */}
      {showSuccessPopup && (
        <>
          <div className="exit-popup-overlay" onClick={() => setShowSuccessPopup(false)}></div>
          <div className="exit-popup-card logo-theme" style={{ maxWidth: '500px', padding: '20px', textAlign: 'center' }}>
            <span className="exit-popup-close" onClick={() => setShowSuccessPopup(false)} title="Close">&#10005;</span>
            <div className="exit-popup-title" style={{ marginBottom: '15px', fontSize: '1.5em', color: '#28a745' }}>
              Subscription Activated
            </div>
            <div className="exit-popup-content" style={{ marginBottom: '15px', fontSize: '1.1em' }}>
              Your subscription has been successfully activated.
            </div>
            <div className="exit-popup-subscription-id" style={{ marginBottom: '15px', fontSize: '1.2em', fontWeight: 'bold' }}>
              Subscription ID: {newSubscriptionId}
            </div>
            <button
              className="confirm-exit-btn"
              onClick={() => setShowSuccessPopup(false)}
              style={{ width: '100%' }}
            >
              Close
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Subscription;
