import { MuiTableBodyMigration, MuiTableCellMigration, MuiTableHeadMigration, MuiTableMigration, MuiTableRowMigration } from "../../../components/ui/MuiCompat.jsx";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { loadXlsx } from "../../../utils/exportLibraries";
import "./Hierarchy.css";
import { useAuth } from "../../../context/AuthContext";

import {
    Card,
    CardContent,
    Autocomplete,
    TextField,
    Button,
    IconButton,
    Tooltip,
    Snackbar,
    Alert
} from "@mui/material";
import { Box as MuiLayoutBox, Typography as MuiText } from "@mui/material";
import { ArrowBack, Download } from "@mui/icons-material";

// =========================================================
// API
// =========================================================

const API_URL = `${import.meta.env.VITE_HIERARCHY_API_BASE_URL}/api/Hierarchy`;
const EMPLOYEE_API = `${import.meta.env.VITE_EMPLOYEE_API_BASE_URL}/api/Employee`;

// =========================================================
// COMPONENT
// =========================================================

function Hierarchy() {

    const { hasPermission } = useAuth();
    const navigate = useNavigate();

    const permissionRoute = "/employees/EmployeeHierarchy";
    const canView = hasPermission(permissionRoute, "view");

    // =========================================================
    // STATE
    // =========================================================

    const [hierarchies, setHierarchies] = useState([]);
    const [employees, setEmployees] = useState([]);

    const [employeeId, setEmployeeId] = useState("");
    const [employeeSearch, setEmployeeSearch] = useState("");
    const [employeeHierarchy, setEmployeeHierarchy] = useState(null);

    const [loading, setLoading] = useState(false);
    const [loadingEmployees, setLoadingEmployees] = useState(false);
    const [statusFilter, setStatusFilter] = useState("");
    const [notice, setNotice] = useState({ open: false, message: "", severity: "info" });

    // =========================================================
    // LOAD EMPLOYEES
    // =========================================================

    const loadEmployees = useCallback(async () => {

        if (!canView) {
            setEmployees([]);
            setLoadingEmployees(false);
            return;
        }

        setLoadingEmployees(true);

        try {

            const response = await axios.get(
                EMPLOYEE_API
            );

            const data = Array.isArray(response.data)
                ? response.data.filter(Boolean)
                : [];

            const uniqueEmployees = Array.from(
                new Map(
                    data.map((employee) => {
                        const employeeId = String(employee.employeeId ?? "").trim();
                        const email = String(employee.email || employee.emailAddress || employee.employeeEmail || "").trim().toLowerCase();
                        const name = String(employee.employeeName || `${employee.firstName || ""} ${employee.lastName || ""}`).trim().toLowerCase();
                        const key = employeeId ? `id:${employeeId}` : email ? `email:${email}` : `name:${name}`;
                        return [key, employee];
                    })
                ).values()
            );

            console.log("Employees:", data);

            setEmployees(uniqueEmployees);

        } catch (error) {

            console.error(
                "Error loading employees:",
                error
            );

            setEmployees([]);

        } finally {

            setLoadingEmployees(false);
        }

    }, [canView]);

    // =========================================================
    // LOAD HIERARCHY
    //
    // Backend automatically builds/updates the hierarchy.
    //
    // We ONLY read the result here.
    // =========================================================

    const loadHierarchies = useCallback(async () => {

        if (!canView) {
            setHierarchies([]);
            return [];
        }

        try {

            const response = await axios.get(
                API_URL
            );

            const data = Array.isArray(response.data)
                ? response.data.filter(Boolean)
                : [];

            console.log(
                "Hierarchies:",
                data
            );

            setHierarchies(data);

            return data;

        } catch (error) {

            console.error(
                "Error loading hierarchy:",
                error
            );

            setHierarchies([]);

            return [];

        }

    }, [canView]);

    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {

        loadEmployees();
        loadHierarchies();

    }, [
        loadEmployees,
        loadHierarchies
    ]);

    // =========================================================
    // AUTOMATIC REFRESH
    //
    // Backend HierarchySyncService checks EmployeeService
    // automatically.
    //
    // Refresh frontend every 5 seconds so changes appear
    // automatically without clicking anything.
    // =========================================================

    useEffect(() => {

        const interval = setInterval(() => {

            loadEmployees();
            loadHierarchies();

        }, 5000);

        return () => {
            clearInterval(interval);
        };

    }, [
        loadEmployees,
        loadHierarchies
    ]);

    // =========================================================
    // FIND EMPLOYEE
    // =========================================================

    const getEmployee = (id) => {

        if (
            id === null ||
            id === undefined ||
            id === ""
        ) {
            return null;
        }

        return employees.find(
            employee =>
                Number(employee.employeeId) ===
                Number(id)
        );
    };

    // =========================================================
    // EMPLOYEE NAME
    // =========================================================

    const getEmployeeName = (id) => {

        const employee =
            getEmployee(id);

        if (!employee) {
            return "-";
        }

        return (
            employee.employeeName ||
            `${employee.firstName || ""} ${employee.lastName || ""}`.trim() ||
            "-"
        );
    };

    const getEmployeeLabel = (employee) => employee?.employeeName || `${employee?.firstName || ""} ${employee?.lastName || ""}`.trim() || String(employee?.employeeId || "");
    const getEmployeeOptionLabel = (employee) => {
        const label = getEmployeeLabel(employee);
        const sameNameCount = employees.filter((candidate) => getEmployeeLabel(candidate).toLowerCase() === label.toLowerCase()).length;
        return sameNameCount > 1 ? `${label} (${employee.employeeId})` : label;
    };

    // =========================================================
    // BUILD REPORTING CHAIN
    //
    // IMPORTANT:
    //
    // We DO NOT calculate:
    //
    // Employee -> Team Lead
    // Team Lead -> Manager
    // Manager -> Super Admin
    // Super Admin -> General Manager
    //
    // anymore.
    //
    // Backend already calculated ReportsToEmployeeId.
    //
    // Frontend simply follows:
    //
    // Employee
    //    ↓
    // ReportsToEmployeeId
    //    ↓
    // ReportsToEmployeeId
    //    ↓
    // ...
    //
    // =========================================================

    const buildReportingChain = (
        selectedEmployeeId,
        hierarchyData
    ) => {

        if (
            !selectedEmployeeId ||
            !Array.isArray(hierarchyData) ||
            hierarchyData.length === 0
        ) {
            return [];
        }

        const hierarchyMap = new Map();

        hierarchyData.forEach(item => {

            hierarchyMap.set(
                Number(item.employeeId),
                item
            );

        });

        const chain = [];

        const visited = new Set();

        let currentId =
            Number(selectedEmployeeId);

        // Safety limit prevents circular hierarchy
        // from creating an infinite loop.

        let safetyCounter = 0;

        while (
            currentId &&
            safetyCounter < 50
        ) {

            safetyCounter++;

            // Prevent circular reporting structure

            if (visited.has(currentId)) {

                console.warn(
                    "Circular hierarchy detected for EmployeeId:",
                    currentId
                );

                break;
            }

            visited.add(currentId);

            const current =
                hierarchyMap.get(currentId);

            if (!current) {
                break;
            }

            chain.push(current);

            // Backend calculated this value.

            const nextId =
                current.reportsToEmployeeId;

            if (
                nextId === null ||
                nextId === undefined ||
                nextId === ""
            ) {
                break;
            }

            currentId =
                Number(nextId);
        }

        return chain;
    };

    // =========================================================
    // GET SELECTED EMPLOYEE HIERARCHY
    // =========================================================

    const getEmployeeHierarchy = async () => {

        if (!canView) {
            return;
        }

        if (!employeeId) {

            setNotice({ open: true, message: "Select an employee first.", severity: "info" });

            return;
        }

        setLoading(true);

        try {

            // First refresh the hierarchy from backend.

            const latestHierarchy =
                await loadHierarchies();

            // Find selected employee.

            const selectedHierarchy =
                latestHierarchy.find(
                    item =>
                        Number(item.employeeId) ===
                        Number(employeeId)
                );

            if (!selectedHierarchy) {

                setEmployeeHierarchy(null);

                setNotice({ open: true, message: "Hierarchy not found for this employee.", severity: "warning" });

                return;
            }

            // Build chain using backend's
            // ReportsToEmployeeId.

            const chain =
                buildReportingChain(
                    employeeId,
                    latestHierarchy
                );

            console.log(
                "Selected Employee:",
                selectedHierarchy
            );

            console.log(
                "Reporting Chain:",
                chain
            );

            setEmployeeHierarchy(
                selectedHierarchy
            );

        } catch (error) {

            console.error(
                "Hierarchy error:",
                error
            );

            setEmployeeHierarchy(null);

            setNotice({ open: true, message: "Unable to load employee hierarchy.", severity: "error" });

        } finally {

            setLoading(false);
        }
    };

    // =========================================================
    // GET SELECTED REPORTING CHAIN
    // =========================================================

    const reportingChain =
        employeeHierarchy
            ? buildReportingChain(
                employeeHierarchy.employeeId,
                hierarchies
            )
            : [];

    // =========================================================
    // RENDER HIERARCHY BOX
    // =========================================================

    const renderHierarchyBox = (
        item,
        index
    ) => {

        if (!item) {
            return null;
        }

        const isFirst =
            index === 0;

        const roleName =
            item.roleName ||
            "Unknown Role";

        const employeeName =
            item.employeeName ||
            getEmployeeName(
                item.employeeId
            ) ||
            "Not Assigned";

        return (
            <MuiLayoutBox
                key={`${item.employeeId}-${index}`}
                className={
                    isFirst
                        ? "hierarchy-box employee"
                        : "hierarchy-box"
                }
             component="div">

                <MuiText component="span" variant="inherit">
                    {roleName}
                </MuiText>

                <MuiText component="strong" variant="inherit">
                    {employeeName}
                </MuiText>

                {item.department && (
                    <MuiText component="small" variant="caption">
                        {item.department}
                    </MuiText>
                )}

            </MuiLayoutBox>
        );
    };

    // =========================================================
    // TABLE
    //
    // Backend already contains the reporting employee.
    // Therefore we don't calculate anything here.
    // =========================================================

    const getTableParent = (
        item
    ) => {

        if (
            !item ||
            !item.reportsToEmployeeId
        ) {
            return null;
        }

        return hierarchies.find(
            hierarchy =>
                Number(
                    hierarchy.employeeId
                ) === Number(
                    item.reportsToEmployeeId
                )
        );
    };

    const filteredHierarchies = hierarchies.filter((item) => !statusFilter || (item.status || "Active") === statusFilter);
    const exportHierarchies = async () => {
        const XLSX = await loadXlsx();
        const rows = filteredHierarchies.map((item) => {
            const parent = getTableParent(item);
            return {
                Employee: item.employeeName || getEmployeeName(item.employeeId) || "Unknown",
                Department: item.department || "Unknown",
                Role: item.roleName || "Unknown",
                "Reports To": item.reportsToEmployeeName || parent?.employeeName || "Not Assigned",
                "Parent Role": item.parentRoleName || parent?.roleName || "Not Assigned",
                Level: item.hierarchyLevel ?? "-",
                Status: item.status || "Active",
            };
        });
        const sheet = XLSX.utils.json_to_sheet(rows);
        const book = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(book, sheet, "Hierarchy");
        XLSX.writeFile(book, `Spark_Employee_Hierarchy_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    // =========================================================
    // RENDER
    // =========================================================

    if (!canView) {
        return (
            <MuiLayoutBox style={{ padding: "60px", textAlign: "center" }} component="div">
                <MuiText component="h2" variant="h5">Access Denied</MuiText>
                <MuiText component="p" variant="body1">You do not have permission to access this page.</MuiText>
            </MuiLayoutBox>
        );
    }

    return (

        <MuiLayoutBox className="hierarchy-page" component="div">

            {/* ================================================= */}
            {/* HEADER */}
            {/* ================================================= */}

            <MuiLayoutBox className="hierarchy-header" component="div">
                <MuiLayoutBox className="hierarchy-title-wrap" component="div">
                    <Tooltip title="Back to employee management"><IconButton aria-label="Back to employee management" onClick={() => navigate("/employees")}><ArrowBack /></IconButton></Tooltip>
                    <MuiLayoutBox component="div">
                        <MuiText component="h1" variant="h4">Employee Hierarchy</MuiText>
                        <MuiText component="p" variant="body1">View employee reporting and approval hierarchy.</MuiText>
                    </MuiLayoutBox>
                </MuiLayoutBox>
                <Button variant="outlined" startIcon={<Download />} onClick={exportHierarchies}>Export Excel</Button>
            </MuiLayoutBox>

            <MuiLayoutBox className="hierarchy-stats-grid" component="div">
                {[
                    { label: "Configured Hierarchies", status: "", count: hierarchies.length },
                    { label: "Active", status: "Active", count: hierarchies.filter((item) => (item.status || "Active") === "Active").length },
                    { label: "Inactive", status: "Inactive", count: hierarchies.filter((item) => item.status === "Inactive").length },
                ].map((stat) => (
                    <Card key={stat.label} className={`hierarchy-stat-card ${statusFilter === stat.status ? "selected" : ""}`} role="button" tabIndex={0} onClick={() => setStatusFilter((current) => current === stat.status ? "" : stat.status)} onKeyDown={(event) => event.key === "Enter" && setStatusFilter((current) => current === stat.status ? "" : stat.status)}>
                        <CardContent><MuiText component="span" variant="body2">{stat.label}</MuiText><MuiText component="h2" variant="h5">{stat.count}</MuiText></CardContent>
                    </Card>
                ))}
            </MuiLayoutBox>

            {/* ================================================= */}
            {/* EMPLOYEE SELECTOR */}
            {/* ================================================= */}

            <Card className="toolbar-card">

                <CardContent>

                    <MuiLayoutBox className="toolbar" component="div">

                        <Autocomplete
                            className="hierarchy-employee-search"
                            fullWidth
                            options={employees}
                            value={employees.find((employee) => String(employee.employeeId) === String(employeeId)) || null}
                            inputValue={employeeSearch}
                            loading={loadingEmployees}
                            disabled={loadingEmployees}
                            getOptionLabel={getEmployeeOptionLabel}
                            isOptionEqualToValue={(option, value) => String(option.employeeId) === String(value.employeeId)}
                            filterOptions={(options, state) => {
                                const query = state.inputValue.trim().toLowerCase();
                                if (!query) return options;
                                return options.filter((employee) => `${getEmployeeLabel(employee)} ${employee.employeeId || ""} ${employee.email || employee.emailAddress || employee.employeeEmail || ""}`.toLowerCase().includes(query));
                            }}
                            onInputChange={(_, value, reason) => {
                                if (reason === "input" || reason === "clear") setEmployeeSearch(value);
                            }}
                            onChange={(_, employee) => {
                                setEmployeeId(employee?.employeeId ?? "");
                                setEmployeeSearch(employee ? getEmployeeLabel(employee) : "");
                            }}
                            noOptionsText={loadingEmployees ? "Loading employees..." : "No matching employees"}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Search employee"
                                    placeholder="Type a name or employee ID"
                                />
                            )}
                        />

                        <Button
                            variant="contained"
                            onClick={
                                getEmployeeHierarchy
                            }
                            disabled={
                                loading ||
                                loadingEmployees ||
                                !employeeId
                            }
                            sx={{
                                minWidth: 170,
                                height: 56
                            }}
                        >

                            {loading
                                ? "Loading..."
                                : "View Hierarchy"}

                        </Button>

                    </MuiLayoutBox>

                </CardContent>

            </Card>

            {/* ================================================= */}
            {/* REPORTING STRUCTURE */}
            {/* ================================================= */}

            {employeeHierarchy && (

                <MuiLayoutBox className="hierarchy-card" component="div">

                    <MuiText component="h2" variant="h5">
                        Reporting Structure
                    </MuiText>

                    {reportingChain.length === 0 ? (

                        <MuiText component="p" variant="body1">
                            No reporting hierarchy found.
                        </MuiText>

                    ) : (

                        <MuiLayoutBox className="hierarchy-flow" component="div">

                            {reportingChain.map(
                                (item, index) => (

                                    <MuiLayoutBox
                                        key={
                                            `${item.employeeId}-${index}`
                                        }
                                        style={{
                                            display: "flex",
                                            alignItems: "center"
                                        }}
                                     component="div">

                                        {renderHierarchyBox(
                                            item,
                                            index
                                        )}

                                        {index <
                                            reportingChain.length - 1 && (

                                            <MuiLayoutBox className="arrow" component="div">
                                                →
                                            </MuiLayoutBox>

                                        )}

                                    </MuiLayoutBox>

                                )
                            )}

                        </MuiLayoutBox>

                    )}

                </MuiLayoutBox>

            )}

            {/* ================================================= */}
            {/* ALL CONFIGURED HIERARCHIES */}
            {/* ================================================= */}

            <MuiLayoutBox className="all-hierarchy-card" component="div">

                <MuiText component="h2" variant="h5">
                    Configured Hierarchies
                </MuiText>

                <MuiTableMigration>

                    <MuiTableHeadMigration>

                        <MuiTableRowMigration>

                            <MuiTableCellMigration>
                                Employee
                            </MuiTableCellMigration>

                            <MuiTableCellMigration>
                                Department
                            </MuiTableCellMigration>

                            <MuiTableCellMigration>
                                Role
                            </MuiTableCellMigration>

                            <MuiTableCellMigration>
                                Reports To
                            </MuiTableCellMigration>

                            <MuiTableCellMigration>
                                Parent Role
                            </MuiTableCellMigration>

                            <MuiTableCellMigration>
                                Level
                            </MuiTableCellMigration>

                            <MuiTableCellMigration>
                                Status
                            </MuiTableCellMigration>

                        </MuiTableRowMigration>

                    </MuiTableHeadMigration>

                    <MuiTableBodyMigration>

                        {filteredHierarchies.length === 0 ? (

                            <MuiTableRowMigration>

                                <MuiTableCellMigration
                                    colSpan="7"
                                    style={{
                                        textAlign:
                                            "center"
                                    }}
                                >
                                    No hierarchies configured.
                                </MuiTableCellMigration>

                            </MuiTableRowMigration>

                        ) : (

                            filteredHierarchies.map(
                                item => {

                                    const parent =
                                        getTableParent(
                                            item
                                        );

                                    return (

                                        <MuiTableRowMigration
                                            key={
                                                item.hierarchyId
                                            }
                                        >

                                            {/* EMPLOYEE */}

                                            <MuiTableCellMigration>

                                                {item.employeeName ||
                                                    getEmployeeName(
                                                        item.employeeId
                                                    ) ||
                                                    "Unknown"}

                                            </MuiTableCellMigration>

                                            {/* DEPARTMENT */}

                                            <MuiTableCellMigration>

                                                {item.department ||
                                                    "Unknown"}

                                            </MuiTableCellMigration>

                                            {/* ROLE */}

                                            <MuiTableCellMigration>

                                                {item.roleName ||
                                                    "Unknown"}

                                            </MuiTableCellMigration>

                                            {/* REPORTS TO */}

                                            <MuiTableCellMigration>

                                                {item.reportsToEmployeeName ||
                                                    parent?.employeeName ||
                                                    "Not Assigned"}

                                            </MuiTableCellMigration>

                                            {/* PARENT ROLE */}

                                            <MuiTableCellMigration>

                                                {item.parentRoleName ||
                                                    parent?.roleName ||
                                                    "Not Assigned"}

                                            </MuiTableCellMigration>

                                            {/* LEVEL */}

                                            <MuiTableCellMigration>

                                                {item.hierarchyLevel ??
                                                    "-"}

                                            </MuiTableCellMigration>

                                            {/* STATUS */}

                                            <MuiTableCellMigration>

                                                <MuiText className="status" component="span" variant="inherit">

                                                    {item.status ||
                                                        "Active"}

                                                </MuiText>

                                            </MuiTableCellMigration>

                                        </MuiTableRowMigration>

                                    );

                                }
                            )

                        )}

                    </MuiTableBodyMigration>

                </MuiTableMigration>

            </MuiLayoutBox>

            <Snackbar open={notice.open} autoHideDuration={4000} onClose={() => setNotice((current) => ({ ...current, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
                <Alert severity={notice.severity} variant="filled" onClose={() => setNotice((current) => ({ ...current, open: false }))}>{notice.message}</Alert>
            </Snackbar>
        </MuiLayoutBox>

    );
}

export default Hierarchy;
