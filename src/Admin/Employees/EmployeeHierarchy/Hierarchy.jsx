import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "./Hierarchy.css";

import {
    Card,
    CardContent,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button
} from "@mui/material";

// =========================================================
// API
// =========================================================

const API_URL = "https://localhost:7283/api/Hierarchy";
const EMPLOYEE_API = "https://localhost:7002/api/Employee";

// =========================================================
// COMPONENT
// =========================================================

function Hierarchy() {

    // =========================================================
    // STATE
    // =========================================================

    const [hierarchies, setHierarchies] = useState([]);
    const [employees, setEmployees] = useState([]);

    const [employeeId, setEmployeeId] = useState("");
    const [employeeHierarchy, setEmployeeHierarchy] = useState(null);

    const [loading, setLoading] = useState(false);
    const [loadingEmployees, setLoadingEmployees] = useState(false);

    // =========================================================
    // LOAD EMPLOYEES
    // =========================================================

    const loadEmployees = useCallback(async () => {

        setLoadingEmployees(true);

        try {

            const response = await axios.get(
                EMPLOYEE_API
            );

            const data = Array.isArray(response.data)
                ? response.data
                : [];

            console.log("Employees:", data);

            setEmployees(data);

        } catch (error) {

            console.error(
                "Error loading employees:",
                error
            );

            setEmployees([]);

        } finally {

            setLoadingEmployees(false);
        }

    }, []);

    // =========================================================
    // LOAD HIERARCHY
    //
    // Backend automatically builds/updates the hierarchy.
    //
    // We ONLY read the result here.
    // =========================================================

    const loadHierarchies = useCallback(async () => {

        try {

            const response = await axios.get(
                API_URL
            );

            const data = Array.isArray(response.data)
                ? response.data
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

    }, []);

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

        if (!employeeId) {

            alert(
                "Select an employee"
            );

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

                alert(
                    "Hierarchy not found for this employee."
                );

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

            alert(
                "Unable to load employee hierarchy."
            );

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
            <div
                key={`${item.employeeId}-${index}`}
                className={
                    isFirst
                        ? "hierarchy-box employee"
                        : "hierarchy-box"
                }
            >

                <span>
                    {roleName}
                </span>

                <strong>
                    {employeeName}
                </strong>

                {item.department && (
                    <small>
                        {item.department}
                    </small>
                )}

            </div>
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

    // =========================================================
    // RENDER
    // =========================================================

    return (

        <div className="hierarchy-page">

            {/* ================================================= */}
            {/* HEADER */}
            {/* ================================================= */}

            <div className="hierarchy-header">

                <h1>
                    Employee Hierarchy
                </h1>

                <p>
                    View employee reporting and approval hierarchy.
                </p>

            </div>

            {/* ================================================= */}
            {/* EMPLOYEE SELECTOR */}
            {/* ================================================= */}

            <Card className="toolbar-card">

                <CardContent>

                    <div className="toolbar">

                        <FormControl
                            fullWidth
                            sx={{ flex: 1 }}
                        >

                            <InputLabel>
                                Employee
                            </InputLabel>

                            <Select
                                value={employeeId}
                                label="Employee"
                                onChange={(e) =>
                                    setEmployeeId(
                                        e.target.value
                                    )
                                }
                                disabled={
                                    loadingEmployees
                                }
                            >

                                <MenuItem value="">

                                    {loadingEmployees
                                        ? "Loading employees..."
                                        : "Select Employee"}

                                </MenuItem>

                                {employees.map(
                                    employee => (

                                        <MenuItem
                                            key={
                                                employee.employeeId
                                            }
                                            value={
                                                employee.employeeId
                                            }
                                        >

                                            {employee.employeeName ||
                                                `${employee.firstName || ""} ${employee.lastName || ""}`.trim()}

                                        </MenuItem>

                                    )
                                )}

                            </Select>

                        </FormControl>

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

                    </div>

                </CardContent>

            </Card>

            {/* ================================================= */}
            {/* REPORTING STRUCTURE */}
            {/* ================================================= */}

            {employeeHierarchy && (

                <div className="hierarchy-card">

                    <h2>
                        Reporting Structure
                    </h2>

                    {reportingChain.length === 0 ? (

                        <p>
                            No reporting hierarchy found.
                        </p>

                    ) : (

                        <div className="hierarchy-flow">

                            {reportingChain.map(
                                (item, index) => (

                                    <div
                                        key={
                                            `${item.employeeId}-${index}`
                                        }
                                        style={{
                                            display: "flex",
                                            alignItems: "center"
                                        }}
                                    >

                                        {renderHierarchyBox(
                                            item,
                                            index
                                        )}

                                        {index <
                                            reportingChain.length - 1 && (

                                            <div className="arrow">
                                                →
                                            </div>

                                        )}

                                    </div>

                                )
                            )}

                        </div>

                    )}

                </div>

            )}

            {/* ================================================= */}
            {/* ALL CONFIGURED HIERARCHIES */}
            {/* ================================================= */}

            <div className="all-hierarchy-card">

                <h2>
                    Configured Hierarchies
                </h2>

                <table>

                    <thead>

                        <tr>

                            <th>
                                Employee
                            </th>

                            <th>
                                Department
                            </th>

                            <th>
                                Role
                            </th>

                            <th>
                                Reports To
                            </th>

                            <th>
                                Parent Role
                            </th>

                            <th>
                                Level
                            </th>

                            <th>
                                Status
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {hierarchies.length === 0 ? (

                            <tr>

                                <td
                                    colSpan="7"
                                    style={{
                                        textAlign:
                                            "center"
                                    }}
                                >
                                    No hierarchies configured.
                                </td>

                            </tr>

                        ) : (

                            hierarchies.map(
                                item => {

                                    const parent =
                                        getTableParent(
                                            item
                                        );

                                    return (

                                        <tr
                                            key={
                                                item.hierarchyId
                                            }
                                        >

                                            {/* EMPLOYEE */}

                                            <td>

                                                {item.employeeName ||
                                                    getEmployeeName(
                                                        item.employeeId
                                                    ) ||
                                                    "Unknown"}

                                            </td>

                                            {/* DEPARTMENT */}

                                            <td>

                                                {item.department ||
                                                    "Unknown"}

                                            </td>

                                            {/* ROLE */}

                                            <td>

                                                {item.roleName ||
                                                    "Unknown"}

                                            </td>

                                            {/* REPORTS TO */}

                                            <td>

                                                {item.reportsToEmployeeName ||
                                                    parent?.employeeName ||
                                                    "Not Assigned"}

                                            </td>

                                            {/* PARENT ROLE */}

                                            <td>

                                                {item.parentRoleName ||
                                                    parent?.roleName ||
                                                    "Not Assigned"}

                                            </td>

                                            {/* LEVEL */}

                                            <td>

                                                {item.hierarchyLevel ??
                                                    "-"}

                                            </td>

                                            {/* STATUS */}

                                            <td>

                                                <span className="status">

                                                    {item.status ||
                                                        "Active"}

                                                </span>

                                            </td>

                                        </tr>

                                    );

                                }
                            )

                        )}

                    </tbody>

                </table>

            </div>

        </div>

    );
}

export default Hierarchy;