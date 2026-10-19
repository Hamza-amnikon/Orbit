import { MuiInputMigration } from "../../components/ui/MuiCompat.jsx";
import React, { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import {
    Alert,
    Box,
    Button,
    Checkbox,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
    IconButton,
} from "@mui/material";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";

import PolicyService from "../Services/PolicyService";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const initialForm = {
    PolicyTitle: "",
    PolicyCode: "",
    Category: "",
    Version: "1.0",
    EffectiveDate: "",
    Description: "",
    AcknowledgementRequired: false,
    File: null,
};

const PolicyForm = ({
    open,
    onClose,
    onSaved,
}) => {
    const fileInputRef = useRef(null);

    const [formData, setFormData] =
        useState(initialForm);

    const [errors, setErrors] =
        useState({});

    const [submitError, setSubmitError] =
        useState("");

    const [saving, setSaving] =
        useState(false);

    // ============================================================
    // RESET FORM
    // ============================================================

    const resetForm = () => {
        setFormData(initialForm);
        setErrors({});
        setSubmitError("");

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // ============================================================
    // RESET WHEN DIALOG CLOSES
    // ============================================================

    useEffect(() => {
        if (!open) {
            resetForm();
        }
    }, [open]);

    // ============================================================
    // HANDLE TEXT CHANGE
    // ============================================================

    const handleChange = (event) => {
        const {
            name,
            value,
        } = event.target;

        setFormData((current) => ({
            ...current,
            [name]: value,
        }));

        setErrors((current) => ({
            ...current,
            [name]: "",
        }));

        setSubmitError("");
    };

    // ============================================================
    // ACKNOWLEDGEMENT CHANGE
    // ============================================================

    const handleAcknowledgementChange = (
        event
    ) => {
        setFormData((current) => ({
            ...current,
            AcknowledgementRequired:
                event.target.checked,
        }));
    };

    // ============================================================
    // FILE CHANGE
    // ============================================================

    const handleFileChange = (event) => {
        const file =
            event.target.files?.[0];

        setErrors((current) => ({
            ...current,
            File: "",
        }));

        setSubmitError("");

        if (!file) {
            setFormData((current) => ({
                ...current,
                File: null,
            }));

            return;
        }

        // --------------------------------------------------------
        // PDF VALIDATION
        // --------------------------------------------------------

        const isPdf =
            file.type === "application/pdf" ||
            file.name
                .toLowerCase()
                .endsWith(".pdf");

        if (!isPdf) {
            setErrors((current) => ({
                ...current,
                File: "Only PDF files are allowed.",
            }));

            setFormData((current) => ({
                ...current,
                File: null,
            }));

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

            return;
        }

        // --------------------------------------------------------
        // SIZE VALIDATION
        // --------------------------------------------------------

        if (file.size > MAX_FILE_SIZE) {
            setErrors((current) => ({
                ...current,
                File: "PDF file size must not exceed 10 MB.",
            }));

            setFormData((current) => ({
                ...current,
                File: null,
            }));

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

            return;
        }

        setFormData((current) => ({
            ...current,
            File: file,
        }));
    };

    // ============================================================
    // VALIDATION
    // ============================================================

    const validateForm = () => {
        const newErrors = {};

        // Policy Title
        if (
            !formData.PolicyTitle.trim()
        ) {
            newErrors.PolicyTitle =
                "Policy title is required.";
        } else if (
            formData.PolicyTitle.trim()
                .length > 200
        ) {
            newErrors.PolicyTitle =
                "Policy title must not exceed 200 characters.";
        }

        // Policy Code
        if (
            formData.PolicyCode.trim()
                .length > 50
        ) {
            newErrors.PolicyCode =
                "Policy code must not exceed 50 characters.";
        }

        // Category
        if (
            !formData.Category.trim()
        ) {
            newErrors.Category =
                "Category is required.";
        }

        // Version
        if (
            !formData.Version.trim()
        ) {
            newErrors.Version =
                "Version is required.";
        } else if (
            formData.Version.trim()
                .length > 20
        ) {
            newErrors.Version =
                "Version must not exceed 20 characters.";
        }

        // Effective Date
        if (
            !formData.EffectiveDate
        ) {
            newErrors.EffectiveDate =
                "Effective date is required.";
        }

        // Description
        if (
            formData.Description.length >
            2000
        ) {
            newErrors.Description =
                "Description must not exceed 2000 characters.";
        }

        // File
        if (!formData.File) {
            newErrors.File =
                "Policy PDF is required.";
        }

        setErrors(newErrors);

        return (
            Object.keys(newErrors).length === 0
        );
    };

    // ============================================================
    // FORMAT FILE SIZE
    // ============================================================

    const formatFileSize = (bytes) => {
        if (!bytes) {
            return "";
        }

        if (bytes < 1024) {
            return `${bytes} B`;
        }

        if (bytes < 1024 * 1024) {
            return `${(
                bytes / 1024
            ).toFixed(1)} KB`;
        }

        return `${(
            bytes /
            (1024 * 1024)
        ).toFixed(2)} MB`;
    };

    // ============================================================
    // SUBMIT
    // ============================================================

    const handleSubmit = async () => {
        setSubmitError("");

        const isValid =
            validateForm();

        if (!isValid) {
            return;
        }

        try {
            setSaving(true);

            const response =
                await PolicyService.createPolicy(
                    {
                        PolicyTitle:
                            formData.PolicyTitle.trim(),

                        PolicyCode:
                            formData.PolicyCode.trim(),

                        Category:
                            formData.Category.trim(),

                        Version:
                            formData.Version.trim(),

                        EffectiveDate:
                            formData.EffectiveDate,

                        Description:
                            formData.Description.trim(),

                        AcknowledgementRequired:
                            formData.AcknowledgementRequired,

                        File:
                            formData.File,
                    }
                );

            console.log(
                "Policy created successfully:",
                response
            );

            resetForm();

            if (onSaved) {
                await onSaved(
                    response?.data
                );
            }
        } catch (error) {
            console.error(
                "Create Policy Error:",
                error
            );

            const backendMessage =
                error?.response?.data
                    ?.message ||
                error?.response?.data
                    ?.title ||
                error?.response?.data
                    ?.errors;

            if (
                typeof backendMessage ===
                "string"
            ) {
                setSubmitError(
                    backendMessage
                );
            } else {
                setSubmitError(
                    "Failed to create policy. Please try again."
                );
            }
        } finally {
            setSaving(false);
        }
    };

    // ============================================================
    // CLOSE
    // ============================================================

    const handleClose = () => {
        if (saving) {
            return;
        }

        resetForm();

        if (onClose) {
            onClose();
        }
    };

    // ============================================================
    // RENDER
    // ============================================================

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            maxWidth="md"
            className="policy-form-dialog"
            slotProps={{
                paper: {
                    className: "policy-form-paper",
                    sx: {
                    width: "min(900px, calc(100% - 32px))",
                    maxWidth: "900px",
                    maxHeight: "calc(100% - 32px)",
                    margin: "16px",
                    borderRadius: "18px",
                    overflow: "hidden",
                    border: "1px solid #e0e8f2",
                    },
                },
            }}
        >

            {/* =================================================
                HEADER
            ================================================== */}

            <DialogTitle
                sx={{
                    px: 3,
                    py: 2.5,
                    borderBottom:
                        "1px solid #e7edf5",
                    background: "#ffffff",
                }}
            >

                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent:
                            "space-between",
                        gap: 2,
                    }}
                >

                    <Box>
                        <Typography
                            sx={{
                                color:
                                    "#082653",
                                fontSize:
                                    "22px",
                                fontWeight:
                                    700,
                                lineHeight:
                                    1.3,
                            }}
                        >
                            Add Policy
                        </Typography>

                        <Typography
                            sx={{
                                mt: 0.5,
                                color:
                                    "#7187a5",
                                fontSize:
                                    "13px",
                            }}
                        >
                            Create a new company policy
                            and upload its PDF document.
                        </Typography>
                    </Box>

                    <IconButton
                        onClick={handleClose}
                        disabled={saving}
                        sx={{
                            width: 38,
                            height: 38,
                            border:
                                "1px solid #e1e8f2",
                            borderRadius:
                                "9px",
                            color:
                                "#7187a5",
                            "&:hover": {
                                background:
                                    "#f5f8fc",
                                color:
                                    "#2867e8",
                            },
                        }}
                    >
                        <CloseRoundedIcon />
                    </IconButton>

                </Box>

            </DialogTitle>

            {/* =================================================
                CONTENT
            ================================================== */}

            <DialogContent
                className="policy-form-content"
                sx={{
                    px: 3,
                    pt: "28px !important",
                    pb: 3,
                    background: "#f8faff",
                }}
            >

                {submitError && (
                    <Alert
                        severity="error"
                        sx={{
                            mb: 2.5,
                            borderRadius:
                                "10px",
                        }}
                    >
                        {submitError}
                    </Alert>
                )}

                <Box
                    sx={{
                        display: "flex",
                        flexDirection:
                            "column",
                        gap: 2.6,
                    }}
                >

                    {/* =========================================
                        POLICY TITLE
                    ========================================== */}

                    <TextField
                        fullWidth
                        required
                        label="Policy Title"
                        name="PolicyTitle"
                        value={
                            formData.PolicyTitle
                        }
                        onChange={
                            handleChange
                        }
                        error={
                            Boolean(
                                errors.PolicyTitle
                            )
                        }
                        helperText={
                            errors.PolicyTitle ||
                            "Enter the name of the company policy."
                        }
                        disabled={saving}
                        slotProps={{ htmlInput: {
                            maxLength: 200,
                        } }}
                    />

                    {/* =========================================
                        CODE + CATEGORY
                    ========================================== */}

                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: {
                                xs: "1fr",
                                sm: "1fr 1fr",
                            },
                            gap: 2,
                        }}
                    >

                        <TextField
                            fullWidth
                            label="Policy Code"
                            name="PolicyCode"
                            value={
                                formData.PolicyCode
                            }
                            onChange={
                                handleChange
                            }
                            error={
                                Boolean(
                                    errors.PolicyCode
                                )
                            }
                            helperText={
                                errors.PolicyCode ||
                                "Optional. Example: POL-00001"
                            }
                            disabled={saving}
                            slotProps={{ htmlInput: {
                                maxLength: 50,
                            } }}
                        />

                        <FormControl
                            fullWidth
                            required
                            size="small"
                            error={
                                Boolean(
                                    errors.Category
                                )
                            }
                            disabled={saving}
                        >
                            <InputLabel>
                                Category
                            </InputLabel>

                            <Select
                                size="small"
                                name="Category"
                                value={
                                    formData.Category
                                }
                                label="Category"
                                onChange={
                                    handleChange
                                }
                            >
                                <MenuItem value="">
                                    Select Category
                                </MenuItem>

                                <MenuItem value="Leave">
                                    Leave
                                </MenuItem>

                                <MenuItem value="Attendance">
                                    Attendance
                                </MenuItem>

                                <MenuItem value="HR">
                                    HR
                                </MenuItem>

                                <MenuItem value="Finance">
                                    Finance
                                </MenuItem>

                                <MenuItem value="IT">
                                    IT
                                </MenuItem>

                                <MenuItem value="Security">
                                    Security
                                </MenuItem>

                                <MenuItem value="Compliance">
                                    Compliance
                                </MenuItem>

                                <MenuItem value="General">
                                    General
                                </MenuItem>
                            </Select>

                            {errors.Category && (
                                <Typography
                                    sx={{
                                        mt: 0.7,
                                        ml: 1.7,
                                        color:
                                            "#d32f2f",
                                        fontSize:
                                            "12px",
                                    }}
                                >
                                    {
                                        errors.Category
                                    }
                                </Typography>
                            )}
                        </FormControl>

                    </Box>

                    {/* =========================================
                        VERSION + EFFECTIVE DATE
                    ========================================== */}

                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: {
                                xs: "1fr",
                                sm: "1fr 1fr",
                            },
                            gap: 2,
                        }}
                    >

                        <TextField
                            fullWidth
                            required
                            label="Version"
                            name="Version"
                            value={
                                formData.Version
                            }
                            onChange={
                                handleChange
                            }
                            error={
                                Boolean(
                                    errors.Version
                                )
                            }
                            helperText={
                                errors.Version ||
                                "Example: 1.0"
                            }
                            disabled={saving}
                            slotProps={{ htmlInput: {
                                maxLength: 20,
                            } }}
                        />

                        <Box className="policy-effective-date-field">
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    label="Effective Date"
                                    value={formData.EffectiveDate ? dayjs(formData.EffectiveDate) : null}
                                    onChange={(date) => {
                                        setFormData((current) => ({
                                            ...current,
                                            EffectiveDate: date?.isValid() ? date.format("YYYY-MM-DD") : "",
                                        }));
                                        setErrors((current) => ({ ...current, EffectiveDate: "" }));
                                        setSubmitError("");
                                    }}
                                    format="DD-MM-YYYY"
                                    disabled={saving}
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            required: true,
                                            size: "small",
                                            name: "EffectiveDate",
                                            error: Boolean(errors.EffectiveDate),
                                            helperText: errors.EffectiveDate || "Date when the policy becomes effective.",
                                            slotProps: {
                                                inputLabel: { shrink: true },
                                            },
                                        },
                                        calendarHeader: { format: "MMMM YYYY" },
                                    }}
                                />
                            </LocalizationProvider>
                        </Box>

                    </Box>

                    {/* =========================================
                        DESCRIPTION
                    ========================================== */}

                    <TextField
                        fullWidth
                        multiline
                        minRows={4}
                        label="Description"
                        name="Description"
                        value={
                            formData.Description
                        }
                        onChange={
                            handleChange
                        }
                        error={
                            Boolean(
                                errors.Description
                            )
                        }
                        helperText={
                            errors.Description ||
                            `${formData.Description.length}/2000 characters`
                        }
                        disabled={saving}
                        slotProps={{ htmlInput: {
                            maxLength: 2000,
                        } }}
                    />

                    {/* =========================================
                        PDF UPLOAD
                    ========================================== */}

                    <Box>

                        <Typography
                            sx={{
                                mb: 1,
                                color:
                                    "#183b66",
                                fontSize:
                                    "13px",
                                fontWeight:
                                    600,
                            }}
                        >
                            Policy PDF
                            <Box
                                component="span"
                                sx={{
                                    ml: 0.5,
                                    color:
                                        "#d32f2f",
                                }}
                            >
                                *
                            </Box>
                        </Typography>

                        <MuiInputMigration
                            ref={fileInputRef}
                            type="file"
                            className="policy-file-input"
                            accept="application/pdf,.pdf"
                            onChange={
                                handleFileChange
                            }
                        />

                        <Box
                            className="policy-file-dropzone"
                            onClick={() => {
                                if (!saving) {
                                    fileInputRef.current?.click();
                                }
                            }}
                            role="button"
                            tabIndex={saving ? -1 : 0}
                            aria-label={formData.File ? `Selected policy PDF: ${formData.File.name}. Click to replace.` : "Upload policy PDF, maximum 10 megabytes."}
                            onKeyDown={(event) => {
                                if ((event.key === "Enter" || event.key === " ") && !saving) {
                                    event.preventDefault();
                                    fileInputRef.current?.click();
                                }
                            }}
                            sx={{
                                minHeight:
                                    "130px",
                                px: 2,
                                py: 2,
                                display:
                                    "flex",
                                alignItems:
                                    "center",
                                justifyContent:
                                    "center",
                                flexDirection:
                                    "column",
                                border:
                                    errors.File
                                        ? "1px dashed #d32f2f"
                                        : "1px dashed #b9c9dd",
                                borderRadius:
                                    "12px",
                                background:
                                    "#ffffff",
                                cursor: saving
                                    ? "default"
                                    : "pointer",
                                transition:
                                    "all 0.2s ease",
                                "&:hover": {
                                    borderColor:
                                        saving
                                            ? "#b9c9dd"
                                            : "#2867e8",
                                    background:
                                        saving
                                            ? "#ffffff"
                                            : "#f8fbff",
                                },
                            }}
                        >

                            {formData.File ? (
                                <>
                                    <PictureAsPdfRoundedIcon
                                        sx={{
                                            fontSize:
                                                38,
                                            color:
                                                "#ef4444",
                                            mb: 1,
                                        }}
                                    />

                                    <Typography
                                        sx={{
                                            color:
                                                "#173b67",
                                            fontSize:
                                                "13px",
                                            fontWeight:
                                                600,
                                            textAlign:
                                                "center",
                                            wordBreak:
                                                "break-word",
                                        }}
                                    >
                                        {
                                            formData.File
                                                .name
                                        }
                                    </Typography>

                                    <Typography
                                        sx={{
                                            mt: 0.5,
                                            color:
                                                "#7b8fa9",
                                            fontSize:
                                                "11px",
                                        }}
                                    >
                                        {formatFileSize(
                                            formData.File
                                                .size
                                        )}
                                    </Typography>

                                    <Typography
                                        sx={{
                                            mt: 1,
                                            color:
                                                "#2867e8",
                                            fontSize:
                                                "11px",
                                            fontWeight:
                                                600,
                                        }}
                                    >
                                        Click to replace
                                    </Typography>
                                </>
                            ) : (
                                <>
                                    <CloudUploadRoundedIcon
                                        sx={{
                                            fontSize:
                                                38,
                                            color:
                                                "#2867e8",
                                            mb: 1,
                                        }}
                                    />

                                    <Typography
                                        sx={{
                                            color:
                                                "#173b67",
                                            fontSize:
                                                "13px",
                                            fontWeight:
                                                600,
                                        }}
                                    >
                                        Upload Policy PDF
                                    </Typography>

                                    <Typography
                                        sx={{
                                            mt: 0.5,
                                            color:
                                                "#8193aa",
                                            fontSize:
                                                "11px",
                                        }}
                                    >
                                        PDF only • Maximum
                                        10 MB
                                    </Typography>
                                </>
                            )}

                        </Box>

                        {errors.File && (
                            <Typography
                                sx={{
                                    mt: 0.8,
                                    ml: 1.7,
                                    color:
                                        "#d32f2f",
                                    fontSize:
                                        "12px",
                                }}
                            >
                                {errors.File}
                            </Typography>
                        )}

                    </Box>

                    {/* =========================================
                        ACKNOWLEDGEMENT
                    ========================================== */}

                    <Box
                        sx={{
                            px: 1.5,
                            py: 1,
                            background:
                                "#ffffff",
                            border:
                                "1px solid #e1e8f2",
                            borderRadius:
                                "10px",
                        }}
                    >

                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={
                                        formData.AcknowledgementRequired
                                    }
                                    onChange={
                                        handleAcknowledgementChange
                                    }
                                    disabled={
                                        saving
                                    }
                                    sx={{
                                        color:
                                            "#9bb0c9",
                                        "&.Mui-checked":
                                            {
                                                color:
                                                    "#2867e8",
                                            },
                                    }}
                                />
                            }
                            label={
                                <Box>
                                    <Typography
                                        sx={{
                                            color:
                                                "#183b66",
                                            fontSize:
                                                "13px",
                                            fontWeight:
                                                600,
                                        }}
                                    >
                                        Acknowledgement Required
                                    </Typography>

                                    <Typography
                                        sx={{
                                            color:
                                                "#7b8fa9",
                                            fontSize:
                                                "11px",
                                        }}
                                    >
                                        Employees will be
                                        required to acknowledge
                                        this policy.
                                    </Typography>
                                </Box>
                            }
                        />

                    </Box>

                </Box>

            </DialogContent>

            {/* =================================================
                ACTIONS
            ================================================== */}

            <DialogActions
                sx={{
                    px: 3,
                    py: 2,
                    gap: 1,
                    borderTop:
                        "1px solid #e7edf5",
                    background:
                        "#ffffff",
                }}
            >

                <Button
                    onClick={handleClose}
                    disabled={saving}
                    sx={{
                        minWidth: 100,
                        height: 46,
                        px: 2,
                        border:
                            "1px solid #d6e0ec",
                        borderRadius:
                            "11px",
                        color:
                            "#587292",
                        fontSize:
                            "13px",
                        fontWeight:
                            600,
                        textTransform:
                            "none",
                        "&:hover": {
                            background:
                                "#f6f8fb",
                            borderColor:
                                "#c7d4e4",
                        },
                    }}
                >
                    Cancel
                </Button>

                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={saving}
                    startIcon={
                        saving ? (
                            <CircularProgress
                                size={17}
                                color="inherit"
                            />
                        ) : null
                    }
                    sx={{
                        minWidth: 150,
                        height: 46,
                        px: 2.5,
                        borderRadius:
                            "11px",
                        background:
                            "linear-gradient(135deg, #3675ee, #5144d8)",
                        color:
                            "#ffffff",
                        fontSize:
                            "13px",
                        fontWeight:
                            700,
                        textTransform:
                            "none",
                        boxShadow:
                            "0 5px 12px rgba(40, 103, 232, 0.18)",
                        "&:hover": {
                            background:
                                "linear-gradient(135deg, #2867de, #4437ca)",
                            boxShadow:
                                "0 7px 16px rgba(40, 103, 232, 0.24)",
                        },
                        "&.Mui-disabled": {
                            background:
                                "#a9bee5",
                            color:
                                "#ffffff",
                        },
                    }}
                >
                    {saving
                        ? "Saving..."
                        : "Save Draft"}
                </Button>

            </DialogActions>

        </Dialog>
    );
};

export default PolicyForm;
