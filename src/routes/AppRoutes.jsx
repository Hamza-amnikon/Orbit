import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout/DashboardLayout";
import Login from "../pages/Login/Login";
import Dashboard from "../pages/Dashboard/Dashboard";
import Employees from "../pages/Employees/Employees";
import Attendance from "../pages/Attendance/Attendance";
import Leave from "../pages/Leave/Leave";
import Payroll from "../pages/Payroll/Payroll";
import Reports from "../pages/Reports/Reports";
import Tickets from "../pages/Tickets/Tickets";
import Settings from "../pages/Settings/Settings";
import ForgotPassword from "../pages/ForgotPassword/ForgotPassword";
import AddEmployee from "../pages/Employees/AddEmployee";
import EmployeeList from "../pages/Employees/EmployeeList";
import Departments from "../pages/Employees/Departments";
import Designations from "../pages/Employees/Designations";
import PrivateRoute from "./PrivateRoute";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        {/* Protected Routes */}
        <Route element={<PrivateRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Dashboard />} />

            <Route path="/employees" element={<Employees />} />

            <Route path="/employees/add" element={<AddEmployee />} />

            <Route path="/employees/list" element={<EmployeeList />} />

            <Route path="/employees/departments" element={<Departments />} />

            <Route path="/employees/designations" element={<Designations />} />

            <Route path="/attendance" element={<Attendance />} />

            <Route path="/leave" element={<Leave />} />

            <Route path="/payroll" element={<Payroll />} />

            <Route path="/reports" element={<Reports />} />

            <Route path="/tickets" element={<Tickets />} />

            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
