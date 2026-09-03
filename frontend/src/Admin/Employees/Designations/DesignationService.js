import axios from "axios";

// =========================================================
// API
// =========================================================

const API_URL = "http://localhost:7241/api/Designation";

// =========================================================
// AUTH CONFIG
// =========================================================

const getAuthConfig = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    console.error("DesignationService: Authentication token is missing.");

    throw new Error("Authentication token is missing. Please sign in again.");
  }

  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};

// =========================================================
// ERROR HANDLER
// =========================================================

const handleApiError = (error, operation) => {
  console.error(`DesignationService ${operation} Error:`, error);

  if (error?.response) {
    console.error("Status:", error.response.status);

    console.error("Response:", error.response.data);
  }

  throw error;
};

// =========================================================
// GET ALL DESIGNATIONS
// =========================================================

export const getDesignations = async () => {
  try {
    console.log("DesignationService: Loading designations...");

    const config = getAuthConfig();

    const response = await axios.get(API_URL, config);

    console.log("DesignationService: Designations loaded.", response.data);

    return response.data;
  } catch (error) {
    handleApiError(error, "GET Designations");
  }
};

// =========================================================
// GET DESIGNATION BY ID
// =========================================================

export const getDesignationById = async (id) => {
  try {
    if (!id) {
      throw new Error("Designation ID is required.");
    }

    console.log("DesignationService: Loading designation:", id);

    const config = getAuthConfig();

    const response = await axios.get(`${API_URL}/${id}`, config);

    console.log("DesignationService: Designation loaded.", response.data);

    return response.data;
  } catch (error) {
    handleApiError(error, "GET Designation By ID");
  }
};

// =========================================================
// CREATE DESIGNATION
// =========================================================

export const createDesignation = async (data) => {
  try {
    const config = getAuthConfig();

    console.log("==========================================");

    console.log("DesignationService: CREATE");

    console.log("API:", API_URL);

    console.log("Payload:", data);

    console.log("JWT Present:", !!localStorage.getItem("token"));

    console.log("==========================================");

    /*
     * IMPORTANT
     *
     * We intentionally do NOT add:
     *
     * createdBy
     * createdByEmployeeId
     * createdByEmployeeCode
     * createdByEmployeeName
     *
     * The authenticated JWT is sent in the
     * Authorization header.
     *
     * Backend should determine CreatedBy
     * from the EmployeeId claim.
     */

    const response = await axios.post(API_URL, data, config);

    console.log("DesignationService: Designation created.", response.data);

    return response.data;
  } catch (error) {
    handleApiError(error, "CREATE Designation");
  }
};

// =========================================================
// UPDATE DESIGNATION
// =========================================================

export const updateDesignation = async (id, data) => {
  try {
    if (!id) {
      throw new Error("Designation ID is required.");
    }

    const config = getAuthConfig();

    console.log("==========================================");

    console.log("DesignationService: UPDATE");

    console.log("DesignationId:", id);

    console.log("API:", `${API_URL}/${id}`);

    console.log("Payload:", data);

    console.log("JWT Present:", !!localStorage.getItem("token"));

    console.log("==========================================");

    /*
     * IMPORTANT
     *
     * Do NOT trust updatedBy from the frontend.
     *
     * The JWT identifies the employee performing
     * the update.
     *
     * Backend should set:
     *
     * UpdatedBy = EmployeeId from JWT
     */

    const response = await axios.put(`${API_URL}/${id}`, data, config);

    console.log("DesignationService: Designation updated.", response.data);

    return response.data;
  } catch (error) {
    handleApiError(error, "UPDATE Designation");
  }
};

// =========================================================
// DELETE DESIGNATION
// =========================================================

export const deleteDesignation = async (id) => {
  try {
    if (!id) {
      throw new Error("Designation ID is required.");
    }

    const config = getAuthConfig();

    console.log("==========================================");

    console.log("DesignationService: DELETE");

    console.log("DesignationId:", id);

    console.log("API:", `${API_URL}/${id}`);

    console.log("JWT Present:", !!localStorage.getItem("token"));

    console.log("==========================================");

    /*
     * Backend should determine DeletedBy
     * from the authenticated JWT.
     */

    const response = await axios.delete(`${API_URL}/${id}`, config);

    console.log("DesignationService: Designation deleted.", response.data);

    return response.data;
  } catch (error) {
    handleApiError(error, "DELETE Designation");
  }
};
