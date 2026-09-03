// =====================================================
// ShiftService.js
// =====================================================

const SHIFT_API_BASE_URL = "https://localhost:7292";


// =====================================================
// GET ALL SHIFTS
// =====================================================

export async function getShifts() {

    const response = await fetch(
        `${SHIFT_API_BASE_URL}/api/Shift`
    );

    if (!response.ok) {
        throw new Error(
            `Failed to load shifts. Status: ${response.status}`
        );
    }

    return await response.json();
}


// =====================================================
// GET SHIFT FOR EMPLOYEE
// =====================================================

export async function getEmployeeShift(employeeId) {

    if (!employeeId) {
        return null;
    }

    const shifts = await getShifts();

    if (!Array.isArray(shifts)) {
        return null;
    }

    return (
        shifts.find(
            shift =>
                Number(shift.employeeId) === Number(employeeId)
        ) || null
    );
}


// =====================================================
// DEFAULT SERVICE
// =====================================================

const ShiftService = {

    getShifts,
    getEmployeeShift

};

export default ShiftService;