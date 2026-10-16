import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
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
    ArrowBack,
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
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Snackbar,
    Alert,
} from "@mui/material";
import { Box as MuiLayoutBox, Typography as MuiText } from "@mui/material";

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
    const [pendingDelete, setPendingDelete] = useState(null);
    const [notice, setNotice] = useState({ open: false, message: "", severity: "success" });

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


    const deleteEmployeeType = async () => {

        if (!canDelete) return;

        const id = pendingDelete?.employeeTypeId;
        if (!id) return;

        try {

            await deleteEmployeeTypeApi(id);

            await loadEmployeeTypes();

            setNotice({ open: true, message: "Employee Type deleted successfully.", severity: "success" });

        } catch (error) {

            console.error(error);

            setNotice({ open: true, message: error.response?.data?.title || "Unable to delete Employee Type.", severity: "error" });
        } finally {
            setPendingDelete(null);
        }
    };


    const saveEmployeeType = async (data) => {

        if (!canCreate) return;

        try {

            await createEmployeeType(data);

            await loadEmployeeTypes();

            setOpenAddDialog(false);

            setNotice({ open: true, message: "Employee Type added successfully.", severity: "success" });

        } catch (error) {

            console.error(error);

            setNotice({ open: true, message: error.response?.data?.title || "Unable to create Employee Type.", severity: "error" });
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

            setNotice({ open: true, message: "Employee Type updated successfully.", severity: "success" });

        } catch (error) {

            console.error(error);

            setNotice({ open: true, message: error.response?.data?.title || "Unable to update Employee Type.", severity: "error" });
        }
    };

    const exportEmployeeTypes = () => {
        const rows = filteredEmployeeTypes.map((item) => ({
            "Employee Type": item.employeeTypeName,
            Description: item.description || "",
            "Created Date": item.createdDate ? new Date(item.createdDate).toLocaleDateString("en-GB") : "",
            Status: item.status || "",
        }));
        const sheet = XLSX.utils.json_to_sheet(rows);
        const book = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(book, sheet, "Employee Types");
        XLSX.writeFile(book, `Spark_Employee_Types_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };
    const selectStatusCard = (status) => setStatusFilter((current) => current === status ? "" : status);


    if (!canView) {
        return (
            <MuiLayoutBox style={{ padding: "60px", textAlign: "center" }} component="div">
                <MuiText component="h2" variant="h5">Access Denied</MuiText>
                <MuiText component="p" variant="body1">You do not have permission to access this page.</MuiText>
            </MuiLayoutBox>
        );
    }

    return (

        <MuiLayoutBox className="employee-type-page" component="div">

            <MuiLayoutBox className="employee-page-header" component="div">

                <MuiLayoutBox className="employee-type-title-wrap" component="div">
                    <Tooltip title="Back to employee management">
                        <IconButton className="employee-type-back-button" aria-label="Back to employee management" onClick={() => navigate("/employees")}><ArrowBack /></IconButton>
                    </Tooltip>
                    <MuiLayoutBox component="div">

                    <MuiText component="h1" variant="h4">Employee Type Management</MuiText>

                    <MuiText component="p" variant="body1">
                        Manage employee types across your organization.
                    </MuiText>
                    </MuiLayoutBox>
                </MuiLayoutBox>


                <MuiLayoutBox className="header-buttons" component="div">

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
                            onClick={exportEmployeeTypes}
                        >
                            Export Excel
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

                </MuiLayoutBox>

            </MuiLayoutBox>


            <MuiLayoutBox className="stats-grid" component="div">

                <Card className={`stats-card ${statusFilter === "" ? "selected" : ""}`} role="button" tabIndex={0} onClick={() => selectStatusCard("")} onKeyDown={(e) => e.key === "Enter" && selectStatusCard("")}>

                    <CardContent>

                        <MuiLayoutBox className="stats-icon blue" component="div">

                            <Category />

                        </MuiLayoutBox>

                        <MuiText component="span" variant="inherit">Total Employee Types</MuiText>

                        <MuiText component="h2" variant="h5">
                            {employeeTypes.length}
                        </MuiText>

                    </CardContent>

                </Card>


                <Card className={`stats-card ${statusFilter === "Active" ? "selected" : ""}`} role="button" tabIndex={0} onClick={() => selectStatusCard("Active")} onKeyDown={(e) => e.key === "Enter" && selectStatusCard("Active")}>

                    <CardContent>

                        <MuiLayoutBox className="stats-icon green" component="div">

                            <CheckCircle />

                        </MuiLayoutBox>

                        <MuiText component="span" variant="inherit">Active Employee Types</MuiText>

                        <MuiText component="h2" variant="h5">
                            {
                                employeeTypes.filter(
                                    x => x.status === "Active"
                                ).length
                            }
                        </MuiText>

                    </CardContent>

                </Card>


                <Card className={`stats-card ${statusFilter === "Inactive" ? "selected" : ""}`} role="button" tabIndex={0} onClick={() => selectStatusCard("Inactive")} onKeyDown={(e) => e.key === "Enter" && selectStatusCard("Inactive")}>

                    <CardContent>

                        <MuiLayoutBox className="stats-icon red" component="div">

                            <Cancel />

                        </MuiLayoutBox>

                        <MuiText component="span" variant="inherit">Inactive Employee Types</MuiText>

                        <MuiText component="h2" variant="h5">
                            {
                                employeeTypes.filter(
                                    x => x.status === "Inactive"
                                ).length
                            }
                        </MuiText>

                    </CardContent>

                </Card>

            </MuiLayoutBox>


            {/* SEARCH + STATUS FILTER */}

            <Card className="toolbar-card">

                <CardContent>

                    <MuiLayoutBox className="employee-type-filter-row" component="div">

                        <TextField
                            className="employee-type-search"
                            fullWidth
                            placeholder="Search Employee Type..."
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                            slotProps={{ input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search />
                                    </InputAdornment>
                                ),
                            } }}
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

                    </MuiLayoutBox>

                </CardContent>

            </Card>


            {
                loading ?

                    <Card className="table-card">

                        <CardContent>

                            <MuiText
                                style={{
                                    textAlign: "center",
                                    padding: "40px",
                                }}
                             component="h3" variant="h6">
                                Loading Employee Types...
                            </MuiText>

                        </CardContent>

                    </Card>

                    :

                    <Card className="table-card">

                        <CardContent>

                            <EmployeeTypeTable
                                employeeTypes={filteredEmployeeTypes}
                                editEmployeeType={editEmployeeType}
                                deleteEmployeeType={(item) => setPendingDelete(item)}
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
            <Dialog open={Boolean(pendingDelete)} onClose={() => setPendingDelete(null)}>
                <DialogTitle>Delete employee type?</DialogTitle>
                <DialogContent>Are you sure you want to delete {pendingDelete?.employeeTypeName || "this employee type"}?</DialogContent>
                <DialogActions><Button onClick={() => setPendingDelete(null)}>Cancel</Button><Button color="error" variant="contained" onClick={deleteEmployeeType}>Delete</Button></DialogActions>
            </Dialog>
            <Snackbar open={notice.open} autoHideDuration={4000} onClose={() => setNotice((current) => ({ ...current, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
                <Alert severity={notice.severity} variant="filled" onClose={() => setNotice((current) => ({ ...current, open: false }))}>{notice.message}</Alert>
            </Snackbar>

        </MuiLayoutBox>

    );
}

export default EmployeeType;
