import { attendanceDateKey } from "./attendanceDate.js";

const fullAttendance = new Set(["present", "present day", "on time", "early", "late", "wfh", "work from home"]);
const halfAttendance = new Set(["half day", "halfday"]);
const absence = new Set(["absent", "absent day", "absentday"]);
const weeklyOff = new Set(["off", "week off", "weekly off", "weekend"]);

export function getAttendanceSummaryStatus(record) {
    const label = record?.status ?? record?.Status ?? record?.attendanceStatus ?? record?.AttendanceStatus ?? "";
    const status = String(label).trim().toLowerCase().replace(/[_-]/g, " ").replace(/\s+/g, " ");

    if (weeklyOff.has(status)) return { status, category: "weekend", credit: null };
    if (status.includes("holiday")) return { status, category: "holiday", credit: null };
    if (status.includes("leave") || record?.isLeave === true || record?.IsLeave === true) {
        return { status, category: "leave", credit: null };
    }
    if (absence.has(status) || record?.isAbsent === true || record?.IsAbsent === true) {
        return { status, category: "absent", credit: 0 };
    }
    if (halfAttendance.has(status)) return { status, category: "halfDay", credit: 0.5 };
    if (fullAttendance.has(status)) return { status, category: "present", credit: 1 };
    return { status, category: "unmarked", credit: null };
}

export function attendanceByDate(records) {
    const result = new Map();
    for (const record of Array.isArray(records) ? records : []) {
        const key = attendanceDateKey(record?.attendanceDate ?? record?.date ?? record?.AttendanceDate ?? record?.Date);
        if (key) result.set(key, record);
    }
    return result;
}

export function getMonthlyAttendancePercentage(records, todayKey, shifts = [], joiningDate) {
    const monthKey = todayKey.slice(0, 7);
    const monthStart = `${monthKey}-01`;
    const [year, month] = monthKey.split("-").map(Number);
    const endDate = new Date(Date.UTC(year, month, 0));
    const monthEnd = endDate.toISOString().slice(0, 10);
    const joined = attendanceDateKey(joiningDate);
    const firstDay = joined > monthStart ? joined : monthStart;
    const byDate = attendanceByDate(records);
    const assignments = shifts.map(shift => ({
        from: attendanceDateKey(shift.fromDate ?? shift.FromDate),
        to: attendanceDateKey(shift.toDate ?? shift.ToDate),
        status: String(shift.status ?? shift.Status ?? "active").trim().toLowerCase(),
        daysOff: [shift.weeklyOff1 ?? shift.WeeklyOff1, shift.weeklyOff2 ?? shift.WeeklyOff2]
            .map(day => String(day ?? "").trim().toLowerCase().slice(0, 3)),
    })).filter(shift => shift.status === "active" && shift.from && shift.to &&
        shift.from <= monthEnd && shift.to >= firstDay)
        .sort((a, b) => b.from.localeCompare(a.from));
    if (!assignments.length && ![...byDate.keys()].some(key => key >= firstDay && key <= monthEnd)) return null;

    const weekdays = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    let countedDays = 0;
    let creditedDays = 0;
    for (const date = new Date(`${firstDay}T00:00:00Z`); date <= endDate; date.setUTCDate(date.getUTCDate() + 1)) {
        const key = date.toISOString().slice(0, 10);
        const { category, credit } = getAttendanceSummaryStatus(byDate.get(key));
        const shift = assignments.find(assignment => assignment.from <= key && key <= assignment.to);
        const isWeeklyOff = category === "weekend" || shift?.daysOff.includes(weekdays[date.getUTCDay()]);
        if (!isWeeklyOff && (category === "holiday" || category === "leave")) continue;
        countedDays++;
        creditedDays += isWeeklyOff ? 1 : (key <= todayKey ? (credit ?? 0) : 0);
    }

    return countedDays ? Math.round((creditedDays / countedDays) * 100) : null;
}
