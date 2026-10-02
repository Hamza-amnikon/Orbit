import axios from "axios";

const API_URL = `${import.meta.env.VITE_HIERARCHY_API_BASE_URL}/api/Hierarchy`;

const HierarchyService = {

    // =====================================================
    // Get complete hierarchy
    // =====================================================

    getHierarchy: async () => {
        const response = await axios.get(API_URL);
        return response.data;
    },

    // =====================================================
    // Get hierarchy for one employee
    // =====================================================

    getEmployeeHierarchy: async (employeeId) => {
        const response = await axios.get(
            `${API_URL}/employee/${employeeId}`
        );

        return response.data;
    }
};

export default HierarchyService;