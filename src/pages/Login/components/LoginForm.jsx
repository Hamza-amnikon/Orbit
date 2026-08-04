import "../styles/Login.css";
import ForgotPassword from "./ForgotPassword";
import { useState } from "react";

import {
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  IconButton,
  CircularProgress,
} from "@mui/material";

import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";

import {
  validateEmail,
  validatePassword,
} from "../utils/validation";

function LoginForm({ onLogin, loading = false }) {
    const [forgotOpen, setForgotOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [capsLock, setCapsLock] = useState(false);

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    setErrors({
      email: emailError,
      password: passwordError,
    });

    if (emailError || passwordError) return;

    if (onLogin) {
      onLogin({
        email,
        password,
        rememberMe,
      });
    }
  };

  return (
    <form
      className="login-form"
      onSubmit={handleSubmit}
      noValidate
    >
      {/* Email */}

      <TextField
        fullWidth
        label="Email Address"
        type="email"
        value={email}
        autoComplete="email"
        margin="normal"
        error={!!errors.email}
        helperText={errors.email}
        onChange={(e) => {
          setEmail(e.target.value);

          setErrors({
            ...errors,
            email: validateEmail(e.target.value),
          });
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Email />
            </InputAdornment>
          ),
        }}
      />

      {/* Password */}

      <TextField
        fullWidth
        label="Password"
        type={showPassword ? "text" : "password"}
        value={password}
        autoComplete="current-password"
        margin="normal"
        error={!!errors.password}
        helperText={errors.password}
        onChange={(e) => {
          setPassword(e.target.value);

          setErrors({
            ...errors,
            password: validatePassword(e.target.value),
          });
        }}
        onKeyUp={(e) => {
          setCapsLock(
            e.getModifierState("CapsLock")
          );
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Lock />
            </InputAdornment>
          ),

          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                edge="end"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
              >
                {showPassword ? (
                  <VisibilityOff />
                ) : (
                  <Visibility />
                )}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      {/* Password Strength */}

      {password.length > 0 && (
        <div className="password-strength">

          <div
            className={`strength-bar ${
              password.length >= 8
                ? "strong"
                : password.length >= 4
                ? "medium"
                : "weak"
            }`}
          />

          <span>
            {password.length < 4
              ? "Weak Password"
              : password.length < 8
              ? "Medium Password"
              : "Strong Password"}
          </span>

        </div>
      )}

      {/* Caps Lock */}

      {capsLock && (
        <div className="caps-lock-warning">
          Caps Lock is ON
        </div>
      )}

      {/* Remember */}

      <div className="login-options">

        <FormControlLabel
          control={
            <Checkbox
              checked={rememberMe}
              onChange={(e) =>
                setRememberMe(e.target.checked)
              }
            />
          }
          label="Remember Me"
        />

<button
    className="forgot-link"
    type="button"
    onClick={() => setForgotOpen(true)}
>   
Forgot Password?
</button>

        <ForgotPassword
          open={forgotOpen}
          onClose={() => setForgotOpen(false)}
        />

      </div>

      {/* Login Button */}

      <Button
        fullWidth
        type="submit"
        variant="contained"
        className="login-btn"
        disabled={
          loading ||
          !email ||
          !password
        }
      >
        {loading ? (
          <>
            <CircularProgress
              size={20}
              color="inherit"
              sx={{ mr: 1 }}
            />
            Signing In...
          </>
        ) : (
          "Sign In"
        )}
      </Button>
    </form>
  );
}

export default LoginForm;