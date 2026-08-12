import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import * as XLSX from "xlsx";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from "recharts";

import "./LeaveOverview.css";


// ==========================================
// API URLs
// ==========================================

const LEAVE_API = "https://localhost:7206/api/Leave";
const LEAVE_TYPE_API = "https://localhost:7206/api/LeaveType";
const EVENT_API = "https://localhost:7234/api/Event";


export default function LeaveOverview() {

        const navigate = useNavigate();


    const [leaves, setLeaves] = useState([]);
    const [leaveTypes, setLeaveTypes] = useState([]);

    // Events created by HR from Settings
    const [upcomingEvents, setUpcomingEvents] = useState([]);

    // Default = show only 3 events
    const [showAllEvents, setShowAllEvents] = useState(false);
    const [trendView, setTrendView] = useState("weekly");
    const [upcomingView, setUpcomingView] = useState("weekly");


    // ==========================================
    // Load Dashboard Data
    // ==========================================

    useEffect(() => {
        loadDashboardData();
    }, []);


    async function loadDashboardData() {


        try {

            const [
                leaveResponse,
                leaveTypeResponse,
                eventResponse
            ] = await Promise.all([
                axios.get(LEAVE_API),
                axios.get(LEAVE_TYPE_API),
                axios.get(EVENT_API)
            ]);


            setLeaves(leaveResponse.data);
            setLeaveTypes(leaveTypeResponse.data);


            // ==========================================
            // Prepare Upcoming Events
            // ==========================================


            // ==========================================
            // Prepare Upcoming Events
            // ==========================================

            const eventToday = new Date();
            eventToday.setHours(0, 0, 0, 0);

            const events = eventResponse.data
                .filter((event) => {

                    const eventDate = new Date(event.eventDate);
                    eventDate.setHours(0, 0, 0, 0);

                    return (
                        event.status?.toLowerCase() === "active" &&
                        eventDate >= eventToday
                    );

                })
                .sort(
                    (a, b) =>
                        new Date(a.eventDate) -
                        new Date(b.eventDate)
                );

            setUpcomingEvents(events);

        } catch (error) {

            console.error(
                "Leave Dashboard Error:",
                error
            );

        }
    }

    // ==========================================
    // Export Leave Data
    // ==========================================

    const handleExport = () => {

        console.log("Export button clicked");

        const exportData = leaves.map((leave) => ({
            Employee: leave.employeeId,
            "Leave Type": getLeaveTypeName(leave.leaveTypeId),
            "From Date": leave.fromDate,
            "To Date": leave.toDate,
            "No Of Days": leave.noOfDays,
            Status: leave.status
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            "Leave Report"
        );

        XLSX.writeFile(workbook, "Leave_Report.xlsx");
    };


    // ==========================================
    // Dashboard Summary
    // ==========================================

    const now = new Date();

    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();


    // Leaves for current month

    const thisMonthLeaves = leaves.filter((leave) => {

        const fromDate = new Date(leave.fromDate);

        return (
            fromDate.getMonth() === currentMonth &&
            fromDate.getFullYear() === currentYear
        );

    });



    // ==========================================
    // Get Leave Type Name
    // ==========================================

    function getLeaveTypeName(leaveTypeId) {

        const leaveType = leaveTypes.find(
            (type) =>
                type.leaveTypeId === leaveTypeId
        );

        return leaveType?.leaveTypeName || "";
    }



    // ==========================================
    // Annual Leave
    // ==========================================

    const annualLeaveCount = thisMonthLeaves.filter(
        (leave) =>
            getLeaveTypeName(leave.leaveTypeId)
                .toLowerCase() === "annual leave"
    ).length;



    // ==========================================
    // Sick Leave
    // ==========================================

    const sickLeaveCount = thisMonthLeaves.filter(
        (leave) =>
            getLeaveTypeName(leave.leaveTypeId)
                .toLowerCase() === "sick leave"
    ).length;



    // ==========================================
    // Other Leave
    // ==========================================

    const otherLeaveCount = thisMonthLeaves.filter(
        (leave) => {

            const leaveTypeName =
                getLeaveTypeName(
                    leave.leaveTypeId
                ).toLowerCase();


            return (
                leaveTypeName !== "annual leave" &&
                leaveTypeName !== "sick leave"
            );

        }
    ).length;



    // ==========================================
    // Pending Requests
    // ==========================================

    const pendingRequestCount =
        thisMonthLeaves.filter(
            (leave) =>
                leave.status?.toLowerCase() ===
                "pending"
        ).length;

//Rejected Request

const rejectedLeaveCount =
    thisMonthLeaves.filter(
        (leave) =>
            leave.status?.toLowerCase() === "rejected"
    ).length;
    

    // ==========================================
    // Upcoming Approved Leaves
    // ==========================================

    const today = new Date();

    today.setHours(0, 0, 0, 0);


    // ==========================================
    // Upcoming Approved Leaves
    // Weekly / Monthly / All
    // ==========================================


    const upcomingLeaves = leaves
        .filter((leave) => {

            const fromDate = new Date(leave.fromDate);
            fromDate.setHours(0, 0, 0, 0);

            // Only approved future/current leaves
            if (
                leave.status?.toLowerCase() !== "approved" ||
                fromDate < today
            ) {
                return false;
            }

            // WEEKLY VIEW - next 7 days
            if (upcomingView === "weekly") {

                const next7Days = new Date(today);
                next7Days.setDate(today.getDate() + 7);

                return fromDate <= next7Days;
            }

            // MONTHLY VIEW - current month
            if (upcomingView === "monthly") {

                return (
                    fromDate.getMonth() === today.getMonth() &&
                    fromDate.getFullYear() === today.getFullYear()
                );
            }

            // ALL UPCOMING
            return true;
        })
        .sort(
            (a, b) =>
                new Date(a.fromDate) - new Date(b.fromDate)
        );



    // ==========================================
    // Monthly Leave Trend - Grouped By Week
    // ==========================================

    const weeklyTrendData = [
        { week: "Week 1", annual: 0, other: 0 },
        { week: "Week 2", annual: 0, other: 0 },
        { week: "Week 3", annual: 0, other: 0 },
        { week: "Week 4", annual: 0, other: 0 },
        { week: "Week 5", annual: 0, other: 0 }
    ];


    thisMonthLeaves.forEach((leave) => {

        const leaveDate = new Date(leave.fromDate);

        const dayOfMonth = leaveDate.getDate();

        const weekIndex = Math.min(
            Math.floor((dayOfMonth - 1) / 7),
            4
        );


        const typeName = getLeaveTypeName(
            leave.leaveTypeId
        ).toLowerCase();


        if (typeName === "annual leave") {

            weeklyTrendData[weekIndex].annual++;

        } else {

            weeklyTrendData[weekIndex].other++;

        }

    });

    // ==========================================
    // Monthly Leave Trend
    // ==========================================

    const monthlyTrendData = [
        { month: "Jan", annual: 0, other: 0 },
        { month: "Feb", annual: 0, other: 0 },
        { month: "Mar", annual: 0, other: 0 },
        { month: "Apr", annual: 0, other: 0 },
        { month: "May", annual: 0, other: 0 },
        { month: "Jun", annual: 0, other: 0 },
        { month: "Jul", annual: 0, other: 0 },
        { month: "Aug", annual: 0, other: 0 },
        { month: "Sep", annual: 0, other: 0 },
        { month: "Oct", annual: 0, other: 0 },
        { month: "Nov", annual: 0, other: 0 },
        { month: "Dec", annual: 0, other: 0 }
    ];

    leaves.forEach((leave) => {

        const leaveDate = new Date(leave.fromDate);

        // Only current year's leaves
        if (leaveDate.getFullYear() !== currentYear) {
            return;
        }

        const monthIndex = leaveDate.getMonth();

        const typeName = getLeaveTypeName(
            leave.leaveTypeId
        ).toLowerCase();

        if (typeName === "annual leave") {
            monthlyTrendData[monthIndex].annual++;
        } else {
            monthlyTrendData[monthIndex].other++;
        }

    });

    // Select Weekly or Monthly Trend
    // ==========================================

    const trendData =
        trendView === "weekly"
            ? weeklyTrendData
            : monthlyTrendData;

    const trendXAxisKey =
        trendView === "weekly"
            ? "week"
            : "month";


    // ==========================================
    // Events To Display
    // ==========================================

    const displayedEvents = showAllEvents
        ? upcomingEvents
        : upcomingEvents.slice(0, 3);



    // ==========================================
    // UI
    // ==========================================

    return (

        <div className="leave-overview">


            {/* ==========================================
                Header
            ========================================== */}

            <div className="leave-overview-header">

                <div>
                    <h1>
                        Leave Dashboard
                    </h1>

                    <p>
                        Overview of employee leave activity.
                    </p>
                </div>

                <div className="leave-header-actions">

                    <button
                        type="button"
                        className="leave-action-btn"
                        onClick={() => window.history.back()}
                    >
                        ← Previous
                    </button>

                    <button
                        type="button"
                        className="leave-action-btn"
                        onClick={loadDashboardData}
                    >
                        ↻ Refresh
                    </button>

                    <button
                        type="button"
                        className="leave-action-btn"
                        onClick={handleExport}
                    >
                        ⇩ Export
                    </button>

                </div>

            </div>



            {/* ==========================================
                Summary Cards
            ========================================== */}

            <div className="leave-summary-grid">


                {/* Annual Leave */}

                <div
    className="leave-summary-card"
    onClick={() => navigate("/leave/requests")}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => {
        if (e.key === "Enter") {
            navigate("/leave/requests");
        }
    }}
>

                    <div className="summary-card-top">

                        <span>
                            Annual Leave
                        </span>

                    </div>


                    <div className="summary-card-bottom">

                        <h2>
                            {annualLeaveCount}
                        </h2>

                        <span>
                            This month
                        </span>

                    </div>

                </div>



                {/* Sick Leave */}

                <div
    className="leave-summary-card"
    onClick={() => navigate("/leave/requests")}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => {
        if (e.key === "Enter") {
            navigate("/leave/requests");
        }
    }}
>

                    <div className="summary-card-top">

                        <span>
                            Sick Leave
                        </span>

                    </div>


                    <div className="summary-card-bottom">

                        <h2>
                            {sickLeaveCount}
                        </h2>

                        <span>
                            This month
                        </span>

                    </div>

                </div>



                {/* Other Leave */}

                <div
    className="leave-summary-card"
    onClick={() => navigate("/leave/requests")}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => {
        if (e.key === "Enter") {
            navigate("/leave/requests");
        }
    }}
>

                    <div className="summary-card-top">

                        <span>
                            Other Leave
                        </span>

                    </div>


                    <div className="summary-card-bottom">

                        <h2>
                            {otherLeaveCount}
                        </h2>
                    

                        <span>
                            This month
                        </span>

                    </div>

                </div>



                {/* Pending Request */}

<div
    className="leave-summary-card"
    onClick={() => navigate("/leave/requests?status=Pending")}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => {
        if (e.key === "Enter") {
            navigate("/leave/requests?status=Pending");
        }
    }}
