import axios from "axios";

const ATTENDANCE_API_BASE_URL = String(
  import.meta.env.VITE_ATTENDANCE_API_BASE_URL || ""
).replace(/\/+$/, "");
const API_URL = `${ATTENDANCE_API_BASE_URL}/api/Attendance`;

const AttendanceService = {

  getAll: async () => {
    const response = await axios.get(API_URL);
    return response.data;
  },

  getById: async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  },

  getDashboard: async () => {
    const response = await axios.get(`${API_URL}/dashboard`);
    return response.data;
  },

  getToday: async () => {
    const response = await axios.get(`${API_URL}/today`);
    return response.data;
  },

  getByEmployee: async (employeeId) => {
    const response = await axios.get(`${API_URL}/employee/${employeeId}`);
    return response.data;
  },

  getByDate: async (date) => {
    const response = await axios.get(`${API_URL}/date/${date}`);
    return response.data;
  },

  getByDateRange: async (startDate, endDateExclusive) => {
    try {
      const response = await axios.get(`${API_URL}/range`, {
        params: { startDate, endDateExclusive },
      });
      return response.data;
    } catch (error) {
      // Older deployments may not support this range request yet. Fall back
      // to indexed day queries instead of downloading the full attendance table.
      if (![400, 404].includes(error?.response?.status)) throw error;

      const end = new Date(`${endDateExclusive}T00:00:00`);
      const dates = [];
      const current = new Date(`${startDate}T00:00:00`);
      const formatLocalDate = (value) => [
        value.getFullYear(),
        String(value.getMonth() + 1).padStart(2, "0"),
        String(value.getDate()).padStart(2, "0"),
      ].join("-");
      while (current < end) {
        dates.push(formatLocalDate(current));
        current.setDate(current.getDate() + 1);
      }

      const records = [];
      for (let index = 0; index < dates.length; index += 5) {
        const batch = await Promise.all(
          dates.slice(index, index + 5).map((date) => axios.get(`${API_URL}/date/${date}`))
        );
        batch.forEach((response) => {
          if (Array.isArray(response.data)) records.push(...response.data);
        });
      }
      return records;
    }
  },

  getByStatus: async (status) => {
    const response = await axios.get(`${API_URL}/status/${status}`);
    return response.data;
  },

  // ✅ Generate Today's Attendance
  generateAttendance: async () => {
    const response = await axios.post(`${API_URL}/generate`);
    return response.data;
  },

  create: async (data) => {
    const response = await axios.post(API_URL, data);
    return response.data;
  },

  update: async (id, data, originalAttendance) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, data);
      return response.data;
    } catch (error) {
      if (error?.response?.status !== 404 || !originalAttendance?.employeeId || !originalAttendance?.attendanceDate) {
        throw error;
      }

      // The AccessVault sync can replace a generated row after the edit dialog
      // opens. Resolve its current ID by employee and original work date.
      const date = originalAttendance.attendanceDate.split("T")[0];
      const records = await AttendanceService.getByDate(date);
      const matches = records.filter((record) =>
        Number(record.employeeId) === Number(originalAttendance.employeeId)
      );
      if (matches.length !== 1 || matches[0].attendanceId === id) {
        throw error;
      }

      const response = await axios.put(`${API_URL}/${matches[0].attendanceId}`, data);
      return response.data;
    }
  },


  
  delete: async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  }

};

export default AttendanceService;
