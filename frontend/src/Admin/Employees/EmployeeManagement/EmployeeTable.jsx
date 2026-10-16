import { MuiTableBodyMigration, MuiTableCellMigration, MuiTableHeadMigration, MuiTableMigration, MuiTableRowMigration } from "../../../components/ui/MuiCompat.jsx";
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
import { Box as MuiLayoutBox, Typography as MuiText } from "@mui/material";


function EmployeeTable({
  employees,
  editEmployee,
  deleteEmployee,
  onNotify,
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
    hasPermission,
  } = useAuth();


  // =====================================================
  // PERMISSIONS
  // =====================================================

  const canEdit =
    hasPermission("/employees/list", "edit");

  const canDelete =
    hasPermission("/employees/list", "delete");


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

      onNotify?.("You are not authenticated. Please login again.", "error");

      return;
    }


    if (!currentEmployeeId) {

      onNotify?.("Your Employee ID could not be determined. Please login again.", "error");

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

      onNotify?.("You are not authenticated. Please login again.", "error");

      return;
    }


    if (!currentEmployeeId) {

      onNotify?.("Your Employee ID could not be determined. Please login again.", "error");

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

    <MuiLayoutBox className="employee-table-wrapper" component="div">


      {/* =================================================
          HEADER
      ================================================= */}

      <MuiLayoutBox className="employee-table-header" component="div">


        <MuiLayoutBox className="employee-table-title" component="div">

          <MuiText className="employee-table-tag" component="span" variant="inherit">
            Employee Directory
          </MuiText>

          <MuiText component="h2" variant="h5">
            Employee List
          </MuiText>

          <MuiText component="p" variant="body1">
            Manage all employees across your organization.
          </MuiText>

        </MuiLayoutBox>


        <MuiLayoutBox className="employee-table-count" component="div">

          <MuiText component="span" variant="inherit">
            {filteredEmployees.length}
          </MuiText>

          Employees

        </MuiLayoutBox>

      </MuiLayoutBox>


     


      {/* =================================================
          TABLE
      ================================================= */}

      <MuiLayoutBox className="table-responsive" component="div">

        <MuiTableMigration className="employee-table">


          {/* =============================================
              TABLE HEADER
          ============================================= */}

          <MuiTableHeadMigration>

            <MuiTableRowMigration>

              <MuiTableCellMigration>
                Employee ID
              </MuiTableCellMigration>

              <MuiTableCellMigration>
                Employee
              </MuiTableCellMigration>

              <MuiTableCellMigration>
                Mobile
              </MuiTableCellMigration>

              <MuiTableCellMigration>
                Gender
              </MuiTableCellMigration>

              <MuiTableCellMigration>
                Department
              </MuiTableCellMigration>

              <MuiTableCellMigration>
                Designation
              </MuiTableCellMigration>

              <MuiTableCellMigration>
                Joining Date
              </MuiTableCellMigration>

              <MuiTableCellMigration>
                Status
              </MuiTableCellMigration>

              <MuiTableCellMigration>
                Action
              </MuiTableCellMigration>

            </MuiTableRowMigration>

          </MuiTableHeadMigration>


          {/* =============================================
              TABLE BODY
          ============================================= */}

          <MuiTableBodyMigration>

            {filteredEmployees.length === 0 ? (

              <MuiTableRowMigration>

                <MuiTableCellMigration
                  colSpan="9"
                  className="no-records"
                >

                  No Employees Found

                </MuiTableCellMigration>

              </MuiTableRowMigration>

            ) : (

              filteredEmployees.map(
                (emp) => (

                  <MuiTableRowMigration
                    key={
                      emp.employeeId
                    }
                  >


                    {/* =================================
                        EMPLOYEE ID
                    ================================= */}

                    <MuiTableCellMigration>
                      {emp.azureEmployeeId || "-"}
                    </MuiTableCellMigration>


                    {/* =================================
                        EMPLOYEE
                    ================================= */}

                    <MuiTableCellMigration>

                      <MuiLayoutBox className="employee-info" component="div">

                        <MuiLayoutBox component="div">

                          <MuiLayoutBox className="admin-employee-name" component="div">

                            {emp.employeeName || "-"}

                          </MuiLayoutBox>


                          <MuiLayoutBox className="employee-email" component="div">

                            {emp.email || "-"}

                          </MuiLayoutBox>

                        </MuiLayoutBox>

                      </MuiLayoutBox>

                    </MuiTableCellMigration>


                    {/* =================================
                        MOBILE
                    ================================= */}

                    <MuiTableCellMigration>
                      {emp.mobile || "-"}
                    </MuiTableCellMigration>


                    {/* =================================
                        GENDER
                    ================================= */}

                    <MuiTableCellMigration>
                      {emp.gender || "-"}
                    </MuiTableCellMigration>


                    {/* =================================
                        DEPARTMENT
                    ================================= */}

                    <MuiTableCellMigration>
                      {emp.department || "-"}
                    </MuiTableCellMigration>


                    {/* =================================
                        DESIGNATION
                    ================================= */}

                    <MuiTableCellMigration>
                      {emp.designation || "-"}
                    </MuiTableCellMigration>


                    {/* =================================
                        JOINING DATE
                    ================================= */}

                    <MuiTableCellMigration>

                      {emp.joiningDate

                        ? new Date(
                            emp.joiningDate
                          ).toLocaleDateString(
                            "en-GB"
                          )

                        : "-"

                      }

                    </MuiTableCellMigration>


                    {/* =================================
                        STATUS
                    ================================= */}

                    <MuiTableCellMigration>

                      <MuiText
                        className={
                          `status-badge ${
                            emp.status === "Active"
                              ? "active"
                              : "inactive"
                          }`
                        }
                       component="span" variant="inherit">

                        {emp.status || "-"}

                      </MuiText>

                    </MuiTableCellMigration>


                    {/* =================================
                        ACTIONS
                    ================================= */}

                    <MuiTableCellMigration>

                      <MuiLayoutBox className="action-buttons" component="div">


                        {/* EDIT */}

                        {canEdit && (

                          <Tooltip
                            title="Edit"
                          >

                            <MuiText component="span" variant="inherit">

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

                            </MuiText>

                          </Tooltip>

                        )}


                        {/* DELETE */}

                        {canDelete && (

                          <Tooltip
                            title="Delete"
                          >

                            <MuiText component="span" variant="inherit">

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

                            </MuiText>

                          </Tooltip>

                        )}


                      </MuiLayoutBox>

                    </MuiTableCellMigration>

                  </MuiTableRowMigration>

                )
              )

            )}

          </MuiTableBodyMigration>

        </MuiTableMigration>

      </MuiLayoutBox>

    </MuiLayoutBox>

  );

}


export default EmployeeTable;
