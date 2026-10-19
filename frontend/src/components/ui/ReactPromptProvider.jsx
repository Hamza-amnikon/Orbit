import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import "./ReactPromptProvider.css";

const ReactPromptContext = createContext(null);
let dispatchRequest = null;
const requestsBeforeMount = [];

const requestDialog = (type, message, options = {}) => new Promise((resolve) => {
  const request = { type, message: String(message ?? ""), options, resolve };
  if (dispatchRequest) dispatchRequest(request);
  else requestsBeforeMount.push(request);
});

export const showReactAlert = (message, options) => requestDialog("alert", message, options);
export const showReactConfirm = (message, options) => requestDialog("confirm", message, options);
export const showReactPrompt = (message, options) => requestDialog("prompt", message, options);

export const useReactPrompt = () => {
  const context = useContext(ReactPromptContext);
  if (!context) throw new Error("useReactPrompt must be used inside ReactPromptProvider");
  return context;
};

export default function ReactPromptProvider({ children }) {
  const [dialog, setDialog] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [inputError, setInputError] = useState(false);
  const activeRequest = useRef(null);
  const requestQueue = useRef([]);

  const dispatch = useCallback((request) => {
    if (activeRequest.current) {
      requestQueue.current.push(request);
      return;
    }
    activeRequest.current = request;
    setInputValue(request.options.initialValue ?? "");
    setInputError(false);
    setDialog(request);
  }, []);

  useEffect(() => {
    dispatchRequest = dispatch;
    requestsBeforeMount.splice(0).forEach(dispatch);
    return () => {
      if (dispatchRequest === dispatch) dispatchRequest = null;
    };
  }, [dispatch]);

  const finish = (result) => {
    const finished = activeRequest.current;
    activeRequest.current = null;
    setDialog(null);
    setInputError(false);
    finished?.resolve(result);

    const next = requestQueue.current.shift();
    if (next) {
      activeRequest.current = next;
      window.setTimeout(() => {
        setInputValue(next.options.initialValue ?? "");
        setDialog(next);
      }, 140);
    }
  };

  const close = () => {
    if (dialog?.type === "confirm") finish(false);
    else if (dialog?.type === "prompt") finish(null);
    else finish(true);
  };

  const submit = () => {
    if (dialog?.type === "prompt") {
      if (dialog.options.required && !inputValue.trim()) {
        setInputError(true);
        return;
      }
      finish(inputValue);
      return;
    }
    finish(true);
  };

  const contextValue = {
    alert: showReactAlert,
    confirm: showReactConfirm,
    prompt: showReactPrompt,
  };

  return (
    <ReactPromptContext.Provider value={contextValue}>
      {children}
      <Dialog
        open={Boolean(dialog)}
        onClose={close}
        fullWidth
        maxWidth={dialog?.type === "prompt" ? "sm" : "xs"}
        className="app-react-dialog"
        slotProps={{ paper: { className: "app-react-dialog-paper" } }}
        aria-labelledby="app-react-dialog-title"
        aria-describedby="app-react-dialog-description"
      >
        <DialogTitle id="app-react-dialog-title" className="app-react-dialog-title">
          {dialog?.options.title || (dialog?.type === "confirm" ? "Please confirm" : dialog?.type === "prompt" ? "Enter details" : "Notice")}
        </DialogTitle>
        <DialogContent className="app-react-dialog-content">
          <div id="app-react-dialog-description">{dialog?.message}</div>
          {dialog?.type === "prompt" && (
            <TextField
              autoFocus
              fullWidth
              multiline={Boolean(dialog.options.multiline)}
              minRows={dialog.options.multiline ? 3 : undefined}
              margin="normal"
              label={dialog.options.inputLabel || "Response"}
              placeholder={dialog.options.placeholder || ""}
              value={inputValue}
              onChange={(event) => {
                setInputValue(event.target.value);
                setInputError(false);
              }}
              error={inputError}
              helperText={inputError ? (dialog.options.requiredMessage || "This field is required.") : dialog.options.helperText}
            />
          )}
        </DialogContent>
        <DialogActions className="app-react-dialog-actions">
          {dialog?.type !== "alert" && (
            <Button className="app-react-dialog-cancel" onClick={close}>
              {dialog?.options.cancelText || "Cancel"}
            </Button>
          )}
          <Button
            autoFocus={dialog?.type !== "prompt"}
            className={`app-react-dialog-submit${dialog?.options.danger ? " is-danger" : ""}`}
            variant="contained"
            onClick={submit}
          >
            {dialog?.options.confirmText || (dialog?.type === "alert" ? "OK" : dialog?.type === "prompt" ? "Submit" : "Confirm")}
          </Button>
        </DialogActions>
      </Dialog>
    </ReactPromptContext.Provider>
  );
}
