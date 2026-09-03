import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PeopleIcon from "@mui/icons-material/People";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import DescriptionIcon from "@mui/icons-material/Description";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import "./PayrollProcess.css";

const EMPLOYEE_API = "https://localhost:7002/api/Employee";
const PAYROLL_API = "http://localhost:5111/api";

const MONTHS = [
    "August 2026",
    "September 2026",
    "October 2026",
];

const getValue = (object, ...keys) => {
    for (const key of keys) {
        if (object && object[key] !== undefined && object[key] !== null) {
            return object[key];
        }
    }
    return null;
};

const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(Number(amount) || 0);

const normalizeCalculationType = (value) => {
    const text = String(value || "Fixed Amount").trim().toLowerCase();
    if (text === "percentage" || text === "%") return "Percentage";
    if (text === "fixed" || text === "fixed amount" || text === "fixedamount") return "Fixed Amount";
    if (text === "balance") return "Balance";
    if (text === "formula") return "Formula";
    return value || "Fixed Amount";
};

const normalizeEmployee = (employee, index) => {
    const id = getValue(employee, "id", "Id", "employeeInternalId", "EmployeeInternalId");
    const employeeId = getValue(employee, "employeeId", "EmployeeId", "employeeID", "EmployeeID");
    const firstName = getValue(employee, "firstName", "FirstName", "givenName", "GivenName");
    const lastName = getValue(employee, "lastName", "LastName", "surname", "Surname", "familyName", "FamilyName");

    return {
        id: id ?? employeeId ?? index + 1,
        employeeId: employeeId ?? id ?? index + 1,
        name:
            getValue(employee, "name", "Name", "displayName", "DisplayName", "fullName", "FullName", "employeeName", "EmployeeName") ||
            [firstName, lastName].filter(Boolean).join(" ") ||
            "Unknown Employee",
        department: getValue(employee, "department", "Department") || "",
        designation: getValue(employee, "designation", "Designation", "jobTitle", "JobTitle") || "",
        raw: employee,
    };
};

const normalizeComponent = (component, index) => {
    const nested = getValue(component, "salaryComponent", "SalaryComponent") || {};
    return {
        salaryComponentId:
            getValue(component, "salaryComponentId", "SalaryComponentId") ??
            getValue(nested, "salaryComponentId", "SalaryComponentId"),
        componentName:
            getValue(component, "componentName", "ComponentName", "name", "Name") ||
            getValue(nested, "componentName", "ComponentName") ||
            "Salary Component",
        componentCode:
            getValue(component, "componentCode", "ComponentCode") ||
            getValue(nested, "componentCode", "ComponentCode") ||
            "",
        componentType:
            getValue(component, "componentType", "ComponentType") ||
            getValue(nested, "componentType", "ComponentType") ||
            "Earning",
        calculationType: normalizeCalculationType(
            getValue(component, "calculationType", "CalculationType")
        ),
        calculationBasedOn: getValue(component, "calculationBasedOn", "CalculationBasedOn") || "",
        value: Number(getValue(component, "value", "Value") || 0),
        amount: Number(getValue(component, "amount", "Amount") || 0),
        sequence: Number(getValue(component, "sequence", "Sequence") || index + 1),
        isActive: getValue(component, "isActive", "IsActive") !== false,
    };
};

const normalizeTemplate = (template, index = 0) => {
    const components = getValue(template, "components", "Components") || [];
    const templateId = getValue(
        template,
        "payrollTemplateId",
        "PayrollTemplateId",
        "id",
        "Id"
    );

    return {
        id: templateId ?? index + 1,
        templateName:
            getValue(template, "templateName", "TemplateName", "name", "Name") ||
            "Unnamed Template",
        status: getValue(template, "status", "Status") || "Active",
        components: Array.isArray(components)
            ? components
                  .map(normalizeComponent)
                  .filter((component) => component.isActive)
                  .sort((a, b) => a.sequence - b.sequence)
            : [],
    };
};

const normalizeAssignment = (assignment) => ({
    employeeSalaryId: getValue(assignment, "employeeSalaryId", "EmployeeSalaryId"),
    employeeId: getValue(assignment, "employeeId", "EmployeeId"),
    payrollTemplateId: getValue(assignment, "payrollTemplateId", "PayrollTemplateId"),
    templateName: getValue(assignment, "templateName", "TemplateName") || "Unknown Template",
    annualCtc: Number(getValue(assignment, "annualCtc", "AnnualCtc") || 0),
    monthlyCtc: Number(getValue(assignment, "monthlyCtc", "MonthlyCtc") || 0),
});

