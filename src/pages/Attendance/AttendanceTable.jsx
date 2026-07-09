function AttendanceTable({ attendanceList }) {
  return (
    <table border="1">
      <thead>
        <tr>
          <th>Attendance ID</th>
          <th>Employee ID</th>
          <th>Attendance Date</th>
          <th>Check In</th>
          <th>Check Out</th>
          <th>Status</th>
        </tr>
      </thead>

      <tbody>
        {attendanceList.map((item) => (
          <tr key={item.attendanceId}>
            <td>{item.attendanceId}</td>
            <td>{item.employeeId}</td>
            <td>{item.attendanceDate}</td>
            <td>{item.checkIn}</td>
            <td>{item.checkOut}</td>
            <td>{item.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default AttendanceTable;