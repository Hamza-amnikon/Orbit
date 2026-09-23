import axios from "axios";

// ============================================================
// API CONFIGURATION
// ============================================================

const API_BASE_URL =
  "https://sparkapi.amnikontechnologies.com:7282/api/reimbursements";

// ============================================================
// AXIOS INSTANCE
// ============================================================
//
// IMPORTANT:
// Do NOT set Content-Type globally.
//
// JSON requests will automatically use:
// application/json
//
// FormData requests will automatically use:
// multipart/form-data; boundary=...
//
// The browser/Axios creates the boundary automatically.
// ============================================================

const reimbursementApi = axios.create({
  baseURL: API_BASE_URL,
});

// ============================================================
// ERROR HELPER
// ============================================================

const getErrorMessage = (
  error,
  fallbackMessage = "Something went wrong."
) => {
  const responseData = error?.response?.data;

  // ----------------------------------------------------------
  // Normal JSON API error
  // ----------------------------------------------------------

  if (responseData?.message) {
    return responseData.message;
  }

  if (responseData?.error) {
    return responseData.error;
  }

  // ----------------------------------------------------------
  // ASP.NET validation response
  // ----------------------------------------------------------

  if (responseData?.errors) {
    const validationErrors = Object.values(
      responseData.errors
    )
      .flat()
      .filter(Boolean);

    if (validationErrors.length > 0) {
      return validationErrors.join(" ");
    }
  }

  // ----------------------------------------------------------
  // Blob response
  // ----------------------------------------------------------

  if (responseData instanceof Blob) {
    return fallbackMessage;
  }

  // ----------------------------------------------------------
  // Plain response text
  // ----------------------------------------------------------

  if (
    typeof responseData === "string" &&
    responseData.trim()
  ) {
    return responseData;
  }

  // ----------------------------------------------------------
  // Axios error
  // ----------------------------------------------------------

  if (error?.message) {
    return error.message;
  }

  return fallbackMessage;
};

// ============================================================
// VALIDATE PDF
// ============================================================

const validatePdfFile = (file) => {
  if (!file) {
    throw new Error("Please select a PDF receipt.");
  }

  const fileName = file.name || "";

  const extensionIsPdf =
    fileName.toLowerCase().endsWith(".pdf");

  // Some browsers may return an empty MIME type.
  // application/octet-stream is also accepted for PDF files.

  const mimeIsPdf =
    !file.type ||
    file.type === "application/pdf" ||
    file.type === "application/octet-stream";

  if (!extensionIsPdf || !mimeIsPdf) {
    throw new Error(
      "Only PDF files are allowed for reimbursement receipts."
    );
  }

  // Maximum 10 MB

  const MAX_FILE_SIZE =
    10 * 1024 * 1024;

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      "PDF file size cannot exceed 10 MB."
    );
  }

  return true;
};

// ============================================================
// GET ALL REIMBURSEMENTS
// GET /api/reimbursements
// ============================================================

export const getReimbursements = async (
  params = {}
) => {
  try {
    const response =
      await reimbursementApi.get("", {
        params: {
          status:
            params.status &&
            params.status !== "All"
              ? params.status
              : undefined,

          search:
            params.search?.trim() ||
            undefined,
        },
      });

    return response.data;

  } catch (error) {
    console.error(
      "Error fetching reimbursements:",
      error.response?.data ||
      error.message
    );

    throw new Error(
      getErrorMessage(
        error,
        "Failed to fetch reimbursements."
      )
    );
  }
};

// ============================================================
// GET REIMBURSEMENT BY ID
// GET /api/reimbursements/{id}
// ============================================================

export const getReimbursementById =
  async (id) => {

    if (!id) {
      throw new Error(
        "Reimbursement ID is required."
      );
    }

    try {
      const response =
        await reimbursementApi.get(
          `/${id}`
        );

      return response.data;

    } catch (error) {
      console.error(
        "Error fetching reimbursement:",
        error.response?.data ||
        error.message
      );

      throw new Error(
        getErrorMessage(
          error,
          "Failed to fetch reimbursement."
        )
      );
    }
  };

// ============================================================
// CREATE REIMBURSEMENT
// POST /api/reimbursements
// ============================================================
//
// Backend expects:
//
// multipart/form-data
//
// Fields:
//
// EmployeeId
// EmployeeName
// Category
// Amount
// ExpenseDate
// Description
// SubmittedDate
// Receipt
//
// ============================================================

