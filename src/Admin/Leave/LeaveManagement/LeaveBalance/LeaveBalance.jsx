import React, { useEffect, useState } from "react";
import axios from "axios";
import "./LeaveBalance.css";

const BALANCE_API =
  "https://localhost:7206/api/EmployeeLeaveBalance";

const LEAVE_TYPE_API =
  "https://localhost:7206/api/LeaveType";

export default function LeaveBalance() {
  const [balances, setBalances] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [searchEmployee, setSearchEmployee] = useState("");

  useEffect(() => {
    loadLeaveBalance();
  }, []);

  const loadLeaveBalance = async () => {
    try {
      setLoading(true);
      setError("");

      const [balanceResponse, leaveTypeResponse] =
        await Promise.all([
          axios.get(BALANCE_API),
          axios.get(LEAVE_TYPE_API),
        ]);

      setBalances(balanceResponse.data);
      setLeaveTypes(leaveTypeResponse.data);
    } catch (error) {
      console.error("Error loading leave balance:", error);

      setError(
        "Unable to load leave balance. Please check the Leave Service API."
      );
    } finally {
      setLoading(false);
    }
  };

  // Get Leave Type Name
  const getLeaveTypeName = (leaveTypeId) => {
    const leaveType = leaveTypes.find(
      (type) => type.leaveTypeId === leaveTypeId
    );

    return leaveType
      ? leaveType.leaveTypeName
      : `Leave Type ${leaveTypeId}`;
  };

  // Get unique employee IDs
  const employeeIds = [
    ...new Set(
      balances.map((balance) => balance.employeeId)
    ),
  ].sort((a, b) => a - b);

  // Filter employees
  const filteredBalances = balances.filter((balance) => {
    const matchesEmployee =
      selectedEmployee === "" ||
      balance.employeeId.toString() === selectedEmployee;

    const matchesSearch =
      searchEmployee.trim() === "" ||
      balance.employeeId
        .toString()
        .includes(searchEmployee.trim());

    return matchesEmployee && matchesSearch;
  });


  // ===============================
// Leave Balance Summary
// ===============================

const totalEmployees = new Set(
  filteredBalances.map((balance) => balance.employeeId)
).size;

const totalEntitled = filteredBalances.reduce(
  (total, balance) => total + Number(balance.entitledDays || 0),
  0
);

const totalAccrued = filteredBalances.reduce(
  (total, balance) => total + Number(balance.accruedDays || 0),
  0
);

const totalUsed = filteredBalances.reduce(
  (total, balance) => total + Number(balance.usedDays || 0),
  0
);

const totalBalance = filteredBalances.reduce(
  (total, balance) => total + Number(balance.balanceDays || 0),
  0
);

  return (
    <div className="leave-balance-page">

{/* Page Header */}
<div className="leave-balance-header">

  <div>
    <h2>Leave Balance Management</h2>

    <p>
      View employee leave entitlements, accruals, usage and
      remaining balances.
    </p>
  </div>

  <div className="leave-balance-actions">

    <button
      type="button"
      className="previous-btn"
      onClick={() => window.history.back()}
    >
      ← Previous
    </button>

    <button
      type="button"
      className="refresh-balance-btn"
      onClick={loadLeaveBalance}
    >
      ↻ Refresh
    </button>

  </div>

</div>



{/* Leave Balance Summary */}
<div className="leave-balance-summary">

  <div className="balance-summary-card">
    <span className="summary-title">Employees</span>
    <strong>{totalEmployees}</strong>
    <small>Employees with leave balance</small>
  </div>

  <div className="balance-summary-card">
    <span className="summary-title">Total Entitled</span>
    <strong>{totalEntitled.toFixed(2)}</strong>
    <small>Total entitled leave days</small>
  </div>

  <div className="balance-summary-card">
    <span className="summary-title">Total Accrued</span>
    <strong>{totalAccrued.toFixed(2)}</strong>
    <small>Total accrued leave days</small>
  </div>

  <div className="balance-summary-card">
    <span className="summary-title">Total Used</span>
    <strong>{totalUsed.toFixed(2)}</strong>
    <small>Total used leave days</small>
  </div>

  <div className="balance-summary-card">
    <span className="summary-title">Remaining Balance</span>
    <strong>{totalBalance.toFixed(2)}</strong>
    <small>Available leave days</small>
  </div>

</div>


      {/* ================= FILTERS ================= */}

      <div className="leave-balance-filters">

        {/* Search Employee */}

        <div className="filter-group">

          <label>Search Employee</label>

          <input
            type="text"
            placeholder="Search Employee ID"
            value={searchEmployee}
            onChange={(e) =>
              setSearchEmployee(e.target.value)
            }
          />

        </div>


        {/* Employee Dropdown */}

        <div className="filter-group">

          <label>Employee ID</label>

          <select
            value={selectedEmployee}
            onChange={(e) =>
              setSelectedEmployee(e.target.value)
            }
          >

            <option value="">
              All Employees
            </option>

            {employeeIds.map((employeeId) => (
              <option
                key={employeeId}
                value={employeeId}
              >
                Employee {employeeId}
              </option>
            ))}

          </select>

        </div>

      </div>


      {/* ================= ERROR ================= */}

      {error && (
        <div className="leave-balance-error">
          {error}
        </div>
      )}


      {/* ================= LOADING ================= */}

      {loading ? (

        <div className="leave-balance-loading">
          Loading leave balances...
        </div>

      ) : balances.length === 0 ? (

        <div className="leave-balance-empty">
          No leave balance records found.
        </div>

      ) : filteredBalances.length === 0 ? (

        <div className="leave-balance-empty">
          No leave balance found for the selected employee.
        </div>

      ) : (

        /* ================= TABLE ================= */

        <div className="leave-balance-card">

          <div className="table-wrapper">

            <table className="leave-balance-table">

              <thead>

                <tr>
                  <th>Employee ID</th>
                  <th>Leave Type</th>
                  <th>Year</th>
                  <th>Entitled</th>
                  <th>Accrued</th>
                  <th>Used</th>
                  <th>Balance</th>
                </tr>

              </thead>

              <tbody>

                {filteredBalances.map((balance) => (

                  <tr
                    key={balance.employeeLeaveBalanceId}
                  >

                    <td>
                      {balance.employeeId}
                    </td>

                    <td>
                      {getLeaveTypeName(
                        balance.leaveTypeId
                      )}
                    </td>

                    <td>
                      {balance.year}
                    </td>

                    <td>
                      {balance.entitledDays}
                    </td>

                    <td>
                      {balance.accruedDays}
                    </td>

                    <td>
                      {balance.usedDays}
                    </td>

                    <td>

                      <span className="balance-value">
                        {balance.balanceDays}
                      </span>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

      )}

    </div>
  );
}