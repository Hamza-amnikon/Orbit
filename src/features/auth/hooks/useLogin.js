export const useLogin = () => {
  const login = async (credentials) => {
    console.log("Login Request:", credentials);

    // Temporary mock response
    return {
      success: true,
      token: "dummy-token",
      user: {
        id: 1,
        name: "Hamza",
        role: "Admin",
      },
    };
  };

  return { login };
};