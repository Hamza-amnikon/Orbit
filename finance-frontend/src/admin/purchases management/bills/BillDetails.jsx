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

import "./BillDetails.css";

const BillDetails = ({ onBack }) => {
    return (
        <Box className="bill-details-page">

            {/* Header */}
            <Box className="bill-details-header">

                <Box>
                    <Button
                        startIcon={<ArrowBackRoundedIcon />}
                        className="bill-back-button"
                        onClick={onBack}
                    >
                        Back to Bills
                    </Button>

                    <Typography className="bill-details-title">
                        Bill Details
                    </Typography>

                    <Typography className="bill-details-subtitle">
                        View vendor bill information and payment details
                    </Typography>
                </Box>

                <Box className="bill-details-actions">

                    <Button
                        variant="outlined"
                        startIcon={<PrintRoundedIcon />}
                        className="bill-print-button"
                    >
                        Print
                    </Button>

                </Box>

            </Box>

            {/* Bill Document */}
            <Card className="bill-details-card">
                <CardContent>

                    {/* Document Header */}
                    <Box className="bill-document-header">

                        <Box>
                            <Typography className="bill-company-name">
                                AMNIKON TECHNOLOGIES
                            </Typography>

                            <Typography className="bill-company-info">
                                Mumbai, Maharashtra
                            </Typography>

                            <Typography className="bill-company-info">
                                finance@amnikon.com
                            </Typography>
                        </Box>

                        <Box className="bill-document-right">

                            <Typography className="bill-document-label">
                                VENDOR BILL
                            </Typography>

                            <Typography className="bill-number-large">
                                BILL-001
                            </Typography>

                            <Box className="bill-details-status pending">
                                Pending
                            </Box>

                        </Box>

                    </Box>

                    <Divider className="bill-details-divider" />

                    {/* Vendor Information */}
                    <Typography className="bill-section-title">
                        Vendor Information
                    </Typography>

                    <Box className="bill-info-grid">

                        <Box>
                            <Typography className="bill-info-label">
                                Vendor Name
                            </Typography>

                            <Typography className="bill-info-value">
                                ABC Suppliers
                            </Typography>
                        </Box>

                        <Box>
                            <Typography className="bill-info-label">
                                Contact Person
                            </Typography>

                            <Typography className="bill-info-value">
                                Rahul Sharma
                            </Typography>
                        </Box>

                        <Box>
                            <Typography className="bill-info-label">
                                Email
                            </Typography>

                            <Typography className="bill-info-value">
                                accounts@abcsuppliers.com
                            </Typography>
                        </Box>

                        <Box>
                            <Typography className="bill-info-label">
                                Phone
                            </Typography>

                            <Typography className="bill-info-value">
                                9876543210
                            </Typography>
                        </Box>

                    </Box>

                    <Divider className="bill-details-divider" />

                    {/* Bill Information */}
                    <Typography className="bill-section-title">
                        Bill Information
                    </Typography>

                    <Box className="bill-info-grid">

                        <Box>
                            <Typography className="bill-info-label">
                                Bill Number
                            </Typography>

                            <Typography className="bill-info-value">
                                BILL-001
                            </Typography>
                        </Box>

                        <Box>
                            <Typography className="bill-info-label">
                                Purchase Order
                            </Typography>

                            <Typography className="bill-info-value">
                                PO-001
                            </Typography>
                        </Box>

                        <Box>
                            <Typography className="bill-info-label">
                                Bill Date
                            </Typography>

                            <Typography className="bill-info-value">
                                06 Oct 2026
                            </Typography>
                        </Box>

                        <Box>
                            <Typography className="bill-info-label">
                                Due Date
                            </Typography>

                            <Typography className="bill-info-value">
                                05 Nov 2026
                            </Typography>
                        </Box>

                        <Box>
                            <Typography className="bill-info-label">
                                Reference Number
                            </Typography>

                            <Typography className="bill-info-value">
                                REF-001
                            </Typography>
                        </Box>

                        <Box>
                            <Typography className="bill-info-label">
                                Payment Terms
                            </Typography>

                            <Typography className="bill-info-value">
                                Net 30
                            </Typography>
                        </Box>

                    </Box>

                    <Divider className="bill-details-divider" />

                    {/* Item Details */}
                    <Typography className="bill-section-title">
                        Item / Service Details
                    </Typography>

                    <Box className="bill-item-table">

                        <Box className="bill-item-table-header">
                            <Typography>Item / Service</Typography>
                            <Typography>Description</Typography>
                            <Typography>Qty</Typography>
                            <Typography>Rate</Typography>
                            <Typography>Tax</Typography>
                            <Typography>Amount</Typography>
                        </Box>

                        <Box className="bill-item-table-row">

                            <Typography>
                                Office Laptops
                            </Typography>

                            <Typography>
                                Business laptops for employees
                            </Typography>

                            <Typography>
                                10
                            </Typography>

                            <Typography>
                                ₹50,000
                            </Typography>

                            <Typography>
                                18%
                            </Typography>

                            <Typography className="bill-item-amount">
                                ₹5,90,000
                            </Typography>

                        </Box>

                    </Box>

                    <Divider className="bill-details-divider" />

                    {/* Total */}
                    <Box className="bill-total-section">

                        <Box className="bill-total-box">

                            <Box className="bill-total-line">
                                <Typography>
                                    Sub Total
                                </Typography>

                                <Typography>
                                    ₹5,00,000
                                </Typography>
                            </Box>

                            <Box className="bill-total-line">
                                <Typography>
                                    Discount
                                </Typography>

                                <Typography>
                                    ₹0
                                </Typography>
                            </Box>

                            <Box className="bill-total-line">
                                <Typography>
                                    Tax
                                </Typography>

                                <Typography>
                                    ₹90,000
                                </Typography>
                            </Box>

                            <Divider />

                            <Box className="bill-total-final">
                                <Typography>
                                    Total
                                </Typography>

                                <Typography>
                                    ₹5,90,000
                                </Typography>
                            </Box>

                        </Box>

                    </Box>

                    <Divider className="bill-details-divider" />

                    {/* Billing & Shipping */}
                    <Typography className="bill-section-title">
                        Billing & Shipping Address
                    </Typography>

                    <Box className="bill-address-grid">

                        <Box className="bill-address-box">
                            <Typography className="bill-address-title">
                                Billing Address
                            </Typography>

                            <Typography>
                                12 Business Park,
                            </Typography>

                            <Typography>
                                Andheri East,
                            </Typography>

                            <Typography>
                                Mumbai, Maharashtra - 400069
                            </Typography>

                            <Typography>
                                India
                            </Typography>
                        </Box>

                        <Box className="bill-address-box">
                            <Typography className="bill-address-title">
                                Shipping Address
                            </Typography>

                            <Typography>
                                12 Business Park,
                            </Typography>

                            <Typography>
                                Andheri East,
                            </Typography>

                            <Typography>
                                Mumbai, Maharashtra - 400069
                            </Typography>

                            <Typography>
                                India
                            </Typography>
                        </Box>

                    </Box>

                    <Divider className="bill-details-divider" />

                    {/* Notes */}
                    <Typography className="bill-section-title">
                        Notes
                    </Typography>

                    <Typography className="bill-notes">
                        Payment should be completed within the agreed payment
                        terms. Please ensure all supplied laptops and accessories
                        are delivered with the applicable warranty documents.
                    </Typography>

                    <Divider className="bill-details-divider" />

                    {/* Terms */}
                    <Typography className="bill-section-title">
                        Terms & Conditions
                    </Typography>

                    <Typography className="bill-notes">
                        Payment terms are Net 30 days from the bill date.
                        Goods must meet the agreed specifications and quality
                        requirements.
                    </Typography>

                </CardContent>
            </Card>

        </Box>
    );
};

export default BillDetails;