import React, { useEffect, useMemo, useState } from "react";
import {
    Box,
    Button,
    Card,
    Divider,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";

import { useLocation, useNavigate } from "react-router-dom";

import "./CreatePayslipTemplate.css";

const API_BASE_URL = "http://localhost:5111/api";

/* ============================================================
   FALLBACK SALARY COMPONENTS
   ============================================================ */

const FALLBACK_SALARY_COMPONENTS = [
    {
        salaryComponentId: "1",
        componentName: "Basic Salary",
        componentCode: "BASIC",
        componentType: "Earning",
        calculationType: "Percentage",
        isActive: true,
    },
    {
        salaryComponentId: "2",
        componentName: "House Rent Allowance",
        componentCode: "HRA",
        componentType: "Earning",
        calculationType: "Percentage",
        isActive: true,
    },
    {
        salaryComponentId: "3",
        componentName: "Special Allowance",
        componentCode: "SPECIAL",
        componentType: "Earning",
        calculationType: "Percentage",
        isActive: true,
    },
    {
        salaryComponentId: "4",
        componentName: "Provident Fund",
        componentCode: "PF",
        componentType: "Deduction",
        calculationType: "Percentage",
        isActive: true,
    },
    {
        salaryComponentId: "5",
        componentName: "Professional Tax",
        componentCode: "PT",
        componentType: "Deduction",
        calculationType: "Fixed",
        isActive: true,
    },
    {
        salaryComponentId: "6",
        componentName: "Transport Allowance",
        componentCode: "TA",
        componentType: "Earning",
        calculationType: "Percentage",
        isActive: true,
    },
];

/* ============================================================
   EMPTY COMPONENT
   ============================================================ */

const createEmptyComponent = (kind, id) => ({
    id,
    salaryComponentId: "",
    calculationType: "Percentage",
    value: 0,
    calculationBasedOn:
        kind === "Earning" ? "Annual CTC" : "Basic Salary",
    sequence: 1,
    kind,
});

/* ============================================================
   COMPONENT SELECT DISPLAY
   ============================================================ */

const ComponentValue = ({ component }) => {
    if (!component) {
        return (
            <Typography className="cpt-component-select-placeholder">
                Select component
            </Typography>
        );
    }

    return (
        <Box className="cpt-component-select-value">
            <Typography className="cpt-component-select-name">
                {component.componentName}
            </Typography>

            <Typography className="cpt-component-select-code">
                {component.componentCode}
            </Typography>
        </Box>
    );
};

/* ============================================================
   MAIN COMPONENT
   ============================================================ */

function CreatePayslipTemplate({ onBack }) {
    const navigate = useNavigate();
    const location = useLocation();

    const editingTemplate = location.state?.template || null;
    const mode = location.state?.mode || "create";

    const isViewMode = mode === "view";
    const isEditMode = mode === "edit";

    const [templateName, setTemplateName] = useState("");
    const [description, setDescription] = useState("");
    const [employeeType, setEmployeeType] = useState("Permanent");
    const [currency, setCurrency] = useState("INR");
    const [frequency, setFrequency] = useState("Monthly");

    const [salaryComponents, setSalaryComponents] = useState(
        FALLBACK_SALARY_COMPONENTS
    );

    const [earnings, setEarnings] = useState([]);
    const [deductions, setDeductions] = useState([]);

    const [loading, setLoading] = useState(false);
    const [loadingTemplate, setLoadingTemplate] = useState(false);

    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    /* ========================================================
       LOAD SALARY COMPONENTS
       ======================================================== */

    useEffect(() => {
        let cancelled = false;

        const loadSalaryComponents = async () => {
            try {
                const response = await fetch(
                    `${API_BASE_URL}/SalaryComponents`,
                    {
                        credentials: "include",
                    }
                );

                if (!response.ok) {
                    return;
                }

                const data = await response.json();

                if (!Array.isArray(data) || cancelled) {
                    return;
                }

                const normalized = data
                    .map((item) => ({
                        salaryComponentId: String(
                            item.salaryComponentId ??
                                item.SalaryComponentId ??
                                ""
                        ),

                        componentName:
                            item.componentName ??
                            item.ComponentName ??
                            "",

                        componentCode:
                            item.componentCode ??
                            item.ComponentCode ??
                            "",

                        componentType:
                            item.componentType ??
                            item.ComponentType ??
                            "Earning",

                        calculationType:
                            item.calculationType ??
                            item.CalculationType ??
                            "Percentage",

                        isActive:
                            item.isActive ??
                            item.IsActive ??
                            true,
                    }))
                    .filter(
                        (item) =>
                            item.salaryComponentId &&
                            item.isActive !== false
                    );

                if (normalized.length > 0) {
                    setSalaryComponents(normalized);
                }
            } catch (err) {
                console.warn(
                    "Salary component API unavailable. Using fallback components."
                );
            }
        };

        loadSalaryComponents();

        return () => {
            cancelled = true;
        };
    }, []);

    /* ========================================================
       LOAD TEMPLATE
       ======================================================== */

    useEffect(() => {
        let cancelled = false;

        const loadTemplate = async () => {
            if (!editingTemplate) {
                setTemplateName("");
                setDescription("");
                setEmployeeType("Permanent");
                setCurrency("INR");
                setFrequency("Monthly");

                setEarnings([
                    {
                        ...createEmptyComponent("Earning", 1),
                        salaryComponentId: "1",
                        calculationType: "Percentage",
                        value: 50,
                        calculationBasedOn: "Annual CTC",
                    },
                    {
                        ...createEmptyComponent("Earning", 2),
                        salaryComponentId: "2",
                        calculationType: "Percentage",
                        value: 20,
                        calculationBasedOn: "Basic Salary",
                    },
                ]);

                setDeductions([
                    {
                        ...createEmptyComponent("Deduction", 3),
                        salaryComponentId: "4",
                        calculationType: "Percentage",
                        value: 12,
                        calculationBasedOn: "Basic Salary",
                    },
                    {
                        ...createEmptyComponent("Deduction", 4),
                        salaryComponentId: "5",
                        calculationType: "Fixed",
                        value: 200,
                        calculationBasedOn: "Monthly",
                    },
                ]);

                return;
            }

            const id =
                editingTemplate.payrollTemplateId ??
                editingTemplate.id;

            if (!id) {
                return;
            }

            setLoadingTemplate(true);
            setError("");

            try {
                const response = await fetch(
                    `${API_BASE_URL}/PayrollTemplates/${id}`,
                    {
                        credentials: "include",
                    }
                );

                if (!response.ok) {
                    const body = await response.json().catch(() => null);

                    throw new Error(
                        body?.message ||
                            `Failed to load template (${response.status}).`
                    );
                }

                const template = await response.json();

                if (cancelled) {
                    return;
                }

                setTemplateName(
                    template.templateName ??
                        template.TemplateName ??
                        ""
                );

                setDescription(
                    template.description ??
                        template.Description ??
                        ""
                );

                setEmployeeType(
                    template.employeeType ??
                        template.EmployeeType ??
                        "Permanent"
                );

                setCurrency(
                    template.currency ??
                        template.Currency ??
                        "INR"
                );

                setFrequency(
                    template.payFrequency ??
                        template.PayFrequency ??
                        "Monthly"
                );

                const components =
                    template.components ??
                    template.Components ??
                    [];

                const mapped = components.map(
                    (component, index) => {
                        const salaryComponentId = String(
                            component.salaryComponentId ??
                                component.SalaryComponentId ??
                                ""
                        );

                        const salaryComponent =
                            salaryComponents.find(
                                (item) =>
                                    String(
                                        item.salaryComponentId
                                    ) === salaryComponentId
                            );

                        return {
                            id:
                                component.payrollTemplateComponentId ??
                                component.PayrollTemplateComponentId ??
                                `${id}-${index}`,

                            salaryComponentId,

                            calculationType:
                                component.calculationType ??
                                component.CalculationType ??
                                salaryComponent?.calculationType ??
                                "Percentage",

                            value:
                                component.value ??
                                component.Value ??
                                0,

                            calculationBasedOn:
                                component.calculationBasedOn ??
                                component.CalculationBasedOn ??
                                "Annual CTC",

                            sequence:
                                component.sequence ??
                                component.Sequence ??
                                index + 1,

                            kind:
                                String(
                                    salaryComponent?.componentType ??
                                        ""
                                ).toLowerCase() === "deduction"
                                    ? "Deduction"
                                    : "Earning",
                        };
                    }
                );

                setEarnings(
                    mapped.filter(
                        (item) => item.kind === "Earning"
                    )
                );

                setDeductions(
                    mapped.filter(
                        (item) => item.kind === "Deduction"
                    )
                );
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err?.message ||
                            "Unable to load the payroll template."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoadingTemplate(false);
                }
            }
        };

        loadTemplate();

        return () => {
            cancelled = true;
        };
    }, [editingTemplate, salaryComponents]);

    /* ========================================================
       AVAILABLE COMPONENTS
       ======================================================== */

    const earningComponents = useMemo(
        () =>
            salaryComponents.filter(
                (component) =>
                    String(component.componentType).toLowerCase() ===
                    "earning"
            ),
        [salaryComponents]
    );

    const deductionComponents = useMemo(
        () =>
            salaryComponents.filter(
                (component) =>
                    String(component.componentType).toLowerCase() ===
                    "deduction"
            ),
        [salaryComponents]
    );

    const getComponent = (salaryComponentId) =>
        salaryComponents.find(
            (component) =>
                String(component.salaryComponentId) ===
                String(salaryComponentId)
        );

    /* ========================================================
       UPDATE COMPONENT
       ======================================================== */

    const updateComponent = (
        setter,
        id,
        field,
        value
    ) => {
        setter((current) =>
            current.map((item) =>
                item.id === id
                    ? {
                          ...item,
                          [field]: value,
                      }
                    : item
            )
        );
    };

    const handleEarningChange = (
        id,
        field,
        value
    ) => {
        if (field === "salaryComponentId") {
            const component = getComponent(value);

            updateComponent(
                setEarnings,
                id,
                "salaryComponentId",
                String(value)
            );

            if (component?.calculationType) {
                updateComponent(
                    setEarnings,
                    id,
                    "calculationType",
                    component.calculationType
                );
            }

            return;
        }

        updateComponent(
            setEarnings,
            id,
            field,
            value
        );
    };

    const handleDeductionChange = (
        id,
        field,
        value
    ) => {
        if (field === "salaryComponentId") {
            const component = getComponent(value);

            updateComponent(
                setDeductions,
                id,
                "salaryComponentId",
                String(value)
            );

            if (component?.calculationType) {
                updateComponent(
                    setDeductions,
                    id,
                    "calculationType",
                    component.calculationType
                );
            }

            return;
        }

        updateComponent(
            setDeductions,
            id,
            field,
            value
        );
    };

    /* ========================================================
       ADD / DELETE
       ======================================================== */

    const handleAddEarning = () => {
        setEarnings((current) => [
            ...current,
            {
                ...createEmptyComponent(
                    "Earning",
                    `earning-${Date.now()}`
                ),
                sequence:
                    current.length +
                    deductions.length +
                    1,
            },
        ]);
    };

    const handleAddDeduction = () => {
        setDeductions((current) => [
            ...current,
            {
                ...createEmptyComponent(
                    "Deduction",
                    `deduction-${Date.now()}`
                ),
                sequence:
                    earnings.length +
                    current.length +
                    1,
            },
        ]);
    };

    const handleDeleteEarning = (id) => {
        setEarnings((current) =>
            current.filter(
                (item) => item.id !== id
            )
        );
    };

    const handleDeleteDeduction = (id) => {
        setDeductions((current) =>
            current.filter(
                (item) => item.id !== id
            )
        );
    };

    /* ========================================================
       COMPONENTS
       ======================================================== */

    const allComponents = useMemo(
        () => [...earnings, ...deductions],
        [earnings, deductions]
    );

    const usedComponentIds = useMemo(
        () =>
            allComponents
                .map((item) =>
                    String(item.salaryComponentId)
                )
                .filter(Boolean),
        [allComponents]
    );

    /* ========================================================
       VALIDATION
       ======================================================== */

    const validateForm = () => {
        if (!templateName.trim()) {
            return "Template name is required.";
        }

        if (allComponents.length === 0) {
            return "Add at least one salary component.";
        }

        if (
            allComponents.some(
                (component) =>
                    !component.salaryComponentId
            )
        ) {
            return "Please select a salary component for every row.";
        }

        const uniqueIds = new Set(
            usedComponentIds
        );

        if (
            uniqueIds.size !==
            usedComponentIds.length
        ) {
            return "The same salary component cannot be added more than once.";
        }

        if (
            allComponents.some(
                (component) =>
                    Number(component.value) < 0 ||
                    Number.isNaN(
                        Number(component.value)
                    )
            )
        ) {
            return "Component values must be valid non-negative numbers.";
        }

        if (
            allComponents.some(
                (component) =>
                    component.calculationType ===
                        "Percentage" &&
                    Number(component.value) > 100
            )
        ) {
            return "Percentage values cannot be greater than 100.";
        }

        return "";
    };

    /* ========================================================
       SAVE
       ======================================================== */

    const handleSave = async (event) => {
        event.preventDefault();

        if (isViewMode) {
            return;
        }

        setError("");
        setSuccessMessage("");

        const validationError =
            validateForm();

        if (validationError) {
            setError(validationError);
            return;
        }

        const orderedComponents =
            allComponents.map(
                (component, index) => ({
                    salaryComponentId: Number(
                        component.salaryComponentId
                    ),

                    calculationType:
                        component.calculationType,

                    value:
                        Number(component.value) || 0,

                    calculationBasedOn:
                        component.calculationBasedOn ||
                        null,

                    sequence: index + 1,
                })
            );

        const payload = {
            templateName:
                templateName.trim(),

            description:
                description.trim() || null,

            employeeType,

            payFrequency: frequency,

            currency,

            components:
                orderedComponents,
        };

        setLoading(true);

        try {
            const templateId =
                editingTemplate?.payrollTemplateId ??
                editingTemplate?.id;

            const url = isEditMode
                ? `${API_BASE_URL}/PayrollTemplates/${templateId}`
                : `${API_BASE_URL}/PayrollTemplates`;

            const response = await fetch(
                url,
                {
                    method: isEditMode
                        ? "PUT"
                        : "POST",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    credentials: "include",

                    body: JSON.stringify(
                        payload
                    ),
                }
            );

            const body =
                await response
                    .json()
                    .catch(() => null);

            if (!response.ok) {
                throw new Error(
                    body?.message ||
                        body?.error ||
                        `Failed to save template (${response.status}).`
                );
            }

            setSuccessMessage(
                isEditMode
                    ? "Payroll template updated successfully."
                    : "Payroll template created successfully."
            );

            setTimeout(() => {
                if (onBack) {
                    onBack();
                } else {
                    navigate(
                        "/payroll/payslip-templates"
                    );
                }
            }, 700);
        } catch (err) {
            setError(
                err?.message ||
                    "Unable to save the payroll template."
            );
        } finally {
            setLoading(false);
        }
    };

    /* ========================================================
       BACK
       ======================================================== */

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            navigate(
                "/payroll/payslip-templates"
            );
        }
    };

    /* ========================================================
       PREVIEW
       ======================================================== */

    const formatCurrency = (value) =>
        `₹${Number(value || 0).toLocaleString(
            "en-IN"
        )}`;

    const previewGross = allComponents
        .filter(
            (item) => item.kind === "Earning"
        )
        .reduce((total, item) => {
            const value =
                Number(item.value) || 0;

            return (
                total +
                (item.calculationType ===
                "Percentage"
                    ? 50000 *
                      (value / 100)
                    : value)
            );
        }, 0);

    const previewDeductions =
        allComponents
            .filter(
                (item) =>
                    item.kind === "Deduction"
            )
            .reduce((total, item) => {
                const value =
                    Number(item.value) || 0;

                return (
                    total +
                    (item.calculationType ===
                    "Percentage"
                        ? 50000 *
                          (value / 100)
                        : value)
                );
            }, 0);

    /* ========================================================
       COMPONENT ROW
       ======================================================== */

    const renderComponentRow = (
        item,
        kind,
        availableComponents,
        setter,
        onChange,
        onDelete
    ) => {
        const selectedComponent =
            getComponent(
                item.salaryComponentId
            );

        return (
            <Box
                key={item.id}
                className="cpt-salary-component-card"
            >
                <Box className="cpt-component-drag-handle">
                    <DragIndicatorIcon />
                </Box>

                <Box className="cpt-component-fields">
                    {/* COMPONENT NAME */}
                    <FormControl
                        size="small"
                        fullWidth
                        className="cpt-component-control cpt-component-name-control"
                    >
                        <InputLabel>
                            Component Name
                        </InputLabel>

                        <Select
                            value={
                                item.salaryComponentId ||
                                ""
                            }
                            label="Component Name"
                            disabled={isViewMode}
                            renderValue={() => (
                                <ComponentValue
                                    component={
                                        selectedComponent
                                    }
                                />
                            )}
                            onChange={(event) =>
                                onChange(
                                    item.id,
                                    "salaryComponentId",
                                    event.target
                                        .value
                                )
                            }
                        >
                            <MenuItem value="">
                                Select component
                            </MenuItem>

                            {availableComponents.map(
                                (component) => {
                                    const componentId =
                                        String(
                                            component.salaryComponentId
                                        );

                                    const alreadyUsed =
                                        usedComponentIds.includes(
                                            componentId
                                        ) &&
                                        String(
                                            item.salaryComponentId
                                        ) !==
                                            componentId;

                                    return (
                                        <MenuItem
                                            key={
                                                componentId
                                            }
                                            value={
                                                componentId
                                            }
                                            disabled={
                                                alreadyUsed
                                            }
                                        >
                                            <Box className="cpt-component-menu-item">
                                                <Typography className="cpt-component-menu-name">
                                                    {
                                                        component.componentName
                                                    }
                                                </Typography>

                                                <Typography className="cpt-component-menu-code">
                                                    {
                                                        component.componentCode
                                                    }
                                                </Typography>
                                            </Box>
                                        </MenuItem>
                                    );
                                }
                            )}
                        </Select>
                    </FormControl>

                    {/* CALCULATION */}
                    <FormControl
                        size="small"
                        fullWidth
                        className="cpt-component-control"
                    >
                        <InputLabel>
                            Calculation
                        </InputLabel>

                        <Select
                            value={
                                item.calculationType ||
                                "Percentage"
                            }
                            label="Calculation"
                            disabled={isViewMode}
                            onChange={(event) =>
                                onChange(
                                    item.id,
                                    "calculationType",
                                    event.target
                                        .value
                                )
                            }
                        >
                            <MenuItem value="Percentage">
                                Percentage
                            </MenuItem>

                            <MenuItem value="Fixed">
                                Fixed
                            </MenuItem>
                        </Select>
                    </FormControl>

                    {/* VALUE */}
                    <TextField
                        size="small"
                        fullWidth
                        type="number"
                        className="cpt-component-control"
                        label={
                            item.calculationType ===
                            "Percentage"
                                ? "Value (%)"
                                : "Value"
                        }
                        value={
                            item.value ?? ""
                        }
                        disabled={isViewMode}
                        onChange={(event) =>
                            onChange(
                                item.id,
                                "value",
                                event.target
                                    .value
                            )
                        }
                        inputProps={{
                            min: 0,
                            max:
                                item.calculationType ===
                                "Percentage"
                                    ? 100
                                    : undefined,
                            step: "0.01",
                        }}
                    />

                    {/* DELETE */}
                    {!isViewMode && (
                        <Button
                            className="cpt-delete-component-button"
                            type="button"
                            onClick={() =>
                                onDelete(
                                    item.id
                                )
                            }
                        >
                            <DeleteOutlineOutlinedIcon />
                        </Button>
                    )}

                    {/* BASED ON */}
                    <FormControl
                        size="small"
                        fullWidth
                        className="cpt-based-on-control"
                    >
                        <InputLabel>
                            Based On
                        </InputLabel>

                        <Select
                            value={
                                item.calculationBasedOn ||
                                (kind ===
                                "Earning"
                                    ? "Annual CTC"
                                    : "Basic Salary")
                            }
                            label="Based On"
                            disabled={isViewMode}
                            onChange={(event) =>
                                onChange(
                                    item.id,
                                    "calculationBasedOn",
                                    event.target
                                        .value
                                )
                            }
                        >
                            <MenuItem value="Annual CTC">
                                Annual CTC
                            </MenuItem>

                            <MenuItem value="Basic Salary">
                                Basic Salary
                            </MenuItem>

                            <MenuItem value="Monthly">
                                Monthly
                            </MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            </Box>
        );
    };

    /* ========================================================
       RENDER
       ======================================================== */

    return (
        <Box className="cpt-create-payslip-page">
            {/* HEADER */}
            <Box className="cpt-create-payslip-header">
                <Box className="cpt-create-payslip-header-left">
                    <Button
                        className="cpt-back-to-templates-button"
                        startIcon={
                            <ArrowBackIcon />
                        }
                        onClick={handleBack}
                    >
                        Back
                    </Button>

                    <Box>
                        <Typography className="cpt-create-payslip-title">
                            {isViewMode
                                ? "View Payslip Template"
                                : isEditMode
                                ? "Edit Payslip Template"
                                : "Create Payslip Template"}
                        </Typography>

                        <Typography className="cpt-create-payslip-subtitle">
                            Configure salary
                            calculation rules
                            and components
                            for employees.
                        </Typography>
                    </Box>
                </Box>

                {!isViewMode && (
                    <Button
                        className="cpt-header-save-button"
                        variant="contained"
                        startIcon={
                            <SaveOutlinedIcon />
                        }
                        onClick={handleSave}
                        disabled={
                            loading ||
                            loadingTemplate
                        }
                    >
                        {loading
                            ? "Saving..."
                            : isEditMode
                            ? "Save Changes"
                            : "Save Template"}
                    </Button>
                )}
            </Box>

            {/* MESSAGES */}
            {loadingTemplate && (
                <Box className="cpt-loading-template">
                    Loading template...
                </Box>
            )}

            {error && (
                <Box className="cpt-template-message cpt-template-message-error">
                    {error}
                </Box>
            )}

            {successMessage && (
                <Box className="cpt-template-message cpt-template-message-success">
                    {successMessage}
                </Box>
            )}

            <form onSubmit={handleSave}>
                <Box className="cpt-create-payslip-layout">
                    <Box className="cpt-create-payslip-main">
                        {/* TEMPLATE INFORMATION */}
                        <Card className="cpt-create-payslip-card">
                            <Box className="cpt-create-payslip-card-header">
                                <Box>
                                    <Typography className="cpt-create-card-title">
                                        Template Information
                                    </Typography>

                                    <Typography className="cpt-create-card-description">
                                        Basic information about this payroll template.
                                    </Typography>
                                </Box>
                            </Box>

                            <Divider />

                            <Box className="cpt-template-form-grid">
                                <TextField
                                    label="Template Name"
                                    placeholder="e.g. Standard Monthly Salary"
                                    value={
                                        templateName
                                    }
                                    onChange={(e) =>
                                        setTemplateName(
                                            e.target
                                                .value
                                        )
                                    }
                                    required
                                    fullWidth
                                    disabled={
                                        isViewMode
                                    }
                                />

                                <FormControl fullWidth>
                                    <InputLabel>
                                        Employee Type
                                    </InputLabel>

                                    <Select
                                        value={
                                            employeeType
                                        }
                                        label="Employee Type"
                                        onChange={(e) =>
                                            setEmployeeType(
                                                e.target
                                                    .value
                                            )
                                        }
                                        disabled={
                                            isViewMode
                                        }
                                    >
                                        <MenuItem value="Permanent">
                                            Permanent
                                        </MenuItem>

                                        <MenuItem value="Contract">
                                            Contract
                                        </MenuItem>

                                        <MenuItem value="Intern">
                                            Intern
                                        </MenuItem>

                                        <MenuItem value="Employee">
                                            Employee
                                        </MenuItem>
                                    </Select>
                                </FormControl>

                                <FormControl fullWidth>
                                    <InputLabel>
                                        Currency
                                    </InputLabel>

                                    <Select
                                        value={
                                            currency
                                        }
                                        label="Currency"
                                        onChange={(e) =>
                                            setCurrency(
                                                e.target
                                                    .value
                                            )
                                        }
                                        disabled={
                                            isViewMode
                                        }
                                    >
                                        <MenuItem value="INR">
                                            INR - Indian Rupee
                                        </MenuItem>

                                        <MenuItem value="AED">
                                            AED - UAE Dirham
                                        </MenuItem>

                                        <MenuItem value="USD">
                                            USD - US Dollar
                                        </MenuItem>

                                        <MenuItem value="GBP">
                                            GBP - British Pound
                                        </MenuItem>
                                    </Select>
                                </FormControl>

                                <FormControl fullWidth>
                                    <InputLabel>
                                        Payroll Frequency
                                    </InputLabel>

                                    <Select
                                        value={
                                            frequency
                                        }
                                        label="Payroll Frequency"
                                        onChange={(e) =>
                                            setFrequency(
                                                e.target
                                                    .value
                                            )
                                        }
                                        disabled={
                                            isViewMode
                                        }
                                    >
                                        <MenuItem value="Monthly">
                                            Monthly
                                        </MenuItem>

                                        <MenuItem value="Biweekly">
                                            Biweekly
                                        </MenuItem>

                                        <MenuItem value="Weekly">
                                            Weekly
                                        </MenuItem>
                                    </Select>
                                </FormControl>

                                <TextField
                                    className="cpt-description-field"
                                    label="Description"
                                    placeholder="Describe this payroll template"
                                    value={
                                        description
                                    }
                                    onChange={(e) =>
                                        setDescription(
                                            e.target
                                                .value
                                        )
                                    }
                                    multiline
                                    rows={4}
                                    fullWidth
                                    disabled={
                                        isViewMode
                                    }
                                />
                            </Box>
                        </Card>

                        {/* EARNINGS */}
                        <Card className="cpt-create-payslip-card">
                            <Box className="cpt-component-card-header">
                                <Box>
                                    <Typography className="cpt-create-card-title">
                                        Earnings
                                    </Typography>

                                    <Typography className="cpt-create-card-description">
                                        Salary components that increase employee earnings.
                                    </Typography>
                                </Box>

                                {!isViewMode && (
                                    <Button
                                        className="cpt-add-component-button"
                                        variant="outlined"
                                        startIcon={
                                            <AddIcon />
                                        }
                                        onClick={
                                            handleAddEarning
                                        }
                                        type="button"
                                    >
                                        Add Earning
                                    </Button>
                                )}
                            </Box>

                            <Divider />

                            <Box className="cpt-salary-components-list">
                                {earnings.length ===
                                0 ? (
                                    <Box className="cpt-component-empty-state">
                                        <Typography>
                                            No earnings added
                                        </Typography>

                                        <Typography>
                                            Click "Add Earning" to add a salary component.
                                        </Typography>
                                    </Box>
                                ) : (
                                    earnings.map(
                                        (earning) =>
                                            renderComponentRow(
                                                earning,
                                                "Earning",
                                                earningComponents,
                                                setEarnings,
                                                handleEarningChange,
                                                handleDeleteEarning
                                            )
                                    )
                                )}
                            </Box>
                        </Card>

                        {/* DEDUCTIONS */}
                        <Card className="cpt-create-payslip-card">
                            <Box className="cpt-component-card-header">
                                <Box>
                                    <Typography className="cpt-create-card-title">
                                        Deductions
                                    </Typography>

                                    <Typography className="cpt-create-card-description">
                                        Salary components that reduce employee earnings.
                                    </Typography>
                                </Box>

                                {!isViewMode && (
                                    <Button
                                        className="cpt-add-component-button"
                                        variant="outlined"
                                        startIcon={
                                            <AddIcon />
                                        }
                                        onClick={
                                            handleAddDeduction
                                        }
                                        type="button"
                                    >
                                        Add Deduction
                                    </Button>
                                )}
                            </Box>

                            <Divider />

                            <Box className="cpt-salary-components-list">
                                {deductions.length ===
                                0 ? (
                                    <Box className="cpt-component-empty-state">
                                        <Typography>
                                            No deductions added
                                        </Typography>

                                        <Typography>
                                            Click "Add Deduction" to add a deduction component.
                                        </Typography>
                                    </Box>
                                ) : (
                                    deductions.map(
                                        (deduction) =>
                                            renderComponentRow(
                                                deduction,
                                                "Deduction",
                                                deductionComponents,
                                                setDeductions,
                                                handleDeductionChange,
                                                handleDeleteDeduction
                                            )
                                    )
                                )}
                            </Box>
                        </Card>
                    </Box>

                    {/* PREVIEW */}
                    <Box className="cpt-create-payslip-sidebar">
                        <Card className="cpt-payslip-preview-card">
                            <Box className="cpt-payslip-preview-header">
                                <Box>
                                    <Typography className="cpt-preview-title">
                                        Payslip Preview
                                    </Typography>

                                    <Typography className="cpt-preview-subtitle">
                                        Live preview of your salary structure
                                    </Typography>
                                </Box>

                                <ReceiptLongOutlinedIcon />
                            </Box>

                            <Divider />

                            <Box className="cpt-payslip-preview-document">
                                <Box className="cpt-preview-company">
                                    <Box className="cpt-preview-company-mark">
                                        S
                                    </Box>

                                    <Box>
                                        <Typography className="cpt-preview-company-name">
                                            SPARK
                                        </Typography>

                                        <Typography className="cpt-preview-company-text">
                                            ERP & CRM SYSTEM
                                        </Typography>
                                    </Box>
                                </Box>

                                <Box className="cpt-preview-document-line" />

                                <Typography className="cpt-preview-document-title">
                                    SALARY SLIP
                                </Typography>

                                <Box className="cpt-preview-period-grid">
                                    <Box>
                                        <span>
                                            EMPLOYEE TYPE
                                        </span>

                                        <strong>
                                            {
                                                employeeType
                                            }
                                        </strong>
                                    </Box>

                                    <Box>
                                        <span>
                                            FREQUENCY
                                        </span>

                                        <strong>
                                            {
                                                frequency
                                            }
                                        </strong>
                                    </Box>
                                </Box>

                                <Box className="cpt-preview-salary-section">
                                    <Typography className="cpt-preview-section-title">
                                        EARNINGS
                                    </Typography>

                                    {earnings.length ===
                                    0 ? (
                                        <Typography className="cpt-preview-empty">
                                            No earnings added
                                        </Typography>
                                    ) : (
                                        earnings.map(
                                            (
                                                earning
                                            ) => (
                                                <Box
                                                    className="cpt-preview-salary-row"
                                                    key={
                                                        earning.id
                                                    }
                                                >
                                                    <span>
                                                        {
                                                            getComponent(
                                                                earning.salaryComponentId
                                                            )
                                                                ?.componentName ||
                                                            "Salary Component"
                                                        }
                                                    </span>

                                                    <strong>
                                                        {earning.calculationType ===
                                                        "Percentage"
                                                            ? `${earning.value}%`
                                                            : formatCurrency(
                                                                  earning.value
                                                              )}
                                                    </strong>
                                                </Box>
                                            )
                                        )
                                    )}
                                </Box>

                                <Box className="cpt-preview-salary-section">
                                    <Typography className="cpt-preview-section-title">
                                        DEDUCTIONS
                                    </Typography>

                                    {deductions.length ===
                                    0 ? (
                                        <Typography className="cpt-preview-empty">
                                            No deductions added
                                        </Typography>
                                    ) : (
                                        deductions.map(
                                            (
                                                deduction
                                            ) => (
                                                <Box
                                                    className="cpt-preview-salary-row"
                                                    key={
                                                        deduction.id
                                                    }
                                                >
                                                    <span>
                                                        {
                                                            getComponent(
                                                                deduction.salaryComponentId
                                                            )
                                                                ?.componentName ||
                                                            "Deduction"
                                                        }
                                                    </span>

                                                    <strong>
                                                        {deduction.calculationType ===
                                                        "Percentage"
                                                            ? `${deduction.value}%`
                                                            : formatCurrency(
                                                                  deduction.value
                                                              )}
                                                    </strong>
                                                </Box>
                                            )
                                        )
                                    )}
                                </Box>

                                <Box className="cpt-preview-net-salary">
                                    <span>
                                        GROSS SALARY
                                    </span>

                                    <strong>
                                        {formatCurrency(
                                            previewGross
                                        )}
                                    </strong>
                                </Box>

                                <Box className="cpt-preview-net-salary cpt-preview-net-final">
                                    <span>
                                        NET SALARY
                                    </span>

                                    <strong>
                                        {formatCurrency(
                                            previewGross -
                                                previewDeductions
                                        )}
                                    </strong>
                                </Box>

                                <Typography className="cpt-preview-calculation-note">
                                    Calculated from preview CTC of ₹50,000
                                </Typography>
                            </Box>
                        </Card>
                    </Box>
                </Box>

                <Box className="cpt-create-payslip-actions">
                    <Button
                        className="cpt-cancel-payslip-button"
                        type="button"
                        onClick={handleBack}
                    >
                        Cancel
                    </Button>

                    {!isViewMode && (
                        <Button
                            className="cpt-footer-save-button"
                            variant="contained"
                            startIcon={
                                <SaveOutlinedIcon />
                            }
                            type="submit"
                            disabled={
                                loading ||
                                loadingTemplate
                            }
                        >
                            {loading
                                ? "Saving..."
                                : isEditMode
                                ? "Save Changes"
                                : "Create Template"}
                        </Button>
                    )}
                </Box>
            </form>
        </Box>
    );
}

export default CreatePayslipTemplate;