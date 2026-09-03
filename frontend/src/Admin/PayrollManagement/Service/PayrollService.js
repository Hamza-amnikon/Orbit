const API_BASE_URL = "http://localhost:5111/api";

/* ============================================================
   RESPONSE HANDLER
============================================================ */

const handleResponse = async (
    response,
    defaultMessage
) => {
    const body = await response
        .json()
        .catch(() => null);

    if (!response.ok) {
        throw new Error(
            body?.message ||
                body?.error ||
                body?.title ||
                defaultMessage ||
                `Request failed with status ${response.status}`
        );
    }

    return body;
};

/* ============================================================
   NORMALIZE SALARY COMPONENT
============================================================ */

const normalizeSalaryComponent = (item) => {
    if (!item) {
        return null;
    }

    return {
        salaryComponentId:
            item.salaryComponentId ??
            item.SalaryComponentId ??
            null,

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
    };
};

/* ============================================================
   NORMALIZE TEMPLATE
============================================================ */

const normalizeTemplate = (template) => {
    if (!template) {
        return null;
    }

    const components =
        template.components ??
        template.Components ??
        [];

    return {
        payrollTemplateId:
            template.payrollTemplateId ??
            template.PayrollTemplateId,

        templateName:
            template.templateName ??
            template.TemplateName ??
            "",

        description:
            template.description ??
            template.Description ??
            "",

        employeeType:
            template.employeeType ??
            template.EmployeeType ??
            "Permanent",

        payFrequency:
            template.payFrequency ??
            template.PayFrequency ??
            "Monthly",

        currency:
            template.currency ??
            template.Currency ??
            "INR",

        status:
            template.status ??
            template.Status ??
            "Active",

        createdDate:
            template.createdDate ??
            template.CreatedDate ??
            null,

        components: components.map(
            (component) => ({
                payrollTemplateComponentId:
                    component.payrollTemplateComponentId ??
                    component.PayrollTemplateComponentId,

                payrollTemplateId:
                    component.payrollTemplateId ??
                    component.PayrollTemplateId,

                salaryComponentId:
                    component.salaryComponentId ??
                    component.SalaryComponentId,

                componentName:
                    component.componentName ??
                    component.ComponentName ??
                    "",

                calculationType:
                    component.calculationType ??
                    component.CalculationType ??
                    "Percentage",

                value:
                    component.value ??
                    component.Value ??
                    0,

                calculationBasedOn:
                    component.calculationBasedOn ??
                    component.CalculationBasedOn ??
                    null,

                sequence:
                    component.sequence ??
                    component.Sequence ??
                    1,

                isActive:
                    component.isActive ??
                    component.IsActive ??
                    true,
            })
        ),
    };
};

/* ============================================================
   PAYROLL SERVICE
============================================================ */

