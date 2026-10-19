import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import CompOff from "../../CompOff/CompOff";
import { useAuth } from "../../../../context/AuthContext";
import "./LeaveBalance.css";

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControl,
  InputAdornment,
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
  TextField,
  Typography,
  Snackbar,
  Alert,
  IconButton,
  Tooltip,
} from "@mui/material";

import {
  Search,
  Refresh,
  Sync,
  ArrowBack,
  People,
  EventAvailable,
  TrendingUp,
  EventBusy,
  AccountBalance,
} from "@mui/icons-material";
import { Box as MuiLayoutBox, Typography as MuiText } from "@mui/material";
import { loadXlsx } from "../../../../utils/exportLibraries";
import FileDownloadOutlined from "@mui/icons-material/FileDownloadOutlined";

const BALANCE_API =
    `${import.meta.env.VITE_LEAVE_API_BASE_URL}/api/EmployeeLeaveBalance`;

const LEAVE_TYPE_API =
    `${import.meta.env.VITE_LEAVE_API_BASE_URL}/api/LeaveType`;

const LEAVE_SYNC_API =
    `${import.meta.env.VITE_LEAVE_API_BASE_URL}/api/Leave/assign-to-all`;

export default function LeaveBalance() {

  const { hasPermission } = useAuth();

  const permissionRoute = "/leave/balance";
  const canView = hasPermission(permissionRoute, "view");
  const canCreate = hasPermission(permissionRoute, "create");
  const canExport = hasPermission(permissionRoute, "export");

  const [balances, setBalances] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [notice, setNotice] = useState({ open: false, message: "", severity: "success" });

  const [selectedAzureEmployee, setSelectedAzureEmployee] =
    useState("");

  const [searchEmployee, setSearchEmployee] =
    useState("");
const [compOffOpen, setCompOffOpen] = useState(false);
  // ==========================================================
  // LOAD DATA
  // ==========================================================

  useEffect(() => {
    loadLeaveBalance();
  }, []);

  const loadLeaveBalance = async () => {
    try {
      setLoading(true);
      setError("");

      const [balanceResponse, leaveTypeResponse] =
        await Promise.all([
          axios.get(BALANCE_API),
          axios.get(LEAVE_TYPE_API),
        ]);

      setBalances(
        Array.isArray(balanceResponse.data)
          ? balanceResponse.data
          : []
      );

      setLeaveTypes(
        Array.isArray(leaveTypeResponse.data)
          ? leaveTypeResponse.data
          : []
      );
    } catch (err) {
      console.error(
        "Error loading leave balance:",
        err
      );

      setError(
        "Unable to load leave balance. Please check the Leave Service API."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // LEAVE TYPE NAME
  // ==========================================================

  const getLeaveTypeName = (leaveTypeId) => {
    const leaveType = leaveTypes.find(
      (type) =>
        Number(type.leaveTypeId) ===
        Number(leaveTypeId)
    );

    return leaveType
      ? leaveType.leaveTypeName
      : `Leave Type ${leaveTypeId}`;
  };

  // ==========================================================
  // AZURE EMPLOYEE IDS
  // ==========================================================

  const azureEmployeeIds = useMemo(() => {
    const ids = balances
      .map((balance) => balance.azureEmployeeId)
      .filter(
        (id) =>
          id !== null &&
          id !== undefined &&
          id !== ""
      );

    return [...new Set(ids.map(String))].sort(
      (a, b) => Number(a) - Number(b)
    );
  }, [balances]);

  // ==========================================================
  // FILTER DATA
  // ==========================================================

  const filteredBalances = useMemo(() => {
    const search = searchEmployee
      .trim()
      .toLowerCase();

    return balances.filter((balance) => {
      // Azure Employee dropdown
      const matchesAzureEmployee =
        selectedAzureEmployee === "" ||
        String(balance.azureEmployeeId || "") ===
        selectedAzureEmployee;

      // Search Employee ID / Azure ID / Name
      const matchesSearch =
        search === "" ||
        String(balance.employeeId || "")
          .toLowerCase()
          .includes(search) ||
        String(balance.azureEmployeeId || "")
          .toLowerCase()
          .includes(search) ||
        String(balance.employeeName || "")
          .toLowerCase()
          .includes(search);

      return (
        matchesAzureEmployee &&
        matchesSearch
      );
    });
  }, [
    balances,
    selectedAzureEmployee,
    searchEmployee,
  ]);

  // ==========================================================
  // SUMMARY
  // ==========================================================

  const totalEmployees = useMemo(() => {
    return new Set(
      filteredBalances.map(
        (balance) => balance.employeeId
      )
    ).size;
  }, [filteredBalances]);

  const totalEntitled = useMemo(() => {
    return filteredBalances.reduce(
      (total, balance) =>
        total +
        Number(balance.entitledDays || 0),
      0
    );
  }, [filteredBalances]);

  const totalAccrued = useMemo(() => {
    return filteredBalances.reduce(
      (total, balance) =>
        total +
        Number(balance.accruedDays || 0),
      0
    );
  }, [filteredBalances]);

  const totalUsed = useMemo(() => {
    return filteredBalances.reduce(
      (total, balance) =>
        total +
        Number(balance.usedDays || 0),
      0
    );
  }, [filteredBalances]);

  const totalBalance = useMemo(() => {
    return filteredBalances.reduce(
      (total, balance) =>
        total +
        Number(balance.balanceDays || 0),
      0
    );
  }, [filteredBalances]);

  // ==========================================================
  // CLEAR FILTERS
  // ==========================================================

  const clearFilters = () => {
    setSearchEmployee("");
    setSelectedAzureEmployee("");
  };

  const handleExport = async () => {
    if (!canExport || filteredBalances.length === 0) return;

    const XLSX = await loadXlsx();
    const rows = filteredBalances.map((balance) => ({
      "Azure Employee ID": balance.azureEmployeeId ?? "-",
      "Employee Name": balance.employeeName ?? "-",
      "Leave Type": getLeaveTypeName(balance.leaveTypeId),
      Year: balance.year ?? "-",
      Entitled: Number(balance.entitledDays || 0),
      Accrued: Number(balance.accruedDays || 0),
      Used: Number(balance.usedDays || 0),
      Balance: Number(balance.balanceDays || 0),
    }));
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leave Balances");
    XLSX.writeFile(workbook, "Leave_Balance.xlsx");
    setNotice({ open: true, message: "Leave balances exported successfully.", severity: "success" });
  };

  const handleAddCompOff = () => {
    if (!canCreate) return;
    setCompOffOpen(true);
  };

  // ==========================================================
  // SYNC LEAVE POLICIES
  // ==========================================================

  const handleSyncLeavePolicies = async () => {
    if (syncing) return;

    try {
      setSyncing(true);
      setError("");

      const response = await axios.post(LEAVE_SYNC_API);

      setNotice({
        open: true,
        message: response.data?.message || "Leave policies synchronized successfully.",
        severity: "success",
      });

      // Reload balances so the latest synchronized values
      // are immediately reflected in the table and summary cards.
      await loadLeaveBalance();
    } catch (err) {
      console.error("Error synchronizing leave policies:", err);

      const apiMessage =
        err.response?.data?.message ||
        err.response?.data ||
        "Unable to synchronize leave policies.";

      setError(
        typeof apiMessage === "string"
          ? apiMessage
          : "Unable to synchronize leave policies."
      );
      setNotice({ open: true, message: typeof apiMessage === "string" ? apiMessage : "Unable to synchronize leave policies.", severity: "error" });
    } finally {
      setSyncing(false);
    }
  };

  // ==========================================================
  // SUMMARY CARD
  // ==========================================================

  const SummaryCard = ({
    title,
    value,
    subtitle,
    icon,
    background,
    iconColor,
  }) => {
    return (
      <Card
        elevation={0}
        sx={{
          flex: 1,
          minWidth: {
            xs: "100%",
            sm: "calc(50% - 8px)",
            lg: 0,
          },
          border: "1px solid #e2e8f0",
          borderRadius: 2.5,
          backgroundColor: "#ffffff",
          boxShadow: "0 4px 14px rgba(15, 23, 42, 0.04)",
        }}
      >
        <CardContent sx={{ p: 2.25 }}>
<Stack
    direction="row"
    sx={{
        justifyContent: "space-between",
        alignItems: "flex-start",
    }}
>
            <Box>
              <Typography
                variant="body2"
                sx={{
                  color: "#64748b",
                  fontWeight: 600,
                  mb: 0.75,
                }}
              >
                {title}
              </Typography>

              <Typography
                variant="h5"
                sx={{
                  color: "#172554",
                  fontWeight: 700,
                  lineHeight: 1.2,
                }}
              >
                {value}
              </Typography>

              <Typography
                variant="caption"
                sx={{
                  color: "#94a3b8",
                  display: "block",
                  mt: 0.75,
                }}
              >
                {subtitle}
              </Typography>
            </Box>

            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: background,
                color: iconColor,
                border: "1px solid rgba(0,0,0,0.05)",
              }}
            >
              {icon}
            </Box>
          </Stack>
        </CardContent>
      </Card>
    );
  };

  // ==========================================================
  // UI
  // ==========================================================

  if (!canView) {
    return (
      <MuiLayoutBox className="leave-balance-access-denied" component="div">
        <MuiText component="h2" variant="h5">Access Denied</MuiText>
        <MuiText component="p" variant="body1">You do not have permission to access this page.</MuiText>
      </MuiLayoutBox>
    );
  }

  return (
    <Box className="leave-balance-page">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <Box component="header" className="leave-balance-header">
        <Stack direction="row" alignItems="center" spacing={1.5} className="leave-balance-heading">
          <Tooltip title="Go back">
            <IconButton className="leave-balance-back" onClick={() => window.history.back()} aria-label="Go back">
              <ArrowBack />
            </IconButton>
          </Tooltip>
          <Box>
              <Typography component="h2" variant="h5">Leave Balance Management</Typography>
            <Typography component="p" variant="body2">
              View employee leave entitlements, accruals, usage and remaining balances.
            </Typography>
          </Box>
        </Stack>

        <Stack
          className="leave-balance-actions"
          direction="row"
          spacing={1}
        >
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadLeaveBalance}
            disabled={loading}
            sx={{ height: 40, borderColor: "#cbd5e1", color: "#334155", textTransform: "none", fontWeight: 600 }}
          >
            Refresh
          </Button>

          {canExport && (
            <Button
              variant="outlined"
              startIcon={<FileDownloadOutlined />}
              onClick={handleExport}
              disabled={loading || filteredBalances.length === 0}
            >
              Export Excel
            </Button>
          )}
          
          {canCreate && (
            <>
              <Button
                variant="contained"
                className="sync-leave-policy-btn"
                startIcon={<Sync />}
                onClick={handleSyncLeavePolicies}
                disabled={syncing || loading}
              >
                {syncing ? "Syncing..." : "Sync Leave Policy"}
              </Button>

              <Button
                variant="contained"
                onClick={handleAddCompOff}
                sx={{ textTransform: "none", fontWeight: 600, height: 40, borderColor: "#cbd5e1", color: "#334155" }}
              >
                <AddCircleOutlineRoundedIcon sx={{ mr: 0.75 }} /> Add Comp-Off
              </Button>
            </>
          )}
        </Stack>
      </Box>

      {/* ======================================================
          SUMMARY
      ====================================================== */}

<Stack
  className="leave-balance-summary"
  direction="row"
  spacing={2}
  useFlexGap
  sx={{
    flexWrap: "wrap",
    mb: 3,
  }}
>
        <SummaryCard
          title="Employees"
          value={totalEmployees}
          subtitle="Employees with leave balance"
          icon={<People />}
          background="#e8f1ff"
          iconColor="#2563eb"
        />

        <SummaryCard
          title="Total Entitled"
          value={totalEntitled.toFixed(2)}
          subtitle="Total entitled leave days"
          icon={<EventAvailable />}
          background="#f0eaff"
          iconColor="#7c3aed"
        />

        <SummaryCard
          title="Total Accrued"
          value={totalAccrued.toFixed(2)}
          subtitle="Total accrued leave days"
          icon={<TrendingUp />}
          background="#e8f7ef"
          iconColor="#16803c"
        />

        <SummaryCard
          title="Total Used"
          value={totalUsed.toFixed(2)}
          subtitle="Total used leave days"
          icon={<EventBusy />}
          background="#fff0e6"
          iconColor="#ea580c"
        />

        <SummaryCard
          title="Remaining Balance"
          value={totalBalance.toFixed(2)}
          subtitle="Available leave days"
          icon={<AccountBalance />}
          background="#e6f7f5"
          iconColor="#0f766e"
        />
      </Stack>

      {/* ======================================================
          FILTER CARD
      ====================================================== */}

      <Card
        className="leave-balance-filter-card"
        elevation={0}
        sx={{
          mb: 2.5,
          border: "1px solid #e2e8f0",
          borderRadius: 2.5,
          backgroundColor: "#ffffff",
        }}
      >
        <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
<Stack
  className="leave-balance-filters"
  direction={{
    xs: "column",
    md: "row",
  }}
  spacing={2}
  sx={{
    alignItems: {
      xs: "stretch",
      md: "flex-end",
    },
  }}
>
            {/* SEARCH */}

            <TextField
              className="search-filter"
              fullWidth
              placeholder="Search by Azure ID or employee name"
              aria-label="Search by Azure ID or employee name"
              value={searchEmployee}
              onChange={(e) =>
                setSearchEmployee(
                  e.target.value
                )
              }
              size="small"
              sx={{
                flex: 1,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1.5,
                  backgroundColor: "#ffffff",
                },
              }}
slotProps={{
  input: {
    startAdornment: (
      <InputAdornment position="start">
        <Search
          sx={{
            color: "#94a3b8",
          }}
        />
      </InputAdornment>
    ),
  },
}}
            />

            {/* AZURE EMPLOYEE DROPDOWN */}

            <FormControl
              className="azure-filter"
              size="small"
              sx={{
                minWidth: {
                  xs: "100%",
                  md: 260,
                },
              }}
            >
              <InputLabel>
                Azure Employee ID
              </InputLabel>

              <Select
                value={selectedAzureEmployee}
                label="Azure Employee ID"
                onChange={(e) =>
                  setSelectedAzureEmployee(
                    e.target.value
                  )
                }
                sx={{
                  borderRadius: 1.5,
                }}
              >
                <MenuItem value="">
                  All Employees
                </MenuItem>

                {azureEmployeeIds.map(
                  (azureId) => (
                    <MenuItem
                      key={azureId}
                      value={azureId}
                    >
                      {azureId}
                    </MenuItem>
                  )
                )}
              </Select>
            </FormControl>

            {/* CLEAR */}

            <Button
              className="clear-filter-btn"
              variant="contained"
              startIcon={<Refresh />}
              onClick={clearFilters}
              sx={{
                height: 40,
                minWidth: 120,
                textTransform: "none",
                borderRadius: 1.5,
                fontWeight: 600,
              }}
            >
              Reset
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <Card
          className="leave-balance-error"
          elevation={0}
          sx={{
            mb: 2,
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: 2,
          }}
        >
          <CardContent sx={{ py: 1.5 }}>
            <Typography
              variant="body2"
              sx={{
                color: "#b91c1c",
              }}
            >
              {error}
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* ======================================================
          LOADING
      ====================================================== */}

      {loading ? (
        <Card
          elevation={0}
          sx={{
            border: "1px solid #e2e8f0",
            borderRadius: 2.5,
          }}
        >
          <CardContent
            sx={{
              py: 6,
              textAlign: "center",
            }}
          >
            <Typography
              color="text.secondary"
            >
              Loading leave balances...
            </Typography>
          </CardContent>
        </Card>
      ) : balances.length === 0 ? (
        <Card
          elevation={0}
          sx={{
            border: "1px solid #e2e8f0",
            borderRadius: 2.5,
          }}
        >
          <CardContent
            sx={{
              py: 6,
              textAlign: "center",
            }}
          >
            <Typography
              color="text.secondary"
            >
              No leave balance records found.
            </Typography>
          </CardContent>
        </Card>
      ) : filteredBalances.length === 0 ? (
        <Card
          elevation={0}
          sx={{
            border: "1px solid #e2e8f0",
            borderRadius: 2.5,
          }}
        >
          <CardContent
            sx={{
              py: 6,
              textAlign: "center",
            }}
          >
            <Typography
              color="text.secondary"
              sx={{ mb: 1 }}
            >
              No leave balance found.
            </Typography>

            <Button
              size="small"
              onClick={clearFilters}
              sx={{
                textTransform: "none",
              }}
            >
              Clear filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* ====================================================
           TABLE
        ==================================================== */

        <Card
          className="leave-balance-card"
          elevation={0}
          sx={{
            border: "1px solid #e2e8f0",
            borderRadius: 2.5,
            overflow: "hidden",
          }}
        >
          {/* TABLE HEADER */}

          <Box
            className="table-header"
            sx={{
              px: 2.5,
              py: 1.75,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "#ffffff",
            }}
          >
            <Box>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 700,
                  color: "#172033",
                }}
              >
                Employee Leave Balances
              </Typography>

              <Typography
                variant="caption"
                sx={{
                  color: "#64748b",
                }}
              >
                Showing {filteredBalances.length}{" "}
                leave balance records
              </Typography>
            </Box>
            <Chip
              className="leave-balance-count"
              size="small"
              label={`${filteredBalances.length} ${filteredBalances.length === 1 ? "record" : "records"}`}
            />
          </Box>

          <Divider />

          <TableContainer
            sx={{
              maxHeight: 600,
            }}
          >
            <Table
              className="leave-balance-table"
              stickyHeader
              sx={{
                width: "100%",
                minWidth: 1000,
                tableLayout: "fixed",
                "& .MuiTableCell-root": {
                  boxSizing: "border-box",
                  borderLeft: "0 !important",
                  borderRight: "0 !important",
                  boxShadow: "none !important",
                },
                "& .MuiTableHead-root .MuiTableCell-root:nth-of-type(-n+3), & .MuiTableBody-root .MuiTableCell-root:nth-of-type(-n+3)": {
                  textAlign: "left !important",
                },
                "& .MuiTableHead-root .MuiTableCell-root:nth-of-type(4), & .MuiTableBody-root .MuiTableCell-root:nth-of-type(4)": {
                  textAlign: "center !important",
                },
                "& .MuiTableHead-root .MuiTableCell-root:nth-of-type(n+5), & .MuiTableBody-root .MuiTableCell-root:nth-of-type(n+5)": {
                  textAlign: "right !important",
                },
              }}
            >
              <colgroup>
                <col style={{ width: "16%" }} />
                <col style={{ width: "23%" }} />
                <col style={{ width: "16%" }} />
                <col style={{ width: "7%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "8%" }} />
                <col style={{ width: "10%" }} />
              </colgroup>
              <TableHead>
                <TableRow>
                  <TableCell align="left" sx={headerCellStyle}>
                    Azure Employee ID
                  </TableCell>

                  <TableCell align="left" sx={headerCellStyle}>
                    Employee Name
                  </TableCell>

                  <TableCell align="left" sx={headerCellStyle}>
                    Leave Type
                  </TableCell>

                  <TableCell
                    align="center"
                    sx={headerCellStyle}
                  >
                    Year
                  </TableCell>

                  <TableCell
                    align="right"
                    sx={headerCellStyle}
                  >
                    Entitled
                  </TableCell>

                  <TableCell
                    align="right"
                    sx={headerCellStyle}
                  >
                    Accrued
                  </TableCell>

                  <TableCell
                    align="right"
                    sx={headerCellStyle}
                  >
                    Used
                  </TableCell>

                  <TableCell
                    align="right"
                    sx={headerCellStyle}
                  >
                    Balance
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredBalances.map(
                  (balance) => {
                    const balanceValue =
                      Number(
                        balance.balanceDays || 0
                      );

                    return (
                      <TableRow
                        key={
                          balance.employeeLeaveBalanceId
                        }
                        hover
                        sx={{
                          "&:last-child td": {
                            borderBottom: 0,
                          },
                        }}
                      >
                        {/* AZURE ID */}

                        <TableCell
                          align="left"
                          sx={bodyCellStyle}
                        >
                          {balance.azureEmployeeId ? (
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 600,
                                color: "#2563eb",
                              }}
                            >
                              {
                                balance.azureEmployeeId
                              }
                            </Typography>
                          ) : (
                            <Typography
                              variant="body2"
                              sx={{
                                color: "#94a3b8",
                              }}
                            >
                              —
                            </Typography>
                          )}
                        </TableCell>

                        {/* EMPLOYEE NAME */}

                        <TableCell
                          align="left"
                          sx={bodyCellStyle}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              color: "#334155",
                            }}
                          >
                            {balance.employeeName ||
                              "—"}
                          </Typography>
                        </TableCell>

                        {/* LEAVE TYPE */}

                        <TableCell
                          align="left"
                          sx={bodyCellStyle}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 500,
                              color: "#334155",
                            }}
                          >
                            {getLeaveTypeName(
                              balance.leaveTypeId
                            )}
                          </Typography>
                        </TableCell>

                        {/* YEAR */}

                        <TableCell
                          align="center"
                          sx={bodyCellStyle}
                        >
                          {balance.year}
                        </TableCell>

                        {/* ENTITLED */}

                        <TableCell
                          align="right"
                          sx={bodyCellStyle}
                        >
                          {Number(
                            balance.entitledDays || 0
                          ).toFixed(2)}
                        </TableCell>

                        {/* ACCRUED */}

                        <TableCell
                          align="right"
                          sx={bodyCellStyle}
                        >
                          {Number(
                            balance.accruedDays || 0
                          ).toFixed(2)}
                        </TableCell>

                        {/* USED */}

                        <TableCell
                          align="right"
                          sx={bodyCellStyle}
                        >
                          {Number(
                            balance.usedDays || 0
                          ).toFixed(2)}
                        </TableCell>

                        {/* BALANCE */}

                        <TableCell
                          align="right"
                          sx={bodyCellStyle}
                        >
                          <Chip
                            label={balanceValue.toFixed(
                              2
                            )}
                            size="small"
                            sx={{
                              minWidth: 58,
                              fontWeight: 700,
                              backgroundColor:
                                balanceValue > 0
                                  ? "#e8f7ef"
                                  : "#fef2f2",
                              color:
                                balanceValue > 0
                                  ? "#087443"
                                  : "#b91c1c",
                              border:
                                balanceValue > 0
                                  ? "1px solid #c7eed8"
                                  : "1px solid #fecaca",
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  }
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}
      
<CompOff
    open={compOffOpen}
    onClose={() => {
        setCompOffOpen(false);
        loadLeaveBalance();
    }}
/>

    <Snackbar
      open={notice.open}
      autoHideDuration={4500}
      onClose={() => setNotice((current) => ({ ...current, open: false }))}
    >
      <Alert
        severity={notice.severity}
        variant="filled"
        onClose={() => setNotice((current) => ({ ...current, open: false }))}
      >
        {notice.message}
      </Alert>
    </Snackbar>
    
    </Box>
  );
}

// ==========================================================
// TABLE STYLES
// ==========================================================

const headerCellStyle = {
  backgroundColor: "#f1f5fb",
  color: "#47627e",
  fontWeight: 700,
  fontSize: "11px",
  letterSpacing: "0.035em",
  textTransform: "uppercase",
  whiteSpace: "nowrap",
  py: 1.6,
  px: 2,
  borderBottom: "1px solid #e2e8f0",
};

const bodyCellStyle = {
  py: 1.6,
  px: 2,
  fontSize: "13px",
  color: "#334155",
  borderBottom: "1px solid #edf0f5",
  whiteSpace: "nowrap",
};
