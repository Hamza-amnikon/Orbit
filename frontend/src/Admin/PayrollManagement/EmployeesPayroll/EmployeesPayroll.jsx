import React, { useEffect, useMemo, useState } from "react";

import {
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";

import axios from "axios";
import { useNavigate } from "react-router-dom";

import "./EmployeesPayroll.css";

/* =========================================================
   API
========================================================= */

const EMPLOYEE_API =
    "https://localhost:7002/api/Employee";

const PAYROLL_API =
    "http://localhost:5111/api";

const EMPLOYEE_SALARIES_API =
    `${PAYROLL_API}/EmployeeSalaries`;

const PAYROLL_TEMPLATES_API =
    `${PAYROLL_API}/PayrollTemplates`;


/* =========================================================
   HELPERS
========================================================= */

const getValue = (object, ...keys) => {
    for (const key of keys) {
        if (
            object &&
            object[key] !== undefined &&
            object[key] !== null
        ) {
            return object[key];
        }
    }

    return null;
};


const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(Number(value) || 0);
};


const normalizeCalculationType = (value) => {
    if (!value) {
        return "Fixed Amount";
    }

    const normalized = String(value)
        .trim()
        .toLowerCase();

    if (
        normalized === "percentage" ||
        normalized === "%"
    ) {
        return "Percentage";
    }

    if (
        normalized === "fixed" ||
        normalized === "fixed amount" ||
        normalized === "fixedamount"
    ) {
        return "Fixed Amount";
    }

    if (normalized === "balance") {
        return "Balance";
    }

    if (normalized === "formula") {
        return "Formula";
    }

    return value;
};


const getEmployeeName = (employee) => {
    const nestedUser =
        getValue(employee, "user", "User", "profile", "Profile") || {};

    const directName = getValue(
        employee,
        "displayName",
        "DisplayName",
        "name",
        "Name",
        "fullName",
        "FullName",
        "employeeName",
        "EmployeeName"
    );

    if (directName) {
        return String(directName).trim();
    }

    const nestedName = getValue(
        nestedUser,
        "displayName",
        "DisplayName",
        "name",
        "Name",
        "fullName",
        "FullName"
    );

    if (nestedName) {
        return String(nestedName).trim();
    }

    const firstName = getValue(
        employee,
        "firstName",
        "FirstName",
        "givenName",
        "GivenName"
    );

    const lastName = getValue(
        employee,
        "lastName",
        "LastName",
        "surname",
        "Surname",
        "familyName",
        "FamilyName"
    );

    const combinedName = [firstName, lastName]
        .filter(Boolean)
        .join(" ")
        .trim();

    if (combinedName) {
        return combinedName;
    }

    const nestedFirstName = getValue(
        nestedUser,
        "firstName",
        "FirstName",
        "givenName",
        "GivenName"
    );

    const nestedLastName = getValue(
        nestedUser,
        "lastName",
        "LastName",
        "surname",
        "Surname",
        "familyName",
        "FamilyName"
    );

    const nestedCombinedName = [nestedFirstName, nestedLastName]
        .filter(Boolean)
        .join(" ")
        .trim();

    return nestedCombinedName || "Unknown Employee";
};


const getEmployeeNumber = (employee) => {
    return (
        getValue(
            employee,
            "employeeId",
            "EmployeeId",
            "employeeID",
            "EmployeeID"
        ) || ""
    );
};


/* =========================================================
   NORMALIZE EMPLOYEE FROM EMPLOYEE SERVICE
========================================================= */

const normalizeEmployee = (employee, index) => {
    const internalId = getValue(
        employee,
        "id",
        "Id",
        "employeeInternalId",
        "EmployeeInternalId"
    );

    const employeeId = getEmployeeNumber(employee);

    return {
        id:
            internalId !== null &&
            internalId !== undefined
                ? internalId
                : employeeId || index + 1,

        employeeId:
            employeeId ||
            internalId ||
            "",

        name: getEmployeeName(employee),

        department:
            getValue(
                employee,
                "department",
                "Department"
            ) || "",

        designation:
            getValue(
                employee,
                "jobTitle",
                "JobTitle",
                "designation",
                "Designation"
            ) || "",

        email:
            getValue(
                employee,
                "mail",
                "Mail",
                "email",
                "Email"
            ) || "",

        raw: employee,
    };
};


/* =========================================================
   NORMALIZE TEMPLATE COMPONENT
========================================================= */

const normalizeTemplateComponent = (
    component,
    index
) => {
    const salaryComponent =
        getValue(
            component,
            "salaryComponent",
            "SalaryComponent"
        ) || {};

    const salaryComponentId =
        getValue(
            component,
            "salaryComponentId",
            "SalaryComponentId"
        ) ??
        getValue(
            salaryComponent,
            "salaryComponentId",
            "SalaryComponentId"
        );

    const componentName =
        getValue(
            component,
            "componentName",
            "ComponentName",
            "name",
            "Name"
        ) ||
        getValue(
            salaryComponent,
            "componentName",
            "ComponentName"
        ) ||
        "Salary Component";

    const componentCode =
        getValue(
            component,
            "componentCode",
            "ComponentCode"
        ) ||
        getValue(
            salaryComponent,
            "componentCode",
            "ComponentCode"
        ) ||
        "";

    const componentType =
        getValue(
            component,
            "componentType",
            "ComponentType"
        ) ||
        getValue(
            salaryComponent,
            "componentType",
            "ComponentType"
        ) ||
        "Earning";

    const calculationType =
        normalizeCalculationType(
            getValue(
                component,
                "calculationType",
                "CalculationType",
                "type",
                "Type"
            )
        );

    const calculationBasedOn =
        getValue(
            component,
            "calculationBasedOn",
            "CalculationBasedOn"
        );

    const value = Number(
        getValue(
            component,
            "value",
            "Value"
        ) || 0
    );

    const sequence = Number(
        getValue(
            component,
            "sequence",
            "Sequence"
        ) || index + 1
    );

    const isActive =
        getValue(
            component,
            "isActive",
            "IsActive"
        ) !== false;

    return {
        id:
            getValue(
                component,
                "payrollTemplateComponentId",
                "PayrollTemplateComponentId"
            ) ||
            salaryComponentId ||
            index + 1,

        payrollTemplateComponentId:
            getValue(
                component,
                "payrollTemplateComponentId",
                "PayrollTemplateComponentId"
            ),

        salaryComponentId,

        componentName,

        componentCode,

        componentType,

        calculationType,

        value,

        calculationBasedOn,

        sequence,

        isActive,
    };
};


/* =========================================================
   NORMALIZE PAYROLL TEMPLATE
========================================================= */

