import React, {
    useEffect,
    useMemo,
    useState
} from "react";

import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";
import autoTable from "jspdf-autotable";

import "./Approval.css";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import FileDownloadRoundedIcon from "@mui/icons-material/FileDownloadRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Typography,
    Box,
    Button
} from "@mui/material";

import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../Services/api";

// ============================================================
// CENTRAL APPROVAL SERVICE
// ============================================================

const APPROVAL_API_BASE_URL =
    "https://sparkapi.amnikontechnologies.com:7128/api";

const EMPLOYEE_API_BASE_URL =
    "https://sparkapi.amnikontechnologies.com:7002/api/Employee";

const BILL_API_BASE_URL = "https://localhost:7008";

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

    const [searchParams] = useSearchParams();

    // ========================================================
    // STATE
    // ========================================================

    const [requests, setRequests] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [search, setSearch] = useState("");

    const [requestType, setRequestType] =
        useState("All");

    const [status, setStatus] =
        useState(
            searchParams.get("status") || "All"
        );

    const [date, setDate] = useState("");

    const [selectedRequest, setSelectedRequest] =
        useState(null);

    const [selectedStatus, setSelectedStatus] =
        useState("");

    const [profile, setProfile] =
        useState(null);

    // EmployeeService lookup used to display the real
    // employee name in ApprovalService requests.
    const [employeeMap, setEmployeeMap] =
        useState({});

    // ========================================================
    // LOAD APPROVAL REQUESTS
    // ========================================================
    // IMPORTANT:
    // This page talks only to ApprovalService.
    // It does NOT call LeaveService, BillService,
    // EmployeeService, or any other module service.
    // ========================================================

    useEffect(() => {
        loadApprovalRequests();
    }, []);

    const loadApprovalRequests = async () => {

        try {

            setLoading(true);
            setError("");

            // ------------------------------------------------
            // Logged-in employee
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
            // ApprovalService stores the workflow/request data.
            // EmployeeService is used only to resolve the real
            // employee name for the UI.
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
                                "Content-Type": "application/json",
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

                employeeData.forEach((employee) => {

                    const id = Number(
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
                        employeeLookup[id] = employee;
                    }

                });

                setEmployeeMap(employeeLookup);

                console.log(
                    "EmployeeService lookup loaded:",
                    employeeLookup
                );

            } catch (employeeError) {

                // Employee name lookup must not stop the
                // ApprovalService workflow from loading.
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
                    `${APPROVAL_API_BASE_URL}/Approval`
                );

            const approvalData =
                Array.isArray(approvalResponse.data)
                    ? approvalResponse.data
                    : approvalResponse.data?.data || [];

            // ------------------------------------------------
            // Normalize ApprovalRequest fields.
            // ApprovalService remains the approval authority.
            // EmployeeService supplies the display name.
            // ------------------------------------------------

            const normalizedRequests =
                approvalData.map((approval) => {

                    const employeeId =
                        approval.employeeId ??
                        approval.employee?.employeeId ??
                        null;

                    const employee =
                        employeeLookup[Number(employeeId)];

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

                });

            setRequests(normalizedRequests);

        } catch (err) {

            console.error(
                "Approval API Error:",
                err
            );

            const message =
                err?.response?.data?.message ||
                (
                    typeof err?.response?.data === "string"
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

    const handleCardClick = (selectedStatus) => {

        setStatus(selectedStatus);

        navigate(
            `/approvals?status=${selectedStatus}`
        );
    };

    // ========================================================
    // CURRENT APPROVER CHECK
    // ========================================================
    // The backend is the final authority, but we also use the
    // same check in the UI so users only see approval actions
    // for requests assigned to their employee ID.
    // ========================================================

const getLoggedInEmployeeId = () => {

    // ============================================================
    // 1. INTERNAL EMPLOYEE ID
    // ============================================================

    const employeeId =
        profile?.employeeId ??
        profile?.EmployeeId ??
        profile?.employeeID ??
        profile?.employee?.employeeId ??
        profile?.employee?.EmployeeId ??
        profile?.employee?.employeeID ??
        null;

    const numericEmployeeId = Number(employeeId);

    if (
        Number.isFinite(numericEmployeeId) &&
        numericEmployeeId > 0
    ) {
        console.log(
            "Approval: Logged-in EmployeeId =",
            numericEmployeeId
        );

        return numericEmployeeId;
    }

    // ============================================================
    // 2. AZURE EMPLOYEE ID
    // ============================================================

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
        String(azureEmployeeId)
            .trim()
            .toLowerCase();

    // ============================================================
    // 3. AZURE ID → INTERNAL EMPLOYEE ID
    // ============================================================

    const matchedEmployee =
        Object.values(employeeMap).find(employee => {

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
                String(employeeAzureId)
                    .trim()
                    .toLowerCase() ===
                normalizedAzureId
            );
        });

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
        !Number.isFinite(resolvedEmployeeId) ||
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

    const isCurrentApprover = (request) => {
        const loggedInEmployeeId =
            getLoggedInEmployeeId();

        const currentApproverId =
            Number(request?.currentApproverId);

        return (
            loggedInEmployeeId !== null &&
            Number.isFinite(currentApproverId) &&
            currentApproverId > 0 &&
            loggedInEmployeeId === currentApproverId
        );
    };

    // ========================================================
    // REQUESTS RELEVANT TO LOGGED-IN EMPLOYEE
    // ========================================================
    // Requests assigned to the logged-in employee are shown.
    // An escalated request is also visible to the immediately previous
    // approver, but that previous approver cannot take action.
    // ========================================================

    const visibleRequests = useMemo(() => {

        const loggedInEmployeeId =
            getLoggedInEmployeeId();

        if (!loggedInEmployeeId) {
            return [];
        }

        return requests.filter(request => {

            const currentApproverId =
                Number(request.currentApproverId);

            const previousApproverId =
                Number(request.previousApproverId);

            return (
                currentApproverId === Number(loggedInEmployeeId) ||
                previousApproverId === Number(loggedInEmployeeId)
            );
        });

    }, [requests, profile, employeeMap]);

    const isPreviousApprover = (request) => {

        const loggedInEmployeeId =
            getLoggedInEmployeeId();

        const previousApproverId =
            Number(request?.previousApproverId);

        const currentApproverId =
            Number(request?.currentApproverId);

        return (
            loggedInEmployeeId !== null &&
            Number.isFinite(previousApproverId) &&
            previousApproverId > 0 &&
            loggedInEmployeeId === previousApproverId &&
            loggedInEmployeeId !== currentApproverId
        );
    };

    // ========================================================
    // STATISTICS
    // ========================================================

    const statistics = useMemo(() => {

        const pending =
            visibleRequests.filter(
                request =>
                    String(request.status || "")
                        .toLowerCase() === "pending"
            ).length;

        const approved =
            visibleRequests.filter(
                request =>
                    String(request.status || "")
                        .toLowerCase() === "approved"
            ).length;

        const rejected =
            visibleRequests.filter(
                request =>
                    String(request.status || "")
                        .toLowerCase() === "rejected"
            ).length;

        return {
            pending,
            approved,
            rejected,
            total: visibleRequests.length
        };

    }, [visibleRequests]);

    // ========================================================
    // REQUEST TYPES
    // ========================================================

    const requestTypes = useMemo(() => {

        const types =
            visibleRequests
                .map(request =>
                    request.requestType
                )
                .filter(Boolean);

        return [
            ...new Set(types)
        ];

    }, [visibleRequests]);

    // ========================================================
    // FILTER
    // ========================================================

const filteredRequests = useMemo(() => {

    return visibleRequests.filter(request => {

            const employeeName =
                request.employeeName || "";

            const employeeId =
                request.employeeId || "";

            const approvalRequestId =
                request.approvalRequestId || "";

            const requestId =
                request.requestId || "";

            const requestTypeValue =
                request.requestType || "";

            const statusValue =
                request.status || "";

            const searchText =
                search
                    .trim()
                    .toLowerCase();

            const matchesSearch =
                !searchText ||
                employeeName
                    .toLowerCase()
                    .includes(searchText) ||
                String(employeeId)
                    .toLowerCase()
                    .includes(searchText) ||
                String(approvalRequestId)
                    .toLowerCase()
                    .includes(searchText) ||
                String(requestId)
                    .toLowerCase()
                    .includes(searchText) ||
                requestTypeValue
                    .toLowerCase()
                    .includes(searchText);

            const matchesRequestType =
                requestType === "All" ||
                requestTypeValue === requestType;

            const matchesStatus =
                status === "All" ||
                String(statusValue)
                    .toLowerCase() ===
                status.toLowerCase();

            const appliedDate =
                request.requestedDate ||
                request.createdDate ||
                "";

            const matchesDate =
                !date ||
                String(appliedDate)
                    .startsWith(date);

            return (
                matchesSearch &&
                matchesRequestType &&
                matchesStatus &&
                matchesDate
            );

        });

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

    const formatDate = (value) => {

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

    const getStatusClass = (value) => {

        const currentStatus =
            String(value || "")
                .toLowerCase();

        if (currentStatus === "pending") {
            return "pending";
        }

        if (currentStatus === "approved") {
            return "approved";
        }

        if (currentStatus === "rejected") {
            return "rejected";
        }

        return "";
    };

    // ========================================================
    // EMPLOYEE NAME
    // ========================================================

    const getEmployeeName = (request) => {

        const employeeId =
            Number(
                request?.employeeId ??
                request?.employee?.employeeId
            );

        const employee =
            Number.isFinite(employeeId) &&
            employeeId > 0
                ? employeeMap[employeeId]
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
                Number.isFinite(employeeId) &&
                employeeId > 0
                    ? `Employee ${employeeId}`
                    : "—"
            )
        );
    };

    // ========================================================
    // OPEN APPROVAL ACTION
    // ========================================================

    const openStatusPopup = (
        request,
        requestedStatus
    ) => {
        // Buttons are disabled in the table when the logged-in
        // employee is not the current approver. The backend
        // validation in updateStatus remains the final authority.
        setSelectedRequest(request);
        setSelectedStatus(requestedStatus);
    };

    // ========================================================
    // CENTRAL APPROVE / REJECT
    // ========================================================
    // This is the important change.
    //
    // NEVER call:
    // /api/Leave/.../status
    // /api/Bill/.../status
    //
    // ApprovalService is now the single approval authority.
    // ========================================================

const updateStatus = async () => {

    if (!selectedRequest) {
        return;
    }

    if (
        selectedStatus === "Approved" &&
        !canApprove
    ) {
        alert(
            "You do not have permission to approve this request."
        );
        return;
    }

    const approvalRequestId =
        selectedRequest.approvalRequestId ||
        selectedRequest.id;

    if (!approvalRequestId) {
        alert(
            "Approval Request ID was not found."
        );
        return;
    }

    const loggedInEmployeeId =
        getLoggedInEmployeeId();

    if (!loggedInEmployeeId) {
        alert(
            "Logged-in employee ID was not found. Please log in again."
        );
        return;
    }

    const currentApproverId =
        Number(selectedRequest.currentApproverId);

    if (
        !Number.isFinite(currentApproverId) ||
        currentApproverId <= 0
    ) {
        alert(
            "Current approver ID was not found for this request."
        );
        return;
    }

    if (
        loggedInEmployeeId !== currentApproverId
    ) {
        alert(
            `You are not the current approver for this request.\n\n` +
            `Current Approver ID: ${currentApproverId}\n` +
            `Your Employee ID: ${loggedInEmployeeId}`
        );
        return;
    }

    try {

        // ============================================================
        // TOKEN
        // ============================================================

        const token =
            localStorage.getItem("token") ||
            localStorage.getItem("accessToken");

        const authHeaders = {
            "Content-Type": "application/json",
            ...(token
                ? {
                    Authorization:
                        `Bearer ${token}`
                }
                : {})
        };


        // ============================================================
        // 1. APPROVE / REJECT IN CENTRAL APPROVAL SERVICE
        // ============================================================

        if (
            selectedStatus === "Approved"
        ) {

            await axios.put(
                `${APPROVAL_API_BASE_URL}/Approval/${approvalRequestId}/approve`,
                {
                    approverId: loggedInEmployeeId
                },
                {
                    headers: authHeaders
                }
            );

        }

        else if (
            selectedStatus === "Rejected"
        ) {

            await axios.put(
                `${APPROVAL_API_BASE_URL}/Approval/${approvalRequestId}/reject`,
                {
                    approverId: loggedInEmployeeId
                },
                {
                    headers: authHeaders
                }
            );

        }

        else {

            alert(
                "Invalid approval status."
            );

            return;
        }


        // ============================================================
        // 2. SUCCESS
        // ============================================================
        // ApprovalService is the single approval authority.
        // Module pages/services are responsible for reflecting the
        // approval result through their existing workflow.
        // ============================================================


        alert(
            selectedStatus === "Approved"
                ? "Request approved successfully."
                : "Request rejected successfully."
        );


        setSelectedRequest(null);
        setSelectedStatus("");


        // Reload ApprovalService
        await loadApprovalRequests();


    } catch (error) {

        console.error(
            "Update Approval Status Error:",
            error
        );


        const message =
            error?.response?.data?.message ||
            (
                typeof error?.response?.data === "string"
                    ? error.response.data
                    : ""
            ) ||
            error?.message ||
            "Unable to update approval status.";


        alert(message);
    }
};

    // ========================================================
    // VIEW REQUEST
    // ========================================================

    const handleView = (request) => {

        // View is a details-only action.
        // Clearing selectedStatus prevents the
        // Approve/Reject dialog from opening.
        setSelectedStatus("");
        setSelectedRequest(request);
    };

    const handleCloseDetails = () => {
        setSelectedRequest(null);
    };


    // ========================================================
    // EXPORT
    // ========================================================

    const handleExport = () => {

        if (
            !filteredRequests ||
            filteredRequests.length === 0
        ) {
            alert(
                "No approval requests available to export."
            );
            return;
        }

        const exportData =
            filteredRequests.map(request => ({

                "Approval Request ID":
                    request.approvalRequestId || "",

                "Request ID":
                    request.requestId || "",

                "Employee ID":
                    request.employeeId || "",

                "Employee Name":
                    getEmployeeName(request),

                "Request Type":
                    request.requestType || "",

                "Approval Level":
                    request.approvalLevel || "",

                "Current Approver ID":
                    request.currentApproverId || "",

                "Previous Approver ID":
                    request.previousApproverId || "",

                "Requested On":
                    formatDate(
                        request.requestedDate
                    ),

                "Action Date":
                    formatDate(
                        request.actionDate
                    ),

                "Status":
                    request.status || ""

            }));

        // ----------------------------------------------------
        // Excel
        // ----------------------------------------------------

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

        // ----------------------------------------------------
        // PDF
        // ----------------------------------------------------

        const pdf =
            new jsPDF({
                orientation: "landscape",
                unit: "mm",
                format: "a4"
            });

        pdf.setFontSize(18);

        pdf.text(
            "Approval Requests",
            14,
            15
        );

        pdf.setFontSize(10);

        pdf.text(
            `Total Requests: ${filteredRequests.length}`,
            14,
            22
        );

        const headers = [[
            "Approval ID",
            "Request ID",
            "Employee ID",
            "Employee Name",
            "Request Type",
            "Level",
            "Approver ID",
            "Previous Approver ID",
            "Requested On",
            "Action Date",
            "Status"
        ]];

        const rows =
            filteredRequests.map(request => [

                request.approvalRequestId || "",

                request.requestId || "",

                request.employeeId || "",

                getEmployeeName(request),

                request.requestType || "",

                request.approvalLevel || "",

                request.currentApproverId || "",

                request.previousApproverId || "",

                formatDate(
                    request.requestedDate
                ),

                formatDate(
                    request.actionDate
                ),

                request.status || ""

            ]);

        autoTable(pdf, {
            head: headers,
            body: rows,
            startY: 28,
            theme: "grid",

            styles: {
                fontSize: 8,
                cellPadding: 3
            },

            headStyles: {
                fontSize: 8,
                fontStyle: "bold"
            }
        });

        pdf.save(
            "Approval_Requests.pdf"
        );
    };

    // ========================================================
    // RENDER
    // ========================================================

    return (

        <div className="approval-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="approval-header">

                <h1>
                    Approvals
                </h1>

                <p>
                    Review and manage requests
                    that require your approval.
                </p>

            </div>

            {/* =================================================
                SUMMARY CARDS
            ================================================= */}

            <div className="approval-summary">

                <div
                    className="approval-card approval-card-clickable"
                    onClick={() =>
                        handleCardClick("Pending")
                    }
                >

                    <div className="approval-card-icon pending">
                        <AccessTimeRoundedIcon />
                    </div>

                    <div>

                        <span>
                            Pending
                        </span>

                        <h2>
                            {statistics.pending}
                        </h2>

                        <small>
                            Requests waiting for
                            your approval
                        </small>

                    </div>

                </div>

                <div
                    className="approval-card approval-card-clickable"
                    onClick={() =>
                        handleCardClick("Approved")
                    }
                >

                    <div className="approval-card-icon approved">
                        <CheckCircleRoundedIcon />
                    </div>

                    <div>

                        <span>
                            Approved
                        </span>

                        <h2>
                            {statistics.approved}
                        </h2>

                        <small>
                            Total approved
                            requests
                        </small>

                    </div>

                </div>

                <div
                    className="approval-card approval-card-clickable"
                    onClick={() =>
                        handleCardClick("Rejected")
                    }
                >

                    <div className="approval-card-icon rejected">
                        <CancelRoundedIcon />
                    </div>

                    <div>

                        <span>
                            Rejected
                        </span>

                        <h2>
                            {statistics.rejected}
                        </h2>

                        <small>
                            Total rejected
                            requests
                        </small>

                    </div>

                </div>

                <div
                    className="approval-card approval-card-clickable"
                    onClick={() =>
                        handleCardClick("All")
                    }
                >

                    <div className="approval-card-icon total">
                        <FolderRoundedIcon />
                    </div>

                    <div>

                        <span>
                            Total Requests
                        </span>

                        <h2>
                            {statistics.total}
                        </h2>

                        <small>
                            All requests
                            in the system
                        </small>

                    </div>

                </div>

            </div>

            {/* =================================================
                REQUEST PANEL
            ================================================= */}

            <div className="approval-panel">

                {/* FILTER BAR */}

                <div className="approval-filter-bar">

                    <div className="approval-search">

                        <SearchRoundedIcon />

                        <input
                            type="text"
                            placeholder="Search requests..."
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value
                                )
                            }
                        />

                    </div>

                    <div className="approval-select">

                        <label>
                            Request Type
                        </label>

                        <select
                            value={requestType}
                            onChange={(event) =>
                                setRequestType(
                                    event.target.value
                                )
                            }
                        >

                            <option value="All">
                                All
                            </option>

                            {requestTypes.map(type => (

                                <option
                                    key={type}
                                    value={type}
                                >
                                    {type}
                                </option>

                            ))}

                        </select>

                    </div>

                    <div className="approval-select">

                        <label>
                            Status
                        </label>

                        <select
                            value={status}
                            onChange={(event) => {

                                const selectedStatus =
                                    event.target.value;

                                setStatus(
                                    selectedStatus
                                );

                                navigate(
                                    `/approvals?status=${selectedStatus}`
                                );

                            }}
                        >

                            <option value="All">
                                All
                            </option>

                            <option value="Pending">
                                Pending
                            </option>

                            <option value="Approved">
                                Approved
                            </option>

                            <option value="Rejected">
                                Rejected
                            </option>

                        </select>

                    </div>

                    <div className="approval-date">

                        <label>
                            Date Range
                        </label>

                        <div>

                            <input
                                type="date"
                                value={date}
                                onChange={(event) =>
                                    setDate(
                                        event.target.value
                                    )
                                }
                            />

                        </div>

                    </div>

                    {canExport && (

                        <button
                            type="button"
                            className="approval-export-btn"
                            onClick={handleExport}
                        >

                            <FileDownloadRoundedIcon />

                            Export

                        </button>

                    )}

                </div>

                {/* =================================================
                    TABLE
                ================================================= */}

                <div className="approval-table-wrapper">

                    <table className="approval-table">

                        <thead>

                            <tr>

                                <th>
                                    Request ID
                                </th>

                                <th>
                                    Employee
                                </th>

                                <th>
                                    Request Type
                                </th>

                                <th>
                                    From Date
                                </th>

                                <th>
                                    To Date
                                </th>

                                <th>
                                    Applied On
                                </th>

                                <th>
                                    Status
                                </th>

                                <th>
                                    Action
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {loading && (

                                <tr>

                                    <td
                                        colSpan="8"
                                        className="approval-message"
                                    >
                                        Loading approval requests...
                                    </td>

                                </tr>

                            )}

                            {!loading &&
                                error && (

                                    <tr>

                                        <td
                                            colSpan="8"
                                            className="approval-message error"
                                        >
                                            {error}
                                        </td>

                                    </tr>

                                )}

                            {!loading &&
                                !error &&
                                filteredRequests.length === 0 && (

                                    <tr>

                                        <td
                                            colSpan="8"
                                            className="approval-message"
                                        >
                                            No approval requests found.
                                        </td>

                                    </tr>

                                )}

                            {!loading &&
                                !error &&
                                filteredRequests.map(
                                    request => {

                                        const employeeName =
                                            getEmployeeName(
                                                request
                                            );

                                        const employeeId =
                                            request.employeeId ||
                                            "—";

                                        return (

                                            <tr
                                                key={
                                                    request.approvalRequestId ||
                                                    request.requestId ||
                                                    request.id
                                                }
                                                className={
                                                    isPreviousApprover(request)
                                                        ? "approval-row-escalated"
                                                        : ""
                                                }
                                                title={
                                                    isPreviousApprover(request)
                                                        ? "This request was escalated to another approver. You can view it, but you can no longer approve or reject it."
                                                        : undefined
                                                }
                                            >

                                                <td>

                                                    {request.requestId ||
                                                        request.approvalRequestId ||
                                                        "—"}

                                                </td>

                                                <td>

                                                    <div className="approval-employee">

                                                        <div className="approval-avatar">

                                                            {String(
                                                                employeeName
                                                            )
                                                                .charAt(0)
                                                                .toUpperCase()}

                                                        </div>

                                                        <div>

                                                            <strong>
                                                                {employeeName}
                                                            </strong>

                                                            <small>
                                                                EMP
                                                                {employeeId}
                                                            </small>

                                                        </div>

                                                    </div>

                                                </td>

                                                <td>

                                                    {request.requestType ||
                                                        "—"}

                                                </td>

                                                <td>

                                                    {formatDate(
                                                        request.fromDate
                                                    )}

                                                </td>

                                                <td>

                                                    {formatDate(
                                                        request.toDate
                                                    )}

                                                </td>

                                                <td>

                                                    {formatDate(
                                                        request.requestedDate
                                                    )}

                                                </td>

                                                <td>

                                                    <span
                                                        className={`approval-status ${getStatusClass(
                                                            request.status
                                                        )}`}
                                                    >

                                                        {request.status ||
                                                            "—"}

                                                    </span>

                                                </td>

                                                <td>

                                                    <div className="approval-actions">

                                                        {String(
                                                            request.status ||
                                                            ""
                                                        ).toLowerCase() ===
                                                            "pending" && (

                                                            <>

                                                                {canApprove && (

                                                                    <button
                                                                        type="button"
                                                                        className="approval-approve-btn"
                                                                        disabled={
                                                                            !isCurrentApprover(request) ||
                                                                            isPreviousApprover(request)
                                                                        }
                                                                        title={
                                                                            !isCurrentApprover(request)
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
                                                                    </button>

                                                                )}

                                                                <button
                                                                    type="button"
                                                                    className="approval-reject-btn"
                                                                    disabled={
                                                                        !isCurrentApprover(request) ||
                                                                        isPreviousApprover(request)
                                                                    }
                                                                    title={
                                                                        !isCurrentApprover(request)
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
                                                                </button>

                                                            </>

                                                        )}

                                                        <button
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

                                                        </button>

                                                    </div>

                                                </td>

                                            </tr>

                                        );
                                    }
                                )}

                        </tbody>

                    </table>

                </div>

                {/* =================================================
                    FOOTER
                ================================================= */}

                <div className="approval-footer">

                    <span>

                        Showing{" "}

                        {filteredRequests.length}

                        {" "}of{" "}

                        {visibleRequests.length}

                        {" "}entries

                    </span>

                </div>

            </div>

            {/* =================================================
                GENERIC REQUEST DETAILS
            ================================================= */}

            {selectedRequest && (

                <div className="approval-details-overlay">

                    <div className="approval-details-modal">

                        <div className="approval-details-header">

                            <div>

                                <h2>
                                    {selectedRequest.requestType ||
                                        "Request"}{" "}
                                    Details
                                </h2>

                            </div>

                            <button
                                type="button"
                                className="approval-details-close"
                                onClick={
                                    handleCloseDetails
                                }
                            >
                                ×
                            </button>

                        </div>

                        <div className="approval-details-body">

                            <div className="approval-detail-item">
                                <span>
                                    Approval Request ID
                                </span>
                                <strong>
                                    {selectedRequest.approvalRequestId ||
                                        "—"}
                                </strong>
                            </div>

                            <div className="approval-detail-item">
                                <span>
                                    Request ID
                                </span>
                                <strong>
                                    {selectedRequest.requestId ||
                                        "—"}
                                </strong>
                            </div>

                            <div className="approval-detail-item">
                                <span>
                                    Request Type
                                </span>
                                <strong>
                                    {selectedRequest.requestType ||
                                        "—"}
                                </strong>
                            </div>

                            <div className="approval-detail-item">
                                <span>
                                    Employee ID
                                </span>
                                <strong>
                                    {selectedRequest.employeeId ||
                                        "—"}
                                </strong>
                            </div>

                            <div className="approval-detail-item">
                                <span>
                                    Employee Name
                                </span>
                                <strong>
                                    {getEmployeeName(
                                        selectedRequest
                                    )}
                                </strong>
                            </div>

                            <div className="approval-detail-item">
                                <span>
                                    Approval Level
                                </span>
                                <strong>
                                    {selectedRequest.approvalLevel ||
                                        "—"}
                                </strong>
                            </div>

                            <div className="approval-detail-item">
                                <span>
                                    Current Approver ID
                                </span>
                                <strong>
                                    {selectedRequest.currentApproverId ||
                                        "—"}
                                </strong>
                            </div>

                            <div className="approval-detail-item">
                                <span>
                                    Previous Approver ID
                                </span>
                                <strong>
                                    {selectedRequest.previousApproverId ||
                                        "—"}
                                </strong>
                            </div>

                            <div className="approval-detail-item">
                                <span>
                                    Requested On
                                </span>
                                <strong>
                                    {formatDate(
                                        selectedRequest.requestedDate
                                    )}
                                </strong>
                            </div>

                            <div className="approval-detail-item">
                                <span>
                                    Action Date
                                </span>
                                <strong>
                                    {formatDate(
                                        selectedRequest.actionDate
                                    )}
                                </strong>
                            </div>

                            <div className="approval-detail-item">
                                <span>
                                    Status
                                </span>

                                <span
                                    className={`approval-status ${getStatusClass(
                                        selectedRequest.status
                                    )}`}
                                >
                                    {selectedRequest.status ||
                                        "—"}
                                </span>

                            </div>

                        </div>

                    </div>

                </div>
            )}

            {/* =================================================
                GENERIC APPROVE / REJECT DIALOG
            ================================================= */}

            {selectedRequest && selectedStatus && (

                <Dialog
                    open={Boolean(selectedRequest && selectedStatus)}
                    onClose={() => {

                        setSelectedRequest(null);
                        setSelectedStatus("");

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
                                    {selectedStatus ===
                                        "Approved"
                                        ? `Approve ${selectedRequest.requestType || "Request"}`
                                        : `Reject ${selectedRequest.requestType || "Request"}`}
                                </Typography>

                                <Typography
                                    variant="caption"
                                    className="approval-action-dialog-subtitle"
                                >
                                    Approval Request ID:{" "}
                                    {
                                        selectedRequest.approvalRequestId ||
                                        "—"
                                    }
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
                                    Request ID
                                </Typography>

                                <Typography
                                    className="approval-action-detail-value"
                                >
                                    {
                                        selectedRequest.requestId ||
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
                                    Employee ID
                                </Typography>

                                <Typography
                                    className="approval-action-detail-value"
                                >
                                    {
                                        selectedRequest.employeeId ||
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
                                    Employee Name
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

                            <Box
                                className="approval-action-detail"
                            >

                                <Typography
                                    className="approval-action-detail-label"
                                >
                                    Approval Level
                                </Typography>

                                <Typography
                                    className="approval-action-detail-value"
                                >
                                    {
                                        selectedRequest.approvalLevel ||
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
                                    Current Approver ID
                                </Typography>

                                <Typography
                                    className="approval-action-detail-value"
                                >
                                    {
                                        selectedRequest.currentApproverId ||
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
                                    Previous Approver ID
                                </Typography>

                                <Typography
                                    className="approval-action-detail-value"
                                >
                                    {
                                        selectedRequest.previousApproverId ||
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
                                    Logged-in Employee ID
                                </Typography>

                                <Typography
                                    className="approval-action-detail-value"
                                >
                                    {
                                        getLoggedInEmployeeId() ||
                                        "—"
                                    }
                                </Typography>

                            </Box>

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
                                !isCurrentApprover(selectedRequest) ||
                                isPreviousApprover(selectedRequest) ||
                                (
                                    selectedStatus === "Approved" &&
                                    !canApprove
                                )
                            }
                            className={
                                selectedStatus ===
                                    "Approved"
                                    ? "approval-action-confirm-btn approval-action-confirm-approve"
                                    : "approval-action-confirm-btn approval-action-confirm-reject"
                            }
                            onClick={updateStatus}
                        >
                            {selectedStatus ===
                                "Approved"
                                ? "Confirm Approval"
                                : "Confirm Rejection"}
                        </Button>

                    </DialogActions>

                </Dialog>

            )}

        </div>

    );
};

export default Approval;
