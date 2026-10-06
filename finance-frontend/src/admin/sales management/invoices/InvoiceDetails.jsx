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

import "./InvoiceDetails.css";

const InvoiceDetails = ({ onBack, onEdit }) => {
    return (
        <Box className="invoice-details-page">

            {/* Header */}
            <Box className="invoice-details-topbar">

                <Button
                    variant="outlined"
                    startIcon={<ArrowBackRoundedIcon />}
                    className="invoice-back-button"
                    onClick={onBack}
                >
                    Back to Invoices
                </Button>

                <Box className="invoice-details-actions">

                    <Button
                        variant="outlined"
                        startIcon={<PrintRoundedIcon />}
                        className="invoice-action-button"
                    >
                        Print
                    </Button>

<Button
    variant="outlined"
    startIcon={<EditRoundedIcon />}
    className="invoice-action-button"
    onClick={onEdit}
>
    Edit
</Button>

                    <Button
                        variant="contained"
                        startIcon={<SendRoundedIcon />}
                        className="invoice-send-button"
                    >
                        Send Invoice
                    </Button>

                </Box>

            </Box>

            {/* Invoice */}
            <Card className="invoice-details-card">

                {/* Invoice Header */}
                <Box className="invoice-details-header">

                    <Box>
                        <Typography className="invoice-company-name">
                            AMNIKON TECHNOLOGIES
                        </Typography>

                        <Typography className="invoice-company-details">
                            Mumbai, Maharashtra, India
                        </Typography>

                        <Typography className="invoice-company-details">
                            finance@amnikon.com
                        </Typography>
                    </Box>

                    <Box className="invoice-title-section">

                        <Typography className="invoice-main-title">
                            INVOICE
                        </Typography>

                        <Typography className="invoice-detail-number">
                            INV-001
                        </Typography>

                        <Box className="invoice-detail-status">
                            Sent
                        </Box>

                    </Box>

                </Box>

                <Divider />

                <CardContent className="invoice-details-content">

                    {/* Customer + Invoice Information */}
                    <Box className="invoice-info-grid">

                        <Box>
                            <Typography className="invoice-info-label">
                                BILL TO
                            </Typography>

                            <Typography className="invoice-customer-name">
                                ABC Technologies
                            </Typography>

                            <Typography className="invoice-info-text">
                                Rahul Sharma
                            </Typography>

                            <Typography className="invoice-info-text">
                                Mumbai, Maharashtra
                            </Typography>

                            <Typography className="invoice-info-text">
                                rahul@abctech.com
                            </Typography>
                        </Box>

                        <Box className="invoice-meta-section">

                            <Box className="invoice-meta-row">
                                <Typography>
                                    Invoice Date
                                </Typography>

                                <Typography>
                                    06 Oct 2026
                                </Typography>
                            </Box>

                            <Box className="invoice-meta-row">
                                <Typography>
                                    Due Date
                                </Typography>

                                <Typography>
                                    20 Oct 2026
                                </Typography>
                            </Box>

                            <Box className="invoice-meta-row">
                                <Typography>
                                    Sales Order
                                </Typography>

                                <Typography>
                                    SO-001
                                </Typography>
                            </Box>

                            <Box className="invoice-meta-row">
                                <Typography>
                                    Reference
                                </Typography>

                                <Typography>
                                    Website Project
                                </Typography>
                            </Box>

                        </Box>

                    </Box>

                    {/* Items */}
                    <Box className="invoice-items-section">

                        <Typography className="invoice-section-title">
                            Invoice Items
                        </Typography>

                        <Box className="invoice-items-header">
                            <Typography>Item / Service</Typography>
                            <Typography>Description</Typography>
                            <Typography>Qty</Typography>
                            <Typography>Rate</Typography>
                            <Typography>Tax</Typography>
                            <Typography>Amount</Typography>
                        </Box>

                        <Box className="invoice-item-row">

                            <Typography className="invoice-item-name">
                                Website Development
                            </Typography>

                            <Typography>
                                Corporate website development
                            </Typography>

                            <Typography>
                                1
                            </Typography>

                            <Typography>
                                ₹75,000
                            </Typography>

                            <Typography>
                                18%
                            </Typography>

                            <Typography className="invoice-item-amount">
                                ₹88,500
                            </Typography>

                        </Box>

                    </Box>

                    {/* Totals */}
                    <Box className="invoice-total-section">

                        <Box className="invoice-total-row">
                            <Typography>
                                Subtotal
                            </Typography>

                            <Typography>
                                ₹75,000
                            </Typography>
                        </Box>

                        <Box className="invoice-total-row">
                            <Typography>
                                Discount
                            </Typography>

                            <Typography>
                                ₹0
                            </Typography>
                        </Box>

                        <Box className="invoice-total-row">
                            <Typography>
                                Tax
                            </Typography>

                            <Typography>
                                ₹13,500
                            </Typography>
                        </Box>

                        <Divider />

                        <Box className="invoice-grand-total-row">

                            <Typography>
                                Grand Total
                            </Typography>

                            <Typography>
                                ₹88,500
                            </Typography>

                        </Box>

                    </Box>

                    {/* Notes */}
                    <Box className="invoice-notes-section">

                        <Typography className="invoice-section-title">
                            Notes
                        </Typography>

                        <Typography className="invoice-notes-text">
                            Thank you for your business.
                        </Typography>

                    </Box>

                    {/* Terms */}
                    <Box className="invoice-terms-section">

                        <Typography className="invoice-section-title">
                            Terms & Conditions
                        </Typography>

                        <Typography className="invoice-notes-text">
                            Payment is due within 14 days from the invoice date.
                        </Typography>

                    </Box>

                </CardContent>

            </Card>

        </Box>
    );
};

export default InvoiceDetails;