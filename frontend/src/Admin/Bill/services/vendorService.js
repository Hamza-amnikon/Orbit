const VENDOR_API_BASE_URL = "https://localhost:7008";

const getAuthHeaders = () => {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken");

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// =========================================================
// GET ALL VENDORS
// =========================================================

export const getVendors = async () => {
  const response = await fetch(
    `${VENDOR_API_BASE_URL}/api/Vendor`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    let message = "Failed to load vendors.";

    try {
      const errorData = await response.json();
      message = errorData?.message || message;
    } catch {
      // Ignore JSON parsing error
    }

    throw new Error(message);
  }

  return await response.json();
};

// =========================================================
// CREATE VENDOR
// =========================================================

export const createVendor = async (vendor) => {
  const response = await fetch(
    `${VENDOR_API_BASE_URL}/api/Vendor`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        vendorCode: vendor.vendorCode.trim(),
        vendorName: vendor.vendorName.trim(),
        email: vendor.email.trim(),
        phone: vendor.phone.trim(),
        address: vendor.address.trim(),
        taxNumber: vendor.taxNumber.trim(),
        bankAccountNumber: vendor.bankAccountNumber.trim(),
        ifscCode: vendor.ifscCode.trim(),
      }),
    }
  );

  let responseData = null;

  try {
    responseData = await response.json();
  } catch {
    // Response may not contain JSON
  }

  if (!response.ok) {
    throw new Error(
      responseData?.message || "Failed to create vendor."
    );
  }

  return responseData;
};

// =========================================================
// UPDATE VENDOR
// =========================================================

export const updateVendor = async (vendor) => {
  const response = await fetch(
    `${VENDOR_API_BASE_URL}/api/Vendor/${vendor.vendorId}`,
    {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        vendorId: vendor.vendorId,
        vendorCode: vendor.vendorCode.trim(),
        vendorName: vendor.vendorName.trim(),
        email: vendor.email?.trim() || "",
        phone: vendor.phone?.trim() || "",
        address: vendor.address?.trim() || "",
        taxNumber: vendor.taxNumber?.trim() || "",
        bankAccountNumber: vendor.bankAccountNumber?.trim() || "",
        ifscCode: vendor.ifscCode?.trim() || "",
        status: vendor.status || "Active",
        updatedBy: vendor.updatedBy || null,
      }),
    }
  );

  let responseData = null;

  try {
    responseData = await response.json();
  } catch {
    // Response may not contain JSON
  }

  if (!response.ok) {
    throw new Error(
      responseData?.message || "Failed to update vendor."
    );
  }

  return responseData;
};

// =========================================================
// DELETE / DEACTIVATE VENDOR
// =========================================================

export const deleteVendor = async (vendorId, deletedBy) => {
  const response = await fetch(
    `${VENDOR_API_BASE_URL}/api/Vendor/${vendorId}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        deletedBy: deletedBy || null,
      }),
    }
  );

  let responseData = null;

  try {
    responseData = await response.json();
  } catch {
    // Response may not contain JSON
  }

  if (!response.ok) {
    throw new Error(
      responseData?.message || "Failed to delete vendor."
    );
  }

  return responseData;
};