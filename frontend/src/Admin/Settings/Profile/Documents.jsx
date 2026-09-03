import { useEffect, useState } from "react";
import axios from "axios";
import "./Documents.css";

/* ======================================================
   VALIDATION REGEX
====================================================== */

const validationRules = {
    aadhaar: /^\d{12}$/,
    pan: /^[A-Z]{5}[0-9]{4}[A-Z]$/,
    uan: /^\d{12}$/,
    bankName: /^[A-Za-z\s]+$/,
    accountNumber: /^\d{9,18}$/,
    ifsc: /^[A-Z]{4}0[A-Z0-9]{6}$/,
};

const API_URL = "https://localhost:7256/api/Document";

function Documents({ profile }) {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const employeeId =
        profile?.employeeId ??
        profile?.EmployeeId ??
        profile?.id ??
        profile?.Id;

    const employeeAzureId =
        profile?.employeeAzureId ??
        profile?.EmployeeAzureId ??
        profile?.azureId ??
        profile?.AzureId ??
        profile?.oid ??
        profile?.sub;

    const [form, setForm] = useState({
        aadhaarNumber: "",
        aadhaarFile: null,

        panNumber: "",
        panFile: null,

        uanNumber: "",
        uanFile: null,

        bankName: "",
        accountNumber: "",
        ifscCode: "",
        accountType: "Savings",
        bankFile: null,

        passportFile: null,
        drivingLicenseFile: null,
        educationFile: null,
        experienceFile: null,
        otherFile: null,
    });

    /* ======================================================
       LOAD DOCUMENTS
    ====================================================== */

    useEffect(() => {
        if (employeeId) {
            loadDocuments();
        }
    }, [employeeId]);

    const loadDocuments = async () => {
        try {
            setLoading(true);

            const response = await axios.get(
                `${API_URL}/employee/${employeeId}`
            );

            const data = Array.isArray(response.data)
                ? response.data
                : [response.data];

            setDocuments(data);

            const aadhaar = data.find(
                (x) =>
                    String(x.documentType || "").toLowerCase() ===
                    "aadhaar"
            );

            const pan = data.find(
                (x) =>
                    String(x.documentType || "").toLowerCase() ===
                    "pan"
            );

            const uan = data.find(
                (x) =>
                    String(x.documentType || "").toLowerCase() === "uan" ||
                    String(x.documentType || "").toLowerCase() ===
                        "epfo / uan"
            );

            const bank = data.find(
                (x) =>
                    String(x.documentType || "").toLowerCase() ===
                    "bank"
            );

            setForm((prev) => ({
                ...prev,

                aadhaarNumber:
                    aadhaar?.documentNumber || "",

                panNumber:
                    pan?.documentNumber || "",

                uanNumber:
                    uan?.documentNumber || "",

                bankName:
                    bank?.bankName || "",

                accountNumber:
                    bank?.accountNumber || "",

                ifscCode:
                    bank?.ifscCode || "",

                accountType:
                    bank?.accountType || "Savings",
            }));
        } catch (error) {
            if (error.response?.status !== 404) {
                console.error(
                    "Error loading documents:",
                    error
                );
            }

            setDocuments([]);
        } finally {
            setLoading(false);
        }
    };

    /* ======================================================
       INPUT CHANGE
    ====================================================== */

    const handleInputChange = (field, value) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    /* ======================================================
       FILE CHANGE
    ====================================================== */

    const handleFileChange = (field, event) => {
        const file = event.target.files?.[0] || null;

        if (!file) return;

        /* Maximum 2 MB from UI */
        if (file.size > 2 * 1024 * 1024) {
            alert("File size must not exceed 2MB.");
            event.target.value = "";
            return;
        }

        /* Allowed extensions */
        const allowedExtensions = [
            ".pdf",
            ".docx",
            ".docs",
        ];

        const extension =
            "." +
            file.name
                .split(".")
                .pop()
                .toLowerCase();

        if (!allowedExtensions.includes(extension)) {
            alert(
                "Only PDF, DOCX and DOC files are allowed."
            );

            event.target.value = "";
            return;
        }

        setForm((prev) => ({
            ...prev,
            [field]: file,
        }));
    };

    /* ======================================================
       GET DOCUMENT
    ====================================================== */

    const getDocument = (type) =>
        documents.find(
            (x) =>
                String(x.documentType || "").toLowerCase() ===
                type.toLowerCase()
        );

    /* ======================================================
       GET STATUS
    ====================================================== */

    const getStatus = (type) => {
        const document = getDocument(type);

        if (!document) return "Pending";

        return document.status || "Draft";
    };

    /* ======================================================
       STATUS CLASS
    ====================================================== */

    const getStatusClass = (status) => {
        switch (String(status).toLowerCase()) {
            case "approved":
                return "approved";

            case "rejected":
                return "rejected";

            case "submitted":
                return "pending";

            default:
                return "pending";
        }
    };

    const RejectionStatus = ({ type }) => {
        const status = getStatus(type);

        return (
            <span
                className={`document-item-status ${getStatusClass(
                    status
                )}`}
                title={
                    status?.toLowerCase() === "rejected"
                        ? getRejectionReason(type)
                        : ""
                }
            >
                {status}
            </span>
        );
    };
/*==============reject description============*/
    const getRejectionReason = (type) => {
    const document = getDocument(type);

    return (
        document?.rejectionReason ||
        document?.RejectionReason ||
        ""
    );
};

    /* ======================================================
       OTHER DOCUMENT FILE INFO
       Shows selected/uploaded file name and size.
    ====================================================== */

    const getFileForType = (type) => {
        const fileFields = {
            "Passport": "passportFile",
            "Driving License": "drivingLicenseFile",
            "Education Certificate": "educationFile",
            "Experience Certificate": "experienceFile",
            "Other Document": "otherFile",
        };

        return form[fileFields[type]] || null;
    };

    const formatFileSize = (bytes) => {
        const size = Number(bytes);

        if (!Number.isFinite(size) || size <= 0) {
            return "";
        }

        if (size < 1024) {
            return `${size} B`;
        }

        if (size < 1024 * 1024) {
            return `${(size / 1024).toFixed(1)} KB`;
        }

        return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    };

    const getFileInfo = (type) => {
        const selectedFile = getFileForType(type);
        const existing = getDocument(type);

        const existingPath =
            existing?.documentPath ||
            existing?.DocumentPath ||
            "";

        const existingName = existingPath
            ? String(existingPath).split(/[\\/]/).pop()
            : "";

        const fileName = selectedFile?.name || existingName;

        const fileSize = selectedFile?.size ||
            existing?.documentSize ||
            existing?.DocumentSize ||
            0;

        return {
            name: fileName,
            size: formatFileSize(fileSize),
        };
    };

    /* ======================================================
       CREATE / UPDATE DOCUMENT
       
       IMPORTANT:
       If a NEW FILE exists, use /upload API so that
       DocumentData is stored in SQL Server.
    ====================================================== */

    const createOrUpdateDocument = async ({
        type,
        number,
        file,
        bankName,
        accountNumber,
        ifscCode,
        accountType,
    }) => {
        if (!employeeId) {
            throw new Error(
                "Employee ID is not available."
            );
        }

        const existing = getDocument(type);

        /* ==================================================
           CASE 1:
           NEW FILE SELECTED
           
           Send multipart/form-data to:
           POST /api/Document/upload
           ================================================== */

        if (file) {
            /*
             * Do not upload an already approved document.
             */
            if (existing?.status === "Approved") {
                return existing;
            }

const formData = new FormData();

            // Use the exact backend property names.
            formData.append(
                "EmployeeId",
                String(employeeId)
            );

            if (employeeAzureId) {
                formData.append(
                    "EmployeeAzureId",
                    String(employeeAzureId)
                );

                formData.append(
                    "UploadedByAzureId",
                    String(employeeAzureId)
                );
            }

            // IMPORTANT:
            // The backend validates DocumentName as the document type.
            formData.append(
                "DocumentName",
                String(type || "").trim()
            );

            // Keep DocumentType as well.
            formData.append(
                "DocumentType",
                String(type || "").trim()
            );

            if (number) {
                formData.append(
                    "DocumentNumber",
                    String(number)
                );
            }

            if (bankName) {
                formData.append(
                    "BankName",
                    String(bankName)
                );
            }

            if (accountNumber) {
                formData.append(
                    "AccountNumber",
                    String(accountNumber)
                );
            }

            if (ifscCode) {
                formData.append(
                    "IfscCode",
                    String(ifscCode)
                );
            }

            if (accountType) {
                formData.append(
                    "AccountType",
                    String(accountType)
                );
            }

            // Backend parameter is named exactly "file".
            formData.append(
                "file",
                file,
                file.name
            );

            console.log("UPLOAD DATA:", {
                EmployeeId: employeeId,
                DocumentName: type,
                DocumentType: type,
                DocumentNumber: number,
                FileName: file.name,
                FileSize: file.size
            });

            const response = await axios.post(
                `${API_URL}/upload`,
                formData
            );

            return response.data;
        }

        /* ==================================================
           CASE 2:
           NO NEW FILE
           
           Existing record -> PUT
           New record -> POST
           ================================================== */

const payload = {
    documentId:
        existing?.documentId || 0,

    employeeId:
        Number(employeeId),

    employeeAzureId:
        employeeAzureId || null,

    uploadedByAzureId:
        employeeAzureId || null,

    documentName:
        type,

    documentType:
        type,

    documentNumber:
        number || null,

    documentPath:
        existing?.documentPath || null,

    bankName:
        bankName || null,

    accountNumber:
        accountNumber || null,

    ifscCode:
        ifscCode || null,

    accountType:
        accountType || null,

    status:
        existing?.status || "Draft",

    submittedDate:
        existing?.submittedDate || null,

    approvedDate:
        existing?.approvedDate || null,

    rejectionReason:
        existing?.rejectionReason || null,
};

        /* Existing document */
        if (existing?.documentId) {
            const response = await axios.put(
                `${API_URL}/${existing.documentId}`,
                payload
            );

            return response.data;
        }

        /* New document without file */
        const response = await axios.post(
            API_URL,
            payload
        );

        return response.data;
    };

    /* ======================================================
       SAVE DRAFT
    ====================================================== */

    const saveDraft = async () => {
        try {
            if (!employeeId) {
                alert(
                    "Employee ID is not available."
                );
                return;
            }

            if (
    form.accountNumber &&
    !/^\d{9,18}$/.test(form.accountNumber)
) {
    alert("Account Number must contain 9 to 18 digits.");
    return;
}

            setSaving(true);

            const saved = [];

            const items = [
                {
                    type: "Aadhaar",
                    number: form.aadhaarNumber,
                    file: form.aadhaarFile,
                },

                {
                    type: "PAN",
                    number: form.panNumber,
                    file: form.panFile,
                },

                {
                    type: "UAN",
                    number: form.uanNumber,
                    file: form.uanFile,
                },

                {
                    type: "Bank",
                    file: form.bankFile,
                    bankName:
                        form.bankName,
                    accountNumber:
                        form.accountNumber,
                    ifscCode:
                        form.ifscCode,
                    accountType:
                        form.accountType,
                },

                {
                    type: "Passport",
                    file: form.passportFile,
                },

                {
                    type: "Driving License",
                    file:
                        form.drivingLicenseFile,
                },

                {
                    type:
                        "Education Certificate",
                    file:
                        form.educationFile,
                },

                {
                    type:
                        "Experience Certificate",
                    file:
                        form.experienceFile,
                },

                {
                    type:
                        "Other Document",
                    file:
                        form.otherFile,
                },
            ];

            for (const item of items) {
                const existing =
                    getDocument(item.type);

                /*
                 * Approved document must not be modified.
                 */
                if (
                    existing?.status ===
                    "Approved"
                ) {
                    continue;
                }

                const hasData =
                    item.number ||
                    item.file ||
                    item.bankName ||
                    item.accountNumber ||
                    item.ifscCode ||
                    item.accountType ||
                    existing;

                if (!hasData) {
                    continue;
                }

                const result =
                    await createOrUpdateDocument(
                        item
                    );

                saved.push(result);
            }

            await loadDocuments();

            alert(
                saved.length
                    ? "Documents saved as Draft successfully."
                    : "No document changes to save."
            );
        } catch (error) {
            console.error(
                "Error saving documents:",
                error
            );

            alert(
                error.response?.data?.message ||
                    "Failed to save documents."
            );
        } finally {
            setSaving(false);
        }
    };

    /* ======================================================
       VALIDATE REQUIRED DOCUMENTS
       
       5 MANDATORY DOCUMENTS:
       1. Aadhaar
       2. PAN
       3. UAN
       4. Bank
       5. Education Certificate
    ====================================================== */

    const validateDocuments = () => {
        const errors = [];

        const aadhaar =
            form.aadhaarNumber
                ?.trim() || "";

        const pan =
            form.panNumber
                ?.trim()
                .toUpperCase() || "";

        const uan =
            form.uanNumber
                ?.trim() || "";

        const bankName =
            form.bankName
                ?.trim() || "";

        const accountNumber =
            form.accountNumber
                ?.trim() || "";

        const ifscCode =
            form.ifscCode
                ?.trim()
                .toUpperCase() || "";

        /* ==================================================
           AADHAAR
        ================================================== */

        if (!aadhaar) {
            errors.push(
                "Aadhaar Card Number is required."
            );
        } else if (
            !validationRules.aadhaar.test(
                aadhaar
            )
        ) {
            errors.push(
                "Aadhaar Card Number must be exactly 12 digits."
            );
        }

        if (
            !form.aadhaarFile &&
            !getDocument(
                "Aadhaar"
            )?.documentPath
        ) {
            errors.push(
                "Aadhaar Card document is required."
            );
        }

        /* ==================================================
           PAN
        ================================================== */

        if (!pan) {
            errors.push(
                "PAN Card Number is required."
            );
        } else if (
            !validationRules.pan.test(
                pan
            )
        ) {
            errors.push(
                "PAN Card Number format is invalid."
            );
        }

        if (
            !form.panFile &&
            !getDocument(
                "PAN"
            )?.documentPath
        ) {
            errors.push(
                "PAN Card document is required."
            );
        }

        /* ==================================================
           UAN
        ================================================== */

        if (!uan) {
            errors.push(
                "EPFO / UAN Number is required."
            );
        } else if (
            !validationRules.uan.test(
                uan
            )
        ) {
            errors.push(
                "EPFO / UAN Number must be exactly 12 digits."
            );
        }

        if (
            !form.uanFile &&
            !getDocument(
                "UAN"
            )?.documentPath
        ) {
            errors.push(
                "EPFO / UAN document is required."
            );
        }

        /* ==================================================
           BANK NAME
        ================================================== */

        if (!bankName) {
            errors.push(
                "Bank Name is required."
            );
        } else if (
            !validationRules.bankName.test(
                bankName
            )
        ) {
            errors.push(
                "Bank Name can contain only letters and spaces."
            );
        }

        /* ==================================================
           ACCOUNT NUMBER
        ================================================== */

        if (!accountNumber) {
            errors.push(
                "Account Number is required."
            );
        } else if (
            !validationRules.accountNumber.test(
                accountNumber
            )
        ) {
            errors.push(
                "Account Number must contain 9 to 18 digits."
            );
        }

        /* ==================================================
           IFSC
        ================================================== */

        if (!ifscCode) {
            errors.push(
                "IFSC Code is required."
            );
        } else if (
            !validationRules.ifsc.test(
                ifscCode
            )
        ) {
            errors.push(
                "IFSC Code format is invalid."
            );
        }

        /* ==================================================
           ACCOUNT TYPE
        ================================================== */

        if (!form.accountType) {
            errors.push(
                "Account Type is required."
            );
        }

        /* ==================================================
           BANK DOCUMENT
        ================================================== */

        if (
            !form.bankFile &&
            !getDocument(
                "Bank"
            )?.documentPath
        ) {
            errors.push(
                "Cancelled Cheque / Passbook document is required."
            );
        }

        /* ==================================================
           EDUCATION CERTIFICATE
        ================================================== */

        if (
            !form.educationFile &&
            !getDocument(
                "Education Certificate"
            )?.documentPath
        ) {
            errors.push(
                "Education Certificate is required."
            );
        }

        if (errors.length > 0) {
            alert(
                errors.join("\n")
            );

            return false;
        }

        return true;
    };

    /* ======================================================
       SUBMIT DOCUMENTS
    ====================================================== */

    const submitDocuments = async () => {
        try {
            if (!employeeId) {
                alert(
                    "Employee ID is not available."
                );
                return;
            }

            /* ==================================================
               VALIDATION
            ================================================== */

            if (!validateDocuments()) {
                return;
            }

            setSaving(true);

            const saved = [];

            /* ==================================================
               DOCUMENT ITEMS
            ================================================== */

            const items = [
                {
                    type: "Aadhaar",
                    number:
                        form.aadhaarNumber
                            ?.trim() || "",
                    file:
                        form.aadhaarFile,
                },

                {
                    type: "PAN",
                    number:
                        form.panNumber
                            ?.trim()
                            .toUpperCase() || "",
                    file:
                        form.panFile,
                },

                {
                    type: "UAN",
                    number:
                        form.uanNumber
                            ?.trim() || "",
                    file:
                        form.uanFile,
                },

                {
                    type: "Bank",
                    file:
                        form.bankFile,
                    bankName:
                        form.bankName
                            ?.trim() || "",
                    accountNumber:
                        form.accountNumber
                            ?.trim() || "",
                    ifscCode:
                        form.ifscCode
                            ?.trim()
                            .toUpperCase() || "",
                    accountType:
                        form.accountType,
                },

                {
                    type:
                        "Education Certificate",
                    file:
                        form.educationFile,
                },

                {
                    type:
                        "Passport",
                    file:
                        form.passportFile,
                },

                {
                    type:
                        "Driving License",
                    file:
                        form.drivingLicenseFile,
                },

                {
                    type:
                        "Experience Certificate",
                    file:
                        form.experienceFile,
                },

                {
                    type:
                        "Other Document",
                    file:
                        form.otherFile,
                },
            ];

            /* ==================================================
               SAVE / UPLOAD DOCUMENTS
            ================================================== */

            for (const item of items) {
                const existing =
                    getDocument(item.type);

                /*
                 * Approved documents must never
                 * be modified.
                 */
                if (
                    existing?.status ===
                    "Approved"
                ) {
                    continue;
                }

                const hasData =
                    item.number ||
                    item.file ||
                    item.bankName ||
                    item.accountNumber ||
                    item.ifscCode ||
                    item.accountType ||
                    existing;

                if (!hasData) {
                    continue;
                }

                const result =
                    await createOrUpdateDocument(
                        item
                    );

                saved.push(result);
            }

            /* ==================================================
               RELOAD
            ================================================== */

            await loadDocuments();

            /* ==================================================
               GET CURRENT DOCUMENTS
            ================================================== */

            const currentResponse =
                await axios.get(
                    `${API_URL}/employee/${employeeId}`
                );

            const currentDocuments =
                Array.isArray(
                    currentResponse.data
                )
                    ? currentResponse.data
                    : [currentResponse.data];

            /* ==================================================
               SUBMIT EACH DOCUMENT
            ================================================== */

            for (
                const document of
                currentDocuments
            ) {
                if (
                    document.status !==
                        "Approved" &&
                    document.status !==
                        "Submitted"
                ) {
                    await axios.put(
                        `${API_URL}/${document.documentId}/submit`
                    );
                }
            }

            /* ==================================================
               FINAL RELOAD
            ================================================== */

            await loadDocuments();

            alert(
                "Documents submitted successfully for HR approval."
            );
        } catch (error) {
            console.error(
                "Error submitting documents:",
                error
            );

            alert(
                error.response?.data?.message ||
                    "Failed to submit documents."
            );
        } finally {
            setSaving(false);
        }
    };

    /* ======================================================
       OVERALL STATUS
    ====================================================== */

    const overallStatus = () => {
        if (!documents.length) {
            return "Pending HR Approval";
        }

        const statuses =
            documents.map((x) =>
                String(
                    x.status || ""
                ).toLowerCase()
            );

        if (
            statuses.length &&
            statuses.every(
                (x) => x === "approved"
            )
        ) {
            return "Approved";
        }

        if (
            statuses.some(
                (x) => x === "rejected"
            )
        ) {
            return "Action Required";
        }

        if (
            statuses.some(
                (x) => x === "submitted"
            )
        ) {
            return "Pending HR Approval";
        }

        return "Pending HR Approval";
    };

    /* ======================================================
       COMPLETION PERCENTAGE

       ONLY 5 MANDATORY DOCUMENTS

       Aadhaar       = 20%
       PAN           = 20%
       UAN           = 20%
       Bank          = 20%
       Education     = 20%

       IMPORTANT:
       ONLY "Approved" COUNTS.
    ====================================================== */

    const completionPercentage = () => {
        const requiredDocuments = [
            "Aadhaar",
            "PAN",
            "UAN",
            "Bank",
            "Education Certificate",
        ];

        const completedDocuments =
            requiredDocuments.filter(
                (type) => {
                    const document =
                        getDocument(type);

                    return (
                        document &&
                        document.documentPath &&
                        String(
                            document.status || ""
                        ).toLowerCase() ===
                            "approved"
                    );
                }
            ).length;

        return Math.round(
            (completedDocuments /
                requiredDocuments.length) *
                100
        );
    };

    /* ======================================================
       UI
       DO NOT CHANGE
    ====================================================== */

    return (
        <div className="documents-container">

            {/* ================= Header ================= */}

            <div className="documents-header">

                <div>
                    <h2>
                        Documents
                    </h2>

                    <p>
                        Provide and upload your identity,
                        employment & bank documents.
                        Submit for HR approval.
                    </p>
                </div>

                <div
                    className={`document-overall-status ${
                        completionPercentage() ===
                        100
                            ? "completed"
                            : ""
                    }`}
                >
                    <span>
                        Document Status:
                    </span>

                    <strong>
                        {loading
                            ? "Loading..."
                            : `${overallStatus()} (${completionPercentage()}%)`}
                    </strong>
                </div>

            </div>

            {/* ================= Document Cards ================= */}

            <div className="documents-grid">

                {/* ================= Identity & Tax ================= */}

                <div className="document-card">

                    <div className="document-card-header">
                        <h3>
                            🪪 Identity & Tax Documents
                        </h3>
                    </div>

                    <div className="document-card-body">

                        {/* Aadhaar Number */}

                        <div className="document-field">

                            <label>
                                Aadhaar Card Number <span className="required-star">*</span>
                            </label>

                            <input
                                type="text"
                                placeholder="XXXX XXXX 1234"
                                maxLength="12"
                                value={
                                    form.aadhaarNumber
                                }
                                onChange={(e) =>
                                    handleInputChange(
                                        "aadhaarNumber",
                                        e.target.value
                                    )
                                }
                            />

                        </div>

                        {/* Aadhaar Document */}

                        <div className="document-field">

                            <label>
                                Aadhaar Card (Photo/Document)
                            </label>

                            <div
                                className="upload-box"
                                onClick={() =>
                                    document
                                        .getElementById(
                                            "aadhaarFile"
                                        )
                                        ?.click()
                                }
                            >

                                <span className="upload-icon">
                                    ☁
                                </span>

                                <span>
                                    {form.aadhaarFile?.name ||
                                        "Upload Aadhaar Card"}
                                </span>

                                <small>
                                     PDF, DOCS, DOCX (Max. 2MB)
                                </small>

                            </div>

                            <input
                                id="aadhaarFile"
                                type="file"
                                accept=".docs,.docx,.pdf"
                                className="file-input"
                                onChange={(e) =>
                                    handleFileChange(
                                        "aadhaarFile",
                                        e
                                    )
                                }
                            />

                            <span
    className={`document-item-status ${getStatusClass(
        getStatus("Aadhaar")
    )}`}
    title={
        getStatus("Aadhaar").toLowerCase() === "rejected"
            ? getRejectionReason("Aadhaar")
            : ""
    }
>
    {getStatus("Aadhaar")}
</span>

                        </div>

                        {/* PAN Number */}

                        <div className="document-field">

                            <label>
                                PAN Card Number <span className="required-star">*</span>
                            </label>

                            <input
                                type="text"
                                placeholder="ABCDE1234F"
                                maxLength="10"
                                value={
                                    form.panNumber
                                }
                                onChange={(e) =>
                                    handleInputChange(
                                        "panNumber",
                                        e.target.value
                                    )
                                }
                            />

                        </div>

                        {/* PAN Document */}

                        <div className="document-field">

                            <label>
                                PAN Card (Photo/Document)
                            </label>

                            <div
                                className="upload-box"
                                onClick={() =>
                                    document
                                        .getElementById(
                                            "panFile"
                                        )
                                        ?.click()
                                }
                            >

                                <span className="upload-icon">
                                    ☁
                                </span>

                                <span>
                                    {form.panFile?.name ||
                                        "Upload PAN Card"}
                                </span>

                                <small>
                                    PDF, DOCS, DOCX (Max. 2MB)
                                </small>

                            </div>

                            <input
                                id="panFile"
                                type="file"
                                accept=".docs,.docx,.pdf"
                                className="file-input"
                                onChange={(e) =>
                                    handleFileChange(
                                        "panFile",
                                        e
                                    )
                                }
                            />

                            <span
    className={`document-item-status ${getStatusClass(
        getStatus("PAN")
    )}`}
    title={
        getStatus("PAN").toLowerCase() === "rejected"
            ? getRejectionReason("PAN")
            : ""
    }
>
    {getStatus("PAN")}
</span>

                        </div>

                    </div>
                </div>

                {/* ================= PF / Employment ================= */}

                <div className="document-card">

                    <div className="document-card-header">
                        <h3>
                            💼 PF / Employment Details
                        </h3>
                    </div>

                    <div className="document-card-body">

                        {/* UAN */}

                        <div className="document-field">

                            <label>
                                EPFO / UAN Number <span className="required-star">*</span>
                            </label>

                            <input
                                type="text"
                                placeholder="100XXXXXXXXXXX"
                                maxLength="12"
                                value={
                                    form.uanNumber
                                }
                                onChange={(e) =>
                                    handleInputChange(
                                        "uanNumber",
                                        e.target.value
                                    )
                                }
                            />

                        </div>

                        {/* UAN Document */}

                        <div className="document-field">

                            <label>
                                EPFO / UAN Document
                            </label>

                            <div
                                className="upload-box"
                                onClick={() =>
                                    document
                                        .getElementById(
                                            "uanFile"
                                        )
                                        ?.click()
                                }
                            >

                                <span className="upload-icon">
                                    ☁
                                </span>

                                <span>
                                    {form.uanFile?.name ||
                                        "Upload EPFO / UAN Document"}
                                </span>

                                <small>
                                    PDF, DOCS, DOCX (Max. 2MB)
                                </small>

                            </div>

                            <input
                                id="uanFile"
                                type="file"
                                accept=".docs,.docs,.pdf"
                                className="file-input"
                                onChange={(e) =>
                                    handleFileChange(
                                        "uanFile",
                                        e
                                    )
                                }
                            />

<RejectionStatus type="UAN" />

                        </div>

                    </div>
                </div>

                {/* ================= Bank Details ================= */}

                <div className="document-card">

                    <div className="document-card-header">
                        <h3>
                            🏦 Bank Details
                        </h3>
                    </div>

                    <div className="document-card-body">

                        {/* Bank Name */}

                        <div className="document-field">

                            <label>
                                Bank Name <span className="required-star">*</span>
                            </label>

                            <input
                                type="text"
                                placeholder="Bank Name"
                                value={
                                    form.bankName
                                }
                                onChange={(e) =>
                                    handleInputChange(
                                        "bankName",
                                        e.target.value
                                    )
                                }
                            />

                        </div>

                        {/* Account Number */}

                        <div className="document-field">

                            <label>
                                Account Number
                            </label>

<input
    type="text"
    placeholder="Account Number"
    value={form.accountNumber}
    maxLength={18}
    onChange={(e) => {
        const value = e.target.value;

        // Allow numbers only, maximum 18 digits
        if (/^\d{0,18}$/.test(value)) {
            handleInputChange("accountNumber", value);
        }
    }}
/>

                        </div>

                        {/* IFSC */}

                        <div className="document-field">

                            <label>
                                IFSC Code
                            </label>

                            <input
                                type="text"
                                placeholder="HDFC0001234"
                                value={
                                    form.ifscCode
                                }
                                onChange={(e) =>
                                    handleInputChange(
                                        "ifscCode",
                                        e.target.value
                                    )
                                }
                            />

                        </div>

                        {/* Account Type */}

                        <div className="document-field">

                            <label>
                                Account Type
                            </label>

                            <select
                                value={
                                    form.accountType
                                }
                                onChange={(e) =>
                                    handleInputChange(
                                        "accountType",
                                        e.target.value
                                    )
                                }
                            >

                                <option>
                                    Savings
                                </option>

                                <option>
                                    Current
                                </option>

                            </select>

                        </div>

                        {/* Cancelled Cheque */}

                        <div className="document-field">

                            <label>
                                Cancelled Cheque / Passbook
                            </label>

                            <div
                                className="upload-box"
                                onClick={() =>
                                    document
                                        .getElementById(
                                            "bankFile"
                                        )
                                        ?.click()
                                }
                            >

                                <span className="upload-icon">
                                    ☁
                                </span>

                                <span>
                                    {form.bankFile?.name ||
                                        "Upload Document"}
                                </span>

                                <small>
                                    PDF, DOCS, DOCX (Max. 2MB)
                                </small>

                            </div>

                            <input
                                id="bankFile"
                                type="file"
                                accept=".docx,.docs,.pdf"
                                className="file-input"
                                onChange={(e) =>
                                    handleFileChange(
                                        "bankFile",
                                        e
                                    )
                                }
                            />

<RejectionStatus type="Bank" />

                        </div>

                    </div>
                </div>

                {/* ================= Other Documents ================= */}

                <div className="document-card">

                    <div className="document-card-header">
                        <h3>
                            📁 Other Documents
                        </h3>
                    </div>

                    <div className="other-documents">

                        {/* Passport */}
                        <div className="other-document-row">
                            <span>Passport</span>

                            <div className="other-document-status-area">
<RejectionStatus type="Passport" />

                                {getFileInfo("Passport").name && (
                                    <span
                                        className="other-document-file-info"
                                        title={getFileInfo("Passport").name}
                                    >
                                        <span className="other-document-file-name">
                                            {getFileInfo("Passport").name}
                                        </span>
                                        {getFileInfo("Passport").size && (
                                            <span className="other-document-file-size">
                                                {getFileInfo("Passport").size}
                                            </span>
                                        )}
                                    </span>
                                )}
                            </div>

                            <label className="upload-button">
                                ☁ Upload
                                <input
                                    type="file"
                                    accept=".docs,.docx,.pdf"
                                    onChange={(e) =>
                                        handleFileChange("passportFile", e)
                                    }
                                />
                            </label>
                        </div>

                        {/* Driving License */}
                        <div className="other-document-row">
                            <span>Driving License</span>

                            <div className="other-document-status-area">
<RejectionStatus type="Driving License" />

                                {getFileInfo("Driving License").name && (
                                    <span
                                        className="other-document-file-info"
                                        title={getFileInfo("Driving License").name}
                                    >
                                        <span className="other-document-file-name">
                                            {getFileInfo("Driving License").name}
                                        </span>
                                        {getFileInfo("Driving License").size && (
                                            <span className="other-document-file-size">
                                                {getFileInfo("Driving License").size}
                                            </span>
                                        )}
                                    </span>
                                )}
                            </div>

                            <label className="upload-button">
                                ☁ Upload
                                <input
                                    type="file"
                                    accept=".docs,.docx,.pdf"
                                    onChange={(e) =>
                                        handleFileChange("drivingLicenseFile", e)
                                    }
                                />
                            </label>
                        </div>

                        {/* Education Certificate */}
                        <div className="other-document-row">
                            <span>
                                Education Certificate <span className="required-star">*</span>
                            </span>

                            <div className="other-document-status-area">
<RejectionStatus type="Education Certificate" />

                                {getFileInfo("Education Certificate").name && (
                                    <span
                                        className="other-document-file-info"
                                        title={getFileInfo("Education Certificate").name}
                                    >
                                        <span className="other-document-file-name">
                                            {getFileInfo("Education Certificate").name}
                                        </span>
                                        {getFileInfo("Education Certificate").size && (
                                            <span className="other-document-file-size">
                                                {getFileInfo("Education Certificate").size}
                                            </span>
                                        )}
                                    </span>
                                )}
                            </div>

                            <label className="upload-button">
                                ☁ Upload
                                <input
                                    type="file"
                                    accept=".docs,.docx,.pdf"
                                    onChange={(e) =>
                                        handleFileChange("educationFile", e)
                                    }
                                />
                            </label>
                        </div>

                        {/* Experience Certificate */}
                        <div className="other-document-row">
                            <span>Experience Certificate</span>

                            <div className="other-document-status-area">
<RejectionStatus type="Experience Certificate" />

                                {getFileInfo("Experience Certificate").name && (
                                    <span
                                        className="other-document-file-info"
                                        title={getFileInfo("Experience Certificate").name}
                                    >
                                        <span className="other-document-file-name">
                                            {getFileInfo("Experience Certificate").name}
                                        </span>
                                        {getFileInfo("Experience Certificate").size && (
                                            <span className="other-document-file-size">
                                                {getFileInfo("Experience Certificate").size}
                                            </span>
                                        )}
                                    </span>
                                )}
                            </div>

                            <label className="upload-button">
                                ☁ Upload
                                <input
                                    type="file"
                                    accept=".docs,.docx,.pdf"
                                    onChange={(e) =>
                                        handleFileChange("experienceFile", e)
                                    }
                                />
                            </label>
                        </div>

                        {/* Other Document */}
                        <div className="other-document-row">
                            <span>Other Document</span>

                            <div className="other-document-status-area">
<RejectionStatus type="Other Document" />

                                {getFileInfo("Other Document").name && (
                                    <span
                                        className="other-document-file-info"
                                        title={getFileInfo("Other Document").name}
                                    >
                                        <span className="other-document-file-name">
                                            {getFileInfo("Other Document").name}
                                        </span>
                                        {getFileInfo("Other Document").size && (
                                            <span className="other-document-file-size">
                                                {getFileInfo("Other Document").size}
                                            </span>
                                        )}
                                    </span>
                                )}
                            </div>

                            <label className="upload-button">
                                ☁ Upload
                                <input
                                    type="file"
                                    accept=".docs,.docx,.pdf"
                                    onChange={(e) =>
                                        handleFileChange("otherFile", e)
                                    }
                                />
                            </label>
                        </div>

                    </div>
                </div>

            </div>

            {/* ================= Important Note ================= */}

            <div className="document-footer">

                <div className="document-note">

                    <strong>
                        ⓘ Important Note
                    </strong>

                    <p>
                        Please ensure all documents are clear
                        and valid. After submission, your
                        documents will be reviewed by HR.
                    </p>

                </div>

                <div className="document-actions">

                    <button
                        type="button"
                        className="save-draft-button"
                        onClick={saveDraft}
                        disabled={saving}
                    >
                        {saving
                            ? "Saving..."
                            : "Save Draft"}
                    </button>

                    <button
                        type="button"
                        className="submit-document-button"
                        onClick={submitDocuments}
                        disabled={saving}
                    >
                        {saving
                            ? "Submitting..."
                            : "➤ Submit for HR Approval"}
                    </button>

                </div>

            </div>

        </div>
    );
}

export default Documents;