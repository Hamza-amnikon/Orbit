import { MuiButtonMigration, MuiTableBodyMigration, MuiTableCellMigration, MuiTableHeadMigration, MuiTableMigration, MuiTableRowMigration } from "../../../components/ui/MuiCompat.jsx";
import "./Attendance.css";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Paper,
    IconButton,
    Typography,
    Menu,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Tooltip,
} from "@mui/material";

import {
    AccessTimeOutlined,
    CalendarMonthOutlined,
    CheckCircle,
    EventBusyOutlined,
    RefreshOutlined,
    ScheduleOutlined,
    LoginOutlined,
    LogoutOutlined,
    ChevronLeftOutlined,
    ChevronRightOutlined,
    DownloadOutlined,
    ArrowBackRounded,
    MoreHorizOutlined,
    WeekendOutlined,
    HistoryOutlined,
} from "@mui/icons-material";

import { getProfile } from "../../Services/ProfileService";
import AttendanceService from "../../Services/AttendanceService";
import { useAuth } from "../../../context/AuthContext";
import { Box as MuiLayoutBox, Typography as MuiText } from "@mui/material";
import { exportRowsToExcel } from "../../../utils/exportExcel";
import { getAttendanceStatusForDuration } from "../AttendanceLogs/attendanceRules";


