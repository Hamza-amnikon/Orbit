import { MuiButtonMigration, MuiInputMigration } from "../../../components/ui/MuiCompat.jsx";
import { useEffect, useState } from "react";
import axios from "axios";
import "./Docs.css";
import { Box as MuiLayoutBox, Typography as MuiText, ButtonBase as MuiActionButton } from "@mui/material";
import { MenuItem, Select } from "@mui/material";
import { showReactAlert } from "../../../components/ui/ReactPromptProvider";

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

const API_URL = `${import.meta.env.VITE_DOCUMENT_API_BASE_URL}/api/Document`;
const ONBOARDING_API_URL =
    import.meta.env.VITE_ONBOARDING_API_URL ||
    "https://sparkapi.amnikontechnologies.com:5126";

const REQUIRED_DOCUMENT_TYPES = [
    "Aadhaar",
    "PAN",
    "Bank",
    "Education Certificate",
];

const formatAadhaarNumber = (value) => {
    const digits = String(value || "").replace(/\D/g, "").slice(0, 12);
    return digits.match(/\d{1,4}/g)?.join(" ") || "";
};

function Documents({ profile }) {

    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [hasOnboardingDetails, setHasOnboardingDetails] = useState(false);
    const [draggingField, setDraggingField] = useState("");

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

            const [documentsResult, onboardingResult] = await Promise.allSettled([
                axios.get(`${API_URL}/employee/${employeeId}`),
                axios.get(`${ONBOARDING_API_URL}/api/Onboarding/${employeeId}/details`),
            ]);

            const data = documentsResult.status === "fulfilled"
                ? (Array.isArray(documentsResult.value.data)
                    ? documentsResult.value.data
                    : [documentsResult.value.data])
                : [];

            if (
                documentsResult.status === "rejected" &&
                documentsResult.reason?.response?.status !== 404
            ) {
                throw documentsResult.reason;
            }

            setDocuments(data);
            setHasOnboardingDetails(onboardingResult.status === "fulfilled");

            const findLatestDocument = (type) =>
                data
                    .filter((document) =>
                        String(document.documentType || document.documentName || "").toLowerCase() ===
                        type.toLowerCase()
                    )
                    .sort((a, b) =>
                        Number(b.documentId || b.DocumentId || 0) - Number(a.documentId || a.DocumentId || 0)
                    )[0];

            const aadhaar = findLatestDocument("Aadhaar");
            const pan = findLatestDocument("PAN");

            const uan = data.find(
                (x) =>
                    String(x.documentType || "").toLowerCase() === "uan" ||
                    String(x.documentType || "").toLowerCase() ===
                        "epfo / uan"
            );

            const bank = findLatestDocument("Bank");

            setForm((prev) => ({
                ...prev,

                aadhaarNumber:
                    formatAadhaarNumber(aadhaar?.documentNumber),

                panNumber:
                    pan?.documentNumber?.toUpperCase() || "",

                uanNumber:
                    onboardingResult.status === "fulfilled"
                        ? onboardingResult.value.data?.data?.uanNumber || ""
                        : uan?.documentNumber || "",

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

    const saveUanNumber = async () => {
        const detailsUrl = `${ONBOARDING_API_URL}/api/Onboarding/${employeeId}/details`;
        let existingDetails = {};

        try {
            const response = await axios.get(detailsUrl);
            existingDetails = response.data?.data || {};
        } catch (error) {
            if (error.response?.status !== 404) {
                throw error;
            }
        }

        await axios.put(detailsUrl, {
            ...existingDetails,
            uanNumber: form.uanNumber.trim() || null,
        });
    };

    /* ======================================================
       INPUT CHANGE
    ====================================================== */

    const handleInputChange = (field, value) => {
        if (field === "aadhaarNumber") {
            value = formatAadhaarNumber(value);
        } else if (field === "panNumber") {
            value = value.toUpperCase();
        }

        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    /* ======================================================
       FILE CHANGE
    ====================================================== */

    const handleSelectedFile = (field, file, input) => {
        if (!file) return;

        /* Maximum 2 MB from UI */
        if (file.size > 2 * 1024 * 1024) {
            showReactAlert("File size must not exceed 2MB.");
            if (input) input.value = "";
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
            showReactAlert(
                "Only PDF, DOCX and DOC files are allowed."
            );

            if (input) input.value = "";
            return;
        }

        setForm((prev) => ({
            ...prev,
            [field]: file,
        }));

        if (input) input.value = "";
    };

    const handleFileChange = (field, event) => {
        handleSelectedFile(field, event.target.files?.[0], event.target);
    };

    const getDropProps = (field) => ({
        onDragOver: (event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = "copy";
            setDraggingField(field);
        },
        onDragLeave: (event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
                setDraggingField("");
            }
        },
        onDrop: (event) => {
            event.preventDefault();
            setDraggingField("");
            handleSelectedFile(field, event.dataTransfer.files?.[0]);
        },
    });

    const isDragging = (field) => draggingField === field;

    const handleDropKeyDown = (field, inputId) => (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            document.getElementById(inputId)?.click();
        }
    };

    /* ======================================================
       GET DOCUMENT
    ====================================================== */

    const getDocument = (type) =>
        documents
            .filter(
                (x) =>
                    String(x.documentType || x.documentName || "").toLowerCase() ===
                    type.toLowerCase()
            )
            .sort(
                (a, b) => Number(b.documentId || b.DocumentId || 0) - Number(a.documentId || a.DocumentId || 0)
            )[0];

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
            <MuiText
                className={`document-item-status ${getStatusClass(
                    status
                )}`}
                title={
                    status?.toLowerCase() === "rejected"
                        ? getRejectionReason(type)
                        : ""
                }
             component="span" variant="inherit">
                {status}
            </MuiText>
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
                showReactAlert(
                    "Employee ID is not available."
                );
                return;
            }

            if (
    form.accountNumber &&
    !/^\d{9,18}$/.test(form.accountNumber)
) {
    showReactAlert("Account Number must contain 9 to 18 digits.");
    return;
}

            setSaving(true);

            const uanSaved = Boolean(form.uanNumber.trim()) || hasOnboardingDetails;
            if (uanSaved) {
                await saveUanNumber();
            }

            const saved = [];

            const items = [
                {
                    type: "Aadhaar",
                    number: form.aadhaarNumber.replace(/\s/g, ""),
                    file: form.aadhaarFile,
                },

                {
                    type: "PAN",
                    number: form.panNumber,
                    file: form.panFile,
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
                    String(existing?.status || "").toLowerCase() === "approved" &&
                    !item.file
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

            showReactAlert(
                saved.length || uanSaved
                    ? "Document details saved successfully."
                    : "No document changes to save."
            );
        } catch (error) {
            console.error(
                "Error saving documents:",
                error
            );

            showReactAlert(
                error.response?.data?.message ||
                    "Failed to save documents."
            );
        } finally {
            setSaving(false);
        }
    };

    /* ======================================================
       VALIDATE REQUIRED DOCUMENTS
       
       4 MANDATORY DOCUMENTS:
       1. Aadhaar
       2. PAN
       3. Bank
       4. Education Certificate
    ====================================================== */

    const validateDocuments = () => {
        const errors = [];

        const aadhaar =
            form.aadhaarNumber
                ?.replace(/\s/g, "") || "";

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

        if (uan) {
            if (!validationRules.uan.test(uan)) {
                errors.push(
                    "EPFO / UAN Number must be exactly 12 digits."
                );
            }
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
            showReactAlert(
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
                showReactAlert(
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

            if (form.uanNumber.trim() || hasOnboardingDetails) {
                await saveUanNumber();
            }

            const saved = [];

            /* ==================================================
               DOCUMENT ITEMS
            ================================================== */

            const items = [
                {
                    type: "Aadhaar",
                    number:
                        form.aadhaarNumber
                            ?.replace(/\s/g, "") || "",
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
                    String(existing?.status || "").toLowerCase() === "approved" &&
                    !item.file
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
                const documentType = String(
                    document.documentType || document.documentName || ""
                ).toLowerCase().replace(/[^a-z0-9]/g, "");

                // Legacy UAN number records are not uploaded documents and
                // must not enter the HR document approval workflow.
                if (["uan", "epfouan", "uannumber", "epfouannumber"].includes(documentType)) {
                    continue;
                }

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

            showReactAlert(
                "Documents submitted successfully for HR approval."
            );
        } catch (error) {
            console.error(
                "Error submitting documents:",
                error
            );

            showReactAlert(
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
        const statuses =
            REQUIRED_DOCUMENT_TYPES.map((type) =>
                String(
                    getDocument(type)?.status || ""
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

       ONLY 4 MANDATORY DOCUMENTS

       Aadhaar       = 25%
       PAN           = 25%
       Bank          = 25%
       Education     = 25%

       IMPORTANT:
       ONLY "Approved" COUNTS.
    ====================================================== */

    const completionPercentage = () => {
        const completedDocuments =
            REQUIRED_DOCUMENT_TYPES.filter(
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
                REQUIRED_DOCUMENT_TYPES.length) *
                100
        );
    };

    /* ======================================================
       UI
       DO NOT CHANGE
    ====================================================== */

    return (
        <MuiLayoutBox className="documents-container" component="div">

            {/* ================= Header ================= */}

            <MuiLayoutBox className="documents-header" component="div">

                <MuiLayoutBox component="div">
                    <MuiText component="h2" variant="h5">
                        Documents
                    </MuiText>

                    <MuiText component="p" variant="body1">
                        Provide and upload your identity,
                        employment & bank documents.
                        Submit for HR approval.
                    </MuiText>
                </MuiLayoutBox>

                <MuiLayoutBox
                    className={`document-overall-status ${
                        completionPercentage() ===
                        100
                            ? "completed"
                            : ""
                    }`}
                 component="div">
                    <MuiText component="span" variant="inherit">
                        Document Status:
                    </MuiText>

                    <MuiText component="strong" variant="inherit">
                        {loading
                            ? "Loading..."
                            : `${overallStatus()} (${completionPercentage()}%)`}
                    </MuiText>
                </MuiLayoutBox>

            </MuiLayoutBox>

            {/* ================= Document Cards ================= */}

            <MuiLayoutBox className="documents-grid" component="div">

                {/* ================= Identity & Tax ================= */}

                <MuiLayoutBox className="document-card" component="div">

                    <MuiLayoutBox className="document-card-header" component="div">
                        <MuiText component="h3" variant="h6">
                            🪪 Identity & Tax Documents
                        </MuiText>
                    </MuiLayoutBox>

                    <MuiLayoutBox className="document-card-body" component="div">

                        {/* Aadhaar Number */}

                        <MuiLayoutBox className="document-field" component="div">

                            <MuiLayoutBox component="label">
                                Aadhaar Card Number <MuiText className="required-star" component="span" variant="inherit">*</MuiText>
                            </MuiLayoutBox>

                            <MuiInputMigration
                                type="text"
                                placeholder="1234 5678 9012"
                                maxLength="14"
                                inputProps={{ inputMode: "numeric" }}
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

                        </MuiLayoutBox>

                        {/* Aadhaar Document */}

                        <MuiLayoutBox className="document-field" component="div">

                            <MuiLayoutBox component="label">
                                Aadhaar Card (Photo/Document)
                            </MuiLayoutBox>

                            <MuiActionButton
                                className={`upload-box${isDragging("aadhaarFile") ? " is-dragging" : ""}`}
                                {...getDropProps("aadhaarFile")}
                                role="button"
                                tabIndex={0}
                                onKeyDown={handleDropKeyDown("aadhaarFile", "aadhaarFile")}
                                onClick={() =>
                                    document
                                        .getElementById(
                                            "aadhaarFile"
                                        )
                                        ?.click()
                                }
                             component="div">

                                <MuiText className="upload-icon" component="span" variant="inherit">
                                    ☁
                                </MuiText>

                                <MuiText component="span" variant="inherit">
                                    {form.aadhaarFile?.name ||
                                        "Upload Aadhaar Card"}
                                </MuiText>

                                <MuiText component="small" variant="caption">
                                     Drop file or click to browse · PDF, DOCX (Max. 2MB)
                                </MuiText>

                            </MuiActionButton>

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

                            <MuiText
    className={`document-item-status ${getStatusClass(
        getStatus("Aadhaar")
    )}`}
    title={
        getStatus("Aadhaar").toLowerCase() === "rejected"
            ? getRejectionReason("Aadhaar")
            : ""
    }
 component="span" variant="inherit">
    {getStatus("Aadhaar")}
</MuiText>

                        </MuiLayoutBox>

                        {/* PAN Number */}

                        <MuiLayoutBox className="document-field" component="div">

                            <MuiLayoutBox component="label">
                                PAN Card Number <MuiText className="required-star" component="span" variant="inherit">*</MuiText>
                            </MuiLayoutBox>

                            <MuiInputMigration
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

                        </MuiLayoutBox>

                        {/* PAN Document */}

                        <MuiLayoutBox className="document-field" component="div">

                            <MuiLayoutBox component="label">
                                PAN Card (Photo/Document)
                            </MuiLayoutBox>

                            <MuiActionButton
                                className={`upload-box${isDragging("panFile") ? " is-dragging" : ""}`}
                                {...getDropProps("panFile")}
                                role="button"
                                tabIndex={0}
                                onKeyDown={handleDropKeyDown("panFile", "panFile")}
                                onClick={() =>
                                    document
                                        .getElementById(
                                            "panFile"
                                        )
                                        ?.click()
                                }
                             component="div">

                                <MuiText className="upload-icon" component="span" variant="inherit">
                                    ☁
                                </MuiText>

                                <MuiText component="span" variant="inherit">
                                    {form.panFile?.name ||
                                        "Upload PAN Card"}
                                </MuiText>

                                <MuiText component="small" variant="caption">
                                    Drop file or click to browse · PDF, DOCX (Max. 2MB)
                                </MuiText>

                            </MuiActionButton>

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

                            <MuiText
    className={`document-item-status ${getStatusClass(
        getStatus("PAN")
    )}`}
    title={
        getStatus("PAN").toLowerCase() === "rejected"
            ? getRejectionReason("PAN")
            : ""
    }
 component="span" variant="inherit">
    {getStatus("PAN")}
</MuiText>

                        </MuiLayoutBox>

                    </MuiLayoutBox>
                </MuiLayoutBox>

                {/* ================= PF / Employment ================= */}

                <MuiLayoutBox className="document-card" component="div">

                    <MuiLayoutBox className="document-card-header" component="div">
                        <MuiText component="h3" variant="h6">
                            💼 PF / Employment Details
                        </MuiText>
                    </MuiLayoutBox>

                    <MuiLayoutBox className="document-card-body" component="div">

                        {/* UAN */}

                        <MuiLayoutBox className="document-field" component="div">

                            <MuiLayoutBox component="label">
                                EPFO / UAN Number (optional)
                            </MuiLayoutBox>

                            <MuiInputMigration
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

                        </MuiLayoutBox>

                        <MuiText className="document-helper-copy" component="p" variant="body2">
                            Your UAN helps HR maintain your provident fund and employment records.
                        </MuiText>

                    </MuiLayoutBox>
                </MuiLayoutBox>

                {/* ================= Bank Details ================= */}

                <MuiLayoutBox className="document-card" component="div">

                    <MuiLayoutBox className="document-card-header" component="div">
                        <MuiText component="h3" variant="h6">
                            🏦 Bank Details
                        </MuiText>
                    </MuiLayoutBox>

                    <MuiLayoutBox className="document-card-body" component="div">

                        {/* Bank Name */}

                        <MuiLayoutBox className="document-field" component="div">

                            <MuiLayoutBox component="label">
                                Bank Name <MuiText className="required-star" component="span" variant="inherit">*</MuiText>
                            </MuiLayoutBox>

                            <MuiInputMigration
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

                        </MuiLayoutBox>

                        {/* Account Number */}

                        <MuiLayoutBox className="document-field" component="div">

                            <MuiLayoutBox component="label">
                                Account Number
                            </MuiLayoutBox>

<MuiInputMigration
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

                        </MuiLayoutBox>

                        {/* IFSC */}

                        <MuiLayoutBox className="document-field" component="div">

                            <MuiLayoutBox component="label">
                                IFSC Code
                            </MuiLayoutBox>

                            <MuiInputMigration
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

                        </MuiLayoutBox>

                        {/* Account Type */}

                        <MuiLayoutBox className="document-field" component="div">

                            <MuiLayoutBox component="label">
                                Account Type
                            </MuiLayoutBox>

                            <Select
                                className="bank-account-select"
                                variant="outlined"
                                size="small"
                                value={
                                    form.accountType
                                }
                                onChange={(e) =>
                                    handleInputChange(
                                        "accountType",
                                        e.target.value
                                    )
                                }
                                MenuProps={{
                                    PaperProps: {
                                        sx: {
                                            mt: 0.75,
                                            border: "1px solid #dce6f3",
                                            borderRadius: "12px",
                                            boxShadow: "0 12px 28px rgba(25, 55, 100, 0.14)",
                                            "& .MuiMenuItem-root": { minHeight: 40, mx: 0.75, borderRadius: "8px" },
                                            "& .MuiMenuItem-root.Mui-selected": { backgroundColor: "#edf4ff", color: "#245bd6" },
                                        },
                                    },
                                }}
                            >

                                <MenuItem value="Savings">
                                    Savings
                                </MenuItem>

                                <MenuItem value="Current">
                                    Current
                                </MenuItem>

                            </Select>

                        </MuiLayoutBox>

                        {/* Cancelled Cheque */}

                        <MuiLayoutBox className="document-field" component="div">

                            <MuiLayoutBox component="label">
                                Cancelled Cheque / Passbook
                            </MuiLayoutBox>

                            <MuiActionButton
                                className={`upload-box${isDragging("bankFile") ? " is-dragging" : ""}`}
                                {...getDropProps("bankFile")}
                                role="button"
                                tabIndex={0}
                                onKeyDown={handleDropKeyDown("bankFile", "bankFile")}
                                onClick={() =>
                                    document
                                        .getElementById(
                                            "bankFile"
                                        )
                                        ?.click()
                                }
                             component="div">

                                <MuiText className="upload-icon" component="span" variant="inherit">
                                    ☁
                                </MuiText>

                                <MuiText component="span" variant="inherit">
                                    {form.bankFile?.name ||
                                        "Upload Document"}
                                </MuiText>

                                <MuiText component="small" variant="caption">
                                    Drop file or click to browse · PDF, DOCX (Max. 2MB)
                                </MuiText>

                            </MuiActionButton>

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

                        </MuiLayoutBox>

                    </MuiLayoutBox>
                </MuiLayoutBox>

                {/* ================= Other Documents ================= */}

                <MuiLayoutBox className="document-card" component="div">

                    <MuiLayoutBox className="document-card-header" component="div">
                        <MuiText component="h3" variant="h6">
                            📁 Other Documents
                        </MuiText>
                    </MuiLayoutBox>

                    <MuiLayoutBox className="other-documents" component="div">

                        {/* Passport */}
                        <MuiLayoutBox className={`other-document-row${isDragging("passportFile") ? " is-dragging" : ""}`} {...getDropProps("passportFile")} component="div">
                            <MuiText component="span" variant="inherit">Passport</MuiText>

                            <MuiLayoutBox className="other-document-status-area" component="div">
<RejectionStatus type="Passport" />

                                {getFileInfo("Passport").name && (
                                    <MuiText
                                        className="other-document-file-info"
                                        title={getFileInfo("Passport").name}
                                     component="span" variant="inherit">
                                        <MuiText className="other-document-file-name" component="span" variant="inherit">
                                            {getFileInfo("Passport").name}
                                        </MuiText>
                                        {getFileInfo("Passport").size && (
                                            <MuiText className="other-document-file-size" component="span" variant="inherit">
                                                {getFileInfo("Passport").size}
                                            </MuiText>
                                        )}
                                    </MuiText>
                                )}
                            </MuiLayoutBox>

                            <MuiLayoutBox className="upload-button"  component="label">
                                ☁ Upload
                                <input
                                    type="file"
                                    accept=".docs,.docx,.pdf"
                                    onChange={(e) =>
                                        handleFileChange("passportFile", e)
                                    }
                                />
                            </MuiLayoutBox>
                        </MuiLayoutBox>

                        {/* Driving License */}
                        <MuiLayoutBox className={`other-document-row${isDragging("drivingLicenseFile") ? " is-dragging" : ""}`} {...getDropProps("drivingLicenseFile")} component="div">
                            <MuiText component="span" variant="inherit">Driving License</MuiText>

                            <MuiLayoutBox className="other-document-status-area" component="div">
<RejectionStatus type="Driving License" />

                                {getFileInfo("Driving License").name && (
                                    <MuiText
                                        className="other-document-file-info"
                                        title={getFileInfo("Driving License").name}
                                     component="span" variant="inherit">
                                        <MuiText className="other-document-file-name" component="span" variant="inherit">
                                            {getFileInfo("Driving License").name}
                                        </MuiText>
                                        {getFileInfo("Driving License").size && (
                                            <MuiText className="other-document-file-size" component="span" variant="inherit">
                                                {getFileInfo("Driving License").size}
                                            </MuiText>
                                        )}
                                    </MuiText>
                                )}
                            </MuiLayoutBox>

                            <MuiLayoutBox className="upload-button"  component="label">
                                ☁ Upload
                                <input
                                    type="file"
                                    accept=".docs,.docx,.pdf"
                                    onChange={(e) =>
                                        handleFileChange("drivingLicenseFile", e)
                                    }
                                />
                            </MuiLayoutBox>
                        </MuiLayoutBox>

                        {/* Education Certificate */}
                        <MuiLayoutBox className={`other-document-row${isDragging("educationFile") ? " is-dragging" : ""}`} {...getDropProps("educationFile")} component="div">
                            <MuiText component="span" variant="inherit">
                                Education Certificate <MuiText className="required-star" component="span" variant="inherit">*</MuiText>
                            </MuiText>

                            <MuiLayoutBox className="other-document-status-area" component="div">
<RejectionStatus type="Education Certificate" />

                                {getFileInfo("Education Certificate").name && (
                                    <MuiText
                                        className="other-document-file-info"
                                        title={getFileInfo("Education Certificate").name}
                                     component="span" variant="inherit">
                                        <MuiText className="other-document-file-name" component="span" variant="inherit">
                                            {getFileInfo("Education Certificate").name}
                                        </MuiText>
                                        {getFileInfo("Education Certificate").size && (
                                            <MuiText className="other-document-file-size" component="span" variant="inherit">
                                                {getFileInfo("Education Certificate").size}
                                            </MuiText>
                                        )}
                                    </MuiText>
                                )}
                            </MuiLayoutBox>

                            <MuiLayoutBox className="upload-button"  component="label">
                                ☁ Upload
                                <input
                                    type="file"
                                    accept=".docs,.docx,.pdf"
                                    onChange={(e) =>
                                        handleFileChange("educationFile", e)
                                    }
                                />
                            </MuiLayoutBox>
                        </MuiLayoutBox>

                        {/* Experience Certificate */}
                        <MuiLayoutBox className={`other-document-row${isDragging("experienceFile") ? " is-dragging" : ""}`} {...getDropProps("experienceFile")} component="div">
                            <MuiText component="span" variant="inherit">Experience Certificate</MuiText>

                            <MuiLayoutBox className="other-document-status-area" component="div">
<RejectionStatus type="Experience Certificate" />

                                {getFileInfo("Experience Certificate").name && (
                                    <MuiText
                                        className="other-document-file-info"
                                        title={getFileInfo("Experience Certificate").name}
                                     component="span" variant="inherit">
                                        <MuiText className="other-document-file-name" component="span" variant="inherit">
                                            {getFileInfo("Experience Certificate").name}
                                        </MuiText>
                                        {getFileInfo("Experience Certificate").size && (
                                            <MuiText className="other-document-file-size" component="span" variant="inherit">
                                                {getFileInfo("Experience Certificate").size}
                                            </MuiText>
                                        )}
                                    </MuiText>
                                )}
                            </MuiLayoutBox>

                            <MuiLayoutBox className="upload-button"  component="label">
                                ☁ Upload
                                <input
                                    type="file"
                                    accept=".docs,.docx,.pdf"
                                    onChange={(e) =>
                                        handleFileChange("experienceFile", e)
                                    }
                                />
                            </MuiLayoutBox>
                        </MuiLayoutBox>

                        {/* Other Document */}
                        <MuiLayoutBox className={`other-document-row${isDragging("otherFile") ? " is-dragging" : ""}`} {...getDropProps("otherFile")} component="div">
                            <MuiText component="span" variant="inherit">Other Document</MuiText>

                            <MuiLayoutBox className="other-document-status-area" component="div">
<RejectionStatus type="Other Document" />

                                {getFileInfo("Other Document").name && (
                                    <MuiText
                                        className="other-document-file-info"
                                        title={getFileInfo("Other Document").name}
                                     component="span" variant="inherit">
                                        <MuiText className="other-document-file-name" component="span" variant="inherit">
                                            {getFileInfo("Other Document").name}
                                        </MuiText>
                                        {getFileInfo("Other Document").size && (
                                            <MuiText className="other-document-file-size" component="span" variant="inherit">
                                                {getFileInfo("Other Document").size}
                                            </MuiText>
                                        )}
                                    </MuiText>
                                )}
                            </MuiLayoutBox>

                            <MuiLayoutBox className="upload-button"  component="label">
                                ☁ Upload
                                <input
                                    type="file"
                                    accept=".docs,.docx,.pdf"
                                    onChange={(e) =>
                                        handleFileChange("otherFile", e)
                                    }
                                />
                            </MuiLayoutBox>
                        </MuiLayoutBox>

                    </MuiLayoutBox>
                </MuiLayoutBox>

            </MuiLayoutBox>

            {/* ================= Important Note ================= */}

            <MuiLayoutBox className="document-footer" component="div">

                <MuiLayoutBox className="document-note" component="div">

                    <MuiText component="strong" variant="inherit">
                        ⓘ Important Note
                    </MuiText>

                    <MuiText component="p" variant="body1">
                        Please ensure all documents are clear
                        and valid. After submission, your
                        documents will be reviewed by HR.
                    </MuiText>

                </MuiLayoutBox>

                <MuiLayoutBox className="document-actions" component="div">

                    <MuiButtonMigration
                        type="button"
                        className="save-draft-button"
                        onClick={saveDraft}
                        disabled={saving}
                    >
                        {saving
                            ? "Saving..."
                            : "Save Draft"}
                    </MuiButtonMigration>

                    <MuiButtonMigration
                        type="button"
                        className="submit-document-button"
                        onClick={submitDocuments}
                        disabled={saving}
                    >
                        {saving
                            ? "Submitting..."
                            : "➤ Submit for HR Approval"}
                    </MuiButtonMigration>

                </MuiLayoutBox>

            </MuiLayoutBox>

        </MuiLayoutBox>
    );
}

export default Documents;
