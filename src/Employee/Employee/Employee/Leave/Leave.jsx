import React, { useEffect, useMemo, useState } from "react";
import "./Leave.css";

import DashboardIcon from "@mui/icons-material/Dashboard";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import PeopleIcon from "@mui/icons-material/People";

import LeaveService from "./LeaveService";
import api from "../../../../services/api";

const Leave = () => {
    // =========================================================
    // STATE
    // =========================================================

    const [leaves, setLeaves] = useState([]);
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [profile, setProfile] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [period, setPeriod] = useState("This Month");

    // =========================================================
    // LOAD DATA
    // =========================================================

    useEffect(() => {
        loadLeaveData();
    }, []);

    const loadLeaveData = async () => {
        try {
            setLoading(true);
            setError("");

         // =====================================================
// 1. GET LOGGED-IN EMPLOYEE PROFILE
// =====================================================

const profileResponse = await api.get("/Auth/profile");

const employee = profileResponse.data;

console.log(
    "Logged-in Employee Profile:",
    employee
);

if (!employee?.employeeId) {
    throw new Error(
        "Logged-in employee ID was not found."
    );
}

console.log(
    "Logged-in Employee ID:",
    employee.employeeId
);

setProfile(employee);

            // =====================================================
            // 2. GET LEAVES + LEAVE TYPES
            // =====================================================

            const [
                leaveResponse,
                leaveTypeResponse
            ] = await Promise.all([
                LeaveService.getLeaves(),
                LeaveService.getLeaveTypes(),
            ]);

            console.log(
                "All Leave API Data:",
                leaveResponse
            );

            console.log(
                "Leave Types API:",
                leaveTypeResponse
            );

            const allLeaves = Array.isArray(
                leaveResponse
            )
                ? leaveResponse
                : [];

            // =====================================================
            // 3. FILTER ONLY LOGGED-IN EMPLOYEE'S LEAVES
            // =====================================================

            const myLeaves = allLeaves.filter(
                (leave) =>
                    Number(leave.employeeId) ===
                    Number(employee.employeeId)
            );

            console.log(
                "Logged-in Employee ID:",
                employee.employeeId
            );

            console.log(
                "My Leave Requests:",
                myLeaves
            );

            setLeaves(myLeaves);

            // =====================================================
            // 4. LEAVE TYPES
            // =====================================================

            setLeaveTypes(
                Array.isArray(leaveTypeResponse)
                    ? leaveTypeResponse
                    : []
            );

        } catch (err) {
            console.error(
                "Leave Dashboard Error:",
                err
            );

            setError(
                err?.response?.data ||
                err?.message ||
                "Unable to load leave data."
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // LEAVE TYPE LOOKUP
    // =========================================================

    const getLeaveTypeName = (leaveTypeId) => {
        const leaveType = leaveTypes.find(
            (type) =>
                Number(type.leaveTypeId) ===
                Number(leaveTypeId)
        );

        return (
            leaveType?.leaveTypeName ||
            "Unknown"
        );
    };

    // =========================================================
    // PERIOD FILTER
    // =========================================================

    const filteredLeaves = useMemo(() => {
        if (!Array.isArray(leaves)) {
            return [];
        }

        const now = new Date();

        // =====================================================
        // THIS YEAR
        // =====================================================

        if (period === "This Year") {
            return leaves.filter((leave) => {
                const date = new Date(
                    leave.appliedDate
                );

                return (
                    date.getFullYear() ===
                    now.getFullYear()
                );
            });
        }

        // =====================================================
        // LAST MONTH
        // =====================================================

        if (period === "Last Month") {
            const lastMonth = new Date(
                now.getFullYear(),
                now.getMonth() - 1,
                1
            );

            const nextMonth = new Date(
                now.getFullYear(),
                now.getMonth(),
                1
            );

            return leaves.filter((leave) => {
                const date = new Date(
                    leave.appliedDate
                );

                return (
                    date >= lastMonth &&
                    date < nextMonth
                );
            });
        }

        // =====================================================
        // THIS MONTH
        // =====================================================

        return leaves.filter((leave) => {
            const date = new Date(
                leave.appliedDate
            );

            return (
                date.getMonth() ===
                    now.getMonth() &&
                date.getFullYear() ===
                    now.getFullYear()
            );
        });

    }, [leaves, period]);

    // =========================================================
    // STATISTICS
    // =========================================================

    const statistics = useMemo(() => {
        const total =
            filteredLeaves.length;

        const pending =
            filteredLeaves.filter(
                (leave) =>
                    String(
                        leave.status
                    ).toLowerCase() ===
                    "pending"
            ).length;

        const approved =
            filteredLeaves.filter(
                (leave) =>
                    String(
                        leave.status
                    ).toLowerCase() ===
                    "approved"
            ).length;

        const rejected =
            filteredLeaves.filter(
                (leave) =>
                    String(
                        leave.status
                    ).toLowerCase() ===
                    "rejected"
            ).length;

        return {
            total,
            pending,
            approved,
            rejected,
        };
    }, [filteredLeaves]);

    // =========================================================
    // CALCULATE LEAVE DAYS
    // =========================================================

    const calculateDays = (
        fromDate,
        toDate
    ) => {
        if (!fromDate || !toDate) {
            return 0;
        }

        const from = new Date(fromDate);
        const to = new Date(toDate);

        const difference =
            to.getTime() -
            from.getTime();

        return (
            Math.floor(
                difference /
                    (1000 * 60 * 60 * 24)
            ) + 1
        );
    };

    // =========================================================
    // LEAVE TAKEN
    // ONLY APPROVED LEAVES
    // =========================================================

    const leaveTaken = useMemo(() => {
        return filteredLeaves
            .filter(
                (leave) =>
                    String(
                        leave.status
                    ).toLowerCase() ===
                    "approved"
            )
            .reduce(
                (total, leave) => {
                    return (
                        total +
                        calculateDays(
                            leave.fromDate,
                            leave.toDate
                        )
                    );
                },
                0
            );
    }, [filteredLeaves]);

    // =========================================================
    // EMPLOYEES CURRENTLY ON LEAVE
    // =========================================================

    const employeesOnLeave =
        useMemo(() => {
            const today = new Date();

            const employees =
                filteredLeaves.filter(
                    (leave) => {
                        const from =
                            new Date(
                                leave.fromDate
                            );

                        const to =
                            new Date(
                                leave.toDate
                            );

                        return (
                            String(
                                leave.status
                            ).toLowerCase() ===
                                "approved" &&
                            from <= today &&
                            to >= today
                        );
                    }
                );

            const uniqueEmployees =
                new Set(
                    employees.map(
                        (leave) =>
                            leave.employeeId
                    )
                );

            return uniqueEmployees.size;
        }, [filteredLeaves]);

    // =========================================================
    // LEAVE TYPE DISTRIBUTION
    // =========================================================

    const leaveTypeDistribution =
        useMemo(() => {
            const distribution = {};

            filteredLeaves
                .filter(
                    (leave) =>
                        String(
                            leave.status
                        ).toLowerCase() ===
                        "approved"
                )
                .forEach((leave) => {
                    const name =
                        getLeaveTypeName(
                            leave.leaveTypeId
                        );

                    const days =
                        calculateDays(
                            leave.fromDate,
                            leave.toDate
                        );

                    if (
                        !distribution[name]
                    ) {
                        distribution[name] = 0;
                    }

                    distribution[name] +=
                        days;
                });

            return Object.entries(
                distribution
            );
        }, [
            filteredLeaves,
            leaveTypes,
        ]);

    // =========================================================
    // FORMAT DATE
    // =========================================================

    const formatDate = (date) => {
        if (!date) {
            return "-";
        }

        return new Date(
            date
        ).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };

    // =========================================================
    // STATUS CLASS
    // =========================================================

    const getStatusClass = (
        status
    ) => {
        const value =
            String(
                status
            ).toLowerCase();

        if (value === "approved") {
            return "approved";
        }

        if (value === "pending") {
            return "pending";
        }

        if (value === "rejected") {
            return "rejected";
        }

        return "";
    };

    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {
        return (
            <div className="leave-dashboard">

                <div className="leave-header">
                    <div>
                        <h1>
                            My Leave
                        </h1>

                        <p>
                            Loading your leave
                            information...
                        </p>
                    </div>
                </div>

                <div
                    style={{
                        padding: "40px",
                        textAlign: "center",
                    }}
                >
                    Loading...
                </div>

            </div>
        );
    }

    // =========================================================
    // ERROR
    // =========================================================

    if (error) {
        return (
            <div className="leave-dashboard">

                <div className="leave-header">
                    <div>
                        <h1>
                            My Leave
                        </h1>

                        <p>
                            View your leave
                            requests, approvals
                            and usage.
                        </p>
                    </div>
                </div>

                <div
                    style={{
                        padding: "30px",
                        background: "#fff",
                        borderRadius: "12px",
                        color: "#dc2626",
                    }}
                >
                    <h3>
                        Unable to load
                        leave data
                    </h3>

                    <p>
                        {error}
                    </p>

                    <button
                        onClick={
                            loadLeaveData
                        }
                        style={{
                            marginTop:
                                "10px",
                            padding:
                                "10px 18px",
                            border: "none",
                            borderRadius:
                                "6px",
                            cursor:
                                "pointer",
                        }}
                    >
                        Retry
                    </button>
                </div>

            </div>
        );
    }

    // =========================================================
    // UI
    // =========================================================

    return (
        <div className="leave-dashboard">

            {/* ================= HEADER ================= */}

            <div className="leave-header">

                <div>

                    <h1>
                        My Leave
                    </h1>

                    <p>
                        View your leave
                        requests, approvals
                        and leave usage.
                    </p>

                </div>

                <select
                    className="leave-period"
                    value={period}
                    onChange={(e) =>
                        setPeriod(
                            e.target.value
                        )
                    }
                >
                    <option>
                        This Month
                    </option>

                    <option>
                        Last Month
                    </option>

                    <option>
                        This Year
                    </option>
                </select>

            </div>

            {/* ================= STAT CARDS ================= */}

            <div className="leave-stat-grid">

                {/* TOTAL */}

                <div className="leave-stat-card total">

                    <div className="leave-stat-icon">
                        <DashboardIcon />
                    </div>

                    <div>

                        <span>
                            My Requests
                        </span>

                        <h2>
                            {
                                statistics.total
                            }
                        </h2>

                    </div>

                </div>

                {/* PENDING */}

                <div className="leave-stat-card pending">

                    <div className="leave-stat-icon">
                        <PendingActionsIcon />
                    </div>

                    <div>

                        <span>
                            Pending
                        </span>

                        <h2>
                            {
                                statistics.pending
                            }
                        </h2>

                    </div>

                </div>

                {/* APPROVED */}

                <div className="leave-stat-card approved">

                    <div className="leave-stat-icon">
                        <CheckCircleIcon />
                    </div>

                    <div>

                        <span>
                            Approved
                        </span>

                        <h2>
                            {
                                statistics.approved
                            }
                        </h2>

                    </div>

                </div>

                {/* REJECTED */}

                <div className="leave-stat-card rejected">

                    <div className="leave-stat-icon">
                        <CancelIcon />
                    </div>

                    <div>

                        <span>
                            Rejected
                        </span>

                        <h2>
                            {
                                statistics.rejected
                            }
                        </h2>

                    </div>

                </div>

            </div>

            {/* ================= SECONDARY STATS ================= */}

            <div className="leave-secondary-grid">

                {/* LEAVE TAKEN */}

                <div className="leave-info-card">

                    <div className="leave-info-icon blue">
                        <EventAvailableIcon />
                    </div>

                    <div>

                        <span>
                            Leave Taken
                        </span>

                        <h2>
                            {leaveTaken} Days
                        </h2>

                        <small>
                            {period}
                        </small>

                    </div>

                </div>

                {/* CURRENTLY ON LEAVE */}

                <div className="leave-info-card">

                    <div className="leave-info-icon purple">
                        <PeopleIcon />
                    </div>

                    <div>

                        <span>
                            Currently On Leave
                        </span>

                        <h2>
                            {employeesOnLeave}
                        </h2>

                        <small>
                            Currently
                        </small>

                    </div>

                </div>

            </div>

            {/* ================= CONTENT ================= */}

            <div className="leave-content-grid">

                {/* LEAVE OVERVIEW */}

                <div className="leave-panel">

                    <div className="leave-panel-header">

                        <div>

                            <h2>
                                My Leave Overview
                            </h2>

                            <p>
                                Your leave
                                requests by
                                status
                            </p>

                        </div>

                    </div>

                    <div
                        className="leave-chart-placeholder"
                        style={{
                            minHeight:
                                "220px",
                            display:
                                "flex",
                            alignItems:
                                "center",
                            justifyContent:
                                "center",
                        }}
                    >

                        {statistics.total ===
                        0 ? (

                            <div className="chart-empty">

                                <DashboardIcon />

                                <h3>
                                    No leave
                                    data yet
                                </h3>

                                <p>
                                    Your leave
                                    statistics
                                    will appear
                                    here once
                                    you submit
                                    leave
                                    requests.
                                </p>

                            </div>

                        ) : (

                            <div
                                style={{
                                    width:
                                        "100%",
                                    padding:
                                        "20px",
                                }}
                            >

                                <div
                                    style={{
                                        display:
                                            "grid",
                                        gap:
                                            "15px",
                                    }}
                                >

                                    {/* PENDING */}

                                    <div>

                                        <strong>
                                            Pending
                                        </strong>

                                        <div
                                            style={{
                                                height:
                                                    "10px",
                                                background:
                                                    "#f1f5f9",
                                                borderRadius:
                                                    "10px",
                                                marginTop:
                                                    "6px",
                                            }}
                                        >

                                            <div
                                                style={{
                                                    width: `${
                                                        statistics.total
                                                            ? (statistics.pending /
                                                                  statistics.total) *
                                                              100
                                                            : 0
                                                    }%`,
                                                    height:
                                                        "100%",
                                                    background:
                                                        "#f59e0b",
                                                    borderRadius:
                                                        "10px",
                                                }}
                                            />

                                        </div>

                                    </div>

                                    {/* APPROVED */}

                                    <div>

                                        <strong>
                                            Approved
                                        </strong>

                                        <div
                                            style={{
                                                height:
                                                    "10px",
                                                background:
                                                    "#f1f5f9",
                                                borderRadius:
                                                    "10px",
                                                marginTop:
                                                    "6px",
                                            }}
                                        >

                                            <div
                                                style={{
                                                    width: `${
                                                        statistics.total
                                                            ? (statistics.approved /
                                                                  statistics.total) *
                                                              100
                                                            : 0
                                                    }%`,
                                                    height:
                                                        "100%",
                                                    background:
                                                        "#22c55e",
                                                    borderRadius:
                                                        "10px",
                                                }}
                                            />

                                        </div>

                                    </div>

                                    {/* REJECTED */}

                                    <div>

                                        <strong>
                                            Rejected
                                        </strong>

                                        <div
                                            style={{
                                                height:
                                                    "10px",
                                                background:
                                                    "#f1f5f9",
                                                borderRadius:
                                                    "10px",
                                                marginTop:
                                                    "6px",
                                            }}
                                        >

                                            <div
                                                style={{
                                                    width: `${
                                                        statistics.total
                                                            ? (statistics.rejected /
                                                                  statistics.total) *
                                                              100
                                                            : 0
                                                    }%`,
                                                    height:
                                                        "100%",
                                                    background:
                                                        "#ef4444",
                                                    borderRadius:
                                                        "10px",
                                                }}
                                            />

                                        </div>

                                    </div>

                                </div>

                            </div>
                        )}

                    </div>

                </div>

                {/* LEAVE TYPES */}

                <div className="leave-panel">

                    <div className="leave-panel-header">

                        <div>

                            <h2>
                                My Leave Type
                                Distribution
                            </h2>

                            <p>
                                Your approved
                                leave usage
                                by type
                            </p>

                        </div>

                    </div>

                    <div className="leave-type-list">

                        {leaveTypeDistribution.length ===
                        0 ? (

                            <div className="chart-empty">

                                <p>
                                    No approved
                                    leave data
                                    available.
                                </p>

                            </div>

                        ) : (

                            leaveTypeDistribution.map(
                                (
                                    [name, days]
                                ) => (
                                    <div
                                        className="leave-type-row"
                                        key={name}
                                    >

                                        <span>
                                            {name}
                                        </span>

                                        <strong>
                                            {days} Days
                                        </strong>

                                    </div>
                                )
                            )

                        )}

                    </div>

                </div>

            </div>

            {/* ================= MY RECENT REQUESTS ================= */}

            <div className="leave-panel recent-leave-panel">

                <div className="leave-panel-header">

                    <div>

                        <h2>
                            My Recent Leave
                            Requests
                        </h2>

                        <p>
                            Your latest leave
                            applications
                        </p>

                    </div>

                    <button
                        className="view-all-btn"
                        onClick={
                            loadLeaveData
                        }
                    >
                        Refresh
                    </button>

                </div>

                <div className="leave-table-wrapper">

                    <table className="leave-table">

                        <thead>

                            <tr>

                                <th>
                                    Leave Type
                                </th>

                                <th>
                                    From
                                </th>

                                <th>
                                    To
                                </th>

                                <th>
                                    Days
                                </th>

                                <th>
                                    Status
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {filteredLeaves.length ===
                            0 ? (

                                <tr>

                                    <td
                                        colSpan="5"
                                        className="empty-table"
                                    >
                                        No leave
                                        requests
                                        found.
                                    </td>

                                </tr>

                            ) : (

                                filteredLeaves
                                    .slice(
                                        0,
                                        10
                                    )
                                    .map(
                                        (
                                            leave
                                        ) => (

                                            <tr
                                                key={
                                                    leave.leaveId
                                                }
                                            >

                                                <td>
                                                    {
                                                        getLeaveTypeName(
                                                            leave.leaveTypeId
                                                        )
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        formatDate(
                                                            leave.fromDate
                                                        )
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        formatDate(
                                                            leave.toDate
                                                        )
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        calculateDays(
                                                            leave.fromDate,
                                                            leave.toDate
                                                        )
                                                    }
                                                </td>

                                                <td>

                                                    <span
                                                        className={`leave-status ${getStatusClass(
                                                            leave.status
                                                        )}`}
                                                    >
                                                        {
                                                            leave.status
                                                        }
                                                    </span>

                                                </td>

                                            </tr>

                                        )
                                    )

                            )}

                        </tbody>

                    </table>

                </div>

            </div>

        </div>
    );
};

export default Leave;