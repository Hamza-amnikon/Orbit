import axios from "axios";

const API_URL = "https://localhost:7292/api/Shift";

const getAll = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

const getById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

const create = async (payload) => {
  const response = await axios.post(API_URL, payload);
  return response.data;
};

const update = async (id, payload) => {
  const response = await axios.put(`${API_URL}/${id}`, payload);
  return response.data;
};

const remove = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};

const ShiftService = {
  getAll,
  getById,
  create,
  update,
  remove,
};

export default ShiftService;