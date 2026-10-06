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
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";

import "./PaymentReceivedDetails.css";

const PaymentReceivedDetails = ({ onBack, onEdit }) => {
    return (
        <Box className="payment-details-page">

            {/* =========================================
                PAGE HEADER
            ========================================= */}

            <Box className="payment-details-header">

                <Box>
                    <Button
                        startIcon={<ArrowBackRoundedIcon />}
                        onClick={onBack}
                        className="payment-back-button"
                    >
                        Back to Payments Received
                    </Button>

                    <Typography className="payment-details-title">
                        Payment Details
                    </Typography>

                    <Typography className="payment-details-subtitle">
                        View payment transaction details
                    </Typography>
                </Box>

                <Box className="payment-details-actions">

                    <Button
                        variant="outlined"
                        startIcon={<PrintRoundedIcon />}
                        className="payment-action-button"
                    >
                        Print
                    </Button>

                    <Button
                        variant="outlined"
                        startIcon={<EditRoundedIcon />}
                        onClick={onEdit}
                        className="payment-action-button"
                    >
                        Edit
                    </Button>

                </Box>

            </Box>

            {/* =========================================
                PAYMENT DETAILS CARD
            ========================================= */}

            <Card className="payment-details-card">

                <CardContent>

                    {/* Document Header */}
                    <Box className="payment-document-header">

                        <Box>

                            <Typography className="payment-company-name">
                                AMNIKON TECHNOLOGIES
                            </Typography>

                            <Typography className="payment-company-info">
                                Mumbai, Maharashtra
                            </Typography>

                            <Typography className="payment-company-info">
                                finance@amnikon.com
                            </Typography>

                        </Box>

                        <Box className="payment-document-number">

                            <Typography className="payment-document-label">
                                PAYMENT RECEIPT
                            </Typography>

                            <Typography className="payment-number-large">
                                PAY-001
                            </Typography>

                            <Box className="payment-details-status received">
                                Received
                            </Box>

                        </Box>

                    </Box>

                    <Divider sx={{ margin: "24px 0" }} />

                    {/* =========================================
                        CUSTOMER INFORMATION
                    ========================================= */}

                    <Box className="payment-info-grid">

                        <Box>

                            <Typography className="payment-info-title">
                                Received From
                            </Typography>

                            <Typography className="payment-customer-name">
                                ABC Technologies
                            </Typography>

                            <Typography className="payment-info-text">
                                Rahul Sharma
                            </Typography>

                            <Typography className="payment-info-text">
                                Mumbai, Maharashtra
                            </Typography>

                            <Typography className="payment-info-text">
                                rahul@abctech.com
                            </Typography>

                        </Box>

                        <Box>

                            <Box className="payment-info-row">
                                <Typography>
                                    Payment Date
                                </Typography>

                                <Typography>
                                    06 Oct 2026
                                </Typography>
                            </Box>

                            <Box className="payment-info-row">
                                <Typography>
                                    Payment Number
                                </Typography>

                                <Typography>
                                    PAY-001
                                </Typography>
                            </Box>

                            <Box className="payment-info-row">
                                <Typography>
                                    Invoice
                                </Typography>

                                <Typography>
                                    INV-001
                                </Typography>
                            </Box>

                            <Box className="payment-info-row">
                                <Typography>
                                    Payment Method
                                </Typography>

                                <Typography>
                                    Bank Transfer
                                </Typography>
                            </Box>

                            <Box className="payment-info-row">
                                <Typography>
                                    Reference Number
                                </Typography>

                                <Typography>
                                    TXN-984523
                                </Typography>
                            </Box>

                        </Box>

                    </Box>

                    <Divider sx={{ margin: "24px 0" }} />

                    {/* =========================================
                        PAYMENT INFORMATION
                    ========================================= */}

                    <Typography className="payment-section-title">
                        Payment Information
                    </Typography>

                    <Box className="payment-item-section">

                        <Box className="payment-item-table payment-item-header">

                            <Typography>
                                Description
                            </Typography>

                            <Typography>
                                Invoice
                            </Typography>

                            <Typography>
                                Amount
                            </Typography>

                        </Box>

                        <Box className="payment-item-table payment-item-row">

                            <Typography>
                                Payment against invoice
                            </Typography>

                            <Typography>
                                INV-001
                            </Typography>

                            <Typography className="payment-item-amount">
                                ₹88,500
                            </Typography>

                        </Box>

                    </Box>

                    {/* =========================================
                        PAYMENT SUMMARY
                    ========================================= */}

                    <Box className="payment-details-summary">

                        <Box className="payment-summary-content">

                            <Box className="payment-details-summary-row">

                                <Typography>
                                    Invoice Amount
                                </Typography>

                                <Typography>
                                    ₹88,500
                                </Typography>

                            </Box>

                            <Box className="payment-details-summary-row">

                                <Typography>
                                    Amount Received
                                </Typography>

                                <Typography>
                                    ₹88,500
                                </Typography>

                            </Box>

                            <Divider sx={{ margin: "10px 0" }} />

                            <Box className="payment-details-total-row">

                                <Typography>
                                    Total Received
                                </Typography>

                                <Typography>
                                    ₹88,500
                                </Typography>

                            </Box>

                        </Box>

                    </Box>

                    {/* =========================================
                        NOTES
                    ========================================= */}

                    <Box className="payment-notes-section">

                        <Typography className="payment-section-title">
                            Notes
                        </Typography>

                        <Typography className="payment-notes-text">
                            Payment received against invoice INV-001
                            through bank transfer.
                        </Typography>

                    </Box>

                    {/* =========================================
                        FOOTER
                    ========================================= */}

                    <Box className="payment-details-footer">

                        <Typography className="payment-footer-text">
                            This payment is linked to invoice INV-001.
                        </Typography>

                        <Button
                            variant="outlined"
                            startIcon={<ReplayRoundedIcon />}
                            className="payment-footer-button"
                        >
                            Refund Payment
                        </Button>

                    </Box>

                </CardContent>

            </Card>

        </Box>
    );
};

export default PaymentReceivedDetails;