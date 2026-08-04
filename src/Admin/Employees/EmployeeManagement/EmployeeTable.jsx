import { useState } from "react";
import "./EmployeeTable.css";


import {
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Search,
  Refresh,
  Edit,
  Delete,
  Visibility,
} from "@mui/icons-material";

import {
  TextField,
  InputAdornment,
  Button,
} from "@mui/material";

function EmployeeTable({
  employees,
  editEmployee,
  deleteEmployee,
}) {

  const [search, setSearch] = useState("");

  const filteredEmployees = employees.filter((emp) => {

    const keyword = search.toLowerCase();

    return (

      emp.employeeName?.toLowerCase().includes(keyword) ||

      emp.employeeCode?.toLowerCase().includes(keyword) ||

      emp.email?.toLowerCase().includes(keyword) ||

      emp.department?.toLowerCase().includes(keyword) ||

      emp.designation?.toLowerCase().includes(keyword)

    );

  });

  return (

    <div className="employee-table-wrapper">

      {/* Header */}

      <div className="employee-table-header">

    <div className="employee-table-title">

        <span className="employee-table-tag">
            Employee Directory
        </span>

        <h2>Employee List</h2>

        <p>
            Manage all employees across your organization.
        </p>

    </div>

    <div className="employee-table-count">

        <span>{filteredEmployees.length}</span>

        Employees

    </div>

</div>

      {/* Table */}

      <div className="table-responsive">

        <table className="employee-table">

          <thead>

            <tr>

              <th>Employee ID</th>

              <th>Employee</th>

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

              filteredEmployees.map((emp) => (

<tr key={emp.employeeId}>

<td>{emp.azureEmployeeId || "-"}</td>

                  <td>

                    <div className="employee-info">

                      <div className="employee-avatar">

                        {emp.employeeName?.charAt(0).toUpperCase()}

                      </div>

                      <div>

                        <div className="admin-employee-name">
                          {emp.employeeName}
                        </div>

                        <div className="employee-email">
                          {emp.email}
                        </div>

                      </div>

                    </div>

                  </td>

                  <td>{emp.mobile || "-"}</td>

                  <td>{emp.gender || "-"}</td>

                  <td>{emp.department}</td>

                  <td>{emp.designation || "-"}</td>

                  <td>

                    {emp.joiningDate
                      ? new Date(emp.joiningDate).toLocaleDateString("en-GB")
                      : "-"}

                  </td>

                  <td>

                    <span
                      className={`status-badge ${
                        emp.status === "Active"
                          ? "active"
                          : "inactive"
                      }`}
                    >
                      {emp.status}
                    </span>

                  </td>

                  <td>
<div className="action-buttons">

  <Tooltip title="View">



  </Tooltip>

  <Tooltip title="Edit">

    <IconButton
      className="edit-btn"
      onClick={() => editEmployee(emp)}
    >
      <Edit fontSize="small" />
    </IconButton>

  </Tooltip>

  <Tooltip title="Delete">

    <IconButton
      className="delete-btn"
      onClick={() =>
        deleteEmployee(emp.employeeId)
      }
    >
      <Delete fontSize="small" />
    </IconButton>

  </Tooltip>

</div>

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

    </div>

  );

}

export default EmployeeTable;