export const createReimbursement =
  async (reimbursementData) => {

    try {

      // ------------------------------------------------------
      // VALIDATE DATA OBJECT
      // ------------------------------------------------------

      if (!reimbursementData) {
        throw new Error(
          "Reimbursement data is required."
        );
      }

      console.log(
        "Original reimbursement data:",
        reimbursementData
      );

      // ------------------------------------------------------
      // FIND RECEIPT FILE
      // ------------------------------------------------------

      const receiptFile =
        reimbursementData.receiptFile ||
        reimbursementData.file ||
        reimbursementData.receipt ||
        null;

      // ------------------------------------------------------
      // VALIDATE RECEIPT
      // ------------------------------------------------------

      if (receiptFile) {
        validatePdfFile(receiptFile);
      }

      // ------------------------------------------------------
      // BUILD FORM DATA
      // ------------------------------------------------------

      const formData = new FormData();

      // ------------------------------------------------------
      // EMPLOYEE ID
      // ------------------------------------------------------

      const employeeId =
        reimbursementData.employeeId ??
        reimbursementData.EmployeeId ??
        reimbursementData.employee?.employeeId ??
        reimbursementData.employee?.EmployeeId ??
        reimbursementData.Employee?.employeeId ??
        reimbursementData.Employee?.EmployeeId ??
        "";

      if (
        employeeId === "" ||
        employeeId === null ||
        employeeId === undefined ||
        Number.isNaN(Number(employeeId))
      ) {
        throw new Error(
          "Employee ID is required. Please make sure the logged-in employee ID is available before submitting the reimbursement."
        );
      }

      formData.append(
        "EmployeeId",
        String(employeeId)
      );

      // ------------------------------------------------------
      // EMPLOYEE NAME
      // ------------------------------------------------------
      //
      // Support common employee/profile structures.
      //
      // ------------------------------------------------------

      const employeeName =
        reimbursementData.employeeName ??
        reimbursementData.EmployeeName ??
        reimbursementData.employeeFullName ??
        reimbursementData.EmployeeFullName ??
        reimbursementData.fullName ??
        reimbursementData.FullName ??
        reimbursementData.name ??
        reimbursementData.Name ??
        reimbursementData.employee?.employeeName ??
        reimbursementData.employee?.EmployeeName ??
        reimbursementData.employee?.fullName ??
        reimbursementData.employee?.FullName ??
        reimbursementData.employee?.displayName ??
        reimbursementData.employee?.DisplayName ??
        reimbursementData.Employee?.employeeName ??
        reimbursementData.Employee?.EmployeeName ??
        reimbursementData.Employee?.fullName ??
        reimbursementData.Employee?.FullName ??
        reimbursementData.Employee?.displayName ??
        reimbursementData.Employee?.DisplayName ??
        "";

      const cleanedEmployeeName =
        String(employeeName).trim();

      if (!cleanedEmployeeName) {
        throw new Error(
          "Employee name is required. Please make sure the logged-in employee name is available before submitting the reimbursement."
        );
      }

      formData.append(
        "EmployeeName",
        cleanedEmployeeName
      );

      // ------------------------------------------------------
      // CATEGORY
      // ------------------------------------------------------

      const category =
        reimbursementData.category ??
        reimbursementData.Category ??
        "";

      const cleanedCategory =
        String(category).trim();

      if (!cleanedCategory) {
        throw new Error(
          "Reimbursement category is required."
        );
      }

      formData.append(
        "Category",
        cleanedCategory
      );

      // ------------------------------------------------------
      // AMOUNT
      // ------------------------------------------------------

      const amount =
        reimbursementData.amount ??
        reimbursementData.Amount ??
        "";

      if (
        amount === "" ||
        amount === null ||
        amount === undefined ||
        Number(amount) <= 0
      ) {
        throw new Error(
          "Reimbursement amount must be greater than zero."
        );
      }

      formData.append(
        "Amount",
        String(amount)
      );

      // ------------------------------------------------------
      // EXPENSE DATE
      // ------------------------------------------------------

      const expenseDate =
        reimbursementData.expenseDate ??
        reimbursementData.ExpenseDate ??
        "";

      if (expenseDate) {
        formData.append(
          "ExpenseDate",
          String(expenseDate)
        );
      }

      // ------------------------------------------------------
      // DESCRIPTION
      // ------------------------------------------------------

      const description =
        reimbursementData.description ??
        reimbursementData.Description ??
        "";

      formData.append(
        "Description",
        String(description)
      );

      // ------------------------------------------------------
      // SUBMITTED DATE
      // ------------------------------------------------------

      const submittedDate =
        reimbursementData.submittedDate ??
        reimbursementData.SubmittedDate ??
        new Date().toISOString();

      formData.append(
        "SubmittedDate",
        String(submittedDate)
      );

      // ------------------------------------------------------
      // RECEIPT
      // ------------------------------------------------------

      if (receiptFile) {
        formData.append(
          "Receipt",
          receiptFile
        );
      }

      // ------------------------------------------------------
      // DEBUG
      // ------------------------------------------------------

      console.log(
        "=========================================="
      );

      console.log(
        "Creating reimbursement with FormData:"
      );

      console.log(
        "=========================================="
      );

      for (
        const [key, value]
        of formData.entries()
      ) {
        console.log(
          `FormData ${key}:`,
          value instanceof File
            ? value.name
            : value
        );
      }

      console.log(
        "=========================================="
      );

      // ------------------------------------------------------
      // POST
      // ------------------------------------------------------
      //
      // IMPORTANT:
      //
      // DO NOT manually set Content-Type.
      //
      // Axios/browser automatically creates:
      //
      // multipart/form-data;
      // boundary=----------------...
      //
      // ASP.NET Core requires the boundary.
      //
      // ------------------------------------------------------

      const response =
        await reimbursementApi.post(
          "",
          formData
        );

      return response.data;

    } catch (error) {

      console.error(
        "Error creating reimbursement:",
        error.response?.data ||
        error.message
      );

      // ------------------------------------------------------
      // SHOW ASP.NET VALIDATION ERRORS
      // ------------------------------------------------------

      if (error.response?.data?.errors) {
        console.error(
          "Backend validation errors:",
          error.response.data.errors
        );
      }

      throw new Error(
        getErrorMessage(
          error,
          "Failed to create reimbursement."
        )
      );
    }
  };

