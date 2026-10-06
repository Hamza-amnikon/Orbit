import React from "react";
import { Box, Button, Card, Typography } from "@mui/material";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import PrintRoundedIcon from "@mui/icons-material/PrintRounded";

import "./VendorCreditDetails.css";

const VendorCreditDetails = ({ onBack }) => {
    return (
        <Box className="vendor-credit-details-page">

            {/* Header */}

            <Box className="vendor-credit-details-header">

                <Box>
                    <Button
                        startIcon={<ArrowBackRoundedIcon />}
                        className="vendor-credit-details-back-button"
                        onClick={onBack}
                    >
                        Back to Vendor Credits
                    </Button>

                    <Typography className="vendor-credit-details-title">
                        Vendor Credit Details
                    </Typography>

                    <Typography className="vendor-credit-details-subtitle">
                        View vendor credit transaction details
                    </Typography>
                </Box>

                <Button
                    variant="outlined"
                    startIcon={<PrintRoundedIcon />}
                    className="vendor-credit-print-button"
                >
                    Print
                </Button>

            </Box>

            <Card className="vendor-credit-details-card">

                {/* Company */}

                <Box className="vendor-credit-company-section">

                    <Box>
                        <Typography className="vendor-credit-company-name">
                            AMNIKON TECHNOLOGIES
                        </Typography>

                        <Typography className="vendor-credit-company-address">
                            Mumbai, Maharashtra, India
                        </Typography>

                        <Typography className="vendor-credit-company-address">
                            finance@amnikontechnologies.com
                        </Typography>
                    </Box>

                    <Box className="vendor-credit-document-info">

                        <Typography className="vendor-credit-document-label">
                            VENDOR CREDIT
                        </Typography>

                        <Typography className="vendor-credit-document-number">
                            VC-001
                        </Typography>

                        <span className="vendor-credit-detail-status issued">
                            Issued
                        </span>

                    </Box>

                </Box>

                {/* Vendor Information */}

                <Box className="vendor-credit-detail-section">

                    <Typography className="vendor-credit-detail-section-title">
                        Vendor Information
                    </Typography>

                    <Box className="vendor-credit-info-grid">

                        <Box>
                            <Typography className="vendor-credit-info-label">
                                Vendor
                            </Typography>

                            <Typography className="vendor-credit-info-value">
                                ABC Suppliers
                            </Typography>
                        </Box>

                        <Box>
                            <Typography className="vendor-credit-info-label">
                                Contact Person
                            </Typography>

                            <Typography className="vendor-credit-info-value">
                                Rahul Sharma
                            </Typography>
                        </Box>

                        <Box>
                            <Typography className="vendor-credit-info-label">
                                Email
                            </Typography>

                            <Typography className="vendor-credit-info-value">
                                accounts@abcsuppliers.com
                            </Typography>
                        </Box>

                        <Box>
                            <Typography className="vendor-credit-info-label">
                                Phone
                            </Typography>

                            <Typography className="vendor-credit-info-value">
                                9876543210
                            </Typography>
                        </Box>

                    </Box>

                </Box>

                {/* Credit Information */}

                <Box className="vendor-credit-detail-section">

                    <Typography className="vendor-credit-detail-section-title">
                        Credit Information
                    </Typography>

                    <Box className="vendor-credit-info-grid">

                        <Box>
                            <Typography className="vendor-credit-info-label">
                                Credit Number
                            </Typography>

                            <Typography className="vendor-credit-info-value">
                                VC-001
                            </Typography>
                        </Box>

                        <Box>
                            <Typography className="vendor-credit-info-label">
                                Credit Date
                            </Typography>

                            <Typography className="vendor-credit-info-value">
                                06 Oct 2026
                            </Typography>
                        </Box>

                        <Box>
                            <Typography className="vendor-credit-info-label">
                                Bill Number
                            </Typography>

                            <Typography className="vendor-credit-info-value">
                                BILL-001
                            </Typography>
                        </Box>

                        <Box>
                            <Typography className="vendor-credit-info-label">
                                Reference Number
                            </Typography>

                            <Typography className="vendor-credit-info-value">
                                REF-001
                            </Typography>
                        </Box>

                        <Box>
                            <Typography className="vendor-credit-info-label">
                                Credit Type
                            </Typography>

                            <Typography className="vendor-credit-info-value">
                                Purchase Return
                            </Typography>
                        </Box>

                        <Box>
                            <Typography className="vendor-credit-info-label">
                                Reason
                            </Typography>

                            <Typography className="vendor-credit-info-value">
                                Returned damaged items
                            </Typography>
                        </Box>

                    </Box>

                </Box>

                {/* Items */}

                <Box className="vendor-credit-detail-section">

                    <Typography className="vendor-credit-detail-section-title">
                        Credit Items
                    </Typography>

                    <Box className="vendor-credit-items-table-wrapper">

                        <table className="vendor-credit-items-table">

                            <thead>
                                <tr>
                                    <th>Item / Service</th>
                                    <th>Description</th>
                                    <th>Qty</th>
                                    <th>Rate</th>
                                    <th>Tax</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>

                            <tbody>
                                <tr>
                                    <td>Office Laptops</td>
                                    <td>
                                        Returned office laptops
                                    </td>
                                    <td>10</td>
                                    <td>₹50,000</td>
                                    <td>18%</td>
                                    <td>₹5,90,000</td>
                                </tr>
                            </tbody>

                        </table>

                    </Box>

                </Box>

                {/* Totals */}

                <Box className="vendor-credit-total-section">

                    <Box className="vendor-credit-total-row">
                        <Typography>Sub Total</Typography>
                        <Typography>₹5,00,000</Typography>
                    </Box>

                    <Box className="vendor-credit-total-row">
                        <Typography>Discount</Typography>
                        <Typography>₹0</Typography>
                    </Box>

                    <Box className="vendor-credit-total-row">
                        <Typography>Tax</Typography>
                        <Typography>₹90,000</Typography>
                    </Box>

                    <Box className="vendor-credit-total-final">
                        <Typography>Total Credit</Typography>
                        <Typography>₹5,90,000</Typography>
                    </Box>

                </Box>

                {/* Address */}

                <Box className="vendor-credit-address-section">

                    <Box>
                        <Typography className="vendor-credit-detail-section-title">
                            Billing Address
                        </Typography>

                        <Typography className="vendor-credit-address-text">
                            ABC Suppliers
                            <br />
                            Andheri East
                            <br />
                            Mumbai, Maharashtra - 400069
                        </Typography>
                    </Box>

                    <Box>
                        <Typography className="vendor-credit-detail-section-title">
                            Shipping Address
                        </Typography>

                        <Typography className="vendor-credit-address-text">
                            ABC Suppliers
                            <br />
                            Andheri East
                            <br />
                            Mumbai, Maharashtra - 400069
                        </Typography>
                    </Box>

                </Box>

                {/* Notes */}

                <Box className="vendor-credit-notes-section">

                    <Typography className="vendor-credit-detail-section-title">
                        Notes
                    </Typography>

                    <Typography className="vendor-credit-notes-text">
                        Credit issued for returned office laptops.
                    </Typography>

                    <Typography className="vendor-credit-detail-section-title vendor-credit-terms-title">
                        Terms & Conditions
                    </Typography>

                    <Typography className="vendor-credit-notes-text">
                        This vendor credit can be applied against outstanding
                        vendor bills or refunded based on the agreed terms.
                    </Typography>

                </Box>

            </Card>

        </Box>
    );
};

export default VendorCreditDetails;