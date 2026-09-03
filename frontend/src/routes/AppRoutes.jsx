import { Routes, Route, Navigate } from "react-router-dom";

import DashboardLayout from "../components/layout/DashboardLayout/DashboardLayout";

import Dashboard from "../pages/Dashboard/Dashboard";
import Attendance from "../Admin/AttendanceManagement/Attendance";
import Payroll from "../Admin/PayrollManagement/Payroll";
import Reports from "../pages/Reports/Reports";
import Tickets from "../pages/Tickets/Tickets";

import HolidayEvents from "../Admin/AttendanceManagement/Holiday/Holiday";
import Login from "../pages/Login/Login";
import AuthCallback from "./AuthCallback";
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
import LeaveReports from "../Admin/Leave/LeaveReports/LeaveReports";
import Hierarchy from "../Admin/Employees/EmployeeHierarchy/Hierarchy";
import PayrollDashboard from "../Admin/PayrollManagement/PayrollDashboard/PayrollDashboard";
import PayslipTemplates from "../Admin/PayrollManagement/PayslipTemplates/PayslipTemplates";
import CreatePayslipTemplate from "../Admin/PayrollManagement/PayslipTemplates/CreatePayslipTemplate/CreatePayslipTemplate";
import PayrollProcess from "../Admin/PayrollManagement/PayrollProcess/PayrollProcess";
import EmployeesPayroll from "../Admin/PayrollManagement/EmployeesPayroll/EmployeesPayroll";
import EmployeesHistory from "../Admin/PayrollManagement/PayrollHistory/PayrollHistory";
import SalaryComponents from "../Admin/PayrollManagement/SalaryComponents/SalaryComponents";
import DocumentManagement from "../Admin/DocumentManagement/DocumentManagement";
import SettingsDashboard from "../Admin/Settings/SettingsDashboard";
import MyAttendance from "../Admin/AttendanceManagement/My Attendance/Attendance";
import MyLeave from "../Admin/Leave/MyLeave/Leave/Leave";
import MyPayroll from "../Admin/PayrollManagement/MyPayroll/Payrolls";
import AttendanceLogs from "../Admin/AttendanceManagement/AttendanceLogs/AttendanceLogs";
import AttendanceDashboard from "../Admin/AttendanceManagement/Dashboard/AttendanceDashboard";
import ShiftManagement from "../Admin/AttendanceManagement/ShiftManagement/ShiftManagement";
import CompOff from "../Admin/Leave/CompOff/CompOff";
import PermissionManagement from "../Admin/PermissionManagement/Permissions";

// ================= Employee =================







function AppRoutes() {
    return (
        <Routes>

            {/* ================= Public ================= */}

            <Route path="/login" element={<Login />} />
            <Route path="/auth/callback" element={<AuthCallback />} />

           

            {/* ================= Admin Portal ================= */}

            <Route element={<PrivateRoute />}>
                <Route element={<DashboardLayout />}>

                    <Route path="/" element={<Dashboard />} />
                    <Route path="/dashboard" element={<Dashboard />} />

                    {/* Employees */}
                    <Route path="/employees" element={<Employees />} />
                    <Route path="/employees/add" element={<AddEmployee />} />
                    <Route path="/employees/list" element={<EmployeeList />} />
                    <Route path="/employees/departments" element={<Departments />} />
                    <Route path="/employees/designations" element={<Designations />} />
                    <Route path="/employees/locations" element={<Locations />} />
                    <Route path="/employees/types" element={<EmployeeType />} />
                    <Route path="/employees/roles" element={<Role />} />
                    
                <Route path="/employees/my-dashboard" element={<Dashboard />} />
                    {/* Employee Hierarchy */}
                    <Route
                        path="/employees/EmployeeHierarchy"
                        element={<Hierarchy />}
                    />

                    {/* Attendance */}
                    <Route path="/attendance" element={<Attendance />} />
                    <Route path="/attendance/my-attendance" element={<MyAttendance />} />
                    <Route path="/attendance/logs" element={<AttendanceLogs />} />
                    <Route path="/attendance/dashboard" element={<AttendanceDashboard />} />
                    <Route path="/attendance/shifts" element={<ShiftManagement />}
                    
                    />
                    <Route path="/permission-management" element={<PermissionManagement />} />

                    <Route
                        path="/attendance/Holiday"
                        element={<HolidayEvents />}
                    />

                    {/* Leave */}
                    <Route path="/leave" element={<LeaveDashboard />} />
                    <Route path="/leave/overview" element={<LeaveOverview />} />
                    <Route path="/leave/balance" element={<LeaveBalance />} />
                    <Route path="/leave/types" element={<LeaveTypes />} />
                    <Route path="/leave/policies" element={<LeavePolicy />} />
                    <Route path="/leave/requests" element={<LeaveRequests />} />
                    <Route path="/leave/history" element={<LeaveTakenHistory />} />
                    <Route path="/leave/my-leave" element={<MyLeave />} />
                    <Route path="/leave/reports" element={<LeaveReports />} />
                    <Route
    path="/admin/leave/compoff"
    element={<CompOff />}
/>



                    {/* {PayRolls } */}
 <Route
                        path="/employee/payroll"
                        element={<MyPayroll />} />
                    
                    <Route path="/payroll" element={<Payroll />} />

                    <Route
                        path="/payroll/dashboard"
                        element={<PayrollDashboard />}
                    />
                    <Route
                        path="/payroll/payslip-templates"
                        element={<PayslipTemplates />}
                    />
                    <Route
                        path="/payroll/payslip-templates/create"
                        element={<CreatePayslipTemplate />}
                    />
                    <Route
                        path="/payroll/process"
                        element={<PayrollProcess />}
                    />
                    <Route
                        path="/payroll/employees"
                        element={<EmployeesPayroll />}
                    />
                    <Route
                        path="/payroll/history"
                        element={<EmployeesHistory />}
                    />
                    <Route
                        path="/payroll/salary-components"
                        element={<SalaryComponents />}
                    />


                    {/* Other */}

                    <Route path="/reports" element={<Reports />} />
                    <Route path="/tickets" element={<Tickets />} />
                    <Route path="/documents" element={<DocumentManagement />} />
                    <Route path="/settings" element={<SettingsDashboard />} />

                </Route>
            </Route>

        </Routes>
    );
}

export default AppRoutes;