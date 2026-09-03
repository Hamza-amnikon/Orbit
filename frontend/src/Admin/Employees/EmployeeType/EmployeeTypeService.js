import axios from "axios";

const API_URL = "http://localhost:7084/api/EmployeeType"; // Change to your API port

export const getEmployeeTypes = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

export const getEmployeeTypeById = async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
};

export const createEmployeeType = async (data) => {
    const response = await axios.post(API_URL, data);
    return response.data;
};

export const updateEmployeeType = async (id, data) => {
    const response = await axios.put(`${API_URL}/${id}`, data);
    return response.data;
};

export const deleteEmployeeType = async (id) => {
    await axios.delete(`${API_URL}/${id}`);
};