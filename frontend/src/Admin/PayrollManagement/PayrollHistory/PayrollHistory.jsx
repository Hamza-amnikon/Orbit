import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Alert,
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
    Grid,
    IconButton,
    InputAdornment,
    MenuItem,
    Select,
    Snackbar,
    TextField,
    Typography,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HistoryIcon from "@mui/icons-material/History";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PeopleIcon from "@mui/icons-material/People";
import PaymentsIcon from "@mui/icons-material/Payments";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import DescriptionIcon from "@mui/icons-material/Description";
import RefreshIcon from "@mui/icons-material/Refresh";
import ErrorIcon from "@mui/icons-material/Error";
import EventIcon from "@mui/icons-material/Event";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import PersonIcon from "@mui/icons-material/Person";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import TableViewIcon from "@mui/icons-material/TableView";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

import "./PayrollHistory.css";

/* =========================================================
   API CONFIGURATION
========================================================= */

const API_BASE_URL = (
    import.meta.env.VITE_PAYROLL_API_URL ||
    "http://localhost:5111"
).replace(/\/+$/, "");

/* =========================================================
   API ENDPOINTS
========================================================= */

const API = {
    payrollHistory:
        `${API_BASE_URL}/api/Payroll/history`,

    payrollDetails: (id) =>
        `${API_BASE_URL}/api/Payroll/${id}`,

    employeePayroll: (employeeId) =>
        `${API_BASE_URL}/api/Payroll/employee/${employeeId}`,

    employeeSalaries:
        `${API_BASE_URL}/api/EmployeeSalaries`,

    employeeSalary: (employeeId) =>
        `${API_BASE_URL}/api/EmployeeSalaries/${employeeId}`,
};

/* =========================================================
   GENERAL HELPERS
========================================================= */

const isObject = (value) =>
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value);

const firstDefined = (...values) => {
    for (const value of values) {
        if (
            value !== undefined &&
            value !== null &&
            value !== ""
        ) {
            return value;
        }
    }

    return null;
};

const toNumber = (value) => {
    if (
        typeof value === "number" &&
        Number.isFinite(value)
    ) {
        return value;
    }

    if (typeof value === "string") {
        const cleaned = value
            .replace(/[₹,\s]/g, "")
            .replace(/Rs\./gi, "");

        const number = Number(cleaned);

        return Number.isFinite(number)
            ? number
            : 0;
    }

    return 0;
};

const toArray = (value) => {
    if (Array.isArray(value)) {
        return value;
    }

    if (!value) {
        return [];
    }

    if (Array.isArray(value.data)) {
        return value.data;
    }

    if (Array.isArray(value.result)) {
        return value.result;
    }

    if (Array.isArray(value.items)) {
        return value.items;
    }

    if (Array.isArray(value.records)) {
        return value.records;
    }

    if (Array.isArray(value.Records)) {
        return value.Records;
    }

    if (Array.isArray(value.payrolls)) {
        return value.payrolls;
    }

    if (Array.isArray(value.payrollHistory)) {
        return value.payrollHistory;
    }

    return [];
};

const formatCurrency = (amount) => {
    return `₹${toNumber(amount).toLocaleString("en-IN")}`;
};

const formatDate = (value) => {
    if (!value) {
        return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    );
};

const formatMonthYear = (year, month) => {
    const numericYear = Number(year);
    const numericMonth = Number(month);

    if (
        !Number.isFinite(numericYear) ||
        !Number.isFinite(numericMonth) ||
        numericMonth < 1 ||
        numericMonth > 12
    ) {
        return null;
    }

    const date = new Date(
        numericYear,
        numericMonth - 1,
        1
    );

    return date.toLocaleDateString(
        "en-US",
        {
            month: "long",
            year: "numeric",
        }
    );
};

const getMonthNumber = (value) => {
    if (!value) {
        return null;
    }

    if (typeof value === "number") {
        return value >= 1 && value <= 12
            ? value
            : null;
    }

    const text = String(value)
        .trim()
        .toLowerCase();

    const months = [
        "january",
        "february",
        "march",
        "april",
        "may",
        "june",
        "july",
        "august",
        "september",
        "october",
        "november",
        "december",
    ];

    const index = months.indexOf(text);

    if (index >= 0) {
        return index + 1;
    }

    const numeric = Number(text);

    return numeric >= 1 && numeric <= 12
        ? numeric
        : null;
};

const getYearFromValue = (value) => {
    if (!value) {
        return null;
    }

    const match = String(value).match(
        /\b(20\d{2})\b/
    );

    return match
        ? Number(match[1])
        : null;
};

const getMonthFromValue = (value) => {
    if (!value) {
        return null;
    }

    const text = String(value).toLowerCase();

    const months = [
        "january",
        "february",
        "march",
        "april",
        "may",
        "june",
        "july",
        "august",
        "september",
        "october",
        "november",
        "december",
    ];

    for (
        let index = 0;
        index < months.length;
        index += 1
    ) {
        if (
            text.includes(months[index])
        ) {
            return index + 1;
        }
    }

    return null;
};

/* =========================================================
   API FETCH HELPER
========================================================= */

const fetchJson = async (
    url,
    options = {}
) => {
    const response = await fetch(
        url,
        {
            ...options,
            headers: {
                Accept:
                    "application/json",

                ...(options.body
                    ? {
                          "Content-Type":
                              "application/json",
                      }
                    : {}),

                ...(options.headers || {}),
            },
        }
    );

    const contentType =
        response.headers.get(
            "content-type"
        ) || "";

    let data = null;

    if (
        contentType.includes(
            "application/json"
        )
    ) {
        data =
            await response.json();
    } else {
        const text =
            await response.text();

        try {
            data = text
                ? JSON.parse(text)
                : null;
        } catch {
            data = text;
        }
    }

    if (!response.ok) {
        const serverMessage =
            isObject(data)
                ? firstDefined(
                      data.message,
                      data.error,
                      data.title,
                      data.detail
                  )
                : null;

        throw new Error(
            serverMessage ||
                `PayrollService returned HTTP ${response.status}.`
        );
    }

    return data;
};

/* =========================================================
   PAYROLL NORMALIZATION
========================================================= */

