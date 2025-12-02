import React, { useState, useEffect } from 'react';
import '../parking-history/ParkingHistory.css'; // Reuse the same CSS
import './ParkingStatus.css'; // Import specific styles for parking status

const MOCK_PARKING_STATUS = [
  {
    parkingLotId: 'A1',
    vehicleType: 'Car',
    totalSpaces: 100,
    occupiedSpaces: 78,
    availableSpaces: 22,
    reservedSpaces: 10,
    maintenanceSpaces: 2,
    occupancyRate: '78%',
    lastUpdated: '2025-09-27 14:30:15',
    awayInKm: 0.5
  },
  {
    parkingLotId: 'B1',
    vehicleType: 'Bike',
    totalSpaces: 150,
    occupiedSpaces: 150,
    availableSpaces: 0,
    reservedSpaces: 15,
    maintenanceSpaces: 0,
    occupancyRate: '63%',
    lastUpdated: '2025-09-27 14:30:15',
    awayInKm: 1.2
  },
  {
    parkingLotId: 'C1',
    totalSpaces: 80,
    vehicleType: 'SUV',
    occupiedSpaces: 75,
    availableSpaces: 5,
    reservedSpaces: 8,
    maintenanceSpaces: 0,
    occupancyRate: '94%',
    lastUpdated: '2025-09-27 14:30:15',
    awayInKm: 0.8
  },
  {
    parkingLotId: 'D1',
    vehicleType: 'Car',
    totalSpaces: 120,
    occupiedSpaces: 65,
    availableSpaces: 55,
    reservedSpaces: 12,
    maintenanceSpaces: 0,
    occupancyRate: '54%',
    lastUpdated: '2025-09-27 14:30:15',
    awayInKm: 1.7
  },
  {
    parkingLotId: 'E1',
    vehicleType: 'Bike',
    totalSpaces: 90,
    occupiedSpaces: 90,
    availableSpaces: 0,
    reservedSpaces: 9,
    maintenanceSpaces: 0,
    occupancyRate: '50%',
    lastUpdated: '2025-09-27 14:30:15',
    awayInKm: 2.3
  },
  {
    parkingLotId: 'F1',
    vehicleType: 'SUV',
    totalSpaces: 200,
    occupiedSpaces: 185,
    availableSpaces: 15,
    reservedSpaces: 20,
    maintenanceSpaces: 0,
    occupancyRate: '93%',
    lastUpdated: '2025-09-27 14:30:15',
    awayInKm: 0.3
  },
  {
    parkingLotId: 'G1',
    vehicleType: 'Car',
    totalSpaces: 75,
    occupiedSpaces: 30,
    availableSpaces: 45,
    reservedSpaces: 7,
    maintenanceSpaces: 0,
    occupancyRate: '40%',
    lastUpdated: '2025-09-27 14:30:15',
    awayInKm: 3.1
  },
  {
    parkingLotId: 'H1',
    vehicleType: 'Bike',
    totalSpaces: 60,
    occupiedSpaces: 52,
    availableSpaces: 8,
    reservedSpaces: 6,
    maintenanceSpaces: 0,
    occupancyRate: '87%',
    lastUpdated: '2025-09-27 14:30:15',
    awayInKm: 1.9
  },
  {
    parkingLotId: 'I1',
    vehicleType: 'SUV',
    totalSpaces: 110,
    occupiedSpaces: 89,
    availableSpaces: 21,
    reservedSpaces: 11,
    maintenanceSpaces: 0,
    occupancyRate: '81%',
    lastUpdated: '2025-09-27 14:30:15',
    awayInKm: 2.7
  },
  {
    parkingLotId: 'J1',
    vehicleType: 'Car',
    totalSpaces: 85,
    occupiedSpaces: 42,
    availableSpaces: 43,
    reservedSpaces: 8,
    maintenanceSpaces: 0,
    occupancyRate: '49%',
    lastUpdated: '2025-09-27 14:30:15',
    awayInKm: 1.4
  },
  {
    parkingLotId: 'K1',
    vehicleType: 'Bike',
    totalSpaces: 130,
    occupiedSpaces: 118,
    availableSpaces: 12,
    reservedSpaces: 13,
    maintenanceSpaces: 0,
    occupancyRate: '91%',
    lastUpdated: '2025-09-27 14:30:15',
    awayInKm: 0.7
  },
  {
    parkingLotId: 'L1',
    vehicleType: 'SUV',
    totalSpaces: 95,
    occupiedSpaces: 95,
    availableSpaces: 0,
    reservedSpaces: 9,
    maintenanceSpaces: 0,
    occupancyRate: '71%',
    lastUpdated: '2025-09-27 14:30:15',
    awayInKm: 2.5
  }
];

const ParkingStatus = ({ sidebarCollapsed }) => {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10); // Fixed at exactly 10 rows per page

  // Filter parking status based on search
  const filteredStatus = MOCK_PARKING_STATUS.filter(status =>
    status.parkingLotId.toLowerCase().includes(search.toLowerCase())
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
                  <td>{status.parkingLotId}</td>
                  <td>{status.vehicleType}</td>
                  <td>{status.totalSpaces}</td>
                  <td>{status.occupiedSpaces}</td>
                  <td>
                    <div className="availability-display">
                      <span className={`availability-indicator ${status.availableSpaces > 0 ? 'available' : 'unavailable'}`}></span>
                      <span>{status.availableSpaces}</span>
                    </div>
                  </td>
                  <td>{status.awayInKm}</td>
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
