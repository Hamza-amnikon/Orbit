import { AuthContext } from "./AuthContext";

export function FinanceAuth({ children }) {
  return (
    <AuthContext.Provider value={{ user: { name: "Finance", role: "Admin" }, canWrite: true }}>
      {children}
    </AuthContext.Provider>
  );
}