const normalizePayroll = (
    item,
    index
) => {
    const source = item || {};

    const id = firstDefined(
        source.payrollRunId,
        source.payrollRunID,
        source.PayrollRunId,

        source.payrollId,
        source.payrollID,

        source.id
    );

    const year = firstDefined(
        source.payrollYear,
        source.year,
        source.runYear
    );

    const monthNumber = firstDefined(
        source.payrollMonth,
        source.month,
        source.runMonth
    );

    const monthNameFromApi =
        firstDefined(
            source.monthName,
            source.payrollMonthName
        );

    let month =
        monthNameFromApi ||
        formatMonthYear(
            year,
            monthNumber
        ) ||
        source.payrollPeriod ||
        source.period ||
        source.name ||
        "Payroll";

    if (
        month === "Payroll" &&
        source.processedDate
    ) {
        const processed =
            new Date(
                source.processedDate
            );

        if (
            !Number.isNaN(
                processed.getTime()
            )
        ) {
            month =
                processed.toLocaleDateString(
                    "en-US",
                    {
                        month: "long",
                        year: "numeric",
                    }
                );
        }
    }

    if (
        month === "Payroll" &&
        source.completedDate
    ) {
        const completed =
            new Date(
                source.completedDate
            );

        if (
            !Number.isNaN(
                completed.getTime()
            )
        ) {
            month =
                completed.toLocaleDateString(
                    "en-US",
                    {
                        month: "long",
                        year: "numeric",
                    }
                );
        }
    }

    if (
        month === "Payroll" &&
        source.createdDate
    ) {
        const created =
            new Date(
                source.createdDate
            );

        if (
            !Number.isNaN(
                created.getTime()
            )
        ) {
            month =
                created.toLocaleDateString(
                    "en-US",
                    {
                        month: "long",
                        year: "numeric",
                    }
                );
        }
    }

    const resolvedYear =
        Number(year) ||
        getYearFromValue(month) ||
        null;

    const resolvedMonth =
        getMonthNumber(
            monthNumber
        ) ||
        getMonthFromValue(month) ||
        null;

    let period =
        firstDefined(
            source.payrollPeriod,
            source.processingPeriod,
            source.period
        );

    if (
        !period &&
        resolvedYear &&
        resolvedMonth
    ) {
        const firstDay =
            new Date(
                resolvedYear,
                resolvedMonth - 1,
                1
            );

        const lastDay =
            new Date(
                resolvedYear,
                resolvedMonth,
                0
            );

        period =
            `${firstDay.toLocaleDateString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                }
            )} - ${lastDay.toLocaleDateString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                }
            )}`;
    }

    /*
     * IMPORTANT
     *
     * Your PayrollController returns employee
     * payroll records under:
     *
     *     records
     *
     * So include records here.
     */

    const employeeRows =
        firstDefined(
            source.records,
            source.Records,

            source.payrollRecords,
            source.PayrollRecords,

            source.employeePayrolls,
            source.employeePayroll,
            source.payrollEmployees,
            source.employeesList,
            source.details,
            source.items
        );

    const employees =
        firstDefined(
            source.employeeCount,
            source.EmployeeCount,

            source.employees,
            source.employeeCount,

            source.totalEmployees,
            source.employeesProcessed,

            Array.isArray(
                employeeRows
            )
                ? employeeRows.length
                : null
        );

    const grossSalary =
        firstDefined(
            source.totalGrossSalary,
            source.TotalGrossSalary,

            source.grossSalary,
            source.gross,
            source.totalGross,
            source.grossAmount
        );

    const totalDeductions =
        firstDefined(
            source.totalDeductions,
            source.TotalDeductions,

            source.deductions,
            source.totalDeduction,
            source.totalDeductionAmount,
            source.deductionAmount
        );

    const netSalary =
        firstDefined(
            source.totalNetSalary,
            source.TotalNetSalary,

            source.netSalary,
            source.net,
            source.totalNet,
            source.netAmount
        );

    const processedDate =
        firstDefined(
            source.completedDate,
            source.CompletedDate,

            source.processedDate,
            source.processedOn,
            source.runDate,
            source.payrollDate,

            source.processingEndDate,
            source.ProcessingEndDate,

            source.createdDate,
            source.createdOn
        );

    const processedBy =
        firstDefined(
            source.processedBy,
            source.processedByName,
            source.runBy,
            source.createdBy,
            source.createdByName,
            source.userName
        );

    const status =
        firstDefined(
            source.status,
            source.Status,
            source.payrollStatus,
            source.runStatus
        ) || "Completed";

    return {
        ...source,

        id:
            id !== null &&
            id !== undefined
                ? id
                : `payroll-${index}`,

        year:
            resolvedYear,

        monthNumber:
            resolvedMonth,

        month:
            String(month),

        period:
            period ||
            "Monthly Payroll",

        employees:
            toNumber(employees) ||
            (
                Array.isArray(
                    employeeRows
                )
                    ? employeeRows.length
                    : 0
            ),

        grossSalary:
            toNumber(
                grossSalary
            ),

        totalDeductions:
            toNumber(
                totalDeductions
            ),

        netSalary:
            toNumber(
                netSalary
            ),

        processedDate,

        processedBy:
            processedBy !== null
                ? String(
                      processedBy
                  )
                : "-",

        status:
            String(status),

        employeeRows:
            Array.isArray(
                employeeRows
            )
                ? employeeRows
                : [],
    };
};

/* =========================================================
   EMPLOYEE PAYROLL NORMALIZATION
========================================================= */

const normalizeEmployeePayroll = (
    item,
    index
) => {
    const source = item || {};

    const employee =
        firstDefined(
            source.employee,
            source.employeeDetails
        );

    const employeeObject =
        isObject(employee)
            ? employee
            : {};

    /*
     * ACTUAL EMPLOYEE ID
     *
     * PayrollController returns:
     *
     * EmployeeId
     *
     * ASP.NET JSON normally serializes
     * that as:
     *
     * employeeId
     */

    const employeeId =
        firstDefined(
            source.employeeId,
            source.employeeID,
            source.EmployeeId,
            source.EmployeeID,

            source.employeeNumber,

            employeeObject.employeeId,
            employeeObject.employeeID,
            employeeObject.EmployeeId,
            employeeObject.EmployeeID,

            employeeObject.id
        );

    const employeeName =
        firstDefined(
            source.employeeName,
            source.employeeFullName,
            source.fullName,
            source.name,

            employeeObject.employeeName,
            employeeObject.employeeFullName,
            employeeObject.fullName,
            employeeObject.name
        );

    const department =
        firstDefined(
            source.department,
            source.departmentName,

            employeeObject.department,
            employeeObject.departmentName
        );

    const templateObject =
        isObject(
            source.payrollTemplate
        )
            ? source.payrollTemplate
            : isObject(
                  source.template
              )
            ? source.template
            : {};

    const template =
        firstDefined(
            source.templateName,
            source.payrollTemplateName,

            templateObject.templateName,
            templateObject.name,

            source.template
        );

    const payrollRecordId =
        firstDefined(
            source.payrollRecordId,
            source.payrollRecordID,
            source.PayrollRecordId,

            source.id
        );

    const payrollTemplateId =
        firstDefined(
            source.payrollTemplateId,
            source.payrollTemplateID,
            source.PayrollTemplateId
        );

    const annualCtc =
        firstDefined(
            source.annualCtc,
            source.annualCTC,
            source.AnnualCtc
        );

    const monthlyCtc =
        firstDefined(
            source.monthlyCtc,
            source.monthlyCTC,
            source.MonthlyCtc
        );

    const grossSalary =
        firstDefined(
            source.grossSalary,
            source.gross,
            source.totalGrossSalary,
            source.grossAmount,
            source.salary
        );

    const deductions =
        firstDefined(
            source.totalDeductions,
            source.deductions,
            source.totalDeduction,
            source.totalDeductionAmount,
            source.deductionAmount
        );

    const netSalary =
        firstDefined(
            source.netSalary,
            source.net,
            source.totalNetSalary,
            source.netAmount
        );

    const status =
        firstDefined(
            source.status,
            source.Status,
            source.payrollStatus,
            source.recordStatus
        ) || "Processed";

    const processedDate =
        firstDefined(
            source.processedDate,
            source.ProcessedDate,
            source.processedOn
        );

    const components =
        Array.isArray(
            source.components
        )
            ? source.components
            : Array.isArray(
                  source.Components
              )
            ? source.Components
            : [];

    return {
        ...source,

        rowId:
            payrollRecordId ||
            employeeId ||
            `employee-${index}`,

        payrollRecordId:
            payrollRecordId !== null &&
            payrollRecordId !== undefined
                ? String(
                      payrollRecordId
                  )
                : "-",

        employeeId:
            employeeId !== null &&
            employeeId !== undefined
                ? String(employeeId)
                : "-",

        employeeName:
            employeeName !== null &&
            employeeName !== undefined
                ? String(
                      employeeName
                  )
                : `Employee ${index + 1}`,

        department:
            department !== null &&
            department !== undefined
                ? String(
                      department
                  )
                : "-",

        template:
            template !== null &&
            template !== undefined
                ? String(
                      template
                  )
                : "-",

        payrollTemplateId:
            payrollTemplateId !== null &&
            payrollTemplateId !== undefined
                ? String(
                      payrollTemplateId
                  )
                : "-",

        annualCtc:
            toNumber(
                annualCtc
            ),

        monthlyCtc:
            toNumber(
                monthlyCtc
            ),

        grossSalary:
            toNumber(
                grossSalary
            ),

        deductions:
            toNumber(
                deductions
            ),

        netSalary:
            toNumber(
                netSalary
            ),

        status:
            String(status),

        processedDate,

        components,
    };
};

/* =========================================================
   EXTRACT EMPLOYEE ROWS
========================================================= */

