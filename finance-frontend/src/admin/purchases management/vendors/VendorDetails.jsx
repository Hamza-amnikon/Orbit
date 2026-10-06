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
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import PrintRoundedIcon from "@mui/icons-material/PrintRounded";

import "./VendorDetails.css";

const VendorDetails = ({ onBack }) => {
    return (
        <Box className="vendor-details-page">

            {/* =========================================
                PAGE HEADER
            ========================================= */}
            <Box className="vendor-details-header">

                <Box>
                    <Button
                        startIcon={<ArrowBackRoundedIcon />}
                        className="vendor-back-button"
                        onClick={onBack}
                    >
                        Back to Vendors
                    </Button>

                    <Typography className="vendor-details-title">
                        Vendor Details
                    </Typography>

                    <Typography className="vendor-details-subtitle">
                        View vendor information and transaction details
                    </Typography>
                </Box>

                <Box className="vendor-details-actions">

                    <Button
                        variant="outlined"
                        startIcon={<PrintRoundedIcon />}
                        className="vendor-action-button"
                    >
                        Print
                    </Button>

                    <Button
                        variant="contained"
                        startIcon={<EditRoundedIcon />}
                        className="vendor-edit-button"
                    >
                        Edit
                    </Button>

                </Box>

            </Box>

            {/* =========================================
                VENDOR INFORMATION CARD
            ========================================= */}
            <Card className="vendor-details-card">

                <CardContent>

                    {/* Vendor Header */}
                    <Box className="vendor-document-header">

                        <Box>
                            <Typography className="vendor-company-name">
                                ABC SUPPLIERS
                            </Typography>

                            <Typography className="vendor-company-info">
                                Mumbai, Maharashtra
                            </Typography>

                            <Typography className="vendor-company-info">
                                accounts@abcsuppliers.com
                            </Typography>
                        </Box>

                        <Box className="vendor-document-right">

                            <Typography className="vendor-document-label">
                                VENDOR CODE
                            </Typography>

                            <Typography className="vendor-code-large">
                                VEN-001
                            </Typography>

                            <Box className="vendor-details-status active">
                                Active
                            </Box>

                        </Box>

                    </Box>

                    <Divider className="vendor-details-divider" />

                    {/* =========================================
                        BASIC INFORMATION
                    ========================================= */}
                    <Typography className="vendor-section-title">
                        Basic Information
                    </Typography>

                    <Box className="vendor-info-grid">

                        <Box className="vendor-info-item">
                            <Typography className="vendor-info-label">
                                Vendor Name
                            </Typography>

                            <Typography className="vendor-info-value">
                                ABC Suppliers
                            </Typography>
                        </Box>

                        <Box className="vendor-info-item">
                            <Typography className="vendor-info-label">
                                Contact Person
                            </Typography>

                            <Typography className="vendor-info-value">
                                Rahul Sharma
                            </Typography>
                        </Box>

                        <Box className="vendor-info-item">
                            <Typography className="vendor-info-label">
                                Email
                            </Typography>

                            <Typography className="vendor-info-value">
                                accounts@abcsuppliers.com
                            </Typography>
                        </Box>

                        <Box className="vendor-info-item">
                            <Typography className="vendor-info-label">
                                Phone
                            </Typography>

                            <Typography className="vendor-info-value">
                                9876543210
                            </Typography>
                        </Box>

                        <Box className="vendor-info-item">
                            <Typography className="vendor-info-label">
                                Vendor Type
                            </Typography>

                            <Typography className="vendor-info-value">
                                Supplier
                            </Typography>
                        </Box>

                        <Box className="vendor-info-item">
                            <Typography className="vendor-info-label">
                                Payment Terms
                            </Typography>

                            <Typography className="vendor-info-value">
                                Net 30
                            </Typography>
                        </Box>

                    </Box>

                    <Divider className="vendor-details-divider" />

                    {/* =========================================
                        TAX & BANKING
                    ========================================= */}
                    <Typography className="vendor-section-title">
                        Tax & Banking
                    </Typography>

                    <Box className="vendor-info-grid">

                        <Box className="vendor-info-item">
                            <Typography className="vendor-info-label">
                                GSTIN
                            </Typography>

                            <Typography className="vendor-info-value">
                                27ABCDE1234F1Z5
                            </Typography>
                        </Box>

                        <Box className="vendor-info-item">
                            <Typography className="vendor-info-label">
                                PAN
                            </Typography>

                            <Typography className="vendor-info-value">
                                ABCDE1234F
                            </Typography>
                        </Box>

                        <Box className="vendor-info-item">
                            <Typography className="vendor-info-label">
                                Bank Name
                            </Typography>

                            <Typography className="vendor-info-value">
                                HDFC Bank
                            </Typography>
                        </Box>

                        <Box className="vendor-info-item">
                            <Typography className="vendor-info-label">
                                Account Number
                            </Typography>

                            <Typography className="vendor-info-value">
                                XXXX XXXX 4587
                            </Typography>
                        </Box>

                        <Box className="vendor-info-item">
                            <Typography className="vendor-info-label">
                                IFSC Code
                            </Typography>

                            <Typography className="vendor-info-value">
                                HDFC0001234
                            </Typography>
                        </Box>

                    </Box>

                    <Divider className="vendor-details-divider" />

                    {/* =========================================
                        ADDRESS
                    ========================================= */}
                    <Typography className="vendor-section-title">
                        Address
                    </Typography>

                    <Box className="vendor-address-box">

                        <Typography className="vendor-info-value">
                            12 Business Park, Andheri East
                        </Typography>

                        <Typography className="vendor-info-text">
                            Mumbai, Maharashtra - 400069
                        </Typography>

                        <Typography className="vendor-info-text">
                            India
                        </Typography>

                    </Box>

                    <Divider className="vendor-details-divider" />

                    {/* =========================================
                        TRANSACTION SUMMARY
                    ========================================= */}
                    <Typography className="vendor-section-title">
                        Transaction Summary
                    </Typography>

                    <Box className="vendor-transaction-grid">

                        <Card className="vendor-transaction-card">
                            <CardContent>
                                <Typography className="vendor-transaction-label">
                                    Total Bills
                                </Typography>

                                <Typography className="vendor-transaction-value">
                                    ₹3,45,600
                                </Typography>
                            </CardContent>
                        </Card>

                        <Card className="vendor-transaction-card">
                            <CardContent>
                                <Typography className="vendor-transaction-label">
                                    Paid
                                </Typography>

                                <Typography className="vendor-transaction-value">
                                    ₹2,20,600
                                </Typography>
                            </CardContent>
                        </Card>

                        <Card className="vendor-transaction-card">
                            <CardContent>
                                <Typography className="vendor-transaction-label">
                                    Outstanding
                                </Typography>

                                <Typography className="vendor-transaction-value outstanding">
                                    ₹1,25,000
                                </Typography>
                            </CardContent>
                        </Card>

                    </Box>

                    <Divider className="vendor-details-divider" />

                    {/* =========================================
                        RECENT TRANSACTIONS
                    ========================================= */}
                    <Typography className="vendor-section-title">
                        Recent Transactions
                    </Typography>

                    <Box className="vendor-transaction-table">

                        <Box className="vendor-transaction-header">

                            <Typography>
                                Transaction
                            </Typography>

                            <Typography>
                                Reference
                            </Typography>

                            <Typography>
                                Date
                            </Typography>

                            <Typography>
                                Amount
                            </Typography>

                            <Typography>
                                Status
                            </Typography>

                        </Box>

                        <Box className="vendor-transaction-row">

                            <Typography className="vendor-transaction-name">
                                Bill
                            </Typography>

                            <Typography>
                                BILL-001
                            </Typography>

                            <Typography>
                                06 Oct 2026
                            </Typography>

                            <Typography className="vendor-transaction-amount">
                                ₹1,25,000
                            </Typography>

                            <Box className="vendor-transaction-status pending">
                                Pending
                            </Box>

                        </Box>

                        <Box className="vendor-transaction-row">

                            <Typography className="vendor-transaction-name">
                                Payment Made
                            </Typography>

                            <Typography>
                                PAY-001
                            </Typography>

                            <Typography>
                                01 Oct 2026
                            </Typography>

                            <Typography className="vendor-transaction-amount">
                                ₹85,000
                            </Typography>

                            <Box className="vendor-transaction-status paid">
                                Paid
                            </Box>

                        </Box>

                        <Box className="vendor-transaction-row">

                            <Typography className="vendor-transaction-name">
                                Bill
                            </Typography>

                            <Typography>
                                BILL-002
                            </Typography>

                            <Typography>
                                25 Sep 2026
                            </Typography>

                            <Typography className="vendor-transaction-amount">
                                ₹95,600
                            </Typography>

                            <Box className="vendor-transaction-status paid">
                                Paid
                            </Box>

                        </Box>

                    </Box>

                    {/* =========================================
                        NOTES
                    ========================================= */}
                    <Divider className="vendor-details-divider" />

                    <Typography className="vendor-section-title">
                        Notes
                    </Typography>

                    <Typography className="vendor-notes">
                        Preferred supplier for office equipment and IT
                        accessories. Payment terms are Net 30 days.
                    </Typography>

                </CardContent>

            </Card>

        </Box>
    );
};

export default VendorDetails;