const normalizePayslip = (payslip) => {
    if (!payslip || typeof payslip !== "object") return null;

    const components = Array.isArray(payslip.components)
        ? payslip.components
              .map(normalizeComponent)
              .sort((a, b) => a.sequence - b.sequence)
        : [];

    return {
        ...payslip,
        employeeId: getValue(payslip, "employeeId", "EmployeeId"),
        payslipNumber: getValue(payslip, "payslipNumber", "PayslipNumber") || "",
        payrollYear: Number(getValue(payslip, "payrollYear", "PayrollYear") || 0),
        payrollMonth: Number(getValue(payslip, "payrollMonth", "PayrollMonth") || 0),
        employeeCode: getValue(payslip, "employeeCode", "EmployeeCode") || "",
        employeeName: getValue(payslip, "employeeName", "EmployeeName") || "",
        department: getValue(payslip, "department", "Department") || "",
        designation: getValue(payslip, "designation", "Designation") || "",
        annualCtc: Number(getValue(payslip, "annualCtc", "AnnualCtc") || 0),
        monthlyCtc: Number(getValue(payslip, "monthlyCtc", "MonthlyCtc") || 0),
        totalEarnings: Number(getValue(payslip, "totalEarnings", "TotalEarnings") || 0),
        grossSalary: Number(getValue(payslip, "grossSalary", "GrossSalary") || 0),
        totalDeductions: Number(getValue(payslip, "totalDeductions", "TotalDeductions") || 0),
        netSalary: Number(getValue(payslip, "netSalary", "NetSalary") || 0),
        status: getValue(payslip, "status", "Status") || "Generated",
        generatedDate: getValue(payslip, "generatedDate", "GeneratedDate"),
        totalDays: Number(getValue(payslip, "totalDays", "TotalDays") || 0),
        workingDays: Number(getValue(payslip, "workingDays", "WorkingDays") || 0),
        presentDays: Number(getValue(payslip, "presentDays", "PresentDays") || 0),
        absentDays: Number(getValue(payslip, "absentDays", "AbsentDays") || 0),
        halfDays: Number(getValue(payslip, "halfDays", "HalfDays") || 0),
        paidLeaveDays: Number(getValue(payslip, "paidLeaveDays", "PaidLeaveDays") || 0),
        unpaidLeaveDays: Number(getValue(payslip, "unpaidLeaveDays", "UnpaidLeaveDays") || 0),
        weeklyOffDays: Number(getValue(payslip, "weeklyOffDays", "WeeklyOffDays") || 0),
        holidayDays: Number(getValue(payslip, "holidayDays", "HolidayDays") || 0),
        // IMPORTANT: attendanceDeduction returned by older Payslip responses can be stale.
        // The authoritative processed deduction is TotalDeductions. Attendance deduction
        // is calculated below as the part of TotalDeductions not already represented by
        // payroll-component deductions. This keeps the UI consistent with the backend.
        attendanceDeduction: Number(getValue(payslip, "attendanceDeduction", "AttendanceDeduction") || 0),
        components,
        earnings: components.filter((c) => String(c.componentType).toLowerCase() !== "deduction"),
        deductions: components.filter((c) => String(c.componentType).toLowerCase() === "deduction"),
    };
};

const calculateTemplate = (template, annualCtc) => {
    const monthlyCtc = Number(annualCtc || 0) / 12;
    const calculated = [];
    let grossSalary = 0;
    let totalDeductions = 0;

    const round = (value) => Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;

    for (const component of template?.components || []) {
        let amount = 0;
        const type = normalizeCalculationType(component.calculationType);

        if (type === "Fixed Amount") {
            amount = Number(component.value) || 0;
        } else if (type === "Percentage") {
            let base = monthlyCtc;
            const basedOn = String(component.calculationBasedOn || "").trim().toLowerCase();
            if (basedOn && basedOn !== "monthly ctc" && basedOn !== "annual ctc") {
                const previous = calculated.find((item) =>
                    String(item.componentCode || "").trim().toLowerCase() === basedOn ||
                    String(item.componentName || "").trim().toLowerCase() === basedOn ||
                    String(item.salaryComponentId || "").trim().toLowerCase() === basedOn
                );
                if (previous) base = previous.amount;
            }
            amount = (base * Number(component.value || 0)) / 100;
        }

        amount = round(amount);
        const row = { ...component, amount };
        calculated.push(row);

        if (String(component.componentType).toLowerCase() === "deduction") {
            totalDeductions += amount;
        } else {
            grossSalary += amount;
        }
    }

    grossSalary = round(grossSalary);
    totalDeductions = round(totalDeductions);
    const netSalary = round(grossSalary - totalDeductions);

    return {
        components: calculated,
        earnings: calculated.filter((c) => String(c.componentType).toLowerCase() !== "deduction"),
        deductions: calculated.filter((c) => String(c.componentType).toLowerCase() === "deduction"),
        monthlyCtc: round(monthlyCtc),
        monthlyGrossSalary: grossSalary,
        monthlyDeductions: totalDeductions,
        monthlyNetSalary: netSalary,
    };
};

