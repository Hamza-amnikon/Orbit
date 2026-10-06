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

import "./SalesOrderDetails.css";

const SalesOrderDetails = ({ onBack, salesOrder }) => {
    return (
        <Box className="sales-order-details-page">

            {/* Header */}
            <Box className="sales-order-details-header">

                <Box className="sales-order-details-header-left">
                    <Button
                        variant="outlined"
                        startIcon={<ArrowBackRoundedIcon />}
                        className="sales-order-back-button"
                        onClick={onBack}
                    >
                        Back
                    </Button>

                    <Box>
                        <Typography className="sales-order-details-title">
                            Sales Order
                        </Typography>

                        <Typography className="sales-order-details-subtitle">
                            SO-001
                        </Typography>
                    </Box>
                </Box>

                <Box className="sales-order-details-actions">

                    <Button
                        variant="outlined"
                        startIcon={<PrintRoundedIcon />}
                        className="sales-order-action-button"
                    >
                        Print
                    </Button>

                    <Button
                        variant="outlined"
                        startIcon={<EditRoundedIcon />}
                        className="sales-order-action-button"
                    >
                        Edit
                    </Button>

                    <Button
                        variant="contained"
                        startIcon={<SendRoundedIcon />}
                        className="sales-order-send-button"
                    >
                        Send
                    </Button>

                </Box>

            </Box>

            {/* Sales Order Card */}
            <Card className="sales-order-document-card">

                <CardContent className="sales-order-document-content">

                    {/* Company / Order Header */}
                    <Box className="sales-order-document-header">

                        <Box>
                            <Typography className="sales-order-company-name">
                                FinancePro
                            </Typography>

                            <Typography className="sales-order-company-text">
                                Mumbai, Maharashtra, India
                            </Typography>

                            <Typography className="sales-order-company-text">
                                financepro@example.com
                            </Typography>
                        </Box>

                        <Box className="sales-order-document-meta">

                            <Typography className="sales-order-document-label">
                                SALES ORDER
                            </Typography>

                            <Typography className="sales-order-document-number">
                                SO-001
                            </Typography>

                            <Box className="sales-order-status-badge">
                                Confirmed
                            </Box>

                        </Box>

                    </Box>

                    <Divider className="sales-order-divider" />

                    {/* Customer + Order Information */}
                    <Box className="sales-order-info-grid">

                        <Box className="sales-order-info-section">

                            <Typography className="sales-order-section-title">
                                Customer Information
                            </Typography>

                            <Typography className="sales-order-customer-name">
                                ABC Technologies
                            </Typography>

                            <Typography className="sales-order-info-text">
                                Customer Code: CUST-001
                            </Typography>

                            <Typography className="sales-order-info-text">
                                Rahul Sharma
                            </Typography>

                            <Typography className="sales-order-info-text">
                                rahul@abctech.com
                            </Typography>

                            <Typography className="sales-order-info-text">
                                +91 98765 43210
                            </Typography>

                        </Box>

                        <Box className="sales-order-info-section">

                            <Typography className="sales-order-section-title">
                                Order Information
                            </Typography>

                            <Box className="sales-order-meta-row">
                                <span>Order Date</span>
                                <strong>06 Oct 2026</strong>
                            </Box>

                            <Box className="sales-order-meta-row">
                                <span>Expected Delivery</span>
                                <strong>06 Nov 2026</strong>
                            </Box>

                            <Box className="sales-order-meta-row">
                                <span>Reference</span>
                                <strong>REF-001</strong>
                            </Box>

                            <Box className="sales-order-meta-row">
                                <span>Estimate</span>
                                <strong>EST-001</strong>
                            </Box>

                        </Box>

                    </Box>

                    {/* Order Details */}
                    <Box className="sales-order-details-section">

                        <Typography className="sales-order-section-title">
                            Order Details
                        </Typography>

                        <Box className="sales-order-item-table">

                            <Box className="sales-order-item-header">
                                <Typography>Description</Typography>
                                <Typography>Qty</Typography>
                                <Typography>Rate</Typography>
                                <Typography>Tax</Typography>
                                <Typography>Total</Typography>
                            </Box>

                            <Box className="sales-order-item-row">

                                <Box>
                                    <Typography className="sales-order-item-name">
                                        Website Development
                                    </Typography>

                                    <Typography className="sales-order-item-description">
                                        Website design and development services
                                    </Typography>
                                </Box>

                                <Typography>
                                    1
                                </Typography>

                                <Typography>
                                    ₹75,000
                                </Typography>

                                <Typography>
                                    18%
                                </Typography>

                                <Typography className="sales-order-item-total">
                                    ₹88,500
                                </Typography>

                            </Box>

                        </Box>

                    </Box>

                    {/* Addresses */}
                    <Box className="sales-order-address-grid">

                        <Box className="sales-order-address-card">

                            <Typography className="sales-order-section-title">
                                Shipping Address
                            </Typography>

                            <Typography className="sales-order-address-name">
                                ABC Technologies
                            </Typography>

                            <Typography className="sales-order-info-text">
                                401, Business Tower
                            </Typography>

                            <Typography className="sales-order-info-text">
                                Andheri East
                            </Typography>

                            <Typography className="sales-order-info-text">
                                Mumbai, Maharashtra - 400069
                            </Typography>

                        </Box>

                        <Box className="sales-order-address-card">

                            <Typography className="sales-order-section-title">
                                Billing Address
                            </Typography>

                            <Typography className="sales-order-address-name">
                                ABC Technologies
                            </Typography>

                            <Typography className="sales-order-info-text">
                                401, Business Tower
                            </Typography>

                            <Typography className="sales-order-info-text">
                                Andheri East
                            </Typography>

                            <Typography className="sales-order-info-text">
                                Mumbai, Maharashtra - 400069
                            </Typography>

                        </Box>

                    </Box>

                    {/* Bottom Section */}
                    <Box className="sales-order-bottom-grid">

                        <Box>

                            <Typography className="sales-order-section-title">
                                Notes
                            </Typography>

                            <Typography className="sales-order-notes">
                                Development work will begin after confirmation of
                                the sales order.
                            </Typography>

                            <Typography className="sales-order-section-title sales-order-terms-title">
                                Terms & Conditions
                            </Typography>

                            <Typography className="sales-order-notes">
                                Payment is due as per the agreed payment terms.
                                Any additional work will be charged separately.
                            </Typography>

                        </Box>

                        {/* Summary */}
                        <Box className="sales-order-summary">

                            <Box className="sales-order-summary-row">
                                <span>Subtotal</span>
                                <strong>₹75,000</strong>
                            </Box>

                            <Box className="sales-order-summary-row">
                                <span>Discount</span>
                                <strong>₹0</strong>
                            </Box>

                            <Box className="sales-order-summary-row">
                                <span>Tax</span>
                                <strong>₹13,500</strong>
                            </Box>

                            <Divider />

                            <Box className="sales-order-grand-total-row">
                                <span>Grand Total</span>
                                <strong>₹88,500</strong>
                            </Box>

                        </Box>

                    </Box>

                </CardContent>

            </Card>

        </Box>
    );
};

export default SalesOrderDetails;