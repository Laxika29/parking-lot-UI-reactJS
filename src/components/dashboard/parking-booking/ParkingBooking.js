import React, { useState, useEffect } from 'react';
import '../parking-history/ParkingHistory.css'; // Reuse the same CSS

const MOCK_BOOKING_DATA = [
  {
    bookingId: 'BK10001',
    vehicleNumber: 'MH12AB1234',
    vehicleType: 'Car',
    parkingLotId: 'A1',
    spotNumber: '23',
    bookingTime: '2025-09-25 08:30:00',
    startTime: '2025-09-25 10:00:00',
    endTime: '2025-09-25 18:00:00',
    duration: '8 hours',
    amount: 480,
    status: 'Confirmed',
    paymentStatus: 'Paid'
  },
  {
    bookingId: 'BK10002',
    vehicleNumber: 'MH14XY5678',
    vehicleType: 'Bike',
    parkingLotId: 'B1',
    spotNumber: '45',
    bookingTime: '2025-09-25 09:15:00',
    startTime: '2025-09-25 10:30:00',
    endTime: '2025-09-25 17:30:00',
    duration: '7 hours',
    amount: 210,
    status: 'Confirmed',
    paymentStatus: 'Paid'
  },
  {
    bookingId: 'BK10003',
    vehicleNumber: 'MH01CD4567',
    vehicleType: 'SUV',
    parkingLotId: 'C1',
    spotNumber: '12',
    bookingTime: '2025-09-25 10:00:00',
    startTime: '2025-09-25 11:00:00',
    endTime: '2025-09-26 11:00:00',
    duration: '24 hours',
    amount: 700,
    status: 'Confirmed',
    paymentStatus: 'Paid'
  },
  {
    bookingId: 'BK10004',
    vehicleNumber: 'MH02EF8901',
    vehicleType: 'Car',
    parkingLotId: 'A1',
    spotNumber: '34',
    bookingTime: '2025-09-26 08:00:00',
    startTime: '2025-09-26 09:00:00',
    endTime: '2025-09-26 14:00:00',
    duration: '5 hours',
    amount: 300,
    status: 'Confirmed',
    paymentStatus: 'Paid'
  },
  {
    bookingId: 'BK10005',
    vehicleNumber: 'MH03GH2345',
    vehicleType: 'Bike',
    parkingLotId: 'B1',
    spotNumber: '56',
    bookingTime: '2025-09-26 08:30:00',
    startTime: '2025-09-26 09:30:00',
    endTime: '2025-09-26 12:30:00',
    duration: '3 hours',
    amount: 90,
    status: 'Confirmed',
    paymentStatus: 'Paid'
  },
  {
    bookingId: 'BK10006',
    vehicleNumber: 'MH04IJ6789',
    vehicleType: 'Electric Car',
    parkingLotId: 'D1',
    spotNumber: '15',
    bookingTime: '2025-09-26 09:45:00',
    startTime: '2025-09-26 10:30:00',
    endTime: '2025-09-26 18:30:00',
    duration: '8 hours',
    amount: 400,
    status: 'Confirmed',
    paymentStatus: 'Paid'
  },
  {
    bookingId: 'BK10007',
    vehicleNumber: 'MH05KL0123',
    vehicleType: 'Commercial',
    parkingLotId: 'E1',
    spotNumber: '08',
    bookingTime: '2025-09-26 10:15:00',
    startTime: '2025-09-26 11:00:00',
    endTime: '2025-09-27 11:00:00',
    duration: '24 hours',
    amount: 800,
    status: 'Pending',
    paymentStatus: 'Not Paid'
  },
  {
    bookingId: 'BK10008',
    vehicleNumber: 'MH06MN4567',
    vehicleType: 'Luxury Car',
    parkingLotId: 'F1',
    spotNumber: '05',
    bookingTime: '2025-09-26 11:30:00',
    startTime: '2025-09-26 12:00:00',
    endTime: '2025-09-26 20:00:00',
    duration: '8 hours',
    amount: 960,
    status: 'Confirmed',
    paymentStatus: 'Paid'
  },
  {
    bookingId: 'BK10009',
    vehicleNumber: 'MH07OP8901',
    vehicleType: 'Scooter',
    parkingLotId: 'G1',
    spotNumber: '67',
    bookingTime: '2025-09-26 12:45:00',
    startTime: '2025-09-26 13:30:00',
    endTime: '2025-09-26 16:30:00',
    duration: '3 hours',
    amount: 75,
    status: 'Confirmed',
    paymentStatus: 'Paid'
  },
  {
    bookingId: 'BK10010',
    vehicleNumber: 'MH08QR2345',
    vehicleType: 'Handicapped',
    parkingLotId: 'H1',
    spotNumber: '02',
    bookingTime: '2025-09-26 13:00:00',
    startTime: '2025-09-26 14:00:00',
    endTime: '2025-09-26 16:00:00',
    duration: '2 hours',
    amount: 80,
    status: 'Confirmed',
    paymentStatus: 'Paid'
  },
  {
    bookingId: 'BK10011',
    vehicleNumber: 'MH09ST6789',
    vehicleType: 'Electric Bike',
    parkingLotId: 'B1',
    spotNumber: '78',
    bookingTime: '2025-09-26 14:15:00',
    startTime: '2025-09-26 15:00:00',
    endTime: '2025-09-26 19:00:00',
    duration: '4 hours',
    amount: 100,
    status: 'Pending',
    paymentStatus: 'Not Paid'
  },
  {
    bookingId: 'BK10012',
    vehicleNumber: 'MH10UV0123',
    vehicleType: 'Temporary Visitor',
    parkingLotId: 'A1',
    spotNumber: '45',
    bookingTime: '2025-09-27 08:00:00',
    startTime: '2025-09-27 09:00:00',
    endTime: '2025-09-27 12:00:00',
    duration: '3 hours',
    amount: 210,
    status: 'Pending',
    paymentStatus: 'Not Paid'
  }
];

