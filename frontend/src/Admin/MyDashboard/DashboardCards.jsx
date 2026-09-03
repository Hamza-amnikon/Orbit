import { useEffect, useState } from "react";

import AccessTimeFilledIcon from "@mui/icons-material/AccessTimeFilled";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import TimerIcon from "@mui/icons-material/Timer";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";

import { getProfile } from "../Services/ProfileService";
import AttendanceService from "../Services/AttendanceService";
import LeaveService from "../Services/LeaveService";

import "./DashboardCards.css";

/* =========================================================
   HELPERS
========================================================= */

const normalizeArray = (response) => {
    if (Array.isArray(response)) {
        return response;
    }

    if (Array.isArray(response?.data)) {
        return response.data;
    }

    if (Array.isArray(response?.items)) {
        return response.items;
    }

    if (Array.isArray(response?.result)) {
        return response.result;
    }

    return [];
};


const getValue = (object, ...keys) => {

    if (!object) {
        return null;
    }

    for (const key of keys) {

        if (
            object[key] !== undefined &&
            object[key] !== null
        ) {
            return object[key];
        }

    }

    return null;
};


/* =========================================================
   EMPLOYEE ID
========================================================= */

const getEmployeeId = (profile) => {

    const id = getValue(
        profile,

        "employeeId",
        "EmployeeId",

        "employeeID",
        "EmployeeID",

        "id",
        "Id"
    );

    if (
        id === null ||
        id === undefined ||
        id === ""
    ) {
        return null;
    }

    return Number(id);
};


/* =========================================================
   DATE
========================================================= */

const getToday = () => {

    const date = new Date();

    const year =
        date.getFullYear();

    const month =
        String(date.getMonth() + 1)
            .padStart(2, "0");

    const day =
        String(date.getDate())
            .padStart(2, "0");

    return `${year}-${month}-${day}`;
};


const isToday = (value) => {

    if (!value) {
        return false;
    }

    /*
     * Handles:
     *
     * 2026-08-28
     * 2026-08-28T09:00:00
     * 2026-08-28T09:00:00Z
     */

    return (
        String(value)
            .substring(0, 10) ===
        getToday()
    );
};


/* =========================================================
   STATUS
========================================================= */

const normalizeStatus = (value) => {

    if (!value) {
        return "";
    }

    return String(value)
        .trim()
        .toLowerCase();
};


/* =========================================================
   HOURS
========================================================= */

const formatHours = (value) => {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "00:00";
    }


    /* -----------------------------------------
       NUMBER

       8.5 => 08:30
    ----------------------------------------- */

    if (typeof value === "number") {

        const totalMinutes =
            Math.round(value * 60);

        const hours =
            Math.floor(
                totalMinutes / 60
            );

        const minutes =
            totalMinutes % 60;

        return (
            `${String(hours).padStart(2, "0")}:` +
            `${String(minutes).padStart(2, "0")}`
        );
    }


    const text =
        String(value).trim();


    /* -----------------------------------------
       HH:mm
    ----------------------------------------- */

    if (
        /^\d{1,2}:\d{2}/.test(text)
    ) {

        const parts =
            text.split(":");

        const hours =
            Number(parts[0]) || 0;

        const minutes =
            Number(parts[1]) || 0;

        return (
            `${String(hours).padStart(2, "0")}:` +
            `${String(minutes).padStart(2, "0")}`
        );
    }


    /* -----------------------------------------
       HH:mm:ss
    ----------------------------------------- */

    if (
        /^\d{1,2}:\d{2}:\d{2}/.test(text)
    ) {

        const parts =
            text.split(":");

        const hours =
            Number(parts[0]) || 0;

        const minutes =
            Number(parts[1]) || 0;

        return (
            `${String(hours).padStart(2, "0")}:` +
            `${String(minutes).padStart(2, "0")}`
        );
    }


    return text;
};


/* =========================================================
   ATTENDANCE SERVICE COMPATIBILITY
========================================================= */

/*
 * Different versions of AttendanceService have used
 * different method names.
 *
 * We support all three:
 *
 * getEmployeeAttendance()
 * getMyAttendance()
 * getByEmployee()
 *
 * This prevents:
 *
 * AttendanceService.getByEmployee is not a function
 *
 * or:
 *
 * AttendanceService.getMyAttendance is not a function
 */

