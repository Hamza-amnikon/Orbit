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
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import VisibilityIcon from "@mui/icons-material/Visibility";

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
    Box,
    Paper,
    Tooltip,
    Chip,
    Divider,
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
    const [openViewLeaveDialog, setOpenViewLeaveDialog] = useState(false);
    const [selectedLeave, setSelectedLeave] = useState(null);
    const [leavePolicies, setLeavePolicies] = useState([]);
    const [leaveBalances, setLeaveBalances] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [period, setPeriod] = useState("This Month");

    // Calendar month
    const [calendarMonth, setCalendarMonth] =
        useState(new Date());


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

        }
        catch (err) {

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

                }
                else if (
                    err.response.data.message
                ) {

                    message =
                        err.response.data.message;
                }

            }
            else if (err?.message) {

                message =
                    err.message;
            }

            setError(message);

        }
        finally {

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
    // STATUS CLASS
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


        // ---------------------------------------------------------
        // THIS YEAR
        // ---------------------------------------------------------

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


        // ---------------------------------------------------------
        // LAST MONTH
        // ---------------------------------------------------------

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


        // ---------------------------------------------------------
        // THIS MONTH
        // ---------------------------------------------------------

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
    // CALENDAR HELPERS
    // =========================================================

    const getDateKey = (date) => {

        const year =
            date.getFullYear();

        const month =
            String(
                date.getMonth() + 1
            ).padStart(2, "0");

        const day =
            String(
                date.getDate()
            ).padStart(2, "0");

        return `${year}-${month}-${day}`;
    };


    const getLeaveDateKey = (value) => {

        if (!value) {
            return "";
        }

        const stringValue =
            String(value);

        // Handles YYYY-MM-DD and
        // YYYY-MM-DDTHH:mm:ss
        if (
            /^\d{4}-\d{2}-\d{2}/.test(
                stringValue
            )
        ) {
            return stringValue.substring(
                0,
                10
            );
        }

        const parsed =
            new Date(value);

        if (
            isNaN(
                parsed.getTime()
            )
        ) {
            return "";
        }

        return getDateKey(parsed);
    };


    // =========================================================
    // CALENDAR LEAVE STATUS
    // =========================================================

    const getCalendarLeavesForDate =
        (date) => {

            const dateKey =
                getDateKey(date);

            return leaves.filter(
                (leave) => {

                    const fromKey =
                        getLeaveDateKey(
                            leave.fromDate
                        );

                    const toKey =
                        getLeaveDateKey(
                            leave.toDate
                        );

                    if (
                        !fromKey ||
                        !toKey
                    ) {
                        return false;
                    }

                    return (
                        dateKey >= fromKey &&
                        dateKey <= toKey
                    );
                }
            );
        };


    // =========================================================
    // CALENDAR STATUS
    // =========================================================

    const getCalendarStatus =
        (date) => {

            const dateLeaves =
                getCalendarLeavesForDate(
                    date
                );

            if (
                dateLeaves.length === 0
            ) {
                return null;
            }

            const approved =
                dateLeaves.find(
                    (leave) =>
                        String(
                            leave.status
                        ).toLowerCase() ===
                        "approved"
                );

            if (approved) {
                return {
                    status: "approved",
                    leaves: dateLeaves,
                };
            }

            const pending =
                dateLeaves.find(
                    (leave) =>
                        String(
                            leave.status
                        ).toLowerCase() ===
                        "pending"
                );

            if (pending) {
                return {
                    status: "pending",
                    leaves: dateLeaves,
                };
            }

            const rejected =
                dateLeaves.find(
                    (leave) =>
                        String(
                            leave.status
                        ).toLowerCase() ===
                        "rejected"
                );

            if (rejected) {
                return {
                    status: "rejected",
                    leaves: dateLeaves,
                };
            }

            return {
                status: "normal",
                leaves: dateLeaves,
            };
        };


    // =========================================================
    // CALENDAR MONTH HELPERS
    // =========================================================

    const calendarYear =
        calendarMonth.getFullYear();

    const calendarMonthIndex =
        calendarMonth.getMonth();

    const firstDayOfMonth =
        new Date(
            calendarYear,
            calendarMonthIndex,
            1
        );

    const daysInMonth =
        new Date(
            calendarYear,
            calendarMonthIndex + 1,
            0
        ).getDate();

    const startingDay =
        firstDayOfMonth.getDay();


    const calendarDays =
        useMemo(() => {

            const days = [];

            // Empty cells before month starts
            for (
                let index = 0;
                index < startingDay;
                index++
            ) {
                days.push(null);
            }

            for (
                let day = 1;
                day <= daysInMonth;
                day++
            ) {

                days.push(
                    new Date(
                        calendarYear,
                        calendarMonthIndex,
                        day
                    )
                );
            }

            return days;

        }, [
            calendarYear,
            calendarMonthIndex,
            startingDay,
            daysInMonth,
        ]);


    const goPreviousMonth = () => {

        setCalendarMonth(
            new Date(
                calendarYear,
                calendarMonthIndex - 1,
                1
            )
        );
    };


    const goNextMonth = () => {

        setCalendarMonth(
            new Date(
                calendarYear,
                calendarMonthIndex + 1,
                1
            )
        );
    };


    const goToday = () => {

        setCalendarMonth(
            new Date()
        );
    };


    // =========================================================
    // CALENDAR COLORS
    // =========================================================

    const getCalendarColors =
        (status) => {

            if (
                status === "approved"
            ) {

                return {
                    background: "#e8f7ee",
                    border: "#8fd3a9",
                    color: "#16803c",
                };
            }

            if (
                status === "pending"
            ) {

                return {
                    background: "#fff8df",
                    border: "#f3cf65",
                    color: "#9a6700",
                };
            }

            if (
                status === "rejected"
            ) {

                return {
                    background: "#fff0f0",
                    border: "#f2a6a6",
                    color: "#c62828",
                };
            }

            return {
                background: "#ffffff",
                border: "#e5e7eb",
                color: "#334155",
            };
        };


    // =========================================================
    // CALENDAR TOOLTIP
    // =========================================================

    const getCalendarTooltip =
        (calendarData) => {

            if (!calendarData) {
                return "";
            }

            return calendarData.leaves
                .map(
                    (leave) =>
                        `${getLeaveTypeName(
                            leave.leaveTypeId
                        )} - ${
                            leave.status ||
                            "Unknown"
                        }`
                )
                .join("\n");
        };


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

            }
            catch (submitError) {

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

            }
            finally {

                setSubmittingLeave(false);
            }
        };