// ============================================================
// UPLOAD RECEIPT
// POST /api/reimbursements/{id}/receipt
// ============================================================
//
// This function is available when the receipt needs to be
// uploaded separately after the reimbursement is created.
//
// ============================================================

export const uploadReceipt =
  async (id, file) => {

    if (!id) {
      throw new Error(
        "Reimbursement ID is required."
      );
    }

    validatePdfFile(file);

    try {

      const formData =
        new FormData();

      // Backend parameter:
      // IFormFile? file

      formData.append(
        "file",
        file
      );

      // Do NOT manually set Content-Type.

      const response =
        await reimbursementApi.post(
          `/${id}/receipt`,
          formData
        );

      return response.data;

    } catch (error) {

      console.error(
        "Error uploading receipt:",
        error.response?.data ||
        error.message
      );

      throw new Error(
        getErrorMessage(
          error,
          "Failed to upload PDF receipt."
        )
      );
    }
  };

// ============================================================
// UPDATE REIMBURSEMENT
// PUT /api/reimbursements/{id}
// ============================================================

export const updateReimbursement =
  async (
    id,
    reimbursementData
  ) => {

    if (!id) {
      throw new Error(
        "Reimbursement ID is required."
      );
    }

    try {

      const payload = {
        category:
          reimbursementData.category ??
          reimbursementData.Category ??
          "",

        amount:
          reimbursementData.amount ??
          reimbursementData.Amount ??
          0,

        description:
          reimbursementData.description ??
          reimbursementData.Description ??
          null,
      };

      const response =
        await reimbursementApi.put(
          `/${id}`,
          payload
        );

      return response.data;

    } catch (error) {

      console.error(
        "Error updating reimbursement:",
        error.response?.data ||
        error.message
      );

      throw new Error(
        getErrorMessage(
          error,
          "Failed to update reimbursement."
        )
      );
    }
  };

// ============================================================
// DELETE REIMBURSEMENT
// DELETE /api/reimbursements/{id}
// ============================================================

