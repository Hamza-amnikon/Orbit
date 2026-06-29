import "./Login.css";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Paper,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  IconButton,
} from "@mui/material";

import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";

import { loginSchema } from "../../features/auth/validation/loginSchema";
import { useLogin } from "../../features/auth/auth/hooks/useLogin";
function Login() {
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useLogin();

const {
  control,
  handleSubmit,
  formState: { errors, isSubmitting },
} = useForm({
  resolver: zodResolver(loginSchema),
  mode: "onTouched",
  defaultValues: {
    email: "",
    password: "",
  },
});

const onSubmit = async (data) => {
  try {
    const response = await login(data);

    console.log(response);
  } catch (error) {
    console.error(error);
  }
};

  return (
    <div className="login-page">
      {/* LEFT PANEL */}

      <div className="login-left">
        <h1>AMNIKON</h1>

        <h2>Enterprise HRMS</h2>

        <p>
          Secure Human Resource Management Platform for modern organizations.
        </p>

        <ul>
          <li>Employee Management</li>
          <li>Attendance Tracking</li>
          <li>Payroll Management</li>
          <li>Reports & Analytics</li>
        </ul>
      </div>

      {/* RIGHT PANEL */}

      <div className="login-right">
        <Paper elevation={0} className="login-card">
          <h2>Welcome Back</h2>

          <p>Sign in to continue</p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* EMAIL */}

            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Email Address"
                  margin="normal"
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlinedIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />

            {/* PASSWORD */}

            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Password"
                  margin="normal"
                  type={showPassword ? "text" : "password"}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon />
                      </InputAdornment>
                    ),

                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          edge="end"
                          onClick={() =>
                            setShowPassword((prev) => !prev)
                          }
                        >
                          {showPassword ? (
                            <VisibilityOffOutlinedIcon />
                          ) : (
                            <VisibilityOutlinedIcon />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />

            {/* OPTIONS */}

            <div className="login-options">
              <FormControlLabel
                control={<Checkbox />}
                label="Remember Me"
              />

              <a href="/">Forgot Password?</a>
            </div>

            {/* BUTTON */}

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              className="login-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing In..." : "Access Dashboard"}
            </Button>
          </form>
        </Paper>
      </div>
    </div>
  );
}

export default Login;