// =========================================================
// VIEW LEAVE DETAILS
// =========================================================
const handleViewLeave = (leave) => {
    setSelectedLeave(leave);
    setOpenViewLeaveDialog(true);
};

// =========================================================
// CLOSE VIEW LEAVE
// =========================================================
const closeViewLeaveDialog = () => {
    setOpenViewLeaveDialog(false);
    setSelectedLeave(null);
};
    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {

        return (

            <div className="leave-dashboard">

                <div className="leave-header">

                    <div>

                        <h1>
                            My Leave
                        </h1>

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

                        <h1>
                            My Leave
                        </h1>

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

                    <h1>
                        My Leave
                    </h1>

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
                OVERVIEW + CALENDAR
            ================================================= */}

            <div className="leave-content-grid">


                {/* =================================================
                    LEAVE OVERVIEW
                ================================================= */}

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

                                {/* PENDING */}

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


                                {/* APPROVED */}

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


                                {/* REJECTED */}

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


                {/* =================================================
                    MUI LEAVE CALENDAR
                ================================================= */}

                <Paper
                    elevation={0}
                    sx={{
                        borderRadius: "14px",
                        border: "1px solid #e5e7eb",
                        background: "#ffffff",
                        overflow: "hidden",
                    }}
                >

                    {/* CALENDAR HEADER */}

                    <Box
                        sx={{
                            px: 2.5,
                            pt: 2.2,
                            pb: 1.5,
                        }}
                    >

                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 1,
                            }}
                        >

                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1.2,
                                }}
                            >

                                <Box
                                    sx={{
                                        width: 38,
                                        height: 38,
                                        borderRadius: "10px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        background: "#eef4ff",
                                        color: "#2450a4",
                                    }}
                                >

                                    <CalendarMonthIcon />

                                </Box>


                                <Box>

                                    <Typography
                                        sx={{
                                            fontSize: "18px",
                                            fontWeight: 700,
                                            color: "#172033",
                                            lineHeight: 1.2,
                                        }}
                                    >
                                        My Leave Calendar
                                    </Typography>

                                    <Typography
                                        sx={{
                                            mt: 0.4,
                                            fontSize: "12px",
                                            color: "#7a869a",
                                        }}
                                    >
                                        View your leave
                                        status by date
                                    </Typography>

                                </Box>

                            </Box>


                            <Button
                                size="small"
                                variant="outlined"
                                onClick={goToday}
                                sx={{
                                    textTransform: "none",
                                    borderRadius: "8px",
                                    minWidth: 58,
                                    fontSize: "12px",
                                }}
                            >
                                Today
                            </Button>

                        </Box>


                        <Divider
                            sx={{
                                mt: 2,
                            }}
                        />


                        {/* MONTH NAVIGATION */}

                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                mt: 1.5,
                            }}
                        >

                            <IconButton
                                size="small"
                                onClick={
                                    goPreviousMonth
                                }
                                sx={{
                                    border: "1px solid #e5e7eb",
                                    borderRadius: "8px",
                                }}
                            >
                                <ChevronLeftIcon
                                    fontSize="small"
                                />
                            </IconButton>


                            <Typography
                                sx={{
                                    fontSize: "16px",
                                    fontWeight: 700,
                                    color: "#243b70",
                                }}
                            >
                                {calendarMonth.toLocaleDateString(
                                    "en-IN",
                                    {
                                        month: "long",
                                        year: "numeric",
                                    }
                                )}
                            </Typography>


                            <IconButton
                                size="small"
                                onClick={
                                    goNextMonth
                                }
                                sx={{
                                    border: "1px solid #e5e7eb",
                                    borderRadius: "8px",
                                }}
                            >
                                <ChevronRightIcon
                                    fontSize="small"
                                />
                            </IconButton>

                        </Box>

                    </Box>


                    {/* CALENDAR */}

                    <Box
                        sx={{
                            px: 2,
                            pb: 2,
                        }}
                    >

                        {/* WEEK DAYS */}

                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns:
                                    "repeat(7, 1fr)",
                                mb: 0.5,
                            }}
                        >

                            {[
                                "Sun",
                                "Mon",
                                "Tue",
                                "Wed",
                                "Thu",
                                "Fri",
                                "Sat",
                            ].map(
                                (day) => (

                                    <Box
                                        key={day}
                                        sx={{
                                            textAlign:
                                                "center",
                                            py: 0.8,
                                            fontSize:
                                                "11px",
                                            fontWeight: 700,
                                            color:
                                                "#94a3b8",
                                        }}
                                    >
                                        {day}
                                    </Box>

                                )
                            )}

                        </Box>


                        {/* DAYS */}

                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns:
                                    "repeat(7, 1fr)",
                                gap: "5px",
                            }}
                        >

                            {calendarDays.map(
                                (date, index) => {

                                    if (!date) {

                                        return (
                                            <Box
                                                key={`empty-${index}`}
                                                sx={{
                                                    minHeight:
                                                        52,
                                                }}
                                            />
                                        );
                                    }


                                    const calendarData =
                                        getCalendarStatus(
                                            date
                                        );

                                    const colors =
                                        getCalendarColors(
                                            calendarData?.status
                                        );


                                    const dateKey =
                                        getDateKey(
                                            date
                                        );

                                    const isToday =
                                        dateKey ===
                                        todayString;


                                    return (

                                        <Tooltip
                                            key={dateKey}
                                            arrow
                                            placement="top"
                                            title={
                                                calendarData
                                                    ? (
                                                        <Box>
                                                            {calendarData.leaves.map(
                                                                (
                                                                    leave,
                                                                    leaveIndex
                                                                ) => (

                                                                    <Box
                                                                        key={
                                                                            leave.leaveId ||
                                                                            leaveIndex
                                                                        }
                                                                        sx={{
                                                                            mb:
                                                                                leaveIndex <
                                                                                calendarData.leaves.length -
                                                                                    1
                                                                                    ? 0.8
                                                                                    : 0,
                                                                        }}
                                                                    >

                                                                        <Typography
                                                                            sx={{
                                                                                fontSize:
                                                                                    "11px",
                                                                                fontWeight:
                                                                                    700,
                                                                            }}
                                                                        >
                                                                            {
                                                                                getLeaveTypeName(
                                                                                    leave.leaveTypeId
                                                                                )
                                                                            }
                                                                        </Typography>

                                                                        <Typography
                                                                            sx={{
                                                                                fontSize:
                                                                                    "10px",
                                                                            }}
                                                                        >
                                                                            {
                                                                                leave.status
                                                                            }
                                                                            {" • "}
                                                                            {
                                                                                calculateDays(
                                                                                    leave.fromDate,
                                                                                    leave.toDate
                                                                                )
                                                                            }
                                                                            {" day(s)"}
                                                                        </Typography>

                                                                    </Box>

                                                                )
                                                            )}
                                                        </Box>
                                                    )
                                                    : "No leave"
                                            }
                                        >

                                            <Box
                                                sx={{
                                                    minHeight: 52,
                                                    borderRadius:
                                                        "9px",
                                                    border: `1px solid ${
                                                        isToday
                                                            ? "#2563eb"
                                                            : colors.border
                                                    }`,
                                                    background:
                                                        colors.background,
                                                    color:
                                                        colors.color,
                                                    display:
                                                        "flex",
                                                    flexDirection:
                                                        "column",
                                                    alignItems:
                                                        "center",
                                                    justifyContent:
                                                        "center",
                                                    cursor:
                                                        calendarData
                                                            ? "pointer"
                                                            : "default",
                                                    position:
                                                        "relative",
                                                    transition:
                                                        "all 0.15s ease",
                                                    boxShadow:
                                                        isToday
                                                            ? "0 0 0 2px rgba(37,99,235,0.10)"
                                                            : "none",
                                                    "&:hover": {
                                                        transform:
                                                            calendarData
                                                                ? "translateY(-1px)"
                                                                : "none",
                                                        boxShadow:
                                                            calendarData
                                                                ? "0 3px 8px rgba(15,23,42,0.08)"
                                                                : "none",
                                                    },
                                                }}
                                            >

                                                <Typography
                                                    sx={{
                                                        fontSize:
                                                            "13px",
                                                        fontWeight:
                                                            isToday ||
                                                            calendarData
                                                                ? 700
                                                                : 500,
                                                    }}
                                                >
                                                    {
                                                        date.getDate()
                                                    }
                                                </Typography>


                                                {calendarData && (

                                                    <Box
                                                        sx={{
                                                            width: 6,
                                                            height: 6,
                                                            borderRadius:
                                                                "50%",
                                                            background:
                                                                colors.color,
                                                            mt:
                                                                0.4,
                                                        }}
                                                    />

                                                )}


                                                {isToday && (

                                                    <Typography
                                                        sx={{
                                                            position:
                                                                "absolute",
                                                            bottom:
                                                                2,
                                                            fontSize:
                                                                "7px",
                                                            fontWeight:
                                                                800,
                                                            textTransform:
                                                                "uppercase",
                                                        }}
                                                    >
                                                        Today
                                                    </Typography>

                                                )}

                                            </Box>

                                        </Tooltip>
                                    );
                                }
                            )}

                        </Box>


                        {/* LEGEND */}

                        <Box
                            sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 1.5,
                                mt: 2,
                                pt: 1.5,
                                borderTop:
                                    "1px solid #edf0f5",
                            }}
                        >

                            <Chip
                                size="small"
                                label="Approved"
                                sx={{
                                    background:
                                        "#e8f7ee",
                                    color:
                                        "#16803c",
                                    fontWeight: 600,
                                    fontSize:
                                        "11px",
                                }}
                            />

                            <Chip
                                size="small"
                                label="Pending"
                                sx={{
                                    background:
                                        "#fff8df",
                                    color:
                                        "#9a6700",
                                    fontWeight: 600,
                                    fontSize:
                                        "11px",
                                }}
                            />

                            <Chip
                                size="small"
                                label="Rejected"
                                sx={{
                                    background:
                                        "#fff0f0",
                                    color:
                                        "#c62828",
                                    fontWeight: 600,
                                    fontSize:
                                        "11px",
                                }}
                            />

                            <Chip
                                size="small"
                                label="No Leave"
                                variant="outlined"
                                sx={{
                                    color:
                                        "#64748b",
                                    fontWeight: 500,
                                    fontSize:
                                        "11px",
                                }}
                            />

                        </Box>

                    </Box>

                </Paper>

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
<th>
    Action
