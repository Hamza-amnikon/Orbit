import { useEffect, useState } from "react";
import axios from "axios";
import "./Hierarchy.css";

const API_URL = "https://localhost:7283/api/Hierarchy";
const EMPLOYEE_API = "http://localhost:5151/api/Employee";

function Hierarchy() {
    const [hierarchies, setHierarchies] = useState([]);
    const [employees, setEmployees] = useState([]);

    const [employeeId, setEmployeeId] = useState("");
    const [employeeHierarchy, setEmployeeHierarchy] = useState(null);
    const [approver, setApprover] = useState(null);

    const [loading, setLoading] = useState(false);
    const [loadingEmployees, setLoadingEmployees] = useState(false);

    // =========================================================
    // LOAD DATA
    // =========================================================

    useEffect(() => {
        loadEmployees();
        loadHierarchies();
    }, []);

    // =========================================================
    // LOAD EMPLOYEES
    // =========================================================

    const loadEmployees = async () => {
        setLoadingEmployees(true);

        try {
            const response = await axios.get(EMPLOYEE_API);

            console.log("Employees:", response.data);

            setEmployees(response.data || []);
        } catch (error) {
            console.error("Error loading employees:", error);
            setEmployees([]);
        } finally {
            setLoadingEmployees(false);
        }
    };

    // =========================================================
    // LOAD ALL ACTIVE HIERARCHIES
    // =========================================================

    const loadHierarchies = async () => {
        try {
            const response = await axios.get(API_URL);

            console.log("Hierarchies:", response.data);

            setHierarchies(response.data || []);
        } catch (error) {
            console.error("Error loading hierarchy:", error);
            setHierarchies([]);
        }
    };

    // =========================================================
    // GET SELECTED EMPLOYEE HIERARCHY
    // =========================================================

    const getEmployeeHierarchy = async () => {
        if (!employeeId) {
            alert("Select an employee");
            return;
        }

        setLoading(true);
        setEmployeeHierarchy(null);
        setApprover(null);

        try {
            // -------------------------------------------------
            // Get hierarchy
            // -------------------------------------------------

            const hierarchyResponse = await axios.get(
                `${API_URL}/employee/${employeeId}`
            );

            console.log(
                "Employee Hierarchy:",
                hierarchyResponse.data
            );

            setEmployeeHierarchy(hierarchyResponse.data);

            // -------------------------------------------------
            // Get approver
            // -------------------------------------------------

            try {
                const approverResponse = await axios.get(
                    `${API_URL}/approver/${employeeId}`
                );

                console.log(
                    "Approver:",
                    approverResponse.data
                );

                setApprover(approverResponse.data);
            } catch (error) {
                console.log("No approver found");
                setApprover(null);
            }

        } catch (error) {
            console.error(
                "Hierarchy error:",
                error
            );

            setEmployeeHierarchy(null);
            setApprover(null);

            if (error.response?.status === 404) {
                alert(
                    "Hierarchy not found for this employee."
                );
            } else {
                alert(
                    "Unable to load employee hierarchy."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // FIND EMPLOYEE BY ID
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
            (e) =>
                Number(e.employeeId) === Number(id)
        );
    };

    // =========================================================
    // FIND EMPLOYEE NAME
    // =========================================================

    const getEmployeeName = (id) => {
        const employee = getEmployee(id);

        return employee?.employeeName || "-";
    };

    // =========================================================
    // NORMALIZE DESIGNATION
    // =========================================================

    const normalizeDesignation = (designation) => {
        return String(designation || "")
            .trim()
            .toLowerCase();
    };

    // =========================================================
    // FIND ADMINISTRATOR / SUPER ADMIN
    //
    // PRIMARY RULE:
    // Department = Amnikon
    // Designation = Administrator
    //
    // FALLBACK:
    // Any Administrator
    // =========================================================

    const getAdministrator = () => {

        // First try:
        // Department = Amnikon
        // Designation = Administrator

        const amnikonAdmin = employees.find(
            (e) =>
                String(e.department || "")
                    .trim()
                    .toLowerCase() === "amnikon"
                &&
                normalizeDesignation(e.designation) ===
                "administrator"
        );

        if (amnikonAdmin) {
            return amnikonAdmin;
        }

        // -------------------------------------------------
        // Fallback:
        // Find any Administrator
        // -------------------------------------------------

        const administrator = employees.find(
            (e) =>
                normalizeDesignation(e.designation) ===
                "administrator"
        );

        return administrator || null;
    };

    // =========================================================
    // FIND EMPLOYEE BY NAME
    // =========================================================

    const getEmployeeByName = (name) => {
        if (!name) {
            return null;
        }

        return employees.find(
            (e) =>
                String(e.employeeName || "")
                    .trim()
                    .toLowerCase() ===
                String(name)
                    .trim()
                    .toLowerCase()
        );
    };

    // =========================================================
    // BUILD TABLE HIERARCHY
    //
    // NORMAL EMPLOYEE
    //
    // Employee
    //      ↓
    // Team Lead
    //      ↓
    // Manager
    //      ↓
    // Administrator
    //
    //
    // TEAM LEAD
    //
    // Team Lead
    //      ↓
    // Manager
    //      ↓
    // Administrator
    //
    //
    // MANAGER
    //
    // Manager
    //      ↓
    // Administrator
    // =========================================================

    const getTableHierarchy = (item) => {

        // -------------------------------------------------
        // Selected employee
        // -------------------------------------------------

        const employee = getEmployee(
            item.employeeId
        );

        // -------------------------------------------------
        // Employee not found
        // -------------------------------------------------

        if (!employee) {
            return {
                employeeName: "Unknown",
                departmentName: "Unknown",
                teamLeadName: "Unknown",
                managerName: "Unknown",
                superAdminName:
                    getAdministrator()?.employeeName ||
                    "Not Assigned"
            };
        }

        // -------------------------------------------------
        // Employee designation
        // -------------------------------------------------

        const designation =
            normalizeDesignation(
                employee.designation
            );

        // -------------------------------------------------
        // ALWAYS FIND ADMINISTRATOR
        // -------------------------------------------------

        const administrator =
            getAdministrator();

        let teamLead = null;
        let manager = null;

        // =================================================
        // CASE 1
        // NORMAL EMPLOYEE
        // =================================================

        if (
            designation !== "team lead" &&
            designation !== "manager" &&
            designation !== "administrator" &&
            designation !== "general manager"
        ) {

            // -------------------------------------------------
            // Employee -> Team Lead
            // -------------------------------------------------

            const teamLeadId =
                item.teamLeadEmployeeId ??
                item.reportsToEmployeeId;

            if (teamLeadId) {
                teamLead = getEmployee(teamLeadId);
            }

            // -------------------------------------------------
            // If Team Lead exists
            // Team Lead -> Manager
            // -------------------------------------------------

            if (teamLead) {

                if (teamLead.managerId) {
                    manager = getEmployeeByName(
                        teamLead.managerId
                    );
                }
            }

            // -------------------------------------------------
            // If NO Team Lead
            // Employee -> Manager directly
            // -------------------------------------------------

            else {

                // Try employee.managerId first
                if (employee.managerId) {

                    manager = getEmployeeByName(
                        employee.managerId
                    );
                }

                // Fallback to hierarchy manager ID
                if (!manager && item.managerEmployeeId) {

                    manager = getEmployee(
                        item.managerEmployeeId
                    );
                }
            }
        }        // =================================================
        // CASE 2
        // TEAM LEAD
        //
        // Team Lead -> Manager -> Administrator
        // =================================================

        else if (
            designation === "team lead"
        ) {

            // -------------------------------------------------
            // IMPORTANT:
            // Do NOT put the Team Lead again
            // in Team Lead column.
            //
            // ReportsToEmployeeId = Manager
            // -------------------------------------------------

            const managerId =
                item.managerEmployeeId ??
                item.reportsToEmployeeId ??
                item.teamLeadEmployeeId;

            manager = getEmployee(
                managerId
            );

            // -------------------------------------------------
            // If ID didn't find manager,
            // try ManagerId name
            // -------------------------------------------------

            if (!manager && employee.managerId) {

                manager =
                    getEmployeeByName(
                        employee.managerId
                    );
            }
        }

        // =================================================
        // CASE 3
        // MANAGER
        //
        // Manager -> Administrator
        // =================================================

        else if (
            designation === "manager"
        ) {

            // Manager column remains empty/Unknown.
            // Super Admin is Administrator.

            manager = null;
        }

        // =================================================
        // CASE 4
        // GENERAL MANAGER
        // =================================================

        else if (
            designation === "general manager"
        ) {

            teamLead = null;
            manager = null;
        }

        // =================================================
        // CASE 5
        // ADMINISTRATOR
        // =================================================

        else if (
            designation === "administrator"
        ) {

            teamLead = null;
            manager = null;
        }

        // =================================================
        // RETURN TABLE DATA
        // =================================================

        return {
            employeeName:
                employee.employeeName ||
                "Unknown",

            departmentName:
                employee.department ||
                "Unknown",

            teamLeadName:
                teamLead?.employeeName ||
                "Unknown",

            managerName:
                manager?.employeeName ||
                "Unknown",

            // IMPORTANT:
            // Always show Administrator here
            superAdminName:
                item.superAdminName ||
                "Not Assigned"
        };
    };

    // =========================================================
    // GET APPROVER NAME
    // =========================================================

    const getApproverName = () => {

        if (!approver) {
            return "-";
        }

        if (approver.approverEmployeeName) {
            return approver.approverEmployeeName;
        }

        if (approver.approverEmployeeId) {
            return getEmployeeName(
                approver.approverEmployeeId
            );
        }

        return "-";
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
            {/* EMPLOYEE SEARCH */}
            {/* ================================================= */}

            <div className="search-card">

                <label>
                    Employee
                </label>

                <div className="search-row">

                    <select
                        value={employeeId}
                        onChange={(e) =>
                            setEmployeeId(
                                e.target.value
                            )
                        }
                        disabled={loadingEmployees}
                    >

                        <option value="">
                            {loadingEmployees
                                ? "Loading employees..."
                                : "Select Employee"}
                        </option>

                        {employees.map(
                            (employee) => (

                                <option
                                    key={
                                        employee.employeeId
                                    }
                                    value={
                                        employee.employeeId
                                    }
                                >
                                    {
                                        employee.employeeName
                                    }
                                </option>

                            )
                        )}

                    </select>


                    <button
                        onClick={
                            getEmployeeHierarchy
                        }
                        disabled={
                            loading ||
                            loadingEmployees ||
                            !employeeId
                        }
                    >
                        {loading
                            ? "Loading..."
                            : "View Hierarchy"}
                    </button>

                </div>

            </div>


            {/* ================================================= */}
            {/* REPORTING STRUCTURE */}
            {/* ================================================= */}

            {employeeHierarchy && (

                <div className="hierarchy-card">

                    <h2>
                        Reporting Structure
                    </h2>

                    <div className="hierarchy-flow">

                        {/* ================================================= */}
                        {/* NORMAL EMPLOYEE */}
                        {/* ================================================= */}

                        {![
                            "team lead",
                            "manager",
                            "administrator",
                            "general manager"
                        ].includes(
                            normalizeDesignation(
                                employeeHierarchy.designation
                            )
                        ) && (

                                <>

                                    {/* EMPLOYEE */}

                                    <div className="hierarchy-box employee">

                                        <span>
                                            Employee
                                        </span>

                                        <strong>
                                            {
                                                employeeHierarchy.employeeName ||
                                                "Not Assigned"
                                            }
                                        </strong>

                                    </div>


                                    <div className="arrow">
                                        →
                                    </div>


                                    {/* TEAM LEAD */}

                                    <div className="hierarchy-box">

                                        <span>
                                            Team Lead
                                        </span>

                                        <strong>
                                            {
                                                employeeHierarchy.teamLeadName ||
                                                "Not Assigned"
                                            }
                                        </strong>

                                    </div>


                                    <div className="arrow">
                                        →
                                    </div>


                                    {/* MANAGER */}

                                    <div className="hierarchy-box">

                                        <span>
                                            Manager
                                        </span>

                                        <strong>
                                            {
                                                employeeHierarchy.managerName ||
                                                "Not Assigned"
                                            }
                                        </strong>

                                    </div>


                                    <div className="arrow">
                                        →
                                    </div>


                                    {/* SUPER ADMIN */}

                                    <div className="hierarchy-box super-admin">

                                        <span>
                                            Super Admin
                                        </span>

                                        <strong>
                                            {
                                                employeeHierarchy.superAdminName ||
                                                "Not Assigned"
                                            }
                                        </strong>

                                    </div>

                                </>
                            )}


                        {/* ================================================= */}
                        {/* TEAM LEAD */}
                        {/* Team Lead → Manager → Super Admin */}
                        {/* ================================================= */}

                        {normalizeDesignation(
                            employeeHierarchy.designation
                        ) === "team lead" && (

                                <>

                                    {/* TEAM LEAD */}

                                    <div className="hierarchy-box employee">

                                        <span>
                                            Team Lead
                                        </span>

                                        <strong>
                                            {
                                                employeeHierarchy.employeeName ||
                                                "Not Assigned"
                                            }
                                        </strong>

                                    </div>


                                    <div className="arrow">
                                        →
                                    </div>


                                    {/* MANAGER */}

                                    <div className="hierarchy-box">

                                        <span>
                                            Manager
                                        </span>

                                        <strong>
                                            {
                                                employeeHierarchy.managerName ||
                                                "Not Assigned"
                                            }
                                        </strong>

                                    </div>


                                    <div className="arrow">
                                        →
                                    </div>


                                    {/* SUPER ADMIN */}

                                    <div className="hierarchy-box super-admin">

                                        <span>
                                            Super Admin
                                        </span>

                                        <strong>
                                            {
                                                employeeHierarchy.superAdminName ||
                                                "Not Assigned"
                                            }
                                        </strong>

                                    </div>

                                </>
                            )}


                        {/* ================================================= */}
                        {/* MANAGER */}
                        {/* Manager → Super Admin */}
                        {/* ================================================= */}

                        {normalizeDesignation(
                            employeeHierarchy.designation
                        ) === "manager" && (

                                <>

                                    {/* MANAGER */}

                                    <div className="hierarchy-box employee">

                                        <span>
                                            Manager
                                        </span>

                                        <strong>
                                            {
                                                employeeHierarchy.employeeName ||
                                                "Not Assigned"
                                            }
                                        </strong>

                                    </div>


                                    <div className="arrow">
                                        →
                                    </div>


                                    {/* SUPER ADMIN */}

                                    <div className="hierarchy-box super-admin">

                                        <span>
                                            Super Admin
                                        </span>

                                        <strong>
                                            {
                                                employeeHierarchy.superAdminName ||
                                                "Not Assigned"
                                            }
                                        </strong>

                                    </div>

                                </>
                            )}


                        {/* ================================================= */}
                        {/* GENERAL MANAGER */}
                        {/* ================================================= */}

                        {normalizeDesignation(
                            employeeHierarchy.designation
                        ) === "general manager" && (

                                <>

                                    <div className="hierarchy-box employee">

                                        <span>
                                            General Manager
                                        </span>

                                        <strong>
                                            {
                                                employeeHierarchy.employeeName ||
                                                "Not Assigned"
                                            }
                                        </strong>

                                    </div>


                                    <div className="arrow">
                                        →
                                    </div>


                                    <div className="hierarchy-box super-admin">

                                        <span>
                                            Super Admin
                                        </span>

                                        <strong>
                                            {
                                                employeeHierarchy.superAdminName ||
                                                "Not Assigned"
                                            }
                                        </strong>

                                    </div>

                                </>
                            )}


                        {/* ================================================= */}
                        {/* ADMINISTRATOR */}
                        {/* ================================================= */}

                        {normalizeDesignation(
                            employeeHierarchy.designation
                        ) === "administrator" && (

                                <div className="hierarchy-box super-admin">

                                    <span>
                                        Super Admin
                                    </span>

                                    <strong>
                                        {
                                            employeeHierarchy.employeeName ||
                                            "Not Assigned"
                                        }
                                    </strong>

                                </div>

                            )}

                    </div>

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
                                Team Lead
                            </th>

                            <th>
                                Manager
                            </th>

                            <th>
                                Super Admin
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
                                    colSpan="6"
                                    style={{
                                        textAlign: "center"
                                    }}
                                >
                                    No hierarchies configured.
                                </td>

                            </tr>

                        ) : (

                            hierarchies.map((item) => {

                                const tableHierarchy =
                                    getTableHierarchy(item);

                                return (

                                    <tr
                                        key={
                                            item.hierarchyId
                                        }
                                    >

                                        {/* EMPLOYEE */}

                                        <td>
                                            {
                                                tableHierarchy.employeeName
                                            }
                                        </td>


                                        {/* DEPARTMENT */}

                                        <td>
                                            {
                                                tableHierarchy.departmentName
                                            }
                                        </td>


                                        {/* TEAM LEAD */}

                                        <td>
                                            {
                                                tableHierarchy.teamLeadName
                                            }
                                        </td>


                                        {/* MANAGER */}

                                        <td>
                                            {
                                                tableHierarchy.managerName
                                            }
                                        </td>


                                        {/* SUPER ADMIN */}

                                        <td>
                                            {
                                                tableHierarchy.superAdminName
                                            }
                                        </td>


                                        {/* STATUS */}

                                        <td>

                                            <span className="status">
                                                {
                                                    item.status
                                                }
                                            </span>

                                        </td>

                                    </tr>

                                );

                            })

                        )}

                    </tbody>

                </table>

            </div>

        </div>
    );
}

export default Hierarchy;