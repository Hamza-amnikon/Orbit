import React, { useMemo, useState } from "react";

import {
    Avatar,
    Box,
    Button,
    Checkbox,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    Switch,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tabs,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";

import {
    Add,
    Close,
    Done,
    People,
    Search,
    Security,
    Visibility,
} from "@mui/icons-material";

import "./Permissions.css";


/* =========================================================
   ROLES
========================================================= */

const ROLES = [
    "Employee",
    "TL",
    "Manager",
    "HR",
    "Admin",
];


/* =========================================================
   PAGES
========================================================= */

const PAGES = [
    {
        module: "Dashboard",
        pages: [
            {
                id: "my-dashboard",
                name: "My Dashboard",
                route: "/employees/my-dashboard",
            },
            {
                id: "admin-dashboard",
                name: "Admin Dashboard",
                route: "/admin/dashboard",
            },
        ],
    },

    {
        module: "Employee Management",
        pages: [
            {
                id: "employees",
                name: "Employees",
                route: "/employees",
            },
            {
                id: "employee-profile",
                name: "Employee Profile",
                route: "/employees/profile",
            },
            {
                id: "my-team",
                name: "My Team",
                route: "/employees/my-team",
            },
        ],
    },

    {
        module: "Attendance",
        pages: [
            {
                id: "attendance",
                name: "Attendance",
                route: "/attendance",
            },
            {
                id: "attendance-report",
                name: "Attendance Reports",
                route: "/attendance/reports",
            },
        ],
    },

    {
        module: "Leave Management",
        pages: [
            {
                id: "leave",
                name: "Leave",
                route: "/leave",
            },
            {
                id: "leave-approval",
                name: "Leave Approval",
                route: "/leave/approval",
            },
        ],
    },

    {
        module: "Payroll",
        pages: [
            {
                id: "payroll",
                name: "Payroll",
                route: "/payroll",
            },
            {
                id: "payroll-report",
                name: "Payroll Reports",
                route: "/payroll/reports",
            },
        ],
    },

    {
        module: "Reports",
        pages: [
            {
                id: "reports",
                name: "Reports",
                route: "/reports",
            },
        ],
    },

    {
        module: "Administration",
        pages: [
            {
                id: "roles",
                name: "Roles",
                route: "/admin/roles",
            },
            {
                id: "permissions",
                name: "Permissions",
                route: "/admin/permissions",
            },
            {
                id: "settings",
                name: "Settings",
                route: "/admin/settings",
            },
        ],
    },
];


/* =========================================================
   PERMISSION TYPES
========================================================= */

const PERMISSION_TYPES = [
    {
        key: "view",
        label: "View",
    },
    {
        key: "create",
        label: "Create",
    },
    {
        key: "edit",
        label: "Edit",
    },
    {
        key: "delete",
        label: "Delete",
    },
    {
        key: "approve",
        label: "Approve",
    },
];


/* =========================================================
   TEMPORARY USERS
========================================================= */

const USERS = [
    {
        id: 1,
        name: "Ahmed Khan",
        email: "ahmed@example.com",
        role: "Employee",
        department: "Operations",
    },
    {
        id: 2,
        name: "John Smith",
        email: "john@example.com",
        role: "TL",
        department: "Operations",
    },
    {
        id: 3,
        name: "Sarah Williams",
        email: "sarah@example.com",
        role: "Manager",
        department: "Management",
    },
    {
        id: 4,
        name: "David Thomas",
        email: "david@example.com",
        role: "HR",
        department: "Human Resources",
    },
    {
        id: 5,
        name: "Administrator",
        email: "admin@example.com",
        role: "Admin",
        department: "Administration",
    },
];


/* =========================================================
   HELPERS
========================================================= */

const createEmptyPermission = () => ({
    view: false,
    create: false,
    edit: false,
    delete: false,
    approve: false,
});


const getAllPages = () => {
    return PAGES.flatMap((module) => module.pages);
};


/* =========================================================
   DEFAULT ROLE PERMISSIONS
========================================================= */

const createDefaultPermissions = () => {
    const permissions = {};

    ROLES.forEach((role) => {
        permissions[role] = {};

        PAGES.forEach((module) => {
            module.pages.forEach((page) => {
                permissions[role][page.id] =
                    createEmptyPermission();
            });
        });
    });


    /* =========================
       EMPLOYEE
    ========================= */

    permissions.Employee["my-dashboard"].view = true;

    permissions.Employee["employee-profile"].view = true;
    permissions.Employee["employee-profile"].edit = true;

    permissions.Employee["attendance"].view = true;

    permissions.Employee["leave"].view = true;
    permissions.Employee["leave"].create = true;

    permissions.Employee["payroll"].view = true;


    /* =========================
       TL
    ========================= */

    permissions.TL["my-dashboard"].view = true;

    permissions.TL["employee-profile"].view = true;
    permissions.TL["employee-profile"].edit = true;

    permissions.TL["my-team"].view = true;

    permissions.TL["attendance"].view = true;
    permissions.TL["attendance"].create = true;
    permissions.TL["attendance"].edit = true;

    permissions.TL["attendance-report"].view = true;

    permissions.TL["leave"].view = true;
    permissions.TL["leave"].create = true;
    permissions.TL["leave"].edit = true;

    permissions.TL["leave-approval"].view = true;
    permissions.TL["leave-approval"].approve = true;

    permissions.TL["payroll"].view = true;

    permissions.TL["reports"].view = true;


    /* =========================
       MANAGER
    ========================= */

    permissions.Manager["my-dashboard"].view = true;

    permissions.Manager["employee-profile"].view = true;
    permissions.Manager["employee-profile"].edit = true;

    permissions.Manager["my-team"].view = true;

    permissions.Manager["employees"].view = true;

    permissions.Manager["attendance"].view = true;
    permissions.Manager["attendance"].create = true;
    permissions.Manager["attendance"].edit = true;

    permissions.Manager["attendance-report"].view = true;

    permissions.Manager["leave"].view = true;
    permissions.Manager["leave"].create = true;
    permissions.Manager["leave"].edit = true;

    permissions.Manager["leave-approval"].view = true;
    permissions.Manager["leave-approval"].approve = true;

    permissions.Manager["payroll"].view = true;
    permissions.Manager["payroll-report"].view = true;

    permissions.Manager["reports"].view = true;
    permissions.Manager["reports"].create = true;


    /* =========================
       HR
    ========================= */

    permissions.HR["my-dashboard"].view = true;

    permissions.HR["employee-profile"].view = true;
    permissions.HR["employee-profile"].create = true;
    permissions.HR["employee-profile"].edit = true;

    permissions.HR["employees"].view = true;
    permissions.HR["employees"].create = true;
    permissions.HR["employees"].edit = true;

    permissions.HR["attendance"].view = true;
    permissions.HR["attendance-report"].view = true;

    permissions.HR["leave"].view = true;
    permissions.HR["leave"].create = true;
    permissions.HR["leave"].edit = true;

    permissions.HR["leave-approval"].view = true;
    permissions.HR["leave-approval"].approve = true;

    permissions.HR["payroll"].view = true;
    permissions.HR["payroll-report"].view = true;

    permissions.HR["reports"].view = true;
    permissions.HR["reports"].create = true;

    permissions.HR["settings"].view = true;


    /* =========================
       ADMIN
    ========================= */

    PAGES.forEach((module) => {
        module.pages.forEach((page) => {
            permissions.Admin[page.id] = {
                view: true,
                create: true,
                edit: true,
                delete: true,
                approve: true,
            };
        });
    });

    return permissions;
};


/* =========================================================
   COMPONENT
========================================================= */

function Permissions() {
    const [activeTab, setActiveTab] = useState(0);

    const [selectedRole, setSelectedRole] =
        useState("Employee");

    const [permissions, setPermissions] =
        useState(createDefaultPermissions());

    const [search, setSearch] = useState("");

    const [userSearch, setUserSearch] = useState("");

    const [userRoleFilter, setUserRoleFilter] =
        useState("All");

    const [pageFilter, setPageFilter] =
        useState("All");

    const [accessFilter, setAccessFilter] =
        useState("All");

    const [selectedUser, setSelectedUser] =
        useState(null);

    const [saved, setSaved] = useState(false);


    /* =====================================================
       FILTER ROLE PAGES
    ===================================================== */

    const filteredModules = useMemo(() => {
        const value = search.trim().toLowerCase();

        if (!value) {
            return PAGES;
        }

        return PAGES
            .map((module) => ({
                ...module,

                pages: module.pages.filter(
                    (page) =>
                        page.name
                            .toLowerCase()
                            .includes(value) ||
                        page.route
                            .toLowerCase()
                            .includes(value)
                ),
            }))
            .filter(
                (module) =>
                    module.pages.length > 0
            );
    }, [search]);


    const rolePermissions =
        permissions[selectedRole];


    /* =====================================================
       UPDATE PERMISSION
    ===================================================== */

    const updatePermission = (
        pageId,
        permissionType,
        value
    ) => {
        setSaved(false);

        setPermissions((current) => ({
            ...current,

            [selectedRole]: {
                ...current[selectedRole],

                [pageId]: {
                    ...current[selectedRole][pageId],

                    [permissionType]: value,
                },
            },
        }));
    };


    /* =====================================================
       PAGE ALL
    ===================================================== */

    const toggleAllForPage = (
        pageId,
        value
    ) => {
        setSaved(false);

        setPermissions((current) => ({
            ...current,

            [selectedRole]: {
                ...current[selectedRole],

                [pageId]: {
                    view: value,
                    create: value,
                    edit: value,
                    delete: value,
                    approve: value,
                },
            },
        }));
    };


    /* =====================================================
       MODULE ALL
    ===================================================== */

    const toggleModule = (
        module,
        value
    ) => {
        setSaved(false);

        setPermissions((current) => {
            const role = {
                ...current[selectedRole],
            };

            module.pages.forEach((page) => {
                role[page.id] = {
                    view: value,
                    create: value,
                    edit: value,
                    delete: value,
                    approve: value,
                };
            });

            return {
                ...current,
                [selectedRole]: role,
            };
        });
    };


    /* =====================================================
       COLUMN ALL
    ===================================================== */

    const toggleColumn = (
        permissionType,
        value
    ) => {
        setSaved(false);

        setPermissions((current) => {
            const role = {
                ...current[selectedRole],
            };

            getAllPages().forEach((page) => {
                role[page.id] = {
                    ...role[page.id],
                    [permissionType]: value,
                };
            });

            return {
                ...current,
                [selectedRole]: role,
            };
        });
    };


    /* =====================================================
       CHECK PAGE
    ===================================================== */

    const isPageFullySelected =
        (pageId) => {
            const permission =
                rolePermissions[pageId];

            if (!permission) {
                return false;
            }

            return PERMISSION_TYPES.every(
                ({ key }) => permission[key]
            );
        };


    /* =====================================================
       CHECK MODULE
    ===================================================== */

    const isModuleFullySelected =
        (module) => {
            return module.pages.every(
                (page) =>
                    isPageFullySelected(page.id)
            );
        };


    /* =====================================================
       CHECK COLUMN
    ===================================================== */

    const isColumnSelected =
        (permissionType) => {
            return getAllPages().every(
                (page) =>
                    rolePermissions[
                        page.id
                    ]?.[permissionType]
            );
        };


    /* =====================================================
       USER ACCESS HELPERS
    ===================================================== */

    const getUserPermissions = (user) => {
        return permissions[user.role] || {};
    };


    const hasAnyAccess = (permission) => {
        return Boolean(
            permission?.view ||
            permission?.create ||
            permission?.edit ||
            permission?.delete ||
            permission?.approve
        );
    };


    const hasSpecificAccess = (
        permission,
        filter
    ) => {
        if (filter === "All") {
            return true;
        }

        if (filter === "Has Access") {
            return hasAnyAccess(permission);
        }

        if (filter === "No Access") {
            return !hasAnyAccess(permission);
        }

        return Boolean(permission?.[filter.toLowerCase()]);
    };


    const getUserAccessCount = (user) => {
        const userPermissions =
            getUserPermissions(user);

        return getAllPages().filter(
            (page) =>
                hasAnyAccess(
                    userPermissions[page.id]
                )
        ).length;
    };


    const getUserAccessPages = (user) => {
        const userPermissions =
            getUserPermissions(user);

        return getAllPages().map((page) => ({
            page,
            permission:
                userPermissions[page.id] ||
                createEmptyPermission(),
        }));
    };


    /* =====================================================
       USER FILTER
    ===================================================== */

    const filteredUsers = useMemo(() => {
        const value =
            userSearch
                .trim()
                .toLowerCase();

        return USERS.filter((user) => {
            const matchesSearch =
                !value ||
                user.name
                    .toLowerCase()
                    .includes(value) ||
                user.email
                    .toLowerCase()
                    .includes(value) ||
                user.department
                    .toLowerCase()
                    .includes(value);

            const matchesRole =
                userRoleFilter === "All" ||
                user.role === userRoleFilter;


            /* PAGE FILTER */

            let matchesPage = true;

            if (pageFilter !== "All") {
                const permission =
                    getUserPermissions(user)[
                        pageFilter
                    ];

                matchesPage =
                    hasSpecificAccess(
                        permission,
                        accessFilter === "All"
                            ? "Has Access"
                            : accessFilter
                    );
            }


            /* ACCESS FILTER */

            let matchesAccess = true;

            if (
                pageFilter === "All" &&
                accessFilter !== "All"
            ) {
                const userPermissions =
                    getUserPermissions(user);

                matchesAccess =
                    getAllPages().some(
                        (page) =>
                            hasSpecificAccess(
                                userPermissions[
                                    page.id
                                ],
                                accessFilter
                            )
                    );
            }


            return (
                matchesSearch &&
                matchesRole &&
                matchesPage &&
                matchesAccess
            );
        });
    }, [
        userSearch,
        userRoleFilter,
        pageFilter,
        accessFilter,
        permissions,
    ]);


    /* =====================================================
       SELECTED USER ACCESS
       IMPORTANT:
       Modal uses ALL permissions and ignores
       table filters.
    ===================================================== */

    const selectedUserAccess =
        selectedUser
            ? getUserAccessPages(selectedUser)
            : [];


    /* =====================================================
       ACCESS TOTALS
    ===================================================== */

    const totalPages =
        getAllPages().length;

    const totalAccessiblePages =
        filteredUsers.reduce(
            (total, user) =>
                total +
                getUserAccessCount(user),
            0
        );


    /* =====================================================
       SAVE
    ===================================================== */

    const handleSave = () => {
        console.log(
            "Permissions:",
            permissions
        );

        setSaved(true);

        setTimeout(() => {
            setSaved(false);
        }, 3000);
    };


    /* =====================================================
       ROLE NAME CLASS
    ===================================================== */

    const getRoleClass = (role) => {
        return `role-${role
            .toLowerCase()
            .replace(/\s+/g, "-")}`;
    };


    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <Box className="permissions-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <Box className="permissions-header">

                <Box>
                    <Typography
                        className="permissions-breadcrumb"
                    >
                        Administration / Permissions
                    </Typography>

                    <Typography
                        className="permissions-title"
                    >
                        Permissions
                    </Typography>

                    <Typography
                        className="permissions-subtitle"
                    >
                        Control which pages and actions
                        each role and employee can access.
                    </Typography>
                </Box>


                <Button
                    variant="contained"
                    startIcon={<Done />}
                    onClick={handleSave}
                    className="permissions-save-button"
                >
                    Save Permissions
                </Button>

            </Box>


            {/* =================================================
                SUCCESS
            ================================================= */}

            {saved && (
                <Paper className="permissions-success">
                    <Done fontSize="small" />

                    <Typography variant="body2">
                        Permissions saved successfully.
                    </Typography>
                </Paper>
            )}


            {/* =================================================
                TABS
            ================================================= */}

            <Paper className="permissions-tabs-card">

                <Tabs
                    value={activeTab}
                    onChange={(_event, value) => {
                        setActiveTab(value);
                        setSelectedUser(null);
                    }}
                    className="permissions-tabs"
                >

                    <Tab
                        icon={<Security fontSize="small" />}
                        iconPosition="start"
                        label="Permissions by Role"
                    />

                    <Tab
                        icon={<People fontSize="small" />}
                        iconPosition="start"
                        label="Who Has Access"
                    />

                </Tabs>

            </Paper>


            {/* =================================================
                ROLE TAB
            ================================================= */}

            {activeTab === 0 && (
                <>

                    {/* FILTERS */}

                    <Paper className="permissions-controls">

                        <FormControl
                            size="small"
                            className="role-select"
                        >
                            <InputLabel>
                                Role
                            </InputLabel>

                            <Select
                                label="Role"
                                value={selectedRole}
                                onChange={(event) =>
                                    setSelectedRole(
                                        event.target.value
                                    )
                                }
                            >
                                {ROLES.map((role) => (
                                    <MenuItem
                                        key={role}
                                        value={role}
                                    >
                                        {role}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>


                        <TextField
                            size="small"
                            label="Search Pages"
                            placeholder="Search page or route..."
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value
                                )
                            }
                            className="page-search"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search
                                            fontSize="small"
                                            color="action"
                                        />
                                    </InputAdornment>
                                ),
                            }}
                        />

                    </Paper>


                    {/* ROLE SUMMARY */}

                    <Paper className="role-summary">

                        <Stack
                            direction="row"
                            spacing={1.5}
                            alignItems="center"
                        >
                            <Avatar className="role-avatar">
                                {selectedRole.charAt(0)}
                            </Avatar>

                            <Box>
                                <Typography
                                    fontWeight={700}
                                >
                                    {selectedRole}
                                </Typography>

                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    Configure access for this role
                                </Typography>
                            </Box>
                        </Stack>


                        <Stack
                            direction="row"
                            spacing={3}
                            alignItems="center"
                        >

                            <Box textAlign="center">
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    Modules
                                </Typography>

                                <Typography
                                    fontWeight={700}
                                >
                                    {PAGES.length}
                                </Typography>
                            </Box>


                            <Divider
                                orientation="vertical"
                                flexItem
                            />


                            <Box textAlign="center">
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    Pages
                                </Typography>

                                <Typography
                                    fontWeight={700}
                                >
                                    {totalPages}
                                </Typography>
                            </Box>

                        </Stack>

                    </Paper>


                    {/* PERMISSION TABLE */}

                    <Paper className="permissions-table-card">

                        <TableContainer className="permissions-table-container">

                            <Table
                                stickyHeader
                                size="small"
                            >

                                <TableHead>

                                    <TableRow>

                                        <TableCell className="page-header-cell">
                                            Page
                                        </TableCell>


                                        {PERMISSION_TYPES.map(
                                            ({ key, label }) => (
                                                <TableCell
                                                    key={key}
                                                    align="center"
                                                >

                                                    <Stack
                                                        direction="row"
                                                        justifyContent="center"
                                                        alignItems="center"
                                                        spacing={0.2}
                                                    >

                                                        <Typography className="permission-header-text">
                                                            {label}
                                                        </Typography>

                                                        <Tooltip
                                                            title={`Toggle all ${label}`}
                                                        >
                                                            <IconButton
                                                                size="small"
                                                                className="column-toggle-button"
                                                                onClick={() =>
                                                                    toggleColumn(
                                                                        key,
                                                                        !isColumnSelected(key)
                                                                    )
                                                                }
                                                            >
                                                                <Add
                                                                    sx={{
                                                                        fontSize: 15,
                                                                    }}
                                                                />
                                                            </IconButton>
                                                        </Tooltip>

                                                    </Stack>

                                                </TableCell>
                                            )
                                        )}


                                        <TableCell align="center">
                                            <Typography className="permission-header-text">
                                                ALL
                                            </Typography>
                                        </TableCell>

                                    </TableRow>

                                </TableHead>


                                <TableBody>

                                    {filteredModules.length === 0 ? (

                                        <TableRow>
                                            <TableCell
                                                colSpan={7}
                                                className="empty-table-cell"
                                            >
                                                <Search />
                                                <Typography>
                                                    No pages found.
                                                </Typography>
                                            </TableCell>
                                        </TableRow>

                                    ) : (

                                        filteredModules.map((module) => (

                                            <React.Fragment
                                                key={module.module}
                                            >

                                                {/* MODULE */}

                                                <TableRow className="module-row">

                                                    <TableCell className="module-cell">

                                                        <Stack
                                                            direction="row"
                                                            spacing={1}
                                                            alignItems="center"
                                                        >

                                                            <Typography className="module-name">
                                                                {module.module}
                                                            </Typography>

                                                            <Chip
                                                                label={
                                                                    module.pages.length
                                                                }
                                                                size="small"
                                                                className="module-count"
                                                            />

                                                        </Stack>

                                                    </TableCell>


                                                    <TableCell
                                                        colSpan={5}
                                                        className="module-description-cell"
                                                    >
                                                        <Typography
                                                            variant="caption"
                                                            color="text.secondary"
                                                        >
                                                            {module.module} permissions
                                                        </Typography>
                                                    </TableCell>


                                                    <TableCell
                                                        align="center"
                                                        className="module-cell"
                                                    >
                                                        <Switch
                                                            size="small"
                                                            checked={isModuleFullySelected(
                                                                module
                                                            )}
                                                            onChange={(event) =>
                                                                toggleModule(
                                                                    module,
                                                                    event.target.checked
                                                                )
                                                            }
                                                        />
                                                    </TableCell>

                                                </TableRow>


                                                {/* PAGES */}

                                                {module.pages.map((page) => {

                                                    const pagePermissions =
                                                        rolePermissions[
                                                            page.id
                                                        ] ||
                                                        createEmptyPermission();

                                                    const pageHasAccess =
                                                        hasAnyAccess(
                                                            pagePermissions
                                                        );

                                                    return (
                                                        <TableRow
                                                            hover
                                                            key={page.id}
                                                        >

                                                            <TableCell>

                                                                <Stack
                                                                    direction="row"
                                                                    spacing={1.5}
                                                                    alignItems="center"
                                                                >

                                                                    <Box className="page-indent" />

                                                                    <Box>
                                                                        <Typography className="page-name">
                                                                            {page.name}
                                                                        </Typography>

                                                                        <Typography className="page-route">
                                                                            {page.route}
                                                                        </Typography>
                                                                    </Box>

                                                                </Stack>

                                                            </TableCell>


                                                            {PERMISSION_TYPES.map(
                                                                ({ key }) => (
                                                                    <TableCell
                                                                        key={key}
                                                                        align="center"
                                                                    >
                                                                        <Checkbox
                                                                            size="small"
                                                                            checked={
                                                                                pagePermissions[key]
                                                                            }
                                                                            onChange={(event) =>
                                                                                updatePermission(
                                                                                    page.id,
                                                                                    key,
                                                                                    event.target.checked
                                                                                )
                                                                            }
                                                                        />
                                                                    </TableCell>
                                                                )
                                                            )}


                                                            <TableCell align="center">

                                                                <Switch
                                                                    size="small"
                                                                    checked={isPageFullySelected(
                                                                        page.id
                                                                    )}
                                                                    onChange={(event) =>
                                                                        toggleAllForPage(
                                                                            page.id,
                                                                            event.target.checked
                                                                        )
                                                                    }
                                                                />

                                                                {!pageHasAccess && (
                                                                    <Typography
                                                                        className="no-access-label"
                                                                    >
                                                                        No access
                                                                    </Typography>
                                                                )}

                                                            </TableCell>

                                                        </TableRow>
                                                    );
                                                })}

                                            </React.Fragment>

                                        ))

                                    )}

                                </TableBody>

                            </Table>

                        </TableContainer>

                    </Paper>

                </>
            )}


            {/* =================================================
                WHO HAS ACCESS
            ================================================= */}

            {activeTab === 1 && (
                <>

                    {/* FILTERS */}

                    <Paper className="access-controls">

                        <TextField
                            size="small"
                            label="Search Employees"
                            placeholder="Search employee, email or department..."
                            value={userSearch}
                            onChange={(event) =>
                                setUserSearch(
                                    event.target.value
                                )
                            }
                            className="employee-search"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search fontSize="small" />
                                    </InputAdornment>
                                ),
                            }}
                        />


                        <FormControl
                            size="small"
                            className="access-filter"
                        >
                            <InputLabel>
                                Role
                            </InputLabel>

                            <Select
                                label="Role"
                                value={userRoleFilter}
                                onChange={(event) =>
                                    setUserRoleFilter(
                                        event.target.value
                                    )
                                }
                            >
                                <MenuItem value="All">
                                    All Roles
                                </MenuItem>

                                {ROLES.map((role) => (
                                    <MenuItem
                                        key={role}
                                        value={role}
                                    >
                                        {role}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>


                        <FormControl
                            size="small"
                            className="access-filter"
                        >
                            <InputLabel>
                                Page
                            </InputLabel>

                            <Select
                                label="Page"
                                value={pageFilter}
                                onChange={(event) =>
                                    setPageFilter(
                                        event.target.value
                                    )
                                }
                            >
                                <MenuItem value="All">
                                    All Pages
                                </MenuItem>

                                {getAllPages().map((page) => (
                                    <MenuItem
                                        key={page.id}
                                        value={page.id}
                                    >
                                        {page.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>


                        <FormControl
                            size="small"
                            className="access-filter"
                        >
                            <InputLabel>
                                Access
                            </InputLabel>

                            <Select
                                label="Access"
                                value={accessFilter}
                                onChange={(event) =>
                                    setAccessFilter(
                                        event.target.value
                                    )
                                }
                            >
                                <MenuItem value="All">
                                    All
                                </MenuItem>

                                <MenuItem value="Has Access">
                                    Has Access
                                </MenuItem>

                                <MenuItem value="No Access">
                                    No Access
                                </MenuItem>

                                <MenuItem value="View">
                                    View
                                </MenuItem>

                                <MenuItem value="Create">
                                    Create
                                </MenuItem>

                                <MenuItem value="Edit">
                                    Edit
                                </MenuItem>

                                <MenuItem value="Delete">
                                    Delete
                                </MenuItem>

                                <MenuItem value="Approve">
                                    Approve
                                </MenuItem>
                            </Select>
                        </FormControl>

                    </Paper>


                    {/* SUMMARY */}

                    <Paper className="access-summary">

                        <Box>
                            <Typography
                                fontWeight={700}
                            >
                                Who Has Access
                            </Typography>

                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                View the effective permissions
                                inherited from each employee's role.
                            </Typography>
                        </Box>


                        <Box
                            textAlign="right"
                            className="access-summary-count"
                        >
                            <Typography className="access-count">
                                {filteredUsers.length}
                            </Typography>

                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                Employees
                            </Typography>
                        </Box>

                    </Paper>


                    {/* USERS TABLE */}

                    <Paper className="users-table-card">

                        <TableContainer>

                            <Table>

                                <TableHead>

                                    <TableRow>

                                        <TableCell>
                                            Employee
                                        </TableCell>

                                        <TableCell>
                                            Role
                                        </TableCell>

                                        <TableCell>
                                            Department
                                        </TableCell>

                                        <TableCell>
                                            Pages
                                        </TableCell>

                                        <TableCell>
                                            Access
                                        </TableCell>

                                        <TableCell align="right">
                                            Action
                                        </TableCell>

                                    </TableRow>

                                </TableHead>


                                <TableBody>

                                    {filteredUsers.length === 0 ? (

                                        <TableRow>
                                            <TableCell
                                                colSpan={6}
                                                className="empty-users-cell"
                                            >
                                                <People />
                                                <Typography fontWeight={600}>
                                                    No employees found
                                                </Typography>

                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                >
                                                    Try changing your filters.
                                                </Typography>
                                            </TableCell>
                                        </TableRow>

                                    ) : (

                                        filteredUsers.map((user) => {

                                            const count =
                                                getUserAccessCount(user);

                                            const total =
                                                getAllPages().length;

                                            const percentage =
                                                total > 0
                                                    ? Math.round(
                                                        (count / total) *
                                                        100
                                                    )
                                                    : 0;

                                            return (
                                                <TableRow
                                                    hover
                                                    key={user.id}
                                                >

                                                    {/* EMPLOYEE */}

                                                    <TableCell>

                                                        <Stack
                                                            direction="row"
                                                            spacing={1.5}
                                                            alignItems="center"
                                                        >

                                                            <Avatar className="employee-avatar">
                                                                {user.name.charAt(0)}
                                                            </Avatar>

                                                            <Box>
                                                                <Typography className="employee-name">
                                                                    {user.name}
                                                                </Typography>

                                                                <Typography className="employee-email">
                                                                    {user.email}
                                                                </Typography>
                                                            </Box>

                                                        </Stack>

                                                    </TableCell>


                                                    {/* ROLE */}

                                                    <TableCell>

                                                        <Chip
                                                            label={user.role}
                                                            size="small"
                                                            className={`role-chip ${getRoleClass(
                                                                user.role
                                                            )}`}
                                                        />

                                                    </TableCell>


                                                    {/* DEPARTMENT */}

                                                    <TableCell>

                                                        <Typography
                                                            variant="body2"
                                                            color="text.secondary"
                                                        >
                                                            {user.department}
                                                        </Typography>

                                                    </TableCell>


                                                    {/* PAGES */}

                                                    <TableCell>

                                                        <Box className="pages-count-cell">

                                                            <Typography
                                                                className="pages-count-number"
                                                            >
                                                                {count}
                                                            </Typography>

                                                            <Typography
                                                                className="pages-count-total"
                                                            >
                                                                / {total}
                                                            </Typography>

                                                        </Box>

                                                        <Typography
                                                            className="pages-count-percent"
                                                        >
                                                            {percentage}% access
                                                        </Typography>

                                                    </TableCell>


                                                    {/* ACCESS */}

                                                    <TableCell>

                                                        {count === 0 ? (

                                                            <Chip
                                                                label="No Access"
                                                                size="small"
                                                                className="access-chip access-none"
                                                            />

                                                        ) : count === total ? (

                                                            <Chip
                                                                label="Full Access"
                                                                size="small"
                                                                className="access-chip access-full"
                                                            />

                                                        ) : (

                                                            <Chip
                                                                label="Partial Access"
                                                                size="small"
                                                                className="access-chip access-partial"
                                                            />

                                                        )}

                                                    </TableCell>


                                                    {/* ACTION */}

                                                    <TableCell align="right">

                                                        <Button
                                                            size="small"
                                                            variant="outlined"
                                                            startIcon={
                                                                <Visibility />
                                                            }
                                                            onClick={() =>
                                                                setSelectedUser(
                                                                    user
                                                                )
                                                            }
                                                            className="view-permissions-button"
                                                        >
                                                            View Permissions
                                                        </Button>

                                                    </TableCell>

                                                </TableRow>
                                            );
                                        })

                                    )}

                                </TableBody>

                            </Table>

                        </TableContainer>

                    </Paper>

                </>
            )}


            {/* =================================================
                USER DETAIL DIALOG
            ================================================= */}

            <Dialog
                open={Boolean(selectedUser)}
                onClose={() =>
                    setSelectedUser(null)
                }
                fullWidth
                maxWidth="md"
                className="permissions-dialog"
            >

                {selectedUser && (
                    <>

                        {/* DIALOG HEADER */}

                        <DialogTitle className="permission-dialog-title">

                            <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="center"
                            >

                                <Stack
                                    direction="row"
                                    spacing={1.5}
                                    alignItems="center"
                                >

                                    <Avatar className="modal-avatar">
                                        {selectedUser.name.charAt(0)}
                                    </Avatar>

                                    <Box>
                                        <Typography
                                            className="modal-user-name"
                                        >
                                            {selectedUser.name}
                                        </Typography>

                                        <Typography
                                            className="modal-user-email"
                                        >
                                            {selectedUser.email}
                                        </Typography>
                                    </Box>

                                </Stack>


                                <IconButton
                                    onClick={() =>
                                        setSelectedUser(null)
                                    }
                                    className="modal-close-button"
                                >
                                    <Close />
                                </IconButton>

                            </Stack>

                        </DialogTitle>


                        {/* DIALOG CONTENT */}

                        <DialogContent
                            dividers
                            className="permission-dialog-content"
                        >

                            {/* USER META */}

                            <Box className="modal-user-meta">

                                <Chip
                                    label={selectedUser.role}
                                    size="small"
                                    className={`role-chip ${getRoleClass(
                                        selectedUser.role
                                    )}`}
                                />

                                <Chip
                                    label={selectedUser.department}
                                    size="small"
                                    variant="outlined"
                                    className="department-chip"
                                />

                                <Chip
                                    label={`${getUserAccessCount(
                                        selectedUser
                                    )}/${totalPages} Pages`}
                                    size="small"
                                    className="modal-pages-chip"
                                />

                            </Box>


                            <Box className="modal-section-heading">

                                <Box>
                                    <Typography
                                        className="modal-section-title"
                                    >
                                        Page Permissions
                                    </Typography>

                                    <Typography
                                        className="modal-section-subtitle"
                                    >
                                        Effective permissions inherited
                                        from the user's role.
                                    </Typography>
                                </Box>

                                <Typography className="modal-total-pages">
                                    {getUserAccessCount(selectedUser)}
                                    {" "}
                                    / {totalPages}
                                </Typography>

                            </Box>


                            {/* PERMISSIONS */}

                            <Box className="modal-permission-list">

                                {selectedUserAccess.map(
                                    ({
                                        page,
                                        permission,
                                    }) => {

                                        const hasAccess =
                                            hasAnyAccess(
                                                permission
                                            );

                                        return (
                                            <Box
                                                key={page.id}
                                                className={`modal-permission-row ${
                                                    hasAccess
                                                        ? "has-access"
                                                        : "no-access"
                                                }`}
                                            >

                                                <Box className="modal-page-info">

                                                    <Typography className="modal-page-name">
                                                        {page.name}
                                                    </Typography>

                                                    <Typography className="modal-page-route">
                                                        {page.route}
                                                    </Typography>

                                                </Box>


                                                <Stack
                                                    direction="row"
                                                    spacing={0.5}
                                                    flexWrap="wrap"
                                                    justifyContent="flex-end"
                                                    className="modal-permission-chips"
                                                >

                                                    {PERMISSION_TYPES.map(
                                                        ({
                                                            key,
                                                            label,
                                                        }) =>
                                                            permission[key] && (
                                                                <Chip
                                                                    key={key}
                                                                    label={label}
                                                                    size="small"
                                                                    className={`permission-chip permission-chip-${key}`}
                                                                />
                                                            )
                                                    )}

                                                    {!hasAccess && (
                                                        <Chip
                                                            label="No Access"
                                                            size="small"
                                                            className="permission-chip permission-chip-none"
                                                        />
                                                    )}

                                                </Stack>

                                            </Box>
                                        );
                                    }
                                )}

                            </Box>

                        </DialogContent>


                        {/* DIALOG FOOTER */}

                        <DialogActions className="permission-dialog-actions">

                            <Button
                                onClick={() =>
                                    setSelectedUser(null)
                                }
                                className="modal-close-action"
                            >
                                Close
                            </Button>

                        </DialogActions>

                    </>
                )}

            </Dialog>


            {/* =================================================
                FOOTER
            ================================================= */}

            <Box className="permissions-footer">

                <Typography
                    variant="caption"
                    color="text.secondary"
                >
                    Changes are currently stored locally.
                </Typography>

                <Button
                    variant="contained"
                    size="small"
                    startIcon={<Done />}
                    onClick={handleSave}
                >
                    Save Permissions
                </Button>

            </Box>

        </Box>
    );
}


export default Permissions;