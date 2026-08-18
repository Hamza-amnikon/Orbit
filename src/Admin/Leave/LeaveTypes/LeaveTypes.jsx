import { useEffect, useState } from "react";
import axios from "axios";
import "./LeaveTypes.css";

const LEAVE_TYPE_API = "https://localhost:7206/api/LeaveType";

export default function LeaveTypes() {

    const [leaveTypes, setLeaveTypes] = useState([]);

    const [showForm, setShowForm] = useState(false);

    const [leaveTypeName, setLeaveTypeName] = useState("");
    const [leaveCode, setLeaveCode] = useState("");
    const [defaultDays, setDefaultDays] = useState("");
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

        if (!defaultDays || Number(defaultDays) < 0) {
            alert("Please enter valid Default Days.");
            return;
        }

        const leaveType = {

            leaveTypeName: leaveTypeName.trim(),

            leaveCode: leaveCode.trim().toUpperCase(),

            defaultDays: Number(defaultDays),

            description: description.trim(),

            status: status
        };


        try {

            await axios.post(LEAVE_TYPE_API, leaveType);

            alert("Leave Type Added Successfully");

            // Reset form
            setLeaveTypeName("");
            setLeaveCode("");
            setDefaultDays("");
            setDescription("");
            setStatus("Active");

            setShowForm(false);

            // Reload table
            await loadLeaveTypes();

        }
        catch (error) {

            console.error("Add Leave Type Error:", error);

            if (error.response) {
                alert("Unable to add Leave Type.");
            }
            else {
                alert("Unable to connect to Leave API.");
            }

        }
    }

    function editLeaveType(leaveType) {
        setEditingId(leaveType.leaveTypeId);

        setLeaveTypeName(leaveType.leaveTypeName);
        setLeaveCode(leaveType.leaveCode);
        setDefaultDays(leaveType.defaultDays);
        setDescription(leaveType.description || "");
        setStatus(leaveType.status);

        setShowForm(true);

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }

    async function updateLeaveType(e) {
        e.preventDefault();

        const leaveType = {
            leaveTypeId: editingId,
            leaveTypeName: leaveTypeName.trim(),
            leaveCode: leaveCode.trim().toUpperCase(),
            defaultDays: Number(defaultDays),
            description: description.trim(),
            status
        };

        try {
            await axios.put(
                `${LEAVE_TYPE_API}/${editingId}`,
                leaveType
            );

            alert("Leave Type Updated Successfully");

            setEditingId(null);
            setLeaveTypeName("");
            setLeaveCode("");
            setDefaultDays("");
            setDescription("");
            setStatus("Active");
            setShowForm(false);

            await loadLeaveTypes();
        }
        catch (error) {
            console.error("Update Leave Type Error:", error);
            alert("Unable to update Leave Type.");
        }
    }

    // ==========================================
    // Delete Leave Type
    // ==========================================

    async function deleteLeaveType(leaveType) {

        const confirmDelete = window.confirm(
            `Are you sure you want to delete "${leaveType.leaveTypeName}"?`
        );

        if (!confirmDelete) {
            return;
        }

        try {

            await axios.delete(
                `${LEAVE_TYPE_API}/${leaveType.leaveTypeId}`
            );

            alert("Leave Type Deleted Successfully");

            await loadLeaveTypes();

        }
        catch (error) {

            console.error("Delete Leave Type Error:", error);

            alert("Unable to delete Leave Type.");
        }
    }

    function closeForm() {
        setShowForm(false);
        setEditingId(null);

        setLeaveTypeName("");
        setLeaveCode("");
        setDefaultDays("");
        setDescription("");
        setStatus("Active");
    }

    return (

        <div className="leave-types-page">

            {/* Header */}

            <div className="leave-types-header">

                <div>
                    <h1>Leave Types</h1>

                    <p>
                        Manage the types of leave available to employees.
                    </p>
                </div>

<div className="leave-type-header-actions">

    <button
        type="button"
        className="leave-type-action-btn"
        onClick={() => window.history.back()}
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


            {/* Add Form */}

            {showForm && (

                <div className="leave-type-form-card">

                    <div className="form-title">

                        <h2>
                            {editingId ? "Edit Leave Type" : "Add Leave Type"}
                        </h2>

                        <button
                            type="button"
                            className="close-btn"
                            onClick={closeForm}                        >
                            ×
                        </button>

                    </div>


                    <form onSubmit={editingId ? updateLeaveType : addLeaveType}>

                        <div className="leave-form-grid">

                            <div className="form-group">

                                <label>Leave Type Name</label>

                                <input
                                    type="text"
                                    value={leaveTypeName}
                                    onChange={(e) => setLeaveTypeName(e.target.value)}
                                    placeholder="Annual Leave"
                                />

                            </div>


                            <div className="form-group">

                                <label>Leave Code</label>

                                <input
                                    type="text"
                                    value={leaveCode}
                                    onChange={(e) => setLeaveCode(e.target.value)}
                                    placeholder="AL"
                                />

                            </div>


                            <div className="form-group">

                                <label>Default Days</label>

                                <input
                                    type="number"
                                    min="0"
                                    value={defaultDays}
                                    onChange={(e) => setDefaultDays(e.target.value)}
                                    placeholder="18"
                                />

                            </div>


                            <div className="form-group">

                                <label>Status</label>

                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>

                            </div>


                            <div className="form-group description-field">

                                <label>Description</label>

                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Enter leave description"
                                />

                            </div>

                        </div>


                        <div className="form-actions">

                            <button
                                type="button"
                                className="cancel-btn"
                                onClick={closeForm}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="save-btn"
                            >
                                {editingId ? "Update Leave Type" : "Save Leave Type"}
                            </button>

                        </div>

                    </form>

                </div>

            )}


            {/* Leave Type Table */}

            <div className="leave-type-table-card">

                <table className="leave-type-table">

                    <thead>

                        <tr>
                            <th>Leave Type</th>
                            <th>Code</th>
                            <th>Default Days</th>
                            <th>Description</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>

                    </thead>


                    <tbody>

                        {leaveTypes.length === 0 ? (

                            <tr>
                                <td colSpan="6" className="no-leave-types">
                                    No leave types found.
                                </td>
                            </tr>

                        ) : (

                            leaveTypes.map((leaveType) => (

                                <tr key={leaveType.leaveTypeId}>

                                    <td>
                                        <strong>
                                            {leaveType.leaveTypeName}
                                        </strong>
                                    </td>

                                    <td>
                                        {leaveType.leaveCode}
                                    </td>

                                    <td>
                                        {leaveType.defaultDays}
                                    </td>

                                    <td>
                                        {leaveType.description || "-"}
                                    </td>

                                    <td>

                                        <span
                                            className={
                                                leaveType.status === "Active"
                                                    ? "leave-status active"
                                                    : "leave-status inactive"
                                            }
                                        >
                                            {leaveType.status}
                                        </span>

                                    </td>

                                    <td>

                                        <div className="leave-action-buttons">

                                            <button
                                                type="button"
                                                className="edit-leave-btn"
                                                onClick={() => editLeaveType(leaveType)}
                                            >
                                                Edit
                                            </button>

                                            <button
                                                type="button"
                                                className="delete-leave-btn"
                                                onClick={() => deleteLeaveType(leaveType)}
                                            >
                                                Delete
                                            </button>

                                        </div>

                                    </td>

                                </tr>

                            ))

                        )}

                    </tbody>

                </table>

            </div>

        </div>
    );
}