import { useEffect, useState } from "react";

import DashboardCards from "./DashboardCards";
import AttendanceChart from "../AttendanceManagement/My Attendance/AttendanceChart";
import DashboardBottom from "./DashboardBottom";

import { getProfile } from "../Services/ProfileService";
import { getEmployeeAttendance } from "../Services/AttendanceService";

import "./Dashboard.css";

function Dashboard() {

    const [profile, setProfile] = useState(null);
    const [attendance, setAttendance] = useState([]);
    const [loadingAttendance, setLoadingAttendance] = useState(true);

    useEffect(() => {

        async function loadDashboard() {

            try {

                // =========================
                // LOAD PROFILE
                // =========================

                const profileData = await getProfile();

                console.log(
                    "Dashboard Profile:",
                    profileData
                );

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

                    setAttendance([]);

                }

            }
            catch (error) {

                console.error(
                    "Dashboard Error:",
                    error
                );

                setAttendance([]);

            }
            finally {

                setLoadingAttendance(false);

            }

        }

        loadDashboard();

    }, []);


    // =========================
    // EMPLOYEE NAME
    // =========================

    const employeeName =
        profile?.displayName
            ? profile.displayName.split(" ")[0]
            : "Employee";


    return (

        <div className="employee-dashboard">

            {/* =========================
                WELCOME
            ========================= */}

            <div className="dashboard-welcome">

                <p>
                    Welcome back,
                </p>

                <h1>
                    Good Morning, {employeeName} 👋
                </h1>

            </div>


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

        </div>

    );

}

export default Dashboard;