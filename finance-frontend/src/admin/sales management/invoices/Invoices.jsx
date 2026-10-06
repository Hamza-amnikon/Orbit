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

import InvoiceForm from "./InvoiceForm";
import InvoiceDetails from "./InvoiceDetails";

import "./Invoices.css";

const Invoices = () => {
    const [showInvoiceForm, setShowInvoiceForm] = useState(false);
    const [showInvoiceDetails, setShowInvoiceDetails] = useState(false);

    if (showInvoiceDetails) {
        return (
            <InvoiceDetails
                onBack={() => setShowInvoiceDetails(false)}
            />
        );
    }

    return (
        <Box className="invoices-page">

            {/* Page Header */}
            <Box className="invoices-header">

                <Box>
                    <Typography className="invoices-title">
                        Invoices
                    </Typography>

                    <Typography className="invoices-subtitle">
                        Create and manage customer invoices
                    </Typography>
                </Box>

                <Button
                    variant="contained"
                    startIcon={<AddRoundedIcon />}
                    className="add-invoice-button"
                    onClick={() => setShowInvoiceForm(true)}
                >
                    New Invoice
                </Button>

            </Box>

            {/* Summary Cards */}
            <Box className="invoice-summary-grid">

                <Card className="invoice-summary-card">
                    <CardContent>
                        <Typography className="invoice-summary-label">
                            Total Invoices
                        </Typography>

                        <Typography className="invoice-summary-value">
                            48
                        </Typography>
                    </CardContent>
                </Card>

                <Card className="invoice-summary-card">
                    <CardContent>
                        <Typography className="invoice-summary-label">
                            Draft
                        </Typography>

                        <Typography className="invoice-summary-value">
                            8
                        </Typography>
                    </CardContent>
                </Card>

                <Card className="invoice-summary-card">
                    <CardContent>
                        <Typography className="invoice-summary-label">
                            Sent
                        </Typography>

                        <Typography className="invoice-summary-value">
                            17
                        </Typography>
                    </CardContent>
                </Card>

                <Card className="invoice-summary-card">
                    <CardContent>
                        <Typography className="invoice-summary-label">
                            Overdue
                        </Typography>

                        <Typography className="invoice-summary-value">
                            9
                        </Typography>
                    </CardContent>
                </Card>

                <Card className="invoice-summary-card">
                    <CardContent>
                        <Typography className="invoice-summary-label">
                            Paid
                        </Typography>

                        <Typography className="invoice-summary-value">
                            14
                        </Typography>
                    </CardContent>
                </Card>

            </Box>

            {/* Invoice List */}
            <Card className="invoice-list-card">

                <CardContent className="invoice-list-content">

                    <Box className="invoice-list-header">

                        <Box>
                            <Typography className="invoice-list-title">
                                Invoice List
                            </Typography>

                            <Typography className="invoice-list-subtitle">
                                View and manage customer invoices
                            </Typography>
                        </Box>

                        <Box className="invoice-list-actions">

                            <Box className="invoice-search-box">

                                <SearchRoundedIcon />

                                <input
                                    type="text"
                                    placeholder="Search invoices..."
                                />

                            </Box>

                            <Button
                                variant="outlined"
                                startIcon={<FilterListRoundedIcon />}
                                className="invoice-filter-button"
                            >
                                Filter
                            </Button>

                        </Box>

                    </Box>

                    {/* Table Header */}
                    <Box className="invoice-table-header">

                        <Typography>Invoice</Typography>
                        <Typography>Customer</Typography>
                        <Typography>Invoice Date</Typography>
                        <Typography>Due Date</Typography>
                        <Typography>Amount</Typography>
                        <Typography>Status</Typography>
                        <Typography>Action</Typography>

                    </Box>

                    {/* Invoice Row 1 */}
                    <Box className="invoice-table-row">

                        <Typography className="invoice-number">
                            INV-001
                        </Typography>

                        <Typography>
                            ABC Technologies
                        </Typography>

                        <Typography>
                            06 Oct 2026
                        </Typography>

                        <Typography>
                            20 Oct 2026
                        </Typography>

                        <Typography className="invoice-amount">
                            ₹88,500
                        </Typography>

                        <Box className="invoice-status sent">
                            Sent
                        </Box>

                        <Button
                            className="invoice-view-button"
                            onClick={() => setShowInvoiceDetails(true)}
                        >
                            View
                        </Button>

                    </Box>

                    {/* Invoice Row 2 */}
                    <Box className="invoice-table-row">

                        <Typography className="invoice-number">
                            INV-002
                        </Typography>

                        <Typography>
                            Global Solutions
                        </Typography>

                        <Typography>
                            04 Oct 2026
                        </Typography>

                        <Typography>
                            18 Oct 2026
                        </Typography>

                        <Typography className="invoice-amount">
                            ₹1,41,600
                        </Typography>

                        <Box className="invoice-status paid">
                            Paid
                        </Box>

                        <Button
                            className="invoice-view-button"
                            onClick={() => setShowInvoiceDetails(true)}
                        >
                            View
                        </Button>

                    </Box>

                    {/* Invoice Row 3 */}
                    <Box className="invoice-table-row">

                        <Typography className="invoice-number">
                            INV-003
                        </Typography>

                        <Typography>
                            TechNova Pvt Ltd
                        </Typography>

                        <Typography>
                            02 Oct 2026
                        </Typography>

                        <Typography>
                            16 Oct 2026
                        </Typography>

                        <Typography className="invoice-amount">
                            ₹57,230
                        </Typography>

                        <Box className="invoice-status overdue">
                            Overdue
                        </Box>

                        <Button
                            className="invoice-view-button"
                            onClick={() => setShowInvoiceDetails(true)}
                        >
                            View
                        </Button>

                    </Box>

                    {/* Invoice Row 4 */}
                    <Box className="invoice-table-row">

                        <Typography className="invoice-number">
                            INV-004
                        </Typography>

                        <Typography>
                            Bright Enterprises
                        </Typography>

                        <Typography>
                            29 Sep 2026
                        </Typography>

                        <Typography>
                            13 Oct 2026
                        </Typography>

                        <Typography className="invoice-amount">
                            ₹1,08,560
                        </Typography>

                        <Box className="invoice-status draft">
                            Draft
                        </Box>

                        <Button
                            className="invoice-view-button"
                            onClick={() => setShowInvoiceDetails(true)}
                        >
                            View
                        </Button>

                    </Box>

                </CardContent>

            </Card>

            {/* Invoice Form Modal */}
            {showInvoiceForm && (
                <Box className="invoice-modal-overlay">

                    <Box className="invoice-modal">

                        <InvoiceForm
                            onClose={() => setShowInvoiceForm(false)}
                        />

                    </Box>

                </Box>
            )}

        </Box>
    );
};

export default Invoices;