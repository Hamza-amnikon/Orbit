import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import "./Payrolls.css";
import useProfile from "../../Services/useProfile";

import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Divider,
    FormControl,
    InputLabel,
    MenuItem,
    Paper,
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

import {
    DownloadOutlined,
    PrintOutlined,
    RefreshOutlined,
} from "@mui/icons-material";

import sparkLogo from "../../../Images/amnikon-logo.png";

/* =========================================================
   API
   ========================================================= */

const PAYROLL_API = "http://localhost:5111/api";
const EMPLOYEE_API = "https://localhost:7002/api/Employee";

/* =========================================================
   HELPERS
   ========================================================= */

const getValue = (obj, ...keys) => {
    if (!obj || typeof obj !== "object") {
        return null;
    }

    for (const key of keys) {
        if (
            obj[key] !== undefined &&
            obj[key] !== null &&
            obj[key] !== ""
        ) {
            return obj[key];
        }
    }

    return null;
};

const validId = (value) =>
    Number.isInteger(Number(value)) &&
    Number(value) > 0;


/* =========================================================
   PAYSLIP DISPLAY HELPERS
========================================================= */

const monthName = (month) => {
    const names = [
        "January", "February", "March", "April",
        "May", "June", "July", "August",
        "September", "October", "November", "December",
    ];

    const index = Number(month) - 1;
    return names[index] || "";
};

const dateText = (value) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const currency = (value) =>
    Number(value || 0).toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

const numberToWords = (value) => {
    const ones = [
        "", "One", "Two", "Three", "Four", "Five",
        "Six", "Seven", "Eight", "Nine", "Ten",
        "Eleven", "Twelve", "Thirteen", "Fourteen",
        "Fifteen", "Sixteen", "Seventeen", "Eighteen",
        "Nineteen",
    ];

    const tens = [
        "", "", "Twenty", "Thirty", "Forty",
        "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
    ];

    const underThousand = (n) => {
        let result = "";

        if (n >= 100) {
            result += `${ones[Math.floor(n / 100)]} Hundred`;
            n %= 100;
            if (n) result += " ";
        }

        if (n >= 20) {
            result += tens[Math.floor(n / 10)];
            n %= 10;
            if (n) result += ` ${ones[n]}`;
        } else if (n > 0) {
            result += ones[n];
        }

        return result;
    };

    let n = Math.floor(Math.abs(Number(value || 0)));

    if (n === 0) return "Zero Rupees";

    const parts = [];

    if (n >= 10000000) {
        parts.push(`${underThousand(Math.floor(n / 10000000))} Crore`);
        n %= 10000000;
    }

    if (n >= 100000) {
        parts.push(`${underThousand(Math.floor(n / 100000))} Lakh`);
        n %= 100000;
    }

    if (n >= 1000) {
        parts.push(`${underThousand(Math.floor(n / 1000))} Thousand`);
        n %= 1000;
    }

    if (n > 0) {
        parts.push(underThousand(n));
    }

    return `${parts.join(" ")} Rupees`;
};

const amountWords = (value) => numberToWords(value);

const InfoRow = ({ label, value }) => (
    <Box className="payslip-info-row">
        <Typography className="payslip-info-label">
            {label}
        </Typography>
        <Typography className="payslip-info-value">
            {value === null || value === undefined || value === ""
                ? "-"
                : value}
        </Typography>
    </Box>
);

const SalaryTable = ({
    title,
    rows = [],
    totalLabel = "Total",
    total = 0,
}) => (
    <Box className="payslip-salary-section">
        {title && (
            <Typography className="payslip-section-title">
                {title}
            </Typography>
        )}

        <Box className="payslip-salary-table">
            <Box className="payslip-salary-header">
                <Typography>Description</Typography>
                <Typography>Amount</Typography>
            </Box>

            {rows.map((row, index) => {
                const label =
                    row?.componentName ??
                    row?.label ??
                    row?.name ??
                    row?.description ??
                    "-";

                const value =
                    row?.amount ??
                    row?.value ??
                    row?.total ??
                    0;

                return (
                    <Box
                        className="payslip-salary-row"
                        key={`${label}-${index}`}
                    >
                        <Typography>{label}</Typography>
                        <Typography>{currency(value)}</Typography>
                    </Box>
                );
            })}

            <Box className="payslip-salary-total">
                <Typography>{totalLabel}</Typography>
                <Typography>{currency(total)}</Typography>
            </Box>
        </Box>
    </Box>
);


