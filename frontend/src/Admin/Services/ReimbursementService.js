import axios from "axios";

// ============================================================
// API CONFIGURATION
// ============================================================

const API_BASE_URL = "http://localhost:5182/api/reimbursements";

// ============================================================
// AXIOS INSTANCE
// ============================================================

const reimbursementApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ============================================================
// ERROR HELPER
// ============================================================

const getErrorMessage = (error, fallbackMessage = "Something went wrong.") => {
  const responseData = error?.response?.data;

  // Normal JSON API error
  if (responseData?.message) {
    return responseData.message;
  }

  if (responseData?.error) {
    return responseData.error;
  }

  // Axios blob response
  if (responseData instanceof Blob) {
    return fallbackMessage;
  }

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

  const extensionIsPdf = fileName.toLowerCase().endsWith(".pdf");

  const mimeIsPdf = !file.type || file.type === "application/pdf";

  if (!extensionIsPdf || !mimeIsPdf) {
    throw new Error("Only PDF files are allowed for reimbursement receipts.");
  }

  // Maximum 10 MB
  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("PDF file size cannot exceed 10 MB.");
  }

  return true;
};

// ============================================================
// GET ALL REIMBURSEMENTS
// GET /api/reimbursements
// ============================================================

export const getReimbursements = async (params = {}) => {
  try {
    const response = await reimbursementApi.get("", {
      params: {
        status:
          params.status && params.status !== "All" ? params.status : undefined,

        search: params.search?.trim() || undefined,
      },
    });

    return response.data;
  } catch (error) {
    console.error(
      "Error fetching reimbursements:",
      error.response?.data || error.message,
    );

    throw new Error(getErrorMessage(error, "Failed to fetch reimbursements."));
  }
};

// ============================================================
// GET REIMBURSEMENT BY ID
// GET /api/reimbursements/{id}
// ============================================================

export const getReimbursementById = async (id) => {
  if (!id) {
    throw new Error("Reimbursement ID is required.");
  }

  try {
    const response = await reimbursementApi.get(`/${id}`);

    return response.data;
  } catch (error) {
    console.error(
      "Error fetching reimbursement:",
      error.response?.data || error.message,
    );

    throw new Error(getErrorMessage(error, "Failed to fetch reimbursement."));
  }
};

// ============================================================
// CREATE REIMBURSEMENT
//
// POST /api/reimbursements
//
// Creates the reimbursement first.
//
// If receiptFile is supplied, the actual PDF is then uploaded
// using:
//
// POST /api/reimbursements/{id}/receipt
// ============================================================

export const createReimbursement = async (reimbursementData) => {
  try {
    if (!reimbursementData) {
      throw new Error("Reimbursement data is required.");
    }

    // --------------------------------------------------------
    // Find PDF file
    // --------------------------------------------------------

    const receiptFile =
      reimbursementData.receiptFile ||
      reimbursementData.file ||
      reimbursementData.receipt ||
      null;

    // --------------------------------------------------------
    // Validate PDF before creating reimbursement
    // --------------------------------------------------------

    if (receiptFile) {
      validatePdfFile(receiptFile);
    }

    // --------------------------------------------------------
    // IMPORTANT:
    // Do NOT send File object as JSON.
    // --------------------------------------------------------

    const payload = {
      employeeId:
        reimbursementData.employeeId ?? reimbursementData.EmployeeId ?? null,

      employeeName:
        reimbursementData.employeeName ?? reimbursementData.EmployeeName ?? "",

      category: reimbursementData.category ?? reimbursementData.Category ?? "",

      amount: reimbursementData.amount ?? reimbursementData.Amount ?? 0,

      description:
        reimbursementData.description ?? reimbursementData.Description ?? null,

      submittedDate:
        reimbursementData.submittedDate ??
        reimbursementData.SubmittedDate ??
        null,
    };

    // --------------------------------------------------------
    // CREATE REIMBURSEMENT
    // --------------------------------------------------------

    const response = await reimbursementApi.post("", payload);

    const createdData = response.data;

    // --------------------------------------------------------
    // Find created reimbursement
    // --------------------------------------------------------

    const createdReimbursement = createdData?.data || createdData;

    const reimbursementId =
      createdReimbursement?.id ?? createdReimbursement?.Id;

    if (!reimbursementId) {
      throw new Error(
        "Reimbursement was created but no reimbursement ID was returned.",
      );
    }

    // --------------------------------------------------------
    // UPLOAD PDF
    // --------------------------------------------------------

    let uploadResult = null;

    if (receiptFile) {
      uploadResult = await uploadReceipt(reimbursementId, receiptFile);
    }

    // --------------------------------------------------------
    // Return combined result
    // --------------------------------------------------------

    return {
      ...createdData,

      data: {
        ...createdReimbursement,

        ...(uploadResult?.data || {}),

        receiptUploaded: Boolean(receiptFile),
      },
    };
  } catch (error) {
    console.error(
      "Error creating reimbursement:",
      error.response?.data || error.message,
    );

    throw new Error(getErrorMessage(error, "Failed to create reimbursement."));
  }
};

