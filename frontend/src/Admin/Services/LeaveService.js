import axios from "axios";

// =========================================================
// LEAVE SERVICE API
// =========================================================

const API_URL = "https://localhost:7206/api";

// =========================================================
// APPROVAL SERVICE API
// =========================================================

const APPROVAL_API_URL = "https://localhost:7128/api";

const LeaveService = {
  // =========================================================
  // GET ALL LEAVE REQUESTS
  // =========================================================

  getLeaves: async () => {
    try {
      const response = await axios.get(`${API_URL}/Leave`);

      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      if (error?.response?.status === 404) {
        console.warn("No leave requests found.");

        return [];
      }

      console.error("Failed to get leave requests:", error);

      throw error;
    }
  },

  // =========================================================
  // GET APPROVAL DETAILS BY LEAVE REQUEST ID
  //
  // Example:
  // Leave ID = 8
  //
  // GET:
  // https://localhost:7128/api/Approval/request/8
  //
  // Returns:
  // {
  //   approvalRequestId: 3,
  //   requestType: "Leave",
  //   requestId: 8,
  //   employeeId: 37,
  //   currentApproverId: 31,
  //   approvalLevel: 3,
  //   status: "Pending",
  //   requestedDate: "...",
  //   actionDate: null
  // }
  // =========================================================

  getApprovalByRequestId: async (requestId) => {
    try {
      if (!requestId) {
        console.warn("Approval request ID is missing.");

        return null;
      }

      const response = await axios.get(
        `${APPROVAL_API_URL}/Approval/request/${requestId}`,
      );

      console.log("Approval Details:", response.data);

      return response.data || null;
    } catch (error) {
      // -------------------------------------------------
      // Approval record does not exist
      // -------------------------------------------------

      if (error?.response?.status === 404) {
        console.warn(`No approval request found for Leave ID ${requestId}.`);

        return null;
      }

      console.error(
        `Failed to get approval details for Leave ID ${requestId}:`,
        error,
      );

      throw error;
    }
  },

  // =========================================================
  // GET ALL EMPLOYEE LEAVE BALANCES
  // =========================================================

  getLeaveBalances: async () => {
    try {
      const response = await axios.get(`${API_URL}/EmployeeLeaveBalance`);

      console.log("Employee Leave Balance API Response:", response.data);

      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      if (error?.response?.status === 404) {
        console.warn("No employee leave balances found.");

        return [];
      }

      console.error("Failed to get leave balances:", error);

      throw error;
    }
  },

  // =========================================================
  // GET LEAVE BALANCES FOR SPECIFIC EMPLOYEE
  // =========================================================

  getEmployeeLeaveBalances: async (employeeId) => {
    try {
      const response = await axios.get(`${API_URL}/EmployeeLeaveBalance`);

      const balances = Array.isArray(response.data) ? response.data : [];

      const employeeBalances = balances.filter(
        (balance) => Number(balance.employeeId) === Number(employeeId),
      );

      console.log("Employee Leave Balances:", employeeBalances);

      return employeeBalances;
    } catch (error) {
      if (error?.response?.status === 404) {
        return [];
      }

      console.error("Failed to get employee leave balances:", error);

      throw error;
    }
  },

  // =========================================================
  // GET ACTIVE LEAVE TYPES
  // =========================================================

  getLeaveTypes: async () => {
    try {
      const response = await axios.get(`${API_URL}/LeaveType/active`);

      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      if (error?.response?.status === 404) {
        console.warn("No active leave types found.");

        return [];
      }

      console.error("Failed to get leave types:", error);

      throw error;
    }
  },

  // =========================================================
  // GET ALL LEAVE TYPES
  // =========================================================

  getAllLeaveTypes: async () => {
    try {
      const response = await axios.get(`${API_URL}/LeaveType`);

      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      if (error?.response?.status === 404) {
        return [];
      }

      console.error("Failed to get all leave types:", error);

      throw error;
    }
  },

  // =========================================================
  // GET ALL LEAVE POLICIES
  // =========================================================

  getLeavePolicies: async () => {
    try {
      const response = await axios.get(`${API_URL}/LeavePolicy`);

      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      if (error?.response?.status === 404) {
        console.warn("No leave policies found.");

        return [];
      }

      console.error("Failed to get leave policies:", error);

      throw error;
    }
  },

  // =========================================================
  // GET LEAVE POLICY BY ID
  // =========================================================

  getLeavePolicyById: async (policyId) => {
    try {
      const response = await axios.get(`${API_URL}/LeavePolicy/${policyId}`);

      return response.data;
    } catch (error) {
      if (error?.response?.status === 404) {
        console.warn(`Leave policy ${policyId} not found.`);

        return null;
      }

      console.error("Failed to get leave policy:", error);

      throw error;
    }
  },

  // =========================================================
  // GET APPROVAL DETAILS FOR LEAVE REQUEST
  // =========================================================
  getApprovalByRequestId: async (requestId) => {
    try {
      const response = await axios.get(
        `https://localhost:7128/api/Approval/request/${requestId}`,
      );

      console.log("Approval Details:", response.data);

      return response.data;
    } catch (error) {
      if (error?.response?.status === 404) {
        console.warn(`No approval request found for Leave ID ${requestId}`);

        return null;
      }

      console.error("Failed to get approval details:", error);

      throw error;
    }
  },

  // =========================================================
  // APPLY FOR LEAVE
  // =========================================================

  applyLeave: async (leaveData) => {
    try {
      console.log("=================================");
      console.log("APPLY LEAVE REQUEST");
      console.log("=================================");

      console.log("URL:", `${API_URL}/Leave`);

      console.log("DATA:", leaveData);

      console.log("IS FORMDATA:", leaveData instanceof FormData);

      // -------------------------------------------------
      // Debug FormData
      // -------------------------------------------------

      if (leaveData instanceof FormData) {
        for (const [key, value] of leaveData.entries()) {
          console.log(`${key}:`, value);
        }
      }

      const response = await axios.post(`${API_URL}/Leave`, leaveData);

      console.log("=================================");
      console.log("APPLY LEAVE SUCCESS");
      console.log("=================================");

      console.log("STATUS:", response.status);

      console.log("RESPONSE:", response.data);

      return response.data;
    } catch (error) {
      console.log("=================================");
      console.log("APPLY LEAVE FAILED");
      console.log("=================================");

      console.log("ERROR:", error);

      console.log("STATUS:", error?.response?.status);

      console.log("STATUS TEXT:", error?.response?.statusText);

      console.log("RESPONSE DATA:", error?.response?.data);

      console.log("VALIDATION ERRORS:", error?.response?.data?.errors);

      console.log("REQUEST DATA:", error?.config?.data);

      throw error;
    }
  },

  // =========================================================
  // UPDATE LEAVE REQUEST
  // =========================================================

  updateLeave: async (leaveId, leaveData) => {
    try {
      const response = await axios.put(
        `${API_URL}/Leave/${leaveId}`,
        leaveData,
      );

      return response.data;
    } catch (error) {
      console.error("Failed to update leave request:", error);

      throw error;
    }
  },

  // =========================================================
  // CANCEL / UPDATE LEAVE STATUS
  // =========================================================

  cancelLeave: async (leaveId, data) => {
    try {
      const response = await axios.put(
        `${API_URL}/Leave/${leaveId}/status`,
        data,
      );

      return response.data;
    } catch (error) {
      console.error("Failed to cancel leave:", error);

      throw error;
    }
  },
};

export default LeaveService;
