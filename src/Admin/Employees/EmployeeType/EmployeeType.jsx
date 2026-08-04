import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
} from "@mui/material";

function EmployeeType() {

    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");

    const [employeeTypes, setEmployeeTypes] = useState([]);

    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);

    const [selectedEmployeeType, setSelectedEmployeeType] = useState(null);

    useEffect(() => {
        loadEmployeeTypes();
    }, []);






    
    const loadEmployeeTypes = async () => {
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
        loadEmployeeTypes();
    };

    const filteredEmployeeTypes = employeeTypes.filter((item) => {

        const keyword = search.toLowerCase();

        return (
            item.employeeTypeName?.toLowerCase().includes(keyword) ||
            item.description?.toLowerCase().includes(keyword) ||
            item.status?.toLowerCase().includes(keyword)
        );
    });

    const editEmployeeType = (employeeType) => {
        setSelectedEmployeeType(employeeType);
        setOpenEditDialog(true);
    };

    const deleteEmployeeType = async (id) => {

    if (!window.confirm("Delete this Employee Type?"))
        return;

    try {

        await deleteEmployeeTypeApi(id);

        await loadEmployeeTypes();

        alert("Employee Type deleted successfully.");

    } catch (error) {

        console.error(error);

        alert(error.response?.data || "Unable to delete Employee Type.");
    }
};
    const saveEmployeeType = async (data) => {
    try {

        await createEmployeeType(data);

        await loadEmployeeTypes();

        setOpenAddDialog(false);

        alert("Employee Type added successfully.");

    } catch (error) {

        console.error(error);

        alert(error.response?.data || "Unable to create Employee Type.");
    }
};

   const updateEmployeeType = async (data) => {
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

        alert(error.response?.data || "Unable to update Employee Type.");
    }
};
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

                    <Button
                        variant="outlined"
                        startIcon={<Download />}
                    >
                        Export
                    </Button>

                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => setOpenAddDialog(true)}
                    >
                        Add Employee Type
                    </Button>

                </div>

            </div>

            <div className="stats-grid">

                <Card className="stats-card">

                    <CardContent>

                        <div className="stats-icon blue">

                            <Category />

                        </div>

                        <span>Total Employee Types</span>

                        <h2>{employeeTypes.length}</h2>

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

            <Card className="toolbar-card">

                <CardContent>

                    <TextField
                        fullWidth
                        placeholder="Search Employee Type..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search />
                                </InputAdornment>
                            ),
                        }}
                    />

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
                            />

                        </CardContent>

                    </Card>
            }

            <AddEmployeeType
                open={openAddDialog}
                handleClose={() => setOpenAddDialog(false)}
                handleSave={saveEmployeeType}
            />

            <EditEmployeeType
                open={openEditDialog}
                employeeType={selectedEmployeeType}
                handleClose={() => setOpenEditDialog(false)}
                handleUpdate={updateEmployeeType}
            />

        </div>

    );
}

export default EmployeeType;