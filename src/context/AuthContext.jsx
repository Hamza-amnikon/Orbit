import { createContext, useContext, useEffect, useState } from "react";
import authService from "../services/authService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = () => {
        const token = localStorage.getItem("token");

        if (token) {
            setUser({
                token
            });
        } else {
            setUser(null);
        }

        setLoading(false);
    };

    const login = () => {
        authService.login();
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
        window.location.replace("/login");
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                logout,
                checkAuth,
                isAuthenticated: !!user
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}