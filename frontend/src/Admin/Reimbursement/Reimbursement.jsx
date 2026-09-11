import React, { useEffect, useMemo, useState } from "react";
import "./Reimbursement.css";

import {
    Avatar,
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    IconButton,
    InputAdornment,
    MenuItem,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import PendingActionsRoundedIcon from "@mui/icons-material/PendingActionsRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";

import {
    getReimbursements,
    getReimbursementSummary,
    createReimbursement,
    updateReimbursementStatus,
} from "../Services/ReimbursementService";


const API_BASE_URL = "http://localhost:5182";


const employees = [
    {
        id: 1,
        employeeCode: "EMP-1024",
        name: "John Smith",
    },
    {
        id: 2,
        employeeCode: "EMP-1018",
        name: "Sarah Khan",
    },
    {
        id: 3,
        employeeCode: "EMP-1009",
        name: "Alex Thomas",
    },
    {
        id: 4,
        employeeCode: "EMP-1007",
        name: "Michael Joseph",
    },
    {
        id: 5,
        employeeCode: "EMP-1020",
        name: "Priya Sharma",
    },
    {
        id: 6,
        employeeCode: "EMP-1011",
        name: "David Wilson",
    },
];


const categories = [
    "Travel",
    "Meals",
    "Medical",
    "Accommodation",
    "Office Expense",
    "Communication",
    "Other",
];


const emptyForm = {
    employeeId: "",
    employeeName: "",
    category: "",
    expenseDate: "",
    amount: "",
    paymentMethod: "Personal",
    description: "",
    notes: "",
    receipt: null,
};


function Reimbursement() {

    const [reimbursements, setReimbursements] = useState([]);

    const [summary, setSummary] = useState({
        totalClaims: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        totalReimbursed: 0,
    });

    const [loading, setLoading] = useState(true);

    const [submitting, setSubmitting] = useState(false);

    const [statusUpdating, setStatusUpdating] = useState(false);

    const [error, setError] = useState("");

    const [searchTerm, setSearchTerm] = useState("");

    const [statusFilter, setStatusFilter] = useState("All");

    const [categoryFilter, setCategoryFilter] = useState("All");

    const [showFilters, setShowFilters] = useState(false);

    const [showForm, setShowForm] = useState(false);

    const [selectedReimbursement, setSelectedReimbursement] =
        useState(null);

    /*
     * This ID is set ONLY after the PDF has been
     * successfully fetched and opened.
     */
    const [receiptViewedForId, setReceiptViewedForId] =
        useState(null);

    const [formData, setFormData] = useState({
        ...emptyForm,
    });


    /* =====================================================
       LOAD REIMBURSEMENTS
    ===================================================== */

    const loadReimbursements = async () => {

        try {

            const response = await getReimbursements();

            if (response?.success === false) {

                throw new Error(
                    response?.message ||
                    "Unable to load reimbursements."
                );

            }

            const data = response?.data || [];

            setReimbursements(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (err) {

            console.error(
                "Failed to load reimbursements:",
                err
            );

            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Failed to load reimbursements."
            );

        }

    };


    /* =====================================================
       LOAD SUMMARY
    ===================================================== */

    const loadSummary = async () => {

        try {

            const response =
                await getReimbursementSummary();

            if (response?.success === false) {
                return;
            }

            const data =
                response?.data || {};

            setSummary({
                totalClaims:
                    data.totalClaims ?? 0,

                pending:
                    data.pending ?? 0,

                approved:
                    data.approved ?? 0,

                rejected:
                    data.rejected ?? 0,

                totalReimbursed:
                    data.totalReimbursed ?? 0,
            });

        } catch (err) {

            console.error(
                "Failed to load summary:",
                err
            );

        }

    };


    /* =====================================================
       LOAD DATA
    ===================================================== */

    const loadData = async () => {

        try {

            setLoading(true);

            setError("");

            await Promise.all([
                loadReimbursements(),
                loadSummary(),
            ]);

        } finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        loadData();

    }, []);


    /* =====================================================
       CURRENCY
    ===================================================== */

    const formatCurrency = (amount) => {

        return new Intl.NumberFormat(
            "en-IN",
            {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0,
            }
        ).format(
            Number(amount || 0)
        );

    };


    /* =====================================================
       DATE
    ===================================================== */

    const formatDate = (date) => {

        if (!date) {
            return "-";
        }

        const parsedDate =
            new Date(date);

        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {

            return date;

        }

        return parsedDate.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );

    };


    /* =====================================================
       EMPLOYEE CODE
    ===================================================== */

    const getEmployeeCode = (employeeId) => {

        if (!employeeId) {
            return "-";
        }

        const employee =
            employees.find(
                (item) =>
                    Number(item.id) ===
                    Number(employeeId)
            );

        if (employee) {
            return employee.employeeCode;
        }

        return `EMP-${String(
            employeeId
        ).padStart(4, "0")}`;

    };


    /* =====================================================
       STATUS COLOR
    ===================================================== */

    const getStatusColor = (status) => {

        switch (
            String(status || "")
                .toLowerCase()
        ) {

            case "approved":
                return "success";

            case "rejected":
                return "error";

            case "pending":
            default:
                return "warning";

        }

    };


    /* =====================================================
       RECEIPT EXISTS
    ===================================================== */

    const hasReceipt = (reimbursement) => {

        return Boolean(
            reimbursement?.receiptFileName ||
            reimbursement?.ReceiptFileName ||
            reimbursement?.receiptFilePath ||
            reimbursement?.ReceiptFilePath
        );

    };


    /* =====================================================
       RECEIPT FILE NAME
    ===================================================== */

    const getReceiptFileName = (reimbursement) => {

        return (
            reimbursement?.receiptFileName ||
            reimbursement?.ReceiptFileName ||
            "reimbursement-receipt.pdf"
        );

    };


    /* =====================================================
       RECEIPT URL
    ===================================================== */

    const getReceiptUrl = (reimbursement) => {

        if (!reimbursement?.id) {
            return null;
        }

        /*
         * NEVER expose ReceiptFilePath directly.
         *
         * The browser uses the backend endpoint.
         */

        return (
            `${API_BASE_URL}` +
            `/api/reimbursements/` +
            `${reimbursement.id}/receipt`
        );

    };


    /* =====================================================
       VIEW PDF
    ===================================================== */

    const handleViewReceipt = async (
        reimbursement
    ) => {

        const url =
            getReceiptUrl(
                reimbursement
            );

        if (!url) {

            setError(
                "Receipt PDF is not available."
            );

            return;

        }

        try {

            setError("");

            /*
             * Fetch PDF first.
             *
             * This is important because we only want
             * to enable Approve / Reject after the
             * document has actually been loaded.
             */

            const response =
                await fetch(url);

            if (!response.ok) {

                throw new Error(
                    "The receipt PDF could not be loaded from the server."
                );

            }

            const blob =
                await response.blob();

            const contentType =
                String(
                    response.headers.get(
                        "content-type"
                    ) || ""
                ).toLowerCase();

            if (
                contentType &&
                !contentType.includes(
                    "application/pdf"
                )
            ) {

                throw new Error(
                    "The attached document is not a PDF."
                );

            }

            const blobUrl =
                window.URL.createObjectURL(
                    blob
                );

            const newWindow =
                window.open(
                    blobUrl,
                    "_blank"
                );

            if (!newWindow) {

                window.URL.revokeObjectURL(
                    blobUrl
                );

                setError(
                    "The PDF could not be opened. Please allow pop-ups and try again."
                );

                return;

            }

            /*
             * PDF successfully fetched and opened.
             *
             * APPROVE / REJECT can now be enabled.
             */

            setReceiptViewedForId(
                reimbursement.id
            );

            /*
             * Give browser PDF viewer time to load.
             */

            setTimeout(() => {

                window.URL.revokeObjectURL(
                    blobUrl
                );

            }, 60000);

        } catch (err) {

            console.error(
                "Failed to view receipt:",
                err
            );

            setReceiptViewedForId(null);

            setError(
                err?.message ||
                "Unable to view the receipt PDF."
            );

        }

    };


    /* =====================================================
       DOWNLOAD PDF
    ===================================================== */

    const handleDownloadReceipt = async (
        reimbursement
    ) => {

        const url =
            getReceiptUrl(
                reimbursement
            );

        if (!url) {

            setError(
                "Receipt PDF is not available."
            );

            return;

        }

        try {

            setError("");

            const response =
                await fetch(url);

            if (!response.ok) {

                throw new Error(
                    "Unable to download receipt."
                );

            }

            const blob =
                await response.blob();

            const blobUrl =
                window.URL.createObjectURL(
                    blob
                );

            const link =
                document.createElement("a");

            link.href =
                blobUrl;

            link.download =
                getReceiptFileName(
                    reimbursement
                );

            document.body.appendChild(
                link
            );

            link.click();

            link.remove();

            window.URL.revokeObjectURL(
                blobUrl
            );

        } catch (err) {

            console.error(
                "Receipt download failed:",
                err
            );

            setError(
                err?.message ||
                "Unable to download receipt."
            );

        }

    };


    /* =====================================================
       FILTER
    ===================================================== */

    const filteredReimbursements =
        useMemo(() => {

            const search =
                searchTerm
                    .trim()
                    .toLowerCase();

            return reimbursements.filter(
                (item) => {

                    const claimNumber =
                        String(
                            item.claimNumber ||
                            item.id ||
                            ""
                        ).toLowerCase();

                    const employeeName =
                        String(
                            item.employeeName ||
                            item.employee ||
                            ""
                        ).toLowerCase();

                    const employeeId =
                        String(
                            item.employeeId ||
                            ""
                        ).toLowerCase();

                    const category =
                        String(
                            item.category ||
                            ""
                        ).toLowerCase();

                    const description =
                        String(
                            item.description ||
                            ""
                        ).toLowerCase();

                    const matchesSearch =
                        !search ||
                        claimNumber.includes(search) ||
                        employeeName.includes(search) ||
                        employeeId.includes(search) ||
                        category.includes(search) ||
                        description.includes(search);

                    const matchesStatus =
                        statusFilter === "All" ||
                        String(
                            item.status ||
                            "Pending"
                        ).toLowerCase() ===
                            statusFilter.toLowerCase();

                    const matchesCategory =
                        categoryFilter === "All" ||
                        String(
                            item.category ||
                            ""
                        ) === categoryFilter;

                    return (
                        matchesSearch &&
                        matchesStatus &&
                        matchesCategory
                    );

                }
            );

        }, [
            reimbursements,
            searchTerm,
            statusFilter,
            categoryFilter,
        ]);


    /* =====================================================
       INPUT
    ===================================================== */

    const handleInputChange = (event) => {

        const {
            name,
            value,
        } = event.target;

        setFormData(
            (previous) => ({
                ...previous,
                [name]: value,
            })
        );

    };


    /* =====================================================
       EMPLOYEE
    ===================================================== */

    const handleEmployeeChange = (event) => {

        const selectedId =
            event.target.value;

        const employee =
            employees.find(
                (item) =>
                    String(item.id) ===
                    String(selectedId)
            );

        setFormData(
            (previous) => ({
                ...previous,

                employeeId:
                    employee?.id || "",

                employeeName:
                    employee?.name || "",
            })
        );

    };


    /* =====================================================
       RECEIPT UPLOAD
    ===================================================== */

    const handleReceiptChange = (event) => {

        const file =
            event.target.files?.[0];

        if (!file) {
            return;
        }

        const isPdf =
            file.type ===
                "application/pdf" ||
            file.name
                .toLowerCase()
                .endsWith(".pdf");

        if (!isPdf) {

            setError(
                "Only PDF files are allowed."
            );

            event.target.value = "";

            return;

        }

        const maxSize =
            10 * 1024 * 1024;

        if (
            file.size >
            maxSize
        ) {

            setError(
                "PDF file must be 10 MB or smaller."
            );

            event.target.value = "";

            return;

        }

        setError("");

        setFormData(
            (previous) => ({
                ...previous,
                receipt: file,
            })
        );

    };


    /* =====================================================
       REMOVE RECEIPT
    ===================================================== */

    const removeReceipt = () => {

        setFormData(
            (previous) => ({
                ...previous,
                receipt: null,
            })
        );

    };


    /* =====================================================
       RESET FORM
    ===================================================== */

    const resetForm = () => {

        setFormData({
            ...emptyForm,
        });

    };


    /* =====================================================
       OPEN FORM
    ===================================================== */

    const handleOpenForm = () => {

        setError("");

        resetForm();

        setShowForm(true);

    };


    /* =====================================================
       CLOSE FORM
    ===================================================== */

    const handleCloseForm = () => {

        if (submitting) {
            return;
        }

        setShowForm(false);

        resetForm();

    };


    /* =====================================================
       SUBMIT
    ===================================================== */

    const handleSubmit = async (event) => {

        event.preventDefault();

        if (submitting) {
            return;
        }

        if (!formData.employeeId) {

            setError(
                "Please select an employee."
            );

            return;

        }

        if (!formData.category) {

            setError(
                "Please select an expense category."
            );

            return;

        }

        if (!formData.expenseDate) {

            setError(
                "Please select the expense date."
            );

            return;

        }

        if (
            !formData.amount ||
            Number(formData.amount) <= 0
        ) {

            setError(
                "Please enter a valid amount."
            );

            return;

        }

        if (
            !formData.description.trim()
        ) {

            setError(
                "Please enter a description."
            );

            return;

        }

        if (!formData.receipt) {

            setError(
                "Please attach the reimbursement receipt as a PDF."
            );

            return;

        }

        try {

            setSubmitting(true);

            setError("");

            /*
             * Backend expects multipart/form-data.
             */

            const payload =
                new FormData();

            payload.append(
                "employeeId",
                String(
                    Number(
                        formData.employeeId
                    )
                )
            );

            payload.append(
                "employeeName",
                formData.employeeName
            );

            payload.append(
                "category",
                formData.category
            );

            payload.append(
                "amount",
                String(
                    Number(
                        formData.amount
                    )
                )
            );

            payload.append(
                "description",
                formData.description.trim()
            );

            payload.append(
                "submittedDate",
                new Date().toISOString()
            );

            payload.append(
                "paymentMethod",
                formData.paymentMethod || ""
            );

            payload.append(
                "expenseDate",
                formData.expenseDate || ""
            );

            payload.append(
                "notes",
                formData.notes || ""
            );

            payload.append(
                "receipt",
                formData.receipt,
                formData.receipt.name
            );

            const response =
                await createReimbursement(
                    payload
                );

            if (
                response?.success === false
            ) {

                throw new Error(
                    response?.message ||
                    "Failed to create reimbursement."
                );

            }

            setShowForm(false);

            resetForm();

            await loadData();

        } catch (err) {

            console.error(
                "Failed to create reimbursement:",
                err
            );

            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Failed to create reimbursement."
            );

        } finally {

            setSubmitting(false);

        }

    };


    /* =====================================================
       STATUS CHANGE
    ===================================================== */

    const handleStatusChange = async (
        status
    ) => {

        if (!selectedReimbursement) {
            return;
        }

        const id =
            selectedReimbursement.id;

        if (!id) {
            return;
        }

        /*
         * Only allow status change after PDF review.
         */

        if (
            receiptViewedForId !== id
        ) {

            setError(
                "Please view the receipt PDF before approving or rejecting this claim."
            );

            return;

        }

        try {

            setStatusUpdating(true);

            setError("");

            const remarks =
                status === "Approved"
                    ? "Approved by HR"
                    : "Rejected by HR";

            const response =
                await updateReimbursementStatus(
                    id,
                    status,
                    remarks
                );

            if (
                response?.success === false
            ) {

                throw new Error(
                    response?.message ||
                    `Failed to change reimbursement status to ${status}.`
                );

            }

            setSelectedReimbursement(
                null
            );

            setReceiptViewedForId(
                null
            );

            await loadData();

        } catch (err) {

            console.error(
                "Failed to update reimbursement status:",
                err
            );

            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Failed to update reimbursement status."
            );

        } finally {

            setStatusUpdating(false);

        }

    };


    const handleApprove = () => {

        handleStatusChange(
            "Approved"
        );

    };


    const handleReject = () => {

        handleStatusChange(
            "Rejected"
        );

    };


    /* =====================================================
       RENDER
    ===================================================== */

    return (

        <Box className="reimbursement-page">

            {/* HEADER */}

            <Box className="reimbursement-header">

                <Box className="reimbursement-header-content">

                    <Typography
                        variant="h5"
                        className="reimbursement-title"
                    >
                        Reimbursements
                    </Typography>

                    <Typography
                        variant="body2"
                        className="reimbursement-subtitle"
                    >
                        Manage employee expense claims and
                        reimbursement requests.
                    </Typography>

                </Box>

                <Button
                    variant="contained"
                    startIcon={
                        <AddRoundedIcon />
                    }
                    className="reimbursement-new-button"
                    onClick={
                        handleOpenForm
                    }
                >
                    New Reimbursement
                </Button>

            </Box>


            {/* ERROR */}

            {error && (

                <Alert
                    severity="error"
                    onClose={() =>
                        setError("")
                    }
                    className="reimbursement-alert"
                >
                    {error}
                </Alert>

            )}


            {/* SUMMARY */}

            <Box className="reimbursement-summary">

                <SummaryCard
                    title="Total Claims"
                    value={
                        summary.totalClaims
                    }
                    icon={
                        <ReceiptLongRoundedIcon />
                    }
                    type="total"
                />

                <SummaryCard
                    title="Pending"
                    value={
                        summary.pending
                    }
                    icon={
                        <PendingActionsRoundedIcon />
                    }
                    type="pending"
                />

                <SummaryCard
                    title="Approved"
                    value={
                        summary.approved
                    }
                    icon={
                        <CheckCircleRoundedIcon />
                    }
                    type="approved"
                />

                <SummaryCard
                    title="Rejected"
                    value={
                        summary.rejected
                    }
                    icon={
                        <CancelRoundedIcon />
                    }
                    type="rejected"
                />

                <SummaryCard
                    title="Total Reimbursed"
                    value={
                        formatCurrency(
                            summary.totalReimbursed
                        )
                    }
                    icon={
                        <PaymentsRoundedIcon />
                    }
                    type="reimbursed"
                />

            </Box>


            {/* MAIN CARD */}

            <Card
                elevation={0}
                className="reimbursement-main-card"
            >

                {/* TOOLBAR */}

                <Box className="reimbursement-toolbar">

                    <TextField
                        size="small"
                        value={searchTerm}
                        className="reimbursement-search"
                        placeholder="Search claims, employees..."
                        onChange={(event) =>
                            setSearchTerm(
                                event.target.value
                            )
                        }
                        InputProps={{
                            startAdornment: (

                                <InputAdornment
                                    position="start"
                                >
                                    <SearchRoundedIcon />
                                </InputAdornment>

                            ),
                        }}
                    />

                    <Box className="reimbursement-toolbar-actions">

                        <FormControl
                            size="small"
                            className="reimbursement-status-filter"
                        >

                            <Select
                                value={
                                    statusFilter
                                }
                                onChange={(event) =>
                                    setStatusFilter(
                                        event.target.value
                                    )
                                }
                            >

                                <MenuItem value="All">
                                    All Status
                                </MenuItem>

                                <MenuItem value="Pending">
                                    Pending
                                </MenuItem>

                                <MenuItem value="Approved">
                                    Approved
                                </MenuItem>

                                <MenuItem value="Rejected">
                                    Rejected
                                </MenuItem>

                            </Select>

                        </FormControl>

                        <Button
                            variant={
                                showFilters
                                    ? "contained"
                                    : "outlined"
                            }
                            startIcon={
                                <FilterListRoundedIcon />
                            }
                            className="reimbursement-filter-button"
                            onClick={() =>
                                setShowFilters(
                                    (previous) =>
                                        !previous
                                )
                            }
                        >
                            Filters
                        </Button>

                    </Box>

                </Box>


                {/* FILTER */}

                {showFilters && (

                    <Box
                        className="reimbursement-filter-panel"
                    >

                        <Box>

                            <Typography
                                variant="caption"
                                className="filter-label"
                            >
                                Category
                            </Typography>

                            <FormControl
                                size="small"
                                className="category-filter"
                            >

                                <Select
                                    value={
                                        categoryFilter
                                    }
                                    onChange={(event) =>
                                        setCategoryFilter(
                                            event.target.value
                                        )
                                    }
                                >

                                    <MenuItem value="All">
                                        All Categories
                                    </MenuItem>

                                    {categories.map(
                                        (category) => (

                                            <MenuItem
                                                key={
                                                    category
                                                }
                                                value={
                                                    category
                                                }
                                            >
                                                {category}
                                            </MenuItem>

                                        )
                                    )}

                                </Select>

                            </FormControl>

                        </Box>

                    </Box>

                )}


                {/* CONTENT */}

                {loading ? (

                    <Box
                        className="reimbursement-loading"
                    >

                        <CircularProgress />

                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            Loading reimbursements...
                        </Typography>

                    </Box>

                ) : (

                    <>

                        <TableContainer
                            className="reimbursement-table-container"
                        >

                            <Table
                                className="reimbursement-table"
                            >

                                <TableHead>

                                    <TableRow>

                                        <TableCell>
                                            Claim
                                        </TableCell>

                                        <TableCell>
                                            Employee
                                        </TableCell>

                                        <TableCell>
                                            Category
                                        </TableCell>

                                        <TableCell>
                                            Amount
                                        </TableCell>

                                        <TableCell>
                                            Submitted
                                        </TableCell>

                                        <TableCell>
                                            Status
                                        </TableCell>

                                        <TableCell>
                                            Action
                                        </TableCell>

                                    </TableRow>

                                </TableHead>


                                <TableBody>

                                    {filteredReimbursements.map(
                                        (item) => {

                                            const claimNumber =
                                                item.claimNumber ||
                                                `RB-${String(
                                                    item.id
                                                ).padStart(
                                                    5,
                                                    "0"
                                                )}`;

                                            const employeeName =
                                                item.employeeName ||
                                                item.employee ||
                                                "Unknown Employee";

                                            const employeeCode =
                                                getEmployeeCode(
                                                    item.employeeId
                                                );

                                            return (

                                                <TableRow
                                                    key={
                                                        item.id
                                                    }
                                                    hover
                                                >

                                                    <TableCell>

                                                        <Box
                                                            className="claim-cell"
                                                        >

                                                            <ReceiptLongRoundedIcon />

                                                            <Typography>
                                                                {
                                                                    claimNumber
                                                                }
                                                            </Typography>

                                                        </Box>

                                                    </TableCell>


                                                    <TableCell>

                                                        <Box
                                                            className="employee-cell"
                                                        >

                                                            <Avatar>
                                                                {employeeName
                                                                    .charAt(0)
                                                                    .toUpperCase()}
                                                            </Avatar>

                                                            <Box>

                                                                <Typography
                                                                    className="employee-name"
                                                                >
                                                                    {
                                                                        employeeName
                                                                    }
                                                                </Typography>

                                                                <Typography
                                                                    className="employee-id"
                                                                >
                                                                    {
                                                                        employeeCode
                                                                    }
                                                                </Typography>

                                                            </Box>

                                                        </Box>

                                                    </TableCell>


                                                    <TableCell>
                                                        {
                                                            item.category ||
                                                            "-"
                                                        }
                                                    </TableCell>


                                                    <TableCell>

                                                        <Typography
                                                            className="amount-cell"
                                                        >
                                                            {
                                                                formatCurrency(
                                                                    item.amount
                                                                )
                                                            }
                                                        </Typography>

                                                    </TableCell>


                                                    <TableCell>

                                                        <Typography
                                                            className="submitted-cell"
                                                        >
                                                            {
                                                                formatDate(
                                                                    item.submittedDate ||
                                                                    item.createdAt
                                                                )
                                                            }
                                                        </Typography>

                                                    </TableCell>


                                                    <TableCell>

                                                        <Chip
                                                            size="small"
                                                            label={
                                                                item.status ||
                                                                "Pending"
                                                            }
                                                            color={
                                                                getStatusColor(
                                                                    item.status
                                                                )
                                                            }
                                                            className="status-chip"
                                                        />

                                                    </TableCell>


                                                    <TableCell>

                                                        <Box
                                                            className="action-cell"
                                                        >

                                                            <Tooltip
                                                                title="View Details"
                                                            >

                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => {

                                                                        setSelectedReimbursement(
                                                                            item
                                                                        );

                                                                        setReceiptViewedForId(
                                                                            null
                                                                        );

                                                                        setError(
                                                                            ""
                                                                        );

                                                                    }}
                                                                >

                                                                    <VisibilityRoundedIcon />

                                                                </IconButton>

                                                            </Tooltip>


                                                            <Tooltip
                                                                title="More"
                                                            >

                                                                <IconButton
                                                                    size="small"
                                                                >
                                                                    <MoreVertRoundedIcon />
                                                                </IconButton>

                                                            </Tooltip>

                                                        </Box>

                                                    </TableCell>

                                                </TableRow>

                                            );

                                        }
                                    )}


                                    {filteredReimbursements.length ===
                                        0 && (

                                        <TableRow>

                                            <TableCell
                                                colSpan={7}
                                                className="empty-table-cell"
                                            >

                                                <Box
                                                    className="empty-reimbursement"
                                                >

                                                    <ReceiptLongRoundedIcon />

                                                    <Typography>
                                                        No reimbursement
                                                        claims found.
                                                    </Typography>

                                                </Box>

                                            </TableCell>

                                        </TableRow>

                                    )}

                                </TableBody>

                            </Table>

                        </TableContainer>


                        {/* =================================================
                            FIXED FOOTER
                            No problematic {" "} expressions.
                        ================================================= */}

                        <Box
                            className="reimbursement-footer"
                        >

                            <Typography variant="caption">

                                Showing{" "}
                                <strong>
                                    {filteredReimbursements.length}
                                </strong>{" "}
                                of{" "}
                                <strong>
                                    {reimbursements.length}
                                </strong>{" "}
                                claims

                            </Typography>

                        </Box>

                    </>

                )}

            </Card>


            {/* =========================================================
                NEW REIMBURSEMENT DIALOG
            ========================================================= */}

            <Dialog
                open={showForm}
                onClose={handleCloseForm}
                fullWidth
                maxWidth="md"
            >

                <Box
                    component="form"
                    onSubmit={handleSubmit}
                >

                    <DialogTitle>

                        <Typography variant="h6">
                            New Reimbursement
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            Submit a new employee expense claim.
                        </Typography>

                    </DialogTitle>

                    <Divider />

                    <DialogContent>

                        <Box
                            className="reimbursement-form-grid"
                        >

                            {/* EMPLOYEE */}

                            <TextField
                                fullWidth
                                required
                                select
                                label="Employee"
                                name="employeeId"
                                value={
                                    formData.employeeId
                                }
                                onChange={
                                    handleEmployeeChange
                                }
                            >

                                <MenuItem value="">
                                    Select employee
                                </MenuItem>

                                {employees.map(
                                    (employee) => (

                                        <MenuItem
                                            key={
                                                employee.id
                                            }
                                            value={
                                                employee.id
                                            }
                                        >
                                            {employee.name}
                                            {" — "}
                                            {employee.employeeCode}
                                        </MenuItem>

                                    )
                                )}

                            </TextField>


                            {/* CATEGORY */}

                            <TextField
                                fullWidth
                                required
                                select
                                label="Expense Category"
                                name="category"
                                value={
                                    formData.category
                                }
                                onChange={
                                    handleInputChange
                                }
                            >

                                <MenuItem value="">
                                    Select category
                                </MenuItem>

                                {categories.map(
                                    (category) => (

                                        <MenuItem
                                            key={
                                                category
                                            }
                                            value={
                                                category
                                            }
                                        >
                                            {category}
                                        </MenuItem>

                                    )
                                )}

                            </TextField>


                            {/* DATE */}

                            <TextField
                                fullWidth
                                required
                                type="date"
                                label="Expense Date"
                                name="expenseDate"
                                value={
                                    formData.expenseDate
                                }
                                onChange={
                                    handleInputChange
                                }
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />


                            {/* AMOUNT */}

                            <TextField
                                fullWidth
                                required
                                type="number"
                                label="Amount"
                                name="amount"
                                value={
                                    formData.amount
                                }
                                onChange={
                                    handleInputChange
                                }
                                inputProps={{
                                    min: 0,
                                    step: 0.01,
                                }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment
                                            position="start"
                                        >
                                            ₹
                                        </InputAdornment>
                                    ),
                                }}
                            />


                            {/* PAYMENT */}

                            <TextField
                                fullWidth
                                select
                                label="Payment Method"
                                name="paymentMethod"
                                value={
                                    formData.paymentMethod
                                }
                                onChange={
                                    handleInputChange
                                }
                            >

                                <MenuItem value="Personal">
                                    Personal
                                </MenuItem>

                                <MenuItem value="Company Card">
                                    Company Card
                                </MenuItem>

                                <MenuItem value="Cash">
                                    Cash
                                </MenuItem>

                                <MenuItem value="Other">
                                    Other
                                </MenuItem>

                            </TextField>


                            {/* DESCRIPTION */}

                            <TextField
                                fullWidth
                                required
                                label="Description"
                                name="description"
                                value={
                                    formData.description
                                }
                                onChange={
                                    handleInputChange
                                }
                                placeholder="Describe the expense"
                            />


                            {/* RECEIPT */}

                            <Box
                                className="receipt-upload-wrapper"
                            >

                                <Typography
                                    variant="caption"
                                    className="form-field-label"
                                >
                                    Receipt / Supporting Document
                                    {" "}
                                    (PDF only)
                                </Typography>


                                {!formData.receipt && (

                                    <Button
                                        component="label"
                                        variant="outlined"
                                        startIcon={
                                            <UploadFileRoundedIcon />
                                        }
                                        className="receipt-upload-button"
                                    >

                                        Upload Receipt

                                        <input
                                            hidden
                                            type="file"
                                            accept="application/pdf,.pdf"
                                            onChange={
                                                handleReceiptChange
                                            }
                                        />

                                    </Button>

                                )}


                                {formData.receipt && (

                                    <Box
                                        className="uploaded-receipt"
                                    >

                                        <ReceiptLongRoundedIcon />

                                        <Box
                                            className="uploaded-receipt-info"
                                        >

                                            <Typography>
                                                {
                                                    formData.receipt.name
                                                }
                                            </Typography>

                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                {(
                                                    formData.receipt.size /
                                                    1024
                                                ).toFixed(1)}
                                                {" "}
                                                KB
                                            </Typography>

                                        </Box>

                                        <IconButton
                                            size="small"
                                            onClick={
                                                removeReceipt
                                            }
                                        >
                                            <DeleteOutlineRoundedIcon />
                                        </IconButton>

                                    </Box>

                                )}

                            </Box>


                            {/* NOTES */}

                            <TextField
                                fullWidth
                                multiline
                                minRows={3}
                                label="Additional Notes"
                                name="notes"
                                value={
                                    formData.notes
                                }
                                onChange={
                                    handleInputChange
                                }
                                placeholder="Add any additional information..."
                                className="form-full-width"
                            />

                        </Box>

                    </DialogContent>

                    <Divider />

                    <DialogActions>

                        <Button
                            onClick={
                                handleCloseForm
                            }
                            disabled={
                                submitting
                            }
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            variant="contained"
                            disabled={
                                submitting
                            }
                            startIcon={
                                submitting ? (
                                    <CircularProgress
                                        size={18}
                                        color="inherit"
                                    />
                                ) : (
                                    <ReceiptLongRoundedIcon />
                                )
                            }
                        >
                            {submitting
                                ? "Submitting..."
                                : "Submit Reimbursement"}
                        </Button>

                    </DialogActions>

                </Box>

            </Dialog>


            {/* =========================================================
                DETAILS / REVIEW DIALOG
            ========================================================= */}

            <Dialog
                open={
                    Boolean(
                        selectedReimbursement
                    )
                }
                onClose={() => {

                    if (statusUpdating) {
                        return;
                    }

                    setSelectedReimbursement(
                        null
                    );

                    setReceiptViewedForId(
                        null
                    );

                }}
                fullWidth
                maxWidth="sm"
            >

                {selectedReimbursement && (

                    <>

                        <DialogTitle>

                            <Typography
                                variant="caption"
                                className="dialog-overline"
                            >
                                REIMBURSEMENT
                            </Typography>

                            <Typography variant="h6">

                                {
                                    selectedReimbursement.claimNumber ||
                                    `RB-${String(
                                        selectedReimbursement.id
                                    ).padStart(
                                        5,
                                        "0"
                                    )}`
                                }

                            </Typography>

                        </DialogTitle>


                        <Divider />


                        <DialogContent>

                            <Stack spacing={3}>

                                {/* AMOUNT */}

                                <Box
                                    className="detail-header"
                                >

                                    <Box>

                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            Claim Amount
                                        </Typography>

                                        <Typography
                                            variant="h5"
                                            className="detail-amount"
                                        >
                                            {
                                                formatCurrency(
                                                    selectedReimbursement.amount
                                                )
                                            }
                                        </Typography>

                                    </Box>

                                    <Chip
                                        label={
                                            selectedReimbursement.status ||
                                            "Pending"
                                        }
                                        color={
                                            getStatusColor(
                                                selectedReimbursement.status
                                            )
                                        }
                                    />

                                </Box>


                                <Divider />


                                {/* DETAILS */}

                                <Box
                                    className="details-grid"
                                >

                                    <DetailItem
                                        label="Employee"
                                        value={
                                            selectedReimbursement.employeeName ||
                                            selectedReimbursement.employee ||
                                            "-"
                                        }
                                    />

                                    <DetailItem
                                        label="Employee ID"
                                        value={
                                            getEmployeeCode(
                                                selectedReimbursement.employeeId
                                            )
                                        }
                                    />

                                    <DetailItem
                                        label="Category"
                                        value={
                                            selectedReimbursement.category ||
                                            "-"
                                        }
                                    />

                                    <DetailItem
                                        label="Expense Date"
                                        value={
                                            formatDate(
                                                selectedReimbursement.expenseDate
                                            )
                                        }
                                    />

                                    <DetailItem
                                        label="Submitted"
                                        value={
                                            formatDate(
                                                selectedReimbursement.submittedDate ||
                                                selectedReimbursement.createdAt
                                            )
                                        }
                                    />

                                    <DetailItem
                                        label="Payment Method"
                                        value={
                                            selectedReimbursement.paymentMethod ||
                                            "-"
                                        }
                                    />

                                </Box>


                                {/* DESCRIPTION */}

                                <Box>

                                    <Typography
                                        variant="caption"
                                        className="dialog-overline"
                                    >
                                        DESCRIPTION
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        {
                                            selectedReimbursement.description ||
                                            "No description provided."
                                        }
                                    </Typography>

                                </Box>


                                {/* NOTES */}

                                {selectedReimbursement.notes && (

                                    <Box>

                                        <Typography
                                            variant="caption"
                                            className="dialog-overline"
                                        >
                                            NOTES
                                        </Typography>

                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            {
                                                selectedReimbursement.notes
                                            }
                                        </Typography>

                                    </Box>

                                )}


                                {/* REMARKS */}

                                {selectedReimbursement.remarks && (

                                    <Box>

                                        <Typography
                                            variant="caption"
                                            className="dialog-overline"
                                        >
                                            REMARKS
                                        </Typography>

                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            {
                                                selectedReimbursement.remarks
                                            }
                                        </Typography>

                                    </Box>

                                )}


                                {/* =================================================
                                    RECEIPT
                                ================================================= */}

                                {hasReceipt(
                                    selectedReimbursement
                                ) ? (

                                    <Box
                                        className="detail-receipt"
                                    >

                                        <ReceiptLongRoundedIcon />

                                        <Box
                                            sx={{
                                                flex: 1,
                                                minWidth: 0,
                                            }}
                                        >

                                            <Typography
                                                variant="body2"
                                                fontWeight={600}
                                            >
                                                Receipt Attached
                                            </Typography>

                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{
                                                    display: "block",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                {
                                                    getReceiptFileName(
                                                        selectedReimbursement
                                                    )
                                                }
                                            </Typography>

                                        </Box>


                                        {/* VIEW PDF */}

                                        <Tooltip
                                            title="View Receipt PDF"
                                        >

                                            <IconButton
                                                size="small"
                                                color="primary"
                                                onClick={() =>
                                                    handleViewReceipt(
                                                        selectedReimbursement
                                                    )
                                                }
                                            >

                                                <VisibilityRoundedIcon />

                                            </IconButton>

                                        </Tooltip>


                                        {/* DOWNLOAD PDF */}

                                        <Tooltip
                                            title="Download Receipt PDF"
                                        >

                                            <IconButton
                                                size="small"
                                                color="primary"
                                                onClick={() =>
                                                    handleDownloadReceipt(
                                                        selectedReimbursement
                                                    )
                                                }
                                            >

                                                <DownloadRoundedIcon />

                                            </IconButton>

                                        </Tooltip>

                                    </Box>

                                ) : (

                                    <Alert
                                        severity="error"
                                    >
                                        No PDF receipt is attached
                                        to this reimbursement.
                                    </Alert>

                                )}


                                {/* REVIEW STATUS */}

                                {String(
                                    selectedReimbursement.status ||
                                    "Pending"
                                ).toLowerCase() ===
                                    "pending" && (

                                    <Alert
                                        severity={
                                            receiptViewedForId ===
                                            selectedReimbursement.id
                                                ? "success"
                                                : "warning"
                                        }
                                    >

                                        {receiptViewedForId ===
                                        selectedReimbursement.id
                                            ? "Receipt PDF opened successfully. You can now approve or reject this claim."
                                            : "Please open and review the receipt PDF before approving or rejecting this claim."}

                                    </Alert>

                                )}

                            </Stack>

                        </DialogContent>


                        <Divider />


                        <DialogActions>

                            {/* =================================================
                                REJECT
                            ================================================= */}

                            {String(
                                selectedReimbursement.status ||
                                "Pending"
                            ).toLowerCase() ===
                                "pending" && (

                                <Button
                                    color="error"
                                    variant="outlined"
                                    onClick={
                                        handleReject
                                    }
                                    disabled={
                                        statusUpdating ||
                                        receiptViewedForId !==
                                            selectedReimbursement.id
                                    }
                                    startIcon={
                                        statusUpdating ? (
                                            <CircularProgress
                                                size={17}
                                                color="inherit"
                                            />
                                        ) : (
                                            <CancelRoundedIcon />
                                        )
                                    }
                                >
                                    Reject
                                </Button>

                            )}


                            {/* =================================================
                                APPROVE
                            ================================================= */}

                            {String(
                                selectedReimbursement.status ||
                                "Pending"
                            ).toLowerCase() ===
                                "pending" && (

                                <Button
                                    color="success"
                                    variant="contained"
                                    onClick={
                                        handleApprove
                                    }
                                    disabled={
                                        statusUpdating ||
                                        receiptViewedForId !==
                                            selectedReimbursement.id
                                    }
                                    startIcon={
                                        statusUpdating ? (
                                            <CircularProgress
                                                size={17}
                                                color="inherit"
                                            />
                                        ) : (
                                            <CheckCircleRoundedIcon />
                                        )
                                    }
                                >
                                    Approve
                                </Button>

                            )}


                            <Button
                                onClick={() => {

                                    setSelectedReimbursement(
                                        null
                                    );

                                    setReceiptViewedForId(
                                        null
                                    );

                                }}
                                disabled={
                                    statusUpdating
                                }
                            >
                                Close
                            </Button>

                        </DialogActions>

                    </>

                )}

            </Dialog>

        </Box>

    );

}


/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({
    title,
    value,
    icon,
    type,
}) {

    return (

        <Card
            elevation={0}
            className={
                `summary-card summary-${type}`
            }
        >

            <CardContent>

                <Box className="summary-icon">
                    {icon}
                </Box>

                <Box className="summary-content">

                    <Typography
                        className="summary-title"
                    >
                        {title}
                    </Typography>

                    <Typography
                        className="summary-value"
                    >
                        {value}
                    </Typography>

                </Box>

            </CardContent>

        </Card>

    );

}


/* =========================================================
   DETAIL ITEM
========================================================= */

function DetailItem({
    label,
    value,
}) {

    return (

        <Box className="detail-item">

            <Typography
                className="detail-label"
            >
                {label}
            </Typography>

            <Typography
                className="detail-value"
            >
                {value}
            </Typography>

        </Box>

    );

}


export default Reimbursement;