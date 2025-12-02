import React, { useState, useEffect } from 'react';
import '../parking-history/ParkingHistory.css'; // Reuse the same CSS

const MOCK_FARE_DETAILS = [
  {
    vehicleType: 'Car',
    hourlyRate: 60,
    dailyRate: 500,
    weeklyRate: 2500,
    monthlyRate: 8000,
    description: 'Standard parking for cars',
    lastUpdated: '2025-09-01'
  },
  {
    vehicleType: 'Bike',
    hourlyRate: 30,
    dailyRate: 200,
    weeklyRate: 1000,
    monthlyRate: 3000,
    description: 'Standard parking for bikes',
    lastUpdated: '2025-09-01'
  },
  {
    vehicleType: 'SUV',
    hourlyRate: 80,
    dailyRate: 700,
    weeklyRate: 3500,
    monthlyRate: 12000,
    description: 'Premium parking for SUVs',
    lastUpdated: '2025-09-01'
  },
  {
    vehicleType: 'Electric Car',
    hourlyRate: 50,
    dailyRate: 450,
    weeklyRate: 2300,
    monthlyRate: 7500,
    description: 'Includes charging facility',
    lastUpdated: '2025-09-01'
  },
  {
    vehicleType: 'Commercial',
    hourlyRate: 100,
    dailyRate: 800,
    weeklyRate: 4000,
    monthlyRate: 15000,
    description: 'For commercial vehicles',
    lastUpdated: '2025-09-01'
  },
  {
    vehicleType: 'Luxury Car',
    hourlyRate: 120,
    dailyRate: 900,
    weeklyRate: 5000,
    monthlyRate: 18000,
    description: 'Premium secure parking',
    lastUpdated: '2025-09-01'
  },
  {
    vehicleType: 'Scooter',
    hourlyRate: 25,
    dailyRate: 180,
    weeklyRate: 900,
    monthlyRate: 2500,
    description: 'Standard parking for scooters',
    lastUpdated: '2025-09-01'
  },
  {
    vehicleType: 'Handicapped',
    hourlyRate: 40,
    dailyRate: 300,
    weeklyRate: 1500,
    monthlyRate: 5000,
    description: 'Special accessibility parking',
    lastUpdated: '2025-09-01'
  },
  {
    vehicleType: 'Electric Bike',
    hourlyRate: 25,
    dailyRate: 180,
    weeklyRate: 900,
    monthlyRate: 2700,
    description: 'Includes charging facility',
    lastUpdated: '2025-09-01'
  },
  {
    vehicleType: 'Temporary Visitor',
    hourlyRate: 70,
    dailyRate: 550,
    weeklyRate: 0,
    monthlyRate: 0,
    description: 'Short-term visitor parking',
    lastUpdated: '2025-09-01'
  },
  {
    vehicleType: 'Valet Parking',
    hourlyRate: 150,
    dailyRate: 1200,
    weeklyRate: 6000,
    monthlyRate: 20000,
    description: 'Premium valet parking service',
    lastUpdated: '2025-09-01'
  },
  {
    vehicleType: 'Reserved Spot',
    hourlyRate: 0,
    dailyRate: 0,
    weeklyRate: 4000,
    monthlyRate: 15000,
    description: 'Guaranteed reserved parking spot',
    lastUpdated: '2025-09-01'
  }
];

const FareDetails = ({ sidebarCollapsed }) => {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10); // Fixed at exactly 10 rows per page

  // Filter fare details based on search
  const filteredFares = MOCK_FARE_DETAILS.filter(fare =>
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
              <th>Description</th>
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
                  <td>{fare.description}</td>
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
          Prev
        </button>
        <span className="pagination-info">
          Page {currentPage} of {totalPages}
        </span>
        <button onClick={nextPage} disabled={currentPage === totalPages || filteredFares.length === 0}>
          Next
        </button>
      </div>
    </div>
  );
};

export default FareDetails;
