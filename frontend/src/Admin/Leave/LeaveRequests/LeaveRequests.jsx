import { MuiButtonMigration, MuiInputMigration, MuiSelectMigration, MuiTableBodyMigration, MuiTableCellMigration, MuiTableHeadMigration, MuiTableMigration, MuiTableRowMigration } from "../../../components/ui/MuiCompat.jsx";
import { useEffect, useState } from "react";
import { Alert, Dialog, DialogTitle, DialogContent, DialogActions, Checkbox, FormControlLabel, Typography, Box, Chip, Divider, Button, TextField, Snackbar, IconButton, InputAdornment, Tooltip, MenuItem } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowBackRounded, AttachFileRounded, BeachAccessRounded, BlockRounded, CheckRounded, CloseRounded, RefreshRounded, SearchRounded, VisibilityOutlined } from "@mui/icons-material";
import { FileDownloadOutlined } from "@mui/icons-material";
import axios from "axios";
import "./LeaveRequests.css";
import { useAuth } from "../../../context/AuthContext";
import { Box as MuiLayoutBox, Typography as MuiText } from "@mui/material";
import { loadXlsx } from "../../../utils/exportLibraries";


const LEAVE_API =
    `${import.meta.env.VITE_LEAVE_API_BASE_URL}/api/Leave`;

const LEAVE_TYPE_API =
    `${import.meta.env.VITE_LEAVE_API_BASE_URL}/api/LeaveType`;
    
const SHIFT_API =  `${import.meta.env.VITE_SHIFT_API_BASE_URL}/api/Shift`;


