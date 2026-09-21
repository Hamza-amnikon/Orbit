const API_BASE_URL = "http://localhost:5016/api";

const get = async (url) => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
};

const post = async (url, data) => {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.message || `API request failed: ${response.status}`
    );
  }

  return result;
};

export const getBills = async ({
  search = "",
  status = "",
  paymentStatus = "",
  fromDate = "",
  toDate = "",
  pageNumber = 1,
  pageSize = 10,
} = {}) => {
  const params = new URLSearchParams();

  if (search) params.append("Search", search);
  if (status) params.append("Status", status);
  if (paymentStatus) {
    params.append("PaymentStatus", paymentStatus);
  }

  if (fromDate) params.append("FromDate", fromDate);
  if (toDate) params.append("ToDate", toDate);

  params.append("PageNumber", pageNumber);
  params.append("PageSize", pageSize);

  return get(`${API_BASE_URL}/Bill?${params.toString()}`);
};

export const getBillDashboardSummary = async () => {
  return get(`${API_BASE_URL}/BillDashboard/summary`);
};

export const getRecentBillActivities = async (limit = 10) => {
  return get(
    `${API_BASE_URL}/BillActivity/recent?limit=${limit}`
  );
};

export const getBillById = async (billId) => {
  return get(`${API_BASE_URL}/Bill/${billId}`);
};

export const createBill = async (bill) => {
  return post(`${API_BASE_URL}/Bill`, bill);
};

export const createBillApproval = async (approval) => {
  return post(`${API_BASE_URL}/BillApproval`, approval);
};

export const createBillPayment = async (payment) => {
  return post(`${API_BASE_URL}/BillPayment`, payment);
};

export const getBillPayments = async (billId) => {
  return get(`${API_BASE_URL}/BillPayment/bill/${billId}`);
};

export const getBillApprovals = async (billId) => {
  return get(`${API_BASE_URL}/BillApproval/bill/${billId}`);
};

export const getVendors = async () => {
  return get(`${API_BASE_URL}/Vendor`);
};

export const createVendor = async (vendor) => {
  return post(`${API_BASE_URL}/Vendor`, vendor);
};