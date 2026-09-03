import React, { useEffect, useMemo, useState } from "react";

import {
    Alert,
    Box,
    Button,
    Card,
    CircularProgress,
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

import { useNavigate, useParams } from "react-router-dom";

import PayrollService from ".../Service/PayrollService";
import "./UpdateTemplate.css";


// Fallback values keep the dropdown usable if the salary-component
// endpoint is temporarily unavailable. IDs match the salary components
// already used by this payroll database. When the API responds, API data
// always replaces this list.
const FALLBACK_SALARY_COMPONENTS = [
    {
        salaryComponentId: 1,
        componentName: "Basic Salary",
        componentCode: "BASIC_SALARY",
        componentType: "Earning",
        calculationType: "Percentage",
        isActive: true,
    },
    {
        salaryComponentId: 2,
        componentName: "PF",
        componentCode: "PF",
        componentType: "Deduction",
        calculationType: "Fixed",
        isActive: true,
    },
];

const normalizeSalaryComponent = (item) => ({
    salaryComponentId:
        item?.salaryComponentId ?? item?.SalaryComponentId,
    componentName:
        item?.componentName ?? item?.ComponentName ?? "",
    componentCode:
        item?.componentCode ?? item?.ComponentCode ?? "",
    componentType:
        item?.componentType ?? item?.ComponentType ?? "Earning",
    calculationType:
        item?.calculationType ?? item?.CalculationType ?? "Percentage",
    isActive:
        item?.isActive ?? item?.IsActive ?? true,
});


const createEmptyComponent = (kind, id, sequence = 1) => ({
    id,

    componentName: "",

    componentCode: "",

    salaryComponentId: null,

    componentType: kind,

    calculationType: "Percentage",

    value: 0,

    calculationBasedOn:
        kind === "Earning"
            ? "Annual CTC"
            : "Basic Salary",

    sequence,

    isNew: true,
});

function UpdateTemplate() {
    const navigate = useNavigate();
    const { id } = useParams();

    const templateId = Number(id);

    const [templateName, setTemplateName] = useState("");
    const [description, setDescription] = useState("");
    const [employeeType, setEmployeeType] =
        useState("Permanent");
    const [currency, setCurrency] = useState("INR");
    const [frequency, setFrequency] = useState("Monthly");

    const [salaryComponents, setSalaryComponents] =
        useState(FALLBACK_SALARY_COMPONENTS);

    const [earnings, setEarnings] = useState([]);
    const [deductions, setDeductions] = useState([]);

    const [loadingTemplate, setLoadingTemplate] =
        useState(true);

    const [loadingComponents, setLoadingComponents] =
        useState(true);

    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] =
        useState("");


    // =========================================================
    // LOAD SALARY COMPONENTS
    // =========================================================

    useEffect(() => {
        let cancelled = false;

        const loadComponents = async () => {
            setLoadingComponents(true);

            try {
                const data = await PayrollService.getSalaryComponents();

                const normalized = Array.isArray(data)
                    ? data
                          .map(normalizeSalaryComponent)
                          .filter(
                              (item) =>
                                  Number(item.salaryComponentId) > 0 &&
                                  item.isActive !== false
                          )
                    : [];

                if (!cancelled && normalized.length > 0) {
                    setSalaryComponents(normalized);
                }
            } catch (err) {
                // Keep the fallback list. Do not block the template editor
                // just because the salary-component endpoint is unavailable.
                console.warn(
                    "Unable to load salary components from API. Using fallback list.",
                    err
                );
            } finally {
                if (!cancelled) {
                    setLoadingComponents(false);
                }
            }
        };

        loadComponents();

        return () => {
            cancelled = true;
        };
    }, []);


    // =========================================================
    // LOAD TEMPLATE
    // =========================================================

    useEffect(() => {
        let cancelled = false;

        const loadTemplate = async () => {
            if (!templateId || Number.isNaN(templateId)) {
                setError("Invalid payroll template ID.");
                setLoadingTemplate(false);
                return;
            }

            setLoadingTemplate(true);
            setError("");

            try {
                const template =
                    await PayrollService.getTemplate(
                        templateId
                    );

                if (cancelled || !template) {
                    return;
                }

                setTemplateName(
                    template.templateName || ""
                );

                setDescription(
                    template.description || ""
                );

                setEmployeeType(
                    template.employeeType ||
                        "Permanent"
                );

                setCurrency(
                    template.currency || "INR"
                );

                setFrequency(
                    template.payFrequency ||
                        "Monthly"
                );

                const components =
                    Array.isArray(template.components)
                        ? template.components
                        : [];

                const mappedComponents =
                    components.map(
                        (component, index) => {
                            const matchingSalaryComponent =
                                salaryComponents.find(
                                    (item) =>
                                        Number(item.salaryComponentId) ===
                                        Number(component.salaryComponentId)
                                );

                            const componentType =
                                String(
                                    component.componentType ||
                                        matchingSalaryComponent?.componentType ||
                                        "Earning"
                                ).toLowerCase();

                            const kind =
                                componentType === "deduction"
                                    ? "Deduction"
                                    : "Earning";

                            return {
                                id:
                                    component.payrollTemplateComponentId ||
                                    `${templateId}-${index}`,

                                salaryComponentId:
                                    component.salaryComponentId || "",

                                componentName:
                                    component.componentName ||
                                    matchingSalaryComponent?.componentName ||
                                    "",

                                componentCode:
                                    component.componentCode ||
                                    matchingSalaryComponent?.componentCode ||
                                    "",

                                calculationType:
                                    component.calculationType ||
                                    matchingSalaryComponent?.calculationType ||
                                    "Percentage",

                                value:
                                    Number(component.value) || 0,

                                calculationBasedOn:
                                    component.calculationBasedOn ||
                                    (kind === "Earning"
                                        ? "Annual CTC"
                                        : "Basic Salary"),

                                sequence:
                                    Number(component.sequence) || index + 1,

                                kind,
                            };
                        }
                    );

                setEarnings(
                    mappedComponents
                        .filter(
                            (item) =>
                                item.kind ===
                                "Earning"
                        )
                        .sort(
                            (a, b) =>
                                a.sequence -
                                b.sequence
                        )
                );

                setDeductions(
                    mappedComponents
                        .filter(
                            (item) =>
                                item.kind ===
                                "Deduction"
                        )
                        .sort(
                            (a, b) =>
                                a.sequence -
                                b.sequence
                        )
                );
            } catch (err) {
                console.error(
                    "Unable to load payroll template:",
                    err
                );

                if (!cancelled) {
                    setError(
                        err?.message ||
                            "Unable to load payroll template."
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
    }, [templateId]);


    // =========================================================
    // COMPONENT LISTS
    // =========================================================

    const earningComponents = useMemo(
        () =>
            salaryComponents.filter(
                (item) =>
                    String(
                        item.componentType
                    ).toLowerCase() ===
                    "earning"
            ),
        [salaryComponents]
    );

    const deductionComponents = useMemo(
        () =>
            salaryComponents.filter(
                (item) =>
                    String(
                        item.componentType
                    ).toLowerCase() ===
                    "deduction"
            ),
        [salaryComponents]
    );


    const allComponents = useMemo(
        () => [
            ...earnings,
            ...deductions,
        ],
        [earnings, deductions]
    );


    const getComponent = (componentId) =>
        salaryComponents.find(
            (component) =>
                Number(
                    component.salaryComponentId
                ) === Number(componentId)
        );


    const usedComponentIds = useMemo(
        () =>
            allComponents
                .map((item) =>
                    Number(item.salaryComponentId)
                )
                .filter((id) => id > 0),
        [allComponents]
    );


    // =========================================================
    // COMPONENT UPDATE
    // =========================================================

    const updateComponent = (
        setter,
        componentId,
        field,
        value
    ) => {
        setter((current) =>
            current.map((item) =>
                item.id === componentId
                    ? {
                          ...item,
                          [field]: value,
                      }
                    : item
            )
        );
    };


    const changeComponent = (
        setter,
        componentId,
        field,
        value
    ) => {
        if (
            field ===
            "salaryComponentId"
        ) {
            const selected =
                getComponent(value);

            setter((current) =>
                current.map((item) =>
                    item.id === componentId
                        ? {
                              ...item,
                              salaryComponentId: value,
                              componentName:
                                  selected?.componentName || "",
                              componentCode:
                                  selected?.componentCode || "",
                              componentType:
                                  selected?.componentType || item.kind,
                              kind:
                                  String(selected?.componentType || item.kind).toLowerCase() ===
                                  "deduction"
                                      ? "Deduction"
                                      : "Earning",
                              calculationType:
                                  selected?.calculationType ||
                                  item.calculationType ||
                                  "Percentage",
                          }
                        : item
                )
            );

            return;
        }

        updateComponent(
            setter,
            componentId,
            field,
            value
        );
    };


    // =========================================================
    // ADD COMPONENT
    // =========================================================

    const handleAddEarning = () => {
        setEarnings((current) => [
            ...current,

            createEmptyComponent(
                "Earning",
                `earning-${Date.now()}`,
                allComponents.length + 1
            ),
        ]);
    };


    const handleAddDeduction = () => {
        setDeductions((current) => [
            ...current,

            createEmptyComponent(
                "Deduction",
                `deduction-${Date.now()}`,
                allComponents.length + 1
            ),
        ]);
    };


    // =========================================================
    // DELETE COMPONENT
    // =========================================================

    const handleDeleteEarning = (componentId) => {
        setEarnings((current) =>
            current.filter(
                (item) =>
                    item.id !== componentId
            )
        );
    };


    const handleDeleteDeduction = (componentId) => {
        setDeductions((current) =>
            current.filter(
                (item) =>
                    item.id !== componentId
            )
        );
    };


    // =========================================================
    // VALIDATION
    // =========================================================

    const validateForm = () => {
        if (!templateName.trim()) {
            return "Template name is required.";
        }

        if (allComponents.length === 0) {
            return "Add at least one salary component.";
        }

        const missingComponent =
            allComponents.find(
                (item) =>
                    !item.salaryComponentId ||
                    Number(
                        item.salaryComponentId
                    ) <= 0
            );

        if (missingComponent) {
            return "Please select a salary component for every row.";
        }

        if (
            new Set(
                usedComponentIds
            ).size !==
            usedComponentIds.length
        ) {
            return "The same salary component cannot be added more than once.";
        }

        const invalidValue =
            allComponents.some(
                (item) =>
                    Number.isNaN(
                        Number(item.value)
                    ) ||
                    Number(item.value) < 0
            );

        if (invalidValue) {
            return "Component values must be valid non-negative numbers.";
        }

        const invalidPercentage =
            allComponents.some(
                (item) =>
                    item.calculationType ===
                        "Percentage" &&
                    Number(item.value) > 100
            );

        if (invalidPercentage) {
            return "Percentage values cannot be greater than 100.";
        }

        return "";
    };


    // =========================================================
    // UPDATE TEMPLATE
    // =========================================================

    const handleSave = async (event) => {
        event?.preventDefault();

        if (saving) {
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

        setSaving(true);

        try {
            const resolvedComponents = [];

            for (
                let index = 0;
                index < allComponents.length;
                index++
            ) {
                const component =
                    allComponents[index];

                const selectedSalaryComponent =
                    salaryComponents.find(
                        (item) =>
                            Number(
                                item.salaryComponentId
                            ) ===
                            Number(
                                component.salaryComponentId
                            )
                    );

                if (
                    !selectedSalaryComponent
                ) {
                    throw new Error(
                        `Salary component with ID ${component.salaryComponentId} does not exist or is inactive.`
                    );
                }

                const componentType =
                    component.kind ===
                    "Deduction"
                        ? "Deduction"
                        : "Earning";

                resolvedComponents.push({
                    salaryComponentId:
                        Number(
                            selectedSalaryComponent.salaryComponentId
                        ),

                    calculationType:
                        component.calculationType ||
                        selectedSalaryComponent.calculationType ||
                        "Percentage",

                    value:
                        Number(
                            component.value
                        ) || 0,

                    calculationBasedOn:
                        component.calculationBasedOn ||
                        null,

                    sequence:
                        index + 1,

                    isActive: true,
                });
            }


            const payload = {
                templateName:
                    templateName.trim(),

                description:
                    description.trim() ||
                    null,

                employeeType,

                payFrequency:
                    frequency,

                currency,

                components:
                    resolvedComponents,
            };


            console.log(
                "UPDATING PAYROLL TEMPLATE:",
                templateId
            );

            console.log(
                "UPDATE PAYLOAD:",
                JSON.stringify(
                    payload,
                    null,
                    2
                )
            );


            await PayrollService.updateTemplate(
                templateId,
                payload
            );


            setSuccessMessage(
                "Payroll template updated successfully."
            );


            window.setTimeout(() => {
                navigate(
                    "/payroll/payslip-templates"
                );
            }, 700);
        } catch (err) {
            console.error(
                "Payroll template update error:",
                err
            );

            setError(
                err?.message ||
                    "Unable to update the payroll template."
            );
        } finally {
            setSaving(false);
        }
    };


    // =========================================================
    // BACK
    // =========================================================

    const handleBack = () => {
        navigate(
            "/payroll/payslip-templates"
        );
    };


    // =========================================================
    // PREVIEW
    // =========================================================

    const formatCurrency = (value) =>
        `${currency === "AED"
            ? "د.إ"
            : currency === "USD"
            ? "$"
            : currency === "GBP"
            ? "£"
            : "₹"}${Number(
            value || 0
        ).toLocaleString("en-IN")}`;


    const calculatePreviewValue = (
        component
    ) => {
        const value =
            Number(component.value) || 0;

        if (
            component.calculationType ===
            "Percentage"
        ) {
            return (
                50000 *
                (value / 100)
            );
        }

        return value;
    };


    const previewGross =
        earnings.reduce(
            (total, item) =>
                total +
                calculatePreviewValue(
                    item
                ),
            0
        );


    const previewDeductions =
        deductions.reduce(
            (total, item) =>
                total +
                calculatePreviewValue(
                    item
                ),
            0
        );


    const previewNet =
        previewGross -
        previewDeductions;


    // =========================================================
    // COMPONENT ROW
    // =========================================================

const renderComponentRow = (
    item,
    availableComponents,
    setter,
    kind,
    onDelete
) => {
    const isViewMode = false;

    return (
        <Box
            className="salary-component-card"
            key={item.id}
        >
            <Box className="component-drag-handle">
                <DragIndicatorIcon />
            </Box>

            <Box className="component-fields">
                {/* SALARY COMPONENT DROPDOWN */}
                <FormControl
                    fullWidth
                    size="small"
                    className="component-control"
                >
                    <InputLabel>Component Name</InputLabel>

                    <Select
                        value={item.salaryComponentId || ""}
                        label="Component Name"
                        disabled={isViewMode || loadingComponents}
                        displayEmpty
                        onChange={(event) =>
                            changeComponent(
                                setter,
                                item.id,
                                "salaryComponentId",
                                event.target.value
                            )
                        }
                    >
                        <MenuItem value="">
                            <em>
                                {loadingComponents
                                    ? "Loading components..."
                                    : "Select salary component"}
                            </em>
                        </MenuItem>

                        {availableComponents.map((component) => {
                            const componentId = Number(
                                component.salaryComponentId
                            );

                            const isUsedByAnotherRow =
                                usedComponentIds.some(
                                    (usedId) =>
                                        Number(usedId) === componentId &&
                                        Number(item.salaryComponentId) !== componentId
                                );

                            return (
                                <MenuItem
                                    key={componentId}
                                    value={componentId}
                                    disabled={isUsedByAnotherRow}
                                >
                                    {component.componentName}
                                    {component.componentCode
                                        ? ` (${component.componentCode})`
                                        : ""}
                                </MenuItem>
                            );
                        })}
                    </Select>
                </FormControl>

                {/* CALCULATION TYPE */}
                <FormControl
                    fullWidth
                    size="small"
                    className="component-control"
                >
                    <InputLabel>Calculation</InputLabel>

                    <Select
                        value={item.calculationType || "Percentage"}
                        label="Calculation"
                        disabled={isViewMode}
                        onChange={(event) =>
                            updateComponent(
                                setter,
                                item.id,
                                "calculationType",
                                event.target.value
                            )
                        }
                    >
                        <MenuItem value="Percentage">Percentage</MenuItem>
                        <MenuItem value="Fixed">Fixed</MenuItem>
                    </Select>
                </FormControl>

                {/* VALUE */}
                <TextField
                    fullWidth
                    size="small"
                    className="component-control"
                    label={
                        item.calculationType === "Percentage"
                            ? "Value (%)"
                            : "Value"
                    }
                    type="number"
                    value={item.value ?? ""}
                    disabled={isViewMode}
                    inputProps={{
                        min: 0,
                        max:
                            item.calculationType === "Percentage"
                                ? 100
                                : undefined,
                        step: "0.01",
                    }}
                    onChange={(event) =>
                        updateComponent(
                            setter,
                            item.id,
                            "value",
                            event.target.value
                        )
                    }
                />

                {/* DELETE */}
                <Button
                    className="delete-component-button"
                    type="button"
                    disabled={isViewMode}
                    onClick={() => onDelete(item.id)}
                    aria-label={`Delete ${
                        typeof kind === "string"
                            ? kind.toLowerCase()
                            : "component"
                    }`}
                >
                    <DeleteOutlineOutlinedIcon />
                </Button>

                {/* BASED ON */}
                <FormControl
                    fullWidth
                    size="small"
                    className="based-on-control"
                >
                    <InputLabel>Based On</InputLabel>

                    <Select
                        value={
                            item.calculationBasedOn ||
                            (kind === "Earning"
                                ? "Annual CTC"
                                : "Basic Salary")
                        }
                        label="Based On"
                        disabled={isViewMode}
                        onChange={(event) =>
                            updateComponent(
                                setter,
                                item.id,
                                "calculationBasedOn",
                                event.target.value
                            )
                        }
                    >
                        <MenuItem value="Annual CTC">Annual CTC</MenuItem>
                        <MenuItem value="Basic Salary">Basic Salary</MenuItem>
                        <MenuItem value="Monthly">Monthly</MenuItem>
                    </Select>
                </FormControl>
            </Box>
        </Box>
    );
};

    // =========================================================
    // SECTION
    // =========================================================

    const renderSection = (
        title,
        descriptionText,
        items,
        availableComponents,
        setter,
        onAdd,
        onDelete
    ) => (
        <Card className="create-payslip-card">

            <Box className="component-card-header">

                <Box>
                    <Typography className="create-card-title">
                        {title}
                    </Typography>

                    <Typography className="create-card-description">
                        {descriptionText}
                    </Typography>
                </Box>

                <Button
                    className="add-component-button"
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={onAdd}
                    type="button"
                >
                    Add{" "}
                    {title === "Earnings"
                        ? "Earning"
                        : "Deduction"}
                </Button>

            </Box>

            <Divider />

            <Box className="salary-components-list">

                {items.length === 0 ? (
                    <Box className="component-empty-state">

                        <Typography>
                            No{" "}
                            {title.toLowerCase()}{" "}
                            added
                        </Typography>

                        <Typography>
                            Click "Add{" "}
                            {title ===
                            "Earnings"
                                ? "Earning"
                                : "Deduction"}
                            " to add a salary
                            component.
                        </Typography>

                    </Box>
                ) : (
                    items.map((item) =>
                        renderComponentRow(
                            item,
                            availableComponents,
                            setter,
                            title === "Earnings"
                                ? "Earning"
                                : "Deduction",
                            onDelete
                        )
                    )
                )}

            </Box>
        </Card>
    );


    // =========================================================
    // LOADING
    // =========================================================

    if (loadingTemplate) {
        return (
            <Box className="create-payslip-page">

                <Box className="loading-template">
                    <CircularProgress size={24} />

                    <Typography>
                        Loading payroll template...
                    </Typography>
                </Box>

            </Box>
        );
    }


    // =========================================================
    // UI
    // =========================================================

    return (
        <Box className="create-payslip-page">

            {/* HEADER */}

            <Box className="create-payslip-header">

                <Box className="create-payslip-header-left">

                    <Button
                        className="back-to-templates-button"
                        startIcon={
                            <ArrowBackIcon />
                        }
                        onClick={handleBack}
                    >
                        Back
                    </Button>

                    <Box>

                        <Typography className="create-payslip-title">
                            Edit Payslip Template
                        </Typography>

                        <Typography className="create-payslip-subtitle">
                            Update salary calculation
                            rules and components.
                        </Typography>

                    </Box>

                </Box>


                <Button
                    className="header-save-button"
                    variant="contained"
                    startIcon={
                        saving ? (
                            <CircularProgress
                                size={16}
                                color="inherit"
                            />
                        ) : (
                            <SaveOutlinedIcon />
                        )
                    }
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving
                        ? "Saving..."
                        : "Save Changes"}
                </Button>

            </Box>


            {/* MESSAGES */}

            {(error ||
                successMessage) && (
                <Box className="template-message-wrap">

                    {error && (
                        <Alert
                            severity="error"
                            onClose={() =>
                                setError("")
                            }
                        >
                            {error}
                        </Alert>
                    )}

                    {successMessage && (
                        <Alert severity="success">
                            {successMessage}
                        </Alert>
                    )}

                </Box>
            )}


            <form
                onSubmit={handleSave}
            >

                <Box className="create-payslip-layout">

                    {/* MAIN */}

                    <Box className="create-payslip-main">

                        {/* TEMPLATE INFORMATION */}

                        <Card className="create-payslip-card template-information-card">

                            <Box className="create-payslip-card-header">

                                <Box>

                                    <Typography className="create-card-title">
                                        Template Information
                                    </Typography>

                                    <Typography className="create-card-description">
                                        Update the payroll
                                        template information.
                                    </Typography>

                                </Box>

                            </Box>

                            <Divider />

                            <Box className="template-form-grid">

                                <TextField
                                    label="Template Name"
                                    value={
                                        templateName
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setTemplateName(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    required
                                    fullWidth
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
                                        onChange={(
                                            event
                                        ) =>
                                            setEmployeeType(
                                                event
                                                    .target
                                                    .value
                                            )
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
                                        onChange={(
                                            event
                                        ) =>
                                            setCurrency(
                                                event
                                                    .target
                                                    .value
                                            )
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
                                        onChange={(
                                            event
                                        ) =>
                                            setFrequency(
                                                event
                                                    .target
                                                    .value
                                            )
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
                                    className="description-field"
                                    label="Description"
                                    placeholder="Describe this payroll template..."
                                    value={
                                        description
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setDescription(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    multiline
                                    minRows={3}
                                    fullWidth
                                />

                            </Box>

                        </Card>


                        {/* EARNINGS */}

                        {renderSection(
                            "Earnings",
                            "Salary components that increase employee earnings.",
                            earnings,
                            earningComponents,
                            setEarnings,
                            handleAddEarning,
                            handleDeleteEarning
                        )}


                        {/* DEDUCTIONS */}

                        {renderSection(
                            "Deductions",
                            "Salary components that reduce employee earnings.",
                            deductions,
                            deductionComponents,
                            setDeductions,
                            handleAddDeduction,
                            handleDeleteDeduction
                        )}

                    </Box>


                    {/* SIDEBAR */}

                    <Box className="create-payslip-sidebar">

                        <Card className="payslip-preview-card">

                            <Box className="payslip-preview-header">

                                <Box>

                                    <Typography className="preview-title">
                                        Payslip Preview
                                    </Typography>

                                    <Typography className="preview-subtitle">
                                        Preview the updated
                                        salary structure.
                                    </Typography>

                                </Box>

                                <ReceiptLongOutlinedIcon />

                            </Box>

                            <Divider />


                            <Box className="payslip-preview-document">

                                <Box className="preview-company">

                                    <Box className="preview-company-mark">
                                        S
                                    </Box>

                                    <Box>

                                        <Typography className="preview-company-name">
                                            SPARK
                                        </Typography>

                                        <Typography className="preview-company-text">
                                            ERP & CRM SYSTEM
                                        </Typography>

                                    </Box>

                                </Box>


                                <Box className="preview-document-line" />


                                <Typography className="preview-document-title">
                                    SALARY SLIP
                                </Typography>


                                <Box className="preview-period-grid">

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


                                {/* EARNINGS */}

                                <Box className="preview-salary-section">

                                    <Typography className="preview-section-title">
                                        EARNINGS
                                    </Typography>

                                    {earnings.length ===
                                    0 ? (
                                        <Typography className="preview-empty">
                                            No earnings added
                                        </Typography>
                                    ) : (
                                        earnings.map(
                                            (
                                                item
                                            ) => (
                                                <Box
                                                    className="preview-salary-row"
                                                    key={
                                                        item.id
                                                    }
                                                >
                                                    <span>
                                                        {
                                                            getComponent(
                                                                item.salaryComponentId
                                                            )
                                                                ?.componentName ||
                                                            "Salary Component"
                                                        }
                                                    </span>

                                                    <strong>
                                                        {item.calculationType ===
                                                        "Percentage"
                                                            ? `${item.value}%`
                                                            : formatCurrency(
                                                                  item.value
                                                              )}
                                                    </strong>
                                                </Box>
                                            )
                                        )
                                    )}

                                </Box>


                                {/* DEDUCTIONS */}

                                <Box className="preview-salary-section">

                                    <Typography className="preview-section-title">
                                        DEDUCTIONS
                                    </Typography>

                                    {deductions.length ===
                                    0 ? (
                                        <Typography className="preview-empty">
                                            No deductions added
                                        </Typography>
                                    ) : (
                                        deductions.map(
                                            (
                                                item
                                            ) => (
                                                <Box
                                                    className="preview-salary-row"
                                                    key={
                                                        item.id
                                                    }
                                                >
                                                    <span>
                                                        {
                                                            getComponent(
                                                                item.salaryComponentId
                                                            )
                                                                ?.componentName ||
                                                            "Deduction"
                                                        }
                                                    </span>

                                                    <strong>
                                                        {item.calculationType ===
                                                        "Percentage"
                                                            ? `${item.value}%`
                                                            : formatCurrency(
                                                                  item.value
                                                              )}
                                                    </strong>
                                                </Box>
                                            )
                                        )
                                    )}

                                </Box>


                                {/* NET */}

                                <Box className="preview-net-salary">

                                    <span>
                                        NET SALARY
                                    </span>

                                    <strong>
                                        {formatCurrency(
                                            previewNet
                                        )}
                                    </strong>

                                </Box>


                                <Typography className="preview-calculation-note">
                                    Calculated from preview CTC of ₹50,000
                                </Typography>

                            </Box>

                        </Card>

                    </Box>

                </Box>


                {/* FOOTER */}

                <Box className="create-payslip-actions">

                    <Button
                        className="cancel-payslip-button"
                        type="button"
                        onClick={handleBack}
                    >
                        Cancel
                    </Button>


                    <Button
                        className="footer-save-button"
                        variant="contained"
                        startIcon={
                            saving ? (
                                <CircularProgress
                                    size={16}
                                    color="inherit"
                                />
                            ) : (
                                <SaveOutlinedIcon />
                            )
                        }
                        type="submit"
                        disabled={saving}
                    >
                        {saving
                            ? "Saving..."
                            : "Save Changes"}
                    </Button>

                </Box>

            </form>

        </Box>
    );
}

export default UpdateTemplate;