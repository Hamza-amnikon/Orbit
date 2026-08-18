import axios from "axios";

const API_URL = "https://localhost:7294/api/Role";

export const getRoles = () => axios.get(API_URL);

export const getRoleById = (id) =>
    axios.get(`${API_URL}/${id}`);

export const createRole = (data) =>
    axios.post(API_URL, data);

export const updateRole = (id, data) =>
    axios.put(`${API_URL}/${id}`, data);

export const deleteRole = (id) =>
    axios.delete(`${API_URL}/${id}`);