const PayrollService = {

    /* ========================================================
       SALARY COMPONENTS
    ======================================================== */

    getSalaryComponents: async () => {
        const response = await fetch(
            `${API_BASE_URL}/SalaryComponents`
        );

        const data = await handleResponse(
            response,
            "Unable to load salary components."
        );

        if (!Array.isArray(data)) {
            return [];
        }

        return data
            .map(normalizeSalaryComponent)
            .filter(
                (component) =>
                    component &&
                    component.salaryComponentId != null &&
                    component.componentName?.trim() !== "" &&
                    component.isActive !== false
            );
    },

    getSalaryComponent: async (id) => {
        if (!id) {
            throw new Error(
                "Salary component ID is required."
            );
        }

        const response = await fetch(
            `${API_BASE_URL}/SalaryComponents/${id}`
        );

        const data = await handleResponse(
            response,
            "Unable to load salary component."
        );

        return normalizeSalaryComponent(data);
    },

    /* ========================================================
       CREATE SALARY COMPONENT
    ======================================================== */

    createSalaryComponent: async ({
        componentName,
        componentType,
        calculationType,
        componentCode,
    }) => {
        const cleanName =
            String(componentName || "").trim();

        if (!cleanName) {
            throw new Error(
                "Salary component name is required."
            );
        }

        const generatedCode =
            componentCode ||
            cleanName
                .toUpperCase()
                .replace(/[^A-Z0-9]+/g, "_")
                .replace(/^_+|_+$/g, "")
                .substring(0, 50);

        const payload = {
            componentName: cleanName,

            componentCode: generatedCode,

            componentType:
                componentType || "Earning",

            calculationType:
                calculationType || "Percentage",

            isActive: true,
        };

        console.log(
            "Creating salary component:",
            payload
        );

        const response = await fetch(
            `${API_BASE_URL}/SalaryComponents`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json",
                },

                body: JSON.stringify(payload),
            }
        );

        const data = await handleResponse(
            response,
            "Unable to create salary component."
        );

        const component =
            normalizeSalaryComponent(data);

        if (
            !component?.salaryComponentId
        ) {
            throw new Error(
                "Salary component was created but no ID was returned by the server."
            );
        }

        return component;
    },

    /* ========================================================
       UPDATE SALARY COMPONENT
    ======================================================== */

    updateSalaryComponent: async (
        id,
        payload
    ) => {
        if (!id) {
            throw new Error(
                "Salary component ID is required."
            );
        }

        const response = await fetch(
            `${API_BASE_URL}/SalaryComponents/${id}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type":
                        "application/json",
                },

                body: JSON.stringify(payload),
            }
        );

        const data = await handleResponse(
            response,
            "Unable to update salary component."
        );

        return normalizeSalaryComponent(
            data
        );
    },

    /* ========================================================
       DELETE SALARY COMPONENT
    ======================================================== */

    deleteSalaryComponent: async (id) => {
        if (!id) {
            throw new Error(
                "Salary component ID is required."
            );
        }

        const response = await fetch(
            `${API_BASE_URL}/SalaryComponents/${id}`,
            {
                method: "DELETE",
            }
        );

        return handleResponse(
            response,
            "Unable to delete salary component."
        );
    },

    /* ========================================================
       PAYROLL TEMPLATES
    ======================================================== */

    getTemplates: async () => {
        const response = await fetch(
            `${API_BASE_URL}/PayrollTemplates`
        );

        const data = await handleResponse(
            response,
            "Unable to load payroll templates."
        );

        if (!Array.isArray(data)) {
            return [];
        }

        return data.map(normalizeTemplate);
    },

    getTemplate: async (id) => {
        if (!id) {
            throw new Error(
                "Payroll template ID is required."
            );
        }

        const response = await fetch(
            `${API_BASE_URL}/PayrollTemplates/${id}`
        );

        const data = await handleResponse(
            response,
            "Unable to load payroll template."
        );

        return normalizeTemplate(data);
    },

    /* ========================================================
       CREATE TEMPLATE
    ======================================================== */

    createTemplate: async (payload) => {
        console.log(
            "Creating payroll template:",
            payload
        );

        const response = await fetch(
            `${API_BASE_URL}/PayrollTemplates`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json",
                },

                body: JSON.stringify(payload),
            }
        );

        const data = await handleResponse(
            response,
            "Unable to create payroll template."
        );

        return normalizeTemplate(data);
    },

    /* ========================================================
       UPDATE TEMPLATE
    ======================================================== */

    updateTemplate: async (
        id,
        payload
    ) => {
        if (!id) {
            throw new Error(
                "Payroll template ID is required."
            );
        }

        const response = await fetch(
            `${API_BASE_URL}/PayrollTemplates/${id}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type":
                        "application/json",
                },

                body: JSON.stringify(payload),
            }
        );

        const data = await handleResponse(
            response,
            "Unable to update payroll template."
        );

        return normalizeTemplate(data);
    },

    /* ========================================================
       DELETE TEMPLATE
    ======================================================== */

    deleteTemplate: async (id) => {
        if (!id) {
            throw new Error(
                "Payroll template ID is required."
            );
        }

        const response = await fetch(
            `${API_BASE_URL}/PayrollTemplates/${id}`,
            {
                method: "DELETE",
            }
        );

        return handleResponse(
            response,
            "Unable to delete payroll template."
        );
    },
};

export default PayrollService;