function Attendance() {
    const navigate = useNavigate();
    const { hasPermission } = useAuth();

    const permissionRoute = "/attendance/my-attendance";

    const canView = hasPermission(permissionRoute, "view");
    const canExport = hasPermission(permissionRoute, "export");


    const [profile, setProfile] = useState(null);
    const [attendance, setAttendance] = useState([]);
    const [todayAttendance, setTodayAttendance] = useState(null);
    const [shiftAssignment, setShiftAssignment] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [calendarDate, setCalendarDate] =
        useState(new Date());

    const [selectedDate, setSelectedDate] =
        useState(new Date());
    const [regularizationRequests, setRegularizationRequests] = useState([]);
    const [actionAnchor, setActionAnchor] = useState(null);
    const [actionRecord, setActionRecord] = useState(null);
    const [regularizationRecord, setRegularizationRecord] = useState(null);
    const [regularizationForm, setRegularizationForm] = useState({ checkIn: "", checkOut: "", reason: "" });
    const [submittingRegularization, setSubmittingRegularization] = useState(false);
    const [regularizationMessage, setRegularizationMessage] = useState("");

    const handleExport = async () => {
        try {
            await exportRowsToExcel(attendance, [
                ["Date", (row) => row.attendanceDate ? new Date(row.attendanceDate).toLocaleDateString("en-GB") : ""],
                ["Shift", "shift"], ["Check In", "checkIn"], ["Check Out", "checkOut"], ["Total Hours", "totalHours"], ["Status", "status"],
            ], "My-Attendance.xlsx", "My Attendance");
        } catch (exportError) {
            console.error("Attendance export error", exportError);
            setError("Could not export your attendance records.");
        }
    };


    /* =========================================================
       LOAD ATTENDANCE
    ========================================================= */

    const loadAttendance = async () => {

        try {

            setLoading(true);
            setError("");

            const employee = await getProfile();

            console.log(
                "Attendance Profile:",
                employee
            );

            setProfile(employee);

            const employeeId =
                employee?.employeeId ||
                employee?.employeeID ||
                employee?.id;

            console.log(
                "Logged-in Employee ID:",
                employeeId
            );

            if (!employeeId) {
                throw new Error(
                    "Employee ID was not found."
                );
            }

            /* =================================================
               LOAD ASSIGNED SHIFT

               The Shift API is the source of truth for the
               employee's weekly offs.  Match using the strongest
               identity available because EmployeeService and
               ShiftService can have different internal IDs.
            ================================================= */
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
                    [employee?.firstName, employee?.lastName]
                        .filter(Boolean)
                        .join(" ");

                const normalizeIdentity = (value) =>
                    String(value ?? "")
                        .trim()
                        .toLowerCase();

                const today = new Date();
                const todayOnly = new Date(
                    today.getFullYear(),
                    today.getMonth(),
                    today.getDate()
                );

                const activeShifts = shifts.filter((shift) => {
                    if (
                        shift?.status &&
                        normalizeIdentity(shift.status) !== "active"
                    ) {
                        return false;
                    }

                    const from = shift?.fromDate
                        ? new Date(shift.fromDate)
                        : null;
                    const to = shift?.toDate
                        ? new Date(shift.toDate)
                        : null;

                    if (from && !Number.isNaN(from.getTime())) {
                        from.setHours(0, 0, 0, 0);
                        if (todayOnly < from) return false;
                    }

                    if (to && !Number.isNaN(to.getTime())) {
                        to.setHours(23, 59, 59, 999);
                        if (todayOnly > to) return false;
                    }

                    return true;
                });

                const rankedShifts = activeShifts
                    .map((shift) => {
                        const shiftEmployeeId =
                            shift?.employeeId;
                        const shiftAzureEmployeeId =
                            shift?.azureEmployeeId ??
                            shift?.azureEmployeeID;

                        let score = 0;

                        if (
                            shiftEmployeeId != null &&
                            Number(shiftEmployeeId) === Number(employeeId)
                        ) {
                            score += 100;
                        }

                        if (
                            profileAzureEmployeeId != null &&
                            normalizeIdentity(shiftAzureEmployeeId) ===
                                normalizeIdentity(profileAzureEmployeeId)
                        ) {
                            score += 200;
                        }

                        if (
                            profileCode &&
                            normalizeIdentity(shift?.employeeCode) ===
                                normalizeIdentity(profileCode)
                        ) {
                            score += 20;
                        }

                        if (
                            profileName &&
                            normalizeIdentity(shift?.employeeName) ===
                                normalizeIdentity(profileName)
                        ) {
                            score += 50;
                        }

                        return { shift, score };
                    })
                    .filter((item) => item.score > 0)
                    .sort((a, b) => b.score - a.score);

                const matchedShift =
                    rankedShifts[0]?.shift || null;

                console.log(
                    "Assigned Shift:",
                    matchedShift
                );

                setShiftAssignment(matchedShift);
            } catch (shiftError) {
                console.warn(
                    "Unable to load assigned shift:",
                    shiftError
                );
                setShiftAssignment(null);
            }

            const data =
                await AttendanceService.getEmployeeAttendance(
                    employeeId
                );

            console.log(
                "Employee Attendance:",
                data
            );

            const attendanceData =
                Array.isArray(data)
                    ? data
                    : [];

            setAttendance(attendanceData);

            try {
                const requests = await AttendanceService.getEmployeeRegularizationRequests(employeeId);
                setRegularizationRequests(Array.isArray(requests) ? requests : []);
            } catch (requestError) {
                console.warn("Unable to load regularization requests:", requestError);
                setRegularizationRequests([]);
            }


            /* =================================================
               TODAY
            ================================================= */

            const now = new Date();

            const todayString =
                `${now.getFullYear()}-${String(
                    now.getMonth() + 1
                ).padStart(2, "0")}-${String(
                    now.getDate()
                ).padStart(2, "0")}`;


            const todaysRecord =
                attendanceData.find((item) => {

                    const value =
                        item?.attendanceDate ||
                        item?.date ||
                        item?.createdAt ||
                        item?.checkIn ||
                        item?.checkInTime;

                    if (!value) {
                        return false;
                    }

                    const date =
                        new Date(value);

                    if (
                        Number.isNaN(
                            date.getTime()
                        )
                    ) {
                        return false;
                    }

                    const recordString =
                        `${date.getFullYear()}-${String(
                            date.getMonth() + 1
                        ).padStart(2, "0")}-${String(
                            date.getDate()
                        ).padStart(2, "0")}`;

                    return (
                        recordString ===
                        todayString
                    );
                });


            console.log(
                "Today's Attendance:",
                todaysRecord
            );

            setTodayAttendance(
                todaysRecord || null
            );

        }
        catch (err) {

            console.error(
                "Attendance Error:",
                err
            );

            setError(
                err?.message ||
                "Unable to load attendance."
            );

            setAttendance([]);
            setTodayAttendance(null);

        }
        finally {

            setLoading(false);

        }

    };

    const attendanceDateKey = (value) =>
        String(value ?? "").match(/^\d{4}-\d{2}-\d{2}/)?.[0] ?? null;

    const requestForAttendance = (item) => {
        const attendanceId = Number(item?.attendanceId ?? item?.id);
        const attendanceDate = attendanceDateKey(item?.attendanceDate ?? item?.date);

        return regularizationRequests.find((request) =>
            (attendanceId > 0 && Number(request.attendanceId) === attendanceId) ||
            (attendanceDate && attendanceDateKey(request.attendanceDate) === attendanceDate)
        );
    };

    const openRowActions = (event, item) => {
        setActionAnchor(event.currentTarget);
        setActionRecord(item);
    };

    const closeRowActions = () => {
        setActionAnchor(null);
        setActionRecord(null);
    };

    const openRegularizationForm = (item = actionRecord) => {
        closeRowActions();
        if (!item) return;
        const normalizeTime = (value) => {
            if (!value || value === "-") return "";
            const match = String(value).match(/(\d{1,2}:\d{2})/);
            return match ? match[1].padStart(5, "0") : "";
        };
        const currentCheckIn = normalizeTime(getCheckIn(item));
        const currentCheckOut = normalizeTime(getCheckOut(item));
        setRegularizationRecord(item);
        setRegularizationForm({
            checkIn: currentCheckIn,
            // If the recorded punches resolve to the same minute, ask the
            // employee to enter the corrected checkout instead of suggesting
            // an invalid zero-length workday.
            checkOut: currentCheckIn && currentCheckIn === currentCheckOut ? "" : currentCheckOut,
            reason: "",
        });
        setRegularizationMessage("");
    };

    const submitRegularization = async () => {
        const attendanceId = regularizationRecord?.attendanceId ?? regularizationRecord?.id;
        const employeeId = profile?.employeeId ?? profile?.employeeID ?? profile?.id;
        if (!attendanceId || !employeeId) {
            setRegularizationMessage("Could not identify this attendance record. Refresh and try again.");
            return;
        }
        if (!regularizationForm.checkIn || !regularizationForm.checkOut || !regularizationForm.reason.trim()) {
            setRegularizationMessage("Enter the corrected check-in and check-out times and explain the reason.");
            return;
        }
        if (regularizationForm.checkIn === regularizationForm.checkOut) {
            setRegularizationMessage("Check-in and check-out must be different times.");
            return;
        }
        try {
            setSubmittingRegularization(true);
            setRegularizationMessage("");
            await AttendanceService.createRegularizationRequest({
                attendanceId: Number(attendanceId),
                employeeId: Number(employeeId),
                requestedCheckIn: regularizationForm.checkIn,
                requestedCheckOut: regularizationForm.checkOut,
                reason: regularizationForm.reason.trim(),
            });
            setRegularizationRecord(null);
            await loadAttendance();
        } catch (submitError) {
            setRegularizationMessage(submitError?.message || "Could not submit the request.");
        } finally {
            setSubmittingRegularization(false);
        }
    };


    useEffect(() => {
        if (!canView) return;

        loadAttendance();
        const refreshWhenVisible = () => {
            if (document.visibilityState === "visible") loadAttendance();
        };
        const timer = window.setInterval(refreshWhenVisible, 30000);
        document.addEventListener("visibilitychange", refreshWhenVisible);
        return () => {
            window.clearInterval(timer);
            document.removeEventListener("visibilitychange", refreshWhenVisible);
        };
    }, [canView]);


    /* =========================================================
       HELPERS
    ========================================================= */

    const getStatus = (item) => {

        const status = item?.status || item?.attendanceStatus || "Not Marked";
        return getAttendanceStatusForDuration(
            status,
            item?.checkIn || item?.checkInTime || item?.inTime,
            item?.checkOut || item?.checkOutTime || item?.outTime,
            item?.totalHours
        );

    };


    const getCheckIn = (item) => {

        return (
            item?.checkIn ||
            item?.checkInTime ||
            item?.inTime ||
            "-"
        );

    };


    const getCheckOut = (item) => {

        return (
            item?.checkOut ||
            item?.checkOutTime ||
            item?.outTime ||
            "-"
        );

    };


    const getDateValue = (item) => {

        return (
            item?.attendanceDate ||
            item?.date ||
            item?.createdAt
        );

    };


    const getDate = (item) => {

        const value =
            getDateValue(item);

        if (!value) {
            return "-";
        }

        const date =
            new Date(value);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return value;
        }

        return date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );

    };


    const getDay = (item) => {

        const value =
            getDateValue(item);

        if (!value) {
            return "-";
        }

        const date =
            new Date(value);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return "-";
        }

        return date.toLocaleDateString(
            "en-US",
            {
                weekday: "short",
            }
        );

    };


    const getWorkingHours = (item) => {

        return (
            item?.workingHours ||
            item?.totalHours ||
            item?.hours ||
            "-"
        );

    };


    /* =========================================================
       ASSIGNED WEEKENDS
    ========================================================= */

    const assignedWeekendDays = useMemo(() => {
        const values = [
            shiftAssignment?.weeklyOff1,
            shiftAssignment?.weeklyOff2,
        ]
            .filter(Boolean)
            .map((value) => String(value).trim())
            .filter((value, index, array) =>
                array.findIndex(
                    (item) =>
                        item.toLowerCase() ===
                        value.toLowerCase()
                ) === index
            );

        return values;
    }, [shiftAssignment]);

    const isAssignedWeekend = (date) => {
        if (!date || assignedWeekendDays.length === 0) {
            return false;
        }

        const weekday = date.toLocaleDateString(
            "en-US",
            { weekday: "long" }
        );

        return assignedWeekendDays.some(
            (day) =>
                day.toLowerCase() ===
                weekday.toLowerCase()
        );
    };

    const getAssignedWeekendLabel = () => {
        if (assignedWeekendDays.length === 0) {
            return "Not assigned";
        }

        return assignedWeekendDays.join(" & ");
    };


    /* =========================================================
       SUMMARY
    ========================================================= */

    const summary = useMemo(() => {

        let present = 0;
        let absent = 0;
        let leave = 0;
        let halfDay = 0;

        attendance.forEach((item) => {

            const status =
                String(
                    getStatus(item)
                ).toLowerCase();

            if (
                status.includes("present")
            ) {
                present++;
            }

            if (
                status.includes("absent")
            ) {
                absent++;
            }

            if (
                status.includes("leave")
            ) {
                leave++;
            }

            if (
                status.includes("half")
            ) {
                halfDay++;
            }

        });

        return {
            present,
            absent,
            leave,
            halfDay,
        };

    }, [attendance]);


    /* =========================================================
       CALENDAR
    ========================================================= */

    const calendarDays = useMemo(() => {

        const year =
            calendarDate.getFullYear();

        const month =
            calendarDate.getMonth();

        // Calendar is Monday-first. JavaScript getDay() is Sunday-first.
        const firstDay =
            (new Date(
                year,
                month,
                1
            ).getDay() + 6) % 7;

        const totalDays =
            new Date(
                year,
                month + 1,
                0
            ).getDate();

        const previousMonthDays =
            new Date(
                year,
                month,
                0
            ).getDate();

        const days = [];

        for (
            let i = firstDay - 1;
            i >= 0;
            i--
        ) {

            days.push({
                day:
                    previousMonthDays - i,
                current: false,
            });

        }

        for (
            let i = 1;
            i <= totalDays;
            i++
        ) {

            days.push({
                day: i,
                current: true,
            });

        }

        while (
            days.length < 42
        ) {

            days.push({
                day:
                    days.length -
                    totalDays -
                    firstDay +
                    1,
                current: false,
            });

        }

        return days;

    }, [calendarDate]);


    const getAttendanceForDay = (
        day
    ) => {

        const year =
            calendarDate.getFullYear();

        const month =
            calendarDate.getMonth();

        return attendance.find(
            (item) => {

                const value =
                    getDateValue(item);

                if (!value) {
                    return false;
                }

                const date =
                    new Date(value);

                return (
                    date.getFullYear() ===
                        year &&
                    date.getMonth() ===
                        month &&
                    date.getDate() ===
                        day
                );

            }
        );

    };


    const getCalendarStatus = (
        day
    ) => {

        const record =
            getAttendanceForDay(day);

        if (!record) {

            const date =
                new Date(
                    calendarDate.getFullYear(),
                    calendarDate.getMonth(),
                    day
                );

            if (isAssignedWeekend(date)) {
                return "weekend";
            }

            return "";

        }

        const status =
            String(
                getStatus(record)
            ).toLowerCase();

        if (
            status.includes("present")
        ) {
            return "present";
        }

        if (
            status.includes("absent")
        ) {
            return "absent";
        }

        if (
            status.includes("half")
        ) {
            return "half";
        }

        if (
            status.includes("leave")
        ) {
            return "leave";
        }

        return "";

    };


    const isToday = (day) => {

        const today =
            new Date();

        return (
            calendarDate.getFullYear() ===
                today.getFullYear() &&
            calendarDate.getMonth() ===
                today.getMonth() &&
            day ===
                today.getDate()
        );

    };


    const isSelected = (day) => {

        return (
            calendarDate.getFullYear() ===
                selectedDate.getFullYear() &&
            calendarDate.getMonth() ===
                selectedDate.getMonth() &&
            day ===
                selectedDate.getDate()
        );

    };


    const previousMonth = () => {

        setCalendarDate(
            new Date(
                calendarDate.getFullYear(),
                calendarDate.getMonth() - 1,
                1
            )
        );

    };


    const nextMonth = () => {

        setCalendarDate(
            new Date(
                calendarDate.getFullYear(),
                calendarDate.getMonth() + 1,
                1
            )
        );

    };


    const monthName =
        calendarDate.toLocaleDateString(
            "en-US",
            {
                month: "long",
                year: "numeric",
            }
        );


    /* =========================================================
       STATUS CHIP
    ========================================================= */

    const getStatusClass = (
        status
    ) => {

        const value =
            String(status)
                .toLowerCase();

        if (
            value.includes("present")
        ) {
            return "status-present";
        }

        if (
            value.includes("absent")
        ) {
            return "status-absent";
        }

        if (
            value.includes("half")
        ) {
            return "status-half";
        }

        if (
            value.includes("leave")
        ) {
            return "status-leave";
        }

        return "status-default";

    };


    /* =========================================================
       SELECTED DAY RECORD
    ========================================================= */

    const selectedRecord = attendance.find((item) => {
        const value = getDateValue(item);
        if (!value) return false;
        const date = new Date(value);
        return !Number.isNaN(date.getTime()) &&
            date.getFullYear() === selectedDate.getFullYear() &&
            date.getMonth() === selectedDate.getMonth() &&
            date.getDate() === selectedDate.getDate();
    });
    const selectedRegularizationStatus = String(
        requestForAttendance(selectedRecord)?.status || ""
    ).trim().toLowerCase();
    const canRequestSelectedRegularization = Boolean(
        selectedRecord &&
        selectedRegularizationStatus !== "pending" &&
        !selectedRecord.isRegularized
    );


    /* =========================================================
       LOADING
    ========================================================= */

    if (!canView) {
        return null;
    }

    if (loading) {

        return (
            <Box
                className="employee-attendance-page"
            >
                <Paper
                    className="attendance-loading"
                    elevation={0}
                >
                    <CircularProgress />
                    <Typography>
                        Loading attendance...
                    </Typography>
                </Paper>
            </Box>
        );

    }


    /* =========================================================
       UI
    ========================================================= */

    return (

        <Box className="employee-attendance-page">

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <Box className="attendance-page-header">

                <Box className="attendance-title-leading">
                    <IconButton aria-label="Back to Attendance" onClick={() => navigate("/attendance")} className="attendance-back-button"><ArrowBackRounded /></IconButton>
                    <Box>

                    <Typography
                        className="attendance-eyebrow"
                    >
                        WORKSPACE
                    </Typography>

                    <Typography
                        className="attendance-title"
                    >
                        Attendance
                    </Typography>

                    <Typography
                        className="attendance-subtitle"
                    >
                        Track your daily attendance
                        and working hours
                    </Typography>

                </Box>
                </Box>


                <Box className="attendance-header-actions">

                    <Button
                        variant="outlined"
                        startIcon={
                            <RefreshOutlined />
                        }
                        onClick={
                            loadAttendance
                        }
                        className="attendance-refresh-button"
                    >
                        Refresh
                    </Button>

                    {canExport && (
                        <Button
                            variant="outlined"
                            startIcon={
                                <DownloadOutlined />
                            }
                            className="attendance-download-button"
                            onClick={handleExport}
                        >
                            Download
                        </Button>
                    )}

                </Box>

            </Box>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
                <Alert
                    severity="warning"
                    className="attendance-alert"
                >
                    {error}
                </Alert>
            )}


            {/* =================================================
                SUMMARY
            ================================================= */}

            <Box className="attendance-summary-grid">

                <Paper
                    elevation={0}
                    className="attendance-summary-card present-card"
                >

                    <Box className="summary-icon present-icon">
                        <CheckCircle />
                    </Box>

                    <Box>
                        <MuiText component="span" variant="inherit">
                            Present Days
                        </MuiText>

                        <MuiText component="strong" variant="inherit">
                            {summary.present}
                        </MuiText>

                        <MuiText component="small" variant="caption">
                            Attendance records
                        </MuiText>
                    </Box>

                </Paper>


                <Paper
                    elevation={0}
                    className="attendance-summary-card absent-card"
                >

                    <Box className="summary-icon absent-icon">
                        <EventBusyOutlined />
                    </Box>

                    <Box>
                        <MuiText component="span" variant="inherit">
                            Absent Days
                        </MuiText>

                        <MuiText component="strong" variant="inherit">
                            {summary.absent}
                        </MuiText>

                        <MuiText component="small" variant="caption">
                            Attendance records
                        </MuiText>
                    </Box>

                </Paper>


                <Paper
                    elevation={0}
                    className="attendance-summary-card half-card"
                >

                    <Box className="summary-icon halfday-icon">
                        <ScheduleOutlined />
                    </Box>

                    <Box>
                        <MuiText component="span" variant="inherit">
                            Half Days
                        </MuiText>

                        <MuiText component="strong" variant="inherit">
                            {summary.halfDay}
                        </MuiText>

                        <MuiText component="small" variant="caption">
                            Attendance records
                        </MuiText>
                    </Box>

                </Paper>


                <Paper
                    elevation={0}
                    className="attendance-summary-card hours-card"
                >

                    <Box className="summary-icon hours-icon">
                        <AccessTimeOutlined />
                    </Box>

                    <Box>
                        <MuiText component="span" variant="inherit">
                            Total Records
                        </MuiText>

                        <MuiText component="strong" variant="inherit">
                            {attendance.length}
                        </MuiText>

                        <MuiText component="small" variant="caption">
                            This month
                        </MuiText>
                    </Box>

                </Paper>


                <Paper
                    elevation={0}
                    className="attendance-summary-card weekend-card"
                >

                    <Box className="summary-icon weekend-icon">
                        <WeekendOutlined />
                    </Box>

                    <Box className="weekend-summary-content">
                        <MuiText component="span" variant="inherit">
                            Weekly Off
                        </MuiText>

                        <MuiText className="weekend-value" component="strong" variant="inherit">
                            {getAssignedWeekendLabel()}
                        </MuiText>

                        <MuiText component="small" variant="caption">
                            Assigned in Shift Management
                        </MuiText>
                    </Box>

                </Paper>

            </Box>


            {/* =================================================
                CALENDAR + TODAY
            ================================================= */}

            <Box className="attendance-main-grid">

                {/* ================= CALENDAR ================= */}

                <Paper
                    elevation={0}
                    className="attendance-calendar-card"
                >

                    <Box className="section-title-row">

                        <Box className="section-title-left">

                            <Box className="section-blue-icon">
                                <CalendarMonthOutlined />
                            </Box>

                            <Typography>
                                Attendance Calendar
                            </Typography>

                        </Box>

                    </Box>


                    <Box className="calendar-header">

                        <Button
                            onClick={
                                previousMonth
                            }
                            className="calendar-arrow"
                        >
                            <ChevronLeftOutlined />
                        </Button>

                        <MuiText component="strong" variant="inherit">
                            {monthName}
                        </MuiText>

                        <Button
                            onClick={
                                nextMonth
                            }
                            className="calendar-arrow"
                        >
                            <ChevronRightOutlined />
                        </Button>

                    </Box>


                    <Box className="calendar-weekdays">

                        {[
                            "Mon",
                            "Tue",
                            "Wed",
                            "Thu",
                            "Fri",
                            "Sat",
                            "Sun",
                        ].map(
                            (day) => (
                                <MuiLayoutBox key={day} component="div">
                                    {day}
                                </MuiLayoutBox>
                            )
                        )}

                    </Box>


                    <Box className="calendar-grid">

                        {calendarDays.map(
                            (item, index) => {

                                if (!item.current) {

                                    return (
                                        <MuiLayoutBox
                                            key={index}
                                            className="calendar-day muted"
                                         component="div">
                                            {item.day}
                                        </MuiLayoutBox>
                                    );

                                }

                                const status =
                                    getCalendarStatus(
                                        item.day
                                    );
                                return (
                                    <MuiButtonMigration
                                        key={index}
                                        className={`
                                            calendar-day
                                            ${status}
                                            ${isToday(item.day) ? "today" : ""}
                                            ${isSelected(item.day) ? "selected" : ""}
                                        `}
                                        onClick={() => {
                                            setSelectedDate(
                                                new Date(
                                                    calendarDate.getFullYear(),
                                                    calendarDate.getMonth(),
                                                    item.day
                                                )
                                            );
                                        }}
                                    >
                                        <MuiText component="span" variant="inherit">
                                            {item.day}
                                        </MuiText>

                                        {status === "present" && (
                                            <MuiLayoutBox className="calendar-dot present-dot" component="span" />
                                        )}

                                        {status === "absent" && (
                                            <MuiLayoutBox className="calendar-dot absent-dot" component="span" />
                                        )}

                                        {status === "half" && (
                                            <MuiLayoutBox className="calendar-dot half-dot" component="span" />
                                        )}

                                        {status === "leave" && (
                                            <MuiLayoutBox className="calendar-dot leave-dot" component="span" />
                                        )}
                                    </MuiButtonMigration>
                                );

                            }
                        )}

                    </Box>


                    <Box className="calendar-legend">

                        <MuiText component="span" variant="inherit">
                            <MuiLayoutBox className="legend-dot present-dot"  component="span"/>
                            Present
                        </MuiText>

                        <MuiText component="span" variant="inherit">
                            <MuiLayoutBox className="legend-dot half-dot"  component="span"/>
                            Half Day
                        </MuiText>

                        <MuiText component="span" variant="inherit">
                            <MuiLayoutBox className="legend-dot absent-dot"  component="span"/>
                            Absent
                        </MuiText>

                        <MuiText component="span" variant="inherit">
                            <MuiLayoutBox className="legend-dot weekend-dot"  component="span"/>
                            Weekly Off
                        </MuiText>

                    </Box>

                    <Box className="calendar-selected-action">
                        <Box className="calendar-selected-details">
                            <MuiText component="strong" variant="inherit">
                                {selectedDate.toLocaleDateString("en-IN", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                })}
                            </MuiText>
                            <MuiText component="span" variant="inherit">
                                {selectedRecord ? getStatus(selectedRecord) : "No attendance record for this date."}
                            </MuiText>
                        </Box>
                        {canRequestSelectedRegularization && (
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={<HistoryOutlined />}
                                onClick={() => openRegularizationForm(selectedRecord)}
                            >
                                Request regularization
                            </Button>
                        )}
                        {selectedRegularizationStatus === "pending" && (
                            <Chip size="small" label="Regularization pending" color="warning" variant="outlined" />
                        )}
                        {selectedRecord?.isRegularized && (
                            <Chip size="small" label="Regularized" color="success" variant="outlined" />
                        )}
                    </Box>

                </Paper>


                {/* ================= TODAY ================= */}

                <Paper
                    elevation={0}
                    className="today-attendance-card"
                >

                    <Box className="today-card-header">

                        <Box>

                            <Typography>
                                Today's Attendance
                            </Typography>

                            <MuiText component="span" variant="inherit">
                                {new Date().toLocaleDateString(
                                    "en-IN",
                                    {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                    }
                                )}
                            </MuiText>

                        </Box>

                    </Box>


                    {todayAttendance ? (

                        <Box className="today-timeline">

                            <Box className="timeline-item">

                                <Box className="timeline-icon green">
                                    <LoginOutlined />
                                </Box>

                                <Box className="timeline-content">
                                    <MuiText component="strong" variant="inherit">
                                        Check In
                                    </MuiText>

                                    <MuiText component="span" variant="inherit">
                                        {getCheckIn(
                                            todayAttendance
                                        )}
                                    </MuiText>
                                </Box>

                            </Box>


                            <Box className="timeline-line" />


                            <Box className="timeline-item">

                                <Box className="timeline-icon blue">
                                    <ScheduleOutlined />
                                </Box>

                                <Box className="timeline-content">
                                    <MuiText component="strong" variant="inherit">
                                        Working Hours
                                    </MuiText>

                                    <MuiText component="span" variant="inherit">
                                        {getWorkingHours(
                                            todayAttendance
                                        )}
                                    </MuiText>
                                </Box>

                            </Box>


                            <Box className="timeline-line" />


                            <Box className="timeline-item">

                                <Box className="timeline-icon red">
                                    <LogoutOutlined />
                                </Box>

                                <Box className="timeline-content">
                                    <MuiText component="strong" variant="inherit">
                                        Check Out
                                    </MuiText>

                                    <MuiText component="span" variant="inherit">
                                        {getCheckOut(
                                            todayAttendance
                                        )}
                                    </MuiText>
                                </Box>

                            </Box>

                        </Box>

                    ) : (

                        <Box className="today-empty">

                            <Box className="today-empty-icon">
                                <AccessTimeOutlined />
                            </Box>

                            <MuiText component="strong" variant="inherit">
                                Attendance Not Marked
                            </MuiText>

                            <MuiText component="span" variant="inherit">
                                Your attendance has not
                                been recorded for today.
                            </MuiText>

                        </Box>

                    )}

                </Paper>

            </Box>


            {/* =================================================
                RECENT ATTENDANCE
            ================================================= */}

            <Paper
                elevation={0}
                className="recent-attendance-card"
            >

                <Box className="recent-header">

                    <Box className="recent-heading">
                        <Box className="recent-heading-icon"><HistoryOutlined /></Box>
                        <Box>

                        <Typography>
                            Recent Attendance
                        </Typography>

                        <MuiText component="span" variant="inherit">
                            Your latest attendance records
                        </MuiText>
                        </Box>

                    </Box>

                    <Chip
                        label={`${attendance.length} Records`}
                        className="record-count-chip"
                    />

                </Box>


                {attendance.length === 0 ? (

                    <Box className="attendance-empty">

                        <Box className="attendance-empty-icon">
                            <CalendarMonthOutlined />
                        </Box>

                        <MuiText component="strong" variant="inherit">
                            No attendance records
                        </MuiText>

                        <MuiText component="span" variant="inherit">
                            There are no attendance records
                            available for your account.
                        </MuiText>

                    </Box>

                ) : (

                    <Box className="attendance-table-wrapper">

                        <MuiTableMigration className="attendance-table">

                            <MuiTableHeadMigration>

                                <MuiTableRowMigration>

                                    <MuiTableCellMigration className="attendance-date-column">Date</MuiTableCellMigration>
                                    <MuiTableCellMigration className="attendance-day-column">Day</MuiTableCellMigration>
                                    <MuiTableCellMigration className="attendance-status-column">Status</MuiTableCellMigration>
                                    <MuiTableCellMigration className="attendance-checkin-column">Check In</MuiTableCellMigration>
                                    <MuiTableCellMigration className="attendance-checkout-column">Check Out</MuiTableCellMigration>
                                    <MuiTableCellMigration className="attendance-hours-column">Working Hours</MuiTableCellMigration>
                                    <MuiTableCellMigration className="attendance-remarks-column">Remarks</MuiTableCellMigration>
                                    <MuiTableCellMigration
                                        className="attendance-actions-column"
                                        aria-label="Row actions"
                                        title="Row actions"
                                    >
                                        ACTION
                                    </MuiTableCellMigration>

                                </MuiTableRowMigration>

                            </MuiTableHeadMigration>

                            <MuiTableBodyMigration>

                                {attendance
                                    .slice(0, 10)
                                    .map(
                                        (item, index) => {

                                            const status =
                                                getStatus(item);
                                            const regularizationRequest =
                                                requestForAttendance(item);
                                            const regularizationStatus =
                                                String(regularizationRequest?.status || "").trim().toLowerCase();
                                            const hasPendingRegularization =
                                                regularizationStatus === "pending";

                                            return (

                                                <MuiTableRowMigration
                                                    key={
                                                        item?.attendanceId ||
                                                        item?.id ||
                                                        index
                                                    }
                                                >

                                                    <MuiTableCellMigration className="attendance-date-column" data-label="Date">
                                                        <MuiText className="recent-date-value" component="strong" variant="inherit">
                                                            {getDate(
                                                                item
                                                            )}
                                                        </MuiText>
                                                    </MuiTableCellMigration>

                                                    <MuiTableCellMigration className="attendance-day-column" data-label="Day">
                                                        {getDay(
                                                            item
                                                        )}
                                                    </MuiTableCellMigration>

                                                    <MuiTableCellMigration className="attendance-status-column" data-label="Status">

                                                        <MuiText
                                                            className={`table-status ${getStatusClass(
                                                                status
                                                            )}`}
                                                         component="span" variant="inherit">

                                                            <CheckCircle />

                                                            {status}

                                                        </MuiText>

                                                    </MuiTableCellMigration>

                                                    <MuiTableCellMigration className="attendance-checkin-column" data-label="Check In">
                                                        {getCheckIn(
                                                            item
                                                        )}
                                                    </MuiTableCellMigration>

                                                    <MuiTableCellMigration className="attendance-checkout-column" data-label="Check Out">
                                                        {getCheckOut(
                                                            item
                                                        )}
                                                    </MuiTableCellMigration>

                                                    <MuiTableCellMigration className="attendance-hours-column" data-label="Working Hours">

                                                        <MuiText className="hours-value" component="strong" variant="inherit">
                                                            {getWorkingHours(
                                                                item
                                                            )}
                                                        </MuiText>

                                                    </MuiTableCellMigration>

                                                    <MuiTableCellMigration className="attendance-remarks-column" data-label="Remarks">
                                                        {hasPendingRegularization ? (
                                                            <Chip size="small" label="Approval Pending" color="warning" variant="outlined" />
                                                        ) : regularizationStatus === "approved" ? (
                                                            <Chip size="small" label="Approved" color="success" variant="outlined" />
                                                        ) : regularizationStatus === "rejected" ? (
                                                            <Chip size="small" label="Rejected" color="error" variant="outlined" />
                                                        ) : (
                                                            <Tooltip
                                                                title={String(item?.remarks || "").trim()}
                                                                arrow
                                                                placement="top"
                                                                enterDelay={300}
                                                                enterTouchDelay={0}
                                                                disableHoverListener={!String(item?.remarks || "").trim()}
                                                                disableFocusListener={!String(item?.remarks || "").trim()}
                                                                disableTouchListener={!String(item?.remarks || "").trim()}
                                                            >
                                                                <Box
                                                                    component="span"
                                                                    className="attendance-remarks-text"
                                                                    tabIndex={String(item?.remarks || "").trim() ? 0 : undefined}
                                                                    aria-label={String(item?.remarks || "").trim() || "No remarks"}
                                                                >
                                                                    {String(item?.remarks || "").trim() || "-"}
                                                                </Box>
                                                            </Tooltip>
                                                        )}
                                                    </MuiTableCellMigration>

                                                    <MuiTableCellMigration className="attendance-actions-column" data-label="Actions">

                                                        {hasPendingRegularization ? (
                                                            <Chip size="small" label="Awaiting approval" color="warning" variant="outlined" />
                                                        ) : item?.isRegularized ? (
                                                            <Chip size="small" label="Regularized" color="success" variant="outlined" />
                                                        ) : (
                                                            <MuiButtonMigration
                                                                className="table-action-button"
                                                                aria-label={`Attendance actions for ${getDate(item)}`}
                                                                onClick={(event) => openRowActions(event, item)}
                                                            >
                                                                <MoreHorizOutlined />
                                                            </MuiButtonMigration>
                                                        )}

                                                    </MuiTableCellMigration>

                                                </MuiTableRowMigration>

                                            );

                                        }
                                    )}

                            </MuiTableBodyMigration>

                        </MuiTableMigration>

                    </Box>

                )}

            </Paper>

            <Menu anchorEl={actionAnchor} open={Boolean(actionAnchor)} onClose={closeRowActions}>
                <MenuItem onClick={() => openRegularizationForm()}>
                    <HistoryOutlined fontSize="small" sx={{ mr: 1 }} /> Request attendance regularization
                </MenuItem>
            </Menu>

            <Dialog
                className="attendance-regularization-dialog"
                open={Boolean(regularizationRecord)}
                onClose={() => !submittingRegularization && setRegularizationRecord(null)}
                fullWidth
                maxWidth="sm"
                PaperProps={{
                    sx: { borderRadius: 3, overflow: "hidden" },
                }}
            >
                <DialogTitle className="attendance-regularization-title">
                    <Box className="attendance-regularization-heading">
                        <Box className="attendance-regularization-heading-icon"><HistoryOutlined /></Box>
                        <Box>
                            <Typography component="h2" className="attendance-regularization-heading-text">Request attendance correction</Typography>
                            <Typography component="p" className="attendance-regularization-heading-caption">Update a missed or incorrect punch</Typography>
                        </Box>
                    </Box>
                    <IconButton
                        aria-label="Close attendance correction form"
                        onClick={() => setRegularizationRecord(null)}
                        disabled={submittingRegularization}
                        className="attendance-regularization-close"
                    >
                        <span aria-hidden="true">×</span>
                    </IconButton>
                </DialogTitle>
                <DialogContent className="attendance-regularization-content">
                    <Box className="attendance-regularization-date">
                        <CalendarMonthOutlined />
                        <span>{regularizationRecord ? `${getDate(regularizationRecord)} · ${getDay(regularizationRecord)}` : ""}</span>
                    </Box>
                    <Box className="attendance-regularization-note">
                        Your request will go to your reporting approver. Attendance updates after approval.
                    </Box>
                    {regularizationMessage && <Alert severity="error" sx={{ mb: 2 }}>{regularizationMessage}</Alert>}
                    <Box className="attendance-regularization-fields">
                        <Box className="attendance-regularization-field">
                            <Typography component="label" htmlFor="regularization-check-in">Correct check-in <span>*</span></Typography>
                            <TextField id="regularization-check-in" aria-label="Correct check-in" type="time" value={regularizationForm.checkIn} onChange={(event) => setRegularizationForm((form) => ({ ...form, checkIn: event.target.value }))} inputProps={{ step: 60 }} size="small" fullWidth required />
                            <Typography component="small">Recorded: {getCheckIn(regularizationRecord || {}) === "-" ? "No punch" : getCheckIn(regularizationRecord || {})}</Typography>
                        </Box>
                        <Box className="attendance-regularization-field">
                            <Typography component="label" htmlFor="regularization-check-out">Correct check-out <span>*</span></Typography>
                            <TextField id="regularization-check-out" aria-label="Correct check-out" type="time" value={regularizationForm.checkOut} onChange={(event) => setRegularizationForm((form) => ({ ...form, checkOut: event.target.value }))} inputProps={{ step: 60 }} size="small" fullWidth required />
                            <Typography component="small">Recorded: {getCheckOut(regularizationRecord || {}) === "-" ? "No punch" : getCheckOut(regularizationRecord || {})}</Typography>
                        </Box>
                    </Box>
                    <Box className="attendance-regularization-field attendance-regularization-reason">
                        <Typography component="label" htmlFor="regularization-reason">Reason for correction <span>*</span></Typography>
                        <TextField id="regularization-reason" aria-label="Reason for correction" value={regularizationForm.reason} onChange={(event) => setRegularizationForm((form) => ({ ...form, reason: event.target.value }))} placeholder="Briefly explain what needs to be corrected" multiline minRows={3} fullWidth required />
                    </Box>
                </DialogContent>
                <DialogActions className="attendance-regularization-actions">
                    <Button onClick={() => setRegularizationRecord(null)} disabled={submittingRegularization}>Cancel</Button>
                    <Button variant="contained" onClick={submitRegularization} disabled={submittingRegularization}>
                        {submittingRegularization ? "Submitting…" : "Submit for approval"}
                    </Button>
                </DialogActions>
            </Dialog>

        </Box>

    );

}


export default Attendance;
