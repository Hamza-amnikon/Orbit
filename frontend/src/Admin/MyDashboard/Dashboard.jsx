import { useEffect, useState } from "react";

import DashboardCards from "./DashboardCards";
import AttendanceChart from "../AttendanceManagement/My Attendance/AttendanceChart";
import DashboardBottom from "./DashboardBottom";

import { getProfile } from "../Services/ProfileService";
import { getEmployeeAttendance } from "../Services/AttendanceService";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";

import "./Dashboard.css";
import { Box as MuiLayoutBox, Typography as MuiText } from "@mui/material";

function Dashboard() {

    const [profile, setProfile] = useState(null);
    const [attendance, setAttendance] = useState([]);
    const [loadingAttendance, setLoadingAttendance] = useState(true);

    useEffect(() => {

        let cancelled = false;
        let requestInFlight = false;

        async function loadDashboard() {

            if (requestInFlight) return;
            requestInFlight = true;

            try {

                // =========================
                // LOAD PROFILE
                // =========================

                const profileData = await getProfile();

                console.log(
                    "Dashboard Profile:",
                    profileData
                );

                if (cancelled) return;
                setProfile(profileData);


                // =========================
                // GET EMPLOYEE ID
                // =========================

                const employeeId =
                    profileData?.employeeId ??
                    profileData?.employeeID ??
                    profileData?.id;


                console.log(
                    "Dashboard Employee ID:",
                    employeeId
                );


                // =========================
                // LOAD ATTENDANCE
                // =========================

                if (employeeId) {

                    const attendanceData =
                        await getEmployeeAttendance(employeeId);

                    console.log(
                        "Dashboard Attendance:",
                        attendanceData
                    );

                    if (cancelled) return;
                    setAttendance(
                        Array.isArray(attendanceData)
                            ? attendanceData
                            : []
                    );

                }
                else {

                    console.warn(
                        "Employee ID was not found in profile."
                    );

                    if (!cancelled) setAttendance([]);

                }

            }
            catch (error) {

                console.error(
                    "Dashboard Error:",
                    error
                );

                if (!cancelled) setAttendance([]);

            }
            finally {

                requestInFlight = false;
                if (!cancelled) setLoadingAttendance(false);

            }

        }

        loadDashboard();

        const refreshTimer = window.setInterval(loadDashboard, 60_000);

        return () => {
            cancelled = true;
            window.clearInterval(refreshTimer);
        };

    }, []);


    // =========================
    // EMPLOYEE NAME
    // =========================

    const employeeName =
        profile?.displayName
            ? profile.displayName.split(" ")[0]
            : "Employee";

    const currentHour = new Date().getHours();
    const greeting = currentHour < 12
        ? "Good morning"
        : currentHour < 17
            ? "Good afternoon"
            : "Good evening";
    const today = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
    });


    return (

        <MuiLayoutBox className="my-dashboard-page" component="div">

            {/* =========================
                WELCOME
            ========================= */}

            <MuiLayoutBox className="dashboard-welcome" component="header">

                <MuiLayoutBox className="dashboard-welcome-copy" component="div">
                    <MuiText className="dashboard-eyebrow" component="p" variant="overline">
                        Welcome back
                    </MuiText>

                    <MuiText component="h1" variant="h4">
                        {greeting}, {employeeName} <span aria-hidden="true">👋</span>
                    </MuiText>

                    <MuiText className="dashboard-welcome-description" component="p" variant="body1">
                        Your personal attendance, leave and work summary.
                    </MuiText>
                </MuiLayoutBox>

                <MuiLayoutBox className="dashboard-date" component="div">
                    <MuiLayoutBox className="dashboard-date-icon" aria-hidden="true" component="div">
                        <CalendarMonthRoundedIcon />
                    </MuiLayoutBox>
                    <MuiLayoutBox component="div">
                        <MuiText component="span" variant="caption">Today</MuiText>
                        <MuiText component="strong" variant="body2">{today}</MuiText>
                    </MuiLayoutBox>
                </MuiLayoutBox>

            </MuiLayoutBox>


            {/* =========================
                DASHBOARD CARDS
            ========================= */}

            <DashboardCards
                profile={profile}
                attendance={attendance}
                loading={loadingAttendance}
            />


            {/* =========================
                ATTENDANCE OVERVIEW
            ========================= */}

            <AttendanceChart
                attendance={attendance}
                loading={loadingAttendance}
            />


            {/* =========================
                BOTTOM SECTION
            ========================= */}

            <DashboardBottom
                profile={profile}
                attendance={attendance}
                loading={loadingAttendance}
            />

        </MuiLayoutBox>

    );

}

export default Dashboard;
