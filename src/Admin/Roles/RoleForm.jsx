import { useState, useEffect } from "react";
import axios from "axios";
import dayjs from "dayjs";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import TextField from "@mui/material/TextField";

import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
const API_URL = "https://localhost:7294/api/Role";

function RoleForm({
    fetchRoles,
    editRole,
    setEditRole,
    setShowForm
}) {

    const [role, setRole] = useState({

        role: "",

        createdDate: dayjs(),

        status: "Active"

    });

    useEffect(() => {

        if (editRole) {

            setRole({

                roleId: editRole.roleId,

                role: editRole.role,

                createdDate: dayjs(editRole.createdDate),

                status: editRole.status

            });

        }

        else {

            setRole({

                role: "",

                createdDate: dayjs(),

                status: "Active"

            });

        }

    }, [editRole]);

    const handleChange = (e) => {

        setRole({

            ...role,

            [e.target.name]: e.target.value

        });

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        const payload = {

            roleId: role.roleId,

            role: role.role,

            createdDate: role.createdDate.format("YYYY-MM-DD"),

            status: role.status

        };

        try {

            if (editRole) {

                await axios.put(
                    `${API_URL}/${role.roleId}`,
                    payload
                );

            }

            else {

                await axios.post(
                    API_URL,
                    payload
                );

            }

            await fetchRoles();

            setShowForm(false);

            setEditRole(null);

        }

        catch (error) {

            console.error(
                error.response?.data ||
                error.message
            );

        }

    };

    return (

        <div className="modal-overlay">

            <div className="role-modal">

                <div className="role-modal-header">

                    <h2>

                        {editRole
                            ? "Edit Role"
                            : "Add New Role"}

                    </h2>

                </div>

                <form onSubmit={handleSubmit}>

                    <div className="role-form-grid">

                        {/* Role */}

                        <div className="form-group full-width">

                            <label>

                                Role <span>*</span>

                            </label>

                            <input

                                type="text"

                                name="role"

                                placeholder="Enter Role"

                                value={role.role}

                                onChange={handleChange}

                                required

                            />

                        </div>

                        {/* Created Date */}

                        <div className="form-group">

                            <label>Created Date</label>

                            <LocalizationProvider
                                dateAdapter={AdapterDayjs}
                            >

<DatePicker
    value={role.createdDate}
    format="DD/MM/YYYY"
    onChange={(newValue) => {
        if (newValue) {
            setRole({
                ...role,
                createdDate: newValue,
            });
        }
    }}
    slotProps={{
        textField: {
            fullWidth: true,
            size: "medium",
        },
        popper: {
            sx: {
                zIndex: 99999,
            },
        },
    }}
/>

                            </LocalizationProvider>

                        </div>

                        {/* Status */}

<div className="form-group">

    <label>Status</label>

    <FormControl fullWidth>
<Select
    name="status"
    value={role.status}
    onChange={(e) =>
        setRole({
            ...role,
            status: e.target.value,
        })
    }
    MenuProps={{
        disablePortal: true,
        PaperProps: {
            sx: {
                zIndex: 99999,
            },
        },
    }}
>
    <MenuItem value="Active">Active</MenuItem>
    <MenuItem value="Inactive">Inactive</MenuItem>
</Select>
</FormControl>

</div>
                    </div>

                    <div className="modal-footer">

                        <button

                            type="button"

                            className="cancel-btn"

                            onClick={() => {

                                setShowForm(false);

                                setEditRole(null);

                            }}

                        >

                            Cancel

                        </button>

                        <button

                            type="submit"

                            className="save-btn"

                        >

                            {editRole
                                ? "Update Role"
                                : "Save Role"}

                        </button>

                    </div>

                </form>

            </div>

        </div>

    );

}

export default RoleForm;