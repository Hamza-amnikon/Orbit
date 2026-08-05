import { Routes, Route, Navigate } from "react-router-dom";

import DashboardLayout from "../components/layout/DashboardLayout/DashboardLayout";

import Dashboard from "../pages/Dashboard/Dashboard";
import Payroll from "../pages/Payroll/Payroll";
import Reports from "../pages/Reports/Reports";
import Tickets from "../pages/Tickets/Tickets";
import Settings from "../pages/Settings/Settings";
import Leave from "../pages/Leave/Leave";
import Login from "../pages/Login/Login";
import AuthCallback from "../pages/Auth/AuthCallback";

import PrivateRoute from "./PrivateRoute";

// ================= Admin =================

import Employees from "../Admin/Employees/EmployeeManagement/Employees";
import AddEmployee from "../Admin/Employees/EmployeeManagement/AddEmployee";
import EmployeeList from "../Admin/Employees/EmployeeManagement/EmployeeList";
import Departments from "../Admin/Employees/Departments/Departments";
import Designations from "../Admin/Employees/Designations/Designations";
import Locations from "../Admin/Employees/Locations/Locations";
import EmployeeType from "../Admin/Employees/EmployeeType/EmployeeType";
import Role from "../Admin/Roles/Role";

// ================= Attendance =================

import Attendance from "../Admin/AttendanceManagement/Attendance";
import AttendanceDashboard from "../Admin/AttendanceManagement/Dashboard/AttendanceDashboard";
import AttendanceLogs from "../Admin/AttendanceManagement/AttendanceLogs/AttendanceLogs";
import Regularization from "../Admin/AttendanceManagement/Regularization/Regularization";
import ShiftManagement from "../Admin/AttendanceManagement/ShiftManagement/ShiftManagement";
import Holidays from "../Admin/AttendanceManagement/Holidays/Holidays";
import AttendanceReports from "../Admin/AttendanceManagement/Reports/AttendanceReports";

// ================= Employee =================

import EmployeeLayout from "../Employee/Employee/Employee/Layout/EmployeeLayout";
import EmployeeDashboard from "../Employee/Employee/Employee/Dashboard/Dashboard";
import EmployeeProfile from "../Employee/Employee/Employee/Profile/Profile";
import EmployeeAttendance from "../Employee/Employee/Employee/Attendance/Attendance";
import EmployeeLeave from "../Employee/Employee/Employee/Leave/Leave";
import EmployeeDocuments from "../Employee/Employee/Employee/Documents/Documents";
import EmployeeTeam from "../Employee/Employee/Employee/Team/Team";
import EmployeeNotifications from "../Employee/Employee/Employee/Notifications/Notifications";
import EmployeeSettings from "../Employee/Employee/Employee/Settings/Settings";

function AppRoutes() {
    return (
        <Routes>

            {/* ================= Public ================= */}

            <Route path="/login" element={<Login />} />
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* ================= Employee Portal ================= */}

            <Route element={<PrivateRoute />}>
                <Route path="/employee" element={<EmployeeLayout />}>

                    <Route index element={<Navigate to="dashboard" replace />} />

                    <Route path="dashboard" element={<EmployeeDashboard />} />
                    <Route path="profile" element={<EmployeeProfile />} />
                    <Route path="attendance" element={<EmployeeAttendance />} />
                    <Route path="leave" element={<EmployeeLeave />} />
                    <Route path="documents" element={<EmployeeDocuments />} />
                    <Route path="team" element={<EmployeeTeam />} />
                    <Route path="notifications" element={<EmployeeNotifications />} />
                    <Route path="settings" element={<EmployeeSettings />} />

                </Route>
            </Route>

            {/* ================= Admin Portal ================= */}

            <Route element={<PrivateRoute />}>
                <Route element={<DashboardLayout />}>

                    {/* Dashboard */}

                    <Route path="/" element={<Dashboard />} />

                    {/* Employee Management */}

                    <Route path="/employees" element={<Employees />} />
                    <Route path="/employees/add" element={<AddEmployee />} />
                    <Route path="/employees/list" element={<EmployeeList />} />
                    <Route path="/employees/departments" element={<Departments />} />
                    <Route path="/employees/designations" element={<Designations />} />
                    <Route path="/employees/locations" element={<Locations />} />
                    <Route path="/employees/types" element={<EmployeeType />} />
                    <Route path="/employees/roles" element={<Role />} />

                    {/* Attendance Management */}

                    <Route path="/attendance" element={<Attendance />} />
                    <Route path="/attendance/dashboard" element={<AttendanceDashboard />} />
                    <Route path="/attendance/logs" element={<AttendanceLogs />} />
                    <Route path="/attendance/regularization" element={<Regularization />} />
                    <Route path="/attendance/shifts" element={<ShiftManagement />} />
                    <Route path="/attendance/holidays" element={<Holidays />} />
                    <Route path="/attendance/reports" element={<AttendanceReports />} />

                    {/* Other Modules */}

                    <Route path="/leave" element={<Leave />} />
                    <Route path="/payroll" element={<Payroll />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/tickets" element={<Tickets />} />
                    <Route path="/settings" element={<Settings />} />

                </Route>
            </Route>

        </Routes>
    );
}

export default AppRoutes;