>

                    <div className="summary-card-top">

                        <span>
                            Pending Request
                        </span>


                    </div>


                    <div className="summary-card-bottom">

                        <h2>
                            {pendingRequestCount}
                        </h2>

                        <span>
                            This month
                        </span>

                    </div>

                    </div>


    {/* Rejected Leave */}

    <div
    className="leave-summary-card rejected-leave"
        onClick={() => navigate("/leave/requests?status=Rejected")}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
            if (e.key === "Enter") {
                navigate("/leave/requests?status=Rejected");
            }
        }}
    >
        <div className="summary-card-top">
            <span>
                Rejected Leave
            </span>
        </div>

        <div className="summary-card-bottom">
            <h2>
                {rejectedLeaveCount}
            </h2>

            <span>
                This month
            </span>
        </div>
    </div>


</div>

{/* Dashboard Middle Section */}


            <div className="leave-dashboard-content">


                {/* ==========================================
                    Leave Trend
                ========================================== */}

                <div className="leave-trend-panel">


                    <div className="dashboard-panel-header">

                        <h2>
                            Leave Trend
                        </h2>


                        <select
                            className="view-filter-btn"
                            value={trendView}
                            onChange={(e) => setTrendView(e.target.value)}
                        >
                            <option value="weekly">
                                Weekly View
                            </option>

                            <option value="monthly">
                                Monthly View
                            </option>
                        </select>

                    </div>


                    <div className="leave-trend-chart">


                        <ResponsiveContainer
                            width="100%"
                            height={220}
                        >

                            <BarChart
                                data={trendData}
                                margin={{
                                    top: 10,
                                    right: 10,
                                    left: -20,
                                    bottom: 0
                                }}
                            >

                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                />


                                <XAxis
                                    dataKey={trendXAxisKey}
                                    axisLine={false}
                                    tickLine={false}
                                />


                                <YAxis
                                    allowDecimals={false}
                                    axisLine={false}
                                    tickLine={false}
                                />


                                <Tooltip />


                                <Legend />


                                <Bar
                                    dataKey="annual"
                                    name="Annual Leave"
                                    stackId="leave"
                                    fill="#249ee8"
                                    radius={[2, 2, 0, 0]}
                                />


                                <Bar
                                    dataKey="other"
                                    name="Other Leave"
                                    stackId="leave"
                                    fill="#b9dcf8"
                                    radius={[2, 2, 0, 0]}
                                />


                            </BarChart>

                        </ResponsiveContainer>


                    </div>

                </div>



                {/* ==========================================
                    Upcoming Leaves
                ========================================== */}

                <div className="upcoming-leaves-panel">


                    <div className="dashboard-panel-header">

                        <h2>
                            Upcoming Leaves
                        </h2>


                        <select
                            className="view-filter-btn"
                            value={upcomingView}
                            onChange={(e) => setUpcomingView(e.target.value)}
                        >
                            <option value="weekly">Weekly View</option>
                            <option value="monthly">Monthly View</option>
                            <option value="all">All Upcoming</option>
                        </select>

                    </div>


                    <div className="upcoming-leaves-table">


                        {/* Table Header */}

                        <div className="upcoming-table-header">

                            <span>
                                Employee
                            </span>

                            <span>
                                Leave Type
                            </span>

                            <span>
                                From & To
                            </span>

                            <span>
                                No Of Days
                            </span>

                        </div>



                        {/* Table Rows */}

                        {upcomingLeaves.length > 0 ? (

                            upcomingLeaves.map(
                                (leave) => (

                                    <div
                                        className="upcoming-table-row"
                                        key={leave.leaveId}
                                    >

                                        <span>
                                            {leave.employeeId}
                                        </span>


                                        <span>

                                            {getLeaveTypeName(
                                                leave.leaveTypeId
                                            )}

                                        </span>


                                        <span>

                                            {new Date(
                                                leave.fromDate
                                            ).toLocaleDateString(
                                                "en-GB"
                                            )}

                                            {" - "}

                                            {new Date(
                                                leave.toDate
                                            ).toLocaleDateString(
                                                "en-GB"
                                            )}

                                        </span>


                                        <span>

                                            {
                                                Math.ceil(
                                                    (
                                                        new Date(
                                                            leave.toDate
                                                        ) -
                                                        new Date(
                                                            leave.fromDate
                                                        )
                                                    ) /
                                                    (
                                                        1000 *
                                                        60 *
                                                        60 *
                                                        24
                                                    )
                                                ) + 1
                                            } Days

                                        </span>

                                    </div>

                                )
                            )

                        ) : (

                            <div className="no-upcoming-leaves">

                                No upcoming leaves

                            </div>

                        )}


                    </div>

                </div>

            </div>



            {/* ==========================================
                Upcoming Events
            ========================================== */}

            <div className="upcoming-events-panel">


                <div className="dashboard-panel-header">

                    <div>

                        <h2>
                            Upcoming Events
                        </h2>

                        <p>
                            Holidays and company events
                        </p>

                    </div>


                    {upcomingEvents.length > 3 && (

                        <button
                            type="button"
                            className="view-filter-btn"
                            onClick={() =>
                                setShowAllEvents(
                                    !showAllEvents
                                )
                            }
                        >
                            {showAllEvents
                                ? "Show Less"
                                : "View All"}
                        </button>

                    )}

                </div>



                <div className="upcoming-events-list">


                    {displayedEvents.length > 0 ? (

                        displayedEvents.map((event) => {

                            const eventDate =
                                new Date(event.eventDate);


                            const day = eventDate
                                .getDate()
                                .toString()
                                .padStart(2, "0");


                            const month = eventDate
                                .toLocaleString(
                                    "en-US",
                                    {
                                        month: "short"
                                    }
                                )
                                .toUpperCase();


                            return (

                                <div
                                    className="upcoming-event-item"
                                    key={event.eventId}
                                >

                                    <div className="event-date-box">

                                        <strong>
                                            {day}
                                        </strong>

                                        <span>
                                            {month}
                                        </span>

                                    </div>


                                    <div className="event-details">

                                        <h3>
                                            {event.eventName}
                                        </h3>

                                        <p>
                                            {event.eventType}
                                        </p>

                                    </div>

                                </div>

                            );

                        })

                    ) : (

                        <div className="no-upcoming-events">
                            No upcoming events
                        </div>

                    )}


                </div>

            </div>


        </div>
    );
}
