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


    useEffect(() => {
        if (!canView) return;

        loadAttendance();
    }, [canView]);


    /* =========================================================
       HELPERS
    ========================================================= */

    const getStatus = (item) => {

        return (
            item?.status ||
            item?.attendanceStatus ||
            "Not Marked"
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

    const selectedRecord =
        getAttendanceForDay(
            selectedDate.getDate()
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
                                            ${isToday(item.day)
                                                ? "today"
                                                : ""
                                            }
                                            ${isSelected(item.day)
                                                ? "selected"
                                                : ""
                                            }
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
                                            <MuiLayoutBox className="calendar-dot present-dot"  component="span"/>
                                        )}

                                        {status === "absent" && (
                                            <MuiLayoutBox className="calendar-dot absent-dot"  component="span"/>
                                        )}

                                        {status === "half" && (
                                            <MuiLayoutBox className="calendar-dot half-dot"  component="span"/>
                                        )}

                                        {status === "leave" && (
                                            <MuiLayoutBox className="calendar-dot leave-dot"  component="span"/>
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

                        <Chip
                            label={
                                todayAttendance
                                    ? getStatus(
                                        todayAttendance
                                    )
                                    : "Not Marked"
                            }
                            className={
                                todayAttendance
                                    ? getStatusClass(
                                        getStatus(
                                            todayAttendance
                                        )
                                    )
                                    : "status-default"
                            }
                        />

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

                                <MuiText className="timeline-badge green-badge" component="span" variant="inherit">
                                    On Time
                                </MuiText>

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

                                    <MuiTableCellMigration>Date</MuiTableCellMigration>
                                    <MuiTableCellMigration>Day</MuiTableCellMigration>
                                    <MuiTableCellMigration>Status</MuiTableCellMigration>
                                    <MuiTableCellMigration>Check In</MuiTableCellMigration>
                                    <MuiTableCellMigration>Check Out</MuiTableCellMigration>
                                    <MuiTableCellMigration>Working Hours</MuiTableCellMigration>
                                    <MuiTableCellMigration>Remarks</MuiTableCellMigration>
                                    <MuiTableCellMigration>Actions</MuiTableCellMigration>

                                </MuiTableRowMigration>

                            </MuiTableHeadMigration>

                            <MuiTableBodyMigration>

                                {attendance
                                    .slice(0, 10)
                                    .map(
                                        (item, index) => {

                                            const status =
                                                getStatus(item);

                                            return (

                                                <MuiTableRowMigration
                                                    key={
                                                        item?.attendanceId ||
                                                        item?.id ||
                                                        index
                                                    }
                                                >

                                                    <MuiTableCellMigration>
                                                        <MuiText className="recent-date-value" component="strong" variant="inherit">
                                                            {getDate(
                                                                item
                                                            )}
                                                        </MuiText>
                                                    </MuiTableCellMigration>

                                                    <MuiTableCellMigration>
                                                        {getDay(
                                                            item
                                                        )}
                                                    </MuiTableCellMigration>

                                                    <MuiTableCellMigration>

                                                        <MuiText
                                                            className={`table-status ${getStatusClass(
                                                                status
                                                            )}`}
                                                         component="span" variant="inherit">

                                                            <CheckCircle />

                                                            {status}

                                                        </MuiText>

                                                    </MuiTableCellMigration>

                                                    <MuiTableCellMigration>
                                                        {getCheckIn(
                                                            item
                                                        )}
                                                    </MuiTableCellMigration>

                                                    <MuiTableCellMigration>
                                                        {getCheckOut(
                                                            item
                                                        )}
                                                    </MuiTableCellMigration>

                                                    <MuiTableCellMigration>

                                                        <MuiText className="hours-value" component="strong" variant="inherit">
                                                            {getWorkingHours(
                                                                item
                                                            )}
                                                        </MuiText>

                                                    </MuiTableCellMigration>

                                                    <MuiTableCellMigration>
                                                        -
                                                    </MuiTableCellMigration>

                                                    <MuiTableCellMigration>

                                                        <MuiButtonMigration
                                                            className="table-action-button"
                                                        >
                                                            <MoreHorizOutlined />
                                                        </MuiButtonMigration>

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

        </Box>

    );

}


export default Attendance;
