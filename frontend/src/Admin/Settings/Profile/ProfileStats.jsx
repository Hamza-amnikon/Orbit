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
import ShiftService from "../../AttendanceManagement/services/ShiftService";
import { attendanceCalendarDate, attendanceDateKey } from "../../AttendanceManagement/attendanceDate";
import { getMonthlyAttendancePercentage } from "../../AttendanceManagement/attendanceSummary";

function ProfileStats({ profile }) {
    const [attendanceValue, setAttendanceValue] = useState("—");
    const [leaveValue, setLeaveValue] = useState("—");
    const todayKey = attendanceDateKey(new Date());
    const [currentYear, currentMonth] = todayKey.slice(0, 7).split("-").map(Number);
    const employeeId = profile?.employeeId ?? profile?.EmployeeId ?? profile?.employeeID ?? profile?.EmployeeID;
    const joinDate = profile?.joiningDate ?? profile?.JoiningDate ?? profile?.joinDate ?? profile?.JoinDate;
    const attendanceMonthLabel = new Intl.DateTimeFormat(undefined, {
        month: "long",
        year: "numeric",
    }).format(attendanceCalendarDate(todayKey));

    useEffect(() => {
        if (employeeId === undefined || employeeId === null || employeeId === "") return undefined;

        let mounted = true;
        const loadStats = async () => {
            const [attendanceResult, leaveResult, shiftResult] = await Promise.allSettled([
                getEmployeeAttendance(employeeId),
                LeaveService.getEmployeeLeaveBalances(employeeId),
                ShiftService.getEmployeeShifts(employeeId),
            ]);

            if (!mounted) return;

            const percentage = attendanceResult.status === "fulfilled" && shiftResult.status === "fulfilled"
                ? getMonthlyAttendancePercentage(attendanceResult.value, todayKey, shiftResult.value, joinDate)
                : null;
            setAttendanceValue(percentage === null ? "—" : `${percentage}%`);

            if (leaveResult.status === "fulfilled") {
                const balances = Array.isArray(leaveResult.value) ? leaveResult.value : [];
                const days = balances.reduce((total, balance) => total + (Number(balance?.balanceDays) || 0), 0);
                setLeaveValue(`${Number.isInteger(days) ? days : days.toFixed(1)} Days`);
            }
        };

        loadStats();
        return () => { mounted = false; };
    }, [employeeId, joinDate, todayKey]);

    const experience = (() => {
        if (!joinDate) return "—";
        const started = attendanceDateKey(joinDate);
        if (!started) return "—";
        const months = Math.max(0, (currentYear - Number(started.slice(0, 4))) * 12 + currentMonth - Number(started.slice(5, 7)));
        const years = Math.floor(months / 12);
        const remainingMonths = months % 12;
        return years ? `${years} ${years === 1 ? "Year" : "Years"}` : `${remainingMonths} ${remainingMonths === 1 ? "Month" : "Months"}`;
    })();
    const projectCount = profile?.projectCount ?? profile?.ProjectCount ?? (Array.isArray(profile?.projects) ? profile.projects.length : null);

    const stats = [
        {
            icon: <EventAvailable />,
            title: `Attendance (${attendanceMonthLabel})`,
            value: attendanceValue,
        },
        {
            icon: <CalendarMonth />,
            title: "Leave Balance",
            value: leaveValue,
        },
        {
            icon: <WorkHistory />,
            title: "Experience In Amnikon",
            value: experience,
        },
        {
            icon: <AssignmentTurnedIn />,
            title: "Projects",
            value: projectCount === null || projectCount === undefined ? "—" : String(projectCount).padStart(2, "0"),
        }
    ];

    return (

        <MuiLayoutBox className="profile-stats" component="div">

            {stats.map((item, index) => (

                <MuiLayoutBox className="stat-card" key={index} component="div">

                    <MuiLayoutBox
                        className="stat-icon"
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
