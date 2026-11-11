import { useState } from "react";

import {
    Button,
    Card,
    CardContent,
    Chip,
    InputAdornment,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography
} from "@mui/material";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";

import { useLoad } from "../../../live/data";
import {
    Feedback,
    Page
} from "../../../live/shared";

import RoleForm from "./RoleForm";

async function getRoles(signal)
{
    const response = await fetch("/api/role", {
        signal
    });

    if (!response.ok)
    {
        throw new Error(
            "Roles could not be loaded. Check that the Role Service is running."
        );
    }

    const roles = await response.json().catch(() => null);

    if (!Array.isArray(roles))
    {
        throw new Error("The Role Service returned an unexpected response.");
    }

    return roles;
}

export default function RolesPermissions()
{
    const {
        data,
        loading,
        error,
        refresh
    } = useLoad(getRoles, []);

    const [roleForm, setRoleForm] = useState(null);
    const [search, setSearch] = useState("");

    const roles = data ?? [];
    const searchText = search.trim().toLowerCase();
    const visibleRoles = roles.filter(role =>
        role.role.toLowerCase().includes(searchText)
    );

    function handleSearchChange(event)
    {
        setSearch(event.target.value);
    }

    function openCreateDialog()
    {
        setRoleForm({ role: null });
    }

    function openEditDialog(role)
    {
        setRoleForm({ role });
    }

    function closeRoleForm()
    {
        setRoleForm(null);
    }

    function handleRoleSaved()
    {
        if (!roleForm.role)
        {
            setSearch("");
        }

        closeRoleForm();
        refresh();
    }

    return (
        <Page
            title="Roles"
            subtitle="Create and edit Finance roles."
            action={
                <Stack
                    direction="row"
                    spacing={1}
                >
                    <Button
                        variant="outlined"
                        onClick={refresh}
                        disabled={loading}
                        startIcon={<RefreshRoundedIcon />}
                    >
                        Refresh
                    </Button>

                    <Button
                        variant="contained"
                        onClick={openCreateDialog}
                        startIcon={<AddRoundedIcon />}
                    >
                        Create Role
                    </Button>
                </Stack>
            }
        >
            <Feedback
                loading={loading}
                error={error}
                retry={refresh}
            />

            {!loading && !error && (
                <Card className="finance-records">
                    <CardContent>
                        <Stack
                            direction={{ xs: "column", sm: "row" }}
                            alignItems={{ xs: "stretch", sm: "center" }}
                            justifyContent="space-between"
                            spacing={2}
                            sx={{ mb: 2 }}
                        >
                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                {searchText
                                    ? `${visibleRoles.length} of ${roles.length} roles`
                                    : `${roles.length} ${roles.length === 1 ? "role" : "roles"}`}
                            </Typography>

                            <TextField
                                label="Search roles"
                                value={search}
                                onChange={handleSearchChange}
                                size="small"
                                sx={{ width: { sm: 260 } }}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchRoundedIcon fontSize="small" />
                                            </InputAdornment>
                                        )
                                    }
                                }}
                            />
                        </Stack>

                        {visibleRoles.length === 0 ? (
                            <Stack
                                alignItems="center"
                                spacing={1}
                                sx={{
                                    py: 5,
                                    px: 2,
                                    border: 1,
                                    borderColor: "divider",
                                    borderRadius: 2,
                                    textAlign: "center"
                                }}
                            >
                                <BadgeOutlinedIcon color="action" />

                                <Typography fontWeight={600}>
                                    {roles.length === 0
                                        ? "No roles have been created yet."
                                        : "No roles match your search."}
                                </Typography>
                            </Stack>
                        ) : (
                            <TableContainer>
                                <Table aria-label="Finance roles">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Role name</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell align="right">Actions</TableCell>
                                        </TableRow>
                                    </TableHead>

                                    <TableBody>
                                        {visibleRoles.map(role => (
                                            <TableRow
                                                key={role.roleId}
                                                hover
                                            >
                                                <TableCell component="th" scope="row">
                                                    <Stack
                                                        direction="row"
                                                        alignItems="center"
                                                        spacing={1.5}
                                                    >
                                                        <BadgeOutlinedIcon
                                                            color="primary"
                                                            fontSize="small"
                                                        />

                                                        <Typography fontWeight={600}>
                                                            {role.role}
                                                        </Typography>
                                                    </Stack>
                                                </TableCell>

                                                <TableCell>
                                                    <Chip
                                                        label={role.status}
                                                        color={role.status === "Active" ? "success" : "default"}
                                                        variant="outlined"
                                                        size="small"
                                                    />
                                                </TableCell>

                                                <TableCell align="right">
                                                    <Button
                                                        size="small"
                                                        onClick={() => openEditDialog(role)}
                                                        aria-label={`Edit ${role.role}`}
                                                    >
                                                        Edit
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </CardContent>
                </Card>
            )}

            {roleForm && (
                <RoleForm
                    role={roleForm.role}
                    onClose={closeRoleForm}
                    onSaved={handleRoleSaved}
                />
            )}
        </Page>
    );
}
