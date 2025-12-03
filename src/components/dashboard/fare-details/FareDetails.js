import React, { useState, useEffect } from 'react';
import '../parking-history/ParkingHistory.css'; // Reuse the same CSS
import axios from 'axios';

const FareDetails = ({ sidebarCollapsed }) => {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10); // Fixed at exactly 10 rows per page
  const [fareDetails, setFareDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFareDetails = async () => {
      const token = localStorage.getItem('employee-auth') ? JSON.parse(localStorage.getItem('employee-auth')).token : null;
      setLoading(true);
      setError(null);
      try {
        const response = await axios.post(
          '/parkinglot/api/v1/fetch/fare/Details',
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        setFareDetails(response.data.parkingFareDetailsList);
      } catch (err) {
        setError('Failed to fetch fare details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchFareDetails();
  }, []);

  // Filter fare details based on search
  const filteredFares = fareDetails.filter(fare =>
    fare.vehicleType.toLowerCase().includes(search.toLowerCase())
  );

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Get current rows for pagination
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredFares.slice(indexOfFirstRow, indexOfLastRow);

  // Ensure we always have exactly 10 rows (or fill with empty rows)
  const rowsToDisplay = [...currentRows];
  while (rowsToDisplay.length < rowsPerPage) {
    rowsToDisplay.push(null); // Add empty rows to maintain exactly 10 items
  }

  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(filteredFares.length / rowsPerPage));

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
      <h2 className="parking-history-title">Fare Details</h2>
      {loading ? (
        <div className="loading-overlay">
          <img src="/logo-loading.svg" alt="Loading..." className="loading-spinner" />
        </div>
      ) : error ? (
        <div className="error-msg">{error}</div>
      ) : (
        <>
          <div className="parking-history-search-bar">
            <div className="search-input-wrapper">
              <span className="search-icon"></span>
              <input
                type="text"
                placeholder="Search by Vehicle Type..."
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
                  <th>Vehicle Type</th>
                  <th>Hourly Rate (₹)</th>
                  <th>Daily Rate (₹)</th>
                  <th>Weekly Rate (₹)</th>
                  <th>Monthly Rate (₹)</th>
                </tr>
              </thead>
              <tbody>
                {rowsToDisplay.map((fare, index) => (
                  fare ? (
                    <tr key={`${fare.vehicleType}-${index}`}>
                      <td>{fare.vehicleType}</td>
                      <td>{fare.hourlyRate}</td>
                      <td>{fare.dailyRate}</td>
                      <td>{fare.weeklyRate || 'N/A'}</td>
                      <td>{fare.monthlyRate || 'N/A'}</td>
                    </tr>
                  ) : (
                    <tr key={`empty-${index}`}>
                      <td colSpan="7">&nbsp;</td>
                    </tr>
                  )
                ))}
              </tbody>
            </table>
          </div>
          <div className="pagination-controls">
            <button onClick={prevPage} disabled={currentPage === 1}>
              Previous
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button onClick={nextPage} disabled={currentPage === totalPages}>
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default FareDetails;
