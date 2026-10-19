import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import {
    Box,
    Typography,
    TextField,
    FormControl,
    InputLabel,
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
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";

import PolicyService from "../Services/PolicyService";
import * as pdfjsLib from "pdfjs-dist/build/pdf.mjs";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

import "./CompanyPolicies.css";
import { Typography as MuiText } from "@mui/material";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const PolicyPdfViewer = ({ pdfUrl, onReadToEnd, onError }) => {
    const containerRef = useRef(null);
    const pagesRef = useRef(null);
    const readToEndRef = useRef(false);
    const documentReadyRef = useRef(false);
    const onReadToEndRef = useRef(onReadToEnd);
    const [rendering, setRendering] = useState(true);

    useEffect(() => {
        onReadToEndRef.current = onReadToEnd;
    }, [onReadToEnd]);

    const checkReadToEnd = useCallback(() => {
        const container = containerRef.current;
        if (!container || !documentReadyRef.current || readToEndRef.current) return;

        const hasOverflow = container.scrollHeight > container.clientHeight + 8;
        const atEnd = !hasOverflow ||
            container.scrollTop + container.clientHeight >= container.scrollHeight - 12;

        if (atEnd) {
            readToEndRef.current = true;
            onReadToEndRef.current?.();
        }
    }, []);

    useEffect(() => {
        let cancelled = false;
        const renderTasks = [];
        let loadingTask;
        const container = containerRef.current;
        const pagesContainer = pagesRef.current;

        if (!container || !pagesContainer || !pdfUrl) return undefined;

        readToEndRef.current = false;
        documentReadyRef.current = false;
        pagesContainer.replaceChildren();
        setRendering(true);

        const renderDocument = async () => {
            try {
                const response = await fetch(pdfUrl);
                if (!response.ok) throw new Error("Unable to load the policy PDF.");

                const data = new Uint8Array(await response.arrayBuffer());
                loadingTask = pdfjsLib.getDocument({ data });
                const pdf = await loadingTask.promise;

                for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
                    if (cancelled) return;

                    const page = await pdf.getPage(pageNumber);
                    const baseViewport = page.getViewport({ scale: 1 });
                    const availableWidth = Math.max(280, container.clientWidth - 48);
                    const scale = Math.min(1.5, availableWidth / baseViewport.width);
                    const viewport = page.getViewport({ scale });
                    const pixelRatio = window.devicePixelRatio || 1;
                    const pageElement = document.createElement("div");
                    const canvas = document.createElement("canvas");
                    const context = canvas.getContext("2d", { alpha: false });

                    pageElement.className = "company-policy-pdf-page";
                    canvas.width = Math.floor(viewport.width * pixelRatio);
                    canvas.height = Math.floor(viewport.height * pixelRatio);
                    canvas.style.width = `${Math.floor(viewport.width)}px`;
                    canvas.style.height = `${Math.floor(viewport.height)}px`;
                    pageElement.appendChild(canvas);
                    pagesContainer.appendChild(pageElement);

                    if (!context) throw new Error("This browser could not display the policy PDF.");

                    const renderTask = page.render({
                        canvasContext: context,
                        viewport,
                        transform: pixelRatio === 1 ? null : [pixelRatio, 0, 0, pixelRatio, 0, 0],
                        background: "#ffffff",
                    });
                    renderTasks.push(renderTask);
                    await renderTask.promise;
                }

                if (cancelled) return;
                documentReadyRef.current = true;
                setRendering(false);
                requestAnimationFrame(checkReadToEnd);
            } catch (error) {
                if (!cancelled && error?.name !== "RenderingCancelledException") {
                    setRendering(false);
                    onError?.(error?.message || "Unable to display the policy PDF.");
                }
            }
        };

        renderDocument();

        return () => {
            cancelled = true;
            renderTasks.forEach((task) => task.cancel());
            loadingTask?.destroy();
        };
    }, [pdfUrl, checkReadToEnd, onError]);

    return (
        <div
            ref={containerRef}
            className="company-policy-pdf-viewer"
            onScroll={checkReadToEnd}
            aria-label="Policy document"
        >
            <div ref={pagesRef} />
            <div className="company-policy-pdf-loading" hidden={!rendering}>
                    <CircularProgress sx={{ color: "#ffffff" }} />
                    <Typography sx={{ color: "#ffffff" }}>Loading policy...</Typography>
            </div>
        </div>
    );
};


