import { useState } from "react";

import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    MenuItem,
    Stack,
    TextField
} from "@mui/material";

import { useLoad } from "../../../live/data";
import { Feedback } from "../../../live/shared";

async function getRoleStatuses(signal)
{
    const response = await fetch("/api/role/statuses", {
        signal
    });

    if (!response.ok)
    {
        throw new Error("Role statuses could not be loaded.");
    }

    const options = await response.json().catch(() => null);

    if (!Array.isArray(options?.statuses) || !options.statuses.includes(options.defaultStatus))
    {
        throw new Error("The Role Service returned unexpected status options.");
    }

    return options;
}

async function saveRole(roleName, status, role)
{
    const request = {
        role: roleName,
        status
    };

    if (role)
    {
        request.roleId = role.roleId;
        request.rowVersion = role.rowVersion;
    }

    const response = await fetch(role ? `/api/role/${role.roleId}` : "/api/role", {
        method: role ? "PUT" : "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(request)
    });

    if (!response.ok)
    {
        const data = await response.json().catch(() => null);

        throw new Error(
            data?.message || data?.title || "The role could not be saved."
        );
    }
}

export default function RoleForm({
    role,
    onClose,
    onSaved
})
{
    const {
        data: statusOptions,
        loading: loadingStatuses,
        error: statusError,
        refresh: refreshStatuses
    } = useLoad(getRoleStatuses, []);

    const [roleName, setRoleName] = useState(role?.role ?? "");
    const [status, setStatus] = useState(role?.status ?? "");
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState("");

    const selectedStatus = status || statusOptions?.defaultStatus || "";
    const canSave = !saving && Boolean(statusOptions?.statuses.includes(selectedStatus));

    function closeDialog()
    {
        if (saving)
        {
            return;
        }

        onClose();
    }

    function handleRoleNameChange(event)
    {
        setRoleName(event.target.value);
    }

    function handleStatusChange(event)
    {
        setStatus(event.target.value);
    }

    async function handleSaveRole(event)
    {
        event.preventDefault();

        if (!canSave)
        {
            return;
        }

        const name = roleName.trim();

        if (!name || name.length > 100)
        {
            setSaveError("Enter a role name between 1 and 100 characters.");
            return;
        }

        setSaveError("");
        setSaving(true);

        try
        {
            await saveRole(name, selectedStatus, role);

            onSaved();
        }
        catch (error)
        {
            setSaveError(error.message);
        }
        finally
        {
            setSaving(false);
        }
    }

    return (
        <Dialog
            open
            onClose={closeDialog}
            fullWidth
            maxWidth="xs"
            aria-labelledby="role-form-title"
        >
            <DialogTitle id="role-form-title">
                {role ? "Edit Role" : "Create Role"}
            </DialogTitle>

            <Box
                component="form"
                onSubmit={handleSaveRole}
            >
                <DialogContent dividers>
                    <Stack spacing={2}>
                        <Feedback
                            loading={loadingStatuses}
                            error={statusError}
                            retry={refreshStatuses}
                        />

                        {saveError && (
                            <Alert severity="error">
                                {saveError}
                            </Alert>
                        )}

                        <TextField
                            label="Role name"
                            value={roleName}
                            onChange={handleRoleNameChange}
                            required
                            autoFocus
                            fullWidth
                            disabled={saving}
                            slotProps={{
                                htmlInput: {
                                    maxLength: 100
                                }
                            }}
                        />

                        <TextField
                            label="Status"
                            value={statusOptions ? selectedStatus : ""}
                            onChange={handleStatusChange}
                            select
                            required
                            fullWidth
                            disabled={saving || !statusOptions}
                        >
                            {statusOptions?.statuses.map(option => (
                                <MenuItem
                                    key={option}
                                    value={option}
                                >
                                    {option}
                                </MenuItem>
                            ))}
                        </TextField>
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
                        type="submit"
                        variant="contained"
                        disabled={!canSave}
                    >
                        {saving ? "Saving…" : role ? "Save Changes" : "Create Role"}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
}