const normalizeTemplate = (
    template,
    index
) => {
    const components =
        getValue(
            template,
            "components",
            "Components"
        ) || [];

    const normalizedComponents =
        Array.isArray(components)
            ? components
                  .map(
                      normalizeTemplateComponent
                  )
                  .filter(
                      (component) =>
                          component.isActive
                  )
                  .sort(
                      (a, b) =>
                          a.sequence -
                          b.sequence
                  )
            : [];

    const templateId =
        getValue(
            template,
            "payrollTemplateId",
            "PayrollTemplateId",
            "id",
            "Id"
        );

    return {
        id:
            templateId !== null &&
            templateId !== undefined
                ? templateId
                : index + 1,

        templateName:
            getValue(
                template,
                "templateName",
                "TemplateName",
                "name",
                "Name"
            ) || "Unnamed Template",

        description:
            getValue(
                template,
                "description",
                "Description"
            ) || "",

        employeeType:
            getValue(
                template,
                "employeeType",
                "EmployeeType"
            ) || "Employee",

        payFrequency:
            getValue(
                template,
                "payFrequency",
                "PayFrequency"
            ) || "Monthly",

        currency:
            getValue(
                template,
                "currency",
                "Currency"
            ) || "INR",

        status:
            getValue(
                template,
                "status",
                "Status"
            ) || "Active",

        components:
            normalizedComponents,
    };
};


/* =========================================================
   NORMALIZE EMPLOYEE SALARY
========================================================= */

const normalizeAssignment = (
    assignment
) => {
    return {
        employeeSalaryId:
            getValue(
                assignment,
                "employeeSalaryId",
                "EmployeeSalaryId"
            ),

        employeeId:
            getValue(
                assignment,
                "employeeId",
                "EmployeeId"
            ),

        payrollTemplateId:
            getValue(
                assignment,
                "payrollTemplateId",
                "PayrollTemplateId"
            ),

        templateName:
            getValue(
                assignment,
                "templateName",
                "TemplateName"
            ) || "Unknown Template",

        annualCtc: Number(
            getValue(
                assignment,
                "annualCtc",
                "AnnualCtc"
            ) || 0
        ),

        monthlyCtc: Number(
            getValue(
                assignment,
                "monthlyCtc",
                "MonthlyCtc"
            ) ||
                Number(
                    getValue(
                        assignment,
                        "annualCtc",
                        "AnnualCtc"
                    ) || 0
                ) /
                    12
        ),

        effectiveFrom:
            getValue(
                assignment,
                "effectiveFrom",
                "EffectiveFrom"
            ),

        status:
            getValue(
                assignment,
                "status",
                "Status"
            ) || "Active",
    };
};


/* =========================================================
   CALCULATE TEMPLATE
   IMPORTANT:
   This follows PayrollCalculationService.cs

   Percentage:
      Base = Monthly CTC
      OR previous component when CalculationBasedOn
      contains a component code.

   Fixed Amount:
      Value is monthly amount.

   Balance:
      Backend currently does not support Balance.
========================================================= */

const calculateTemplate = (
    template,
    annualCtc
) => {
    /*
     * IMPORTANT:
     * Keep the frontend calculation aligned with PayrollCalculationService.cs.
     * A percentage component may be based on Monthly CTC, Annual CTC,
     * ComponentCode, or ComponentName.
     *
     * Example for Annual CTC = 240000:
     * Basic Salary = 50% of Monthly CTC = 10000
     * HRA = 20% of Basic Salary = 2000
     * Special Allowance = 10% of Basic Salary = 1000
     */
    const monthlyCtc = Number(annualCtc || 0) / 12;
    const components = Array.isArray(template?.components)
        ? template.components
        : [];

    const calculated = [];
    let grossSalary = 0;
    let totalDeductions = 0;

    const normalizeBaseName = (value) =>
        String(value ?? "").trim().toLowerCase();

    const roundMoney = (value) =>
        Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;

    for (const component of components) {
        let amount = 0;
        const calculationType = normalizeCalculationType(
            component.calculationType
        );

        if (calculationType === "Fixed Amount") {
            amount = Number(component.value) || 0;
        } else if (calculationType === "Percentage") {
            let baseAmount = monthlyCtc;
            const basedOn = normalizeBaseName(component.calculationBasedOn);

            // Annual CTC and Monthly CTC both resolve to monthly CTC.
            if (
                basedOn &&
                basedOn !== "monthly ctc" &&
                basedOn !== "annual ctc"
            ) {
                // IMPORTANT FIX:
                // The database stores values such as "Basic Salary" in
                // CalculationBasedOn, while ComponentCode is "BASIC_SALARY".
                // Match BOTH name and code so dependent components use the
                // correct previously calculated amount.
                const previous = calculated.find((item) => {
                    const componentCode = normalizeBaseName(item.componentCode);
                    const componentName = normalizeBaseName(item.componentName);
                    const salaryComponentId = normalizeBaseName(
                        item.salaryComponentId
                    );

                    return (
                        componentCode === basedOn ||
                        componentName === basedOn ||
                        salaryComponentId === basedOn
                    );
                });

                if (previous) {
                    baseAmount = previous.amount;
                }
            }

            amount = roundMoney(
                (baseAmount * Number(component.value || 0)) / 100
            );
        } else {
            // Formula / Balance / unsupported types currently match backend
            // behavior and produce zero.
            amount = 0;
        }

        amount = roundMoney(amount);

        const result = {
            ...component,
            amount,
        };

        calculated.push(result);

        if (
            String(component.componentType).trim().toLowerCase() ===
            "deduction"
        ) {
            totalDeductions += amount;
        } else {
            grossSalary += amount;
        }
    }

    grossSalary = roundMoney(grossSalary);
    totalDeductions = roundMoney(totalDeductions);

    const monthlyNetSalary = roundMoney(
        grossSalary - totalDeductions
    );

    return {
        components: calculated,
        earnings: calculated.filter(
            (component) =>
                String(component.componentType).trim().toLowerCase() !==
                "deduction"
        ),
        deductions: calculated.filter(
            (component) =>
                String(component.componentType).trim().toLowerCase() ===
                "deduction"
        ),
        monthlyCtc: roundMoney(monthlyCtc),
        monthlyGrossSalary: grossSalary,
        annualGrossSalary: roundMoney(grossSalary * 12),
        monthlyDeductions: totalDeductions,
        annualDeductions: roundMoney(totalDeductions * 12),
        monthlyNetSalary,
        annualNetSalary: roundMoney(monthlyNetSalary * 12),
    };
};


/* =========================================================
   COMPONENT
========================================================= */

