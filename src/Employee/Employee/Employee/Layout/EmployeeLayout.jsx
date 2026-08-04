import { Outlet } from "react-router-dom";

import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";

import "./EmployeeLayout.css";

function EmployeeLayout() {
    return (
        <div className="employee-layout">

            <Sidebar />

            <div className="employee-main">

                <Navbar />

                <div className="employee-content">
                    <Outlet />
                </div>

            </div>

        </div>
    );
}

export default EmployeeLayout;