const CompanyPolicy = () => {
    const navigate = useNavigate();
    const {
        profile,
        onboardingStep,
        pendingPolicyIds,
        checkSparkAccess,
    } = useAuth();
    const searchInputRef = useRef(null);

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

    const [policyReadToEnd, setPolicyReadToEnd] =
        useState(false);

    const [ackLoading, setAckLoading] =
        useState(false);

    const [ackCheckLoading, setAckCheckLoading] =
        useState(false);

    const markPolicyReadToEnd = useCallback(() => {
        setPolicyReadToEnd(true);
    }, []);

    const handlePdfRenderError = useCallback((message) => {
        setPdfError(message);
    }, []);


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
            // The backend checks each policy for the signed-in
            // employee using the current JWT.
            //
            // Only that employee's acknowledgement marks the card
            // as acknowledged.
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

    useEffect(() => {
        const handleSearchShortcut = (event) => {
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
                event.preventDefault();
                searchInputRef.current?.focus();
            }
        };

        window.addEventListener("keydown", handleSearchShortcut);
        return () => window.removeEventListener("keydown", handleSearchShortcut);
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
    // The backend GET endpoint checks the current employee's
    // PolicyAcknowledgements record.
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
            setPolicyReadToEnd(false);


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
        setPolicyReadToEnd(false);

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
            (!acknowledged || !policyReadToEnd)
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

            const employeeId =
                profile?.employeeId ??
                profile?.EmployeeId ??
                profile?.employeeID ??
                profile?.EmployeeID ??
                null;
            const accessGranted = employeeId
                ? await checkSparkAccess(employeeId, false)
                : false;


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

            if (accessGranted) {
                navigate("/dashboard", { replace: true });
            }

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

            {onboardingStep === "policies" && (
                <Alert severity="warning" className="company-policy-alert">
                    {pendingPolicyIds.length > 0
                        ? `Review and acknowledge all ${pendingPolicyIds.length} required ${pendingPolicyIds.length === 1 ? "policy" : "policies"} to unlock the rest of Spark.`
                        : "We are checking your required policy acknowledgements. Access will remain limited until they are confirmed."}
                </Alert>
            )}


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
                    inputRef={searchInputRef}
                    fullWidth
                    size="small"
                    value={search}
                    onChange={(e) =>
                        setSearch(
                            e.target.value
                        )
                    }
                    placeholder="Search policies..."
                    aria-label="Search published policies by title or code"
                    className="company-policy-search"
                    slotProps={{ input: {
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchRoundedIcon />
                            </InputAdornment>
                        ),
                        endAdornment: (
                            search ? (
                                <InputAdornment position="end" className="company-policy-search-actions">
                                    <IconButton
                                        size="small"
                                        aria-label="Clear policy search"
                                        onClick={() => setSearch("")}
                                    >
                                        <CloseRoundedIcon fontSize="small" />
                                    </IconButton>
                                </InputAdornment>
                            ) : null
                        ),
                    } }}
                />


                <FormControl
                    size="small"
                    className="company-policy-category-filter"
                >

                    <InputLabel id="company-policy-category-label">Category</InputLabel>

                    <Select
                        labelId="company-policy-category-label"
                        label="Category"
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

                <Button
                    variant="outlined"
                    className="company-policy-reset"
                    startIcon={<RestartAltRoundedIcon />}
                    onClick={() => {
                        setSearch("");
                        setCategory("All");
                    }}
                    disabled={!search && category === "All"}
                >
                    Reset
                </Button>

            </Box>


            {/* ==================================================
                COUNT
            ================================================== */}

            <Box className="company-policy-count">

                <Typography>

                    <MuiText component="strong" variant="inherit">
                        {
                            filteredPolicies.length
                        }
                    </MuiText>{" "}

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
                        {search || category !== "All" ? "No Matching Policies" : "No Published Policies"}
                    </Typography>

                    <Typography
                        className="company-policy-empty-description"
                    >
                        {search || category !== "All"
                            ? "Try another search or category filter."
                            : "Published company policies will appear here."}
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

                        <MuiText component="strong" variant="inherit">
                            {
                                selectedPolicy?.policyTitle ||
                                "Policy"
                            }
                        </MuiText>

                        <MuiText component="span" variant="inherit">
                            {
                                selectedPolicy?.policyCode ||
                                ""
                            }
                        </MuiText>

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

                        <PolicyPdfViewer
                            pdfUrl={pdfUrl}
                            onReadToEnd={markPolicyReadToEnd}
                            onError={handlePdfRenderError}
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
                                            ackLoading || !policyReadToEnd
                                        }
                                        color="primary"
                                    />
                                }
                                label={policyReadToEnd
                                    ? "I acknowledge that I have read and understood this policy."
                                    : "Scroll to the end of the policy to enable acknowledgement."}
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
                                        !policyReadToEnd ||
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
