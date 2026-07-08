import { useState, useEffect } from "react";
import axios from "axios";
import { validateEmployee } from "./EmployeeValidation";
import EmployeeForm from "./EmployeeForm";
import EmployeeTable from "./EmployeeTable";
import "./Employee.css";
function Employees() {
    // Show or hide Add Employee form
  const [showForm, setShowForm] = useState(false);
  const [employeeName, setEmployeeName] = useState("");
  const [department, setDepartment] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [gender, setGender] = useState("");
  const [designation, setDesignation] = useState("");
  const [joiningDate, setJoiningDate] = useState("");
  const [status, setStatus] = useState("Active");
  // Store employee id while editing
  const [editId, setEditId] = useState(null);
  // Employee List
  const [employees, setEmployees] = useState([]);
useEffect(() => {
  axios
    .get("https://localhost:7002/api/employee")
    .then((response) => {
      setEmployees(response.data);
    })
    .catch((error) => {
  console.log("FULL ERROR:", error);
  console.log("RESPONSE:", error.response);
});
}, []);
// Add new employee to employee list
function addEmployee() {
  const isValid = validateEmployee(
    employeeName,
    email,
    department
  );

  if (!isValid) return;

  const employeeData = {
    employeeCode: "EMP" + Date.now(),
    employeeName: employeeName,
    email: email,
    department: department,
    mobile: mobile,
    gender: gender,
    designation: designation,
    joiningDate: joiningDate,
    status: status
  };
  if (editId) {
  axios
    .put(
      `https://localhost:7002/api/employee/${editId}`,
      employeeData
    )
    .then(() => {
      return axios.get("https://localhost:7002/api/employee");
    })
    .then((response) => {
      setEmployees(response.data);
      setEmployeeName("");
      setEmail("");
      setDepartment("");
      setMobile("");
      setGender("");
      setDesignation("");
      setJoiningDate("");
      setStatus("Active");
      setEditId(null);
      setShowForm(false);
    })
    .catch((error) => {
  console.log("FULL ERROR:", error);
  console.log("RESPONSE:", error.response);
});

  return;
}

  axios
    .post("https://localhost:7002/api/employee", employeeData)
    .then(() => {
      return axios.get("https://localhost:7002/api/employee");
    })
    .then((response) => {
      setEmployees(response.data);
      setEmployeeName("");
      setEmail("");
      setDepartment("");
      setMobile("");
      setGender("");
      setDesignation("");
      setJoiningDate("");
      setEditId(null);
      setStatus("Active");
      setShowForm(false);
    })
    .catch((error) => {
  console.log("FULL ERROR:", error);
  console.log("RESPONSE:", error.response);
});
}

// Delete employee from table
function deleteEmployee(id) {
alert("Delete function called: " + id);
  const confirmDelete = window.confirm(
    "Are you sure you want to permanently delete this employee?"
  );

  if (!confirmDelete) {
    return;
  }

  console.log("Deleting Employee ID:", id);

  axios
    .delete(`https://localhost:7002/api/employee/${id}`)
    .then((response) => {

      console.log("DELETE SUCCESS", response);

      return axios.get("https://localhost:7002/api/employee");
    })
    .then((response) => {

      setEmployees(response.data);

    })
    .catch((error) => {

      console.log("DELETE ERROR:", error);
      console.log("RESPONSE:", error.response);

    });
}
  // Open employee data in form for editing
function editEmployee(emp) {
    console.log(emp);

  // Store selected employee id
  setEditId(emp.employeeId);
  // Fill textbox with employee name
  setEmployeeName(emp.employeeName);
  // Fill textbox with email
  setEmail(emp.email);
  // Fill textbox with department
  setDepartment(emp.department);
  setMobile(emp.mobile || "");
  setGender(emp.gender || "");
  setDesignation(emp.designation || "");
  setJoiningDate(
    emp.joiningDate
      ? emp.joiningDate.substring(0, 10) 
      : "" );
  setStatus(emp.status || "Active");
  // Show form
  setShowForm(true);
}
  return (
  <div className="employee-container">

   <div className="employee-header">

      <h2 className="employee-title">
        Employee Management
      </h2>

    </div>

    <EmployeeForm
      showForm={showForm}
      employeeName={employeeName}
      setEmployeeName={setEmployeeName}
      email={email}
      setEmail={setEmail}
      department={department}
      setDepartment={setDepartment}
      mobile={mobile}
      setMobile={setMobile}
      gender={gender}
      setGender={setGender}
      designation={designation}
      setDesignation={setDesignation}
      joiningDate={joiningDate}
      setJoiningDate={setJoiningDate}
      status={status}
      setStatus={setStatus}
      addEmployee={addEmployee}
    />

    <EmployeeTable
      employees={employees}
      editEmployee={editEmployee}
      deleteEmployee={deleteEmployee}
    />

  </div>
)

}
export default Employees;