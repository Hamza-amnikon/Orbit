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
import SendRoundedIcon from "@mui/icons-material/SendRounded";

import "./EstimateDetails.css";

const EstimateDetails = ({ onBack }) => {
    return (
        <Box className="estimate-details-page">

            <Box className="estimate-details-container">

                {/* Header */}
                <Box className="estimate-details-header">

                    <Box className="estimate-details-header-left">

                        <Button
                            className="estimate-details-back-button"
                            onClick={onBack}
                        >
                            <ArrowBackRoundedIcon />
                        </Button>

                        <Box>
                            <Typography className="estimate-details-title">
                                Estimate Details
                            </Typography>

                            <Typography className="estimate-details-subtitle">
                                EST-001
                            </Typography>
                        </Box>

                    </Box>


                    <Box className="estimate-details-actions">

                        <Button
                            variant="outlined"
                            startIcon={<PrintRoundedIcon />}
                            className="estimate-print-button"
                        >
                            Print
                        </Button>

                        <Button
                            variant="outlined"
                            startIcon={<EditRoundedIcon />}
                            className="estimate-edit-button"
                        >
                            Edit
                        </Button>

                        <Button
                            variant="contained"
                            startIcon={<SendRoundedIcon />}
                            className="estimate-send-button"
                        >
                            Send Estimate
                        </Button>

                    </Box>

                </Box>


                {/* Estimate Card */}
                <Card className="estimate-preview-card">

                    <CardContent>

                        {/* Company / Estimate Header */}
                        <Box className="estimate-preview-header">

                            <Box>
                                <Typography className="estimate-company-name">
                                    Finance
                                </Typography>

                                <Typography className="estimate-company-details">
                                    Finance Management System
                                </Typography>

                                <Typography className="estimate-company-details">
                                    Mumbai, Maharashtra, India
                                </Typography>
                            </Box>


                            <Box className="estimate-preview-meta">

                                <Typography className="estimate-preview-label">
                                    ESTIMATE
                                </Typography>

                                <Typography className="estimate-preview-number">
                                    EST-001
                                </Typography>

                                <Typography className="estimate-preview-status">
                                    Sent
                                </Typography>

                            </Box>

                        </Box>


                        <Divider className="estimate-divider" />


                        {/* Customer Information */}
                        <Box className="estimate-customer-section">

                            <Box>
                                <Typography className="estimate-info-label">
                                    BILL TO
                                </Typography>

                                <Typography className="estimate-customer-name">
                                    ABC Technologies
                                </Typography>

                                <Typography className="estimate-info-text">
                                    Rahul Sharma
                                </Typography>

                                <Typography className="estimate-info-text">
                                    rahul@abctech.com
                                </Typography>

                            </Box>


                            <Box className="estimate-date-section">

                                <Box>
                                    <Typography className="estimate-info-label">
                                        ESTIMATE DATE
                                    </Typography>

                                    <Typography className="estimate-info-value">
                                        05 Oct 2026
                                    </Typography>
                                </Box>


                                <Box>
                                    <Typography className="estimate-info-label">
                                        EXPIRY DATE
                                    </Typography>

                                    <Typography className="estimate-info-value">
                                        04 Nov 2026
                                    </Typography>
                                </Box>

                            </Box>

                        </Box>


                        {/* Items */}
                        <Box className="estimate-items-section">

                            <Typography className="estimate-section-title">
                                Estimate Items
                            </Typography>

                            <Box className="estimate-item-table">

                                <Box className="estimate-item-header">

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
                                        Amount
                                    </Typography>

                                </Box>


                                <Box className="estimate-item-row">

                                    <Typography className="estimate-item-name">
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

                                    <Typography className="estimate-item-amount">
                                        ₹75,000
                                    </Typography>

                                </Box>

                            </Box>

                        </Box>


                        {/* Totals */}
                        <Box className="estimate-details-total-wrapper">

                            <Box className="estimate-details-totals">

                                <Box className="estimate-details-total-row">

                                    <Typography>
                                        Subtotal
                                    </Typography>

                                    <Typography>
                                        ₹75,000
                                    </Typography>

                                </Box>


                                <Box className="estimate-details-total-row">

                                    <Typography>
                                        GST 18%
                                    </Typography>

                                    <Typography>
                                        ₹13,500
                                    </Typography>

                                </Box>


                                <Box className="estimate-details-grand-total">

                                    <Typography>
                                        Grand Total
                                    </Typography>

                                    <Typography>
                                        ₹88,500
                                    </Typography>

                                </Box>

                            </Box>

                        </Box>


                        {/* Notes */}
                        <Box className="estimate-notes-section">

                            <Typography className="estimate-section-title">
                                Notes
                            </Typography>

                            <Typography className="estimate-notes">
                                Thank you for considering our services.
                                Please contact us if you have any questions
                                regarding this estimate.
                            </Typography>

                        </Box>


                        {/* Terms */}
                        <Box className="estimate-terms-section">

                            <Typography className="estimate-section-title">
                                Terms & Conditions
                            </Typography>

                            <Typography className="estimate-terms">
                                This estimate is valid until the expiry date
                                mentioned above. Prices are subject to the
                                agreed scope of work.
                            </Typography>

                        </Box>

                    </CardContent>

                </Card>

            </Box>

        </Box>
    );
};

export default EstimateDetails;