export default function LeaveRequests() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

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
    const canExport = hasPermission(permissionRoute, "export");

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
            showFeedback("You are not authenticated. Please sign in again.", "error");
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

            showFeedback("Your Employee ID could not be determined. Please sign in again.", "error");
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

    // Supporting document for the View Leave Request popup
    const [viewDocumentUrl, setViewDocumentUrl] = useState("");
    const [viewDocumentType, setViewDocumentType] = useState("");
    const [viewDocumentLoading, setViewDocumentLoading] = useState(false);
    const [viewDocumentError, setViewDocumentError] = useState("");

    const [statusFilter, setStatusFilter] = useState(
        searchParams.get("status") || "All"
    );

    const [employeeSearch, setEmployeeSearch] = useState("");
    const [feedback, setFeedback] = useState({ open: false, message: "", severity: "info" });
    const showFeedback = (message, severity = "info") => setFeedback({ open: true, message, severity });

    const exportRequests = async () => {
        if (!canExport || filteredLeaves.length === 0) return;
        const XLSX = await loadXlsx();
        const rows = filteredLeaves.map((leave) => ({
            "Azure Employee ID": leave.azureEmployeeId ?? leave.AzureEmployeeId ?? leave.azureEmployeeID ?? "-",
            "Employee ID": leave.employeeId ?? "-",
            "Leave Type": getLeaveTypeName(leave.leaveTypeId) || "-",
            "From Date": leave.fromDate ? formatDate(leave.fromDate) : "-",
            "To Date": leave.toDate ? formatDate(leave.toDate) : "-",
            Days: calculateDays(leave.fromDate, leave.toDate, leave.employeeId),
            Reason: leave.reason || "-",
            Status: leave.status || "-",
        }));
        const sheet = XLSX.utils.json_to_sheet(rows);
        sheet["!cols"] = [{ wch: 20 }, { wch: 15 }, { wch: 24 }, { wch: 14 }, { wch: 14 }, { wch: 10 }, { wch: 42 }, { wch: 14 }];
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, sheet, "Leave Requests");
        XLSX.writeFile(workbook, `Spark_Leave_Requests_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

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
    // LOAD SUPPORTING DOCUMENT FOR VIEW POPUP
    // ==========================================================

    useEffect(() => {
        let objectUrl = null;

        async function loadViewDocument() {
            if (!viewLeave?.leaveId) {
                setViewDocumentUrl("");
                setViewDocumentType("");
                setViewDocumentError("");
                setViewDocumentLoading(false);
                return;
            }

            setViewDocumentLoading(true);
            setViewDocumentError("");
            setViewDocumentUrl("");
            setViewDocumentType("");

            try {
                const response = await axios.get(
                    `${LEAVE_API}/${viewLeave.leaveId}/document`,
                    {
                        ...getAuthConfig(),
                        responseType: "blob"
                    }
                );

                const contentType =
                    response?.headers?.["content-type"] ||
                    response?.data?.type ||
                    "application/octet-stream";

                objectUrl = URL.createObjectURL(response.data);

                setViewDocumentUrl(objectUrl);
                setViewDocumentType(contentType);
            } catch (error) {
                console.error(
                    "Leave supporting document load error:",
                    error
                );

                setViewDocumentUrl("");
                setViewDocumentType("");

                if (error?.response?.status === 404) {
                    setViewDocumentError(
                        "No supporting document is attached to this leave request."
                    );
                } else {
                    setViewDocumentError(
                        "Unable to load the supporting document."
                    );
                }
            } finally {
                setViewDocumentLoading(false);
            }
        }

        loadViewDocument();

        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [viewLeave?.leaveId]);

    function closeViewLeave() {
        setViewLeave(null);
        setViewDocumentUrl("");
        setViewDocumentType("");
        setViewDocumentError("");
        setViewDocumentLoading(false);
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

    function closeRejectDialog() {
        if (approvalSubmitting) return;
        setSelectedLeave(null);
        setSelectedStatus("");
        setManagerComment("");
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
            showFeedback("Please enter a manager comment.", "warning");
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
                showFeedback("This leave request contains only Paid Week Off dates. There are no working days available for approval.", "warning");
                return;
            }

            if (approvalDates.length === 0) {
                showFeedback("Please select at least one working day to approve.", "warning");
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

            showFeedback(
                selectedStatus === "Approved"
                    ? "Leave Approved Successfully"
                    : "Leave Rejected Successfully",
                "success"
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
                        showFeedback(
                            selectedStatus === "Approved"
                                ? "Leave Approved Successfully"
                                : "Leave Rejected Successfully",
                            "success"
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
                showFeedback("Your session has expired. Please sign in again.", "error");
                return;
            }

            if (error?.response?.status === 403) {
                showFeedback("You are not authorized to approve or reject leave requests.", "error");
                return;
            }

            const serverMessage =
                error?.response?.data?.message ||
                (typeof error?.response?.data === "string"
                    ? error.response.data
                    : null);

            showFeedback(serverMessage || "Unable to update leave status.", "error");

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
            [leave.employeeName, leave.EmployeeName, leave.name, leave.Name, leave.email, leave.Email]
                .some((value) => String(value || "").toLowerCase().includes(searchValue.toLowerCase())) ||
            leave.employeeId
                ?.toString()
                .includes(searchValue) ||
            leave.azureEmployeeId
                ?.toString()
                .includes(searchValue);

        const rangeStart = searchParams.get("fromDate");
        const rangeEnd = searchParams.get("toDate");
        const leaveStart = new Date(leave.fromDate);
        const leaveEnd = new Date(leave.toDate || leave.fromDate);
        const matchesDateRange =
            (!rangeStart || leaveEnd >= new Date(`${rangeStart}T00:00:00`)) &&
            (!rangeEnd || leaveStart <= new Date(`${rangeEnd}T23:59:59`));

        return (
            matchesStatus &&
            matchesEmployee &&
            matchesDateRange
        );
    });

    // ==========================================================
    // JSX
    // ==========================================================

    if (!canView) {
        return (
            <MuiLayoutBox
                className="leave-requests-page"
                style={{ padding: "60px", textAlign: "center" }}
             component="div">
                <MuiText component="h2" variant="h5">Access Denied</MuiText>
                <MuiText component="p" variant="body1">You do not have permission to access this page.</MuiText>
            </MuiLayoutBox>
        );
    }

    return (
        <MuiLayoutBox className="leave-requests-page" component="div">

            {/* ==================================================
                HEADER CARD
            ================================================== */}

            <MuiLayoutBox className="leave-requests-header" component="div">

                <MuiLayoutBox className="leave-requests-title-group" component="div">
                    <Tooltip title="Back">
                        <IconButton className="leave-back-button" aria-label="Go back" onClick={() => navigate(-1)}>
                            <ArrowBackRounded />
                        </IconButton>
                    </Tooltip>
                    <MuiLayoutBox component="div">
                        <MuiText component="h1" variant="h4">Leave Requests</MuiText>
                        <MuiText component="p" variant="body1">Review and manage employee leave requests.</MuiText>
                    </MuiLayoutBox>
                </MuiLayoutBox>

                {/* Header Actions */}

                <MuiLayoutBox className="leave-request-header-actions" component="div">

                    <Button className="leave-request-refresh-btn" variant="outlined" startIcon={<RefreshRounded />} onClick={() => {
                            loadLeaves();
                            loadLeaveTypes();
                            loadShifts();
                        }}>Refresh</Button>
                    {canExport && <Button className="leave-request-refresh-btn" variant="outlined" startIcon={<FileDownloadOutlined />} onClick={exportRequests} disabled={filteredLeaves.length === 0}>Export Excel</Button>}

                </MuiLayoutBox>

            </MuiLayoutBox>


            {/* ==================================================
                SEARCH + STATUS FILTER CARD
            ================================================== */}

            <MuiLayoutBox className="leave-filter-toolbar" component="div">

                {/* Employee ID Search */}

                <TextField
                    className="leave-search-field"
                    size="small"
                    value={employeeSearch}
                    onChange={(e) => setEmployeeSearch(e.target.value)}
                    placeholder="Search by employee name, email or ID"
                    aria-label="Search leave requests"
                    InputProps={{
                        startAdornment: <InputAdornment position="start"><SearchRounded /></InputAdornment>,
                        endAdornment: employeeSearch ? <InputAdornment position="end"><IconButton size="small" aria-label="Clear search" onClick={() => setEmployeeSearch("")}><CloseRounded fontSize="small" /></IconButton></InputAdornment> : null,
                    }}
                />


                {/* ==================================================
                    STATUS DROPDOWN
                ================================================== */}

                <TextField className="leave-status-field" select size="small" label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    {statusOptions.map((status) => <MenuItem key={status} value={status}>{status}</MenuItem>)}
                </TextField>

                {(searchParams.get("fromDate") || searchParams.get("toDate")) && (
                    <Chip
                        className="leave-date-filter-chip"
                        label={`${searchParams.get("fromDate") || "Any date"} – ${searchParams.get("toDate") || "Any date"}`}
                        onDelete={() => {
                            const next = new URLSearchParams(searchParams);
                            next.delete("fromDate");
                            next.delete("toDate");
                            setSearchParams(next);
                        }}
                    />
                )}

            </MuiLayoutBox>


            {/* ==================================================
                TABLE
            ================================================== */}

            <MuiLayoutBox className="leave-requests-table-card" component="div">

                <MuiLayoutBox className="leave-table-toolbar" component="div">
                    <MuiText component="h2" variant="subtitle1">All Requests</MuiText>
                    <Chip size="small" label={`${filteredLeaves.length} ${filteredLeaves.length === 1 ? "request" : "requests"}`} />
                </MuiLayoutBox>

                <MuiTableMigration className="leave-requests-table">

                    <MuiTableHeadMigration>

                        <MuiTableRowMigration>

                            <MuiTableCellMigration>Azure Employee ID</MuiTableCellMigration>

                            <MuiTableCellMigration>
                                Leave Type
                            </MuiTableCellMigration>

                            <MuiTableCellMigration>Leave Period</MuiTableCellMigration>

                            <MuiTableCellMigration>
                                Days
                            </MuiTableCellMigration>

                            <MuiTableCellMigration>
                                Reason
                            </MuiTableCellMigration>

                            <MuiTableCellMigration>
                                Status
                            </MuiTableCellMigration>

                            <MuiTableCellMigration>
                                Actions
                            </MuiTableCellMigration>

                        </MuiTableRowMigration>

                    </MuiTableHeadMigration>


                    <MuiTableBodyMigration>

                        {filteredLeaves.length === 0 ? (

                            <MuiTableRowMigration>

                                <MuiTableCellMigration
                                    colSpan="7"
                                    className="no-leave-requests"
                                >
                                    No leave requests found.
                                </MuiTableCellMigration>

                            </MuiTableRowMigration>

                        ) : (

                            filteredLeaves.map(
                                (leave) => (

                                    <MuiTableRowMigration
                                        key={
                                            leave.leaveId
                                        }
                                    >

                                        {/* Employee */}

                                        <MuiTableCellMigration>

                                            <MuiLayoutBox className="employee-id-cell" component="div">

                                                <MuiText component="span" variant="inherit">
                                                    {
                                                        leave.azureEmployeeId ?? leave.AzureEmployeeId ?? leave.azureEmployeeID ?? "—"
                                                    }
                                                </MuiText>

                                            </MuiLayoutBox>

                                        </MuiTableCellMigration>


                                        {/* Leave Type */}

                                        <MuiTableCellMigration>

                                            <MuiText component="strong" variant="inherit">
                                                {
                                                    getLeaveTypeName(
                                                        leave.leaveTypeId
                                                    )
                                                }
                                            </MuiText>

                                        </MuiTableCellMigration>


                                        {/* Leave Period */}
                                        <MuiTableCellMigration>
                                            <MuiText className="leave-period-cell" component="span" variant="inherit">
                                                {formatDate(leave.fromDate)} <span aria-hidden="true">–</span> {formatDate(leave.toDate)}
                                            </MuiText>
                                        </MuiTableCellMigration>


                                        {/* Days */}

                                        <MuiTableCellMigration>

                                            {
                                                calculateDays(
                                                    leave.fromDate,
                                                    leave.toDate,
                                                    leave.employeeId
                                                )
                                            }

                                        </MuiTableCellMigration>


                                        {/* Reason */}

                                        <MuiTableCellMigration>

                                            <MuiText className="leave-reason-cell" component="span" variant="inherit" title={leave.reason || "No reason provided"}>
                                                {leave.reason || "—"}
                                            </MuiText>

                                        </MuiTableCellMigration>


                                        {/* Status */}

                                        <MuiTableCellMigration>

                                            <Chip
                                                size="small"
                                                className={`request-status ${String(leave.status || "").toLowerCase()}`}
                                                label={leave.status || "Unknown"}
                                                color={String(leave.status || "").toLowerCase() === "approved" ? "success" : String(leave.status || "").toLowerCase() === "rejected" ? "error" : "warning"}
                                            />

                                        </MuiTableCellMigration>


                                        {/* Actions */}

                                        <MuiTableCellMigration>

                                            <MuiLayoutBox className="leave-action-buttons" component="div">

                                                {/* View */}

                                                <Button size="small" variant="outlined" startIcon={<VisibilityOutlined />} className="view-details-btn" onClick={() => setViewLeave(leave)}>View</Button>


                                                {/* Approve / Reject */}

                                                {canApprove &&
                                                    leave.status ===
                                                        "Pending" && (
                                                        <>
                                                            <Button size="small" variant="contained" disableElevation startIcon={<CheckRounded />} className="approve-btn" onClick={() => openStatusPopup(leave, "Approved")}>Approve</Button>
                                                            <Button size="small" variant="contained" disableElevation startIcon={<CloseRounded />} className="reject-btn" onClick={() => openStatusPopup(leave, "Rejected")}>Reject</Button>
                                                        </>
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


            {/* ==================================================
                APPROVE / REJECT POPUP
            ================================================== */}

            <Dialog
                open={Boolean(selectedLeave && selectedStatus === "Rejected")}
                onClose={closeRejectDialog}
                fullWidth
                maxWidth="sm"
                className="leave-reject-dialog"
            >
                <DialogTitle sx={{ p: 0 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, px: { xs: 2, sm: 3 }, py: 2.5, background: "linear-gradient(110deg, #fff1f1 0%, #fff8f7 100%)", borderBottom: "1px solid #f1dddd" }}>
                        <Box sx={{ width: 52, height: 52, flex: "0 0 52px", display: "grid", placeItems: "center", borderRadius: "14px", bgcolor: "#d64545", color: "#fff" }}>
                            <BlockRounded />
                        </Box>
                        <Box>
                            <Typography sx={{ color: "#17345c", fontSize: { xs: 19, sm: 23 }, fontWeight: 750, lineHeight: 1.2 }}>Reject Leave Request</Typography>
                            <Typography sx={{ mt: 0.5, color: "#71839d", fontSize: 13 }}>Review the request and provide a reason for rejection.</Typography>
                        </Box>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ px: { xs: 2, sm: 3 }, pt: { xs: 3, sm: 3.5 }, pb: 2.5 }}>
                    {selectedLeave && (
                        <>
                            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(2, minmax(0, 1fr))" }, gap: 1.25, mt: { xs: 1.5, sm: 2 }, mb: 2 }}>
                                {[
                                    ["Azure Employee ID", selectedLeave.azureEmployeeId ?? selectedLeave.AzureEmployeeId ?? selectedLeave.azureEmployeeID ?? "—"],
                                    ["Leave Type", getLeaveTypeName(selectedLeave.leaveTypeId) || "—"],
                                    ["From Date", formatDate(selectedLeave.fromDate)],
                                    ["To Date", formatDate(selectedLeave.toDate)],
                                ].map(([label, value]) => (
                                    <Box key={label} sx={{ minWidth: 0, minHeight: 68, display: "flex", flexDirection: "column", justifyContent: "center", gap: 0.5, px: 1.75, py: 1.25, border: "1px solid #eadfe0", borderRadius: "11px", background: "linear-gradient(120deg, #fff7f7, #fffafa)" }}>
                                        <Typography sx={{ color: "#8b7378", fontSize: 11, fontWeight: 650 }}>{label}</Typography>
                                        <Typography sx={{ overflowWrap: "anywhere", color: "#11294d", fontSize: 14, fontWeight: 700 }}>{value}</Typography>
                                    </Box>
                                ))}
                            </Box>

                            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.25, mb: 2, p: 1.5, border: "1px solid #f0dada", borderRadius: "10px", bgcolor: "#fff8f8" }}>
                                <BlockRounded sx={{ mt: 0.1, color: "#c64a4a", fontSize: 19 }} />
                                <Typography sx={{ color: "#79565a", fontSize: 12, lineHeight: 1.55 }}>Rejecting this request will notify the employee and record your decision.</Typography>
                            </Box>

                            <TextField
                                fullWidth
                                multiline
                                minRows={3}
                                label="Reason for rejection"
                                required
                                value={managerComment}
                                onChange={(event) => setManagerComment(event.target.value)}
                                placeholder="Explain why this leave request is being rejected"
                                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px", bgcolor: "#fff" }, "& .MuiInputLabel-root": { color: "#687b95" } }}
                            />
                        </>
                    )}
                </DialogContent>

                <DialogActions sx={{ px: { xs: 2, sm: 3 }, py: 2, borderTop: "1px solid #e8edf4", bgcolor: "#fbfcfe", gap: 1 }}>
                    <Button variant="outlined" onClick={closeRejectDialog} disabled={approvalSubmitting} sx={{ px: 2, borderColor: "#d6e0ed", borderRadius: "8px", color: "#526781", textTransform: "none" }}>Cancel</Button>
                    <Button variant="contained" disableElevation color="error" onClick={updateStatus} disabled={approvalSubmitting || !managerComment.trim()} sx={{ px: 2.25, borderRadius: "8px", bgcolor: "#d64545", fontWeight: 700, textTransform: "none", "&:hover": { bgcolor: "#b93434" } }}>
                        {approvalSubmitting ? "Rejecting..." : "Confirm Rejection"}
                    </Button>
                </DialogActions>
            </Dialog>


            {/* ==================================================
                MUI PARTIAL APPROVAL DIALOG
            ================================================== */}

            <Dialog
                open={openPartialApprovalDialog}
                onClose={closePartialApprovalDialog}
                fullWidth
                maxWidth="md"
                className="leave-approval-dialog"
            >
                <DialogTitle sx={{ p: 0 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, px: { xs: 2, sm: 3 }, py: 2.5, background: "linear-gradient(110deg, #eaf3ff 0%, #f5f9ff 100%)", borderBottom: "1px solid #e4ebf5" }}>
                        <Box sx={{ width: 52, height: 52, flex: "0 0 52px", display: "grid", placeItems: "center", borderRadius: "14px", bgcolor: "#3478f6", color: "#fff" }}>
                            <BeachAccessRounded />
                        </Box>
                        <Box>
                            <Typography sx={{ color: "#17345c", fontSize: { xs: 19, sm: 23 }, fontWeight: 750, lineHeight: 1.2 }}>Approve Leave Request</Typography>
                            <Typography sx={{ mt: 0.5, color: "#71839d", fontSize: 13 }}>Select the leave days to approve and add a manager comment.</Typography>
                        </Box>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ px: { xs: 2, sm: 3 }, pt: { xs: 4, sm: 5 }, pb: 2.5 }}>
                    {selectedLeave && (
                        <>
                            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(2, minmax(0, 1fr))" }, gap: 1.25, mt: { xs: 2, sm: 2.5 }, mb: 2 }}>
                                {[
                                    ["Azure Employee ID", selectedLeave.azureEmployeeId ?? selectedLeave.AzureEmployeeId ?? selectedLeave.azureEmployeeID ?? "—"],
                                    ["Leave Type", getLeaveTypeName(selectedLeave.leaveTypeId) || "—"],
                                    ["From Date", formatDate(selectedLeave.fromDate)],
                                    ["To Date", formatDate(selectedLeave.toDate)],
                                ].map(([label, value]) => (
                                    <Box key={label} sx={{ minWidth: 0, minHeight: 68, display: "flex", flexDirection: "column", justifyContent: "center", gap: 0.5, px: 1.75, py: 1.25, border: "1px solid #dce7f5", borderRadius: "11px", background: "linear-gradient(120deg, #f3f7fc, #f8fbff)" }}>
                                        <Typography sx={{ color: "#6880a3", fontSize: 11, fontWeight: 650 }}>{label}</Typography>
                                        <Typography sx={{ overflowWrap: "anywhere", color: "#11294d", fontSize: 14, fontWeight: 700 }}>{value}</Typography>
                                    </Box>
                                ))}
                            </Box>

                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2.25 }}>
                                <Chip size="small" label={`Working days: ${approvalDateInfo.filter(x => !x.weekOff).length}`} sx={{ bgcolor: "#f1f5fa", color: "#526781", fontWeight: 650 }} />
                                <Chip size="small" label={`Selected: ${approvalDates.length}`} sx={{ bgcolor: "#e5f6eb", color: "#16804b", fontWeight: 650 }} />
                                <Chip size="small" label={`Week off: ${approvalDateInfo.filter(x => x.weekOff).length}`} sx={{ bgcolor: "#eef4ff", color: "#42699f", fontWeight: 650 }} />
                                <Chip size="small" label={`Not approved: ${approvalDateInfo.filter(x => !x.weekOff).length - approvalDates.length}`} sx={{ bgcolor: "#fff3e5", color: "#a75a13", fontWeight: 650 }} />
                            </Box>

                            <Divider sx={{ mb: 2, borderColor: "#e8edf4" }} />
                            <Box sx={{ display: "flex", alignItems: { xs: "flex-start", sm: "center" }, justifyContent: "space-between", gap: 1, mb: 1.25, flexDirection: { xs: "column", sm: "row" } }}>
                                <Box>
                                    <Typography sx={{ color: "#1e3557", fontSize: 14, fontWeight: 700 }}>Select days to approve</Typography>
                                    <Typography sx={{ mt: 0.25, color: "#7889a0", fontSize: 11 }}>Week-off days are excluded automatically.</Typography>
                                </Box>
                                <Box sx={{ display: "flex", gap: 0.5 }}>
                                    <Button size="small" onClick={selectAllWorkingDates} sx={{ textTransform: "none", fontWeight: 650 }}>Select all</Button>
                                    <Button size="small" onClick={clearAllWorkingDates} sx={{ textTransform: "none", color: "#687b95" }}>Clear</Button>
                                </Box>
                            </Box>

                            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", alignItems: "stretch", gap: 1, maxHeight: 260, overflowY: "auto", p: 0.25 }}>
                                {approvalDateInfo.map(item => (
                                    <Box key={item.dateKey} sx={{ minHeight: 46, display: "flex", alignItems: "center", justifyContent: "space-between", border: item.weekOff ? "1px solid #dce7f5" : approvalDates.includes(item.dateKey) ? "1px solid #a9c5f4" : "1px solid #e5ebf3", borderRadius: "9px", px: 1.25, py: 0.4, bgcolor: item.weekOff ? "#f7f9fc" : approvalDates.includes(item.dateKey) ? "#f1f6ff" : "#fff", transition: "all .15s ease" }}>
                                        {item.weekOff ? (
                                            <>
                                                <Typography sx={{ fontSize: 12, fontWeight: 650, color: "#65768d" }}>{formatDateKey(item.dateKey)}</Typography>
                                                <Chip size="small" label="Week off" sx={{ height: 22, bgcolor: "#edf2f7", color: "#687b92", fontSize: 10, fontWeight: 650 }} />
                                            </>
                                        ) : (
                                            <FormControlLabel
                                                sx={{ m: 0, width: "100%", ".MuiFormControlLabel-label": { flex: 1 } }}
                                                control={<Checkbox size="small" checked={approvalDates.includes(item.dateKey)} onChange={() => toggleApprovalDate(item.dateKey)} sx={{ color: "#a8b6c9", "&.Mui-checked": { color: "#3478f6" } }} />}
                                                label={<Typography sx={{ color: "#304866", fontSize: 12, fontWeight: 650 }}>{formatDateKey(item.dateKey)}</Typography>}
                                            />
                                        )}
                                    </Box>
                                ))}
                            </Box>

                            <TextField fullWidth multiline minRows={3} label="Manager Comment" required value={managerComment} onChange={e => setManagerComment(e.target.value)} placeholder="Add a note for the employee" sx={{ mt: 2, "& .MuiOutlinedInput-root": { borderRadius: "10px", bgcolor: "#fff" }, "& .MuiInputLabel-root": { color: "#687b95" } }} />
                        </>
                    )}
                </DialogContent>

                <DialogActions sx={{ px: { xs: 2, sm: 3 }, py: 2, borderTop: "1px solid #e8edf4", bgcolor: "#fbfcfe", gap: 1 }}>
                    <Button variant="outlined" onClick={closePartialApprovalDialog} disabled={approvalSubmitting} sx={{ px: 2, borderColor: "#d6e0ed", borderRadius: "8px", color: "#526781", textTransform: "none" }}>Cancel</Button>
                    <Button variant="contained" disableElevation onClick={updateStatus} disabled={approvalSubmitting || approvalDates.length === 0} sx={{ px: 2.25, borderRadius: "8px", bgcolor: "#16804b", fontWeight: 700, textTransform: "none", "&:hover": { bgcolor: "#116b3e" } }}>
                        {approvalSubmitting ? "Approving..." : `Approve ${approvalDates.length} day${approvalDates.length === 1 ? "" : "s"}`}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ==================================================
                VIEW LEAVE DETAILS POPUP
            ================================================== */}

            {viewLeave && (
                <Dialog open onClose={closeViewLeave} fullWidth maxWidth="md" className="leave-details-dialog">
                    <MuiLayoutBox className="leave-details-dialog-paper" component="div">

                        {/* Header */}

                        <MuiLayoutBox className="leave-modal-header" component="div">
                            <MuiLayoutBox className="leave-details-title" component="div">
                                <MuiLayoutBox className="leave-details-title-icon" component="span"><BeachAccessRounded /></MuiLayoutBox>
                                <MuiLayoutBox component="div">
                                    <MuiText component="h2" variant="h5">Leave Request Details</MuiText>
                                    <MuiText component="p" variant="body2">Review the employee’s leave information</MuiText>
                                </MuiLayoutBox>
                            </MuiLayoutBox>

                        </MuiLayoutBox>


                        {/* Body */}

                        <MuiLayoutBox className="leave-modal-body" component="div">

                            <MuiLayoutBox className="leave-details-grid" component="div">
                                <MuiLayoutBox className="leave-detail-item" component="div">
                                        <MuiText component="span" variant="inherit">Azure Employee ID</MuiText>
                                        <MuiText component="strong" variant="inherit">{viewLeave.azureEmployeeId ?? viewLeave.AzureEmployeeId ?? viewLeave.azureEmployeeID ?? "—"}</MuiText>
                                </MuiLayoutBox>
                                <MuiLayoutBox className="leave-detail-item" component="div">
                                        <MuiText component="span" variant="inherit">Leave Type</MuiText>
                                        <MuiText component="strong" variant="inherit">{getLeaveTypeName(viewLeave.leaveTypeId) || "—"}</MuiText>
                                </MuiLayoutBox>
                                <MuiLayoutBox className="leave-detail-item" component="div">
                                        <MuiText component="span" variant="inherit">From Date</MuiText>
                                        <MuiText component="strong" variant="inherit">{formatDate(viewLeave.fromDate)}</MuiText>
                                </MuiLayoutBox>
                                <MuiLayoutBox className="leave-detail-item" component="div">
                                        <MuiText component="span" variant="inherit">To Date</MuiText>
                                        <MuiText component="strong" variant="inherit">{formatDate(viewLeave.toDate)}</MuiText>
                                </MuiLayoutBox>
                                <MuiLayoutBox className="leave-detail-item" component="div">
                                        <MuiText component="span" variant="inherit">Number of Days</MuiText>
                                        <MuiText component="strong" variant="inherit">{calculateDays(viewLeave.fromDate, viewLeave.toDate, viewLeave.employeeId)} {calculateDays(viewLeave.fromDate, viewLeave.toDate, viewLeave.employeeId) === 1 ? "day" : "days"}</MuiText>
                                </MuiLayoutBox>
                                <MuiLayoutBox className="leave-detail-item" component="div">
                                        <MuiText component="span" variant="inherit">Status</MuiText>
                                        <MuiText component="strong" variant="inherit">{viewLeave.status || "Unknown"}</MuiText>
                                </MuiLayoutBox>
                            </MuiLayoutBox>


                            <MuiLayoutBox className="leave-detail-notes-grid" component="div">
                            {/* Reason */}

                            <MuiLayoutBox className="leave-detail-section" component="div">
                                <MuiLayoutBox className="leave-note-heading" component="div">
                                    <MuiText component="span" variant="inherit">Reason</MuiText>
                                </MuiLayoutBox>

                                <MuiText component="p" variant="body1">
                                    {
                                        viewLeave.reason ||
                                        "-"
                                    }
                                </MuiText>

                            </MuiLayoutBox>


                            {/* Manager Comment */}

                            <MuiLayoutBox className="leave-detail-section" component="div">
                                <MuiLayoutBox className="leave-note-heading" component="div">
                                    <MuiText component="span" variant="inherit">Manager Comment</MuiText>
                                </MuiLayoutBox>

                                <MuiText component="p" variant="body1">
                                    {
                                        viewLeave.managerComment ||
                                        "-"
                                    }
                                </MuiText>

                            </MuiLayoutBox>

                            </MuiLayoutBox>

{/* Supporting Document - show only when a document exists */}
{(viewDocumentLoading || viewDocumentUrl || viewDocumentError) && (
    <MuiLayoutBox
        className="leave-detail-section"
     component="div">
        <MuiLayoutBox className="leave-note-heading" component="div">
            <MuiText component="span" variant="inherit">Supporting Document</MuiText>
        </MuiLayoutBox>

        {viewDocumentLoading ? (
            <Typography
                variant="body2"
                color="text.secondary"
            >
                {viewDocumentLoading ? "Loading document..." : viewDocumentError}
            </Typography>
        ) : viewDocumentUrl ? (
            <Button
                variant="outlined"
                component="a"
                href={viewDocumentUrl}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                    textTransform: "none",
                    borderRadius: "8px",
                    fontWeight: 600
                }}
                startIcon={<AttachFileRounded />}
            >
                View Document
            </Button>
        ) : null}
    </MuiLayoutBox>
)}

{/* Approval / Rejection Information */}

{viewLeave.status !== "Pending" && (

    <MuiLayoutBox className="leave-details-grid approval-details" component="div">

        <MuiLayoutBox className="leave-detail-item" component="div">

            <MuiText component="span" variant="inherit">
                {viewLeave.status === "Rejected"
                    ? "Rejected By"
                    : "Approved By"}
            </MuiText>

            <MuiText component="strong" variant="inherit">
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
            </MuiText>

        </MuiLayoutBox>


        <MuiLayoutBox className="leave-detail-item" component="div">

            <MuiText component="span" variant="inherit">
                {viewLeave.status === "Rejected"
                    ? "Rejected Date"
                    : "Approved Date"}
            </MuiText>

            <MuiText component="strong" variant="inherit">
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
            </MuiText>

        </MuiLayoutBox>

    </MuiLayoutBox>

)}

                        </MuiLayoutBox>


                        {/* Footer */}

                        <MuiLayoutBox className="leave-modal-actions" component="div">

                            <Button variant="contained" disableElevation onClick={closeViewLeave}>Close</Button>

                        </MuiLayoutBox>

                    </MuiLayoutBox>
                </Dialog>
            )}

            <Snackbar open={feedback.open} autoHideDuration={4500} onClose={() => setFeedback((current) => ({ ...current, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
                <Alert severity={feedback.severity} variant="filled" onClose={() => setFeedback((current) => ({ ...current, open: false }))} sx={{ width: "100%" }}>
                    {feedback.message}
                </Alert>
            </Snackbar>

        </MuiLayoutBox>
    );
}
