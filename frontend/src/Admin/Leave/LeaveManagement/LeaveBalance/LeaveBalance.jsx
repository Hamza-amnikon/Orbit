import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import CompOff from "../../CompOff/CompOff";

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
} from "@mui/material";

import {
  Search,
  Refresh,
  ArrowBack,
  Clear,
  People,
  EventAvailable,
  TrendingUp,
  EventBusy,
  AccountBalance,
} from "@mui/icons-material";

const BALANCE_API =
  "https://localhost:7206/api/EmployeeLeaveBalance";

const LEAVE_TYPE_API =
  "https://localhost:7206/api/LeaveType";

export default function LeaveBalance() {

  const navigate = useNavigate();

  const [balances, setBalances] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
          backgroundColor: background,
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
                backgroundColor: "#ffffff",
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

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f5f7fb",
        p: {
          xs: 2,
          sm: 3,
          md: 4,
        },
      }}
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: {
            xs: "flex-start",
            md: "center",
          },
          flexDirection: {
            xs: "column",
            md: "row",
          },
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: "#172033",
              mb: 0.5,
            }}
          >
            Leave Balance Management
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: "#697386",
            }}
          >
            View employee leave entitlements,
            accruals, usage and remaining balances.
          </Typography>
        </Box>

        <Stack
          direction="row"
          spacing={1}
        >
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() =>
              window.history.back()
            }
            sx={{
              height: 40,
              borderColor: "#2563eb",
              color: "#2563eb",
              textTransform: "none",
              fontWeight: 600,
              "&:hover": {
                borderColor: "#1d4ed8",
                backgroundColor: "#eff6ff",
              },
            }}
          >
            Previous
          </Button>

          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadLeaveBalance}
            disabled={loading}
            sx={{
              height: 40,
              borderColor: "#2563eb",
              color: "#2563eb",
              textTransform: "none",
              fontWeight: 600,
              "&:hover": {
                borderColor: "#1d4ed8",
                backgroundColor: "#eff6ff",
              },
            }}
          >
            Refresh
          </Button>
          
          <Button
    variant="contained"
    onClick={() => setCompOffOpen(true)}
>
    + Add Comp-Off
</Button>
        </Stack>
      </Box>

      {/* ======================================================
          SUMMARY
      ====================================================== */}

<Stack
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
              fullWidth
              label="Search Employee"
              placeholder="Employee ID, Azure ID or Name"
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
              variant="outlined"
              startIcon={<Clear />}
              onClick={clearFilters}
              sx={{
                height: 40,
                minWidth: 120,
                textTransform: "none",
                borderColor: "#cbd5e1",
                color: "#475569",
                borderRadius: 1.5,
                fontWeight: 600,
                "&:hover": {
                  borderColor: "#94a3b8",
                  backgroundColor: "#f8fafc",
                },
              }}
            >
              Clear
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <Card
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
          elevation={0}
          sx={{
            border: "1px solid #e2e8f0",
            borderRadius: 2.5,
            overflow: "hidden",
          }}
        >
          {/* TABLE HEADER */}

          <Box
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
          </Box>

          <Divider />

          <TableContainer
            sx={{
              maxHeight: 600,
            }}
          >
            <Table
              stickyHeader
              sx={{
                minWidth: 1100,
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={headerCellStyle}
                  >
                    Employee ID
                  </TableCell>

                  <TableCell
                    sx={headerCellStyle}
                  >
                    Azure Employee ID
                  </TableCell>

                  <TableCell
                    sx={headerCellStyle}
                  >
                    Employee Name
                  </TableCell>

                  <TableCell
                    sx={headerCellStyle}
                  >
                    Leave Type
                  </TableCell>

                  <TableCell
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
                        {/* EMPLOYEE ID */}

                        <TableCell
                          sx={bodyCellStyle}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              color: "#334155",
                            }}
                          >
                            {balance.employeeId}
                          </Typography>
                        </TableCell>

                        {/* AZURE ID */}

                        <TableCell
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
    
    </Box>
  );
}

// ==========================================================
// TABLE STYLES
// ==========================================================

const headerCellStyle = {
  backgroundColor: "#243f7d",
  color: "#ffffff",
  fontWeight: 700,
  fontSize: "12px",
  whiteSpace: "nowrap",
  py: 1.6,
  px: 2,
  borderBottom: "none",
};

const bodyCellStyle = {
  py: 1.6,
  px: 2,
  fontSize: "13px",
  color: "#334155",
  borderBottom: "1px solid #edf0f5",
  whiteSpace: "nowrap",
};