function EmployeesPayroll() {
    const navigate = useNavigate();

    /* =====================================================
       PAGE
    ===================================================== */

    const [pageMode, setPageMode] =
        useState("list");

    /* =====================================================
       EMPLOYEES
    ===================================================== */

    const [employees, setEmployees] =
        useState([]);

    const [employeesLoading, setEmployeesLoading] =
        useState(true);

    const [employeesError, setEmployeesError] =
        useState("");

    /* =====================================================
       PAYROLL TEMPLATES
    ===================================================== */

    const [salaryTemplates, setSalaryTemplates] =
        useState([]);

    const [templatesLoading, setTemplatesLoading] =
        useState(true);

    const [templatesError, setTemplatesError] =
        useState("");

    /* =====================================================
       ASSIGNMENTS
    ===================================================== */

    const [assignments, setAssignments] =
        useState([]);

    const [assignmentsLoading, setAssignmentsLoading] =
        useState(true);

    const [assignmentsError, setAssignmentsError] =
        useState("");

    /* =====================================================
       FORM
    ===================================================== */

    const [selectedEmployeeId, setSelectedEmployeeId] =
        useState("");

    const [selectedTemplateId, setSelectedTemplateId] =
        useState("");

    const [annualCtc, setAnnualCtc] =
        useState("");

    const [editingEmployeeSalaryId, setEditingEmployeeSalaryId] =
        useState(null);

    const [search, setSearch] =
        useState("");

    const [viewAssignment, setViewAssignment] =
        useState(null);

    const [saving, setSaving] =
        useState(false);


    /* =========================================================
       LOAD EMPLOYEES
    ========================================================= */

    const loadEmployees = async () => {
        setEmployeesLoading(true);
        setEmployeesError("");

        try {
            const response =
                await axios.get(
                    EMPLOYEE_API
                );

            const data =
                response?.data;

            let employeeList = [];

            if (
                Array.isArray(data)
            ) {
                employeeList = data;
            } else if (
                Array.isArray(
                    data?.data
                )
            ) {
                employeeList =
                    data.data;
            } else if (
                Array.isArray(
                    data?.items
                )
            ) {
                employeeList =
                    data.items;
            } else if (
                Array.isArray(
                    data?.value
                )
            ) {
                employeeList =
                    data.value;
            }

            const normalized =
                employeeList.map(
                    normalizeEmployee
                );

            setEmployees(
                normalized
            );
        } catch (error) {
            console.error(
                "Employee API error:",
                error
            );

            setEmployees([]);

            setEmployeesError(
                error?.response
                    ?.data
                    ?.message ||
                    error?.message ||
                    "Unable to load employees."
            );
        } finally {
            setEmployeesLoading(
                false
            );
        }
    };


    /* =========================================================
       LOAD PAYROLL TEMPLATES
    ========================================================= */

    const loadTemplates = async () => {
        setTemplatesLoading(true);
        setTemplatesError("");

        try {
            // IMPORTANT: GET /PayrollTemplates returns only template
            // summary data and ComponentCount. The actual components
            // are returned by GET /PayrollTemplates/{id}.
            const response = await axios.get(
                PAYROLL_TEMPLATES_API
            );

            const data = response?.data;

            let templateList = [];

            if (Array.isArray(data)) {
                templateList = data;
            } else if (Array.isArray(data?.data)) {
                templateList = data.data;
            } else if (Array.isArray(data?.items)) {
                templateList = data.items;
            } else if (Array.isArray(data?.value)) {
                templateList = data.value;
            }

            const activeTemplates = templateList
                .map(normalizeTemplate)
                .filter(
                    (template) =>
                        String(template.status).toLowerCase() !==
                        "inactive"
                );

            if (activeTemplates.length === 0) {
                setSalaryTemplates([]);
                setTemplatesError(
                    "No active payroll templates found."
                );
                return;
            }

            // The list endpoint intentionally does not include Components.
            // Fetch the full template for every active template so Employee
            // Payroll can calculate and display the same structure as the
            // PayrollCalculationService.
            const detailedTemplates = await Promise.all(
                activeTemplates.map(async (template) => {
                    try {
                        const detailResponse = await axios.get(
                            `${PAYROLL_TEMPLATES_API}/${template.id}`
                        );

                        const detailData =
                            detailResponse?.data;

                        return normalizeTemplate(
                            detailData || template,
                            0
                        );
                    } catch (detailError) {
                        console.error(
                            `Unable to load payroll template ${template.id}:`,
                            detailError
                        );

                        // Keep the summary template in the dropdown even if
                        // one detail request fails. Its components will be
                        // empty rather than breaking the whole page.
                        return template;
                    }
                })
            );

            setSalaryTemplates(detailedTemplates);

            const templatesWithComponents =
                detailedTemplates.filter(
                    (template) =>
                        Array.isArray(template.components) &&
                        template.components.length > 0
                );

            if (templatesWithComponents.length === 0) {
                setTemplatesError(
                    "Payroll templates loaded, but no template components were returned. Check GET /api/PayrollTemplates/{id}."
                );
            }
        } catch (error) {
            console.error(
                "Payroll template API error:",
                error
            );

            setSalaryTemplates([]);

            setTemplatesError(
                error?.response?.data?.message ||
                    error?.message ||
                    "Unable to load payroll templates."
            );
        } finally {
            setTemplatesLoading(false);
        }
    };


    /* =========================================================
       LOAD EMPLOYEE SALARIES
    ========================================================= */

    const loadAssignments = async () => {
        setAssignmentsLoading(true);
        setAssignmentsError("");

        try {
            const response =
                await axios.get(
                    EMPLOYEE_SALARIES_API
                );

            const data =
                response?.data;

            const salaryList =
                Array.isArray(data)
                    ? data
                    : Array.isArray(
                          data?.data
                      )
                    ? data.data
                    : [];

            const normalized =
                salaryList.map(
                    normalizeAssignment
                );

            setAssignments(
                normalized
            );
        } catch (error) {
            console.error(
                "Employee salaries API error:",
                error
            );

            setAssignments([]);

            setAssignmentsError(
                error?.response
                    ?.data
                    ?.message ||
                    error?.message ||
                    "Unable to load employee salaries."
            );
        } finally {
            setAssignmentsLoading(
                false
            );
        }
    };


    /* =========================================================
       INITIAL LOAD
    ========================================================= */

    useEffect(() => {
        loadEmployees();
        loadTemplates();
        loadAssignments();
    }, []);


    /* =========================================================
       FILTER EMPLOYEES
    ========================================================= */

    const filteredEmployees =
        useMemo(() => {
            const value =
                String(search)
                    .trim()
                    .toLowerCase();

            if (!value) {
                return employees;
            }

            return employees.filter(
                (employee) =>
                    String(
                        employee.name
                    )
                        .toLowerCase()
                        .includes(value) ||
                    String(
                        employee.employeeId
                    )
                        .toLowerCase()
                        .includes(value) ||
                    String(
                        employee.department
                    )
                        .toLowerCase()
                        .includes(value)
            );
        }, [
            employees,
            search,
        ]);


    /* =========================================================
       FILTER ASSIGNMENTS
    ========================================================= */

    const filteredAssignments =
        useMemo(() => {
            const value =
                String(search)
                    .trim()
                    .toLowerCase();

            if (!value) {
                return assignments;
            }

            return assignments.filter(
                (assignment) => {
                    const employee =
                        employees.find(
                            (item) =>
                                String(item.id) ===
                                    String(assignment.employeeId) ||
                                String(item.employeeId) ===
                                    String(assignment.employeeId)
                        );

                    return (
                        String(
                            employee?.name ||
                                ""
                        )
                            .toLowerCase()
                            .includes(
                                value
                            ) ||
                        String(
                            employee?.employeeId ||
                                assignment.employeeId ||
                                ""
                        )
                            .toLowerCase()
                            .includes(
                                value
                            ) ||
                        String(
                            assignment.templateName ||
                                ""
                        )
                            .toLowerCase()
                            .includes(
                                value
                            )
                    );
                }
            );
        }, [
            assignments,
            employees,
            search,
        ]);


    /* =========================================================
       SELECTED EMPLOYEE
    ========================================================= */

    const selectedEmployee =
        employees.find(
            (employee) =>
                String(employee.id) ===
                    String(selectedEmployeeId) ||
                String(employee.employeeId) ===
                    String(selectedEmployeeId)
        );


    /* =========================================================
       SELECTED TEMPLATE
    ========================================================= */

    const selectedTemplate =
        salaryTemplates.find(
            (template) =>
                String(
                    template.id
                ) ===
                String(
                    selectedTemplateId
                )
        );


    /* =========================================================
       CALCULATED SALARY
    ========================================================= */

    const calculatedSalary =
        useMemo(() => {
            if (
                !selectedTemplate ||
                Number(annualCtc) <= 0
            ) {
                return {
                    components: [],
                    earnings: [],
                    deductions: [],
                    monthlyCtc: 0,
                    monthlyGrossSalary: 0,
                    annualGrossSalary: 0,
                    monthlyDeductions: 0,
                    annualDeductions: 0,
                    monthlyNetSalary: 0,
                    annualNetSalary: 0,
                };
            }

            return calculateTemplate(
                selectedTemplate,
                Number(annualCtc)
            );
        }, [
            selectedTemplate,
            annualCtc,
        ]);


    /* =========================================================
       OPEN ASSIGN
    ========================================================= */

    const handleOpenAssign = () => {
        setPageMode("form");

        setSelectedEmployeeId(
            ""
        );

        setSelectedTemplateId(
            ""
        );

        setAnnualCtc("");

        setEditingEmployeeSalaryId(
            null
        );

        setSearch("");
    };


    /* =========================================================
       EDIT
    ========================================================= */

    const handleEdit = (
        assignment
    ) => {
        setEditingEmployeeSalaryId(
            assignment.employeeSalaryId
        );

        setSelectedEmployeeId(
            assignment.employeeId
        );

        setSelectedTemplateId(
            assignment.payrollTemplateId
        );

        setAnnualCtc(
            assignment.annualCtc
        );

        setSearch("");

        setPageMode("form");
    };


    /* =========================================================
       VIEW
    ========================================================= */

    const handleView = (
        assignment
    ) => {
        const employee =
            employees.find(
                (item) =>
                    String(item.id) ===
                        String(assignment.employeeId) ||
                    String(item.employeeId) ===
                        String(assignment.employeeId)
            );

        const template =
            salaryTemplates.find(
                (item) =>
                    String(
                        item.id
                    ) ===
                    String(
                        assignment.payrollTemplateId
                    )
            );

        const calculated =
            template && Number(assignment.annualCtc) > 0
                ? calculateTemplate(
                      template,
                      Number(assignment.annualCtc)
                  )
                : null;

        setViewAssignment({
            ...assignment,
            employeeName:
                employee?.name ||
                "Unknown Employee",
            employeeDisplayId:
                employee?.employeeId ||
                assignment.employeeId,
            department:
                employee?.department ||
                "",
            designation:
                employee?.designation ||
                "",
            template:
                template || null,
            ...(calculated || {}),
        });
    };


    /* =========================================================
       SAVE
    ========================================================= */

    const handleSave = async () => {
        if (!selectedEmployee) {
            alert(
                "Please select an employee."
            );
            return;
        }

        if (!selectedTemplate) {
            alert(
                "Please select a payroll template."
            );
            return;
        }

        const ctc =
            Number(annualCtc);

        if (
            !ctc ||
            ctc <= 0
        ) {
            alert(
                "Please enter a valid Annual CTC."
            );
            return;
        }

        setSaving(true);

        try {
            /*
             * IMPORTANT:
             *
             * Employee Payroll does NOT send
             * salary components.
             *
             * Components belong to the
             * Payroll Template.
             *
             * Employee Payroll only stores:
             * EmployeeId
             * PayrollTemplateId
             * AnnualCtc
             * EffectiveFrom
             */

            const payload = {
                employeeId:
                    Number(
                        selectedEmployee.id
                    ),

                payrollTemplateId:
                    Number(
                        selectedTemplate.id
                    ),

                annualCtc: ctc,

                effectiveFrom:
                    new Date().toISOString(),
            };

            if (
                editingEmployeeSalaryId
            ) {
                await axios.put(
                    `${EMPLOYEE_SALARIES_API}/${editingEmployeeSalaryId}`,
                    payload
                );

                alert(
                    `Payroll updated successfully for ${selectedEmployee.name}.`
                );
            } else {
                await axios.post(
                    EMPLOYEE_SALARIES_API,
                    payload
                );

                alert(
                    `Payroll assigned successfully to ${selectedEmployee.name}.`
                );
            }

            await loadAssignments();

            setPageMode("list");

            setSelectedEmployeeId(
                ""
            );

            setSelectedTemplateId(
                ""
            );

            setAnnualCtc("");

            setEditingEmployeeSalaryId(
                null
            );

            setSearch("");
        } catch (error) {
            console.error(
                "Save employee salary error:",
                error
            );

            const message =
                error?.response
                    ?.data
                    ?.message ||
                error?.response
                    ?.data ||
                error?.message ||
                "Unable to save employee salary.";

            alert(
                typeof message ===
                    "string"
                    ? message
                    : "Unable to save employee salary."
            );
        } finally {
            setSaving(false);
        }
    };

const handleDelete = async (assignment) => {
    const employeeSalaryId =
        assignment.employeeSalaryId ??
        assignment.EmployeeSalaryId;

    if (!employeeSalaryId) {
        console.error("Employee Salary ID not found:", assignment);
        alert("Employee salary assignment ID was not found.");
        return;
    }

    const employeeName =
        assignment.employeeName ||
        assignment.EmployeeName ||
        "this employee";

    const confirmed = window.confirm(
        `Are you sure you want to delete the payroll assignment for ${employeeName}?`
    );

    if (!confirmed) return;

    try {
        await axios.delete(
            `http://localhost:5111/api/EmployeeSalaries/${employeeSalaryId}`
        );

        // Remove the deleted assignment from the table
        setAssignments((prev) =>
            prev.filter(
                (item) =>
                    (item.employeeSalaryId ??
                        item.EmployeeSalaryId) !== employeeSalaryId
            )
        );

        alert("Employee payroll deleted successfully.");
    } catch (error) {
        console.error("Error deleting employee payroll:", error);

        alert(
            error.response?.data?.message ||
            "Failed to delete employee payroll."
        );
    }
};
    /* =========================================================
       BACK
    ========================================================= */

    const handleBackToList =
        () => {
            setPageMode("list");

            setSelectedEmployeeId(
                ""
            );

            setSelectedTemplateId(
                ""
            );

            setAnnualCtc("");

            setEditingEmployeeSalaryId(
                null
            );

            setSearch("");
        };


    /* =========================================================
       FORM PAGE
    ========================================================= */

    if (
        pageMode ===
        "form"
    ) {
        return (
            <Box className="epr-employees-payroll-page">

                {/* HEADER */}

                <Box className="epr-employees-payroll-header">

                    <Box className="epr-employees-payroll-title-wrapper">

                        <IconButton
                            className="epr-employees-payroll-back"
                            onClick={
                                handleBackToList
                            }
                        >
                            <ArrowBackIcon />
                        </IconButton>

                        <Box>

                            <Typography className="epr-employees-payroll-title">
                                {editingEmployeeSalaryId
                                    ? "Edit Employee Payroll"
                                    : "Assign Employee Payroll"}
                            </Typography>

                            <Typography className="epr-employees-payroll-subtitle">
                                Select an employee, choose a payroll template and enter Annual CTC.
                            </Typography>

                        </Box>

                    </Box>


                    <Button
                        variant="contained"
                        startIcon={
                            saving ? (
                                <CircularProgress
                                    size={18}
                                    color="inherit"
                                />
                            ) : (
                                <SaveOutlinedIcon />
                            )
                        }
                        className="epr-employees-payroll-save-button"
                        onClick={
                            handleSave
                        }
                        disabled={
                            saving
                        }
                    >
                        {saving
                            ? "Saving..."
                            : editingEmployeeSalaryId
                            ? "Update Payroll"
                            : "Save Payroll"}
                    </Button>

                </Box>


                {/* EMPLOYEE + TEMPLATE */}

                <Card className="epr-employees-payroll-card">

                    <CardContent>

                        <Box className="epr-section-heading">

                            <Box className="epr-section-heading-icon">
                                <SearchIcon />
                            </Box>

                            <Box>

                                <Typography className="epr-section-title">
                                    Assign Payroll
                                </Typography>

                                <Typography className="epr-section-description">
                                    Select an employee, choose a payslip template and enter their Annual CTC.
                                </Typography>

                            </Box>

                        </Box>


                        <Box className="epr-employee-selection-grid">

                            {/* SEARCH EMPLOYEE */}

                            <TextField
                                fullWidth
                                label="Search Employee"
                                placeholder="Search by name, ID or department"
                                value={search}
                                onChange={(
                                    event
                                ) =>
                                    setSearch(
                                        event
                                            .target
                                            .value
                                    )
                                }
                            />


                            {/* EMPLOYEE */}

                            <FormControl
                                fullWidth
                            >

                                <InputLabel>
                                    Employee
                                </InputLabel>

                                <Select
                                    value={
                                        selectedEmployeeId
                                    }
                                    label="Employee"
                                    onChange={(
                                        event
                                    ) =>
                                        setSelectedEmployeeId(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                >

                                    <MenuItem value="">
                                        Select Employee
                                    </MenuItem>

                                    {employeesLoading && (
                                        <MenuItem disabled>
                                            Loading employees...
                                        </MenuItem>
                                    )}

                                    {!employeesLoading &&
                                        filteredEmployees.map(
                                            (
                                                employee
                                            ) => (
                                                <MenuItem
                                                    key={
                                                        employee.id
                                                    }
                                                    value={
                                                        employee.id
                                                    }
                                                >
                                                    {
                                                        employee.name
                                                    }{" "}
                                                    -{" "}
                                                    {
                                                        employee.employeeId
                                                    }
                                                </MenuItem>
                                            )
                                        )}

                                </Select>

                            </FormControl>


                            {/* TEMPLATE */}

                            <FormControl
                                fullWidth
                            >

                                <InputLabel>
                                    Payslip Template
                                </InputLabel>

                                <Select
                                    value={
                                        selectedTemplateId
                                    }
                                    label="Payslip Template"
                                    onChange={(
                                        event
                                    ) =>
                                        setSelectedTemplateId(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                >

                                    <MenuItem value="">
                                        Select Payslip Template
                                    </MenuItem>

                                    {templatesLoading && (
                                        <MenuItem disabled>
                                            Loading templates...
                                        </MenuItem>
                                    )}

                                    {!templatesLoading &&
                                        salaryTemplates.map(
                                            (
                                                template
                                            ) => (
                                                <MenuItem
                                                    key={
                                                        template.id
                                                    }
                                                    value={
                                                        template.id
                                                    }
                                                >
                                                    {
                                                        template.templateName
                                                    }
                                                </MenuItem>
                                            )
                                        )}

                                </Select>

                            </FormControl>


                            {/* ANNUAL CTC */}

                            <TextField
                                fullWidth
                                type="number"
                                label="Annual CTC"
                                placeholder="e.g. 240000"
                                value={
                                    annualCtc
                                }
                                onChange={(
                                    event
                                ) =>
                                    setAnnualCtc(
                                        event
                                            .target
                                            .value
                                    )
                                }
                                inputProps={{
                                    min: 0,
                                }}
                                helperText="The selected template will calculate earnings and deductions automatically."
                            />

                        </Box>


                        {employeesError && (
                            <Typography
                                sx={{
                                    mt: 2,
                                    color: "error.main",
                                }}
                            >
                                {employeesError}
                            </Typography>
                        )}


                        {templatesError && (
                            <Typography
                                sx={{
                                    mt: 1,
                                    color: "error.main",
                                }}
                            >
                                {templatesError}
                            </Typography>
                        )}

                        {selectedTemplate &&
                            !templatesLoading &&
                            selectedTemplate.components.length === 0 && (
                                <Typography
                                    sx={{
                                        mt: 1,
                                        color: "warning.main",
                                    }}
                                >
                                    This template has no active salary components loaded.
                                    Please verify the template detail endpoint.
                                </Typography>
                            )}


                        {/* EMPLOYEE DETAILS */}

                        {selectedEmployee && (
                            <Box className="epr-employee-details">

                                <Box className="epr-employee-avatar">
                                    {selectedEmployee.name
                                        .charAt(
                                            0
                                        )
                                        .toUpperCase()}
                                </Box>

                                <Box>

                                    <Typography className="epr-employee-name">
                                        {
                                            selectedEmployee.name
                                        }
                                    </Typography>

                                    <Typography className="epr-employee-meta">
                                        Employee ID:{" "}
                                        {
                                            selectedEmployee.employeeId
                                        }
                                    </Typography>

                                    <Typography className="epr-employee-meta">
                                        {
                                            selectedEmployee.department
                                        }{" "}
                                        •{" "}
                                        {
                                            selectedEmployee.designation
                                        }
                                    </Typography>

                                </Box>

                            </Box>
                        )}

                    </CardContent>

                </Card>


                {/* CALCULATED PAYROLL */}

                {selectedTemplate &&
                    Number(
                        annualCtc
                    ) > 0 && (

                        <Box className="epr-payroll-content-grid">

                            <Box>

                                {/* TEMPLATE */}

                                <Card className="epr-employees-payroll-card">

                                    <CardContent>

                                        <Box className="epr-section-heading">

                                            <Box className="epr-section-heading-icon epr-green">
                                                <AccountBalanceWalletOutlinedIcon />
                                            </Box>

                                            <Box>

                                                <Typography className="epr-section-title">
                                                    {
                                                        selectedTemplate.templateName
                                                    }
                                                </Typography>

                                                <Typography className="epr-section-description">
                                                    Salary structure imported from the selected payslip template.
                                                </Typography>

                                            </Box>

                                        </Box>


                                        <Box className="epr-template-info-bar">

                                            <Box>

                                                <Typography className="epr-template-info-label">
                                                    Annual CTC
                                                </Typography>

                                                <Typography className="epr-template-info-value">
                                                    {formatCurrency(
                                                        annualCtc
                                                    )}
                                                </Typography>

                                            </Box>


                                            <Box>

                                                <Typography className="epr-template-info-label">
                                                    Monthly CTC
                                                </Typography>

                                                <Typography className="epr-template-info-value">
                                                    {formatCurrency(
                                                        calculatedSalary.monthlyCtc
                                                    )}
                                                </Typography>

                                            </Box>

                                        </Box>

                                    </CardContent>

                                </Card>


                                {/* EARNINGS */}

                                <Card className="epr-employees-payroll-card">

                                    <CardContent>

                                        <Box className="epr-section-heading">

                                            <Box className="epr-section-heading-icon epr-green">
                                                <AccountBalanceWalletOutlinedIcon />
                                            </Box>

                                            <Box>

                                                <Typography className="epr-section-title">
                                                    Earnings
                                                </Typography>

                                                <Typography className="epr-section-description">
                                                    Imported automatically from the selected payslip template.
                                                </Typography>

                                            </Box>

                                        </Box>


                                        <Box className="epr-earnings-header">

                                            <Typography>
                                                Component
                                            </Typography>

                                            <Typography>
                                                Calculation
                                            </Typography>

                                            <Typography>
                                                Template Value
                                            </Typography>

                                            <Typography>
                                                Monthly Amount
                                            </Typography>

                                        </Box>


                                        <Box className="epr-earnings-list">

                                            {calculatedSalary.earnings.map(
                                                (
                                                    earning
                                                ) => (
                                                    <Box
                                                        className="epr-earning-row"
                                                        key={
                                                            earning.id
                                                        }
                                                    >

                                                        <Box>

                                                            <Typography className="epr-component-name">
                                                                {
                                                                    earning.componentName
                                                                }
                                                            </Typography>

                                                            {earning.calculationBasedOn && (
                                                                <Typography
                                                                    sx={{
                                                                        fontSize:
                                                                            "12px",
                                                                        color:
                                                                            "#718096",
                                                                    }}
                                                                >
                                                                    Based on:{" "}
                                                                    {
                                                                        earning.calculationBasedOn
                                                                    }
                                                                </Typography>
                                                            )}

                                                        </Box>


                                                        <span className="epr-calculation-badge">
                                                            {
                                                                earning.calculationType
                                                            }
                                                        </span>


                                                        <Typography className="epr-template-value">

                                                            {earning.calculationType ===
                                                            "Percentage"
                                                                ? `${earning.value}%`
                                                                : formatCurrency(
                                                                      earning.value
                                                                  )}

                                                        </Typography>


                                                        <Typography className="epr-calculated-value">

                                                            {formatCurrency(
                                                                earning.amount
                                                            )}

                                                        </Typography>

                                                    </Box>
                                                )
                                            )}

                                            {calculatedSalary.earnings.length ===
                                                0 && (
                                                <Box className="epr-empty-deduction-state">
                                                    No earnings configured in this template.
                                                </Box>
                                            )}

                                        </Box>

                                    </CardContent>

                                </Card>


                                {/* DEDUCTIONS */}

                                <Card className="epr-employees-payroll-card">

                                    <CardContent>

                                        <Box className="epr-section-heading">

                                            <Box className="epr-section-heading-icon epr-deduction">
                                                %
                                            </Box>

                                            <Box>

                                                <Typography className="epr-section-title">
                                                    Deductions
                                                </Typography>

                                                <Typography className="epr-section-description">
                                                    Imported automatically from the selected payslip template.
                                                </Typography>

                                            </Box>

                                        </Box>


                                        <Box className="epr-earnings-header">

                                            <Typography>
                                                Component
                                            </Typography>

                                            <Typography>
                                                Calculation
                                            </Typography>

                                            <Typography>
                                                Template Value
                                            </Typography>

                                            <Typography>
                                                Monthly Deduction
                                            </Typography>

                                        </Box>


                                        <Box className="epr-earnings-list">

                                            {calculatedSalary.deductions.length ===
                                            0 ? (
                                                <Box className="epr-empty-deduction-state">
                                                    No deductions configured in this template.
                                                </Box>
                                            ) : (
                                                calculatedSalary.deductions.map(
                                                    (
                                                        deduction
                                                    ) => (
                                                        <Box
                                                            className="epr-earning-row"
                                                            key={
                                                                deduction.id
                                                            }
                                                        >

                                                            <Box>

                                                                <Typography className="epr-component-name">
                                                                    {
                                                                        deduction.componentName
                                                                    }
                                                                </Typography>

                                                                {deduction.calculationBasedOn && (
                                                                    <Typography
                                                                        sx={{
                                                                            fontSize:
                                                                                "12px",
                                                                            color:
                                                                                "#718096",
                                                                        }}
                                                                    >
                                                                        Based on:{" "}
                                                                        {
                                                                            deduction.calculationBasedOn
                                                                        }
                                                                    </Typography>
                                                                )}

                                                            </Box>


                                                            <span className="epr-calculation-badge epr-deduction-badge">
                                                                {
                                                                    deduction.calculationType
                                                                }
                                                            </span>


                                                            <Typography className="epr-template-value">

                                                                {deduction.calculationType ===
                                                                "Percentage"
                                                                    ? `${deduction.value}%`
                                                                    : formatCurrency(
                                                                          deduction.value
                                                                      )}

                                                            </Typography>


                                                            <Typography className="epr-calculated-value epr-deduction-value">

                                                                {formatCurrency(
                                                                    deduction.amount
                                                                )}

                                                            </Typography>

                                                        </Box>
                                                    )
                                                )
                                            )}

                                        </Box>

                                    </CardContent>

                                </Card>

                            </Box>


                            {/* SUMMARY */}

                            <Card className="epr-employees-payroll-card epr-salary-summary-card">

                                <CardContent>

                                    <Typography className="epr-summary-title">
                                        Salary Summary
                                    </Typography>

                                    <Typography className="epr-summary-description">
                                        Calculated automatically from the selected template.
                                    </Typography>


                                    <Box className="epr-summary-items">

                                        <Box className="epr-summary-item">

                                            <Typography>
                                                Annual CTC
                                            </Typography>

                                            <Typography className="epr-summary-value">
                                                {formatCurrency(
                                                    annualCtc
                                                )}
                                            </Typography>

                                        </Box>


                                        <Box className="epr-summary-item">

                                            <Typography>
                                                Monthly CTC
                                            </Typography>

                                            <Typography className="epr-summary-value">
                                                {formatCurrency(
                                                    calculatedSalary.monthlyCtc
                                                )}
                                            </Typography>

                                        </Box>


                                        <Box className="epr-summary-item">

                                            <Typography>
                                                Monthly Gross Salary
                                            </Typography>

                                            <Typography className="epr-summary-value">
                                                {formatCurrency(
                                                    calculatedSalary.monthlyGrossSalary
                                                )}
                                            </Typography>

                                        </Box>


                                        <Box className="epr-summary-item">

                                            <Typography>
                                                Annual Gross Salary
                                            </Typography>

                                            <Typography className="epr-summary-value">
                                                {formatCurrency(
                                                    calculatedSalary.annualGrossSalary
                                                )}
                                            </Typography>

                                        </Box>


                                        <Box className="epr-summary-divider" />


                                        <Box className="epr-summary-item">

                                            <Typography>
                                                Monthly Deductions
                                            </Typography>

                                            <Typography className="epr-summary-value epr-deduction-summary">
                                                -
                                                {formatCurrency(
                                                    calculatedSalary.monthlyDeductions
                                                )}
                                            </Typography>

                                        </Box>


                                        <Box className="epr-summary-item">

                                            <Typography>
                                                Annual Deductions
                                            </Typography>

                                            <Typography className="epr-summary-value epr-deduction-summary">
                                                -
                                                {formatCurrency(
                                                    calculatedSalary.annualDeductions
                                                )}
                                            </Typography>

                                        </Box>


                                        <Box className="epr-summary-divider" />


                                        <Box className="epr-summary-item">

                                            <Typography className="epr-summary-total-label">
                                                Monthly Net Salary
                                            </Typography>

                                            <Typography className="epr-summary-total">
                                                {formatCurrency(
                                                    calculatedSalary.monthlyNetSalary
                                                )}
                                            </Typography>

                                        </Box>


                                        <Box className="epr-summary-item">

                                            <Typography className="epr-summary-total-label">
                                                Annual Net Salary
                                            </Typography>

                                            <Typography className="epr-summary-total">
                                                {formatCurrency(
                                                    calculatedSalary.annualNetSalary
                                                )}
                                            </Typography>

                                        </Box>

                                    </Box>


                                    <Box className="epr-deduction-note">

                                        <Typography className="epr-deduction-note-title">
                                            Template Controlled
                                        </Typography>

                                        <Typography>
                                            Earnings and deductions are imported from the selected payroll template. Employee Payroll only stores the employee, template and Annual CTC.
                                        </Typography>

                                    </Box>

                                </CardContent>

                            </Card>

                        </Box>
                    )}

            </Box>
        );
    }


    /* =========================================================
       LIST PAGE
    ========================================================= */

    return (
        <Box className="epr-employees-payroll-page">

            {/* HEADER */}

            <Box className="epr-employees-payroll-header">

                <Box className="epr-employees-payroll-title-wrapper">

                    <IconButton
                        className="epr-employees-payroll-back"
                        onClick={() =>
                            navigate(
                                "/payroll"
                            )
                        }
                    >
                        <ArrowBackIcon />
                    </IconButton>

                    <Box>

                        <Typography className="epr-employees-payroll-title">
                            Employees Payroll
                        </Typography>

                        <Typography className="epr-employees-payroll-subtitle">
                            Assign and manage salary structures for employees.
                        </Typography>

                    </Box>

                </Box>


                <Button
                    variant="contained"
                    className="epr-employees-payroll-assign-button"
                    onClick={
                        handleOpenAssign
                    }
                >
                    Assign Salary
                </Button>

            </Box>


            {/* LIST */}

            <Card className="epr-employees-payroll-card epr-employees-payroll-list-card">

                <CardContent>

                    <Box className="epr-employees-payroll-list-toolbar">

                        <TextField
                            fullWidth
                            value={search}
                            onChange={(
                                event
                            ) =>
                                setSearch(
                                    event
                                        .target
                                        .value
                                )
                            }
                            placeholder="Search employee..."
                            InputProps={{
                                startAdornment: (
                                    <SearchIcon className="epr-table-search-icon" />
                                ),
                            }}
                        />


                        <Button
                            variant="contained"
                            className="epr-employees-payroll-assign-button epr-toolbar-button"
                            onClick={
                                handleOpenAssign
                            }
                        >
                            Assign Salary
                        </Button>

                    </Box>


                    {assignmentsError && (
                        <Typography
                            sx={{
                                color: "error.main",
                                mb: 2,
                            }}
                        >
                            {assignmentsError}
                        </Typography>
                    )}


                    {/* TABLE */}

                    <Box className="epr-assigned-payroll-table-wrapper">

                        <table className="epr-assigned-payroll-table">

                            <thead>

                                <tr>

                                    <th>
                                        Employee
                                    </th>

                                    <th>
                                        Employee ID
                                    </th>

                                    <th>
                                        Payslip
                                    </th>

                                    <th>
                                        Annual CTC
                                    </th>

                                    <th>
                                        Actions
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {assignmentsLoading ? (

                                    <tr>

                                        <td
                                            colSpan="5"
                                            className="epr-empty-table-state"
                                        >
                                            <CircularProgress
                                                size={28}
                                            />

                                            <Typography
                                                sx={{
                                                    mt: 1,
                                                }}
                                            >
                                                Loading employee payroll...
                                            </Typography>

                                        </td>

                                    </tr>

                                ) : filteredAssignments.length ===
                                  0 ? (

                                    <tr>

                                        <td
                                            colSpan="5"
                                            className="epr-empty-table-state"
                                        >

                                            <Typography>
                                                No payroll assignments found.
                                            </Typography>

                                            <Typography className="epr-empty-table-helper">
                                                Click "Assign Salary" to assign a payroll template to an employee.
                                            </Typography>

                                        </td>

                                    </tr>

                                ) : (

                                    filteredAssignments.map(
                                        (
                                            assignment
                                        ) => {

                                            const employee =
                                                employees.find(
                                                    (
                                                        item
                                                    ) =>
                                                        String(
                                                            item.id
                                                        ) ===
                                                        String(
                                                            assignment.employeeId
                                                        )
                                                );

                                            return (
                                                <tr
                                                    key={
                                                        assignment.employeeSalaryId
                                                    }
                                                >

                                                    {/* EMPLOYEE */}

                                                    <td>

                                                        <Box className="epr-table-employee">

                                                            <Box className="epr-table-avatar">

                                                                {String(
                                                                    employee?.name ||
                                                                        "E"
                                                                )
                                                                    .charAt(
                                                                        0
                                                                    )
                                                                    .toUpperCase()}

                                                            </Box>


                                                            <Box>

                                                                <Typography className="epr-table-employee-name">
                                                                    {
                                                                        employee?.name ||
                                                                        "Unknown Employee"
                                                                    }
                                                                </Typography>

                                                                <Typography className="epr-table-employee-meta">
                                                                    {
                                                                        employee?.designation ||
                                                                        ""
                                                                    }
                                                                </Typography>

                                                            </Box>

                                                        </Box>

                                                    </td>


                                                    {/* EMPLOYEE ID */}

                                                    <td>

                                                        <Typography className="epr-table-id">
                                                            {
                                                                employee?.employeeId ||
                                                                assignment.employeeId
                                                            }
                                                        </Typography>

                                                    </td>


                                                    {/* TEMPLATE */}

                                                    <td>

                                                        <span className="epr-template-badge">
                                                            {
                                                                assignment.templateName
                                                            }
                                                        </span>

                                                    </td>


                                                    {/* CTC */}

                                                    <td>

                                                        <Typography className="epr-table-ctc">
                                                            {formatCurrency(
                                                                assignment.annualCtc
                                                            )}
                                                        </Typography>

                                                    </td>


                                                    {/* ACTIONS */}

                                                    <td>

                                                        <Box className="epr-table-actions">

                                                            <Button
                                                                className="epr-table-action-button epr-view-button"
                                                                onClick={() =>
                                                                    handleView(
                                                                        assignment
                                                                    )
                                                                }
                                                            >
                                                                View
                                                            </Button>


                                                            <Button
                                                                className="epr-table-action-button epr-edit-button"
                                                                onClick={() =>
                                                                    handleEdit(
                                                                        assignment
                                                                    )
                                                                }
                                                            >
                                                                Edit
                                                            </Button>
<Button
    className="epr-table-action-button epr-delete-button"
    onClick={() => handleDelete(assignment)}
>
    Delete
</Button>
                                                        </Box>

                                                    </td>

                                                </tr>
                                            );
                                        }
                                    )
                                )}

                            </tbody>

                        </table>

                    </Box>

                </CardContent>

            </Card>


            {/* =====================================================
                VIEW DIALOG
            ===================================================== */}

            <Dialog
                open={
                    Boolean(
                        viewAssignment
                    )
                }
                onClose={() =>
                    setViewAssignment(
                        null
                    )
                }
                fullWidth
                maxWidth="md"
            >

                <DialogTitle className="epr-view-dialog-title">
                    Employee Payroll Details
                </DialogTitle>


                <DialogContent>

                    {viewAssignment && (
                        <Box>

                            {/* EMPLOYEE */}

                            <Box className="epr-view-employee-header">

                                <Box className="epr-view-avatar">
                                    {viewAssignment.employeeName
                                        .charAt(
                                            0
                                        )
                                        .toUpperCase()}
                                </Box>

                                <Box>

                                    <Typography className="epr-view-employee-name">
                                        {
                                            viewAssignment.employeeName
                                        }
                                    </Typography>

                                    <Typography className="epr-view-employee-meta">
                                        Employee ID:{" "}
                                        {
                                            viewAssignment.employeeDisplayId
                                        }
                                    </Typography>

                                    <Typography className="epr-view-employee-meta">
                                        {
                                            viewAssignment.department
                                        }{" "}
                                        •{" "}
                                        {
                                            viewAssignment.designation
                                        }
                                    </Typography>

                                </Box>

                            </Box>


                            {/* SUMMARY */}

                            <Box className="epr-view-summary-grid">

                                <Box className="epr-view-summary-box">

                                    <Typography>
                                        Payslip Template
                                    </Typography>

                                    <strong>
                                        {
                                            viewAssignment.templateName
                                        }
                                    </strong>

                                </Box>


                                <Box className="epr-view-summary-box">

                                    <Typography>
                                        Annual CTC
                                    </Typography>

                                    <strong>
                                        {formatCurrency(
                                            viewAssignment.annualCtc
                                        )}
                                    </strong>

                                </Box>


                                <Box className="epr-view-summary-box">

                                    <Typography>
                                        Monthly Gross
                                    </Typography>

                                    <strong>
                                        {formatCurrency(
                                            viewAssignment.monthlyGrossSalary
                                        )}
                                    </strong>

                                </Box>


                                <Box className="epr-view-summary-box">

                                    <Typography>
                                        Monthly Net
                                    </Typography>

                                    <strong>
                                        {formatCurrency(
                                            viewAssignment.monthlyNetSalary
                                        )}
                                    </strong>

                                </Box>

                            </Box>


                            {/* EARNINGS */}

                            <Typography className="epr-view-section-title">
                                Earnings
                            </Typography>


                            <Box className="epr-view-component-list">

                                {(
                                    viewAssignment.earnings ||
                                    []
                                ).map(
                                    (
                                        earning
                                    ) => (
                                        <Box
                                            className="epr-view-component-row"
                                            key={
                                                earning.id
                                            }
                                        >

                                            <Typography>
                                                {
                                                    earning.componentName
                                                }
                                            </Typography>

                                            <Typography>
                                                {earning.calculationType ===
                                                "Percentage"
                                                    ? `${earning.value}%`
                                                    : formatCurrency(
                                                          earning.value
                                                      )}
                                            </Typography>

                                            <strong>
                                                {formatCurrency(
                                                    earning.amount
                                                )}
                                            </strong>

                                        </Box>
                                    )
                                )}

                            </Box>


                            {/* DEDUCTIONS */}

                            <Typography className="epr-view-section-title">
                                Deductions
                            </Typography>


                            <Box className="epr-view-component-list">

                                {(
                                    viewAssignment.deductions ||
                                    []
                                ).length ===
                                0 ? (

                                    <Typography className="epr-view-empty">
                                        No deductions.
                                    </Typography>

                                ) : (

                                    viewAssignment.deductions.map(
                                        (
                                            deduction
                                        ) => (
                                            <Box
                                                className="epr-view-component-row epr-deduction-view-row"
                                                key={
                                                    deduction.id
                                                }
                                            >

                                                <Typography>
                                                    {
                                                        deduction.componentName
                                                    }
                                                </Typography>

                                                <Typography>
                                                    {deduction.calculationType ===
                                                    "Percentage"
                                                        ? `${deduction.value}%`
                                                        : formatCurrency(
                                                              deduction.value
                                                          )}
                                                </Typography>

                                                <strong>
                                                    -
                                                    {formatCurrency(
                                                        deduction.amount
                                                    )}
                                                </strong>

                                            </Box>
                                        )
                                    )
                                )}

                            </Box>

                        </Box>
                    )}

                </DialogContent>


                <DialogActions>

                    <Button
                        onClick={() =>
                            setViewAssignment(
                                null
                            )
                        }
                    >
                        Close
                    </Button>


                    {viewAssignment && (
                        <Button
                            variant="contained"
                            onClick={() => {

                                handleEdit(
                                    viewAssignment
                                );

                                setViewAssignment(
                                    null
                                );

                            }}
                        >
                            Edit Payroll
                        </Button>
                    )}

                </DialogActions>

            </Dialog>

        </Box>
    );
}


export default EmployeesPayroll;