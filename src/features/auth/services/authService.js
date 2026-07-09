import { loginApi } from "../api/authApi";

export const loginService = async (credentials) => {

    try {

        const data = await loginApi(credentials);

        return data;

    } catch (error) {

        throw error;

    }

};