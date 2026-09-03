import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Divider,
    FormControl,
    IconButton,
    InputAdornment,
    InputLabel,
    Menu,
    MenuItem,
    Select,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";

import PayrollService from "../Service/PayrollService";
import "./PayslipTemplates.css";

function PayslipTemplates() {
    const navigate = useNavigate();

    const [templates, setTemplates] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All Status");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [menuAnchor, setMenuAnchor] = useState(null);
    const [selectedTemplate, setSelectedTemplate] = useState(null);

    const menuOpen = Boolean(menuAnchor);

    // ============================================================
    // LOAD TEMPLATES
    // ============================================================

    const loadTemplates = async () => {
        setLoading(true);
        setError("");

        try {
            const data = await PayrollService.getTemplates();

            const normalized = (Array.isArray(data) ? data : []).map(
                (template) => {
                    const components =
                        template.components ||
                        template.Components ||
                        [];

                    return {
                        ...template,

                        id:
                            template.payrollTemplateId ??
                            template.PayrollTemplateId,

                        name:
                            template.templateName ??
                            template.TemplateName ??
                            "Unnamed Template",

                        description:
                            template.description ??
                            template.Description ??
                            "",

                        employeeType:
                            template.employeeType ??
                            template.EmployeeType ??
                            "Employee",

                        payFrequency:
                            template.payFrequency ??
                            template.PayFrequency ??
                            "Monthly",

                        currency:
                            template.currency ??
                            template.Currency ??
                            "INR",

                        status:
                            template.status ??
                            template.Status ??
                            "Active",

                        components,

                        componentCount:
                            components.length ||
                            template.componentCount ||
                            template.ComponentCount ||
                            0,

                        createdDate:
                            template.createdDate ??
                            template.CreatedDate ??
                            null,
                    };
                }
            );

            setTemplates(normalized);
        } catch (err) {
            console.error("Unable to load payroll templates:", err);

            setError(
                err?.message ||
                    "Unable to load payroll templates."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTemplates();
    }, []);

    // ============================================================
    // SEARCH / FILTER
    // ============================================================

    const filteredTemplates = useMemo(() => {
        const searchValue = search.trim().toLowerCase();

        return templates.filter((template) => {
            const matchesSearch =
                !searchValue ||
                String(template.name || "")
                    .toLowerCase()
                    .includes(searchValue) ||
                String(template.description || "")
                    .toLowerCase()
                    .includes(searchValue) ||
                String(template.employeeType || "")
                    .toLowerCase()
                    .includes(searchValue);

            const matchesStatus =
                statusFilter === "All Status" ||
                String(template.status).toLowerCase() ===
                    statusFilter.toLowerCase();

            return matchesSearch && matchesStatus;
        });
    }, [templates, search, statusFilter]);

    // ============================================================
    // CREATE
    // ============================================================

    const handleCreate = () => {
        navigate("/payroll/payslip-templates/create");
    };

    // ============================================================
    // VIEW
    // ============================================================

    const handleView = async (template) => {
        try {
            setError("");

            const fullTemplate =
                await PayrollService.getTemplate(
                    template.id
                );

            navigate(
                `/payroll/payslip-templates/create?id=${encodeURIComponent(
                    template.id
                )}&mode=view`,
                {
                    state: {
                        template: fullTemplate,
                        mode: "view",
                    },
                }
            );
        } catch (err) {
            console.error(
                "Unable to load payroll template:",
                err
            );

            setError(
                err?.message ||
                    "Unable to open payroll template."
            );
        }
    };

    // ============================================================
    // EDIT
    // ============================================================

    const handleEdit = async (template) => {
        try {
            setError("");

            const fullTemplate =
                await PayrollService.getTemplate(
                    template.id
                );

            navigate(
                `/payroll/payslip-templates/create?id=${encodeURIComponent(
                    template.id
                )}&mode=edit`,
                {
                    state: {
                        template: fullTemplate,
                        mode: "edit",
                    },
                }
            );
        } catch (err) {
            console.error(
                "Unable to load payroll template:",
                err
            );

            setError(
                err?.message ||
                    "Unable to edit payroll template."
            );
        }
    };

    // ============================================================
    // DELETE / DEACTIVATE
    // ============================================================

    const handleDelete = async (template) => {
        const confirmed = window.confirm(
            `Are you sure you want to deactivate "${template.name}"?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");

            await PayrollService.deleteTemplate(
                template.id
            );

            handleMenuClose();

            await loadTemplates();
        } catch (err) {
            console.error(
                "Unable to deactivate payroll template:",
                err
            );

            setError(
                err?.message ||
                    "Unable to deactivate payroll template."
            );
        }
    };

    // ============================================================
    // MENU
    // ============================================================

    const handleMenuOpen = (event, template) => {
        event.stopPropagation();

        setMenuAnchor(event.currentTarget);
        setSelectedTemplate(template);
    };

    const handleMenuClose = () => {
        setMenuAnchor(null);
        setSelectedTemplate(null);
    };

    const handleMenuView = () => {
        const template = selectedTemplate;

        handleMenuClose();

        if (template) {
            handleView(template);
        }
    };

    const handleMenuEdit = () => {
        const template = selectedTemplate;

        handleMenuClose();

        if (template) {
            handleEdit(template);
        }
    };

    const handleMenuDelete = () => {
        const template = selectedTemplate;

        handleMenuClose();

        if (template) {
            handleDelete(template);
        }
    };

    // ============================================================
    // RENDER
    // ============================================================

    return (
        <Box className="pt-payslip-templates-page">
            {/* =====================================================
                HEADER
            ====================================================== */}

            <Box className="pt-payslip-templates-header">
                <Box>
                    <Typography
                        className="pt-payslip-templates-title"
                        variant="h4"
                    >
                        Payslip Templates
                    </Typography>

                    <Typography
                        className="pt-payslip-templates-subtitle"
                    >
                        Create and manage payslip templates
                        and salary calculation rules.
                    </Typography>
                </Box>

                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreate}
                    className="pt-create-template-button"
                >
                    Create Template
                </Button>
            </Box>

            {/* =====================================================
                ERROR
            ====================================================== */}

            {error && (
                <Alert
                    severity="error"
                    className="pt-payroll-error-alert"
                    onClose={() => setError("")}
                >
                    {error}
                </Alert>
            )}

            {/* =====================================================
                TOOLBAR
            ====================================================== */}

            <Card className="pt-payslip-templates-toolbar">
                <Box className="pt-templates-search-section">
<TextField
    fullWidth
    size="small"
    placeholder="Search templates..."
    value={search}
    onChange={(event) =>
        setSearch(event.target.value)
    }
    slotProps={{
        input: {
            startAdornment: (
                <InputAdornment position="start">
                    <SearchIcon />
                </InputAdornment>
            ),
        },
    }}
/>
                </Box>

                <FormControl
                    size="small"
                    className="pt-templates-status-filter"
                >
                    <InputLabel>Status</InputLabel>

                    <Select
                        value={statusFilter}
                        label="Status"
                        onChange={(event) =>
                            setStatusFilter(event.target.value)
                        }
                    >
                        <MenuItem value="All Status">
                            All Status
                        </MenuItem>

                        <MenuItem value="Active">
                            Active
                        </MenuItem>

                        <MenuItem value="Inactive">
                            Inactive
                        </MenuItem>
                    </Select>
                </FormControl>

                <Tooltip title="Refresh">
                    <span>
                        <IconButton
                            onClick={loadTemplates}
                            disabled={loading}
                        >
                            <RefreshIcon />
                        </IconButton>
                    </span>
                </Tooltip>
            </Card>

            {/* =====================================================
                COUNT
            ====================================================== */}

            <Box className="pt-templates-count-row">
                <Typography variant="body2">
                    {loading
                        ? "Loading..."
                        : `${filteredTemplates.length} ${
                              filteredTemplates.length ===
                              1
                                  ? "template"
                                  : "templates"
                          }`}
                </Typography>
            </Box>

            {/* =====================================================
                LOADING
            ====================================================== */}

            {loading ? (
                <Box className="pt-templates-loading">
                    <CircularProgress />

                    <Typography>
                        Loading payroll templates...
                    </Typography>
                </Box>
            ) : filteredTemplates.length === 0 ? (
                /* =================================================
                   EMPTY
                ================================================== */

                <Card className="pt-templates-empty-card">
                    <ReceiptLongOutlinedIcon className="pt-empty-template-icon" />

                    <Typography
                        variant="h6"
                        className="pt-empty-template-title"
                    >
                        No templates found
                    </Typography>

                    <Typography
                        variant="body2"
                        className="pt-empty-template-text"
                    >
                        Create a payslip template to define
                        salary calculation rules.
                    </Typography>

                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleCreate}
                    >
                        Create Template
                    </Button>
                </Card>
            ) : (
                /* =================================================
                   TEMPLATE GRID
                ================================================== */

                <Box className="pt-payslip-template-grid">
                    {filteredTemplates.map((template) => (
                        <Card
                            className="pt-payslip-template-card"
                            key={template.id}
                        >
                            <CardContent>
                                {/* TOP */}
                                <Box className="pt-template-card-header">
                                    <Box className="pt-template-icon-wrapper">
                                        <ReceiptLongOutlinedIcon />
                                    </Box>

                                    <IconButton
                                        onClick={(event) =>
                                            handleMenuOpen(
                                                event,
                                                template
                                            )
                                        }
                                    >
                                        <MoreVertIcon />
                                    </IconButton>
                                </Box>

                                {/* NAME */}
                                <Typography
                                    variant="h6"
                                    className="pt-template-card-name"
                                >
                                    {template.name}
                                </Typography>

                                {/* DESCRIPTION */}
                                <Typography
                                    variant="body2"
                                    className="pt-template-card-description"
                                >
                                    {template.description ||
                                        "No description provided."}
                                </Typography>

                                <Divider className="pt-template-card-divider" />

                                {/* INFO */}
                                <Box className="pt-template-card-info">
                                    <Box>
                                        <Typography className="pt-template-info-label">
                                            EMPLOYEE TYPE
                                        </Typography>

                                        <Typography className="pt-template-info-value">
                                            {template.employeeType}
                                        </Typography>
                                    </Box>

                                    <Box>
                                        <Typography className="pt-template-info-label">
                                            COMPONENTS
                                        </Typography>

                                        <Typography className="pt-template-info-value">
                                            {
                                                template.componentCount
                                            }
                                        </Typography>
                                    </Box>
                                </Box>

                                <Box className="pt-template-card-info">
                                    <Box>
                                        <Typography className="pt-template-info-label">
                                            FREQUENCY
                                        </Typography>

                                        <Typography className="pt-template-info-value">
                                            {
                                                template.payFrequency
                                            }
                                        </Typography>
                                    </Box>

                                    <Box>
                                        <Typography className="pt-template-info-label">
                                            CURRENCY
                                        </Typography>

                                        <Typography className="pt-template-info-value">
                                            {template.currency}
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* FOOTER */}
                                <Box className="pt-template-card-footer">
                                    <Chip
                                        label={
                                            template.status ||
                                            "Active"
                                        }
                                        size="small"
                                        className={
                                            String(
                                                template.status
                                            ).toLowerCase() ===
                                            "active"
                                                ? "pt-template-status-active"
                                                : "pt-template-status-inactive"
                                        }
                                    />

                                    <Stack
                                        direction="row"
                                        spacing={0.5}
                                    >
                                        <Tooltip title="View">
                                            <IconButton
                                                size="small"
                                                onClick={() =>
                                                    handleView(
                                                        template
                                                    )
                                                }
                                            >
                                                <VisibilityOutlinedIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>

                                        <Tooltip title="Edit">
                                            <IconButton
                                                size="small"
                                                onClick={() =>
                                                    handleEdit(
                                                        template
                                                    )
                                                }
                                            >
                                                <EditOutlinedIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>

                                        <Tooltip title="Deactivate">
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() =>
                                                    handleDelete(
                                                        template
                                                    )
                                                }
                                            >
                                                <DeleteOutlineOutlinedIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </Stack>
                                </Box>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            )}

            {/* =====================================================
                ACTION MENU
            ====================================================== */}

            <Menu
                anchorEl={menuAnchor}
                open={menuOpen}
                onClose={handleMenuClose}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
            >
                <MenuItem onClick={handleMenuView}>
                    <VisibilityOutlinedIcon
                        fontSize="small"
                        sx={{ mr: 1.5 }}
                    />
                    View
                </MenuItem>

                <MenuItem onClick={handleMenuEdit}>
                    <EditOutlinedIcon
                        fontSize="small"
                        sx={{ mr: 1.5 }}
                    />
                    Edit
                </MenuItem>

                {selectedTemplate?.status === "Active" && (
                    <MenuItem
                        onClick={handleMenuDelete}
                        sx={{ color: "error.main" }}
                    >
                        <DeleteOutlineOutlinedIcon
                            fontSize="small"
                            sx={{ mr: 1.5 }}
                        />
                        Deactivate
                    </MenuItem>
                )}
            </Menu>
        </Box>
    );
}

export default PayslipTemplates;