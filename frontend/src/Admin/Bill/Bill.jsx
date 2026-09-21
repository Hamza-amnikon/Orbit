import React, { useEffect, useState } from "react";

import "./Bill.css";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import FilterAltRoundedIcon from "@mui/icons-material/FilterAltRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import CurrencyRupeeRoundedIcon from "@mui/icons-material/CurrencyRupeeRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import FileDownloadRoundedIcon from "@mui/icons-material/FileDownloadRounded";

/* =========================================================
   MUI COMPONENTS
========================================================= */

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField,
  Box,
  Divider,
  IconButton,
  Switch,
  MenuItem,
} from "@mui/material";

import VendorForm from "./VendorForm";
import VendorTable from "./VendorTable";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import {
  getBills,
  getBillDashboardSummary,
  getRecentBillActivities,
  getVendors,
} from "./services/billService"; 


/* ============================================================
   BILL API
============================================================ */

const BILL_API_BASE_URL = "https://localhost:7008";
const EMPLOYEE_API_BASE_URL = "https://localhost:7002";
const APPROVAL_API_BASE_URL =
  import.meta.env.VITE_APPROVAL_API_BASE_URL ||
  "https://localhost:7128";


const Bill = () => {

  const navigate = useNavigate();

  const { user, profile, employeeId, employeeName } = useAuth();
  const currentEmployeeId = employeeId ?? profile?.employeeId ?? profile?.EmployeeId ?? user?.employeeId ?? user?.EmployeeId ?? null;
  const currentEmployeeName = employeeName ?? profile?.employeeName ?? profile?.EmployeeName ?? profile?.displayName ?? profile?.DisplayName ?? user?.employeeName ?? user?.EmployeeName ?? user?.displayName ?? user?.DisplayName ?? user?.name ?? user?.Name ?? "Employee";


  /* ==========================================================
     FILTER STATES
  ========================================================== */

  const [search, setSearch] = useState("");

  const [status, setStatus] = useState("");

  const [paymentStatus, setPaymentStatus] = useState("");

  const [fromDate, setFromDate] = useState("");

  const [toDate, setToDate] = useState("");


  const [appliedStatus, setAppliedStatus] = useState("");

  const [appliedPaymentStatus, setAppliedPaymentStatus] =
    useState("");

  const [appliedFromDate, setAppliedFromDate] =
    useState("");

  const [appliedToDate, setAppliedToDate] =
    useState("");


  const [showFilters, setShowFilters] = useState(false);


  /* ==========================================================
     BILL DATA
  ========================================================== */

  const [bills, setBills] = useState([]);

  const [summary, setSummary] = useState({
    totalBills: 0,
    pendingApproval: 0,
    approved: 0,
    rejected: 0,
    paymentPending: 0,
    totalPaid: 0,
  });

  const [activities, setActivities] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [savingBill, setSavingBill] = useState(false);


  const [showCreateModal, setShowCreateModal] =
    useState(false);

  const [showViewModal, setShowViewModal] =
    useState(false);

  const [showEditModal, setShowEditModal] =
    useState(false);

  const [showMoreMenu, setShowMoreMenu] =
    useState(null);

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusBill, setStatusBill] = useState(null);
  const [statusAction, setStatusAction] = useState("");
  const [statusComment, setStatusComment] = useState("");
  const [savingStatus, setSavingStatus] = useState(false);
  const [employeeNames, setEmployeeNames] = useState({});
  const [savingPayment, setSavingPayment] = useState(false);
  const [originalPaymentStatus, setOriginalPaymentStatus] = useState("Pending");

  const [showAllActivities, setShowAllActivities] =
    useState(false);


  const [selectedBill, setSelectedBill] =
    useState(null);

const [showVendorForm, setShowVendorForm] = useState(false);
  const [activeTab, setActiveTab] = useState("bills");
  /* ==========================================================
     BILL FORM
  ========================================================== */

  const emptyBillForm = {
    billNumber: "",
    vendorId: "",
    category: "",
    invoiceNumber: "",
    billDate: "",
    dueDate: "",
    amount: "",
    description: "",
  };


  const [billForm, setBillForm] =
    useState(emptyBillForm);

const [vendors, setVendors] = useState([]);
  /* ==========================================================
     LOAD BILLS
  ========================================================== */

  const loadBills = async () => {

    try {

      setLoading(true);

      setError("");

      // The API supports server-side pagination, but the Bill page
      // displays all matching records in one scrollable table.
      const requestFilters = {
        search,
        status: appliedStatus,
        paymentStatus: appliedPaymentStatus,
        fromDate: appliedFromDate,
        toDate: appliedToDate,
      };

      const pageSize = 100;

      const firstResult = await getBills({
        ...requestFilters,
        pageNumber: 1,
        pageSize,
      });

      const firstData = Array.isArray(firstResult?.data)
        ? firstResult.data
        : [];

      const totalPages =
        Number(firstResult?.pagination?.totalPages) || 1;

      let allBills = [...firstData];

      // BillService currently allows a maximum of 100 records per
      // request. Load additional API pages automatically when needed.
      if (totalPages > 1) {

        for (let page = 2; page <= totalPages; page++) {

          const result = await getBills({
            ...requestFilters,
            pageNumber: page,
            pageSize,
          });

          const pageData = Array.isArray(result?.data)
            ? result.data
            : [];

          allBills = [...allBills, ...pageData];

        }

      }

      setBills(allBills);

    } catch (err) {

      console.error(
        "Failed to load bills:",
        err
      );

      setBills([]);

      setError(
        "Failed to load bills."
      );

    } finally {

      setLoading(false);

    }

  };
  /* ==========================================================
     LOAD DASHBOARD
  ========================================================== */

  const loadDashboard = async () => {

    try {

      const result =
        await getBillDashboardSummary();


      setSummary({

        totalBills:
          Number(result?.totalBills) || 0,

        pendingApproval:
          Number(result?.pendingApproval) || 0,

        approved:
          Number(result?.approved) || 0,

        rejected:
          Number(result?.rejected) || 0,

        paymentPending:
          Number(result?.paymentPending) || 0,

        totalPaid:
          Number(result?.totalPaid) || 0,

      });

    } catch (err) {

      console.error(
        "Failed to load dashboard summary:",
        err
      );

    }

  };


  /* ==========================================================
     LOAD ACTIVITIES
  ========================================================== */

  const loadActivities = async () => {

    try {

      const result =
        await getRecentBillActivities(10);


      setActivities(
        Array.isArray(result)
          ? result
          : []
      );

    } catch (err) {

      console.error(
        "Failed to load activities:",
        err
      );

      setActivities([]);

    }

  };


  /* ==========================================================
     LOAD TABLE WHEN FILTER / PAGE CHANGES
  ========================================================== */

  useEffect(() => {

    loadBills();

  }, [
    search,
    appliedStatus,
    appliedPaymentStatus,
    appliedFromDate,
    appliedToDate,

  ]);


  /* ==========================================================
     INITIAL DASHBOARD LOAD
  ========================================================== */

useEffect(() => {
  loadDashboard();
  loadActivities();
  loadVendors();
}, []);

  /* ==========================================================
     APPLY FILTERS
  ========================================================== */

  const handleApplyFilters = () => {

    if (
      fromDate &&
      toDate &&
      fromDate > toDate
    ) {

      setError(
        "From Date cannot be later than To Date."
      );

      return;

    }


    setError("");


    setAppliedStatus(status);

    setAppliedPaymentStatus(
      paymentStatus
    );

    setAppliedFromDate(fromDate);

    setAppliedToDate(toDate);




    setShowFilters(false);

  };


  /* ==========================================================
     RESET
  ========================================================== */

  const handleReset = () => {

    setSearch("");

    setStatus("");

    setPaymentStatus("");

    setFromDate("");

    setToDate("");


    setAppliedStatus("");

    setAppliedPaymentStatus("");

    setAppliedFromDate("");

    setAppliedToDate("");




    setShowFilters(false);

    setError("");

  };


  /* ==========================================================
     REFRESH
  ========================================================== */

  const handleRefresh = async () => {

    await Promise.all([
      loadBills(),
      loadDashboard(),
      loadActivities(),
    ]);

  };


  /* ==========================================================
     CREATE BILL
  ========================================================== */

  const handleCreateBill = () => {

    setBillForm({
      ...emptyBillForm,
    });

    setSelectedBill(null);

    setError("");

    setShowCreateModal(true);

  };


  const handleCloseCreateModal = () => {

    if (savingBill) {
      return;
    }

    setShowCreateModal(false);

    setBillForm({
      ...emptyBillForm,
    });

  };

