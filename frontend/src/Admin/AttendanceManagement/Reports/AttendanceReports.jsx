import "./AttendanceReports.css";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert, Box, Button, Card, CardContent, Chip, IconButton, InputAdornment,
  MenuItem, Paper, Snackbar, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, TextField, Typography,
} from "@mui/material";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import FileDownloadOutlined from "@mui/icons-material/FileDownloadOutlined";
import RefreshRounded from "@mui/icons-material/RefreshRounded";
import SearchRounded from "@mui/icons-material/SearchRounded";
import CloseRounded from "@mui/icons-material/CloseRounded";
import AttendanceService from "../services/AttendanceService";
import { useAuth } from "../../../context/AuthContext";
import { exportRowsToExcel } from "../../../utils/exportExcel";

export default function AttendanceReports() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const permissionRoute = "/attendance/reports";
  const canView = hasPermission(permissionRoute, "view");
  const canExport = hasPermission(permissionRoute, "export");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [notice, setNotice] = useState({ open: false, message: "", severity: "success" });

  const loadRows = async () => {
    try {
      setLoading(true);
      const data = await AttendanceService.getAll();
      setRows(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Attendance report load error", error);
      setNotice({ open: true, severity: "error", message: "Could not load attendance reports." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (canView) loadRows(); }, [canView]);

  const statuses = [...new Set(rows.map((row) => row.status).filter(Boolean))];
  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return rows.filter((row) => {
      const date = String(row.attendanceDate || "").split("T")[0];
      const searchable = [row.employeeName, row.employeeCode, row.azureEmployeeId, row.department, row.designation, row.shift].some((value) => String(value || "").toLowerCase().includes(query));
      return (!query || searchable) && (!status || row.status === status) && (!fromDate || date >= fromDate) && (!toDate || date <= toDate);
    });
  }, [rows, search, status, fromDate, toDate]);
  const visibleRows = useMemo(
    () => filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filteredRows, page, rowsPerPage],
  );
  useEffect(() => { setPage(0); }, [search, status, fromDate, toDate]);
  const countByStatus = (value) => rows.filter((row) => row.status === value).length;

  const handleExport = async () => {
    try {
      await exportRowsToExcel(filteredRows, [
        ["Employee ID", (row) => row.azureEmployeeId || row.employeeCode || ""], ["Employee", "employeeName"],
        ["Department", "department"], ["Designation", "designation"],
        ["Date", (row) => row.attendanceDate ? new Date(row.attendanceDate).toLocaleDateString("en-GB") : ""],
        ["Shift", "shift"], ["Check In", "checkIn"], ["Check Out", "checkOut"], ["Total Hours", "totalHours"], ["Status", "status"],
      ], "Attendance-Report.xlsx", "Attendance Report");
      setNotice({ open: true, severity: "success", message: `Exported ${filteredRows.length} attendance records.` });
    } catch (error) {
      console.error("Attendance report export error", error);
      setNotice({ open: true, severity: "error", message: "Could not export attendance reports." });
    }
  };

  if (!canView) return null;

  return (
    <Box className="attendance-reports-page">
      <Box className="attendance-reports-header">
        <Box className="attendance-reports-title">
          <IconButton aria-label="Back to Attendance" onClick={() => navigate("/attendance")} className="attendance-back-button"><ArrowBackRounded /></IconButton>
          <Box>
            <Typography variant="h4">Attendance Reports</Typography>
            <Typography variant="body2">Search, review and export employee attendance records.</Typography>
          </Box>
        </Box>
        <Box className="attendance-reports-actions">
          <Button variant="outlined" startIcon={<RefreshRounded />} onClick={loadRows}>Refresh</Button>
          {canExport && <Button variant="contained" startIcon={<FileDownloadOutlined />} onClick={handleExport}>Export Excel</Button>}
        </Box>
      </Box>

      <Box className="attendance-reports-summary">
        {[
          { label: "All Records", count: rows.length, value: "" },
          { label: "Present", count: countByStatus("Present"), value: "Present" },
          { label: "Absent", count: countByStatus("Absent"), value: "Absent" },
          { label: "Late", count: countByStatus("Late"), value: "Late" },
          { label: "On Leave", count: countByStatus("Leave") + countByStatus("On Leave"), value: "Leave" },
        ].map((item) => <Card component="button" type="button" aria-pressed={status === item.value} key={item.label} className={status === item.value ? "selected" : ""} onClick={() => setStatus((current) => current === item.value ? "" : item.value)}><CardContent><Typography variant="body2">{item.label}</Typography><Typography variant="h5">{item.count}</Typography></CardContent></Card>)}
      </Box>

      <Paper className="attendance-reports-filters" elevation={0}>
        <TextField fullWidth placeholder="Search name, employee ID, department or shift..." value={search} onChange={(event) => setSearch(event.target.value)} slotProps={{ input: {
          startAdornment: <InputAdornment position="start"><SearchRounded /></InputAdornment>,
          endAdornment: search ? <InputAdornment position="end"><IconButton aria-label="Clear search" size="small" onClick={() => setSearch("")}><CloseRounded fontSize="small" /></IconButton></InputAdornment> : null,
        } }} />
        <TextField select label="Status" value={status} onChange={(event) => setStatus(event.target.value)}><MenuItem value="">All Status</MenuItem>{statuses.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField>
        <TextField type="date" label="From" value={fromDate} onChange={(event) => setFromDate(event.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
        <TextField type="date" label="To" value={toDate} onChange={(event) => setToDate(event.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
        <Button variant="text" onClick={() => { setSearch(""); setStatus(""); setFromDate(""); setToDate(""); setPage(0); }}>Clear filters</Button>
      </Paper>

      <Paper className="attendance-reports-table-card" elevation={0}>
        <Box className="attendance-reports-table-heading">
          <Box><Typography variant="h6">Attendance records</Typography><Typography variant="body2">Showing {filteredRows.length} of {rows.length} records</Typography></Box>
        </Box>
        <TableContainer>
          <Table size="medium">
            <TableHead><TableRow>{["Employee ID", "Employee", "Department", "Date", "Shift", "Check In", "Check Out", "Total Hours", "Status"].map((label) => <TableCell key={label}>{label}</TableCell>)}</TableRow></TableHead>
            <TableBody>
              {loading ? <TableRow><TableCell colSpan={9} align="center">Loading attendance records…</TableCell></TableRow>
                : filteredRows.length ? visibleRows.map((row) => <TableRow key={row.attendanceId}>
                  <TableCell>{row.azureEmployeeId || row.employeeCode || "—"}</TableCell><TableCell>{row.employeeName || "—"}</TableCell><TableCell>{row.department || "—"}</TableCell>
                  <TableCell>{row.attendanceDate ? new Date(row.attendanceDate).toLocaleDateString("en-GB") : "—"}</TableCell><TableCell>{row.shift || "—"}</TableCell>
                  <TableCell>{row.checkIn || "—"}</TableCell><TableCell>{row.checkOut || "—"}</TableCell><TableCell>{row.totalHours || "—"}</TableCell>
                  <TableCell><Chip size="small" label={row.status || "Unknown"} color={row.status === "Present" ? "success" : row.status === "Absent" ? "error" : row.status === "Late" ? "warning" : row.status === "Leave" || row.status === "On Leave" ? "secondary" : "default"} /></TableCell>
                </TableRow>) : <TableRow><TableCell colSpan={9} align="center">No attendance records match these filters.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filteredRows.length}
          page={page}
          onPageChange={(_, nextPage) => setPage(nextPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => { setRowsPerPage(Number(event.target.value)); setPage(0); }}
          rowsPerPageOptions={[10, 25, 50, 100]}
          labelRowsPerPage="Rows per page:"
        />
      </Paper>

      <Snackbar open={notice.open} autoHideDuration={4500} onClose={() => setNotice((current) => ({ ...current, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert severity={notice.severity} variant="filled" onClose={() => setNotice((current) => ({ ...current, open: false }))}>{notice.message}</Alert>
      </Snackbar>
    </Box>
  );
}
