import { useEffect, useState } from "react";
import { Alert, Box, Button, Card, CardContent, CircularProgress, Stack, TextField, Typography } from "@mui/material";
import { financeApi } from "../services/financeApi";

import { AuthContext } from "./AuthContext";
import ThemeToggle from "../components/ThemeToggle";

export function FinanceAuth({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(financeApi.hasSession);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    const logout = () => { setUser(null); setPassword(""); setError("Your session has ended. Please sign in again."); };
    window.addEventListener("finance:unauthorized", logout);
    if (financeApi.hasSession()) financeApi.me().then(value => { if (active) setUser(value); })
      .catch(e => { if (active) setError(e.message); }).finally(() => { if (active) setChecking(false); });
    return () => { active = false; window.removeEventListener("finance:unauthorized", logout); };
  }, []);
  async function login(event) {
    event.preventDefault(); setBusy(true); setError("");
    try { const result = await financeApi.login(email, password); setUser(result.user); setPassword(""); }
    catch (e) { setError(e.message === "Failed to fetch" ? "Cannot reach the finance server. Start the backend and try again." : e.message); }
    finally { setBusy(false); }
  }
  if (checking) return <Box sx={{ display: "grid", placeItems: "center", minHeight: "100vh" }}><CircularProgress aria-label="Checking session" /></Box>;
  if (!user) return <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", p: 3 }}>
    <Card sx={{ width: "100%", maxWidth: 440 }}><CardContent sx={{ p: 4 }}>
      <Stack component="form" spacing={3} onSubmit={login}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }}><Box><Typography variant="h5" fontWeight={700}>SparkFinance</Typography><Typography color="text.secondary">Sign in to your finance workspace</Typography></Box><ThemeToggle /></Box>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField label="Email" type="email" required autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} />
        <TextField label="Password" type="password" required autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} />
        <Button type="submit" variant="contained" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</Button>
      </Stack>
    </CardContent></Card>
  </Box>;
  return <AuthContext.Provider value={{ user, canWrite: user.role !== "Viewer", logout: () => { financeApi.logout(); setUser(null); setError(""); } }}>{children}</AuthContext.Provider>;
}
