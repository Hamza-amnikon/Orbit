import { MuiButtonMigration, MuiTableBodyMigration, MuiTableCellMigration, MuiTableHeadMigration, MuiTableMigration, MuiTableRowMigration } from "../../components/ui/MuiCompat.jsx";
import React, {
    useEffect,
    useMemo,
    useState
} from "react";

import { loadPdf, loadXlsx } from "../../utils/exportLibraries";

import "./Approval.css";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import FileDownloadRoundedIcon from "@mui/icons-material/FileDownloadRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";


import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    IconButton,
    Typography,
    Box,
    Button,
    FormControl,
    InputAdornment,
    MenuItem,
    Select,
    TextField
} from "@mui/material";

import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../Services/api";
import { Box as MuiLayoutBox, Typography as MuiText, ButtonBase as MuiActionButton } from "@mui/material";

// ============================================================
// CENTRAL APPROVAL SERVICE
// ============================================================

const APPROVAL_API_BASE_URL =
    `${import.meta.env.VITE_APPROVAL_API_BASE_URL}/api`;

const EMPLOYEE_API_BASE_URL =
    `${import.meta.env.VITE_EMPLOYEE_API_BASE_URL}/api/Employee`;

// ============================================================
// APPROVAL PAGE
// ============================================================

const Approval = () => {

    const navigate = useNavigate();

    const { hasPermission } = useAuth();

    const canApprove =
        hasPermission("/approvals", "approve");

    const canExport =
        hasPermission("/approvals", "export");

    const [searchParams] =
        useSearchParams();

    // ========================================================
    // STATE
    // ========================================================

    const [requests, setRequests] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [search, setSearch] =
        useState("");

    const [requestType, setRequestType] =
        useState("All");

    const [status, setStatus] =
        useState(
            searchParams.get("status") || "All"
        );

    const [date, setDate] =
        useState("");

    const [selectedRequest, setSelectedRequest] =
        useState(null);

    const [selectedStatus, setSelectedStatus] =
        useState("");

    const [profile, setProfile] =
        useState(null);

    const [leaveDocumentUrl, setLeaveDocumentUrl] =
        useState(null);

    const [leaveDocumentLoading, setLeaveDocumentLoading] =
        useState(false);

    const [hasLeaveDocument, setHasLeaveDocument] =
        useState(null);

    const [attendanceRequestDetails, setAttendanceRequestDetails] =
        useState(null);

    const [messagePrompt, setMessagePrompt] =
        useState(null);

    const showMessagePrompt = (message, severity = "info", title = "Notice") => {
        setMessagePrompt({ message, severity, title });
    };

    // EmployeeService lookup
    const [employeeMap, setEmployeeMap] =
        useState({});

    // ========================================================
    // LOAD APPROVAL REQUESTS
    // ========================================================

    useEffect(() => {
        loadApprovalRequests();
    }, []);

    const statusFromUrl = searchParams.get("status") || "All";
    useEffect(() => {
        setStatus(statusFromUrl);
    }, [statusFromUrl]);

    const loadApprovalRequests = async () => {

        try {

            setLoading(true);
            setError("");

            // ------------------------------------------------
            // Logged-in employee profile
            // ------------------------------------------------

            try {

                const profileResponse =
                    await api.get("/Auth/profile");

                const employee =
                    profileResponse.data;

                setProfile(employee);

                console.log(
                    "Logged-in Employee Profile:",
                    employee
                );

                console.log(
                    "Logged-in Employee ID:",
                    employee?.employeeId ??
                    employee?.EmployeeId ??
                    employee?.employeeID ??
                    employee?.id ??
                    employee?.Id
                );

                console.log(
                    "Logged-in Azure Employee ID:",
                    employee?.azureEmployeeId ??
                    employee?.AzureEmployeeId ??
                    employee?.azureEmployeeID ??
                    employee?.AzureEmployeeID ??
                    employee?.azureId ??
                    employee?.AzureId
                );

            } catch (profileError) {

                console.error(
                    "Profile API Error:",
                    profileError
                );

                setProfile(null);
            }

            // ------------------------------------------------
            // EmployeeService
            // ------------------------------------------------

            let employeeLookup = {};

            try {

                const token =
                    localStorage.getItem("token") ||
                    localStorage.getItem("accessToken");

                const employeeResponse =
                    await axios.get(
                        EMPLOYEE_API_BASE_URL,
                        {
                            headers: {
                                "Content-Type":
                                    "application/json",

                                ...(token
                                    ? {
                                        Authorization:
                                            `Bearer ${token}`
                                    }
                                    : {})
                            }
                        }
                    );

                const employeePayload =
                    employeeResponse.data;

                const employeeData =
                    Array.isArray(employeePayload)
                        ? employeePayload
                        : Array.isArray(employeePayload?.data)
                            ? employeePayload.data
                            : Array.isArray(employeePayload?.employees)
                                ? employeePayload.employees
                                : Array.isArray(employeePayload?.items)
                                    ? employeePayload.items
                                    : [];

                employeeData.forEach(
                    (employee) => {

                        const id =
                            Number(
                                employee?.employeeId ??
                                employee?.EmployeeId ??
                                employee?.employeeID ??
                                employee?.id ??
                                employee?.Id
                            );

                        if (
                            Number.isFinite(id) &&
                            id > 0
                        ) {

                            employeeLookup[id] =
                                employee;

                        }

                    }
                );

                setEmployeeMap(
                    employeeLookup
                );

                console.log(
                    "EmployeeService lookup loaded:",
                    employeeLookup
                );

            } catch (employeeError) {

                console.error(
                    "EmployeeService Error:",
                    employeeError
                );

                setEmployeeMap({});
            }

            // ------------------------------------------------
            // Central ApprovalService
            // ------------------------------------------------

            const approvalResponse =
                await axios.get(
                    `${APPROVAL_API_BASE_URL}/Approval/for-current-approver`
                );

            const approvalData =
                Array.isArray(
                    approvalResponse.data
                )
                    ? approvalResponse.data
                    : approvalResponse.data?.data ||
                    [];

            // ------------------------------------------------
            // Normalize requests
            // ------------------------------------------------

            const normalizedRequests =
                approvalData.map(
                    (approval) => {

                        const employeeId =
                            approval.employeeId ??
                            approval.employee?.employeeId ??
                            null;

                        const employee =
                            employeeLookup[
                                Number(employeeId)
                            ];

                        const employeeName =
                            employee?.employeeName ??
                            employee?.EmployeeName ??
                            employee?.name ??
                            employee?.Name ??
                            approval.employeeName ??
                            approval.employee?.employeeName ??
                            approval.employee?.name ??
                            (
                                employeeId
                                    ? `Employee ${employeeId}`
                                    : ""
                            );

                        return {

                            ...approval,

                            approvalRequestId:
                                approval.approvalRequestId ??
                                approval.id ??
                                null,

                            requestId:
                                approval.requestId ??
                                null,

                            employeeId,

                            employeeName,

                            requestType:
                                approval.requestType ??
                                "",

                            status:
                                approval.status ??
                                "Pending",

                            approvalLevel:
                                approval.approvalLevel ??
                                0,

                            currentApproverId:
                                approval.currentApproverId ??
                                null,

                            previousApproverId:
                                approval.previousApproverId ??
                                approval.PreviousApproverId ??
                                null,

                            requestedDate:
                                approval.requestedDate ??
                                approval.createdDate ??
                                null,

                            actionDate:
                                approval.actionDate ??
                                null
                        };

                    }
                );

            setRequests(
                normalizedRequests.filter(
                    request =>
                        String(request.requestType || "")
                            .trim()
                            .toLowerCase()
                            .includes("bill") === false
                )
            );

        } catch (err) {

            console.error(
                "Approval API Error:",
                err
            );

            const message =
                err?.response?.data?.message ||
                (
                    typeof err?.response?.data ===
                    "string"
                        ? err.response.data
                        : ""
                ) ||
                err?.message ||
                "Unable to load approval requests.";

            setError(message);
            setRequests([]);

        } finally {

            setLoading(false);

        }

    };

    // ========================================================
    // CARD REDIRECT / FILTER
    // ========================================================

    const handleCardClick = (
        selectedStatus
    ) => {

        setStatus(
            selectedStatus
        );

        navigate(
            `/approvals?status=${selectedStatus}`
        );
    };

    // ========================================================
    // CURRENT APPROVER CHECK
    // ========================================================

    const getLoggedInEmployeeId = () => {

        // ====================================================
        // 1. INTERNAL EMPLOYEE ID
        // ====================================================

        const employeeId =
            profile?.employeeId ??
            profile?.EmployeeId ??
            profile?.employeeID ??
            profile?.employee?.employeeId ??
            profile?.employee?.EmployeeId ??
            profile?.employee?.employeeID ??
            null;

        const numericEmployeeId =
            Number(employeeId);

        if (
            Number.isFinite(
                numericEmployeeId
            ) &&
            numericEmployeeId > 0
        ) {

            console.log(
                "Approval: Logged-in EmployeeId =",
                numericEmployeeId
            );

            return numericEmployeeId;
        }

        // ====================================================
        // 2. AZURE EMPLOYEE ID
        // ====================================================

        const azureEmployeeId =
            profile?.azureEmployeeId ??
            profile?.AzureEmployeeId ??
            profile?.azureEmployeeID ??
            profile?.AzureEmployeeID ??
            profile?.azureId ??
            profile?.AzureId ??
            profile?.employee?.azureEmployeeId ??
            profile?.employee?.AzureEmployeeId ??
            profile?.employee?.azureEmployeeID ??
            profile?.employee?.AzureEmployeeID ??
            null;

        if (!azureEmployeeId) {

            console.warn(
                "Approval: No EmployeeId or AzureEmployeeId found in profile.",
                profile
            );

            return null;
        }

        const normalizedAzureId =
            String(
                azureEmployeeId
            )
                .trim()
                .toLowerCase();

        // ====================================================
        // 3. AZURE ID → INTERNAL EMPLOYEE ID
        // ====================================================

        const matchedEmployee =
            Object.values(
                employeeMap
            ).find(
                employee => {

                    const employeeAzureId =
                        employee?.azureEmployeeId ??
                        employee?.AzureEmployeeId ??
                        employee?.azureEmployeeID ??
                        employee?.AzureEmployeeID ??
                        employee?.azureId ??
                        employee?.AzureId ??
                        null;

                    return (
                        employeeAzureId &&
                        String(
                            employeeAzureId
                        )
                            .trim()
                            .toLowerCase() ===
                        normalizedAzureId
                    );

                }
            );

        if (!matchedEmployee) {

            console.warn(
                "Approval: Azure Employee ID was not found in EmployeeService.",
                azureEmployeeId
            );

            return null;
        }

        const resolvedEmployeeId =
            Number(
                matchedEmployee?.employeeId ??
                matchedEmployee?.EmployeeId ??
                matchedEmployee?.employeeID ??
                matchedEmployee?.Id
            );

        if (
            !Number.isFinite(
                resolvedEmployeeId
            ) ||
            resolvedEmployeeId <= 0
        ) {

            console.warn(
                "Approval: Could not resolve internal EmployeeId.",
                matchedEmployee
            );

            return null;
        }

        console.log(
            "Approval: Azure EmployeeId",
            azureEmployeeId,
            "→ EmployeeId",
            resolvedEmployeeId
        );

        return resolvedEmployeeId;
    };

    const isCurrentApprover = (
        request
    ) => {

        const loggedInEmployeeId =
            getLoggedInEmployeeId();

        const currentApproverId =
            Number(
                request?.currentApproverId
            );

        return (
            loggedInEmployeeId !== null &&
            Number.isFinite(
                currentApproverId
            ) &&
            currentApproverId > 0 &&
            loggedInEmployeeId ===
            currentApproverId
        );
    };

    // ========================================================
    // VISIBLE REQUESTS
    // ========================================================

    const visibleRequests =
        useMemo(() => {

            const loggedInEmployeeId =
                getLoggedInEmployeeId();

            if (!loggedInEmployeeId) {
                return [];
            }

            return requests.filter(
                request => {

                    const currentApproverId =
                        Number(
                            request.currentApproverId
                        );

                    const previousApproverId =
                        Number(
                            request.previousApproverId
                        );

                    return (
                        currentApproverId ===
                        Number(
                            loggedInEmployeeId
                        ) ||
                        previousApproverId ===
                        Number(
                            loggedInEmployeeId
                        )
                    );

                }
            );

        }, [
            requests,
            profile,
            employeeMap
        ]);

    const isPreviousApprover = (
        request
    ) => {

        const loggedInEmployeeId =
            getLoggedInEmployeeId();

        const previousApproverId =
            Number(
                request?.previousApproverId
            );

        const currentApproverId =
            Number(
                request?.currentApproverId
            );

        return (
            loggedInEmployeeId !== null &&
            Number.isFinite(
                previousApproverId
            ) &&
            previousApproverId > 0 &&
            loggedInEmployeeId ===
            previousApproverId &&
            loggedInEmployeeId !==
            currentApproverId
        );
    };

    // ========================================================
    // STATISTICS
    // ========================================================

    const statistics =
        useMemo(() => {

            const pending =
                visibleRequests.filter(
                    request =>
                        String(
                            request.status || ""
                        ).toLowerCase() ===
                        "pending"
                ).length;

            const approved =
                visibleRequests.filter(
                    request =>
                        String(
                            request.status || ""
                        ).toLowerCase() ===
                        "approved"
                ).length;

            const rejected =
                visibleRequests.filter(
                    request =>
                        String(
                            request.status || ""
                        ).toLowerCase() ===
                        "rejected"
                ).length;

            return {
                pending,
                approved,
                rejected,
                total:
                    visibleRequests.length
            };

        }, [
            visibleRequests
        ]);

    // ========================================================
    // REQUEST TYPES
    // ========================================================

    const requestTypes =
        useMemo(() => {

            const types =
                visibleRequests
                    .map(
                        request =>
                            request.requestType
                    )
                    .filter(Boolean);

            return [
                ...new Set(types)
            ];

        }, [
            visibleRequests
        ]);

    // ========================================================
    // FILTER
    // ========================================================

    const filteredRequests =
        useMemo(() => {

            return visibleRequests.filter(
                request => {

                    const employeeName =
                        request.employeeName ||
                        "";

                    const employeeId =
                        request.employeeId ||
                        "";

                    const approvalRequestId =
                        request.approvalRequestId ||
                        "";

                    const requestId =
                        request.requestId ||
                        "";

                    const requestTypeValue =
                        request.requestType ||
                        "";

                    const statusValue =
                        request.status ||
                        "";

                    const searchText =
                        search
                            .trim()
                            .toLowerCase();

                    const matchesSearch =
                        !searchText ||
                        employeeName
                            .toLowerCase()
                            .includes(
                                searchText
                            ) ||
                        String(
                            employeeId
                        )
                            .toLowerCase()
                            .includes(
                                searchText
                            ) ||
                        String(
                            approvalRequestId
                        )
                            .toLowerCase()
                            .includes(
                                searchText
                            ) ||
                        String(
                            requestId
                        )
                            .toLowerCase()
                            .includes(
                                searchText
                            ) ||
                        requestTypeValue
                            .toLowerCase()
                            .includes(
                                searchText
                            );

                    const matchesRequestType =
                        requestType ===
                            "All" ||
                        requestTypeValue ===
                            requestType;

                    const matchesStatus =
                        status === "All" ||
                        String(
                            statusValue
                        ).toLowerCase() ===
                        status.toLowerCase();

                    const appliedDate =
                        request.requestedDate ||
                        request.createdDate ||
                        "";

                    const matchesDate =
                        !date ||
                        String(
                            appliedDate
                        ).startsWith(date);

                    return (
                        matchesSearch &&
                        matchesRequestType &&
                        matchesStatus &&
                        matchesDate
                    );

                }
            );

        }, [
            visibleRequests,
            search,
            requestType,
            status,
            date
        ]);

    // ========================================================
    // DATE FORMAT
    // ========================================================

    const formatDate = (
        value
    ) => {

        if (!value) {
            return "—";
        }

        const parsedDate =
            new Date(value);

        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {
            return value;
        }

        return parsedDate.toLocaleDateString(
            "en-GB",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    };

    // ========================================================
    // STATUS CLASS
    // ========================================================

    const getStatusClass = (
        value
    ) => {

        const currentStatus =
            String(
                value || ""
            ).toLowerCase();

        if (
            currentStatus ===
            "pending"
        ) {
            return "pending";
        }

        if (
            currentStatus ===
            "approved"
        ) {
            return "approved";
        }

        if (
            currentStatus ===
            "rejected"
        ) {
            return "rejected";
        }

        return "";
    };

    // ========================================================
    // EMPLOYEE NAME
    // ========================================================

    const getEmployeeName = (
        request
    ) => {

        const employeeId =
            Number(
                request?.employeeId ??
                request?.employee?.employeeId
            );

        const employee =
            Number.isFinite(
                employeeId
            ) &&
            employeeId > 0
                ? employeeMap[
                    employeeId
                ]
                : null;

        return (
            employee?.employeeName ||
            employee?.EmployeeName ||
            employee?.name ||
            employee?.Name ||
            request?.employeeName ||
            request?.employee?.employeeName ||
            request?.employee?.name ||
            (
                Number.isFinite(
                    employeeId
                ) &&
                employeeId > 0
                    ? `Employee ${employeeId}`
                    : "—"
            )
        );
    };

    // ========================================================
    // AZURE EMPLOYEE ID
    // ========================================================
    // NEW:
    // Azure employee identifiers are retained for internal matching and exports.
    // Does not change approval logic.
    // ========================================================

    const getAzureEmployeeId = (
        request
    ) => {

        const employeeId =
            Number(
                request?.employeeId ??
                request?.employee?.employeeId
            );

        const employee =
            Number.isFinite(
                employeeId
            ) &&
            employeeId > 0
                ? employeeMap[
                    employeeId
                ]
                : null;

        return (
            employee?.azureEmployeeId ??
            employee?.AzureEmployeeId ??
            employee?.azureEmployeeID ??
            employee?.AzureEmployeeID ??
            employee?.azureId ??
            employee?.AzureId ??
            request?.azureEmployeeId ??
            request?.AzureEmployeeId ??
            request?.azureEmployeeID ??
            request?.AzureEmployeeID ??
            "—"
        );
    };

    // ========================================================
    // OPEN APPROVAL ACTION
    // ========================================================

    const openStatusPopup = (
        request,
        requestedStatus
    ) => {

        setSelectedRequest(
            request
        );

        setSelectedStatus(
            requestedStatus
        );

        loadLeaveDocumentForView(
            request
        );

    };

    // ========================================================
    // CENTRAL APPROVE / REJECT
    // ========================================================

    const updateStatus =
        async () => {

            if (!selectedRequest) {
                return;
            }

            if (
                selectedStatus ===
                "Approved" &&
                !canApprove
            ) {

                showMessagePrompt(
                    "You do not have permission to approve this request.",
                    "error",
                    "Approval unavailable"
                );

                return;
            }

            const approvalRequestId =
                selectedRequest.approvalRequestId ||
                selectedRequest.id;

            if (!approvalRequestId) {

                showMessagePrompt(
                    "Approval Request ID was not found.",
                    "warning",
                    "Request unavailable"
                );

                return;
            }

            const loggedInEmployeeId =
                getLoggedInEmployeeId();

            if (!loggedInEmployeeId) {

                showMessagePrompt(
                    "Logged-in employee ID was not found. Please log in again.",
                    "error",
                    "Sign-in required"
                );

                return;
            }

            const currentApproverId =
                Number(
                    selectedRequest.currentApproverId
                );

            if (
                !Number.isFinite(
                    currentApproverId
                ) ||
                currentApproverId <= 0
            ) {

                showMessagePrompt(
                    "Current approver ID was not found for this request.",
                    "warning",
                    "Approver unavailable"
                );

                return;
            }

            if (
                loggedInEmployeeId !==
                currentApproverId
            ) {

                showMessagePrompt(
                    `You are not the current approver for this request.\n\n` +
                    `Current Approver ID: ${currentApproverId}\n` +
                    `Your Employee ID: ${loggedInEmployeeId}`,
                    "warning",
                    "Approval not assigned to you"
                );

                return;
            }

            try {

                const token =
                    localStorage.getItem("token") ||
                    localStorage.getItem(
                        "accessToken"
                    );

                const authHeaders = {
                    "Content-Type":
                        "application/json",

                    ...(token
                        ? {
                            Authorization:
                                `Bearer ${token}`
                        }
                        : {})
                };

                // ------------------------------------------------
                // APPROVE
                // ------------------------------------------------

                if (
                    selectedStatus ===
                    "Approved"
                ) {

                    await axios.put(
                        `${APPROVAL_API_BASE_URL}/Approval/${approvalRequestId}/approve`,
                        {
                            approverId:
                                loggedInEmployeeId
                        },
                        {
                            headers:
                                authHeaders
                        }
                    );

                }

                // ------------------------------------------------
                // REJECT
                // ------------------------------------------------

                else if (
                    selectedStatus ===
                    "Rejected"
                ) {

                    await axios.put(
                        `${APPROVAL_API_BASE_URL}/Approval/${approvalRequestId}/reject`,
                        {
                            approverId:
                                loggedInEmployeeId
                        },
                        {
                            headers:
                                authHeaders
                        }
                    );

                }

                else {

                    showMessagePrompt(
                        "Invalid approval status.",
                        "error",
                        "Unable to update request"
                    );

                    return;
                }

                showMessagePrompt(
                    selectedStatus ===
                        "Approved"
                        ? "Request approved successfully."
                        : "Request rejected successfully.",
                    "success",
                    "Request updated"
                );

                setSelectedRequest(
                    null
                );

                setSelectedStatus(
                    ""
                );

                await loadApprovalRequests();

            } catch (error) {

                console.error(
                    "Update Approval Status Error:",
                    error
                );

                const message =
                    error?.response?.data?.message ||
                    (
                        typeof error?.response?.data ===
                        "string"
                            ? error.response.data
                            : ""
                    ) ||
                    error?.message ||
                    "Unable to update approval status.";

                showMessagePrompt(message, "error", "Update failed");
            }
        };

    // ========================================================
    // LEAVE DOCUMENT
    // ========================================================

    const getLeaveIdFromApprovalRequest =
        (request) => {

            return (
                request?.requestId ??
                request?.leaveId ??
                request?.LeaveId ??
                request?.entityId ??
                request?.entityID ??
                null
            );
        };

    const loadLeaveDocumentForView =
        async (
            request
        ) => {

            const requestType =
                String(
                    request?.requestType ||
                    ""
                )
                    .trim()
                    .toLowerCase();

            if (
                requestType !==
                "leave"
            ) {

                setHasLeaveDocument(
                    false
                );

                return;
            }

            const leaveId =
                getLeaveIdFromApprovalRequest(
                    request
                );

            if (!leaveId) {

                setHasLeaveDocument(
                    false
                );

                return;
            }

            try {

                setLeaveDocumentLoading(
                    true
                );

                setHasLeaveDocument(
                    null
                );

                const token =
                    localStorage.getItem(
                        "token"
                    ) ||
                    localStorage.getItem(
                        "accessToken"
                    );

const response =
    await axios.get(
        `${import.meta.env.VITE_LEAVE_API_BASE_URL}/api/Leave/${leaveId}/document`,
        {
                            responseType:
                                "blob",

                            headers: {
                                ...(token
                                    ? {
                                        Authorization:
                                            `Bearer ${token}`
                                    }
                                    : {})
                            }
                        }
                    );

                const blobUrl =
                    window.URL.createObjectURL(
                        new Blob(
                            [response.data],
                            {
                                type:
                                    response.headers?.[
                                        "content-type"
                                    ] ||
                                    "application/octet-stream"
                            }
                        )
                    );

                setLeaveDocumentUrl(
                    blobUrl
                );

                setHasLeaveDocument(
                    true
                );

            } catch (error) {

                if (
                    error?.response?.status !==
                    404
                ) {

                    console.error(
                        "Unable to check leave supporting document:",
                        error
                    );

                }

                setHasLeaveDocument(
                    false
                );

            } finally {

                setLeaveDocumentLoading(
                    false
                );

            }
        };

    const handleViewLeaveDocument =
        () => {

            if (
                !leaveDocumentUrl
            ) {
                return;
            }

            window.open(
                leaveDocumentUrl,
                "_blank",
                "noopener,noreferrer"
            );
        };

    // ========================================================
    // VIEW REQUEST
    // ========================================================

    const handleView =
        async (request) => {

            setSelectedStatus(
                ""
            );

            if (
                leaveDocumentUrl
            ) {

                window.URL.revokeObjectURL(
                    leaveDocumentUrl
                );
            }

            setLeaveDocumentUrl(
                null
            );

            setHasLeaveDocument(
                null
            );

            setSelectedRequest(
                request
            );

            setAttendanceRequestDetails(null);

            if (String(request?.requestType || "").toLowerCase().includes("attendance regularization")) {
                try {
                    const attendanceApi = import.meta.env.VITE_ATTENDANCE_API_BASE_URL;
                    const detailResponse = await axios.get(
                        `${attendanceApi}/api/Attendance/regularization-requests/${request.requestId}`
                    );
                    setAttendanceRequestDetails(detailResponse.data);
                } catch (detailError) {
                    console.error("Unable to load attendance regularization details:", detailError);
                    setAttendanceRequestDetails({ loadError: "Request details could not be loaded." });
                }
            }

            loadLeaveDocumentForView(
                request
            );

        };

    const handleCloseDetails =
        () => {

            if (
                leaveDocumentUrl
            ) {

                window.URL.revokeObjectURL(
                    leaveDocumentUrl
                );
            }

            setLeaveDocumentUrl(
                null
            );

            setHasLeaveDocument(
                null
            );

            setSelectedRequest(
                null
            );

            setAttendanceRequestDetails(null);
        };

    // ========================================================
    // EXPORT
    // ========================================================

    const handleExport =
        async () => {

            if (
                !filteredRequests ||
                filteredRequests.length === 0
            ) {

                showMessagePrompt(
                    "There are no approval requests available to export.",
                    "info",
                    "Nothing to export"
                );

                return;
            }

            const [{ jsPDF, autoTable }, XLSX] = await Promise.all([
                loadPdf(),
                loadXlsx(),
            ]);

            const exportData =
                filteredRequests.map(
                    request => ({

                        "Approval Request ID":
                            request.approvalRequestId ||
                            "",

                        "Request ID":
                            request.requestId ||
                            "",

                        "Employee ID":
                            request.employeeId ||
                            "",

                        "Azure Employee ID":
                            getAzureEmployeeId(
                                request
                            ),

                        "Employee Name":
                            getEmployeeName(
                                request
                            ),

                        "Request Type":
                            request.requestType ||
                            "",

                        "Approval Level":
                            request.approvalLevel ||
                            "",

                        "Current Approver ID":
                            request.currentApproverId ||
                            "",

                        "Requested On":
                            formatDate(
                                request.requestedDate
                            ),

                        "Action Date":
                            formatDate(
                                request.actionDate
                            ),

                        "Status":
                            request.status ||
                            ""

                    })
                );

            const worksheet =
                XLSX.utils.json_to_sheet(
                    exportData
                );

            const workbook =
                XLSX.utils.book_new();

            XLSX.utils.book_append_sheet(
                workbook,
                worksheet,
                "Approval Requests"
            );

            worksheet["!cols"] = [
                { wch: 20 },
                { wch: 14 },
                { wch: 14 },
                { wch: 25 },
                { wch: 25 },
                { wch: 18 },
                { wch: 16 },
                { wch: 20 },
                { wch: 18 },
                { wch: 18 },
                { wch: 14 }
            ];

            XLSX.writeFile(
                workbook,
                "Approval_Requests.xlsx"
            );

            // ------------------------------------------------
            // PDF
            // ------------------------------------------------

            const pdf =
                new jsPDF({
                    orientation:
                        "landscape",
                    unit: "mm",
                    format: "a4"
                });

            pdf.setFontSize(
                18
            );

            pdf.text(
                "Approval Requests",
                14,
                15
            );

            pdf.setFontSize(
                10
            );

            pdf.text(
                `Total Requests: ${filteredRequests.length}`,
                14,
                22
            );

            const headers = [[
                "Approval ID",
                "Request ID",
                "Employee ID",
                "Azure Employee ID",
                "Employee Name",
                "Request Type",
                "Level",
                "Approver ID",
                "Requested On",
                "Action Date",
                "Status"
            ]];

            const rows =
                filteredRequests.map(
                    request => [

                        request.approvalRequestId ||
                        "",

                        request.requestId ||
                        "",

                        request.employeeId ||
                        "",

                        getAzureEmployeeId(
                            request
                        ),

                        getEmployeeName(
                            request
                        ),

                        request.requestType ||
                        "",

                        request.approvalLevel ||
                        "",

                        request.currentApproverId ||
                        "",

                        formatDate(
                            request.requestedDate
                        ),

                        formatDate(
                            request.actionDate
                        ),

                        request.status ||
                        ""

                    ]
                );

            autoTable(
                pdf,
                {
                    head:
                        headers,

                    body:
                        rows,

                    startY:
                        28,

                    theme:
                        "grid",

                    styles: {
                        fontSize:
                            8,

                        cellPadding:
                            3
                    },

                    headStyles: {
                        fontSize:
                            8,

                        fontStyle:
                            "bold"
                    }
                }
            );

            pdf.save(
                "Approval_Requests.pdf"
            );
        };

    // ========================================================
    // RENDER
    // ========================================================

    return (

        <MuiLayoutBox className="approval-page" component="div">

            {/* HEADER */}

            <MuiLayoutBox className="approval-header" component="div">
                <MuiLayoutBox className="approval-header-main" component="div">
                    <IconButton
                        className="approval-back-button"
                        aria-label="Go back"
                        title="Go back"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowBackRoundedIcon />
                    </IconButton>
                    <MuiLayoutBox component="div">
                        <MuiText component="h1" variant="h4">
                            Approvals
                        </MuiText>
                        <MuiText component="p" variant="body1">
                            Review and manage requests that require your approval.
                        </MuiText>
                    </MuiLayoutBox>
                </MuiLayoutBox>

                {canExport && (
                    <MuiButtonMigration
                        type="button"
                        variant="outlined"
                        startIcon={<FileDownloadRoundedIcon />}
                        className="approval-export-btn approval-header-export-btn"
                        onClick={handleExport}
                    >
                        Export
                    </MuiButtonMigration>
                )}
            </MuiLayoutBox>

            {/* SUMMARY CARDS */}

            <MuiLayoutBox className="approval-summary" component="div">

                <MuiActionButton
                    className="approval-card approval-card-clickable"
                    onClick={() =>
                        handleCardClick(
                            "Pending"
                        )
                    }
                 component="div">

                    <MuiLayoutBox className="approval-card-icon pending" component="div">
                        <AccessTimeRoundedIcon />
                    </MuiLayoutBox>

                    <MuiLayoutBox component="div">

                        <MuiText component="span" variant="inherit">
                            Pending
                        </MuiText>

                        <MuiText component="h2" variant="h5">
                            {statistics.pending}
                        </MuiText>

                        <MuiText component="small" variant="caption">
                            Requests waiting for
                            your approval
                        </MuiText>

                    </MuiLayoutBox>

                </MuiActionButton>

                <MuiActionButton
                    className="approval-card approval-card-clickable"
                    onClick={() =>
                        handleCardClick(
                            "Approved"
                        )
                    }
                 component="div">

                    <MuiLayoutBox className="approval-card-icon approved" component="div">
                        <CheckCircleRoundedIcon />
                    </MuiLayoutBox>

                    <MuiLayoutBox component="div">

                        <MuiText component="span" variant="inherit">
                            Approved
                        </MuiText>

                        <MuiText component="h2" variant="h5">
                            {statistics.approved}
                        </MuiText>

                        <MuiText component="small" variant="caption">
                            Total approved
                            requests
                        </MuiText>

                    </MuiLayoutBox>

                </MuiActionButton>

                <MuiActionButton
                    className="approval-card approval-card-clickable"
                    onClick={() =>
                        handleCardClick(
                            "Rejected"
                        )
                    }
                 component="div">

                    <MuiLayoutBox className="approval-card-icon rejected" component="div">
                        <CancelRoundedIcon />
                    </MuiLayoutBox>

                    <MuiLayoutBox component="div">

                        <MuiText component="span" variant="inherit">
                            Rejected
                        </MuiText>

                        <MuiText component="h2" variant="h5">
                            {statistics.rejected}
                        </MuiText>

                        <MuiText component="small" variant="caption">
                            Total rejected
                            requests
                        </MuiText>

                    </MuiLayoutBox>

                </MuiActionButton>

                <MuiActionButton
                    className="approval-card approval-card-clickable"
                    onClick={() =>
                        handleCardClick(
                            "All"
                        )
                    }
                 component="div">

                    <MuiLayoutBox className="approval-card-icon total" component="div">
                        <FolderRoundedIcon />
                    </MuiLayoutBox>

                    <MuiLayoutBox component="div">

                        <MuiText component="span" variant="inherit">
                            Total Requests
                        </MuiText>

                        <MuiText component="h2" variant="h5">
                            {statistics.total}
                        </MuiText>

                        <MuiText component="small" variant="caption">
                            All requests
                            in the system
                        </MuiText>

                    </MuiLayoutBox>

                </MuiActionButton>

            </MuiLayoutBox>

            {/* REQUEST PANEL */}

            <MuiLayoutBox className="approval-panel" component="div">

                {/* FILTER BAR */}

                <MuiLayoutBox className="approval-filter-bar" component="div">

                    <MuiLayoutBox className="approval-search" component="div">
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Search requests..."
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            inputProps={{ "aria-label": "Search approval requests" }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchRoundedIcon />
                                    </InputAdornment>
                                )
                            }}
                        />
                    </MuiLayoutBox>

                    <MuiLayoutBox className="approval-filter-control" component="div">
                        <MuiText className="approval-filter-label" component="label" htmlFor="approval-request-type" variant="caption">
                            Request Type
                        </MuiText>
                        <FormControl className="approval-select" size="small" fullWidth>
                            <Select
                                id="approval-request-type"
                                value={requestType}
                                onChange={(event) => setRequestType(event.target.value)}
                            >
                                <MenuItem value="All">All types</MenuItem>
                                {requestTypes.map((type) => (
                                    <MenuItem key={type} value={type}>{type}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </MuiLayoutBox>

                    <MuiLayoutBox className="approval-filter-control" component="div">
                        <MuiText className="approval-filter-label" component="label" htmlFor="approval-status" variant="caption">
                            Status
                        </MuiText>
                        <FormControl className="approval-select" size="small" fullWidth>
                            <Select
                                id="approval-status"
                                value={status}
                                onChange={(event) => {
                                    const selectedStatus = event.target.value;
                                    setStatus(selectedStatus);
                                    navigate(`/approvals?status=${selectedStatus}`);
                                }}
                            >
                                <MenuItem value="All">All statuses</MenuItem>
                                <MenuItem value="Pending">Pending</MenuItem>
                                <MenuItem value="Approved">Approved</MenuItem>
                                <MenuItem value="Rejected">Rejected</MenuItem>
                            </Select>
                        </FormControl>
                    </MuiLayoutBox>

                    <MuiLayoutBox className="approval-filter-control" component="div">
                        <MuiText className="approval-filter-label" component="label" htmlFor="approval-date-input" variant="caption">
                            Date Range
                        </MuiText>
                        <TextField
                            id="approval-date-input"
                            className="approval-date"
                            type="date"
                            size="small"
                            fullWidth
                            value={date}
                            onChange={(event) => setDate(event.target.value)}
                            inputProps={{ "aria-label": "Filter by request date" }}
                        />
                    </MuiLayoutBox>

                </MuiLayoutBox>

                {/* TABLE */}

                <MuiLayoutBox className="approval-table-wrapper" component="div">

                    <MuiTableMigration className="approval-table">

                        <MuiTableHeadMigration>

                            <MuiTableRowMigration>

                                <MuiTableCellMigration>
                                    Employee
                                </MuiTableCellMigration>

                                <MuiTableCellMigration>
                                    Request Type
                                </MuiTableCellMigration>

                                <MuiTableCellMigration>
                                    From Date
                                </MuiTableCellMigration>

                                <MuiTableCellMigration>
                                    To Date
                                </MuiTableCellMigration>

                                <MuiTableCellMigration>
                                    Applied On
                                </MuiTableCellMigration>

                                <MuiTableCellMigration>
                                    Status
                                </MuiTableCellMigration>

                                <MuiTableCellMigration>
                                    Action
                                </MuiTableCellMigration>

                            </MuiTableRowMigration>

                        </MuiTableHeadMigration>

                        <MuiTableBodyMigration>

                            {loading && (

                                <MuiTableRowMigration>

                                    <MuiTableCellMigration
                                        colSpan="7"
                                        className="approval-message"
                                    >
                                        Loading approval requests...
                                    </MuiTableCellMigration>

                                </MuiTableRowMigration>

                            )}

                            {!loading &&
                                error && (

                                    <MuiTableRowMigration>

                                        <MuiTableCellMigration
                                            colSpan="7"
                                            className="approval-message error"
                                        >
                                            {error}
                                        </MuiTableCellMigration>

                                    </MuiTableRowMigration>

                                )}

                            {!loading &&
                                !error &&
                                filteredRequests.length === 0 && (

                                    <MuiTableRowMigration>

                                        <MuiTableCellMigration
                                            colSpan="7"
                                            className="approval-message"
                                        >
                                            No approval requests found.
                                        </MuiTableCellMigration>

                                    </MuiTableRowMigration>

                                )}

                            {!loading &&
                                !error &&
                                filteredRequests.map(
                                    request => {

                                        const employeeName =
                                            getEmployeeName(
                                                request
                                            );

                                        return (

                                            <MuiTableRowMigration
                                                key={
                                                    request.approvalRequestId ||
                                                    request.requestId ||
                                                    request.id
                                                }
                                                className={
                                                    isPreviousApprover(
                                                        request
                                                    )
                                                        ? "approval-row-escalated"
                                                        : ""
                                                }
                                                title={
                                                    isPreviousApprover(
                                                        request
                                                    )
                                                        ? "This request was escalated to another approver. You can view it, but you can no longer approve or reject it."
                                                        : undefined
                                                }
                                            >

                                                {/* Employee */}

                                                <MuiTableCellMigration>

                                                    <MuiLayoutBox className="approval-employee" component="div">

                                                        <MuiLayoutBox className="approval-avatar" component="div">

                                                            {String(
                                                                employeeName
                                                            )
                                                                .charAt(
                                                                    0
                                                                )
                                                                .toUpperCase()}

                                                        </MuiLayoutBox>

                                                        <MuiLayoutBox component="div">

                                                            <MuiText component="strong" variant="inherit">
                                                                {employeeName}
                                                            </MuiText>

                                                        </MuiLayoutBox>

                                                    </MuiLayoutBox>

                                                </MuiTableCellMigration>

                                                <MuiTableCellMigration>

                                                    {request.requestType ||
                                                        "—"}

                                                </MuiTableCellMigration>

                                                <MuiTableCellMigration>

                                                    {formatDate(
                                                        request.fromDate
                                                    )}

                                                </MuiTableCellMigration>

                                                <MuiTableCellMigration>

                                                    {formatDate(
                                                        request.toDate
                                                    )}

                                                </MuiTableCellMigration>

                                                <MuiTableCellMigration>

                                                    {formatDate(
                                                        request.requestedDate
                                                    )}

                                                </MuiTableCellMigration>

                                                <MuiTableCellMigration>

                                                    <MuiText
                                                        className={
                                                            `approval-status ${getStatusClass(
                                                                request.status
                                                            )}`
                                                        }
                                                     component="span" variant="inherit">

                                                        {request.status ||
                                                            "—"}

                                                    </MuiText>

                                                </MuiTableCellMigration>

                                                <MuiTableCellMigration>

                                                    <MuiLayoutBox className="approval-actions" component="div">

                                                        {String(
                                                            request.status ||
                                                            ""
                                                        ).toLowerCase() ===
                                                            "pending" && (

                                                            <>

                                                                {canApprove && (

                                                                    <MuiButtonMigration
                                                                        type="button"
                                                                        className="approval-approve-btn"
                                                                        disabled={
                                                                            !isCurrentApprover(
                                                                                request
                                                                            ) ||
                                                                            isPreviousApprover(
                                                                                request
                                                                            )
                                                                        }
                                                                        title={
                                                                            !isCurrentApprover(
                                                                                request
                                                                            )
                                                                                ? `Current approver is Employee ${request.currentApproverId ?? "—"}`
                                                                                : "Approve request"
                                                                        }
                                                                        onClick={() =>
                                                                            openStatusPopup(
                                                                                request,
                                                                                "Approved"
                                                                            )
                                                                        }
                                                                    >
                                                                        Approve
                                                                    </MuiButtonMigration>

                                                                )}

                                                                <MuiButtonMigration
                                                                    type="button"
                                                                    className="approval-reject-btn"
                                                                    disabled={
                                                                        !isCurrentApprover(
                                                                            request
                                                                        ) ||
                                                                        isPreviousApprover(
                                                                            request
                                                                        )
                                                                    }
                                                                    title={
                                                                        !isCurrentApprover(
                                                                            request
                                                                        )
                                                                            ? `Current approver is Employee ${request.currentApproverId ?? "—"}`
                                                                            : "Reject request"
                                                                    }
                                                                    onClick={() =>
                                                                        openStatusPopup(
                                                                            request,
                                                                            "Rejected"
                                                                        )
                                                                    }
                                                                >
                                                                    Reject
                                                                </MuiButtonMigration>

                                                            </>

                                                        )}

                                                        <MuiButtonMigration
                                                            type="button"
                                                            className="approval-view-btn"
                                                            onClick={() =>
                                                                handleView(
                                                                    request
                                                                )
                                                            }
                                                        >

                                                            <VisibilityRoundedIcon />

                                                            View

                                                        </MuiButtonMigration>

                                                    </MuiLayoutBox>

                                                </MuiTableCellMigration>

                                            </MuiTableRowMigration>

                                        );

                                    }
                                )}

                        </MuiTableBodyMigration>

                    </MuiTableMigration>

                </MuiLayoutBox>

                {/* FOOTER */}

                <MuiLayoutBox className="approval-footer" component="div">

                    <MuiText component="span" variant="inherit">

                        Showing{" "}

                        {
                            filteredRequests.length
                        }

                        {" "}of{" "}

                        {
                            visibleRequests.length
                        }

                        {" "}entries

                    </MuiText>

                </MuiLayoutBox>

            </MuiLayoutBox>

            {/* =================================================
                GENERIC REQUEST DETAILS
            ================================================= */}

            {selectedRequest &&
                !selectedStatus && (

                    <MuiLayoutBox className="approval-details-overlay" component="div">

                        <MuiLayoutBox className="approval-details-modal" component="div">

                            <MuiLayoutBox className="approval-details-header" component="div">

                                <MuiLayoutBox component="div">

                                    <MuiText component="h2" variant="h5">
                                        {
                                            selectedRequest.requestType ||
                                            "Request"
                                        }{" "}
                                        Details
                                    </MuiText>

                                </MuiLayoutBox>

                                <MuiButtonMigration
                                    type="button"
                                    className="approval-details-close"
                                    onClick={
                                        handleCloseDetails
                                    }
                                >
                                    ×
                                </MuiButtonMigration>

                            </MuiLayoutBox>

                            <MuiLayoutBox className="approval-details-body" component="div">

                                <MuiLayoutBox className="approval-detail-item" component="div">

                                    <MuiText component="span" variant="inherit">
                                        Request Type
                                    </MuiText>

                                    <MuiText component="strong" variant="inherit">
                                        {
                                            selectedRequest.requestType ||
                                            "—"
                                        }
                                    </MuiText>

                                </MuiLayoutBox>

                                <MuiLayoutBox className="approval-detail-item" component="div">

                                    <MuiText component="span" variant="inherit">
                                        Employee
                                    </MuiText>

                                    <MuiText component="strong" variant="inherit">
                                        {
                                            getEmployeeName(
                                                selectedRequest
                                            )
                                        }
                                    </MuiText>

                                </MuiLayoutBox>

                                <MuiLayoutBox className="approval-detail-item" component="div">
                                    <MuiText component="span" variant="inherit">From Date</MuiText>
                                    <MuiText component="strong" variant="inherit">{formatDate(selectedRequest.fromDate)}</MuiText>
                                </MuiLayoutBox>

                                <MuiLayoutBox className="approval-detail-item" component="div">
                                    <MuiText component="span" variant="inherit">To Date</MuiText>
                                    <MuiText component="strong" variant="inherit">{formatDate(selectedRequest.toDate)}</MuiText>
                                </MuiLayoutBox>

                                <MuiLayoutBox className="approval-detail-item" component="div">

                                    <MuiText component="span" variant="inherit">
                                        Requested On
                                    </MuiText>

                                    <MuiText component="strong" variant="inherit">
                                        {formatDate(
                                            selectedRequest.requestedDate
                                        )}
                                    </MuiText>

                                </MuiLayoutBox>

                                <MuiLayoutBox className="approval-detail-item" component="div">

                                    <MuiText component="span" variant="inherit">
                                        Action Date
                                    </MuiText>

                                    <MuiText component="strong" variant="inherit">
                                        {formatDate(
                                            selectedRequest.actionDate
                                        )}
                                    </MuiText>

                                </MuiLayoutBox>

                                <MuiLayoutBox className="approval-detail-item" component="div">

                                    <MuiText component="span" variant="inherit">
                                        Status
                                    </MuiText>

                                    <MuiText
                                        className={
                                            `approval-status ${getStatusClass(
                                                selectedRequest.status
                                            )}`
                                        }
                                     component="span" variant="inherit">
                                        {
                                            selectedRequest.status ||
                                            "—"
                                        }
                                    </MuiText>

                                </MuiLayoutBox>

                                {String(selectedRequest.requestType || "").toLowerCase().includes("attendance regularization") && (
                                    <MuiLayoutBox className="approval-detail-item" style={{ gridColumn: "1 / -1" }} component="div">
                                        <MuiText component="span" variant="inherit">Attendance correction</MuiText>
                                        {attendanceRequestDetails?.loadError ? (
                                            <MuiText component="strong" variant="inherit">{attendanceRequestDetails.loadError}</MuiText>
                                        ) : attendanceRequestDetails ? (
                                            <MuiLayoutBox component="div" sx={{ display: "grid", gap: 1, mt: 1 }}>
                                                <MuiText component="strong" variant="inherit">
                                                    Requested times: {String(attendanceRequestDetails.requestedCheckIn || "").slice(0, 5)} – {String(attendanceRequestDetails.requestedCheckOut || "").slice(0, 5)}
                                                </MuiText>
                                                <MuiText component="span" variant="inherit">Reason: {attendanceRequestDetails.reason || "—"}</MuiText>
                                            </MuiLayoutBox>
                                        ) : (
                                            <MuiText component="span" variant="inherit">Loading request details…</MuiText>
                                        )}
                                    </MuiLayoutBox>
                                )}

                                {/* LEAVE DOCUMENT */}

                                {String(
                                    selectedRequest.requestType ||
                                    ""
                                )
                                    .trim()
                                    .toLowerCase() ===
                                    "leave" &&
                                    hasLeaveDocument ===
                                    true && (

                                        <MuiLayoutBox
                                            className="approval-detail-item"
                                            style={{
                                                gridColumn:
                                                    "1 / -1",
                                                marginTop:
                                                    "8px"
                                            }}
                                         component="div">

                                            <MuiText component="span" variant="inherit">
                                                Supporting Document
                                            </MuiText>

                                            <MuiLayoutBox
                                                style={{
                                                    display:
                                                        "flex",
                                                    alignItems:
                                                        "center",
                                                    gap:
                                                        "10px",
                                                    marginTop:
                                                        "8px"
                                                }}
                                             component="div">

                                                <Button
                                                    type="button"
                                                    variant="outlined"
                                                    startIcon={
                                                        <VisibilityRoundedIcon />
                                                    }
                                                    onClick={
                                                        handleViewLeaveDocument
                                                    }
                                                >
                                                    View & Open Document
                                                </Button>

                                            </MuiLayoutBox>

                                        </MuiLayoutBox>

                                    )}

                            </MuiLayoutBox>

                        </MuiLayoutBox>

                    </MuiLayoutBox>

                )}

            {/* =================================================
                APPROVE / REJECT DIALOG
            ================================================= */}

            {selectedRequest &&
                selectedStatus && (

                    <Dialog
                        open={
                            Boolean(
                                selectedRequest &&
                                selectedStatus
                            )
                        }
                        onClose={() => {

                            setSelectedRequest(
                                null
                            );

                            setSelectedStatus(
                                ""
                            );

                        }}
                        fullWidth
                        maxWidth="sm"
                        aria-labelledby="approval-dialog-title"
                        PaperProps={{
                            className:
                                "approval-action-dialog-paper"
                        }}
                        slotProps={{
                            backdrop: {
                                className:
                                    "approval-action-dialog-backdrop"
                            }
                        }}
                    >

                        <DialogTitle
                            id="approval-dialog-title"
                            className="approval-action-dialog-title"
                        >

                            <Box
                                className="approval-action-dialog-title-row"
                            >

                                <Box>

                                    <Typography
                                        variant="h6"
                                        className="approval-action-dialog-heading"
                                    >
                                        {
                                            selectedStatus ===
                                                "Approved"
                                                ? `Approve ${selectedRequest.requestType || "Request"}`
                                                : `Reject ${selectedRequest.requestType || "Request"}`
                                        }
                                    </Typography>

                                    <Typography
                                        variant="caption"
                                        className="approval-action-dialog-subtitle"
                                    >
                                        {getEmployeeName(selectedRequest)} · Review the request before confirming
                                    </Typography>

                                </Box>

                                <IconButton
                                    size="small"
                                    aria-label="Close"
                                    className="approval-action-dialog-close"
                                    onClick={() => {

                                        setSelectedRequest(
                                            null
                                        );

                                        setSelectedStatus(
                                            ""
                                        );

                                    }}
                                >

                                    <CloseRoundedIcon
                                        fontSize="small"
                                    />

                                </IconButton>

                            </Box>

                        </DialogTitle>

                        <DialogContent
                            dividers
                            className="approval-action-dialog-content"
                        >

                            <Box className="approval-action-review-note">
                                Review the request summary below before confirming your decision.
                            </Box>

                            <Box
                                className="approval-action-details-grid"
                            >

                                <Box
                                    className="approval-action-detail"
                                >

                                    <Typography
                                        className="approval-action-detail-label"
                                    >
                                        Request Type
                                    </Typography>

                                    <Typography
                                        className="approval-action-detail-value"
                                    >
                                        {
                                            selectedRequest.requestType ||
                                            "—"
                                        }
                                    </Typography>

                                </Box>

                                <Box
                                    className="approval-action-detail"
                                >

                                    <Typography
                                        className="approval-action-detail-label"
                                    >
                                        Employee
                                    </Typography>

                                    <Typography
                                        className="approval-action-detail-value"
                                    >
                                        {
                                            getEmployeeName(
                                                selectedRequest
                                            )
                                        }
                                    </Typography>

                                </Box>

                                <Box className="approval-action-detail">
                                    <Typography className="approval-action-detail-label">From Date</Typography>
                                    <Typography className="approval-action-detail-value">{formatDate(selectedRequest.fromDate)}</Typography>
                                </Box>

                                <Box className="approval-action-detail">
                                    <Typography className="approval-action-detail-label">To Date</Typography>
                                    <Typography className="approval-action-detail-value">{formatDate(selectedRequest.toDate)}</Typography>
                                </Box>

                                <Box className="approval-action-detail">
                                    <Typography className="approval-action-detail-label">Submitted On</Typography>
                                    <Typography className="approval-action-detail-value">{formatDate(selectedRequest.requestedDate)}</Typography>
                                </Box>

                                <Box className="approval-action-detail">
                                    <Typography className="approval-action-detail-label">Current Status</Typography>
                                    <Typography className="approval-action-detail-value">{selectedRequest.status || "Pending"}</Typography>
                                </Box>

                                {/* LEAVE ATTACHMENT */}

                                {String(
                                    selectedRequest.requestType ||
                                    ""
                                )
                                    .trim()
                                    .toLowerCase() ===
                                    "leave" && (

                                    <Box
                                        className="approval-action-detail"
                                        sx={{
                                            gridColumn:
                                                "1 / -1"
                                        }}
                                    >

                                        <Typography
                                            className="approval-action-detail-label"
                                        >
                                            Supporting Document
                                        </Typography>

                                        {leaveDocumentLoading ? (

                                            <Typography
                                                className="approval-action-detail-value"
                                            >
                                                Loading document...
                                            </Typography>

                                        ) : hasLeaveDocument ===
                                            true ? (

                                            <Button
                                                type="button"
                                                variant="outlined"
                                                startIcon={
                                                    <VisibilityRoundedIcon />
                                                }
                                                onClick={
                                                    handleViewLeaveDocument
                                                }
                                            >
                                                View & Open Document
                                            </Button>

                                        ) : (

                                            <Typography
                                                className="approval-action-detail-value"
                                            >
                                                No supporting document available.
                                            </Typography>

                                        )}

                                    </Box>

                                )}

                            </Box>

                        </DialogContent>

                        <DialogActions
                            className="approval-action-dialog-actions"
                        >

                            <Button
                                type="button"
                                variant="outlined"
                                className="approval-action-cancel-btn"
                                onClick={() => {

                                    setSelectedRequest(
                                        null
                                    );

                                    setSelectedStatus(
                                        ""
                                    );

                                }}
                            >
                                Cancel
                            </Button>

                            <Button
                                type="button"
                                variant="contained"
                                disabled={
                                    !isCurrentApprover(
                                        selectedRequest
                                    ) ||
                                    isPreviousApprover(
                                        selectedRequest
                                    ) ||
                                    (
                                        selectedStatus ===
                                        "Approved" &&
                                        !canApprove
                                    )
                                }
                                className={
                                    selectedStatus ===
                                        "Approved"
                                        ? "approval-action-confirm-btn approval-action-confirm-approve"
                                        : "approval-action-confirm-btn approval-action-confirm-reject"
                                }
                                onClick={
                                    updateStatus
                                }
                            >

                                {
                                    selectedStatus ===
                                        "Approved"
                                        ? "Confirm Approval"
                                        : "Confirm Rejection"
                                }

                            </Button>

                        </DialogActions>

                    </Dialog>

                )}

            <Dialog
                open={Boolean(messagePrompt)}
                onClose={() => setMessagePrompt(null)}
                maxWidth="xs"
                fullWidth
                aria-labelledby="approval-feedback-title"
                PaperProps={{ className: "approval-feedback-dialog-paper" }}
            >
                <DialogTitle id="approval-feedback-title" className="approval-feedback-dialog-title">
                    {messagePrompt?.title || "Notice"}
                </DialogTitle>
                <DialogContent className="approval-feedback-dialog-content">
                    {messagePrompt && (
                        <Alert severity={messagePrompt.severity} variant="outlined">
                            {messagePrompt.message}
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions className="approval-feedback-dialog-actions">
                    <Button
                        autoFocus
                        variant="contained"
                        onClick={() => setMessagePrompt(null)}
                    >
                        OK
                    </Button>
                </DialogActions>
            </Dialog>

        </MuiLayoutBox>

    );
};

export default Approval;
