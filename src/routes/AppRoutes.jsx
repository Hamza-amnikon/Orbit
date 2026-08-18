import { Routes, Route, Navigate } from "react-router-dom";

import DashboardLayout from "../components/layout/DashboardLayout/DashboardLayout";

import Dashboard from "../pages/Dashboard/Dashboard";
import Attendance from "../pages/Attendance/Attendance";
import Payroll from "../pages/Payroll/Payroll";
import Reports from "../pages/Reports/Reports";
import Tickets from "../pages/Tickets/Tickets";
import SettingsDashboard from "../pages/Settings/SettingsDashboard";
import HolidayEvents from "../pages/Settings/HolidayEvents/HolidayEvents";
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
import LeaveDashboard from "../Admin/Leave/LeaveManagement/LeaveDashboard";
import LeaveTypes from "../Admin/Leave/LeaveTypes/LeaveTypes";
import LeaveRequests from "../Admin/Leave/LeaveRequests/LeaveRequests";
import LeaveTakenHistory from "../Admin/Leave/LeaveTakenHistory/LeaveTakenHistory";
import LeaveOverview from "../Admin/Leave/LeaveOverview/LeaveOverview";
import LeavePolicy from "../Admin/Leave/LeavePolicy/LeavePolicy";
import LeaveBalance from "../Admin/Leave/LeaveManagement/LeaveBalance/LeaveBalance";
import SalaryTemplate from "../pages/Payroll/SalaryTemplate";
import Hierarchy from "../pages/Settings/EmployeeHierarchy/Hierarchy";
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

                    <Route path="/" element={<Dashboard />} />

                    <Route path="/employees" element={<Employees />} />
                    <Route path="/employees/add" element={<AddEmployee />} />
                    <Route path="/employees/list" element={<EmployeeList />} />
                    <Route path="/employees/departments" element={<Departments />} />
                    <Route path="/employees/designations" element={<Designations />} />
                    <Route path="/employees/locations" element={<Locations />} />
                    <Route path="/employees/types" element={<EmployeeType />} />
                    <Route path="/employees/roles" element={<Role />} />

                    <Route path="/attendance" element={<Attendance />} />
                    <Route path="/leave" element={<LeaveDashboard />} />
                    <Route path="/leave/balance" element={<LeaveBalance />} />
                    <Route path="/leave/types" element={<LeaveTypes />} />
                    <Route path="/leave/policies" element={<LeavePolicy />} />
                    <Route path="/leave/requests" element={<LeaveRequests />} />
                    <Route path="/leave/history" element={<LeaveTakenHistory />} />
                    <Route path="/leave/dashboard" element={<LeaveOverview />} />
                    <Route path="/payroll" element={<Payroll />} />
                    <Route path="/payroll/salary-template" element={<SalaryTemplate />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/tickets" element={<Tickets />} />
                    <Route path="/settings" element={<SettingsDashboard />} />
                    <Route path="/settings/holidays-events" element={<HolidayEvents />} />
                    <Route path="/settings/employee-hierarchy" element={<Hierarchy />} />

                </Route>
            </Route>

        </Routes>
    );
}

export default AppRoutes;