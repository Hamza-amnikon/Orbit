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

    const [employeeSearch, setEmployeeSearch] = useState("");

    // ==========================================================
    // LOAD DATA
    // ==========================================================

    useEffect(() => {
        loadLeaves();
        loadLeaveTypes();
    }, []);

    // ==========================================================
    // LOAD LEAVE REQUESTS
    // ==========================================================

    async function loadLeaves() {
        try {
            const response = await axios.get(LEAVE_API);
            setLeaves(response.data);
        } catch (error) {
            console.error("Leave Request Error:", error);
        }
    }

    // ==========================================================
    // LOAD LEAVE TYPES
    // ==========================================================

    async function loadLeaveTypes() {
        try {
            const response = await axios.get(LEAVE_TYPE_API);
            setLeaveTypes(response.data);
        } catch (error) {
            console.error("Leave Type Error:", error);
        }
    }

    // ==========================================================
    // GET LEAVE TYPE NAME
    // ==========================================================

    function getLeaveTypeName(leaveTypeId) {
        const leaveType = leaveTypes.find(
            (type) => type.leaveTypeId === leaveTypeId
        );

        return leaveType ? leaveType.leaveTypeName : "-";
    }

    // ==========================================================
    // OPEN APPROVE / REJECT POPUP
    // ==========================================================

    function openStatusPopup(leave, status) {
        setSelectedLeave(leave);
        setSelectedStatus(status);
        setManagerComment("");
    }

    // ==========================================================
    // UPDATE STATUS
    // ==========================================================

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

                    // Temporary Admin ID for testing.
                    // Later this will come from logged-in user.
                    approvedBy: 1,

                    managerComment: managerComment.trim()
                }
            );

            alert(
                selectedStatus === "Approved"
                    ? "Leave Approved Successfully"
                    : "Leave Rejected Successfully"
            );

            // Close popup
            setSelectedLeave(null);
            setSelectedStatus("");
            setManagerComment("");

            // Refresh table
            await loadLeaves();
        } catch (error) {
            console.error("Update Leave Status Error:", error);

            alert("Unable to update leave status.");
        }
    }

    // ==========================================================
    // CALCULATE LEAVE DAYS
    // ==========================================================

    function calculateDays(fromDate, toDate) {
        const from = new Date(fromDate);
        const to = new Date(toDate);

        const difference = to - from;

        return (
            Math.floor(
                difference / (1000 * 60 * 60 * 24)
            ) + 1
        );
    }

    // ==========================================================
    // FORMAT DATE
    // ==========================================================

    function formatDate(date) {
        return new Date(date).toLocaleDateString("en-GB");
    }

    // ==========================================================
    // DYNAMIC STATUS OPTIONS
    // ==========================================================
    // Statuses come from API data.
    // Nothing is hardcoded here.

    const statusOptions = [
        "All",

        ...new Set(
            [
                statusFilter,
                ...leaves
                    .map((leave) => leave.status)
                    .filter(Boolean)
            ].filter(
                (status) =>
                    status &&
                    status !== "All"
            )
        )
    ];

    // ==========================================================
    // FILTER LEAVE REQUESTS
    // ==========================================================

    const filteredLeaves = leaves.filter((leave) => {

        // Status filter
        const matchesStatus =
            statusFilter === "All" ||
            leave.status === statusFilter;

        // Employee search
        const searchValue =
            employeeSearch.trim();

        const matchesEmployee =
            searchValue === "" ||
            leave.employeeId
                ?.toString()
                .includes(searchValue) ||
            leave.azureEmployeeId
                ?.toString()
                .includes(searchValue);

        return (
            matchesStatus &&
            matchesEmployee
        );
    });

    // ==========================================================
    // JSX
    // ==========================================================

    return (
        <div className="leave-requests-page">

            {/* ==================================================
                HEADER CARD
            ================================================== */}

            <div className="leave-requests-header">

                <div>
                    <h1>
                        Leave Requests
                    </h1>

                    <p>
                        Review and manage employee leave requests.
                    </p>
                </div>

                {/* Header Actions */}

                <div className="leave-request-header-actions">

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


            {/* ==================================================
                SEARCH + STATUS FILTER CARD
            ================================================== */}

            <div className="leave-filter-toolbar">

                {/* Employee ID Search */}

                <div className="employee-search-box">

                    <input
                        type="text"
                        value={employeeSearch}
                        onChange={(e) =>
                            setEmployeeSearch(
                                e.target.value
                            )
                        }
                        placeholder="Search by Employee ID"
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


                {/* ==================================================
                    STATUS DROPDOWN
                ================================================== */}

                <div className="leave-status-dropdown">

                    <select
                        className="leave-status-select"
                        value={statusFilter}
                        onChange={(e) =>
                            setStatusFilter(
                                e.target.value
                            )
                        }
                    >

                        {statusOptions.map(
                            (status) => (
                                <option
                                    key={status}
                                    value={status}
                                >
                                    {status}
                                </option>
                            )
                        )}

                    </select>

                </div>

            </div>


            {/* ==================================================
                TABLE
            ================================================== */}

            <div className="leave-requests-table-card">

                <table className="leave-requests-table">

                    <thead>

                        <tr>

                            <th>
                                Employee
                            </th>

                            <th>
                                Leave Type
                            </th>

                            <th>
                                From Date
                            </th>

                            <th>
                                To Date
                            </th>

                            <th>
                                Days
                            </th>

                            <th>
                                Reason
                            </th>

                            <th>
                                Status
                            </th>

                            <th>
                                Actions
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        {filteredLeaves.length === 0 ? (

                            <tr>

                                <td
                                    colSpan="8"
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

                                        {/* Employee */}

                                        <td>

                                            <div className="employee-id-cell">

                                                <span>
                                                    {
                                                        leave.azureEmployeeId
                                                    }
                                                </span>

                                            </div>

                                        </td>


                                        {/* Leave Type */}

                                        <td>

                                            <strong>
                                                {
                                                    getLeaveTypeName(
                                                        leave.leaveTypeId
                                                    )
                                                }
                                            </strong>

                                        </td>


                                        {/* From Date */}

                                        <td>
                                            {
                                                formatDate(
                                                    leave.fromDate
                                                )
                                            }
                                        </td>


                                        {/* To Date */}

                                        <td>
                                            {
                                                formatDate(
                                                    leave.toDate
                                                )
                                            }
                                        </td>


                                        {/* Days */}

                                        <td>

                                            {
                                                calculateDays(
                                                    leave.fromDate,
                                                    leave.toDate
                                                )
                                            }

                                        </td>


                                        {/* Reason */}

                                        <td>

                                            {
                                                leave.reason ||
                                                "-"
                                            }

                                        </td>


                                        {/* Status */}

                                        <td>

                                            <span
                                                className={`request-status ${leave.status?.toLowerCase()}`}
                                            >
                                                {
                                                    leave.status
                                                }
                                            </span>

                                        </td>


                                        {/* Actions */}

                                        <td>

                                            <div className="leave-action-buttons">

                                                {/* View */}

                                                <button
                                                    type="button"
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
                                                            type="button"
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
                                                            type="button"
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


            {/* ==================================================
                APPROVE / REJECT POPUP
            ================================================== */}

            {selectedLeave && (

                <div className="leave-modal-overlay">

                    <div className="leave-status-modal">

                        {/* Modal Header */}

                        <div className="leave-modal-header">

                            <h2>

                                {
                                    selectedStatus ===
                                    "Approved"
                                        ? "Approve Leave"
                                        : "Reject Leave"
                                }

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


                        {/* Modal Body */}

                        <div className="leave-modal-body">

                            <div className="leave-review-info">

                                <p>

                                    <strong>
                                        Employee ID:
                                    </strong>{" "}

                                    {
                                        selectedLeave.employeeId
                                    }

                                </p>


                                <p>

                                    <strong>
                                        Azure Employee ID:
                                    </strong>{" "}

                                    {
                                        selectedLeave.azureEmployeeId
                                    }

                                </p>


                                <p>

                                    <strong>
                                        Leave Type:
                                    </strong>{" "}

                                    {
                                        getLeaveTypeName(
                                            selectedLeave.leaveTypeId
                                        )
                                    }

                                </p>


                                <p>

                                    <strong>
                                        From:
                                    </strong>{" "}

                                    {
                                        formatDate(
                                            selectedLeave.fromDate
                                        )
                                    }

                                </p>


                                <p>

                                    <strong>
                                        To:
                                    </strong>{" "}

                                    {
                                        formatDate(
                                            selectedLeave.toDate
                                        )
                                    }

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


                        {/* Modal Actions */}

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

                                {
                                    selectedStatus ===
                                    "Approved"
                                        ? "Confirm Approval"
                                        : "Confirm Rejection"
                                }

                            </button>

                        </div>

                    </div>

                </div>

            )}


            {/* ==================================================
                VIEW LEAVE DETAILS POPUP
            ================================================== */}

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

                                <div className="leave-detail-item">

                                    <span>
                                        Employee ID
                                    </span>

                                    <strong>
                                        {
                                            viewLeave.employeeId
                                        }
                                    </strong>

                                </div>


                                <div className="leave-detail-item">

                                    <span>
                                        Azure Employee ID
                                    </span>

                                    <strong>
                                        {
                                            viewLeave.azureEmployeeId
                                        }
                                    </strong>

                                </div>


                                <div className="leave-detail-item">

                                    <span>
                                        Leave Type
                                    </span>

                                    <strong>

                                        {
                                            getLeaveTypeName(
                                                viewLeave.leaveTypeId
                                            )
                                        }

                                    </strong>

                                </div>


                                <div className="leave-detail-item">

                                    <span>
                                        From Date
                                    </span>

                                    <strong>

                                        {
                                            formatDate(
                                                viewLeave.fromDate
                                            )
                                        }

                                    </strong>

                                </div>


                                <div className="leave-detail-item">

                                    <span>
                                        To Date
                                    </span>

                                    <strong>

                                        {
                                            formatDate(
                                                viewLeave.toDate
                                            )
                                        }

                                    </strong>

                                </div>


                                <div className="leave-detail-item">

                                    <span>
                                        Number of Days
                                    </span>

                                    <strong>

                                        {
                                            calculateDays(
                                                viewLeave.fromDate,
                                                viewLeave.toDate
                                            )
                                        }

                                    </strong>

                                </div>


                                <div className="leave-detail-item">

                                    <span>
                                        Status
                                    </span>

                                    <span
                                        className={`request-status ${viewLeave.status?.toLowerCase()}`}
                                    >
                                        {
                                            viewLeave.status
                                        }
                                    </span>

                                </div>

                            </div>


                            {/* Reason */}

                            <div className="leave-detail-section">

                                <span>
                                    Reason
                                </span>

                                <p>
                                    {
                                        viewLeave.reason ||
                                        "-"
                                    }
                                </p>

                            </div>


                            {/* Manager Comment */}

                            <div className="leave-detail-section">

                                <span>
                                    Manager Comment
                                </span>

                                <p>
                                    {
                                        viewLeave.managerComment ||
                                        "-"
                                    }
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
                                            {
                                                viewLeave.approvedBy ||
                                                "-"
                                            }
                                        </strong>

                                    </div>


                                    <div className="leave-detail-item">

                                        <span>
                                            Decision Date
                                        </span>

                                        <strong>

                                            {
                                                viewLeave.approvedDate
                                                    ? formatDate(
                                                        viewLeave.approvedDate
                                                    )
                                                    : "-"
                                            }

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