import "./Attendance.css";

import { useEffect, useMemo, useState } from "react";

import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Paper,
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
    MoreHorizOutlined,
    WeekendOutlined,
} from "@mui/icons-material";

import { getProfile } from "../../Services/ProfileService";
import AttendanceService from "../../Services/AttendanceService";


function Attendance() {

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
                    "https://localhost:7292/api/Shift",
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
        loadAttendance();
    }, []);


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

                    <Button
                        variant="outlined"
                        startIcon={
                            <DownloadOutlined />
                        }
                        className="attendance-download-button"
                    >
                        Download
                    </Button>

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
                        <span>
                            Present Days
                        </span>

                        <strong>
                            {summary.present}
                        </strong>

                        <small>
                            Attendance records
                        </small>
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
                        <span>
                            Absent Days
                        </span>

                        <strong>
                            {summary.absent}
                        </strong>

                        <small>
                            Attendance records
                        </small>
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
                        <span>
                            Half Days
                        </span>

                        <strong>
                            {summary.halfDay}
                        </strong>

                        <small>
                            Attendance records
                        </small>
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
                        <span>
                            Total Records
                        </span>

                        <strong>
                            {attendance.length}
                        </strong>

                        <small>
                            This month
                        </small>
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
                        <span>
                            Weekly Off
                        </span>

                        <strong className="weekend-value">
                            {getAssignedWeekendLabel()}
                        </strong>

                        <small>
                            Assigned in Shift Management
                        </small>
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

                        <strong>
                            {monthName}
                        </strong>

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
                                <div key={day}>
                                    {day}
                                </div>
                            )
                        )}

                    </Box>


                    <Box className="calendar-grid">

                        {calendarDays.map(
                            (item, index) => {

                                if (!item.current) {

                                    return (
                                        <div
                                            key={index}
                                            className="calendar-day muted"
                                        >
                                            {item.day}
                                        </div>
                                    );

                                }

                                const status =
                                    getCalendarStatus(
                                        item.day
                                    );

                                return (

                                    <button
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

                                        <span>
                                            {item.day}
                                        </span>

                                        {status === "present" && (
                                            <i className="calendar-dot present-dot" />
                                        )}

                                        {status === "absent" && (
                                            <i className="calendar-dot absent-dot" />
                                        )}

                                        {status === "half" && (
                                            <i className="calendar-dot half-dot" />
                                        )}

                                        {status === "leave" && (
                                            <i className="calendar-dot leave-dot" />
                                        )}

                                    </button>

                                );

                            }
                        )}

                    </Box>


                    <Box className="calendar-legend">

                        <span>
                            <i className="legend-dot present-dot" />
                            Present
                        </span>

                        <span>
                            <i className="legend-dot half-dot" />
                            Half Day
                        </span>

                        <span>
                            <i className="legend-dot absent-dot" />
                            Absent
                        </span>

                        <span>
                            <i className="legend-dot weekend-dot" />
                            Weekly Off
                        </span>

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

                            <span>
                                {new Date().toLocaleDateString(
                                    "en-IN",
                                    {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                    }
                                )}
                            </span>

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
                                    <strong>
                                        Check In
                                    </strong>

                                    <span>
                                        {getCheckIn(
                                            todayAttendance
                                        )}
                                    </span>
                                </Box>

                                <span className="timeline-badge green-badge">
                                    On Time
                                </span>

                            </Box>


                            <Box className="timeline-line" />


                            <Box className="timeline-item">

                                <Box className="timeline-icon blue">
                                    <ScheduleOutlined />
                                </Box>

                                <Box className="timeline-content">
                                    <strong>
                                        Working Hours
                                    </strong>

                                    <span>
                                        {getWorkingHours(
                                            todayAttendance
                                        )}
                                    </span>
                                </Box>

                            </Box>


                            <Box className="timeline-line" />


                            <Box className="timeline-item">

                                <Box className="timeline-icon red">
                                    <LogoutOutlined />
                                </Box>

                                <Box className="timeline-content">
                                    <strong>
                                        Check Out
                                    </strong>

                                    <span>
                                        {getCheckOut(
                                            todayAttendance
                                        )}
                                    </span>
                                </Box>

                            </Box>

                        </Box>

                    ) : (

                        <Box className="today-empty">

                            <Box className="today-empty-icon">
                                <AccessTimeOutlined />
                            </Box>

                            <strong>
                                Attendance Not Marked
                            </strong>

                            <span>
                                Your attendance has not
                                been recorded for today.
                            </span>

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

                    <Box>

                        <Typography>
                            Recent Attendance
                        </Typography>

                        <span>
                            Your latest attendance records
                        </span>

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

                        <strong>
                            No attendance records
                        </strong>

                        <span>
                            There are no attendance records
                            available for your account.
                        </span>

                    </Box>

                ) : (

                    <Box className="attendance-table-wrapper">

                        <table className="attendance-table">

                            <thead>

                                <tr>

                                    <th>Date</th>
                                    <th>Day</th>
                                    <th>Status</th>
                                    <th>Check In</th>
                                    <th>Check Out</th>
                                    <th>Working Hours</th>
                                    <th>Remarks</th>
                                    <th>Actions</th>

                                </tr>

                            </thead>

                            <tbody>

                                {attendance
                                    .slice(0, 10)
                                    .map(
                                        (item, index) => {

                                            const status =
                                                getStatus(item);

                                            return (

                                                <tr
                                                    key={
                                                        item?.attendanceId ||
                                                        item?.id ||
                                                        index
                                                    }
                                                >

                                                    <td>
                                                        <strong>
                                                            {getDate(
                                                                item
                                                            )}
                                                        </strong>
                                                    </td>

                                                    <td>
                                                        {getDay(
                                                            item
                                                        )}
                                                    </td>

                                                    <td>

                                                        <span
                                                            className={`table-status ${getStatusClass(
                                                                status
                                                            )}`}
                                                        >

                                                            <CheckCircle />

                                                            {status}

                                                        </span>

                                                    </td>

                                                    <td>
                                                        {getCheckIn(
                                                            item
                                                        )}
                                                    </td>

                                                    <td>
                                                        {getCheckOut(
                                                            item
                                                        )}
                                                    </td>

                                                    <td>

                                                        <strong className="hours-value">
                                                            {getWorkingHours(
                                                                item
                                                            )}
                                                        </strong>

                                                    </td>

                                                    <td>
                                                        -
                                                    </td>

                                                    <td>

                                                        <button
                                                            className="table-action-button"
                                                        >
                                                            <MoreHorizOutlined />
                                                        </button>

                                                    </td>

                                                </tr>

                                            );

                                        }
                                    )}

                            </tbody>

                        </table>

                    </Box>

                )}

            </Paper>

        </Box>

    );

}


export default Attendance;