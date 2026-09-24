import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import {
    Box,
    Typography,
    Card,
    CardContent,
    Button,
    IconButton,
    TextField,
    FormControl,
    Select,
    MenuItem,
    InputAdornment,
    Tooltip,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    Alert,
} from "@mui/material";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import ArchiveRoundedIcon from "@mui/icons-material/ArchiveRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import PublishRoundedIcon from "@mui/icons-material/PublishRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";

import PolicyService from "../Services/PolicyService";
import PolicyForm from "./PolicyForm";

import "./PolicyDashboard.css";

const PolicyDashboard = () => {
    const navigate = useNavigate();
    const { hasPermission } = useAuth();

    // ============================================================
    // STATE
    // ============================================================

    const [policies, setPolicies] = useState([]);

    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");
    const [status, setStatus] = useState("All");

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState("");

    // Policy form dialog
    const [policyFormOpen, setPolicyFormOpen] = useState(false);

    // ============================================================
    // LOAD POLICIES
    // ============================================================

    const loadPolicies = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await PolicyService.getPolicies();

            setPolicies(response?.data || []);
        } catch (err) {
            console.error("Load Policies Error:", err);

            setError(
                err?.response?.data?.message ||
                    "Failed to load policies. Please try again."
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
                    .map((policy) => policy.category)
                    .filter(Boolean)
            ),
        ];
    }, [policies]);

    // ============================================================
    // FILTER
    // ============================================================

    const filteredPolicies = useMemo(() => {
        return policies.filter((policy) => {
            const searchValue = search
                .toLowerCase()
                .trim();

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

            const matchesStatus =
                status === "All" ||
                policy.status === status;

            return (
                matchesSearch &&
                matchesCategory &&
                matchesStatus
            );
        });
    }, [
        policies,
        search,
        category,
        status,
    ]);

    // ============================================================
    // FORMAT DATE
    // ============================================================

    const formatDate = (date) => {
        if (!date) {
            return "-";
        }

        return new Date(date).toLocaleDateString(
            "en-GB",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };

    // ============================================================
    // ADD POLICY
    // ============================================================

    const handleAddPolicy = () => {
        setError("");
        setPolicyFormOpen(true);
    };

    // ============================================================
    // CLOSE POLICY FORM
    // ============================================================

    const handleClosePolicyForm = () => {
        setPolicyFormOpen(false);
    };

    // ============================================================
    // POLICY SAVED
    // ============================================================

    const handlePolicySaved = async () => {
        setPolicyFormOpen(false);

        await loadPolicies();
    };

    // ============================================================
    // DELETE
    // ============================================================

    const handleDelete = async (id) => {
        const policy = policies.find(
            (item) => item.policyId === id
        );

        if (!policy) {
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to delete "${policy.policyTitle}"?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setActionLoading(true);
            setError("");

            await PolicyService.deletePolicy(id);

            setPolicies((current) =>
                current.filter(
                    (item) =>
                        item.policyId !== id
                )
            );
        } catch (err) {
            console.error(
                "Delete Policy Error:",
                err
            );

            setError(
                err?.response?.data?.message ||
                    "Failed to delete policy."
            );
        } finally {
            setActionLoading(false);
        }
    };

    // ============================================================
    // ARCHIVE
    // ============================================================

    const handleArchive = async (id) => {
        const policy = policies.find(
            (item) => item.policyId === id
        );

        if (!policy) {
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to archive "${policy.policyTitle}"?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setActionLoading(true);
            setError("");

            const response =
                await PolicyService.archivePolicy(id);

            const updatedPolicy =
                response?.data;

            if (updatedPolicy) {
                setPolicies((current) =>
                    current.map((item) =>
                        item.policyId === id
                            ? updatedPolicy
                            : item
                    )
                );
            } else {
                await loadPolicies();
            }
        } catch (err) {
            console.error(
                "Archive Policy Error:",
                err
            );

            setError(
                err?.response?.data?.message ||
                    "Failed to archive policy."
            );
        } finally {
            setActionLoading(false);
        }
    };

    // ============================================================
    // PUBLISH
    // ============================================================

    const handlePublish = async (id) => {
        const policy = policies.find(
            (item) => item.policyId === id
        );

        if (!policy) {
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to publish "${policy.policyTitle}"?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setActionLoading(true);
            setError("");

            const response =
                await PolicyService.publishPolicy(id);

            const updatedPolicy =
                response?.data;

            if (updatedPolicy) {
                setPolicies((current) =>
                    current.map((item) =>
                        item.policyId === id
                            ? updatedPolicy
                            : item
                    )
                );
            } else {
                await loadPolicies();
            }
        } catch (err) {
            console.error(
                "Publish Policy Error:",
                err
            );

            setError(
                err?.response?.data?.message ||
                    "Failed to publish policy."
            );
        } finally {
            setActionLoading(false);
        }
    };

    // ============================================================
    // VIEW PDF
    // ============================================================

    const handleView = (policy) => {
        const fileUrl =
            PolicyService.getFileUrl(
                policy.policyId
            );

        window.open(
            fileUrl,
            "_blank",
            "noopener,noreferrer"
        );
    };

    // ============================================================
    // EDIT
    // ============================================================

    const handleEdit = (policy) => {
        /*
         * Edit dialog can be connected to the same
         * PolicyForm component when edit functionality
         * is enabled.
         */
        console.log(
            "Edit policy:",
            policy
        );
    };

    // ============================================================
    // STATISTICS
    // ============================================================

    const totalPolicies =
        policies.length;

    const publishedPolicies =
        policies.filter(
            (policy) =>
                policy.status ===
                "Published"
        ).length;

    const draftPolicies =
        policies.filter(
            (policy) =>
                policy.status ===
                "Draft"
        ).length;

    const archivedPolicies =
        policies.filter(
            (policy) =>
                policy.status ===
                "Archived"
        ).length;

    // ============================================================
    // RENDER
    // ============================================================

    return (
        <Box className="policy-dashboard">

            {/* =====================================================
                HEADER
            ====================================================== */}

            <Box className="policy-dashboard-top">

                <Box
                    className="policy-dashboard-header-left"
                >

                    <IconButton
                        className="policy-back-button"
                        onClick={() =>
                            navigate("/policy")
                        }
                        aria-label="Back to Policy"
                    >
                        <ArrowBackRoundedIcon />
                    </IconButton>

                    <Box className="policy-dashboard-heading">

                        <Typography
                            component="div"
                            className="policy-dashboard-breadcrumb"
                        >
                            Policy / Management
                        </Typography>

                        <Typography
                            component="h1"
                            className="policy-dashboard-title"
                        >
                            Policy Dashboard
                        </Typography>

                        <Typography
                            component="p"
                            className="policy-dashboard-description"
                        >
                            Create, manage, publish and
                            maintain company policies.
                        </Typography>

                    </Box>

                </Box>

                {/* =================================================
                    HEADER ACTIONS
                ================================================== */}

                <Box
                    className="policy-dashboard-header-actions"
                >

                    {hasPermission(
                        "/policy-management",
                        "create"
                    ) && (
                        <Button
                            variant="contained"
                            className="policy-add-button"
                            startIcon={
                                <AddRoundedIcon />
                            }
                            onClick={
                                handleAddPolicy
                            }
                            disableRipple
                        >
                            Add Policy
                        </Button>
                    )}

                    <Tooltip title="Refresh">
                        <IconButton
                            className="policy-refresh-button"
                            onClick={
                                loadPolicies
                            }
                            disabled={
                                loading ||
                                actionLoading
                            }
                        >
                            <RefreshRoundedIcon />
                        </IconButton>
                    </Tooltip>

                </Box>

            </Box>

            {/* =====================================================
                ERROR
            ====================================================== */}

            {error && (
                <Alert
                    severity="error"
                    className="policy-dashboard-alert"
                    onClose={() =>
                        setError("")
                    }
                >
                    {error}
                </Alert>
            )}

            {/* =====================================================
                STATISTICS
            ====================================================== */}

            <Box className="policy-stat-grid">

                <Card
                    className="policy-stat-card"
                    elevation={0}
                >
                    <CardContent>

                        <Typography component="span">
                            Total Policies
                        </Typography>

                        <Typography component="strong">
                            {totalPolicies}
                        </Typography>

                    </CardContent>
                </Card>

                <Card
                    className="policy-stat-card green"
                    elevation={0}
                >
                    <CardContent>

                        <Typography component="span">
                            Published
                        </Typography>

                        <Typography component="strong">
                            {publishedPolicies}
                        </Typography>

                    </CardContent>
                </Card>

                <Card
                    className="policy-stat-card orange"
                    elevation={0}
                >
                    <CardContent>

                        <Typography component="span">
                            Draft
                        </Typography>

                        <Typography component="strong">
                            {draftPolicies}
                        </Typography>

                    </CardContent>
                </Card>

                <Card
                    className="policy-stat-card gray"
                    elevation={0}
                >
                    <CardContent>

                        <Typography component="span">
                            Archived
                        </Typography>

                        <Typography component="strong">
                            {archivedPolicies}
                        </Typography>

                    </CardContent>
                </Card>

            </Box>

            {/* =====================================================
                FILTER TOOLBAR
            ====================================================== */}

            <Paper
                className="policy-dashboard-toolbar"
                elevation={0}
            >

                <TextField
                    className="policy-search"
                    value={search}
                    onChange={(e) =>
                        setSearch(
                            e.target.value
                        )
                    }
                    placeholder="Search policies..."
                    variant="outlined"
                    size="small"
                    fullWidth
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchRoundedIcon />
                            </InputAdornment>
                        ),
                    }}
                />

                <FormControl
                    className="policy-filter-control"
                    size="small"
                >
                    <Select
                        value={category}
                        onChange={(e) =>
                            setCategory(
                                e.target.value
                            )
                        }
                        displayEmpty
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

                <FormControl
                    className="policy-filter-control"
                    size="small"
                >
                    <Select
                        value={status}
                        onChange={(e) =>
                            setStatus(
                                e.target.value
                            )
                        }
                        displayEmpty
                    >
                        <MenuItem value="All">
                            All Status
                        </MenuItem>

                        <MenuItem value="Published">
                            Published
                        </MenuItem>

                        <MenuItem value="Draft">
                            Draft
                        </MenuItem>

                        <MenuItem value="Archived">
                            Archived
                        </MenuItem>
                    </Select>
                </FormControl>

            </Paper>

            {/* =====================================================
                POLICY TABLE
            ====================================================== */}

            <TableContainer
                component={Paper}
                className="policy-management-table"
                elevation={0}
            >

                <Table
                    stickyHeader
                    className="policy-mui-table"
                >

                    <TableHead>

                        <TableRow>

                            <TableCell>
                                Policy
                            </TableCell>

                            <TableCell>
                                Category
                            </TableCell>

                            <TableCell>
                                Version
                            </TableCell>

                            <TableCell>
                                Effective Date
                            </TableCell>

                            <TableCell>
                                Status
                            </TableCell>

                            <TableCell align="center">
                                Actions
                            </TableCell>

                        </TableRow>

                    </TableHead>

                    <TableBody>

                        {loading ? (
                            <TableRow>

                                <TableCell
                                    colSpan={6}
                                >

                                    <Box className="policy-table-loading">

                                        <CircularProgress
                                            size={30}
                                        />

                                        <Typography>
                                            Loading policies...
                                        </Typography>

                                    </Box>

                                </TableCell>

                            </TableRow>
                        ) : (
                            filteredPolicies.map(
                                (policy) => (

                                    <TableRow
                                        key={
                                            policy.policyId
                                        }
                                        hover
                                    >

                                        {/* Policy */}

                                        <TableCell>

                                            <Box className="policy-table-policy">

                                                <Box className="policy-pdf-icon">
                                                    <DescriptionRoundedIcon />
                                                </Box>

                                                <Box className="policy-table-policy-info">

                                                    <Typography
                                                        component="strong"
                                                    >
                                                        {
                                                            policy.policyTitle
                                                        }
                                                    </Typography>

                                                    <Typography
                                                        component="small"
                                                    >
                                                        {
                                                            policy.policyCode
                                                        }
                                                    </Typography>

                                                </Box>

                                            </Box>

                                        </TableCell>

                                        {/* Category */}

                                        <TableCell>

                                            <Chip
                                                label={
                                                    policy.category ||
                                                    "-"
                                                }
                                                className="policy-category"
                                            />

                                        </TableCell>

                                        {/* Version */}

                                        <TableCell>

                                            <Typography className="policy-table-value">
                                                v
                                                {
                                                    policy.version
                                                }
                                            </Typography>

                                        </TableCell>

                                        {/* Effective Date */}

                                        <TableCell>

                                            <Typography className="policy-table-value">
                                                {formatDate(
                                                    policy.effectiveDate
                                                )}
                                            </Typography>

                                        </TableCell>

                                        {/* Status */}

                                        <TableCell>

                                            <Chip
                                                label={
                                                    policy.status
                                                }
                                                className={`policy-status ${
                                                    policy.status
                                                        ? policy.status.toLowerCase()
                                                        : ""
                                                }`}
                                            />

                                        </TableCell>

                                        {/* Actions */}

                                        <TableCell>

                                            <Box className="policy-actions">

                                                {/* VIEW */}

                                                {hasPermission(
                                                    "/policy-management",
                                                    "view"
                                                ) && (
                                                    <Tooltip title="View PDF">

                                                        <IconButton
                                                            onClick={() =>
                                                                handleView(
                                                                    policy
                                                                )
                                                            }
                                                        >
                                                            <VisibilityRoundedIcon />
                                                        </IconButton>

                                                    </Tooltip>
                                                )}

                                                {/* EDIT */}

                                                {hasPermission(
                                                    "/policy-management",
                                                    "edit"
                                                ) && (
                                                    <Tooltip title="Edit">

                                                      

                                                    </Tooltip>
                                                )}

                                                {/* PUBLISH */}

                                                {policy.status !==
                                                    "Published" &&
                                                    hasPermission(
                                                        "/policy-management",
                                                        "approve"
                                                    ) && (
                                                        <Tooltip title="Publish">

                                                            <IconButton
                                                                onClick={() =>
                                                                    handlePublish(
                                                                        policy.policyId
                                                                    )
                                                                }
                                                                disabled={
                                                                    actionLoading
                                                                }
                                                            >
                                                                <PublishRoundedIcon />
                                                            </IconButton>

                                                        </Tooltip>
                                                    )}

                                                {/* ARCHIVE */}

                                                {policy.status ===
                                                    "Published" &&
                                                    hasPermission(
                                                        "/policy-management",
                                                        "edit"
                                                    ) && (
                                                        <Tooltip title="Archive">

                                                            <IconButton
                                                                onClick={() =>
                                                                    handleArchive(
                                                                        policy.policyId
                                                                    )
                                                                }
                                                                disabled={
                                                                    actionLoading
                                                                }
                                                            >
                                                                <ArchiveRoundedIcon />
                                                            </IconButton>

                                                        </Tooltip>
                                                    )}

                                                {/* DELETE */}

                                                {hasPermission(
                                                    "/policy-management",
                                                    "delete"
                                                ) && (
                                                    <Tooltip title="Delete">

                                                        <IconButton
                                                            className="delete"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    policy.policyId
                                                                )
                                                            }
                                                            disabled={
                                                                actionLoading
                                                            }
                                                        >
                                                            <DeleteRoundedIcon />
                                                        </IconButton>

                                                    </Tooltip>
                                                )}

                                            </Box>

                                        </TableCell>

                                    </TableRow>

                                )
                            )
                        )}

                        {!loading &&
                            filteredPolicies.length ===
                                0 && (
                                <TableRow>

                                    <TableCell
                                        colSpan={6}
                                    >

                                        <Box className="policy-empty">
                                            No policies found.
                                        </Box>

                                    </TableCell>

                                </TableRow>
                            )}

                    </TableBody>

                </Table>

            </TableContainer>

            {/* =====================================================
                ADD POLICY DIALOG
            ====================================================== */}

            <PolicyForm
                open={policyFormOpen}
                onClose={
                    handleClosePolicyForm
                }
                onSaved={
                    handlePolicySaved
                }
            />

        </Box>
    );
};

export default PolicyDashboard;