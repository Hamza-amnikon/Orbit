import { MuiButtonMigration, MuiInputMigration } from "../../components/ui/MuiCompat.jsx";
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
import { Box as MuiLayoutBox, Typography as MuiText } from "@mui/material";
const API_URL = `${import.meta.env.VITE_ROLE_API_BASE_URL}/api/Role`;

function RoleForm({
    fetchRoles,
    editRole,
    setEditRole,
    setShowForm,
    showNotice,
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
            showNotice?.(editRole ? "Role updated successfully." : "Role added successfully.");

        }

        catch (error) {

            console.error(
                error.response?.data ||
                error.message
            );
            showNotice?.(error.response?.data?.title || "Unable to save role.", "error");

        }

    };

    return (

        <MuiLayoutBox className="modal-overlay" component="div">

            <MuiLayoutBox className="role-modal" component="div">

                <MuiLayoutBox className="role-modal-header" component="div">

                    <MuiText component="h2" variant="h5">

                        {editRole
                            ? "Edit Role"
                            : "Add New Role"}

                    </MuiText>

                </MuiLayoutBox>

                <MuiLayoutBox onSubmit={handleSubmit} component="form">

                    <MuiLayoutBox className="role-form-grid" component="div">

                        {/* Role */}

                        <MuiLayoutBox className="form-group full-width" component="div">

                            <MuiLayoutBox component="label">

                                Role <MuiText component="span" variant="inherit">*</MuiText>

                            </MuiLayoutBox>

                            <MuiInputMigration

                                type="text"

                                name="role"

                                placeholder="Enter Role"

                                value={role.role}

                                onChange={handleChange}

                                required

                            />

                        </MuiLayoutBox>

                        {/* Created Date */}

                        <MuiLayoutBox className="form-group" component="div">

                            <MuiLayoutBox component="label">Created Date</MuiLayoutBox>

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

                        </MuiLayoutBox>

                        {/* Status */}

<MuiLayoutBox className="form-group" component="div">

    <MuiLayoutBox component="label">Status</MuiLayoutBox>

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

</MuiLayoutBox>
                    </MuiLayoutBox>

                    <MuiLayoutBox className="modal-footer" component="div">

                        <MuiButtonMigration

                            type="button"

                            className="cancel-btn"

                            onClick={() => {

                                setShowForm(false);

                                setEditRole(null);

                            }}

                        >

                            Cancel

                        </MuiButtonMigration>

                        <MuiButtonMigration

                            type="submit"

                            className="save-btn"

                        >

                            {editRole
                                ? "Update Role"
                                : "Save Role"}

                        </MuiButtonMigration>

                    </MuiLayoutBox>

                </MuiLayoutBox>

            </MuiLayoutBox>

        </MuiLayoutBox>

    );

}

export default RoleForm;