export const deleteReimbursement =
  async (id) => {

    if (!id) {
      throw new Error(
        "Reimbursement ID is required."
      );
    }

    try {

      const response =
        await reimbursementApi.delete(
          `/${id}`
        );

      return response.data;

    } catch (error) {

      console.error(
        "Error deleting reimbursement:",
        error.response?.data ||
        error.message
      );

      throw new Error(
        getErrorMessage(
          error,
          "Failed to delete reimbursement."
        )
      );
    }
  };

// ============================================================
// CHANGE REIMBURSEMENT STATUS
// PATCH /api/reimbursements/{id}/status
// ============================================================
//
// Supported:
//
// Pending
// Approved
// Rejected
//
// ============================================================

export const updateReimbursementStatus =
  async (
    id,
    status,
    remarks = null
  ) => {

    if (!id) {
      throw new Error(
        "Reimbursement ID is required."
      );
    }

    if (!status) {
      throw new Error(
        "Reimbursement status is required."
      );
    }

    try {

      const response =
        await reimbursementApi.patch(
          `/${id}/status`,
          {
            status,
            remarks,
          }
        );

      return response.data;

    } catch (error) {

      console.error(
        "Error updating reimbursement status:",
        error.response?.data ||
        error.message
      );

      throw new Error(
        getErrorMessage(
          error,
          "Failed to update reimbursement status."
        )
      );
    }
  };

// ============================================================
// APPROVE REIMBURSEMENT
// ============================================================

export const approveReimbursement =
  async (
    id,
    remarks = "Approved by HR"
  ) => {

    return updateReimbursementStatus(
      id,
      "Approved",
      remarks
    );
  };

// ============================================================
// REJECT REIMBURSEMENT
// ============================================================

export const rejectReimbursement =
  async (
    id,
    remarks = "Rejected by HR"
  ) => {

    return updateReimbursementStatus(
      id,
      "Rejected",
      remarks
    );
  };

// ============================================================
// SET PENDING
// ============================================================

export const setReimbursementPending =
  async (
    id,
    remarks = null
  ) => {

    return updateReimbursementStatus(
      id,
      "Pending",
      remarks
    );
  };

// ============================================================
// GET SUMMARY
// GET /api/reimbursements/summary
// ============================================================

export const getReimbursementSummary =
  async () => {

    try {

      const response =
        await reimbursementApi.get(
          "/summary"
        );

      return response.data;

    } catch (error) {

      console.error(
        "Error fetching reimbursement summary:",
        error.response?.data ||
        error.message
      );

      throw new Error(
        getErrorMessage(
          error,
          "Failed to fetch reimbursement summary."
        )
      );
    }
  };

// ============================================================
// GET EMPLOYEE REIMBURSEMENTS
// GET /api/reimbursements/employee/{employeeId}
// ============================================================

export const getEmployeeReimbursements =
  async (employeeId) => {

    if (!employeeId) {
      throw new Error(
        "Employee ID is required."
      );
    }

    try {

      const response =
        await reimbursementApi.get(
          `/employee/${employeeId}`
        );

      return response.data;

    } catch (error) {

      console.error(
        "Error fetching employee reimbursements:",
        error.response?.data ||
        error.message
      );

      throw new Error(
        getErrorMessage(
          error,
          "Failed to fetch employee reimbursements."
        )
      );
    }
  };

// ============================================================
// RECEIPT VIEW URL
// GET /api/reimbursements/{id}/receipt
// ============================================================

export const getReceiptUrl =
  (id) => {

    if (!id) {
      return null;
    }

    return `${API_BASE_URL}/${id}/receipt`;
  };

// ============================================================
// RECEIPT DOWNLOAD URL
// GET /api/reimbursements/{id}/receipt?download=true
// ============================================================

export const getReceiptDownloadUrl =
  (id) => {

    if (!id) {
      return null;
    }

    return `${API_BASE_URL}/${id}/receipt?download=true`;
  };

// ============================================================
// VIEW RECEIPT
// ============================================================
//
// Opens PDF in a new browser tab.
//
// ============================================================

export const viewReceipt =
  (id) => {

    if (!id) {
      throw new Error(
        "Reimbursement ID is required."
      );
    }

    const url =
      getReceiptUrl(id);

    if (!url) {
      throw new Error(
        "Receipt URL could not be generated."
      );
    }

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );

    return url;
  };

// ============================================================
// DOWNLOAD RECEIPT
// ============================================================
//
// Downloads actual PDF as Blob.
//
// ============================================================

