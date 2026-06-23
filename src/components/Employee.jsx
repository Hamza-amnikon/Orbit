import { useState } from "react";
import { validateEmployee } from "./Employee/EmployeeValidation";
function Employee() {
    // Show or hide Add Employee form
  const [showForm, setShowForm] = useState(false);
  // Store employee name entered in textbox
  const [employeeName, setEmployeeName] = useState("");
  // Store department entered in textbox
  const [department, setDepartment] = useState("");
  // Store employee email
const [email, setEmail] = useState("");
// Store employee mobile number
const [mobile, setMobile] = useState("");
// Store employee designation
const [designation, setDesignation] = useState("");
  // Store employee id while editing
const [editId, setEditId] = useState(null);
  // Employee List
const [employees, setEmployees] = useState([
  {
    id: "EMP001",
    name: "Mahinoor",
    email: "mahinoor@gmail.com",
    department: "IT"
  },
  {
    id: "EMP002",
    name: "Rahul",
    email: "rahul@gmail.com",
    department: "HR"
  },
  {
    id: "EMP003",
    name: "Priya",
    email: "priya@gmail.com",
    department: "Finance"
  }
]);
// Add new employee to employee list
function addEmployee() {
  const isValid = validateEmployee(
  employeeName,
  email,
  department
);

if (!isValid) {
  return;
}

  const newEmployee = {
    id: "EMP00" + (employees.length + 1),
    name: employeeName,
    email: email,
    department: department
  };

  setEmployees([...employees, newEmployee]);

  setEmployeeName("");
  setEmail("");
  setDepartment("");
  setShowForm(false);
}
// Delete employee from table
function deleteEmployee(id) {

  // Ask user before deleting
  const confirmDelete = window.confirm(
    "Are you sure you want to permanently delete this employee?"
  );

  // If user clicks Cancel, stop deletion
  if (!confirmDelete) {
    return;
  }

  // Remove selected employee from employee list
  const updatedEmployees = employees.filter(
    emp => emp.id !== id
  );

  // Update employee state
  setEmployees(updatedEmployees);
}
  // Open employee data in form for editing
function editEmployee(emp) {

  // Store selected employee id
  setEditId(emp.id);

  // Fill textbox with employee name
  setEmployeeName(emp.name);

  // Fill textbox with department
  setDepartment(emp.department);

  // Show form
  setShowForm(true);
}
  return (
    <div
      style={{
        backgroundColor: "white",
        padding: "20px",
        borderRadius: "10px",
        boxShadow: "0px 2px 8px rgba(0,0,0,0.1)"
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <h2>Employee Management</h2>

    <button
      onClick={() => setShowForm(!showForm)}
      style={{
      backgroundColor: "#0d1b4c",
      color: "white",
      border: "none",
      padding: "10px 15px",
      borderRadius: "5px",
      cursor: "pointer"
  }}
>
  + Add Employee
</button>
      </div>
       
       {showForm && (
  <div
    style={{
      marginTop: "20px",
      marginBottom: "20px",
      border: "1px solid #ddd",
      padding: "20px",
      borderRadius: "10px"
    }}
  >
    <h3>Add Employee</h3>

    <input
  type="text"
  placeholder="Employee Name"
  value={employeeName}
  onChange={(e) => setEmployeeName(e.target.value)}
/>

    <br /><br />
{/* Email Input */}
<input
type="email"
placeholder="Employee Email"
value={email}
onChange={(e) => setEmail(e.target.value)}
/>

<br /><br />
    <input
  type="text"
  placeholder="Department"
  value={department}
  onChange={(e) => setDepartment(e.target.value)}
/>

    <br /><br />

    <button onClick={addEmployee}>
    Save Employee
    </button>
  </div>
)}
      <table
        style={{
          width: "100%",
          marginTop: "20px",
          borderCollapse: "collapse"
        }}
      >
        <thead>
          <tr>
            <th style={{ borderBottom: "1px solid #ddd", padding: "10px" }}>
              Employee ID
            </th>
            <th style={{ borderBottom: "1px solid #ddd", padding: "10px" }}>
              Name
            </th>
            <th style={{ borderBottom: "1px solid #ddd", padding: "10px" }}>
              Email
            </th>
            <th style={{ borderBottom: "1px solid #ddd", padding: "10px" }}>
              Department
            </th>
            <th style={{ borderBottom: "1px solid #ddd", padding: "10px" }}>
              Action
            </th>
          </tr>
        </thead>

        <tbody>
          {employees.map((emp) => (
            <tr key={emp.id}>
              <td style={{ padding: "10px" }}>{emp.id}</td>
              <td style={{ padding: "10px" }}>{emp.name}</td>
              <td style={{ padding: "10px" }}>{emp.email}</td>
              <td style={{ padding: "10px" }}>{emp.department}</td>
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
      marginRight: "10px" // Space between buttons
    }}
  >
    Edit
  </button>

  {/* Delete Employee Button */}
  <button

    // When user clicks Delete,
    // send current employee id to deleteEmployee function
    onClick={() => deleteEmployee(emp.id)}

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
    </div>
  );

}
export default Employee;