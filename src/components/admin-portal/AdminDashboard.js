import React, { useState, useEffect } from 'react';
import Header from '../Header';
import Toast from '../Toast';
import './AdminDashboard.css';
import { ReactComponent as RequestIcon } from '../../logo.svg'; // Placeholder, replace with actual icons
import { ReactComponent as EmployeeIcon } from '../../logo.svg'; // Placeholder, replace with actual icons
import { ReactComponent as ParkingIcon } from '../../logo.svg'; // Placeholder, replace with actual icons

const initialRequests = [
	{
		id: 1,
		name: 'John Doe',
		email: 'john',
		requestedOn: '2025-09-15',
		parkingLot: 'GNIO',
		address: 'Sector 63, Noida',
		status: 'pending',
	},
	{
		id: 2,
		name: 'Jane Smith',
		email: 'jane',
		requestedOn: '2025-09-16',
		parkingLot: 'DLF',
		address: 'DLF Mall, Noida',
		status: 'pending',
	},
];

const mockEmployees = [
	{
		id: 'LX1001',
		name: 'Alice Johnson',
		email: 'alice.',
		requestedOn: '2025-09-10',
		parkingLot: 'GNIOT Parking Lot',
		address: 'Sector 62, Noida',
		status: 'active',
	},
	{
		id: 'EMP002',
		name: 'Bob Williams',
		email: 'bob',
		requestedOn: '2025-09-12',
		parkingLot: 'DLF Parking',
		address: 'DLF Mall, Noida',
		status: 'active',
	},
];
// Use a relative base by default so the CRA dev-server proxy can forward API calls during development.
// If you need to target a different backend (e.g., production), set REACT_APP_API_BASE in .env.
const RAW_API_BASE = process.env.REACT_APP_API_BASE || '';
// During development prefer relative paths so CRA's "proxy" in package.json can forward requests
// and avoid CORS preflight issues. In production, prefix with the configured API base.
const API_BASE = (process.env.NODE_ENV === 'development') ? '' : RAW_API_BASE;

const buildApiPath = (path) => {
     const p = path.startsWith('/') ? path : `/${path}`;
     // If API_BASE is empty (development or same-origin), return a relative path.
     if (!API_BASE) return p;
     // Otherwise prefix with the API base (production or explicit backend).
     return `${API_BASE}${p}`;
 };

// Helper: robustly read auth token from localStorage. Supports JSON object or raw token string.
const getAuthToken = () => {
    try {
        const raw = localStorage.getItem('auth');
        if (!raw) return null;
        try {
            const parsed = JSON.parse(raw);
            // parentheses clarify order: if parsed exists, prefer parsed.token/auth/accessToken; otherwise fallback to raw
            return (parsed && (parsed.token || parsed.auth || parsed.accessToken)) || raw;
        } catch (e) {
            // raw is not JSON — treat it as token string
            return raw;
        }
    } catch (e) {
        return null;
    }
};

// If any API returns 403, clear auth and route to login page.
const handleForbidden = (resp) => {
    try {
        if (resp && resp.status === 403) {
            try { localStorage.removeItem('auth'); } catch (e) { /* ignore */ }
            // route to login page (same-origin)
            window.location.href = '/login';
            // throw to stop further processing
            throw new Error('Forbidden');
        }
    } catch (err) {
        // rethrow so callers can handle
        throw err;
    }
};

const mockParkingLots = [
	{
		name: 'GNIOT Parking Lot',
		address: 'Sector 63, Noida',
		bike: 50,
		car: 100,
		heavy: 10,
		status: 'active',
	},
	{
		name: 'DLF Parking',
		address: 'DLF Mall, Noida',
		bike: 30,
		car: 80,
		heavy: 5,
		status: 'inactive',
	},
];

