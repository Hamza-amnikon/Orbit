import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { loadXlsx } from "../../../utils/exportLibraries";

import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from "chart.js";

import "./LeaveOverview.css";
import { useAuth } from "../../../context/AuthContext";
import { Alert, Box as MuiLayoutBox, Button, ButtonBase as MuiActionButton, IconButton, MenuItem, TextField, Typography as MuiText } from "@mui/material";
import { ArrowBackRounded, BeachAccessRounded, BlockRounded, CalendarMonthRounded, FileDownloadOutlined, MedicalServicesRounded, PendingActionsRounded, RefreshRounded } from "@mui/icons-material";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);


// ==========================================
// API URLs
// ==========================================

const LEAVE_API = `${import.meta.env.VITE_LEAVE_API_BASE_URL}/api/Leave`;
const LEAVE_TYPE_API = `${import.meta.env.VITE_LEAVE_API_BASE_URL}/api/LeaveType`;
const API_URL = `${import.meta.env.VITE_EVENT_API_BASE_URL}/api/Event`;


export default function LeaveOverview() {

        const navigate = useNavigate();
        const { hasPermission } = useAuth();

        const permissionRoute = "/leave/overview";
        const canView = hasPermission(permissionRoute, "view");
        const canExport = hasPermission(permissionRoute, "export");


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
                axios.get(API_URL)
            ]);


            const leaveData = Array.isArray(leaveResponse.data) ? leaveResponse.data : leaveResponse.data?.data || [];
            const leaveTypeData = Array.isArray(leaveTypeResponse.data) ? leaveTypeResponse.data : leaveTypeResponse.data?.data || [];
            setLeaves(leaveData);
            setLeaveTypes(leaveTypeData);


            // ==========================================
            // Prepare Upcoming Events
            // ==========================================


            // ==========================================
            // Prepare Upcoming Events
            // ==========================================

            const eventToday = new Date();
            eventToday.setHours(0, 0, 0, 0);

            const eventData = Array.isArray(eventResponse.data) ? eventResponse.data : eventResponse.data?.data || eventResponse.data?.events || [];
            const events = eventData
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

    const handleExport = async () => {

        if (!canExport) return;

        console.log("Export button clicked");

        const XLSX = await loadXlsx();
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



    // Leave trend counts approved leave days, grouped by leave type.
    const weeklyTrendData = Array.from({ length: 5 }, (_, index) => ({
        label: `Week ${index + 1}`,
        start: new Date(currentYear, currentMonth, index * 7 + 1),
        end: new Date(currentYear, currentMonth, Math.min((index + 1) * 7, new Date(currentYear, currentMonth + 1, 0).getDate())),
        values: {},
    }));
    const monthlyTrendData = Array.from({ length: 12 }, (_, index) => ({
        label: new Date(currentYear, index, 1).toLocaleString("en", { month: "short" }),
        start: new Date(currentYear, index, 1),
        end: new Date(currentYear, index + 1, 0),
        values: {},
    }));
    const leaveTypeNames = [...new Set(leaves
        .filter((leave) => leave.status?.toLowerCase() === "approved")
        .map((leave) => getLeaveTypeName(leave.leaveTypeId) || "Other Leave"))];

    const parseApprovedDates = (leave) => {
        let dates = leave.approvedDates ?? leave.ApprovedDates;
        if (typeof dates === "string") {
            try { dates = JSON.parse(dates); } catch { dates = []; }
        }
        return Array.isArray(dates) ? dates : [];
    };
    const eachApprovedDate = (leave) => {
        const approvedDates = parseApprovedDates(leave);
        if (approvedDates.length) return approvedDates.map((date) => new Date(date));
        const from = new Date(leave.fromDate);
        const to = new Date(leave.toDate || leave.fromDate);
        if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return [];
        const dates = [];
        for (const date = new Date(from); date <= to && dates.length < 366; date.setDate(date.getDate() + 1)) {
            dates.push(new Date(date));
        }
        const approvedDays = Number(leave.approvedDays ?? leave.noOfDays);
        return Number.isFinite(approvedDays) && approvedDays > 0 ? dates.slice(0, Math.ceil(approvedDays)) : dates;
    };
    const trendBuckets = trendView === "weekly" ? weeklyTrendData : monthlyTrendData;
    leaves.filter((leave) => leave.status?.toLowerCase() === "approved").forEach((leave) => {
        const typeName = getLeaveTypeName(leave.leaveTypeId) || "Other Leave";
        eachApprovedDate(leave).forEach((date) => {
            const bucket = trendBuckets.find((item) => date >= item.start && date <= item.end);
            if (bucket) bucket.values[typeName] = (bucket.values[typeName] || 0) + 1;
        });
    });

    const trendData = trendBuckets;
    const leaveColors = ["#3478e5", "#34a879", "#e5a23b", "#8b6bd6", "#e36c79", "#43a6b8", "#7e8da5"];
    const leaveTrendTotal = trendData.reduce((total, bucket) => total + Object.values(bucket.values).reduce((sum, value) => sum + value, 0), 0);
    const leaveTrendChartData = {
        labels: trendData.map((item) => item.label),
        datasets: leaveTypeNames.map((name, index) => ({
            label: name,
            data: trendData.map((item) => item.values[name] || 0),
            backgroundColor: leaveColors[index % leaveColors.length],
            borderRadius: 5,
            borderSkipped: false,
            maxBarThickness: 34,
            stack: "leave",
        })),
    };

    const leaveTrendChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        onClick: (_event, elements) => {
            const index = elements?.[0]?.index;
            if (index === undefined || !trendData[index]) return;
            const bucket = trendData[index];
            const days = Object.values(bucket.values).reduce((sum, value) => sum + value, 0);
            if (!days) return;
            const dateOnly = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
            navigate(`/leave/requests?status=Approved&fromDate=${dateOnly(bucket.start)}&toDate=${dateOnly(bucket.end)}`);
        },
        plugins: {
            legend: {
                position: "bottom",
                labels: { usePointStyle: true, pointStyle: "circle", boxWidth: 7, boxHeight: 7, padding: 18, color: "#526783", font: { size: 11 } },
            },
            tooltip: {
                backgroundColor: "#172b4d",
                padding: 10,
                cornerRadius: 8,
                usePointStyle: true,
            },
        },
        scales: {
            x: {
                stacked: true,
                grid: { display: false },
                border: { display: false },
                ticks: { color: "#718198", font: { size: 10 } },
            },
            y: {
                stacked: true,
                beginAtZero: true,
                ticks: { precision: 0, stepSize: 1, color: "#8a98aa", font: { size: 10 } },
                grid: { color: "#edf1f6", drawTicks: false },
                border: { display: false, dash: [3, 4] },
            },
        },
    };


    // ==========================================
    // Events To Display
    // ==========================================

    const displayedEvents = showAllEvents
        ? upcomingEvents
        : upcomingEvents.slice(0, 3);



    // ==========================================
    // UI
    // ==========================================

    if (!canView) {
        return (
            <MuiLayoutBox
                className="leave-overview"
                style={{ padding: "60px", textAlign: "center" }}
             component="div">
                <MuiText component="h2" variant="h5">Access Denied</MuiText>
                <MuiText component="p" variant="body1">You do not have permission to access this page.</MuiText>
            </MuiLayoutBox>
        );
    }

    return (

        <MuiLayoutBox className="leave-overview" component="div">


            {/* ==========================================
                Header
            ========================================== */}

            <MuiLayoutBox className="leave-overview-header" component="div">

                <MuiLayoutBox className="leave-header-leading" component="div">
                    <IconButton aria-label="Back to Leave Management" className="leave-back-button" onClick={() => navigate("/leave")}>
                        <ArrowBackRounded />
                    </IconButton>
                    <MuiLayoutBox component="div">
                    <MuiText component="h1" variant="h4">
                        Leave Dashboard
                    </MuiText>

                    <MuiText component="p" variant="body1">
                        Overview of employee leave activity.
                    </MuiText>
                    </MuiLayoutBox>
                </MuiLayoutBox>

                <MuiLayoutBox className="leave-header-actions" component="div">

                    <Button variant="outlined" startIcon={<RefreshRounded />} onClick={loadDashboardData}>Refresh</Button>

                    {canExport && (
                        <Button variant="outlined" startIcon={<FileDownloadOutlined />} onClick={handleExport}>Export Excel</Button>
                    )}

                </MuiLayoutBox>

            </MuiLayoutBox>



            {/* ==========================================
                Summary Cards
            ========================================== */}

            <MuiLayoutBox className="leave-summary-grid" component="div">


                {/* Annual Leave */}

                <MuiActionButton
    className="leave-summary-card"
    onClick={() => navigate("/leave/requests")}
    type="button"
 component="button">

                    <MuiLayoutBox className="summary-card-top" component="div">

                        <MuiText component="span" variant="inherit">
                            Annual Leave
                        </MuiText>
                        <MuiLayoutBox className="summary-icon annual" component="span"><CalendarMonthRounded /></MuiLayoutBox>

                    </MuiLayoutBox>


                    <MuiLayoutBox className="summary-card-bottom" component="div">

                        <MuiText component="h2" variant="h5">
                            {annualLeaveCount}
                        </MuiText>

                        <MuiText component="span" variant="inherit">
                            This month
                        </MuiText>

                    </MuiLayoutBox>

                </MuiActionButton>



                {/* Sick Leave */}

                <MuiActionButton
    className="leave-summary-card"
    onClick={() => navigate("/leave/requests")}
    type="button"
 component="button">

                    <MuiLayoutBox className="summary-card-top" component="div">

                        <MuiText component="span" variant="inherit">
                            Sick Leave
                        </MuiText>
                        <MuiLayoutBox className="summary-icon sick" component="span"><MedicalServicesRounded /></MuiLayoutBox>

                    </MuiLayoutBox>


                    <MuiLayoutBox className="summary-card-bottom" component="div">

                        <MuiText component="h2" variant="h5">
                            {sickLeaveCount}
                        </MuiText>

                        <MuiText component="span" variant="inherit">
                            This month
                        </MuiText>

                    </MuiLayoutBox>

                </MuiActionButton>



                {/* Other Leave */}

                <MuiActionButton
    className="leave-summary-card"
    onClick={() => navigate("/leave/requests")}
    type="button"
 component="button">

                    <MuiLayoutBox className="summary-card-top" component="div">

                        <MuiText component="span" variant="inherit">
                            Other Leave
                        </MuiText>
                        <MuiLayoutBox className="summary-icon other" component="span"><BeachAccessRounded /></MuiLayoutBox>

                    </MuiLayoutBox>


                    <MuiLayoutBox className="summary-card-bottom" component="div">

                        <MuiText component="h2" variant="h5">
                            {otherLeaveCount}
                        </MuiText>
                    

                        <MuiText component="span" variant="inherit">
                            This month
                        </MuiText>

                    </MuiLayoutBox>

                </MuiActionButton>



                {/* Pending Request */}

<MuiActionButton
    className="leave-summary-card"
    onClick={() => navigate("/leave/requests?status=Pending")}
    type="button"
 component="button">

                    <MuiLayoutBox className="summary-card-top" component="div">

                        <MuiText component="span" variant="inherit">
                            Pending Request
                        </MuiText>
                        <MuiLayoutBox className="summary-icon pending" component="span"><PendingActionsRounded /></MuiLayoutBox>


                    </MuiLayoutBox>


                    <MuiLayoutBox className="summary-card-bottom" component="div">

                        <MuiText component="h2" variant="h5">
                            {pendingRequestCount}
                        </MuiText>

                        <MuiText component="span" variant="inherit">
                            This month
                        </MuiText>

                    </MuiLayoutBox>

                    </MuiActionButton>


    {/* Rejected Leave */}

    <MuiActionButton
    className="leave-summary-card rejected-leave"
        onClick={() => navigate("/leave/requests?status=Rejected")}
        type="button"
     component="button">
        <MuiLayoutBox className="summary-card-top" component="div">
            <MuiText component="span" variant="inherit">
                Rejected Leave
            </MuiText>
            <MuiLayoutBox className="summary-icon rejected" component="span"><BlockRounded /></MuiLayoutBox>
        </MuiLayoutBox>

        <MuiLayoutBox className="summary-card-bottom" component="div">
            <MuiText component="h2" variant="h5">
                {rejectedLeaveCount}
            </MuiText>

            <MuiText component="span" variant="inherit">
                This month
            </MuiText>
        </MuiLayoutBox>
    </MuiActionButton>


</MuiLayoutBox>

{/* Dashboard Middle Section */}


            <MuiLayoutBox className="leave-dashboard-content" component="div">


                {/* ==========================================
                    Leave Trend
                ========================================== */}

                <MuiLayoutBox className="leave-trend-panel" component="div">


                    <MuiLayoutBox className="dashboard-panel-header" component="div">

                        <MuiLayoutBox className="leave-trend-heading" component="div">
                            <MuiText component="h2" variant="h5">Leave Trend</MuiText>
                            <MuiText component="span" className="leave-trend-total" variant="inherit">
                                {leaveTrendTotal} approved {leaveTrendTotal === 1 ? "day" : "days"}
                            </MuiText>
                        </MuiLayoutBox>


                        <TextField select size="small" className="leave-view-select" value={trendView} onChange={(e) => setTrendView(e.target.value)} aria-label="Leave trend period">
                            <MenuItem value="weekly">Weekly View</MenuItem>
                            <MenuItem value="monthly">Monthly View</MenuItem>
                        </TextField>

                    </MuiLayoutBox>


                    <MuiLayoutBox className={`leave-trend-chart${leaveTrendTotal ? " has-data" : ""}`} component="div">
                        {leaveTrendTotal ? (
                            <Bar data={leaveTrendChartData} options={leaveTrendChartOptions} />
                        ) : (
                            <MuiLayoutBox className="leave-trend-empty" component="div">
                                <CalendarMonthRounded />
                                <MuiText component="p" variant="body2">No approved leave days for this period.</MuiText>
                            </MuiLayoutBox>
                        )}
                    </MuiLayoutBox>

                </MuiLayoutBox>



                {/* ==========================================
                    Upcoming Leaves
                ========================================== */}

                <MuiLayoutBox className="upcoming-leaves-panel" component="div">


                    <MuiLayoutBox className="dashboard-panel-header" component="div">

                        <MuiText component="h2" variant="h5">
                            Upcoming Leaves
                        </MuiText>


                        <TextField select size="small" className="leave-view-select" value={upcomingView} onChange={(e) => setUpcomingView(e.target.value)} aria-label="Upcoming leave period">
                            <MenuItem value="weekly">Weekly View</MenuItem>
                            <MenuItem value="monthly">Monthly View</MenuItem>
                            <MenuItem value="all">All Upcoming</MenuItem>
                        </TextField>

                    </MuiLayoutBox>


                    <MuiLayoutBox className="upcoming-leaves-table" component="div">


                        {/* Table Header */}

                        <MuiLayoutBox className="upcoming-table-header" component="div">

                            <MuiText component="span" variant="inherit">
                                Azure Employee ID
                            </MuiText>

                            <MuiText component="span" variant="inherit">
                                Leave Type
                            </MuiText>

                            <MuiText component="span" variant="inherit">
                                From & To
                            </MuiText>

                            <MuiText component="span" variant="inherit">
                                No Of Days
                            </MuiText>

                        </MuiLayoutBox>



                        {/* Table Rows */}

                        {upcomingLeaves.length > 0 ? (

                            upcomingLeaves.map(
                                (leave) => (

                                    <MuiLayoutBox
                                        className="upcoming-table-row"
                                        key={leave.leaveId}
                                     component="div">

                                        <MuiText component="span" variant="inherit">
                                            {leave.azureEmployeeId ?? leave.AzureEmployeeId ?? leave.azureEmployeeID ?? "-"}
                                        </MuiText>


                                        <MuiText component="span" variant="inherit">

                                            {getLeaveTypeName(
                                                leave.leaveTypeId
                                            )}

                                        </MuiText>


                                        <MuiText component="span" variant="inherit">

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

                                        </MuiText>


                                        <MuiText component="span" variant="inherit">

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

                                        </MuiText>

                                    </MuiLayoutBox>

                                )
                            )

                        ) : (

                            <MuiLayoutBox className="no-upcoming-leaves" component="div">

                                No upcoming leaves

                            </MuiLayoutBox>

                        )}


                    </MuiLayoutBox>

                </MuiLayoutBox>

            </MuiLayoutBox>



            {/* ==========================================
                Upcoming Events
            ========================================== */}

            <MuiLayoutBox className="upcoming-events-panel" component="div">


                <MuiLayoutBox className="dashboard-panel-header" component="div">

                    <MuiLayoutBox component="div">

                        <MuiText component="h2" variant="h5">
                            Upcoming Events
                        </MuiText>

                        <MuiText component="p" variant="body1">
                            Holidays and company events
                        </MuiText>

                    </MuiLayoutBox>


                    {upcomingEvents.length > 3 && (

                        <Button
                            type="button"
                            variant="outlined"
                            size="small"
                            onClick={() =>
                                setShowAllEvents(
                                    !showAllEvents
                                )
                            }
                        >
                            {showAllEvents
                                ? "Show Less"
                                : "View All"}
                        </Button>

                    )}

                </MuiLayoutBox>



                <MuiLayoutBox className="upcoming-events-list" component="div">


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

                                <MuiLayoutBox
                                    className="upcoming-event-item"
                                    key={event.eventId}
                                 component="div">

                                    <MuiLayoutBox className="event-date-box" component="div">

                                        <MuiText component="strong" variant="inherit">
                                            {day}
                                        </MuiText>

                                        <MuiText component="span" variant="inherit">
                                            {month}
                                        </MuiText>

                                    </MuiLayoutBox>


                                    <MuiLayoutBox className="event-details" component="div">

                                        <MuiText component="h3" variant="h6">
                                            {event.eventName}
                                        </MuiText>

                                        <MuiText component="p" variant="body1">
                                            {event.eventType}
                                        </MuiText>

                                    </MuiLayoutBox>

                                </MuiLayoutBox>

                            );

                        })

                    ) : (

                        <MuiLayoutBox className="no-upcoming-events" component="div">
                            No upcoming events
                        </MuiLayoutBox>

                    )}


                </MuiLayoutBox>

            </MuiLayoutBox>


        </MuiLayoutBox>
    );
}
