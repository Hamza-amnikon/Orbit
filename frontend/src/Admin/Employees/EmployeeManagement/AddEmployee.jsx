import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import EmployeeForm from "./EmployeeForm";
import { useAuth } from "../../../context/AuthContext";

function AddEmployee() {

  // ==========================================
  // AUTHENTICATED USER
  // ==========================================

  const {
    user,
    profile,
    employeeId,
    employeeCode,
    employeeName,
    email: loggedInEmail,
    isAuthenticated
  } = useAuth();

  const token = localStorage.getItem("token");

  // ==========================================
  // API URLs
  // ==========================================

  const EMPLOYEE_API =
    "https://localhost:7002/api/Employee";

  const PROVISION_API =
    "https://localhost:7002/api/provision";

  const EMPLOYEE_TYPE_API =
    "http://localhost:7084/api/EmployeeType";

  const LOCATION_API =
    "http://localhost:7281/api/Location/active";

  const DESIGNATION_API =
    "http://localhost:7241/api/Designation";

  const DEPARTMENT_API =
    "http://localhost:7240/api/Department";

  const ROLE_API =
    "http://localhost:7294/api/Role/active";


  // ==========================================
  // NAVIGATION
  // ==========================================

  const navigate = useNavigate();


  // ==========================================
  // PERSONAL INFORMATION
  // ==========================================

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [managerId, setManagerId] = useState("");

  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [gender, setGender] = useState("");


  // ==========================================
  // EMPLOYMENT INFORMATION
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
  // DROPDOWN DATA
  // ==========================================

  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [employeeTypes, setEmployeeTypes] = useState([]);
  const [locations, setLocations] = useState([]);


  // ==========================================
  // AUTH HEADERS
  // ==========================================

  const getAuthConfig = () => {

    const currentToken =
      localStorage.getItem("token");

    return {
      headers: {
        Authorization: currentToken
          ? `Bearer ${currentToken}`
          : ""
      }
    };
  };


  // ==========================================
  // DEBUG AUTHENTICATED EMPLOYEE
  // ==========================================

  useEffect(() => {

    console.log(
      "=========================================="
    );

    console.log(
      "AddEmployee - Authenticated User"
    );

    console.log(
      "Is Authenticated:",
      isAuthenticated
    );

    console.log(
      "Employee ID:",
      employeeId
    );

    console.log(
      "Employee Code:",
      employeeCode
    );

    console.log(
      "Employee Name:",
      employeeName
    );

    console.log(
      "Logged In Email:",
      loggedInEmail
    );

    console.log(
      "Token Exists:",
      !!token
    );

    console.log(
      "Profile:",
      profile
    );

    console.log(
      "User:",
      user
    );

    console.log(
      "=========================================="
    );

  }, [
    isAuthenticated,
    employeeId,
    employeeCode,
    employeeName,
    loggedInEmail,
    profile,
    user,
    token
  ]);


  // ==========================================
  // LOAD DROPDOWNS
  // ==========================================

  useEffect(() => {

    loadDepartments();
    loadDesignations();
    loadLocations();
    loadRoles();
    loadEmployeeTypes();

  }, []);


  // ==========================================
  // ROLES
  // ==========================================

  async function loadRoles() {

    try {

      const response = await axios.get(
        ROLE_API,
        getAuthConfig()
      );

      setRoles(response.data);

    }
    catch (error) {

      console.error(
        "Role Error:",
        error
      );

    }

  }


  // ==========================================
  // DESIGNATIONS
  // ==========================================

  async function loadDesignations() {

    try {

      const response = await axios.get(
        DESIGNATION_API,
        getAuthConfig()
      );

      setDesignations(response.data);

    }
    catch (error) {

      console.error(
        "Designation Error:",
        error
      );

    }

  }


  // ==========================================
  // DEPARTMENTS
  // ==========================================

  async function loadDepartments() {

    try {

      const response = await axios.get(
        DEPARTMENT_API,
        getAuthConfig()
      );

      setDepartments(response.data);

    }
    catch (error) {

      console.error(
        "Department Error:",
        error
      );

    }

  }


  // ==========================================
  // LOCATIONS
  // ==========================================

  async function loadLocations() {

    try {

      const response = await axios.get(
        LOCATION_API,
        getAuthConfig()
      );

      setLocations(response.data);

    }
    catch (error) {

      console.error(
        "Location Error:",
        error
      );

    }

  }


  // ==========================================
  // EMPLOYEE TYPES
  // ==========================================

  async function loadEmployeeTypes() {

    try {

      const response = await axios.get(
        EMPLOYEE_TYPE_API,
        getAuthConfig()
      );

      setEmployeeTypes(response.data);

    }
    catch (error) {

      console.error(
        "Employee Type Error:",
        error
      );

    }

  }


  // ==========================================
  // SAVE EMPLOYEE
  // ==========================================

  async function addEmployee() {

    // ------------------------------------------
    // AUTHENTICATION CHECK
    // ------------------------------------------

    if (!isAuthenticated) {

      alert(
        "You are not authenticated. Please login again."
      );

      return;

    }


    // ------------------------------------------
    // TOKEN CHECK
    // ------------------------------------------

    const currentToken =
      localStorage.getItem("token");

    if (!currentToken) {

      alert(
        "Authentication token is missing. Please login again."
      );

      return;

    }


    // ------------------------------------------
    // EMPLOYEE ID CHECK
    // ------------------------------------------

    if (!employeeId) {

      console.error(
        "Authenticated EmployeeId is missing."
      );

      alert(
        "Your Employee ID could not be determined. Please login again."
      );

      return;

    }


    // ------------------------------------------
    // LOCATION NAME
    // ------------------------------------------

    const selectedLocation =
      locations.find(
        x =>
          String(
            x.locationId
          ) === String(location)
      );


    // ------------------------------------------
    // EMPLOYEE DATA
    // ------------------------------------------

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

      location:
        selectedLocation?.locationName || "",

      joiningDate,
      status,

      role

    };


    // ------------------------------------------
    // AUDIT INFORMATION
    // ------------------------------------------
    //
    // This tells the backend who initiated
    // the operation.
    //
    // IMPORTANT:
    // The backend should NOT trust this value.
    // It should derive EmployeeId from the JWT.
    //

    const requestData = {

      ...employee,

      createdBy: employeeId,
      createdByEmployeeId: employeeId,

      createdByEmployeeCode:
        employeeCode || null,

      createdByEmployeeName:
        employeeName || null

    };


    console.log(
      "=========================================="
    );

    console.log(
      "Creating Employee"
    );

    console.log(
      "Logged-in EmployeeId:",
      employeeId
    );

    console.log(
      "Logged-in EmployeeCode:",
      employeeCode
    );

    console.log(
      "Logged-in EmployeeName:",
      employeeName
    );

    console.log(
      "Request:",
      requestData
    );

    console.log(
      "=========================================="
    );


    // ------------------------------------------
    // SAVE
    // ------------------------------------------

    try {

      const response =
        await axios.post(
          PROVISION_API,
          requestData,
          {
            headers: {
              Authorization:
                `Bearer ${currentToken}`,

              "Content-Type":
                "application/json"
            }
          }
        );


      console.log(
        "Employee Saved:",
        response.data
      );


      // ----------------------------------------
      // FETCH LATEST EMPLOYEE LIST
      // ----------------------------------------

      try {

        const employees =
          await axios.get(
            EMPLOYEE_API,
            getAuthConfig()
          );

        console.log(
          "Updated Employees:",
          employees.data
        );

      }
      catch (listError) {

        console.warn(
          "Employee list refresh failed:",
          listError
        );

      }


      // ----------------------------------------
      // SUCCESS
      // ----------------------------------------

      alert(
        "Employee Added Successfully"
      );


      // ----------------------------------------
      // RESET FORM
      // ----------------------------------------

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
      setRole("");

    }
    catch (error) {

      console.error(
        "Add Employee Error:",
        error
      );


      // ----------------------------------------
      // UNAUTHORIZED
      // ----------------------------------------

      if (
        error.response?.status === 401
      ) {

        alert(
          "Your login session has expired. Please login again."
        );

        localStorage.removeItem("token");

        navigate("/login");

        return;

      }


      // ----------------------------------------
      // FORBIDDEN
      // ----------------------------------------

      if (
        error.response?.status === 403
      ) {

        alert(
          "You are not authorized to perform this operation."
        );

        return;

      }


      // ----------------------------------------
      // API ERROR
      // ----------------------------------------

      if (error.response) {

        console.log(
          "API Status:",
          error.response.status
        );

        console.log(
          "API Response:",
          error.response.data
        );

        alert(
          JSON.stringify(
            error.response.data,
            null,
            2
          )
        );

      }
      else {

        alert(
          "Unable to connect to API."
        );

      }

    }

  }


  // ==========================================
  // CANCEL
  // ==========================================

  const handleCancel = () => {

    navigate("/employees");

  };


  // ==========================================
  // RENDER
  // ==========================================

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
      onCancel={handleCancel}

    />

  );

}

export default AddEmployee;