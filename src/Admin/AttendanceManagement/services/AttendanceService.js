import axios from "axios";

const API_URL = "http://localhost:5172/api/Attendance";

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

  update: async (id, data) => {
    const response = await axios.put(`${API_URL}/${id}`, data);
    return response.data;
  },


  
  delete: async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  }

};

export default AttendanceService;