export const downloadReceipt =
  async (
    id,
    fileName = "receipt.pdf"
  ) => {

    if (!id) {
      throw new Error(
        "Reimbursement ID is required."
      );
    }

    try {

      const response =
        await reimbursementApi.get(
          `/${id}/receipt`,
          {
            params: {
              download: true,
            },

            responseType: "blob",
          }
        );

      const blob =
        new Blob(
          [response.data],
          {
            type:
              response.headers[
                "content-type"
              ] ||
              "application/pdf",
          }
        );

      const url =
        window.URL.createObjectURL(
          blob
        );

      const link =
        document.createElement("a");

      link.href = url;

      link.download =
        fileName ||
        "receipt.pdf";

      document.body.appendChild(
        link
      );

      link.click();

      document.body.removeChild(
        link
      );

      window.URL.revokeObjectURL(
        url
      );

      return true;

    } catch (error) {

      console.error(
        "Error downloading receipt:",
        error.response?.data ||
        error.message
      );

      throw new Error(
        getErrorMessage(
          error,
          "Failed to download PDF receipt."
        )
      );
    }
  };

// ============================================================
// GET RECEIPT AS BLOB
// ============================================================
//
// Useful for displaying PDF inside a modal/iframe.
//
// ============================================================

export const getReceiptBlob =
  async (id) => {

    if (!id) {
      throw new Error(
        "Reimbursement ID is required."
      );
    }

    try {

      const response =
        await reimbursementApi.get(
          `/${id}/receipt`,
          {
            responseType: "blob",
          }
        );

      return response.data;

    } catch (error) {

      console.error(
        "Error loading receipt:",
        error.response?.data ||
        error.message
      );

      throw new Error(
        getErrorMessage(
          error,
          "Failed to load PDF receipt."
        )
      );
    }
  };

// ============================================================
// GET RECEIPT BLOB URL
// ============================================================
//
// Useful for:
//
// <iframe src={url} />
//
// <embed src={url} />
//
// ============================================================

export const getReceiptBlobUrl =
  async (id) => {

    const blob =
      await getReceiptBlob(id);

    return window.URL.createObjectURL(
      blob
    );
  };

// ============================================================
// CHECK WHETHER RECEIPT EXISTS
// ============================================================
//
// Uses GET because backend exposes:
//
// GET /{id}/receipt
//
// ============================================================

export const checkReceiptExists =
  async (id) => {

    if (!id) {
      return false;
    }

    try {

      const response =
        await reimbursementApi.get(
          `/${id}/receipt`,
          {
            responseType: "blob",
          }
        );

      return (
        response.status >= 200 &&
        response.status < 300
      );

    } catch (error) {

      console.error(
        "Receipt does not exist:",
        error.response?.data ||
        error.message
      );

      return false;
    }
  };

// ============================================================
// CHECK RECEIPT INFORMATION
// ============================================================
//
// Does not make an API request.
//
// ============================================================

export const hasReceipt =
  (reimbursement) => {

    if (!reimbursement) {
      return false;
    }

    return Boolean(
      reimbursement.receiptFileName ||
      reimbursement.ReceiptFileName ||
      reimbursement.receiptFilePath ||
      reimbursement.ReceiptFilePath
    );
  };

// ============================================================
// GET RECEIPT FILE NAME
// ============================================================

export const getReceiptFileName =
  (reimbursement) => {

    if (!reimbursement) {
      return "";
    }

    return (
      reimbursement.receiptFileName ||
      reimbursement.ReceiptFileName ||
      ""
    );
  };

// ============================================================
// DEFAULT EXPORT
// ============================================================

const ReimbursementService = {

  // CRUD
  getReimbursements,
  getReimbursementById,
  createReimbursement,
  updateReimbursement,
  deleteReimbursement,

  // Receipt upload
  uploadReceipt,

  // Status
  updateReimbursementStatus,
  approveReimbursement,
  rejectReimbursement,
  setReimbursementPending,

  // Summary
  getReimbursementSummary,

  // Employee
  getEmployeeReimbursements,

  // Receipt URLs
  getReceiptUrl,
  getReceiptDownloadUrl,

  // Receipt actions
  viewReceipt,
  downloadReceipt,
  getReceiptBlob,
  getReceiptBlobUrl,
  checkReceiptExists,

  // Receipt helpers
  hasReceipt,
  getReceiptFileName,
};

export default ReimbursementService;