import axios from "axios";

const API_URL = "http://localhost:5028/api/Policy";

const PolicyService = {
    // ============================================================
    // GET ALL POLICIES
    // ============================================================

    getPolicies: async (params = {}) => {
        const response = await axios.get(API_URL, {
            params,
        });

        return response.data;
    },

    // ============================================================
    // GET POLICY BY ID
    // ============================================================

    getPolicyById: async (id) => {
        const response = await axios.get(
            `${API_URL}/${id}`
        );

        return response.data;
    },

    // ============================================================
    // CREATE POLICY
    // ============================================================

    createPolicy: async (policyData) => {
        const formData = new FormData();

        formData.append(
            "PolicyTitle",
            policyData.PolicyTitle
        );

        if (policyData.PolicyCode) {
            formData.append(
                "PolicyCode",
                policyData.PolicyCode
            );
        }

        formData.append(
            "Category",
            policyData.Category
        );

        formData.append(
            "Version",
            policyData.Version
        );

        formData.append(
            "EffectiveDate",
            policyData.EffectiveDate
        );

        if (policyData.Description) {
            formData.append(
                "Description",
                policyData.Description
            );
        }

        formData.append(
            "AcknowledgementRequired",
            String(
                policyData.AcknowledgementRequired
            )
        );

        if (policyData.File) {
            formData.append(
                "File",
                policyData.File
            );
        }

        const response = await axios.post(
            API_URL,
            formData,
            {
                headers: {
                    "Content-Type":
                        "multipart/form-data",
                },
            }
        );

        return response.data;
    },

    // ============================================================
    // UPDATE POLICY
    // ============================================================

    updatePolicy: async (id, policyData) => {
        const formData = new FormData();

        formData.append(
            "PolicyTitle",
            policyData.PolicyTitle
        );

        formData.append(
            "Category",
            policyData.Category
        );

        formData.append(
            "Version",
            policyData.Version
        );

        formData.append(
            "EffectiveDate",
            policyData.EffectiveDate
        );

        if (policyData.Description) {
            formData.append(
                "Description",
                policyData.Description
            );
        }

        formData.append(
            "AcknowledgementRequired",
            String(
                policyData.AcknowledgementRequired
            )
        );

        if (policyData.File) {
            formData.append(
                "File",
                policyData.File
            );
        }

        const response = await axios.put(
            `${API_URL}/${id}`,
            formData,
            {
                headers: {
                    "Content-Type":
                        "multipart/form-data",
                },
            }
        );

        return response.data;
    },

    // ============================================================
    // PUBLISH POLICY
    // ============================================================

    publishPolicy: async (id) => {
        const response = await axios.post(
            `${API_URL}/${id}/publish`
        );

        return response.data;
    },

    // ============================================================
    // ARCHIVE POLICY
    // ============================================================

    archivePolicy: async (id) => {
        const response = await axios.post(
            `${API_URL}/${id}/archive`
        );

        return response.data;
    },

    // ============================================================
    // DELETE POLICY
    // ============================================================

    deletePolicy: async (id) => {
        const response = await axios.delete(
            `${API_URL}/${id}`
        );

        return response.data;
    },

    // ============================================================
    // GET PDF AS BLOB
    //
    // Used by the PDF viewer.
    // This prevents the browser from directly navigating to
    // the API PDF endpoint.
    // ============================================================

    getFileBlob: async (id) => {
        const response = await axios.get(
            `${API_URL}/${id}/file`,
            {
                responseType: "blob",
            }
        );

        return response.data;
    },

    // ============================================================
    // GET PDF URL
    // ============================================================

    getFileUrl: (id) => {
        return `${API_URL}/${id}/file`;
    },

    // ============================================================
    // GET DOWNLOAD URL
    // ============================================================

    getDownloadUrl: (id) => {
        return `${API_URL}/${id}/download`;
    },

    // ============================================================
    // ACKNOWLEDGE POLICY
    //
    // POST:
    // /api/Policy/{id}/acknowledge
    //
    // The backend determines the logged-in employee.
    // ============================================================

    acknowledgePolicy: async (id) => {
        const response = await axios.post(
            `${API_URL}/${id}/acknowledge`
        );

        return response.data;
    },

    // ============================================================
    // CHECK POLICY ACKNOWLEDGEMENT
    //
    // GET:
    // /api/Policy/{id}/acknowledgement
    //
    // Expected response:
    //
    // {
    //     success: true,
    //     acknowledged: true
    // }
    // ============================================================

    getAcknowledgement: async (id) => {
        const response = await axios.get(
            `${API_URL}/${id}/acknowledgement`
        );

        return response.data;
    },
};

export default PolicyService;