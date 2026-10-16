import { MuiButtonMigration, MuiInputMigration, MuiSelectMigration, MuiTableBodyMigration, MuiTableCellMigration, MuiTableHeadMigration, MuiTableMigration, MuiTableRowMigration } from "../../components/ui/MuiCompat.jsx";
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./DocumentManagement.css";
import { useAuth } from "../../context/AuthContext";

import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import { Box as MuiLayoutBox, Typography as MuiText } from "@mui/material";

const API_URL = `${import.meta.env.VITE_DOCUMENT_API_BASE_URL}/api/Document`;
const EMPLOYEE_API_URL = `${import.meta.env.VITE_EMPLOYEE_API_BASE_URL}/api/Employee`;

function DocumentManagement() {
  const { hasPermission } = useAuth();

  const permissionRoute = "/documents";
  const canView = hasPermission(permissionRoute, "view");
  const canApprove = hasPermission(permissionRoute, "approve");

  const [documents, setDocuments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All Status");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

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
        String(employeeName).toLowerCase().includes(searchValue);

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

      // Document name is accessed so the API data is displayed
      // without requiring Document Type.
      void documentName;

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

  const handleView = (document) => {
    if (!canView) return;

    const id = getDocumentId(document);

    if (!id) {
      console.error("Document ID not found:", document);
      return;
    }

    const documentUrl = `${API_URL}/${id}/file`;

    window.open(documentUrl, "_blank");
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
        <MuiText component="h1" variant="h4">Document Management</MuiText>

        <MuiText component="p" variant="body1">
          Review and manage employee documents submitted for approval
        </MuiText>
      </MuiLayoutBox>

      {/* ================= STAT CARDS ================= */}

      <MuiLayoutBox className="document-stats" component="div">

        <MuiLayoutBox className="document-stat-card" component="div">
          <MuiLayoutBox className="stat-icon blue" component="div">
            <DescriptionRoundedIcon />
          </MuiLayoutBox>

          <MuiLayoutBox component="div">
            <MuiText component="span" variant="inherit">Total Documents</MuiText>
            <MuiText component="strong" variant="inherit">{totalDocuments}</MuiText>
          </MuiLayoutBox>
        </MuiLayoutBox>

        <MuiLayoutBox className="document-stat-card" component="div">
          <MuiLayoutBox className="stat-icon orange" component="div">
            <AccessTimeRoundedIcon />
          </MuiLayoutBox>

          <MuiLayoutBox component="div">
            <MuiText component="span" variant="inherit">Pending Approval</MuiText>
            <MuiText component="strong" variant="inherit">{pendingDocuments}</MuiText>
          </MuiLayoutBox>
        </MuiLayoutBox>

        <MuiLayoutBox className="document-stat-card" component="div">
          <MuiLayoutBox className="stat-icon green" component="div">
            <CheckRoundedIcon />
          </MuiLayoutBox>

          <MuiLayoutBox component="div">
            <MuiText component="span" variant="inherit">Approved</MuiText>
            <MuiText component="strong" variant="inherit">{approvedDocuments}</MuiText>
          </MuiLayoutBox>
        </MuiLayoutBox>

        <MuiLayoutBox className="document-stat-card" component="div">
          <MuiLayoutBox className="stat-icon red" component="div">
            <CloseRoundedIcon />
          </MuiLayoutBox>

          <MuiLayoutBox component="div">
            <MuiText component="span" variant="inherit">Rejected</MuiText>
            <MuiText component="strong" variant="inherit">{rejectedDocuments}</MuiText>
          </MuiLayoutBox>
        </MuiLayoutBox>

      </MuiLayoutBox>

      {/* ================= FILTER ================= */}

      <MuiLayoutBox className="document-filter" component="div">

        <MuiLayoutBox className="filter-field employee-search" component="div">
          <MuiLayoutBox component="label">Employee ID / Name</MuiLayoutBox>

          <MuiLayoutBox className="search-input" component="div">
            <MuiInputMigration
              type="text"
              placeholder="Search by ID or Name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <SearchRoundedIcon />
          </MuiLayoutBox>
        </MuiLayoutBox>

        <MuiLayoutBox className="filter-field" component="div">
          <MuiLayoutBox component="label">Status</MuiLayoutBox>

          <MuiSelectMigration
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option>All Status</option>
            <option>Submitted</option>
            <option>Approved</option>
            <option>Rejected</option>
          </MuiSelectMigration>
        </MuiLayoutBox>

        <MuiLayoutBox className="filter-field" component="div">
          <MuiLayoutBox component="label">From Date</MuiLayoutBox>

          <MuiInputMigration
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </MuiLayoutBox>

        <MuiLayoutBox className="filter-field" component="div">
          <MuiLayoutBox component="label">To Date</MuiLayoutBox>

          <MuiInputMigration
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </MuiLayoutBox>

        <MuiLayoutBox className="filter-buttons" component="div">

          <MuiButtonMigration
            className="search-button"
            onClick={() => { }}
          >
            <SearchRoundedIcon />
            Search
          </MuiButtonMigration>

          <MuiButtonMigration
            className="reset-button"
            onClick={handleReset}
          >
            <RestartAltRoundedIcon />
            Reset
          </MuiButtonMigration>

        </MuiLayoutBox>

      </MuiLayoutBox>

      {/* ================= TABLE ================= */}

      <MuiLayoutBox className="document-table-container" component="div">

        <MuiTableMigration className="document-table">

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

    </MuiLayoutBox>
  );
}

export default DocumentManagement;