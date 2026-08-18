import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import "./LeaveRequests.css";

const LEAVE_API = "https://localhost:7206/api/Leave";
const LEAVE_TYPE_API = "https://localhost:7206/api/LeaveType";

export default function LeaveRequests() {
    const [searchParams] = useSearchParams();

    const [leaves, setLeaves] = useState([]);
    const [leaveTypes, setLeaveTypes] = useState([]);

    const [selectedLeave, setSelectedLeave] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState("");
    const [managerComment, setManagerComment] = useState("");

    const [viewLeave, setViewLeave] = useState(null);

    const [statusFilter, setStatusFilter] = useState(
        searchParams.get("status") || "All"
    );

    // ==========================================
    // Employee Search
    // Search by Employee ID OR Employee Name
    // ==========================================
    const [employeeSearch, setEmployeeSearch] = useState("");

    // ==========================================
    // Load Leave Requests
    // ==========================================
    useEffect(() => {
        loadLeaves();
        loadLeaveTypes();
    }, []);

    async function loadLeaves() {
        try {
            const response = await axios.get(LEAVE_API);

            console.log("Leave API Response:", response.data);

            setLeaves(response.data);
        } catch (error) {
            console.error("Leave Request Error:", error);
            alert("Unable to load leave requests.");
        }
    }

    // ==========================================
    // Load Leave Types
    // ==========================================
    async function loadLeaveTypes() {
        try {
            const response = await axios.get(LEAVE_TYPE_API);

            setLeaveTypes(response.data);
        } catch (error) {
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
    // Open Approve / Reject Popup
    // ==========================================
    function openStatusPopup(leave, status) {
        setSelectedLeave(leave);
        setSelectedStatus(status);
        setManagerComment("");
    }

    // ==========================================
    // Update Leave Status
    // ==========================================
    async function updateStatus() {
        if (!selectedLeave) {
            return;
        }

        if (!managerComment.trim()) {
            alert("Please enter a manager comment.");
            return;
        }

        try {
            await axios.put(
                `${LEAVE_API}/${selectedLeave.leaveId}/status`,
                {
                    status: selectedStatus,

                    // Temporary Admin ID for testing
                    // Later use logged-in user's ID
                    approvedBy: 1,

                    managerComment: managerComment.trim()
                }
            );

            alert(
                selectedStatus === "Approved"
                    ? "Leave Approved Successfully"
                    : "Leave Rejected Successfully"
            );

            setSelectedLeave(null);
            setSelectedStatus("");
            setManagerComment("");

            await loadLeaves();
        } catch (error) {
            console.error(
                "Update Leave Status Error:",
                error
            );

            alert("Unable to update leave status.");
        }
    }

    // ==========================================
    // Calculate Leave Days
    // ==========================================
    function calculateDays(fromDate, toDate) {
        const from = new Date(fromDate);
        const to = new Date(toDate);

        const difference = to - from;

        return (
            Math.floor(
                difference /
                    (1000 * 60 * 60 * 24)
            ) + 1
        );
    }

    // ==========================================
    // Format Date
    // ==========================================
    function formatDate(date) {
        if (!date) {
            return "-";
        }

        return new Date(date).toLocaleDateString(
            "en-GB"
        );
    }

    // ==========================================
    // FILTER LEAVE REQUESTS
    //
    // Search works with:
    // Employee ID
    // Employee Name
    // ==========================================
    const filteredLeaves = leaves.filter((leave) => {

        // -------------------------------
        // Status Filter
        // -------------------------------
        const matchesStatus =
            statusFilter === "All" ||
            leave.status === statusFilter;

        // -------------------------------
        // Employee Search
        // Search ID OR Name
        // -------------------------------
        const searchValue =
            employeeSearch
                .trim()
                .toLowerCase();

        const employeeId =
            String(
                leave.employeeId ?? ""
            ).toLowerCase();

        const employeeName =
            String(
                leave.employeeName ?? ""
            ).toLowerCase();

        const matchesEmployee =
            searchValue === "" ||
            employeeId.includes(searchValue) ||
            employeeName.includes(searchValue);

        return (
            matchesStatus &&
            matchesEmployee
        );
    });

    return (
        <div className="leave-requests-page">

            {/* ==========================================
                HEADER
            ========================================== */}

            <div className="leave-requests-header">
                <div>
                    <h1>Leave Requests</h1>

                    <p>
                        Review and manage employee
                        leave requests.
                    </p>
                </div>
            </div>


            {/* ==========================================
                SEARCH AND STATUS FILTERS
            ========================================== */}

            <div className="leave-filter-toolbar">

                {/* Employee Search */}
                <div className="employee-search-box">

                    <input
                        type="text"
                        value={employeeSearch}
                        onChange={(e) =>
                            setEmployeeSearch(
                                e.target.value
                            )
                        }
                        placeholder="Search by Employee ID or Name"
                    />

                    {employeeSearch && (
                        <button
                            type="button"
                            className="clear-search-btn"
                            onClick={() =>
                                setEmployeeSearch("")
                            }
                        >
                            ×
                        </button>
                    )}

                </div>


                {/* Status Filters */}
                <div className="leave-status-filters">

                    {[
                        "All",
                        "Pending",
                        "Approved",
                        "Rejected"
                    ].map((status) => (

                        <button
                            key={status}
                            className={
                                statusFilter === status
                                    ? "leave-filter-btn active"
                                    : "leave-filter-btn"
                            }
                            onClick={() =>
                                setStatusFilter(status)
                            }
                        >
                            {status}
                        </button>

                    ))}


                    {/* Previous */}
                    <button
                        type="button"
                        className="leave-request-action-btn"
                        onClick={() =>
                            window.history.back()
                        }
                    >
                        ← Previous
                    </button>


                    {/* Refresh */}
                    <button
                        type="button"
                        className="leave-request-action-btn"
                        onClick={() => {
                            loadLeaves();
                            loadLeaveTypes();
                        }}
                    >
                        ↻ Refresh
                    </button>

                </div>

            </div>


            {/* ==========================================
                TABLE
            ========================================== */}

            <div className="leave-requests-table-card">

                <table className="leave-requests-table">

                    <thead>

                        <tr>

                            {/* Employee ID */}
                            <th>
                                Employee ID
                            </th>

                            {/* Employee Name */}
                            <th>
                                Employee Name
                            </th>

                            {/* Leave Type */}
                            <th>
                                Leave Type
                            </th>

                            {/* From Date */}
                            <th>
                                From Date
                            </th>

                            {/* To Date */}
                            <th>
                                To Date
                            </th>

                            {/* Days */}
                            <th>
                                Days
                            </th>

                            {/* Reason */}
                            <th>
                                Reason
                            </th>

                            {/* Status */}
                            <th>
                                Status
                            </th>

                            {/* Actions */}
                            <th>
                                Actions
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        {filteredLeaves.length === 0 ? (

                            <tr>

                                <td
                                    colSpan="9"
                                    className="no-leave-requests"
                                >
                                    No leave requests found.
                                </td>

                            </tr>

                        ) : (

                            filteredLeaves.map(
                                (leave) => (

                                    <tr
                                        key={
                                            leave.leaveId
                                        }
                                    >

                                        {/* ==================================
                                            EMPLOYEE ID
                                        ================================== */}

                                        <td>

                                            <strong>
                                                {leave.employeeId ??
                                                    "-"}
                                            </strong>

                                        </td>


                                        {/* ==================================
                                            EMPLOYEE NAME
                                        ================================== */}

                                        <td>

                                            <strong>
                                                {leave.employeeName ||
                                                    "Unknown Employee"}
                                            </strong>

                                        </td>


                                        {/* ==================================
                                            LEAVE TYPE
                                        ================================== */}

                                        <td>

                                            <strong>
                                                {getLeaveTypeName(
                                                    leave.leaveTypeId
                                                )}
                                            </strong>

                                        </td>


                                        {/* ==================================
                                            FROM DATE
                                        ================================== */}

                                        <td>
                                            {formatDate(
                                                leave.fromDate
                                            )}
                                        </td>


                                        {/* ==================================
                                            TO DATE
                                        ================================== */}

                                        <td>
                                            {formatDate(
                                                leave.toDate
                                            )}
                                        </td>


                                        {/* ==================================
                                            DAYS
                                        ================================== */}

                                        <td>

                                            {calculateDays(
                                                leave.fromDate,
                                                leave.toDate
                                            )}

                                        </td>


                                        {/* ==================================
                                            REASON
                                        ================================== */}

                                        <td>
                                            {leave.reason ||
                                                "-"}
                                        </td>


                                        {/* ==================================
                                            STATUS
                                        ================================== */}

                                        <td>

                                            <span
                                                className={`request-status ${
                                                    leave.status
                                                        ?.toLowerCase()
                                                }`}
                                            >
                                                {leave.status}
                                            </span>

                                        </td>


                                        {/* ==================================
                                            ACTIONS
                                        ================================== */}

                                        <td>

                                            <div className="leave-action-buttons">

                                                {/* View */}
                                                <button
                                                    className="view-details-btn"
                                                    onClick={() =>
                                                        setViewLeave(
                                                            leave
                                                        )
                                                    }
                                                >
                                                    View
                                                </button>


                                                {/* Approve / Reject */}
                                                {leave.status ===
                                                    "Pending" && (

                                                    <>

                                                        <button
                                                            className="approve-btn"
                                                            onClick={() =>
                                                                openStatusPopup(
                                                                    leave,
                                                                    "Approved"
                                                                )
                                                            }
                                                        >
                                                            Approve
                                                        </button>


                                                        <button
                                                            className="reject-btn"
                                                            onClick={() =>
                                                                openStatusPopup(
                                                                    leave,
                                                                    "Rejected"
                                                                )
                                                            }
                                                        >
                                                            Reject
                                                        </button>

                                                    </>

                                                )}

                                            </div>

                                        </td>

                                    </tr>

                                )
                            )

                        )}

                    </tbody>

                </table>

            </div>


            {/* ==========================================
                APPROVE / REJECT POPUP
            ========================================== */}

            {selectedLeave && (

                <div className="leave-modal-overlay">

                    <div className="leave-status-modal">

                        <div className="leave-modal-header">

                            <h2>

                                {selectedStatus ===
                                "Approved"
                                    ? "Approve Leave"
                                    : "Reject Leave"}

                            </h2>


                            <button
                                type="button"
                                className="leave-modal-close"
                                onClick={() => {
                                    setSelectedLeave(
                                        null
                                    );

                                    setSelectedStatus(
                                        ""
                                    );

                                    setManagerComment(
                                        ""
                                    );
                                }}
                            >
                                ×
                            </button>

                        </div>


                        <div className="leave-modal-body">

                            <div className="leave-review-info">

                                {/* Employee ID */}
                                <p>

                                    <strong>
                                        Employee ID:
                                    </strong>{" "}

                                    {selectedLeave.employeeId ??
                                        "-"}

                                </p>


                                {/* Employee Name */}
                                <p>

                                    <strong>
                                        Employee Name:
                                    </strong>{" "}

                                    {selectedLeave.employeeName ||
                                        "Unknown Employee"}

                                </p>


                                {/* Leave Type */}
                                <p>

                                    <strong>
                                        Leave Type:
                                    </strong>{" "}

                                    {getLeaveTypeName(
                                        selectedLeave.leaveTypeId
                                    )}

                                </p>


                                {/* From */}
                                <p>

                                    <strong>
                                        From:
                                    </strong>{" "}

                                    {formatDate(
                                        selectedLeave.fromDate
                                    )}

                                </p>


                                {/* To */}
                                <p>

                                    <strong>
                                        To:
                                    </strong>{" "}

                                    {formatDate(
                                        selectedLeave.toDate
                                    )}

                                </p>

                            </div>


                            {/* Manager Comment */}
                            <div className="manager-comment-group">

                                <label>
                                    Manager Comment
                                </label>

                                <textarea
                                    value={
                                        managerComment
                                    }
                                    onChange={(e) =>
                                        setManagerComment(
                                            e.target.value
                                        )
                                    }
                                    placeholder={
                                        selectedStatus ===
                                        "Approved"
                                            ? "Enter approval comment"
                                            : "Enter reason for rejection"
                                    }
                                />

                            </div>

                        </div>


                        <div className="leave-modal-actions">

                            <button
                                type="button"
                                className="modal-cancel-btn"
                                onClick={() => {

                                    setSelectedLeave(
                                        null
                                    );

                                    setSelectedStatus(
                                        ""
                                    );

                                    setManagerComment(
                                        ""
                                    );

                                }}
                            >
                                Cancel
                            </button>


                            <button
                                type="button"
                                className={
                                    selectedStatus ===
                                    "Approved"
                                        ? "modal-approve-btn"
                                        : "modal-reject-btn"
                                }
                                onClick={
                                    updateStatus
                                }
                            >

                                {selectedStatus ===
                                "Approved"
                                    ? "Confirm Approval"
                                    : "Confirm Rejection"}

                            </button>

                        </div>

                    </div>

                </div>

            )}


            {/* ==========================================
                VIEW LEAVE DETAILS POPUP
            ========================================== */}

            {viewLeave && (

                <div className="leave-modal-overlay">

                    <div className="leave-status-modal">

                        {/* Header */}

                        <div className="leave-modal-header">

                            <h2>
                                Leave Request Details
                            </h2>


                            <button
                                type="button"
                                className="leave-modal-close"
                                onClick={() =>
                                    setViewLeave(
                                        null
                                    )
                                }
                            >
                                ×
                            </button>

                        </div>


                        {/* Body */}

                        <div className="leave-modal-body">

                            <div className="leave-details-grid">

                                {/* Employee ID */}

                                <div className="leave-detail-item">

                                    <span>
                                        Employee ID
                                    </span>

                                    <strong>
                                        {viewLeave.employeeId ??
                                            "-"}
                                    </strong>

                                </div>


                                {/* Employee Name */}

                                <div className="leave-detail-item">

                                    <span>
                                        Employee Name
                                    </span>

                                    <strong>
                                        {viewLeave.employeeName ||
                                            "Unknown Employee"}
                                    </strong>

                                </div>


                                {/* Leave Type */}

                                <div className="leave-detail-item">

                                    <span>
                                        Leave Type
                                    </span>

                                    <strong>
                                        {getLeaveTypeName(
                                            viewLeave.leaveTypeId
                                        )}
                                    </strong>

                                </div>


                                {/* From Date */}

                                <div className="leave-detail-item">

                                    <span>
                                        From Date
                                    </span>

                                    <strong>
                                        {formatDate(
                                            viewLeave.fromDate
                                        )}
                                    </strong>

                                </div>


                                {/* To Date */}

                                <div className="leave-detail-item">

                                    <span>
                                        To Date
                                    </span>

                                    <strong>
                                        {formatDate(
                                            viewLeave.toDate
                                        )}
                                    </strong>

                                </div>


                                {/* Number of Days */}

                                <div className="leave-detail-item">

                                    <span>
                                        Number of Days
                                    </span>

                                    <strong>
                                        {calculateDays(
                                            viewLeave.fromDate,
                                            viewLeave.toDate
                                        )}
                                    </strong>

                                </div>


                                {/* Status */}

                                <div className="leave-detail-item">

                                    <span>
                                        Status
                                    </span>

                                    <span
                                        className={`request-status ${
                                            viewLeave.status?.toLowerCase()
                                        }`}
                                    >
                                        {viewLeave.status}
                                    </span>

                                </div>

                            </div>


                            {/* Reason */}

                            <div className="leave-detail-section">

                                <span>
                                    Reason
                                </span>

                                <p>
                                    {viewLeave.reason ||
                                        "-"}
                                </p>

                            </div>


                            {/* Manager Comment */}

                            <div className="leave-detail-section">

                                <span>
                                    Manager Comment
                                </span>

                                <p>
                                    {viewLeave.managerComment ||
                                        "-"}
                                </p>

                            </div>


                            {/* Approval Information */}

                            {viewLeave.status !==
                                "Pending" && (

                                <div className="leave-details-grid approval-details">

                                    <div className="leave-detail-item">

                                        <span>
                                            Approved / Rejected By
                                        </span>

                                        <strong>
                                            {viewLeave.approvedBy ||
                                                "-"}
                                        </strong>

                                    </div>


                                    <div className="leave-detail-item">

                                        <span>
                                            Decision Date
                                        </span>

                                        <strong>

                                            {viewLeave.approvedDate
                                                ? formatDate(
                                                      viewLeave.approvedDate
                                                  )
                                                : "-"}

                                        </strong>

                                    </div>

                                </div>

                            )}

                        </div>


                        {/* Footer */}

                        <div className="leave-modal-actions">

                            <button
                                type="button"
                                className="modal-cancel-btn"
                                onClick={() =>
                                    setViewLeave(
                                        null
                                    )
                                }
                            >
                                Close
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}