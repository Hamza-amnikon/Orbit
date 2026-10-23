import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import axios from "axios";

import "./Payrolls.css";
import useProfile from "../../Services/useProfile";
import { useAuth } from "../../../context/AuthContext";
import AttendanceService from "../../Services/AttendanceService";
import LeaveService from "../../Services/LeaveService";
import { getAttendanceStatusForDuration } from "../../AttendanceManagement/AttendanceLogs/attendanceRules";

import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Divider,
    FormControl,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    Typography,
} from "@mui/material";

import {
    DownloadOutlined,
    PrintOutlined,
    RefreshOutlined,
    ReceiptLongOutlined,
} from "@mui/icons-material";

import { Typography as MuiText } from "@mui/material";

const payslipLogo = "/Amnikon%20logo.jpg";

/* =========================================================
   API
   ========================================================= */

const PAYROLL_API_BASE_URL = String(
    import.meta.env.VITE_PAYROLL_API_BASE_URL || ""
).replace(/\/+$/, "");
const PAYROLL_API = `${PAYROLL_API_BASE_URL}/api`;
const EMPLOYEE_API = `${import.meta.env.VITE_EMPLOYEE_API_BASE_URL}/api/Employee`;
const DOCUMENT_API = `${import.meta.env.VITE_DOCUMENT_API_BASE_URL}/api/Document`;

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

const attendanceDateKey = (record) => {
    const value = getValue(record, "attendanceDate", "AttendanceDate", "date", "Date", "createdAt", "CreatedAt");
    const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
    return match ? `${match[1]}-${match[2]}-${match[3]}` : "";
};

const attendanceStatus = (record) => getAttendanceStatusForDuration(
    getValue(record, "status", "Status", "attendanceStatus", "AttendanceStatus") || "",
    getValue(record, "checkIn", "CheckIn", "checkInTime", "CheckInTime", "inTime", "InTime"),
    getValue(record, "checkOut", "CheckOut", "checkOutTime", "CheckOutTime", "outTime", "OutTime")
).trim().toLowerCase().replace(/[ _-]+/g, "");


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

const formatAadhaarNumber = (value) => {
    const digits = String(value || "").replace(/\D/g, "").slice(0, 12);
    return digits.match(/\d{1,4}/g)?.join(" ") || "-";
};

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

const AttendanceValue = ({ label, value }) => (
    <Box className="payslip-attendance-item">
        <Typography className="payslip-attendance-label">{label}</Typography>
        <Typography className="payslip-attendance-value">
            {typeof value === "number" ? value.toFixed(2) : value}
        </Typography>
    </Box>
);

