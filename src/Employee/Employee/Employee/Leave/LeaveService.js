import axios from "axios";

// =========================================================
// LEAVE SERVICE API
// =========================================================

const API_URL = "https://localhost:7206/api";

const LeaveService = {

    // =========================================================
    // GET ALL LEAVE REQUESTS
    // =========================================================
    getLeaves: async () => {
        try {
            const response = await axios.get(
                `${API_URL}/Leave`
            );

            return Array.isArray(response.data)
                ? response.data
                : [];

        } catch (error) {

            if (error?.response?.status === 404) {
                console.warn(
                    "No leave requests found."
                );

                return [];
            }

            console.error(
                "Failed to get leave requests:",
                error
            );

            throw error;
        }
    },


    // =========================================================
    // GET ALL EMPLOYEE LEAVE BALANCES
    // =========================================================
    getLeaveBalances: async () => {
        try {
            const response = await axios.get(
                `${API_URL}/EmployeeLeaveBalance`
            );

            console.log(
                "Employee Leave Balance API Response:",
                response.data
            );

            return Array.isArray(response.data)
                ? response.data
                : [];

        } catch (error) {

            if (error?.response?.status === 404) {
                console.warn(
                    "No employee leave balances found."
                );

                return [];
            }

            console.error(
                "Failed to get leave balances:",
                error
            );

            throw error;
        }
    },


    // =========================================================
    // GET LEAVE BALANCES FOR SPECIFIC EMPLOYEE
    // =========================================================
    getEmployeeLeaveBalances: async (employeeId) => {

        try {

            const response = await axios.get(
                `${API_URL}/EmployeeLeaveBalance`
            );

            const balances = Array.isArray(response.data)
                ? response.data
                : [];

            const employeeBalances =
                balances.filter(
                    (balance) =>
                        Number(balance.employeeId) ===
                        Number(employeeId)
                );

            console.log(
                "Employee Leave Balances:",
                employeeBalances
            );

            return employeeBalances;

        } catch (error) {

            if (error?.response?.status === 404) {
                return [];
            }

            console.error(
                "Failed to get employee leave balances:",
                error
            );

            throw error;
        }
    },


    // =========================================================
    // GET ACTIVE LEAVE TYPES
    // =========================================================
    getLeaveTypes: async () => {

        try {

            const response = await axios.get(
                `${API_URL}/LeaveType/active`
            );

            return Array.isArray(response.data)
                ? response.data
                : [];

        } catch (error) {

            if (error?.response?.status === 404) {

                console.warn(
                    "No active leave types found."
                );

                return [];
            }

            console.error(
                "Failed to get leave types:",
                error
            );

            throw error;
        }
    },


    // =========================================================
    // GET ALL LEAVE TYPES
    // =========================================================
    getAllLeaveTypes: async () => {

        try {

            const response = await axios.get(
                `${API_URL}/LeaveType`
            );

            return Array.isArray(response.data)
                ? response.data
                : [];

        } catch (error) {

            if (error?.response?.status === 404) {
                return [];
            }

            console.error(
                "Failed to get all leave types:",
                error
            );

            throw error;
        }
    },


    // =========================================================
    // GET ALL LEAVE POLICIES
    // =========================================================
    getLeavePolicies: async () => {

        try {

            const response = await axios.get(
                `${API_URL}/LeavePolicy`
            );

            return Array.isArray(response.data)
                ? response.data
                : [];

        } catch (error) {

            if (error?.response?.status === 404) {

                console.warn(
                    "No leave policies found."
                );

                return [];
            }

            console.error(
                "Failed to get leave policies:",
                error
            );

            throw error;
        }
    },


    // =========================================================
    // GET LEAVE POLICY BY ID
    // =========================================================
    getLeavePolicyById: async (policyId) => {

        try {

            const response = await axios.get(
                `${API_URL}/LeavePolicy/${policyId}`
            );

            return response.data;

        } catch (error) {

            if (error?.response?.status === 404) {

                console.warn(
                    `Leave policy ${policyId} not found.`
                );

                return null;
            }

            console.error(
                "Failed to get leave policy:",
                error
            );

            throw error;
        }
    },


    // =========================================================
    // APPLY FOR LEAVE
    // =========================================================
    applyLeave: async (leaveData) => {

        try {

            const response = await axios.post(
                `${API_URL}/Leave`,
                leaveData
            );

            return response.data;

        } catch (error) {

            console.error(
                "Failed to apply for leave:",
                error
            );

            throw error;
        }
    },


    // =========================================================
    // UPDATE LEAVE REQUEST
    // =========================================================
    updateLeave: async (
        leaveId,
        leaveData
    ) => {

        try {

            const response = await axios.put(
                `${API_URL}/Leave/${leaveId}`,
                leaveData
            );

            return response.data;

        } catch (error) {

            console.error(
                "Failed to update leave request:",
                error
            );

            throw error;
        }
    },


    // =========================================================
    // CANCEL / UPDATE LEAVE STATUS
    // =========================================================
    cancelLeave: async (
        leaveId,
        data
    ) => {

        try {

            const response = await axios.put(
                `${API_URL}/Leave/${leaveId}/status`,
                data
            );

            return response.data;

        } catch (error) {

            console.error(
                "Failed to cancel leave:",
                error
            );

            throw error;
        }
    }
};

export default LeaveService;