import React, { useState, useEffect } from 'react';
import '../parking-history/ParkingHistory.css'; // Reuse the same CSS

const MOCK_COMPLAINTS = [
  {
    complaintId: 'LC001',
    vehicleNumber: 'MH12AB1234',
    vehicleType: 'Car',
    employeeName: 'Rahul Sharma',
    employeeId: 'EMP001',
    complaintDate: '2025-09-10',
    itemLost: 'Wallet',
    description: 'Lost wallet in the parking area near spot A23',
    value: 1500,
    status: 'Under Investigation',
    lastUpdated: '2025-09-15',
    priority: 'High'
  },
  {
    complaintId: 'LC002',
    vehicleNumber: 'MH14XY5678',
    vehicleType: 'Bike',
    employeeName: 'Priya Patel',
    employeeId: 'EMP002',
    complaintDate: '2025-09-12',
    itemLost: 'Helmet',
    description: 'Helmet missing from parked bike at B45',
    value: 800,
    status: 'Resolved',
    lastUpdated: '2025-09-18',
    priority: 'Medium'
  },
  {
    complaintId: 'LC003',
    vehicleNumber: 'MH01CD4567',
    vehicleType: 'SUV',
    employeeName: 'Amit Kumar',
    employeeId: 'EMP003',
    complaintDate: '2025-09-15',
    itemLost: 'Laptop Bag',
    description: 'Left laptop bag in the car, found car unlocked and bag missing',
    value: 8000,
    status: 'Under Investigation',
    lastUpdated: '2025-09-20',
    priority: 'High'
  },
  {
    complaintId: 'LC004',
    vehicleNumber: 'MH02EF8901',
    vehicleType: 'Car',
    employeeName: 'Sneha Gupta',
    employeeId: 'EMP004',
    complaintDate: '2025-09-18',
    itemLost: 'Sunglasses',
    description: 'Designer sunglasses missing from dashboard',
    value: 3500,
    status: 'Pending',
    lastUpdated: '2025-09-18',
    priority: 'Low'
  },
  {
    complaintId: 'LC005',
    vehicleNumber: 'MH03GH2345',
    vehicleType: 'Bike',
    employeeName: 'Arun Singh',
    employeeId: 'EMP005',
    complaintDate: '2025-09-20',
    itemLost: 'Mobile Phone',
    description: 'Phone fell while taking out bike, not found later',
    value: 12000,
    status: 'Pending',
    lastUpdated: '2025-09-20',
    priority: 'High'
  },
  {
    complaintId: 'LC006',
    vehicleNumber: 'MH04IJ6789',
    vehicleType: 'Electric Car',
    employeeName: 'Neha Verma',
    employeeId: 'EMP006',
    complaintDate: '2025-09-21',
    itemLost: 'Charging Cable',
    description: 'EV charging cable missing from trunk',
    value: 5000,
    status: 'Under Investigation',
    lastUpdated: '2025-09-23',
    priority: 'Medium'
  },
  {
    complaintId: 'LC007',
    vehicleNumber: 'MH05KL0123',
    vehicleType: 'Commercial',
    employeeName: 'Vikram Malhotra',
    employeeId: 'EMP007',
    complaintDate: '2025-09-22',
    itemLost: 'Toolbox',
    description: 'Entire toolbox missing from vehicle',
    value: 7500,
    status: 'Pending',
    lastUpdated: '2025-09-22',
    priority: 'Medium'
  },
  {
    complaintId: 'LC008',
    vehicleNumber: 'MH06MN4567',
    vehicleType: 'Luxury Car',
    employeeName: 'Rajesh Kapoor',
    employeeId: 'EMP008',
    complaintDate: '2025-09-23',
    itemLost: 'Watch',
    description: 'Expensive watch left in glove compartment is missing',
    value: 25000,
    status: 'Under Investigation',
    lastUpdated: '2025-09-25',
    priority: 'High'
  },
  {
    complaintId: 'LC009',
    vehicleNumber: 'MH07OP8901',
    vehicleType: 'Scooter',
    employeeName: 'Meera Joshi',
    employeeId: 'EMP009',
    complaintDate: '2025-09-24',
    itemLost: 'Raincoat',
    description: 'Raincoat stored under seat is missing',
    value: 600,
    status: 'Resolved',
    lastUpdated: '2025-09-26',
    priority: 'Low'
  },
  {
    complaintId: 'LC010',
    vehicleNumber: 'MH08QR2345',
    vehicleType: 'Handicapped',
    employeeName: 'Sunil Mehta',
    employeeId: 'EMP010',
    complaintDate: '2025-09-25',
    itemLost: 'Prescription Glasses',
    description: 'Glasses left in vehicle are missing',
    value: 4500,
    status: 'Pending',
    lastUpdated: '2025-09-25',
    priority: 'Medium'
  },
  {
    complaintId: 'LC011',
    vehicleNumber: 'MH09ST6789',
    vehicleType: 'Electric Bike',
    employeeName: 'Aarti Chawla',
    employeeId: 'EMP011',
    complaintDate: '2025-09-25',
    itemLost: 'Helmet',
    description: 'Smart helmet with bluetooth connectivity missing',
    value: 3000,
    status: 'Pending',
    lastUpdated: '2025-09-25',
    priority: 'Medium'
  },
  {
    complaintId: 'LC012',
    vehicleNumber: 'MH10UV0123',
    vehicleType: 'Car',
    employeeName: 'Dinesh Tiwari',
    employeeId: 'EMP012',
    complaintDate: '2025-09-26',
    itemLost: 'Documents',
    description: 'Important file folder with documents left on back seat is missing',
    value: 0,
    status: 'Under Investigation',
    lastUpdated: '2025-09-27',
    priority: 'High'
  }
];

