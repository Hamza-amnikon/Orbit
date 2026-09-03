import "./AttendanceChart.css";

import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Cell,
    ResponsiveContainer
} from "recharts";

import {
    FormControl,
    Select,
    MenuItem
} from "@mui/material";

import { getProfile } from "../../Services/ProfileService";
/*
 * Adjust this path to match your actual folder
 * structure — this mirrors the getProfile import
 * above. Your Leave.jsx imports it as "./LeaveService"
 * because it sits in the same folder as LeaveService.js.
 */
import LeaveService from "../../Services/LeaveService";


/* =========================================================
   API
========================================================= */

const SHIFT_API_URL =
    "https://localhost:7292/api/Shift";


/* =========================================================
   COMPONENT
========================================================= */

function AttendanceChart({
    attendance = [],
    loading = false,

    /*
     * If parent already provides the assigned shift,
     * it will be used directly.
     */
    shift = null,

    /*
     * Optional direct employee id.
     */
    employeeId = null,

    /*
     * Optional direct weekly offs.
     */
    weeklyOffs = []
}) {

    const today = new Date();

    const [month, setMonth] =
        useState(today.getMonth());

    const year =
        today.getFullYear();


    /* =========================================================
       SHIFT STATE
    ========================================================= */

    const [resolvedShift, setResolvedShift] =
        useState(shift);

    const [shiftLoading, setShiftLoading] =
        useState(false);


    /* =========================================================
       APPROVED LEAVE STATE

       SOURCE OF TRUTH:
       LeaveService.getLeaves() — approved leave
       requests for this employee, keyed by every
       calendar date each request covers.
    ========================================================= */

    const [approvedLeaveDates, setApprovedLeaveDates] =
        useState(new Map());

    const [leavesLoading, setLeavesLoading] =
        useState(false);


    /* =========================================================
       MONTHS
    ========================================================= */

    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ];


    /* =========================================================
       HELPERS
    ========================================================= */

    const getDate = (record) => {

        return (
            record?.attendanceDate ??
            record?.date ??
            record?.AttendanceDate ??
            record?.Date ??
            null
        );

    };


    const getStatus = (record) => {

        return (
            record?.status ??
            record?.Status ??
            ""
        );

    };


    const getHours = (record) => {

        const value =
            record?.totalHours ??
            record?.TotalHours ??
            record?.workingHours ??
            record?.WorkingHours ??
            record?.hours ??
            record?.Hours ??
            0;


        if (typeof value === "string") {

            if (value.includes(":")) {

                const parts =
                    value.split(":");

                const hours =
                    Number(parts[0]) || 0;

                const minutes =
                    Number(parts[1]) || 0;

                return (
                    hours +
                    minutes / 60
                );

            }


            const number =
                Number(value);

            return Number.isFinite(number)
                ? number
                : 0;

        }


        return Number(value) || 0;

    };


    const normalizeStatus = (status) => {

        return String(status || "")
            .trim()
            .toLowerCase()
            .replace(/[_-]/g, " ")
            .replace(/\s+/g, " ");

    };


    /* =========================================================
       NORMALIZE SHIFT DAY
    ========================================================= */

    const normalizeDay = (value) => {

        if (!value) {
            return "";
        }

        const text =
            String(value)
                .trim()
                .toLowerCase();


        const dayMap = {

            sun: "sunday",
            sunday: "sunday",

            mon: "monday",
            monday: "monday",

            tue: "tuesday",
            tues: "tuesday",
            tuesday: "tuesday",

            wed: "wednesday",
            wednesday: "wednesday",

            thu: "thursday",
            thurs: "thursday",
            thursday: "thursday",

            fri: "friday",
            friday: "friday",

            sat: "saturday",
            saturday: "saturday"

        };


        return dayMap[text] || text;

    };


    /* =========================================================
       LOAD ASSIGNED SHIFT
       
       Shift API:
       https://localhost:7292/api/Shift
       
       The API response contains:
       
       employeeId
       employeeCode
       employeeName
       weeklyOff1
       weeklyOff2
    ========================================================= */

    useEffect(() => {

        let cancelled = false;


        async function loadShift() {

            /*
             * If parent already supplied a shift,
             * use it.
             */
            if (shift) {

                setResolvedShift(shift);

                return;

            }


            try {

                setShiftLoading(true);


                /* =================================================
                   GET PROFILE
                ================================================= */

                const profile =
                    await getProfile();


                if (cancelled) {
                    return;
                }


                const profileEmployeeId =
                    employeeId ??
                    profile?.employeeId ??
                    profile?.employeeID ??
                    profile?.id;


                const profileAzureEmployeeId =
                    profile?.azureEmployeeId ??
                    profile?.azureEmployeeID;


                const profileCode =
                    profile?.employeeCode ??
                    profile?.EmployeeCode;


                const profileName =
                    profile?.displayName ??
                    profile?.employeeName ??
                    [
                        profile?.firstName,
                        profile?.lastName
                    ]
                        .filter(Boolean)
                        .join(" ");


                console.log(
                    "Attendance Chart Employee:",
                    {
                        employeeId:
                            profileEmployeeId,
                        azureEmployeeId:
                            profileAzureEmployeeId,
                        employeeCode:
                            profileCode,
                        employeeName:
                            profileName
                    }
                );


                /* =================================================
                   GET ALL SHIFTS
                ================================================= */

                const response =
                    await fetch(
                        SHIFT_API_URL,
                        {
                            method: "GET",
                            headers: {
                                Accept:
                                    "application/json"
                            }
                        }
                    );


                if (!response.ok) {

                    throw new Error(
                        `Shift API returned ${response.status}`
                    );

                }


                const result =
                    await response.json();


                const shifts =
                    Array.isArray(result)
                        ? result
                        : [];


                console.log(
                    "Shift API Response:",
                    shifts
                );


                /* =================================================
                   NORMALIZE IDENTITY
                ================================================= */

                const normalizeIdentity =
                    (value) =>
                        String(value ?? "")
                            .trim()
                            .toLowerCase();


                /* =================================================
                   ONLY ACTIVE SHIFTS
                ================================================= */

                const activeShifts =
                    shifts.filter(
                        (item) => {

                            if (
                                item?.status &&
                                normalizeIdentity(
                                    item.status
                                ) !== "active"
                            ) {
                                return false;
                            }


                            return true;

                        }
                    );


                /* =================================================
                   MATCH EMPLOYEE
                   
                   Priority:
                   
                   1. Employee ID
                   2. Azure Employee ID
                   3. Employee Code
                   4. Employee Name
                ================================================= */

                const rankedShifts =
                    activeShifts
                        .map((item) => {

                            let score = 0;


                            const shiftEmployeeId =
                                item?.employeeId ??
                                item?.employeeID;


                            const shiftAzureEmployeeId =
                                item?.azureEmployeeId ??
                                item?.azureEmployeeID;


                            const shiftCode =
                                item?.employeeCode ??
                                item?.EmployeeCode;


                            const shiftName =
                                item?.employeeName ??
                                item?.EmployeeName;


                            /* Employee ID */

                            if (
                                profileEmployeeId !=
                                    null &&
                                shiftEmployeeId !=
                                    null &&
                                Number(
                                    shiftEmployeeId
                                ) ===
                                    Number(
                                        profileEmployeeId
                                    )
                            ) {

                                score += 100;

                            }


                            /* Azure Employee ID */

                            if (
                                profileAzureEmployeeId &&
                                normalizeIdentity(
                                    shiftAzureEmployeeId
                                ) ===
                                    normalizeIdentity(
                                        profileAzureEmployeeId
                                    )
                            ) {

                                score += 200;

                            }


                            /* Employee Code */

                            if (
                                profileCode &&
                                normalizeIdentity(
                                    shiftCode
                                ) ===
                                    normalizeIdentity(
                                        profileCode
                                    )
                            ) {

                                score += 50;

                            }


                            /* Employee Name */

                            if (
                                profileName &&
                                normalizeIdentity(
                                    shiftName
                                ) ===
                                    normalizeIdentity(
                                        profileName
                                    )
                            ) {

                                score += 20;

                            }


                            return {
                                shift: item,
                                score
                            };

                        })
                        .filter(
                            (item) =>
                                item.score > 0
                        )
                        .sort(
                            (a, b) =>
                                b.score -
                                a.score
                        );


                const matchedShift =
                    rankedShifts[0]?.shift ??
                    null;


                console.log(
                    "Attendance Chart Assigned Shift:",
                    matchedShift
                );


                if (!cancelled) {

                    setResolvedShift(
                        matchedShift
                    );

                }

            }
            catch (error) {

                console.error(
                    "Attendance Chart Shift API Error:",
                    error
                );


                if (!cancelled) {

                    setResolvedShift(null);

                }

            }
            finally {

                if (!cancelled) {

                    setShiftLoading(false);

                }

            }

        }


        loadShift();


        return () => {

            cancelled = true;

        };

    }, [
        shift,
        employeeId
    ]);


    /* =========================================================
       LOAD APPROVED LEAVES

       Same matching logic as the "My Leave Calendar"
       in Leave.jsx (getCalendarStatus): a leave counts
       for a given day if the request's employeeId
       matches, status is "Approved", and the day falls
       between fromDate and toDate inclusive.

       This exists independently of whatever the
       Attendance API says for that day, so a day can
       be flagged as Leave here even when the Attendance
       API has no record at all for it.
    ========================================================= */

    useEffect(() => {

        let cancelled = false;


        async function loadApprovedLeaves() {

            try {

                setLeavesLoading(true);


                /* =================================================
                   RESOLVE EMPLOYEE ID
                ================================================= */

                const profile =
                    await getProfile();


                if (cancelled) {
                    return;
                }


                const profileEmployeeId =
                    employeeId ??
                    profile?.employeeId ??
                    profile?.employeeID ??
                    profile?.id;


                if (profileEmployeeId == null) {

                    console.warn(
                        "Attendance Chart: no employee id resolved, skipping leave lookup."
                    );

                    if (!cancelled) {

                        setApprovedLeaveDates(
                            new Map()
                        );

                    }

                    return;

                }


                /* =================================================
                   GET ALL LEAVE REQUESTS
                ================================================= */

                const leaves =
                    await LeaveService.getLeaves();


                const myApprovedLeaves =
                    (
                        Array.isArray(leaves)
                            ? leaves
                            : []
                    ).filter(
                        (leave) =>
                            Number(
                                leave?.employeeId
                            ) ===
                                Number(
                                    profileEmployeeId
                                ) &&
                            String(
                                leave?.status || ""
                            )
                                .trim()
                                .toLowerCase() ===
                                "approved"
                    );


                console.log(
                    "Attendance Chart Approved Leaves:",
                    myApprovedLeaves
                );


                /* =================================================
                   EXPAND EACH REQUEST INTO A
                   DATE -> LEAVE MAP
                ================================================= */

                const map = new Map();


                myApprovedLeaves.forEach(
                    (leave) => {

                        const from =
                            new Date(
                                leave.fromDate
                            );

                        const to =
                            new Date(
                                leave.toDate
                            );


                        if (
                            Number.isNaN(
                                from.getTime()
                            ) ||
                            Number.isNaN(
                                to.getTime()
                            )
                        ) {

                            return;

                        }


                        const cursor =
                            new Date(
                                from.getFullYear(),
                                from.getMonth(),
                                from.getDate()
                            );

                        const end =
                            new Date(
                                to.getFullYear(),
                                to.getMonth(),
                                to.getDate()
                            );


                        while (
                            cursor <= end
                        ) {

                            const key =
                                `${cursor.getFullYear()}-${String(
                                    cursor.getMonth() + 1
                                ).padStart(2, "0")}-${String(
                                    cursor.getDate()
                                ).padStart(2, "0")}`;


                            map.set(
                                key,
                                leave
                            );


                            cursor.setDate(
                                cursor.getDate() + 1
                            );

                        }

                    }
                );


                if (!cancelled) {

                    setApprovedLeaveDates(
                        map
                    );

                }

            }
            catch (error) {

                console.error(
                    "Attendance Chart Leave API Error:",
                    error
                );


                if (!cancelled) {

                    setApprovedLeaveDates(
                        new Map()
                    );

                }

            }
            finally {

                if (!cancelled) {

                    setLeavesLoading(false);

                }

            }

        }


        loadApprovedLeaves();


        return () => {

            cancelled = true;

        };

    }, [
        employeeId
    ]);


    /* =========================================================
       WEEKLY OFF DAYS
       
       SOURCE OF TRUTH:
       Shift API weeklyOff1 / weeklyOff2
    ========================================================= */

    const weekendDays = useMemo(() => {

        const values = [];


        /* =====================================================
           DIRECT weeklyOffs PROP
        ===================================================== */

        if (
            Array.isArray(weeklyOffs)
        ) {

            weeklyOffs.forEach(
                (day) => {

                    const normalized =
                        normalizeDay(day);


                    if (normalized) {

                        values.push(
                            normalized
                        );

                    }

                }
            );

        }


        /* =====================================================
           SHIFT API
        ===================================================== */

        if (resolvedShift) {

            const off1 =
                resolvedShift?.weeklyOff1 ??
                resolvedShift?.WeeklyOff1 ??
                resolvedShift?.weekly_off1 ??
                resolvedShift?.weeklyOffDay1 ??
                resolvedShift?.WeeklyOffDay1 ??
                resolvedShift?.weekOff1 ??
                resolvedShift?.WeekOff1;


            const off2 =
                resolvedShift?.weeklyOff2 ??
                resolvedShift?.WeeklyOff2 ??
                resolvedShift?.weekly_off2 ??
                resolvedShift?.weeklyOffDay2 ??
                resolvedShift?.WeeklyOffDay2 ??
                resolvedShift?.weekOff2 ??
                resolvedShift?.WeekOff2;


            if (off1) {

                const normalized =
                    normalizeDay(off1);


                if (normalized) {

                    values.push(
                        normalized
                    );

                }

            }


            if (off2) {

                const normalized =
                    normalizeDay(off2);


                if (normalized) {

                    values.push(
                        normalized
                    );

                }

            }


            /* =================================================
               Support weeklyOffs array from API
            ================================================= */

            const arrayOffs =
                resolvedShift?.weeklyOffs ??
                resolvedShift?.WeeklyOffs ??
                resolvedShift?.weekly_offs;


            if (
                Array.isArray(arrayOffs)
            ) {

                arrayOffs.forEach(
                    (day) => {

                        const normalized =
                            normalizeDay(day);


                        if (normalized) {

                            values.push(
                                normalized
                            );

                        }

                    }
                );

            }

        }


        const unique =
            [
                ...new Set(values)
            ];


        /*
         * Only fallback to Saturday/Sunday
         * when absolutely no Shift API/direct
         * weekly-off information exists.
         */
        if (!unique.length) {

            return [
                "saturday",
                "sunday"
            ];

        }


        return unique;

    }, [
        resolvedShift,
        weeklyOffs
    ]);


    /* =========================================================
       CHECK WEEKEND
    ========================================================= */

    const isWeekend = (date) => {

        const weekday =
            date.toLocaleDateString(
                "en-US",
                {
                    weekday: "long"
                }
            ).toLowerCase();


        return weekendDays.includes(
            weekday
        );

    };


    /* =========================================================
       ATTENDANCE MAP
    ========================================================= */

    const attendanceMap = useMemo(() => {

        const map = new Map();


        if (
            !Array.isArray(attendance)
        ) {

            return map;

        }


        attendance.forEach(
            (record) => {

                const dateValue =
                    getDate(record);


                if (!dateValue) {
                    return;
                }


                const date =
                    new Date(dateValue);


                if (
                    Number.isNaN(
                        date.getTime()
                    )
                ) {

                    return;

                }


                const key =
                    `${date.getFullYear()}-${String(
                        date.getMonth() + 1
                    ).padStart(2, "0")}-${String(
                        date.getDate()
                    ).padStart(2, "0")}`;


                map.set(
                    key,
                    record
                );

            }
        );


        return map;

    }, [attendance]);


    /* =========================================================
       CHART DATA
       
       IMPORTANT:
       
       Weekend:
           Comes from Shift API.
       
       Absent:
           Comes ONLY from Attendance API.
       
       No attendance record:
           NOT Absent.
    ========================================================= */

    const chartData = useMemo(() => {

        const totalDays =
            new Date(
                year,
                month + 1,
                0
            ).getDate();


        return Array.from(
            {
                length: totalDays
            },
            (_, index) => {

                const day =
                    index + 1;


                const date =
                    new Date(
                        year,
                        month,
                        day
                    );


                const key =
                    `${year}-${String(
                        month + 1
                    ).padStart(2, "0")}-${String(
                        day
                    ).padStart(2, "0")}`;


                /* =================================================
                   WEEKEND
                   
                   Shift API decides this.
                ================================================= */

                if (
                    isWeekend(date)
                ) {

                    return {

                        day,

                        hours: 0,

                        /*
                         * Small visible grey bar.
                         */
                        displayHours: 0.65,

                        status: "Weekend",

                        isWeekend: true,

                        isAbsent: false,

                        isLeave: false,

                        isPresent: false,

                        isHalfDay: false,

                        isWfh: false,

                        date

                    };

                }


                /* =================================================
                   ATTENDANCE RECORD
                ================================================= */

                const record =
                    attendanceMap.get(key);


                /* =================================================
                   APPROVED LEAVE (Leave API)

                   Independent of the Attendance API —
                   checked here so it still applies even
                   when there is no attendance record at
                   all for this day.
                ================================================= */

                const approvedLeave =
                    approvedLeaveDates.get(key) ??
                    null;


                /* =================================================
                   NO ATTENDANCE RECORD
                   
                   DO NOT MAKE IT ABSENT.

                   But DO mark it Leave if an approved
                   leave request from the Leave API
                   covers this date.
                ================================================= */

                if (!record) {

                    if (approvedLeave) {

                        return {

                            day,

                            hours: 0,

                            displayHours: 0.65,

                            status: "Leave",

                            isWeekend: false,

                            isAbsent: false,

                            isLeave: true,

                            isPresent: false,

                            isHalfDay: false,

                            isWfh: false,

                            date,

                            leave: approvedLeave

                        };

                    }


                    return {

                        day,

                        hours: 0,

                        displayHours: 0,

                        status: "Not Marked",

                        isWeekend: false,

                        isAbsent: false,

                        isLeave: false,

                        isPresent: false,

                        isHalfDay: false,

                        isWfh: false,

                        date

                    };

                }


                /* =================================================
                   ATTENDANCE STATUS
                ================================================= */

                const rawStatus =
                    getStatus(record);


                const status =
                    normalizeStatus(
                        rawStatus
                    );


                const hours =
                    getHours(record);


                /* =================================================
                   ABSENT
                   
                   ONLY Attendance API.
                ================================================= */

                const isAbsent =
                    status === "absent" ||
                    status === "absent day" ||
                    status === "absentday" ||
                    record?.isAbsent === true ||
                    record?.IsAbsent === true;


                /* =================================================
                   LEAVE

                   Broadened to match any status containing
                   "leave" (e.g. "Leave", "On Leave",
                   "Leave Approved", "Casual Leave",
                   "Sick Leave"), plus a boolean-flag fallback
                   in case the API also/instead sends isLeave.
                ================================================= */

                const isLeave =
                    status.includes("leave") ||
                    record?.isLeave === true ||
                    record?.IsLeave === true ||
                    Boolean(approvedLeave);


                /* =================================================
                   HALF DAY
                ================================================= */

                const isHalfDay =
                    status === "half day" ||
                    status === "halfday";


                /* =================================================
                   WFH
                ================================================= */

                const isWfh =
                    status === "wfh" ||
                    status ===
                        "work from home";


                /* =================================================
                   PRESENT
                ================================================= */

                const isPresent =
                    status === "present" ||
                    status === "present day" ||
                    status === "on time" ||
                    isHalfDay ||
                    isWfh;


                let finalStatus =
                    rawStatus ||
                    "Present";


                if (isAbsent) {

                    finalStatus =
                        "Absent";

                }
                else if (isLeave) {

                    finalStatus =
                        rawStatus ||
                        "Leave";

                }
                else if (isHalfDay) {

                    finalStatus =
                        "Half Day";

                }
                else if (isWfh) {

                    finalStatus =
                        "WFH";

                }
                else if (isPresent) {

                    finalStatus =
                        "Present";

                }


                /* =================================================
                   VISUAL BAR HEIGHT
                ================================================= */

                let displayHours =
                    hours;


                /*
                 * Absent = small red bar
                 */
                if (isAbsent) {

                    displayHours =
                        0.65;

                }


                /*
                 * Leave = small orange bar
                 */
                else if (isLeave) {

                    displayHours =
                        0.65;

                }


                /*
                 * Half Day without hours
                 */
                else if (
                    isHalfDay &&
                    hours <= 0
                ) {

                    displayHours = 4;

                }


                return {

                    day,

                    /*
                     * Real working hours
                     */
                    hours,

                    /*
                     * Visual bar height
                     */
                    displayHours,

                    status: finalStatus,

                    isWeekend: false,

                    isAbsent,

                    isLeave,

                    isPresent,

                    isHalfDay,

                    isWfh,

                    date,

                    record,

                    leave: approvedLeave

                };

            }
        );

    }, [
        year,
        month,
        attendanceMap,
        weekendDays,
        approvedLeaveDates
    ]);


    /* =========================================================
       SUMMARY
    ========================================================= */

    const summary = useMemo(() => {

        let present = 0;

        let absent = 0;

        let leave = 0;

        let weekend = 0;


        chartData.forEach(
            (entry) => {

                /*
                 * WEEKEND
                 */
                if (
                    entry.isWeekend
                ) {

                    weekend++;

                    return;

                }


                /*
                 * LEAVE
                 *
                 * Use the flag computed in chartData
                 * (already broadened to match any
                 * "...leave..." status) instead of
                 * re-deriving from a normalized string
                 * here, so the summary can never
                 * disagree with the bars.
                 */
                if (
                    entry.isLeave
                ) {

                    leave++;

                    return;

                }


                /*
                 * ABSENT
                 */
                if (
                    entry.isAbsent
                ) {

                    absent++;

                    return;

                }


                /*
                 * PRESENT
                 */
                if (
                    entry.isPresent
                ) {

                    present++;

                }

            }
        );


        return {

            present,

            absent,

            leave,

            weekend

        };

    }, [chartData]);


    /* =========================================================
       BAR COLOR
    ========================================================= */

    const getBarColor = (entry) => {

        /*
         * ABSENT = RED
         */
        if (
            entry.isAbsent
        ) {

            return "#ef4444";

        }


        /*
         * LEAVE = ORANGE
         */
        if (
            entry.isLeave
        ) {

            return "#f59e0b";

        }


        /*
         * HALF DAY = ORANGE
         */
        if (
            entry.isHalfDay
        ) {

            return "#f59e0b";

        }


        /*
         * WFH = PURPLE
         */
        if (
            entry.isWfh
        ) {

            return "#8b5cf6";

        }


        /*
         * WEEKEND = GREY
         */
        if (
            entry.isWeekend
        ) {

            return "#94a3b8";

        }


        /*
         * PRESENT = GREEN
         */
        return "#22c55e";

    };


    /* =========================================================
       TOOLTIP
    ========================================================= */

    const CustomTooltip = ({
        active,
        payload
    }) => {

        if (
            !active ||
            !payload ||
            !payload.length
        ) {

            return null;

        }


        const data =
            payload[0]?.payload;


        if (!data) {
            return null;
        }


        let statusClass =
            "tooltip-present";


        if (data.isAbsent) {

            statusClass =
                "tooltip-absent";

        }
        else if (data.isWeekend) {

            statusClass =
                "tooltip-weekend";

        }
        else if (data.isLeave) {

            statusClass =
                "tooltip-leave";

        }
        else if (data.isHalfDay) {

            statusClass =
                "tooltip-half";

        }
        else if (data.isWfh) {

            statusClass =
                "tooltip-wfh";

        }


        return (

            <div className="attendance-tooltip">

                <div className="attendance-tooltip-title">

                    {months[month]} {data.day}

                </div>


                <div className="attendance-tooltip-row">

                    <span>
                        Status  :
                    </span>

                    <strong
                        className={
                             statusClass
                        }
                    >
                        {data.status}
                    </strong>

                </div>


                {data.hours > 0 && (

                    <div className="attendance-tooltip-row">

                        <span>
                            Working Hours  :
                        </span>

                        <strong>
                            {data.hours.toFixed(2)} hrs
                        </strong>

                    </div>

                )}


                {data.isAbsent && (

                    <div className="attendance-tooltip-message">

                         Absent 

                    </div>

                )}


                {data.isWeekend && (

                    <div className="attendance-tooltip-message">

                        Weekly off 

                    </div>

                )}


                {data.isLeave && (

                    <div className="attendance-tooltip-message">

                        {
                            data.leave?.reason
                                ? `Approved leave — ${data.leave.reason}`
                                : "Approved leave"
                        }

                    </div>

                )}

            </div>

        );

    };


    /* =========================================================
       RENDER
    ========================================================= */

    return (

        <div className="attendance-card">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="attendance-header">

                <div className="attendance-heading">

                    <div className="attendance-heading-icon">

                    </div>


                    <div>

                        <h2>
                            Attendance Overview
                        </h2>

                        <p>
                            Track your daily attendance and working hours
                        </p>

                    </div>

                </div>


                <FormControl
                    size="small"
                    className="attendance-month-select"
                >

                    <Select
                        value={month}
                        onChange={(event) =>
                            setMonth(
                                Number(
                                    event.target.value
                                )
                            )
                        }
                    >

                        {months.map(
                            (
                                monthName,
                                index
                            ) => (

                                <MenuItem
                                    key={index}
                                    value={index}
                                >
                                    {monthName}
                                </MenuItem>

                            )
                        )}

                    </Select>

                </FormControl>

            </div>


            {/* =================================================
                LEGEND
            ================================================= */}

            <div className="attendance-legend">

                <span>

                    <i className="legend-dot present-dot" />

                    Present

                </span>


                <span>

                    <i className="legend-dot absent-dot" />

                    Absent

                </span>


                <span>

                    <i className="legend-dot leave-dot" />

                    Leave

                </span>


                <span>

                    <i className="legend-dot wfh-dot" />

                    WFH

                </span>


                <span>

                    <i className="legend-dot weekend-dot" />

                    Weekend

                </span>

            </div>


            {/* =================================================
                CHART
            ================================================= */}

            <div className="attendance-chart-container">

                {loading || shiftLoading || leavesLoading ? (

                    <div className="attendance-loading">

                        Loading attendance...

                    </div>

                ) : (

                    <ResponsiveContainer
                        width="100%"
                        height={340}
                        minWidth={300}
                        minHeight={300}
                    >

                        <BarChart
                            data={chartData}
                            margin={{
                                top: 18,
                                right: 12,
                                left: 8,
                                bottom: 55
                            }}
                            barCategoryGap="22%"
                        >


                            {/* =================================================
                                GRID
                            ================================================= */}

                            <CartesianGrid
                                vertical={false}
                                stroke="#e2e8f0"
                                strokeDasharray="4 4"
                            />


                            {/* =================================================
                                X AXIS
                            ================================================= */}

                            <XAxis
                                dataKey="day"
                                interval={0}
                                height={70}
                                tickMargin={10}
                                axisLine={{
                                    stroke:
                                        "#cbd5e1"
                                }}
                                tickLine={false}
                                tick={({
                                    x,
                                    y,
                                    payload
                                }) => {

                                    const date =
                                        new Date(
                                            year,
                                            month,
                                            payload.value
                                        );


                                    const weekday =
                                        date.toLocaleDateString(
                                            "en-US",
                                            {
                                                weekday:
                                                    "short"
                                            }
                                        );


                                    const weekend =
                                        isWeekend(
                                            date
                                        );


                                    return (

                                        <g
                                            transform={
                                                `translate(${x},${y})`
                                            }
                                        >

                                            <text
                                                x={0}
                                                y={0}
                                                dy={12}
                                                textAnchor="middle"
                                                fill={
                                                    weekend
                                                        ? "#94a3b8"
                                                        : "#64748b"
                                                }
                                                fontSize={10}
                                                fontWeight={500}
                                            >
                                                {weekday}
                                            </text>


                                            <text
                                                x={0}
                                                y={0}
                                                dy={28}
                                                textAnchor="middle"
                                                fill={
                                                    weekend
                                                        ? "#94a3b8"
                                                        : "#1e293b"
                                                }
                                                fontSize={10}
                                                fontWeight={700}
                                            >
                                                {payload.value}
                                            </text>

                                        </g>

                                    );

                                }}
                            />


                            {/* =================================================
                                Y AXIS
                            ================================================= */}

                            <YAxis
                                domain={[0, 10]}
                                ticks={[
                                    0,
                                    2,
                                    4,
                                    6,
                                    8,
                                    10
                                ]}
                                tickFormatter={
                                    (value) =>
                                        `${value}h`
                                }
                                axisLine={false}
                                tickLine={false}
                                width={38}
                                tick={{
                                    fill:
                                        "#64748b",
                                    fontSize: 11
                                }}
                            />


                            {/* =================================================
                                TOOLTIP
                            ================================================= */}

                            <Tooltip
                                content={
                                    <CustomTooltip />
                                }
                                cursor={{
                                    fill:
                                        "rgba(37,99,235,.04)"
                                }}
                            />


                            {/* =================================================
                                WORKING HOURS BAR

                                Present  = GREEN
                                Absent   = RED
                                Leave    = ORANGE
                                Half Day = ORANGE
                                WFH      = PURPLE
                                Weekend  = GREY
                            ================================================= */}

                            <Bar
                                dataKey="displayHours"
                                name="Working Hours"
                                radius={[
                                    8,
                                    8,
                                    0,
                                    0
                                ]}
                                barSize={24}
                                isAnimationActive={false}
                            >
                                {chartData.map(
                                    (
                                        entry,
                                        index
                                    ) => (
                                        <Cell
                                            key={`bar-${index}`}
                                            fill={
                                                getBarColor(entry)
                                            }
                                        />
                                    )
                                )}
                            </Bar>

                        </BarChart>

                    </ResponsiveContainer>

                )}

            </div>


            {/* =================================================
                SUMMARY
            ================================================= */}

            <div className="attendance-summary">


                {/* PRESENT */}

                <div className="attendance-summary-card present">

                    <div className="summary-icon">
                        ✓
                    </div>


                    <div className="summary-content">

                        <span>
                            Present
                        </span>


                        <div>

                            <h3>
                                {summary.present}
                            </h3>

                            <small>
                                Days attended
                            </small>

                        </div>

                    </div>

                </div>


                {/* ABSENT */}

                <div className="attendance-summary-card absent">

                    <div className="summary-icon">
                        !
                    </div>


                    <div className="summary-content">

                        <span>
                            Absent
                        </span>


                        <div>

                            <h3>
                                {summary.absent}
                            </h3>

                            <small>
                                Days absent
                            </small>

                        </div>

                    </div>

                </div>


                {/* LEAVE */}

                <div className="attendance-summary-card leave">

                    <div className="summary-icon">
                        L
                    </div>


                    <div className="summary-content">

                        <span>
                            Leave
                        </span>


                        <div>

                            <h3>
                                {summary.leave}
                            </h3>

                            <small>
                                Approved leave
                            </small>

                        </div>

                    </div>

                </div>


                {/* WEEKEND */}

                <div className="attendance-summary-card weekend">

                    <div className="summary-icon">
                        S
                    </div>


                    <div className="summary-content">

                        <span>
                            Weekend
                        </span>


                        <div>

                            <h3>
                                {summary.weekend}
                            </h3>

                            <small>
                                Non-working days
                            </small>

                        </div>

                    </div>

                </div>


            </div>


        </div>

    );

}


export default AttendanceChart;