</th>
                            </tr>

                        </thead>


                        <tbody>

                            {filteredLeaves.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan="6"
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
<td>
    <button
        type="button"
        className="view-leave-btn"
        onClick={() => handleViewLeave(leave)}
    >
        <VisibilityIcon
            style={{
                fontSize: "16px",
            }}
        />
        View
    </button>
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
                open={
                    openLeaveDialog
                }
                onClose={
                    closeApplyLeaveDialog
                }
                fullWidth
                maxWidth="sm"
            >

                <DialogTitle
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent:
                            "space-between",
                    }}
                >

                    <Box>

                        <Typography
                            sx={{
                                fontWeight: 700,
                                fontSize: 20,
                            }}
                        >
                            Apply for Leave
                        </Typography>

                        <Typography
                            sx={{
                                fontSize: 13,
                                color: "#64748b",
                                mt: 0.4,
                            }}
                        >
                            Submit a new leave request
                        </Typography>

                    </Box>


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
                >

                    {formError && (

                        <Alert
                            severity="error"
                            sx={{
                                mb: 2,
                            }}
                        >
                            {formError}
                        </Alert>

                    )}


                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                            pt: 1,
                        }}
                    >

                        {/* LEAVE TYPE */}

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


                        {/* DATES */}

                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns:
                                    {
                                        xs: "1fr",
                                        sm: "1fr 1fr",
                                    },
                                gap: 2,
                            }}
                        >

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

                        </Box>


                        {/* DURATION */}

                        {leaveForm.fromDate &&
                            leaveForm.toDate &&
                            leaveForm.toDate >=
                                leaveForm.fromDate && (

                                <Box
                                    sx={{
                                        px: 2,
                                        py: 1.2,
                                        borderRadius:
                                            "8px",
                                        background:
                                            "#eef4ff",
                                        color:
                                            "#2450a4",
                                        fontSize:
                                            "13px",
                                        fontWeight:
                                            600,
                                    }}
                                >

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

                                </Box>

                            )}


                        {/* REASON */}

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


                        {/* DOCUMENT */}

                        {requiresDocument && (

                            <Box>

                                <Typography
                                    sx={{
                                        fontSize: 14,
                                        fontWeight: 600,
                                        mb: 0.5,
                                    }}
                                >
                                    Supporting Document *
                                </Typography>


                                <Typography
                                    sx={{
                                        fontSize: 12,
                                        color: "#64748b",
                                        mb: 1.5,
                                    }}
                                >
                                    This leave type
                                    requires a
                                    supporting document.
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

                                    <Typography
                                        sx={{
                                            mt: 1,
                                            fontSize: 12,
                                            color: "#475569",
                                        }}
                                    >

                                        Selected:
                                        {" "}
                                        <strong>
                                            {
                                                leaveForm
                                                    .document
                                                    .name
                                            }
                                        </strong>

                                    </Typography>

                                )}

                            </Box>

                        )}

                    </Box>

                </DialogContent>


                <DialogActions
                    sx={{
                        px: 3,
                        py: 2,
                    }}
                >

                    <Button
                        onClick={
                            closeApplyLeaveDialog
                        }
                        disabled={
                            submittingLeave
                        }
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
                    >
                        {
                            submittingLeave
                                ? "Submitting..."
                                : "Submit Request"
                        }
                    </Button>

                </DialogActions>

            </Dialog>
{/* =========================================================
    VIEW LEAVE DETAILS DIALOG
========================================================= */}

