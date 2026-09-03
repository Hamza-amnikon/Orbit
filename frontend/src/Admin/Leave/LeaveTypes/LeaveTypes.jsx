import { useEffect, useState } from "react";
import axios from "axios";
import "./LeaveTypes.css";

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
    Box
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";

const LEAVE_TYPE_API = "https://localhost:7206/api/LeaveType";

export default function LeaveTypes() {

    const [leaveTypes, setLeaveTypes] = useState([]);

    const [showForm, setShowForm] = useState(false);

    const [leaveTypeName, setLeaveTypeName] = useState("");
    const [leaveCode, setLeaveCode] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("Active");

    const [editingId, setEditingId] = useState(null);


    // ==========================================
    // Load Leave Types
    // ==========================================

    useEffect(() => {
        loadLeaveTypes();
    }, []);


    async function loadLeaveTypes() {

        try {

            const response = await axios.get(LEAVE_TYPE_API);

            setLeaveTypes(response.data);

        }
        catch (error) {

            console.error("Leave Type Error:", error);

        }
    }


    // ==========================================
    // Add Leave Type
    // ==========================================

    async function addLeaveType(e) {

        e.preventDefault();

        if (!leaveTypeName.trim()) {

            alert("Please enter Leave Type Name.");

            return;
        }

        if (!leaveCode.trim()) {

            alert("Please enter Leave Code.");

            return;
        }

        const leaveType = {

            leaveTypeName: leaveTypeName.trim(),

            leaveCode: leaveCode.trim().toUpperCase(),

            description: description.trim(),

            status: status

        };


        try {

            await axios.post(
                LEAVE_TYPE_API,
                leaveType
            );

            alert("Leave Type Added Successfully");


            // Reset form

            setLeaveTypeName("");
            setLeaveCode("");
            setDescription("");
            setStatus("Active");

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

                alert("Unable to add Leave Type.");

            }
            else {

                alert("Unable to connect to Leave API.");

            }

        }
    }


    // ==========================================
    // Edit Leave Type
    // ==========================================

    function editLeaveType(leaveType) {

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

        e.preventDefault();

        const leaveType = {

            leaveTypeId: editingId,

            leaveTypeName:
                leaveTypeName.trim(),

            leaveCode:
                leaveCode.trim().toUpperCase(),

            description:
                description.trim(),

            status

        };


        try {

            await axios.put(

                `${LEAVE_TYPE_API}/${editingId}`,

                leaveType

            );

            alert(
                "Leave Type Updated Successfully"
            );


            setEditingId(null);

            setLeaveTypeName("");

            setLeaveCode("");

            setDescription("");

            setStatus("Active");

            setShowForm(false);


            await loadLeaveTypes();

        }
        catch (error) {

            console.error(
                "Update Leave Type Error:",
                error
            );

            alert(
                "Unable to update Leave Type."
            );

        }
    }


    // ==========================================
    // Delete Leave Type
    // ==========================================

    async function deleteLeaveType(leaveType) {

        const confirmDelete =
            window.confirm(

                `Are you sure you want to delete "${leaveType.leaveTypeName}"?`

            );


        if (!confirmDelete) {

            return;

        }


        try {

            await axios.delete(

                `${LEAVE_TYPE_API}/${leaveType.leaveTypeId}`

            );

            alert(
                "Leave Type Deleted Successfully"
            );

            await loadLeaveTypes();

        }
        catch (error) {

            console.error(
                "Delete Leave Type Error:",
                error
            );

            alert(
                "Unable to delete Leave Type."
            );

        }
    }


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

    }


    return (

        <div className="leave-types-page">

            <div className="leave-types-outer-card">

                <div className="leave-types-main-card">


                    {/* ==========================================
                        HEADER CARD
                    ========================================== */}

                    <div className="leave-types-header-card">

                        <div className="leave-types-header">

                            <div>

                                <h1>
                                    Leave Types
                                </h1>

                                <p>
                                    Manage the types of leave available to employees.
                                </p>

                            </div>


                            <div className="leave-type-header-actions">

                                <button
                                    type="button"
                                    className="leave-type-action-btn"
                                    onClick={() =>
                                        window.history.back()
                                    }
                                >
                                    ← Previous
                                </button>


                                <button
                                    type="button"
                                    className="leave-type-action-btn"
                                    onClick={loadLeaveTypes}
                                >
                                    ↻ Refresh
                                </button>


                                <button
                                    type="button"
                                    className="add-leave-type-btn"
                                    onClick={() => {

                                        closeForm();

                                        setShowForm(true);

                                    }}
                                >
                                    + Add Leave Type
                                </button>

                            </div>

                        </div>

                    </div>


                    {/* ==========================================
                        MUI ADD / EDIT DIALOG
                    ========================================== */}

                    <Dialog

                        open={showForm}

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

                            <form
                                id="leave-type-form"
                                onSubmit={
                                    editingId
                                        ? updateLeaveType
                                        : addLeaveType
                                }
                            >

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

                            </form>

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

                        </DialogActions>

                    </Dialog>


                    {/* ==========================================
                        LEAVE TYPE TABLE
                    ========================================== */}

                    <div className="leave-type-table-card">

                        <table className="leave-type-table">

                            <thead>

                                <tr>

                                    <th>
                                        Leave Type
                                    </th>

                                    <th>
                                        Code
                                    </th>

                                    <th>
                                        Description
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Actions
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {leaveTypes.length === 0 ? (

                                    <tr>

                                        <td
                                            colSpan="6"
                                            className="no-leave-types"
                                        >
                                            No leave types found.
                                        </td>

                                    </tr>

                                ) : (

                                    leaveTypes.map(
                                        (leaveType) => (

                                            <tr
                                                key={
                                                    leaveType.leaveTypeId
                                                }
                                            >

                                                <td>

                                                    <strong>
                                                        {
                                                            leaveType.leaveTypeName
                                                        }
                                                    </strong>

                                                </td>


                                                <td>

                                                    {
                                                        leaveType.leaveCode
                                                    }

                                                </td>


                                                <td>

                                                    {
                                                        leaveType.description ||
                                                        "-"
                                                    }

                                                </td>


                                                <td>

                                                    <span

                                                        className={

                                                            leaveType.status ===
                                                            "Active"

                                                                ? "leave-status active"

                                                                : "leave-status inactive"

                                                        }

                                                    >

                                                        {
                                                            leaveType.status
                                                        }

                                                    </span>

                                                </td>


                                                <td>

                                                    <div className="leave-action-buttons">

                                                        <button

                                                            type="button"

                                                            className="edit-leave-btn"

                                                            onClick={() =>
                                                                editLeaveType(
                                                                    leaveType
                                                                )
                                                            }

                                                        >
                                                            Edit
                                                        </button>


                                                        <button

                                                            type="button"

                                                            className="delete-leave-btn"

                                                            onClick={() =>
                                                                deleteLeaveType(
                                                                    leaveType
                                                                )
                                                            }

                                                        >
                                                            Delete
                                                        </button>

                                                    </div>

                                                </td>

                                            </tr>

                                        )
                                    )

                                )}

                            </tbody>

                        </table>

                    </div>

                </div>

            </div>

        </div>

    );
}