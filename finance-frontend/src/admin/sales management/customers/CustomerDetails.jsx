import React from "react";
import {
    Box,
    Button,
    Card,
    CardContent,
    Typography,
} from "@mui/material";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";

import { useNavigate } from "react-router-dom";

import "./CustomerDetails.css";

const CustomerDetails = () => {
    const navigate = useNavigate();

    return (
        <Box className="customer-details-page">

            {/* Header */}
            <Box className="customer-details-header">

                <Box className="customer-details-header-left">

                    <Button
                        className="customer-back-button"
                        onClick={() => navigate("/sales/customers")}
                    >
                        <ArrowBackRoundedIcon />
                    </Button>

                    <Box>
                        <Typography className="customer-details-title">
                            ABC Technologies
                        </Typography>

                        <Typography className="customer-details-code">
                            CUST-001
                        </Typography>
                    </Box>

                </Box>

                <Box className="customer-details-header-actions">

                    <Typography className="customer-status">
                        Active
                    </Typography>

                    <Button
                        variant="contained"
                        startIcon={<EditRoundedIcon />}
                        className="customer-edit-button"
                    >
                        Edit Customer
                    </Button>

                </Box>

            </Box>


            {/* Customer Information */}
            <Box className="customer-details-content">

                <Card className="customer-info-card">

                    <CardContent>

                        <Typography className="customer-section-title">
                            Customer Information
                        </Typography>

                        <Box className="customer-info-grid">

                            <Box className="customer-info-item">
                                <BusinessRoundedIcon />

                                <Box>
                                    <Typography className="customer-info-label">
                                        Company Name
                                    </Typography>

                                    <Typography className="customer-info-value">
                                        ABC Technologies
                                    </Typography>
                                </Box>
                            </Box>


                            <Box className="customer-info-item">
                                <EmailRoundedIcon />

                                <Box>
                                    <Typography className="customer-info-label">
                                        Email
                                    </Typography>

                                    <Typography className="customer-info-value">
                                        rahul@abctech.com
                                    </Typography>
                                </Box>
                            </Box>


                            <Box className="customer-info-item">
                                <PhoneRoundedIcon />

                                <Box>
                                    <Typography className="customer-info-label">
                                        Phone
                                    </Typography>

                                    <Typography className="customer-info-value">
                                        +91 98765 43210
                                    </Typography>
                                </Box>
                            </Box>


                            <Box className="customer-info-item">
                                <LocationOnRoundedIcon />

                                <Box>
                                    <Typography className="customer-info-label">
                                        Address
                                    </Typography>

                                    <Typography className="customer-info-value">
                                        Mumbai, Maharashtra, India
                                    </Typography>
                                </Box>
                            </Box>

                        </Box>

                    </CardContent>

                </Card>


                {/* Financial Summary */}
                <Box className="customer-financial-grid">

                    <Card className="customer-financial-card">
                        <CardContent>
                            <Typography className="financial-label">
                                Outstanding
                            </Typography>

                            <Typography className="financial-value">
                                ₹1,25,000
                            </Typography>
                        </CardContent>
                    </Card>


                    <Card className="customer-financial-card">
                        <CardContent>
                            <Typography className="financial-label">
                                Total Invoiced
                            </Typography>

                            <Typography className="financial-value">
                                ₹8,75,000
                            </Typography>
                        </CardContent>
                    </Card>


                    <Card className="customer-financial-card">
                        <CardContent>
                            <Typography className="financial-label">
                                Total Paid
                            </Typography>

                            <Typography className="financial-value">
                                ₹7,50,000
                            </Typography>
                        </CardContent>
                    </Card>


                    <Card className="customer-financial-card">
                        <CardContent>
                            <Typography className="financial-label">
                                GST Number
                            </Typography>

                            <Typography className="financial-value">
                                27ABCDE1234F1Z5
                            </Typography>
                        </CardContent>
                    </Card>

                </Box>


                {/* Recent Transactions */}
                <Card className="customer-transactions-card">

                    <CardContent>

                        <Typography className="customer-section-title">
                            Recent Transactions
                        </Typography>

                        <Box className="transaction-row transaction-header">
                            <Typography>Invoice</Typography>
                            <Typography>Date</Typography>
                            <Typography>Amount</Typography>
                            <Typography>Status</Typography>
                        </Box>

                        <Box className="transaction-row">
                            <Typography>INV-1001</Typography>
                            <Typography>02 Oct 2026</Typography>
                            <Typography>₹75,000</Typography>
                            <Typography className="transaction-paid">
                                Paid
                            </Typography>
                        </Box>

                        <Box className="transaction-row">
                            <Typography>INV-1002</Typography>
                            <Typography>28 Sep 2026</Typography>
                            <Typography>₹50,000</Typography>
                            <Typography className="transaction-pending">
                                Pending
                            </Typography>
                        </Box>

                    </CardContent>

                </Card>

            </Box>

        </Box>
    );
};

export default CustomerDetails;