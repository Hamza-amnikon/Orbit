import axios from "axios";

export async function getDashboardProfile() {

    const token = localStorage.getItem("token");

    const response = await axios.get(
        "https://localhost:7278/api/Auth/profile",
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
}