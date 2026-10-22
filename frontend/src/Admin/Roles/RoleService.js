import axios from "axios";

const API = axios.create({
    baseURL: `${import.meta.env.VITE_ROLE_API_BASE_URL}/api/Role`,
    headers: {
        "Content-Type": "application/json",
    },
});

// Axios instances created with axios.create() do not inherit interceptors
// registered on the global axios object in main.jsx. RoleService therefore
// needs to attach the current user's JWT to its own requests.
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

export const getRoles = () => API.get("");

export const getRoleById = (id) => API.get(`/${id}`);

export const createRole = (role) => API.post("", role);

export const updateRole = (id, role) => API.put(`/${id}`, role);

export const deleteRole = (id) => API.delete(`/${id}`);