const loadVendors = async () => {
  try {
    const result = await getVendors();

    setVendors(
      Array.isArray(result)
        ? result
        : []
    );
  } catch (err) {
    console.error("Failed to load vendors:", err);
    setVendors([]);
    setError("Failed to load vendors.");
  }
};


  /* ==========================================================
     FORM CHANGE
  ========================================================== */

  const handleBillFormChange = (e) => {

    const {
      name,
      value,
    } = e.target;


    setBillForm((prev) => ({

      ...prev,

      [name]: value,

    }));

  };


  /* ==========================================================
     CREATE BILL
  ========================================================== */
  

  const handleSaveBill = async (e) => {

    e.preventDefault();


    setError("");


    if (!billForm.billNumber.trim()) {

      setError(
        "Bill Number is required."
      );

      return;

    }


    if (!billForm.vendorId) {

      setError(
        "Vendor ID is required."
      );

      return;

    }


    if (!billForm.category.trim()) {

      setError(
        "Category is required."
      );

      return;

    }


    if (!billForm.billDate) {

      setError(
        "Bill Date is required."
      );

      return;

    }


    if (!billForm.dueDate) {

      setError(
        "Due Date is required."
      );

      return;

    }


    if (
      billForm.dueDate <
      billForm.billDate
    ) {

      setError(
        "Due Date cannot be earlier than Bill Date."
      );

      return;

    }


    if (
      !billForm.amount ||
      Number(billForm.amount) <= 0
    ) {

      setError(
        "Amount must be greater than zero."
      );

      return;

    }


    try {

      setSavingBill(true);


      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken");

console.log("CURRENT LOGGED-IN EMPLOYEE ID:", currentEmployeeId);
console.log("CURRENT LOGGED-IN EMPLOYEE NAME:", currentEmployeeName);



      const response = await fetch(
        `${BILL_API_BASE_URL}/api/Bill`,
        {
          method: "POST",

          headers: {

            "Content-Type":
              "application/json",

            ...(token
              ? {
                  Authorization:
                    `Bearer ${token}`,
                }
              : {}),

          },

          body: JSON.stringify({

            billNumber:
              billForm.billNumber.trim(),

            vendorId:
              Number(billForm.vendorId),

            category:
              billForm.category.trim(),

            invoiceNumber:
              billForm.invoiceNumber.trim() ||
              null,

            billDate:
              billForm.billDate,

            dueDate:
              billForm.dueDate,

            amount:
              Number(billForm.amount),

            description:
              billForm.description.trim() ||
              null,

              employeeId: Number(currentEmployeeId),

          }),

        }
      );


      const result =
        await response
          .json()
          .catch(() => null);


      if (!response.ok) {

        throw new Error(
          result?.message ||
          result?.title ||
          "Failed to create bill."
        );

      }


      setShowCreateModal(false);

      setBillForm({
        ...emptyBillForm,
      });




      await Promise.all([
        loadBills(),
        loadDashboard(),
        loadActivities(),
      ]);

    } catch (err) {

      console.error(
        "Failed to create bill:",
        err
      );

      setError(
        err?.message ||
        "Failed to create bill."
      );

    } finally {

      setSavingBill(false);

    }

  };


  /* ==========================================================
     SHOW ALL BILLS
  ========================================================== */

  const handleShowAllBills = () => {

    setSearch("");

    setStatus("");

    setPaymentStatus("");

    setFromDate("");

    setToDate("");


    setAppliedStatus("");

    setAppliedPaymentStatus("");

    setAppliedFromDate("");

    setAppliedToDate("");




    setError("");

  };


  /* ==========================================================
     DASHBOARD STATUS FILTER
  ========================================================== */

  const handleDashboardStatus = (
    statusValue
  ) => {

    setSearch("");

    setStatus(statusValue);

    setAppliedStatus(statusValue);


    setPaymentStatus("");

    setAppliedPaymentStatus("");




    setError("");

  };


  /* ==========================================================
     PAYMENT STATUS FILTER
  ========================================================== */

  const handlePaymentStatus = (
    paymentStatusValue
  ) => {

    setSearch("");

    setPaymentStatus(
      paymentStatusValue
    );

    setAppliedPaymentStatus(
      paymentStatusValue
    );


    setStatus("");

    setAppliedStatus("");




    setError("");

  };


  /* ==========================================================
     REPORTS
  ========================================================== */

  const handleReports = () => {

    navigate("/reports");

  };


  /* ==========================================================
     LOAD EMPLOYEE NAME FOR APPROVAL / REJECTION
  ========================================================== */

  const getEmployeeName = async (id) => {
    if (!id) return "-";

    const numericId = Number(id);
    if (!Number.isFinite(numericId) || numericId <= 0) {
      return "-";
    }

    if (employeeNames[numericId]) {
      return employeeNames[numericId];
    }

    try {
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken");

      const response = await fetch(
        `${EMPLOYEE_API_BASE_URL}/api/Employee/${numericId}`,
        {
          headers: {
            ...(token
              ? { Authorization: `Bearer ${token}` }
              : {}),
          },
        }
      );

      if (!response.ok) {
        return "-";
      }

      const result = await response.json().catch(() => null);

      const employee =
        result?.data ||
        result?.employee ||
        result;

      const name =
        employee?.employeeName ||
        employee?.EmployeeName ||
        employee?.fullName ||
        employee?.FullName ||
        employee?.displayName ||
        employee?.DisplayName ||
        employee?.name ||
        employee?.Name ||
        "-";

      if (name !== "-") {
        setEmployeeNames((previous) => ({
          ...previous,
          [numericId]: name,
        }));
      }

      return name;
    } catch (err) {
      console.error(
        `Failed to load employee ${numericId}:`,
        err
      );
      return "-";
    }
  };

  useEffect(() => {
    if (!selectedBill) return;

    const approvalEmployeeId =
      selectedBill.approvedBy ??
      selectedBill.approvedByEmployeeId;

    const rejectionEmployeeId =
      selectedBill.rejectedBy ??
      selectedBill.rejectedByEmployeeId;

    if (selectedBill.status === "Approved" && approvalEmployeeId) {
      getEmployeeName(approvalEmployeeId);
    }

    if (selectedBill.status === "Rejected" && rejectionEmployeeId) {
      getEmployeeName(rejectionEmployeeId);
    }
  }, [selectedBill]);

  /* ==========================================================
     VIEW BILL
  ========================================================== */

  const handleViewBill = (bill) => {

    setSelectedBill(bill);

    setOriginalPaymentStatus(
      bill?.paymentStatus || "Pending"
    );

    setShowMoreMenu(null);

    setShowViewModal(true);

  };


  /* ==========================================================
     EDIT BILL
  ========================================================== */

  const handleEditBill = (bill) => {

    setSelectedBill(bill);


    setBillForm({

      billNumber:
        bill.billNumber || "",

      vendorId:
        bill.vendorId !== undefined &&
        bill.vendorId !== null
          ? String(bill.vendorId)
          : "",

      category:
        bill.category || "",

      invoiceNumber:
        bill.invoiceNumber || "",

      billDate:
        bill.billDate
          ? bill.billDate.substring(0, 10)
          : "",

      dueDate:
        bill.dueDate
          ? bill.dueDate.substring(0, 10)
          : "",

      amount:
        bill.amount !== undefined &&
        bill.amount !== null
          ? String(bill.amount)
          : "",

      description:
        bill.description || "",

    });


    setShowMoreMenu(null);

    setShowEditModal(true);

  };


  /* ==========================================================
     UPDATE BILL
  ========================================================== */

  const handleUpdateBill = async (e) => {

    e.preventDefault();


    if (!selectedBill?.billId) {

      setError(
        "Bill ID is missing."
      );

      return;

    }


    setError("");


    if (!billForm.billNumber.trim()) {

      setError(
        "Bill Number is required."
      );

      return;

    }


    if (!billForm.vendorId) {

      setError(
        "Vendor ID is required."
      );

      return;

    }


    if (!billForm.category.trim()) {

      setError(
        "Category is required."
      );

      return;

    }


    if (
      !billForm.billDate ||
      !billForm.dueDate
    ) {

      setError(
        "Bill Date and Due Date are required."
      );

      return;

    }


    if (
      billForm.dueDate <
      billForm.billDate
    ) {

      setError(
        "Due Date cannot be earlier than Bill Date."
      );

      return;

    }


    if (
      !billForm.amount ||
      Number(billForm.amount) <= 0
    ) {

      setError(
        "Amount must be greater than zero."
      );

      return;

    }


    try {

      setSavingBill(true);


      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken");


      const response = await fetch(

        `${BILL_API_BASE_URL}/api/Bill/${selectedBill.billId}`,

        {
          method: "PUT",

          headers: {

            "Content-Type":
              "application/json",

            ...(token
              ? {
                  Authorization:
                    `Bearer ${token}`,
                }
              : {}),

          },

          body: JSON.stringify({

            billNumber:
              billForm.billNumber.trim(),

            vendorId:
              Number(billForm.vendorId),

            category:
              billForm.category.trim(),

            invoiceNumber:
              billForm.invoiceNumber.trim() ||
              null,

            billDate:
              billForm.billDate,

            dueDate:
              billForm.dueDate,

            amount:
              Number(billForm.amount),

            description:
              billForm.description.trim() ||
              null,

          }),

        }

      );


      const result =
        await response
          .json()
          .catch(() => null);


      if (!response.ok) {

        throw new Error(
          result?.message ||
          result?.title ||
          "Failed to update bill."
        );

      }


      setShowEditModal(false);

      setSelectedBill(null);

      setBillForm({
        ...emptyBillForm,
      });


      await Promise.all([
        loadBills(),
        loadDashboard(),
        loadActivities(),
      ]);

    } catch (err) {

      console.error(
        "Failed to update bill:",
        err
      );

      setError(
        err?.message ||
        "Failed to update bill."
      );

    } finally {

      setSavingBill(false);

    }

  };


  /* ==========================================================
     APPROVE / REJECT BILL
  ========================================================== */

  const openStatusModal = (bill, action) => {
    setStatusBill(bill);
    setStatusAction(action);
    setStatusComment("");
    setShowMoreMenu(null);
    setShowStatusModal(true);
  };

  const closeStatusModal = () => {
    if (savingStatus) return;
    setShowStatusModal(false);
    setStatusBill(null);
    setStatusAction("");
    setStatusComment("");
  };

  const handleBillStatus = async () => {
    if (!statusBill?.billId) {
      setError("Bill ID is missing.");
      return;
    }

    if (!currentEmployeeId) {
      setError("Logged-in employee information is not available.");
      return;
    }

    if (!APPROVAL_API_BASE_URL) {
      setError("Approval API URL is not configured. Set VITE_APPROVAL_API_BASE_URL in the frontend environment.");
      return;
    }

    try {
      setSavingStatus(true);
      setError("");

      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken");

      const authHeaders = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const newStatus =
        statusAction === "approve" ? "Approved" : "Rejected";

      // ------------------------------------------------------------
      // 1. Find the ApprovalService request belonging to this Bill.
      //    ApprovalService exposes GET /api/Approval.
      // ------------------------------------------------------------
      const approvalsResponse = await fetch(
        `${APPROVAL_API_BASE_URL}/api/Approval`,
        { headers: authHeaders }
      );

      const approvalsResult = await approvalsResponse
        .json()
        .catch(() => null);

      if (!approvalsResponse.ok) {
        throw new Error(
          approvalsResult?.message ||
          approvalsResult?.title ||
          "Failed to load approval request."
        );
      }

      const approvals = Array.isArray(approvalsResult)
        ? approvalsResult
        : approvalsResult?.data || [];

      const approval = approvals.find((item) => {
        const requestType =
          item.requestType ?? item.RequestType;
        const requestId =
          item.requestId ?? item.RequestId;

        return (
          String(requestType).toLowerCase() === "bill" &&
          Number(requestId) === Number(statusBill.billId)
        );
      });

      if (!approval) {
        throw new Error(
          "No ApprovalService request is associated with this bill."
        );
      }

      const approvalId =
        approval.approvalRequestId ??
        approval.ApprovalRequestId;

      const assignedApproverId =
        approval.currentApproverId ??
        approval.CurrentApproverId;

      // The ApprovalService determines the current approver from
      // HierarchyService when the request is created. Do not allow
      // another employee to approve/reject from this page.
      if (
        assignedApproverId &&
        Number(assignedApproverId) !== Number(currentEmployeeId)
      ) {
        throw new Error(
          `This bill is assigned to Employee ID ${assignedApproverId} for approval.`
        );
      }

      if (!approvalId) {
        throw new Error(
          "ApprovalRequestId is missing from the ApprovalService response."
        );
      }

      // ------------------------------------------------------------
      // 2. Update BillService with the actual logged-in employee.
      //    BillService stores ApprovedBy / RejectedBy and the comment.
      // ------------------------------------------------------------
      const billResponse = await fetch(
        `${BILL_API_BASE_URL}/api/Bill/${statusBill.billId}/status`,
        {
          method: "PUT",
          headers: authHeaders,
          body: JSON.stringify({
            status: newStatus,
            approvedBy:
              newStatus === "Approved"
                ? Number(currentEmployeeId)
                : null,
            rejectedBy:
              newStatus === "Rejected"
                ? Number(currentEmployeeId)
                : null,
            managerComment: statusComment.trim() || null,
          }),
        }
      );

      const billResult = await billResponse
        .json()
        .catch(() => null);

      if (!billResponse.ok) {
        throw new Error(
          billResult?.message ||
          billResult?.title ||
          `Failed to ${statusAction} bill.`
        );
      }

      // ------------------------------------------------------------
      // 3. Synchronize ApprovalService.
      //    Approve/reject are final-stop operations in your
      //    ApprovalController.
      // ------------------------------------------------------------
      const approvalAction =
        newStatus === "Approved" ? "approve" : "reject";

      const approvalResponse = await fetch(
        `${APPROVAL_API_BASE_URL}/api/Approval/${approvalId}/${approvalAction}`,
        {
          method: "PUT",
          headers: authHeaders,
        }
      );

      const approvalResult = await approvalResponse
        .json()
        .catch(() => null);

      if (!approvalResponse.ok) {
        throw new Error(
          approvalResult?.message ||
          approvalResult?.title ||
          `Bill was updated, but ApprovalService could not be marked ${newStatus.toLowerCase()}.`
        );
      }

      setShowStatusModal(false);
      setStatusBill(null);
      setStatusAction("");
      setStatusComment("");

      await Promise.all([
        loadBills(),
        loadDashboard(),
        loadActivities(),
      ]);
    } catch (err) {
      console.error(
        "Failed to update bill approval status:",
        err
      );
      setError(
        err?.message ||
        "Failed to update bill approval status."
      );
    } finally {
      setSavingStatus(false);
    }
  };

  /* ==========================================================
     PAYMENT STATUS - LOCAL CHANGE
     The API update happens when the user clicks Update.
  ========================================================== */

  const handlePaymentToggle = (event) => {

    if (!selectedBill?.billId) {
      setError("Bill ID is missing.");
      return;
    }

    if (selectedBill.status !== "Approved") {
      setError("Payment status can only be changed for approved bills.");
      return;
    }

    const newPaymentStatus = event.target.checked
      ? "Paid"
      : "Pending";

    setSelectedBill((previous) =>
      previous
        ? {
            ...previous,
            paymentStatus: newPaymentStatus,
          }
        : previous
    );

    setError("");
  };


  /* ==========================================================
     UPDATE PAYMENT STATUS + DASHBOARD
     Runs when the user clicks Update.
  ========================================================== */

  const handleCloseViewModal = async () => {

    if (!selectedBill) {
      setShowViewModal(false);
      return;
    }

    const currentPaymentStatus =
      selectedBill.paymentStatus || "Pending";

    const oldPaymentStatus =
      originalPaymentStatus || "Pending";

    const hasPaymentChanged =
      String(currentPaymentStatus).toLowerCase() !==
      String(oldPaymentStatus).toLowerCase();

    // No payment change - simply close the modal.
    if (!hasPaymentChanged) {
      setShowViewModal(false);
      return;
    }

    if (selectedBill.status !== "Approved") {
      setShowViewModal(false);
      return;
    }

    try {
      setSavingPayment(true);
      setError("");

      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken");

      const response = await fetch(
        `${BILL_API_BASE_URL}/api/Bill/${selectedBill.billId}/payment-status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token
              ? { Authorization: `Bearer ${token}` }
              : {}),
          },
          body: JSON.stringify({
            paymentStatus: currentPaymentStatus,
          }),
        }
      );

      const result = await response
        .json()
        .catch(() => null);

      if (!response.ok) {
        throw new Error(
          result?.message ||
          result?.title ||
          "Failed to update payment status."
        );
      }

      // Update the dashboard amount/count immediately.
      const billAmount = Number(selectedBill.amount) || 0;
      const wasPaid =
        String(oldPaymentStatus).toLowerCase() === "paid";
      const isPaid =
        String(currentPaymentStatus).toLowerCase() === "paid";

      if (wasPaid !== isPaid) {
        setSummary((previous) => ({
          ...previous,
          paymentPending: Math.max(
            0,
            previous.paymentPending + (isPaid ? -1 : 1)
          ),
          totalPaid: Math.max(
            0,
            previous.totalPaid +
              (isPaid ? billAmount : -billAmount)
          ),
        }));
      }

      // Refresh the table and dashboard from the database so the
      // cards always match the saved payment status.
      await Promise.all([
        loadBills(),
        loadDashboard(),
        loadActivities(),
      ]);

      setOriginalPaymentStatus(currentPaymentStatus);
      setShowViewModal(false);

    } catch (err) {
      console.error(
        "Failed to update payment status:",
        err
      );

      setError(
        err?.message ||
        "Failed to update payment status."
      );

      // Keep the modal open if saving failed.
      return;

    } finally {
      setSavingPayment(false);
    }
  };

  /* ==========================================================
     MORE MENU
  ========================================================== */

  const handleMoreBill = (billId) => {

    setShowMoreMenu((previous) =>
      previous === billId
        ? null
        : billId
    );

  };


  /* ==========================================================
     DELETE BILL
  ========================================================== */

  const handleDeleteBill = async (bill) => {

    setShowMoreMenu(null);


    if (!bill?.billId) {
      return;
    }


    const confirmed =
      window.confirm(
        `Are you sure you want to delete ${bill.billNumber}?`
      );


    if (!confirmed) {
      return;
    }


    try {

      setError("");


      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken");


      const response = await fetch(

        `${BILL_API_BASE_URL}/api/Bill/${bill.billId}`,

        {
          method: "DELETE",

          headers: {

            ...(token
              ? {
                  Authorization:
                    `Bearer ${token}`,
                }
              : {}),

          },

        }

      );


      const result =
        await response
          .json()
          .catch(() => null);


      if (!response.ok) {

        throw new Error(
          result?.message ||
          result?.title ||
          "Failed to delete bill."
        );

      }


      await Promise.all([
        loadBills(),
        loadDashboard(),
        loadActivities(),
      ]);

    } catch (err) {

      console.error(
        "Failed to delete bill:",
        err
      );

      setError(
        err?.message ||
        "Failed to delete bill."
      );

    }

  };


  /* ==========================================================
     ALL ACTIVITIES
  ========================================================== */

  const handleViewAllActivities =
    async () => {

      try {

        const result =
          await getRecentBillActivities(50);


        setActivities(
          Array.isArray(result)
            ? result
            : []
        );


        setShowAllActivities(true);

      } catch (err) {

        console.error(
          "Failed to load all activities:",
          err
        );

        setError(
          "Failed to load activities."
        );

      }

    };


  /* ==========================================================
     EXPORT BILLS
  ========================================================== */

  const handleExportBills = () => {
    if (!bills || bills.length === 0) {
      setError("No bills available to export.");
      return;
    }

    const headers = [
      "Bill Number",
      "Vendor",
      "Category",
      "Bill Date",
      "Due Date",
      "Amount",
      "Status",
      "Payment Status",
    ];

    const rows = bills.map((bill) => [
      bill.billNumber || "",
      bill.vendorName || bill.vendorId || "",
      bill.category || "",
      formatDate(bill.billDate),
      formatDate(bill.dueDate),
      bill.amount ?? "",
      bill.status || "",
      bill.paymentStatus || "",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => {
            const text = String(value ?? "");
            return `"${text.replace(/"/g, '""')}"`;
          })
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `Bills_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };


  /* ==========================================================
     STATUS CLASS
  ========================================================== */

  const getStatusClass = (value) => {

    switch (value) {

      case "Approved":
        return "status-approved";

      case "Rejected":
        return "status-rejected";

      case "Pending Approval":
        return "status-pending";

      case "Paid":
        return "status-paid";

      case "Pending":
        return "status-payment-pending";

      default:
        return "status-neutral";

    }

  };


  /* ==========================================================
     DATE
  ========================================================== */

  const formatDate = (value) => {

    if (!value) {
      return "-";
    }


    const date = new Date(value);


    if (Number.isNaN(date.getTime())) {
      return "-";
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


  /* ==========================================================
     CURRENCY
  ========================================================== */

  const formatCurrency = (value) => {

    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }
    ).format(
      Number(value) || 0
    );

  };


  /* ==========================================================
     ACTIVITY TIME
  ========================================================== */

  const formatActivityTime = (value) => {

    if (!value) {
      return "";
    }


    const date = new Date(value);

    const now = new Date();


    const diffMs =
      now.getTime() -
      date.getTime();


    const diffMinutes =
      Math.floor(
        diffMs / 60000
      );


    const diffHours =
      Math.floor(
        diffMinutes / 60
      );


    const diffDays =
      Math.floor(
        diffHours / 24
      );


    if (diffMinutes < 1) {
      return "Just now";
    }


    if (diffMinutes < 60) {
      return `${diffMinutes} min ago`;
    }


    if (diffHours < 24) {

      return `${diffHours} hour${
        diffHours > 1
          ? "s"
          : ""
      } ago`;

    }


    if (diffDays < 7) {

      return `${diffDays} day${
        diffDays > 1
          ? "s"
          : ""
      } ago`;

    }


    return formatDate(value);

  };


  /* ==========================================================
     ACTIVITY DOT
  ========================================================== */

  const getActivityDotClass =
    (activityType) => {

      switch (activityType) {

        case "Approved":
          return "green-dot";

        case "Payment":
          return "purple-dot";

        case "Rejected":
          return "red-dot";

        default:
          return "blue-dot";

      }

    };


  /* ==========================================================
     UI
  ========================================================== */

  return (

    <div className="bill-page">


      {/* ======================================================
          HEADER
      ====================================================== */}

<div className="bill-page-header">
  <div className="bill-title-section">
    <h1>Bills</h1>

    <p>
      Manage company bills, invoices and payments.
    </p>
  </div>

  <div className="bill-header-actions">

    {/* CREATE BILL */}
    <button
      type="button"
      className="create-bill-btn"
      onClick={handleCreateBill}
    >
      <AddRoundedIcon />
      <span>Create Bill</span>
    </button>

    {/* ADD VENDOR */}
<button
  type="button"
  className="add-vendor-btn"
  onClick={() => setShowVendorForm(true)}
>
  <PeopleRoundedIcon />
  <span>Add Vendor</span>
</button>

    {/* RECENT ACTIVITY */}
<button
  type="button"
  className="recent-activity-btn"
  onClick={handleViewAllActivities}
>
  <AccessTimeRoundedIcon />
  <span>Recent Activity</span>
</button>

  </div>
</div>


      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (

        <div className="bill-error">

          {error}

          <button
            type="button"
            onClick={() =>
              setError("")
            }
          >
            ×
          </button>

        </div>

      )}


      {/* ======================================================
          SUMMARY CARDS
      ====================================================== */}

      <div className="bill-summary-grid">


        {/* TOTAL */}

        <button
          type="button"
          className="bill-summary-card blue-card"
          onClick={handleShowAllBills}
        >

          <div className="bill-summary-icon blue">
            <DescriptionRoundedIcon />
          </div>

          <div className="bill-summary-content">

            <span>
              Total Bills
            </span>

            <h2>
              {summary.totalBills}
            </h2>

            <small>
              All time bills
            </small>

          </div>

        </button>


        {/* PENDING APPROVAL */}

        <button
          type="button"
          className="bill-summary-card orange-card"
          onClick={() =>
            handleDashboardStatus(
              "Pending Approval"
            )
          }
        >

          <div className="bill-summary-icon orange">
            <AccessTimeRoundedIcon />
          </div>

          <div className="bill-summary-content">

            <span>
              Pending Approval
            </span>

            <h2>
              {summary.pendingApproval}
            </h2>

            <small>
              Awaiting approval
            </small>

          </div>

        </button>


        {/* APPROVED */}

        <button
          type="button"
          className="bill-summary-card green-card"
          onClick={() =>
            handleDashboardStatus(
              "Approved"
            )
          }
        >

          <div className="bill-summary-icon green">
            <CheckCircleRoundedIcon />
          </div>

          <div className="bill-summary-content">

            <span>
              Approved
            </span>

            <h2>
              {summary.approved}
            </h2>

            <small>
              Ready for payment
            </small>

          </div>

        </button>


        {/* REJECTED */}

        <button
          type="button"
          className="bill-summary-card red-card"
          onClick={() =>
            handleDashboardStatus(
              "Rejected"
            )
          }
        >

          <div className="bill-summary-icon red">
            <CancelRoundedIcon />
          </div>

          <div className="bill-summary-content">

            <span>
              Rejected
            </span>

            <h2>
              {summary.rejected}
            </h2>

            <small>
              Rejected bills
            </small>

          </div>

        </button>


        {/* PAYMENT PENDING */}

        <button
          type="button"
          className="bill-summary-card purple-card"
          onClick={() =>
            handlePaymentStatus(
              "Pending"
            )
          }
        >

          <div className="bill-summary-icon purple">
            <PaymentsRoundedIcon />
          </div>

          <div className="bill-summary-content">

            <span>
              Payment Pending
            </span>

            <h2>
              {summary.paymentPending}
            </h2>

            <small>
              Pending payment
            </small>

          </div>

        </button>


        {/* TOTAL PAID */}

        <button
          type="button"
          className="bill-summary-card rupee-card"
          onClick={() =>
            handlePaymentStatus(
              "Paid"
            )
          }
        >

          <div className="bill-summary-icon rupee">
            <CurrencyRupeeRoundedIcon />
          </div>

          <div className="bill-summary-content">

            <span>
              Total Paid
            </span>

            <h2>
              {formatCurrency(
                summary.totalPaid
              )}
            </h2>

            <small>
              Payments completed
            </small>

          </div>

        </button>


      </div>


      {/* ======================================================
          BILL / VENDOR TABS
      ====================================================== */}

      <div className="bill-vendor-tabs">

        <button
          type="button"
          className={`bill-vendor-tab ${
            activeTab === "bills" ? "active" : ""
          }`}
          onClick={() => setActiveTab("bills")}
        >
          Bills
        </button>

        <button
          type="button"
          className={`bill-vendor-tab ${
            activeTab === "vendors" ? "active" : ""
          }`}
          onClick={() => setActiveTab("vendors")}
        >
          Vendors
        </button>

      </div>

      {activeTab === "bills" && (

        <div className="bill-tab-content">

          {/* ======================================================
              TABLE CARD
          ====================================================== */}

          <div className="bill-table-card">


        {/* ====================================================
            FILTER BAR
        ==================================================== */}

        <div className="bill-filter-row">


          {/* SEARCH */}

          <div className="bill-search-box">

            <SearchRoundedIcon />

            <input
              type="text"
              placeholder="Search by bill number, vendor, category..."
              value={search}
              onChange={(e) => {

                setSearch(
                  e.target.value
                );



              }}
            />

          </div>


          {/* FROM DATE */}

          <div
            className={`bill-date-input ${
              fromDate
                ? "has-date"
                : ""
            }`}
          >

            <input
              type="date"
              value={fromDate}
              onChange={(e) =>
                setFromDate(
                  e.target.value
                )
              }
              aria-label="From Date"
            />

            <span className="date-label">

              {fromDate
                ? formatDate(
                    fromDate
                  )
                : "From Date"}

            </span>

            <CalendarTodayRoundedIcon />

          </div>


          {/* TO DATE */}

          <div
            className={`bill-date-input ${
              toDate
                ? "has-date"
                : ""
            }`}
          >

            <input
              type="date"
              value={toDate}
              onChange={(e) =>
                setToDate(
                  e.target.value
                )
              }
              aria-label="To Date"
            />

            <span className="date-label">

              {toDate
                ? formatDate(
                    toDate
                  )
                : "To Date"}

            </span>

            <CalendarTodayRoundedIcon />

          </div>


          {/* FILTER */}

          <button
            type="button"
            className="filter-btn"
            onClick={() =>
              setShowFilters(
                (previous) =>
                  !previous
              )
            }
          >

            <FilterAltRoundedIcon />

            <span>
              Filter
            </span>

          </button>


          {/* RESET */}

          <button
            type="button"
            className="reset-btn"
            onClick={handleReset}
          >

            <RefreshRoundedIcon />

            <span>
              Reset
            </span>

          </button>


        </div>


        {/* ====================================================
            ADVANCED FILTERS
        ==================================================== */}

        {showFilters && (

          <div className="bill-status-filter">

            <select
              value={status}
              onChange={(e) =>
                setStatus(
                  e.target.value
                )
              }
            >

              <option value="">
                All Status
              </option>

              <option value="Pending Approval">
                Pending Approval
              </option>

              <option value="Approved">
                Approved
              </option>

              <option value="Rejected">
                Rejected
              </option>

            </select>


            <select
              value={paymentStatus}
              onChange={(e) =>
                setPaymentStatus(
                  e.target.value
                )
              }
            >

              <option value="">
                All Payment Status
              </option>

              <option value="Pending">
                Pending
              </option>

              <option value="Paid">
                Paid
              </option>

            </select>


            <button
              type="button"
              className="filter-btn"
              onClick={
                handleApplyFilters
              }
            >
              Apply
            </button>

            <button
              type="button"
              className="export-btn"
              onClick={handleExportBills}
            >
              <FileDownloadRoundedIcon />
              <span>Export</span>
            </button>

          </div>

        )}


        {/* ====================================================
            TABLE
        ==================================================== */}

        <div className="bill-table-wrapper">

          <table className="bill-table">


            <thead>

              <tr>

                <th>
                  Bill Number
                </th>

                <th>
                  Vendor
                </th>

                <th>
                  Category
                </th>

                <th>
                  Bill Date
                </th>

                <th>
                  Due Date
                </th>

                <th>
                  Amount
                </th>

                <th>
                  Approval Status
                </th>

                <th>
                  Payment Status
                </th>

                <th>
                  Action
                </th>

              </tr>

            </thead>


            <tbody>


              {/* LOADING */}

              {loading && (

                <tr>

                  <td
                    colSpan="9"
                    className="table-message"
                  >
                    Loading bills...
                  </td>

                </tr>

              )}


              {/* EMPTY */}

              {!loading &&
                bills.length === 0 && (

                  <tr>

                    <td
                      colSpan="9"
                      className="table-message"
                    >
                      No bills found.
                    </td>

                  </tr>

                )}


              {/* REAL DATA */}

              {!loading &&
                bills.length > 0 &&
                bills.map((bill) => (

                  <tr
                    key={
                      bill.billId
                    }
                  >


                    {/* BILL NUMBER */}

                    <td>

                      <button
                        type="button"
                        className="bill-number"
                        onClick={() =>
                          handleViewBill(
                            bill
                          )
                        }
                      >

                        {bill.billNumber ||
                          "-"}

                      </button>

                    </td>


                    {/* VENDOR */}

                    <td>

                      {bill.vendorName ||
                        bill.vendorId ||
                        "-"}

                    </td>


                    {/* CATEGORY */}

                    <td>

                      {bill.category ||
                        "-"}

                    </td>


                    {/* BILL DATE */}

                    <td>

                      {formatDate(
                        bill.billDate
                      )}

                    </td>


                    {/* DUE DATE */}

                    <td>

                      {formatDate(
                        bill.dueDate
                      )}

                    </td>


                    {/* AMOUNT */}

                    <td className="bill-amount">

                      {formatCurrency(
                        bill.amount
                      )}

                    </td>


                    {/* STATUS */}

                    <td>

                      <span
                        className={`bill-status ${getStatusClass(
                          bill.status
                        )}`}
                      >

                        {bill.status ||
                          "-"}

                      </span>

                    </td>


                    {/* PAYMENT STATUS */}

                    <td>

                      <span
                        className={`payment-status ${getStatusClass(
                          bill.paymentStatus
                        )}`}
                      >

                        {bill.paymentStatus ||
                          "-"}

                      </span>

                    </td>


                    {/* ACTION */}

                    <td>

                      <div className="bill-actions">

                        <button
                          type="button"
                          className="bill-view-action"
                          onClick={() => handleViewBill(bill)}
                        >
                          View
                        </button>

                        {bill.status === "Pending Approval" && (
                          <>
                            <button
                              type="button"
                              className="bill-approve-action"
                              onClick={() => openStatusModal(bill, "approve")}
                            >
                              Approve
                            </button>

                            <button
                              type="button"
                              className="bill-reject-action"
                              onClick={() => openStatusModal(bill, "reject")}
                            >
                              Reject
                            </button>
                          </>
                        )}

                      </div>

                    </td>


                  </tr>

                ))}


            </tbody>

          </table>

        </div>

        {/* ====================================================
            TOTAL BILL COUNT
        ==================================================== */}

        <div className="bill-table-footer">
          <span>
            Total Bills:
            <strong>{bills.length}</strong>
          </span>
        </div>


          </div>

        </div>

      )}


      {activeTab === "vendors" && (

        <VendorTable vendors={vendors} />

      )}


      {/* ======================================================
          CREATE BILL - MUI DIALOG
      ====================================================== */}

      <Dialog
        open={showCreateModal}
        onClose={savingBill ? undefined : handleCloseCreateModal}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            width: "100%",
            maxWidth: "520px",
            borderRadius: "10px",
            overflow: "hidden",
            boxShadow: "0 20px 50px rgba(15, 23, 42, 0.20)",
          },
        }}
      >
        <DialogTitle
          sx={{
            px: 2.25,
            py: 1.6,
            borderBottom: "1px solid #edf1f5",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 1,
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: "17px",
                  fontWeight: 700,
                  color: "#1f2937",
                  lineHeight: 1.25,
                }}
              >
                Create Bill
              </Typography>

              <Typography
                sx={{
                  mt: 0.4,
                  fontSize: "10px",
                  color: "#94a3b8",
                }}
              >
                Create a new company bill.
              </Typography>
            </Box>

            <IconButton
              size="small"
              onClick={handleCloseCreateModal}
              disabled={savingBill}
              sx={{
                width: 30,
                height: 30,
                color: "#64748b",
                borderRadius: "6px",
                "&:hover": {
                  backgroundColor: "#f8fafc",
                },
              }}
            >
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </Box>
        </DialogTitle>

        <Box
          component="form"
          onSubmit={handleSaveBill}
          noValidate
        >
          <DialogContent
            sx={{
              px: 2.25,
              py: 2,
              "& .MuiTextField-root": {
                minWidth: 0,
              },
              "& .MuiInputLabel-root": {
                fontSize: "12px",
              },
              "& .MuiOutlinedInput-root": {
                borderRadius: "6px",
                backgroundColor: "#fff",
              },
              "& .MuiInputBase-input, & .MuiSelect-select": {
                fontSize: "12px",
              },
              "& .MuiOutlinedInput-input": {
                padding: "9px 11px",
              },
            }}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "1fr 1fr",
                },
                gap: 1.5,
              }}
            >
              <TextField
                fullWidth
                required
                variant="outlined"
                label="Bill Number"
                name="billNumber"
                value={billForm.billNumber}
                onChange={handleBillFormChange}
                placeholder="Enter bill number"
                size="small"
                disabled={savingBill}
              />

              <TextField
                fullWidth
                required
                select
                label="Vendor"
                name="vendorId"
                value={billForm.vendorId}
                onChange={handleBillFormChange}
                size="small"
                disabled={savingBill}
              >
                <MenuItem value="">
                  Select Vendor
                </MenuItem>

                {vendors.map((vendor) => (
                  <MenuItem
                    key={vendor.vendorId}
                    value={vendor.vendorId}
                  >
                    {vendor.vendorName}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                required
                variant="outlined"
                label="Category"
                name="category"
                value={billForm.category}
                onChange={handleBillFormChange}
                placeholder="Enter category"
                size="small"
                disabled={savingBill}
              />

              <TextField
                fullWidth
                variant="outlined"
                label="Invoice Number"
                name="invoiceNumber"
                value={billForm.invoiceNumber}
                onChange={handleBillFormChange}
                placeholder="Enter invoice number"
                size="small"
                disabled={savingBill}
              />

              <TextField
                fullWidth
                required
                variant="outlined"
                label="Bill Date"
                name="billDate"
                type="date"
                value={billForm.billDate}
                onChange={handleBillFormChange}
                size="small"
                disabled={savingBill}
                InputLabelProps={{
                  shrink: true,
                }}
              />

              <TextField
                fullWidth
                required
                variant="outlined"
                label="Due Date"
                name="dueDate"
                type="date"
                value={billForm.dueDate}
                onChange={handleBillFormChange}
                size="small"
                disabled={savingBill}
                InputLabelProps={{
                  shrink: true,
                }}
              />

              <TextField
                fullWidth
                required
                variant="outlined"
                label="Amount"
                name="amount"
                type="number"
                value={billForm.amount}
                onChange={handleBillFormChange}
                placeholder="Enter amount"
                inputProps={{
                  min: 0.01,
                  step: 0.01,
                }}
                size="small"
                disabled={savingBill}
              />

              <TextField
                fullWidth
                label="Description"
                name="description"
                value={billForm.description}
                onChange={handleBillFormChange}
                placeholder="Enter description"
                multiline
                rows={3}
                size="small"
                disabled={savingBill}
                sx={{
                  gridColumn: {
                    xs: "1",
                    sm: "1 / -1",
                  },
                }}
              />
            </Box>
          </DialogContent>

          <Divider />

          <DialogActions
            sx={{
              px: 2.25,
              py: 1.35,
              gap: 0.75,
            }}
          >
            <Button
              type="button"
              variant="outlined"
              size="small"
              onClick={handleCloseCreateModal}
              disabled={savingBill}
              sx={{
                textTransform: "none",
                height: "34px",
                minWidth: "72px",
                borderRadius: "6px",
                borderColor: "#dbe2eb",
                color: "#475569",
                fontSize: "11px",
                "&:hover": {
                  borderColor: "#cbd5e1",
                  backgroundColor: "#f8fafc",
                },
              }}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="contained"
              size="small"
              disabled={savingBill}
              sx={{
                textTransform: "none",
                height: "34px",
                minWidth: "100px",
                borderRadius: "6px",
                backgroundColor: "#2563eb",
                fontSize: "11px",
                fontWeight: 600,
                boxShadow: "none",
                "&:hover": {
                  backgroundColor: "#1d4ed8",
                  boxShadow: "none",
                },
              }}
            >
              {savingBill ? "Saving..." : "Create Bill"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* ======================================================
          VIEW BILL MODAL
      ====================================================== */}

      {showViewModal &&
        selectedBill && (

          <div
            className="bill-modal-overlay"
            onMouseDown={(e) => {

              if (
                e.target ===
                e.currentTarget
              ) {

                setShowViewModal(
                  false
                );

              }

            }}
          >

            <div className="bill-modal">


              <div className="bill-modal-header">

                <div>

                  <h2>
                    Bill Details
                  </h2>

                  <p>
                    {
                      selectedBill.billNumber
                    }
                  </p>

                </div>


                <button
                  type="button"
                  onClick={() =>
                    setShowViewModal(
                      false
                    )
                  }
                >

                  <CloseRoundedIcon />

                </button>

              </div>


              <div className="bill-details-grid">


                <div>
                  <label>
                    Bill Number
                  </label>

                  <strong>
                    {
                      selectedBill.billNumber ||
                      "-"
                    }
                  </strong>
                </div>


                <div>
                  <label>
                    Vendor
                  </label>

                  <strong>
                    {
                      selectedBill.vendorName ||
                      selectedBill.vendorId ||
                      "-"
                    }
                  </strong>
                </div>


                <div>
                  <label>
                    Category
                  </label>

                  <strong>
                    {
                      selectedBill.category ||
                      "-"
                    }
                  </strong>
                </div>


                <div>
                  <label>
                    Invoice Number
                  </label>

                  <strong>
                    {
                      selectedBill.invoiceNumber ||
                      "-"
                    }
                  </strong>
                </div>


                <div>
                  <label>
                    Bill Date
                  </label>

                  <strong>
                    {formatDate(
                      selectedBill.billDate
                    )}
                  </strong>
                </div>


                <div>
                  <label>
                    Due Date
                  </label>

                  <strong>
                    {formatDate(
                      selectedBill.dueDate
                    )}
                  </strong>
                </div>


                <div>
                  <label>
                    Amount
                  </label>

                  <strong>
                    {formatCurrency(
                      selectedBill.amount
                    )}
                  </strong>
                </div>


                <div>
                  <label>
                    Status
                  </label>

                  <span
                    className={`bill-status ${getStatusClass(
                      selectedBill.status
                    )}`}
                  >
                    {
                      selectedBill.status ||
                      "-"
                    }
                  </span>
                </div>


                <div>
                  <label>
                    Payment Status
                  </label>

                  {selectedBill.status === "Approved" ? (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <Switch
                        checked={
                          String(
                            selectedBill.paymentStatus || "Pending"
                          ).toLowerCase() === "paid"
                        }
                        onChange={handlePaymentToggle}
                        disabled={savingPayment}
                      />

                      <span
                        className={`payment-status ${getStatusClass(
                          selectedBill.paymentStatus || "Pending"
                        )}`}
                      >
                        {selectedBill.paymentStatus || "Pending"}
                      </span>
                    </Box>
                  ) : (
                    <span
                      className={`payment-status ${getStatusClass(
                        selectedBill.paymentStatus
                      )}`}
                    >
                      {selectedBill.paymentStatus || "Pending"}
                    </span>
                  )}
                </div>


                <div className="bill-details-full">

                  <label>
                    Description
                  </label>

                  <p>
                    {
                      selectedBill.description ||
                      "-"
                    }
                  </p>

                </div>

                {selectedBill.status === "Approved" && (
                  <div className="bill-details-full bill-approval-details">
                    <label>Approved By</label>
                    <p>
                      <strong>Name:</strong> {selectedBill.approvedByName || employeeNames[selectedBill.approvedBy] || "-"}<br />
                      <strong>Employee ID:</strong> {selectedBill.approvedBy ?? "-"}<br />
                      <strong>Approved Date:</strong> {formatDate(selectedBill.approvedDate)}
                    </p>
                  </div>
                )}

                {selectedBill.status === "Rejected" && (
                  <div className="bill-details-full bill-rejection-details">
                    <label>Rejected By</label>
                    <p>
                      <strong>Name:</strong> {selectedBill.rejectedByName || employeeNames[selectedBill.rejectedBy] || "-"}<br />
                      <strong>Employee ID:</strong> {selectedBill.rejectedBy ?? "-"}<br />
                      <strong>Rejected Date:</strong> {formatDate(selectedBill.rejectedDate)}
                    </p>
                  </div>
                )}


              </div>


              <div className="bill-modal-footer">

                <button
                  type="button"
                  className="bill-cancel-btn"
                  onClick={handleCloseViewModal}
                  disabled={savingPayment}
                >
                  {savingPayment ? "Updating..." : "Update"}
                </button>


                {selectedBill.status !==
                  "Approved" && (

                  <button
                    type="button"
                    className="bill-save-btn"
                    onClick={() => {

                      setShowViewModal(
                        false
                      );

                      handleEditBill(
                        selectedBill
                      );

                    }}
                  >
                    Edit Bill
                  </button>

                )}

              </div>


            </div>

          </div>

        )}


      {/* ======================================================
          APPROVE / REJECT BILL MODAL - MUI
      ====================================================== */}
      <Dialog
        open={showStatusModal && !!statusBill}
        onClose={savingStatus ? undefined : closeStatusModal}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 10px 35px rgba(0, 0, 0, 0.18)",
          },
        }}
      >
        <DialogTitle
          sx={{
            px: 2.5,
            py: 1.7,
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: "18px",
                fontWeight: 700,
                color: "#1f2937",
              }}
            >
              {statusAction === "approve" ? "Approve Bill" : "Reject Bill"}
            </Typography>

            <Typography
              sx={{
                fontSize: "11px",
                fontWeight: 600,
                color: "#8ba4c7",
                mt: 0.3,
              }}
            >
              {statusBill?.billNumber || "Bill"}
            </Typography>
          </Box>

          <IconButton
            size="small"
            onClick={closeStatusModal}
            disabled={savingStatus}
            sx={{
              color: "#64748b",
              mt: -0.5,
              "&:hover": {
                backgroundColor: "#f1f5f9",
              },
            }}
          >
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{
            px: 2.5,
            py: 2,
          }}
        >
          <Typography
            sx={{
              fontSize: "14px",
              color: "#374151",
              mb: 1.5,
            }}
          >
            Are you sure you want to{" "}
            <strong>
              {statusAction === "approve" ? "approve" : "reject"}
            </strong>{" "}
            this bill?
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.7,
              flexWrap: "wrap",
              mb: 1.5,
            }}
          >
            <Typography
              sx={{
                fontSize: "14px",
                color: "#4b5563",
              }}
            >
              Action By
            </Typography>

            <Typography
              sx={{
                fontSize: "14px",
                fontWeight: 700,
                color: "#374151",
              }}
            >
              {currentEmployeeName}
            </Typography>

            <Typography
              sx={{
                fontSize: "13px",
                color: "#374151",
              }}
            >
              Employee ID: {currentEmployeeId || "-"}
            </Typography>
          </Box>

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Comment"
            placeholder={
              statusAction === "approve"
                ? "Enter approval comment"
                : "Enter rejection comment"
            }
            value={statusComment}
            onChange={(e) => setStatusComment(e.target.value)}
            disabled={savingStatus}
            size="small"
            sx={{
              "& .MuiInputLabel-root": {
                fontSize: "13px",
              },
              "& .MuiInputBase-input": {
                fontSize: "12px",
              },
              "& .MuiOutlinedInput-root": {
                borderRadius: "6px",
              },
              "& .MuiInputBase-input::placeholder": {
                color: "#9ca3af",
                opacity: 1,
              },
            }}
          />
        </DialogContent>

        <Divider />

        <DialogActions
          sx={{
            px: 2.5,
            py: 1.4,
            gap: 1,
          }}
        >
          <Button
            variant="outlined"
            size="small"
            onClick={closeStatusModal}
            disabled={savingStatus}
            sx={{
              textTransform: "none",
              fontSize: "11px",
              height: "30px",
              minWidth: "70px",
              borderRadius: "6px",
              borderColor: "#d5dce6",
              color: "#475569",
              "&:hover": {
                borderColor: "#cbd5e1",
                backgroundColor: "#f8fafc",
              },
            }}
          >
            Cancel
          </Button>

          <Button
            variant="outlined"
            size="small"
            onClick={handleBillStatus}
            disabled={savingStatus}
            sx={{
              textTransform: "none",
              fontSize: "11px",
              height: "30px",
              minWidth: statusAction === "approve" ? "95px" : "90px",
              borderRadius: "6px",
              ...(statusAction === "approve"
                ? {
                    borderColor: "#86efac",
                    backgroundColor: "#ecfdf5",
                    color: "#047857",
                    "&:hover": {
                      borderColor: "#4ade80",
                      backgroundColor: "#d1fae5",
                    },
                  }
                : {
                    borderColor: "#fca5a5",
                    backgroundColor: "#fff1f2",
                    color: "#dc2626",
                    "&:hover": {
                      borderColor: "#f87171",
                      backgroundColor: "#ffe4e6",
                    },
                  }),
            }}
          >
            {savingStatus
              ? "Saving..."
              : statusAction === "approve"
                ? "Approve Bill"
                : "Reject Bill"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ======================================================
          EDIT BILL MODAL
      ====================================================== */}

      {showEditModal &&
        selectedBill && (

          <div
            className="bill-modal-overlay"
            onMouseDown={(e) => {

              if (
                e.target ===
                e.currentTarget &&
                !savingBill
              ) {

                setShowEditModal(
                  false
                );

              }

            }}
          >

            <div className="bill-modal">


              <div className="bill-modal-header">

                <div>

                  <h2>
                    Edit Bill
                  </h2>

                  <p>
                    {
                      selectedBill.billNumber
                    }
                  </p>

                </div>


                <button
                  type="button"
                  onClick={() =>
                    setShowEditModal(
                      false
                    )
                  }
                  disabled={savingBill}
                >

                  <CloseRoundedIcon />

                </button>

              </div>


              <form
                onSubmit={
                  handleUpdateBill
                }
              >

                <div className="bill-form-grid">


                  <div className="bill-form-group">

                    <label>
                      Bill Number *
                    </label>

                    <input
                      type="text"
                      name="billNumber"
                      value={
                        billForm.billNumber
                      }
                      onChange={
                        handleBillFormChange
                      }
                    />

                  </div>


                  <div className="bill-form-group">

                    <label>
                      Vendor *
                    </label>

                    <select
                      name="vendorId"
                      value={billForm.vendorId}
                      onChange={
                        handleBillFormChange
                      }
                    >
                      <option value="">
                        Select Vendor
                      </option>

                      {vendors.map((vendor) => (
                        <option
                          key={vendor.vendorId}
                          value={vendor.vendorId}
                        >
                          {vendor.vendorName}
                        </option>
                      ))}
                    </select>

                  </div>


                  <div className="bill-form-group">

                    <label>
                      Category *
                    </label>

                    <input
                      type="text"
                      name="category"
                      value={
                        billForm.category
                      }
                      onChange={
                        handleBillFormChange
                      }
                    />

                  </div>


                  <div className="bill-form-group">

                    <label>
                      Invoice Number
                    </label>

                    <input
                      type="text"
                      name="invoiceNumber"
                      value={
                        billForm.invoiceNumber
                      }
                      onChange={
                        handleBillFormChange
                      }
                    />

                  </div>


                  <div className="bill-form-group">

                    <label>
                      Bill Date *
                    </label>

                    <input
                      type="date"
                      name="billDate"
                      value={
                        billForm.billDate
                      }
                      onChange={
                        handleBillFormChange
                      }
                    />

                  </div>


                  <div className="bill-form-group">

                    <label>
                      Due Date *
                    </label>

                    <input
                      type="date"
                      name="dueDate"
                      value={
                        billForm.dueDate
                      }
                      onChange={
                        handleBillFormChange
                      }
                    />

                  </div>


                  <div className="bill-form-group">

                    <label>
                      Amount *
                    </label>

                    <input
                      type="number"
                      name="amount"
                      value={
                        billForm.amount
                      }
                      onChange={
                        handleBillFormChange
                      }
                      min="0.01"
                      step="0.01"
                    />

                  </div>


                  <div className="bill-form-group bill-form-full">

                    <label>
                      Description
                    </label>

                    <textarea
                      name="description"
                      value={
                        billForm.description
                      }
                      onChange={
                        handleBillFormChange
                      }
                      rows="4"
                    />

                  </div>


                </div>


                <div className="bill-modal-footer">

                  <button
                    type="button"
                    className="bill-cancel-btn"
                    onClick={() =>
                      setShowEditModal(
                        false
                      )
                    }
                    disabled={savingBill}
                  >
                    Cancel
                  </button>


                  <button
                    type="submit"
                    className="bill-save-btn"
                    disabled={savingBill}
                  >

                    {savingBill
                      ? "Saving..."
                      : "Save Changes"}

                  </button>

                </div>


              </form>

            </div>

          </div>

        )}


      {/* ======================================================
          ALL ACTIVITIES
      ====================================================== */}

      {showAllActivities && (

        <div
          className="bill-modal-overlay"
          onMouseDown={(e) => {

            if (
              e.target ===
              e.currentTarget
            ) {

              setShowAllActivities(
                false
              );

            }

          }}
        >

          <div className="bill-modal">


            <div className="bill-modal-header">

              <div>

                <h2>
                  Recent Activity
                </h2>

                <p>
                  Bill activity history
                </p>

              </div>


              <button
                type="button"
                onClick={() =>
                  setShowAllActivities(
                    false
                  )
                }
              >

                <CloseRoundedIcon />

              </button>

            </div>


            <div className="activity-list activity-modal-list">


              {activities.length === 0 ? (

                <div className="activity-item empty-activity">

                  <span>
                    No activity found.
                  </span>

                </div>

              ) : (

                activities.map(
                  (activity) => (

                    <button
                      type="button"
                      className="activity-item activity-clickable"
                      key={
                        activity.billActivityId
                      }
                      onClick={() => {

                        const bill =
                          bills.find(
                            (item) =>
                              item.billId ===
                              activity.billId
                          );


                        if (bill) {

                          setShowAllActivities(
                            false
                          );

                          handleViewBill(
                            bill
                          );

                        }

                      }}
                    >

                      <i
                        className={`activity-dot ${getActivityDotClass(
                          activity.activityType
                        )}`}
                      />

                      <span>
                        {
                          activity.description
                        }
                      </span>

                      <small>
                        {formatActivityTime(
                          activity.createdDate
                        )}
                      </small>

                    </button>

                  )
                )

              )}

            </div>


            <div className="bill-modal-footer">

              <button
                type="button"
                className="bill-cancel-btn"
                onClick={() =>
                  setShowAllActivities(
                    false
                  )
                }
              >
                Close
              </button>

            </div>


          </div>

        </div>

      )}


      {/* ======================================================
          VENDOR FORM MODAL
      ====================================================== */}

      {showVendorForm && (
        <VendorForm
          onClose={() => setShowVendorForm(false)}
          onSaved={async () => {
            setShowVendorForm(false);
            await loadVendors();
          }}
        />
      )}


    </div>




  );

};


export default Bill;
