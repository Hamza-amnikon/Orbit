import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Box,
    Typography,
    TextField,
    FormControl,
    Select,
    MenuItem,
    InputAdornment,
    Chip,
    CircularProgress,
    Alert,
    IconButton,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Checkbox,
    FormControlLabel,
    Tooltip,
} from "@mui/material";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

import PolicyService from "../Services/PolicyService";

import "./CompanyPolicies.css";


const CompanyPolicy = () => {

    // ============================================================
    // STATE
    // ============================================================

    const [policies, setPolicies] = useState([]);

    const [search, setSearch] = useState("");

    const [category, setCategory] = useState("All");

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    // ============================================================
    // PDF DIALOG
    // ============================================================

    const [pdfOpen, setPdfOpen] = useState(false);

    const [selectedPolicy, setSelectedPolicy] =
        useState(null);

    const [pdfUrl, setPdfUrl] = useState("");

    const [pdfLoading, setPdfLoading] =
        useState(false);

    const [pdfError, setPdfError] =
        useState("");


    // ============================================================
    // ACKNOWLEDGEMENT
    // ============================================================

    const [acknowledged, setAcknowledged] =
        useState(false);

    const [ackLoading, setAckLoading] =
        useState(false);

    const [ackCheckLoading, setAckCheckLoading] =
        useState(false);


    // ============================================================
    // LOAD PUBLISHED POLICIES
    // ============================================================

    const loadPolicies = async () => {
        try {
            setLoading(true);
            setError("");

            const response =
                await PolicyService.getPolicies({
                    status: "Published",
                });

            const policyData =
                response?.data || [];

            // ========================================================
            // CHECK ACKNOWLEDGEMENT STATUS FOR EVERY POLICY
            // ========================================================
            //
            // The backend GET acknowledgement endpoint is now
            // anonymous and checks the PolicyAcknowledgements table.
            //
            // If an acknowledgement record exists for the policy,
            // the policy card shows "Acknowledged".
            //
            // ========================================================

            const policiesWithAcknowledgement =
                await Promise.all(
                    policyData.map(
                        async (policy) => {
                            try {
                                const acknowledgement =
                                    await PolicyService.getAcknowledgement(
                                        policy.policyId
                                    );

                                return {
                                    ...policy,
                                    acknowledged:
                                        acknowledgement?.acknowledged ===
                                        true,
                                };

                            } catch (ackError) {

                                console.error(
                                    `Check Policy Acknowledgement Error for Policy ${policy.policyId}:`,
                                    ackError
                                );

                                return {
                                    ...policy,
                                    acknowledged: false,
                                };
                            }
                        }
                    )
                );

            setPolicies(
                policiesWithAcknowledgement
            );

        } catch (err) {

            console.error(
                "Load Company Policies Error:",
                err
            );

            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Failed to load company policies."
            );

        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        loadPolicies();
    }, []);


    // ============================================================
    // CATEGORIES
    // ============================================================

    const categories = useMemo(() => {

        return [
            "All",
            ...new Set(
                policies
                    .map(
                        (policy) =>
                            policy.category
                    )
                    .filter(Boolean)
            ),
        ];

    }, [policies]);


    // ============================================================
    // FILTER POLICIES
    // ============================================================

    const filteredPolicies = useMemo(() => {

        const searchValue =
            search.toLowerCase().trim();

        return policies.filter((policy) => {

            const title =
                policy.policyTitle || "";

            const code =
                policy.policyCode || "";

            const matchesSearch =
                title
                    .toLowerCase()
                    .includes(searchValue) ||

                code
                    .toLowerCase()
                    .includes(searchValue);

            const matchesCategory =
                category === "All" ||
                policy.category === category;

            return (
                matchesSearch &&
                matchesCategory
            );
        });

    }, [
        policies,
        search,
        category,
    ]);


    // ============================================================
    // FORMAT DATE
    // ============================================================

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
            return "-";
        }

        return parsedDate.toLocaleDateString(
            "en-GB",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };


    // ============================================================
    // CHECK ACKNOWLEDGEMENT
    // ============================================================
    //
    // The backend GET endpoint checks the
    // PolicyAcknowledgements table directly.
    //
    // This method is also available for refreshing the status of
    // an individual policy when needed.
    //
    // IMPORTANT:
    // View PDF does NOT call this method.
    //
    // ============================================================

    const checkAcknowledgement = async (
        policyId
    ) => {

        if (!policyId) {
            return false;
        }

        try {

            setAckCheckLoading(true);

            const response =
                await PolicyService.getAcknowledgement(
                    policyId
                );

            const isAcknowledged =
                response?.acknowledged === true;

            setAcknowledged(
                isAcknowledged
            );

            setPolicies(
                (previousPolicies) =>
                    previousPolicies.map(
                        (policy) =>
                            policy.policyId ===
                            policyId
                                ? {
                                      ...policy,
                                      acknowledged:
                                          isAcknowledged,
                                  }
                                : policy
                    )
            );

            setSelectedPolicy(
                (previousPolicy) =>
                    previousPolicy &&
                    previousPolicy.policyId ===
                        policyId
                        ? {
                              ...previousPolicy,
                              acknowledged:
                                  isAcknowledged,
                          }
                        : previousPolicy
            );

            return isAcknowledged;

        } catch (err) {

            console.error(
                "Check Policy Acknowledgement Error:",
                err
            );

            /*
             * IMPORTANT:
             *
             * Do not log the employee out here.
             * Do not close the PDF.
             * Do not block the employee from viewing
             * the company policy.
             */

            setAcknowledged(false);

            return false;

        } finally {

            setAckCheckLoading(false);
        }
    };


    // ============================================================
    // OPEN POLICY
    // ============================================================
    //
    // IMPORTANT CHANGE:
    //
    // We DO NOT call getAcknowledgement() here.
    //
    // Previously:
    //
    // View
    //   ↓
    // getAcknowledgement()
    //   ↓
    // possible 401
    //   ↓
    // global axios interceptor
    //   ↓
    // logout
    //
    // Now:
    //
    // View
    //   ↓
    // open dialog
    //   ↓
    // get PDF
    //
    // ============================================================

    const handleViewPolicy = async (
        policy
    ) => {

        if (!policy?.policyId) {
            return;
        }

        try {

            // ====================================================
            // SELECT POLICY
            // ====================================================

            setSelectedPolicy(policy);

            // ====================================================
            // OPEN DIALOG IMMEDIATELY
            // ====================================================

            setPdfOpen(true);

            setPdfLoading(true);

            setPdfError("");

            setError("");

            setAcknowledged(
                policy?.acknowledged === true
            );


            // ====================================================
            // CLEAR OLD PDF
            // ====================================================

            if (pdfUrl) {

                URL.revokeObjectURL(
                    pdfUrl
                );

                setPdfUrl("");
            }


            // ====================================================
            // LOAD PDF ONLY
            // ====================================================

            const blob =
                await PolicyService.getFileBlob(
                    policy.policyId
                );


            // ====================================================
            // VALIDATE BLOB
            // ====================================================

            if (!blob) {
                throw new Error(
                    "Policy PDF was not received."
                );
            }

            if (
                blob.size === 0
            ) {
                throw new Error(
                    "Policy PDF is empty."
                );
            }


            // ====================================================
            // CHECK CONTENT TYPE
            // ====================================================

            if (
                blob.type &&
                !blob.type.includes(
                    "pdf"
                )
            ) {

                console.warn(
                    "Policy PDF response content type:",
                    blob.type
                );
            }


            // ====================================================
            // CREATE BLOB URL
            // ====================================================

            const blobUrl =
                URL.createObjectURL(
                    blob
                );

            setPdfUrl(
                blobUrl
            );

        } catch (err) {

            console.error(
                "Load Policy PDF Error:",
                err
            );

            /*
             * Important:
             *
             * Do not perform logout here.
             *
             * A PDF loading failure is a policy
             * document problem, not automatically
             * an authentication problem.
             */

            let message =
                "Unable to load the policy PDF.";

            if (
                err?.message
            ) {
                message =
                    err.message;
            }

            if (
                err?.response?.data?.message
            ) {
                message =
                    err.response.data.message;
            }

            setPdfError(
                message
            );

        } finally {

            setPdfLoading(
                false
            );
        }
    };


    // ============================================================
    // CLOSE PDF
    // ============================================================

    const handleClosePdf = () => {

        setPdfOpen(false);

        setAcknowledged(false);

        setPdfLoading(false);

        setAckCheckLoading(false);

        if (pdfUrl) {

            URL.revokeObjectURL(
                pdfUrl
            );

            setPdfUrl("");
        }

        setTimeout(() => {

            setSelectedPolicy(
                null
            );

            setPdfError("");

        }, 200);
    };


    // ============================================================
    // DOWNLOAD
    // ============================================================

    const handleDownload = (
        policy
    ) => {

        if (!policy?.policyId) {
            return;
        }

        try {

            const downloadUrl =
                PolicyService.getDownloadUrl(
                    policy.policyId
                );

            const link =
                document.createElement(
                    "a"
                );

            link.href =
                downloadUrl;

            link.target =
                "_blank";

            link.rel =
                "noopener noreferrer";

            document.body.appendChild(
                link
            );

            link.click();

            document.body.removeChild(
                link
            );

        } catch (err) {

            console.error(
                "Policy Download Error:",
                err
            );

            setError(
                "Unable to download the policy PDF."
            );
        }
    };


    // ============================================================
    // ACKNOWLEDGE POLICY
    // ============================================================

    const handleAcknowledge = async () => {

        if (!selectedPolicy) {
            return;
        }


        // ========================================================
        // CHECK CHECKBOX
        // ========================================================

        if (
            selectedPolicy.acknowledgementRequired &&
            !acknowledged
        ) {
            return;
        }


        // ========================================================
        // ALREADY ACKNOWLEDGED
        // ========================================================

        if (
            selectedPolicy.acknowledgementRequired &&
            selectedPolicy.acknowledged === true
        ) {
            return;
        }


        try {

            setAckLoading(true);

            setError("");


            // ====================================================
            // ACKNOWLEDGE BACKEND
            // ====================================================

            const response =
                await PolicyService.acknowledgePolicy(
                    selectedPolicy.policyId
                );


            if (
                response?.success === false
            ) {

                throw new Error(
                    response?.message ||
                    "Failed to acknowledge policy."
                );
            }


            // ====================================================
            // UPDATE POLICY LIST
            // ====================================================

            setPolicies(
                (previousPolicies) =>
                    previousPolicies.map(
                        (policy) =>
                            policy.policyId ===
                            selectedPolicy.policyId
                                ? {
                                      ...policy,
                                      acknowledged:
                                          true,
                                  }
                                : policy
                    )
            );


            // ====================================================
            // UPDATE SELECTED POLICY
            // ====================================================

            setSelectedPolicy(
                (previousPolicy) =>
                    previousPolicy
                        ? {
                              ...previousPolicy,
                              acknowledged:
                                  true,
                          }
                        : previousPolicy
            );


            setAcknowledged(
                true
            );


            // ====================================================
            // CLOSE DIALOG
            // ====================================================

            setPdfOpen(false);


            if (pdfUrl) {

                URL.revokeObjectURL(
                    pdfUrl
                );

                setPdfUrl("");
            }


            setTimeout(() => {

                setSelectedPolicy(
                    null
                );

                setAcknowledged(
                    false
                );

                setPdfError("");

            }, 200);

        } catch (err) {

            console.error(
                "Policy Acknowledgement Error:",
                err
            );

            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Failed to acknowledge policy."
            );

        } finally {

            setAckLoading(
                false
            );
        }
    };


    // ============================================================
    // CLEANUP BLOB URL
    // ============================================================

    useEffect(() => {

        return () => {

            if (pdfUrl) {

                URL.revokeObjectURL(
                    pdfUrl
                );
            }
        };

    }, [pdfUrl]);


    // ============================================================
    // UI
    // ============================================================

    return (
        <Box className="company-policies-page">

            {/* ==================================================
                HEADER
            ================================================== */}

            <Box className="company-policy-header">

                <Box className="company-policy-title-icon">
                    <DescriptionRoundedIcon />
                </Box>

                <Box>

                    <Typography
                        component="h1"
                        className="company-policy-title"
                    >
                        Company Policies
                    </Typography>

                    <Typography
                        component="p"
                        className="company-policy-description"
                    >
                        View company policies,
                        guidelines and important
                        information.
                    </Typography>

                </Box>

                <Tooltip title="Refresh">

                    <IconButton
                        className="company-policy-refresh"
                        onClick={
                            loadPolicies
                        }
                        disabled={
                            loading
                        }
                    >
                        <RefreshRoundedIcon />
                    </IconButton>

                </Tooltip>

            </Box>


            {/* ==================================================
                ERROR
            ================================================== */}

            {error && (
                <Alert
                    severity="error"
                    className="company-policy-alert"
                    onClose={() =>
                        setError("")
                    }
                >
                    {error}
                </Alert>
            )}


            {/* ==================================================
                FILTER
            ================================================== */}

            <Box className="company-policy-filter">

                <TextField
                    fullWidth
                    size="small"
                    value={search}
                    onChange={(e) =>
                        setSearch(
                            e.target.value
                        )
                    }
                    placeholder="Search policies..."
                    className="company-policy-search"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchRoundedIcon />
                            </InputAdornment>
                        ),
                    }}
                />


                <FormControl
                    size="small"
                    className="company-policy-category-filter"
                >

                    <Select
                        value={category}
                        onChange={(e) =>
                            setCategory(
                                e.target.value
                            )
                        }
                    >

                        {categories.map(
                            (item) => (
                                <MenuItem
                                    key={item}
                                    value={item}
                                >
                                    {item ===
                                    "All"
                                        ? "All Categories"
                                        : item}
                                </MenuItem>
                            )
                        )}

                    </Select>

                </FormControl>

            </Box>


            {/* ==================================================
                COUNT
            ================================================== */}

            <Box className="company-policy-count">

                <Typography>

                    <strong>
                        {
                            filteredPolicies.length
                        }
                    </strong>{" "}

                    {filteredPolicies.length ===
                    1
                        ? "Policy"
                        : "Policies"}

                </Typography>

                <Typography component="span">
                    All published policies
                </Typography>

            </Box>


            {/* ==================================================
                LOADING / EMPTY / LIST
            ================================================== */}

            {loading ? (

                <Box className="company-policy-loading">

                    <CircularProgress
                        size={30}
                    />

                    <Typography>
                        Loading policies...
                    </Typography>

                </Box>

            ) : filteredPolicies.length ===
              0 ? (

                <Box className="company-policy-empty">

                    <Box className="company-policy-empty-icon">
                        <DescriptionRoundedIcon />
                    </Box>

                    <Typography
                        className="company-policy-empty-title"
                    >
                        No Published Policies
                    </Typography>

                    <Typography
                        className="company-policy-empty-description"
                    >
                        No published policies
                        match your search or
                        category.
                    </Typography>

                </Box>

            ) : (

                <Box className="company-policy-grid">

                    {filteredPolicies.map(
                        (policy) => (

                            <Box
                                key={
                                    policy.policyId
                                }
                                className="company-policy-card"
                            >

                                {/* CARD HEADER */}

                                <Box className="company-policy-card-top">

                                    <Box className="company-policy-pdf">
                                        <DescriptionRoundedIcon />
                                    </Box>

                                    <Chip
                                        label={
                                            policy.status ||
                                            "Published"
                                        }
                                        className="company-policy-published"
                                    />

                                </Box>


                                {/* TITLE */}

                                <Typography
                                    component="h2"
                                    className="company-policy-card-title"
                                >
                                    {
                                        policy.policyTitle
                                    }
                                </Typography>


                                <Typography
                                    className="company-policy-code"
                                >
                                    {
                                        policy.policyCode
                                    }
                                </Typography>


                                {/* META */}

                                <Box className="company-policy-meta">

                                    <Chip
                                        label={
                                            policy.category
                                        }
                                        className="company-policy-category"
                                    />

                                    <Chip
                                        label={
                                            `Version ${policy.version}`
                                        }
                                        className="company-policy-version"
                                    />

                                </Box>


                                {/* DESCRIPTION */}

                                <Typography
                                    className="company-policy-card-description"
                                >
                                    {
                                        policy.description ||
                                        "No description available."
                                    }
                                </Typography>


                                {/* DATE */}

                                <Box className="company-policy-date">

                                    <CalendarTodayRoundedIcon />

                                    <Typography component="span">

                                        Effective{" "}

                                        {formatDate(
                                            policy.effectiveDate
                                        )}

                                    </Typography>

                                </Box>


                                {/* ACKNOWLEDGEMENT */}

                                {policy.acknowledgementRequired && (

                                    <Box
                                        className={
                                            policy.acknowledged
                                                ? "company-policy-ack company-policy-acknowledged"
                                                : "company-policy-ack"
                                        }
                                    >

                                        {policy.acknowledged ? (
                                            <CheckCircleRoundedIcon />
                                        ) : (
                                            <WarningAmberRoundedIcon />
                                        )}

                                        <Typography component="span">

                                            {policy.acknowledged
                                                ? "Acknowledged"
                                                : "Acknowledgement Required"}

                                        </Typography>

                                    </Box>

                                )}


                                {/* ACTIONS */}

                                <Box className="company-policy-actions">

                                    <Button
                                        variant="contained"
                                        className="company-policy-view"
                                        startIcon={
                                            <VisibilityRoundedIcon />
                                        }
                                        onClick={() =>
                                            handleViewPolicy(
                                                policy
                                            )
                                        }
                                    >
                                        View PDF
                                    </Button>


                                    <IconButton
                                        className="company-policy-download"
                                        onClick={() =>
                                            handleDownload(
                                                policy
                                            )
                                        }
                                        title="Download PDF"
                                    >
                                        <DownloadRoundedIcon />
                                    </IconButton>

                                </Box>

                            </Box>

                        )
                    )}

                </Box>

            )}


            {/* ==================================================
                PDF VIEWER DIALOG
            ================================================== */}

            <Dialog
                open={pdfOpen}
                onClose={
                    handleClosePdf
                }
                fullWidth
                maxWidth={false}
                className="company-policy-dialog"
            >

                {/* ==================================================
                    HEADER
                ================================================== */}

                <DialogTitle
                    className="company-policy-dialog-title"
                >

                    <Box>

                        <strong>
                            {
                                selectedPolicy?.policyTitle ||
                                "Policy"
                            }
                        </strong>

                        <span>
                            {
                                selectedPolicy?.policyCode ||
                                ""
                            }
                        </span>

                    </Box>


                    <IconButton
                        onClick={
                            handleClosePdf
                        }
                    >
                        <CloseRoundedIcon />
                    </IconButton>

                </DialogTitle>


                {/* ==================================================
                    PDF CONTENT
                ================================================== */}

                <DialogContent
                    className="company-policy-dialog-content"
                >

                    {pdfLoading ? (

                        <Box
                            sx={{
                                width: "100%",
                                height: "100%",
                                minHeight:
                                    "400px",
                                display: "flex",
                                alignItems:
                                    "center",
                                justifyContent:
                                    "center",
                                flexDirection:
                                    "column",
                                gap: 2,
                                background:
                                    "#525659",
                            }}
                        >

                            <CircularProgress
                                sx={{
                                    color:
                                        "#ffffff",
                                }}
                            />

                            <Typography
                                sx={{
                                    color:
                                        "#ffffff",
                                }}
                            >
                                Loading PDF...
                            </Typography>

                        </Box>

                    ) : pdfError ? (

                        <Box
                            sx={{
                                width: "100%",
                                height: "100%",
                                minHeight:
                                    "400px",
                                display: "flex",
                                alignItems:
                                    "center",
                                justifyContent:
                                    "center",
                                flexDirection:
                                    "column",
                                gap: 2,
                                background:
                                    "#525659",
                            }}
                        >

                            <Typography
                                sx={{
                                    color:
                                        "#ffffff",
                                    textAlign:
                                        "center",
                                    padding:
                                        "20px",
                                }}
                            >
                                {pdfError}
                            </Typography>


                            <Button
                                variant="contained"
                                onClick={() =>
                                    selectedPolicy &&
                                    handleViewPolicy(
                                        selectedPolicy
                                    )
                                }
                            >
                                Retry
                            </Button>

                        </Box>

                    ) : pdfUrl ? (

                        <iframe
                            src={pdfUrl}
                            title={
                                selectedPolicy?.policyTitle ||
                                "Policy PDF"
                            }
                            className="company-policy-pdf-frame"
                        />

                    ) : (

                        <Box
                            sx={{
                                width: "100%",
                                minHeight:
                                    "400px",
                                display: "flex",
                                alignItems:
                                    "center",
                                justifyContent:
                                    "center",
                                background:
                                    "#525659",
                            }}
                        >

                            <Typography
                                sx={{
                                    color:
                                        "#ffffff",
                                }}
                            >
                                No PDF available.
                            </Typography>

                        </Box>

                    )}

                </DialogContent>


                {/* ==================================================
                    ACKNOWLEDGEMENT FOOTER
                ================================================== */}

                {selectedPolicy?.acknowledgementRequired ? (

                    <DialogActions
                        className="company-policy-dialog-actions company-policy-dialog-actions-ack"
                    >

                        {selectedPolicy?.acknowledged ? (

                            <Box className="company-policy-already-acknowledged">

                                <CheckCircleRoundedIcon />

                                <Typography>
                                    You have already
                                    acknowledged this
                                    policy.
                                </Typography>

                            </Box>

                        ) : (

                            <FormControlLabel
                                className="company-policy-acknowledge-control"
                                control={
                                    <Checkbox
                                        checked={
                                            acknowledged
                                        }
                                        onChange={(e) =>
                                            setAcknowledged(
                                                e.target.checked
                                            )
                                        }
                                        disabled={
                                            ackLoading
                                        }
                                        color="primary"
                                    />
                                }
                                label="I acknowledge that I have read and understood this policy."
                            />

                        )}


                        <Box className="company-policy-dialog-buttons">

                            <Button
                                variant="outlined"
                                className="company-policy-dialog-close"
                                onClick={
                                    handleClosePdf
                                }
                            >
                                Close
                            </Button>


                            {!selectedPolicy?.acknowledged && (

                                <Button
                                    variant="contained"
                                    className="company-policy-dialog-download"
                                    startIcon={
                                        <CheckCircleRoundedIcon />
                                    }
                                    onClick={
                                        handleAcknowledge
                                    }
                                    disabled={
                                        !acknowledged ||
                                        ackLoading
                                    }
                                >
                                    {ackLoading
                                        ? "Saving..."
                                        : "Acknowledge"}
                                </Button>

                            )}

                        </Box>

                    </DialogActions>

                ) : (

                    <DialogActions
                        className="company-policy-dialog-actions"
                    >

                        <Button
                            variant="outlined"
                            className="company-policy-dialog-close"
                            onClick={
                                handleClosePdf
                            }
                        >
                            Close
                        </Button>


                        <Button
                            variant="contained"
                            className="company-policy-dialog-download"
                            startIcon={
                                <DownloadRoundedIcon />
                            }
                            onClick={() =>
                                handleDownload(
                                    selectedPolicy
                                )
                            }
                        >
                            Download
                        </Button>

                    </DialogActions>

                )}

            </Dialog>

        </Box>
    );
};

export default CompanyPolicy;