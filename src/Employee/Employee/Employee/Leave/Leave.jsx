import React, { useEffect, useMemo, useState } from "react";
import "./Leave.css";

import DashboardIcon from "@mui/icons-material/Dashboard";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import PeopleIcon from "@mui/icons-material/People";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Button,
    IconButton,
    Typography,
    Alert,
    CircularProgress,
} from "@mui/material";

import LeaveService from "./LeaveService";
import api from "../../../../services/api";

const Leave = () => {

    // =========================================================
    // STATE
    // =========================================================

    const [profile, setProfile] = useState(null);

    const [leaves, setLeaves] = useState([]);
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [leavePolicies, setLeavePolicies] = useState([]);
    const [leaveBalances, setLeaveBalances] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [period, setPeriod] = useState("This Month");

    // =========================================================
    // APPLY LEAVE DIALOG
    // =========================================================

    const [openLeaveDialog, setOpenLeaveDialog] =
        useState(false);

    const [submittingLeave, setSubmittingLeave] =
        useState(false);

    const [formError, setFormError] =
        useState("");

    const [leaveForm, setLeaveForm] = useState({
        leaveTypeId: "",
        fromDate: "",
        toDate: "",
        reason: "",
        document: null,
    });

    // =========================================================
    // LOAD DATA
    // =========================================================

    useEffect(() => {
        loadLeaveData();
    }, []);

    const loadLeaveData = async () => {

        try {

            setLoading(true);
            setError("");

            // =====================================================
            // 1. GET LOGGED-IN EMPLOYEE
            // =====================================================

            const profileResponse =
                await api.get("/Auth/profile");

            const employee =
                profileResponse.data;

            console.log(
                "Logged-in Employee Profile:",
                employee
            );

            if (!employee?.employeeId) {
                throw new Error(
                    "Logged-in employee ID was not found."
                );
            }

            const employeeId =
                Number(employee.employeeId);

            console.log(
                "Logged-in Employee ID:",
                employeeId
            );

            setProfile(employee);

            // =====================================================
            // 2. LOAD ALL DATA
            // =====================================================

            const [
                leaveResponse,
                balanceResponse,
                leaveTypeResponse,
                leavePolicyResponse,
            ] = await Promise.all([

                LeaveService.getLeaves(),

                LeaveService.getEmployeeLeaveBalances(
                    employeeId
                ),

                LeaveService.getLeaveTypes(),

                LeaveService.getLeavePolicies(),
            ]);

            // =====================================================
            // 3. NORMALIZE DATA
            // =====================================================

            const allLeaves =
                Array.isArray(leaveResponse)
                    ? leaveResponse
                    : [];

            const employeeBalances =
                Array.isArray(balanceResponse)
                    ? balanceResponse
                    : [];

            const allLeaveTypes =
                Array.isArray(leaveTypeResponse)
                    ? leaveTypeResponse
                    : [];

            const allLeavePolicies =
                Array.isArray(leavePolicyResponse)
                    ? leavePolicyResponse
                    : [];

            // =====================================================
            // 4. FILTER EMPLOYEE LEAVES
            // =====================================================

            const myLeaves =
                allLeaves.filter(
                    (leave) =>
                        Number(leave.employeeId) ===
                        employeeId
                );

            // =====================================================
            // 5. FILTER EMPLOYEE BALANCES
            // =====================================================

            const myBalances =
                employeeBalances.filter(
                    (balance) =>
                        Number(balance.employeeId) ===
                        employeeId
                );

            console.log(
                "All Leave Requests:",
                allLeaves
            );

            console.log(
                "My Leave Requests:",
                myLeaves
            );

            console.log(
                "My Leave Balances:",
                myBalances
            );

            console.log(
                "Leave Types:",
                allLeaveTypes
            );

            // =====================================================
            // 6. UPDATE STATE
            // =====================================================

            setLeaves(myLeaves);
            setLeaveBalances(myBalances);
            setLeaveTypes(allLeaveTypes);
            setLeavePolicies(allLeavePolicies);

        } catch (err) {

            console.error(
                "Leave Dashboard Error:",
                err
            );

            let message =
                "Unable to load leave data.";

            if (err?.response?.data) {

                if (
                    typeof err.response.data ===
                    "string"
                ) {
                    message =
                        err.response.data;

                } else if (
                    err.response.data.message
                ) {
                    message =
                        err.response.data.message;
                }
            }
            else if (err?.message) {
                message = err.message;
            }

            setError(message);

        } finally {

            setLoading(false);
        }
    };

    // =========================================================
    // LEAVE TYPE NAME
    // =========================================================

    const getLeaveTypeName = (leaveTypeId) => {

        const leaveType =
            leaveTypes.find(
                (type) =>
                    Number(type.leaveTypeId) ===
                    Number(leaveTypeId)
            );

        return (
            leaveType?.leaveTypeName ||
            "Unknown Leave"
        );
    };

    // =========================================================
    // CALCULATE DAYS
    // =========================================================

    const calculateDays = (
        fromDate,
        toDate
    ) => {

        if (!fromDate || !toDate) {
            return 0;
        }

        const from =
            new Date(fromDate);

        const to =
            new Date(toDate);

        if (
            isNaN(from.getTime()) ||
            isNaN(to.getTime())
        ) {
            return 0;
        }

        return (
            Math.floor(
                (
                    to.getTime() -
                    from.getTime()
                ) /
                (1000 * 60 * 60 * 24)
            ) + 1
        );
    };

    // =========================================================
    // FORMAT NUMBER
    // =========================================================

    const formatNumber = (value) => {

        const number =
            Number(value);

        if (Number.isNaN(number)) {
            return "0";
        }

        return number
            .toFixed(2)
            .replace(/\.00$/, "")
            .replace(/(\.\d)0$/, "$1");
    };

    // =========================================================
    // FORMAT DATE
    // =========================================================

    const formatDate = (date) => {

        if (!date) {
            return "-";
        }

        const parsedDate =
            new Date(date);

        if (
            isNaN(
                parsedDate.getTime()
            )
        ) {
            return "-";
        }

        return parsedDate.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };

    // =========================================================
    // STATUS
    // =========================================================

    const getStatusClass = (status) => {

        const value =
            String(status || "")
                .toLowerCase();

        if (value === "approved") {
            return "approved";
        }

        if (value === "pending") {
            return "pending";
        }

        if (value === "rejected") {
            return "rejected";
        }

        if (value === "cancelled") {
            return "cancelled";
        }

        return "";
    };

    // =========================================================
    // PERIOD FILTER
    // =========================================================

    const filteredLeaves = useMemo(() => {

        if (!Array.isArray(leaves)) {
            return [];
        }

        const now =
            new Date();

        if (period === "This Year") {

            return leaves.filter(
                (leave) => {

                    const date =
                        new Date(
                            leave.appliedDate
                        );

                    if (
                        isNaN(
                            date.getTime()
                        )
                    ) {
                        return false;
                    }

                    return (
                        date.getFullYear() ===
                        now.getFullYear()
                    );
                }
            );
        }

        if (period === "Last Month") {

            const lastMonth =
                new Date(
                    now.getFullYear(),
                    now.getMonth() - 1,
                    1
                );

            const nextMonth =
                new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    1
                );

            return leaves.filter(
                (leave) => {

                    const date =
                        new Date(
                            leave.appliedDate
                        );

                    if (
                        isNaN(
                            date.getTime()
                        )
                    ) {
                        return false;
                    }

                    return (
                        date >= lastMonth &&
                        date < nextMonth
                    );
                }
            );
        }

        return leaves.filter(
            (leave) => {

                const date =
                    new Date(
                        leave.appliedDate
                    );

                if (
                    isNaN(
                        date.getTime()
                    )
                ) {
                    return false;
                }

                return (
                    date.getMonth() ===
                    now.getMonth() &&
                    date.getFullYear() ===
                    now.getFullYear()
                );
            }
        );

    }, [leaves, period]);

    // =========================================================
    // STATISTICS
    // =========================================================

    const statistics = useMemo(() => {

        const total =
            filteredLeaves.length;

        const pending =
            filteredLeaves.filter(
                (leave) =>
                    String(
                        leave.status
                    ).toLowerCase() ===
                    "pending"
            ).length;

        const approved =
            filteredLeaves.filter(
                (leave) =>
                    String(
                        leave.status
                    ).toLowerCase() ===
                    "approved"
            ).length;

        const rejected =
            filteredLeaves.filter(
                (leave) =>
                    String(
                        leave.status
                    ).toLowerCase() ===
                    "rejected"
            ).length;

        return {
            total,
            pending,
            approved,
            rejected,
        };

    }, [filteredLeaves]);

    // =========================================================
    // ALL PENDING LEAVES
    //
    // IMPORTANT:
    // Do NOT use period filter here.
    //
    // This makes the Pending section show pending
    // requests even if they were submitted last month.
    // =========================================================

    const pendingLeaves = useMemo(() => {

        return leaves.filter(
            (leave) =>
                String(
                    leave.status
                ).toLowerCase() ===
                "pending"
        );

    }, [leaves]);

    // =========================================================
    // PENDING BY LEAVE TYPE
    // =========================================================

    const pendingByLeaveType = useMemo(() => {

        const result = {};

        pendingLeaves.forEach(
            (leave) => {

                const leaveTypeId =
                    Number(
                        leave.leaveTypeId
                    );

                const days =
                    Number(
                        leave.noOfDays
                    ) ||
                    calculateDays(
                        leave.fromDate,
                        leave.toDate
                    );

                if (!result[leaveTypeId]) {
                    result[leaveTypeId] = 0;
                }

                result[leaveTypeId] +=
                    days;
            }
        );

        return result;

    }, [pendingLeaves]);

    // =========================================================
    // TOTAL PENDING DAYS
    // =========================================================

    const totalPendingDays =
        useMemo(() => {

            return pendingLeaves.reduce(
                (
                    total,
                    leave
                ) => {

                    const days =
                        Number(
                            leave.noOfDays
                        ) ||
                        calculateDays(
                            leave.fromDate,
                            leave.toDate
                        );

                    return total + days;
                },
                0
            );

        }, [pendingLeaves]);

    // =========================================================
    // LEAVE TAKEN
    // =========================================================

    const leaveTaken =
        useMemo(() => {

            return filteredLeaves
                .filter(
                    (leave) =>
                        String(
                            leave.status
                        ).toLowerCase() ===
                        "approved"
                )
                .reduce(
                    (
                        total,
                        leave
                    ) => {

                        return (
                            total +
                            calculateDays(
                                leave.fromDate,
                                leave.toDate
                            )
                        );
                    },
                    0
                );

        }, [filteredLeaves]);

    // =========================================================
    // EMPLOYEES CURRENTLY ON LEAVE
    // =========================================================

    const employeesOnLeave =
        useMemo(() => {

            const today =
                new Date();

            return filteredLeaves.filter(
                (leave) => {

                    const from =
                        new Date(
                            leave.fromDate
                        );

                    const to =
                        new Date(
                            leave.toDate
                        );

                    return (
                        String(
                            leave.status
                        ).toLowerCase() ===
                        "approved" &&
                        from <= today &&
                        to >= today
                    );
                }
            ).length;

        }, [filteredLeaves]);

    // =========================================================
    // LEAVE TYPE DISTRIBUTION
    // =========================================================

    const leaveTypeDistribution =
        useMemo(() => {

            const distribution = {};

            filteredLeaves
                .filter(
                    (leave) =>
                        String(
                            leave.status
                        ).toLowerCase() ===
                        "approved"
                )
                .forEach(
                    (leave) => {

                        const name =
                            getLeaveTypeName(
                                leave.leaveTypeId
                            );

                        const days =
                            calculateDays(
                                leave.fromDate,
                                leave.toDate
                            );

                        if (
                            !distribution[name]
                        ) {
                            distribution[name] =
                                0;
                        }

                        distribution[name] +=
                            days;
                    }
                );

            return Object.entries(
                distribution
            );

        }, [
            filteredLeaves,
            leaveTypes,
        ]);

    // =========================================================
    // BALANCE TABLE
    // =========================================================

    const employeeBalanceRows =
        useMemo(() => {

            return [...leaveBalances]
                .sort(
                    (a, b) =>
                        Number(a.leaveTypeId) -
                        Number(b.leaveTypeId)
                );

        }, [leaveBalances]);

    // =========================================================
    // SELECTED LEAVE POLICY
    // =========================================================

    const selectedLeavePolicy =
        useMemo(() => {

            if (!leaveForm.leaveTypeId) {
                return null;
            }

            return (
                leavePolicies.find(
                    (policy) =>
                        Number(
                            policy.leaveTypeId
                        ) ===
                        Number(
                            leaveForm.leaveTypeId
                        )
                ) || null
            );

        }, [
            leavePolicies,
            leaveForm.leaveTypeId,
        ]);

    const requiresDocument =
        selectedLeavePolicy?.requiresDocument === true ||
        selectedLeavePolicy?.requiresDocument === 1 ||
        String(
            selectedLeavePolicy?.requiresDocument
        ).toLowerCase() === "true";

    // =========================================================
    // TODAY
    // =========================================================

    const todayString =
        new Date()
            .toISOString()
            .split("T")[0];

    // =========================================================
    // OPEN APPLY LEAVE
    // =========================================================

    const openApplyLeaveDialog = () => {

        setFormError("");

        setLeaveForm({
            leaveTypeId: "",
            fromDate: "",
            toDate: "",
            reason: "",
            document: null,
        });

        setOpenLeaveDialog(true);
    };

    // =========================================================
    // CLOSE APPLY LEAVE
    // =========================================================

    const closeApplyLeaveDialog = () => {

        if (submittingLeave) {
            return;
        }

        setOpenLeaveDialog(false);
        setFormError("");
    };

    // =========================================================
    // FORM CHANGE
    // =========================================================

    const handleLeaveFormChange =
        (event) => {

            const {
                name,
                value,
            } = event.target;

            setLeaveForm(
                (previous) => ({
                    ...previous,
                    [name]: value,
                })
            );

            setFormError("");
        };

    // =========================================================
    // DOCUMENT CHANGE
    // =========================================================

    const handleDocumentChange =
        (event) => {

            const file =
                event.target.files?.[0] ||
                null;

            setLeaveForm(
                (previous) => ({
                    ...previous,
                    document: file,
                })
            );

            setFormError("");
        };

    // =========================================================
    // SUBMIT LEAVE
    // =========================================================

    const handleSubmitLeave =
        async () => {

            setFormError("");

            if (!profile?.employeeId) {

                setFormError(
                    "Employee information is not available."
                );

                return;
            }

            if (!leaveForm.leaveTypeId) {

                setFormError(
                    "Please select a leave type."
                );

                return;
            }

            if (!leaveForm.fromDate) {

                setFormError(
                    "Please select the start date."
                );

                return;
            }

            if (!leaveForm.toDate) {

                setFormError(
                    "Please select the end date."
                );

                return;
            }

            if (
                leaveForm.toDate <
                leaveForm.fromDate
            ) {

                setFormError(
                    "End date cannot be before start date."
                );

                return;
            }

            if (
                !leaveForm.reason.trim()
            ) {

                setFormError(
                    "Please enter a reason for your leave."
                );

                return;
            }

            if (
                requiresDocument &&
                !leaveForm.document
            ) {

                setFormError(
                    "A supporting document is required for this leave type."
                );

                return;
            }

            const leaveData =
                new FormData();

            leaveData.append(
                "employeeId",
                String(
                    Number(
                        profile.employeeId
                    )
                )
            );

            leaveData.append(
                "leaveTypeId",
                String(
                    Number(
                        leaveForm.leaveTypeId
                    )
                )
            );

            leaveData.append(
                "fromDate",
                leaveForm.fromDate
            );

            leaveData.append(
                "toDate",
                leaveForm.toDate
            );

            leaveData.append(
                "reason",
                leaveForm.reason.trim()
            );

            if (leaveForm.document) {

                leaveData.append(
                    "document",
                    leaveForm.document
                );
            }

            try {

                setSubmittingLeave(true);

                await LeaveService.applyLeave(
                    leaveData
                );

                setOpenLeaveDialog(false);

                setLeaveForm({
                    leaveTypeId: "",
                    fromDate: "",
                    toDate: "",
                    reason: "",
                    document: null,
                });

                setFormError("");

                await loadLeaveData();

            } catch (submitError) {

                console.error(
                    "Apply Leave Error:",
                    submitError
                );

                const message =
                    submitError?.response?.data?.message ||
                    submitError?.response?.data ||
                    "Unable to submit leave request. Please try again.";

                setFormError(
                    typeof message ===
                        "string"
                        ? message
                        : "Unable to submit leave request. Please try again."
                );

            } finally {

                setSubmittingLeave(false);
            }
        };

    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {

        return (
            <div className="leave-dashboard">

                <div className="leave-header">

                    <div>
                        <h1>My Leave</h1>

                        <p>
                            Loading your leave
                            information...
                        </p>
                    </div>

                </div>

                <div className="leave-loading">
                    <CircularProgress />
                    <span>
                        Loading leave data...
                    </span>
                </div>

            </div>
        );
    }

    // =========================================================
    // ERROR
    // =========================================================

    if (error) {

        return (
            <div className="leave-dashboard">

                <div className="leave-header">

                    <div>
                        <h1>My Leave</h1>

                        <p>
                            View your leave
                            requests, approvals
                            and usage.
                        </p>
                    </div>

                </div>

                <div className="leave-error">

                    <h3>
                        Unable to load leave data
                    </h3>

                    <p>
                        {error}
                    </p>

                    <button
                        type="button"
                        className="leave-retry-btn"
                        onClick={
                            loadLeaveData
                        }
                    >
                        Retry
                    </button>

                </div>

            </div>
        );
    }

    // =========================================================
    // UI
    // =========================================================

    return (

        <div className="leave-dashboard">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="leave-header">

                <div>
                    <h1>My Leave</h1>

                    <p>
                        View your leave requests,
                        approvals and leave usage.
                    </p>
                </div>

                <div className="leave-header-actions">

                    <select
                        className="leave-period"
                        value={period}
                        onChange={(event) =>
                            setPeriod(
                                event.target.value
                            )
                        }
                    >
                        <option>
                            This Month
                        </option>

                        <option>
                            Last Month
                        </option>

                        <option>
                            This Year
                        </option>
                    </select>

                    <Button
                        variant="contained"
                        startIcon={
                            <AddIcon />
                        }
                        onClick={
                            openApplyLeaveDialog
                        }
                        className="apply-leave-btn"
                    >
                        Apply for Leave
                    </Button>

                </div>

            </div>

            {/* =================================================
                STAT CARDS
            ================================================= */}

            <div className="leave-stat-grid">

                <div className="leave-stat-card total">

                    <div className="leave-stat-icon">
                        <DashboardIcon />
                    </div>

                    <div>
                        <span>
                            My Requests
                        </span>

                        <h2>
                            {statistics.total}
                        </h2>
                    </div>

                </div>


                <div className="leave-stat-card pending">

                    <div className="leave-stat-icon">
                        <PendingActionsIcon />
                    </div>

                    <div>
                        <span>
                            Pending
                        </span>

                        <h2>
                            {statistics.pending}
                        </h2>
                    </div>

                </div>


                <div className="leave-stat-card approved">

                    <div className="leave-stat-icon">
                        <CheckCircleIcon />
                    </div>

                    <div>
                        <span>
                            Approved
                        </span>

                        <h2>
                            {statistics.approved}
                        </h2>
                    </div>

                </div>


                <div className="leave-stat-card rejected">

                    <div className="leave-stat-icon">
                        <CancelIcon />
                    </div>

                    <div>
                        <span>
                            Rejected
                        </span>

                        <h2>
                            {statistics.rejected}
                        </h2>
                    </div>

                </div>

            </div>

            {/* =================================================
                SECONDARY STATS
            ================================================= */}

            <div className="leave-secondary-grid">

                <div className="leave-info-card">

                    <div className="leave-info-icon blue">
                        <EventAvailableIcon />
                    </div>

                    <div>

                        <span>
                            Leave Taken
                        </span>

                        <h2>
                            {leaveTaken} Days
                        </h2>

                        <small>
                            {period}
                        </small>

                    </div>

                </div>


                <div className="leave-info-card">

                    <div className="leave-info-icon purple">
                        <PeopleIcon />
                    </div>

                    <div>

                        <span>
                            Currently On Leave
                        </span>

                        <h2>
                            {employeesOnLeave}
                        </h2>

                        <small>
                            Currently
                        </small>

                    </div>

                </div>

            </div>


            {/* =================================================
                MY LEAVE BALANCE
            ================================================= */}

            <div className="leave-panel leave-balance-panel">

                <div className="leave-panel-header">

                    <div>

                        <h2>
                            My Leave Balance
                        </h2>

                        <p>
                            Your current leave balance
                            by leave type
                        </p>

                    </div>

                    <div className="pending-summary">

                        <PendingActionsIcon />

                        <div>
                            <strong>
                                {pendingLeaves.length}
                                {" "}
                                Pending Requests
                            </strong>

                            <span>
                                {formatNumber(
                                    totalPendingDays
                                )}
                                {" "}
                                pending day(s)
                            </span>
                        </div>

                    </div>

                </div>


                <div className="leave-balance-table-wrapper">

                    <table className="leave-balance-table">

                        <thead>

                            <tr>

                                <th>
                                    Employee ID
                                </th>

                                <th>
                                    Leave Type
                                </th>

                                <th>
                                    Year
                                </th>

                                <th>
                                    Entitled
                                </th>

                                <th>
                                    Accrued
                                </th>

                                <th>
                                    Used
                                </th>

                                <th>
                                    Balance
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {employeeBalanceRows.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan="7"
                                        className="empty-table"
                                    >
                                        No leave balance
                                        found for this
                                        employee.
                                    </td>

                                </tr>

                            ) : (

                                employeeBalanceRows.map(
                                    (balance) => (

                                        <tr
                                            key={
                                                balance.employeeLeaveBalanceId
                                            }
                                        >

                                            <td>
                                                {
                                                    balance.employeeId
                                                }
                                            </td>

                                            <td className="leave-type-name">

                                                {
                                                    getLeaveTypeName(
                                                        balance.leaveTypeId
                                                    )
                                                }

                                            </td>

                                            <td>
                                                {
                                                    balance.year
                                                }
                                            </td>

                                            <td>
                                                {
                                                    formatNumber(
                                                        balance.entitledDays
                                                    )
                                                }
                                            </td>

                                            <td>
                                                {
                                                    formatNumber(
                                                        balance.accruedDays
                                                    )
                                                }
                                            </td>

                                            <td>
                                                {
                                                    formatNumber(
                                                        balance.usedDays
                                                    )
                                                }
                                            </td>

                                            <td>

                                                <span className="balance-pill">

                                                    {
                                                        formatNumber(
                                                            balance.balanceDays
                                                        )
                                                    }

                                                </span>

                                            </td>

                                        </tr>

                                    )
                                )

                            )}

                        </tbody>

                    </table>

                </div>

            </div>


            {/* =================================================
                PENDING LEAVE REQUESTS
            ================================================= */}

            <div className="leave-panel pending-balance-panel">

                <div className="leave-panel-header">

                    <div>

                        <h2>
                            Pending Leave Requests
                        </h2>

                        <p>
                            Leave requests waiting
                            for approval
                        </p>

                    </div>

                    <div className="pending-request-count">

                        <PendingActionsIcon />

                        <strong>
                            {pendingLeaves.length}
                        </strong>

                    </div>

                </div>


                <div className="pending-table-wrapper">

                    <table className="pending-leave-table">

                        <thead>

                            <tr>

                                <th>
                                    Employee ID
                                </th>

                                <th>
                                    Leave Type
                                </th>

                                <th>
                                    From
                                </th>

                                <th>
                                    To
                                </th>

                                <th>
                                    Days
                                </th>

                                <th>
                                    Status
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {pendingLeaves.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan="6"
                                        className="empty-table"
                                    >
                                        No pending leave
                                        requests.
                                    </td>

                                </tr>

                            ) : (

                                pendingLeaves.map(
                                    (leave) => (

                                        <tr
                                            key={
                                                leave.leaveId
                                            }
                                        >

                                            <td>
                                                {
                                                    leave.employeeId
                                                }
                                            </td>

                                            <td className="leave-type-name">

                                                {
                                                    getLeaveTypeName(
                                                        leave.leaveTypeId
                                                    )
                                                }

                                            </td>

                                            <td>
                                                {
                                                    formatDate(
                                                        leave.fromDate
                                                    )
                                                }
                                            </td>

                                            <td>
                                                {
                                                    formatDate(
                                                        leave.toDate
                                                    )
                                                }
                                            </td>

                                            <td>
                                                {
                                                    Number(
                                                        leave.noOfDays
                                                    ) ||
                                                    calculateDays(
                                                        leave.fromDate,
                                                        leave.toDate
                                                    )
                                                }
                                            </td>

                                            <td>

                                                <span
                                                    className={`leave-status ${getStatusClass(
                                                        leave.status
                                                    )}`}
                                                >
                                                    {
                                                        leave.status
                                                    }
                                                </span>

                                            </td>

                                        </tr>

                                    )
                                )

                            )}

                        </tbody>

                    </table>

                </div>

            </div>


            {/* =================================================
                OVERVIEW + DISTRIBUTION
            ================================================= */}

            <div className="leave-content-grid">

                {/* LEAVE OVERVIEW */}

                <div className="leave-panel">

                    <div className="leave-panel-header">

                        <div>

                            <h2>
                                My Leave Overview
                            </h2>

                            <p>
                                Your leave requests
                                by status
                            </p>

                        </div>

                    </div>


                    <div className="leave-overview">

                        {statistics.total === 0 ? (

                            <div className="chart-empty">

                                <DashboardIcon />

                                <h3>
                                    No leave data yet
                                </h3>

                                <p>
                                    Your leave statistics
                                    will appear here
                                    once you submit
                                    leave requests.
                                </p>

                            </div>

                        ) : (

                            <>

                                <div className="overview-row">

                                    <div className="overview-label">

                                        <strong>
                                            Pending
                                        </strong>

                                        <span>
                                            {statistics.pending}
                                        </span>

                                    </div>

                                    <div className="overview-bar">

                                        <div
                                            className="overview-bar-pending"
                                            style={{
                                                width: `${
                                                    statistics.total
                                                        ? (
                                                            statistics.pending /
                                                            statistics.total
                                                        ) * 100
                                                        : 0
                                                }%`,
                                            }}
                                        />

                                    </div>

                                </div>


                                <div className="overview-row">

                                    <div className="overview-label">

                                        <strong>
                                            Approved
                                        </strong>

                                        <span>
                                            {statistics.approved}
                                        </span>

                                    </div>

                                    <div className="overview-bar">

                                        <div
                                            className="overview-bar-approved"
                                            style={{
                                                width: `${
                                                    statistics.total
                                                        ? (
                                                            statistics.approved /
                                                            statistics.total
                                                        ) * 100
                                                        : 0
                                                }%`,
                                            }}
                                        />

                                    </div>

                                </div>


                                <div className="overview-row">

                                    <div className="overview-label">

                                        <strong>
                                            Rejected
                                        </strong>

                                        <span>
                                            {statistics.rejected}
                                        </span>

                                    </div>

                                    <div className="overview-bar">

                                        <div
                                            className="overview-bar-rejected"
                                            style={{
                                                width: `${
                                                    statistics.total
                                                        ? (
                                                            statistics.rejected /
                                                            statistics.total
                                                        ) * 100
                                                        : 0
                                                }%`,
                                            }}
                                        />

                                    </div>

                                </div>

                            </>

                        )}

                    </div>

                </div>


                {/* LEAVE TYPE DISTRIBUTION */}

                <div className="leave-panel">

                    <div className="leave-panel-header">

                        <div>

                            <h2>
                                My Leave Type
                                Distribution
                            </h2>

                            <p>
                                Your approved
                                leave usage
                                by type
                            </p>

                        </div>

                    </div>


                    <div className="leave-type-list">

                        {leaveTypeDistribution.length === 0 ? (

                            <div className="chart-empty">

                                <p>
                                    No approved
                                    leave data
                                    available.
                                </p>

                            </div>

                        ) : (

                            leaveTypeDistribution.map(
                                ([name, days]) => (

                                    <div
                                        className="leave-type-row"
                                        key={name}
                                    >

                                        <span>
                                            {name}
                                        </span>

                                        <strong>
                                            {days} Days
                                        </strong>

                                    </div>

                                )
                            )

                        )}

                    </div>

                </div>

            </div>


            {/* =================================================
                RECENT REQUESTS
            ================================================= */}

            <div className="leave-panel recent-leave-panel">

                <div className="leave-panel-header">

                    <div>

                        <h2>
                            My Recent Leave
                            Requests
                        </h2>

                        <p>
                            Your latest leave
                            applications
                        </p>

                    </div>

                    <button
                        type="button"
                        className="view-all-btn"
                        onClick={
                            loadLeaveData
                        }
                    >
                        Refresh
                    </button>

                </div>


                <div className="leave-table-wrapper">

                    <table className="leave-table">

                        <thead>

                            <tr>

                                <th>
                                    Leave Type
                                </th>

                                <th>
                                    From
                                </th>

                                <th>
                                    To
                                </th>

                                <th>
                                    Days
                                </th>

                                <th>
                                    Status
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {filteredLeaves.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan="5"
                                        className="empty-table"
                                    >
                                        No leave requests
                                        found for this
                                        period.
                                    </td>

                                </tr>

                            ) : (

                                filteredLeaves
                                    .slice(0, 10)
                                    .map(
                                        (leave) => (

                                            <tr
                                                key={
                                                    leave.leaveId
                                                }
                                            >

                                                <td>

                                                    {
                                                        getLeaveTypeName(
                                                            leave.leaveTypeId
                                                        )
                                                    }

                                                </td>

                                                <td>
                                                    {
                                                        formatDate(
                                                            leave.fromDate
                                                        )
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        formatDate(
                                                            leave.toDate
                                                        )
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        calculateDays(
                                                            leave.fromDate,
                                                            leave.toDate
                                                        )
                                                    }
                                                </td>

                                                <td>

                                                    <span
                                                        className={`leave-status ${getStatusClass(
                                                            leave.status
                                                        )}`}
                                                    >
                                                        {
                                                            leave.status
                                                        }
                                                    </span>

                                                </td>

                                            </tr>

                                        )
                                    )

                            )}

                        </tbody>

                    </table>

                </div>

            </div>


            {/* =================================================
                APPLY LEAVE DIALOG
            ================================================= */}

            <Dialog
                open={openLeaveDialog}
                onClose={
                    closeApplyLeaveDialog
                }
                fullWidth
                maxWidth="sm"
                className="leave-dialog"
            >

                <DialogTitle className="leave-dialog-title">

                    <div>

                        <Typography className="dialog-title-text">
                            Apply for Leave
                        </Typography>

                        <Typography className="dialog-subtitle">
                            Submit a new leave request
                        </Typography>

                    </div>

                    <IconButton
                        onClick={
                            closeApplyLeaveDialog
                        }
                        disabled={
                            submittingLeave
                        }
                    >
                        <CloseIcon />
                    </IconButton>

                </DialogTitle>


                <DialogContent
                    dividers
                    className="leave-dialog-content"
                >

                    {formError && (

                        <Alert
                            severity="error"
                            className="leave-form-alert"
                        >
                            {formError}
                        </Alert>

                    )}


                    <div className="leave-form">

                        <TextField
                            select
                            fullWidth
                            label="Leave Type"
                            name="leaveTypeId"
                            value={
                                leaveForm.leaveTypeId
                            }
                            onChange={
                                handleLeaveFormChange
                            }
                            required
                            disabled={
                                submittingLeave
                            }
                        >

                            {leaveTypes.length === 0 ? (

                                <MenuItem disabled>
                                    No active leave
                                    types available
                                </MenuItem>

                            ) : (

                                leaveTypes.map(
                                    (type) => (

                                        <MenuItem
                                            key={
                                                type.leaveTypeId
                                            }
                                            value={
                                                type.leaveTypeId
                                            }
                                        >
                                            {
                                                type.leaveTypeName
                                            }
                                        </MenuItem>

                                    )
                                )

                            )}

                        </TextField>


                        <div className="leave-date-grid">

                            <TextField
                                fullWidth
                                type="date"
                                label="From Date"
                                name="fromDate"
                                value={
                                    leaveForm.fromDate
                                }
                                onChange={
                                    handleLeaveFormChange
                                }
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                inputProps={{
                                    min: todayString,
                                }}
                                disabled={
                                    submittingLeave
                                }
                                required
                            />


                            <TextField
                                fullWidth
                                type="date"
                                label="To Date"
                                name="toDate"
                                value={
                                    leaveForm.toDate
                                }
                                onChange={
                                    handleLeaveFormChange
                                }
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                inputProps={{
                                    min:
                                        leaveForm.fromDate ||
                                        todayString,
                                }}
                                disabled={
                                    submittingLeave
                                }
                                required
                            />

                        </div>


                        {leaveForm.fromDate &&
                            leaveForm.toDate &&
                            leaveForm.toDate >=
                                leaveForm.fromDate && (

                                <div className="leave-duration">

                                    Leave Duration:
                                    {" "}
                                    {calculateDays(
                                        leaveForm.fromDate,
                                        leaveForm.toDate
                                    )}
                                    {" "}
                                    {
                                        calculateDays(
                                            leaveForm.fromDate,
                                            leaveForm.toDate
                                        ) === 1
                                            ? "Day"
                                            : "Days"
                                    }

                                </div>

                            )}


                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            label="Reason"
                            name="reason"
                            value={
                                leaveForm.reason
                            }
                            onChange={
                                handleLeaveFormChange
                            }
                            placeholder="Enter the reason for your leave..."
                            required
                            disabled={
                                submittingLeave
                            }
                            inputProps={{
                                maxLength: 500,
                            }}
                            helperText={`${leaveForm.reason.length}/500`}
                        />


                        {requiresDocument && (

                            <div className="supporting-document">

                                <Typography className="supporting-document-title">
                                    Supporting Document *
                                </Typography>

                                <Typography className="supporting-document-description">
                                    This leave type requires
                                    a supporting document.
                                </Typography>

                                <Button
                                    variant="outlined"
                                    component="label"
                                    disabled={
                                        submittingLeave
                                    }
                                >
                                    Choose Document

                                    <input
                                        type="file"
                                        hidden
                                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                        onChange={
                                            handleDocumentChange
                                        }
                                    />

                                </Button>

                                {leaveForm.document && (

                                    <Typography className="selected-document">

                                        Selected:
                                        {" "}
                                        <strong>
                                            {
                                                leaveForm.document.name
                                            }
                                        </strong>

                                    </Typography>

                                )}

                            </div>

                        )}

                    </div>

                </DialogContent>


                <DialogActions className="leave-dialog-actions">

                    <Button
                        onClick={
                            closeApplyLeaveDialog
                        }
                        disabled={
                            submittingLeave
                        }
                        className="cancel-dialog-btn"
                    >
                        Cancel
                    </Button>


                    <Button
                        variant="contained"
                        onClick={
                            handleSubmitLeave
                        }
                        disabled={
                            submittingLeave
                        }
                        startIcon={
                            submittingLeave
                                ? (
                                    <CircularProgress
                                        size={18}
                                        color="inherit"
                                    />
                                )
                                : (
                                    <AddIcon />
                                )
                        }
                        className="submit-dialog-btn"
                    >
                        {
                            submittingLeave
                                ? "Submitting..."
                                : "Submit Request"
                        }
                    </Button>

                </DialogActions>

            </Dialog>

        </div>
    );
};

export default Leave;