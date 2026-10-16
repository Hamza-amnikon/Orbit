import { MuiButtonMigration, MuiTableBodyMigration, MuiTableCellMigration, MuiTableHeadMigration, MuiTableMigration, MuiTableRowMigration } from "../../components/ui/MuiCompat.jsx";
import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import "./DocumentManagement.css";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  TextField,
} from "@mui/material";

import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import { Box as MuiLayoutBox, Typography as MuiText } from "@mui/material";
import { loadXlsx } from "../../utils/exportLibraries";

const API_URL = `${import.meta.env.VITE_DOCUMENT_API_BASE_URL}/api/Document`;
const EMPLOYEE_API_URL = `${import.meta.env.VITE_EMPLOYEE_API_BASE_URL}/api/Employee`;

function DocumentManagement() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const permissionRoute = "/documents";
  const canView = hasPermission(permissionRoute, "view");
  const canApprove = hasPermission(permissionRoute, "approve");
  const canExport = hasPermission(permissionRoute, "export");

  const [documents, setDocuments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All Status");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [exporting, setExporting] = useState(false);
  const [notice, setNotice] = useState({ open: false, message: "", severity: "success" });
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewName, setPreviewName] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const previewRequestId = useRef(0);

  // ================= LOAD DOCUMENTS =================

  const loadDocuments = async () => {
    if (!canView) {
      setDocuments([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const response = await axios.get(API_URL);

      setDocuments(response.data || []);
    } catch (error) {
      console.error("Failed to load documents:", error);
    } finally {
      setLoading(false);
    }
  };

  //====================add employee load==================


  const loadEmployees = async () => {
    if (!canView) {
      setEmployees([]);
      return;
    }

    try {
      const response = await axios.get(EMPLOYEE_API_URL);

      setEmployees(response.data || []);
    } catch (error) {
      console.error("Failed to load employees:", error);
    }
  };


  useEffect(() => {
    if (!canView) return;

    loadDocuments();
    loadEmployees();

  }, [canView]);


  // ================= FILTER =================

  const filteredDocuments = useMemo(() => {
    return documents.filter((document) => {
      const employeeId =
        document.employeeId ||
        document.EmployeeId ||
        document.employeeCode ||
        document.EmployeeCode ||
        "";

      const employeeName =
        document.employeeName ||
        document.EmployeeName ||
        "";

      const documentName =
        document.documentName ||
        document.DocumentName ||
        document.fileName ||
        document.FileName ||
        "";

      const documentStatus =
        document.status ||
        document.Status ||
        "Pending";

      const submittedOn =
      document.submittedDate ||
    document.SubmittedDate ||
        document.submittedOn ||
        document.SubmittedOn ||
        document.createdDate ||
        document.CreatedDate ||
        "";

      // Search Employee ID / Name
      const searchValue = search.toLowerCase().trim();

      const matchesSearch =
        !searchValue ||
        String(employeeId).toLowerCase().includes(searchValue) ||
        String(employeeName).toLowerCase().includes(searchValue) ||
        String(documentName).toLowerCase().includes(searchValue);

      // Status
      const matchesStatus =
        status === "All Status" ||
        String(documentStatus).toLowerCase() === status.toLowerCase();

      // From Date
      const matchesFromDate =
        !fromDate ||
        new Date(submittedOn) >= new Date(fromDate);

      // To Date
      const matchesToDate =
        !toDate ||
        new Date(submittedOn) <=
        new Date(`${toDate}T23:59:59`);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesFromDate &&
        matchesToDate
      );
    });
  }, [documents, search, status, fromDate, toDate]);

  // ================= COUNTS =================

  const totalDocuments = documents.length;

  const pendingDocuments = documents.filter(
    (document) =>
      String(
        document.status || document.Status || ""
      ).toLowerCase() === "submitted"
  ).length;

  const approvedDocuments = documents.filter(
    (document) =>
      String(
        document.status || document.Status || ""
      ).toLowerCase() === "approved"
  ).length;

  const rejectedDocuments = documents.filter(
    (document) =>
      String(
        document.status || document.Status || ""
      ).toLowerCase() === "rejected"
  ).length;

  // ================= RESET =================

  const handleReset = () => {
    setSearch("");
    setStatus("All Status");
    setFromDate("");
    setToDate("");
  };

  const handleExport = async () => {
    if (!canExport || exporting) return;

    setExporting(true);
    try {
      const XLSX = await loadXlsx();
      const rows = filteredDocuments.map((document, index) => ({
        "Sr. No.": index + 1,
        "Employee ID": getEmployeeId(document),
        "Employee Name": getEmployeeName(document),
        "Document Name": getDocumentName(document),
        "Submitted On": formatDate(getSubmittedDate(document)),
        "Rejection Description": getStatus(document).toLowerCase() === "rejected"
          ? document.rejectionReason || document.RejectionReason || "-"
          : "-",
        Status: getStatus(document),
      }));
      const worksheet = XLSX.utils.json_to_sheet(rows, {
        header: ["Sr. No.", "Employee ID", "Employee Name", "Document Name", "Submitted On", "Rejection Description", "Status"],
      });
      worksheet["!cols"] = [
        { wch: 10 }, { wch: 16 }, { wch: 24 }, { wch: 32 }, { wch: 18 }, { wch: 36 }, { wch: 16 },
      ];
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Documents");
      XLSX.writeFile(workbook, "Employee_Documents.xlsx");
      setNotice({
        open: true,
        message: `Exported ${rows.length} document record${rows.length === 1 ? "" : "s"}.`,
        severity: "success",
      });
    } catch (error) {
      console.error("Failed to export documents:", error);
      setNotice({ open: true, message: "Unable to export documents. Please try again.", severity: "error" });
    } finally {
      setExporting(false);
    }
  };

  // ================= STATUS CLASS =================

  const getStatusClass = (value) => {
    const currentStatus = String(value || "").toLowerCase();

    if (currentStatus === "approved") {
      return "document-status approved";
    }

    if (currentStatus === "rejected") {
      return "document-status rejected";
    }

    return "document-status pending";
  };

  // ================= DOCUMENT ID =================

  const getDocumentId = (document) => {
    return (
      document.documentId ||
      document.DocumentId ||
      document.id ||
      document.Id
    );
  };

  // ================= DISPLAY HELPERS =================

  const getEmployeeId = (document) =>
    document.employeeId ||
    document.EmployeeId ||
    document.employeeCode ||
    document.EmployeeCode ||
    "-";

  const getEmployeeName = (document) => {
    const employeeId =
      document.employeeId ||
      document.EmployeeId ||
      document.employeeCode ||
      document.EmployeeCode;

    const employee = employees.find(
      (emp) =>
        String(emp.employeeId) === String(employeeId) ||
        String(emp.EmployeeId) === String(employeeId) ||
        String(emp.employeeCode) === String(employeeId) ||
        String(emp.EmployeeCode) === String(employeeId)
    );

    return (
      document.employeeName ||
      document.EmployeeName ||
      employee?.employeeName ||
      employee?.EmployeeName ||
      "-"
    );
  };

  const getDocumentName = (document) => {
    if (
      document.documentName ||
      document.DocumentName
    ) {
      return document.documentName || document.DocumentName;
    }

    if (document.documentPath) {
      return document.documentPath.split("/").pop();
    }

    if (document.DocumentPath) {
      return document.DocumentPath.split("/").pop();
    }

    return "-";
  };

  const getSubmittedDate = (document) =>
    document.submittedDate ||
    document.SubmittedDate ||
    document.submittedOn ||
    document.SubmittedOn ||
    document.createdDate ||
    document.CreatedDate ||
    "";

  const getStatus = (document) =>
    document.status ||
    document.Status ||
    "Pending";

  const formatDate = (value) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ================= ACTIONS =================

  const handleApprove = async (document) => {
    if (!canApprove) return;

    const id = getDocumentId(document);

    if (!id) {
      console.error("Document ID not found:", document);
      return;
    }

    try {
      await axios.put(`${API_URL}/${id}/approve`);

      await loadDocuments();
    } catch (error) {
      console.error("Failed to approve document:", error);
    }
  };

  const handleReject = async (document) => {
    if (!canApprove) return;

    const id = getDocumentId(document);

    if (!id) {
      console.error("Document ID not found:", document);
      return;
    }

    const reason = window.prompt("Enter rejection reason:");

    if (!reason || !reason.trim()) {
      return;
    }

    try {
      await axios.put(
        `${API_URL}/${id}/reject`,
        JSON.stringify(reason.trim()),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      await loadDocuments();
    } catch (error) {
      console.error("Failed to reject document:", error);
    }
  };

  const closePreview = () => {
    previewRequestId.current += 1;
    setPreviewOpen(false);
    setPreviewLoading(false);
    setPreviewError("");
    setPreviewUrl((currentUrl) => {
      if (currentUrl) URL.revokeObjectURL(currentUrl);
      return "";
    });
  };

  const handleView = async (document) => {
    if (!canView) return;

    const id = getDocumentId(document);

    if (!id) {
      console.error("Document ID not found:", document);
      return;
    }

    setPreviewName(getDocumentName(document));
    setPreviewError("");
    setPreviewLoading(true);
    setPreviewOpen(true);
    const requestId = ++previewRequestId.current;

    try {
      const response = await axios.get(`${API_URL}/${id}/file`, { responseType: "blob" });
      const contentType = response.headers?.["content-type"] || response.data?.type || "application/pdf";
      if (requestId !== previewRequestId.current) return;
      const previewType = contentType.toLowerCase().includes("pdf") ? contentType : "application/pdf";
      const fileBlob = response.data instanceof Blob
        ? new Blob([response.data], { type: previewType })
        : new Blob([response.data], { type: previewType });
      const nextUrl = URL.createObjectURL(fileBlob);
      setPreviewUrl((currentUrl) => {
        if (currentUrl) URL.revokeObjectURL(currentUrl);
        return nextUrl;
      });
    } catch (error) {
      console.error("Failed to preview document:", error);
      if (requestId === previewRequestId.current) {
        setPreviewError("This document could not be opened. Please try again.");
      }
    } finally {
      if (requestId === previewRequestId.current) setPreviewLoading(false);
    }
  };

  if (!canView) {
    return (
      <MuiLayoutBox style={{ padding: "60px", textAlign: "center" }} component="div">
        <MuiText component="h2" variant="h5">Access Denied</MuiText>
        <MuiText component="p" variant="body1">You do not have permission to access this page.</MuiText>
      </MuiLayoutBox>
    );
  }

  return (
    <MuiLayoutBox className="document-management" component="div">

      {/* ================= HEADER ================= */}

      <MuiLayoutBox className="document-header" component="div">
        <MuiLayoutBox className="document-title-group" component="div">
          <IconButton
            className="document-back-button"
            aria-label="Back to dashboard"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowBackRoundedIcon />
          </IconButton>
          <MuiLayoutBox component="div">
            <MuiText component="h1" variant="h4">Document Management</MuiText>
            <MuiText component="p" variant="body1">
              Review and manage employee documents submitted for approval.
            </MuiText>
          </MuiLayoutBox>
        </MuiLayoutBox>
        <MuiLayoutBox className="document-header-actions" component="div">
          {canExport && (
            <Button
              className="document-export-button"
              variant="contained"
              startIcon={exporting ? <CircularProgress size={16} color="inherit" /> : <FileDownloadOutlinedIcon />}
              onClick={handleExport}
              disabled={exporting}
            >
              {exporting ? "Exporting..." : "Export Excel"}
            </Button>
          )}
          <Button
            className="document-refresh-button"
            variant="outlined"
            startIcon={loading ? <CircularProgress size={16} /> : <RefreshRoundedIcon />}
            onClick={loadDocuments}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
        </MuiLayoutBox>
      </MuiLayoutBox>

      {/* ================= STAT CARDS ================= */}

      <MuiLayoutBox className="document-stats" component="div">

        <Card className="document-stat-card">
          <CardContent className="document-stat-content">
          <MuiLayoutBox className="stat-icon blue" component="div">
            <DescriptionRoundedIcon />
          </MuiLayoutBox>

          <MuiLayoutBox component="div">
            <MuiText component="span" variant="inherit">Total Documents</MuiText>
            <MuiText component="strong" variant="inherit">{totalDocuments}</MuiText>
          </MuiLayoutBox>
          </CardContent>
        </Card>

        <Card className="document-stat-card">
          <CardContent className="document-stat-content">
          <MuiLayoutBox className="stat-icon orange" component="div">
            <AccessTimeRoundedIcon />
          </MuiLayoutBox>

          <MuiLayoutBox component="div">
            <MuiText component="span" variant="inherit">Pending Approval</MuiText>
            <MuiText component="strong" variant="inherit">{pendingDocuments}</MuiText>
          </MuiLayoutBox>
          </CardContent>
        </Card>

        <Card className="document-stat-card">
          <CardContent className="document-stat-content">
          <MuiLayoutBox className="stat-icon green" component="div">
            <CheckRoundedIcon />
          </MuiLayoutBox>

          <MuiLayoutBox component="div">
            <MuiText component="span" variant="inherit">Approved</MuiText>
            <MuiText component="strong" variant="inherit">{approvedDocuments}</MuiText>
          </MuiLayoutBox>
          </CardContent>
        </Card>

        <Card className="document-stat-card">
          <CardContent className="document-stat-content">
          <MuiLayoutBox className="stat-icon red" component="div">
            <CloseRoundedIcon />
          </MuiLayoutBox>

          <MuiLayoutBox component="div">
            <MuiText component="span" variant="inherit">Rejected</MuiText>
            <MuiText component="strong" variant="inherit">{rejectedDocuments}</MuiText>
          </MuiLayoutBox>
          </CardContent>
        </Card>

      </MuiLayoutBox>

      {/* ================= FILTER ================= */}

      <MuiLayoutBox className="document-filter" component="div">

        <TextField
          className="document-search-field"
          label="Search employee or document"
          placeholder="Enter employee name, ID, or document name"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          size="small"
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon />
              </InputAdornment>
            ),
          }}
        />
        <FormControl className="document-filter-field" size="small" fullWidth>
          <InputLabel id="document-status-label">Status</InputLabel>
          <Select
            labelId="document-status-label"
            value={status}
            label="Status"
            onChange={(event) => setStatus(event.target.value)}
          >
            <MenuItem value="All Status">All statuses</MenuItem>
            <MenuItem value="Submitted">Submitted</MenuItem>
            <MenuItem value="Approved">Approved</MenuItem>
            <MenuItem value="Rejected">Rejected</MenuItem>
          </Select>
        </FormControl>
        <MuiLayoutBox className="document-date-field" component="div">
          <MuiText component="label" variant="inherit" htmlFor="document-from-date">From date</MuiText>
          <TextField
            id="document-from-date"
            className="document-filter-field"
            type="date"
            size="small"
            value={fromDate}
            onChange={(event) => setFromDate(event.target.value)}
            inputProps={{ "aria-label": "From date" }}
          />
        </MuiLayoutBox>
        <MuiLayoutBox className="document-date-field" component="div">
          <MuiText component="label" variant="inherit" htmlFor="document-to-date">To date</MuiText>
          <TextField
            id="document-to-date"
            className="document-filter-field"
            type="date"
            size="small"
            value={toDate}
            onChange={(event) => setToDate(event.target.value)}
            inputProps={{ "aria-label": "To date" }}
          />
        </MuiLayoutBox>
        <Button
          className="document-reset-button"
          variant="outlined"
          startIcon={<RestartAltRoundedIcon />}
          onClick={handleReset}
        >
          Reset filters
        </Button>

      </MuiLayoutBox>

      {/* ================= TABLE ================= */}

      <MuiLayoutBox className="document-table-container" component="div">

        <MuiTableMigration className="document-table" aria-label="Employee documents">

          <MuiTableHeadMigration>
            <MuiTableRowMigration>
              <MuiTableCellMigration>Sr. No.</MuiTableCellMigration>
              <MuiTableCellMigration>Employee ID</MuiTableCellMigration>
              <MuiTableCellMigration>Employee Name</MuiTableCellMigration>
              <MuiTableCellMigration>Document Name</MuiTableCellMigration>
              <MuiTableCellMigration>Submitted On</MuiTableCellMigration>
              <MuiTableCellMigration>Rejection Description</MuiTableCellMigration>
              <MuiTableCellMigration>Status</MuiTableCellMigration>
              <MuiTableCellMigration>Actions</MuiTableCellMigration>
            </MuiTableRowMigration>
          </MuiTableHeadMigration>

          <MuiTableBodyMigration>

            {loading ? (
              <MuiTableRowMigration>
                <MuiTableCellMigration colSpan="8" className="table-message">
                  Loading documents...
                </MuiTableCellMigration>
              </MuiTableRowMigration>
            ) : filteredDocuments.length === 0 ? (
              <MuiTableRowMigration>
                <MuiTableCellMigration colSpan="8" className="table-message">
                  No documents found
                </MuiTableCellMigration>
              </MuiTableRowMigration>
            ) : (
              filteredDocuments.map((document, index) => (

                <MuiTableRowMigration key={getDocumentId(document) || index}>

                  <MuiTableCellMigration>{index + 1}</MuiTableCellMigration>

                  <MuiTableCellMigration>
                    {getEmployeeId(document)}
                  </MuiTableCellMigration>

                  <MuiTableCellMigration>
                    {getEmployeeName(document)}
                  </MuiTableCellMigration>

                  <MuiTableCellMigration>
                    <MuiLayoutBox className="document-name" component="div">

                      <DescriptionRoundedIcon />

                      <MuiText component="span" variant="inherit">
                        {getDocumentName(document)}
                      </MuiText>

                    </MuiLayoutBox>
                  </MuiTableCellMigration>

                  <MuiTableCellMigration>
                    {formatDate(getSubmittedDate(document))}
                  </MuiTableCellMigration>

                  <MuiTableCellMigration>
  {getStatus(document).toLowerCase() === "rejected"
    ? (document.rejectionReason || document.RejectionReason || "-")
    : "-"}
</MuiTableCellMigration>

                  <MuiTableCellMigration>
                    <MuiText className={getStatusClass(getStatus(document))} component="span" variant="inherit">
                      {getStatus(document)}
                    </MuiText>
                  </MuiTableCellMigration>

                  <MuiTableCellMigration>
                    <MuiLayoutBox className="document-actions" component="div">
                      {canApprove &&
                        String(
                          document.status || document.Status || ""
                        ).toLowerCase() === "submitted" && (
                          <>
                            <MuiButtonMigration
                              type="button"
                              className="approve-btn"
                              onClick={() => handleApprove(document)}
                              title="Approve"
                            >
                              <CheckCircleOutlineRoundedIcon />
                            </MuiButtonMigration>

                            <MuiButtonMigration
                              type="button"
                              className="reject-btn"
                              onClick={() => handleReject(document)}
                              title="Reject"
                            >
                              <CancelRoundedIcon />
                            </MuiButtonMigration>
                          </>
                        )}

                      <MuiButtonMigration
                        type="button"
                        className="view-btn"
                        onClick={() => handleView(document)}
                        title="View"
                      >
                        <VisibilityRoundedIcon />
                      </MuiButtonMigration>
                    </MuiLayoutBox>
                  </MuiTableCellMigration>

                </MuiTableRowMigration>

              ))
            )}

          </MuiTableBodyMigration>

        </MuiTableMigration>

        {/* ================= FOOTER ================= */}

        <MuiLayoutBox className="document-table-footer" component="div">

          <MuiText component="span" variant="inherit">
            Showing {filteredDocuments.length} of {totalDocuments} entries
          </MuiText>

        </MuiLayoutBox>

      </MuiLayoutBox>

      <Snackbar
        open={notice.open}
        autoHideDuration={5000}
        onClose={() => setNotice((current) => ({ ...current, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setNotice((current) => ({ ...current, open: false }))}
          severity={notice.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {notice.message}
        </Alert>
      </Snackbar>

      <Dialog
        open={previewOpen}
        onClose={closePreview}
        fullWidth
        maxWidth="lg"
        aria-labelledby="document-preview-title"
        className="document-preview-dialog"
      >
        <DialogTitle id="document-preview-title" className="document-preview-title">
          <MuiLayoutBox component="span" className="document-preview-heading">
            <DescriptionRoundedIcon />
            <MuiText component="span" variant="inherit">{previewName || "Document preview"}</MuiText>
          </MuiLayoutBox>
          <IconButton aria-label="Close document preview" onClick={closePreview} size="small">
            <CloseRoundedIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent className="document-preview-content">
          {previewLoading ? (
            <MuiLayoutBox className="document-preview-state" component="div">
              <CircularProgress />
              <MuiText component="p" variant="body2">Loading document preview...</MuiText>
            </MuiLayoutBox>
          ) : previewError ? (
            <MuiLayoutBox className="document-preview-state" component="div">
              <Alert severity="error">{previewError}</Alert>
            </MuiLayoutBox>
          ) : previewUrl ? (
            <iframe
              className="document-preview-frame"
              src={previewUrl}
              title={`Preview of ${previewName}`}
            />
          ) : null}
        </DialogContent>
        <DialogActions className="document-preview-actions">
          <Button onClick={closePreview} variant="outlined">Close</Button>
        </DialogActions>
      </Dialog>

    </MuiLayoutBox>
  );
}

export default DocumentManagement;
