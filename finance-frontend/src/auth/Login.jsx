import {
    Fragment,
    useEffect,
    useState
} from "react";

import {
    Alert,
    Button,
    IconButton,
    Stack,
    TextField,
    Tooltip
} from "@mui/material";
import { Navigate } from "react-router-dom";

import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

import { useColorMode } from "../styles/ColorModeContext";
import { useAuth } from "../live/AuthContext";
import { loginConfig } from "./loginConfig";

import "./Login.css";

function MicrosoftMark()
{
    return (
        <span
            className="merit-microsoft-mark"
            aria-hidden="true"
        >
            <span />
            <span />
            <span />
            <span />
        </span>
    );
}

export default function Login()
{
    const {
        mode,
        toggleMode
    } = useColorMode();

    const [setupMessage, setSetupMessage] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [signingIn, setSigningIn] = useState(false);
    const [loginError, setLoginError] = useState("");
    const { user, signIn: signInLocally } = useAuth();

    const {
        branding,
        page,
        signIn,
        access,
        theme
    } = loginConfig;

    const dark = mode === "dark";

    const logo = dark
        ? branding.darkLogo
        : branding.lightLogo;

    const themeLabel = dark
        ? theme.switchToLight
        : theme.switchToDark;

    useEffect(() =>
    {
        const previousTitle = document.title;

        document.title = page.title;

        return () =>
        {
            document.title = previousTitle;
        };
    }, [page.title]);

    function handleSignIn()
    {
        // Connect the backend SSO endpoint after Entra setup.
        setSetupMessage(true);
    }

    function closeSetupMessage()
    {
        setSetupMessage(false);
    }

    async function handleLocalSignIn(event)
    {
        event.preventDefault();

        if (signingIn)
        {
            return;
        }

        setSigningIn(true);
        setLoginError("");

        try
        {
            await signInLocally(username.trim(), password);
        }
        catch (error)
        {
            setLoginError(error.message);
        }
        finally
        {
            setSigningIn(false);
        }
    }

    if (signInLocally && user)
    {
        return <Navigate to="/" replace />;
    }

    return (
        <main
            className="merit-login"
            data-mode={mode}
        >
            <div className="merit-login-theme">
                <Tooltip title={themeLabel}>
                    <IconButton
                        aria-label={themeLabel}
                        onClick={toggleMode}
                    >
                        {dark
                            ? <LightModeOutlinedIcon />
                            : <DarkModeOutlinedIcon />}
                    </IconButton>
                </Tooltip>
            </div>

            <section
                className="merit-login-card"
                aria-labelledby="merit-login-title"
            >
                <div className="merit-login-brand">
                    <img
                        className="merit-login-logo"
                        src={logo}
                        alt={branding.logoAlt}
                    />

                    <p className="merit-login-full-form">
                        {branding.fullForm.map(word => (
                            <Fragment key={word.initial}>
                                <span className="merit-login-word">
                                    <strong>
                                        {word.initial}
                                    </strong>
                                    {word.remainder}
                                </span>
                                {word.separator}
                            </Fragment>
                        ))}
                    </p>
                </div>

                <div className="merit-login-heading">
                    <h1 id="merit-login-title">
                        {page.heading}
                    </h1>

                    <p>
                        {signInLocally ? "Sign in with your local Finance admin account." : page.description}
                    </p>
                </div>

                {signInLocally && (
                    <Stack
                        component="form"
                        onSubmit={handleLocalSignIn}
                        spacing={2}
                        sx={{ mb: 2 }}
                    >
                        {loginError && (
                            <Alert severity="error">{loginError}</Alert>
                        )}

                        <TextField
                            label="Username"
                            name="username"
                            autoComplete="username"
                            value={username}
                            onChange={event => setUsername(event.target.value)}
                            disabled={signingIn}
                            required
                            fullWidth
                        />

                        <TextField
                            label="Password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={event => setPassword(event.target.value)}
                            disabled={signingIn}
                            required
                            fullWidth
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            disabled={signingIn}
                            fullWidth
                        >
                            {signingIn ? "Signing in…" : "Sign in"}
                        </Button>
                    </Stack>
                )}

                <Button
                    className="merit-login-button"
                    variant="outlined"
                    fullWidth
                    startIcon={<MicrosoftMark />}
                    onClick={handleSignIn}
                >
                    {signIn.buttonLabel}
                </Button>

                {setupMessage && (
                    <Alert
                        severity="info"
                        className="merit-login-alert"
                        onClose={closeSetupMessage}
                    >
                        {signIn.setupMessage}
                    </Alert>
                )}

                <div className="merit-login-access">
                    <LockOutlinedIcon />

                    <p>
                        {access.description}
                    </p>
                </div>

                <p className="merit-login-help">
                    {access.help}
                </p>
            </section>

            <footer className="merit-login-footer">
                {branding.name}
                <span aria-hidden="true"> · </span>
                {page.footer}
            </footer>
        </main>
    );
}
