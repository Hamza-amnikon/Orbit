import "./EmployeeTable.css";
function EmployeeTable({
  employees,
  editEmployee,
  deleteEmployee
}) {
  return (
    <>
      <table
  style={{
    width: "100%",
    marginTop: "20px",
    borderCollapse: "collapse"
  }}
>
<thead>
  <tr>
    <th>Employee ID</th>
    <th>Name</th>
    <th>Email</th>
    <th>Mobile</th>
    <th>Gender</th>
    <th>Department</th>
    <th>Designation</th>
    <th>Joining Date</th>
    <th>Status</th>
    <th>Action</th>
  </tr>
</thead>

<tbody>
{employees.map((emp) => (
<tr key={emp.employeeId}>
<td style={{ padding: "10px" }}>
  {emp.employeeCode}
</td>

<td style={{ padding: "10px" }}>
  {emp.employeeName}
</td>

<td style={{ padding: "10px" }}>
  {emp.email}
</td>

<td style={{ padding: "10px" }}>
  {emp.mobile}
</td>

<td style={{ padding: "10px" }}>
  {emp.gender}
</td>

<td style={{ padding: "10px" }}>
  {emp.department}
</td>

<td style={{ padding: "10px" }}>
  {emp.designation}
</td>

<td style={{ padding: "10px" }}>
  {emp.joiningDate}
</td>

<td style={{ padding: "10px" }}>
  {emp.status}
</td>

              <td style={{ padding: "10px" }}>
                {/* Edit Employee Button */}
                <button
                  onClick={() => editEmployee(emp)}
                  style={{
                    backgroundColor: "#0d1b4c",
                    color: "white",
                    border: "none",
                    padding: "8px 12px",
                    borderRadius: "5px",
                    cursor: "pointer",
                    marginRight: "10px"
                  }}
                >
                  Edit
                </button>

                {/* Delete Employee Button */}
                <button
                  onClick={() => deleteEmployee(emp.employeeId)}
                  style={{
                    backgroundColor: "red",
                    color: "white",
                    border: "none",
                    padding: "8px 12px",
                    borderRadius: "5px",
                    cursor: "pointer"
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export default EmployeeTable;