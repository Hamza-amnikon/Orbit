import api from "./api";

export async function getProfile() {
  const response = await api.get("/Auth/profile");

  return response.data;
}