<Dialog
    open={openViewLeaveDialog}
    onClose={closeViewLeaveDialog}
    maxWidth="sm"
    fullWidth
>
    <DialogTitle
        sx={{
            fontWeight: 700,
            fontSize: "20px",
        }}
    >
        Leave Request Details
    </DialogTitle>

    <DialogContent dividers>

        {selectedLeave && (
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "18px",
                    paddingTop: "5px",
                }}
            >

                {/* Leave Type */}
                <div>
                    <div
                        style={{
                            fontSize: "12px",
                            color: "#64748b",
                            marginBottom: "5px",
                        }}
                    >
                        Leave Type
                    </div>

                    <div
                        style={{
                            fontSize: "15px",
                            fontWeight: 600,
                            color: "#1e293b",
                        }}
                    >
                        {getLeaveTypeName(
                            selectedLeave.leaveTypeId
                        )}
                    </div>
                </div>

                {/* Date */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "1fr 1fr",
                        gap: "20px",
                    }}
                >

                    <div>
                        <div
                            style={{
                                fontSize: "12px",
                                color: "#64748b",
                                marginBottom: "5px",
                            }}
                        >
                            From Date
                        </div>

                        <div
                            style={{
                                fontSize: "15px",
                                fontWeight: 600,
                                color: "#1e293b",
                            }}
                        >
                            {formatDate(
                                selectedLeave.fromDate
                            )}
                        </div>
                    </div>

                    <div>
                        <div
                            style={{
                                fontSize: "12px",
                                color: "#64748b",
                                marginBottom: "5px",
                            }}
                        >
                            To Date
                        </div>

                        <div
                            style={{
                                fontSize: "15px",
                                fontWeight: 600,
                                color: "#1e293b",
                            }}
                        >
                            {formatDate(
                                selectedLeave.toDate
                            )}
                        </div>
                    </div>

                </div>

                {/* Duration */}
                <div>
                    <div
                        style={{
                            fontSize: "12px",
                            color: "#64748b",
                            marginBottom: "5px",
                        }}
                    >
                        Duration
                    </div>

                    <div
                        style={{
                            fontSize: "15px",
                            fontWeight: 600,
                            color: "#1e293b",
                        }}
                    >
                        {calculateDays(
                            selectedLeave.fromDate,
                            selectedLeave.toDate
                        )}{" "}
                        Day(s)
                    </div>
                </div>

                {/* Status */}
                <div>
                    <div
                        style={{
                            fontSize: "12px",
                            color: "#64748b",
                            marginBottom: "5px",
                        }}
                    >
                        Status
                    </div>

                    <span
                        className={`leave-status ${getStatusClass(
                            selectedLeave.status
                        )}`}
                    >
                        {selectedLeave.status}
                    </span>
                </div>

                {/* Reason */}
                <div>
                    <div
                        style={{
                            fontSize: "12px",
                            color: "#64748b",
                            marginBottom: "5px",
                        }}
                    >
                        Reason
                    </div>

                    <div
                        style={{
                            background: "#f8fafc",
                            border: "1px solid #e2e8f0",
                            borderRadius: "8px",
                            padding: "12px",
                            fontSize: "14px",
                            color: "#334155",
                            minHeight: "60px",
                        }}
                    >
                        {selectedLeave.reason ||
                            "No reason provided."}
                    </div>
                </div>

                {/* Leave ID */}
                <div>
                    

                    <div
                        style={{
                            fontSize: "14px",
                            color: "#334155",
                        }}
                    >
                        #{selectedLeave.leaveId}
                    </div>
                </div>

            </div>
        )}

    </DialogContent>






    <DialogActions
        sx={{
            padding: "12px 20px",
        }}
    >
        <Button
            onClick={closeViewLeaveDialog}
            variant="contained"
        >
            Close
        </Button>
    </DialogActions>

</Dialog>
        </div>
    );
};


export default Leave;