/* =========================================================
   EMPLOYEE ID RESOLUTION
   ========================================================= */

const extractEmployeeId = (
    obj,
    seen = new Set()
) => {
    if (
        !obj ||
        typeof obj !== "object" ||
        seen.has(obj)
    ) {
        return null;
    }

    seen.add(obj);

    const direct = getValue(
        obj,
        "employeeId",
        "EmployeeId",
        "employeeID",
        "EmployeeID",
        "employee_id",
        "userEmployeeId",
        "UserEmployeeId",
        "id",
        "Id"
    );

    if (validId(direct)) {
        return Number(direct);
    }

    const nestedObjects = [
        obj.user,
        obj.User,
        obj.profile,
        obj.Profile,
        obj.employee,
        obj.Employee,
        obj.data,
        obj.Data,
    ];

    for (const nested of nestedObjects) {
        const id = extractEmployeeId(
            nested,
            seen
        );

        if (id) {
            return id;
        }
    }

    return null;
};

const getStoredObjects = () => {
    const result = [];

    for (const storage of [
        localStorage,
        sessionStorage,
    ]) {
        for (
            let i = 0;
            i < storage.length;
            i += 1
        ) {
            const key = storage.key(i);

            if (!key) {
                continue;
            }

            try {
                const value = JSON.parse(
                    storage.getItem(key)
                );

                if (
                    value &&
                    typeof value === "object"
                ) {
                    result.push(value);
                }
            } catch {
                // Ignore non-JSON values.
            }
        }
    }

    return result;
};

const getIdentity = () => {
    const identity = {
        employeeId: null,
        employeeCode: null,
        name: null,
        email: null,
    };

    const walk = (
        obj,
        seen = new Set()
    ) => {
        if (
            !obj ||
            typeof obj !== "object" ||
            seen.has(obj)
        ) {
            return;
        }

        seen.add(obj);

        identity.azure ||=
            extractEmployeeId(obj);

        identity.employeeCode ||=
            getValue(
                obj,
                "employeeCode",
                "EmployeeCode",
                "employee_code"
            );

        identity.name ||=
            getValue(
                obj,
                "employeeName",
                "EmployeeName",
                "displayName",
                "DisplayName",
                "fullName",
                "FullName",
                "name",
                "Name"
            );

        identity.email ||=
            getValue(
                obj,
                "email",
                "Email",
                "emailAddress",
                "EmailAddress",
                "userName",
                "UserName"
            );

        [
            obj.user,
            obj.User,
            obj.profile,
            obj.Profile,
            obj.employee,
            obj.Employee,
            obj.data,
            obj.Data,
        ].forEach((nested) =>
            walk(nested, seen)
        );
    };

    getStoredObjects().forEach((obj) =>
        walk(obj)
    );

    return identity;
};

/* =========================================================
   JWT
   ========================================================= */

const decodeJwt = (token) => {
    try {
        const part = token.split(".")[1];

        if (!part) {
            return null;
        }

        const base64 = part
            .replace(/-/g, "+")
            .replace(/_/g, "/");

        const json = decodeURIComponent(
            atob(base64)
                .split("")
                .map(
                    (c) =>
                        `%${(
                            "00" +
                            c.charCodeAt(0).toString(16)
                        ).slice(-2)}`
                )
                .join("")
        );

        return JSON.parse(json);
    } catch {
        return null;
    }
};

const getEmployeeIdFromStorage = () => {
    const keys = [
        "employeeId",
        "EmployeeId",
        "employeeID",
        "EmployeeID",
        "employee_id",
        "userEmployeeId",
        "UserEmployeeId",
        "currentEmployeeId",
        "CurrentEmployeeId",
        "loggedInEmployeeId",
        "LoggedInEmployeeId",
    ];

    for (const storage of [
        localStorage,
        sessionStorage,
    ]) {
        for (const key of keys) {
            const value =
                storage.getItem(key);

            if (validId(value)) {
                return Number(value);
            }
        }
    }

    return null;
};

const getEmployeeIdFromToken = () => {
    const keys = [
        "token",
        "accessToken",
        "access_token",
        "jwt",
        "authToken",
        "idToken",
    ];

    for (const storage of [
        localStorage,
        sessionStorage,
    ]) {
        for (const key of keys) {
            const token =
                storage.getItem(key);

            if (!token) {
                continue;
            }

            const payload =
                decodeJwt(token);

            const id =
                extractEmployeeId(payload);

            if (id) {
                return id;
            }
        }
    }

    return null;
};

