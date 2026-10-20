// AttendanceService.js

const API_BASE_URL = `${import.meta.env.VITE_ATTENDANCE_API_BASE_URL}`;


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

export async function getEmployeeRegularizationRequests(employeeId) {
    if (!employeeId) return [];
    const response = await fetch(
        `${API_BASE_URL}/api/Attendance/employee/${employeeId}/regularization-requests`,
        { headers: { Accept: "application/json" } }
    );
    if (!response.ok) {
        throw new Error(`Failed to load regularization requests. Status: ${response.status}`);
    }
    return response.json();
}

export async function createRegularizationRequest(payload) {
    const response = await fetch(
        `${API_BASE_URL}/api/Attendance/regularization-requests`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify(payload),
        }
    );
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(result?.message || `Could not submit regularization request. Status: ${response.status}`);
    }
    return result;
}


// =====================================================
// DEFAULT SERVICE
// =====================================================

const AttendanceService = {

    getEmployeeAttendance,

    getTodayAttendance,

    checkIn,

    checkOut,
    getEmployeeRegularizationRequests,
    createRegularizationRequest,

};

export default AttendanceService;
