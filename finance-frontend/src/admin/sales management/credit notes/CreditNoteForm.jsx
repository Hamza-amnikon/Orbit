import React from "react";

import {
    Box,
    Button,
    Card,
    CardContent,
    Divider,
    IconButton,
    TextField,
    Typography,
} from "@mui/material";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

import "./CreditNotes.css";

const CreditNoteForm = ({ onClose }) => {

    const handleSubmit = (event) => {
        event.preventDefault();
    };

    return (
        <Box
            component="form"
            className="credit-note-form"
            onSubmit={handleSubmit}
        >

            {/* Form Header */}
            <Box className="credit-note-form-header">

                <Box>
                    <Typography className="credit-note-form-title">
                        New Credit Note
                    </Typography>

                    <Typography className="credit-note-form-subtitle">
                        Create a credit note for a customer
                    </Typography>
                </Box>

                <IconButton
                    className="credit-note-close-button"
                    onClick={onClose}
                >
                    <CloseRoundedIcon />
                </IconButton>

            </Box>

            {/* Credit Note Information */}
            <Card className="credit-note-form-card">
                <CardContent>

                    <Typography className="credit-note-form-section-title">
                        Credit Note Information
                    </Typography>

                    <Box className="credit-note-form-grid">

                        <TextField
                            select
                            label="Customer"
                            defaultValue=""
                            SelectProps={{
                                native: true,
                            }}
                            fullWidth
                        >
                            <option value=""></option>
                            <option value="ABC Technologies">
                                ABC Technologies
                            </option>
                            <option value="Global Solutions">
                                Global Solutions
                            </option>
                            <option value="TechNova Pvt Ltd">
                                TechNova Pvt Ltd
                            </option>
                            <option value="Bright Enterprises">
                                Bright Enterprises
                            </option>
                        </TextField>

                        <TextField
                            label="Credit Note Number"
                            defaultValue="CN-005"
                            fullWidth
                        />

                        <TextField
                            label="Credit Date"
                            type="date"
                            defaultValue="2026-10-05"
                            InputLabelProps={{
                                shrink: true,
                            }}
                            fullWidth
                        />

                        <TextField
                            select
                            label="Invoice"
                            defaultValue=""
                            SelectProps={{
                                native: true,
                            }}
                            fullWidth
                        >
                            <option value=""></option>
                            <option value="INV-001">
                                INV-001
                            </option>
                            <option value="INV-002">
                                INV-002
                            </option>
                            <option value="INV-003">
                                INV-003
                            </option>
                            <option value="INV-004">
                                INV-004
                            </option>
                        </TextField>

                        <TextField
                            label="Reason"
                            placeholder="Enter reason for credit note"
                            fullWidth
                        />

                        <TextField
                            label="Reference"
                            placeholder="Enter reference"
                            fullWidth
                        />

                    </Box>

                </CardContent>
            </Card>

            {/* Credit Note Details */}
            <Card className="credit-note-form-card">
                <CardContent>

                    <Typography className="credit-note-form-section-title">
                        Credit Note Details
                    </Typography>

                    <Box className="credit-note-form-grid">

                        <TextField
                            label="Item / Service"
                            placeholder="Enter item or service"
                            fullWidth
                        />

                        <TextField
                            label="Description"
                            placeholder="Enter description"
                            fullWidth
                        />

                    </Box>

                </CardContent>
            </Card>

            {/* Pricing */}
            <Card className="credit-note-form-card">
                <CardContent>

                    <Typography className="credit-note-form-section-title">
                        Pricing
                    </Typography>

                    <Box className="credit-note-form-grid">

                        <TextField
                            label="Quantity"
                            type="number"
                            defaultValue="1"
                            fullWidth
                        />

                        <TextField
                            label="Rate"
                            type="number"
                            defaultValue="10000"
                            fullWidth
                        />

                        <TextField
                            label="Discount"
                            type="number"
                            defaultValue="0"
                            fullWidth
                        />

                        <TextField
                            select
                            label="Tax"
                            defaultValue="18"
                            SelectProps={{
                                native: true,
                            }}
                            fullWidth
                        >
                            <option value="0">0%</option>
                            <option value="5">5%</option>
                            <option value="12">12%</option>
                            <option value="18">18%</option>
                            <option value="28">28%</option>
                        </TextField>

                    </Box>

                </CardContent>
            </Card>

            {/* Additional Information */}
            <Card className="credit-note-form-card">
                <CardContent>

                    <Typography className="credit-note-form-section-title">
                        Additional Information
                    </Typography>

                    <Box className="credit-note-form-grid">

                        <TextField
                            label="Notes"
                            placeholder="Enter notes"
                            multiline
                            rows={3}
                            fullWidth
                        />

                        <TextField
                            label="Terms & Conditions"
                            placeholder="Enter terms and conditions"
                            multiline
                            rows={3}
                            fullWidth
                        />

                    </Box>

                </CardContent>
            </Card>

            {/* Summary */}
            <Card className="credit-note-summary-card">

                <CardContent>

                    <Typography className="credit-note-form-section-title">
                        Credit Note Summary
                    </Typography>

                    <Box className="credit-note-summary-row">
                        <Typography>
                            Subtotal
                        </Typography>

                        <Typography>
                            ₹10,000
                        </Typography>
                    </Box>

                    <Box className="credit-note-summary-row">
                        <Typography>
                            Discount
                        </Typography>

                        <Typography>
                            ₹0
                        </Typography>
                    </Box>

                    <Box className="credit-note-summary-row">
                        <Typography>
                            Tax
                        </Typography>

                        <Typography>
                            ₹1,800
                        </Typography>
                    </Box>

                    <Divider />

                    <Box className="credit-note-grand-total-row">
                        <Typography>
                            Total Credit Amount
                        </Typography>

                        <Typography>
                            ₹11,800
                        </Typography>
                    </Box>

                </CardContent>

            </Card>

            {/* Actions */}
            <Box className="credit-note-form-actions">

                <Button
                    variant="outlined"
                    className="credit-note-cancel-button"
                    onClick={onClose}
                >
                    Cancel
                </Button>

                <Button
                    type="submit"
                    variant="contained"
                    className="credit-note-save-button"
                >
                    Save Credit Note
                </Button>

            </Box>

        </Box>
    );
};

export default CreditNoteForm;