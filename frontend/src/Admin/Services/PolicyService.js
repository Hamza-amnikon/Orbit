import axios from "axios";

// ============================================================
// POLICY API
// ============================================================

const API_URL =
    "https://sparkapi.amnikontechnologies.com:7112/api/Policy";


// ============================================================
// ISOLATED POLICY AXIOS INSTANCE
// ============================================================
//
// IMPORTANT:
//
// Do NOT use the application's global axios instance.
//
// Your main application has a global 401 interceptor which can
// logout the user.
//
// PolicyService remains independent from that interceptor.
//
// ============================================================

const policyAxios = axios.create({
    baseURL: API_URL,
    timeout: 30000,
    withCredentials: true,
});


// ============================================================
// POLICY SERVICE
// ============================================================

const PolicyService = {

    // ========================================================
    // GET ALL POLICIES
    // ========================================================

    getPolicies: async (params = {}) => {
        try {
            const response =
                await policyAxios.get(
                    "",
                    {
                        params,
                    }
                );

            return response.data;
        } catch (error) {
            console.error(
                "Get Policies Error:",
                error
            );

            throw error;
        }
    },


    // ========================================================
    // GET POLICY BY ID
    // ========================================================

    getPolicyById: async (id) => {
        try {
            const response =
                await policyAxios.get(
                    `/${id}`
                );

            return response.data;
        } catch (error) {
            console.error(
                "Get Policy Error:",
                error
            );

            throw error;
        }
    },


    // ========================================================
    // CREATE POLICY
    // ========================================================

    createPolicy: async (policyData) => {

        const formData =
            new FormData();


        // POLICY TITLE
        formData.append(
            "PolicyTitle",
            policyData.PolicyTitle || ""
        );


        // POLICY CODE
        if (policyData.PolicyCode) {
            formData.append(
                "PolicyCode",
                policyData.PolicyCode
            );
        }


        // CATEGORY
        formData.append(
            "Category",
            policyData.Category || ""
        );


        // VERSION
        formData.append(
            "Version",
            policyData.Version || "1.0"
        );


        // EFFECTIVE DATE
        formData.append(
            "EffectiveDate",
            policyData.EffectiveDate || ""
        );


        // DESCRIPTION
        if (policyData.Description) {
            formData.append(
                "Description",
                policyData.Description
            );
        }


        // ACKNOWLEDGEMENT REQUIRED
        formData.append(
            "AcknowledgementRequired",
            String(
                Boolean(
                    policyData.AcknowledgementRequired
                )
            )
        );


        // PDF
        if (policyData.File) {
            formData.append(
                "File",
                policyData.File
            );
        }


        try {
            const response =
                await policyAxios.post(
                    "",
                    formData
                );

            return response.data;
        } catch (error) {
            console.error(
                "Create Policy Error:",
                error
            );

            throw error;
        }
    },


    // ========================================================
    // UPDATE POLICY
    // ========================================================

    updatePolicy: async (
        id,
        policyData
    ) => {

        const formData =
            new FormData();


        // POLICY TITLE
        formData.append(
            "PolicyTitle",
            policyData.PolicyTitle || ""
        );


        // POLICY CODE
        if (policyData.PolicyCode) {
            formData.append(
                "PolicyCode",
                policyData.PolicyCode
            );
        }


        // CATEGORY
        formData.append(
            "Category",
            policyData.Category || ""
        );


        // VERSION
        formData.append(
            "Version",
            policyData.Version || "1.0"
        );


        // EFFECTIVE DATE
        formData.append(
            "EffectiveDate",
            policyData.EffectiveDate || ""
        );


        // DESCRIPTION
        if (policyData.Description) {
            formData.append(
                "Description",
                policyData.Description
            );
        }


        // ACKNOWLEDGEMENT REQUIRED
        formData.append(
            "AcknowledgementRequired",
            String(
                Boolean(
                    policyData.AcknowledgementRequired
                )
            )
        );


        // NEW PDF
        if (policyData.File) {
            formData.append(
                "File",
                policyData.File
            );
        }


        try {
            const response =
                await policyAxios.put(
                    `/${id}`,
                    formData
                );

            return response.data;
        } catch (error) {
            console.error(
                "Update Policy Error:",
                error
            );

            throw error;
        }
    },


    // ========================================================
    // PUBLISH POLICY
    // ========================================================

    publishPolicy: async (id) => {
        try {
            const response =
                await policyAxios.post(
                    `/${id}/publish`
                );

            return response.data;
        } catch (error) {
            console.error(
                "Publish Policy Error:",
                error
            );

            throw error;
        }
    },


    // ========================================================
    // ARCHIVE POLICY
    // ========================================================

    archivePolicy: async (id) => {
        try {
            const response =
                await policyAxios.post(
                    `/${id}/archive`
                );

            return response.data;
        } catch (error) {
            console.error(
                "Archive Policy Error:",
                error
            );

            throw error;
        }
    },


    // ========================================================
    // DELETE POLICY
    // ========================================================

    deletePolicy: async (id) => {
        try {
            const response =
                await policyAxios.delete(
                    `/${id}`
                );

            return response.data;
        } catch (error) {
            console.error(
                "Delete Policy Error:",
                error
            );

            throw error;
        }
    },


    // ========================================================
    // GET PDF AS BLOB
    // ========================================================
    //
    // Uses FETCH instead of Axios.
    //
    // This bypasses the application's global Axios
    // interceptor.
    //
    // ========================================================

    getFileBlob: async (id) => {

        const url =
            `${API_URL}/${id}/file`;

        try {
            const response =
                await fetch(
                    url,
                    {
                        method: "GET",

                        credentials:
                            "include",

                        headers: {
                            Accept:
                                "application/pdf",
                        },
                    }
                );


            // HANDLE ERROR

            if (!response.ok) {

                let message =
                    `Unable to load PDF (${response.status}).`;

                try {
                    const contentType =
                        response.headers.get(
                            "content-type"
                        ) || "";

                    if (
                        contentType.includes(
                            "application/json"
                        )
                    ) {
                        const errorData =
                            await response.json();

                        message =
                            errorData?.message ||
                            errorData?.error ||
                            message;
                    }
                } catch {
                    // Keep default message.
                }


                const error =
                    new Error(message);

                error.status =
                    response.status;

                error.response = {
                    status:
                        response.status,
                };

                throw error;
            }


            // READ PDF

            const blob =
                await response.blob();


            if (
                !blob ||
                blob.size === 0
            ) {
                throw new Error(
                    "The policy PDF is empty."
                );
            }


            return blob;

        } catch (error) {

            console.error(
                "Policy PDF Request Error:",
                error
            );

            throw error;
        }
    },


    // ========================================================
    // GET PDF URL
    // ========================================================

    getFileUrl: (id) => {
        return `${API_URL}/${id}/file`;
    },


    // ========================================================
    // DOWNLOAD URL
    // ========================================================

    getDownloadUrl: (id) => {
        return `${API_URL}/${id}/download`;
    },


    // ========================================================
    // ACKNOWLEDGE POLICY
    // ========================================================
    //
    // POST remains authenticated.
    //
    // The backend needs to know which employee is
    // acknowledging the policy.
    //
    // React does NOT send EmployeeId.
    //
    // The backend gets EmployeeId from the JWT.
    //
    // ========================================================

    acknowledgePolicy: async (id) => {

        const url =
            `${API_URL}/${id}/acknowledge`;

        try {

            const response =
                await fetch(
                    url,
                    {
                        method: "POST",

                        credentials:
                            "include",

                        headers: {
                            Accept:
                                "application/json",
                        },
                    }
                );


            // HANDLE ERROR

            if (!response.ok) {

                let message =
                    `Unable to acknowledge policy (${response.status}).`;

                let errorData =
                    null;


                try {

                    const contentType =
                        response.headers.get(
                            "content-type"
                        ) || "";


                    if (
                        contentType.includes(
                            "application/json"
                        )
                    ) {
                        errorData =
                            await response.json();

                        message =
                            errorData?.message ||
                            errorData?.error ||
                            message;
                    }

                } catch {
                    // Keep default message.
                }


                const error =
                    new Error(message);

                error.status =
                    response.status;

                error.response = {
                    status:
                        response.status,

                    data:
                        errorData,
                };

                throw error;
            }


            // RESPONSE

            const data =
                await response.json();

            return data;

        } catch (error) {

            console.error(
                "Policy Acknowledgement Error:",
                error
            );

            // IMPORTANT:
            // Do NOT logout here.
            //
            // Return the error to CompanyPolicy.jsx.

            throw error;
        }
    },


    // ========================================================
    // CHECK ACKNOWLEDGEMENT
    // ========================================================
    //
    // IMPORTANT:
    //
    // The backend GET endpoint is now anonymous.
    //
    // It checks PolicyAcknowledgements directly.
    //
    // Example:
    //
    // GET /api/Policy/5/acknowledgement
    //
    // Database:
    //
    // PolicyId = 5
    //
    // Record exists:
    //     acknowledged = true
    //
    // Record doesn't exist:
    //     acknowledged = false
    //
    // No JWT is required.
    //
    // ========================================================

    getAcknowledgement: async (id) => {

        const url =
            `${API_URL}/${id}/acknowledgement`;

        try {

            const response =
                await fetch(
                    url,
                    {
                        method: "GET",

                        // Keep credentials enabled.
                        // It does not hurt the anonymous
                        // endpoint and keeps this compatible
                        // with the application environment.
                        credentials:
                            "include",

                        headers: {
                            Accept:
                                "application/json",
                        },
                    }
                );


            // HANDLE ERROR

            if (!response.ok) {

                let message =
                    `Unable to check policy acknowledgement (${response.status}).`;

                let errorData =
                    null;


                try {

                    const contentType =
                        response.headers.get(
                            "content-type"
                        ) || "";


                    if (
                        contentType.includes(
                            "application/json"
                        )
                    ) {
                        errorData =
                            await response.json();

                        message =
                            errorData?.message ||
                            errorData?.error ||
                            message;
                    }

                } catch {
                    // Keep default message.
                }


                const error =
                    new Error(message);

                error.status =
                    response.status;

                error.response = {
                    status:
                        response.status,

                    data:
                        errorData,
                };

                throw error;
            }


            // RESPONSE

            const data =
                await response.json();


            // Always return the backend response.
            //
            // Expected:
            //
            // {
            //     success: true,
            //     acknowledged: true
            // }

            return data;

        } catch (error) {

            console.error(
                "Policy Acknowledgement Check Error:",
                error
            );

            throw error;
        }
    },
};


// ============================================================
// EXPORT
// ============================================================

export default PolicyService;