import React, { useState } from "react";

import {
    Box,
    Button,
    Card,
    CardContent,
    Typography,
} from "@mui/material";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";

import PaymentReceivedForm from "./PaymentReceivedForm";
import PaymentReceivedDetails from "./PaymentReceivedDetails";

import "./PaymentReceived.css";

const PaymentReceived = () => {
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [showPaymentDetails, setShowPaymentDetails] = useState(false);

    /* =========================================
       PAYMENT DETAILS
    ========================================= */
    if (showPaymentDetails) {
        return (
            <PaymentReceivedDetails
                onBack={() => setShowPaymentDetails(false)}
            />
        );
    }

    return (
        <Box className="payments-received-page">

            {/* =========================================
                PAGE HEADER
            ========================================= */}
            <Box className="payments-received-header">

                <Box>
                    <Typography className="payments-received-title">
                        Payments Received
                    </Typography>

                    <Typography className="payments-received-subtitle">
                        Record and manage customer payments
                    </Typography>
                </Box>

                <Button
                    variant="contained"
                    startIcon={<AddRoundedIcon />}
                    className="add-payment-button"
                    onClick={() => setShowPaymentForm(true)}
                >
                    New Payment
                </Button>

            </Box>

            {/* =========================================
                SUMMARY CARDS
            ========================================= */}
            <Box className="payment-summary-grid">

                {/* Total Received */}
                <Card className="payment-summary-card">
                    <CardContent>
                        <Typography className="payment-summary-label">
                            Total Received
                        </Typography>

                        <Typography className="payment-summary-value">
                            ₹8,45,000
                        </Typography>
                    </CardContent>
                </Card>

                {/* This Month */}
                <Card className="payment-summary-card">
                    <CardContent>
                        <Typography className="payment-summary-label">
                            This Month
                        </Typography>

                        <Typography className="payment-summary-value">
                            ₹2,18,500
                        </Typography>
                    </CardContent>
                </Card>

                {/* Pending */}
                <Card className="payment-summary-card">
                    <CardContent>
                        <Typography className="payment-summary-label">
                            Pending
                        </Typography>

                        <Typography className="payment-summary-value">
                            ₹1,35,000
                        </Typography>
                    </CardContent>
                </Card>

                {/* Refunded */}
                <Card className="payment-summary-card">
                    <CardContent>
                        <Typography className="payment-summary-label">
                            Refunded
                        </Typography>

                        <Typography className="payment-summary-value">
                            ₹25,000
                        </Typography>
                    </CardContent>
                </Card>

            </Box>

            {/* =========================================
                PAYMENT LIST
            ========================================= */}
            <Card className="payment-list-card">

                <CardContent className="payment-list-content">

                    {/* =========================================
                        LIST HEADER
                    ========================================= */}
                    <Box className="payment-list-header">

                        <Box>
                            <Typography className="payment-list-title">
                                Payment List
                            </Typography>

                            <Typography className="payment-list-subtitle">
                                View and manage customer payments
                            </Typography>
                        </Box>

                        <Box className="payment-list-actions">

                            {/* Search */}
                            <Box className="payment-search-box">

                                <SearchRoundedIcon />

                                <input
                                    type="text"
                                    placeholder="Search payments..."
                                />

                            </Box>

                            {/* Filter */}
                            <Button
                                variant="outlined"
                                startIcon={<FilterListRoundedIcon />}
                                className="payment-filter-button"
                            >
                                Filter
                            </Button>

                        </Box>

                    </Box>

                    {/* =========================================
                        TABLE HEADER
                    ========================================= */}
                    <Box className="payment-table-header">

                        <Typography>
                            Payment
                        </Typography>

                        <Typography>
                            Customer
                        </Typography>

                        <Typography>
                            Invoice
                        </Typography>

                        <Typography>
                            Payment Date
                        </Typography>

                        <Typography>
                            Amount
                        </Typography>

                        <Typography>
                            Method
                        </Typography>

                        <Typography>
                            Status
                        </Typography>

                        <Typography>
                            Action
                        </Typography>

                    </Box>

                    {/* =========================================
                        PAYMENT ROW 1
                    ========================================= */}
                    <Box className="payment-table-row">

                        <Typography className="payment-number">
                            PAY-001
                        </Typography>

                        <Typography>
                            ABC Technologies
                        </Typography>

                        <Typography>
                            INV-001
                        </Typography>

                        <Typography>
                            06 Oct 2026
                        </Typography>

                        <Typography className="payment-amount">
                            ₹88,500
                        </Typography>

                        <Typography>
                            Bank Transfer
                        </Typography>

                        <Box className="payment-status received">
                            Received
                        </Box>

                        <Button
                            className="payment-view-button"
                            onClick={() => setShowPaymentDetails(true)}
                        >
                            View
                        </Button>

                    </Box>

                    {/* =========================================
                        PAYMENT ROW 2
                    ========================================= */}
                    <Box className="payment-table-row">

                        <Typography className="payment-number">
                            PAY-002
                        </Typography>

                        <Typography>
                            Global Solutions
                        </Typography>

                        <Typography>
                            INV-002
                        </Typography>

                        <Typography>
                            04 Oct 2026
                        </Typography>

                        <Typography className="payment-amount">
                            ₹1,41,600
                        </Typography>

                        <Typography>
                            UPI
                        </Typography>

                        <Box className="payment-status received">
                            Received
                        </Box>

                        <Button
                            className="payment-view-button"
                            onClick={() => setShowPaymentDetails(true)}
                        >
                            View
                        </Button>

                    </Box>

                    {/* =========================================
                        PAYMENT ROW 3
                    ========================================= */}
                    <Box className="payment-table-row">

                        <Typography className="payment-number">
                            PAY-003
                        </Typography>

                        <Typography>
                            TechNova Pvt Ltd
                        </Typography>

                        <Typography>
                            INV-003
                        </Typography>

                        <Typography>
                            02 Oct 2026
                        </Typography>

                        <Typography className="payment-amount">
                            ₹57,230
                        </Typography>

                        <Typography>
                            Cash
                        </Typography>

                        <Box className="payment-status pending">
                            Pending
                        </Box>

                        <Button
                            className="payment-view-button"
                            onClick={() => setShowPaymentDetails(true)}
                        >
                            View
                        </Button>

                    </Box>

                    {/* =========================================
                        PAYMENT ROW 4
                    ========================================= */}
                    <Box className="payment-table-row">

                        <Typography className="payment-number">
                            PAY-004
                        </Typography>

                        <Typography>
                            Bright Enterprises
                        </Typography>

                        <Typography>
                            INV-004
                        </Typography>

                        <Typography>
                            29 Sep 2026
                        </Typography>

                        <Typography className="payment-amount">
                            ₹25,000
                        </Typography>

                        <Typography>
                            Bank Transfer
                        </Typography>

                        <Box className="payment-status refunded">
                            Refunded
                        </Box>

                        <Button
                            className="payment-view-button"
                            onClick={() => setShowPaymentDetails(true)}
                        >
                            View
                        </Button>

                    </Box>

                </CardContent>

            </Card>

            {/* =========================================
                NEW PAYMENT FORM MODAL
            ========================================= */}
            {showPaymentForm && (
                <Box className="payment-modal-overlay">

                    <Box className="payment-modal">

                        <PaymentReceivedForm
                            onClose={() => setShowPaymentForm(false)}
                        />

                    </Box>

                </Box>
            )}

        </Box>
    );
};

export default PaymentReceived;