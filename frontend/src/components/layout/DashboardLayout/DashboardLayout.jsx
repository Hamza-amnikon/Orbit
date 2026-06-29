import { Outlet } from "react-router-dom";

import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";

import "./DashboardLayout.css";

function DashboardLayout() {
    return (
        <div className="dashboard-layout">

            <Sidebar />

            <div className="dashboard-main">

                <Navbar />

                <main className="dashboard-content">
                    <Outlet />
                </main>

            </div>

        </div>
    );
}

export default DashboardLayout;