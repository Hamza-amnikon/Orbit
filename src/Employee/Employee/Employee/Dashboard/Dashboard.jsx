import { useEffect, useState } from "react";

import DashboardCards from "./DashboardCards";
import AttendanceChart from "../Attendance/AttendanceChart";
import DashboardBottom from "./DashboardBottom";

import { getProfile } from "../Services/ProfileService";

import "./Dashboard.css";

function Dashboard() {

    const [profile, setProfile] = useState(null);

    useEffect(() => {

        async function loadProfile() {

            try {

                const data = await getProfile();

                console.log("Dashboard Profile:", data);

                setProfile(data);

            }
            catch (error) {

                console.error("Dashboard Error:", error);

            }

        }

        loadProfile();

    }, []);

    return (

        <div className="employee-dashboard">
            <p>

                Welcome back,

                <strong>

                    {" "}

                    <h1>
    Good Morning,{" "}
    {profile
        ? profile.displayName.split(" ")[0]
        : "Employee"}{" "}
    👋
</h1>

                </strong>

            </p>

            <DashboardCards />

            <AttendanceChart />

            <DashboardBottom />

        </div>

    );

}

export default Dashboard;