import { useEffect, useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Checkbox, FormControlLabel, Typography, Box, Chip, Divider, Button, TextField } from "@mui/material";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import "./LeaveRequests.css";
import { useAuth } from "../../../context/AuthContext";


const LEAVE_API = "https://sparkapi.amnikontechnologies.com:7206/api/Leave";
const LEAVE_TYPE_API = "https://sparkapi.amnikontechnologies.com:7206/api/LeaveType";

const SHIFT_API = "https://sparkapi.amnikontechnologies.com:7292/api/Shift";


export default function LeaveRequests() {
    const [searchParams] = useSearchParams();

    const {
        user,
        profile,
        employeeId,
        employeeCode,
        employeeName,
        isAuthenticated,
        profileLoading,
        hasPermission
    } = useAuth();

    const permissionRoute = "/leave/requests";
    const canView = hasPermission(permissionRoute, "view");
    const canApprove = hasPermission(permissionRoute, "approve");

    // The person approving/rejecting the leave is ALWAYS the
    // currently authenticated employee.
    const currentEmployeeId =
        employeeId ??
        profile?.employeeId ??
        profile?.EmployeeId ??
        profile?.employeeID ??
        profile?.EmployeeID ??
        user?.employeeId ??
        user?.EmployeeId ??
        user?.employeeID ??
        user?.EmployeeID ??
        null;

    const currentEmployeeCode =
        employeeCode ??
        profile?.employeeCode ??
        profile?.EmployeeCode ??
        user?.employeeCode ??
        user?.EmployeeCode ??
        null;

    const currentEmployeeName =
        employeeName ??
        profile?.employeeName ??
        profile?.EmployeeName ??
        profile?.displayName ??
        profile?.DisplayName ??
        profile?.fullName ??
        profile?.FullName ??
        user?.employeeName ??
        user?.EmployeeName ??
        user?.displayName ??
        user?.DisplayName ??
        user?.name ??
        user?.Name ??
        "Employee";

    const getAuthConfig = () => {
        const token = localStorage.getItem("token");

        return {
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {})
            }
        };
    };

    const validateAuthenticatedEmployee = () => {
        if (!isAuthenticated) {
            alert("You are not authenticated. Please sign in again.");
            return false;
        }

        if (
            currentEmployeeId === null ||
            currentEmployeeId === undefined ||
            currentEmployeeId === "" ||
            Number.isNaN(Number(currentEmployeeId))
        ) {
            console.error("LeaveRequests: Logged-in EmployeeId is missing.", {
                user,
                profile,
                employeeId
            });

            alert("Your Employee ID could not be determined. Please sign in again.");
            return false;
        }

        return true;
    };

    const [leaves, setLeaves] = useState([]);
    const [leaveTypes, setLeaveTypes] = useState([]);

    const [selectedLeave, setSelectedLeave] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState("");
    const [managerComment, setManagerComment] = useState("");

    const [openPartialApprovalDialog, setOpenPartialApprovalDialog] = useState(false);
    const [approvalDates, setApprovalDates] = useState([]);
    const [approvalDateInfo, setApprovalDateInfo] = useState([]);
    const [approvalSubmitting, setApprovalSubmitting] = useState(false);
    const [allShifts, setAllShifts] = useState([]);

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
        loadShifts();
    }, []);

    // ==========================================================
    // LOAD LEAVE REQUESTS
    // ==========================================================

