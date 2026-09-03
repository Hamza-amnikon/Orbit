import "./EmployeeDashboard.css";
import "../../Employees/EmployeeManagement/EmployeeDashboard.css";

import { useNavigate } from "react-router-dom";

import {
  PersonAddAlt1,
  Groups,
  Apartment,
  Badge,
  LocationOnRounded,
  ArrowForward,
} from "@mui/icons-material";

import { useAuth } from "../../../context/AuthContext";


// =====================================================
// EMPLOYEE MANAGEMENT MODULES
// =====================================================

const cards = [
  {
    title: "Add Employee",
    description: "Create a new employee profile.",
    icon: <PersonAddAlt1 fontSize="large" />,
    color: "#2563eb",
    path: "/employees/add",
  },

  {
    title: "Employee List",
    description: "View, edit and delete employees.",
    icon: <Groups fontSize="large" />,
    color: "#16a34a",
    path: "/employees/list",
  },

  {
    title: "Departments",
    description: "Manage company departments.",
    icon: <Apartment fontSize="large" />,
    color: "#9333ea",
    path: "/employees/departments",
  },

  {
    title: "Designations",
    description: "Manage employee designations.",
    icon: <Badge fontSize="large" />,
    color: "#ea580c",
    path: "/employees/designations",
  },

  {
    title: "Locations",
    description: "Manage employee locations.",
    icon: <LocationOnRounded fontSize="large" />,
    color: "#d00cea",
    path: "/employees/locations",
  },

  {
    title: "Roles",
    description: "Manage employee roles.",
    icon: <Badge fontSize="large" />,
    color: "#0ea5e9",
    path: "/employees/roles",
  },

  {
    title: "Employee Type",
    description: "Manage employee types.",
    icon: <Badge fontSize="large" />,
    color: "#14b8a6",
    path: "/employees/types",
  },

  {
    title: "Employee Hierarchy",
    description: "Manage employee hierarchy.",
    icon: <Badge fontSize="large" />,
    color: "#14b8a6",
    path: "/employees/EmployeeHierarchy",
  },
];


// =====================================================
// COMPONENT
// =====================================================

export default function EmployeeDashboard() {

  const navigate = useNavigate();


  // ===================================================
  // AUTHENTICATED EMPLOYEE
  // ===================================================

  const {
    user,
    profile,
    employeeId,
    employeeCode,
    employeeName,
    email,
    department,
    designation,
    isAuthenticated,
  } = useAuth();


  // ===================================================
  // LOGGED-IN EMPLOYEE INFORMATION
  // ===================================================

  const loggedInEmployee = {
    employeeId:
      employeeId ??
      profile?.employeeId ??
      profile?.EmployeeId ??
      user?.employeeId ??
      user?.EmployeeId ??
      null,

    employeeCode:
      employeeCode ??
      profile?.employeeCode ??
      profile?.EmployeeCode ??
      user?.employeeCode ??
      user?.EmployeeCode ??
      null,

    employeeName:
      employeeName ??
      profile?.employeeName ??
      profile?.EmployeeName ??
      profile?.displayName ??
      profile?.DisplayName ??
      user?.employeeName ??
      user?.EmployeeName ??
      "Employee",

    email:
      email ??
      profile?.email ??
      profile?.Email ??
      user?.email ??
      user?.Email ??
      null,

    department:
      department ??
      profile?.department ??
      profile?.Department ??
      null,

    designation:
      designation ??
      profile?.designation ??
      profile?.Designation ??
      null,
  };


  // ===================================================
  // DEBUG AUTHENTICATED EMPLOYEE
  // ===================================================

  console.log(
    "EmployeeDashboard - Authenticated Employee:",
    loggedInEmployee
  );


  // ===================================================
  // OPEN MODULE
  // ===================================================

  const openPage = (path) => {

    if (!isAuthenticated) {

      console.error(
        "EmployeeDashboard: User is not authenticated."
      );

      navigate("/login");

      return;
    }


    if (!loggedInEmployee.employeeId) {

      console.error(
        "EmployeeDashboard: EmployeeId is missing."
      );

      alert(
        "Your Employee ID could not be determined. Please login again."
      );

      return;
    }


    console.log(
      "=========================================="
    );

    console.log(
      "Opening Employee Management Module"
    );

    console.log(
      "Employee:",
      loggedInEmployee.employeeName
    );

    console.log(
      "EmployeeId:",
      loggedInEmployee.employeeId
    );

    console.log(
      "EmployeeCode:",
      loggedInEmployee.employeeCode
    );

    console.log(
      "Module Route:",
      path
    );

    console.log(
      "=========================================="
    );


    navigate(path);
  };


  // ===================================================
  // RENDER
  // ===================================================

  return (

    <div className="employee-dashboard">


      {/* ==============================================
          HEADER
      ============================================== */}

      <div className="employee-header">

        <h1>
          Employee Management
        </h1>

        <p>
          Manage employees, departments and organizational
          structure from one place.
        </p>

      </div>


      {/* ==============================================
          AUTHENTICATED EMPLOYEE INFORMATION
      ============================================== */}

      <div
        style={{
          display: "none",
        }}
      >
        EmployeeId: {loggedInEmployee.employeeId}
      </div>


      {/* ==============================================
          MODULE GRID
      ============================================== */}

      <div className="employee-grid">

        {cards.map((card, index) => (

          <div
            key={card.title}

            className="employee-card fade-up"

            style={{
              animationDelay: `${index * 0.1}s`,
            }}

            role="button"

            tabIndex={0}

            onClick={() =>
              openPage(card.path)
            }

            onKeyDown={(e) => {

              if (
                e.key === "Enter" ||
                e.key === " "
              ) {

                e.preventDefault();

                openPage(card.path);
              }

            }}
          >


            {/* ========================================
                ICON
            ======================================== */}

            <div
              className="employee-icon"

              style={{
                background: card.color,
              }}
            >
              {card.icon}
            </div>


            {/* ========================================
                TITLE
            ======================================== */}

            <h3>
              {card.title}
            </h3>


            {/* ========================================
                DESCRIPTION
            ======================================== */}

            <p>
              {card.description}
            </p>


            {/* ========================================
                FOOTER
            ======================================== */}

            <div className="card-footer">

              <span>
                Open Module
              </span>

              <ArrowForward />

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}