const getMonthParts = (value) => {
    const [monthName, yearText] = String(value).split(" ");
    const year = Number(yearText);
    const month = new Date(`${monthName} 1, ${year}`).getMonth() + 1;
    return { monthName, year, month };
};

const PayrollProcess = () => {
    const [selectedMonth, setSelectedMonth] = useState("August 2026");
    const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
    const [employees, setEmployees] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [payslips, setPayslips] = useState({});

    const [loading, setLoading] = useState(true);
    const [payslipsLoading, setPayslipsLoading] = useState(false);
    const [error, setError] = useState("");

    const [runDialogOpen, setRunDialogOpen] = useState(false);
    const [payrollRunning, setPayrollRunning] = useState(false);
    const [payrollRunError, setPayrollRunError] = useState("");
    const [payrollRunResult, setPayrollRunResult] = useState(null);

    const loadEmployees = async () => {
        const response = await axios.get(EMPLOYEE_API);
        const data = response?.data;
        const list = Array.isArray(data) ? data : data?.data || data?.items || data?.value || [];
        return list.map(normalizeEmployee);
    };

    const loadAssignments = async () => {
        const response = await axios.get(`${PAYROLL_API}/EmployeeSalaries`);
        const data = response?.data;
        const list = Array.isArray(data) ? data : data?.data || data?.items || data?.value || [];
        return list.map(normalizeAssignment);
    };

    const loadTemplates = async () => {
        const response = await axios.get(`${PAYROLL_API}/PayrollTemplates`);
        const data = response?.data;
        const list = Array.isArray(data) ? data : data?.data || data?.items || data?.value || [];
        const active = list
            .map(normalizeTemplate)
            .filter((template) => String(template.status).toLowerCase() !== "inactive");

        const detailed = await Promise.all(
            active.map(async (template) => {
                try {
                    const response = await axios.get(`${PAYROLL_API}/PayrollTemplates/${template.id}`);
                    return normalizeTemplate(response?.data || template);
                } catch {
                    return template;
                }
            })
        );
        return detailed;
    };

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            setLoading(true);
            setError("");
            try {
                const [employeeList, assignmentList, templateList] = await Promise.all([
                    loadEmployees(),
                    loadAssignments(),
                    loadTemplates(),
                ]);
                if (!cancelled) {
                    setEmployees(employeeList);
                    setAssignments(assignmentList);
                    setTemplates(templateList);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err?.response?.data?.message ||
                            err?.response?.data?.title ||
                            err?.message ||
                            "Unable to load payroll data."
                    );
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();
        return () => {
            cancelled = true;
        };
    }, []);

    const loadPayslips = async (monthValue = selectedMonth) => {
        if (!employees.length) {
            setPayslips({});
            return;
        }

        const { year, month } = getMonthParts(monthValue);
        setPayslipsLoading(true);

        try {
            const results = await Promise.all(
                employees.map(async (employee) => {
                    const employeeId = employee.employeeId || employee.id;
                    try {
                        const response = await axios.get(
                            `${PAYROLL_API}/Payslip/${employeeId}/${year}/${month}`
                        );
                        const data = response?.data;
                        const payslip = normalizePayslip(Array.isArray(data) ? data[0] : data);
                        return payslip ? [String(employeeId), payslip] : null;
                    } catch (err) {
                        if (err?.response?.status !== 404) {
                            console.warn(`Payslip load failed for employee ${employeeId}`, err);
                        }
                        return null;
                    }
                })
            );

            const next = {};
            results.filter(Boolean).forEach(([employeeId, payslip]) => {
                next[employeeId] = payslip;
            });
            setPayslips(next);
        } finally {
            setPayslipsLoading(false);
        }
    };

    useEffect(() => {
        if (employees.length) loadPayslips(selectedMonth);
    }, [employees, selectedMonth]);

    const payrollEmployees = useMemo(() => {
        return assignments
            .map((assignment) => {
                const employee = employees.find(
                    (item) =>
                        String(item.id) === String(assignment.employeeId) ||
                        String(item.employeeId) === String(assignment.employeeId)
                );
                if (!employee) return null;

                const template = templates.find(
                    (item) => String(item.id) === String(assignment.payrollTemplateId)
                );
                const preview = calculateTemplate(template, assignment.annualCtc);
                const key = String(employee.employeeId || employee.id);
                const payslip = payslips[key];
                const processed = Boolean(payslip);

                // ---------------------------------------------------------
                // PROCESSED DEDUCTION BREAKDOWN
                // ---------------------------------------------------------
                // PayrollRecord.TotalDeductions is the source of truth.
                // PayrollRecordComponents contains only template deductions
                // (PF, tax, etc.). Attendance/unpaid-absence deduction is
                // intentionally stored in TotalDeductions and is not saved
                // as a synthetic component. Therefore derive the attendance
                // amount instead of trusting an older/stale Payslip field.
                const processedComponentDeductions =
                    processed
                        ? (payslip.deductions || []).reduce(
                              (sum, deduction) =>
                                  sum + (Number(deduction.amount) || 0),
                              0
                          )
                        : 0;

                const processedTotalDeductions =
                    processed
                        ? Number(payslip.totalDeductions || 0)
                        : 0;

                const derivedAttendanceDeduction =
                    processed
                        ? Math.max(
                              0,
                              Math.round(
                                  (processedTotalDeductions -
                                      processedComponentDeductions +
                                      Number.EPSILON) *
                                      100
                              ) / 100
                          )
                        : 0;

                const processedPayslip =
                    processed
                        ? {
                              ...payslip,
                              // Use the processed payroll total rather than
                              // a stale attendanceDeduction from an older
                              // Payslip calculation.
                              attendanceDeduction:
                                  derivedAttendanceDeduction,
                          }
                        : null;

                return {
                    ...employee,
                    ...assignment,
                    template,
                    templateName: assignment.templateName || template?.templateName || "No Template",
                    annualCtc: Number(processedPayslip?.annualCtc || assignment.annualCtc) || 0,
                    monthlyCtc: Number(processedPayslip?.monthlyCtc || preview.monthlyCtc) || 0,
                    earnings: processed ? processedPayslip.earnings : preview.earnings,
                    deductions: processed ? processedPayslip.deductions : preview.deductions,
                    grossSalary: processed ? processedPayslip.grossSalary : preview.monthlyGrossSalary,
                    totalDeductions: processed ? processedPayslip.totalDeductions : preview.monthlyDeductions,
                    netSalary: processed ? processedPayslip.netSalary : preview.monthlyNetSalary,
                    payslip: processedPayslip || null,
                    processed,
                };
            })
            .filter(Boolean);
    }, [assignments, employees, templates, payslips]);

    useEffect(() => {
        if (!payrollEmployees.length) {
            setSelectedEmployeeId("");
            return;
        }
        const exists = payrollEmployees.some(
            (employee) => String(employee.employeeId) === String(selectedEmployeeId)
        );
        if (!exists) setSelectedEmployeeId(payrollEmployees[0].employeeId);
    }, [payrollEmployees, selectedEmployeeId]);

    const selectedEmployee = useMemo(
        () =>
            payrollEmployees.find(
                (employee) => String(employee.employeeId) === String(selectedEmployeeId)
            ) || payrollEmployees[0] || null,
        [payrollEmployees, selectedEmployeeId]
    );

    const totals = useMemo(
        () =>
            payrollEmployees.reduce(
                (total, employee) => ({
                    grossSalary: total.grossSalary + Number(employee.grossSalary || 0),
                    totalDeductions: total.totalDeductions + Number(employee.totalDeductions || 0),
                    netSalary: total.netSalary + Number(employee.netSalary || 0),
                }),
                { grossSalary: 0, totalDeductions: 0, netSalary: 0 }
            ),
        [payrollEmployees]
    );

    const processingPeriod = useMemo(() => {
        const { monthName, year } = getMonthParts(selectedMonth);
        const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth();
        const start = new Date(year, monthIndex, 1);
        const end = new Date(year, monthIndex + 1, 0);
        const fmt = (date) =>
            date.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            });
        return `${fmt(start)} - ${fmt(end)}`;
    }, [selectedMonth]);

    const processedCount = payrollEmployees.filter((employee) => employee.processed).length;
    const payrollProcessed = payrollEmployees.length > 0 && processedCount === payrollEmployees.length;

    const handleRunPayroll = async () => {
        if (payrollRunning) return;
        setPayrollRunning(true);
        setPayrollRunError("");
        setPayrollRunResult(null);

        try {
            const { year, month } = getMonthParts(selectedMonth);
            const response = await axios.post(`${PAYROLL_API}/Payroll/run`, {
                year,
                month,
            });
            setPayrollRunResult(response?.data || null);
            setRunDialogOpen(false);
            await loadPayslips(selectedMonth);
        } catch (err) {
            setPayrollRunError(
                err?.response?.data?.message ||
                    err?.response?.data?.title ||
                    err?.response?.data?.error ||
                    err?.message ||
                    "Unable to process payroll."
            );
        } finally {
            setPayrollRunning(false);
        }
    };

    if (loading) {
        return (
            <Box className="pr-payroll-process-page">
                <Box className="pr-payroll-loading-state">
                    <CircularProgress size={22} />
                    <Typography>Loading Employee Payroll...</Typography>
                </Box>
            </Box>
        );
    }

    return (
        <Box className="pr-payroll-process-page">
            <Box className="pr-payroll-process-header">
                <Box className="pr-payroll-title-area">
                    <IconButton className="pr-payroll-back-button" onClick={() => window.history.back()}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Box>
                        <Typography className="pr-payroll-process-title">Payroll Process</Typography>
                        <Typography className="pr-payroll-process-subtitle">
                            Calculate and process employee salaries using assigned payslip templates.
                        </Typography>
                    </Box>
                </Box>

                <Stack className="pr-payroll-header-actions" direction="row" spacing={1.5}>
                    <FormControl size="small" className="pr-payroll-month-select">
                        <InputLabel id="payroll-month-label">Payroll Month</InputLabel>
                        <Select
                            labelId="payroll-month-label"
                            value={selectedMonth}
                            label="Payroll Month"
                            onChange={(event) => {
                                setSelectedMonth(event.target.value);
                                setPayslips({});
                                setPayrollRunResult(null);
                                setPayrollRunError("");
                            }}
                        >
                            {MONTHS.map((month) => (
                                <MenuItem key={month} value={month}>{month}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Button
                        className="pr-run-payroll-button"
                        variant="contained"
                        startIcon={<PlayArrowIcon />}
                        onClick={() => setRunDialogOpen(true)}
                        disabled={!payrollEmployees.length || payrollRunning}
                    >
                        Run Payroll
                    </Button>
                </Stack>
            </Box>

            {error && <Typography className="pr-payroll-api-error">{error}</Typography>}

            <Box className="pr-payroll-summary-grid">
                <Card className="pr-payroll-summary-card"><CardContent><Box className="pr-summary-card-content"><Box><Typography className="pr-summary-label">Employees</Typography><Typography className="pr-summary-value">{payrollEmployees.length}</Typography><Typography className="pr-summary-helper">Employees to process</Typography></Box><Box className="pr-summary-icon pr-summary-icon-blue"><PeopleIcon /></Box></Box></CardContent></Card>
                <Card className="pr-payroll-summary-card"><CardContent><Box className="pr-summary-card-content"><Box><Typography className="pr-summary-label">Gross Salary</Typography><Typography className="pr-summary-value">{formatCurrency(totals.grossSalary)}</Typography><Typography className="pr-summary-helper">Backend payroll / template preview</Typography></Box><Box className="pr-summary-icon pr-summary-icon-green"><AccountBalanceWalletIcon /></Box></Box></CardContent></Card>
                <Card className="pr-payroll-summary-card"><CardContent><Box className="pr-summary-card-content"><Box><Typography className="pr-summary-label">Total Deductions</Typography><Typography className="pr-summary-value pr-deduction-value">{formatCurrency(totals.totalDeductions)}</Typography><Typography className="pr-summary-helper">Payroll deductions</Typography></Box><Box className="pr-summary-icon pr-summary-icon-orange"><ReceiptLongIcon /></Box></Box></CardContent></Card>
                <Card className="pr-payroll-summary-card"><CardContent><Box className="pr-summary-card-content"><Box><Typography className="pr-summary-label">Net Salary</Typography><Typography className="pr-summary-value pr-net-value">{formatCurrency(totals.netSalary)}</Typography><Typography className="pr-summary-helper">Total amount payable</Typography></Box><Box className="pr-summary-icon pr-summary-icon-purple"><TrendingUpIcon /></Box></Box></CardContent></Card>
            </Box>

            <Card className="pr-process-card">
                <CardContent>
                    <Box className="pr-section-header">
                        <Box>
                            <Typography className="pr-section-title">Payroll Configuration</Typography>
                            <Typography className="pr-section-subtitle">Review the payroll period before processing.</Typography>
                        </Box>
                        <Chip
                            className={payrollProcessed ? "pr-status-chip pr-status-completed" : "pr-status-chip pr-status-ready"}
                            label={payrollProcessed ? "Processed" : processedCount ? `${processedCount} Processed` : "Ready"}
                            size="small"
                        />
                    </Box>
                    <Box className="pr-configuration-grid">
                        <Box className="pr-configuration-box"><Typography className="pr-configuration-label">Payroll Month</Typography><Typography className="pr-configuration-value">{selectedMonth}</Typography></Box>
                        <Box className="pr-configuration-box"><Typography className="pr-configuration-label">Payroll Period</Typography><Typography className="pr-configuration-value">Monthly</Typography></Box>
                        <Box className="pr-configuration-box pr-configuration-box-wide"><Typography className="pr-configuration-label">Processing Period</Typography><Typography className="pr-configuration-value">{processingPeriod}</Typography></Box>
                    </Box>
                </CardContent>
            </Card>

            <Card className="pr-process-card">
                <CardContent>
                    <Box className="pr-section-header">
                        <Box><Typography className="pr-section-title">Employee Payroll</Typography><Typography className="pr-section-subtitle">Salary is automatically calculated using each employee's assigned payslip template.</Typography></Box>
                        <Typography className="pr-employee-count">{payrollEmployees.length} Employees</Typography>
                    </Box>

                    {payslipsLoading && <Box className="pr-payroll-loading-state pr-payroll-inline-loading"><CircularProgress size={18} /><Typography>Loading processed payslips...</Typography></Box>}

                    <TableContainer className="pr-payroll-table-container">
                        <Table>
                            <TableHead><TableRow>
                                <TableCell>Employee</TableCell>
                                <TableCell>Payslip Template</TableCell>
                                <TableCell align="right">Annual CTC</TableCell>
                                <TableCell align="right">Gross Salary</TableCell>
                                <TableCell align="right">Deductions</TableCell>
                                <TableCell align="right">Net Salary</TableCell>
                                <TableCell align="center">Status</TableCell>
                            </TableRow></TableHead>
                            <TableBody>
                                {payrollEmployees.map((employee) => (
                                    <TableRow
                                        key={employee.employeeId}
                                        className={String(selectedEmployeeId) === String(employee.employeeId) ? "pr-selected-payroll-row" : ""}
                                        onClick={() => setSelectedEmployeeId(employee.employeeId)}
                                    >
                                        <TableCell><Typography className="pr-employee-name">{employee.name}</Typography><Typography className="pr-employee-meta">{employee.employeeId} • {employee.department}</Typography></TableCell>
                                        <TableCell><Box className="pr-template-cell"><Box className="pr-template-icon"><DescriptionIcon /></Box><Box><Typography className="pr-template-name">{employee.templateName}</Typography><Typography className="pr-template-helper">{employee.processed ? "Processed payslip" : "Applied automatically"}</Typography></Box></Box></TableCell>
                                        <TableCell align="right"><Typography className="pr-money-primary">{formatCurrency(employee.annualCtc)}</Typography><Typography className="pr-money-secondary">{formatCurrency(employee.monthlyCtc)} / month</Typography></TableCell>
                                        <TableCell align="right"><Typography className="pr-money-primary">{formatCurrency(employee.grossSalary)}</Typography></TableCell>
                                        <TableCell align="right"><Typography className="pr-deduction-table-value">-{formatCurrency(employee.totalDeductions)}</Typography></TableCell>
                                        <TableCell align="right"><Typography className="pr-net-table-value">{formatCurrency(employee.netSalary)}</Typography></TableCell>
                                        <TableCell align="center"><Chip className={employee.processed ? "pr-employee-status-chip pr-completed" : "pr-employee-status-chip"} size="small" icon={employee.processed ? <CheckCircleIcon /> : undefined} label={employee.processed ? "Processed" : "Ready"} /></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            {selectedEmployee && (
                <Card className="pr-process-card pr-salary-calculation-card">
                    <CardContent>
                        <Box className="pr-section-header">
                            <Box><Typography className="pr-section-title">Salary Calculation</Typography><Typography className="pr-section-subtitle">{selectedEmployee.processed ? "Processed payroll values returned by the backend." : "Preview based on the employee's assigned payslip template."}</Typography></Box>
                            <Stack direction="row" spacing={1}>
                                <Chip className="pr-template-chip" icon={<DescriptionIcon />} label={selectedEmployee.templateName} />
                                {selectedEmployee.processed && <Chip className="pr-processed-payslip-chip" icon={<CheckCircleIcon />} label={selectedEmployee.payslip?.status || "Generated"} />}
                            </Stack>
                        </Box>

                        <Box className="pr-selected-employee-card">
                            <Box className="pr-selected-employee-avatar">{(selectedEmployee.name || "N").charAt(0).toUpperCase()}</Box>
                            <Box>
                                <Typography className="pr-selected-employee-name">{selectedEmployee.name}</Typography>
                                <Typography className="pr-selected-employee-meta">{selectedEmployee.employeeId} • {selectedEmployee.department || "—"}</Typography>
                                {selectedEmployee.processed && selectedEmployee.payslip?.payslipNumber && <Typography className="pr-selected-payslip-number">{selectedEmployee.payslip.payslipNumber}</Typography>}
                            </Box>
                            <Box className="pr-selected-employee-ctc">
                                <Typography className="pr-ctc-label">Annual CTC</Typography>
                                <Typography className="pr-ctc-value">{formatCurrency(selectedEmployee.annualCtc)}</Typography>
                                <Typography className="pr-ctc-monthly">{formatCurrency(selectedEmployee.monthlyCtc)} / month</Typography>
                            </Box>
                        </Box>

                        <Box className="pr-calculation-grid">
                            <Box className="pr-calculation-section">
                                <Typography className="pr-calculation-section-title">Earnings</Typography>
                                <Typography className="pr-calculation-section-helper">Salary components from the assigned payslip template.</Typography>
                                <Box className="pr-calculation-list">
                                    {selectedEmployee.earnings.map((earning, index) => (
                                        <Box className="pr-calculation-row" key={`${earning.componentName}-${index}`}>
                                            <Box><Typography className="pr-calculation-component">{earning.componentName}</Typography><Typography className="pr-calculation-rule">{earning.calculationType || "Payroll"}{earning.calculationType === "Percentage" ? ` • ${earning.value}%` : ""}</Typography></Box>
                                            <Typography className="pr-calculation-amount">{formatCurrency(earning.amount)}</Typography>
                                        </Box>
                                    ))}
                                </Box>
                                <Divider className="pr-calculation-divider" />
                                <Box className="pr-calculation-total-row"><Typography>Gross Salary</Typography><Typography>{formatCurrency(selectedEmployee.grossSalary)}</Typography></Box>
                            </Box>

                            <Box className="pr-calculation-section">
                                <Typography className="pr-calculation-section-title">Deductions</Typography>
                                <Typography className="pr-calculation-section-helper">Deductions returned by payroll processing.</Typography>
                                <Box className="pr-calculation-list">
                                    {selectedEmployee.deductions.map((deduction, index) => (
                                        <Box className="pr-calculation-row" key={`${deduction.componentName}-${index}`}>
                                            <Box><Typography className="pr-calculation-component">{deduction.componentName}</Typography><Typography className="pr-calculation-rule">{deduction.calculationType || "Payroll deduction"}{deduction.calculationType === "Percentage" ? ` • ${deduction.value}%` : ""}</Typography></Box>
                                            <Typography className="pr-calculation-amount pr-deduction-text">-{formatCurrency(deduction.amount)}</Typography>
                                        </Box>
                                    ))}
                                    {selectedEmployee.processed && selectedEmployee.deductions.length === 0 && Number(selectedEmployee.totalDeductions) > 0 && (
                                        <Box className="pr-calculation-row pr-backend-deduction-row">
                                            <Box><Typography className="pr-calculation-component">Payroll Deductions</Typography><Typography className="pr-calculation-rule">Returned by payroll processing</Typography></Box>
                                            <Typography className="pr-calculation-amount pr-deduction-text">-{formatCurrency(selectedEmployee.totalDeductions)}</Typography>
                                        </Box>
                                    )}
                                    {selectedEmployee.processed && Number(selectedEmployee.payslip?.attendanceDeduction) > 0 && (
                                        <Box className="pr-calculation-row">
                                            <Box><Typography className="pr-calculation-component">Attendance Deduction</Typography><Typography className="pr-calculation-rule">Leave / attendance adjustment</Typography></Box>
                                            <Typography className="pr-calculation-amount pr-deduction-text">-{formatCurrency(selectedEmployee.payslip.attendanceDeduction)}</Typography>
                                        </Box>
                                    )}
                                </Box>
                                <Divider className="pr-calculation-divider" />
                                <Box className="pr-calculation-total-row"><Typography>Total Deductions</Typography><Typography className="pr-deduction-text">-{formatCurrency(selectedEmployee.totalDeductions)}</Typography></Box>
                            </Box>
                        </Box>

                        <Box className="pr-net-salary-panel"><Box><Typography className="pr-net-salary-label">Net Salary</Typography><Typography className="pr-net-salary-helper">Gross salary minus total deductions</Typography></Box><Typography className="pr-net-salary-amount">{formatCurrency(selectedEmployee.netSalary)}</Typography></Box>

                        {selectedEmployee.processed && (
                            <Box className="pr-payroll-attendance-grid">
                                <Box><span>Total Days</span><strong>{selectedEmployee.payslip?.totalDays ?? 0}</strong></Box>
                                <Box><span>Working Days</span><strong>{selectedEmployee.payslip?.workingDays ?? 0}</strong></Box>
                                <Box><span>Present</span><strong>{selectedEmployee.payslip?.presentDays ?? 0}</strong></Box>
                                <Box><span>Absent</span><strong>{selectedEmployee.payslip?.absentDays ?? 0}</strong></Box>
                                <Box><span>Paid Leave</span><strong>{selectedEmployee.payslip?.paidLeaveDays ?? 0}</strong></Box>
                                <Box><span>Unpaid Leave</span><strong>{selectedEmployee.payslip?.unpaidLeaveDays ?? 0}</strong></Box>
                            </Box>
                        )}

                        <Box className="pr-calculation-info"><InfoOutlinedIcon /><Typography>{selectedEmployee.processed ? "The values shown above are the processed payroll values returned by the Payslip API, including backend deductions and payroll adjustments." : "Salary values are previewed from the Employee Payroll assignment and payslip template. Final deductions and payroll adjustments are applied during processing."}</Typography></Box>
                    </CardContent>
                </Card>
            )}

            {payrollRunResult && <Box className="pr-payroll-run-result"><Box className="pr-payroll-run-result-icon"><CheckCircleIcon /></Box><Box><Typography className="pr-payroll-run-result-title">Payroll processed successfully</Typography><Typography className="pr-payroll-run-result-text">{selectedMonth} payroll was processed by the backend.</Typography></Box></Box>}

            <Dialog open={runDialogOpen} onClose={() => !payrollRunning && setRunDialogOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Run Payroll</DialogTitle>
                <DialogContent>
                    <Box className="pr-dialog-content">
                        <Box className="pr-dialog-icon"><CalendarTodayIcon /></Box>
                        <Typography className="pr-dialog-title">Process {selectedMonth} Payroll?</Typography>
                        <Typography className="pr-dialog-description">The system will calculate payroll for all employees using their currently assigned payslip templates.</Typography>
                        <Box className="pr-dialog-summary">
                            <Box className="pr-dialog-summary-row"><Typography>Employees</Typography><Typography>{payrollEmployees.length}</Typography></Box>
                            <Box className="pr-dialog-summary-row"><Typography>Gross Salary</Typography><Typography>{formatCurrency(totals.grossSalary)}</Typography></Box>
                            <Box className="pr-dialog-summary-row"><Typography>Total Deductions</Typography><Typography className="pr-deduction-text">{formatCurrency(totals.totalDeductions)}</Typography></Box>
                            <Divider />
                            <Box className="pr-dialog-summary-row pr-dialog-total"><Typography>Net Salary</Typography><Typography>{formatCurrency(totals.netSalary)}</Typography></Box>
                        </Box>
                    </Box>
                </DialogContent>
                {payrollRunError && <Box className="pr-payroll-run-error"><Typography>{payrollRunError}</Typography></Box>}
                <DialogActions className="pr-dialog-actions">
                    <Button onClick={() => setRunDialogOpen(false)} variant="outlined" disabled={payrollRunning}>Cancel</Button>
                    <Button onClick={handleRunPayroll} variant="contained" startIcon={payrollRunning ? <CircularProgress size={16} color="inherit" /> : <PlayArrowIcon />} disabled={payrollRunning || !payrollEmployees.length}>{payrollRunning ? "Processing..." : "Run Payroll"}</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PayrollProcess;
