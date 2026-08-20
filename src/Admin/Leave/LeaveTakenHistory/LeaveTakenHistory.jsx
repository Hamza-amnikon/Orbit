import { useEffect, useState } from "react";
import axios from "axios";
import "./LeaveTakenHistory.css";
import * as XLSX from "xlsx";

const LEAVE_API = "https://localhost:7206/api/Leave";
const LEAVE_TYPE_API = "https://localhost:7206/api/LeaveType";

export default function LeaveTakenHistory() {

    const [leaves, setLeaves] = useState([]);
    const [leaveTypes, setLeaveTypes] = useState([]);

    // Employee Search
    const [employeeSearch, setEmployeeSearch] = useState("");

    // ==========================================
    // Load Data
    // ==========================================

    useEffect(() => {
        loadLeaves();
        loadLeaveTypes();
    }, []);


    // ==========================================
    // Load Leave Requests
    // ==========================================

    async function loadLeaves() {

        try {

            const response = await axios.get(LEAVE_API);

            setLeaves(response.data);

        }
        catch (error) {

            console.error("Leave History Error:", error);

        }
    }


    // ==========================================
    // Load Leave Types
    // ==========================================

    async function loadLeaveTypes() {

        try {

            const response = await axios.get(LEAVE_TYPE_API);

            setLeaveTypes(response.data);

        }
        catch (error) {

            console.error("Leave Type Error:", error);

        }
    }


    // ==========================================
    // Get Leave Type Name
    // ==========================================

    function getLeaveTypeName(leaveTypeId) {

        const leaveType = leaveTypes.find(
            (type) => type.leaveTypeId === leaveTypeId
        );

        return leaveType
            ? leaveType.leaveTypeName
            : "-";
    }


    // ==========================================
    // Calculate Number of Days
    // ==========================================

    function calculateDays(fromDate, toDate) {

        const from = new Date(fromDate);
        const to = new Date(toDate);

        const difference = to - from;

        return Math.floor(
            difference / (1000 * 60 * 60 * 24)
        ) + 1;
    }


    // ==========================================
    // Format Date
    // ==========================================

    function formatDate(date) {

        if (!date) {
            return "-";
        }

        return new Date(date).toLocaleDateString("en-GB");
    }


    // ==========================================
    // Approved Leaves Only
    // ==========================================

    const approvedLeaves = leaves.filter((leave) => {

        // Show Approved leaves only
        const isApproved =
            leave.status === "Approved";

        // Search by Employee ID OR Azure Employee ID
        const searchValue =
            employeeSearch.trim().toLowerCase();

        const matchesEmployee =
            searchValue === "" ||

            leave.employeeId
                ?.toString()
                .toLowerCase()
                .includes(searchValue) ||

            leave.azureEmployeeId
                ?.toString()
                .toLowerCase()
                .includes(searchValue);

        return isApproved && matchesEmployee;
    });


    // ==========================================
    // Export Excel
    // ==========================================

    const handleExport = () => {

        const exportData = approvedLeaves.map((leave) => ({

            "Employee ID":
                leave.employeeId ?? "-",

            "Azure Employee ID":
                leave.azureEmployeeId ?? "-",

            "Leave Type":
                getLeaveTypeName(
                    leave.leaveTypeId
                ),

            "From Date":
                formatDate(leave.fromDate),

            "To Date":
                formatDate(leave.toDate),

            "Days":
                calculateDays(
                    leave.fromDate,
                    leave.toDate
                ),

            "Approved Date":
                formatDate(leave.approvedDate),

            "Approved By":
                leave.approvedBy || "-"

        }));


        const worksheet =
            XLSX.utils.json_to_sheet(exportData);


        const workbook =
            XLSX.utils.book_new();


        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            "Leave History"
        );


        XLSX.writeFile(
            workbook,
            "Leave_Taken_History.xlsx"
        );
    };


    return (

        <div className="leave-history-page">

            {/* Header */}

            <div className="leave-history-header">

                <div>

                    <h1>
                        Leave Taken History
                    </h1>

                    <p>
                        View approved employee leave history.
                    </p>

                </div>


                <div className="leave-history-actions">

                    <button
                        type="button"
                        className="leave-history-action-btn"
                        onClick={() => window.history.back()}
                    >
                        ← Previous
                    </button>


                    <button
                        type="button"
                        className="leave-history-action-btn"
                        onClick={() => {
                            loadLeaves();
                            loadLeaveTypes();
                        }}
                    >
                        ↻ Refresh
                    </button>


                    <button
                        type="button"
                        className="leave-history-action-btn"
                        onClick={handleExport}
                    >
                        ⇩ Export
                    </button>

                </div>

            </div>


            {/* Employee Search */}

            <div className="leave-history-toolbar">

                <div className="history-employee-search">

                    <input
                        type="text"
                        value={employeeSearch}
                        onChange={(e) =>
                            setEmployeeSearch(e.target.value)
                        }
                        placeholder="Search by Employee ID or Azure ID"
                    />


                    {employeeSearch && (

                        <button
                            type="button"
                            onClick={() =>
                                setEmployeeSearch("")
                            }
                        >
                            ×
                        </button>

                    )}

                </div>

            </div>


            {/* Table */}

            <div className="leave-history-table-card">

                <table className="leave-history-table">

                    <thead>

                        <tr>

                            <th>Employee ID</th>

                            <th>Azure Employee ID</th>

                            <th>Leave Type</th>

                            <th>From Date</th>

                            <th>To Date</th>

                            <th>Days</th>

                            <th>Approved Date</th>

                            <th>Approved By</th>

                        </tr>

                    </thead>


                    <tbody>

                        {approvedLeaves.length === 0 ? (

                            <tr>

                                <td
                                    colSpan="8"
                                    className="no-leave-history"
                                >
                                    No approved leave history found.
                                </td>

                            </tr>

                        ) : (

                            approvedLeaves.map((leave) => (

                                <tr key={leave.leaveId}>

                                    {/* Employee ID */}

                                    <td>

                                        <strong>
                                            {leave.employeeId}
                                        </strong>

                                    </td>


                                    {/* Azure Employee ID */}

                                    <td>

                                        <span className="azure-employee-id">
                                            {leave.azureEmployeeId ?? "-"}
                                        </span>

                                    </td>


                                    {/* Leave Type */}

                                    <td>

                                        <strong>
                                            {getLeaveTypeName(
                                                leave.leaveTypeId
                                            )}
                                        </strong>

                                    </td>


                                    {/* From Date */}

                                    <td>
                                        {formatDate(
                                            leave.fromDate
                                        )}
                                    </td>


                                    {/* To Date */}

                                    <td>
                                        {formatDate(
                                            leave.toDate
                                        )}
                                    </td>


                                    {/* Days */}

                                    <td>
                                        {calculateDays(
                                            leave.fromDate,
                                            leave.toDate
                                        )}
                                    </td>


                                    {/* Approved Date */}

                                    <td>
                                        {formatDate(
                                            leave.approvedDate
                                        )}
                                    </td>


                                    {/* Approved By */}

                                    <td>
                                        {leave.approvedBy || "-"}
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