const LostComplaint = ({ sidebarCollapsed }) => {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10); // Fixed at exactly 10 rows per page
  const [showComplaintForm, setShowComplaintForm] = useState(false); // State for complaint form popup
  const [complaintData, setComplaintData] = useState({ // State for complaint form data
    vehicleNumber: '',
    vehicleType: 'Car',
    itemLost: '',
    description: '',
    value: 0,
    priority: 'Medium'
  });
  const [formErrors, setFormErrors] = useState({}); // State for form validation errors

  // Filter complaints based on search (complaint ID, employee name, or vehicle number)
  const filteredComplaints = MOCK_COMPLAINTS.filter(complaint =>
    complaint.complaintId.toLowerCase().includes(search.toLowerCase()) ||
    complaint.employeeName.toLowerCase().includes(search.toLowerCase()) ||
    complaint.vehicleNumber.toLowerCase().includes(search.toLowerCase())
  );

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Get current rows for pagination
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredComplaints.slice(indexOfFirstRow, indexOfLastRow);

  // Ensure we always have exactly 10 rows (or fill with empty rows)
  const rowsToDisplay = [...currentRows];
  while (rowsToDisplay.length < rowsPerPage) {
    rowsToDisplay.push(null); // Add empty rows to maintain exactly 10 items
  }

  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(filteredComplaints.length / rowsPerPage));

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
      case 'resolved': return 'status-resolved';
      case 'under investigation': return 'status-investigation';
      case 'pending': return 'status-pending';
      default: return '';
    }
  };

  // Get priority class for styling
  const getPriorityClass = (priority) => {
    switch(priority.toLowerCase()) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return '';
    }
  };

  // Handle complaint form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setComplaintData(prevData => ({ ...prevData, [name]: value }));
  };

  // Validate complaint form
  const validateForm = () => {
    const errors = {};
    if (!complaintData.vehicleNumber) errors.vehicleNumber = 'Vehicle number is required';
    if (!complaintData.itemLost) errors.itemLost = 'Item lost is required';
    if (!complaintData.description) errors.description = 'Description is required';
    if (complaintData.value <= 0) errors.value = 'Value must be greater than 0';
    return errors;
  };

  // Submit complaint form
  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validateForm();
    setFormErrors(errors);
    if (Object.keys(errors).length === 0) {
      // Here you would typically handle the form submission, e.g., send data to server
      console.log('Complaint lodged:', complaintData);
      // Reset form
      setComplaintData({
        vehicleNumber: '',
        vehicleType: 'Car',
        itemLost: '',
        description: '',
        value: 0,
        priority: 'Medium'
      });
      setShowComplaintForm(false); // Close form
    }
  };

  return (
    <div className={`parking-history-container ${sidebarCollapsed ? 'collapsed' : 'expanded'}`}>
      <h2 className="parking-history-title">Lost Complaint</h2>
      <div className="parking-history-search-bar">
        <div className="search-input-wrapper">
          <span className="search-icon"></span>
          <input
            type="text"
            placeholder="Search by Vehicle Number..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="parking-history-search-input"
          />
        </div>
        <div className="button-container">
          <button className="check-in-btn" onClick={() => setShowComplaintForm(true)}>
            Lodge Complaint
          </button>
        </div>
      </div>
      <div className="table-wrapper">
        <table className="parking-history-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Vehicle Number</th>
              <th>Item Lost</th>
              <th>Date</th>
              <th>Value (₹)</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {rowsToDisplay.map((complaint, index) => (
              complaint ? (
                <tr key={`${complaint.complaintId}-${index}`}>
                  <td>{complaint.complaintId}</td>
                  <td>{complaint.vehicleNumber}</td>
                  <td>{complaint.itemLost}</td>
                  <td>{complaint.complaintDate}</td>
                  <td>{complaint.value}</td>
                  <td className={getStatusClass(complaint.status)}>{complaint.status}</td>
                  <td className={getPriorityClass(complaint.priority)}>{complaint.priority}</td>
                  <td>{complaint.lastUpdated}</td>
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
        <button onClick={nextPage} disabled={currentPage === totalPages || filteredComplaints.length === 0}>
          Next
        </button>
      </div>
      {/* Complaint Form Modal */}
      {showComplaintForm && (
        <>
          <div className="exit-popup-overlay" onClick={() => setShowComplaintForm(false)}></div>
          <div className="exit-popup-card logo-theme" style={{ maxWidth: '600px' }}>
            <span className="exit-popup-close" onClick={() => setShowComplaintForm(false)} title="Close">&#10005;</span>
            <div className="exit-popup-title">Lodge a New Complaint</div>
            <div className="check-in-form">
              <div className="form-field">
                <label htmlFor="vehicle-number" className="form-label">Vehicle Number:</label>
                <input
                  type="text"
                  id="vehicle-number"
                  name="vehicleNumber"
                  className="form-input"
                  value={complaintData.vehicleNumber}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase();
                    setComplaintData({ ...complaintData, vehicleNumber: value });
                  }}
                />
                {formErrors.vehicleNumber && (
                  <div className="form-error">{formErrors.vehicleNumber}</div>
                )}
              </div>
              <div className="form-field">
                <label htmlFor="item-lost" className="form-label">Item Lost:</label>
                <input
                  type="text"
                  id="item-lost"
                  name="itemLost"
                  className="form-input"
                  value={complaintData.itemLost}
                  onChange={handleInputChange}
                />
                {formErrors.itemLost && (
                  <div className="form-error">{formErrors.itemLost}</div>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="value" className="form-label">Estimated Value (₹):</label>
                <input
                  type="number"
                  id="value"
                  name="value"
                  className="form-input"
                  value={complaintData.value}
                  onChange={handleInputChange}
                />
                {formErrors.value && (
                  <div className="form-error">{formErrors.value}</div>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="priority" className="form-label">Priority:</label>
                <select
                  id="priority"
                  name="priority"
                  className="form-select"
                  value={complaintData.priority}
                  onChange={handleInputChange}
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="description" className="form-label">Description:</label>
                <textarea
                  id="description"
                  name="description"
                  className="form-textarea"
                  rows="4"
                  value={complaintData.description}
                  onChange={handleInputChange}
                  placeholder="Please provide details about the lost item and where you think it might have been lost"
                ></textarea>
                {formErrors.description && (
                  <div className="form-error">{formErrors.description}</div>
                )}
              </div>
            </div>
            <button
              className="confirm-exit-btn"
              onClick={handleSubmit}
            >
              Submit Complaint
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default LostComplaint;
