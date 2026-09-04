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
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../Services/api";

const Approval = () => {

    const navigate = useNavigate();

    const [searchParams] = useSearchParams();


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

const [selectedRequest, setSelectedRequest] = useState(null);

const [selectedLeave, setSelectedLeave] = useState(null);
const [selectedStatus, setSelectedStatus] = useState("");
const [profile, setProfile] = useState(null);
const [managerComment, setManagerComment] = useState("");

const [leaveTypes, setLeaveTypes] = useState([]);
const [employees, setEmployees] = useState([]);

const [date, setDate] = useState("");


    // =========================================================
    // LOAD APPROVAL REQUESTS
    // =========================================================

    useEffect(() => {

        loadApprovalRequests();

    }, []);


const loadApprovalRequests = async () => {
    try {
        setLoading(true);
        setError("");

        // =====================================================
        // 1. GET LOGGED-IN EMPLOYEE
        // Same logic used by Leave Request page.
        // =====================================================
        const profileResponse = await api.get("/Auth/profile");
        const employee = profileResponse.data;

        if (!employee?.employeeId) {
            throw new Error("Logged-in employee ID was not found.");
        }

        const employeeId = Number(employee.employeeId);

        setProfile(employee);

        console.log(
            "Logged-in Employee Profile:",
            employee
        );

        console.log(
            "Logged-in Employee ID:",
            employeeId
        );

        // =====================================================
        // 2. GET APPROVAL REQUESTS
        // =====================================================

        const approvalResponse = await axios.get(
            "https://localhost:7128/api/Approval"
        );

        const approvalData = Array.isArray(approvalResponse.data)
            ? approvalResponse.data
            : approvalResponse.data?.data || [];

        // =====================================================
        // 3. GET LEAVE REQUESTS
        // Leave is the source of truth for Leave status.
        // =====================================================

        const leaveResponse = await axios.get(
            "https://localhost:7206/api/Leave"
        );

        const leaveData = Array.isArray(leaveResponse.data)
            ? leaveResponse.data
            : leaveResponse.data?.data || [];

        // =====================================================
        // 4. GET LEAVE TYPES
        // =====================================================

        try {
            const leaveTypeResponse = await axios.get(
                "https://localhost:7206/api/LeaveType"
            );

            const leaveTypeData = Array.isArray(leaveTypeResponse.data)
                ? leaveTypeResponse.data
                : leaveTypeResponse.data?.data || [];

            setLeaveTypes(leaveTypeData);
        } catch (leaveTypeError) {
            console.error("Leave Type Error:", leaveTypeError);
            setLeaveTypes([]);
        }

        // =====================================================
        // 5. GET EMPLOYEES
        // Used only to display Approved / Rejected By as a name.
        // =====================================================

        try {
            const employeeResponse = await axios.get(
                "https://localhost:7002/api/Employee"
            );

            const employeeData = Array.isArray(employeeResponse.data)
                ? employeeResponse.data
                : employeeResponse.data?.data || [];

            setEmployees(employeeData);
        } catch (employeeError) {
            console.error("Employee API Error:", employeeError);
            setEmployees([]);
        }

        // =====================================================
        // 6. COMBINE APPROVAL + LEAVE DATA
        // =====================================================

        const combinedRequests = approvalData.map((approval) => {

            const leave = leaveData.find(
                (item) =>
                    Number(item.leaveId) ===
                    Number(approval.requestId)
            );

            return {
                ...approval,

                // Leave ID
                leaveId: leave?.leaveId || approval.requestId || null,

                // Employee details
                employeeId: leave?.employeeId || approval.employeeId || null,
                employeeName:
                    leave?.employeeName ||
                    approval.employeeName ||
                    approval.employee?.employeeName ||
                    "",
                azureEmployeeId:
                    leave?.azureEmployeeId ||
                    approval.azureEmployeeId ||
                    approval.employee?.azureEmployeeId ||
                    "",

                // Leave details
                fromDate: leave?.fromDate || "",
                toDate: leave?.toDate || "",
                leaveTypeId: leave?.leaveTypeId || null,
                reason: leave?.reason || "",
                noOfDays: leave?.noOfDays || null,

                // Dates / comments
                appliedOn:
                    leave?.appliedDate ||
                    leave?.appliedOn ||
                    approval.appliedOn ||
                    approval.requestedDate ||
                    "",
                managerComment: leave?.managerComment || "",
                approvedBy: leave?.approvedBy || null,
                approvedDate: leave?.approvedDate || null,

                // IMPORTANT: Leave status is the source of truth
                status: leave?.status || approval.status
            };
        });

        setRequests(combinedRequests);

    } catch (err) {

        console.error(
            "Approval API Error:",
            err
        );

        setError(
            err?.response?.data?.message ||
            err?.response?.data ||
            "Unable to load approval requests."
        );

        setRequests([]);

    } finally {
        setLoading(false);
    }
};


    // =========================================================
    // CARD REDIRECT / FILTER
    // =========================================================

    const handleCardClick = (selectedStatus) => {

        setStatus(selectedStatus);

        navigate(
            `/approvals?status=${selectedStatus}`
        );

    };


    // =========================================================
    // STATISTICS
    // =========================================================

    const statistics = useMemo(() => {

        const pending = requests.filter(
            request =>
                String(
                    request.status || ""
                ).toLowerCase() === "pending"
        ).length;


        const approved = requests.filter(
            request =>
                String(
                    request.status || ""
                ).toLowerCase() === "approved"
        ).length;


        const rejected = requests.filter(
            request =>
                String(
                    request.status || ""
                ).toLowerCase() === "rejected"
        ).length;


        return {

            pending,

            approved,

            rejected,

            total: requests.length

        };

    }, [requests]);


    // =========================================================
    // REQUEST TYPES FROM API
    // =========================================================

    const requestTypes = useMemo(() => {

        const types = requests
            .map(
                request =>
                    request.requestType
            )
            .filter(Boolean);


        return [
            ...new Set(types)
        ];

    }, [requests]);


    // =========================================================
    // FILTER
    // =========================================================

    const filteredRequests = useMemo(() => {

        return requests.filter(request => {


            const employeeName =
                request.employeeName ||
                request.employee?.employeeName ||
                "";


            const employeeId =
                request.employeeId ||
                request.employee?.employeeId ||
                "";


            const requestId =
                request.requestId ||
                request.id ||
                request.approvalRequestId ||
                "";


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

                String(requestId)
                    .toLowerCase()
                    .includes(searchText);


            const matchesRequestType =

                requestType === "All" ||

                requestTypeValue ===
                    requestType;


            const matchesStatus =

                status === "All" ||

                String(statusValue)
                    .toLowerCase() ===
                status.toLowerCase();


            const appliedDate =
                request.appliedOn ||
                request.createdDate ||
                request.requestedDate ||
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

        requests,

        search,

        requestType,

        status,

        date

    ]);


    // =========================================================
    // DATE FORMAT
    // =========================================================

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


    // =========================================================
    // STATUS CLASS
    // =========================================================

    const getStatusClass = (value) => {

        const currentStatus =
            String(value || "")
                .toLowerCase();


        if (
            currentStatus === "pending"
        ) {

            return "pending";

        }


        if (
            currentStatus === "approved"
        ) {

            return "approved";

        }


        if (
            currentStatus === "rejected"
        ) {

            return "rejected";

        }


        return "";

    };


    // =========================================================
    // VIEW REQUEST
    // =========================================================

const getLeaveTypeName = (leaveTypeId) => {
    const leaveType = leaveTypes.find(
        (type) =>
            Number(type.leaveTypeId) ===
            Number(leaveTypeId)
    );

    return leaveType?.leaveTypeName || "—";
};


const calculateDays = (fromDate, toDate) => {
    if (!fromDate || !toDate) {
        return "—";
    }

    const from = new Date(fromDate);
    const to = new Date(toDate);

    const difference =
        Math.floor((to - from) / (1000 * 60 * 60 * 24)) + 1;

    return difference > 0 ? difference : "—";
};


const getEmployeeNameById = (employeeId) => {
    if (!employeeId) {
        return "—";
    }

    const employee = employees.find(
        (emp) =>
            Number(emp.employeeId) ===
            Number(employeeId)
    );

    return (
        employee?.employeeName ||
        employee?.name ||
        employee?.fullName ||
        String(employeeId)
    );
};


// =========================================================
// LEAVE APPROVE / REJECT POPUP
// Uses the same Leave API used by Leave Requests page.
// =========================================================

const openStatusPopup = (request, selectedStatus) => {
    setSelectedLeave(request);
    setSelectedStatus(selectedStatus);
    setManagerComment("");
};


const updateStatus = async () => {
    if (!selectedLeave) {
        return;
    }

    if (!selectedLeave.leaveId) {
        alert("Leave request ID not found.");
        return;
    }

    if (!profile?.employeeId) {
        alert("Logged-in employee information is not available.");
        return;
    }

    if (!managerComment.trim()) {
        alert("Please enter a manager comment.");
        return;
    }

    try {
        await axios.put(
            `https://localhost:7206/api/Leave/${selectedLeave.leaveId}/status`,
            {
                status: selectedStatus,

                // Same logged-in employee logic as Leave Request page.
                // The employee who clicks Approve / Reject is recorded.
                approvedBy: Number(profile?.employeeId),

                managerComment: managerComment.trim()
            }
        );

        alert(
            selectedStatus === "Approved"
                ? "Leave Approved Successfully"
                : "Leave Rejected Successfully"
        );

        setSelectedLeave(null);
        setSelectedStatus("");
        setManagerComment("");

        // Refresh Approval page.
        // The Leave API is the source of truth for status.
        await loadApprovalRequests();

    } catch (error) {
        console.error(
            "Update Leave Status Error:",
            error
        );

        alert(
            error?.response?.data?.message ||
            error?.response?.data ||
            "Unable to update leave status."
        );
    }
};


const handleView = (request) => {
    setSelectedRequest(request);
};

const handleCloseDetails = () => {
    setSelectedRequest(null);
};

    // =========================================================
    // EXPORT
    // =========================================================

const handleExport = () => {

    if (!filteredRequests || filteredRequests.length === 0) {
        alert("No approval requests available to export.");
        return;
    }

    const exportData = filteredRequests.map((request) => ({
        "Request ID":
            request.requestId ||
            request.approvalRequestId ||
            "",

        "Employee ID":
            request.employeeId || "",

        "Employee Name":
            request.employeeName || "",

        "Request Type":
            request.requestType || "",

        "From Date":
            formatDate(request.fromDate),

        "To Date":
            formatDate(request.toDate),

        "Applied On":
            formatDate(request.appliedOn),

        "Status":
            request.status || "",

        "Approved / Rejected By":
            getEmployeeNameById(request.approvedBy)
    }));


    // =========================
    // EXCEL
    // =========================

    const worksheet = XLSX.utils.json_to_sheet(exportData);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Approval Requests"
    );

    worksheet["!cols"] = [
        { wch: 14 },
        { wch: 14 },
        { wch: 25 },
        { wch: 18 },
        { wch: 16 },
        { wch: 16 },
        { wch: 16 },
        { wch: 14 },
        { wch: 25 }
    ];

    XLSX.writeFile(
        workbook,
        "Approval_Requests.xlsx"
    );


    // =========================
    // PDF
    // =========================

    const pdf = new jsPDF({
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
        "Request ID",
        "Employee ID",
        "Employee Name",
        "Request Type",
        "From Date",
        "To Date",
        "Applied On",
        "Status",
        "Approved / Rejected By"
    ]];

    const rows = filteredRequests.map((request) => [
        request.requestId ||
            request.approvalRequestId ||
            "",

        request.employeeId || "",

        request.employeeName || "",

        request.requestType || "",

        formatDate(request.fromDate),

        formatDate(request.toDate),

        formatDate(request.appliedOn),

        request.status || "",

        getEmployeeNameById(
            request.approvedBy
        )
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
    // =========================================================
    // RENDER
    // =========================================================

    return (

        <div className="approval-page">


            {/* =====================================================
                HEADER
            ===================================================== */}

            <div className="approval-header">

                <h1>
                    Approvals
                </h1>

                <p>
                    Review and manage requests
                    that require your approval.
                </p>

            </div>


            {/* =====================================================
                SUMMARY CARDS
            ===================================================== */}

            <div className="approval-summary">


                {/* PENDING */}

                <div
                    className="approval-card"
                    onClick={() =>
                        handleCardClick("Pending")
                    }
                    style={{
                        cursor: "pointer"
                    }}
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


                {/* APPROVED */}

                <div
                    className="approval-card"
                    onClick={() =>
                        handleCardClick("Approved")
                    }
                    style={{
                        cursor: "pointer"
                    }}
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


                {/* REJECTED */}

                <div
                    className="approval-card"
                    onClick={() =>
                        handleCardClick("Rejected")
                    }
                    style={{
                        cursor: "pointer"
                    }}
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


                {/* TOTAL */}

                <div
                    className="approval-card"
                    onClick={() =>
                        handleCardClick("All")
                    }
                    style={{
                        cursor: "pointer"
                    }}
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


            {/* =====================================================
                REQUEST PANEL
            ===================================================== */}

            <div className="approval-panel">


                {/* FILTER BAR */}

                <div className="approval-filter-bar">


                    {/* SEARCH */}

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


                    {/* REQUEST TYPE */}

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


                    {/* STATUS */}

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


                    {/* DATE */}

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


                    {/* EXPORT */}

                    <button
                        type="button"
                        className="approval-export-btn"
                        onClick={handleExport}
                    >

                        <FileDownloadRoundedIcon />

                        Export

                    </button>


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
                                    (request) => {


                                        const employeeName =
                                            request.employeeName ||
                                            request.employee?.employeeName ||
                                            "—";


                                        const employeeId =
                                            request.employeeId ||
                                            request.employee?.employeeId ||
                                            "—";


                                        return (

                                            <tr
                                                key={
                                                    request.approvalRequestId ||
                                                    request.requestId ||
                                                    request.id
                                                }
                                            >


                                                {/* REQUEST ID */}

                                                <td>

                                                    {
                                                        request.requestId ||
                                                        request.id ||
                                                        request.approvalRequestId ||
                                                        "—"
                                                    }

                                                </td>


                                                {/* EMPLOYEE */}

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


                                                {/* REQUEST TYPE */}

                                                <td>

                                                    {
                                                        request.requestType ||
                                                        "—"
                                                    }

                                                </td>


                                                {/* FROM */}

                                                <td>

                                                    {
                                                        formatDate(
                                                            request.fromDate
                                                        )
                                                    }

                                                </td>


                                                {/* TO */}

                                                <td>

                                                    {
                                                        formatDate(
                                                            request.toDate
                                                        )
                                                    }

                                                </td>


                                                {/* APPLIED */}

                                                <td>

                                                    {
                                                        formatDate(
                                                            request.appliedOn ||
                                                            request.createdDate ||
                                                            request.requestedDate
                                                        )
                                                    }

                                                </td>


                                                {/* STATUS */}

                                                <td>

                                                    <span
                                                        className={`approval-status ${getStatusClass(
                                                            request.status
                                                        )}`}
                                                    >

                                                        {
                                                            request.status ||
                                                            "—"
                                                        }

                                                    </span>

                                                </td>


                                                {/* ACTION */}

<td>
    <div className="approval-actions">

        {String(request.status || "").toLowerCase() === "pending" && (
            <>
                <button
                    type="button"
                    className="approval-approve-btn"
                    onClick={() =>
                        openStatusPopup(request, "Approved")
                    }
                >
                    Approve
                </button>

                <button
                    type="button"
                    className="approval-reject-btn"
                    onClick={() =>
                        openStatusPopup(request, "Rejected")
                    }
                >
                    Reject
                </button>
            </>
        )}

        <button
            type="button"
            className="approval-view-btn"
            onClick={() => handleView(request)}
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

                        {requests.length}

                        {" "}entries

                    </span>

                </div>


            </div>

{selectedRequest && (
    <div className="approval-details-overlay">
        <div className="approval-details-modal">

            <div className="approval-details-header">
                <div>
                    <h2>Leave Request Details</h2>
                    <p>
                        Request ID:{" "}
                        {selectedRequest.requestId ||
                            selectedRequest.leaveId ||
                            "—"}
                    </p>
                </div>

                <button
                    type="button"
                    className="approval-details-close"
                    onClick={handleCloseDetails}
                >
                    ×
                </button>
            </div>

            <div className="approval-details-body">

                <div className="approval-detail-item">
                    <span>Employee ID</span>
                    <strong>
                        {selectedRequest.employeeId || "—"}
                    </strong>
                </div>

                <div className="approval-detail-item">
                    <span>Azure Employee ID</span>
                    <strong>
                        {selectedRequest.azureEmployeeId || "—"}
                    </strong>
                </div>

                <div className="approval-detail-item">
                    <span>Employee Name</span>
                    <strong>
                        {selectedRequest.employeeName || "—"}
                    </strong>
                </div>

                <div className="approval-detail-item">
                    <span>Leave Type</span>
                    <strong>
                        {getLeaveTypeName(
                            selectedRequest.leaveTypeId
                        )}
                    </strong>
                </div>

                <div className="approval-detail-item">
                    <span>From Date</span>
                    <strong>
                        {formatDate(selectedRequest.fromDate)}
                    </strong>
                </div>

                <div className="approval-detail-item">
                    <span>To Date</span>
                    <strong>
                        {formatDate(selectedRequest.toDate)}
                    </strong>
                </div>

                <div className="approval-detail-item">
                    <span>Number of Days</span>
                    <strong>
                        {calculateDays(
                            selectedRequest.fromDate,
                            selectedRequest.toDate
                        )}
                    </strong>
                </div>

                <div className="approval-detail-item">
                    <span>Status</span>
                    <span
                        className={`approval-status ${getStatusClass(
                            selectedRequest.status
                        )}`}
                    >
                        {selectedRequest.status || "—"}
                    </span>
                </div>

                <div className="approval-detail-item">
                    <span>Reason</span>
                    <strong>
                        {selectedRequest.reason || "—"}
                    </strong>
                </div>

                <div className="approval-detail-item">
                    <span>Manager Comment</span>
                    <strong>
                        {selectedRequest.managerComment || "—"}
                    </strong>
                </div>

                {String(
                    selectedRequest.status || ""
                ).toLowerCase() !== "pending" && (
                    <>
                        <div className="approval-detail-item">
                            <span>Approved / Rejected By</span>
                            <strong>
                                {getEmployeeNameById(
                                    selectedRequest.approvedBy
                                )}
                            </strong>
                        </div>

                        <div className="approval-detail-item">
                            <span>Decision Date</span>
                            <strong>
                                {selectedRequest.approvedDate
                                    ? formatDate(
                                        selectedRequest.approvedDate
                                    )
                                    : "—"}
                            </strong>
                        </div>
                    </>
                )}

            </div>

        </div>
    </div>
)}


{selectedLeave && (
    <div className="approval-details-overlay">
        <div className="approval-details-modal">

            <div className="approval-details-header">
                <div>
                    <h2>
                        {selectedStatus === "Approved"
                            ? "Approve Leave"
                            : "Reject Leave"}
                    </h2>

                    <p>
                        Request ID:{" "}
                        {selectedLeave.requestId ||
                            selectedLeave.leaveId ||
                            "—"}
                    </p>
                </div>

                <button
                    type="button"
                    className="approval-details-close"
                    onClick={() => {
                        setSelectedLeave(null);
                        setSelectedStatus("");
                        setManagerComment("");
                    }}
                >
                    ×
                </button>
            </div>

            <div className="approval-details-body">

                <div className="approval-detail-item">
                    <span>Employee ID</span>
                    <strong>
                        {selectedLeave.employeeId || "—"}
                    </strong>
                </div>

                <div className="approval-detail-item">
                    <span>Employee Name</span>
                    <strong>
                        {selectedLeave.employeeName || "—"}
                    </strong>
                </div>

                <div className="approval-detail-item">
                    <span>Leave Type</span>
                    <strong>
                        {getLeaveTypeName(
                            selectedLeave.leaveTypeId
                        )}
                    </strong>
                </div>

                <div className="approval-detail-item">
                    <span>From Date</span>
                    <strong>
                        {formatDate(selectedLeave.fromDate)}
                    </strong>
                </div>

                <div className="approval-detail-item">
                    <span>To Date</span>
                    <strong>
                        {formatDate(selectedLeave.toDate)}
                    </strong>
                </div>

                <div className="approval-detail-item">
                    <span>Reason</span>
                    <strong>
                        {selectedLeave.reason || "—"}
                    </strong>
                </div>

                <div style={{ marginTop: "18px", width: "100%" }}>
                    <label
                        htmlFor="approval-manager-comment"
                        style={{
                            display: "block",
                            marginBottom: "8px",
                            fontWeight: 600
                        }}
                    >
                        Manager Comment
                    </label>

                    <textarea
                        id="approval-manager-comment"
                        value={managerComment}
                        onChange={(event) =>
                            setManagerComment(event.target.value)
                        }
                        placeholder={
                            selectedStatus === "Approved"
                                ? "Enter approval comment"
                                : "Enter reason for rejection"
                        }
                        rows={4}
                        style={{
                            width: "100%",
                            boxSizing: "border-box",
                            resize: "vertical",
                            padding: "10px",
                            border: "1px solid #d8dee9",
                            borderRadius: "8px",
                            fontFamily: "inherit"
                        }}
                    />
                </div>

            </div>

            <div
                style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "10px",
                    padding: "0 24px 24px"
                }}
            >
                <button
                    type="button"
                    className="modal-cancel-btn"
                    onClick={() => {
                        setSelectedLeave(null);
                        setSelectedStatus("");
                        setManagerComment("");
                    }}
                >
                    Cancel
                </button>

                <button
                    type="button"
                    className={
                        selectedStatus === "Approved"
                            ? "modal-approve-btn"
                            : "modal-reject-btn"
                    }
                    onClick={updateStatus}
                >
                    {selectedStatus === "Approved"
                        ? "Confirm Approval"
                        : "Confirm Rejection"}
                </button>
            </div>

        </div>
    </div>
)}



        </div>

    );

};


export default Approval;