// ============================================================
// UPLOAD RECEIPT
//
// POST /api/reimbursements/{id}/receipt
//
// PDF ONLY
// ============================================================

export const uploadReceipt = async (id, file) => {
  if (!id) {
    throw new Error("Reimbursement ID is required.");
  }

  validatePdfFile(file);

  try {
    const formData = new FormData();

    // IMPORTANT:
    // Backend parameter is named "file"
    formData.append("file", file);

    const response = await reimbursementApi.post(`/${id}/receipt`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    console.error(
      "Error uploading receipt:",
      error.response?.data || error.message,
    );

    throw new Error(getErrorMessage(error, "Failed to upload PDF receipt."));
  }
};

// ============================================================
// UPDATE REIMBURSEMENT
// PUT /api/reimbursements/{id}
// ============================================================

export const updateReimbursement = async (id, reimbursementData) => {
  if (!id) {
    throw new Error("Reimbursement ID is required.");
  }

  try {
    const payload = {
      category: reimbursementData.category ?? reimbursementData.Category ?? "",

      amount: reimbursementData.amount ?? reimbursementData.Amount ?? 0,

      description:
        reimbursementData.description ?? reimbursementData.Description ?? null,
    };

    const response = await reimbursementApi.put(`/${id}`, payload);

    return response.data;
  } catch (error) {
    console.error(
      "Error updating reimbursement:",
      error.response?.data || error.message,
    );

    throw new Error(getErrorMessage(error, "Failed to update reimbursement."));
  }
};

// ============================================================
// DELETE REIMBURSEMENT
// DELETE /api/reimbursements/{id}
// ============================================================

export const deleteReimbursement = async (id) => {
  if (!id) {
    throw new Error("Reimbursement ID is required.");
  }

  try {
    const response = await reimbursementApi.delete(`/${id}`);

    return response.data;
  } catch (error) {
    console.error(
      "Error deleting reimbursement:",
      error.response?.data || error.message,
    );

    throw new Error(getErrorMessage(error, "Failed to delete reimbursement."));
  }
};

// ============================================================
// CHANGE REIMBURSEMENT STATUS
//
// PATCH /api/reimbursements/{id}/status
//
// Pending
// Approved
// Rejected
// ============================================================

export const updateReimbursementStatus = async (id, status, remarks = null) => {
  if (!id) {
    throw new Error("Reimbursement ID is required.");
  }

  if (!status) {
    throw new Error("Reimbursement status is required.");
  }

  try {
    const response = await reimbursementApi.patch(`/${id}/status`, {
      status,
      remarks,
    });

    return response.data;
  } catch (error) {
    console.error(
      "Error updating reimbursement status:",
      error.response?.data || error.message,
    );

    throw new Error(
      getErrorMessage(error, "Failed to update reimbursement status."),
    );
  }
};

// ============================================================
// APPROVE REIMBURSEMENT
// ============================================================

export const approveReimbursement = async (id, remarks = "Approved by HR") => {
  return updateReimbursementStatus(id, "Approved", remarks);
};

// ============================================================
// REJECT REIMBURSEMENT
// ============================================================

export const rejectReimbursement = async (id, remarks = "Rejected by HR") => {
  return updateReimbursementStatus(id, "Rejected", remarks);
};

// ============================================================
// SET PENDING
// ============================================================

export const setReimbursementPending = async (id, remarks = null) => {
  return updateReimbursementStatus(id, "Pending", remarks);
};

// ============================================================
// GET SUMMARY
// GET /api/reimbursements/summary
// ============================================================

export const getReimbursementSummary = async () => {
  try {
    const response = await reimbursementApi.get("/summary");

    return response.data;
  } catch (error) {
    console.error(
      "Error fetching reimbursement summary:",
      error.response?.data || error.message,
    );

    throw new Error(
      getErrorMessage(error, "Failed to fetch reimbursement summary."),
    );
  }
};

// ============================================================
// GET EMPLOYEE REIMBURSEMENTS
// GET /api/reimbursements/employee/{employeeId}
// ============================================================

export const getEmployeeReimbursements = async (employeeId) => {
  if (!employeeId) {
    throw new Error("Employee ID is required.");
  }

  try {
    const response = await reimbursementApi.get(`/employee/${employeeId}`);

    return response.data;
  } catch (error) {
    console.error(
      "Error fetching employee reimbursements:",
      error.response?.data || error.message,
    );

    throw new Error(
      getErrorMessage(error, "Failed to fetch employee reimbursements."),
    );
  }
};

// ============================================================
// RECEIPT VIEW URL
//
// GET /api/reimbursements/{id}/receipt
//
// Opens PDF in browser.
// ============================================================

export const getReceiptUrl = (id) => {
  if (!id) {
    return null;
  }

  return `${API_BASE_URL}/${id}/receipt`;
};

// ============================================================
// RECEIPT DOWNLOAD URL
//
// GET /api/reimbursements/{id}/receipt?download=true
// ============================================================

export const getReceiptDownloadUrl = (id) => {
  if (!id) {
    return null;
  }

  return `${API_BASE_URL}/${id}/receipt?download=true`;
};

// ============================================================
// VIEW RECEIPT
//
// Opens PDF in a new browser tab.
//
// IMPORTANT:
// The backend must return the actual PDF.
// ============================================================

export const viewReceipt = (id) => {
  if (!id) {
    throw new Error("Reimbursement ID is required.");
  }

  const url = getReceiptUrl(id);

  if (!url) {
    throw new Error("Receipt URL could not be generated.");
  }

  window.open(url, "_blank", "noopener,noreferrer");

  return url;
};

// ============================================================
// DOWNLOAD RECEIPT
//
// Downloads actual PDF as Blob.
// ============================================================

export const downloadReceipt = async (id, fileName = "receipt.pdf") => {
  if (!id) {
    throw new Error("Reimbursement ID is required.");
  }

  try {
    const response = await reimbursementApi.get(`/${id}/receipt`, {
      params: {
        download: true,
      },

      responseType: "blob",
    });

    const blob = new Blob([response.data], {
      type: response.headers["content-type"] || "application/pdf",
    });

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = fileName || "receipt.pdf";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    window.URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error(
      "Error downloading receipt:",
      error.response?.data || error.message,
    );

    throw new Error(getErrorMessage(error, "Failed to download PDF receipt."));
  }
};

// ============================================================
// GET RECEIPT AS BLOB
//
// Useful for displaying PDF inside a modal/iframe.
// ============================================================

export const getReceiptBlob = async (id) => {
  if (!id) {
    throw new Error("Reimbursement ID is required.");
  }

  try {
    const response = await reimbursementApi.get(`/${id}/receipt`, {
      responseType: "blob",
    });

    return response.data;
  } catch (error) {
    console.error(
      "Error loading receipt:",
      error.response?.data || error.message,
    );

    throw new Error(getErrorMessage(error, "Failed to load PDF receipt."));
  }
};

// ============================================================
// GET RECEIPT BLOB URL
//
// Useful for:
// <iframe src={url} />
//
// <embed src={url} />
// ============================================================

export const getReceiptBlobUrl = async (id) => {
  const blob = await getReceiptBlob(id);

  return window.URL.createObjectURL(blob);
};

// ============================================================
// CHECK WHETHER RECEIPT EXISTS
//
// Uses GET instead of HEAD because the backend currently
// exposes GET /{id}/receipt.
// ============================================================

export const checkReceiptExists = async (id) => {
  if (!id) {
    return false;
  }

  try {
    const response = await reimbursementApi.get(`/${id}/receipt`, {
      responseType: "blob",
    });

    return response.status >= 200 && response.status < 300;
  } catch (error) {
    console.error(
      "Receipt does not exist:",
      error.response?.data || error.message,
    );

    return false;
  }
};

// ============================================================
// CHECK RECEIPT INFORMATION FROM REIMBURSEMENT
//
// Does not make an API request.
// ============================================================

export const hasReceipt = (reimbursement) => {
  if (!reimbursement) {
    return false;
  }

  return Boolean(
    reimbursement.receiptFileName ||
    reimbursement.ReceiptFileName ||
    reimbursement.receiptFilePath ||
    reimbursement.ReceiptFilePath,
  );
};

// ============================================================
// GET RECEIPT FILE NAME
// ============================================================

export const getReceiptFileName = (reimbursement) => {
  if (!reimbursement) {
    return "";
  }

  return reimbursement.receiptFileName || reimbursement.ReceiptFileName || "";
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
