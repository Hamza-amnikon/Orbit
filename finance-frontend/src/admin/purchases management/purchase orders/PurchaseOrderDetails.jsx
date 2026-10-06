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

import "./PurchaseOrderDetails.css";

const PurchaseOrderDetails = ({ onBack }) => {
    return (
        <Box className="purchase-order-details-page">

            {/* Header */}
            <Box className="purchase-order-details-header">

                <Box>
                    <Button
                        startIcon={<ArrowBackRoundedIcon />}
                        className="purchase-order-back-button"
                        onClick={onBack}
                    >
                        Back to Purchase Orders
                    </Button>

                    <Typography className="purchase-order-details-title">
                        Purchase Order Details
                    </Typography>

                    <Typography className="purchase-order-details-subtitle">
                        View purchase order information and item details
                    </Typography>
                </Box>

                <Box className="purchase-order-details-actions">

                    <Button
                        variant="outlined"
                        startIcon={<PrintRoundedIcon />}
                        className="purchase-order-print-button"
                    >
                        Print
                    </Button>

                </Box>

            </Box>

            {/* Main Card */}
            <Card className="purchase-order-details-card">

                <CardContent>

                    {/* Document Header */}
                    <Box className="purchase-order-document-header">

                        <Box>
                            <Typography className="purchase-order-company-name">
                                AMNIKON TECHNOLOGIES
                            </Typography>

                            <Typography className="purchase-order-company-info">
                                Mumbai, Maharashtra
                            </Typography>

                            <Typography className="purchase-order-company-info">
                                finance@amnikon.com
                            </Typography>
                        </Box>

                        <Box className="purchase-order-document-right">

                            <Typography className="purchase-order-document-label">
                                PURCHASE ORDER
                            </Typography>

                            <Typography className="purchase-order-number-large">
                                PO-001
                            </Typography>

                            <Box className="purchase-order-details-status confirmed">
                                Confirmed
                            </Box>

                        </Box>

                    </Box>

                    <Divider className="purchase-order-details-divider" />

                    {/* Vendor Information */}
                    <Typography className="purchase-order-section-title">
                        Vendor Information
                    </Typography>

                    <Box className="purchase-order-info-grid">

                        <Box className="purchase-order-info-item">
                            <Typography className="purchase-order-info-label">
                                Vendor Name
                            </Typography>

                            <Typography className="purchase-order-info-value">
                                ABC Suppliers
                            </Typography>
                        </Box>

                        <Box className="purchase-order-info-item">
                            <Typography className="purchase-order-info-label">
                                Contact Person
                            </Typography>

                            <Typography className="purchase-order-info-value">
                                Rahul Sharma
                            </Typography>
                        </Box>

                        <Box className="purchase-order-info-item">
                            <Typography className="purchase-order-info-label">
                                Email
                            </Typography>

                            <Typography className="purchase-order-info-value">
                                accounts@abcsuppliers.com
                            </Typography>
                        </Box>

                        <Box className="purchase-order-info-item">
                            <Typography className="purchase-order-info-label">
                                Phone
                            </Typography>

                            <Typography className="purchase-order-info-value">
                                9876543210
                            </Typography>
                        </Box>

                    </Box>

                    <Divider className="purchase-order-details-divider" />

                    {/* Purchase Order Information */}
                    <Typography className="purchase-order-section-title">
                        Purchase Order Information
                    </Typography>

                    <Box className="purchase-order-info-grid">

                        <Box className="purchase-order-info-item">
                            <Typography className="purchase-order-info-label">
                                Purchase Order Number
                            </Typography>

                            <Typography className="purchase-order-info-value">
                                PO-001
                            </Typography>
                        </Box>

                        <Box className="purchase-order-info-item">
                            <Typography className="purchase-order-info-label">
                                Order Date
                            </Typography>

                            <Typography className="purchase-order-info-value">
                                06 Oct 2026
                            </Typography>
                        </Box>

                        <Box className="purchase-order-info-item">
                            <Typography className="purchase-order-info-label">
                                Expected Delivery Date
                            </Typography>

                            <Typography className="purchase-order-info-value">
                                15 Oct 2026
                            </Typography>
                        </Box>

                        <Box className="purchase-order-info-item">
                            <Typography className="purchase-order-info-label">
                                Reference
                            </Typography>

                            <Typography className="purchase-order-info-value">
                                PO-REF-001
                            </Typography>
                        </Box>

                        <Box className="purchase-order-info-item">
                            <Typography className="purchase-order-info-label">
                                Payment Terms
                            </Typography>

                            <Typography className="purchase-order-info-value">
                                Net 30
                            </Typography>
                        </Box>

                    </Box>

                    <Divider className="purchase-order-details-divider" />

                    {/* Item Details */}
                    <Typography className="purchase-order-section-title">
                        Item / Service Details
                    </Typography>

                    <Box className="purchase-order-item-table">

                        <Box className="purchase-order-item-header">

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

                        <Box className="purchase-order-item-row">

                            <Typography className="purchase-order-item-name">
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

                            <Typography className="purchase-order-item-amount">
                                ₹5,90,000
                            </Typography>

                        </Box>

                    </Box>

                    <Divider className="purchase-order-details-divider" />

                    {/* Summary */}
                    <Box className="purchase-order-total-section">

                        <Box className="purchase-order-total-box">

                            <Box className="purchase-order-total-row">
                                <Typography>
                                    Sub Total
                                </Typography>

                                <Typography>
                                    ₹5,00,000
                                </Typography>
                            </Box>

                            <Box className="purchase-order-total-row">
                                <Typography>
                                    Discount
                                </Typography>

                                <Typography>
                                    ₹0
                                </Typography>
                            </Box>

                            <Box className="purchase-order-total-row">
                                <Typography>
                                    Tax
                                </Typography>

                                <Typography>
                                    ₹90,000
                                </Typography>
                            </Box>

                            <Divider />

                            <Box className="purchase-order-grand-total">
                                <Typography>
                                    Total
                                </Typography>

                                <Typography>
                                    ₹5,90,000
                                </Typography>
                            </Box>

                        </Box>

                    </Box>

                    <Divider className="purchase-order-details-divider" />

                    {/* Address */}
                    <Typography className="purchase-order-section-title">
                        Billing & Shipping Address
                    </Typography>

                    <Box className="purchase-order-address-grid">

                        <Box className="purchase-order-address-box">

                            <Typography className="purchase-order-address-title">
                                Billing Address
                            </Typography>

                            <Typography className="purchase-order-info-value">
                                12 Business Park, Andheri East
                            </Typography>

                            <Typography className="purchase-order-info-text">
                                Mumbai, Maharashtra - 400069
                            </Typography>

                            <Typography className="purchase-order-info-text">
                                India
                            </Typography>

                        </Box>

                        <Box className="purchase-order-address-box">

                            <Typography className="purchase-order-address-title">
                                Shipping Address
                            </Typography>

                            <Typography className="purchase-order-info-value">
                                12 Business Park, Andheri East
                            </Typography>

                            <Typography className="purchase-order-info-text">
                                Mumbai, Maharashtra - 400069
                            </Typography>

                            <Typography className="purchase-order-info-text">
                                India
                            </Typography>

                        </Box>

                    </Box>

                    <Divider className="purchase-order-details-divider" />

                    {/* Notes */}
                    <Typography className="purchase-order-section-title">
                        Notes
                    </Typography>

                    <Typography className="purchase-order-notes">
                        Please deliver the laptops within the expected delivery
                        date and ensure all devices include the required
                        accessories and warranty documents.
                    </Typography>

                    <Divider className="purchase-order-details-divider" />

                    {/* Terms */}
                    <Typography className="purchase-order-section-title">
                        Terms & Conditions
                    </Typography>

                    <Typography className="purchase-order-notes">
                        Payment will be processed as per the agreed payment
                        terms. All supplied products must meet the agreed
                        specifications and quality requirements.
                    </Typography>

                </CardContent>

            </Card>

        </Box>
    );
};

export default PurchaseOrderDetails;