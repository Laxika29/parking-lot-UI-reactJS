import React, { useState, useEffect } from 'react';
import '../parking-history/ParkingHistory.css'; // Reuse the same CSS
import './ParkingStatus.css'; // Import specific styles for parking status

const ParkingStatus = ({ sidebarCollapsed }) => {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10); // Fixed at exactly 10 rows per page
  const [parkingData, setParkingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch parking status from API
  useEffect(() => {
    const fetchParkingStatus = async () => {
      setLoading(true);
      setError(null);
      try {
          const token = localStorage.getItem('employee-auth') ? JSON.parse(localStorage.getItem('employee-auth')).token : null;

        const response = await fetch('/parkinglot/api/v1/fetch/parking/availability', {
          method: 'POST',
          headers: {
              Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({})
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        setParkingData(data.availableParkingInfoList || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchParkingStatus();
  }, []);

  // Filter parking status based on search
  const filteredStatus = parkingData.filter(status =>
    status.parkingLotName.toLowerCase().includes(search.toLowerCase())
  );

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Get current rows for pagination
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredStatus.slice(indexOfFirstRow, indexOfLastRow);

  // Ensure we always have exactly 10 rows (or fill with empty rows)
  const rowsToDisplay = [...currentRows];
  while (rowsToDisplay.length < rowsPerPage) {
    rowsToDisplay.push(null); // Add empty rows to maintain exactly 10 items
  }

  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(filteredStatus.length / rowsPerPage));

  // If current page is beyond total pages (e.g., after search filter), reset to page 1
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  // Change page
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  if (loading) {
    return <div>Loading parking status...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className={`parking-history-container ${sidebarCollapsed ? 'collapsed' : 'expanded'}`}>
      <h2 className="parking-history-title">Parking Status</h2>
      <div className="parking-history-search-bar">
        <div className="search-input-wrapper">
          <span className="search-icon"></span>
          <input
            type="text"
            placeholder="Search by Parking Lot"
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
              <th>Parking Lot</th>
              <th>Address</th>
              <th>Vehicle Type</th>
              <th>Total Spaces</th>
              <th>Occupied</th>
              <th>Available</th>
              <th>Distance(KM)</th>
            </tr>
          </thead>
          <tbody>
            {rowsToDisplay.map((status, index) => (
              status ? (
                <tr key={`${status.parkingLotId}-${index}`}>
                  <td>{status.parkingLotName}</td>
                  <td>{status.address}</td>
                  <td>{status.vehicleType}</td>
                  <td>{status.totalSpace}</td>
                  <td>{status.occupiedSpace}</td>
                  <td>
                    <div className="availability-display">
                      <span className={`availability-indicator ${status.availableSpace > 0 ? 'available' : 'unavailable'}`}></span>
                      <span>{status.availableSpace}</span>
                    </div>
                  </td>
                  <td>{status.distanceInKm}</td>
                </tr>
              ) : (
                <tr key={`empty-${index}`}>
                  <td colSpan="6">&nbsp;</td>
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
        <button onClick={nextPage} disabled={currentPage === totalPages || filteredStatus.length === 0}>
          Next
        </button>
      </div>
    </div>
  );
};

export default ParkingStatus;
