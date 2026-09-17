import axios from "axios";

const API = axios.create({
    baseURL: "https://sparkapi.amnikontechnologies.com:7249/api/Role",
    headers: {
        "Content-Type": "application/json",
    },
});

export const getRoles = () => API.get("");

export const getRoleById = (id) => API.get(`/${id}`);

export const createRole = (role) => API.post("", role);

export const updateRole = (id, role) => API.put(`/${id}`, role);

export const deleteRole = (id) => API.delete(`/${id}`);