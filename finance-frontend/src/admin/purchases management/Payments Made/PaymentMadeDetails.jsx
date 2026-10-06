import React from "react";
import {
    Box,
    Button,
    Card,
    Typography,
} from "@mui/material";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import PrintRoundedIcon from "@mui/icons-material/PrintRounded";
import PaymentRoundedIcon from "@mui/icons-material/PaymentRounded";

import "./PaymentMadeDetails.css";

const PaymentMadeDetails = ({ onBack }) => {
    return (
        <Box className="payment-made-details-page">

            {/* Top Header */}

            <Box className="payment-made-details-top">

                <Button
                    startIcon={<ArrowBackRoundedIcon />}
                    onClick={onBack}
                    className="payment-made-back-button"
                >
                    Back to Payments Made
                </Button>

                <Button
                    variant="contained"
                    startIcon={<PrintRoundedIcon />}
                    className="payment-made-print-button"
                >
                    Print
                </Button>

            </Box>

            {/* Title */}

            <Box className="payment-made-details-heading">

                <Box className="payment-made-details-icon">
                    <PaymentRoundedIcon />
                </Box>

                <Box>
                    <Typography className="payment-made-details-title">
                        Payment Details
                    </Typography>

                    <Typography className="payment-made-details-subtitle">
                        View payment information and transaction details
                    </Typography>
                </Box>

            </Box>

            <Card className="payment-made-details-card">

                {/* Company */}

                <Box className="payment-made-company">

                    <Box>
                        <Typography className="company-name">
                            AMNIKON TECHNOLOGIES
                        </Typography>

                        <Typography className="company-address">
                            Mumbai, Maharashtra, India
                        </Typography>
                    </Box>

                    <Box className="payment-document">

                        <Typography className="payment-document-label">
                            PAYMENT
                        </Typography>

                        <Typography className="payment-document-number">
                            PAY-001
                        </Typography>

                        <span className="payment-details-status">
                            Paid
                        </span>

                    </Box>

                </Box>

                {/* Vendor */}

                <Box className="payment-details-section">

                    <Typography className="payment-details-section-title">
                        Vendor Information
                    </Typography>

                    <Box className="payment-details-grid">

                        <Box>
                            <span>Vendor</span>
                            <strong>ABC Suppliers</strong>
                        </Box>

                        <Box>
                            <span>Contact Person</span>
                            <strong>Rahul Sharma</strong>
                        </Box>

                        <Box>
                            <span>Email</span>
                            <strong>accounts@abcsuppliers.com</strong>
                        </Box>

                        <Box>
                            <span>Phone</span>
                            <strong>9876543210</strong>
                        </Box>

                    </Box>

                </Box>

                {/* Payment Information */}

                <Box className="payment-details-section">

                    <Typography className="payment-details-section-title">
                        Payment Information
                    </Typography>

                    <Box className="payment-details-grid">

                        <Box>
                            <span>Payment ID</span>
                            <strong>PAY-001</strong>
                        </Box>

                        <Box>
                            <span>Payment Date</span>
                            <strong>06 Oct 2026</strong>
                        </Box>

                        <Box>
                            <span>Bill Number</span>
                            <strong>BILL-001</strong>
                        </Box>

                        <Box>
                            <span>Reference Number</span>
                            <strong>PAY-REF-001</strong>
                        </Box>

                        <Box>
                            <span>Payment Method</span>
                            <strong>Bank Transfer</strong>
                        </Box>

                        <Box>
                            <span>Transaction ID</span>
                            <strong>TXN-20261006-001</strong>
                        </Box>

                    </Box>

                </Box>

                {/* Amount */}

                <Box className="payment-made-amount-box">

                    <span>Payment Amount</span>

                    <strong>
                        ₹2,95,000
                    </strong>

                </Box>

                {/* Bank */}

                <Box className="payment-details-section">

                    <Typography className="payment-details-section-title">
                        Bank Information
                    </Typography>

                    <Box className="payment-details-grid">

                        <Box>
                            <span>Bank Name</span>
                            <strong>HDFC Bank</strong>
                        </Box>

                        <Box>
                            <span>Account Number</span>
                            <strong>XXXXXX4589</strong>
                        </Box>

                        <Box>
                            <span>Payment Terms</span>
                            <strong>Net 30</strong>
                        </Box>

                        <Box>
                            <span>Status</span>
                            <strong>Paid</strong>
                        </Box>

                    </Box>

                </Box>

                {/* Notes */}

                <Box className="payment-details-notes">

                    <Typography className="payment-details-section-title">
                        Notes
                    </Typography>

                    <Typography>
                        Payment made against vendor bill BILL-001.
                    </Typography>

                </Box>

            </Card>

        </Box>
    );
};

export default PaymentMadeDetails;