// AttendanceService.js

const API_BASE_URL = "https://localhost:7136";


// =====================================================
// GET EMPLOYEE ATTENDANCE
// =====================================================

export async function getEmployeeAttendance(employeeId) {

    if (!employeeId) {
        return [];
    }

    const response = await fetch(
        `${API_BASE_URL}/api/Attendance/employee/${employeeId}`
    );

    if (!response.ok) {
        throw new Error(
            `Failed to load employee attendance. Status: ${response.status}`
        );
    }

    return await response.json();
}


// =====================================================
// GET TODAY'S ATTENDANCE
// =====================================================

export async function getTodayAttendance() {

    const response = await fetch(
        `${API_BASE_URL}/api/Attendance/today`
    );

    if (!response.ok) {
        throw new Error(
            `Failed to load today's attendance. Status: ${response.status}`
        );
    }

    return await response.json();
}


// =====================================================
// CHECK IN
// =====================================================

export async function checkIn(attendanceId) {

    const response = await fetch(
        `${API_BASE_URL}/api/Attendance/${attendanceId}/checkin`,
        {
            method: "POST"
        }
    );

    if (!response.ok) {
        throw new Error(
            `Check-in failed. Status: ${response.status}`
        );
    }

    return await response.json();
}


// =====================================================
// CHECK OUT
// =====================================================

export async function checkOut(attendanceId) {

    const response = await fetch(
        `${API_BASE_URL}/api/Attendance/${attendanceId}/checkout`,
        {
            method: "POST"
        }
    );

    if (!response.ok) {
        throw new Error(
            `Check-out failed. Status: ${response.status}`
        );
    }

    return await response.json();
}


// =====================================================
// DEFAULT SERVICE
// =====================================================

const AttendanceService = {

    getEmployeeAttendance,

    getTodayAttendance,

    checkIn,

    checkOut

};

export default AttendanceService;