import React, { useState, useEffect } from 'react';
import './ParkingHistory.css';

const MOCK_VEHICLES = [
  {
    vehicleNumber: 'MH12AB1234',
    vehicleType: 'Car',
    entryTime: '2025-09-24 09:15:89',
    allotedBy: 'John Doe',
    exitTime: '2025-09-24 17:30:90',
    checkoutBy: 'Jane Smith',
    paymentMode: 'UPI',
    paymentAmount: 120,
    parkingLotName: 'Lot A',
  },
  // ... existing vehicle data
];

const ParkingHistory = ({ sidebarCollapsed }) => {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10); // Fixed at exactly 10 rows per page

  // Filter vehicles based on search
  const filteredVehicles = MOCK_VEHICLES.filter(v =>
    v.vehicleNumber.toLowerCase().includes(search.toLowerCase())
  );

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Get current rows for pagination
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredVehicles.slice(indexOfFirstRow, indexOfLastRow);

  // Ensure we always have exactly 10 rows (or fill with empty rows)
  const rowsToDisplay = [...currentRows];
  while (rowsToDisplay.length < rowsPerPage) {
    rowsToDisplay.push(null); // Add empty rows to maintain exactly 10 items
  }

  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(filteredVehicles.length / rowsPerPage));

  // If current page is beyond total pages (e.g., after search filter), reset to page 1
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  // Change page
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  return (
    <div className={`parking-history-container ${sidebarCollapsed ? 'collapsed' : 'expanded'}`}>
      <h2 className="parking-history-title">Parking History</h2>
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
      </div>
      <div className="table-wrapper">
        <table className="parking-history-table">
          <thead>
            <tr>
              <th>Vehicle No.</th>
              <th>Vehicle Type</th>
              <th>Entry Time</th>
              <th>Alloted By</th>
              <th>Exit Time</th>
              <th>Checkout By</th>
              <th>Payment Mode</th>
              <th>Charge</th>
            </tr>
          </thead>
          <tbody>
            {rowsToDisplay.map((vehicle, index) => (
              vehicle ? (
                <tr key={`${vehicle.vehicleNumber}-${index}`}>
                  <td>{vehicle.vehicleNumber}</td>
                  <td>{vehicle.vehicleType}</td>
                  <td>{vehicle.entryTime}</td>
                  <td>{vehicle.allotedBy}</td>
                  <td>{vehicle.exitTime}</td>
                  <td>{vehicle.checkoutBy}</td>
                  <td>{vehicle.paymentMode}</td>
                  <td>₹{vehicle.paymentAmount}</td>
                </tr>
              ) : (
                <tr key={`empty-${index}`}>
                  <td colSpan="8">&nbsp;</td>
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
        <button onClick={nextPage} disabled={currentPage === totalPages || filteredVehicles.length === 0}>
          Next
        </button>
      </div>
    </div>
  );
};

export default ParkingHistory;
