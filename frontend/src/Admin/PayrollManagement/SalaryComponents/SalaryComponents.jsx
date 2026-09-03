import React, { useEffect, useMemo, useState } from "react";

import {
    Alert,
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Snackbar,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";

import Add from "@mui/icons-material/Add";
import Close from "@mui/icons-material/Close";
import Delete from "@mui/icons-material/Delete";
import EditOutlined from "@mui/icons-material/EditOutlined";
import Percent from "@mui/icons-material/Percent";
import Search from "@mui/icons-material/Search";
import AccountBalanceWalletOutlined from "@mui/icons-material/AccountBalanceWalletOutlined";

import "./SalaryComponents.css";

/*
|--------------------------------------------------------------------------
| PAYROLL API
|--------------------------------------------------------------------------
|
| Your PayrollService.API is running on:
|
| http://localhost:5111
|
| Do NOT use https://localhost:7206 here.
|
*/
const API_URL = "http://localhost:5111/api";

/*
|--------------------------------------------------------------------------
| EMPTY FORM
|--------------------------------------------------------------------------
*/

const EMPTY_FORM = {
    componentName: "",
    componentCode: "",
    componentType: "Earning",
    calculationType: "Percentage",
    isActive: true,
};

/*
|--------------------------------------------------------------------------
| NORMALIZE API RESPONSE
|--------------------------------------------------------------------------
*/

const normalizeComponent = (item) => ({
    salaryComponentId:
        item?.salaryComponentId ??
        item?.SalaryComponentId ??
        null,

    componentName:
        item?.componentName ??
        item?.ComponentName ??
        "",

    componentCode:
        item?.componentCode ??
        item?.ComponentCode ??
        "",

    componentType:
        item?.componentType ??
        item?.ComponentType ??
        "Earning",

    calculationType:
        item?.calculationType ??
        item?.CalculationType ??
        "Percentage",

    isActive:
        item?.isActive ??
        item?.IsActive ??
        true,

    createdDate:
        item?.createdDate ??
        item?.CreatedDate ??
        null,
});

/*
|--------------------------------------------------------------------------
| RESPONSE HELPER
|--------------------------------------------------------------------------
*/

const getResponseBody = async (response) => {
    const text = await response.text();

    if (!text) {
        return null;
    }

    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
};

/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

export default function SalaryComponents() {
    const [components, setComponents] = useState([]);

    const [search, setSearch] = useState("");

    const [status, setStatus] = useState("All");

    const [typeFilter, setTypeFilter] = useState("All");

    const [loading, setLoading] = useState(true);

    const [dialogOpen, setDialogOpen] = useState(false);

    const [editingId, setEditingId] = useState(null);

    const [form, setForm] = useState(EMPTY_FORM);

    const [deleteId, setDeleteId] = useState(null);

    const [saving, setSaving] = useState(false);

    const [deleting, setDeleting] = useState(false);

    const [snackbar, setSnackbar] = useState({
        open: false,
        severity: "success",
        message: "",
    });

    /*
    |--------------------------------------------------------------------------
    | MESSAGE
    |--------------------------------------------------------------------------
    */

    const showMessage = (
        message,
        severity = "success"
    ) => {
        setSnackbar({
            open: true,
            severity,
            message,
        });
    };

    /*
    |--------------------------------------------------------------------------
    | LOAD COMPONENTS
    |--------------------------------------------------------------------------
    */

    const loadComponents = async () => {
        setLoading(true);

        try {
            const response = await fetch(
                `${API_URL}/SalaryComponents`,
                {
                    method: "GET",
                    headers: {
                        Accept: "application/json",
                    },
                }
            );

            const body = await getResponseBody(response);

            if (!response.ok) {
                const message =
                    typeof body === "object"
                        ? body?.message ||
                          body?.title ||
                          body?.error
                        : body;

                throw new Error(
                    message ||
                        `Unable to load salary components (${response.status}).`
                );
            }

            const list = Array.isArray(body)
                ? body
                : Array.isArray(body?.data)
                ? body.data
                : Array.isArray(body?.items)
                ? body.items
                : [];

            setComponents(
                list.map(normalizeComponent)
            );
        } catch (error) {
            console.error(
                "Unable to load salary components:",
                error
            );

            setComponents([]);

            showMessage(
                error?.message ||
                    "Unable to load salary components.",
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | INITIAL LOAD
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        loadComponents();
    }, []);

    /*
    |--------------------------------------------------------------------------
    | FILTERED COMPONENTS
    |--------------------------------------------------------------------------
    */

    const filteredComponents = useMemo(() => {
        const term = search
            .trim()
            .toLowerCase();

        return components.filter(
            (component) => {
                const name = String(
                    component.componentName || ""
                ).toLowerCase();

                const code = String(
                    component.componentCode || ""
                ).toLowerCase();

                const type = String(
                    component.componentType || ""
                ).toLowerCase();

                const matchesSearch =
                    !term ||
                    name.includes(term) ||
                    code.includes(term);

                const matchesStatus =
                    status === "All" ||
                    (status === "Active" &&
                        component.isActive) ||
                    (status === "Inactive" &&
                        !component.isActive);

                const matchesType =
                    typeFilter === "All" ||
                    type ===
                        typeFilter.toLowerCase();

                return (
                    matchesSearch &&
                    matchesStatus &&
                    matchesType
                );
            }
        );
    }, [
        components,
        search,
        status,
        typeFilter,
    ]);

    /*
    |--------------------------------------------------------------------------
    | CREATE
    |--------------------------------------------------------------------------
    */

    const openCreate = () => {
        setEditingId(null);

        setForm({
            ...EMPTY_FORM,
        });

        setDialogOpen(true);
    };

    /*
    |--------------------------------------------------------------------------
    | EDIT
    |--------------------------------------------------------------------------
    */

    const openEdit = (component) => {
        setEditingId(
            component.salaryComponentId
        );

        setForm({
            componentName:
                component.componentName || "",

            componentCode:
                component.componentCode || "",

            componentType:
                component.componentType ||
                "Earning",

            calculationType:
                component.calculationType ||
                "Percentage",

            isActive:
                Boolean(component.isActive),
        });

        setDialogOpen(true);
    };

    /*
    |--------------------------------------------------------------------------
    | CLOSE DIALOG
    |--------------------------------------------------------------------------
    */

    const closeDialog = () => {
        if (saving) {
            return;
        }

        setDialogOpen(false);

        setEditingId(null);

        setForm({
            ...EMPTY_FORM,
        });
    };

    /*
    |--------------------------------------------------------------------------
    | FORM UPDATE
    |--------------------------------------------------------------------------
    */

    const updateForm = (
        field,
        value
    ) => {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));
    };

    /*
    |--------------------------------------------------------------------------
    | CHANGE COMPONENT TYPE
    |--------------------------------------------------------------------------
    */

    const handleComponentTypeChange = (
        value
    ) => {
        setForm((current) => ({
            ...current,
            componentType: value,
        }));
    };

    /*
    |--------------------------------------------------------------------------
    | GENERATE CODE
    |--------------------------------------------------------------------------
    */

    const generateComponentCode = (
        componentName
    ) => {
        return String(componentName || "")
            .trim()
            .toUpperCase()
            .replace(/[^A-Z0-9]+/g, "_")
            .replace(/^_+|_+$/g, "");
    };

    /*
    |--------------------------------------------------------------------------
    | SAVE COMPONENT
    |--------------------------------------------------------------------------
    */

    const saveComponent = async () => {
        const name =
            form.componentName.trim();

        let code =
            form.componentCode.trim();

        /*
        Automatically generate code if empty.
        */
        if (!code) {
            code = generateComponentCode(
                name
            );
        }

        code = code.toUpperCase();

        /*
        Validation
        */

        if (!name) {
            showMessage(
                "Component name is required.",
                "error"
            );

            return;
        }

        if (!code) {
            showMessage(
                "Component code is required.",
                "error"
            );

            return;
        }

        if (
            !form.componentType ||
            ![
                "Earning",
                "Deduction",
            ].includes(
                form.componentType
            )
        ) {
            showMessage(
                "Please select a valid component type.",
                "error"
            );

            return;
        }

        if (
            !form.calculationType ||
            ![
                "Percentage",
                "Fixed",
            ].includes(
                form.calculationType
            )
        ) {
            showMessage(
                "Please select a valid calculation type.",
                "error"
            );

            return;
        }

        setSaving(true);

        const isEdit =
            editingId !== null;

        const url = isEdit
            ? `${API_URL}/SalaryComponents/${editingId}`
            : `${API_URL}/SalaryComponents`;

        /*
        |--------------------------------------------------------------------------
        | PAYLOAD
        |--------------------------------------------------------------------------
        */

        const payload = {
            componentName: name,
            componentCode: code,
            componentType:
                form.componentType,
            calculationType:
                form.calculationType,
            isActive:
                Boolean(form.isActive),
        };

        try {
            const response =
                await fetch(url, {
                    method: isEdit
                        ? "PUT"
                        : "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Accept:
                            "application/json",
                    },

                    body: JSON.stringify(
                        payload
                    ),
                });

            const body =
                await getResponseBody(
                    response
                );

            if (!response.ok) {
                const message =
                    typeof body === "object"
                        ? body?.message ||
                          body?.title ||
                          body?.error
                        : body;

                throw new Error(
                    message ||
                        `Unable to ${
                            isEdit
                                ? "update"
                                : "create"
                        } salary component (${response.status}).`
                );
            }

            await loadComponents();

            showMessage(
                isEdit
                    ? "Salary component updated successfully."
                    : "Salary component created successfully.",
                "success"
            );

            closeDialog();
        } catch (error) {
            console.error(
                "Unable to save salary component:",
                error
            );

            showMessage(
                error?.message ||
                    "Unable to save salary component.",
                "error"
            );
        } finally {
            setSaving(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | DELETE
    |--------------------------------------------------------------------------
    */

const confirmDelete = async () => {
    if (!deleteId || deleting) {
        return;
    }

    const idToDelete = Number(deleteId);

    setDeleting(true);

    try {
        const response = await fetch(
            `${API_URL}/SalaryComponents/${idToDelete}`,
            {
                method: "DELETE",
                headers: {
                    Accept: "application/json",
                },
            }
        );

        const body = await getResponseBody(response);

        if (!response.ok) {
            const message =
                typeof body === "object"
                    ? body?.message ||
                      body?.title ||
                      body?.error
                    : body;

            throw new Error(
                message ||
                    `Unable to delete salary component (${response.status}).`
            );
        }

        // Remove it from the current UI immediately.
        setComponents((current) =>
            current.filter(
                (component) =>
                    Number(component.salaryComponentId) !== idToDelete
            )
        );

        setDeleteId(null);

        showMessage(
            "Salary component deleted successfully.",
            "success"
        );
    } catch (error) {
        console.error(
            "Unable to delete salary component:",
            error
        );

        showMessage(
            error?.message ||
                "Unable to delete salary component.",
            "error"
        );
    } finally {
        setDeleting(false);
    }
};
    /*
    |--------------------------------------------------------------------------
    | CLOSE SNACKBAR
    |--------------------------------------------------------------------------
    */

    const closeSnackbar = () => {
        setSnackbar(
            (current) => ({
                ...current,
                open: false,
            })
        );
    };

    /*
    |--------------------------------------------------------------------------
    | RENDER
    |--------------------------------------------------------------------------
    */

    return (
        <Box className="sc-salary-components-page">

            {/* =========================================================
                HEADER
            ========================================================= */}

            <Box className="sc-salary-components-header">

                <Box>
                    <Typography
                        className="sc-salary-components-title"
                        component="h1"
                    >
                        Salary Components
                    </Typography>

                    <Typography
                        className="sc-salary-components-subtitle"
                    >
                        Manage earnings, allowances,
                        bonuses, deductions and
                        other salary components.
                    </Typography>
                </Box>

                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={openCreate}
                    className="sc-salary-components-add-button"
                >
                    Add Component
                </Button>

            </Box>

            {/* =========================================================
                TOOLBAR
            ========================================================= */}

            <Paper
                elevation={0}
                className="sc-salary-components-toolbar"
            >

                <TextField
                    fullWidth
                    size="small"
                    value={search}
                    onChange={(event) =>
                        setSearch(
                            event.target.value
                        )
                    }
                    placeholder="Search components..."
                    className="sc-salary-components-search"
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search className="sc-salary-components-search-icon" />
                                </InputAdornment>
                            ),
                        },
                    }}
                />

                <FormControl
                    size="small"
                    className="sc-salary-components-status"
                >
                    <InputLabel>
                        Status
                    </InputLabel>

                    <Select
                        value={status}
                        label="Status"
                        onChange={(event) =>
                            setStatus(
                                event.target.value
                            )
                        }
                    >
                        <MenuItem value="All">
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

                <FormControl
                    size="small"
                    className="sc-salary-components-type-filter"
                >
                    <InputLabel>
                        Type
                    </InputLabel>

                    <Select
                        value={typeFilter}
                        label="Type"
                        onChange={(event) =>
                            setTypeFilter(
                                event.target.value
                            )
                        }
                    >
                        <MenuItem value="All">
                            All Types
                        </MenuItem>

                        <MenuItem value="Earning">
                            Earnings
                        </MenuItem>

                        <MenuItem value="Deduction">
                            Deductions
                        </MenuItem>
                    </Select>
                </FormControl>

            </Paper>

            {/* =========================================================
                COUNT
            ========================================================= */}

            <Box className="sc-salary-components-count">
                {filteredComponents.length}{" "}
                {filteredComponents.length ===
                1
                    ? "component"
                    : "components"}
            </Box>

            {/* =========================================================
                LOADING
            ========================================================= */}

            {loading ? (
                <Paper
                    elevation={0}
                    className="sc-salary-components-empty"
                >
                    <Typography>
                        Loading salary components...
                    </Typography>
                </Paper>
            ) : filteredComponents.length ===
              0 ? (

                /* =====================================================
                   EMPTY
                ===================================================== */

                <Paper
                    elevation={0}
                    className="sc-salary-components-empty"
                >
                    <Box className="sc-salary-components-empty-icon">
                        <AccountBalanceWalletOutlined />
                    </Box>

                    <Typography
                        className="sc-salary-components-empty-title"
                    >
                        No salary components found
                    </Typography>

                    <Typography
                        className="sc-salary-components-empty-text"
                    >
                        Create your first earning
                        or deduction component
                        to use it in payroll
                        templates.
                    </Typography>

                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={openCreate}
                    >
                        Add Component
                    </Button>
                </Paper>

            ) : (

                /* =====================================================
                   COMPONENT GRID
                ===================================================== */

                <Box className="sc-salary-components-grid">

                    {filteredComponents.map(
                        (component) => {

                            const isEarning =
                                String(
                                    component.componentType ||
                                        ""
                                ).toLowerCase() ===
                                "earning";

                            return (
                                <Paper
                                    key={
                                        component.salaryComponentId
                                    }
                                    elevation={0}
                                    className="sc-salary-component-card"
                                >

                                    {/* TOP */}

                                    <Box className="sc-salary-component-card-top">

                                        <Box
                                            className={
                                                isEarning
                                                    ? "sc-salary-component-icon"
                                                    : "sc-salary-component-icon sc-deduction"
                                            }
                                        >
                                            {isEarning ? (
                                                <AccountBalanceWalletOutlined />
                                            ) : (
                                                <Percent />
                                            )}
                                        </Box>

                                        <Chip
                                            label={
                                                component.isActive
                                                    ? "Active"
                                                    : "Inactive"
                                            }
                                            size="small"
                                            className={
                                                component.isActive
                                                    ? "sc-salary-component-status-active"
                                                    : "sc-salary-component-status-inactive"
                                            }
                                        />

                                    </Box>

                                    {/* NAME */}

                                    <Typography
                                        className="sc-salary-component-name"
                                    >
                                        {
                                            component.componentName
                                        }
                                    </Typography>

                                    {/* CODE */}

                                    <Typography
                                        className="sc-salary-component-code"
                                    >
                                        {
                                            component.componentCode
                                        }
                                    </Typography>

                                    {/* DETAILS */}

                                    <Box className="sc-salary-component-details">

                                        <Box>
                                            <Typography
                                                className="sc-salary-component-detail-label"
                                            >
                                                TYPE
                                            </Typography>

                                            <Typography
                                                className="sc-salary-component-detail-value"
                                            >
                                                {
                                                    component.componentType
                                                }
                                            </Typography>
                                        </Box>

                                        <Box>
                                            <Typography
                                                className="sc-salary-component-detail-label"
                                            >
                                                CALCULATION
                                            </Typography>

                                            <Typography
                                                className="sc-salary-component-detail-value"
                                            >
                                                {
                                                    component.calculationType
                                                }
                                            </Typography>
                                        </Box>

                                    </Box>

                                    {/* ACTIONS */}

                                    <Box className="sc-salary-component-actions">

                                        <Tooltip title="Edit">
                                            <IconButton
                                                onClick={() =>
                                                    openEdit(
                                                        component
                                                    )
                                                }
                                            >
                                                <EditOutlined />
                                            </IconButton>
                                        </Tooltip>

                                        <Tooltip title="Delete">
                                            <IconButton
                                                color="error"
                                                onClick={() =>
                                                    setDeleteId(
                                                        component.salaryComponentId
                                                    )
                                                }
                                            >
                                                <Delete />
                                            </IconButton>
                                        </Tooltip>

                                    </Box>

                                </Paper>
                            );
                        }
                    )}

                </Box>
            )}

            {/* =========================================================
                ADD / EDIT DIALOG
            ========================================================= */}

            <Dialog
                open={dialogOpen}
                onClose={closeDialog}
                fullWidth
                maxWidth="sm"
            >

                <DialogTitle>

                    {editingId !== null
                        ? "Edit Salary Component"
                        : "Add Salary Component"}

                    <IconButton
                        onClick={closeDialog}
                        disabled={saving}
                        className="salary-component-dialog-close"
                    >
                        <Close />
                    </IconButton>

                </DialogTitle>

                <DialogContent dividers>

                    <Stack
                        spacing={2.5}
                        sx={{ pt: 1 }}
                    >

                        {/* NAME */}

                        <TextField
                            fullWidth
                            required
                            label="Component Name"
                            value={
                                form.componentName
                            }
                            onChange={(event) =>
                                updateForm(
                                    "componentName",
                                    event.target.value
                                )
                            }
                            placeholder="e.g. Basic Salary"
                        />

                        {/* CODE */}

                        <TextField
                            fullWidth
                            required
                            label="Component Code"
                            value={
                                form.componentCode
                            }
                            onChange={(event) =>
                                updateForm(
                                    "componentCode",
                                    event.target.value
                                        .toUpperCase()
                                        .replace(
                                            /\s+/g,
                                            "_"
                                        )
                                )
                            }
                            placeholder="e.g. BASIC_SALARY"
                            helperText="Use a unique code without spaces."
                        />

                        {/* TYPE */}

                        <FormControl fullWidth>
                            <InputLabel>
                                Component Type
                            </InputLabel>

                            <Select
                                value={
                                    form.componentType
                                }
                                label="Component Type"
                                onChange={(event) =>
                                    handleComponentTypeChange(
                                        event.target.value
                                    )
                                }
                            >
                                <MenuItem value="Earning">
                                    Earning
                                </MenuItem>

                                <MenuItem value="Deduction">
                                    Deduction
                                </MenuItem>
                            </Select>
                        </FormControl>

                        {/* CALCULATION TYPE */}

                        <FormControl fullWidth>
                            <InputLabel>
                                Calculation Type
                            </InputLabel>

                            <Select
                                value={
                                    form.calculationType
                                }
                                label="Calculation Type"
                                onChange={(event) =>
                                    updateForm(
                                        "calculationType",
                                        event.target.value
                                    )
                                }
                            >
                                <MenuItem value="Percentage">
                                    Percentage
                                </MenuItem>

                                <MenuItem value="Fixed">
                                    Fixed Amount
                                </MenuItem>
                            </Select>
                        </FormControl>

                        {/* STATUS */}

                        <FormControl fullWidth>
                            <InputLabel>
                                Status
                            </InputLabel>

                            <Select
                                value={
                                    form.isActive
                                        ? "Active"
                                        : "Inactive"
                                }
                                label="Status"
                                onChange={(event) =>
                                    updateForm(
                                        "isActive",
                                        event.target.value ===
                                            "Active"
                                    )
                                }
                            >
                                <MenuItem value="Active">
                                    Active
                                </MenuItem>

                                <MenuItem value="Inactive">
                                    Inactive
                                </MenuItem>
                            </Select>
                        </FormControl>

                        {/* INFORMATION */}

                        <Box className="sc-salary-component-type-note">

                            {form.componentType ===
                            "Deduction" ? (
                                <Percent />
                            ) : (
                                <AccountBalanceWalletOutlined />
                            )}

                            <Box>

                                <Typography>
                                    Component Type
                                </Typography>

                                <Typography>
                                    {
                                        form.componentType
                                    }
                                </Typography>

                            </Box>

                        </Box>

                    </Stack>

                </DialogContent>

                <DialogActions>

                    <Button
                        onClick={closeDialog}
                        disabled={saving}
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="contained"
                        onClick={saveComponent}
                        disabled={saving}
                    >
                        {saving
                            ? "Saving..."
                            : editingId !== null
                            ? "Save Changes"
                            : "Create Component"}
                    </Button>

                </DialogActions>

            </Dialog>

            {/* =========================================================
                DELETE CONFIRMATION
            ========================================================= */}

            <Dialog
                open={Boolean(deleteId)}
                onClose={() =>
                    deleting
                        ? null
                        : setDeleteId(null)
                }
                maxWidth="xs"
                fullWidth
            >

                <DialogTitle>
                    Delete Salary Component?
                </DialogTitle>

                <DialogContent>

                    <Typography color="text.secondary">
                        This component may already
                        be used by payroll templates.
                        Delete it only if you are
                        sure it is no longer needed.
                    </Typography>

                </DialogContent>

                <DialogActions>

                    <Button
                        onClick={() =>
                            setDeleteId(null)
                        }
                        disabled={deleting}
                    >
                        Cancel
                    </Button>

                    <Button
                        color="error"
                        variant="contained"
                        onClick={confirmDelete}
                        disabled={deleting}
                    >
                        {deleting
                            ? "Deleting..."
                            : "Delete"}
                    </Button>

                </DialogActions>

            </Dialog>

            {/* =========================================================
                SNACKBAR
            ========================================================= */}

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={closeSnackbar}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                }}
            >

                <Alert
                    severity={
                        snackbar.severity
                    }
                    variant="filled"
                    onClose={
                        closeSnackbar
                    }
                >
                    {
                        snackbar.message
                    }
                </Alert>

            </Snackbar>

        </Box>
    );
}