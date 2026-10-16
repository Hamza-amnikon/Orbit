import { MuiTableBodyMigration, MuiTableCellMigration, MuiTableHeadMigration, MuiTableMigration, MuiTableRowMigration } from "../../../components/ui/MuiCompat.jsx";
import { useEffect, useState } from "react";
import axios from "axios";
import "./LeaveTypes.css";
import { useAuth } from "../../../context/AuthContext";

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    IconButton,
    Box,
    Paper,
    Stack,
    Typography,
    InputAdornment,
    Snackbar,
    Alert,
    Chip,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import RefreshRounded from "@mui/icons-material/RefreshRounded";
import AddRounded from "@mui/icons-material/AddRounded";
import SearchRounded from "@mui/icons-material/SearchRounded";
import EditOutlined from "@mui/icons-material/EditOutlined";
import DeleteOutlineRounded from "@mui/icons-material/DeleteOutlineRounded";
import Tooltip from "@mui/material/Tooltip";
import { Box as MuiLayoutBox, Typography as MuiText } from "@mui/material";

const LEAVE_TYPE_API =
    `${import.meta.env.VITE_LEAVE_API_BASE_URL}/api/LeaveType`;

export default function LeaveTypes() {

    const { hasPermission } = useAuth();

    const permissionRoute = "/leave/types";
    const canView = hasPermission(permissionRoute, "view");
    const canCreate = hasPermission(permissionRoute, "create");
    const canEdit = hasPermission(permissionRoute, "edit");
    const canDelete = hasPermission(permissionRoute, "delete");

    const [leaveTypes, setLeaveTypes] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [notice, setNotice] = useState({ open: false, message: "", severity: "success" });
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [loading, setLoading] = useState(false);

    const [showForm, setShowForm] = useState(false);

    const [leaveTypeName, setLeaveTypeName] = useState("");
    const [leaveCode, setLeaveCode] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("Active");
    const [eligibleGender, setEligibleGender] = useState("All");

    const [editingId, setEditingId] = useState(null);


    // ==========================================
    // Load Leave Types
    // ==========================================

    useEffect(() => {
        loadLeaveTypes();
    }, []);


    async function loadLeaveTypes() {
        setLoading(true);
        try {
            const response = await axios.get(LEAVE_TYPE_API);
            setLeaveTypes(Array.isArray(response.data) ? response.data : []);
        }
        catch (error) {
            console.error("Leave Type Error:", error);
            setNotice({ open: true, message: "Could not load leave types. Please try again.", severity: "error" });
        } finally {
            setLoading(false);
        }
    }


    // ==========================================
    // Add Leave Type
    // ==========================================

    async function addLeaveType(e) {

        if (!canCreate) return;

        e.preventDefault();

        if (!leaveTypeName.trim()) {
            setNotice({ open: true, message: "Please enter a leave type name.", severity: "warning" });
            return;
        }

        if (!leaveCode.trim()) {

            setNotice({ open: true, message: "Please enter a leave code.", severity: "warning" });
            return;
        }

        const leaveType = {

            leaveTypeName: leaveTypeName.trim(),

            leaveCode: leaveCode.trim().toUpperCase(),

            description: description.trim(),

            status: status,

            eligibleGender: eligibleGender

        };


        try {

            await axios.post(
                LEAVE_TYPE_API,
                leaveType
            );

            setNotice({ open: true, message: "Leave type added successfully.", severity: "success" });


            // Reset form

            setLeaveTypeName("");
            setLeaveCode("");
            setDescription("");
            setStatus("Active");
            setEligibleGender("All");

            setShowForm(false);


            // Reload table

            await loadLeaveTypes();

        }
        catch (error) {

            console.error(
                "Add Leave Type Error:",
                error
            );

            if (error.response) {

                setNotice({ open: true, message: "Unable to add leave type.", severity: "error" });

            }
            else {

                setNotice({ open: true, message: "Unable to connect to the leave service.", severity: "error" });

            }

        }
    }


    // ==========================================
    // Edit Leave Type
    // ==========================================

    function editLeaveType(leaveType) {

        if (!canEdit) return;

        setEditingId(
            leaveType.leaveTypeId
        );

        setLeaveTypeName(
            leaveType.leaveTypeName
        );

        setLeaveCode(
            leaveType.leaveCode
        );

        setDescription(
            leaveType.description || ""
        );

        setStatus(
            leaveType.status
        );

        setEligibleGender(
            leaveType.eligibleGender || "All"
        );

        setShowForm(true);

        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });
    }


    // ==========================================
    // Update Leave Type
    // ==========================================

    async function updateLeaveType(e) {

        if (!canEdit) return;

        e.preventDefault();

        const leaveType = {

            leaveTypeId: editingId,

            leaveTypeName:
                leaveTypeName.trim(),

            leaveCode:
                leaveCode.trim().toUpperCase(),

            description:
                description.trim(),

            status,

            eligibleGender

        };


        try {

            await axios.put(

                `${LEAVE_TYPE_API}/${editingId}`,

                leaveType

            );

            setNotice({ open: true, message: "Leave type updated successfully.", severity: "success" });


            setEditingId(null);

            setLeaveTypeName("");

            setLeaveCode("");

            setDescription("");

            setStatus("Active");

            setEligibleGender("All");

            setShowForm(false);


            await loadLeaveTypes();

        }
        catch (error) {

            console.error(
                "Update Leave Type Error:",
                error
            );

            setNotice({ open: true, message: "Unable to update leave type.", severity: "error" });

        }
    }


    // ==========================================
    // Delete Leave Type
    // ==========================================

    async function deleteLeaveType() {
        if (!canDelete || !deleteTarget) return;
        try {
            await axios.delete(
                `${LEAVE_TYPE_API}/${deleteTarget.leaveTypeId}`
            );
            setNotice({ open: true, message: "Leave type deleted successfully.", severity: "success" });
            setDeleteTarget(null);
            await loadLeaveTypes();
        }
        catch (error) {
            console.error(
                "Delete Leave Type Error:",
                error
            );
            setNotice({ open: true, message: "Unable to delete leave type.", severity: "error" });
        }
    }

    const filteredLeaveTypes = leaveTypes.filter((item) => {
        const query = search.trim().toLowerCase();
        const matchesSearch = !query || [item.leaveTypeName, item.leaveCode, item.description, item.eligibleGender]
            .some((value) => String(value ?? "").toLowerCase().includes(query));
        const matchesStatus = statusFilter === "All" || String(item.status).toLowerCase() === statusFilter.toLowerCase();
        return matchesSearch && matchesStatus;
    });


    // ==========================================
    // Close / Reset Form
    // ==========================================

    function closeForm() {

        setShowForm(false);

        setEditingId(null);

        setLeaveTypeName("");

        setLeaveCode("");

        setDescription("");

        setStatus("Active");

        setEligibleGender("All");

    }


    if (!canView) {
        return (
            <MuiLayoutBox
                className="leave-types-page"
                style={{ padding: "60px", textAlign: "center" }}
             component="div">
                <Typography component="h2" variant="h5">Access Denied</Typography>
                <Typography component="p" variant="body1">You do not have permission to access this page.</Typography>
            </MuiLayoutBox>
        );
    }

    return (

        <MuiLayoutBox className="leave-types-page" component="main">

            <MuiLayoutBox className="leave-types-outer-card" component="div">

                <MuiLayoutBox className="leave-types-main-card" component="div">


                    {/* ==========================================
                        HEADER CARD
                    ========================================== */}

                    <Paper className="leave-types-header-card" elevation={0} component="header">
                        <Stack className="leave-types-heading" direction="row" alignItems="center" spacing={1.5}>
                            <IconButton className="leave-types-back" onClick={() => window.history.back()} aria-label="Go back">
                                <ArrowBackRounded />
                            </IconButton>
                            <Box>
                                <Typography component="h1" variant="h4">Leave Types</Typography>
                                <Typography component="p" variant="body1">Manage the types of leave available to employees.</Typography>
                            </Box>
                        </Stack>
                        <Stack className="leave-type-header-actions" direction="row" spacing={1}>
                            <Button variant="outlined" startIcon={<RefreshRounded />} onClick={loadLeaveTypes} disabled={loading}>
                                Refresh
                            </Button>
                            {canCreate && (
                                <Button variant="contained" startIcon={<AddRounded />} onClick={() => { closeForm(); setShowForm(true); }}>
                                    Add Leave Type
                                </Button>
                            )}
                        </Stack>
                    </Paper>

                    <Paper className="leave-types-toolbar" elevation={0} component="section">
                        <TextField
                            className="leave-types-search"
                            size="small"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search by leave type, code or description"
                            aria-label="Search leave types"
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><SearchRounded color="action" /></InputAdornment>,
                                endAdornment: search ? <InputAdornment position="end"><IconButton size="small" aria-label="Clear search" onClick={() => setSearch("")}><CloseIcon fontSize="small" /></IconButton></InputAdornment> : null,
                            }}
                        />
                        <FormControl className="leave-types-status-filter" size="small">
                            <InputLabel id="leave-types-status-label">Status</InputLabel>
                            <Select labelId="leave-types-status-label" label="Status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                                <MenuItem value="All">All Status</MenuItem>
                                <MenuItem value="Active">Active</MenuItem>
                                <MenuItem value="Inactive">Inactive</MenuItem>
                            </Select>
                        </FormControl>
                    </Paper>


                    {/* ==========================================
                        MUI ADD / EDIT DIALOG
                    ========================================== */}

                    <Dialog

                        open={
                            showForm &&
                            (editingId ? canEdit : canCreate)
                        }

                        onClose={closeForm}

                        fullWidth

                        maxWidth="sm"

                        PaperProps={{
                            sx: {

                                borderRadius: "14px",

                                boxShadow:
                                    "0 20px 50px rgba(15, 23, 42, 0.25)",

                                overflow: "hidden"

                            }
                        }}

                    >

                        {/* Dialog Header */}

                        <DialogTitle

                            sx={{
                                padding:
                                    "18px 20px",

                                borderBottom:
                                    "1px solid #e5e7eb",

                                fontSize:
                                    "20px",

                                fontWeight:
                                    700,

                                color:
                                    "#111827",

                                display:
                                    "flex",

                                alignItems:
                                    "center",

                                justifyContent:
                                    "space-between"
                            }}

                        >

                            {editingId
                                ? "Edit Leave Type"
                                : "Add Leave Type"
                            }


                            <IconButton

                                onClick={closeForm}

                                size="small"

                                sx={{
                                    color: "#667085",

                                    background:
                                        "#f8fafc",

                                    borderRadius:
                                        "8px",

                                    "&:hover": {
                                        background:
                                            "#eef2f7"
                                    }
                                }}

                            >

                                <CloseIcon fontSize="small" />

                            </IconButton>

                        </DialogTitle>


                        {/* Dialog Content */}

                        <DialogContent

                            sx={{
                                padding:
                                    "24px 20px 10px !important"
                            }}

                        >

                            <MuiLayoutBox
                                id="leave-type-form"
                                onSubmit={
                                    editingId
                                        ? updateLeaveType
                                        : addLeaveType
                                }
                             component="form">

                                <Box

                                    sx={{
                                        display:
                                            "grid",

                                        gridTemplateColumns:
                                            "1fr 1fr",

                                        gap:
                                            "18px 14px"
                                    }}

                                >

                                    {/* Leave Type Name */}

                                    <TextField

                                        fullWidth

                                        label="Leave Type Name"

                                        value={
                                            leaveTypeName
                                        }

                                        onChange={(e) =>
                                            setLeaveTypeName(
                                                e.target.value
                                            )
                                        }

                                        placeholder="Annual Leave"

                                        size="small"

                                        required

                                    />


                                    {/* Leave Code */}

                                    <TextField

                                        fullWidth

                                        label="Leave Code"

                                        value={
                                            leaveCode
                                        }

                                        onChange={(e) =>
                                            setLeaveCode(
                                                e.target.value
                                            )
                                        }

                                        placeholder="AL"

                                        size="small"

                                        required

                                    />


                                    {/* Status */}

                                    <FormControl
                                        fullWidth
                                        size="small"
                                    >

                                        <InputLabel>
                                            Status
                                        </InputLabel>

                                        <Select

                                            value={status}

                                            label="Status"

                                            onChange={(e) =>
                                                setStatus(
                                                    e.target.value
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


                                    {/* Eligible Gender */}

                                    <FormControl
                                        fullWidth
                                        size="small"
                                    >

                                        <InputLabel>
                                            Eligible Gender
                                        </InputLabel>

                                        <Select

                                            value={eligibleGender}

                                            label="Eligible Gender"

                                            onChange={(e) =>
                                                setEligibleGender(
                                                    e.target.value
                                                )
                                            }

                                        >

                                            <MenuItem value="All">
                                                All
                                            </MenuItem>

                                            <MenuItem value="Male">
                                                Male
                                            </MenuItem>

                                            <MenuItem value="Female">
                                                Female
                                            </MenuItem>

                                        </Select>

                                    </FormControl>


                                    {/* Description */}

                                    <TextField

                                        fullWidth

                                        label="Description"

                                        value={
                                            description
                                        }

                                        onChange={(e) =>
                                            setDescription(
                                                e.target.value
                                            )
                                        }

                                        placeholder="Enter leave description"

                                        multiline

                                        rows={4}

                                        size="small"

                                        sx={{
                                            gridColumn:
                                                "1 / -1"
                                        }}

                                    />

                                </Box>

                            </MuiLayoutBox>

                        </DialogContent>


                        {/* Dialog Footer */}

                        <DialogActions

                            sx={{
                                padding:
                                    "16px 20px",

                                borderTop:
                                    "1px solid #e5e7eb",

                                gap:
                                    "10px"
                            }}

                        >

                            <Button

                                type="button"

                                onClick={closeForm}

                                variant="outlined"

                                sx={{

                                    minWidth:
                                        "100px",

                                    height:
                                        "40px",

                                    borderRadius:
                                        "8px",

                                    textTransform:
                                        "none",

                                    fontSize:
                                        "13px",

                                    fontWeight:
                                        600,

                                    color:
                                        "#475467",

                                    borderColor:
                                        "#cbd5e1",

                                    "&:hover": {

                                        borderColor:
                                            "#94a3b8",

                                        background:
                                            "#f8fafc"

                                    }

                                }}

                            >

                                Cancel

                            </Button>


                            {((editingId && canEdit) ||
                                (!editingId && canCreate)) && (
                                <Button

                                    type="submit"

                                    form="leave-type-form"

                                variant="contained"

                                sx={{

                                    minWidth:
                                        "140px",

                                    height:
                                        "40px",

                                    borderRadius:
                                        "8px",

                                    textTransform:
                                        "none",

                                    fontSize:
                                        "13px",

                                    fontWeight:
                                        600,

                                    background:
                                        "#2563eb",

                                    boxShadow:
                                        "0 4px 10px rgba(37, 99, 235, 0.20)",

                                    "&:hover": {

                                        background:
                                            "#1d4ed8",

                                        boxShadow:
                                            "0 5px 14px rgba(37, 99, 235, 0.25)"

                                    }

                                }}

                            >

                                {editingId
                                    ? "Update Leave Type"
                                    : "Save Leave Type"
                                }

                                </Button>
                            )}

                        </DialogActions>

                    </Dialog>


                    {/* ==========================================
                        LEAVE TYPE TABLE
                    ========================================== */}

                    <Paper className="leave-type-table-card" elevation={0} component="section">
                        <Box className="leave-type-table-heading">
                            <Box>
                                <Typography component="h2" variant="h6">Leave Types</Typography>
                                <Typography variant="body2">Manage eligibility and availability.</Typography>
                            </Box>
                            <Chip size="small" label={`${filteredLeaveTypes.length} ${filteredLeaveTypes.length === 1 ? "type" : "types"}`} />
                        </Box>
                        <Box className="leave-type-table-scroll">
                        <MuiTableMigration className="leave-type-table">

                            <MuiTableHeadMigration>

                                <MuiTableRowMigration>

                                    <MuiTableCellMigration>
                                        Leave Type
                                    </MuiTableCellMigration>

                                    <MuiTableCellMigration>
                                        Code
                                    </MuiTableCellMigration>

                                    <MuiTableCellMigration>
                                        Description
                                    </MuiTableCellMigration>

                                    <MuiTableCellMigration>
                                        Status
                                    </MuiTableCellMigration>

                                    <MuiTableCellMigration>
                                        Eligible Gender
                                    </MuiTableCellMigration>

                                    <MuiTableCellMigration>
                                        Actions
                                    </MuiTableCellMigration>

                                </MuiTableRowMigration>

                            </MuiTableHeadMigration>


                            <MuiTableBodyMigration>

                                {filteredLeaveTypes.length === 0 ? (

                                    <MuiTableRowMigration>

                                        <MuiTableCellMigration
                                            colSpan="6"
                                            className="no-leave-types"
                                        >
                                            {search || statusFilter !== "All" ? "No leave types match your filters." : "No leave types found."}
                                        </MuiTableCellMigration>

                                    </MuiTableRowMigration>

                                ) : (

                                    filteredLeaveTypes.map(
                                        (leaveType) => (

                                            <MuiTableRowMigration
                                                key={
                                                    leaveType.leaveTypeId
                                                }
                                            >

                                                <MuiTableCellMigration>

                                                    <MuiText component="strong" variant="inherit">
                                                        {
                                                            leaveType.leaveTypeName
                                                        }
                                                    </MuiText>

                                                </MuiTableCellMigration>


                                                <MuiTableCellMigration>

                                                    {
                                                        leaveType.leaveCode
                                                    }

                                                </MuiTableCellMigration>


                                                <MuiTableCellMigration>

                                                    {
                                                        leaveType.description ||
                                                        "-"
                                                    }

                                                </MuiTableCellMigration>


                                                <MuiTableCellMigration>

                                                    <Chip
                                                        className="leave-status-chip"
                                                        label={leaveType.status || "Inactive"}
                                                        color={leaveType.status === "Active" ? "success" : "error"}
                                                        size="small"
                                                    />

                                                </MuiTableCellMigration>


                                                <MuiTableCellMigration>
                                                    {
                                                        leaveType.eligibleGender ||
                                                        "All"
                                                    }
                                                </MuiTableCellMigration>


                                                <MuiTableCellMigration>

                                                    <Stack className="leave-action-buttons" direction="row" spacing={0.75}>

                                                        {canEdit && (
                                                            <Tooltip title="Edit leave type">
                                                            <Button

                                                                type="button"

                                                                className="edit-leave-btn"
                                                                variant="contained"
                                                                aria-label={`Edit ${leaveType.leaveTypeName}`}

                                                                onClick={() =>
                                                                    editLeaveType(
                                                                        leaveType
                                                                    )
                                                                }

                                                            ><EditOutlined /></Button>
                                                            </Tooltip>
                                                        )}


                                                        {canDelete && (
                                                            <Tooltip title="Delete leave type">
                                                            <Button

                                                                type="button"

                                                                className="delete-leave-btn"
                                                                variant="contained"
                                                                aria-label={`Delete ${leaveType.leaveTypeName}`}

                                                                onClick={() => setDeleteTarget(leaveType)}

                                                            ><DeleteOutlineRounded /></Button>
                                                            </Tooltip>
                                                        )}

                                                    </Stack>

                                                </MuiTableCellMigration>

                                            </MuiTableRowMigration>

                                        )
                                    )

                                )}

                            </MuiTableBodyMigration>

                        </MuiTableMigration>

                        </Box>
                    </Paper>

                    <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
                        <DialogTitle>Delete leave type?</DialogTitle>
                        <DialogContent>
                            <Typography variant="body2" color="text.secondary">
                                Are you sure you want to delete “{deleteTarget?.leaveTypeName}”? This action cannot be undone.
                            </Typography>
                        </DialogContent>
                        <DialogActions>
                            <Button variant="outlined" onClick={() => setDeleteTarget(null)}>Cancel</Button>
                            <Button variant="contained" color="error" onClick={deleteLeaveType}>Delete</Button>
                        </DialogActions>
                    </Dialog>

                    <Snackbar open={notice.open} autoHideDuration={4500} onClose={() => setNotice((current) => ({ ...current, open: false }))}>
                        <Alert severity={notice.severity} variant="filled" onClose={() => setNotice((current) => ({ ...current, open: false }))}>
                            {notice.message}
                        </Alert>
                    </Snackbar>

                </MuiLayoutBox>

            </MuiLayoutBox>

        </MuiLayoutBox>

    );
}
