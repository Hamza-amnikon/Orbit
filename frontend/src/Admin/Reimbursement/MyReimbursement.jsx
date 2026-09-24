import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
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
    FormControl,
    IconButton,
    InputAdornment,
    MenuItem,
    Select,
    TextField,
    Typography,
} from "@mui/material";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import PendingActionsRoundedIcon from "@mui/icons-material/PendingActionsRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";

import { useAuth } from "../../context/AuthContext";

import "./MyReimbursements.css";

import {
    getEmployeeReimbursements,
    createReimbursement,
    getReceiptUrl,
    getReceiptDownloadUrl,
} from "../Services/ReimbursementService";

// ============================================================
// MY REIMBURSEMENTS
// ============================================================

const MyReimbursements = () => {

    const { user, profile } = useAuth();

    // ========================================================
    // CLAIMS
    // ========================================================

    const [claims, setClaims] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [search, setSearch] = useState("");

    const [statusFilter, setStatusFilter] =
        useState("All");

    // ========================================================
    // NEW REIMBURSEMENT
    // ========================================================

    const [openDialog, setOpenDialog] =
        useState(false);

    const [submitting, setSubmitting] =
        useState(false);

    // Error shown only inside the New Reimbursement dialog
    const [formError, setFormError] =
        useState("");

    const [form, setForm] = useState({
        category: "",
        amount: "",
        expenseDate: "",
        description: "",
        receipt: null,
    });

    // ========================================================
    // DETAILS DIALOG
    // ========================================================

    const [detailsOpen, setDetailsOpen] =
        useState(false);

    const [selectedClaim, setSelectedClaim] =
        useState(null);

    // ========================================================
    // RECEIPT DIALOG
    // ========================================================

    const [receiptOpen, setReceiptOpen] =
        useState(false);

    const [receiptUrl, setReceiptUrl] =
        useState("");

    // ========================================================
    // DEBUG AUTH DATA
    // ========================================================

    useEffect(() => {

        console.log(
            "=========================================="
        );

        console.log(
            "AUTH USER:",
            user
        );

        console.log(
            "AUTH PROFILE:",
            profile
        );

        console.log(
            "=========================================="
        );

    }, [user, profile]);

    // ========================================================
    // GET EMPLOYEE ID
    // ========================================================

    const employeeId =
        profile?.employeeId ??
        profile?.EmployeeId ??
        profile?.employeeID ??
        profile?.EmployeeID ??
        user?.employeeId ??
        user?.EmployeeId ??
        user?.employeeID ??
        user?.EmployeeID ??
        profile?.employee?.employeeId ??
        profile?.employee?.EmployeeId ??
        user?.employee?.employeeId ??
        user?.employee?.EmployeeId ??
        "";

    // ========================================================
    // GET EMPLOYEE NAME
    // ========================================================

    const employeeName = useMemo(() => {

        // ----------------------------------------------------
        // Direct profile properties
        // ----------------------------------------------------

        const directName =
            profile?.employeeName ??
            profile?.EmployeeName ??
            profile?.employeeFullName ??
            profile?.EmployeeFullName ??
            profile?.fullName ??
            profile?.FullName ??
            profile?.displayName ??
            profile?.DisplayName ??
            profile?.name ??
            profile?.Name ??
            profile?.givenName ??
            profile?.GivenName ??
            profile?.userName ??
            profile?.UserName ??
            user?.employeeName ??
            user?.EmployeeName ??
            user?.employeeFullName ??
            user?.EmployeeFullName ??
            user?.fullName ??
            user?.FullName ??
            user?.displayName ??
            user?.DisplayName ??
            user?.name ??
            user?.Name ??
            user?.givenName ??
            user?.GivenName ??
            user?.userName ??
            user?.UserName;

        if (
            directName &&
            String(directName).trim()
        ) {
            return String(
                directName
            ).trim();
        }

        // ----------------------------------------------------
        // Nested employee
        // ----------------------------------------------------

        const nestedEmployee =
            profile?.employee ||
            profile?.Employee ||
            user?.employee ||
            user?.Employee;

        if (nestedEmployee) {

            const nestedName =
                nestedEmployee.employeeName ??
                nestedEmployee.EmployeeName ??
                nestedEmployee.employeeFullName ??
                nestedEmployee.EmployeeFullName ??
                nestedEmployee.fullName ??
                nestedEmployee.FullName ??
                nestedEmployee.displayName ??
                nestedEmployee.DisplayName ??
                nestedEmployee.name ??
                nestedEmployee.Name;

            if (
                nestedName &&
                String(nestedName).trim()
            ) {
                return String(
                    nestedName
                ).trim();
            }

            const firstName =
                nestedEmployee.firstName ??
                nestedEmployee.FirstName ??
                nestedEmployee.givenName ??
                nestedEmployee.GivenName ??
                "";

            const lastName =
                nestedEmployee.lastName ??
                nestedEmployee.LastName ??
                nestedEmployee.surname ??
                nestedEmployee.Surname ??
                "";

            const combined =
                `${firstName} ${lastName}`.trim();

            if (combined) {
                return combined;
            }
        }

        // ----------------------------------------------------
        // Profile first + last
        // ----------------------------------------------------

        const profileFirstName =
            profile?.firstName ??
            profile?.FirstName ??
            profile?.givenName ??
            profile?.GivenName ??
            "";

        const profileLastName =
            profile?.lastName ??
            profile?.LastName ??
            profile?.surname ??
            profile?.Surname ??
            "";

        const profileCombined =
            `${profileFirstName} ${profileLastName}`.trim();

        if (profileCombined) {
            return profileCombined;
        }

        // ----------------------------------------------------
        // User first + last
        // ----------------------------------------------------

        const userFirstName =
            user?.firstName ??
            user?.FirstName ??
            user?.givenName ??
            user?.GivenName ??
            "";

        const userLastName =
            user?.lastName ??
            user?.LastName ??
            user?.surname ??
            user?.Surname ??
            "";

        const userCombined =
            `${userFirstName} ${userLastName}`.trim();

        if (userCombined) {
            return userCombined;
        }

        return "";

    }, [profile, user]);

    // ========================================================
    // DEBUG EMPLOYEE
    // ========================================================

    useEffect(() => {

        console.log(
            "Logged-in Employee ID:",
            employeeId
        );

        console.log(
            "Logged-in Employee Name:",
            employeeName
        );

    }, [
        employeeId,
        employeeName,
    ]);

    // ========================================================
    // LOAD MY REIMBURSEMENTS
    // ========================================================

    const loadMyReimbursements =
        async () => {

            try {

                setLoading(true);

                setError("");

                if (!employeeId) {

                    setClaims([]);

                    setError(
                        "Unable to identify the logged-in employee."
                    );

                    return;
                }

                const response =
                    await getEmployeeReimbursements(
                        employeeId
                    );

                const reimbursements =
                    Array.isArray(response)
                        ? response
                        : response?.data || [];

                setClaims(
                    reimbursements
                );

            } catch (err) {

                console.error(
                    "Failed to load my reimbursements:",
                    err
                );

                setClaims([]);

                setError(
                    err.message ||
                    "Unable to load your reimbursement requests."
                );

            } finally {

                setLoading(false);
            }
        };

    useEffect(() => {

        loadMyReimbursements();

    }, [employeeId]);

    // ========================================================
    // FILTER CLAIMS
    // ========================================================

    const filteredClaims =
        useMemo(() => {

            let result = [
                ...claims,
            ];

            // ------------------------------------------------
            // STATUS
            // ------------------------------------------------

            if (
                statusFilter !== "All"
            ) {

                result =
                    result.filter(
                        (claim) =>
                            String(
                                claim.status ||
                                claim.Status ||
                                ""
                            ).toLowerCase() ===
                            statusFilter.toLowerCase()
                    );
            }

            // ------------------------------------------------
            // SEARCH
            // ------------------------------------------------

            if (search.trim()) {

                const keyword =
                    search.toLowerCase();

                result =
                    result.filter(
                        (claim) => {

                            const claimNumber =
                                claim.claimNumber ||
                                claim.ClaimNumber ||
                                claim.claimId ||
                                claim.ClaimId ||
                                "";

                            const category =
                                claim.category ||
                                claim.Category ||
                                "";

                            const description =
                                claim.description ||
                                claim.Description ||
                                "";

                            const employee =
                                claim.employeeName ||
                                claim.EmployeeName ||
                                "";

                            return (

                                String(
                                    claimNumber
                                )
                                    .toLowerCase()
                                    .includes(
                                        keyword
                                    )

                                ||

                                String(
                                    category
                                )
                                    .toLowerCase()
                                    .includes(
                                        keyword
                                    )

                                ||

                                String(
                                    description
                                )
                                    .toLowerCase()
                                    .includes(
                                        keyword
                                    )

                                ||

                                String(
                                    employee
                                )
                                    .toLowerCase()
                                    .includes(
                                        keyword
                                    )
                            );
                        }
                    );
            }

            return result;

        }, [
            claims,
            search,
            statusFilter,
        ]);

    // ========================================================
    // SUMMARY
    // ========================================================

    const summary =
        useMemo(() => {

            const total =
                claims.length;

            const pending =
                claims.filter(
                    (claim) =>
                        String(
                            claim.status ||
                            claim.Status ||
                            ""
                        ).toLowerCase() ===
                        "pending"
                ).length;

            const approved =
                claims.filter(
                    (claim) =>
                        String(
                            claim.status ||
                            claim.Status ||
                            ""
                        ).toLowerCase() ===
                        "approved"
                ).length;

            const rejected =
                claims.filter(
                    (claim) =>
                        String(
                            claim.status ||
                            claim.Status ||
                            ""
                        ).toLowerCase() ===
                        "rejected"
                ).length;

            const totalReimbursed =
                claims
                    .filter(
                        (claim) =>
                            String(
                                claim.status ||
                                claim.Status ||
                                ""
                            ).toLowerCase() ===
                            "approved"
                    )
                    .reduce(
                        (sum, claim) =>
                            sum +
                            Number(
                                claim.amount ||
                                claim.Amount ||
                                0
                            ),
                        0
                    );

            return {
                total,
                pending,
                approved,
                rejected,
                totalReimbursed,
            };

        }, [claims]);

    // ========================================================
    // FORM CHANGE
    // ========================================================

    const handleFormChange =
        (event) => {

            const {
                name,
                value,
                files,
            } = event.target;

            setForm(
                (previous) => ({
                    ...previous,

                    [name]:
                        name === "receipt"
                            ? files?.[0] ||
                              null
                            : value,
                })
            );
        };

    // ========================================================
    // CREATE REIMBURSEMENT
    // ========================================================

    const handleSubmit =
        async () => {

            try {

                setSubmitting(true);

                setFormError("");

                // ------------------------------------------------
                // EMPLOYEE ID
                // ------------------------------------------------

                if (!employeeId) {

                    throw new Error(
                        "Employee ID not found. Please refresh the page and try again."
                    );
                }

                // ------------------------------------------------
                // EMPLOYEE NAME
                // ------------------------------------------------

                if (
                    !employeeName ||
                    !String(
                        employeeName
                    ).trim()
                ) {

                    console.error(
                        "Profile:",
                        profile
                    );

                    console.error(
                        "User:",
                        user
                    );

                    throw new Error(
                        "Employee name not found. Please refresh the page and try again."
                    );
                }

                // ------------------------------------------------
                // REQUIRED FIELDS
                // ------------------------------------------------

                if (
                    !form.category ||
                    !form.amount ||
                    !form.expenseDate
                ) {

                    throw new Error(
                        "Please fill all required fields."
                    );
                }

                // ------------------------------------------------
                // AMOUNT
                // ------------------------------------------------

                if (
                    Number(
                        form.amount
                    ) <= 0
                ) {

                    throw new Error(
                        "Amount must be greater than zero."
                    );
                }

                // ------------------------------------------------
                // RECEIPT
                // ------------------------------------------------

// ------------------------------------------------
// RECEIPT - REQUIRED
// ------------------------------------------------

if (!form.receipt) {
    throw new Error(
        "Please upload a PDF receipt before submitting the reimbursement."
    );
}

const fileName =
    form.receipt.name || "";

const isPdf =
    fileName
        .toLowerCase()
        .endsWith(".pdf");

if (!isPdf) {
    throw new Error(
        "Only PDF files are allowed for reimbursement receipts."
    );
}

const maxSize =
    10 *
    1024 *
    1024;

if (form.receipt.size > maxSize) {
    throw new Error(
        "PDF file size cannot exceed 10 MB."
    );
}

                // ------------------------------------------------
                // REQUEST DATA
                // ------------------------------------------------

                const reimbursementData = {

                    EmployeeId:
                        Number(
                            employeeId
                        ),

                    EmployeeName:
                        String(
                            employeeName
                        ).trim(),

                    Category:
                        String(
                            form.category
                        ).trim(),

                    Amount:
                        Number(
                            form.amount
                        ),

                    ExpenseDate:
                        form.expenseDate,

                    Description:
                        form.description?.trim() ||
                        "",

                    SubmittedDate:
                        new Date().toISOString(),

                    receiptFile:
                        form.receipt,
                };

                console.log(
                    "Submitting reimbursement:",
                    reimbursementData
                );

                // ------------------------------------------------
                // API
                // ------------------------------------------------

                await createReimbursement(
                    reimbursementData
                );

                // ------------------------------------------------
                // SUCCESS
                // ------------------------------------------------

                setFormError("");
                setOpenDialog(false);

                setForm({
                    category: "",
                    amount: "",
                    expenseDate: "",
                    description: "",
                    receipt: null,
                });

                setError("");

                await loadMyReimbursements();

            } catch (err) {

                console.error(
                    "Create reimbursement failed:",
                    err
                );

                setFormError(
                    err.message ||
                    "Unable to create reimbursement."
                );

            } finally {

                setSubmitting(false);
            }
        };

    // ========================================================
    // OPEN CLAIM DETAILS
    // ========================================================

    const handleViewClaim =
        (claim) => {

            if (!claim) {
                return;
            }

            console.log(
                "Selected reimbursement:",
                claim
            );

            setSelectedClaim(
                claim
            );

            setDetailsOpen(
                true
            );
        };

    // ========================================================
    // CLOSE CLAIM DETAILS
    // ========================================================

    const handleCloseDetails =
        () => {

            setDetailsOpen(
                false
            );

            setSelectedClaim(
                null
            );
        };

    // ========================================================
    // VIEW RECEIPT
    // ========================================================

    const handleViewReceipt =
        (claim) => {

            const id =
                claim?.id ||
                claim?.Id ||
                claim?.reimbursementId ||
                claim?.ReimbursementId;

            if (!id) {

                setError(
                    "Reimbursement ID is not available."
                );

                return;
            }

            const url =
                getReceiptUrl(
                    id
                );

            if (!url) {

                setError(
                    "Receipt URL could not be generated."
                );

                return;
            }

            setReceiptUrl(
                url
            );

            setReceiptOpen(
                true
            );
        };

    // ========================================================
    // DOWNLOAD RECEIPT
    // ========================================================

    const handleDownloadReceipt =
        (claim) => {

            const id =
                claim?.id ||
                claim?.Id ||
                claim?.reimbursementId ||
                claim?.ReimbursementId;

            if (!id) {

                setError(
                    "Reimbursement ID is not available."
                );

                return;
            }

            const url =
                getReceiptDownloadUrl(
                    id
                );

            if (!url) {

                setError(
                    "Receipt download URL could not be generated."
                );

                return;
            }

            window.open(
                url,
                "_blank",
                "noopener,noreferrer"
            );
        };

    // ========================================================
    // STATUS CHIP
    // ========================================================

    const getStatusChip =
        (status) => {

            const normalized =
                String(
                    status || ""
                ).toLowerCase();

            if (
                normalized ===
                "approved"
            ) {

                return (
                    <Chip
                        label="Approved"
                        size="small"
                        icon={
                            <CheckCircleRoundedIcon />
                        }
                        className="my-reimbursement-status approved"
                    />
                );
            }

            if (
                normalized ===
                "rejected"
            ) {

                return (
                    <Chip
                        label="Rejected"
                        size="small"
                        icon={
                            <CancelRoundedIcon />
                        }
                        className="my-reimbursement-status rejected"
                    />
                );
            }

            return (
                <Chip
                    label="Pending"
                    size="small"
                    icon={
                        <PendingActionsRoundedIcon />
                    }
                    className="my-reimbursement-status pending"
                />
            );
        };

    // ========================================================
    // SELECTED CLAIM HELPERS
    // ========================================================

    const selectedClaimId =
        selectedClaim?.id ||
        selectedClaim?.Id ||
        selectedClaim?.reimbursementId ||
        selectedClaim?.ReimbursementId;

    const selectedClaimNumber =
        selectedClaim?.claimNumber ||
        selectedClaim?.ClaimNumber ||
        selectedClaim?.claimId ||
        selectedClaim?.ClaimId ||
        "-";

    const selectedEmployeeName =
        selectedClaim?.employeeName ||
        selectedClaim?.EmployeeName ||
        employeeName ||
        "-";

    const selectedEmployeeId =
        selectedClaim?.employeeId ||
        selectedClaim?.EmployeeId ||
        employeeId ||
        "-";

    const selectedCategory =
        selectedClaim?.category ||
        selectedClaim?.Category ||
        "-";

    const selectedAmount =
        selectedClaim?.amount ??
        selectedClaim?.Amount ??
        0;

    const selectedExpenseDate =
        selectedClaim?.expenseDate ||
        selectedClaim?.ExpenseDate ||
        "-";

    const selectedSubmittedDate =
        selectedClaim?.submittedDate ||
        selectedClaim?.SubmittedDate ||
        selectedClaim?.createdAt ||
        selectedClaim?.CreatedAt ||
        "-";

    const selectedStatus =
        selectedClaim?.status ||
        selectedClaim?.Status ||
        "Pending";

    const selectedDescription =
        selectedClaim?.description ||
        selectedClaim?.Description ||
        "-";

    const selectedRemarks =
        selectedClaim?.remarks ||
        selectedClaim?.Remarks ||
        "-";

    const selectedPaymentMethod =
        selectedClaim?.paymentMethod ||
        selectedClaim?.PaymentMethod ||
        "-";

    const selectedReceiptName =
        selectedClaim?.receiptFileName ||
        selectedClaim?.ReceiptFileName ||
        "Receipt.pdf";

    const selectedHasReceipt =
        Boolean(
            selectedClaim?.receiptFileName ||
            selectedClaim?.ReceiptFileName ||
            selectedClaim?.receiptFilePath ||
            selectedClaim?.ReceiptFilePath
        );

    // ========================================================
    // RENDER
    // ========================================================

    return (

        <Box
            className="my-reimbursements-page"
        >

            {/* ==================================================
                HEADER
            ================================================== */}

            <Box
                className="my-reimbursements-header"
            >

                <Box>

                    <Typography
                        variant="h4"
                        className="my-reimbursements-title"
                    >
                        My Reimbursements
                    </Typography>

                    <Typography
                        variant="body1"
                        className="my-reimbursements-subtitle"
                    >
                        View and manage your reimbursement
                        requests and claim history.
                    </Typography>

                </Box>

                <Button
                    variant="contained"
                    startIcon={
                        <AddRoundedIcon />
                    }
                    onClick={() => {
                        setFormError("");
                        setOpenDialog(true);
                    }}
                    className="new-reimbursement-button"
                >
                    New Reimbursement
                </Button>

            </Box>

            {/* ==================================================
                ERROR
            ================================================== */}

            {error && (

                <Alert
                    severity="error"
                    onClose={() =>
                        setError("")
                    }
                    className="my-reimbursements-alert"
                >
                    {error}
                </Alert>

            )}

            {/* ==================================================
                SUMMARY
            ================================================== */}

            <Box
                className="my-reimbursement-summary"
            >

                <SummaryCard
                    title="Total Claims"
                    value={summary.total}
                    icon={
                        <ReceiptLongRoundedIcon />
                    }
                    type="total"
                />

                <SummaryCard
                    title="Pending"
                    value={summary.pending}
                    icon={
                        <PendingActionsRoundedIcon />
                    }
                    type="pending"
                />

                <SummaryCard
                    title="Approved"
                    value={summary.approved}
                    icon={
                        <CheckCircleRoundedIcon />
                    }
                    type="approved"
                />

                <SummaryCard
                    title="Rejected"
                    value={summary.rejected}
                    icon={
                        <CancelRoundedIcon />
                    }
                    type="rejected"
                />

                <SummaryCard
                    title="Total Reimbursed"
                    value={
                        `₹${summary.totalReimbursed.toLocaleString(
                            "en-IN"
                        )}`
                    }
                    icon={
                        <AccountBalanceWalletRoundedIcon />
                    }
                    type="amount"
                />

            </Box>

            {/* ==================================================
                TABLE
            ================================================== */}

            <Card
                elevation={0}
                className="my-reimbursements-table-card"
            >

                {/* TOOLBAR */}

                <Box
                    className="my-reimbursements-toolbar"
                >

                    <TextField
                        size="small"
                        placeholder="Search claims..."
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                        className="my-reimbursements-search"
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

                    <FormControl
                        size="small"
                        className="my-reimbursements-filter"
                    >

                        <Select
                            value={statusFilter}
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

                </Box>

                {/* TABLE HEADER */}

                <Box
                    className="my-reimbursements-table-header"
                >

                    <Box>CLAIM</Box>

                    <Box>CATEGORY</Box>

                    <Box>AMOUNT</Box>

                    <Box>EXPENSE DATE</Box>

                    <Box>SUBMITTED</Box>

                    <Box>STATUS</Box>

                    <Box>ACTION</Box>

                </Box>

                {/* TABLE BODY */}

                {loading ? (

                    <Box
                        className="my-reimbursements-loading"
                    >

                        <CircularProgress
                            size={30}
                        />

                        <Typography>
                            Loading your reimbursements...
                        </Typography>

                    </Box>

                ) : filteredClaims.length === 0 ? (

                    <Box
                        className="my-reimbursements-empty"
                    >

                        <ReceiptLongRoundedIcon />

                        <Typography>
                            No reimbursement claims found.
                        </Typography>

                        <Typography
                            variant="body2"
                        >
                            Your reimbursement requests
                            will appear here.
                        </Typography>

                    </Box>

                ) : (

                    filteredClaims.map(
                        (
                            claim,
                            index
                        ) => {

                            const claimNumber =
                                claim.claimNumber ||
                                claim.ClaimNumber ||
                                claim.claimId ||
                                claim.ClaimId ||
                                `REQ-${index + 1}`;

                            const category =
                                claim.category ||
                                claim.Category ||
                                "-";

                            const amount =
                                claim.amount ??
                                claim.Amount ??
                                0;

                            const expenseDate =
                                claim.expenseDate ||
                                claim.ExpenseDate ||
                                "-";

                            const submitted =
                                claim.submittedDate ||
                                claim.SubmittedDate ||
                                claim.createdAt ||
                                claim.CreatedAt ||
                                "-";

                            const status =
                                claim.status ||
                                claim.Status ||
                                "Pending";

                            return (

                                <Box
                                    key={
                                        claim.id ||
                                        claim.Id ||
                                        claim.claimId ||
                                        claim.ClaimId ||
                                        index
                                    }
                                    className="my-reimbursement-row"
                                >

                                    <Box
                                        className="claim-number"
                                    >
                                        {claimNumber}
                                    </Box>

                                    <Box>
                                        {category}
                                    </Box>

                                    <Box
                                        className="claim-amount"
                                    >
                                        ₹
                                        {Number(
                                            amount
                                        ).toLocaleString(
                                            "en-IN"
                                        )}
                                    </Box>

                                    <Box>
                                        {formatDate(
                                            expenseDate
                                        )}
                                    </Box>

                                    <Box>
                                        {formatDate(
                                            submitted
                                        )}
                                    </Box>

                                    <Box>
                                        {getStatusChip(
                                            status
                                        )}
                                    </Box>

                                    <Box>

                                        <IconButton
                                            size="small"
                                            onClick={() =>
                                                handleViewClaim(
                                                    claim
                                                )
                                            }
                                            title="View Reimbursement"
                                        >

                                            <VisibilityRoundedIcon />

                                        </IconButton>

                                    </Box>

                                </Box>
                            );
                        }
                    )

                )}

                {/* FOOTER */}

                <Box
                    className="my-reimbursements-footer"
                >

                    Showing{" "}
                    {filteredClaims.length}{" "}
                    of{" "}
                    {claims.length} claims

                </Box>

            </Card>

            {/* ==================================================
                NEW REIMBURSEMENT DIALOG
            ================================================== */}

            <Dialog
                open={openDialog}
                onClose={() => {

                    if (!submitting) {
                        setFormError("");
                        setOpenDialog(false);
                    }

                }}
                fullWidth
                maxWidth="sm"
            >

                <DialogTitle>
                    New Reimbursement
                </DialogTitle>

                <DialogContent>

                    {formError && (
                        <Alert
                            severity="error"
                            onClose={() => setFormError("")}
                            sx={{
                                mb: 2,
                                borderRadius: "10px",
                            }}
                        >
                            {formError}
                        </Alert>
                    )}

                    <Box
                        className="my-reimbursement-form"
                    >

                        <TextField
                            required
                            fullWidth
                            label="Category"
                            name="category"
                            value={form.category}
                            onChange={
                                handleFormChange
                            }
                            placeholder="Travel, Food, Medical..."
                        />

                        <TextField
                            required
                            fullWidth
                            label="Amount"
                            name="amount"
                            type="number"
                            value={form.amount}
                            onChange={
                                handleFormChange
                            }
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

                        <TextField
                            required
                            fullWidth
                            label="Expense Date"
                            name="expenseDate"
                            type="date"
                            value={form.expenseDate}
                            onChange={
                                handleFormChange
                            }
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />

                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Description"
                            name="description"
                            value={form.description}
                            onChange={
                                handleFormChange
                            }
                        />

                        <Button
                            component="label"
                            variant="outlined"
                            startIcon={
                                <ReceiptLongRoundedIcon />
                            }
                        >

                            {form.receipt
                                ? form.receipt.name
                                : "Upload Receipt *"}

                            <input
                                hidden
                                required
                                type="file"
                                name="receipt"
                                accept=".pdf,application/pdf"
                                onChange={
                                    handleFormChange
                                }
                            />

                        </Button>

                    </Box>

                </DialogContent>

                <DialogActions>

                    <Button
                        onClick={() => {
                            if (!submitting) {
                                setFormError("");
                                setOpenDialog(false);
                            }
                        }}
                        disabled={submitting}
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="contained"
                        onClick={
                            handleSubmit
                        }
                        disabled={submitting}
                    >

                        {submitting
                            ? "Submitting..."
                            : "Submit Request"}

                    </Button>

                </DialogActions>

            </Dialog>

            {/* ==================================================
                REIMBURSEMENT DETAILS DIALOG
            ================================================== */}

            <Dialog
                open={detailsOpen}
                onClose={
                    handleCloseDetails
                }
                fullWidth
                maxWidth="sm"
                PaperProps={{
                    sx: {
                        borderRadius: "18px",
                        overflow: "hidden",
                    },
                }}
            >

                {selectedClaim && (

                    <>

                        {/* ------------------------------------------
                            DETAILS HEADER
                        ------------------------------------------ */}

                        <DialogTitle
                            sx={{
                                padding:
                                    "24px 24px 20px",
                                borderBottom:
                                    "1px solid #e2e8f0",
                            }}
                        >

                            <Typography
                                sx={{
                                    fontSize:
                                        "11px",
                                    fontWeight:
                                        700,
                                    color:
                                        "#94a3b8",
                                    letterSpacing:
                                        "0.5px",
                                    textTransform:
                                        "uppercase",
                                    marginBottom:
                                        "6px",
                                }}
                            >
                                Reimbursement
                            </Typography>

                            <Typography
                                sx={{
                                    fontSize:
                                        "20px",
                                    fontWeight:
                                        600,
                                    color:
                                        "#0f172a",
                                }}
                            >
                                {selectedClaimNumber}
                            </Typography>

                        </DialogTitle>

                        {/* ------------------------------------------
                            DETAILS CONTENT
                        ------------------------------------------ */}

                        <DialogContent
                            sx={{
                                padding:
                                    "24px !important",
                            }}
                        >

                            {/* CLAIM AMOUNT + STATUS */}

                            <Box
                                sx={{
                                    display:
                                        "flex",
                                    alignItems:
                                        "center",
                                    justifyContent:
                                        "space-between",
                                    paddingBottom:
                                        "22px",
                                    borderBottom:
                                        "1px solid #e2e8f0",
                                    marginBottom:
                                        "24px",
                                }}
                            >

                                <Box>

                                    <Typography
                                        sx={{
                                            fontSize:
                                                "11px",
                                            fontWeight:
                                                700,
                                            color:
                                                "#94a3b8",
                                            marginBottom:
                                                "5px",
                                            textTransform:
                                                "uppercase",
                                        }}
                                    >
                                        Claim Amount
                                    </Typography>

                                    <Typography
                                        sx={{
                                            fontSize:
                                                "28px",
                                            lineHeight:
                                                1.2,
                                            fontWeight:
                                                700,
                                            color:
                                                "#0f172a",
                                        }}
                                    >
                                        ₹
                                        {Number(
                                            selectedAmount
                                        ).toLocaleString(
                                            "en-IN"
                                        )}
                                    </Typography>

                                </Box>

                                <Box>
                                    {getStatusChip(
                                        selectedStatus
                                    )}
                                </Box>

                            </Box>

                            {/* DETAILS GRID */}

                            <Box
                                sx={{
                                    display:
                                        "grid",
                                    gridTemplateColumns:
                                        "1fr 1fr",
                                    columnGap:
                                        "28px",
                                    rowGap:
                                        "22px",
                                }}
                            >

                                <DetailItem
                                    label="Employee"
                                    value={
                                        selectedEmployeeName
                                    }
                                />

                                <DetailItem
                                    label="Employee ID"
                                    value={
                                        selectedEmployeeId
                                    }
                                />

                                <DetailItem
                                    label="Category"
                                    value={
                                        selectedCategory
                                    }
                                />

                                <DetailItem
                                    label="Expense Date"
                                    value={
                                        formatDate(
                                            selectedExpenseDate
                                        )
                                    }
                                />

                                <DetailItem
                                    label="Submitted"
                                    value={
                                        formatDate(
                                            selectedSubmittedDate
                                        )
                                    }
                                />

                                <DetailItem
                                    label="Payment Method"
                                    value={
                                        selectedPaymentMethod
                                    }
                                />

                            </Box>

                            {/* DESCRIPTION */}

                            <Box
                                sx={{
                                    marginTop:
                                        "24px",
                                }}
                            >

                                <Typography
                                    sx={{
                                        fontSize:
                                            "11px",
                                        fontWeight:
                                            700,
                                        color:
                                            "#94a3b8",
                                        marginBottom:
                                            "7px",
                                        textTransform:
                                            "uppercase",
                                    }}
                                >
                                    Description
                                </Typography>

                                <Typography
                                    sx={{
                                        fontSize:
                                            "13px",
                                        lineHeight:
                                            1.6,
                                        color:
                                            "#475569",
                                    }}
                                >
                                    {selectedDescription}
                                </Typography>

                            </Box>

                            {/* REMARKS */}

                            <Box
                                sx={{
                                    marginTop:
                                        "22px",
                                }}
                            >

                                <Typography
                                    sx={{
                                        fontSize:
                                            "11px",
                                        fontWeight:
                                            700,
                                        color:
                                            "#94a3b8",
                                        marginBottom:
                                            "7px",
                                        textTransform:
                                            "uppercase",
                                    }}
                                >
                                    Remarks
                                </Typography>

                                <Typography
                                    sx={{
                                        fontSize:
                                            "13px",
                                        lineHeight:
                                            1.6,
                                        color:
                                            "#475569",
                                    }}
                                >
                                    {selectedRemarks}
                                </Typography>

                            </Box>

                            {/* RECEIPT */}

                            <Box
                                sx={{
                                    marginTop:
                                        "24px",
                                    padding:
                                        "13px 14px",
                                    border:
                                        "1px solid #dfe5ed",
                                    borderRadius:
                                        "10px",
                                    display:
                                        "flex",
                                    alignItems:
                                        "center",
                                    justifyContent:
                                        "space-between",
                                    background:
                                        "#fbfcfe",
                                }}
                            >

                                <Box
                                    sx={{
                                        display:
                                            "flex",
                                        alignItems:
                                            "center",
                                        gap:
                                            "12px",
                                        minWidth:
                                            0,
                                    }}
                                >

                                    <Box
                                        sx={{
                                            width:
                                                "34px",
                                            height:
                                                "34px",
                                            borderRadius:
                                                "8px",
                                            background:
                                                "#eef3ff",
                                            display:
                                                "flex",
                                            alignItems:
                                                "center",
                                            justifyContent:
                                                "center",
                                            flexShrink:
                                                0,
                                        }}
                                    >

                                        <ReceiptLongRoundedIcon
                                            sx={{
                                                color:
                                                    "#2563eb",
                                                fontSize:
                                                    "19px",
                                            }}
                                        />

                                    </Box>

                                    <Box
                                        sx={{
                                            minWidth:
                                                0,
                                        }}
                                    >

                                        <Typography
                                            sx={{
                                                fontSize:
                                                    "12px",
                                                color:
                                                    "#475569",
                                                fontWeight:
                                                    500,
                                            }}
                                        >
                                            Receipt Attached
                                        </Typography>

                                        <Typography
                                            sx={{
                                                fontSize:
                                                    "11px",
                                                color:
                                                    "#94a3b8",
                                                marginTop:
                                                    "2px",
                                                overflow:
                                                    "hidden",
                                                textOverflow:
                                                    "ellipsis",
                                                whiteSpace:
                                                    "nowrap",
                                                maxWidth:
                                                    "260px",
                                            }}
                                        >
                                            {selectedHasReceipt
                                                ? selectedReceiptName
                                                : "No receipt attached"}
                                        </Typography>

                                    </Box>

                                </Box>

                                {selectedHasReceipt && (

                                    <Box
                                        sx={{
                                            display:
                                                "flex",
                                            alignItems:
                                                "center",
                                            gap:
                                                "4px",
                                        }}
                                    >

                                        <IconButton
                                            size="small"
                                            title="View Receipt"
                                            onClick={() =>
                                                handleViewReceipt(
                                                    selectedClaim
                                                )
                                            }
                                            sx={{
                                                color:
                                                    "#2563eb",
                                            }}
                                        >

                                            <VisibilityRoundedIcon
                                                fontSize="small"
                                            />

                                        </IconButton>

                                        <IconButton
                                            size="small"
                                            title="Download Receipt"
                                            onClick={() =>
                                                handleDownloadReceipt(
                                                    selectedClaim
                                                )
                                            }
                                            sx={{
                                                color:
                                                    "#2563eb",
                                            }}
                                        >

                                            <DownloadRoundedIcon
                                                fontSize="small"
                                            />

                                        </IconButton>

                                    </Box>

                                )}

                            </Box>

                        </DialogContent>

                        {/* ------------------------------------------
                            DETAILS FOOTER
                        ------------------------------------------ */}

                        <DialogActions
                            sx={{
                                padding:
                                    "16px 24px",
                                borderTop:
                                    "1px solid #e2e8f0",
                            }}
                        >

                            <Button
                                onClick={
                                    handleCloseDetails
                                }
                                sx={{
                                    color:
                                        "#64748b",
                                    textTransform:
                                        "none",
                                    fontWeight:
                                        600,
                                }}
                            >
                                Close
                            </Button>

                        </DialogActions>

                    </>

                )}

            </Dialog>

            {/* ==================================================
                RECEIPT DIALOG
            ================================================== */}

            <Dialog
                open={receiptOpen}
                onClose={() =>
                    setReceiptOpen(false)
                }
                fullWidth
                maxWidth="md"
                PaperProps={{
                    sx: {
                        borderRadius:
                            "16px",
                        overflow:
                            "hidden",
                    },
                }}
            >

                <DialogTitle
                    sx={{
                        fontWeight:
                            700,
                        color:
                            "#0f172a",
                    }}
                >

                    Receipt

                    <IconButton
                        onClick={() =>
                            setReceiptOpen(false)
                        }
                        sx={{
                            position:
                                "absolute",
                            right:
                                8,
                            top:
                                8,
                        }}
                    >
                        <CloseRoundedIcon />
                    </IconButton>

                </DialogTitle>

                <DialogContent
                    sx={{
                        padding:
                            "0 !important",
                    }}
                >

                    {receiptUrl && (

                        <Box
                            component="iframe"
                            src={receiptUrl}
                            title="Reimbursement Receipt"
                            sx={{
                                width:
                                    "100%",
                                height:
                                    "70vh",
                                display:
                                    "block",
                                border:
                                    "none",
                            }}
                        />

                    )}

                </DialogContent>

            </Dialog>

        </Box>
    );
};

