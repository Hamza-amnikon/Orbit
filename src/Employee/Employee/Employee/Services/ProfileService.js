import api from "../../../../services/api";   // Change the path if api.js is in another folder

export async function getProfile() {

    const response = await api.get("/Auth/profile");

    return response.data;
}