const SalaryTable = ({
    title,
    rows = [],
    rowCount = rows.length,
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
                <Typography>Amount (INR)</Typography>
            </Box>

            {Array.from({ length: Math.max(rowCount, rows.length) }, (_, index) => {
                const row = rows[index];
                if (!row) {
                    return (
                        <Box
                            className="payslip-salary-row is-empty"
                            aria-hidden="true"
                            key={`empty-${title}-${index}`}
                        >
                            <Typography>&nbsp;</Typography>
                            <Typography>&nbsp;</Typography>
                        </Box>
                    );
                }

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

    const { hasPermission } = useAuth();

    const permissionRoute = "/employee/payroll";
    const canView = hasPermission(permissionRoute, "view");
    const canExport = hasPermission(permissionRoute, "export");

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

    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [attendanceLoading, setAttendanceLoading] = useState(false);
    const [attendanceError, setAttendanceError] = useState("");
    const [leaveBalances, setLeaveBalances] = useState([]);
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [identityDocuments, setIdentityDocuments] = useState({
        panNumber: "",
        aadhaarNumber: "",
    });

    useEffect(() => {
        let active = true;
        const loadAttendanceSummary = async () => {
            if (!profile || profileLoading) return;
            setAttendanceLoading(true);
            setAttendanceError("");
            try {
                const employeeId = await resolveEmployeeId(profile);
                if (!employeeId) throw new Error("Unable to identify your employee profile.");

                const [attendanceResult, balancesResult, typesResult, documentsResult] = await Promise.allSettled([
                    AttendanceService.getEmployeeAttendance(employeeId),
                    LeaveService.getEmployeeLeaveBalances(employeeId),
                    LeaveService.getLeaveTypes(),
                    axios.get(`${DOCUMENT_API}/employee/${employeeId}`),
                ]);
                if (!active) return;

                if (documentsResult.status === "fulfilled") {
                    const responseData = documentsResult.value?.data;
                    const documents = Array.isArray(responseData)
                        ? responseData
                        : Array.isArray(responseData?.data)
                            ? responseData.data
                            : responseData && typeof responseData === "object"
                                ? [responseData]
                                : [];
                    const getDocumentType = (document) => String(getValue(
                        document,
                        "documentType",
                        "DocumentType",
                        "documentName",
                        "DocumentName"
                    ) || "").trim().toLowerCase();
                    const latestDocument = (type) => documents
                        .filter((document) => getDocumentType(document) === type)
                        .sort((left, right) => Number(getValue(right, "documentId", "DocumentId") || 0) - Number(getValue(left, "documentId", "DocumentId") || 0))[0];
                    const pan = latestDocument("pan");
                    const aadhaar = latestDocument("aadhaar");

                    setIdentityDocuments({
                        panNumber: getValue(pan, "documentNumber", "DocumentNumber") || "",
                        aadhaarNumber: getValue(aadhaar, "documentNumber", "DocumentNumber") || "",
                    });
                }

                if (attendanceResult.status === "rejected") {
                    throw attendanceResult.reason;
                }

                const attendanceData = attendanceResult.value;
                setAttendanceRecords(Array.isArray(attendanceData)
                    ? attendanceData
                    : Array.isArray(attendanceData?.data)
                        ? attendanceData.data
                        : []);
                setLeaveBalances(balancesResult.status === "fulfilled" && Array.isArray(balancesResult.value)
                    ? balancesResult.value
                    : []);
                setLeaveTypes(typesResult.status === "fulfilled" && Array.isArray(typesResult.value)
                    ? typesResult.value
                    : []);

            } catch (loadError) {
                if (active) {
                    setAttendanceRecords([]);
                    setAttendanceError(loadError?.message || "Unable to load attendance records.");
                }
            } finally {
                if (active) setAttendanceLoading(false);
            }
        };

        loadAttendanceSummary();
        return () => { active = false; };
    }, [profile, profileLoading, selectedYear, selectedMonth]);

    const monthlyAttendance = useMemo(() => {
        const monthPrefix = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-`;
        const byDate = new Map();
        attendanceRecords.forEach((record) => {
            const date = attendanceDateKey(record);
            if (date.startsWith(monthPrefix)) byDate.set(date, record);
        });

        const counts = { present: 0, weeklyOff: 0, paidOff: 0, lwp: 0, absent: 0, paidLeave: 0 };
        byDate.forEach((record) => {
            const status = attendanceStatus(record);
            if (["present", "late", "wfh", "workfromhome"].includes(status)) counts.present += 1;
            else if (status === "halfday") counts.present += 0.5;
            else if (status.includes("weeklyoff") || status.includes("weekoff")) counts.weeklyOff += 1;
            else if (status.includes("paidoff") || status.includes("holiday")) counts.paidOff += 1;
            else if (status.includes("paidleave") || status === "pl") counts.paidLeave += 1;
            else if (status.includes("unpaid") || status === "lwp" || status.includes("leavewithoutpay")) counts.lwp += 1;
            else if (status.includes("absent")) counts.absent += 1;
        });

        return {
            ...counts,
            daysPaid: counts.present + counts.weeklyOff + counts.paidOff + counts.paidLeave,
            recordCount: byDate.size,
        };
    }, [attendanceRecords, selectedYear, selectedMonth]);

    const paidLeaveBalance = useMemo(() => {
        const plTypeIds = new Set(leaveTypes
            .filter((type) => /^(pl|paid leave|privilege leave|earned leave)$/i.test(String(getValue(type, "leaveTypeName", "LeaveTypeName", "name", "Name") || "").trim()))
            .map((type) => String(getValue(type, "leaveTypeId", "LeaveTypeId", "id", "Id"))));
        const balance = leaveBalances.find((item) => {
            const typeName = String(getValue(item, "leaveTypeName", "LeaveTypeName") || "").trim();
            const typeId = String(getValue(item, "leaveTypeId", "LeaveTypeId") || "");
            return /^(pl|paid leave|privilege leave|earned leave)$/i.test(typeName) || plTypeIds.has(typeId);
        });
        return balance ? Number(getValue(balance, "balanceDays", "BalanceDays", "balance", "Balance") || 0) : null;
    }, [leaveBalances, leaveTypes]);

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

    const advanceRepaymentTotal = deductions
        .filter((row) => String(row?.componentCode || row?.ComponentCode || "").toUpperCase() === "ADVANCE_REPAYMENT")
        .reduce((sum, row) => sum + Number(row?.amount || 0), 0);

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
        backendTotalDeductions - effectiveAttendanceDeduction - advanceRepaymentTotal
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

    if (advanceRepaymentTotal > 0.01) {
        displayDeductions.push({
            salaryComponentId: "advance-repayment",
            sequence: 999997,
            componentName: "Salary Advance Repayment",
            amount: advanceRepaymentTotal,
        });
    }

    const advancePayments = (payslip?.components || [])
        .filter((row) => String(row?.componentCode || row?.ComponentCode || "").toUpperCase() === "ADVANCE_PAYOUT")
        .map((row) => ({
            ...row,
            componentName: "Salary Advance Payout",
            amount: Number(row?.amount ?? row?.Amount ?? 0),
        }));
    const advancePayoutTotal = advancePayments.reduce((sum, row) => sum + row.amount, 0);
    const displayEarnings = [...earnings, ...advancePayments];
    const displayTotalEarnings =
        Number(payslip?.totalEarnings || payslip?.grossSalary || 0) +
        advancePayoutTotal;
    const salaryRowCount = Math.max(
        displayEarnings.length,
        displayDeductions.length,
        1
    );

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
            ) - effectiveTotalDeductions + advancePayoutTotal;

    /* =====================================================
       PRINT
    ===================================================== */

    const handlePrint = () => {
        if (!canExport) return;
        window.print();
    };

    // Download PDF uses the same A4 print stylesheet.
    // In Chrome/Edge the user can choose "Save as PDF" in the print dialog.
    const handleDownload = () => {
        if (!canExport) return;
        window.print();
    };

    /* =====================================================
       LOADING
    ===================================================== */

    if (!canView) {
        return (
            <Box
                className="payroll-state"
                sx={{ padding: "60px", textAlign: "center" }}
            >
                <Typography variant="h5">
                    Access Denied
                </Typography>

                <Typography sx={{ mt: 1 }}>
                    You do not have permission to access this page.
                </Typography>
            </Box>
        );
    }

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

                {canExport && (
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
                )}
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
                                <Box
                                    component="img"
                                    src={payslipLogo}
                                    alt="Amnikon Technologies"
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
                                <MuiText component="strong" variant="inherit">
                                    {monthName(
                                        selectedMonth
                                    )}{" "}
                                    {selectedYear}
                                </MuiText>
                            </Typography>

                            {payslip.payslipNumber && (
                                <Typography className="payslip-number">
                                    {payslip.payslipNumber}
                                </Typography>
                            )}
                            <Box className="payslip-company-details">
                                <Typography className="company-name">
                                    AMNIKON TECHNOLOGIES PVT. LTD.
                                </Typography>
                                <Typography className="company-line">
                                    1601, Amnikon Technologies, Arihant Aura
                                </Typography>
                                <Typography className="company-line">
                                    Turbhe, Navi Mumbai - 400705
                                </Typography>
                                <Typography className="company-line">
                                    Phone: +91 22 1234 5678&nbsp;&nbsp;|&nbsp;&nbsp;Email: hr@sparktech.com
                                </Typography>
                            </Box>
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
                                    payslip.employeeName || profile?.displayName || profile?.fullName || profile?.employeeName || "-"
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
                                    payslip.designation || profile?.designation || profile?.jobTitle || "-"
                                }
                            />
                            <InfoRow
                                label="PAN Number"
                                value={identityDocuments.panNumber || "-"}
                            />
                        </Box>

                        <Box className="employee-info-column">

                            <InfoRow
                                label="Date of Joining"
                                value={dateText(
                                    payslip.joiningDate || profile?.dateOfJoining || profile?.joiningDate
                                )}
                            />

                            <InfoRow
                                label="Pay Period"
                                value={
                                    payPeriod
                                }
                            />

                            <InfoRow
                                label="Department"
                                value={payslip.department || profile?.department || "-"}
                            />
                            <InfoRow
                                label="Aadhaar Number"
                                value={formatAadhaarNumber(identityDocuments.aadhaarNumber)}
                            />

                        </Box>

                    </Box>

                    <Divider />

                    {/* =========================================
                        MONTHLY ATTENDANCE FROM ATTENDANCE SERVICE
                    ========================================= */}

                    <Box className="payslip-attendance-summary">
                        <Typography className="payslip-attendance-title">
                            ATTENDANCE LOGS
                        </Typography>
                        {attendanceLoading ? (
                            <Typography className="payslip-attendance-state">Loading attendance records…</Typography>
                        ) : attendanceError ? (
                            <Typography className="payslip-attendance-state payslip-attendance-error">
                                Attendance records unavailable: {attendanceError}
                            </Typography>
                        ) : (
                            <Box className="payslip-attendance-grid">
                                <AttendanceValue label="Days Paid" value={monthlyAttendance.recordCount ? monthlyAttendance.daysPaid : "—"} />
                                <AttendanceValue label="Days Present" value={monthlyAttendance.recordCount ? monthlyAttendance.present : "—"} />
                                <AttendanceValue label="W.Off / Pd.Off" value={monthlyAttendance.recordCount ? `${monthlyAttendance.weeklyOff.toFixed(2)} / ${monthlyAttendance.paidOff.toFixed(2)}` : "—"} />
                                <AttendanceValue label="LWP / Absent" value={monthlyAttendance.recordCount ? `${monthlyAttendance.lwp.toFixed(2)} / ${monthlyAttendance.absent.toFixed(2)}` : "—"} />
                                <AttendanceValue label="PL" value={monthlyAttendance.recordCount ? monthlyAttendance.paidLeave.toFixed(2) : "—"} />
                                <AttendanceValue label="Bal PL" value={paidLeaveBalance === null ? "—" : paidLeaveBalance.toFixed(2)} />
                            </Box>
                        )}
                        {!attendanceLoading && !attendanceError && monthlyAttendance.recordCount === 0 && (
                            <Typography className="payslip-attendance-state">
                                No attendance records are available for this payroll month.
                            </Typography>
                        )}
                    </Box>

                    {/* =========================================
                        EARNINGS / DEDUCTIONS
                    ========================================= */}

                    <Box className="salary-tables">

                        <Box className="salary-table-column">
                            <SalaryTable
                                title="EARNINGS"
                                rows={displayEarnings}
                                rowCount={salaryRowCount}
                                totalLabel="TOTAL EARNINGS"
                                total={displayTotalEarnings}
                            />
                        </Box>

                        <Box className="salary-table-column salary-deductions-column">
                            <SalaryTable
                                title="DEDUCTIONS"
                                rows={displayDeductions}
                                rowCount={salaryRowCount}
                                totalLabel="TOTAL DEDUCTIONS"
                                total={effectiveTotalDeductions}
                            />
                        </Box>

                    </Box>

                    {/* =========================================
                        NET PAY
                    ========================================= */}

                    <Box className="net-pay-box">
                        <Typography className="net-pay-label">NET PAY</Typography>
                        <MuiText component="strong" variant="inherit" className="net-pay-value">
                            {currency(effectiveNetSalary)}
                        </MuiText>
                    </Box>

                    {/* =========================================
                        FOOTER
                    ========================================= */}

<Box className="payslip-footer">

    <Box className="footer-note-section">

        <Typography className="footer-note">
            <MuiText component="strong" variant="inherit">Note:</MuiText>&nbsp;
            This is a system generated payslip. Please contact HR for any payroll related queries.
        </Typography>

    </Box>

</Box>

                    </Paper>
                </Box>
            )}

            {!payslip && !loading && !error && !profileLoading && (
                <Card className="payslip-empty-state no-print" elevation={0}>
                    <CardContent className="payslip-empty-content">
                        <Box className="payslip-empty-icon">
                            <ReceiptLongOutlined />
                        </Box>
                        <Typography className="payslip-empty-title">
                            No payslip for this period
                        </Typography>
                        <Typography className="payslip-empty-description">
                            There isn’t a payslip available for {monthName(selectedMonth)} {selectedYear}. Try another month or refresh later.
                        </Typography>
                    </CardContent>
                </Card>
            )}

        </Box>
    );
}

export default Payslips;
