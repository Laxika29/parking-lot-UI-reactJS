import React, {useState, useEffect} from 'react';
import {CredentialStore} from '../Login/Login';
import Header from '../Header';
import Sidebar from './Sidebar';
import './EmployeeDashboard.css';
import './Dashboard.css'; // Import Dashboard-specific CSS
import '../dashboard/parking-history/ParkingHistory.css'; // Import ParkingHistory CSS for consistent styling
import {QRCodeSVG} from 'qrcode.react';
import {Routes, Route} from 'react-router-dom';
import ParkingHistory from './parking-history/ParkingHistory';
import ParkingStatus from './parking-status/ParkingStatus';
import FareDetails from './fare-details/FareDetails';
import ParkingBooking from './parking-booking/ParkingBooking';
import Subscription from './subscription/Subscription';
import LostComplaint from './lost-complaint/LostComplaint';
import Toast from "../Toast";

// EmployeeDashboard component
const EmployeeDashboard = () => {
    const employeeName = CredentialStore.name;
    const employeeId = CredentialStore.employeeId;
    const parkingLotName = CredentialStore.parkingLot || 'LX Parking'; // Updated parking lot name
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [toast, setToast] = useState({show: false, message: '', type: 'info'});
    const [showExitPopup, setShowExitPopup] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('CASH');
    const [showCheckInPopup, setShowCheckInPopup] = useState(false);

    // New state for lock functionality
    const [showLockPopup, setShowLockPopup] = useState(false);
    const [lockReason, setLockReason] = useState('');
    const [lockReasonError, setLockReasonError] = useState('');
    const [charCount, setCharCount] = useState(0); // Character counter for lock reason

    // New state for subscription popup
    const [showSubscriptionPopup, setShowSubscriptionPopup] = useState(false);
    const [subscriptionData, setSubscriptionData] = useState({
        vehicleNumber: '',
        vehicleType: 'Car',
        subscriptionType: 'PREMIUM',
        subscriptionFrequency: 'Monthly'
    });
    const [subscriptionErrors, setSubscriptionErrors] = useState({});
    // Function to get subscription benefits based on type
    const getSubscriptionBenefits = (type) => {
        switch (type) {
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
                    "Valet parking service"
                ];
            default:
                return ["No benefits available"];
        }
    };

    // Function to calculate subscription charge based on type and frequency
    const calculateSubscriptionCharge = (type, frequency, vehicleType) => {
        // Base monthly rates
        let baseRate;

        // Set base rate according to vehicle type
        switch (vehicleType) {
            case 'Bike':
                baseRate = 500; // Base rate for bike
                break;
            case 'Car':
                baseRate = 1000; // Base rate for car
                break;
            case 'SUV':
                baseRate = 1500; // Base rate for SUV
                break;
            case 'Heavy Vehicle':
                baseRate = 2000; // Base rate for Heavy Vehicle
                break;
            default:
                baseRate = 1000;
        }

        // Multiply by subscription type factor
        let typeFactor;
        switch (type) {
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
        let frequencyFactor;
        let months;

        switch (frequency) {
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

    // New state for details popup
    const [showDetailsPopup, setShowDetailsPopup] = useState(false);
    const [showUnlockPopup, setShowUnlockPopup] = useState(false);
    const [unlockPaymentMethod, setUnlockPaymentMethod] = useState('CASH');
    const unlockFee = 200; // Default unlock fee (read-only constant; no setter used)

    // New state for check-in form
    const [checkInData, setCheckInData] = useState({
        vehicleNumber: '',
        vehicleType: 'Car',
        parkingType: 'Hourly'
    });

    // Available slots state (in a real application, this would be fetched from a backend)
    const [availableSlots, setAvailableSlots] = useState({
        Car: 0,
        Bike: 0,
        'Heavy Vehicle': 0,
    });

    // Function to refresh available slots
    const refreshAvailableSlots = async () => {
        const token = localStorage.getItem('employee-auth') ? JSON.parse(localStorage.getItem('employee-auth')).token : null;

        try {
            const response = await fetch('/parkinglot/api/v1/fetch/available/parking/lot', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            const data = await response.json();

            if (data.status === 1) {
                setToast({show: true, message: data.message || `Something went wrong`, type: 'error'});
                return;
            }
            // Update available slots based on the response
            setAvailableSlots({
                Car: data.carAvailableSlots,
                Bike: data.bikeAvailableSlots,
                'Heavy Vehicle': data.heavyVehicleAvailableSlots,
            });
        } catch (error) {
            console.error('Failed to fetch available slots:', error);
            setError(error.message || 'Failed to fetch available slots');
        }
    };

    // Add form validation state
    const [formErrors, setFormErrors] = useState({});

    // Handle form field changes
    const handleCheckInFormChange = (e) => {
        const {name, value} = e.target;

        // Convert vehicle number to uppercase
        const processedValue = name === 'vehicleNumber' ? value.toUpperCase() : value;

        setCheckInData(prevData => ({
            ...prevData,
            [name]: processedValue
        }));

        // Clear error for this field when user types
        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Validate form fields
    const validateForm = () => {
        const errors = {};

        // Check vehicle number
        if (!checkInData.vehicleNumber.trim()) {
            errors.vehicleNumber = "Vehicle number is required";
        }

        // Check vehicle type
        if (!checkInData.vehicleType) {
            errors.vehicleType = "Please select a vehicle type";
        }

        // Check parking type
        if (!checkInData.parkingType) {
            errors.parkingType = "Please select a parking type";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Function to handle API errors and show toast messages
    const handleApiError = (error, showToast) => {
        if (error.response && error.response.data && error.response.data.message) {
            showToast(error.response.data.message, 'error');
        } else {
            showToast('An unexpected error occurred', 'error');
        }
    };

    // Handle check-in form submission
    const handleCheckInSubmit = async () => {
        // Validate form
        const isValid = validateForm();

        if (!isValid) {
            return; // Don't proceed if validation fails
        }

        const token = localStorage.getItem('employee-auth') ? JSON.parse(localStorage.getItem('employee-auth')).token : null;

        const newVehicle = {
            parkingId: null, // Assuming parkingId is generated by the backend
            vehicleType: checkInData.vehicleType,
            vehicleNumber: checkInData.vehicleNumber,
            parkingType: checkInData.parkingType
        };

        setLoading(true); // Set loading to true before the API call
        try {
            const response = await fetch('/parkinglot/api/v1/check-in', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(newVehicle),
            });

            const data = await response.json();

            // Check if status is 1 and show toast message
            if (data.status === 1) {
                setToast({show: true, message: data.message || 'An error occurred', type: 'error'});
                return;
            }

            console.log(data.message); // Log success message

            // Reset form data
            setCheckInData({
                vehicleNumber: '',
                vehicleType: 'Car',
                parkingType: 'Hourly'
            });

            // Clear any errors
            setFormErrors({});

            // Close the popup
            setShowCheckInPopup(false);

            // Fetch updated available slots
            await fetchAvailableSlots();
        } catch (error) {
            handleApiError(error, setToast);
        } finally {
            await fetchVehicles();
            setLoading(false); // Set loading to false after the API call
        }
    };

    const handleExitClick = (vehicle) => {
        // Set exit time to now for demo
        setSelectedVehicle({...vehicle, exitTime: new Date().getHours()});
        setShowExitPopup(true);
    };

    const handleConfirmExit = () => {
        // Update vehicle exitBy and exitTime
        setVehicles(
            vehicles.map((v) =>
                v.vehicleNumber === selectedVehicle.vehicleNumber
                    ? {
                        ...v,
                        exitBy: employeeName.split('@')[0], // Remove domain part from email
                        exitTime: selectedVehicle.exitTime,
                    }
                    : v
            )
        );
        setShowExitPopup(false);
        setSelectedVehicle(null);
    };

    function getGreeting() {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    }

    // Handle Check In button click
    const handleCheckInClick = () => {
        setShowCheckInPopup(true);
    };

    // Handle Lock button click
    const handleLockClick = (vehicle) => {
        setSelectedVehicle(vehicle);
        setLockReason('');
        setLockReasonError('');
        setCharCount(0);
        setShowLockPopup(true);
    };

    // Handle Lock reason input change
    const handleLockReasonChange = (e) => {
        const value = e.target.value;
        // Only update if within the 150 character limit
        if (value.length <= 150) {
            setLockReason(value);
            setCharCount(value.length);
            // Clear error when user types
            if (lockReasonError) {
                setLockReasonError('');
            }
        }
    };

    // Function to handle vehicle lock confirmation
    const handleLockConfirm = async () => {
        // Validate lock reason (minimum 30 characters)
        if (!lockReason.trim()) {
            setLockReasonError('Please provide a reason for locking the vehicle');
            return;
        } else if (lockReason.trim().length < 30) {
            setLockReasonError(`Reason must be at least 30 characters (currently ${lockReason.trim().length})`);
            return;
        }

        const token = localStorage.getItem('employee-auth') ? JSON.parse(localStorage.getItem('employee-auth')).token : null;

        const lockPayload = {
            parkingId: selectedVehicle.parkingId,
            lockReason: lockReason.trim(),
            paymentMode: null,
            paymentAmount: null
        };

        setLoading(true); // Set loading to true before the API call
        try {
            const response = await fetch('/parkinglot/api/v1/lock/vehicle', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(lockPayload),
            });

            const data = await response.json();

            if (response.ok) {
                setToast({show: true, message: data.message || 'Vehicle locked successfully', type: 'success'});

                // Fetch updated vehicle list after locking

                // Close popup and reset fields
                setShowLockPopup(false);
                setLockReason('');
                setCharCount(0);
                setSelectedVehicle(null);
            } else {
                setToast({show: true, message: data.message || 'Failed to lock vehicle', type: 'error'});
            }
        } catch (error) {
            console.error('Error locking vehicle:', error);
            setToast({show: true, message: 'An unexpected error occurred while locking the vehicle', type: 'error'});
        } finally {
            await fetchVehicles();
            setLoading(false);
            // Set loading to false after the API call
        }
    };

    // Handle Details button click (for locked vehicles)
    const handleDetailsClick = (vehicle) => {
        setSelectedVehicle(vehicle);
        setShowDetailsPopup(true);
    };

    // Handle Unlock button click
    const handleUnlockClick = () => {
        setUnlockPaymentMethod('CASH');
        setShowDetailsPopup(false);
        setShowUnlockPopup(true);
    };

    // Handle Unlock confirmation
    const handleUnlockConfirm = () => {
        // Update vehicle locked status
        setVehicles(
            vehicles.map((v) =>
                v.vehicleNumber === selectedVehicle.vehicleNumber
                    ? {
                        ...v,
                        locked: false,
                        unlockTime: new Date().toLocaleString(),
                        unlockBy: employeeName,
                        unlockPaymentMethod: unlockPaymentMethod,
                        unlockFee: unlockFee
                    }
                    : v
            )
        );

        // Close popup and reset
        setShowUnlockPopup(false);
        setSelectedVehicle(null);
    };

    // Handle Subscription button click
    const handleSubscriptionClick = () => {
        setSelectedVehicle(null);
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
        const {name, value} = e.target;

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

    // Helper: handle 403 Forbidden responses
    const handleForbidden = (resp) => {
        if (resp && resp.status === 403) {
            try {
                localStorage.removeItem('auth');
            } catch (e) { /* ignore */
            }
            // route to login page (same-origin)
            window.location.href = '/login';
            return true; // indicate forbidden handled
        }
        return false;
    };

    // Handle Subscription form submission
    const handleSubscriptionSubmit = () => {
        // Validate form
        const isValid = validateSubscriptionForm();

        if (!isValid) {
            return; // Don't proceed if validation fails
        }

        // Here you would typically send the subscription data to your backend
        // For now, let's just log it
        console.log("Subscription Data:", subscriptionData);

        // Close the popup
        setShowSubscriptionPopup(false);
    };

    // Fetch currently parked vehicles from the API
    useEffect(() => {

        const fetchVehicles = async () => {
            const token = localStorage.getItem('employee-auth') ? JSON.parse(localStorage.getItem('employee-auth')).token : null;

            setLoading(true);
            setError('');

            try {
                const response = await fetch('/parkinglot/api/v1/fetch/dashboard/vehicles', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    if (response.status === 403) {
                        console.error('Access forbidden: Invalid token or insufficient permissions.');
                        localStorage.removeItem('employee-auth');
                        window.location.href = '/login';
                        return;
                    }
                    const errorText = await response.text();
                    console.error(`Error: ${response.status}`, errorText);
                    throw new Error(`Error: ${response.status} - ${errorText}`);
                }

                const data = await response.json();
                setVehicles(data.parkedVehicleInfoList || []);
            } catch (error) {
                console.error('Fetch error details:', error);
                if (error.message.includes('CORS')) {
                    console.error('CORS error: Ensure the backend allows requests from this origin.');
                    setError('CORS error: Unable to fetch vehicles.');
                } else {
                    setError(error.message || 'Failed to fetch vehicles');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchVehicles();
    }, []);

    // New function to fetch available parking slots
    const fetchAvailableSlots = async () => {
        const token = localStorage.getItem('employee-auth') ? JSON.parse(localStorage.getItem('employee-auth')).token : null;

        try {
            const response = await fetch('/parkinglot/api/v1/fetch/available/parking/lot', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                if (response.status === 403) {
                    console.error('Access forbidden: Invalid token or insufficient permissions.');
                    setError('Access forbidden: Please log in again.');
                    return;
                }
                throw new Error(`Error: ${response.status}`);
            }

            const data = await response.json();

            // Update available slots based on the response
            setAvailableSlots({
                Car: data.carAvailableSlots,
                Bike: data.bikeAvailableSlots,
                'Heavy Vehicle': data.heavyVehicleAvailableSlots,
                SUV: availableSlots.SUV // Keep SUV unchanged as it's not in the response
            });
        } catch (error) {
            if (error.message.includes('CORS')) {
                console.error('CORS error: Ensure the backend allows requests from this origin.');
                setError('CORS error: Unable to fetch available slots.');
            } else {
                console.error('Failed to fetch available slots:', error);
                setError(error.message || 'Failed to fetch available slots');
            }
        }
    };

    const fetchVehicles = async () => {
        const token = localStorage.getItem('employee-auth') ? JSON.parse(localStorage.getItem('employee-auth')).token : null;

        setLoading(true);
        setError('');

        try {
            const response = await fetch('/parkinglot/api/v1/fetch/dashboard/vehicles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                if (response.status === 403) {
                    console.error('Access forbidden: Invalid token or insufficient permissions.');
                    localStorage.removeItem('employee-auth');
                    window.location.href = '/login';
                    return;
                }
                const errorText = await response.text();
                console.error(`Error: ${response.status}`, errorText);
                throw new Error(`Error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            setVehicles(data.parkedVehicleInfoList || []);
        } catch (error) {
            console.error('Fetch error details:', error);
            if (error.message.includes('CORS')) {
                console.error('CORS error: Ensure the backend allows requests from this origin.');
                setError('CORS error: Unable to fetch vehicles.');
            } else {
                setError(error.message || 'Failed to fetch vehicles');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Routes>
            <Route path="/*" element={
                <div>
                    <Header
                        user={{name: employeeName, employeeId: employeeId}}
                        showAdmin={false}
                        showRegister={false}
                        onHamburgerClick={() => setSidebarCollapsed((collapsed) => !collapsed)}
                    />
                    <Sidebar collapsed={sidebarCollapsed}/>
                    <Routes>
                        <Route path="parking-history" element={<ParkingHistory sidebarCollapsed={sidebarCollapsed}/>}/>
                        <Route path="fare-details" element={<FareDetails sidebarCollapsed={sidebarCollapsed}/>}/>
                        <Route path="parking-booking" element={<ParkingBooking sidebarCollapsed={sidebarCollapsed}/>}/>
                        <Route path="subscription" element={<Subscription sidebarCollapsed={sidebarCollapsed}/>}/>
                        <Route path="lost-complaint" element={<LostComplaint sidebarCollapsed={sidebarCollapsed}/>}/>
                        <Route path="parking-status" element={<ParkingStatus sidebarCollapsed={sidebarCollapsed}/>}/>
                        <Route path="/" element={
                            <div className={`parking-history-container ${sidebarCollapsed ? 'collapsed' : 'expanded'}`}>
                                <h2 className="dashboard-title">{getGreeting()}, {employeeName || 'Employee'}!</h2>
                                <div className="employee-info">
									<span>
										<b>Employee ID:</b> {employeeId || '-'}
									</span>
                                </div>

                                <div className="dashboard-actions">
                                    <h3 className="dashboard-subtitle">Vehicle Details</h3>
                                    <div>
                                        <button className="check-in-btn" onClick={handleCheckInClick}>
                                            Check In
                                        </button>
                                        <button className="subscription-btn" onClick={handleSubscriptionClick}
                                                style={{marginLeft: '10px'}}>
                                            Activate Subscription
                                        </button>
                                    </div>
                                </div>

                                <div className="table-wrapper">
                                    <table className="parking-history-table">
                                        <thead>
                                        <tr>
                                            <th>Vehicle Number</th>
                                            <th>Vehicle Type</th>
                                            <th>Allotted By</th>
                                            <th>Entry Time</th>
                                            <th>Action</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {vehicles.map((vehicle) => (
                                            <tr key={vehicle.parkingId}
                                                className={vehicle.vehicleLocked ? 'locked-vehicle-row' : ''}>
                                                <td>{vehicle.vehicleNumber}</td>
                                                <td>{vehicle.vehicleType}</td>
                                                <td>{vehicle.allocatedBy}</td>
                                                <td>{vehicle.entryTime}</td>
                                                <td style={{textAlign: 'center'}}>
                                                    {vehicle.vehicleLocked ? (
                                                        // Show Details button if vehicle is locked
                                                        <button
                                                            className="details-btn"
                                                            onClick={() => handleDetailsClick(vehicle)}
                                                        >
                                                            Details
                                                        </button>
                                                    ) : (
                                                        // Show Lock and Exit buttons if vehicle is not locked
                                                        <>
                                                            <button
                                                                className="lock-btn"
                                                                style={{marginRight: '0.5rem'}}
                                                                disabled={!!vehicle.exitBy}
                                                                onClick={() => handleLockClick(vehicle)}
                                                            >
                                                                Lock
                                                            </button>
                                                            <button
                                                                className="exit-btn"
                                                                disabled={!!vehicle.exitBy}
                                                                onClick={() => handleExitClick(vehicle)}
                                                            >
                                                                Exit
                                                            </button>
                                                        </>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Exit Popup */}
                                {showExitPopup && selectedVehicle && (
                                    <>
                                        <div className="exit-popup-overlay"
                                             onClick={() => setShowExitPopup(false)}></div>
                                        <div className="exit-popup-card logo-theme">
                                            <span className="exit-popup-close" onClick={() => setShowExitPopup(false)}
                                                  title="Close">&#10005;</span>
                                            <div className="exit-popup-title">Parking Charge Details</div>
                                            <table className="exit-popup-details-table">
                                                <tbody>
                                                <tr>
                                                    <td className="exit-popup-detail-label"><b>Vehicle Number:</b></td>
                                                    <td className="exit-popup-detail-value">{selectedVehicle.vehicleNumber}</td>
                                                </tr>
                                                <tr>
                                                    <td className="exit-popup-detail-label"><b>Entry Time:</b></td>
                                                    <td className="exit-popup-detail-value">{selectedVehicle.entryTime}</td>
                                                </tr>
                                                <tr>
                                                    <td className="exit-popup-detail-label"><b>Exit Time:</b></td>
                                                    <td className="exit-popup-detail-value">{selectedVehicle.exitTime}</td>
                                                </tr>
                                                <tr>
                                                    <td className="exit-popup-detail-label"><b>Fare:</b></td>
                                                    <td className="exit-popup-detail-value">₹{selectedVehicle.fare}</td>
                                                </tr>
                                                </tbody>
                                            </table>
                                            <div className="exit-popup-payment-method">
                                                <label htmlFor="payment-method" className="exit-popup-detail-label">Payment
                                                    Method:</label>
                                                <select
                                                    id="payment-method"
                                                    className="exit-popup-payment-dropdown"
                                                    value={paymentMethod}
                                                    onChange={e => setPaymentMethod(e.target.value)}
                                                >
                                                    <option value="CASH">CASH</option>
                                                    <option value="Card">Card</option>
                                                    <option value="UPI">UPI</option>
                                                </select>
                                            </div>
                                            {paymentMethod === 'UPI' && (
                                                <div className="exit-popup-qr-section">
                                                    <div className="exit-popup-detail-label"
                                                         style={{marginBottom: '0.5rem'}}>Scan to pay via UPI:
                                                    </div>
                                                    <QRCodeSVG
                                                        value="upi://pay?pa=898100491614-2@axl@upi&pn=LX Parking&am={selectedVehicle.parkingCharge}&cu=INR&tn=Parking%20Fare%20Payment"
                                                        size={128}
                                                        bgColor="#fffbe6"
                                                        fgColor="#a57b0a"
                                                        className="exit-popup-qr-code"
                                                    />
                                                </div>
                                            )}
                                            <button
                                                className="confirm-exit-btn"
                                                onClick={handleConfirmExit}
                                            >
                                                Confirm
                                            </button>
                                        </div>
                                    </>
                                )}

                                {/* Check In Popup */}
                                {showCheckInPopup && (
                                    <>
                                        <div className="exit-popup-overlay"
                                             onClick={() => setShowCheckInPopup(false)}></div>
                                        <div className="exit-popup-card logo-theme">
                                            <span className="exit-popup-close"
                                                  onClick={() => setShowCheckInPopup(false)}
                                                  title="Close">&#10005;</span>
                                            <div className="exit-popup-title">Check In Vehicle</div>
                                            <div className="check-in-form">
                                                <div className="form-field">
                                                    <label htmlFor="vehicle-number" className="form-label">Vehicle
                                                        Number:</label>
                                                    <input
                                                        type="text"
                                                        id="vehicle-number"
                                                        name="vehicleNumber"
                                                        className="form-input"
                                                        value={checkInData.vehicleNumber}
                                                        onChange={handleCheckInFormChange}
                                                    />
                                                    {formErrors.vehicleNumber && (
                                                        <div className="form-error">{formErrors.vehicleNumber}</div>
                                                    )}
                                                </div>
                                                <div className="form-field">
                                                    <label htmlFor="vehicle-type" className="form-label">Vehicle
                                                        Type:</label>
                                                    <select
                                                        id="vehicle-type"
                                                        name="vehicleType"
                                                        className="form-select"
                                                        value={checkInData.vehicleType}
                                                        onChange={handleCheckInFormChange}
                                                    >
                                                        <option value="Car">Car</option>
                                                        <option value="Bike">Bike</option>
                                                        <option value="Heavy Vehicle">Heavy Vehicle</option>
                                                        {/* Add more vehicle types as needed */}
                                                    </select>
                                                    {formErrors.vehicleType && (
                                                        <div className="form-error">{formErrors.vehicleType}</div>
                                                    )}
                                                </div>
                                                <div className="form-field">
                                                    <label htmlFor="parking-type" className="form-label">Parking
                                                        Type:</label>
                                                    <select
                                                        id="parking-type"
                                                        name="parkingType"
                                                        className="form-select"
                                                        value={checkInData.parkingType}
                                                        onChange={handleCheckInFormChange}
                                                    >
                                                        <option value="Hourly">Hourly</option>
                                                        <option value="Daily">Daily</option>
                                                        <option value="Monthly">Monthly</option>
                                                    </select>
                                                    {formErrors.parkingType && (
                                                        <div className="form-error">{formErrors.parkingType}</div>
                                                    )}
                                                </div>

                                                {/* Parking Lot and Available Slots in horizontal layout */}
                                                <div style={{display: 'flex', gap: '15px'}}>
                                                    <div className="form-field" style={{flex: 1}}>
                                                        <label className="form-label"><b>Parking Lot:</b></label>
                                                        <span className="form-value">{parkingLotName}</span>
                                                    </div>
                                                    <div className="form-field" style={{flex: 1, textAlign: 'right'}}>
                                                        <label className="form-label"><b>Available Slots:</b></label>
                                                        <div style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'flex-end'
                                                        }}>
                                                            <span className="form-value" style={{
                                                                color: availableSlots[checkInData.vehicleType] < 10 ? '#d32f2f' : '#28a745',
                                                                fontWeight: 'bold'
                                                            }}>
                                                                {availableSlots[checkInData.vehicleType] || 0}
                                                            </span>
                                                            <button
                                                                className="refresh-slots-btn"
                                                                onClick={(e) => {
                                                                    e.preventDefault(); // Prevent form submission
                                                                    refreshAvailableSlots();
                                                                }}
                                                                title="Refresh available slots"
                                                                style={{
                                                                    marginLeft: '5px',
                                                                    background: 'transparent',
                                                                    border: 'none',
                                                                    cursor: 'pointer',
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    width: '24px',
                                                                    height: '24px',
                                                                    borderRadius: '50%',
                                                                    padding: 0
                                                                }}
                                                            >
                                                                <span style={{
                                                                    color: '#a57b0a',
                                                                    fontSize: '16px',
                                                                    fontWeight: 'bold'
                                                                }}>↻</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                className="confirm-exit-btn"
                                                onClick={handleCheckInSubmit}
                                            >
                                                Submit
                                            </button>
                                        </div>
                                    </>
                                )}

                                {/* Lock Vehicle Popup */}
                                {showLockPopup && selectedVehicle && (
                                    <>
                                        <div className="exit-popup-overlay"
                                             onClick={() => setShowLockPopup(false)}></div>
                                        <div className="exit-popup-card logo-theme">
                                            <span className="exit-popup-close" onClick={() => setShowLockPopup(false)}
                                                  title="Close">&#10005;</span>
                                            <div className="exit-popup-title">Lock Vehicle</div>
                                            <div className="lock-popup-content">
                                                <p>Are you sure you want to lock this vehicle?</p>
                                                <div className="form-field">
                                                    <label htmlFor="lock-reason" className="form-label">Reason for
                                                        locking:</label>
                                                    <textarea
                                                        id="lock-reason"
                                                        className="form-textarea"
                                                        value={lockReason}
                                                        onChange={handleLockReasonChange}
                                                        rows="4"
                                                        placeholder="Please provide a detailed reason for locking this vehicle (minimum 50 characters required)"
                                                    ></textarea>
                                                    <div className="char-counter">
														<span className={charCount < 30 ? 'counter-error' : ''}>
															{charCount}/150 characters
                                                            {charCount < 30 ? ` (${30 - charCount} more needed)` : ''}
														</span>
                                                    </div>
                                                    {lockReasonError && (
                                                        <div className="form-error">{lockReasonError}</div>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                className="confirm-exit-btn"
                                                onClick={handleLockConfirm}
                                            >
                                                Confirm Lock
                                            </button>
                                        </div>
                                    </>
                                )}

                                {/* Vehicle Details Popup (for locked vehicles) */}
                                {showDetailsPopup && selectedVehicle && (
                                    <>
                                        <div className="exit-popup-overlay"
                                             onClick={() => setShowDetailsPopup(false)}></div>
                                        <div className="exit-popup-card logo-theme">
                                            <span className="exit-popup-close"
                                                  onClick={() => setShowDetailsPopup(false)}
                                                  title="Close">&#10005;</span>
                                            <div className="exit-popup-title">Vehicle Lock Details</div>
                                            <table className="exit-popup-details-table">
                                                <tbody>
                                                <tr>
                                                    <td className="exit-popup-detail-label"><b>Vehicle Number:</b></td>
                                                    <td className="exit-popup-detail-value">{selectedVehicle.vehicleNumber}</td>
                                                </tr>
                                                <tr>
                                                    <td className="exit-popup-detail-label"><b>Entry Time:</b></td>
                                                    <td className="exit-popup-detail-value">{selectedVehicle.entryTime}</td>
                                                </tr>
                                                <tr>
                                                    <td className="exit-popup-detail-label"><b>Locked By:</b></td>
                                                    <td className="exit-popup-detail-value">{selectedVehicle.lockedBy}</td>
                                                </tr>
                                                <tr>
                                                    <td className="exit-popup-detail-label"><b>Lock Time:</b></td>
                                                    <td className="exit-popup-detail-value">{selectedVehicle.lockedTime}</td>
                                                </tr>
                                                </tbody>
                                            </table>
                                            <div className="lock-reason-display">
                                                <h4 className="lock-reason-title">Reason for locking:</h4>
                                                <p className="lock-reason-text">{selectedVehicle.lockReason}</p>
                                            </div>
                                            <button
                                                className="unlock-btn"
                                                onClick={handleUnlockClick}
                                            >
                                                Unlock Vehicle
                                            </button>
                                        </div>
                                    </>
                                )}

                                {/* Unlock Vehicle Popup with Payment */}
                                {showUnlockPopup && selectedVehicle && (
                                    <>
                                        <div className="exit-popup-overlay"
                                             onClick={() => setShowUnlockPopup(false)}></div>
                                        <div className="exit-popup-card logo-theme">
                                            <span className="exit-popup-close" onClick={() => setShowUnlockPopup(false)}
                                                  title="Close">&#10005;</span>
                                            <div className="exit-popup-title">Unlock Vehicle</div>
                                            <div className="unlock-popup-content">
                                                <p>To unlock this vehicle, a penalty fee of ₹{unlockFee} must be
                                                    paid.</p>
                                                <table className="exit-popup-details-table">
                                                    <tbody>
                                                    <tr>
                                                        <td className="exit-popup-detail-label"><b>Vehicle Number:</b>
                                                        </td>
                                                        <td className="exit-popup-detail-value">{selectedVehicle.vehicleNumber}</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="exit-popup-detail-label"><b>Penalty Fee:</b></td>
                                                        <td className="exit-popup-detail-value">₹{unlockFee}</td>
                                                    </tr>
                                                    </tbody>
                                                </table>
                                                <div className="exit-popup-payment-method">
                                                    <label htmlFor="unlock-payment-method"
                                                           className="exit-popup-detail-label">Payment Method:</label>
                                                    <select
                                                        id="unlock-payment-method"
                                                        className="exit-popup-payment-dropdown"
                                                        value={unlockPaymentMethod}
                                                        onChange={e => setUnlockPaymentMethod(e.target.value)}
                                                    >
                                                        <option value="CASH">CASH</option>
                                                        <option value="Card">Card</option>
                                                        <option value="UPI">UPI</option>
                                                    </select>
                                                </div>
                                                {unlockPaymentMethod === 'UPI' && (
                                                    <div className="exit-popup-qr-section">
                                                        <div className="exit-popup-detail-label"
                                                             style={{marginBottom: '0.5rem'}}>Scan to pay via UPI:
                                                        </div>
                                                        <QRCodeSVG
                                                            value={`upi://pay?pa=test@upi&pn=UnlockFee&am=${unlockFee}`}
                                                            size={128}
                                                            bgColor="#fffbe6"
                                                            fgColor="#a57b0a"
                                                            className="exit-popup-qr-code"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                className="confirm-exit-btn"
                                                onClick={handleUnlockConfirm}
                                            >
                                                Confirm Payment & Unlock
                                            </button>
                                        </div>
                                    </>
                                )}

                                {/* Subscription Popup */}
                                {showSubscriptionPopup && (
                                    <>
                                        <div className="exit-popup-overlay"
                                             onClick={() => setShowSubscriptionPopup(false)}></div>
                                        <div className="exit-popup-card logo-theme" style={{maxWidth: '500px'}}>
                                            <span className="exit-popup-close"
                                                  onClick={() => setShowSubscriptionPopup(false)}
                                                  title="Close">&#10005;</span>
                                            <div className="exit-popup-title">Activate Subscription</div>
                                            <div className="subscription-form">
                                                <div className="form-field">
                                                    <label htmlFor="subscription-vehicle-number" className="form-label">Vehicle
                                                        Number:</label>
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
                                                        <div
                                                            className="form-error">{subscriptionErrors.vehicleNumber}</div>
                                                    )}
                                                </div>

                                                {/* Horizontal layout for Vehicle Type and Subscription Frequency */}
                                                <div style={{display: 'flex', gap: '15px'}}>
                                                    <div className="form-field" style={{flex: 1}}>
                                                        <label htmlFor="subscription-vehicle-type"
                                                               className="form-label">Vehicle Type:</label>
                                                        <select
                                                            id="subscription-vehicle-type"
                                                            name="vehicleType"
                                                            className="form-select"
                                                            value={subscriptionData.vehicleType}
                                                            onChange={handleSubscriptionFormChange}
                                                            style={{width: '100%'}}
                                                        >
                                                            <option value="Car">Car</option>
                                                            <option value="Bike">Bike</option>
                                                            <option value="Heavy Vehicle">Heavy Vehicle</option>
                                                            <option value="SUV">SUV</option>
                                                        </select>
                                                        {subscriptionErrors.vehicleType && (
                                                            <div
                                                                className="form-error">{subscriptionErrors.vehicleType}</div>
                                                        )}
                                                    </div>

                                                    <div className="form-field" style={{flex: 1}}>
                                                        <label htmlFor="subscription-frequency" className="form-label">Subscription
                                                            Frequency:</label>
                                                        <select
                                                            id="subscription-frequency"
                                                            name="subscriptionFrequency"
                                                            className="form-select"
                                                            value={subscriptionData.subscriptionFrequency}
                                                            onChange={handleSubscriptionFormChange}
                                                            style={{width: '100%'}}
                                                        >
                                                            <option value="Monthly">Monthly</option>
                                                            <option value="Quarterly">Quarterly</option>
                                                            <option value="Half-yearly">Half-yearly</option>
                                                            <option value="Yearly">Yearly</option>
                                                        </select>
                                                        {subscriptionErrors.subscriptionFrequency && (
                                                            <div
                                                                className="form-error">{subscriptionErrors.subscriptionFrequency}</div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="form-field">
                                                    <label htmlFor="subscription-type" className="form-label">Subscription
                                                        Type:</label>
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
                                                        <div
                                                            className="form-error">{subscriptionErrors.subscriptionType}</div>
                                                    )}
                                                </div>

                                                <div className="form-field">
                                                    <label className="form-label"><b>Parking Lot:</b></label>
                                                    <span className="form-value">{parkingLotName}</span>
                                                </div>

                                                {/* Subscription Charge Field */}
                                                <div className="form-field" style={{
                                                    backgroundColor: '#f8f8f8',
                                                    padding: '10px',
                                                    borderRadius: '4px',
                                                    marginTop: '10px'
                                                }}>
                                                    <label className="form-label"><b>Subscription Charge:</b></label>
                                                    <div style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        marginTop: '5px'
                                                    }}>
                                                        <div>
                                                            <span className="form-value" style={{fontSize: '1.1em'}}>
                                                                ₹{calculateSubscriptionCharge(
                                                                subscriptionData.subscriptionType,
                                                                subscriptionData.subscriptionFrequency,
                                                                subscriptionData.vehicleType
                                                            ).monthly}
                                                            </span>
                                                            <span style={{
                                                                fontSize: '0.9em',
                                                                color: '#666'
                                                            }}> / month</span>
                                                        </div>
                                                        <div>
                                                            <span className="form-label" style={{
                                                                fontWeight: 'bold',
                                                                color: '#a57b0a'
                                                            }}>Total: </span>
                                                            <span className="form-value" style={{
                                                                fontWeight: 'bold',
                                                                fontSize: '1.1em',
                                                                color: '#a57b0a'
                                                            }}>
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
                                            <div className="subscription-benefits" style={{
                                                marginTop: '15px',
                                                marginBottom: '15px',
                                                border: '1px solid #ddd',
                                                padding: '10px',
                                                borderRadius: '4px'
                                            }}>
                                                <h4 style={{marginTop: '0', marginBottom: '10px'}}>Benefits:</h4>
                                                <ul style={{paddingLeft: '20px', margin: '0'}}>
                                                    {getSubscriptionBenefits(subscriptionData.subscriptionType).map((benefit, index) => (
                                                        <li key={index} style={{marginBottom: '5px'}}>{benefit}</li>
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
                            </div>
                        }/>
                    </Routes>
                    <Toast show={toast.show} message={toast.message} type={toast.type}
                           onClose={() => setToast({...toast, show: false})}/>
                </div>
            }/>
        </Routes>
    );
};

export default EmployeeDashboard;
