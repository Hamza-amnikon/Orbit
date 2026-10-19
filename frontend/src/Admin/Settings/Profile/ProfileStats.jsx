import "./Profile.css";

import {
    CalendarMonth,
    EventAvailable,
    WorkHistory,
    AssignmentTurnedIn
} from "@mui/icons-material";
import { Box as MuiLayoutBox, Typography as MuiText } from "@mui/material";
import { useEffect, useState } from "react";
import { getEmployeeAttendance } from "../../Services/AttendanceService";
import LeaveService from "../../Services/LeaveService";

function ProfileStats({ profile }) {
    const [attendanceValue, setAttendanceValue] = useState("—");
    const [leaveValue, setLeaveValue] = useState("—");

    useEffect(() => {
        const employeeId = profile?.employeeId ?? profile?.EmployeeId ?? profile?.employeeID ?? profile?.EmployeeID;
        if (employeeId === undefined || employeeId === null || employeeId === "") return undefined;

        let mounted = true;
        const loadStats = async () => {
            const [attendanceResult, leaveResult] = await Promise.allSettled([
                getEmployeeAttendance(employeeId),
                LeaveService.getEmployeeLeaveBalances(employeeId),
            ]);

            if (!mounted) return;

            if (attendanceResult.status === "fulfilled") {
                const records = Array.isArray(attendanceResult.value) ? attendanceResult.value : [];
                const counted = records.filter((record) => {
                    const status = String(record?.status ?? record?.attendanceStatus ?? "").toLowerCase();
                    return status && !status.includes("leave") && !status.includes("weekly off") && !status.includes("holiday");
                });
                const attended = counted.reduce((total, record) => {
                    const status = String(record?.status ?? record?.attendanceStatus ?? "").toLowerCase();
                    if (status.includes("present")) return total + 1;
                    if (status.includes("half")) return total + 0.5;
                    return total;
                }, 0);
                setAttendanceValue(counted.length ? `${Math.round((attended / counted.length) * 100)}%` : "—");
            }

            if (leaveResult.status === "fulfilled") {
                const balances = Array.isArray(leaveResult.value) ? leaveResult.value : [];
                const days = balances.reduce((total, balance) => total + (Number(balance?.balanceDays) || 0), 0);
                setLeaveValue(`${Number.isInteger(days) ? days : days.toFixed(1)} Days`);
            }
        };

        loadStats();
        return () => { mounted = false; };
    }, [profile]);

    const joinDate = profile?.joiningDate ?? profile?.JoiningDate ?? profile?.joinDate ?? profile?.JoinDate;
    const experience = (() => {
        if (!joinDate) return "—";
        const started = new Date(joinDate);
        if (Number.isNaN(started.getTime())) return "—";
        const months = Math.max(0, (new Date().getFullYear() - started.getFullYear()) * 12 + new Date().getMonth() - started.getMonth());
        const years = Math.floor(months / 12);
        const remainingMonths = months % 12;
        return years ? `${years} ${years === 1 ? "Year" : "Years"}` : `${remainingMonths} ${remainingMonths === 1 ? "Month" : "Months"}`;
    })();
    const projectCount = profile?.projectCount ?? profile?.ProjectCount ?? (Array.isArray(profile?.projects) ? profile.projects.length : null);

    const stats = [
        {
            icon: <EventAvailable />,
            title: "Attendance",
            value: attendanceValue,
            color: "#22c55e"
        },
        {
            icon: <CalendarMonth />,
            title: "Leave Balance",
            value: leaveValue,
            color: "#2563eb"
        },
        {
            icon: <WorkHistory />,
            title: "Experience In Amnikon",
            value: experience,
            color: "#f59e0b"
        },
        {
            icon: <AssignmentTurnedIn />,
            title: "Projects",
            value: projectCount === null || projectCount === undefined ? "—" : String(projectCount).padStart(2, "0"),
            color: "#8b5cf6"
        }
    ];

    return (

        <MuiLayoutBox className="profile-stats" component="div">

            {stats.map((item, index) => (

                <MuiLayoutBox className="stat-card" key={index} component="div">

                    <MuiLayoutBox
                        className="stat-icon"
                        style={{ background: item.color }}
                     component="div">
                        {item.icon}
                    </MuiLayoutBox>

                    <MuiLayoutBox component="div">

                        <MuiText component="span" variant="inherit">{item.title}</MuiText>

                        <MuiText component="h2" variant="h5">{item.value}</MuiText>

                    </MuiLayoutBox>

                </MuiLayoutBox>

            ))}

        </MuiLayoutBox>

    );

}

export default ProfileStats;
