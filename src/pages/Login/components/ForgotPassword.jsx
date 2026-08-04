import { useState } from "react";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
  Alert,
  Snackbar,
} from "@mui/material";

import {
  LockReset,
  EmailOutlined,
  Close,
  ArrowForward,
} from "@mui/icons-material";

function ForgotPassword({ open, onClose }) {
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState(false);

  const validateEmail = (value) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!value.trim()) return "Email is required.";

    if (!regex.test(value)) return "Please enter a valid email address.";

    return "";
  };

  const handleSend = async () => {
    const validation = validateEmail(email);

    if (validation) {
      setError(validation);
      return;
    }

    setError("");

    setLoading(true);

    // Simulate API

    setTimeout(() => {
      setLoading(false);

      setSuccess(true);

      setEmail("");

      onClose();
    }, 1500);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 5,
            overflow: "hidden",
            boxShadow: "0 30px 80px rgba(15,23,42,.18)",
          },
        }}
      >
        {/* Header */}

        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #eef2f7",
            px: 4,
            py: 3,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <LockReset
              sx={{
                color: "#2563eb",
                fontSize: 34,
              }}
            />

            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
              }}
            >
              Password Recovery
            </Typography>
          </div>

          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </DialogTitle>

        {/* Body */}

        <DialogContent
          sx={{
            px: 4,
            py: 4,
          }}
        >
          <Typography
            sx={{
              mb: 1,
              fontWeight: 600,
              color: "#111827",
            }}
          >
            Forgot your password?
          </Typography>

          <Typography
            sx={{
              color: "#64748b",
              mb: 3,
              lineHeight: 1.8,
            }}
          >
            Enter your company email address and we'll send you a secure
            password reset link.
          </Typography>

          <TextField
            fullWidth
            autoFocus
            label="Email Address"
            value={email}
            error={!!error}
            helperText={error || " "}
            onChange={(e) => {
              setEmail(e.target.value);

              if (error) {
                setError(validateEmail(e.target.value));
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailOutlined color="primary" />
                </InputAdornment>
              ),
            }}
          />

          <Alert
            severity="info"
            variant="outlined"
            sx={{
              mt: 2,
              borderRadius: 3,
            }}
          >
            Reset links are valid for <strong>15 minutes</strong>. If you don't
            receive an email, please check your spam folder.
          </Alert>
        </DialogContent>

        {/* Footer */}

        <DialogActions
          sx={{
            px: 4,
            py: 3,
            borderTop: "1px solid #eef2f7",
          }}
        >
          <Button
            onClick={onClose}
            color="inherit"
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            endIcon={<ArrowForward />}
            onClick={handleSend}
            disabled={loading}
            sx={{
              borderRadius: 3,
              px: 3,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Message */}

      <Snackbar
        open={success}
        autoHideDuration={4000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <Alert
          severity="success"
          variant="filled"
        >
          Password reset link sent successfully.
        </Alert>
      </Snackbar>
    </>
  );
}

export default ForgotPassword;