const ParkingBooking = ({ sidebarCollapsed }) => {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10); // Fixed at exactly 10 rows per page

  // Filter booking data based on search (vehicle number or booking ID)
  const filteredBookings = MOCK_BOOKING_DATA.filter(booking =>
    booking.vehicleNumber.toLowerCase().includes(search.toLowerCase()) ||
    booking.bookingId.toLowerCase().includes(search.toLowerCase())
  );

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Get current rows for pagination
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredBookings.slice(indexOfFirstRow, indexOfLastRow);

  // Ensure we always have exactly 10 rows (or fill with empty rows)
  const rowsToDisplay = [...currentRows];
  while (rowsToDisplay.length < rowsPerPage) {
    rowsToDisplay.push(null); // Add empty rows to maintain exactly 10 items
  }

  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / rowsPerPage));

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
      <h2 className="parking-history-title">Parking Booking</h2>
      <div className="parking-history-search-bar">
        <div className="search-input-wrapper">
          <span className="search-icon"></span>
          <input
            type="text"
            placeholder="Search by Vehicle Number or Booking ID..."
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
              <th>Booking ID</th>
              <th>Vehicle Number</th>
              <th>Vehicle Type</th>
              <th>Lot ID</th>
              <th>Spot</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Amount (₹)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rowsToDisplay.map((booking, index) => (
              booking ? (
                <tr key={`${booking.bookingId}-${index}`}>
                  <td>{booking.bookingId}</td>
                  <td>{booking.vehicleNumber}</td>
                  <td>{booking.vehicleType}</td>
                  <td>{booking.parkingLotId}</td>
                  <td>{booking.spotNumber}</td>
                  <td>{booking.startTime}</td>
                  <td>{booking.endTime}</td>
                  <td>{booking.amount}</td>
                  <td>{booking.status}</td>
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
        <button onClick={nextPage} disabled={currentPage === totalPages || filteredBookings.length === 0}>
          Next
        </button>
      </div>
    </div>
  );
};

export default ParkingBooking;