const getEmployeeAttendance = async (employeeId) => {

    if (
        typeof AttendanceService?.getEmployeeAttendance ===
        "function"
    ) {

        console.log(
            "Dashboard: using getEmployeeAttendance()"
        );

        return await AttendanceService
            .getEmployeeAttendance(
                employeeId
            );
    }


    if (
        typeof AttendanceService?.getMyAttendance ===
        "function"
    ) {

        console.log(
            "Dashboard: using getMyAttendance()"
        );

        return await AttendanceService
            .getMyAttendance(
                employeeId
            );
    }


    if (
        typeof AttendanceService?.getByEmployee ===
        "function"
    ) {

        console.log(
            "Dashboard: using getByEmployee()"
        );

        return await AttendanceService
            .getByEmployee(
                employeeId
            );
    }


    throw new Error(
        "AttendanceService does not contain getEmployeeAttendance(), getMyAttendance(), or getByEmployee()."
    );
};


/* =========================================================
   COMPONENT
========================================================= */

function DashboardCards() {

    const [loading, setLoading] =
        useState(true);


    const [dashboardData, setDashboardData] =
        useState({

            attendance:
                "Not Marked",

            leaveBalance:
                "0 Days",

            workingHours:
                "00:00 Hrs",

            pendingRequests:
                "00"

        });


    /* =====================================================
       LOAD DASHBOARD
    ===================================================== */

    useEffect(() => {

        let cancelled = false;


        const loadDashboard = async () => {

            try {

                setLoading(true);


                /* =================================================
                   PROFILE
                ================================================= */

                const profile =
                    await getProfile();


                console.log(
                    "Dashboard Profile:",
                    profile
                );


                /* =================================================
                   EMPLOYEE ID
                ================================================= */

                const employeeId =
                    getEmployeeId(profile);


                console.log(
                    "Dashboard Employee ID:",
                    employeeId
                );


                if (!employeeId) {

                    throw new Error(
                        "Employee ID not found in profile."
                    );
                }


                /* =================================================
                   LOAD DATA
                ================================================= */

                const [
                    attendanceResult,
                    leaveBalanceResult,
                    leaveRequestsResult
                ] =
                    await Promise.allSettled([

                        getEmployeeAttendance(
                            employeeId
                        ),

                        typeof LeaveService
                            ?.getEmployeeLeaveBalances ===
                        "function"

                            ?

                        LeaveService
                            .getEmployeeLeaveBalances(
                                employeeId
                            )

                            :

                        Promise.resolve([]),


                        typeof LeaveService
                            ?.getLeaves ===
                        "function"

                            ?

                        LeaveService
                            .getLeaves()

                            :

                        Promise.resolve([])

                    ]);


                /* =================================================
                   TODAY ATTENDANCE
                ================================================= */

                let attendanceStatus =
                    "Not Marked";


                let todayHours =
                    "00:00";


                if (
                    attendanceResult.status ===
                    "fulfilled"
                ) {

                    const attendance =
                        normalizeArray(
                            attendanceResult.value
                        );


                    console.log(
                        "Dashboard Attendance:",
                        attendance
                    );


                    /* ---------------------------------------------
                       FIND TODAY'S RECORD
                    --------------------------------------------- */

                    const todayRecords =
                        attendance.filter(
                            (item) => {

                                const date =
                                    getValue(
                                        item,

                                        "attendanceDate",
                                        "AttendanceDate",

                                        "date",
                                        "Date",

                                        "checkInDate",
                                        "CheckInDate",

                                        "createdAt",
                                        "CreatedAt"
                                    );


                                return isToday(
                                    date
                                );

                            }
                        );


                    /*
                     * If multiple records exist for today,
                     * use the latest one.
                     */

                    const todayRecord =
                        todayRecords.length > 0
                            ?

                        todayRecords[
                            todayRecords.length - 1
                        ]

                            :

                        null;


                    console.log(
                        "Dashboard Today's Attendance:",
                        todayRecord
                    );


                    /* ---------------------------------------------
                       STATUS
                    --------------------------------------------- */

                    if (todayRecord) {

                        const status =
                            getValue(
                                todayRecord,

                                "status",
                                "Status",

                                "attendanceStatus",
                                "AttendanceStatus"
                            );


                        if (status) {

                            const normalized =
                                normalizeStatus(
                                    status
                                );


                            if (
                                normalized ===
                                "present"
                            ) {

                                attendanceStatus =
                                    "Present";

                            }

                            else if (
                                normalized ===
                                "absent"
                            ) {

                                attendanceStatus =
                                    "Absent";

                            }

                            else if (
                                normalized ===
                                    "half day" ||

                                normalized ===
                                    "halfday" ||

                                normalized ===
                                    "half_day"
                            ) {

                                attendanceStatus =
                                    "Half Day";

                            }

                            else if (
                                normalized ===
                                "leave"
                            ) {

                                attendanceStatus =
                                    "Leave";

                            }

                            else {

                                attendanceStatus =
                                    String(status);

                            }

                        }

                        else {

                            /*
                             * If record exists but API does not
                             * return status, assume Present.
                             */

                            attendanceStatus =
                                "Present";

                        }


                        /* -----------------------------------------
                           WORKING HOURS
                        ----------------------------------------- */

                        const hours =
                            getValue(
                                todayRecord,

                                "workingHours",
                                "WorkingHours",

                                "totalHours",
                                "TotalHours",

                                "hoursWorked",
                                "HoursWorked",

                                "workedHours",
                                "WorkedHours"
                            );


                        /*
                         * If API directly provides hours.
                         */

                        if (
                            hours !== null &&
                            hours !== undefined
                        ) {

                            todayHours =
                                formatHours(
                                    hours
                                );

                        }

                        else {

                            /*
                             * Calculate hours from
                             * check-in / check-out.
                             */

                            const checkIn =
                                getValue(
                                    todayRecord,

                                    "checkIn",
                                    "CheckIn",

                                    "checkInTime",
                                    "CheckInTime",

                                    "inTime",
                                    "InTime"
                                );


                            const checkOut =
                                getValue(
                                    todayRecord,

                                    "checkOut",
                                    "CheckOut",

                                    "checkOutTime",
                                    "CheckOutTime",

                                    "outTime",
                                    "OutTime"
                                );


                            if (
                                checkIn &&
                                checkOut
                            ) {

                                const start =
                                    new Date(
                                        checkIn
                                    );

                                const end =
                                    new Date(
                                        checkOut
                                    );


                                if (
                                    !Number.isNaN(
                                        start.getTime()
                                    ) &&
                                    !Number.isNaN(
                                        end.getTime()
                                    )
                                ) {

                                    const difference =
                                        (
                                            end.getTime() -
                                            start.getTime()
                                        ) /
                                        3600000;


                                    todayHours =
                                        formatHours(
                                            difference
                                        );

                                }

                            }

                        }

                    }

                }

                else {

                    console.error(
                        "Dashboard Attendance API Error:",
                        attendanceResult.reason
                    );

                }


                /* =================================================
                   LEAVE BALANCE
                ================================================= */

                let totalLeaveBalance =
                    0;


                if (
                    leaveBalanceResult.status ===
                    "fulfilled"
                ) {

                    const balances =
                        normalizeArray(
                            leaveBalanceResult.value
                        );


                    console.log(
                        "Dashboard Leave Balances:",
                        balances
                    );


                    const currentYear =
                        new Date()
                            .getFullYear();


                    totalLeaveBalance =
                        balances

                            .filter(
                                (item) => {

                                    const itemEmployeeId =
                                        getValue(
                                            item,

                                            "employeeId",
                                            "EmployeeId",

                                            "employeeID",
                                            "EmployeeID"
                                        );


                                    const year =
                                        getValue(
                                            item,

                                            "year",
                                            "Year"
                                        );


                                    /*
                                     * Employee ID must match.
                                     */

                                    const employeeMatches =
                                        Number(
                                            itemEmployeeId
                                        ) ===
                                        Number(
                                            employeeId
                                        );


                                    /*
                                     * Current year only.
                                     */

                                    const yearMatches =
                                        !year ||
                                        Number(year) ===
                                        Number(
                                            currentYear
                                        );


                                    return (
                                        employeeMatches &&
                                        yearMatches
                                    );

                                }
                            )

                            .reduce(
                                (
                                    total,
                                    item
                                ) => {

                                    const balance =
                                        Number(
                                            getValue(
                                                item,

                                                "balanceDays",
                                                "BalanceDays",

                                                "remainingDays",
                                                "RemainingDays",

                                                "balance",
                                                "Balance"
                                            )
                                        ) || 0;


                                    return (
                                        total +
                                        balance
                                    );

                                },

                                0
                            );

                }

                else {

                    console.error(
                        "Dashboard Leave Balance API Error:",
                        leaveBalanceResult.reason
                    );

                }


                /* =================================================
                   PENDING LEAVE REQUESTS
                ================================================= */

                let pendingRequests =
                    0;


                if (
                    leaveRequestsResult.status ===
                    "fulfilled"
                ) {

                    const allLeaves =
                        normalizeArray(
                            leaveRequestsResult.value
                        );


                    console.log(
                        "Dashboard All Leave Requests:",
                        allLeaves
                    );


                    /* ---------------------------------------------
                       ONLY LOGGED-IN EMPLOYEE
                    --------------------------------------------- */

                    const myLeaves =
                        allLeaves.filter(
                            (leave) => {

                                const leaveEmployeeId =
                                    getValue(
                                        leave,

                                        "employeeId",
                                        "EmployeeId",

                                        "employeeID",
                                        "EmployeeID"
                                    );


                                /*
                                 * Some APIs may not include
                                 * employeeId. In that case
                                 * don't count the record.
                                 */

                                if (
                                    leaveEmployeeId ===
                                    null
                                ) {

                                    return false;

                                }


                                return (
                                    Number(
                                        leaveEmployeeId
                                    ) ===
                                    Number(
                                        employeeId
                                    )
                                );

                            }
                        );


                    console.log(
                        "Dashboard My Leave Requests:",
                        myLeaves
                    );


                    /* ---------------------------------------------
                       ONLY PENDING
                    --------------------------------------------- */

                    const pendingLeaves =
                        myLeaves.filter(
                            (leave) => {

                                const status =
                                    normalizeStatus(
                                        getValue(
                                            leave,

                                            "status",
                                            "Status",

                                            "leaveStatus",
                                            "LeaveStatus"
                                        )
                                    );


                                return (
                                    status ===
                                    "pending"
                                );

                            }
                        );


                    pendingRequests =
                        pendingLeaves.length;


                    console.log(
                        "Dashboard Pending Leave Requests:",
                        pendingLeaves
                    );

                }

                else {

                    console.error(
                        "Dashboard Leave Requests API Error:",
                        leaveRequestsResult.reason
                    );

                }


                /* =================================================
                   FINAL DATA
                ================================================= */

                if (!cancelled) {

                    setDashboardData({

                        attendance:
                            attendanceStatus,


                        leaveBalance:
                            `${Number(
                                totalLeaveBalance.toFixed(2)
                            )} Days`,


                        workingHours:
                            `${todayHours} Hrs`,


                        pendingRequests:
                            String(
                                pendingRequests
                            ).padStart(
                                2,
                                "0"
                            )

                    });

                }

            }

            catch (error) {

                console.error(
                    "Dashboard Cards Error:",
                    error
                );

            }

            finally {

                if (!cancelled) {

                    setLoading(false);

                }

            }

        };


        loadDashboard();


        return () => {

            cancelled = true;

        };

    }, []);


    /* =========================================================
       CARDS
    ========================================================= */

    const cards = [

        {
            title:
                "Today's Attendance",

            value:
                loading
                    ? "..."
                    : dashboardData.attendance,

            icon:
                <AccessTimeFilledIcon />,

            className:
                "attendance"

        },


        {
            title:
                "Leave Balance",

            value:
                loading
                    ? "..."
                    : dashboardData.leaveBalance,

            icon:
                <EventAvailableIcon />,

            className:
                "leave"

        },


        {
            title:
                "Working Hours",

            value:
                loading
                    ? "..."
                    : dashboardData.workingHours,

            icon:
                <TimerIcon />,

            className:
                "hours"

        },


        {
            title:
                "Pending Requests",

            value:
                loading
                    ? "..."
                    : dashboardData.pendingRequests,

            icon:
                <AssignmentTurnedInIcon />,

            className:
                "approval"

        }

    ];


    /* =========================================================
       UI
    ========================================================= */

    return (

        <div className="dashboard-cards">

            {cards.map(
                (card, index) => (

                    <div
                        className={
                            `dashboard-card ${card.className}`
                        }
                        key={index}
                    >

                        <div className="card-icon">

                            {card.icon}

                        </div>


                        <div className="card-content">

                            <h4>
                                {card.title}
                            </h4>


                            <h2>
                                {card.value}
                            </h2>

                        </div>

                    </div>

                )
            )}

        </div>

    );

}


export default DashboardCards;