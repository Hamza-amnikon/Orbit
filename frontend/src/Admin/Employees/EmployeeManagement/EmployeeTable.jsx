import { useState, useEffect } from "react";
import "./EmployeeTable.css";

import {
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
} from "@mui/material";

import {
  Search,
  Edit,
  Delete,
} from "@mui/icons-material";

import { useAuth } from "../../../context/AuthContext";


function EmployeeTable({
  employees,
  editEmployee,
  deleteEmployee,
}) {

  // =====================================================
  // AUTHENTICATED EMPLOYEE
  // =====================================================

  const {
    user,
    profile,
    employeeId,
    employeeCode,
    employeeName,
    isAuthenticated,
  } = useAuth();


  // =====================================================
  // CURRENT EMPLOYEE ID
  // =====================================================

  const currentEmployeeId =
    employeeId ??
    profile?.employeeId ??
    profile?.EmployeeId ??
    user?.employeeId ??
    user?.EmployeeId ??
    null;


  // =====================================================
  // CURRENT EMPLOYEE CODE
  // =====================================================

  const currentEmployeeCode =
    employeeCode ??
    profile?.employeeCode ??
    profile?.EmployeeCode ??
    user?.employeeCode ??
    user?.EmployeeCode ??
    null;


  // =====================================================
  // CURRENT EMPLOYEE NAME
  // =====================================================

  const currentEmployeeName =
    employeeName ??
    profile?.employeeName ??
    profile?.EmployeeName ??
    profile?.displayName ??
    profile?.DisplayName ??
    user?.employeeName ??
    user?.EmployeeName ??
    "Employee";


  // =====================================================
  // SEARCH
  // =====================================================

  const [search, setSearch] = useState("");


  // =====================================================
  // AUTH DEBUG
  // =====================================================

  useEffect(() => {

    console.log(
      "=========================================="
    );

    console.log(
      "EmployeeTable - Authenticated Employee"
    );

    console.log(
      "Authenticated:",
      isAuthenticated
    );

    console.log(
      "EmployeeId:",
      currentEmployeeId
    );

    console.log(
      "EmployeeCode:",
      currentEmployeeCode
    );

    console.log(
      "EmployeeName:",
      currentEmployeeName
    );

    console.log(
      "=========================================="
    );

  }, [
    isAuthenticated,
    currentEmployeeId,
    currentEmployeeCode,
    currentEmployeeName,
  ]);


  // =====================================================
  // FILTER EMPLOYEES
  // =====================================================

  const filteredEmployees =
    employees.filter((emp) => {

      const keyword =
        search
          .toLowerCase()
          .trim();


      if (!keyword) {
        return true;
      }


      return (

        emp.employeeName
          ?.toLowerCase()
          .includes(keyword)

        ||

        emp.employeeCode
          ?.toLowerCase()
          .includes(keyword)

        ||

        emp.email
          ?.toLowerCase()
          .includes(keyword)

        ||

        emp.department
          ?.toLowerCase()
          .includes(keyword)

        ||

        emp.designation
          ?.toLowerCase()
          .includes(keyword)

        ||

        emp.mobile
          ?.toLowerCase()
          .includes(keyword)

        ||

        emp.gender
          ?.toLowerCase()
          .includes(keyword)

        ||

        emp.status
          ?.toLowerCase()
          .includes(keyword)

        ||

        emp.azureEmployeeId
          ?.toString()
          .toLowerCase()
          .includes(keyword)

      );

    });


  // =====================================================
  // EDIT HANDLER
  // =====================================================

  const handleEdit = (employee) => {

    if (!isAuthenticated) {

      alert(
        "You are not authenticated. Please login again."
      );

      return;
    }


    if (!currentEmployeeId) {

      alert(
        "Your Employee ID could not be determined. Please login again."
      );

      return;
    }


    console.log(
      "=========================================="
    );

    console.log(
      "EMPLOYEE EDIT"
    );

    console.log(
      "Target EmployeeId:",
      employee?.employeeId
    );

    console.log(
      "Updated By EmployeeId:",
      currentEmployeeId
    );

    console.log(
      "Updated By EmployeeCode:",
      currentEmployeeCode
    );

    console.log(
      "Updated By EmployeeName:",
      currentEmployeeName
    );

    console.log(
      "=========================================="
    );


    /*
     * The edit dialog will perform the API update.
     *
     * The JWT identifies the logged-in employee.
     *
     * Backend should save:
     *
     * UpdatedBy = current logged-in EmployeeId
     *
     * Do NOT trust an UpdatedBy value coming
     * from the browser.
     */

    editEmployee(employee);

  };


  // =====================================================
  // DELETE HANDLER
  // =====================================================

  const handleDelete = (employee) => {

    if (!isAuthenticated) {

      alert(
        "You are not authenticated. Please login again."
      );

      return;
    }


    if (!currentEmployeeId) {

      alert(
        "Your Employee ID could not be determined. Please login again."
      );

      return;
    }


    console.log(
      "=========================================="
    );

    console.log(
      "EMPLOYEE DELETE"
    );

    console.log(
      "Target EmployeeId:",
      employee?.employeeId
    );

    console.log(
      "Deleted By EmployeeId:",
      currentEmployeeId
    );

    console.log(
      "Deleted By EmployeeCode:",
      currentEmployeeCode
    );

    console.log(
      "Deleted By EmployeeName:",
      currentEmployeeName
    );

    console.log(
      "=========================================="
    );


    /*
     * EmployeeList.jsx performs the DELETE request.
     *
     * It sends the JWT.
     *
     * Backend should extract EmployeeId from JWT
     * and save it as DeletedBy.
     */

    deleteEmployee(
      employee?.employeeId
    );

  };


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <div className="employee-table-wrapper">


      {/* =================================================
          HEADER
      ================================================= */}

      <div className="employee-table-header">


        <div className="employee-table-title">

          <span className="employee-table-tag">
            Employee Directory
          </span>

          <h2>
            Employee List
          </h2>

          <p>
            Manage all employees across your organization.
          </p>

        </div>


        <div className="employee-table-count">

          <span>
            {filteredEmployees.length}
          </span>

          Employees

        </div>

      </div>


      {/* =================================================
          SEARCH
      ================================================= */}

      <div
        style={{
          marginBottom: "20px",
        }}
      >

        <TextField
          fullWidth
          size="small"
          placeholder="Search employees..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }

          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />

      </div>


      {/* =================================================
          TABLE
      ================================================= */}

      <div className="table-responsive">

        <table className="employee-table">


          {/* =============================================
              TABLE HEADER
          ============================================= */}

          <thead>

            <tr>

              <th>
                Employee ID
              </th>

              <th>
                Employee
              </th>

              <th>
                Mobile
              </th>

              <th>
                Gender
              </th>

              <th>
                Department
              </th>

              <th>
                Designation
              </th>

              <th>
                Joining Date
              </th>

              <th>
                Status
              </th>

              <th>
                Action
              </th>

            </tr>

          </thead>


          {/* =============================================
              TABLE BODY
          ============================================= */}

          <tbody>

            {filteredEmployees.length === 0 ? (

              <tr>

                <td
                  colSpan="9"
                  className="no-records"
                >
                  No Employees Found
                </td>

              </tr>

            ) : (

              filteredEmployees.map(
                (emp) => (

                  <tr
                    key={
                      emp.employeeId
                    }
                  >


                    {/* =================================
                        EMPLOYEE ID
                    ================================= */}

                    <td>
                      {emp.azureEmployeeId || "-"}
                    </td>


                    {/* =================================
                        EMPLOYEE
                    ================================= */}

                    <td>

                      <div className="employee-info">

                        <div>

                          <div className="admin-employee-name">

                            {emp.employeeName || "-"}

                          </div>


                          <div className="employee-email">

                            {emp.email || "-"}

                          </div>

                        </div>

                      </div>

                    </td>


                    {/* =================================
                        MOBILE
                    ================================= */}

                    <td>
                      {emp.mobile || "-"}
                    </td>


                    {/* =================================
                        GENDER
                    ================================= */}

                    <td>
                      {emp.gender || "-"}
                    </td>


                    {/* =================================
                        DEPARTMENT
                    ================================= */}

                    <td>
                      {emp.department || "-"}
                    </td>


                    {/* =================================
                        DESIGNATION
                    ================================= */}

                    <td>
                      {emp.designation || "-"}
                    </td>


                    {/* =================================
                        JOINING DATE
                    ================================= */}

                    <td>

                      {emp.joiningDate

                        ? new Date(
                            emp.joiningDate
                          ).toLocaleDateString(
                            "en-GB"
                          )

                        : "-"

                      }

                    </td>


                    {/* =================================
                        STATUS
                    ================================= */}

                    <td>

                      <span
                        className={
                          `status-badge ${
                            emp.status === "Active"
                              ? "active"
                              : "inactive"
                          }`
                        }
                      >

                        {emp.status || "-"}

                      </span>

                    </td>


                    {/* =================================
                        ACTIONS
                    ================================= */}

                    <td>

                      <div className="action-buttons">


                        {/* EDIT */}

                        <Tooltip
                          title="Edit"
                        >

                          <span>

                            <IconButton
                              className="edit-btn"
                              onClick={() =>
                                handleEdit(emp)
                              }
                              disabled={
                                !isAuthenticated ||
                                !currentEmployeeId
                              }
                            >

                              <Edit
                                fontSize="small"
                              />

                            </IconButton>

                          </span>

                        </Tooltip>


                        {/* DELETE */}

                        <Tooltip
                          title="Delete"
                        >

                          <span>

                            <IconButton
                              className="delete-btn"
                              onClick={() =>
                                handleDelete(emp)
                              }
                              disabled={
                                !isAuthenticated ||
                                !currentEmployeeId
                              }
                            >

                              <Delete
                                fontSize="small"
                              />

                            </IconButton>

                          </span>

                        </Tooltip>


                      </div>

                    </td>

                  </tr>

                )
              )

            )}

          </tbody>

        </table>

      </div>

    </div>

  );

}


export default EmployeeTable;