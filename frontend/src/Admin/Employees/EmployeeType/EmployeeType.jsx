import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import "./EmployeeType.css";

import {
    getEmployeeTypes,
    createEmployeeType,
    updateEmployeeType as updateEmployeeTypeApi,
    deleteEmployeeType as deleteEmployeeTypeApi
} from "./EmployeeTypeService";

import AddEmployeeType from "./AddEmployeeType";
import EditEmployeeType from "./EditEmployeeType";
import EmployeeTypeTable from "./EmployeeTypeTable";

import {
    Add,
    Refresh,
    Download,
    Category,
    CheckCircle,
    Cancel,
    Search,
} from "@mui/icons-material";

import {
    Button,
    Card,
    CardContent,
    TextField,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from "@mui/material";

function EmployeeType() {

    const navigate = useNavigate();
    const { hasPermission } = useAuth();

    const permissionRoute = "/employees/types";
    const canView = hasPermission(permissionRoute, "view");
    const canCreate = hasPermission(permissionRoute, "create");
    const canEdit = hasPermission(permissionRoute, "edit");
    const canDelete = hasPermission(permissionRoute, "delete");
    const canExport = hasPermission(permissionRoute, "export");

    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const [employeeTypes, setEmployeeTypes] = useState([]);

    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);

    const [selectedEmployeeType, setSelectedEmployeeType] = useState(null);

    useEffect(() => {
        if (canView) {
            loadEmployeeTypes();
        }
    }, [canView]);


    const loadEmployeeTypes = async () => {
        if (!canView) {
            setEmployeeTypes([]);
            setLoading(false);
            return;
        }

        try {

            setLoading(true);

            const data = await getEmployeeTypes();

            setEmployeeTypes(data);

        } catch (error) {

            console.error(error);

        } finally {

            setLoading(false);

        }
    };

    const refreshData = () => {
        if (!canView) return;
        loadEmployeeTypes();
    };

    const filteredEmployeeTypes = employeeTypes.filter((item) => {

        const keyword = search.trim().toLowerCase();

        const matchesSearch =
            !keyword ||
            item.employeeTypeName?.toLowerCase().includes(keyword) ||
            item.description?.toLowerCase().includes(keyword);

        const matchesStatus =
            !statusFilter ||
            item.status === statusFilter;

        return matchesSearch && matchesStatus;
    });


    const editEmployeeType = (employeeType) => {
        if (!canEdit) return;
        setSelectedEmployeeType(employeeType);
        setOpenEditDialog(true);
    };


    const deleteEmployeeType = async (id) => {

        if (!canDelete) return;

        if (!window.confirm("Delete this Employee Type?"))
            return;

        try {

            await deleteEmployeeTypeApi(id);

            await loadEmployeeTypes();

            alert("Employee Type deleted successfully.");

        } catch (error) {

            console.error(error);

            alert(
                error.response?.data ||
                "Unable to delete Employee Type."
            );
        }
    };


    const saveEmployeeType = async (data) => {

        if (!canCreate) return;

        try {

            await createEmployeeType(data);

            await loadEmployeeTypes();

            setOpenAddDialog(false);

            alert("Employee Type added successfully.");

        } catch (error) {

            console.error(error);

            alert(
                error.response?.data ||
                "Unable to create Employee Type."
            );
        }
    };


    const updateEmployeeType = async (data) => {

        if (!canEdit) return;

        try {

            await updateEmployeeTypeApi(
                selectedEmployeeType.employeeTypeId,
                data
            );

            await loadEmployeeTypes();

            setSelectedEmployeeType(null);

            setOpenEditDialog(false);

            alert("Employee Type updated successfully.");

        } catch (error) {

            console.error(error);

            alert(
                error.response?.data ||
                "Unable to update Employee Type."
            );
        }
    };


    if (!canView) {
        return (
            <div style={{ padding: "60px", textAlign: "center" }}>
                <h2>Access Denied</h2>
                <p>You do not have permission to access this page.</p>
            </div>
        );
    }

    return (

        <div className="employee-type-page">

            <div className="employee-page-header">

                <div>

                    <h1>Employee Type Management</h1>

                    <p>
                        Manage employee types across your organization.
                    </p>

                </div>


                <div className="header-buttons">

                    <Button
                        variant="outlined"
                        onClick={() => navigate("/employees")}
                    >
                        Previous
                    </Button>


                    <Button
                        variant="outlined"
                        startIcon={<Refresh />}
                        onClick={refreshData}
                    >
                        Refresh
                    </Button>


                    {canExport && (
                        <Button
                            variant="outlined"
                            startIcon={<Download />}
                        >
                            Export
                        </Button>
                    )}


                    {canCreate && (
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={() => setOpenAddDialog(true)}
                        >
                            Add Employee Type
                        </Button>
                    )}

                </div>

            </div>


            <div className="stats-grid">

                <Card className="stats-card">

                    <CardContent>

                        <div className="stats-icon blue">

                            <Category />

                        </div>

                        <span>Total Employee Types</span>

                        <h2>
                            {employeeTypes.length}
                        </h2>

                    </CardContent>

                </Card>


                <Card className="stats-card">

                    <CardContent>

                        <div className="stats-icon green">

                            <CheckCircle />

                        </div>

                        <span>Active Employee Types</span>

                        <h2>
                            {
                                employeeTypes.filter(
                                    x => x.status === "Active"
                                ).length
                            }
                        </h2>

                    </CardContent>

                </Card>


                <Card className="stats-card">

                    <CardContent>

                        <div className="stats-icon red">

                            <Cancel />

                        </div>

                        <span>Inactive Employee Types</span>

                        <h2>
                            {
                                employeeTypes.filter(
                                    x => x.status === "Inactive"
                                ).length
                            }
                        </h2>

                    </CardContent>

                </Card>

            </div>


            {/* SEARCH + STATUS FILTER */}

            <Card className="toolbar-card">

                <CardContent>

                    <div className="employee-type-filter-row">

                        <TextField
                            className="employee-type-search"
                            fullWidth
                            placeholder="Search Employee Type..."
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search />
                                    </InputAdornment>
                                ),
                            }}
                        />


                        <FormControl className="employee-type-status-filter">

                            <InputLabel>Status</InputLabel>

                            <Select
                                value={statusFilter}
                                label="Status"
                                onChange={(e) =>
                                    setStatusFilter(e.target.value)
                                }
                            >

                                <MenuItem value="">
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

                    </div>

                </CardContent>

            </Card>


            {
                loading ?

                    <Card className="table-card">

                        <CardContent>

                            <h3
                                style={{
                                    textAlign: "center",
                                    padding: "40px",
                                }}
                            >
                                Loading Employee Types...
                            </h3>

                        </CardContent>

                    </Card>

                    :

                    <Card className="table-card">

                        <CardContent>

                            <EmployeeTypeTable
                                employeeTypes={filteredEmployeeTypes}
                                editEmployeeType={editEmployeeType}
                                deleteEmployeeType={deleteEmployeeType}
                                canEdit={canEdit}
                                canDelete={canDelete}
                            />

                        </CardContent>

                    </Card>
            }


            {canCreate && (
                <AddEmployeeType
                open={openAddDialog}
                handleClose={() =>
                    setOpenAddDialog(false)
                }
                handleSave={saveEmployeeType}
                />
            )}


            {canEdit && (
                <EditEmployeeType
                open={openEditDialog}
                employeeType={selectedEmployeeType}
                handleClose={() =>
                    setOpenEditDialog(false)
                }
                handleUpdate={updateEmployeeType}
                />
            )}

        </div>

    );
}

export default EmployeeType;