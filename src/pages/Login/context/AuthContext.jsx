import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {

    const [user, setUser] = useState(null);

    const [token, setToken] = useState(
        localStorage.getItem("token") || ""
    );

    const [role, setRole] = useState(
        localStorage.getItem("role") || ""
    );

    const login = (jwt, userInfo) => {

        setToken(jwt);

        setUser(userInfo);

        setRole(userInfo.role);

        localStorage.setItem("token", jwt);

        localStorage.setItem("role", userInfo.role);

    };

    const logout = () => {

        setToken("");

        setUser(null);

        setRole("");

        localStorage.removeItem("token");

        localStorage.removeItem("role");

    };

    return (

        <AuthContext.Provider
            value={{
                user,
                token,
                role,
                login,
                logout
            }}
        >

            {children}

        </AuthContext.Provider>

    );

}

export function useAuth() {

    return useContext(AuthContext);

}