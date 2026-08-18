import { useState, useEffect } from "react";
import axios from "axios";
import EmployeeForm from "./EmployeeForm";

function AddEmployee() {

  // ==========================================
  // API URLs
  // ==========================================

const EMPLOYEE_API = "https://localhost:7002/api/Employee";
const PROVISION_API = "https://localhost:7002/api/provision";
const EMPLOYEE_TYPE_API = "https://localhost:7084/api/EmployeeType";
const LOCATION_API = "https://localhost:7281/api/Location/active";
const DESIGNATION_API = "https://localhost:7009/api/Designation";
const DEPARTMENT_API = "https://localhost:7240/api/Department";
const ROLE_API = "https://localhost:7294/api/Role/active";

  // ==========================================
  // Personal Information
  // ==========================================

const [firstName, setFirstName] = useState("");
const [lastName, setLastName] = useState("");
const [managerId, setManagerId] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [gender, setGender] = useState("");

  // ==========================================
  // Employment Information
  // ==========================================

  const [department, setDepartment] = useState("");
  const [designation, setDesignation] = useState("");
  const [employeeType, setEmployeeType] = useState("");
  const [location, setLocation] = useState("");
  const [joiningDate, setJoiningDate] = useState("");
  const [status, setStatus] = useState("Active");
const [roles, setRoles] = useState([]);
const [role, setRole] = useState("");
  // ==========================================
  // Dropdown Data
  // ==========================================

const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
const [employeeTypes, setEmployeeTypes] = useState([]);
  const [locations, setLocations] = useState([]);

  // ==========================================
  // Load Dropdowns
  // ==========================================

useEffect(() => {
    loadDepartments();
    loadDesignations();
    loadLocations();
        loadRoles();
  
    loadEmployeeTypes();
}, []);

  // ==========================================
  // Designations (Role Service)
  // ==========================================
async function loadRoles() {
    try {
        const response = await axios.get(ROLE_API);

    

        setRoles(response.data);
    } catch (error) {
        console.error("Role Error:", error);
    }
}

  async function loadDesignations() {
    try {

        const response = await axios.get(DESIGNATION_API);

        setDesignations(response.data);

    } catch (error) {

        console.error("Designation Error", error);

    }
}
async function loadDepartments() {
    try {
        const response = await axios.get(DEPARTMENT_API);
        setDepartments(response.data);
    }
    catch (error) {
        console.error("Department Error", error);
    }
}

  // ==========================================
  // Locations
  // ==========================================

  async function loadLocations() {

    try {

      const response = await axios.get(LOCATION_API);

      setLocations(response.data);

    }
    catch (error) {

      console.error("Location Error", error);

    }

  }



async function loadEmployeeTypes() {

    try {

        const response = await axios.get(EMPLOYEE_TYPE_API);

        setEmployeeTypes(response.data);

    }
    catch (error) {

        console.error("Employee Type Error", error);

    }

}







  // ==========================================
  // Save Employee
  // ==========================================

async function addEmployee() {

  const employee = {

    firstName,
    lastName,
    managerId,

    email,
    mobile,
    gender,

    department,
    designation,
    employeeType,
    location: locations.find(x => x.locationId == location)?.locationName || "",

    joiningDate,
    status

  };

  console.log("Sending Employee:", employee);

  try {

    // Provision Employee (Create AD User + Save Employee)
    const response = await axios.post(PROVISION_API, employee);

    console.log("Employee Saved:", response.data);

    // Optional: Fetch latest employee list
    const employees = await axios.get(EMPLOYEE_API);
    console.log("Updated Employees:", employees.data);

    alert("Employee Added Successfully");

    // Reset Form
    setFirstName("");
    setLastName("");
    setManagerId("");

    setEmail("");
    setMobile("");
    setGender("");

    setDepartment("");
    setDesignation("");
    setEmployeeType("");
    setLocation("");

    setJoiningDate("");
    setStatus("Active");

  }
  catch (error) {

    console.error(error);

    if (error.response) {
      console.log(error.response.data);
      alert(JSON.stringify(error.response.data, null, 2));
    }
    else {
      alert("Unable to connect to API.");
    }

  }
}

  return (

    <EmployeeForm
    firstName={firstName}
    setFirstName={setFirstName}

    lastName={lastName}
    setLastName={setLastName}

    managerId={managerId}
    setManagerId={setManagerId}

    email={email}
    setEmail={setEmail}

    mobile={mobile}
    setMobile={setMobile}

    gender={gender}
    setGender={setGender}

role={role}
    setRole={setRole}
    roles={roles}

    department={department}
    setDepartment={setDepartment}
    departments={departments}

    designation={designation}
    setDesignation={setDesignation}
    designations={designations}

    employeeType={employeeType}
    setEmployeeType={setEmployeeType}
    employeeTypes={employeeTypes}

    location={location}
    setLocation={setLocation}
    locations={locations}

    joiningDate={joiningDate}
    setJoiningDate={setJoiningDate}

    status={status}
    setStatus={setStatus}

    addEmployee={addEmployee}
/>

  );

}

export default AddEmployee;