async function loadLeaves() {
    try {
        const response = await axios.get(
            LEAVE_API,
            getAuthConfig()
        );

        console.log(
            "========== LEAVE API RESPONSE =========="
        );

        console.log(
            JSON.stringify(
                response.data,
                null,
                2
            )
        );

        console.log(
            "========================================"
        );

        setLeaves(response.data);

    } catch (error) {

        console.error(
            "Leave Request Error:",
            error
        );
    }
}
    // ==========================================================
    // LOAD LEAVE TYPES
    // ==========================================================

    async function loadLeaveTypes() {
        try {
            const response = await axios.get(LEAVE_TYPE_API, getAuthConfig());
            setLeaveTypes(response.data);
        } catch (error) {
            console.error("Leave Type Error:", error);
        }
    }

    // ==========================================================
    // LOAD SHIFT ASSIGNMENTS
    // ==========================================================

    async function loadShifts() {
        try {
            const response = await axios.get(SHIFT_API, getAuthConfig());
            setAllShifts(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Shift Error:", error);
            setAllShifts([]);
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

    // ==========================================================
    // PARTIAL APPROVAL DATE HELPERS
    // ==========================================================

    function toDateKey(value) {
        if (!value) return "";
        const s = String(value);
        if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.substring(0, 10);
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return "";
        return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
    }

    function formatDateKey(key) {
        if (!key) return "-";
        const [y,m,d] = key.split("-").map(Number);
        return new Date(y,m-1,d).toLocaleDateString("en-GB");
    }

    function getRequestDateKeys(leave) {
        const fromKey = toDateKey(leave?.fromDate);
        const toKey = toDateKey(leave?.toDate);
        if (!fromKey || !toKey || fromKey > toKey) return [];
        const [fy,fm,fd] = fromKey.split("-").map(Number);
        const [ty,tm,td] = toKey.split("-").map(Number);
        const current = new Date(fy,fm-1,fd);
        const end = new Date(ty,tm-1,td);
        const result = [];
        while (current <= end) {
            result.push(`${current.getFullYear()}-${String(current.getMonth()+1).padStart(2,"0")}-${String(current.getDate()).padStart(2,"0")}`);
            current.setDate(current.getDate()+1);
        }
        return result;
    }

    function getShiftForEmployeeDate(leave, dateKey) {
        if (!Array.isArray(allShifts)) return null;
        const employeeId = Number(leave?.employeeId);
        const matches = allShifts.filter(shift => {
            if (shift?.status && String(shift.status).trim().toLowerCase() !== "active") return false;
            if (Number(shift?.employeeId) !== employeeId) return false;
            const from = toDateKey(shift?.fromDate ?? shift?.FromDate ?? shift?.startDate ?? shift?.StartDate);
            const to = toDateKey(shift?.toDate ?? shift?.ToDate ?? shift?.endDate ?? shift?.EndDate);
            return (!from || dateKey >= from) && (!to || dateKey <= to);
        });
        matches.sort((a,b) => (toDateKey(b?.fromDate ?? b?.FromDate ?? b?.startDate ?? b?.StartDate) || "").localeCompare(toDateKey(a?.fromDate ?? a?.FromDate ?? a?.startDate ?? a?.StartDate) || ""));
        return matches[0] || null;
    }

    function isWeekOffForEmployeeDate(leave, dateKey) {
        const shift = getShiftForEmployeeDate(leave, dateKey);
        if (!shift) return false;
        const [y,m,d] = dateKey.split("-").map(Number);
        const dayName = new Date(y,m-1,d).toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
        const off1 = String(shift?.weeklyOff1 ?? shift?.WeeklyOff1 ?? shift?.weeklyoff1 ?? shift?.Weeklyoff1 ?? "").trim().toLowerCase();
        const off2 = String(shift?.weeklyOff2 ?? shift?.WeeklyOff2 ?? shift?.weeklyoff2 ?? shift?.Weeklyoff2 ?? "").trim().toLowerCase();
        return dayName === off1 || dayName === off2;
    }

    function openStatusPopup(leave, status) {
        if (!canApprove) return;
        setManagerComment("");
        if (status === "Approved") {
            const info = getRequestDateKeys(leave).map(dateKey => ({ dateKey, weekOff: isWeekOffForEmployeeDate(leave, dateKey) }));
            setSelectedLeave(leave);
            setSelectedStatus("Approved");
            setApprovalDateInfo(info);
            setApprovalDates(info.filter(x => !x.weekOff).map(x => x.dateKey));
            setOpenPartialApprovalDialog(true);
            return;
        }
        setSelectedLeave(leave);
        setSelectedStatus(status);
        setApprovalDateInfo([]);
        setApprovalDates([]);
    }

    function closePartialApprovalDialog() {
        if (approvalSubmitting) return;
        setOpenPartialApprovalDialog(false);
        setSelectedLeave(null);
        setSelectedStatus("");
        setManagerComment("");
        setApprovalDates([]);
        setApprovalDateInfo([]);
    }

    function toggleApprovalDate(dateKey) {
        setApprovalDates(prev => prev.includes(dateKey) ? prev.filter(x => x !== dateKey) : [...prev, dateKey]);
    }

    function selectAllWorkingDates() {
        setApprovalDates(approvalDateInfo.filter(x => !x.weekOff).map(x => x.dateKey));
    }

    function clearAllWorkingDates() { setApprovalDates([]); }

    // ==========================================================
    // UPDATE STATUS
    // ==========================================================

    async function updateStatus() {
        if (!selectedLeave || !canApprove) {
            return;
        }

        if (!managerComment.trim()) {
            alert("Please enter a manager comment.");
            return;
        }

        // Make sure the logged-in employee is available.
        if (!validateAuthenticatedEmployee()) {
            return;
        }

        console.log("==========================================");
        console.log("Leave Status Update");
        console.log("Action:", selectedStatus);
        console.log("LeaveId:", selectedLeave.leaveId);
        console.log("Approved / Rejected By EmployeeId:", currentEmployeeId);
        console.log("Approved / Rejected By EmployeeCode:", currentEmployeeCode);
        console.log("Approved / Rejected By EmployeeName:", currentEmployeeName);
        console.log("==========================================");

        if (selectedStatus === "Approved") {
            const workingDates = approvalDateInfo.filter(
                (x) => !x.weekOff
            );

            if (workingDates.length === 0) {
                alert(
                    "This leave request contains only Paid Week Off dates. There are no working days available for approval."
                );
                return;
            }

            if (approvalDates.length === 0) {
                alert("Please select at least one working day to approve.");
                return;
            }
        }

        try {
            setApprovalSubmitting(true);

            await axios.put(
                `${LEAVE_API}/${selectedLeave.leaveId}/status`,
                {
                    status: selectedStatus,

                    // Logged-in employee is the approver/rejector.
                    // No hard-coded employee ID is used.
approvedBy: Number(currentEmployeeId),

rejectedBy:
    selectedStatus === "Rejected"
        ? Number(currentEmployeeId)
        : null,

approvedByName: currentEmployeeName,
approvedByEmployeeCode: currentEmployeeCode,

                    managerComment: managerComment.trim(),

                    // Approved working dates only.
                    approvedDates:
                        selectedStatus === "Approved"
                            ? approvalDates
                            : [],

                    approvedDays:
                        selectedStatus === "Approved"
                            ? approvalDates.length
                            : 0,

                    partialApproval:
                        selectedStatus === "Approved"
                            ? approvalDates.length <
                              approvalDateInfo.filter(
                                  (x) => !x.weekOff
                              ).length
                            : false
                },
                getAuthConfig()
            );

            alert(
                selectedStatus === "Approved"
                    ? "Leave Approved Successfully"
                    : "Leave Rejected Successfully"
            );

            // Close popup.
            setOpenPartialApprovalDialog(false);
            setSelectedLeave(null);
            setSelectedStatus("");
            setManagerComment("");
            setApprovalDates([]);
            setApprovalDateInfo([]);

            // Refresh table.
            await loadLeaves();

        } catch (error) {
            console.error("Update Leave Status Error:", error);

            // The LeaveService can save the Leave/LeaveDays/balance
            // and then return 500 if its following ApprovalService
            // call fails. Verify the actual saved Leave status before
            // showing a failure message.
            if (
                error?.response?.status >= 500 ||
                error?.code === "ERR_NETWORK"
            ) {
                try {
                    console.log(
                        "Leave status update returned an error. Verifying saved leave..."
                    );

                    const verifyResponse = await axios.get(
                        LEAVE_API,
                        getAuthConfig()
                    );

                    const latestLeaves = Array.isArray(
                        verifyResponse.data
                    )
                        ? verifyResponse.data
                        : [];

                    const latestLeave = latestLeaves.find(
                        (leave) =>
                            Number(leave?.leaveId) ===
                            Number(selectedLeave?.leaveId)
                    );

                    console.log(
                        "Verified Leave after status error:",
                        latestLeave
                    );

                    if (
                        latestLeave &&
                        String(latestLeave?.status || "")
                            .trim()
                            .toLowerCase() ===
                        String(selectedStatus || "")
                            .trim()
                            .toLowerCase()
                    ) {
                        alert(
                            selectedStatus === "Approved"
                                ? "Leave Approved Successfully"
                                : "Leave Rejected Successfully"
                        );

                        setOpenPartialApprovalDialog(false);
                        setSelectedLeave(null);
                        setSelectedStatus("");
                        setManagerComment("");
                        setApprovalDates([]);
                        setApprovalDateInfo([]);

                        setLeaves(latestLeaves);

                        return;
                    }
                } catch (verifyError) {
                    console.error(
                        "Leave status verification failed:",
                        verifyError
                    );
                }
            }

            if (error?.response?.status === 401) {
                alert(
                    "Your session has expired. Please sign in again."
                );
                return;
            }

            if (error?.response?.status === 403) {
                alert(
                    "You are not authorized to approve or reject leave requests."
                );
                return;
            }

            const serverMessage =
                error?.response?.data?.message ||
                (typeof error?.response?.data === "string"
                    ? error.response.data
                    : null);

            alert(
                serverMessage ||
                "Unable to update leave status."
            );

        } finally {
            setApprovalSubmitting(false);
        }
    }

    // ==========================================================
    // CALCULATE LEAVE DAYS
    // ==========================================================

    function calculateDays(fromDate, toDate, employeeId = null) {
        const from = new Date(fromDate);
        const to = new Date(toDate);

        if (
            Number.isNaN(from.getTime()) ||
            Number.isNaN(to.getTime())
        ) {
            return 0;
        }

        from.setHours(0, 0, 0, 0);
        to.setHours(0, 0, 0, 0);

        // Preserve the existing calendar-day behavior if shift data
        // is not available yet.
        if (
            employeeId === null ||
            employeeId === undefined ||
            !Array.isArray(allShifts) ||
            allShifts.length === 0
        ) {
            const difference = to - from;

            return (
                Math.floor(
                    difference / (1000 * 60 * 60 * 24)
                ) + 1
            );
        }

        let workingDays = 0;
        const current = new Date(from);

        while (current <= to) {
            const dateKey =
                `${current.getFullYear()}-${String(
                    current.getMonth() + 1
                ).padStart(2, "0")}-${String(
                    current.getDate()
                ).padStart(2, "0")}`;

            const matchingShifts = allShifts.filter((shift) => {
                const status = String(
                    shift?.status ??
                    shift?.Status ??
                    ""
                ).trim().toLowerCase();

                if (status && status !== "active") {
                    return false;
                }

                if (
                    Number(shift?.employeeId) !==
                    Number(employeeId)
                ) {
                    return false;
                }

                const shiftFrom = toDateKey(
                    shift?.fromDate ??
                    shift?.FromDate ??
                    shift?.startDate ??
                    shift?.StartDate
                );

                const shiftTo = toDateKey(
                    shift?.toDate ??
                    shift?.ToDate ??
                    shift?.endDate ??
                    shift?.EndDate
                );

                return (
                    (!shiftFrom || dateKey >= shiftFrom) &&
                    (!shiftTo || dateKey <= shiftTo)
                );
            });

            matchingShifts.sort((a, b) => {
                const aFrom =
                    toDateKey(
                        a?.fromDate ??
                        a?.FromDate ??
                        a?.startDate ??
                        a?.StartDate
                    ) || "";

                const bFrom =
                    toDateKey(
                        b?.fromDate ??
                        b?.FromDate ??
                        b?.startDate ??
                        b?.StartDate
                    ) || "";

                return bFrom.localeCompare(aFrom);
            });

            const shift = matchingShifts[0] || null;

            if (shift) {
                const dayName = current
                    .toLocaleDateString("en-US", {
                        weekday: "long",
                    })
                    .toLowerCase();

                const weeklyOff1 = String(
                    shift?.weeklyOff1 ??
                    shift?.WeeklyOff1 ??
                    shift?.weeklyoff1 ??
                    shift?.Weeklyoff1 ??
                    ""
                ).trim().toLowerCase();

                const weeklyOff2 = String(
                    shift?.weeklyOff2 ??
                    shift?.WeeklyOff2 ??
                    shift?.weeklyoff2 ??
                    shift?.Weeklyoff2 ??
                    ""
                ).trim().toLowerCase();

                // Paid Week Off is not a leave day.
                if (
                    dayName === weeklyOff1 ||
                    dayName === weeklyOff2
                ) {
                    current.setDate(
                        current.getDate() + 1
                    );
                    continue;
                }
            }

            workingDays++;

            current.setDate(
                current.getDate() + 1
            );
        }

        return workingDays;
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

    if (!canView) {
        return (
            <div
                className="leave-requests-page"
                style={{ padding: "60px", textAlign: "center" }}
            >
                <h2>Access Denied</h2>
                <p>You do not have permission to access this page.</p>
            </div>
        );
    }

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

                    <p className="leave-current-user">
                        Logged in as: <strong>{profileLoading ? "Loading..." : currentEmployeeName}</strong>
                        {" "}({currentEmployeeId ?? "ID unavailable"})
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
                            loadShifts();
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
                                                    leave.toDate,
                                                    leave.employeeId
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

                                                {canApprove &&
                                                    leave.status ===
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

            {selectedLeave && selectedStatus === "Rejected" && (

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


                            {/* Logged-in Approver / Rejector */}

                            <div className="leave-review-info">
                                <p>
                                    <strong>
                                        {selectedStatus === "Approved"
                                            ? "Approved By:"
                                            : "Rejected By:"}
                                    </strong>{" "}
                                    {profileLoading
                                        ? "Loading employee..."
                                        : currentEmployeeName}
                                </p>

                                <p>
                                    <strong>Employee ID:</strong>{" "}
                                    {currentEmployeeId ?? "-"}
                                </p>

                                {currentEmployeeCode && (
                                    <p>
                                        <strong>Employee Code:</strong>{" "}
                                        {currentEmployeeCode}
                                    </p>
                                )}
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


                            {canApprove && (
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
                            )}

                        </div>

                    </div>

                </div>

            )}


            {/* ==================================================
                MUI PARTIAL APPROVAL DIALOG
            ================================================== */}

            <Dialog
                open={openPartialApprovalDialog}
                onClose={closePartialApprovalDialog}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle sx={{ fontWeight: 700 }}>
                    Approve Leave Request
                </DialogTitle>

                <DialogContent dividers>
                    {selectedLeave && (
                        <>
                            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5, mb: 2 }}>
                                <Box><Typography variant="caption" color="text.secondary">Employee ID</Typography><Typography fontWeight={600}>{selectedLeave.employeeId}</Typography></Box>
                                <Box><Typography variant="caption" color="text.secondary">Leave Type</Typography><Typography fontWeight={600}>{getLeaveTypeName(selectedLeave.leaveTypeId)}</Typography></Box>
                                <Box><Typography variant="caption" color="text.secondary">From</Typography><Typography fontWeight={600}>{formatDate(selectedLeave.fromDate)}</Typography></Box>
                                <Box><Typography variant="caption" color="text.secondary">To</Typography><Typography fontWeight={600}>{formatDate(selectedLeave.toDate)}</Typography></Box>
                            </Box>

                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                                <Chip size="small" label={`Requested: ${approvalDateInfo.filter(x => !x.weekOff).length} day(s)`} />
                                <Chip size="small" color="success" variant="outlined" label={`Approved: ${approvalDates.length} day(s)`} />
                                <Chip size="small" color="warning" variant="outlined" label={`Week Off: ${approvalDateInfo.filter(x => x.weekOff).length}`} />
                                <Chip size="small" color="error" variant="outlined" label={`Rejected: ${approvalDateInfo.filter(x => !x.weekOff).length - approvalDates.length}`} />
                            </Box>

                            <Divider sx={{ mb: 1.5 }} />
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Select days to approve</Typography>

                            <Box sx={{ display: "flex", gap: 1, mb: 1.5 }}>
                                <Button size="small" variant="outlined" onClick={selectAllWorkingDates}>Select All Working Days</Button>
                                <Button size="small" variant="text" onClick={clearAllWorkingDates}>Clear</Button>
                            </Box>

                            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                                {approvalDateInfo.map(item => (
                                    <Box key={item.dateKey} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid #e5e7eb", borderRadius: "8px", px: 1, py: 0.4 }}>
                                        {item.weekOff ? (
                                            <>
                                                <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#16803c" }}>{formatDateKey(item.dateKey)}</Typography>
                                                <Chip size="small" color="success" label="Week Off" />
                                            </>
                                        ) : (
                                            <FormControlLabel
                                                sx={{ m: 0, width: "100%" }}
                                                control={<Checkbox checked={approvalDates.includes(item.dateKey)} onChange={() => toggleApprovalDate(item.dateKey)} />}
                                                label={<Typography sx={{ fontSize: 14, fontWeight: 600 }}>{formatDateKey(item.dateKey)}</Typography>}
                                            />
                                        )}
                                    </Box>
                                ))}
                            </Box>

                            <TextField fullWidth multiline minRows={3} label="Manager Comment" value={managerComment} onChange={e => setManagerComment(e.target.value)} placeholder="Enter approval comment" sx={{ mt: 2 }} />
                        </>
                    )}
                </DialogContent>

                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={closePartialApprovalDialog} disabled={approvalSubmitting}>Cancel</Button>
                    <Button variant="contained" color="success" onClick={updateStatus} disabled={approvalSubmitting || approvalDates.length === 0}>
                        {approvalSubmitting ? "Approving..." : "Approve Selected Days"}
                    </Button>
                </DialogActions>
            </Dialog>

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
                                                viewLeave.toDate,
                                                viewLeave.employeeId
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

{/* Approval / Rejection Information */}

{viewLeave.status !== "Pending" && (

    <div className="leave-details-grid approval-details">

        <div className="leave-detail-item">

            <span>
                {viewLeave.status === "Rejected"
                    ? "Rejected By"
                    : "Approved By"}
            </span>

            <strong>
                {viewLeave.status === "Rejected"
                    ? (
                        viewLeave.rejectedByName ||
                        viewLeave.RejectedByName ||
                        viewLeave.rejectedByEmployeeName ||
                        viewLeave.RejectedByEmployeeName ||
                        viewLeave.rejectedBy ||
                        viewLeave.RejectedBy ||
                        "-"
                    )
                    : (
                        viewLeave.approvedByName ||
                        viewLeave.ApprovedByName ||
                        viewLeave.approvedByEmployeeName ||
                        viewLeave.ApprovedByEmployeeName ||
                        viewLeave.approvedBy ||
                        viewLeave.ApprovedBy ||
                        "-"
                    )}
            </strong>

        </div>


        <div className="leave-detail-item">

            <span>
                {viewLeave.status === "Rejected"
                    ? "Rejected Date"
                    : "Approved Date"}
            </span>

            <strong>
                {viewLeave.status === "Rejected"
                    ? (
                        viewLeave.rejectedDate
                            ? formatDate(viewLeave.rejectedDate)
                            : "-"
                    )
                    : (
                        viewLeave.approvedDate
                            ? formatDate(viewLeave.approvedDate)
                            : "-"
                    )}
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