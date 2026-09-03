import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./DocumentManagement.css";

import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";

const API_URL = "https://localhost:7256/api/Document";
const EMPLOYEE_API_URL = "https://localhost:7002/api/Employee";

function DocumentManagement() {
  const [documents, setDocuments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All Status");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // ================= LOAD DOCUMENTS =================

  const loadDocuments = async () => {
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
    try {
      const response = await axios.get(EMPLOYEE_API_URL);

      setEmployees(response.data || []);
    } catch (error) {
      console.error("Failed to load employees:", error);
    }
  };


  useEffect(() => {
    loadDocuments();
    loadEmployees();

  }, []);


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
    const id = getDocumentId(document);

    if (!id) {
      console.error("Document ID not found:", document);
      return;
    }

    const documentUrl = `${API_URL}/${id}/file`;

    window.open(documentUrl, "_blank");
  };

  return (
    <div className="document-management">

      {/* ================= HEADER ================= */}

      <div className="document-header">
        <h1>Document Management</h1>

        <p>
          Review and manage employee documents submitted for approval
        </p>
      </div>

      {/* ================= STAT CARDS ================= */}

      <div className="document-stats">

        <div className="document-stat-card">
          <div className="stat-icon blue">
            <DescriptionRoundedIcon />
          </div>

          <div>
            <span>Total Documents</span>
            <strong>{totalDocuments}</strong>
          </div>
        </div>

        <div className="document-stat-card">
          <div className="stat-icon orange">
            <AccessTimeRoundedIcon />
          </div>

          <div>
            <span>Pending Approval</span>
            <strong>{pendingDocuments}</strong>
          </div>
        </div>

        <div className="document-stat-card">
          <div className="stat-icon green">
            <CheckRoundedIcon />
          </div>

          <div>
            <span>Approved</span>
            <strong>{approvedDocuments}</strong>
          </div>
        </div>

        <div className="document-stat-card">
          <div className="stat-icon red">
            <CloseRoundedIcon />
          </div>

          <div>
            <span>Rejected</span>
            <strong>{rejectedDocuments}</strong>
          </div>
        </div>

      </div>

      {/* ================= FILTER ================= */}

      <div className="document-filter">

        <div className="filter-field employee-search">
          <label>Employee ID / Name</label>

          <div className="search-input">
            <input
              type="text"
              placeholder="Search by ID or Name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <SearchRoundedIcon />
          </div>
        </div>

        <div className="filter-field">
          <label>Status</label>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option>All Status</option>
            <option>Submitted</option>
            <option>Approved</option>
            <option>Rejected</option>
          </select>
        </div>

        <div className="filter-field">
          <label>From Date</label>

          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>

        <div className="filter-field">
          <label>To Date</label>

          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>

        <div className="filter-buttons">

          <button
            className="search-button"
            onClick={() => { }}
          >
            <SearchRoundedIcon />
            Search
          </button>

          <button
            className="reset-button"
            onClick={handleReset}
          >
            <RestartAltRoundedIcon />
            Reset
          </button>

        </div>

      </div>

      {/* ================= TABLE ================= */}

      <div className="document-table-container">

        <table className="document-table">

          <thead>
            <tr>
              <th>Sr. No.</th>
              <th>Employee ID</th>
              <th>Employee Name</th>
              <th>Document Name</th>
              <th>Submitted On</th>
              <th>Rejection Description</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>

            {loading ? (
              <tr>
                <td colSpan="8" className="table-message">
                  Loading documents...
                </td>
              </tr>
            ) : filteredDocuments.length === 0 ? (
              <tr>
                <td colSpan="8" className="table-message">
                  No documents found
                </td>
              </tr>
            ) : (
              filteredDocuments.map((document, index) => (

                <tr key={getDocumentId(document) || index}>

                  <td>{index + 1}</td>

                  <td>
                    {getEmployeeId(document)}
                  </td>

                  <td>
                    {getEmployeeName(document)}
                  </td>

                  <td>
                    <div className="document-name">

                      <DescriptionRoundedIcon />

                      <span>
                        {getDocumentName(document)}
                      </span>

                    </div>
                  </td>

                  <td>
                    {formatDate(getSubmittedDate(document))}
                  </td>

                  <td>
  {getStatus(document).toLowerCase() === "rejected"
    ? (document.rejectionReason || document.RejectionReason || "-")
    : "-"}
</td>

                  <td>
                    <span className={getStatusClass(getStatus(document))}>
                      {getStatus(document)}
                    </span>
                  </td>

                  <td>
                    <div className="document-actions">
                      {String(
                        document.status || document.Status || ""
                      ).toLowerCase() === "submitted" && (
                          <>
                            <button
                              type="button"
                              className="approve-btn"
                              onClick={() => handleApprove(document)}
                              title="Approve"
                            >
                              <CheckCircleOutlineRoundedIcon />
                            </button>

                            <button
                              type="button"
                              className="reject-btn"
                              onClick={() => handleReject(document)}
                              title="Reject"
                            >
                              <CancelRoundedIcon />
                            </button>
                          </>
                        )}

                      <button
                        type="button"
                        className="view-btn"
                        onClick={() => handleView(document)}
                        title="View"
                      >
                        <VisibilityRoundedIcon />
                      </button>
                    </div>
                  </td>

                </tr>

              ))
            )}

          </tbody>

        </table>

        {/* ================= FOOTER ================= */}

        <div className="document-table-footer">

          <span>
            Showing {filteredDocuments.length} of {totalDocuments} entries
          </span>

        </div>

      </div>

    </div>
  );
}

export default DocumentManagement;