const NewParkingLotPopup = ({ open, onClose, onCreate, createLoading = false }) => {
	const [form, setForm] = useState({
		name: '',
		address: '',
		bike: '',
		car: '',
		heavy: '',
	});
	const [error, setError] = useState('');

	useEffect(() => {
		if (open) {
			setForm({ name: '', address: '', bike: '', car: '', heavy: '' });
			setError('');
		}
	}, [open]);

	if (!open) return null;

	const handleChange = e => {
		setForm({ ...form, [e.target.name]: e.target.value });
		setError('');
	};

	const handleSubmit = e => {
		e.preventDefault();
		if (!form.name || !form.address || !form.bike || !form.car || !form.heavy) {
			setError('All fields are required');
			return;
		}
		// Do NOT close the popup immediately. Parent will close it after successful creation.
		onCreate(form);
	};

	return (
		<div className="popup-overlay">
			<div className="popup-box">
				<h3>New Parking Lot</h3>
				<form onSubmit={handleSubmit} className="popup-form">
					<input
						name="name"
						placeholder="Parking Lot Name"
						value={form.name}
						onChange={handleChange}
						required
					/>
					<input
						name="address"
						placeholder="Address"
						value={form.address}
						onChange={handleChange}
						required
					/>
					<input
						name="bike"
						type="number"
						min="0"
						placeholder="Bike Capacity"
						value={form.bike}
						onChange={handleChange}
						required
					/>
					<input
						name="car"
						type="number"
						min="0"
						placeholder="Car Capacity"
						value={form.car}
						onChange={handleChange}
						required
					/>
					<input
						name="heavy"
						type="number"
						min="0"
						placeholder="Heavy Vehicle Capacity"
						value={form.heavy}
						onChange={handleChange}
						required
					/>
					{error && <div className="error-msg">{error}</div>}
					<div className="popup-actions">
						<button type="button" className="popup-cancel" onClick={onClose} disabled={createLoading}>
							Cancel
						</button>
						<button type="submit" className="popup-create" disabled={createLoading}>
							{createLoading ? 'Creating...' : 'Create'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

const AdminDashboard = () => {
     const [requests, setRequests] = useState(initialRequests);
     const [approvingIds, setApprovingIds] = useState([]);
     const [employees, setEmployees] = useState(mockEmployees);
     const [employeeLoading, setEmployeeLoading] = useState(false);
     const [employeeError, setEmployeeError] = useState('');
     const [parkingLots, setParkingLots] = useState(mockParkingLots);
     const [activeTab, setActiveTab] = useState('onboard');
     const [popupOpen, setPopupOpen] = useState(false);
     const [pendingLoading, setPendingLoading] = useState(false);
     const [pendingError, setPendingError] = useState('');
     // toast for showing API responses
     const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
     // create parking lot loading state
     const [createLoading, setCreateLoading] = useState(false);
     const [parkingLoading, setParkingLoading] = useState(false);
     const [parkingError, setParkingError] = useState('');

     // Get user from localStorage (for name and employeeId)
     const user = React.useMemo(() => {
         try {
             return JSON.parse(localStorage.getItem('user')) || { name: 'Admin' };
         } catch {
             return { name: 'Admin' };
         }
     }, []);

     useEffect(() => {
         document.title = 'Admin Dashboard | Parking Lot';
         const favicon = document.querySelector("link[rel~='icon']");
         if (favicon) {
             favicon.href = '/logo.svg';
         }
     }, []);

     // Fetch pending onboard requests from API
     const fetchPendingRequests = async () => {
         setPendingError('');
         setPendingLoading(true);
         try {
             const token = getAuthToken();
             const headers = { 'Content-Type': 'application/json' };
             if (token) headers.Authorization = `Bearer ${token}`;

             const resp = await fetch(buildApiPath('/parkinglot/api/v1/admin/fetch/pending/users'), {
                 method: 'POST',
                 headers,
                 body: JSON.stringify({}) // API expects POST; body empty
             });

             handleForbidden(resp);

             if (!resp.ok) {
                 const txt = await resp.text();
                 const msg = txt || `Request failed (${resp.status})`;
                 setPendingError(msg);
                 setRequests([]);
                 setPendingLoading(false);
                 return;
             }

             const data = await resp.json();
             const arr = (data && data.pendingUserDetails) || [];
             // Map API objects to table rows expected by UI
             const mapped = arr.map((u, idx) => ({
                 // prefer server-provided numeric id for React key; fallback to employeeId or index
                 id: (u.id !== undefined && u.id !== null) ? u.id : (u.employeeId || idx),
                 name: u.employeeName || '-',
                 employeeId: u.employeeId || '-',
                 email: u.emailId || '-',
                 requestedOn: u.requestedOn || '-',
                 parkingLot: u.parkingLotName || '-',
                 address: u.parkingLotAddress || '-',
                 status: 'pending',
             }));
             setRequests(mapped);
         } catch (err) {
             console.error('Failed to fetch pending requests', err);
             setPendingError(err.message || 'Failed to fetch pending requests');
             setRequests([]);
         } finally {
             setPendingLoading(false);
         }
     };

     // Fetch current employees from API
     const fetchCurrentUsers = async () => {
         setEmployeeError('');
         setEmployeeLoading(true);
         try {
             const token = getAuthToken();
             const headers = { 'Content-Type': 'application/json' };
             if (token) headers.Authorization = `Bearer ${token}`;

             const resp = await fetch(buildApiPath('/parkinglot/api/v1/admin/fetch/current/users'), {
                 method: 'POST',
                 headers,
                 body: JSON.stringify({}),
             });

             handleForbidden(resp);

             const bodyText = await resp.text();
             let dataObj = null;
             if (bodyText) {
                 try {
                     dataObj = JSON.parse(bodyText);
                 } catch (e) {
                     // backend returned plain text — try to treat as message
                     dataObj = { pendingUserDetails: [] };
                 }
             }

             if (!resp.ok) {
                 const msg = (dataObj && (dataObj.message || dataObj.msg)) || bodyText || `Request failed (${resp.status})`;
                 setEmployeeError(msg);
                 setEmployees([]);
                 return;
             }

             // Accept various shapes: pendingUserDetails (as sample), currentUserDetails, or an array directly
             const arr = (dataObj && (dataObj.pendingUserDetails || dataObj.currentUserDetails)) || [];
             // If dataObj is an array (some APIs return array directly), use it
             const finalArr = Array.isArray(dataObj) ? dataObj : arr;

             const mapped = (finalArr || []).map((u, idx) => ({
                 id: (u.id !== undefined && u.id !== null) ? u.id : (u.employeeId || idx),
                 name: u.employeeName || u.name || '-',
                 employeeId: u.employeeId || u.empId || '-',
                 email: u.emailId || u.email || '-',
                 requestedOn: u.requestedOn || u.joinedOn || '-',
                 parkingLot: u.parkingLotName || '-',
                 address: u.parkingLotAddress || '-',
                 status: u.status || 'active',
             }));

             setEmployees(mapped);
         } catch (err) {
             console.error('Failed to fetch current users', err);
             setEmployeeError(err.message || 'Failed to fetch current users');
             setEmployees([]);
         } finally {
             setEmployeeLoading(false);
         }
     };

     // Fetch pending requests when component mounts and when the onboard tab becomes active
     useEffect(() => {
         if (activeTab === 'onboard') {
             fetchPendingRequests();
         } else if (activeTab === 'employee') {
             // fetch current employee list when employee tab is active
             fetchCurrentUsers();
         } else if (activeTab === 'parking') {
             // fetch parking lots when parking tab is active
             fetchParkingLots();
         }
     }, [activeTab]);

     // Fetch parking lots from backend
     const fetchParkingLots = async () => {
         setParkingError('');
         setParkingLoading(true);
         try {
             const token = getAuthToken();
             const headers = { 'Content-Type': 'application/json' };
             if (token) headers.Authorization = `Bearer ${token}`;

             // The backend example uses POST to /parkinglot/api/v1/fetch/parking/lot?=null
             const resp = await fetch(buildApiPath('/parkinglot/api/v1/fetch/parking/lot?=null'), {
                 method: 'POST',
                 headers,
                 body: JSON.stringify({}),
             });

             handleForbidden(resp);

             const bodyText = await resp.text();
             let dataObj = null;
             if (bodyText) {
                 try { dataObj = JSON.parse(bodyText); } catch (e) { dataObj = null; }
             }

             if (!resp.ok) {
                 const msg = (dataObj && (dataObj.message || dataObj.msg)) || bodyText || `Request failed (${resp.status})`;
                 setParkingError(msg);
                 setParkingLots([]);
                 return;
             }

             // expected shape: { parkingLots: [ ... ] }
             const arr = (dataObj && dataObj.parkingLots) || [];
             // if backend returns array directly
             const finalArr = Array.isArray(dataObj) ? dataObj : arr;

             const mapped = (finalArr || []).map((p, idx) => ({
                 id: (p.id !== undefined && p.id !== null) ? p.id : idx,
                 name: p.parkingLotName || p.name || '-',
                 address: p.address || '-',
                 bike: p.bikeCapacity || p.bike || 0,
                 car: p.carCapacity || p.car || 0,
                 heavy: p.heavyVehicleCapacity || p.heavy || 0,
                 status: (p.status || '').toLowerCase() === 'active' || (p.status || '').toLowerCase() === 'approved' ? 'active' : 'inactive',
             }));

             setParkingLots(mapped);
         } catch (err) {
             console.error('Failed to fetch parking lots', err);
             setParkingError(err.message || 'Failed to fetch parking lots');
             setParkingLots([]);
         } finally {
             setParkingLoading(false);
         }
     };

     const handleAction = (id, action) => {
        setRequests(reqs => reqs.map(r => (r.id === id ? { ...r, status: action } : r)));
    };

    // Approve user by ID via API; update UI on success and show toast
    const approveUser = async (id) => {
        // avoid duplicate approvals
        if (approvingIds.includes(id)) return;
        setApprovingIds(ids => [...ids, id]);
        try {
            const token = getAuthToken();
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers.Authorization = `Bearer ${token}`;

            const resp = await fetch(buildApiPath(`/parkinglot/api/v1/admin/approve/users/${id}`), {
                method: 'POST',
                headers,
                body: JSON.stringify({}),
            });

            handleForbidden(resp);

            const bodyText = await resp.text();
            let respMessage = '';
            if (bodyText) {
                try {
                    const parsed = JSON.parse(bodyText);
                    if (typeof parsed === 'string') respMessage = parsed;
                    else if (typeof parsed === 'object') respMessage = parsed.message || parsed.msg || JSON.stringify(parsed);
                    else respMessage = String(parsed);
                } catch (e) {
                    respMessage = bodyText;
                }
            }

            if (!resp.ok) {
                const msg = respMessage || `Approve failed (${resp.status})`;
                setToast({ show: true, message: msg, type: 'error' });
                return;
            }

            const successMsg = respMessage || 'Employee account approved successfully';
            // Update local requests list: mark as approved
            setRequests(reqs => reqs.map(r => (r.id === id ? { ...r, status: 'approved' } : r)));
            setToast({ show: true, message: successMsg, type: 'success' });
            // Refresh lists so UI reflects server state
            try { await fetchPendingRequests(); } catch (e) { /* ignore */ }
            try { await fetchCurrentUsers(); } catch (e) { /* ignore */ }
        } catch (err) {
            console.error('Failed to approve user', err);
            setToast({ show: true, message: err.message || 'Failed to approve user', type: 'error' });
        } finally {
            setApprovingIds(ids => ids.filter(i => i !== id));
        }
    };

     const handleCreateParkingLot = async (newLot) => {
         // Create parking lot via API; on success show API response as toast and update local state
         setCreateLoading(true);
         try {
             const token = getAuthToken();
             const headers = { 'Content-Type': 'application/json' };
             if (token) headers.Authorization = `Bearer ${token}`;

             const payload = {
                 parkingLotName: newLot.name,
                 address: newLot.address,
                 bikeCapacity: Number(newLot.bike),
                 carCapacity: Number(newLot.car),
                 heavyVehicleCapacity: Number(newLot.heavy),
             };

             const resp = await fetch(buildApiPath('/parkinglot/api/v1/admin/create/parking'), {
                 method: 'POST',
                 headers,
                 body: JSON.stringify(payload),
             });

             handleForbidden(resp);

             // Read the body text once then try to parse JSON. This avoids "body stream already read" errors
             let respMessage;
             const bodyText = await resp.text();
             if (bodyText) {
                 try {
                     const parsed = JSON.parse(bodyText);
                     if (typeof parsed === 'string') {
                         respMessage = parsed;
                     } else if (typeof parsed === 'object') {
                         respMessage = parsed.message || parsed.msg || JSON.stringify(parsed);
                     } else {
                         respMessage = String(parsed);
                     }
                 } catch (e) {
                     // not JSON, use raw text
                     respMessage = bodyText;
                 }
             } else {
                 respMessage = '';
             }

             if (!resp.ok) {
                 const msg = respMessage || `Create failed (${resp.status})`;
                 setToast({ show: true, message: msg, type: 'error' });
                 return;
             }

             // Success: show server message (or default), add to local list and close popup
             const successMsg = respMessage || 'Parking lot created successfully';
             setParkingLots(lots => [...lots, { ...newLot, status: 'inactive', bike: Number(newLot.bike), car: Number(newLot.car), heavy: Number(newLot.heavy) }]);
             setToast({ show: true, message: successMsg, type: 'success' });
             setActiveTab('parking');
             setPopupOpen(false);
             // refresh employee list if visible (in case creation affects it)
             if (activeTab === 'employee') fetchCurrentUsers();
         } catch (err) {
             console.error('Failed to create parking lot', err);
             const msg = err.message || 'Failed to create parking lot';
             setToast({ show: true, message: msg, type: 'error' });
         } finally {
             setCreateLoading(false);
         }
     };

     const handleDeactivateEmployee = (id) => {
         setEmployees(emps => emps.map(emp => emp.id === id ? { ...emp, status: 'inactive' } : emp));
     };
     const handleActivateParkingLot = (idx) => {
         setParkingLots(lots => lots.map((lot, i) => i === idx ? { ...lot, status: 'active' } : lot));
     };
     const handleDeactivateParkingLot = (idx) => {
         setParkingLots(lots => lots.map((lot, i) => i === idx ? { ...lot, status: 'inactive' } : lot));
     };

     return (
		<div className="admin-dashboard-container">
			<Header showAdmin={false} showRegister={false} showEmployee={false} user={user} />
			<div className="admin-dashboard-content">
				<div className="dashboard-tabs-graphic">
					<div className={`tab-graphic${activeTab === 'onboard' ? ' tab-graphic-active' : ''}`} onClick={() => setActiveTab('onboard')}>
						<RequestIcon className="tab-icon" />
						<span>Onboard Request</span>
					</div>
					<div className={`tab-graphic${activeTab === 'employee' ? ' tab-graphic-active' : ''}`} onClick={() => setActiveTab('employee')}>
						<EmployeeIcon className="tab-icon" />
						<span>Current Employee</span>
					</div>
					<div className={`tab-graphic${activeTab === 'parking' ? ' tab-graphic-active' : ''}`} onClick={() => setActiveTab('parking')}>
						<ParkingIcon className="tab-icon" />
						<span>Parking Lot Details</span>
					</div>
				</div>
				<div className="dashboard-table-wrapper">
					<div className="admin-dashboard-actions" style={{ justifyContent: 'flex-end', marginBottom: '2rem' }}>
						<button className="onboard-btn" onClick={() => setPopupOpen(true)}>
							Onboard New Parking
						</button>
					</div>
					{activeTab === 'onboard' && (
						<>
							{pendingLoading ? (
								<div style={{ padding: 18 }}>Loading pending requests...</div>
							) : pendingError ? (
								<div style={{ padding: 18, color: 'red' }}>{pendingError}</div>
							) : requests.length === 0 ? (
								<div style={{ padding: 18, fontWeight: 600 }}>No Pending Request</div>
							) : (
								<table className="admin-dashboard-table">
									<thead>
										<tr>
											<th>Employee Name</th>
											<th>Employee ID</th>
											<th>Email Id</th>
											<th>Requested On</th>
											<th>Parking Lot Name</th>
											<th>Address</th>
											<th>Action</th>
										</tr>
									</thead>
									<tbody>
										{requests.map(req => (
											<tr key={req.id} className={req.status !== 'pending' ? `row-${req.status}` : ''}>
												<td>{req.name}</td>
												<td>{req.employeeId}</td>
												<td>{req.email}</td>
												<td>{req.requestedOn}</td>
												<td>{req.parkingLot}</td>
												<td>{req.address}</td>
												<td>
													{req.status === 'pending' ? (
							<>
								<button className="approve-btn" onClick={() => approveUser(req.id)} disabled={approvingIds.includes(req.id)}>
									{approvingIds.includes(req.id) ? 'Approving...' : 'Approve'}
								</button>
								<button className="reject-btn" onClick={() => handleAction(req.id, 'rejected')}>
									Reject
								</button>
							</>
						) : (
														<span className={`status-label ${req.status}`}>
															{req.status.charAt(0).toUpperCase() + req.status.slice(1)}
														</span>
													)}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							)}
						</>
					)}
					{activeTab === 'employee' && (
						<>
							{employeeLoading ? (
								<div style={{ padding: 18 }}>Loading employees...</div>
							) : employeeError ? (
								<div style={{ padding: 18, color: 'red' }}>{employeeError}</div>
							) : employees.length === 0 ? (
								<div style={{ padding: 18, fontWeight: 600 }}>No Employees Found</div>
							) : (
								<table className="admin-dashboard-table">
									<thead>
										<tr>
											<th>Employee Name</th>
											<th>Employee ID</th>
											<th>Parking Lot Name</th>
											<th>Address</th>
											<th>Action</th>
										</tr>
									</thead>
									<tbody>
										{employees.map(emp => (
											<tr key={emp.id} className={emp.status !== 'active' ? 'row-rejected' : ''}>
												<td>{emp.name}</td>
												<td>{emp.employeeId}</td>
												<td>{emp.parkingLot}</td>
												<td>{emp.address}</td>
												<td>
													<button className="reject-btn" onClick={() => handleDeactivateEmployee(emp.id)} disabled={emp.status !== 'active'}>
														Deactivate
													</button>
													<button className="update-btn">Transfer</button>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							)}
						</>
					)}
					{activeTab === 'parking' && (
						<>
							{parkingLoading ? (
								<div style={{ padding: 18 }}>Loading parking lots...</div>
							) : parkingError ? (
								<div style={{ padding: 18, color: 'red' }}>{parkingError}</div>
							) : parkingLots.length === 0 ? (
								<div style={{ padding: 18, fontWeight: 600 }}>No Parking Lots Found</div>
							) : (
								<table className="admin-dashboard-table">
									<thead>
										<tr>
											<th>Parking Lot Name</th>
											<th>Address</th>
											<th>Bike</th>
											<th>Car</th>
											<th>Heavy Vehicle</th>
											<th>Action</th>
										</tr>
									</thead>
									<tbody>
										{parkingLots.map((lot, idx) => (
											<tr key={lot.id || (lot.name + idx)} className={lot.status === 'active' ? 'row-approved' : 'row-rejected'}>
												<td>{lot.name}</td>
												<td>{lot.address}</td>
												<td>{lot.bike}</td>
												<td>{lot.car}</td>
												<td>{lot.heavy}</td>
												<td>
													{lot.status === 'active' ? (
														<>
															<button className="inactive-btn same-width-btn" onClick={() => handleDeactivateParkingLot(idx)}>
																Inactive
															</button>
															<button className="update-btn same-width-btn" disabled>
																Update
															</button>
														</>
													) : (
														<>
															<button className="active-btn same-width-btn" onClick={() => handleActivateParkingLot(idx)}>
																Active
															</button>
															<button className="update-btn same-width-btn">
																Update
															</button>
														</>
													)}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							)}
						</>
					)}
				</div>
				<NewParkingLotPopup open={popupOpen} onClose={() => setPopupOpen(false)} onCreate={handleCreateParkingLot} createLoading={createLoading} />
				<Toast show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
			</div>
		</div>
	);
};

export default AdminDashboard;
