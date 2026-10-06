import React from "react";

import {
    Box,
    Button,
    Card,
    CardContent,
    Divider,
    Typography,
} from "@mui/material";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import PrintRoundedIcon from "@mui/icons-material/PrintRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";

import "./CreditNoteDetails.css";
import "./CreditNotes.css";
const CreditNoteDetails = ({ onBack, onEdit }) => {
    return (
        <Box className="credit-note-details-page">

            {/* Page Header */}
            <Box className="credit-note-details-header">

                <Box>
                    <Button
                        startIcon={<ArrowBackRoundedIcon />}
                        className="credit-note-back-button"
                        onClick={onBack}
                    >
                        Back to Credit Notes
                    </Button>

                    <Typography className="credit-note-details-title">
                        Credit Note Details
                    </Typography>

                    <Typography className="credit-note-details-subtitle">
                        View credit note information and transaction details
                    </Typography>
                </Box>

                <Box className="credit-note-details-actions">

                    <Button
                        variant="outlined"
                        startIcon={<PrintRoundedIcon />}
                        className="credit-note-action-button"
                    >
                        Print
                    </Button>

                    <Button
                        variant="outlined"
                        startIcon={<EditRoundedIcon />}
                        className="credit-note-action-button"
                        onClick={onEdit}
                    >
                        Edit
                    </Button>

                    <Button
                        variant="contained"
                        startIcon={<SendRoundedIcon />}
                        className="credit-note-send-button"
                    >
                        Send
                    </Button>

                </Box>

            </Box>

            {/* Credit Note Document */}
            <Card className="credit-note-details-card">

                <CardContent>

                    {/* Company / Credit Note Header */}
                    <Box className="credit-note-document-header">

                        <Box>
                            <Typography className="credit-note-company-name">
                                AMNIKON TECHNOLOGIES
                            </Typography>

                            <Typography className="credit-note-company-info">
                                Mumbai, Maharashtra, India
                            </Typography>

                            <Typography className="credit-note-company-info">
                                finance@amnikon.com
                            </Typography>
                        </Box>

                        <Box className="credit-note-document-number">

                            <Typography className="credit-note-document-label">
                                CREDIT NOTE
                            </Typography>

                            <Typography className="credit-note-number-large">
                                CN-001
                            </Typography>

                            <Box className="credit-note-details-status issued">
                                Issued
                            </Box>

                        </Box>

                    </Box>

                    <Divider />

                    {/* Customer + Credit Note Information */}
                    <Box className="credit-note-info-grid">

                        <Box>
                            <Typography className="credit-note-info-title">
                                CREDIT TO
                            </Typography>

                            <Typography className="credit-note-customer-name">
                                ABC Technologies
                            </Typography>

                            <Typography className="credit-note-info-text">
                                Rahul Sharma
                            </Typography>

                            <Typography className="credit-note-info-text">
                                Mumbai, Maharashtra, India
                            </Typography>

                            <Typography className="credit-note-info-text">
                                rahul@abctech.com
                            </Typography>
                        </Box>

                        <Box>

                            <Box className="credit-note-info-row">
                                <Typography>
                                    Credit Note Date
                                </Typography>

                                <Typography>
                                    06 Oct 2026
                                </Typography>
                            </Box>

                            <Box className="credit-note-info-row">
                                <Typography>
                                    Invoice
                                </Typography>

                                <Typography className="credit-note-info-value">
                                    INV-001
                                </Typography>
                            </Box>

                            <Box className="credit-note-info-row">
                                <Typography>
                                    Reason
                                </Typography>

                                <Typography>
                                    Service adjustment
                                </Typography>
                            </Box>

                            <Box className="credit-note-info-row">
                                <Typography>
                                    Reference
                                </Typography>

                                <Typography>
                                    CN-ADJ-001
                                </Typography>
                            </Box>

                        </Box>

                    </Box>

                    <Divider />

                    {/* Item Details */}
                    <Box className="credit-note-item-section">

                        <Typography className="credit-note-section-title">
                            Credit Note Details
                        </Typography>

                        <Box className="credit-note-item-table">

                            <Box className="credit-note-item-header">
                                <Typography>
                                    Item / Service
                                </Typography>

                                <Typography>
                                    Description
                                </Typography>

                                <Typography>
                                    Qty
                                </Typography>

                                <Typography>
                                    Rate
                                </Typography>

                                <Typography>
                                    Tax
                                </Typography>

                                <Typography>
                                    Amount
                                </Typography>
                            </Box>

                            <Box className="credit-note-item-row">

                                <Typography className="credit-note-item-name">
                                    Website Development
                                </Typography>

                                <Typography>
                                    Service adjustment for website project
                                </Typography>

                                <Typography>
                                    1
                                </Typography>

                                <Typography>
                                    ₹10,000
                                </Typography>

                                <Typography>
                                    18%
                                </Typography>

                                <Typography className="credit-note-item-amount">
                                    ₹11,800
                                </Typography>

                            </Box>

                        </Box>

                    </Box>

                    <Divider />

                    {/* Summary */}
                    <Box className="credit-note-details-summary">

                        <Box className="credit-note-summary-content">

                            <Box className="credit-note-details-summary-row">
                                <Typography>
                                    Subtotal
                                </Typography>

                                <Typography>
                                    ₹10,000
                                </Typography>
                            </Box>

                            <Box className="credit-note-details-summary-row">
                                <Typography>
                                    Discount
                                </Typography>

                                <Typography>
                                    ₹0
                                </Typography>
                            </Box>

                            <Box className="credit-note-details-summary-row">
                                <Typography>
                                    Tax
                                </Typography>

                                <Typography>
                                    ₹1,800
                                </Typography>
                            </Box>

                            <Divider />

                            <Box className="credit-note-details-total-row">
                                <Typography>
                                    Total Credit Amount
                                </Typography>

                                <Typography>
                                    ₹11,800
                                </Typography>
                            </Box>

                        </Box>

                    </Box>

                    {/* Notes */}
                    <Box className="credit-note-notes-section">

                        <Typography className="credit-note-section-title">
                            Notes
                        </Typography>

                        <Typography className="credit-note-notes-text">
                            Credit issued against the original invoice for
                            service adjustment.
                        </Typography>

                    </Box>

                    {/* Terms */}
                    <Box className="credit-note-notes-section">

                        <Typography className="credit-note-section-title">
                            Terms & Conditions
                        </Typography>

                        <Typography className="credit-note-notes-text">
                            This credit note will be adjusted against the
                            customer's outstanding invoice balance.
                        </Typography>

                    </Box>

                    {/* Footer Actions */}
                    <Box className="credit-note-details-footer">

                        <Button
                            variant="outlined"
                            startIcon={<ReplayRoundedIcon />}
                            className="credit-note-apply-button"
                        >
                            Apply Credit
                        </Button>

                        <Typography className="credit-note-footer-text">
                            Credit Note CN-001 • Linked Invoice INV-001
                        </Typography>

                    </Box>

                </CardContent>

            </Card>

        </Box>
    );
};

export default CreditNoteDetails;