const normalize = (value) =>
    value
        ? String(value)
              .trim()
              .toLowerCase()
              .replace(/\s+/g, " ")
        : "";

const getEmployeeName = (
    employee
) => {
    const direct = getValue(
        employee,
        "employeeName",
        "EmployeeName",
        "displayName",
        "DisplayName",
        "fullName",
        "FullName",
        "name",
        "Name"
    );

    if (direct) {
        return String(direct).trim();
    }

    return [
        getValue(
            employee,
            "firstName",
            "FirstName",
            "givenName",
            "GivenName"
        ),
        getValue(
            employee,
            "lastName",
            "LastName",
            "surname",
            "Surname"
        ),
    ]
        .filter(Boolean)
        .join(" ")
        .trim();
};

/* =========================================================
   FIND EMPLOYEE
   ========================================================= */

const findEmployee = async (
    identity
) => {
    try {
        const response =
            await fetch(EMPLOYEE_API);

        if (!response.ok) {
            return null;
        }

        const result =
            await response.json();

        const employees = Array.isArray(
            result
        )
            ? result
            : Array.isArray(result?.data)
            ? result.data
            : Array.isArray(
                  result?.employees
              )
            ? result.employees
            : [];

        if (identity.employeeCode) {
            const code = normalize(
                identity.employeeCode
            );

            const match =
                employees.find(
                    (employee) =>
                        normalize(
                            getValue(
                                employee,
                                "employeeCode",
                                "EmployeeCode"
                            )
                        ) === code
                );

            if (match) {
                return match;
            }
        }

        if (identity.email) {
            const email = normalize(
                identity.email
            );

            const match =
                employees.find(
                    (employee) =>
                        normalize(
                            getValue(
                                employee,
                                "email",
                                "Email",
                                "emailAddress",
                                "EmailAddress"
                            )
                        ) === email
                );

            if (match) {
                return match;
            }
        }

        if (identity.name) {
            const name = normalize(
                identity.name
            );

            const match =
                employees.find(
                    (employee) =>
                        normalize(
                            getEmployeeName(
                                employee
                            )
                        ) === name
                );

            if (match) {
                return match;
            }
        }

        return null;
    } catch (error) {
        console.error(
            "Employee Service lookup failed:",
            error
        );

        return null;
    }
};

const resolveEmployeeId = async (profile) => {
    try {
        const employeeId = getValue(
            profile,
            "employeeId",
            "EmployeeId",
            "employeeID",
            "EmployeeID",
            "id",
            "Id"
        );

        if (!validId(employeeId)) {
            console.error(
                "Payroll: Profile does not contain a valid EmployeeId:",
                profile
            );
            return null;
        }

        console.log(
            "Payroll: Logged-in EmployeeId:",
            employeeId
        );

        const response = await fetch(EMPLOYEE_API);

        if (!response.ok) {
            throw new Error(
                `Employee API returned ${response.status}.`
            );
        }

        const result = await response.json();

        const employees = Array.isArray(result)
            ? result
            : Array.isArray(result?.data)
            ? result.data
            : Array.isArray(result?.employees)
            ? result.employees
            : [];

        const matchedEmployee = employees.find((employee) => {
            const apiEmployeeId = getValue(
                employee,
                "employeeId",
                "EmployeeId",
                "employeeID",
                "EmployeeID",
                "id",
                "Id"
            );

            return String(apiEmployeeId).trim() ===
                String(employeeId).trim();
        });

        if (!matchedEmployee) {
            console.error(
                "Payroll: No Employee API record matched EmployeeId:",
                employeeId
            );
            return null;
        }

        const matchedBackendEmployeeId = getValue(
            matchedEmployee,
            "employeeId",
            "EmployeeId",
            "employeeID",
            "EmployeeID",
            "id",
            "Id"
        );

        const azureEmployeeId = getValue(
            matchedEmployee,
            "azureEmployeeId",
            "AzureEmployeeId",
            "azureEmployeeID",
            "AzureEmployeeID"
        );

        console.log(
            "Payroll: Employee matched:",
            {
                employeeId: matchedBackendEmployeeId,
                azureEmployeeId,
            }
        );

        return validId(matchedBackendEmployeeId)
            ? Number(matchedBackendEmployeeId)
            : null;
    } catch (error) {
        console.error(
            "Payroll: Failed to resolve EmployeeId:",
            error
        );
        return null;
    }
};

