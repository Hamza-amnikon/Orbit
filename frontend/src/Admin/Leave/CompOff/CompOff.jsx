import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Select,
    MenuItem,
    TextField,
    IconButton,
    Typography,
    Divider,
} from "@mui/material";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";

import "./CompOff.css";

const EMPLOYEE_API = "https://localhost:7002/api/Employee";
const COMPOFF_API = "https://localhost:7206/api/CompOff";

function CompOff({ open, onClose }) {
    const [employees, setEmployees] = useState([]);
    const [employeeId, setEmployeeId] = useState("");
    const [workedDate, setWorkedDate] = useState("");
    const [days, setDays] = useState("");
    const [reason, setReason] = useState("");

    useEffect(() => {
        if (!open) return;

        const loadEmployees = async () => {
            try {
                const response = await fetch(EMPLOYEE_API);

                if (!response.ok) {
                    throw new Error("Failed to load employees");
                }

                const data = await response.json();

                setEmployees(data);
            } catch (error) {
                console.error("Employee API Error:", error);
            }
        };

        loadEmployees();
    }, [open]);

    const selectedEmployee = employees.find(
        (employee) =>
            String(employee.azureEmployeeId) === String(employeeId)
    );

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!selectedEmployee || !workedDate || !days || !reason) {
            return;
        }

        try {
            const response = await fetch(COMPOFF_API, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    employeeId: selectedEmployee.employeeId,
                    azureEmployeeId: selectedEmployee.azureEmployeeId,
                    employeeName: selectedEmployee.employeeName,
                    workedDate: workedDate,
                    days: Number(days),
                    reason: reason,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to add Comp-Off"
                );
            }

            console.log("Comp-Off added successfully:", data);

            onClose();
        } catch (error) {
            console.error("Comp-Off API Error:", error);
        }
    };

    return (
        <Dialog
            className="compoff-dialog"
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            slotProps={{
                backdrop: {
                    className: "compoff-backdrop",
                },
            }}
        >
            {/* HEADER */}

            <DialogTitle className="compoff-header">
                <div>
                    <Typography className="compoff-title">
                        Add Comp-Off
                    </Typography>

                    <Typography className="compoff-subtitle">
                        Assign compensatory leave to an employee.
                    </Typography>
                </div>

                <IconButton
                    className="compoff-close"
                    onClick={onClose}
                    size="small"
                >
                    <CloseRoundedIcon />
                </IconButton>
            </DialogTitle>

            <Divider />

            {/* FORM */}

            <form onSubmit={handleSubmit}>
                <DialogContent className="compoff-content">

                    {/* SECTION TITLE */}

                    <Typography className="compoff-section-title">
                        Comp-Off Details
                    </Typography>

                    {/* FORM GRID */}

                    <div className="compoff-form-grid">

                        {/* EMPLOYEE ID */}

                        <div className="compoff-field">

                            <Typography className="compoff-label">
                                Employee ID *
                            </Typography>

                            <Select
                                className="compoff-select"
                                value={employeeId}
                                onChange={(event) =>
                                    setEmployeeId(event.target.value)
                                }
                                displayEmpty
                                fullWidth
                                size="small"
                            >
                                <MenuItem value="">
                                    Select Employee ID
                                </MenuItem>

                                {employees.map((employee) => (
                                    <MenuItem
                                        key={employee.employeeId}
                                        value={employee.azureEmployeeId}
                                    >
                                        {employee.azureEmployeeId}
                                    </MenuItem>
                                ))}
                            </Select>

                        </div>

                        {/* EMPLOYEE NAME */}

                        <div className="compoff-field">

                            <Typography className="compoff-label">
                                Employee Name
                            </Typography>

                            <TextField
                                className="compoff-textfield compoff-employee-name"
                                value={
                                    selectedEmployee?.employeeName || ""
                                }
                                placeholder="Employee Name"
                                fullWidth
                                size="small"
                                disabled
                            />

                        </div>

                        {/* WORKED DATE */}

                        <div className="compoff-field">

                            <Typography className="compoff-label">
                                Worked Date *
                            </Typography>

<TextField
    className="compoff-textfield compoff-date"
    type="date"
    value={workedDate}
    onChange={(event) =>
        setWorkedDate(event.target.value)
    }
    fullWidth
    size="small"
    slotProps={{
        htmlInput: {
            max: new Date().toISOString().split("T")[0],
        },
    }}
/>

                        </div>

                        {/* COMPOFF DAYS */}

                        <div className="compoff-field">

                            <Typography className="compoff-label">
                                Comp-Off Days *
                            </Typography>

                            <TextField
                                className="compoff-textfield compoff-days"
                                type="text"
                                value={days}
                                onChange={(event) => {
                                    const value = event.target.value;

                                    if (/^\d*\.?\d*$/.test(value)) {
                                        setDays(value);
                                    }
                                }}
                                placeholder="Enter days"
                                fullWidth
                                size="small"
                                inputProps={{
                                    inputMode: "decimal",
                                }}
                            />

                        </div>

                    </div>

                    {/* REASON */}

                    <div className="compoff-reason">

                        <Typography className="compoff-label">
                            Reason *
                        </Typography>

                        <TextField
                            className="compoff-textfield"
                            value={reason}
                            onChange={(event) =>
                                setReason(event.target.value)
                            }
                            placeholder="Enter reason for comp-off"
                            fullWidth
                            size="small"
                            multiline
                            rows={3}
                        />

                    </div>

                </DialogContent>

                <Divider />

                {/* FOOTER */}

                <DialogActions className="compoff-footer">

                    <Button
                        className="compoff-cancel-button"
                        variant="outlined"
                        onClick={onClose}
                    >
                        Cancel
                    </Button>

                    <Button
                        className="compoff-submit-button"
                        type="submit"
                        variant="contained"
                        startIcon={<AddCircleOutlineRoundedIcon />}
                    >
                        Add Comp-Off
                    </Button>

                </DialogActions>
            </form>
        </Dialog>
    );
}

export default CompOff;