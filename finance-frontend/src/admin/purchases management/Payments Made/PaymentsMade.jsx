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

import PaymentMadeForm from "./PaymentMadeForm";
import PaymentMadeDetails from "./PaymentMadeDetails";

import "./PaymentsMade.css";

const PaymentsMade = () => {
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [showPaymentDetails, setShowPaymentDetails] = useState(false);

    if (showPaymentDetails) {
        return (
            <PaymentMadeDetails
                onBack={() => setShowPaymentDetails(false)}
            />
        );
    }

    return (
        <Box className="payments-made-page">

            {/* Header */}
            <Box className="payments-made-header">
                <Box>
                    <Typography className="payments-made-title">
                        Payments Made
                    </Typography>

                    <Typography className="payments-made-subtitle">
                        Manage payments made to your vendors and suppliers
                    </Typography>
                </Box>

                <Button
                    variant="contained"
                    startIcon={<AddRoundedIcon />}
                    className="payments-made-add-button"
                    onClick={() => setShowPaymentForm(true)}
                >
                    New Payment
                </Button>
            </Box>

            {/* Summary Cards */}
            <Box className="payments-made-summary">

                <Card className="payments-made-summary-card">
                    <CardContent>
                        <Typography className="summary-label">
                            Total Payments
                        </Typography>

                        <Typography className="summary-value">
                            46
                        </Typography>
                    </CardContent>
                </Card>

                <Card className="payments-made-summary-card">
                    <CardContent>
                        <Typography className="summary-label">
                            This Month
                        </Typography>

                        <Typography className="summary-value">
                            ₹6,48,500
                        </Typography>
                    </CardContent>
                </Card>

                <Card className="payments-made-summary-card">
                    <CardContent>
                        <Typography className="summary-label">
                            Pending
                        </Typography>

                        <Typography className="summary-value">
                            8
                        </Typography>
                    </CardContent>
                </Card>

                <Card className="payments-made-summary-card">
                    <CardContent>
                        <Typography className="summary-label">
                            Total Paid
                        </Typography>

                        <Typography className="summary-value">
                            ₹18,42,500
                        </Typography>
                    </CardContent>
                </Card>

            </Box>

            {/* Payments List */}
            <Card className="payments-made-list-card">

                <Box className="payments-made-list-header">

                    <Box>
                        <Typography className="payments-made-list-title">
                            Payments Made
                        </Typography>

                        <Typography className="payments-made-list-subtitle">
                            View and manage vendor payments
                        </Typography>
                    </Box>

                    <Box className="payments-made-actions">

                        <Box className="payments-made-search">
                            <SearchRoundedIcon />

                            <input
                                type="text"
                                placeholder="Search payments..."
                            />
                        </Box>

                        <Button
                            variant="outlined"
                            startIcon={<FilterListRoundedIcon />}
                            className="payments-made-filter-button"
                        >
                            Filter
                        </Button>

                    </Box>
                </Box>

                <Box className="payments-made-table-wrapper">

                    <table className="payments-made-table">

                        <thead>
                            <tr>
                                <th>Payment ID</th>
                                <th>Vendor</th>
                                <th>Payment Date</th>
                                <th>Payment Method</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>

                            <tr>
                                <td>PAY-001</td>
                                <td>ABC Suppliers</td>
                                <td>06 Oct 2026</td>
                                <td>Bank Transfer</td>
                                <td>₹2,95,000</td>
                                <td>
                                    <span className="payment-status paid">
                                        Paid
                                    </span>
                                </td>
                                <td>
                                    <Button
                                        className="payment-view-button"
                                        onClick={() =>
                                            setShowPaymentDetails(true)
                                        }
                                    >
                                        View
                                    </Button>
                                </td>
                            </tr>

                            <tr>
                                <td>PAY-002</td>
                                <td>Global Office Solutions</td>
                                <td>04 Oct 2026</td>
                                <td>Bank Transfer</td>
                                <td>₹1,41,600</td>
                                <td>
                                    <span className="payment-status paid">
                                        Paid
                                    </span>
                                </td>
                                <td>
                                    <Button
                                        className="payment-view-button"
                                        onClick={() =>
                                            setShowPaymentDetails(true)
                                        }
                                    >
                                        View
                                    </Button>
                                </td>
                            </tr>

                            <tr>
                                <td>PAY-003</td>
                                <td>TechWorld Solutions</td>
                                <td>02 Oct 2026</td>
                                <td>Cheque</td>
                                <td>₹72,250</td>
                                <td>
                                    <span className="payment-status pending">
                                        Pending
                                    </span>
                                </td>
                                <td>
                                    <Button
                                        className="payment-view-button"
                                        onClick={() =>
                                            setShowPaymentDetails(true)
                                        }
                                    >
                                        View
                                    </Button>
                                </td>
                            </tr>

                            <tr>
                                <td>PAY-004</td>
                                <td>Bright Office Supplies</td>
                                <td>29 Sep 2026</td>
                                <td>Cash</td>
                                <td>₹48,000</td>
                                <td>
                                    <span className="payment-status cancelled">
                                        Cancelled
                                    </span>
                                </td>
                                <td>
                                    <Button
                                        className="payment-view-button"
                                        onClick={() =>
                                            setShowPaymentDetails(true)
                                        }
                                    >
                                        View
                                    </Button>
                                </td>
                            </tr>

                        </tbody>

                    </table>

                </Box>

            </Card>

            {/* New Payment Modal */}
            {showPaymentForm && (
                <Box className="payment-made-modal-overlay">

                    <Box className="payment-made-modal">

                        <PaymentMadeForm
                            onCancel={() => setShowPaymentForm(false)}
                            onSave={() => setShowPaymentForm(false)}
                        />

                    </Box>

                </Box>
            )}

        </Box>
    );
};

export default PaymentsMade;