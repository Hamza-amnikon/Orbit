import { MuiButtonMigration, MuiInputMigration, MuiTableBodyMigration, MuiTableCellMigration, MuiTableHeadMigration, MuiTableMigration, MuiTableRowMigration } from "../../../../components/ui/MuiCompat.jsx";
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
import EditIcon from "@mui/icons-material/Edit";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";

import LeaveService from "../../../Services/LeaveService";
import api from "../../../Services/api";

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    Select,
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

import { useAuth } from "../../../../context/AuthContext";
import { Box as MuiLayoutBox, Typography as MuiText } from "@mui/material";
import { useNavigate } from "react-router-dom";


const Leave = () => {

    const { hasPermission } = useAuth();
    const navigate = useNavigate();
    const permissionRoute = "/leave/my-leave";
    const canView = hasPermission(permissionRoute, "view");
    const canCreate = hasPermission(permissionRoute, "create");
    const canEdit = hasPermission(permissionRoute, "edit");

    // =========================================================
    // STATE
    // =========================================================

const [profile, setProfile] = useState(null);
    const [leaves, setLeaves] = useState([]);
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [openViewLeaveDialog, setOpenViewLeaveDialog] = useState(false);
    const [selectedLeave, setSelectedLeave] = useState(null);
    const [editingLeave, setEditingLeave] = useState(null);
    const [documentLoading, setDocumentLoading] = useState(false);
    const [documentError, setDocumentError] = useState("");
    const [leavePolicies, setLeavePolicies] = useState([]);
    const [leaveBalances, setLeaveBalances] = useState([]);
const [employeeShifts, setEmployeeShifts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [period, setPeriod] = useState("This Month");
    const [periodMenuOpen, setPeriodMenuOpen] = useState(false);

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
            // LOAD ASSIGNED SHIFT
            // =====================================================

            try {
                const shiftResponse = await fetch(
                     `${import.meta.env.VITE_SHIFT_API_BASE_URL}/api/Shift`,
                    {
                        headers: {
                            Accept: "application/json",
                        },
                    }
                );

                if (!shiftResponse.ok) {
                    throw new Error(
                        `Shift API returned ${shiftResponse.status}`
                    );
                }

                const shiftData =
                    await shiftResponse.json();

                const shifts =
                    Array.isArray(shiftData)
                        ? shiftData
                        : [];

                const profileAzureEmployeeId =
                    employee?.azureEmployeeId ??
                    employee?.azureEmployeeID;

                const profileCode =
                    employee?.employeeCode;

                const profileName =
                    employee?.displayName ||
                    employee?.employeeName ||
                    [
                        employee?.firstName,
                        employee?.lastName,
                    ]
                        .filter(Boolean)
                        .join(" ");

                const normalizeIdentity = (value) =>
                    String(value ?? "")
                        .trim()
                        .toLowerCase();

                /* =================================================
                   ONLY ACTIVE / CURRENT SHIFT ASSIGNMENTS
                   ================================================= */

                const today = new Date();

                const todayOnly = new Date(
                    today.getFullYear(),
                    today.getMonth(),
                    today.getDate()
                );

                const activeShifts =
                    shifts.filter((shift) => {

                        // Ignore inactive shifts
                        if (
                            shift?.status &&
                            normalizeIdentity(shift.status) !==
                                "active"
                        ) {
                            return false;
                        }

                        // From Date
                        const from = shift?.fromDate
                            ? new Date(shift.fromDate)
                            : null;

                        // To Date
                        const to = shift?.toDate
                            ? new Date(shift.toDate)
                            : null;

                        if (
                            from &&
                            !Number.isNaN(from.getTime())
                        ) {
                            from.setHours(0, 0, 0, 0);

                            if (todayOnly < from) {
                                return false;
                            }
                        }

                        if (
                            to &&
                            !Number.isNaN(to.getTime())
                        ) {
                            to.setHours(
                                23,
                                59,
                                59,
                                999
                            );

                            if (todayOnly > to) {
                                return false;
                            }
                        }

                        return true;
                    });

                /* =================================================
                   MATCH SHIFT WITH LOGGED-IN EMPLOYEE
                   ================================================= */

                const rankedShifts =
                    activeShifts
                        .map((shift) => {

                            const shiftEmployeeId =
                                shift?.employeeId;

                            const shiftAzureEmployeeId =
                                shift?.azureEmployeeId ??
                                shift?.azureEmployeeID;

                            let score = 0;

                            // Employee ID = strongest normal match
                            if (
                                shiftEmployeeId != null &&
                                Number(shiftEmployeeId) ===
                                    Number(employeeId)
                            ) {
                                score += 100;
                            }

                            // Azure Employee ID
                            if (
                                profileAzureEmployeeId != null &&
                                normalizeIdentity(
                                    shiftAzureEmployeeId
                                ) ===
                                    normalizeIdentity(
                                        profileAzureEmployeeId
                                    )
                            ) {
                                score += 200;
                            }

                            // Employee Code
                            if (
                                profileCode &&
                                normalizeIdentity(
                                    shift?.employeeCode
                                ) ===
                                    normalizeIdentity(
                                        profileCode
                                    )
                            ) {
                                score += 20;
                            }

                            // Employee Name
                            if (
                                profileName &&
                                normalizeIdentity(
                                    shift?.employeeName
                                ) ===
                                    normalizeIdentity(
                                        profileName
                                    )
                            ) {
                                score += 50;
                            }

                            return {
                                shift,
                                score,
                            };
                        })
                        .filter(
                            (item) => item.score > 0
                        )
                        .sort(
                            (a, b) =>
                                b.score - a.score
                        );

                const matchedShift =
                    rankedShifts[0]?.shift || null;

                console.log(
                    "My Leave - Logged-in Employee ID:",
                    employeeId
                );

                console.log(
                    "My Leave - Active Shifts:",
                    activeShifts
                );

                console.log(
                    "My Leave - Matched Shift:",
                    matchedShift
                );

                setEmployeeShifts(
                    matchedShift
                        ? [matchedShift]
                        : []
                );

            } catch (shiftError) {

                console.error(
                    "My Leave - Unable to load assigned shift:",
                    shiftError
                );

                setEmployeeShifts([]);
            }


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
    // ELIGIBLE LEAVE TYPES FOR LOGGED-IN EMPLOYEE
    // =========================================================
    // "All" = available to everyone.
    // "Male" = available only to Male employees.
    // "Female" = available only to Female employees.
    const eligibleLeaveTypes = useMemo(() => {

        // Normalize all supported gender values so that
        // "Male"/"M" and "Female"/"F" work consistently.
        const normalizeGender = (value) => {
            const gender = String(value || "").trim().toLowerCase();

            if (gender === "m" || gender === "male") return "male";
            if (gender === "f" || gender === "female") return "female";
            if (gender === "all" || gender === "everyone") return "all";

            return "";
        };

        const employeeGender = normalizeGender(profile?.gender);

        // Only leave types with a POSITIVE balance are available
        // in the Apply Leave dropdown.
        //
        // Gender eligibility is still checked separately, so:
        // Female -> matching Female leave only
        // Male   -> matching Male leave only
        // All    -> available to everyone, provided balance > 0
        // CompOff -> remains available when its balance > 0
        const availableLeaveTypeIds = new Set(
            (Array.isArray(leaveBalances) ? leaveBalances : [])
                .filter((balance) => Number(balance?.balanceDays) > 0)
                .map((balance) => Number(balance?.leaveTypeId))
                .filter((id) => Number.isFinite(id) && id > 0)
        );

        return leaveTypes.filter((type) => {
            const leaveTypeId = Number(type?.leaveTypeId);

            // No balance row or balance = 0 -> do not show.
            if (!availableLeaveTypeIds.has(leaveTypeId)) {
                return false;
            }

            const eligibleGender = normalizeGender(type?.eligibleGender);

            // Blank / All / Everyone = available to everyone.
            if (!eligibleGender || eligibleGender === "all") {
                return true;
            }

            // The current Auth/profile DTO does not include employee gender.
            // A positive balance is only created for leave types the employee
            // is eligible for, so keep those types selectable when gender is
            // unavailable in the profile response.
            if (!employeeGender) {
                return true;
            }

            // Male/Female leave must match logged-in employee gender.
            return employeeGender === eligibleGender;
        });

    }, [leaveTypes, leaveBalances, profile]);


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

        const toLocalDateKey = (value) => {
            if (!value) {
                return "";
            }

            const stringValue = String(value);

            if (/^\d{4}-\d{2}-\d{2}/.test(stringValue)) {
                return stringValue.substring(0, 10);
            }

            const parsed = new Date(value);

            if (isNaN(parsed.getTime())) {
                return "";
            }

            const year = parsed.getFullYear();
            const month = String(parsed.getMonth() + 1).padStart(2, "0");
            const day = String(parsed.getDate()).padStart(2, "0");

            return `${year}-${month}-${day}`;
        };

        const fromKey = toLocalDateKey(fromDate);
        const toKey = toLocalDateKey(toDate);

        if (!fromKey || !toKey || fromKey > toKey) {
            return 0;
        }

        const [fromYear, fromMonth, fromDay] =
            fromKey.split("-").map(Number);

        const [toYear, toMonth, toDay] =
            toKey.split("-").map(Number);

        const current = new Date(
            fromYear,
            fromMonth - 1,
            fromDay
        );

        const end = new Date(
            toYear,
            toMonth - 1,
            toDay
        );

        let workingDays = 0;

        while (current <= end) {

            const dateKey =
                `${current.getFullYear()}-${String(
                    current.getMonth() + 1
                ).padStart(2, "0")}-${String(
                    current.getDate()
                ).padStart(2, "0")}`;

            // Find the shift assigned to this exact date.
            const matchingShifts =
                Array.isArray(employeeShifts)
                    ? employeeShifts.filter((shift) => {

                        const status =
                            String(
                                shift?.status ??
                                shift?.Status ??
                                ""
                            )
                                .trim()
                                .toLowerCase();

                        if (
                            status &&
                            status !== "active"
                        ) {
                            return false;
                        }

                        const shiftFrom =
                            toLocalDateKey(
                                shift?.fromDate ??
                                shift?.FromDate ??
                                shift?.startDate ??
                                shift?.StartDate
                            );

                        const shiftTo =
                            toLocalDateKey(
                                shift?.toDate ??
                                shift?.ToDate ??
                                shift?.endDate ??
                                shift?.EndDate
                            );

                        return (
                            (!shiftFrom ||
                                dateKey >= shiftFrom) &&
                            (!shiftTo ||
                                dateKey <= shiftTo)
                        );
                    })
                    : [];

            matchingShifts.sort((a, b) => {

                const aFrom =
                    toLocalDateKey(
                        a?.fromDate ??
                        a?.FromDate ??
                        a?.startDate ??
                        a?.StartDate
                    ) || "";

                const bFrom =
                    toLocalDateKey(
                        b?.fromDate ??
                        b?.FromDate ??
                        b?.startDate ??
                        b?.StartDate
                    ) || "";

                return bFrom.localeCompare(aFrom);
            });

            const shift =
                matchingShifts[0] || null;

            // If no shift is available, preserve the existing behavior:
            // treat the date as a normal working leave day.
            if (!shift) {
                workingDays++;
            } else {

                const dayName =
                    current
                        .toLocaleDateString(
                            "en-US",
                            { weekday: "long" }
                        )
                        .toLowerCase();

                const weeklyOff1 =
                    String(
                        shift?.weeklyOff1 ??
                        shift?.WeeklyOff1 ??
                        shift?.weeklyoff1 ??
                        shift?.Weeklyoff1 ??
                        ""
                    )
                        .trim()
                        .toLowerCase();

                const weeklyOff2 =
                    String(
                        shift?.weeklyOff2 ??
                        shift?.WeeklyOff2 ??
                        shift?.weeklyoff2 ??
                        shift?.Weeklyoff2 ??
                        ""
                    )
                        .trim()
                        .toLowerCase();

                const isWeekOff =
                    dayName === weeklyOff1 ||
                    dayName === weeklyOff2;

                if (!isWeekOff) {
                    workingDays++;
                }
            }

            current.setDate(
                current.getDate() + 1
            );
        }

        return workingDays;
    };


    // =========================================================
    // PERSISTED LEAVE DAY HELPERS
    // =========================================================
    // Approved/partial-approved leaves are driven by LeaveDays
    // returned by LeaveService. This prevents the UI from treating
    // the whole FromDate -> ToDate range as approved.
    //
    // If LeaveDays are not present (for older/pending records),
    // the existing date-range calculation is used as a fallback.

    const getLeaveDaysCollection = (leave) => {
        if (Array.isArray(leave?.leaveDays)) {
            return leave.leaveDays;
        }

        if (Array.isArray(leave?.LeaveDays)) {
            return leave.LeaveDays;
        }

        return [];
    };


    const getPersistedLeaveDayForDate = (leave, date) => {
        const dateKey = getDateKey(date);

        return getLeaveDaysCollection(leave).find(
            (leaveDay) =>
                getLeaveDateKey(
                    leaveDay?.leaveDate ??
                    leaveDay?.LeaveDate
                ) === dateKey
        ) || null;
    };


    const getEffectiveLeaveDays = (leave) => {
        if (!leave) {
            return 0;
        }

        const persistedDays =
            getLeaveDaysCollection(leave);

        const leaveStatus =
            String(
                leave?.status || ""
            )
                .trim()
                .toLowerCase();

        // For approved/partially-approved leaves, use the actual
        // approved LeaveDays saved by the backend.
        if (
            leaveStatus === "approved" &&
            persistedDays.length > 0
        ) {
            return persistedDays.filter(
                (leaveDay) =>
                    String(
                        leaveDay?.status ??
                        leaveDay?.Status ??
                        ""
                    )
                        .trim()
                        .toLowerCase() ===
                    "approved"
            ).length;
        }

        // For pending/new/legacy records, preserve the existing
        // date-range calculation.
        return calculateDays(
            leave.fromDate,
            leave.toDate
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
                            getEffectiveLeaveDays(leave)
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
                            getEffectiveLeaveDays(leave);

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

            // Show only leave types with a balance greater than 0.
            // This removes zero-balance rows from My Leave Balance
            // without changing the underlying leaveBalances state.
            return [...leaveBalances]
                .filter(
                    (balance) =>
                        Number(balance?.balanceDays) > 0
                )
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


    const requestedCalendarDays = useMemo(() => {
        if (!leaveForm.fromDate || !leaveForm.toDate) return 0;

        const from = new Date(`${leaveForm.fromDate}T00:00:00Z`);
        const to = new Date(`${leaveForm.toDate}T00:00:00Z`);
        if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || to < from) return 0;

        return Math.floor((to.getTime() - from.getTime()) / 86400000) + 1;
    }, [leaveForm.fromDate, leaveForm.toDate]);

    const policyRequiresDocument = [true, 1, "true"].includes(
        typeof (selectedLeavePolicy?.requiresDocument ?? selectedLeavePolicy?.RequiresDocument) === "string"
            ? String(selectedLeavePolicy?.requiresDocument ?? selectedLeavePolicy?.RequiresDocument).toLowerCase()
            : (selectedLeavePolicy?.requiresDocument ?? selectedLeavePolicy?.RequiresDocument)
    );
    const documentAfterDays = Number(
        selectedLeavePolicy?.documentAfterDays ??
        selectedLeavePolicy?.DocumentAfterDays ??
        0
    );
    // Match the API rule: a document is needed only when the requested
    // calendar span is longer than the configured document-free period.
    const requiresDocument =
        policyRequiresDocument &&
        requestedCalendarDays > (Number.isFinite(documentAfterDays) ? documentAfterDays : 0);


    // =========================================================
    // LEAVE DATE RANGE
    // =========================================================

    const today = new Date();

    const todayString =
        today
            .toISOString()
            .split("T")[0];

    // Allow leave to be applied up to 7 calendar days back.
    const oneWeekBackDate = new Date(today);
    oneWeekBackDate.setDate(
        oneWeekBackDate.getDate() - 7
    );

    const minLeaveDate =
        oneWeekBackDate
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
    // GET SHIFT ASSIGNED FOR A SPECIFIC DATE
    // =========================================================
    // An employee can have multiple shift assignments over time.
    // The assignment whose From Date <= calendar date <= To Date
    // is used for that calendar date.

    const getShiftForDate = (date) => {
        if (!Array.isArray(employeeShifts) || employeeShifts.length === 0) return null;

        const dateKey = getDateKey(date);
        const matchingShifts = employeeShifts.filter((shift) => {
            const fromKey = getLeaveDateKey(
                shift?.fromDate ?? shift?.FromDate ?? shift?.startDate ?? shift?.StartDate
            );
            const toKey = getLeaveDateKey(
                shift?.toDate ?? shift?.ToDate ?? shift?.endDate ?? shift?.EndDate
            );
            return (!fromKey || dateKey >= fromKey) && (!toKey || dateKey <= toKey);
        });

        if (matchingShifts.length === 0) return null;

        matchingShifts.sort((a, b) => {
            const aFrom = getLeaveDateKey(
                a?.fromDate ?? a?.FromDate ?? a?.startDate ?? a?.StartDate
            ) || "";
            const bFrom = getLeaveDateKey(
                b?.fromDate ?? b?.FromDate ?? b?.startDate ?? b?.StartDate
            ) || "";
            return bFrom.localeCompare(aFrom);
        });

        return matchingShifts[0];
    };


    // CALENDAR STATUS
    // =========================================================

    // =========================================================
    // CHECK WHETHER A DATE IS A PAID WEEK OFF
    // =========================================================
    // Week Off is completely independent of Leave status.
    // If a date is a Week Off, the calendar must ALWAYS show
    // Week Off — never Pending, Approved or Rejected.

    const isWeeklyOffDate = (date) => {

        const shift = getShiftForDate(date);

        if (!shift) {
            return false;
        }

        const dayName =
            date
                .toLocaleDateString("en-US", {
                    weekday: "long",
                })
                .toLowerCase();

        const weeklyOff1 =
            String(
                shift?.weeklyOff1 ??
                shift?.WeeklyOff1 ??
                shift?.weeklyoff1 ??
                shift?.Weeklyoff1 ??
                ""
            )
                .trim()
                .toLowerCase();

        const weeklyOff2 =
            String(
                shift?.weeklyOff2 ??
                shift?.WeeklyOff2 ??
                shift?.weeklyoff2 ??
                shift?.Weeklyoff2 ??
                ""
            )
                .trim()
                .toLowerCase();

        return (
            dayName === weeklyOff1 ||
            dayName === weeklyOff2
        );
    };


    // =========================================================
    // CALENDAR STATUS
    // =========================================================

    const getCalendarStatus = (date) => {

        // =====================================================
        // 1. WEEK OFF ALWAYS HAS HIGHEST PRIORITY
        // =====================================================

        if (isWeeklyOffDate(date)) {
            return {
                status: "weeklyoff",
                leaves: [],
            };
        }

        // =====================================================
        // 2. LEAVE / COMPOFF STATUS
        // =====================================================

        const dateLeaves =
            getCalendarLeavesForDate(date);

        if (!dateLeaves.length) {
            return null;
        }

        const dateKey =
            getDateKey(date);

        // =====================================================
        // CALENDAR DISPLAY COLORS
        // =====================================================
        // Approved       -> green
        // Pending        -> orange/yellow
        // Rejected       -> red
        // Not Approved   -> red
        //
        // IMPORTANT:
        // This is only calendar display logic. It does NOT change
        // leave balance/deduction or backend approval logic.

        const calendarLeaves =
            dateLeaves
                .map((leave) => {
                    const status =
                        String(
                            leave?.status ?? ""
                        )
                            .trim()
                            .toLowerCase();

                    // -------------------------------------------------
                    // FULLY APPROVED / PARTIALLY APPROVED LEAVE
                    // -------------------------------------------------
                    // If LeaveDays exist, decide the colour for this
                    // exact calendar date from the persisted LeaveDay.
                    if (
                        status === "approved" ||
                        status === "partially approved" ||
                        status === "partial approved" ||
                        status === "partialapproval"
                    ) {
                        const persistedDays =
                            getLeaveDaysCollection(leave);

                        if (persistedDays.length > 0) {
                            const leaveDay =
                                persistedDays.find(
                                    (item) =>
                                        getLeaveDateKey(
                                            item?.leaveDate ??
                                            item?.LeaveDate
                                        ) === dateKey
                                );

                            if (!leaveDay) {
                                return null;
                            }

                            const dayStatus =
                                String(
                                    leaveDay?.status ??
                                    leaveDay?.Status ??
                                    ""
                                )
                                    .trim()
                                    .toLowerCase();

                            // Approved date -> green
                            if (dayStatus === "approved") {
                                return {
                                    leave,
                                    calendarStatus: "approved",
                                };
                            }

                            // Pending date -> orange/yellow
                            if (dayStatus === "pending") {
                                return {
                                    leave: {
                                        ...leave,
                                        status: "Pending",
                                    },
                                    calendarStatus: "pending",
                                };
                            }

                            // Not Approved / Rejected date -> red
                            if (
                                dayStatus === "notapproved" ||
                                dayStatus === "not approved" ||
                                dayStatus === "rejected" ||
                                dayStatus === "not_approved" ||
                                dayStatus === "not-approved"
                            ) {
                                return {
                                    leave: {
                                        ...leave,
                                        status:
                                            dayStatus === "rejected"
                                                ? "Rejected"
                                                : "Not Approved",
                                    },
                                    calendarStatus: "rejected",
                                };
                            }

                            // Unknown LeaveDay status:
                            // do not display it as an approved date.
                            return null;
                        }

                        // Legacy approved leave without LeaveDays:
                        // keep the existing full-range behavior.
                        return {
                            leave,
                            calendarStatus: "approved",
                        };
                    }

                    // -------------------------------------------------
                    // PENDING LEAVE
                    // -------------------------------------------------
                    // Pending keeps the existing orange/yellow color.
                    if (status === "pending") {
                        return {
                            leave,
                            calendarStatus: "pending",
                        };
                    }

                    // -------------------------------------------------
                    // REJECTED / NOT APPROVED / CANCELLED
                    // -------------------------------------------------
                    // These statuses are displayed in red.
                    if (
                        status === "rejected" ||
                        status === "notapproved" ||
                        status === "not approved" ||
                        status === "not_approved" ||
                        status === "not-approved" ||
                        status === "cancelled" ||
                        status === "canceled"
                    ) {
                        return {
                            leave,
                            calendarStatus: "rejected",
                        };
                    }

                    return null;
                })
                .filter(Boolean);

        if (!calendarLeaves.length) {
            return null;
        }

        // Approved has priority over pending/rejected when the same date
        // has more than one leave record.
        const approved =
            calendarLeaves.find(
                (item) =>
                    item.calendarStatus === "approved"
            );

        if (approved) {
            return {
                status: "approved",
                leaves: [approved.leave],
            };
        }

// Pending has priority over Rejected / Not Approved
// when both exist for the same date.
//
// Example:
// Old request -> Rejected
// New request -> Pending
// Calendar    -> Pending (yellow)
const pendingLeave =
    calendarLeaves.find(
        (item) =>
            item.calendarStatus === "pending"
    );

if (pendingLeave) {
    return {
        status: "pending",
        leaves: [pendingLeave.leave],
    };
}

// Rejected / Not Approved is shown only when there is
// no active Pending request for the same date.
const redLeave =
    calendarLeaves.find(
        (item) =>
            item.calendarStatus === "rejected"
    );

if (redLeave) {
    return {
        status: "rejected",
        leaves: [redLeave.leave],
    };
}

return null;
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

            if (
                status === "weeklyoff"
            ) {

                return {
                    background: "#e8f7ee",
                    border: "#8fd3a9",
                    color: "#16803c",
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
                return "No leave";
            }

            if (
                calendarData.status ===
                "weeklyoff"
            ) {
                return "Week Off";
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

        if (!canCreate) {
            return;
        }

        setEditingLeave(null);
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
        setEditingLeave(null);
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

            if (editingLeave) {
                if (!canEdit) {
                    return;
                }
            } else if (!canCreate) {
                return;
            }

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

            // Prevent submission if an already-selected leave type
            // is not assigned/eligible for the logged-in employee.
            // This keeps submit validation consistent with the dropdown.
            const selectedLeaveType =
                leaveTypes.find(
                    (type) =>
                        Number(type.leaveTypeId) ===
                        Number(leaveForm.leaveTypeId)
                );

            if (
                selectedLeaveType &&
                !eligibleLeaveTypes.some(
                    (type) =>
                        Number(type.leaveTypeId) ===
                        Number(selectedLeaveType.leaveTypeId)
                )
            ) {
                setFormError(
                    "You are not eligible for the selected leave type or it is not assigned to you."
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


            // =====================================================
            // BACKDATED LEAVE VALIDATION
            // =====================================================

            const minimumAllowedDate =
                new Date(`${minLeaveDate}T00:00:00`);

            const selectedFromDate =
                new Date(`${leaveForm.fromDate}T00:00:00`);

            if (selectedFromDate < minimumAllowedDate) {
                setFormError(
                    "Leave can be applied only for today or up to 7 days back."
                );

                return;
            }


            // =====================================================
            // WEEK OFF VALIDATION
            // =====================================================
            // A Week Off is not a working day and should never
            // create a Pending/Rejected/Approved leave entry for
            // the calendar. A request containing only Week Off
            // dates is therefore blocked.

            const requestedFrom =
                new Date(`${leaveForm.fromDate}T00:00:00`);

            const requestedTo =
                new Date(`${leaveForm.toDate}T00:00:00`);

            let workingDayFound = false;
            const checkDate = new Date(requestedFrom);

            while (checkDate <= requestedTo) {
                if (!isWeeklyOffDate(checkDate)) {
                    workingDayFound = true;
                    break;
                }

                checkDate.setDate(
                    checkDate.getDate() + 1
                );
            }

            if (!workingDayFound) {
                setFormError(
                    "The selected date is a Week Off. Leave cannot be applied on a Week Off."
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


            const hasExistingDocument =
                !!editingLeave?.documentPath;

            if (
                requiresDocument &&
                !leaveForm.document &&
                !hasExistingDocument
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

                if (editingLeave?.leaveId) {
                    await LeaveService.updateLeave(
                        editingLeave.leaveId,
                        leaveData
                    );
                } else {
                    await LeaveService.applyLeave(
                        leaveData
                    );
                }


                setOpenLeaveDialog(false);
                setEditingLeave(null);


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
                    (editingLeave
                        ? "Unable to update leave request. Please try again."
                        : "Unable to submit leave request. Please try again.");

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
    setDocumentError("");
    setDocumentLoading(false);
    setOpenViewLeaveDialog(true);
};

// =========================================================
// EDIT LEAVE REQUEST
// =========================================================
const handleEditLeave = (leave) => {
    if (!canEdit) {
        return;
    }

    const status = String(leave?.status || "")
        .trim()
        .toLowerCase();

    if (status !== "pending") {
        setDocumentError("Only pending leave requests can be edited.");
        return;
    }

    setOpenViewLeaveDialog(false);
    setDocumentError("");
    setDocumentLoading(false);
    setEditingLeave(leave);
    setFormError("");

    setLeaveForm({
        leaveTypeId: String(leave.leaveTypeId ?? ""),
        fromDate: leave.fromDate
            ? String(leave.fromDate).substring(0, 10)
            : "",
        toDate: leave.toDate
            ? String(leave.toDate).substring(0, 10)
            : "",
        reason: leave.reason || "",
        document: null,
    });

    setOpenLeaveDialog(true);
};

// =========================================================
// VIEW ATTACHED LEAVE DOCUMENT
// =========================================================
const handleViewLeaveDocument = async () => {
    const leaveId = selectedLeave?.leaveId ?? selectedLeave?.LeaveId;

    if (!leaveId) {
        setDocumentError("Leave ID was not found.");
        return;
    }

    try {
        setDocumentLoading(true);
        setDocumentError("");

        const blob = await LeaveService.getLeaveDocument(
            leaveId
        );

        if (!blob) {
            throw new Error("Document was not returned by the server.");
        }

        const blobUrl = window.URL.createObjectURL(blob);

        const newWindow = window.open(
            blobUrl,
            "_blank",
            "noopener,noreferrer"
        );

        if (!newWindow) {
            window.URL.revokeObjectURL(blobUrl);
            throw new Error(
                "Popup was blocked by the browser. Please allow popups for this site."
            );
        }

        // Keep the object URL alive long enough for the new tab to load.
        setTimeout(() => {
            window.URL.revokeObjectURL(blobUrl);
        }, 60000);
    } catch (error) {
        console.error("View Leave Document Error:", error);

        let message = "Unable to open the attached document.";

        if (error?.response?.status === 404) {
            message = "No document was found for this leave request.";
        } else if (error?.response?.status === 409) {
            message = "The document is still pending approval.";
        } else if (error?.message) {
            message = error.message;
        }

        setDocumentError(message);
    } finally {
        setDocumentLoading(false);
    }
};

// =========================================================
// CLOSE VIEW LEAVE
// =========================================================
const closeViewLeaveDialog = () => {
    setOpenViewLeaveDialog(false);
    setSelectedLeave(null);
    setDocumentError("");
    setDocumentLoading(false);
};
    // =========================================================
    // VIEW PERMISSION
    // =========================================================

    if (!canView) {
        return (
            <MuiLayoutBox className="leave-dashboard" component="div">
                <MuiLayoutBox className="leave-error" component="div">
                    <MuiText component="h3" variant="h6">Access Denied</MuiText>
                    <MuiText component="p" variant="body1">You do not have permission to access this page.</MuiText>
                </MuiLayoutBox>
            </MuiLayoutBox>
        );
    }

    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {

        return (

            <MuiLayoutBox className="leave-dashboard" component="div">

                <MuiLayoutBox className="leave-header" component="div">

                    <Tooltip title="Back to Leave Management">
                        <IconButton
                            className="leave-back-button"
                            onClick={() => navigate("/leave")}
                            aria-label="Back to Leave Management"
                        >
                            <ArrowBackRoundedIcon />
                        </IconButton>
                    </Tooltip>

                    <MuiLayoutBox className="leave-heading-group" component="div">

                        <MuiText component="h1" variant="h4">
                            My Leave
                        </MuiText>

                        <MuiText component="p" variant="body1">
                            Loading your leave
                            information...
                        </MuiText>

                    </MuiLayoutBox>

                </MuiLayoutBox>


                <MuiLayoutBox className="leave-loading" component="div">

                    <CircularProgress />

                    <MuiText component="span" variant="inherit">
                        Loading leave data...
                    </MuiText>

                </MuiLayoutBox>

            </MuiLayoutBox>
        );
    }


    // =========================================================
    // ERROR
    // =========================================================

    if (error) {

        return (

            <MuiLayoutBox className="leave-dashboard" component="div">

                <MuiLayoutBox className="leave-header" component="div">

                    <Tooltip title="Back to Leave Management">
                        <IconButton
                            className="leave-back-button"
                            onClick={() => navigate("/leave")}
                            aria-label="Back to Leave Management"
                        >
                            <ArrowBackRoundedIcon />
                        </IconButton>
                    </Tooltip>

                    <MuiLayoutBox className="leave-heading-group" component="div">

                        <MuiText component="h1" variant="h4">
                            My Leave
                        </MuiText>

                        <MuiText component="p" variant="body1">
                            View your leave
                            requests, approvals
                            and usage.
                        </MuiText>

                    </MuiLayoutBox>

                </MuiLayoutBox>


                <MuiLayoutBox className="leave-error" component="div">

                    <MuiText component="h3" variant="h6">
                        Unable to load leave data
                    </MuiText>

                    <MuiText component="p" variant="body1">
                        {error}
                    </MuiText>

                    <MuiButtonMigration
                        type="button"
                        className="leave-retry-btn"
                        onClick={
                            loadLeaveData
                        }
                    >
                        Retry
                    </MuiButtonMigration>

                </MuiLayoutBox>

            </MuiLayoutBox>
        );
    }


    // =========================================================
    // UI
    // =========================================================

    return (

        <MuiLayoutBox className="leave-dashboard" component="div">


            {/* =================================================
                HEADER
            ================================================= */}

            <MuiLayoutBox
                className={`leave-header${periodMenuOpen ? " period-menu-open" : ""}`}
                component="div"
            >

                <Tooltip title="Back to Leave Management">
                    <IconButton
                        className="leave-back-button"
                        onClick={() => navigate("/leave")}
                        aria-label="Back to Leave Management"
                    >
                        <ArrowBackRoundedIcon />
                    </IconButton>
                </Tooltip>

                <MuiLayoutBox className="leave-heading-group" component="div">

                    <MuiText component="h1" variant="h4">
                        My Leave
                    </MuiText>

                    <MuiText component="p" variant="body1">
                        View your leave requests,
                        approvals and leave usage.
                    </MuiText>

                </MuiLayoutBox>


                <MuiLayoutBox className="leave-header-actions" component="div">

                    <FormControl className="leave-period-control" size="small">
                        <Select
                            className="leave-period"
                            value={period}
                            onChange={(event) => setPeriod(event.target.value)}
                            onOpen={() => setPeriodMenuOpen(true)}
                            onClose={() => setPeriodMenuOpen(false)}
                            inputProps={{ "aria-label": "Reporting period" }}
                            MenuProps={{
                                PaperProps: {
                                    sx: {
                                        mt: 0.75,
                                        maxHeight: 220,
                                        border: "1px solid #dce6f2",
                                        borderRadius: "10px",
                                        boxShadow: "0 8px 24px rgba(22, 48, 84, 0.14)",
                                    },
                                },
                                anchorOrigin: {
                                    vertical: "bottom",
                                    horizontal: "left",
                                },
                                transformOrigin: {
                                    vertical: "top",
                                    horizontal: "left",
                                },
                            }}
                        >
                            <MenuItem value="This Month">This Month</MenuItem>
                            <MenuItem value="Last Month">Last Month</MenuItem>
                            <MenuItem value="This Year">This Year</MenuItem>
                        </Select>
                    </FormControl>


                    {canCreate && (
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
                    )}

                </MuiLayoutBox>

            </MuiLayoutBox>


            {/* =================================================
                STAT CARDS
            ================================================= */}

            <MuiLayoutBox className="leave-stat-grid" component="div">


                <MuiLayoutBox className="leave-stat-card total" component="div">

                    <MuiLayoutBox className="leave-stat-icon" component="div">

                        <DashboardIcon />

                    </MuiLayoutBox>

                    <MuiLayoutBox component="div">

                        <MuiText component="span" variant="inherit">
                            My Requests
                        </MuiText>

                        <MuiText component="h2" variant="h5">
                            {statistics.total}
                        </MuiText>

                    </MuiLayoutBox>

                </MuiLayoutBox>


                <MuiLayoutBox className="leave-stat-card pending" component="div">

                    <MuiLayoutBox className="leave-stat-icon" component="div">

                        <PendingActionsIcon />

                    </MuiLayoutBox>

                    <MuiLayoutBox component="div">

                        <MuiText component="span" variant="inherit">
                            Pending
                        </MuiText>

                        <MuiText component="h2" variant="h5">
                            {statistics.pending}
                        </MuiText>

                    </MuiLayoutBox>

                </MuiLayoutBox>


                <MuiLayoutBox className="leave-stat-card approved" component="div">

                    <MuiLayoutBox className="leave-stat-icon" component="div">

                        <CheckCircleIcon />

                    </MuiLayoutBox>

                    <MuiLayoutBox component="div">

                        <MuiText component="span" variant="inherit">
                            Approved
                        </MuiText>

                        <MuiText component="h2" variant="h5">
                            {statistics.approved}
                        </MuiText>

                    </MuiLayoutBox>

                </MuiLayoutBox>


                <MuiLayoutBox className="leave-stat-card rejected" component="div">

                    <MuiLayoutBox className="leave-stat-icon" component="div">

                        <CancelIcon />

                    </MuiLayoutBox>

                    <MuiLayoutBox component="div">

                        <MuiText component="span" variant="inherit">
                            Rejected
                        </MuiText>

                        <MuiText component="h2" variant="h5">
                            {statistics.rejected}
                        </MuiText>

                    </MuiLayoutBox>

                </MuiLayoutBox>

            </MuiLayoutBox>


            {/* =================================================
                SECONDARY STATS
            ================================================= */}

            <MuiLayoutBox className="leave-secondary-grid" component="div">


                <MuiLayoutBox className="leave-info-card" component="div">

                    <MuiLayoutBox className="leave-info-icon blue" component="div">

                        <EventAvailableIcon />

                    </MuiLayoutBox>

                    <MuiLayoutBox component="div">

                        <MuiText component="span" variant="inherit">
                            Leave Taken
                        </MuiText>

                        <MuiText component="h2" variant="h5">
                            {leaveTaken} Days
                        </MuiText>

                        <MuiText component="small" variant="caption">
                            {period}
                        </MuiText>

                    </MuiLayoutBox>

                </MuiLayoutBox>


                <MuiLayoutBox className="leave-info-card" component="div">

                    <MuiLayoutBox className="leave-info-icon purple" component="div">

                        <PeopleIcon />

                    </MuiLayoutBox>

                    <MuiLayoutBox component="div">

                        <MuiText component="span" variant="inherit">
                            Currently On Leave
                        </MuiText>

                        <MuiText component="h2" variant="h5">
                            {employeesOnLeave}
                        </MuiText>

                        <MuiText component="small" variant="caption">
                            Currently
                        </MuiText>

                    </MuiLayoutBox>

                </MuiLayoutBox>

            </MuiLayoutBox>


            {/* =================================================
                MY LEAVE BALANCE
            ================================================= */}

            <MuiLayoutBox className="leave-panel leave-balance-panel" component="div">

                <MuiLayoutBox className="leave-panel-header" component="div">

                    <MuiLayoutBox component="div">

                        <MuiText component="h2" variant="h5">
                            My Leave Balance
                        </MuiText>

                        <MuiText component="p" variant="body1">
                            Your current leave balance
                            by leave type
                        </MuiText>

                    </MuiLayoutBox>


                    <MuiLayoutBox className="pending-summary" component="div">

                        <PendingActionsIcon />

                        <MuiLayoutBox component="div">

                            <MuiText component="strong" variant="inherit">

                                {pendingLeaves.length}
                                {" "}
                                Pending Requests

                            </MuiText>

                            <MuiText component="span" variant="inherit">

                                {formatNumber(
                                    totalPendingDays
                                )}
                                {" "}
                                pending day(s)

                            </MuiText>

                        </MuiLayoutBox>

                    </MuiLayoutBox>

                </MuiLayoutBox>


                <MuiLayoutBox className="leave-balance-table-wrapper" component="div">

                    <MuiTableMigration className="leave-balance-table">

                        <MuiTableHeadMigration>

                            <MuiTableRowMigration>

                                <MuiTableCellMigration>
                                    Azure Employee ID
                                </MuiTableCellMigration>

                                <MuiTableCellMigration>
                                    Leave Type
                                </MuiTableCellMigration>

                                <MuiTableCellMigration>
                                    Year
                                </MuiTableCellMigration>

                                <MuiTableCellMigration>
                                    Entitled
                                </MuiTableCellMigration>

                                <MuiTableCellMigration>
                                    Accrued
                                </MuiTableCellMigration>

                                <MuiTableCellMigration>
                                    Used
                                </MuiTableCellMigration>

                                <MuiTableCellMigration>
                                    Balance
                                </MuiTableCellMigration>

                            </MuiTableRowMigration>

                        </MuiTableHeadMigration>


                        <MuiTableBodyMigration>

                            {employeeBalanceRows.length === 0 ? (

                                <MuiTableRowMigration>

                                    <MuiTableCellMigration
                                        colSpan="7"
                                        className="empty-table"
                                    >
                                        No leave balance
                                        found for this
                                        employee.
                                    </MuiTableCellMigration>

                                </MuiTableRowMigration>

                            ) : (

                                employeeBalanceRows.map(
                                    (balance) => (

                                        <MuiTableRowMigration
                                            key={
                                                balance.employeeLeaveBalanceId
                                            }
                                        >

                                            <MuiTableCellMigration>
                                                {
                                                    profile?.azureEmployeeId ??
                                                    profile?.AzureEmployeeId ??
                                                    profile?.azureEmployeeID ??
                                                    profile?.azureId ??
                                                    balance.azureEmployeeId ??
                                                    balance.AzureEmployeeId ??
                                                    balance.azureEmployeeID ??
                                                    "—"
                                                }
                                            </MuiTableCellMigration>

                                            <MuiTableCellMigration className="leave-type-name">

                                                {
                                                    getLeaveTypeName(
                                                        balance.leaveTypeId
                                                    )
                                                }

                                            </MuiTableCellMigration>

                                            <MuiTableCellMigration>
                                                {
                                                    balance.year
                                                }
                                            </MuiTableCellMigration>

                                            <MuiTableCellMigration>
                                                {
                                                    formatNumber(
                                                        balance.entitledDays
                                                    )
                                                }
                                            </MuiTableCellMigration>

                                            <MuiTableCellMigration>
                                                {
                                                    formatNumber(
                                                        balance.accruedDays
                                                    )
                                                }
                                            </MuiTableCellMigration>

                                            <MuiTableCellMigration>
                                                {
                                                    formatNumber(
                                                        balance.usedDays
                                                    )
                                                }
                                            </MuiTableCellMigration>

                                            <MuiTableCellMigration>

                                                <MuiText className="balance-pill" component="span" variant="inherit">

                                                    {
                                                        formatNumber(
                                                            balance.balanceDays
                                                        )
                                                    }

                                                </MuiText>

                                            </MuiTableCellMigration>

                                        </MuiTableRowMigration>

                                    )
                                )

                            )}

                        </MuiTableBodyMigration>

                    </MuiTableMigration>

                </MuiLayoutBox>

            </MuiLayoutBox>


            {/* =================================================
                OVERVIEW + CALENDAR
            ================================================= */}

            <MuiLayoutBox className="leave-content-grid" component="div">


                {/* =================================================
                    LEAVE OVERVIEW
                ================================================= */}

                <MuiLayoutBox className="leave-panel" component="div">

                    <MuiLayoutBox className="leave-panel-header" component="div">

                        <MuiLayoutBox component="div">

                            <MuiText component="h2" variant="h5">
                                My Leave Overview
                            </MuiText>

                            <MuiText component="p" variant="body1">
                                Your leave requests
                                by status
                            </MuiText>

                        </MuiLayoutBox>

                    </MuiLayoutBox>


                    <MuiLayoutBox className="leave-overview" component="div">

                        {statistics.total === 0 ? (

                            <MuiLayoutBox className="chart-empty" component="div">

                                <DashboardIcon />

                                <MuiText component="h3" variant="h6">
                                    No leave data yet
                                </MuiText>

                                <MuiText component="p" variant="body1">
                                    Your leave statistics
                                    will appear here
                                    once you submit
                                    leave requests.
                                </MuiText>

                            </MuiLayoutBox>

                        ) : (

                            <>

                                {/* PENDING */}

                                <MuiLayoutBox className="overview-row" component="div">

                                    <MuiLayoutBox className="overview-label" component="div">

                                        <MuiText component="strong" variant="inherit">
                                            Pending
                                        </MuiText>

                                        <MuiText component="span" variant="inherit">
                                            {statistics.pending}
                                        </MuiText>

                                    </MuiLayoutBox>

                                    <MuiLayoutBox className="overview-bar" component="div">

                                        <MuiLayoutBox
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
                                         component="div"/>

                                    </MuiLayoutBox>

                                </MuiLayoutBox>


                                {/* APPROVED */}

                                <MuiLayoutBox className="overview-row" component="div">

                                    <MuiLayoutBox className="overview-label" component="div">

                                        <MuiText component="strong" variant="inherit">
                                            Approved
                                        </MuiText>

                                        <MuiText component="span" variant="inherit">
                                            {statistics.approved}
                                        </MuiText>

                                    </MuiLayoutBox>

                                    <MuiLayoutBox className="overview-bar" component="div">

                                        <MuiLayoutBox
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
                                         component="div"/>

                                    </MuiLayoutBox>

                                </MuiLayoutBox>


                                {/* REJECTED */}

                                <MuiLayoutBox className="overview-row" component="div">

                                    <MuiLayoutBox className="overview-label" component="div">

                                        <MuiText component="strong" variant="inherit">
                                            Rejected
                                        </MuiText>

                                        <MuiText component="span" variant="inherit">
                                            {statistics.rejected}
                                        </MuiText>

                                    </MuiLayoutBox>

                                    <MuiLayoutBox className="overview-bar" component="div">

                                        <MuiLayoutBox
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
                                         component="div"/>

                                    </MuiLayoutBox>

                                </MuiLayoutBox>

                            </>

                        )}

                    </MuiLayoutBox>

                </MuiLayoutBox>


                {/* =================================================
                    MUI LEAVE CALENDAR
                ================================================= */}

                <Paper
                    className="leave-calendar-panel"
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
                        className="my-leave-calendar-header"
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
                                    className="my-leave-calendar-icon"
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
                                        className="my-leave-calendar-title"
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
                                        className="my-leave-calendar-subtitle"
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
                                className="my-leave-calendar-today"
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
                            className="my-leave-calendar-divider"
                            sx={{
                                mt: 2,
                            }}
                        />


                        {/* MONTH NAVIGATION */}

                        <Box
                            className="my-leave-calendar-navigation"
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                mt: 1.5,
                            }}
                        >

                            <IconButton
                                className="my-leave-calendar-nav-button"
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
                                className="my-leave-calendar-month"
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
                                className="my-leave-calendar-nav-button"
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
                            className="my-leave-calendar-weekdays"
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
                                        className="my-leave-calendar-weekday"
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
                            className="my-leave-calendar-days"
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
                                                className="my-leave-calendar-empty-day"
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
                                                calendarData?.status ===
                                                "weeklyoff"
                                                    ? "Week Off"
                                                    : calendarData
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
                                                                                getEffectiveLeaveDays(
                                                                                    leave
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
                                                className={`my-leave-calendar-day${isToday ? " is-today" : ""}`}
                                                data-calendar-status={calendarData?.status || "none"}
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
                                                    calendarData.status ===
                                                    "weeklyoff" ? (
                                                        <Typography
                                                            sx={{
                                                                fontSize: "8px",
                                                                fontWeight: 700,
                                                                mt: 0.3,
                                                                textAlign: "center",
                                                                lineHeight: 1.1,
                                                            }}
                                                        >
                                                           Week Off
                                                        </Typography>
                                                    ) : (
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
                                                    )
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
                            className="my-leave-calendar-legend"
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
                                className="my-leave-calendar-legend-approved"
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
                                className="my-leave-calendar-legend-pending"
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
                                className="my-leave-calendar-legend-rejected"
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
                                className="my-leave-calendar-legend-week-off"
                                size="small"
                                label="Week Off"
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
                                className="my-leave-calendar-legend-none"
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

            </MuiLayoutBox>


            {/* =================================================
                RECENT REQUESTS
            ================================================= */}

            <MuiLayoutBox className="leave-panel recent-leave-panel" component="div">

                <MuiLayoutBox className="leave-panel-header" component="div">

                    <MuiLayoutBox component="div">

                        <MuiText component="h2" variant="h5">
                            My Recent Leave
                            Requests
                        </MuiText>

                        <MuiText component="p" variant="body1">
                            Your latest leave
                            applications
                        </MuiText>

                    </MuiLayoutBox>


                    <MuiButtonMigration
                        type="button"
                        className="view-all-btn"
                        onClick={
                            loadLeaveData
                        }
                    >
                        Refresh
                    </MuiButtonMigration>

                </MuiLayoutBox>


                <MuiLayoutBox className="leave-table-wrapper" component="div">

                    <MuiTableMigration className="leave-table">

                        <MuiTableHeadMigration>

                            <MuiTableRowMigration>

                                <MuiTableCellMigration>
                                    Leave Type
                                </MuiTableCellMigration>

                                <MuiTableCellMigration>
                                    From
                                </MuiTableCellMigration>

                                <MuiTableCellMigration>
                                    To
                                </MuiTableCellMigration>

                                <MuiTableCellMigration>
                                    Days
                                </MuiTableCellMigration>

                                <MuiTableCellMigration>
                                    Status
                                </MuiTableCellMigration>
<MuiTableCellMigration>
    Action
</MuiTableCellMigration>
                            </MuiTableRowMigration>

                        </MuiTableHeadMigration>


                        <MuiTableBodyMigration>

                            {filteredLeaves.length === 0 ? (

                                <MuiTableRowMigration>

                                    <MuiTableCellMigration
                                        colSpan="6"
                                        className="empty-table"
                                    >
                                        No leave requests
                                        found for this
                                        period.
                                    </MuiTableCellMigration>

                                </MuiTableRowMigration>

                            ) : (

                                filteredLeaves
                                    .slice(0, 10)
                                    .map(
                                        (leave) => (

                                            <MuiTableRowMigration
                                                key={
                                                    leave.leaveId
                                                }
                                            >

                                                <MuiTableCellMigration>

                                                    {
                                                        getLeaveTypeName(
                                                            leave.leaveTypeId
                                                        )
                                                    }

                                                </MuiTableCellMigration>


                                                <MuiTableCellMigration>

                                                    {
                                                        formatDate(
                                                            leave.fromDate
                                                        )
                                                    }

                                                </MuiTableCellMigration>


                                                <MuiTableCellMigration>

                                                    {
                                                        formatDate(
                                                            leave.toDate
                                                        )
                                                    }

                                                </MuiTableCellMigration>


                                                <MuiTableCellMigration>

                                                    {
                                                        getEffectiveLeaveDays(
                                                            leave
                                                        )
                                                    }

                                                </MuiTableCellMigration>


                                                <MuiTableCellMigration>

                                                    <MuiText
                                                        className={`leave-status ${getStatusClass(
                                                            leave.status
                                                        )}`}
                                                     component="span" variant="inherit">

                                                        {
                                                            leave.status
                                                        }

                                                    </MuiText>

                                                </MuiTableCellMigration>
<MuiTableCellMigration>
    <MuiButtonMigration
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
    </MuiButtonMigration>
</MuiTableCellMigration>
                                            </MuiTableRowMigration>

                                        )
                                    )

                            )}

                        </MuiTableBodyMigration>

                    </MuiTableMigration>

                </MuiLayoutBox>

            </MuiLayoutBox>


            {/* =================================================
                APPLY LEAVE DIALOG
            ================================================= */}

            <Dialog
                className="my-leave-apply-dialog"
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
                            {editingLeave
                                ? "Edit Leave Request"
                                : "Apply for Leave"}
                        </Typography>

                        <Typography
                            sx={{
                                fontSize: 13,
                                color: "#64748b",
                                mt: 0.4,
                            }}
                        >
                            {editingLeave
                                ? "Update your pending leave request"
                                : "Submit a new leave request"}
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

                            {eligibleLeaveTypes.length === 0 ? (

                                <MenuItem disabled>
                                    No eligible leave
                                    types available
                                </MenuItem>

                            ) : (

                                eligibleLeaveTypes.map(
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
        gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr 1fr",
        },
        gap: 2,
    }}
>
    {/* FROM DATE */}
    <MuiLayoutBox className="leave-static-date-field" component="div">
        <MuiLayoutBox className="leave-static-date-label" component="label">
            From Date *
        </MuiLayoutBox>

        <TextField
            fullWidth
            type="date"
            name="fromDate"
            value={leaveForm.fromDate}
            onChange={handleLeaveFormChange}
            slotProps={{
                htmlInput: {
                    min: minLeaveDate,
                },
            }}
            disabled={submittingLeave}
            required
        />
    </MuiLayoutBox>

    {/* TO DATE */}
    <MuiLayoutBox className="leave-static-date-field" component="div">
        <MuiLayoutBox className="leave-static-date-label" component="label">
            To Date *
        </MuiLayoutBox>

        <TextField
            fullWidth
            type="date"
            name="toDate"
            value={leaveForm.toDate}
            onChange={handleLeaveFormChange}
            slotProps={{
                htmlInput: {
                    min:
                        leaveForm.fromDate ||
                        minLeaveDate,
                },
            }}
            disabled={submittingLeave}
            required
        />
    </MuiLayoutBox>
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

                        {policyRequiresDocument && requestedCalendarDays > 0 && (
                            <Alert
                                severity={requiresDocument ? "warning" : "info"}
                                sx={{ py: 0.25 }}
                            >
                                {requiresDocument
                                    ? `This request exceeds the ${documentAfterDays}-day document threshold. Attach a supporting document to continue.`
                                    : `This policy requires a supporting document only for leave longer than ${documentAfterDays} days.`}
                            </Alert>
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
                            slotProps={{ htmlInput: {
                                maxLength: 500,
                            } }}
                            helperText={`${leaveForm.reason.length}/500`}
                        />


                        {/* DOCUMENT */}

                        {(requiresDocument || editingLeave?.documentPath) && (

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
                                    {editingLeave?.documentPath
                                        ? "You can keep the existing document or choose a new document to replace it."
                                        : "This leave type requires a supporting document."}
                                </Typography>


                                {editingLeave?.documentPath && !leaveForm.document && (
                                    <Typography
                                        sx={{
                                            fontSize: 12,
                                            color: "#475569",
                                            mb: 1,
                                        }}
                                    >
                                        Existing document attached. Choose a new file below to replace it.
                                    </Typography>
                                )}

                                <Button
                                    variant="outlined"
                                    component="label"
                                    disabled={
                                        submittingLeave
                                    }
                                >

                                    Choose Document

                                    <MuiInputMigration
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
                                        <MuiText component="strong" variant="inherit">
                                            {
                                                leaveForm
                                                    .document
                                                    .name
                                            }
                                        </MuiText>

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


                    {canCreate && (
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
                                    ? (editingLeave ? "Updating..." : "Submitting...")
                                    : (editingLeave ? "Update Request" : "Submit Request")
                            }
                        </Button>
                    )}

                </DialogActions>

            </Dialog>
{/* =========================================================
    VIEW LEAVE DETAILS DIALOG
========================================================= */}

<Dialog
    className="my-leave-details-dialog"
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
            <MuiLayoutBox
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "18px",
                    paddingTop: "5px",
                }}
             component="div">

                {/* Leave Type */}
                <MuiLayoutBox component="div">
                    <MuiLayoutBox
                        style={{
                            fontSize: "12px",
                            color: "#64748b",
                            marginBottom: "5px",
                        }}
                     component="div">
                        Leave Type
                    </MuiLayoutBox>

                    <MuiLayoutBox
                        style={{
                            fontSize: "15px",
                            fontWeight: 600,
                            color: "#1e293b",
                        }}
                     component="div">
                        {getLeaveTypeName(
                            selectedLeave.leaveTypeId
                        )}
                    </MuiLayoutBox>
                </MuiLayoutBox>

                {/* Date */}
                <MuiLayoutBox
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "1fr 1fr",
                        gap: "20px",
                    }}
                 component="div">

                    <MuiLayoutBox component="div">
                        <MuiLayoutBox
                            style={{
                                fontSize: "12px",
                                color: "#64748b",
                                marginBottom: "5px",
                            }}
                         component="div">
                            From Date
                        </MuiLayoutBox>

                        <MuiLayoutBox
                            style={{
                                fontSize: "15px",
                                fontWeight: 600,
                                color: "#1e293b",
                            }}
                         component="div">
                            {formatDate(
                                selectedLeave.fromDate
                            )}
                        </MuiLayoutBox>
                    </MuiLayoutBox>

                    <MuiLayoutBox component="div">
                        <MuiLayoutBox
                            style={{
                                fontSize: "12px",
                                color: "#64748b",
                                marginBottom: "5px",
                            }}
                         component="div">
                            To Date
                        </MuiLayoutBox>

                        <MuiLayoutBox
                            style={{
                                fontSize: "15px",
                                fontWeight: 600,
                                color: "#1e293b",
                            }}
                         component="div">
                            {formatDate(
                                selectedLeave.toDate
                            )}
                        </MuiLayoutBox>
                    </MuiLayoutBox>

                </MuiLayoutBox>

                {/* Duration */}
                <MuiLayoutBox component="div">
                    <MuiLayoutBox
                        style={{
                            fontSize: "12px",
                            color: "#64748b",
                            marginBottom: "5px",
                        }}
                     component="div">
                        Duration
                    </MuiLayoutBox>

                    <MuiLayoutBox
                        style={{
                            fontSize: "15px",
                            fontWeight: 600,
                            color: "#1e293b",
                        }}
                     component="div">
                        {getEffectiveLeaveDays(
                            selectedLeave
                        )}{" "}
                        Day(s)
                    </MuiLayoutBox>
                </MuiLayoutBox>

                {/* Status */}
                <MuiLayoutBox component="div">
                    <MuiLayoutBox
                        style={{
                            fontSize: "12px",
                            color: "#64748b",
                            marginBottom: "5px",
                        }}
                     component="div">
                        Status
                    </MuiLayoutBox>

                    <MuiText
                        className={`leave-status ${getStatusClass(
                            selectedLeave.status
                        )}`}
                     component="span" variant="inherit">
                        {selectedLeave.status}
                    </MuiText>
                </MuiLayoutBox>

                {/* APPROVAL / REJECTION DETAILS */}

                {String(selectedLeave.status || "").toLowerCase() === "approved" && (
                    <MuiLayoutBox
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "20px",
                        }}
                     component="div">
                        <MuiLayoutBox component="div">
                            <MuiLayoutBox
                                style={{
                                    fontSize: "12px",
                                    color: "#64748b",
                                    marginBottom: "5px",
                                }}
                             component="div">
                                Approved By
                            </MuiLayoutBox>

                            <MuiLayoutBox
                                style={{
                                    fontSize: "15px",
                                    fontWeight: 600,
                                    color: "#1e293b",
                                }}
                             component="div">
                                {selectedLeave.approvedByName ||
 selectedLeave.ApprovedByName ||
 selectedLeave.approvedByEmployeeName ||
 selectedLeave.ApprovedByEmployeeName ||
 selectedLeave.approvedBy ||
 selectedLeave.ApprovedBy ||
 "-"}
                            </MuiLayoutBox>
                        </MuiLayoutBox>

                        <MuiLayoutBox component="div">
                            <MuiLayoutBox
                                style={{
                                    fontSize: "12px",
                                    color: "#64748b",
                                    marginBottom: "5px",
                                }}
                             component="div">
                                Approved Date
                            </MuiLayoutBox>

                            <MuiLayoutBox
                                style={{
                                    fontSize: "15px",
                                    fontWeight: 600,
                                    color: "#1e293b",
                                }}
                             component="div">
                                {selectedLeave.approvedDate
                                    ? new Date(
                                          selectedLeave.approvedDate
                                      ).toLocaleString("en-IN", {
                                          day: "2-digit",
                                          month: "short",
                                          year: "numeric",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                          hour12: true,
                                      })
                                    : "-"}
                            </MuiLayoutBox>
                        </MuiLayoutBox>
                    </MuiLayoutBox>
                )}

                {String(selectedLeave.status || "").toLowerCase() === "rejected" && (
                    <MuiLayoutBox
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "20px",
                        }}
                     component="div">
                        <MuiLayoutBox component="div">
                            <MuiLayoutBox
                                style={{
                                    fontSize: "12px",
                                    color: "#64748b",
                                    marginBottom: "5px",
                                }}
                             component="div">
                                Rejected By
                            </MuiLayoutBox>

                            <MuiLayoutBox
                                style={{
                                    fontSize: "15px",
                                    fontWeight: 600,
                                    color: "#1e293b",
                                }}
                             component="div">
                                {selectedLeave.rejectedByName ||
 selectedLeave.RejectedByName ||
 selectedLeave.rejectedByEmployeeName ||
 selectedLeave.RejectedByEmployeeName ||
 "-"}
                            </MuiLayoutBox>
                        </MuiLayoutBox>

                        <MuiLayoutBox component="div">
                            <MuiLayoutBox
                                style={{
                                    fontSize: "12px",
                                    color: "#64748b",
                                    marginBottom: "5px",
                                }}
                             component="div">
                                Rejected Date
                            </MuiLayoutBox>

                            <MuiLayoutBox
                                style={{
                                    fontSize: "15px",
                                    fontWeight: 600,
                                    color: "#1e293b",
                                }}
                             component="div">
                                {selectedLeave.rejectedDate
                                    ? new Date(
                                          selectedLeave.rejectedDate
                                      ).toLocaleString("en-IN", {
                                          day: "2-digit",
                                          month: "short",
                                          year: "numeric",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                          hour12: true,
                                      })
                                    : "-"}
                            </MuiLayoutBox>
                        </MuiLayoutBox>
                    </MuiLayoutBox>
                )}

                {/* Reason */}
                <MuiLayoutBox component="div">
                    <MuiLayoutBox
                        style={{
                            fontSize: "12px",
                            color: "#64748b",
                            marginBottom: "5px",
                        }}
                     component="div">
                        Reason
                    </MuiLayoutBox>

                    <MuiLayoutBox
                        style={{
                            background: "#f8fafc",
                            border: "1px solid #e2e8f0",
                            borderRadius: "8px",
                            padding: "12px",
                            fontSize: "14px",
                            color: "#334155",
                            minHeight: "60px",
                        }}
                     component="div">
                        {selectedLeave.reason ||
                            "No reason provided."}
                    </MuiLayoutBox>
                </MuiLayoutBox>

                {/* Supporting Document */}
                {selectedLeave.documentPath && (
                    <MuiLayoutBox component="div">
                        <MuiLayoutBox
                            style={{
                                fontSize: "12px",
                                color: "#64748b",
                                marginBottom: "8px",
                            }}
                         component="div">
                            Supporting Document
                        </MuiLayoutBox>

                        <MuiLayoutBox
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: "12px",
                                padding: "12px 14px",
                                border: "1px solid #e2e8f0",
                                borderRadius: "8px",
                                background: "#f8fafc",
                            }}
                         component="div">
                            <Typography
                                sx={{
                                    fontSize: "14px",
                                    fontWeight: 600,
                                    color: "#334155",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                Attached Document
                            </Typography>

                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={
                                    documentLoading ? (
                                        <CircularProgress size={16} />
                                    ) : (
                                        <VisibilityIcon />
                                    )
                                }
                                onClick={handleViewLeaveDocument}
                                disabled={documentLoading}
                            >
                                {documentLoading
                                    ? "Opening..."
                                    : "View Document"}
                            </Button>
                        </MuiLayoutBox>

                        {documentError && (
                            <Alert
                                severity="error"
                                sx={{ mt: 1 }}
                            >
                                {documentError}
                            </Alert>
                        )}
                    </MuiLayoutBox>
                )}

            </MuiLayoutBox>
        )}

    </DialogContent>






    <DialogActions
        sx={{
            padding: "12px 20px",
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
        }}
    >
        {canEdit &&
            String(selectedLeave?.status || "")
                .toLowerCase() === "pending" && (
            <Button
                onClick={() => handleEditLeave(selectedLeave)}
                variant="outlined"
                startIcon={<EditIcon />}
                sx={{
                    textTransform: "none",
                    borderRadius: "8px",
                    fontWeight: 600,
                }}
            >
                Edit
            </Button>
        )}

        <Button
            onClick={closeViewLeaveDialog}
            variant="contained"
        >
            Close
        </Button>
    </DialogActions>

</Dialog>
        </MuiLayoutBox>
    );
};


export default Leave;

