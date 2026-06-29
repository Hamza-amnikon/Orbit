import "./ForgotPassword.css";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Paper,
  TextField,
  Button,
  InputAdornment,
  Typography,
  CircularProgress,
} from "@mui/material";

import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";

import { forgotPasswordSchema } from "../../features/auth/validation/forgotPasswordSchema";

function ForgotPassword() {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onTouched",
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      console.log("Forgot Password:", data);

      // Later
      // await forgotPassword(data);

    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="forgot-page">
      <Paper elevation={0} className="forgot-card">

        <Typography
          variant="h4"
          fontWeight={700}
          gutterBottom
        >
          Forgot Password
        </Typography>

        <Typography
          variant="body1"
          className="forgot-description"
        >
          Enter your registered email address.
          We'll send you a secure password reset link.
        </Typography>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Email Address"
                placeholder="Enter your registered email"
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

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            className="forgot-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <CircularProgress
                  size={20}
                  color="inherit"
                  sx={{ mr: 1 }}
                />
                Sending...
              </>
            ) : (
              "Send Reset Link"
            )}
          </Button>

        </form>

      </Paper>
    </div>
  );
}

export default ForgotPassword;