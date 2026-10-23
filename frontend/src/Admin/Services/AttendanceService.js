// AttendanceService.js

const API_BASE_URL = `${import.meta.env.VITE_ATTENDANCE_API_BASE_URL}`;

const authHeaders = (headers = {}) => {
    const token = localStorage.getItem("token");
    return {
        Accept: "application/json",
        ...headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};


// =====================================================
// GET EMPLOYEE ATTENDANCE
// =====================================================

export async function getEmployeeAttendance(employeeId) {

    if (!employeeId) {
        return [];
    }

    const response = await fetch(
        `${API_BASE_URL}/api/Attendance/employee/${employeeId}`,
        { headers: authHeaders() }
    );

    // Treat a missing employee attendance collection as empty so the page can
    // render its empty state; other HTTP failures remain visible.
    if (response.status === 404) {
        return [];
    }

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
        `${API_BASE_URL}/api/Attendance/today`,
        { headers: authHeaders() }
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
            method: "POST",
            headers: authHeaders(),
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
            method: "POST",
            headers: authHeaders(),
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
        { headers: authHeaders() }
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
            headers: authHeaders({ "Content-Type": "application/json" }),
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
