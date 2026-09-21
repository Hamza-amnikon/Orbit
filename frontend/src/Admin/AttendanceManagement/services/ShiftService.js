import axios from "axios";

const API_URL = "https://localhost:7292/api/Shift";

// =====================================================
// GET ALL SHIFT ASSIGNMENTS
// =====================================================
const getAll = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

// =====================================================
// GET SHIFT ASSIGNMENT BY ID
// =====================================================
const getById = async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
};

// =====================================================
// CREATE SHIFT ASSIGNMENT
// =====================================================
const create = async (payload) => {
    const response = await axios.post(
        API_URL,
        payload
    );

    return response.data;
};

// =====================================================
// UPDATE SHIFT ASSIGNMENT
// =====================================================
const update = async (id, payload) => {
    const response = await axios.put(
        `${API_URL}/${id}`,
        payload
    );

    return response.data;
};

// =====================================================
// DELETE SHIFT ASSIGNMENT
// =====================================================
const remove = async (id) => {
    const response = await axios.delete(
        `${API_URL}/${id}`
    );

    return response.data;
};

// =====================================================
// GET ALL SHIFTS FOR ONE EMPLOYEE
// =====================================================
const getEmployeeShifts = async (employeeId) => {
    if (!employeeId) {
        return [];
    }

    const shifts = await getAll();

    if (!Array.isArray(shifts)) {
        return [];
    }

    return shifts.filter((shift) => {
        const shiftEmployeeId =
            shift?.employeeId ??
            shift?.EmployeeId ??
            shift?.employeeID ??
            shift?.EmployeeID;

        return (
            Number(shiftEmployeeId) ===
            Number(employeeId)
        );
    });
};

// =====================================================
// SERVICE
// =====================================================
const ShiftService = {
    getAll,
    getById,
    create,
    update,
    remove,
    getEmployeeShifts,
};

export default ShiftService;