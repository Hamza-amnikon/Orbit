import api from "./api";

export async function getProfile() {
  const [auth, employee] = await Promise.allSettled([
    api.get("/Auth/profile"),
    api.get(`${import.meta.env.VITE_EMPLOYEE_API_BASE_URL}/api/Employee/profile`),
  ]);

  if (auth.status === "rejected" && employee.status === "rejected") {
    throw auth.reason;
  }

  const profile = auth.status === "fulfilled" ? auth.value.data : employee.value.data;
  if (employee.status === "rejected") {
    return { ...profile, emergencyContactUnavailable: true };
  }

  const contact = employee.value.data;
  return {
    ...profile,
    emergencyContactName: contact.emergencyContactName,
    emergencyRelationship: contact.emergencyRelationship,
    emergencyPhone: contact.emergencyPhone,
    emergencyAddress: contact.emergencyAddress,
    emergencyContactUnavailable: false,
  };
}

export async function updateEmergencyContact(contact) {
  const response = await api.put(
    `${import.meta.env.VITE_EMPLOYEE_API_BASE_URL}/api/Employee/profile/emergency-contact`,
    contact,
  );
  return response.data;
}