function Payslips() {
    const {
        profile,
        loading: profileLoading,
        error: profileError,
    } = useProfile();

    const [payslip, setPayslip] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [selectedYear, setSelectedYear] =
        useState(
            new Date().getFullYear()
        );

    const [selectedMonth, setSelectedMonth] =
        useState(
            new Date().getMonth() + 1
        );

    /* =====================================================
       FETCH PAYSLIP
    ===================================================== */

    const fetchPayslip =
        useCallback(
            async () => {
                try {
                    setLoading(true);
                    setError("");

                    if (profileLoading) {
                        return;
                    }

                    if (profileError) {
                        throw new Error(profileError);
                    }

                    if (!profile) {
                        return;
                    }

                    const employeeId =
                        await resolveEmployeeId(profile);

                    console.log(
                        "Fetching payslip for EmployeeId:",
                        employeeId
                    );

                    if (!employeeId) {
                        throw new Error(
                            "Unable to identify your employee profile."
                        );
                    }

                    const url =
                        `${PAYROLL_API}/Payslip/${employeeId}/${selectedYear}/${selectedMonth}`;

                    console.log(
                        "Payslip URL:",
                        url
                    );

                    const response =
                        await fetch(
                            url,
                            {
                                credentials:
                                    "include",
                            }
                        );

                    if (!response.ok) {
                        if (
                            response.status ===
                            404
                        ) {
                            throw new Error(
                                `Payslip not found for ${monthName(
                                    selectedMonth
                                )} ${selectedYear}.`
                            );
                        }

                        let message = "";

                        try {
                            const body =
                                await response.json();

                            message =
                                body?.message ||
                                body?.title ||
                                "";
                        } catch {
                            // Ignore invalid body.
                        }

                        throw new Error(
                            message ||
                                `Unable to load payslip. Server returned ${response.status}.`
                        );
                    }

                    const data =
                        await response.json();

                    setPayslip(data);
                } catch (err) {
                    console.error(
                        "Payslip error:",
                        err
                    );

                    setPayslip(null);

                    setError(
                        err?.message ||
                            "Unable to load payslip."
                    );
                } finally {
                    setLoading(false);
                }
            },
            [
                selectedYear,
                selectedMonth,
                profile,
                profileLoading,
                profileError,
            ]
        );

    useEffect(() => {
        fetchPayslip();
    }, [fetchPayslip]);

    /* =====================================================
       EARNINGS
    ===================================================== */

    const earnings =
        useMemo(
            () =>
                [
                    ...(payslip?.components ||
                        []),
                ]
                    .filter(
                        (component) =>
                            String(
                                component.componentType ||
                                    ""
                            ).toLowerCase() ===
                            "earning"
                    )
                    .sort(
                        (a, b) =>
                            Number(
                                a.sequence || 0
                            ) -
                            Number(
                                b.sequence || 0
                            )
                    ),
            [payslip]
        );

    /* =====================================================
       DEDUCTIONS
    ===================================================== */

    const deductions =
        useMemo(
            () =>
                [
                    ...(payslip?.components ||
                        []),
                ]
                    .filter(
                        (component) =>
                            String(
                                component.componentType ||
                                    ""
                            ).toLowerCase() ===
                            "deduction"
                    )
                    .sort(
                        (a, b) =>
                            Number(
                                a.sequence || 0
                            ) -
                            Number(
                                b.sequence || 0
                            )
                    ),
            [payslip]
        );

    /* =====================================================
       PAY PERIOD
    ===================================================== */

    const payPeriod =
        useMemo(() => {
            const start =
                new Date(
                    selectedYear,
                    selectedMonth - 1,
                    1
                );

            const end =
                new Date(
                    selectedYear,
                    selectedMonth,
                    0
                );

            return `${start.toLocaleDateString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                }
            )} - ${end.toLocaleDateString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                }
            )}`;
        }, [
            selectedYear,
            selectedMonth,
        ]);

    /* =====================================================
       ATTENDANCE / UNPAID LEAVE DEDUCTION
       -----------------------------------------------------
       IMPORTANT:
       `workingDays` from the Attendance API is NOT the number of
       payable working days for the month. It is only the number of
       attendance records returned. Therefore, for an absent day we
       must NOT calculate:

           monthly salary / workingDays

       Example:
           ₹20,000 / 3 = ₹6,666.67  <-- WRONG

       For a calendar-day payroll calculation:
           ₹20,000 / 31 = ₹645.16  <-- one absent day

       The backend totalDeductions remains the source of truth for
       the final deduction total. If the backend total contains other
       deductions but does not return component rows, those other
       deductions are shown separately as Payroll Deductions so the
       payslip still reconciles correctly.
    ===================================================== */

    const attendanceDays = Number(getValue(
        payslip,
        "attendanceDeductionDays", "AttendanceDeductionDays",
        "absentDays", "AbsentDays",
        "absentCount", "AbsentCount",
        "absenceDays", "AbsenceDays",
        "unpaidLeaveDays", "UnpaidLeaveDays",
        "unpaidDays", "UnpaidDays",
        "leaveWithoutPayDays", "LeaveWithoutPayDays",
        "lopDays", "LOPDays"
    ) || 0);

    const explicitAttendanceDeduction = Number(getValue(
        payslip,
        "attendanceDeduction", "AttendanceDeduction",
        "attendanceDeductionAmount", "AttendanceDeductionAmount",
        "absenceDeduction", "AbsenceDeduction",
        "absenceDeductionAmount", "AbsenceDeductionAmount"
    ) || 0);

    const explicitUnpaidLeaveDeduction = Number(getValue(
        payslip,
        "unpaidLeaveDeduction", "UnpaidLeaveDeduction",
        "unpaidLeaveAmount", "UnpaidLeaveAmount",
        "unpaidDeduction", "UnpaidDeduction",
        "lopAmount", "LOPAmount"
    ) || 0);

    const daysInSelectedMonth = new Date(
        selectedYear,
        selectedMonth,
        0
    ).getDate();

    const monthlySalaryForAttendance = Number(getValue(
        payslip,
        "grossSalary", "GrossSalary",
        "monthlySalary", "MonthlySalary",
        "monthlyCtc", "MonthlyCtc"
    ) || 0);

    /*
     * DO NOT use attendance workingDays here.
     * The attendance API may return workingDays = 3 simply because
     * only 3 attendance records exist in the month.
     */
    const dailySalaryForAttendance = Number(getValue(
        payslip,
        "dailySalary", "DailySalary",
        "perDaySalary", "PerDaySalary"
    ) || (
        monthlySalaryForAttendance > 0 && daysInSelectedMonth > 0
            ? monthlySalaryForAttendance / daysInSelectedMonth
            : 0
    ));

    const calculatedAttendanceDeduction =
        attendanceDays > 0 && dailySalaryForAttendance > 0
            ? attendanceDays * dailySalaryForAttendance
            : 0;

    const attendanceDeduction =
        explicitAttendanceDeduction > 0
            ? explicitAttendanceDeduction
            : explicitUnpaidLeaveDeduction > 0
                ? explicitUnpaidLeaveDeduction
                : calculatedAttendanceDeduction;

    const backendTotalDeductions = Number(
        payslip?.totalDeductions || 0
    );

    const componentDeductionTotal = deductions.reduce(
        (sum, row) => sum + Number(row?.amount || 0),
        0
    );

    const hasAttendanceRow = deductions.some((row) => {
        const name = String(
            row?.componentName ||
            row?.label ||
            row?.name ||
            row?.description ||
            ""
        ).toLowerCase();

        return (
            name.includes("attendance") ||
            name.includes("absent") ||
            name.includes("absence") ||
            name.includes("unpaid") ||
            name.includes("lop") ||
            name.includes("leave without pay")
        );
    });

    /*
     * IMPORTANT:
     * The Payslip API can return a deduction component whose amount is not
     * the attendance deduction. In the current payroll response, for
     * example, the component may contain ₹6,666.67 while the actual
     * attendance deduction for one absent day is ₹645.16.
     *
     * Therefore attendance is calculated independently from attendance data:
     *
     *     monthly gross / calendar days in month * absent/LOP days
     *
     * The backend totalDeductions remains the final total. Any amount left
     * after attendance deduction is shown as Payroll Deductions instead of
     * incorrectly calling the whole amount an Attendance Deduction.
     */
    const attendanceDisplayAmount =
        attendanceDeduction > 0
            ? attendanceDeduction
            : hasAttendanceRow
                ? Number(
                    deductions.find((row) => {
                        const name = String(
                            row?.componentName ||
                            row?.label ||
                            row?.name ||
                            row?.description ||
                            ""
                        ).toLowerCase();

                        return (
                            name.includes("attendance") ||
                            name.includes("absent") ||
                            name.includes("absence") ||
                            name.includes("unpaid") ||
                            name.includes("lop") ||
                            name.includes("leave without pay")
                        );
                    })?.amount || 0
                )
                : 0;

    const effectiveAttendanceDeduction = Math.min(
        Math.max(0, attendanceDisplayAmount),
        Math.max(0, backendTotalDeductions)
    );

    /*
     * Do not render the raw deduction component list here when attendance
     * information is available. A raw component can be a stale/incorrect
     * payroll adjustment and can otherwise be displayed as attendance.
     *
     * Backend total:
     *   ₹645.16  - one absent day only
     *   ₹7311.83 - ₹6666.67 payroll deductions + ₹645.16 attendance
     */
    const otherPayrollDeduction = Math.max(
        0,
        backendTotalDeductions - effectiveAttendanceDeduction
    );

    const displayDeductions = [];

    if (otherPayrollDeduction > 0.01) {
        displayDeductions.push({
            salaryComponentId: "payroll-deductions",
            sequence: -1,
            componentName: "Payroll Deductions",
            amount: otherPayrollDeduction,
        });
    }

    if (effectiveAttendanceDeduction > 0.01) {
        displayDeductions.push({
            salaryComponentId: "attendance-deduction",
            sequence: 999998,
            componentName: "Attendance Deduction",
            amount: effectiveAttendanceDeduction,
        });
    }

    /*
     * If there is no backend total, fall back to the actual component rows.
     * This keeps the payslip usable for older API responses.
     */
    if (
        backendTotalDeductions <= 0 &&
        displayDeductions.length === 0
    ) {
        deductions.forEach((row) => {
            displayDeductions.push(row);
        });
    }

    const effectiveTotalDeductions =
        backendTotalDeductions > 0
            ? backendTotalDeductions
            : displayDeductions.reduce(
                (sum, row) => sum + Number(row?.amount || 0),
                0
            );

    const backendNetSalary = Number(
        payslip?.netSalary || 0
    );

    const effectiveNetSalary =
        backendTotalDeductions > 0 && backendNetSalary > 0
            ? backendNetSalary
            : Number(
                payslip?.totalEarnings ||
                payslip?.grossSalary ||
                0
            ) - effectiveTotalDeductions;

    /* =====================================================
       PRINT
    ===================================================== */

    const handlePrint = () => {
        window.print();
    };

    // Download PDF uses the same A4 print stylesheet.
    // In Chrome/Edge the user can choose "Save as PDF" in the print dialog.
    const handleDownload = () => {
        window.print();
    };

    /* =====================================================
       LOADING
    ===================================================== */

    if (loading) {
        return (
            <Box className="payroll-state">
                <CircularProgress
                    size={36}
                />

                <Typography variant="h6">
                    Loading Payslip
                </Typography>

                <Typography color="text.secondary">
                    Please wait while we
                    fetch your payroll
                    details.
                </Typography>
            </Box>
        );
    }

    /* =====================================================
       PAGE
    ===================================================== */

    return (
        <Box className="employee-payroll-page">

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <Box className="payroll-page-header no-print">

                <Box>
                    <Typography className="payroll-eyebrow">
                        EMPLOYEE PAYROLL
                    </Typography>

                    <Typography className="payroll-page-title">
                        My Payslip
                    </Typography>

                    <Typography className="payroll-page-subtitle">
                        View your monthly
                        salary details and
                        payslip.
                    </Typography>
                </Box>

                <Stack
                    direction="row"
                    spacing={1}
                    className="payroll-header-actions"
                >
                    <Button
                        variant="outlined"
                        startIcon={
                            <PrintOutlined />
                        }
                        onClick={
                            handlePrint
                        }
                        className="print-button"
                    >
                        Print
                    </Button>

                    <Button
                        variant="contained"
                        startIcon={
                            <DownloadOutlined />
                        }
                        onClick={
                            handleDownload
                        }
                        className="download-button"
                    >
                        Download PDF
                    </Button>
                </Stack>
            </Box>

            {/* =================================================
                PAYROLL CONTROLS

                LEFT:
                Selected Period

                RIGHT:
                Year / Month / Refresh
            ================================================= */}

            <Card
                className="payslip-controls-card no-print"
                elevation={0}
            >
                <CardContent className="payslip-controls-content">

                    {/* LEFT */}
                    <Box className="selected-period-section">

                        <Typography className="selected-period-label">
                            SELECTED PERIOD
                        </Typography>

                        <Typography className="selected-period-value">
                            {monthName(
                                selectedMonth
                            )}{" "}
                            {selectedYear}
                        </Typography>

                    </Box>

                    {/* RIGHT */}
                    <Stack
                        direction="row"
                        spacing={1.5}
                        alignItems="center"
                        className="payroll-filter-controls"
                    >

                        <FormControl
                            size="small"
                            className="payroll-select"
                        >
                            <InputLabel>
                                Payroll Year
                            </InputLabel>

                            <Select
                                value={
                                    selectedYear
                                }
                                label="Payroll Year"
                                onChange={(event) =>
                                    setSelectedYear(
                                        Number(
                                            event
                                                .target
                                                .value
                                        )
                                    )
                                }
                            >
                                {Array.from(
                                    {
                                        length: 5,
                                    },
                                    (_, i) =>
                                        new Date().getFullYear() -
                                        i
                                ).map(
                                    (year) => (
                                        <MenuItem
                                            key={
                                                year
                                            }
                                            value={
                                                year
                                            }
                                        >
                                            {year}
                                        </MenuItem>
                                    )
                                )}
                            </Select>
                        </FormControl>

                        <FormControl
                            size="small"
                            className="payroll-select"
                        >
                            <InputLabel>
                                Payroll Month
                            </InputLabel>

                            <Select
                                value={
                                    selectedMonth
                                }
                                label="Payroll Month"
                                onChange={(event) =>
                                    setSelectedMonth(
                                        Number(
                                            event
                                                .target
                                                .value
                                        )
                                    )
                                }
                            >
                                {Array.from(
                                    {
                                        length: 12,
                                    },
                                    (_, i) =>
                                        i + 1
                                ).map(
                                    (month) => (
                                        <MenuItem
                                            key={
                                                month
                                            }
                                            value={
                                                month
                                            }
                                        >
                                            {monthName(
                                                month
                                            )}
                                        </MenuItem>
                                    )
                                )}
                            </Select>
                        </FormControl>

                        <Button
                            variant="outlined"
                            startIcon={
                                <RefreshOutlined />
                            }
                            onClick={
                                fetchPayslip
                            }
                            className="refresh-button"
                        >
                            Refresh
                        </Button>

                    </Stack>
                </CardContent>
            </Card>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
                <Alert
                    className="payslip-alert no-print"
                    severity="error"
                    action={
                        <Button
                            color="inherit"
                            size="small"
                            onClick={
                                fetchPayslip
                            }
                        >
                            Try Again
                        </Button>
                    }
                >
                    {error}
                </Alert>
            )}

            {/* =================================================
                PAYSLIP
            ================================================= */}

            {payslip && (
                <Box
                    id="payslip-print-area"
                    className="payslip-print-area"
                >
                    <Paper
                        className="payslip-paper"
                        elevation={0}
                    >

                    {/* =========================================
                        COMPANY HEADER
                    ========================================= */}

                    <Box className="payslip-company-header">

                        <Box className="company-information">

<Box className="company-logo">
    <img
        src={sparkLogo}
        alt="SPARK ERP & HR SYSTEM"
        className="company-logo-image"
    />
</Box>

                          

                        </Box>

                        <Box className="payslip-title-block">

                            <Typography className="payslip-title">
                                PAYSLIP
                            </Typography>

                            <Typography className="payslip-month">
                                For the Month of{" "}
                                <strong>
                                    {monthName(
                                        selectedMonth
                                    )}{" "}
                                    {selectedYear}
                                </strong>
                            </Typography>

                            {payslip.payslipNumber && (
                                <Typography className="payslip-number">
                                    {
                                        payslip.payslipNumber
                                    }
                                </Typography>
                            )}
<br/><br/>
                            <Typography className="company-name">
                                AMNIKON TECHNOLOGIES
                                PVT. LTD.
                            </Typography>

                            <Typography className="company-line">
                                1601, Amnikon Technologies, Arihant Aura
                            </Typography>

                            <Typography className="company-line">
                                Turbhe, Navi Mumbai -
                                400705
                            </Typography>

                            <Typography className="company-line">
                                Phone: +91 22 1234
                                5678&nbsp;&nbsp;|
                                &nbsp;&nbsp;Email:
                                hr@sparktech.com
                            </Typography>


                        </Box>

                    </Box>

                    <Divider />

                    {/* =========================================
                        EMPLOYEE INFORMATION
                    ========================================= */}

                    <Box className="employee-information-grid">

                        <Box className="employee-info-column">

                            <InfoRow
                                label="Employee Name"
                                value={
                                    payslip.employeeName
                                }
                            />

                            <InfoRow
                                label="Employee ID"
                                value={
                                    profile?.azureEmployeeId ||
                                    profile?.AzureEmployeeId ||
                                    payslip?.azureEmployeeId ||
                                    payslip?.AzureEmployeeId ||
                                    "-"
                                }
                            />

                            <InfoRow
                                label="Designation"
                                value={
                                    payslip.designation
                                }
                            />

                            <InfoRow
                                label="Department"
                                value={
                                    payslip.department
                                }
                            />

                        </Box>

                        <Box className="employee-info-column">

                            <InfoRow
                                label="Date of Joining"
                                value={dateText(
                                    payslip.joiningDate
                                )}
                            />

                            <InfoRow
                                label="Pay Period"
                                value={
                                    payPeriod
                                }
                            />

                            <InfoRow
                                label="Payment Date"
                                value={dateText(
                                    payslip.generatedDate
                                )}
                            />

                            <InfoRow
                                label="Location"
                                value="Turbhe, Navi Mumbai"
                            />

                        </Box>

                    </Box>

                    <Divider />

                    {/* =========================================
                        EARNINGS / DEDUCTIONS
                    ========================================= */}

                    <Box className="salary-tables">

                        <Box className="salary-table-column">
                            <SalaryTable
                                title="EARNINGS"
                                rows={
                                    earnings
                                }
                                totalLabel="TOTAL EARNINGS"
                                total={
                                    payslip.totalEarnings
                                }
                            />
                        </Box>

                        <Box className="salary-table-column">
                            <SalaryTable
                                title="DEDUCTIONS"
                                rows={
                                    displayDeductions
                                }
                                totalLabel="TOTAL DEDUCTIONS"
                                total={
                                    effectiveTotalDeductions
                                }
                            />
                        </Box>

                    </Box>

                    {/* =========================================
                        NET PAY
                    ========================================= */}

                    <Box className="net-pay-box">

                        <Box className="net-pay-item">
                            <Typography>
                                TOTAL EARNINGS
                            </Typography>

                            <strong>
                                {currency(
                                    payslip.totalEarnings
                                )}
                            </strong>
                        </Box>

                        <Typography className="net-pay-symbol">
                            −
                        </Typography>

                        <Box className="net-pay-item">
                            <Typography>
                                TOTAL DEDUCTIONS
                            </Typography>

                            <strong>
                                {currency(
                                    effectiveTotalDeductions
                                )}
                            </strong>
                        </Box>

                        <Typography className="net-pay-symbol">
                            =
                        </Typography>

                        <Box className="net-pay-item net-pay-highlight">
                            <Typography>
                                NET PAY
                            </Typography>

                            <strong>
                                {currency(
                                    effectiveNetSalary
                                )}
                            </strong>
                        </Box>

                        <Typography className="amount-in-words">
                            (
                            {amountWords(
                                effectiveNetSalary
                            )}{" "}
                            Only)
                        </Typography>

                    </Box>

                    {/* =========================================
                        SALARY DETAILS
                    ========================================= */}

                    <Paper
                        className="salary-details-box"
                        elevation={0}
                    >

                        <Typography className="salary-details-header">
                            SALARY DETAILS
                        </Typography>

                        <Box className="salary-details-grid">

                            <Box className="salary-detail-item">
                                <Typography>
                                    Annual CTC
                                </Typography>

                                <strong>
                                    {currency(
                                        payslip.annualCtc
                                    )}
                                </strong>
                            </Box>

                            <Box className="salary-detail-item">
                                <Typography>
                                    Monthly CTC
                                </Typography>

                                <strong>
                                    {currency(
                                        payslip.monthlyCtc
                                    )}
                                </strong>
                            </Box>

                            <Box className="salary-detail-item">
                                <Typography>
                                    Gross Salary
                                </Typography>

                                <strong>
                                    {currency(
                                        payslip.grossSalary
                                    )}
                                </strong>
                            </Box>

                            <Box className="salary-detail-item">
                                <Typography>
                                    Status
                                </Typography>

                                <Chip
                                    label={
                                        payslip.status ||
                                        "Generated"
                                    }
                                    size="small"
                                    className="status-chip"
                                />
                            </Box>

                        </Box>

                    </Paper>

                    <Divider />
<br/>
<br />
                    {/* =========================================
                        FOOTER
                    ========================================= */}

<Box className="payslip-footer">

    <Box className="footer-note-section">

        <Typography className="footer-note">
            <strong>Note:</strong>&nbsp;
            This is a system generated payslip. Please contact HR for any payroll related queries.
        </Typography>

    </Box>

</Box>

                    </Paper>
                </Box>
            )}

        </Box>
    );
}

export default Payslips;