import { useEffect, useState } from "react";
import axios from "axios";
import "./LeaveTakenHistory.css";
import { useAuth } from "../../../context/AuthContext";
import { loadXlsx } from "../../../utils/exportLibraries";
import {
    Alert,
    Box,
    Button,
    IconButton,
    InputAdornment,
    Paper,
    Snackbar,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import { ArrowBackRounded, FileDownloadOutlined, RefreshRounded, SearchRounded, CloseRounded } from "@mui/icons-material";

const LEAVE_API =
    `${import.meta.env.VITE_LEAVE_API_BASE_URL}/api/Leave`;

const LEAVE_TYPE_API =
    `${import.meta.env.VITE_LEAVE_API_BASE_URL}/api/LeaveType`;
const EMPLOYEE_API =
    `${import.meta.env.VITE_EMPLOYEE_API_BASE_URL}/api/Employee`;

export default function LeaveTakenHistory() {

    const { hasPermission } = useAuth();

    const permissionRoute = "/leave/history";
    const canView = hasPermission(permissionRoute, "view");
    const canExport = hasPermission(permissionRoute, "export");

    const [leaves, setLeaves] = useState([]);
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [notice, setNotice] = useState({ open: false, message: "", severity: "success" });
    const [loading, setLoading] = useState(false);

    // Employee Search
    const [employeeSearch, setEmployeeSearch] = useState("");

    // ==========================================
    // Load Data
    // ==========================================

    useEffect(() => {
        loadLeaves();
        loadLeaveTypes();
        loadEmployees();
    }, []);


    // ==========================================
    // Load Leave Requests
    // ==========================================

    async function loadLeaves() {
        setLoading(true);
        try {
            const response = await axios.get(LEAVE_API);
            setLeaves(Array.isArray(response.data) ? response.data : []);
        }
        catch (error) {
            console.error("Leave History Error:", error);
            setNotice({ open: true, message: "Could not load leave history. Please try again.", severity: "error" });
        } finally {
            setLoading(false);
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
            setNotice({ open: true, message: "Could not load leave types.", severity: "error" });
        }
    }

    async function loadEmployees() {
        try {
            const response = await axios.get(EMPLOYEE_API);
            setEmployees(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Employee Directory Error:", error);
            setNotice({ open: true, message: "Could not load employee Azure IDs.", severity: "error" });
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

    function getAzureEmployeeId(leave) {
        const directAzureId =
            leave.azureEmployeeId ??
            leave.AzureEmployeeId ??
            leave.azureEmployeeID;

        if (directAzureId !== null && directAzureId !== undefined && directAzureId !== "") {
            return directAzureId;
        }

        const employee = employees.find((item) =>
            String(item.employeeId ?? item.EmployeeId ?? item.id ?? "") ===
            String(leave.employeeId ?? leave.EmployeeId ?? "")
        );

        return employee?.azureEmployeeId ?? employee?.AzureEmployeeId ?? employee?.azureEmployeeID ?? "-";
    }

    function getLeaveTakerName(leave) {
        const directName =
            leave.employeeName ??
            leave.EmployeeName ??
            leave.employeeFullName ??
            leave.EmployeeFullName;

        if (directName) return directName;

        const employee = employees.find((item) =>
            String(item.employeeId ?? item.EmployeeId ?? item.id ?? item.Id ?? "") ===
            String(leave.employeeId ?? leave.EmployeeId ?? "")
        );

        const name = employee?.employeeName ?? employee?.EmployeeName ?? employee?.fullName ?? employee?.FullName;
        if (name) return name;

        return [employee?.firstName ?? employee?.FirstName, employee?.lastName ?? employee?.LastName]
            .filter(Boolean)
            .join(" ") || "-";
    }

    function getApproverAzureEmployeeId(leave) {
        const directAzureId =
            leave.approvedByAzureEmployeeId ??
            leave.ApprovedByAzureEmployeeId ??
            leave.approvedByAzureId ??
            leave.ApprovedByAzureId;

        if (directAzureId !== null && directAzureId !== undefined && directAzureId !== "") {
            return directAzureId;
        }

        const approver =
            leave.approvedByEmployeeId ??
            leave.ApprovedByEmployeeId ??
            leave.approvedBy ??
            leave.ApprovedBy;
        const approverEmployeeId = approver && typeof approver === "object"
            ? approver.employeeId ?? approver.EmployeeId ?? approver.id ?? approver.Id
            : approver;

        if (approverEmployeeId === null || approverEmployeeId === undefined || approverEmployeeId === "") {
            return "-";
        }

        const employee = employees.find((item) =>
            String(item.employeeId ?? item.EmployeeId ?? item.id ?? item.Id ?? "") ===
            String(approverEmployeeId)
        );

        return employee?.azureEmployeeId ?? employee?.AzureEmployeeId ?? employee?.azureEmployeeID ?? "-";
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

            getLeaveTakerName(leave)
                ?.toString()
                .toLowerCase()
                .includes(searchValue) ||

            leave.employeeId
                ?.toString()
                .toLowerCase()
                .includes(searchValue) ||

            getAzureEmployeeId(leave)
                ?.toString()
                .toLowerCase()
                .includes(searchValue);

        return isApproved && matchesEmployee;
    });


    // ==========================================
    // Export Excel
    // ==========================================

    const handleExport = async () => {

        if (!canExport) return;

        const XLSX = await loadXlsx();
        const exportData = approvedLeaves.map((leave) => ({

            "Employee Name":
                getLeaveTakerName(leave),

            "Azure Employee ID":
                getAzureEmployeeId(leave),

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

            "Approved By (Azure Employee ID)":
                getApproverAzureEmployeeId(leave)

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
        setNotice({ open: true, message: "Leave history exported successfully.", severity: "success" });
    };


    if (!canView) {
        return (
            <Box
                className="leave-history-page"
                sx={{ py: 8, textAlign: "center" }}
                component="div"
            >
                <Typography component="h2" variant="h5">Access Denied</Typography>
                <Typography component="p" variant="body1">You do not have permission to access this page.</Typography>
            </Box>
        );
    }

    return (

        <Box className="leave-history-page" component="main">

            {/* Header */}

            <Paper className="leave-history-header" elevation={0} component="header">
                <Stack direction="row" alignItems="center" spacing={1.5} className="leave-history-heading">
                    <Tooltip title="Go back">
                        <IconButton className="leave-history-back" onClick={() => window.history.back()} aria-label="Go back">
                            <ArrowBackRounded />
                        </IconButton>
                    </Tooltip>
                    <Box>
                        <Typography component="h1" variant="h4">Leave Taken History</Typography>
                        <Typography component="p" variant="body1">View approved employee leave history.</Typography>
                    </Box>
                </Stack>
                <Stack direction="row" spacing={1} className="leave-history-actions">
                    <Button
                        variant="outlined"
                        startIcon={<RefreshRounded />}
                        onClick={() => { loadLeaves(); loadLeaveTypes(); loadEmployees(); }}
                        disabled={loading}
                    >
                        Refresh
                    </Button>
                    {canExport && (
                        <Button variant="contained" startIcon={<FileDownloadOutlined />} onClick={handleExport}>
                            Export Excel
                        </Button>
                    )}
                </Stack>
            </Paper>


            {/* Employee Search */}

            <Paper className="leave-history-toolbar" elevation={0} component="section">
                <TextField
                    fullWidth
                    size="small"
                    value={employeeSearch}
                    onChange={(event) => setEmployeeSearch(event.target.value)}
                    placeholder="Search by employee name or Azure ID"
                    aria-label="Search leave history by employee name or Azure ID"
                    InputProps={{
                        startAdornment: <InputAdornment position="start"><SearchRounded color="action" /></InputAdornment>,
                        endAdornment: employeeSearch ? (
                            <InputAdornment position="end">
                                <IconButton size="small" aria-label="Clear search" onClick={() => setEmployeeSearch("")}>
                                    <CloseRounded fontSize="small" />
                                </IconButton>
                            </InputAdornment>
                        ) : null,
                    }}
                />
            </Paper>


            {/* Table */}

            <Paper className="leave-history-table-card" elevation={0} component="section">
                <Box className="leave-history-table-heading">
                    <Box>
                        <Typography component="h2" variant="h6">Approved Leave Records</Typography>
                        <Typography variant="body2">A record of approved employee leave.</Typography>
                    </Box>
                    <Typography className="leave-history-count" variant="body2">{approvedLeaves.length} {approvedLeaves.length === 1 ? "record" : "records"}</Typography>
                </Box>
                <Box className="leave-history-table-scroll">
                <table className="leave-history-table">

                    <thead>
                        <tr>

                            <th>Employee Name</th>

                            <th>Azure Employee ID</th>

                            <th>Leave Type</th>

                            <th>From Date</th>

                            <th>To Date</th>

                            <th>Days</th>

                            <th>Approved Date</th>

                            <th>Approved By (Azure ID)</th>

                        </tr>
                    </thead>


                    <tbody>

                        {approvedLeaves.length === 0 ? (

                            <tr>

                                <td
                                    colSpan={8}
                                    className="no-leave-history"
                                >
                                    {employeeSearch ? "No records match your search." : "No approved leave history found."}
                                </td>

                            </tr>

                        ) : (

                            approvedLeaves.map((leave) => (

                                <tr key={leave.leaveId}>

                                    <td>
                                        <Typography component="strong" variant="inherit">
                                            {getLeaveTakerName(leave)}
                                        </Typography>
                                    </td>

                                    {/* Azure Employee ID */}

                                    <td>

                                        <Typography className="azure-employee-id" component="span" variant="inherit">
                                            {getAzureEmployeeId(leave)}
                                        </Typography>

                                    </td>


                                    {/* Leave Type */}

                                    <td>

                                        <Typography component="strong" variant="inherit">
                                            {getLeaveTypeName(
                                                leave.leaveTypeId
                                            )}
                                        </Typography>

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
                                        {getApproverAzureEmployeeId(leave)}
                                    </td>

                                </tr>

                            ))

                        )}

                    </tbody>

                </table>
                </Box>

            </Paper>

            <Snackbar open={notice.open} autoHideDuration={4500} onClose={() => setNotice((current) => ({ ...current, open: false }))}>
                <Alert severity={notice.severity} variant="filled" onClose={() => setNotice((current) => ({ ...current, open: false }))}>
                    {notice.message}
                </Alert>
            </Snackbar>

        </Box>
    );
}
