import axios from "axios";

const API_URL = "http://localhost:7240/api/Department";

export const getDepartments = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

export const getDepartmentById = async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
};

export const createDepartment = async (data) => {
    const response = await axios.post(API_URL, data);
    return response.data;
};

export const updateDepartment = async (id, data) => {
    const response = await axios.put(`${API_URL}/${id}`, data);
    return response.data;
};

export const deleteDepartment = async (id) => {
    await axios.delete(`${API_URL}/${id}`);
};