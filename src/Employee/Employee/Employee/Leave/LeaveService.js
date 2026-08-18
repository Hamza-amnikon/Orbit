import axios from "axios";

const API_URL = "https://localhost:7206/api";

const LeaveService = {
    // Get all leave requests
    getLeaves: async () => {
        const response = await axios.get(`${API_URL}/Leave`);
        return response.data;
    },

    // Get all employee leave balances
    getLeaveBalances: async () => {
        const response = await axios.get(
            `${API_URL}/EmployeeLeaveBalance`
        );

        return response.data;
    },

    // Get active leave types
    getLeaveTypes: async () => {
        const response = await axios.get(
            `${API_URL}/LeaveType/active`
        );

        return response.data;
    },

    // Apply for leave
    applyLeave: async (leaveData) => {
        const response = await axios.post(
            `${API_URL}/Leave`,
            leaveData
        );

        return response.data;
    },

    // Update leave request
    updateLeave: async (leaveId, leaveData) => {
        const response = await axios.put(
            `${API_URL}/Leave/${leaveId}`,
            leaveData
        );

        return response.data;
    },

    // Cancel leave
    cancelLeave: async (leaveId, data) => {
        const response = await axios.put(
            `${API_URL}/Leave/${leaveId}/status`,
            data
        );

        return response.data;
    }
};

export default LeaveService;