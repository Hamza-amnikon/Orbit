import api from "../../../services/api";

export const loginApi = async (credentials) => {

    const response = await api.post(
        "/auth/login",
        credentials
    );

    return response.data;
};