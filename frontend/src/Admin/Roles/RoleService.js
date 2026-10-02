import axios from "axios";

const API = axios.create({
    baseURL: `${import.meta.env.VITE_ROLE_API_BASE_URL}/api/Role`,
    headers: {
        "Content-Type": "application/json",
    },
});

export const getRoles = () => API.get("");

export const getRoleById = (id) => API.get(`/${id}`);

export const createRole = (role) => API.post("", role);

export const updateRole = (id, role) => API.put(`/${id}`, role);

export const deleteRole = (id) => API.delete(`/${id}`);