// ============================================================
// DETAIL ITEM
// ============================================================

const DetailItem = ({
    label,
    value,
}) => {

    return (

        <Box>

            <Typography
                sx={{
                    fontSize:
                        "10px",
                    fontWeight:
                        700,
                    color:
                        "#94a3b8",
                    marginBottom:
                        "6px",
                    textTransform:
                        "uppercase",
                    letterSpacing:
                        "0.3px",
                }}
            >
                {label}
            </Typography>

            <Typography
                sx={{
                    fontSize:
                        "13px",
                    color:
                        "#334155",
                    fontWeight:
                        500,
                }}
            >
                {value || "-"}
            </Typography>

        </Box>
    );
};

// ============================================================
// SUMMARY CARD
// ============================================================

const SummaryCard = ({
    title,
    value,
    icon,
    type,
}) => {

    return (

        <Card
            elevation={0}
            className={`my-summary-card my-summary-${type}`}
        >

            <CardContent>

                <Box
                    className="my-summary-icon"
                >
                    {icon}
                </Box>

                <Box>

                    <Typography
                        className="my-summary-title"
                    >
                        {title}
                    </Typography>

                    <Typography
                        className="my-summary-value"
                    >
                        {value}
                    </Typography>

                </Box>

            </CardContent>

        </Card>
    );
};

// ============================================================
// DATE FORMAT
// ============================================================

const formatDate = (
    value
) => {

    if (
        !value ||
        value === "-"
    ) {
        return "-";
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return value;
    }

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    );
};

// ============================================================
// EXPORT
// ============================================================

export default MyReimbursements;