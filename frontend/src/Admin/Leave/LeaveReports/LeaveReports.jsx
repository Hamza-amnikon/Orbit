import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
    Box,
    Button,
    Card,
    CardContent,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RefreshIcon from "@mui/icons-material/Refresh";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import SearchIcon from "@mui/icons-material/Search";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import "./LeaveReports.css";

const LEAVE_API = "https://localhost:7206/api/Leave";
const LEAVE_TYPE_API = "https://localhost:7206/api/LeaveType";
const EMPLOYEE_API = "https://localhost:7002/api/Employee";

const EMPTY_FILTERS = {
    employeeId: "ALL",
    departmentId: "ALL",
    leaveTypeId: "ALL",
    status: "ALL",
    fromDate: "",
    toDate: "",
};

export default function LeaveReports() {
    const [leaveData, setLeaveData] = useState([]);
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Employee Wise is the default and keeps the existing report behavior.
    const [reportType, setReportType] = useState("employeeWise");

    const [filters, setFilters] = useState({ ...EMPTY_FILTERS });

    const [appliedFilters, setAppliedFilters] = useState({ ...EMPTY_FILTERS });

    // Used only to force native date fields to remount after Reset.
    const [resetVersion, setResetVersion] = useState(0);

    const loadLeaveData = async () => {
        try {
            setLoading(true);
            setError("");

            const [leaveResponse, leaveTypeResponse, employeeResponse] =
                await Promise.all([
                    axios.get(LEAVE_API),
                    axios.get(LEAVE_TYPE_API),
                    axios.get(EMPLOYEE_API),
                ]);

            setLeaveData(
                Array.isArray(leaveResponse.data) ? leaveResponse.data : []
            );

            setLeaveTypes(
                Array.isArray(leaveTypeResponse.data)
                    ? leaveTypeResponse.data
                    : []
            );

            setEmployees(
                Array.isArray(employeeResponse.data)
                    ? employeeResponse.data
                    : []
            );
        } catch (err) {
            console.error("Failed to load leave report:", err);
            setError("Unable to load leave report data.");
            setLeaveData([]);
            setLeaveTypes([]);
            setEmployees([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadLeaveData();
    }, []);

    const handleReportTypeChange = (event) => {
        const value = event.target.value;

        setReportType(value);

        // Switching report type starts with a clean report-specific filter.
        const emptyFilters = { ...EMPTY_FILTERS };

        setFilters(emptyFilters);
        setAppliedFilters(emptyFilters);
        setResetVersion((prev) => prev + 1);
    };

    const handleFilterChange = (event) => {
        const { name, value } = event.target;

        setFilters((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleApplyFilters = () => {
        setAppliedFilters({ ...filters });
    };

    const handleReset = () => {
        const emptyFilters = { ...EMPTY_FILTERS };

        setFilters(emptyFilters);
        setAppliedFilters(emptyFilters);
        setResetVersion((prev) => prev + 1);
        setError("");
    };

    const calculateDays = (fromDate, toDate) => {
        if (!fromDate || !toDate) return 0;

        const start = new Date(fromDate);
        const end = new Date(toDate);

        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
            return 0;
        }

        const difference = Math.abs(end.getTime() - start.getTime());

        return Math.floor(difference / (1000 * 60 * 60 * 24)) + 1;
    };

    const formatDate = (value) => {
        if (!value) return "-";

        const date = new Date(value);

        return Number.isNaN(date.getTime())
            ? "-"
            : date.toLocaleDateString();
    };

    const employeeIds = useMemo(() => {
        return [
            ...new Set(
                leaveData
                    .map((item) => item.azureEmployeeId)
                    .filter(
                        (value) =>
                            value !== null &&
                            value !== undefined &&
                            value !== ""
                    )
            ),
        ];
    }, [leaveData]);

    const departments = useMemo(() => {
        const values = employees
            .map(
                (employee) =>
                    employee?.department ??
                    employee?.team ??
                    employee?.departmentName
            )
            .filter(
                (value) =>
                    value !== null &&
                    value !== undefined &&
                    String(value).trim() !== ""
            );

        return [...new Set(values.map((value) => String(value).trim()))].sort(
            (a, b) => a.localeCompare(b)
        );
    }, [employees]);

    const leaveTypeOptions = useMemo(() => {
        const options = leaveTypes
            .map((item) => ({
                id: item.leaveTypeId ?? item.id,
                name:
                    item.leaveTypeName ??
                    item.name ??
                    item.leaveType ??
                    `Leave Type ${item.leaveTypeId ?? item.id}`,
            }))
            .filter(
                (item) =>
                    item.id !== null &&
                    item.id !== undefined &&
                    item.id !== ""
            );

        // Keep the dropdown dynamic even if the LeaveType API returns
        // duplicate records.
        return Array.from(
            new Map(options.map((item) => [String(item.id), item])).values()
        );
    }, [leaveTypes]);

    const getLeaveTypeName = (leaveTypeId) => {
        if (
            leaveTypeId === null ||
            leaveTypeId === undefined ||
            leaveTypeId === ""
        ) {
            return "-";
        }

        const leaveType = leaveTypeOptions.find(
            (item) => String(item.id) === String(leaveTypeId)
        );

        return leaveType?.name || "-";
    };

    const getEmployeeRecord = (leaveItem) => {
        const leaveEmployeeId = leaveItem?.employeeId;
        const leaveAzureEmployeeId = leaveItem?.azureEmployeeId;

        return employees.find((employee) => {
            const employeeId = employee?.employeeId ?? employee?.id;
            const employeeCode =
                employee?.employeeCode ??
                employee?.azureEmployeeId ??
                employee?.azureId;

            return (
                (leaveEmployeeId !== null &&
                    leaveEmployeeId !== undefined &&
                    String(employeeId) === String(leaveEmployeeId)) ||
                (leaveAzureEmployeeId !== null &&
                    leaveAzureEmployeeId !== undefined &&
                    String(employeeCode) === String(leaveAzureEmployeeId))
            );
        });
    };

    const getTeamName = (leaveItem) => {
        const employee = getEmployeeRecord(leaveItem);

        return (
            employee?.department ??
            employee?.team ??
            employee?.departmentName ??
            "-"
        );
    };

    const filteredData = useMemo(() => {
        return leaveData.filter((item) => {
            const employeeMatch =
                reportType === "departmentWise" ||
                (appliedFilters.employeeId === "ALL" || !appliedFilters.employeeId) ||
                String(item.azureEmployeeId) ===
                String(appliedFilters.employeeId);

            const departmentMatch =
                reportType !== "departmentWise" ||
                (appliedFilters.departmentId === "ALL" || !appliedFilters.departmentId) ||
                String(getTeamName(item)).toLowerCase() ===
                String(appliedFilters.departmentId).toLowerCase();

            const leaveTypeMatch =
                (appliedFilters.leaveTypeId === "ALL" || !appliedFilters.leaveTypeId) ||
                String(item.leaveTypeId) ===
                String(appliedFilters.leaveTypeId);

            const statusMatch =
                (appliedFilters.status === "ALL" || !appliedFilters.status) ||
                String(item.status || "").toLowerCase() ===
                String(appliedFilters.status).toLowerCase();

            const itemFromDate = item.fromDate
                ? String(item.fromDate).substring(0, 10)
                : "";

            const itemToDate = item.toDate
                ? String(item.toDate).substring(0, 10)
                : "";

            const fromDateMatch =
                !appliedFilters.fromDate ||
                (itemFromDate &&
                    itemFromDate >= appliedFilters.fromDate);

            const toDateMatch =
                !appliedFilters.toDate ||
                (itemToDate && itemToDate <= appliedFilters.toDate);

            return (
                employeeMatch &&
                departmentMatch &&
                leaveTypeMatch &&
                statusMatch &&
                fromDateMatch &&
                toDateMatch
            );
        });
    }, [leaveData, appliedFilters, reportType, employees]);

    const summary = useMemo(() => {
        return filteredData.reduce(
            (result, item) => {
                const days = calculateDays(
                    item.fromDate,
                    item.toDate
                );

                result.totalDays += days;

                const status = String(
                    item.status || ""
                ).toLowerCase();

                if (status === "approved") {
                    result.approvedDays += days;
                } else if (status === "pending") {
                    result.pendingDays += days;
                } else if (status === "rejected") {
                    result.rejectedDays += days;
                }

                return result;
            },
            {
                totalDays: 0,
                approvedDays: 0,
                pendingDays: 0,
                rejectedDays: 0,
            }
        );
    }, [filteredData]);

    const departmentSummary = useMemo(() => {
        const grouped = new Map();

        filteredData.forEach((item) => {
            const department = getTeamName(item) || "Unassigned";
            const key = String(department);

            if (!grouped.has(key)) {
                grouped.set(key, {
                    department: key,
                    employees: new Set(),
                    requests: 0,
                    leaveDays: 0,
                    approved: 0,
                    pending: 0,
                    rejected: 0,
                });
            }

            const row = grouped.get(key);
            const days = calculateDays(item.fromDate, item.toDate);
            const status = String(item.status || "").toLowerCase();

            const employeeKey =
                item.azureEmployeeId ??
                item.employeeId ??
                item.employeeName ??
                item.leaveId;

            row.employees.add(String(employeeKey));
            row.requests += 1;
            row.leaveDays += days;

            if (status === "approved") {
                row.approved += days;
            } else if (status === "pending") {
                row.pending += days;
            } else if (status === "rejected") {
                row.rejected += days;
            }
        });

        return Array.from(grouped.values())
            .map((row) => ({
                department: row.department,
                employees: row.employees.size,
                requests: row.requests,
                leaveDays: row.leaveDays,
                approved: row.approved,
                pending: row.pending,
                rejected: row.rejected,
            }))
            .sort((a, b) => {
                if (b.leaveDays !== a.leaveDays) {
                    return b.leaveDays - a.leaveDays;
                }

                return a.department.localeCompare(b.department);
            });
    }, [filteredData, employees]);

    const getStatusColor = (status) => {
        switch (String(status || "").toLowerCase()) {
            case "approved":
                return "success";
            case "pending":
                return "warning";
            case "rejected":
                return "error";
            default:
                return "default";
        }
    };

    const handlePrevious = () => {
        window.history.back();
    };

    const handleRefresh = () => {
        loadLeaveData();
    };

    const getExportRows = () => {
        return filteredData.map((item) => ({
            Employee: `${item.azureEmployeeId || "-"} - ${item.employeeName || "-"
                }`,
            "Leave Type": getLeaveTypeName(item.leaveTypeId),
            "From Date": formatDate(item.fromDate),
            "To Date": formatDate(item.toDate),
            Days: calculateDays(item.fromDate, item.toDate),
            Reason: item.reason || "-",
            Status: item.status || "-",
            "Applied Date": formatDate(item.appliedDate),
        }));
    };

    const handleExportExcel = () => {
        if (!filteredData.length) return;

        const worksheet = XLSX.utils.json_to_sheet(
            getExportRows()
        );

        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            "Leave Report"
        );

        if (reportType === "departmentWise") {
            const departmentWorksheet = XLSX.utils.json_to_sheet(
                departmentSummary.map((row) => ({
                    Department: row.department,
                    "Employees on Leave": row.employees,
                    "Leave Requests": row.requests,
                    "Leave Days": row.leaveDays,
                    Approved: row.approved,
                    Pending: row.pending,
                    Rejected: row.rejected,
                }))
            );

            XLSX.utils.book_append_sheet(
                workbook,
                departmentWorksheet,
                "Department Report"
            );
        }

        XLSX.writeFile(
            workbook,
            reportType === "departmentWise"
                ? "Department_Leave_Report.xlsx"
                : "Employee_Leave_Report.xlsx"
        );
    };

    const handleExportPDF = () => {
        if (!filteredData.length) return;

        const doc = new jsPDF("landscape");

        doc.setFontSize(16);
        doc.text(
            reportType === "departmentWise"
                ? "Department-wise Leave Report"
                : "Leave Report",
            14,
            16
        );

        doc.setFontSize(9);
        doc.text(
            `Total Days: ${summary.totalDays} | Approved: ${summary.approvedDays} | Pending: ${summary.pendingDays} | Rejected: ${summary.rejectedDays}`,
            14,
            23
        );

        // Always show a real report period in the PDF.
        // If the user selected From/To dates, use those.
        // Otherwise derive the period from the records included in the report.
        const reportDates = filteredData
            .flatMap((item) => [item.fromDate, item.toDate])
            .filter(Boolean)
            .map((value) => String(value).substring(0, 10))
            .sort();

        const reportFromDate = appliedFilters.fromDate
            ? formatDate(appliedFilters.fromDate)
            : reportDates.length
                ? formatDate(reportDates[0])
                : "-";

        const reportToDate = appliedFilters.toDate
            ? formatDate(appliedFilters.toDate)
            : reportDates.length
                ? formatDate(reportDates[reportDates.length - 1])
                : "-";

        doc.setFontSize(9);
        doc.text(
            `Report Period: ${reportFromDate} - ${reportToDate}`,
            14,
            29
        );

        if (reportType === "departmentWise") {
            autoTable(doc, {
                startY: 36,
                head: [[
                    "Department",
                    "Employees on Leave",
                    "Leave Requests",
                    "Leave Days",
                    "Approved",
                    "Pending",
                    "Rejected",
                ]],
                body: departmentSummary.map((row) => [
                    row.department,
                    row.employees,
                    row.requests,
                    row.leaveDays,
                    row.approved,
                    row.pending,
                    row.rejected,
                ]),
                theme: "grid",
                styles: {
                    fontSize: 8,
                    cellPadding: 3,
                },
                headStyles: {
                    fontSize: 8,
                },
            });

            doc.save("Department_Leave_Report.pdf");
            return;
        }

        const rows = filteredData.map((item) => [
            `${item.azureEmployeeId || "-"}\n${item.employeeName || "-"}`,
            getLeaveTypeName(item.leaveTypeId),
            formatDate(item.fromDate),
            formatDate(item.toDate),
            calculateDays(item.fromDate, item.toDate),
            item.reason || "-",
            item.status || "-",
            formatDate(item.appliedDate),
        ]);

        autoTable(doc, {
            startY: 36,
            head: [[
                "Employee",
                "Leave Type",
                "From Date",
                "To Date",
                "Days",
                "Reason",
                "Status",
                "Applied Date",
            ]],
            body: rows,
            theme: "grid",
            styles: {
                fontSize: 8,
                cellPadding: 3,
            },
            headStyles: {
                fontSize: 8,
            },
        });

        doc.save("Employee_Leave_Report.pdf");
    };

    return (
        <Box className="leave-reports-page">
            <Card className="leave-reports-header-card">
                <Box className="leave-reports-header">
                    <Box>
                        <Typography
                            variant="h4"
                            className="leave-reports-title"
                        >
                            Leave Reports
                        </Typography>

                        <Typography className="leave-reports-subtitle">
                            View and analyze employee leave records.
                        </Typography>
                    </Box>

                    <Stack
                        direction="row"
                        spacing={1}
                        className="leave-reports-header-actions"
                    >
                        <Button
                            variant="outlined"
                            startIcon={<ArrowBackIcon />}
                            onClick={handlePrevious}
                        >
                            Previous
                        </Button>

                        <Button
                            variant="outlined"
                            startIcon={<RefreshIcon />}
                            onClick={handleRefresh}
                        >
                            Refresh
                        </Button>

                        <Button
                            variant="contained"
                            startIcon={<FileDownloadIcon />}
                            onClick={handleExportExcel}
                            disabled={!filteredData.length}
                        >
                            Export Excel
                        </Button>

                        <Button
                            variant="contained"
                            startIcon={<PictureAsPdfIcon />}
                            onClick={handleExportPDF}
                            disabled={!filteredData.length}
                        >
                            Export PDF
                        </Button>
                    </Stack>
                </Box>
            </Card>

            <Card className="leave-reports-filter-card">
                <CardContent>
                    <Box className="leave-report-filter-heading">
                        <Typography
                            variant="h6"
                            className="leave-report-section-title"
                        >
                            Report Filters
                        </Typography>

                        <FormControl
                            className="leave-report-type-control"
                            size="small"
                        >
                            <InputLabel>Report Type</InputLabel>
                            <Select
                                value={reportType}
                                label="Report Type"
                                onChange={handleReportTypeChange}
                            >
                                <MenuItem value="employeeWise">
                                    Employee Wise
                                </MenuItem>
                                <MenuItem value="departmentWise">
                                    Department Wise
                                </MenuItem>
                            </Select>
                        </FormControl>
                    </Box>

                    <Box className="leave-report-divider" />

                    <Grid
                        container
                        spacing={2}
                        className="leave-report-filter-grid"
                    >
                        <Grid item xs={12} sm={6} md={4} lg={2.4}>
                            <FormControl fullWidth>
                                <InputLabel>
                                    {reportType === "departmentWise"
                                        ? "Department"
                                        : "Employee ID"}
                                </InputLabel>

                                <Select
                                    name={
                                        reportType === "departmentWise"
                                            ? "departmentId"
                                            : "employeeId"
                                    }
                                    value={
                                        reportType === "departmentWise"
                                            ? filters.departmentId
                                            : filters.employeeId
                                    }
                                    label={
                                        reportType === "departmentWise"
                                            ? "Department"
                                            : "Employee ID"
                                    }
                                    onChange={handleFilterChange}
                                >
                                    <MenuItem value="ALL">
                                        {reportType === "departmentWise"
                                            ? "All Departments"
                                            : "All Employees"}
                                    </MenuItem>

                                    {reportType === "departmentWise"
                                        ? departments.map((department) => (
                                            <MenuItem
                                                key={department}
                                                value={department}
                                            >
                                                {department}
                                            </MenuItem>
                                        ))
                                        : employeeIds.map((id) => (
                                            <MenuItem key={id} value={id}>
                                                {id}
                                            </MenuItem>
                                        ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6} md={4} lg={2.4}>
                            <FormControl fullWidth>
                                <InputLabel>Leave Type</InputLabel>

                                <Select
                                    name="leaveTypeId"
                                    value={filters.leaveTypeId}
                                    label="Leave Type"
                                    onChange={handleFilterChange}
                                >
                                    <MenuItem value="ALL">
                                        All Leave Types
                                    </MenuItem>

                                    {leaveTypeOptions.map((leaveType) => (
                                        <MenuItem
                                            key={leaveType.id}
                                            value={leaveType.id}
                                        >
                                            {leaveType.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6} md={4} lg={2.4}>
                            <FormControl fullWidth>
                                <InputLabel>Status</InputLabel>

                                <Select
                                    name="status"
                                    value={filters.status}
                                    label="Status"
                                    onChange={handleFilterChange}
                                >
                                    <MenuItem value="ALL">
                                        All Status
                                    </MenuItem>
                                    <MenuItem value="Approved">
                                        Approved
                                    </MenuItem>
                                    <MenuItem value="Pending">
                                        Pending
                                    </MenuItem>
                                    <MenuItem value="Rejected">
                                        Rejected
                                    </MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6} md={4} lg={2.4}>
                            <TextField
                                key={`from-date-${resetVersion}`}
                                fullWidth
                                label="From Date"
                                type="date"
                                name="fromDate"
                                value={filters.fromDate}
                                onChange={handleFilterChange}
                                InputLabelProps={{ shrink: true }}
                                className="report-date-field"
                            />
                        </Grid>

                        <Grid item xs={12} sm={6} md={4} lg={2.4}>
                            <TextField
                                key={`to-date-${resetVersion}`}
                                fullWidth
                                label="To Date"
                                type="date"
                                name="toDate"
                                value={filters.toDate}
                                onChange={handleFilterChange}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                    </Grid>

                    <Stack
                        direction="row"
                        spacing={1}
                        className="leave-report-filter-actions"
                    >
                        <Button
                            variant="outlined"
                            startIcon={<RestartAltIcon />}
                            onClick={handleReset}
                        >
                            Reset
                        </Button>

                        <Button
                            variant="contained"
                            startIcon={<SearchIcon />}
                            onClick={handleApplyFilters}
                        >
                            Apply Filters
                        </Button>
                    </Stack>
                </CardContent>
            </Card>

            <Grid
                container
                spacing={2}
                className="leave-report-summary-grid"
            >
                <Grid item xs={12} sm={6} md={3}>
                    <Card className="leave-summary-card total-card">
                        <CardContent>
                            <Typography className="summary-label">
                                Total Leave Days
                            </Typography>

                            <Typography className="summary-value">
                                {summary.totalDays}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card className="leave-summary-card approved-card">
                        <CardContent>
                            <Typography className="summary-label">
                                Approved
                            </Typography>

                            <Typography className="summary-value">
                                {summary.approvedDays}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card className="leave-summary-card pending-card">
                        <CardContent>
                            <Typography className="summary-label">
                                Pending
                            </Typography>

                            <Typography className="summary-value">
                                {summary.pendingDays}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card className="leave-summary-card rejected-card">
                        <CardContent>
                            <Typography className="summary-label">
                                Rejected
                            </Typography>

                            <Typography className="summary-value">
                                {summary.rejectedDays}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {reportType === "departmentWise" && (
                <Card className="leave-report-table-card leave-department-summary-card">
                    <Box className="leave-report-table-header">
                        <Box>
                            <Typography
                                variant="h6"
                                className="leave-report-section-title"
                            >
                                Department-wise Leave Report
                            </Typography>

                            <Typography className="leave-report-table-description">
                                Leave activity grouped by department.
                            </Typography>
                        </Box>

                        <Typography className="report-record-count">
                            {departmentSummary.length} Departments
                        </Typography>
                    </Box>

                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Department</TableCell>
                                    <TableCell>Employees on Leave</TableCell>
                                    <TableCell>Leave Requests</TableCell>
                                    <TableCell>Leave Days</TableCell>
                                    <TableCell>Approved</TableCell>
                                    <TableCell>Pending</TableCell>
                                    <TableCell>Rejected</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center">
                                            <CircularProgress size={28} />
                                        </TableCell>
                                    </TableRow>
                                ) : departmentSummary.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center">
                                            No department leave records found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    departmentSummary.map((row) => (
                                        <TableRow key={row.department}>
                                            <TableCell>
                                                <Typography className="employee-name">
                                                    {row.department}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>{row.employees}</TableCell>
                                            <TableCell>{row.requests}</TableCell>
                                            <TableCell>{row.leaveDays}</TableCell>
                                            <TableCell>{row.approved}</TableCell>
                                            <TableCell>{row.pending}</TableCell>
                                            <TableCell>{row.rejected}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Card>
            )}

            {reportType === "employeeWise" && (
                <Card className="leave-report-table-card">
                    <Box className="leave-report-table-header">
                        <Box>
                            <Typography
                                variant="h6"
                                className="leave-report-section-title"
                            >
                                Leave Report
                            </Typography>

                            <Typography className="leave-report-table-description">
                                Detailed employee leave records.
                            </Typography>
                        </Box>

                        <Typography className="report-record-count">
                            {filteredData.length} Records
                        </Typography>
                    </Box>

                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Employee</TableCell>
                                    <TableCell>Leave Type</TableCell>
                                    <TableCell>From Date</TableCell>
                                    <TableCell>To Date</TableCell>
                                    <TableCell>Days</TableCell>
                                    <TableCell>Reason</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Applied Date</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center">
                                            <CircularProgress size={28} />
                                        </TableCell>
                                    </TableRow>
                                ) : error ? (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center">
                                            {error}
                                        </TableCell>
                                    </TableRow>
                                ) : filteredData.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center">
                                            No leave records found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredData.map((item) => (
                                        <TableRow key={item.leaveId}>
                                            <TableCell>
                                                <Typography className="employee-id">
                                                    {item.azureEmployeeId || "-"}
                                                </Typography>

                                                <Typography className="employee-name">
                                                    {item.employeeName || "-"}
                                                </Typography>
                                            </TableCell>

                                            <TableCell>
                                                {getLeaveTypeName(item.leaveTypeId)}
                                            </TableCell>

                                            <TableCell>
                                                {formatDate(item.fromDate)}
                                            </TableCell>

                                            <TableCell>
                                                {formatDate(item.toDate)}
                                            </TableCell>

                                            <TableCell>
                                                {calculateDays(
                                                    item.fromDate,
                                                    item.toDate
                                                )}
                                            </TableCell>

                                            <TableCell>
                                                {item.reason || "-"}
                                            </TableCell>

                                            <TableCell>
                                                <Chip
                                                    label={item.status || "-"}
                                                    color={getStatusColor(item.status)}
                                                    size="small"
                                                />
                                            </TableCell>

                                            <TableCell>
                                                {formatDate(item.appliedDate)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Card>
            )}

        </Box>
    );
}