const extractEmployeeRows = (
    data
) => {
    if (!data) {
        return [];
    }

    /*
     * Direct array
     */

    if (Array.isArray(data)) {
        return data;
    }

    if (!isObject(data)) {
        return [];
    }

    /*
     * IMPORTANT:
     *
     * PayrollController:
     *
     * response.Records
     *
     * ASP.NET JSON:
     *
     * response.records
     */

    const possibleArrays = [
        data.records,
        data.Records,

        data.payrollRecords,
        data.PayrollRecords,

        data.employeePayrolls,
        data.employeePayroll,

        data.payrollEmployees,

        data.employees,

        data.details,

        data.items,

        data.data,

        data.result,
    ];

    for (
        const candidate
        of possibleArrays
    ) {
        if (
            Array.isArray(candidate)
        ) {
            return candidate;
        }
    }

    return [];
};

/* =========================================================
   COMPONENT
========================================================= */

const PayrollHistory = ({
    onBack,
}) => {
    const [
        search,
        setSearch,
    ] = useState("");

    const [
        statusFilter,
        setStatusFilter,
    ] = useState("All");

    const [
        monthFilter,
        setMonthFilter,
    ] = useState("All");

    const [
        payrolls,
        setPayrolls,
    ] = useState([]);

    const [
        selectedPayroll,
        setSelectedPayroll,
    ] = useState(null);

    const [
        selectedEmployeeRows,
        setSelectedEmployeeRows,
    ] = useState([]);

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        detailsLoading,
        setDetailsLoading,
    ] = useState(false);

    const [
        refreshing,
        setRefreshing,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState("");

    const [
        detailsError,
        setDetailsError,
    ] = useState("");

    const [
        snackbar,
        setSnackbar,
    ] = useState({
        open: false,
        message: "",
        severity: "success",
    });

    /* =====================================================
       LOAD PAYROLL HISTORY
    ===================================================== */

    const loadPayrollHistory =
        useCallback(
            async (
                showRefresh = false
            ) => {
                try {
                    setError("");

                    if (showRefresh) {
                        setRefreshing(
                            true
                        );
                    } else {
                        setLoading(
                            true
                        );
                    }

                    const response =
                        await fetchJson(
                            API.payrollHistory
                        );

                    const records =
                        toArray(
                            response
                        ).map(
                            normalizePayroll
                        );

                    records.sort(
                        (a, b) => {
                            const dateA =
                                a.processedDate
                                    ? new Date(
                                          a.processedDate
                                      ).getTime()
                                    : 0;

                            const dateB =
                                b.processedDate
                                    ? new Date(
                                          b.processedDate
                                      ).getTime()
                                    : 0;

                            if (
                                dateB !==
                                dateA
                            ) {
                                return (
                                    dateB -
                                    dateA
                                );
                            }

                            const yearA =
                                Number(
                                    a.year ||
                                        0
                                );

                            const yearB =
                                Number(
                                    b.year ||
                                        0
                                );

                            if (
                                yearB !==
                                yearA
                            ) {
                                return (
                                    yearB -
                                    yearA
                                );
                            }

                            return (
                                Number(
                                    b.monthNumber ||
                                        0
                                ) -
                                Number(
                                    a.monthNumber ||
                                        0
                                )
                            );
                        }
                    );

                    setPayrolls(
                        records
                    );

                    if (showRefresh) {
                        setSnackbar({
                            open: true,
                            message:
                                "Payroll history refreshed successfully.",
                            severity:
                                "success",
                        });
                    }
                } catch (
                    requestError
                ) {
                    console.error(
                        "Payroll history API error:",
                        requestError
                    );

                    setError(
                        requestError?.message ||
                            "Unable to load payroll history."
                    );
                } finally {
                    setLoading(
                        false
                    );

                    setRefreshing(
                        false
                    );
                }
            },
            []
        );

    /* =====================================================
       INITIAL LOAD
    ===================================================== */

    useEffect(() => {
        loadPayrollHistory(
            false
        );
    }, [
        loadPayrollHistory,
    ]);

    /* =====================================================
       MONTH FILTER OPTIONS
    ===================================================== */

    const months = useMemo(
        () => {
            const values =
                payrolls
                    .map(
                        (item) =>
                            item.month
                    )
                    .filter(Boolean);

            return [
                "All",
                ...Array.from(
                    new Set(values)
                ),
            ];
        },
        [payrolls]
    );

    /* =====================================================
       FILTERED PAYROLL
    ===================================================== */

    const filteredPayrolls =
        useMemo(
            () => {
                const searchValue =
                    search
                        .trim()
                        .toLowerCase();

                return payrolls.filter(
                    (payroll) => {
                        const searchable = [
                            payroll.month,
                            payroll.period,
                            payroll.processedBy,
                            payroll.status,
                            String(
                                payroll.id
                            ),
                        ]
                            .filter(
                                Boolean
                            )
                            .join(" ")
                            .toLowerCase();

                        const matchesSearch =
                            !searchValue ||
                            searchable.includes(
                                searchValue
                            );

                        const matchesStatus =
                            statusFilter ===
                                "All" ||
                            String(
                                payroll.status ||
                                    ""
                            ).toLowerCase() ===
                                statusFilter.toLowerCase();

                        const matchesMonth =
                            monthFilter ===
                                "All" ||
                            payroll.month ===
                                monthFilter;

                        return (
                            matchesSearch &&
                            matchesStatus &&
                            matchesMonth
                        );
                    }
                );
            },
            [
                payrolls,
                search,
                statusFilter,
                monthFilter,
            ]
        );

    /* =====================================================
       SUMMARY VALUES
    ===================================================== */

    const totalRuns =
        payrolls.length;

    const totalEmployees =
        payrolls.reduce(
            (
                total,
                payroll
            ) =>
                total +
                toNumber(
                    payroll.employees
                ),
            0
        );

    const latestPayroll =
        payrolls[0] || null;

    /* =====================================================
       VIEW PAYROLL
    ===================================================== */

    const handleViewPayroll =
        async (
            payroll
        ) => {
            setSelectedPayroll(
                payroll
            );

            /*
             * If history itself already contains
             * employee records, show them immediately.
             */

            const initialRows =
                extractEmployeeRows(
                    payroll
                );

            setSelectedEmployeeRows(
                initialRows.map(
                    normalizeEmployeePayroll
                )
            );

            setDetailsError("");

            if (
                payroll.id ===
                    null ||
                payroll.id ===
                    undefined ||
                String(
                    payroll.id
                ).startsWith(
                    "payroll-"
                )
            ) {
                return;
            }

            try {
                setDetailsLoading(
                    true
                );

                const response =
                    await fetchJson(
                        API.payrollDetails(
                            payroll.id
                        )
                    );

                /*
                 * Debug output.
                 *
                 * Open browser console if needed.
                 */

                console.log(
                    "PAYROLL DETAIL RESPONSE:",
                    response
                );

                const detailObject =
                    isObject(
                        response
                    )
                        ? response
                        : {};

                /*
                 * Normalize payroll summary.
                 */

                const normalizedDetail =
                    normalizePayroll(
                        detailObject,
                        0
                    );

                /*
                 * THIS IS THE IMPORTANT PART.
                 *
                 * Your backend returns:
                 *
                 * records: [...]
                 *
                 * Each record has employeeId.
                 */

                const employeeRows =
                    extractEmployeeRows(
                        detailObject
                    );

                console.log(
                    "PAYROLL EMPLOYEE RECORDS:",
                    employeeRows
                );

                const normalizedEmployees =
                    employeeRows.map(
                        normalizeEmployeePayroll
                    );

                /*
                 * Update payroll header.
                 */

                setSelectedPayroll(
                    (current) => ({
                        ...current,
                        ...normalizedDetail,

                        id:
                            payroll.id,

                        month:
                            normalizedDetail.month !==
                            "Payroll"
                                ? normalizedDetail.month
                                : payroll.month,

                        period:
                            normalizedDetail.period !==
                            "Monthly Payroll"
                                ? normalizedDetail.period
                                : payroll.period,

                        employees:
                            normalizedDetail.employees ||
                            payroll.employees,

                        grossSalary:
                            normalizedDetail.grossSalary ||
                            payroll.grossSalary,

                        totalDeductions:
                            normalizedDetail.totalDeductions ||
                            payroll.totalDeductions,

                        netSalary:
                            normalizedDetail.netSalary ||
                            payroll.netSalary,

                        processedDate:
                            normalizedDetail.processedDate ||
                            payroll.processedDate,

                        processedBy:
                            normalizedDetail.processedBy !==
                            "-"
                                ? normalizedDetail.processedBy
                                : payroll.processedBy,

                        status:
                            normalizedDetail.status ||
                            payroll.status,
                    })
                );

                /*
                 * Always use the actual records
                 * returned by the detail endpoint.
                 */

                setSelectedEmployeeRows(
                    normalizedEmployees
                );

                if (
                    normalizedEmployees.length ===
                    0
                ) {
                    setDetailsError(
                        "The payroll run was found, but PayrollService returned no employee records."
                    );
                }
            } catch (
                requestError
            ) {
                console.error(
                    "Payroll details API error:",
                    requestError
                );

                setDetailsError(
                    requestError?.message ||
                        "Unable to load detailed payroll information."
                );

                setSelectedEmployeeRows(
                    []
                );
            } finally {
                setDetailsLoading(
                    false
                );
            }
        };

    /* =====================================================
       CLOSE DIALOG
    ===================================================== */

    const handleCloseDialog =
        () => {
            setSelectedPayroll(
                null
            );

            setSelectedEmployeeRows(
                []
            );

            setDetailsError("");
        };

    /* =====================================================
       PDF REPORT
    ===================================================== */

    const handleDownloadReport =
        () => {
            if (
                !selectedPayroll
            ) {
                return;
            }

            const doc =
                new jsPDF({
                    orientation:
                        "portrait",
                    unit: "mm",
                    format: "a4",
                });

            const payroll =
                selectedPayroll;

            const formatPdfCurrency =
                (amount) =>
                    `Rs. ${toNumber(
                        amount
                    ).toLocaleString(
                        "en-IN"
                    )}`;

            /* HEADER */

            doc.setTextColor(
                23,
                32,
                51
            );

            doc.setFont(
                "helvetica",
                "bold"
            );

            doc.setFontSize(
                22
            );

            doc.text(
                "SPARK",
                20,
                22
            );

            doc.setFont(
                "helvetica",
                "normal"
            );

            doc.setFontSize(
                9
            );

            doc.setTextColor(
                100,
                116,
                139
            );

            doc.text(
                "ERP & HR Management System",
                20,
                29
            );

            doc.setDrawColor(
                226,
                232,
                240
            );

            doc.line(
                20,
                36,
                190,
                36
            );

            /* TITLE */

            doc.setTextColor(
                23,
                32,
                51
            );

            doc.setFont(
                "helvetica",
                "bold"
            );

            doc.setFontSize(
                18
            );

            doc.text(
                "Payroll Report",
                20,
                49
            );

            doc.setFont(
                "helvetica",
                "normal"
            );

            doc.setFontSize(
                10
            );

            doc.setTextColor(
                100,
                116,
                139
            );

            doc.text(
                `Payroll Month: ${payroll.month}`,
                20,
                57
            );

            doc.text(
                `Processing Period: ${payroll.period}`,
                20,
                63
            );

            /* SUMMARY */

            doc.setTextColor(
                23,
                32,
                51
            );

            doc.setFont(
                "helvetica",
                "bold"
            );

            doc.setFontSize(
                12
            );

            doc.text(
                "Payroll Summary",
                20,
                77
            );

            autoTable(
                doc,
                {
                    startY: 83,

                    theme: "grid",

                    head: [
                        [
                            "Component",
                            "Value",
                        ],
                    ],

                    body: [
                        [
                            "Payroll Run ID",
                            String(
                                payroll.id ||
                                    "-"
                            ),
                        ],
                        [
                            "Employees Processed",
                            String(
                                payroll.employees ||
                                    0
                            ),
                        ],
                        [
                            "Gross Salary",
                            formatPdfCurrency(
                                payroll.grossSalary
                            ),
                        ],
                        [
                            "Total Deductions",
                            `- ${formatPdfCurrency(
                                payroll.totalDeductions
                            )}`,
                        ],
                        [
                            "Net Salary",
                            formatPdfCurrency(
                                payroll.netSalary
                            ),
                        ],
                        [
                            "Processed Date",
                            formatDate(
                                payroll.processedDate
                            ),
                        ],
                        [
                            "Processed By",
                            payroll.processedBy ||
                                "-",
                        ],
                        [
                            "Status",
                            payroll.status ||
                                "-",
                        ],
                    ],

                    styles: {
                        font: "helvetica",
                        fontSize: 9,
                        cellPadding: 5,
                        textColor: [
                            71,
                            85,
                            105,
                        ],
                    },

                    headStyles: {
                        fillColor: [
                            248,
                            250,
                            252,
                        ],
                        textColor: [
                            71,
                            85,
                            105,
                        ],
                        fontStyle:
                            "bold",
                    },

                    columnStyles: {
                        0: {
                            cellWidth:
                                70,
                        },

                        1: {
                            cellWidth:
                                100,
                        },
                    },
                }
            );

            /* EMPLOYEE PAYROLL */

            const employeeTableStart =
                (
                    doc.lastAutoTable
                        ?.finalY ||
                    83
                ) + 14;

            doc.setTextColor(
                23,
                32,
                51
            );

            doc.setFont(
                "helvetica",
                "bold"
            );

            doc.setFontSize(
                12
            );

            doc.text(
                "Employee Payroll",
                20,
                employeeTableStart
            );

            const employeeRows =
                selectedEmployeeRows.map(
                    (
                        employee
                    ) => [
                        `${employee.employeeName}\nID: ${employee.employeeId}\n${employee.department !== "-" ? employee.department : ""}`,

                        employee.template,

                        formatPdfCurrency(
                            employee.grossSalary
                        ),

                        `- ${formatPdfCurrency(
                            employee.deductions
                        )}`,

                        formatPdfCurrency(
                            employee.netSalary
                        ),
                    ]
                );

            if (
                employeeRows.length >
                0
            ) {
                autoTable(
                    doc,
                    {
                        startY:
                            employeeTableStart +
                            6,

                        theme: "grid",

                        head: [
                            [
                                "Employee",
                                "Payslip Template",
                                "Gross",
                                "Deductions",
                                "Net Salary",
                            ],
                        ],

                        body:
                            employeeRows,

                        styles: {
                            font: "helvetica",
                            fontSize: 8,
                            cellPadding: 4,
                            textColor: [
                                71,
                                85,
                                105,
                            ],
                            valign:
                                "middle",
                        },

                        headStyles: {
                            fillColor: [
                                248,
                                250,
                                252,
                            ],
                            textColor: [
                                71,
                                85,
                                105,
                            ],
                            fontStyle:
                                "bold",
                        },

                        columnStyles: {
                            0: {
                                cellWidth:
                                    48,
                            },

                            1: {
                                cellWidth:
                                    40,
                            },

                            2: {
                                cellWidth:
                                    28,
                                halign:
                                    "right",
                            },

                            3: {
                                cellWidth:
                                    30,
                                halign:
                                    "right",
                            },

                            4: {
                                cellWidth:
                                    30,
                                halign:
                                    "right",
                            },
                        },
                    }
                );
            } else {
                doc.setFont(
                    "helvetica",
                    "normal"
                );

                doc.setFontSize(
                    9
                );

                doc.setTextColor(
                    100,
                    116,
                    139
                );

                doc.text(
                    "No employee-level payroll records were returned.",
                    20,
                    employeeTableStart +
                        8
                );
            }

            /* FOOTER */

            const pageCount =
                doc.getNumberOfPages();

            for (
                let page = 1;
                page <= pageCount;
                page += 1
            ) {
                doc.setPage(
                    page
                );

                const pageHeight =
                    doc.internal
                        .pageSize
                        .height;

                doc.setDrawColor(
                    226,
                    232,
                    240
                );

                doc.line(
                    20,
                    pageHeight - 20,
                    190,
                    pageHeight - 20
                );

                doc.setFont(
                    "helvetica",
                    "normal"
                );

                doc.setFontSize(
                    8
                );

                doc.setTextColor(
                    148,
                    163,
                    184
                );

                doc.text(
                    "This is a system-generated payroll report.",
                    20,
                    pageHeight - 13
                );

                doc.text(
                    `Page ${page} of ${pageCount}`,
                    190,
                    pageHeight - 13,
                    {
                        align: "right",
                    }
                );
            }

            const safeMonth =
                String(
                    payroll.month ||
                        "Payroll"
                )
                    .replace(
                        /[^a-z0-9]+/gi,
                        "_"
                    )
                    .replace(
                        /^_+|_+$/g,
                        ""
                    );

            doc.save(
                `Payroll_Report_${safeMonth}.pdf`
            );
        };

    /* =====================================================
       EXCEL EXPORT
    ===================================================== */

    const handleDownloadExcel =
        () => {
            if (
                !selectedPayroll
            ) {
                return;
            }

            const payroll =
                selectedPayroll;

            /*
             * =================================================
             * ACTUAL EMPLOYEE RECORDS
             * =================================================
             */

            const employees =
                Array.isArray(
                    selectedEmployeeRows
                )
                    ? selectedEmployeeRows
                    : [];

            /*
             * Do NOT create an empty Excel file.
             */

            if (
                employees.length ===
                0
            ) {
                setSnackbar({
                    open: true,
                    message:
                        "No employee payroll records were returned by PayrollService. Excel was not generated.",
                    severity:
                        "warning",
                });

                return;
            }

            /*
             * =================================================
             * CREATE WORKBOOK
             * =================================================
             */

            const workbook =
                XLSX.utils.book_new();

            /*
             * =================================================
             * PAYROLL SUMMARY SHEET
             * =================================================
             */

            const summaryRows = [
                {
                    "Payroll Run ID":
                        payroll.id ||
                        "-",

                    "Payroll Month":
                        payroll.month ||
                        "-",

                    "Processing Period":
                        payroll.period ||
                        "-",

                    "Employees Processed":
                        toNumber(
                            payroll.employees
                        ),

                    "Gross Salary":
                        toNumber(
                            payroll.grossSalary
                        ),

                    "Total Deductions":
                        toNumber(
                            payroll.totalDeductions
                        ),

                    "Net Salary":
                        toNumber(
                            payroll.netSalary
                        ),

                    "Processed Date":
                        formatDate(
                            payroll.processedDate
                        ),

                    "Processed By":
                        payroll.processedBy ||
                        "PayrollService",

                    "Status":
                        payroll.status ||
                        "Completed",
                },
            ];

            const summaryWorksheet =
                XLSX.utils.json_to_sheet(
                    summaryRows
                );

            summaryWorksheet[
                "!cols"
            ] = [
                {
                    wch: 18,
                },
                {
                    wch: 22,
                },
                {
                    wch: 24,
                },
                {
                    wch: 22,
                },
                {
                    wch: 20,
                },
                {
                    wch: 22,
                },
                {
                    wch: 20,
                },
                {
                    wch: 20,
                },
                {
                    wch: 24,
                },
                {
                    wch: 18,
                },
            ];

            /*
             * Freeze header.
             */

            summaryWorksheet[
                "!freeze"
            ] = {
                xSplit: 0,
                ySplit: 1,
            };

            XLSX.utils.book_append_sheet(
                workbook,
                summaryWorksheet,
                "Payroll Summary"
            );

            /*
             * =================================================
             * EMPLOYEE PAYROLL SHEET
             * =================================================
             */

            const employeeExcelRows =
                employees.map(
                    (
                        employee,
                        index
                    ) => ({
                        "S.No":
                            index + 1,

                        "Payroll Record ID":
                            employee.payrollRecordId ||
                            "-",

                        "Employee ID":
                            employee.employeeId ||
                            "-",

                        "Employee Name":
                            employee.employeeName ||
                            "-",

                        "Department":
                            employee.department ||
                            "-",

                        "Payroll Template ID":
                            employee.payrollTemplateId ||
                            "-",

                        "Payslip Template":
                            employee.template ||
                            "-",

                        "Annual CTC":
                            toNumber(
                                employee.annualCtc
                            ),

                        "Monthly CTC":
                            toNumber(
                                employee.monthlyCtc
                            ),

                        "Gross Salary":
                            toNumber(
                                employee.grossSalary
                            ),

                        "Deductions":
                            toNumber(
                                employee.deductions
                            ),

                        "Net Salary":
                            toNumber(
                                employee.netSalary
                            ),

                        "Status":
                            employee.status ||
                            "Processed",

                        "Processed Date":
                            formatDate(
                                employee.processedDate
                            ),
                    })
                );

            const employeeWorksheet =
                XLSX.utils.json_to_sheet(
                    employeeExcelRows
                );

            employeeWorksheet[
                "!cols"
            ] = [
                {
                    wch: 8,
                },
                {
                    wch: 20,
                },
                {
                    wch: 18,
                },
                {
                    wch: 30,
                },
                {
                    wch: 24,
                },
                {
                    wch: 22,
                },
                {
                    wch: 30,
                },
                {
                    wch: 18,
                },
                {
                    wch: 18,
                },
                {
                    wch: 18,
                },
                {
                    wch: 18,
                },
                {
                    wch: 18,
                },
                {
                    wch: 16,
                },
                {
                    wch: 22,
                },
            ];

            /*
             * Freeze employee header.
             */

            employeeWorksheet[
                "!freeze"
            ] = {
                xSplit: 0,
                ySplit: 1,
            };

            XLSX.utils.book_append_sheet(
                workbook,
                employeeWorksheet,
                "Employee Payroll"
            );

            /*
             * =================================================
             * SALARY COMPONENT SHEET
             * =================================================
             */

            const componentRows = [];

            employees.forEach(
                (employee) => {
                    const components =
                        Array.isArray(
                            employee.components
                        )
                            ? employee.components
                            : [];

                    components.forEach(
                        (
                            component,
                            componentIndex
                        ) => {
                            componentRows.push(
                                {
                                    "Employee ID":
                                        employee.employeeId ||
                                        "-",

                                    "Employee Name":
                                        employee.employeeName ||
                                        "-",

                                    "Payroll Record ID":
                                        employee.payrollRecordId ||
                                        "-",

                                    "Component #":
                                        componentIndex +
                                        1,

                                    "Component Name":
                                        firstDefined(
                                            component.componentName,
                                            component.name
                                        ) ||
                                        "-",

                                    "Component Code":
                                        firstDefined(
                                            component.componentCode,
                                            component.code
                                        ) ||
                                        "-",

                                    "Component Type":
                                        firstDefined(
                                            component.componentType,
                                            component.type
                                        ) ||
                                        "-",

                                    "Calculation Type":
                                        firstDefined(
                                            component.calculationType
                                        ) ||
                                        "-",

                                    "Calculation Based On":
                                        firstDefined(
                                            component.calculationBasedOn
                                        ) ||
                                        "-",

                                    "Calculation Value":
                                        toNumber(
                                            firstDefined(
                                                component.calculationValue,
                                                component.value
                                            )
                                        ),

                                    "Amount":
                                        toNumber(
                                            component.amount
                                        ),
                                }
                            );
                        }
                    );
                }
            );

            if (
                componentRows.length >
                0
            ) {
                const componentWorksheet =
                    XLSX.utils.json_to_sheet(
                        componentRows
                    );

                componentWorksheet[
                    "!cols"
                ] = [
                    {
                        wch: 18,
                    },
                    {
                        wch: 30,
                    },
                    {
                        wch: 20,
                    },
                    {
                        wch: 14,
                    },
                    {
                        wch: 28,
                    },
                    {
                        wch: 20,
                    },
                    {
                        wch: 18,
                    },
                    {
                        wch: 22,
                    },
                    {
                        wch: 28,
                    },
                    {
                        wch: 20,
                    },
                    {
                        wch: 18,
                    },
                ];

                componentWorksheet[
                    "!freeze"
                ] = {
                    xSplit: 0,
                    ySplit: 1,
                };

                XLSX.utils.book_append_sheet(
                    workbook,
                    componentWorksheet,
                    "Salary Components"
                );
            }

            /*
             * =================================================
             * FILE NAME
             * =================================================
             */

            const safeMonth =
                String(
                    payroll.month ||
                        "Payroll"
                )
                    .replace(
                        /[^a-z0-9]+/gi,
                        "_"
                    )
                    .replace(
                        /^_+|_+$/g,
                        ""
                    );

            const fileName =
                `Payroll_${safeMonth}.xlsx`;

            /*
             * =================================================
             * WRITE FILE
             * =================================================
             */

            XLSX.writeFile(
                workbook,
                fileName
            );

            /*
             * =================================================
             * SUCCESS MESSAGE
             * =================================================
             */

            setSnackbar({
                open: true,
                message:
                    `Excel generated successfully with ${employees.length} employee payroll record${
                        employees.length ===
                        1
                            ? ""
                            : "s"
                    }.`,
                severity:
                    "success",
            });
        };

    /* =====================================================
       STATUS CHIP
    ===================================================== */

    const renderStatusChip =
        (status) => {
            const normalized =
                String(
                    status || ""
                ).toLowerCase();

            if (
                normalized.includes(
                    "process"
                ) &&
                !normalized.includes(
                    "complete"
                )
            ) {
                return (
                    <Chip
                        label={
                            status ||
                            "Processing"
                        }
                        size="small"
                        icon={
                            <CircularProgress
                                size={12}
                                thickness={5}
                            />
                        }
                        className="ph-history-processing-chip"
                    />
                );
            }

            if (
                normalized.includes(
                    "fail"
                ) ||
                normalized.includes(
                    "error"
                )
            ) {
                return (
                    <Chip
                        label={
                            status ||
                            "Failed"
                        }
                        size="small"
                        icon={
                            <ErrorIcon />
                        }
                        className="ph-history-failed-chip"
                    />
                );
            }

            return (
                <Chip
                    label={
                        status ||
                        "Completed"
                    }
                    size="small"
                    icon={
                        <CheckCircleIcon />
                    }
                    className="ph-history-completed-chip"
                />
            );
        };

    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <Box className="ph-payroll-history-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <Box className="ph-payroll-history-header">

                <Box className="ph-payroll-history-title-section">

                    <IconButton
                        className="ph-payroll-history-back-button"
                        onClick={onBack}
                    >
                        <ArrowBackIcon />
                    </IconButton>

                    <Box>

                        <Typography className="ph-payroll-history-title">
                            Payroll History
                        </Typography>

                        <Typography className="ph-payroll-history-subtitle">
                            View payroll run history, records and details.
                        </Typography>

                    </Box>

                </Box>

                <Button
                    variant="outlined"
                    startIcon={
                        refreshing ? (
                            <CircularProgress
                                size={16}
                            />
                        ) : (
                            <RefreshIcon />
                        )
                    }
                    className="ph-history-refresh-button"
                    disabled={
                        loading ||
                        refreshing
                    }
                    onClick={() =>
                        loadPayrollHistory(
                            true
                        )
                    }
                >
                    {refreshing
                        ? "Refreshing..."
                        : "Refresh"}
                </Button>

            </Box>

            {/* =================================================
                API ERROR
            ================================================= */}

            {error && (
                <Alert
                    severity="error"
                    icon={
                        <ErrorIcon />
                    }
                    className="ph-history-api-alert"
                    action={
                        <Button
                            color="inherit"
                            size="small"
                            onClick={() =>
                                loadPayrollHistory(
                                    true
                                )
                            }
                        >
                            Retry
                        </Button>
                    }
                >
                    <strong>
                        PayrollService connection failed.
                    </strong>

                    <br />

                    {error}
                </Alert>
            )}

            {/* =================================================
                SUMMARY CARDS
            ================================================= */}

            <Grid
                container
                spacing={2}
                className="ph-payroll-history-summary-grid"
            >

                {/* PAYROLL RUNS */}

                <Grid
                    item
                    xs={12}
                    sm={6}
                    md={3}
                >
                    <Card className="ph-history-summary-card">
                        <CardContent>

                            <Box className="ph-history-summary-top">

                                <Box>

                                    <Typography className="ph-history-summary-label">
                                        Payroll Runs
                                    </Typography>

                                    <Typography className="ph-history-summary-value">
                                        {loading
                                            ? "—"
                                            : totalRuns}
                                    </Typography>

                                    <Typography className="ph-history-summary-helper">
                                        Total processed runs
                                    </Typography>

                                </Box>

                                <Box className="ph-history-summary-icon ph-history-icon-blue">
                                    <HistoryIcon />
                                </Box>

                            </Box>

                        </CardContent>
                    </Card>
                </Grid>

                {/* EMPLOYEES */}

                <Grid
                    item
                    xs={12}
                    sm={6}
                    md={3}
                >
                    <Card className="ph-history-summary-card">
                        <CardContent>

                            <Box className="ph-history-summary-top">

                                <Box>

                                    <Typography className="ph-history-summary-label">
                                        Employees Processed
                                    </Typography>

                                    <Typography className="ph-history-summary-value">
                                        {loading
                                            ? "—"
                                            : totalEmployees.toLocaleString(
                                                  "en-IN"
                                              )}
                                    </Typography>

                                    <Typography className="ph-history-summary-helper">
                                        Across payroll runs
                                    </Typography>

                                </Box>

                                <Box className="ph-history-summary-icon ph-history-icon-green">
                                    <PeopleIcon />
                                </Box>

                            </Box>

                        </CardContent>
                    </Card>
                </Grid>

                {/* GROSS */}

                <Grid
                    item
                    xs={12}
                    sm={6}
                    md={3}
                >
                    <Card className="ph-history-summary-card">
                        <CardContent>

                            <Box className="ph-history-summary-top">

                                <Box>

                                    <Typography className="ph-history-summary-label">
                                        Latest Gross Salary
                                    </Typography>

                                    <Typography className="ph-history-summary-value ph-history-money-value">
                                        {latestPayroll
                                            ? formatCurrency(
                                                  latestPayroll.grossSalary
                                              )
                                            : "—"}
                                    </Typography>

                                    <Typography className="ph-history-summary-helper">
                                        {latestPayroll?.month ||
                                            "No payroll available"}
                                    </Typography>

                                </Box>

                                <Box className="ph-history-summary-icon ph-history-icon-orange">
                                    <PaymentsIcon />
                                </Box>

                            </Box>

                        </CardContent>
                    </Card>
                </Grid>

                {/* NET */}

                <Grid
                    item
                    xs={12}
                    sm={6}
                    md={3}
                >
                    <Card className="ph-history-summary-card">
                        <CardContent>

                            <Box className="ph-history-summary-top">

                                <Box>

                                    <Typography className="ph-history-summary-label">
                                        Latest Net Salary
                                    </Typography>

                                    <Typography className="ph-history-summary-value ph-history-net-value">
                                        {latestPayroll
                                            ? formatCurrency(
                                                  latestPayroll.netSalary
                                              )
                                            : "—"}
                                    </Typography>

                                    <Typography className="ph-history-summary-helper">
                                        Latest payroll amount
                                    </Typography>

                                </Box>

                                <Box className="ph-history-summary-icon ph-history-icon-purple">
                                    <CheckCircleIcon />
                                </Box>

                            </Box>

                        </CardContent>
                    </Card>
                </Grid>

            </Grid>

            {/* =================================================
                MAIN HISTORY CARD
            ================================================= */}

            <Card className="ph-payroll-history-card">

                <CardContent>

                    <Box className="ph-history-section-header">

                        <Box>

                            <Typography className="ph-history-section-title">
                                Payroll Runs
                            </Typography>

                            <Typography className="ph-history-section-subtitle">
                                Review previously processed payroll records from PayrollService.
                            </Typography>

                        </Box>

                        <Box className="ph-history-header-meta">

                            {!error && (
                                <Box className="ph-history-live-indicator">
                                    <span />
                                    API Connected
                                </Box>
                            )}

                            <Typography className="ph-history-count">
                                {filteredPayrolls.length} Records
                            </Typography>

                        </Box>

                    </Box>

                    {/* =================================================
                        FILTERS
                    ================================================= */}

                    <Box className="ph-history-filters">

                        <TextField
                            className="ph-history-search"
                            placeholder="Search payroll..."
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value
                                )
                            }
                            size="small"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <FormControl
                            size="small"
                            className="ph-history-filter-select"
                        >
                            <Select
                                value={
                                    monthFilter
                                }
                                onChange={(
                                    event
                                ) =>
                                    setMonthFilter(
                                        event.target.value
                                    )
                                }
                                displayEmpty
                                startAdornment={
                                    <CalendarMonthIcon className="ph-select-icon" />
                                }
                            >
                                {months.map(
                                    (
                                        month
                                    ) => (
                                        <MenuItem
                                            key={
                                                month
                                            }
                                            value={
                                                month
                                            }
                                        >
                                            {month ===
                                            "All"
                                                ? "All Months"
                                                : month}
                                        </MenuItem>
                                    )
                                )}
                            </Select>
                        </FormControl>

                        <FormControl
                            size="small"
                            className="ph-history-filter-select"
                        >
                            <Select
                                value={
                                    statusFilter
                                }
                                onChange={(
                                    event
                                ) =>
                                    setStatusFilter(
                                        event.target.value
                                    )
                                }
                            >
                                <MenuItem value="All">
                                    All Status
                                </MenuItem>

                                <MenuItem value="Completed">
                                    Completed
                                </MenuItem>

                                <MenuItem value="Processing">
                                    Processing
                                </MenuItem>

                                <MenuItem value="Failed">
                                    Failed
                                </MenuItem>
                            </Select>
                        </FormControl>

                    </Box>

                    {/* =================================================
                        TABLE
                    ================================================= */}

                    <Box className="ph-payroll-history-table-wrapper">

                        {loading ? (

                            <Box className="ph-history-loading-state">

                                <CircularProgress
                                    size={34}
                                />

                                <Typography>
                                    Loading payroll history...
                                </Typography>

                                <Typography className="ph-history-loading-helper">
                                    Connecting to PayrollService
                                </Typography>

                            </Box>

                        ) : filteredPayrolls.length >
                          0 ? (

                            <table className="ph-payroll-history-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Payroll Month
                                        </th>

                                        <th>
                                            Processing Period
                                        </th>

                                        <th>
                                            Employees
                                        </th>

                                        <th>
                                            Gross Salary
                                        </th>

                                        <th>
                                            Deductions
                                        </th>

                                        <th>
                                            Net Salary
                                        </th>

                                        <th>
                                            Processed Date
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th>
                                            Action
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {filteredPayrolls.map(
                                        (
                                            payroll
                                        ) => (

                                            <tr
                                                key={
                                                    payroll.id
                                                }
                                            >

                                                <td>

                                                    <Box className="ph-history-month-cell">

                                                        <Box className="ph-history-month-icon">
                                                            <DescriptionIcon />
                                                        </Box>

                                                        <Box>

                                                            <Typography className="ph-history-month">
                                                                {
                                                                    payroll.month
                                                                }
                                                            </Typography>

                                                            <Typography className="ph-history-period">
                                                                Monthly Payroll
                                                            </Typography>

                                                        </Box>

                                                    </Box>

                                                </td>

                                                <td>

                                                    <Typography className="ph-history-body-text">
                                                        {
                                                            payroll.period
                                                        }
                                                    </Typography>

                                                </td>

                                                <td>

                                                    <Typography className="ph-history-body-strong">
                                                        {
                                                            payroll.employees
                                                        }
                                                    </Typography>

                                                </td>

                                                <td>

                                                    <Typography className="ph-history-body-strong">
                                                        {formatCurrency(
                                                            payroll.grossSalary
                                                        )}
                                                    </Typography>

                                                </td>

                                                <td>

                                                    <Typography className="ph-history-deduction">
                                                        -{formatCurrency(
                                                            payroll.totalDeductions
                                                        )}
                                                    </Typography>

                                                </td>

                                                <td>

                                                    <Typography className="ph-history-net">
                                                        {formatCurrency(
                                                            payroll.netSalary
                                                        )}
                                                    </Typography>

                                                </td>

                                                <td>

                                                    <Typography className="ph-history-body-text">
                                                        {formatDate(
                                                            payroll.processedDate
                                                        )}
                                                    </Typography>

                                                    <Typography className="ph-history-processed-by">
                                                        {payroll.processedBy &&
                                                        payroll.processedBy !==
                                                            "-"
                                                            ? `By ${payroll.processedBy}`
                                                            : "PayrollService"}
                                                    </Typography>

                                                </td>

                                                <td>

                                                    {renderStatusChip(
                                                        payroll.status
                                                    )}

                                                </td>

                                                <td>

                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        startIcon={
                                                            <VisibilityIcon />
                                                        }
                                                        className="ph-history-view-button"
                                                        onClick={() =>
                                                            handleViewPayroll(
                                                                payroll
                                                            )
                                                        }
                                                    >
                                                        View
                                                    </Button>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        ) : (

                            <Box className="ph-history-empty-state">

                                <Box className="ph-history-empty-icon">
                                    <HistoryIcon />
                                </Box>

                                <Typography className="ph-history-empty-title">
                                    {payrolls.length ===
                                    0
                                        ? "No payroll records found"
                                        : "No matching payroll records"}
                                </Typography>

                                <Typography className="ph-history-empty-description">
                                    {payrolls.length ===
                                    0
                                        ? "PayrollService did not return any payroll history records."
                                        : "Try changing your search or filter selections."}
                                </Typography>

                                {payrolls.length ===
                                    0 &&
                                    !error && (
                                        <Button
                                            variant="outlined"
                                            startIcon={
                                                <RefreshIcon />
                                            }
                                            onClick={() =>
                                                loadPayrollHistory(
                                                    true
                                                )
                                            }
                                            className="ph-history-empty-button"
                                        >
                                            Refresh Payroll
                                        </Button>
                                    )}

                            </Box>

                        )}

                    </Box>

                </CardContent>

            </Card>

            {/* =================================================
                PAYROLL DETAILS DIALOG
            ================================================= */}

            <Dialog
                open={
                    Boolean(
                        selectedPayroll
                    )
                }
                onClose={
                    handleCloseDialog
                }
                fullWidth
                maxWidth="lg"
                className="ph-history-dialog"
            >

                {selectedPayroll && (
                    <>

                        {/* DIALOG HEADER */}

                        <DialogTitle className="ph-history-dialog-title">

                            <Box className="ph-history-dialog-heading-area">

                                <Box className="ph-history-dialog-icon">
                                    <ReceiptLongIcon />
                                </Box>

                                <Box>

                                    <Typography className="ph-history-dialog-heading">
                                        Payroll Details
                                    </Typography>

                                    <Typography className="ph-history-dialog-subtitle">
                                        {
                                            selectedPayroll.month
                                        }{" "}
                                        Payroll
                                    </Typography>

                                </Box>

                            </Box>

                            <IconButton
                                onClick={
                                    handleCloseDialog
                                }
                                size="small"
                                className="ph-history-dialog-close"
                            >
                                <CloseIcon />
                            </IconButton>

                        </DialogTitle>

                        <DialogContent className="ph-history-dialog-content">

                            {detailsLoading && (
                                <Box className="ph-dialog-loading-bar">

                                    <CircularProgress
                                        size={18}
                                    />

                                    <Typography>
                                        Loading complete payroll details...
                                    </Typography>

                                </Box>
                            )}

                            {detailsError && (
                                <Alert
                                    severity="warning"
                                    icon={
                                        <ErrorIcon />
                                    }
                                    className="ph-dialog-alert"
                                >
                                    {detailsError}
                                </Alert>
                            )}

                            {/* SUMMARY */}

                            <Grid
                                container
                                spacing={2}
                                className="ph-dialog-summary-grid"
                            >

                                <Grid
                                    item
                                    xs={12}
                                    sm={6}
                                    md={3}
                                >
                                    <Box className="ph-dialog-summary-item">

                                        <Box className="ph-dialog-summary-item-icon ph-dialog-blue">
                                            <PeopleIcon />
                                        </Box>

                                        <Box>

                                            <Typography>
                                                Employees
                                            </Typography>

                                            <strong>
                                                {
                                                    selectedPayroll.employees
                                                }
                                            </strong>

                                        </Box>

                                    </Box>
                                </Grid>

                                <Grid
                                    item
                                    xs={12}
                                    sm={6}
                                    md={3}
                                >
                                    <Box className="ph-dialog-summary-item">

                                        <Box className="ph-dialog-summary-item-icon ph-dialog-orange">
                                            <PaymentsIcon />
                                        </Box>

                                        <Box>

                                            <Typography>
                                                Gross Salary
                                            </Typography>

                                            <strong>
                                                {formatCurrency(
                                                    selectedPayroll.grossSalary
                                                )}
                                            </strong>

                                        </Box>

                                    </Box>
                                </Grid>

                                <Grid
                                    item
                                    xs={12}
                                    sm={6}
                                    md={3}
                                >
                                    <Box className="ph-dialog-summary-item">

                                        <Box className="ph-dialog-summary-item-icon ph-dialog-red">
                                            <AccountBalanceWalletIcon />
                                        </Box>

                                        <Box>

                                            <Typography>
                                                Deductions
                                            </Typography>

                                            <strong className="ph-dialog-deduction">
                                                -{formatCurrency(
                                                    selectedPayroll.totalDeductions
                                                )}
                                            </strong>

                                        </Box>

                                    </Box>
                                </Grid>

                                <Grid
                                    item
                                    xs={12}
                                    sm={6}
                                    md={3}
                                >
                                    <Box className="ph-dialog-summary-item ph-dialog-net-summary">

                                        <Box className="ph-dialog-summary-item-icon ph-dialog-green">
                                            <CheckCircleIcon />
                                        </Box>

                                        <Box>

                                            <Typography>
                                                Net Salary
                                            </Typography>

                                            <strong className="ph-dialog-net">
                                                {formatCurrency(
                                                    selectedPayroll.netSalary
                                                )}
                                            </strong>

                                        </Box>

                                    </Box>
                                </Grid>

                            </Grid>

                            {/* PAYROLL META */}

                            <Box className="ph-dialog-meta-grid">

                                <Box className="ph-dialog-meta-item">

                                    <EventIcon />

                                    <Box>

                                        <span>
                                            Processing Period
                                        </span>

                                        <strong>
                                            {
                                                selectedPayroll.period
                                            }
                                        </strong>

                                    </Box>

                                </Box>

                                <Box className="ph-dialog-meta-item">

                                    <CalendarMonthIcon />

                                    <Box>

                                        <span>
                                            Processed Date
                                        </span>

                                        <strong>
                                            {formatDate(
                                                selectedPayroll.processedDate
                                            )}
                                        </strong>

                                    </Box>

                                </Box>

                                <Box className="ph-dialog-meta-item">

                                    <PersonIcon />

                                    <Box>

                                        <span>
                                            Processed By
                                        </span>

                                        <strong>
                                            {
                                                selectedPayroll.processedBy ||
                                                "PayrollService"
                                            }
                                        </strong>

                                    </Box>

                                </Box>

                            </Box>

                            <Divider className="ph-dialog-divider" />

                            {/* EMPLOYEE PAYROLL */}

                            <Box className="ph-dialog-employees-header">

                                <Box>

                                    <Typography className="ph-dialog-employees-title">
                                        Employee Payroll
                                    </Typography>

                                    <Typography className="ph-dialog-employees-subtitle">
                                        Employee payroll records returned by PayrollService.
                                    </Typography>

                                </Box>

                                <Chip
                                    label={`${selectedEmployeeRows.length} Employees`}
                                    size="small"
                                    className="ph-dialog-employee-count"
                                />

                            </Box>

                            <Box className="ph-dialog-employee-table-wrapper">

                                {selectedEmployeeRows.length >
                                0 ? (

                                    <table className="ph-dialog-employee-table">

                                        <thead>

                                            <tr>

                                                <th>
                                                    Employee
                                                </th>

                                                <th>
                                                    Employee ID
                                                </th>

                                                <th>
                                                    Payslip Template
                                                </th>

                                                <th>
                                                    Annual CTC
                                                </th>

                                                <th>
                                                    Gross
                                                </th>

                                                <th>
                                                    Deductions
                                                </th>

                                                <th>
                                                    Net Salary
                                                </th>

                                                <th>
                                                    Status
                                                </th>

                                            </tr>

                                        </thead>

                                        <tbody>

                                            {selectedEmployeeRows.map(
                                                (
                                                    employee
                                                ) => (

                                                    <tr
                                                        key={
                                                            employee.rowId
                                                        }
                                                    >

                                                        <td>

                                                            <Typography className="ph-dialog-employee-name">
                                                                {
                                                                    employee.employeeName
                                                                }
                                                            </Typography>

                                                            <Typography className="ph-dialog-employee-meta">
                                                                {employee.department !==
                                                                "-"
                                                                    ? employee.department
                                                                    : "Employee Payroll"}
                                                            </Typography>

                                                        </td>

                                                        <td>

                                                            <Typography className="ph-dialog-employee-name">
                                                                {
                                                                    employee.employeeId
                                                                }
                                                            </Typography>

                                                        </td>

                                                        <td>

                                                            <Box className="ph-dialog-template-badge">

                                                                <DescriptionIcon />

                                                                <Typography className="ph-dialog-template">
                                                                    {
                                                                        employee.template
                                                                    }
                                                                </Typography>

                                                            </Box>

                                                        </td>

                                                        <td>

                                                            <span className="ph-dialog-money">
                                                                {formatCurrency(
                                                                    employee.annualCtc
                                                                )}
                                                            </span>

                                                        </td>

                                                        <td>

                                                            <span className="ph-dialog-money">
                                                                {formatCurrency(
                                                                    employee.grossSalary
                                                                )}
                                                            </span>

                                                        </td>

                                                        <td>

                                                            <span className="ph-dialog-deduction">
                                                                -{formatCurrency(
                                                                    employee.deductions
                                                                )}
                                                            </span>

                                                        </td>

                                                        <td>

                                                            <span className="ph-dialog-net">
                                                                {formatCurrency(
                                                                    employee.netSalary
                                                                )}
                                                            </span>

                                                        </td>

                                                        <td>

                                                            <Chip
                                                                label={
                                                                    employee.status
                                                                }
                                                                size="small"
                                                                className="ph-history-completed-chip"
                                                            />

                                                        </td>

                                                    </tr>

                                                )
                                            )}

                                        </tbody>

                                    </table>

                                ) : (

                                    <Box className="ph-dialog-no-employees">

                                        <PeopleIcon />

                                        <Typography>
                                            No employee-level payroll records were returned for this payroll run.
                                        </Typography>

                                        <Typography className="ph-dialog-no-employees-helper">
                                            PayrollService should return the employee records in the records collection.
                                        </Typography>

                                    </Box>

                                )}

                            </Box>

                        </DialogContent>

                        {/* DIALOG ACTIONS */}

                        <DialogActions className="ph-history-dialog-actions">

                            <Button
                                onClick={
                                    handleCloseDialog
                                }
                                variant="outlined"
                                className="ph-history-close-button"
                            >
                                Close
                            </Button>

                            <Button
                                variant="outlined"
                                startIcon={
                                    <DescriptionIcon />
                                }
                                className="ph-history-download-button"
                                onClick={
                                    handleDownloadReport
                                }
                            >
                                Download PDF
                            </Button>

                            <Button
                                variant="contained"
                                startIcon={
                                    <TableViewIcon />
                                }
                                className="ph-history-excel-button"
                                onClick={
                                    handleDownloadExcel
                                }
                                disabled={
                                    detailsLoading ||
                                    selectedEmployeeRows.length ===
                                        0
                                }
                            >
                                Download Excel
                            </Button>

                        </DialogActions>

                    </>
                )}

            </Dialog>

            {/* =================================================
                SNACKBAR
            ================================================= */}

            <Snackbar
                open={
                    snackbar.open
                }
                autoHideDuration={
                    3500
                }
                onClose={() =>
                    setSnackbar(
                        (
                            current
                        ) => ({
                            ...current,
                            open: false,
                        })
                    )
                }
                anchorOrigin={{
                    vertical:
                        "bottom",
                    horizontal:
                        "right",
                }}
            >

                <Alert
                    severity={
                        snackbar.severity
                    }
                    variant="filled"
                    onClose={() =>
                        setSnackbar(
                            (
                                current
                            ) => ({
                                ...current,
                                open: false,
                            })
                        )
                    }
                >
                    {
                        snackbar.message
                    }
                </Alert>

            </Snackbar>

        </Box>
    );
};

export default PayrollHistory;