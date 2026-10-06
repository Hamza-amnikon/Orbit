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

import BillForm from "./BillForm";
import BillDetails from "./BillDetails";

import "./Bills.css";

const Bills = () => {
    const [showBillForm, setShowBillForm] = useState(false);
    const [showBillDetails, setShowBillDetails] = useState(false);

    if (showBillDetails) {
        return (
            <BillDetails
                onBack={() => setShowBillDetails(false)}
            />
        );
    }

    return (
        <Box className="bills-page">

            {/* Header */}
            <Box className="bills-header">
                <Box>
                    <Typography className="bills-title">
                        Bills
                    </Typography>

                    <Typography className="bills-subtitle">
                        Manage vendor bills and outstanding payables
                    </Typography>
                </Box>

                <Button
                    variant="contained"
                    startIcon={<AddRoundedIcon />}
                    className="add-bill-button"
                    onClick={() => setShowBillForm(true)}
                >
                    New Bill
                </Button>
            </Box>

            {/* Summary Cards */}
            <Box className="bill-summary-grid">

                <Card className="bill-summary-card">
                    <CardContent>
                        <Typography className="bill-summary-label">
                            Total Bills
                        </Typography>

                        <Typography className="bill-summary-value">
                            58
                        </Typography>
                    </CardContent>
                </Card>

                <Card className="bill-summary-card">
                    <CardContent>
                        <Typography className="bill-summary-label">
                            Pending
                        </Typography>

                        <Typography className="bill-summary-value">
                            18
                        </Typography>
                    </CardContent>
                </Card>

                <Card className="bill-summary-card">
                    <CardContent>
                        <Typography className="bill-summary-label">
                            Overdue
                        </Typography>

                        <Typography className="bill-summary-value">
                            7
                        </Typography>
                    </CardContent>
                </Card>

                <Card className="bill-summary-card">
                    <CardContent>
                        <Typography className="bill-summary-label">
                            Total Payable
                        </Typography>

                        <Typography className="bill-summary-value">
                            ₹8,42,500
                        </Typography>
                    </CardContent>
                </Card>

            </Box>

            {/* Bill List */}
            <Card className="bill-list-card">
                <CardContent className="bill-list-content">

                    <Box className="bill-list-header">

                        <Box>
                            <Typography className="bill-list-title">
                                Bill List
                            </Typography>

                            <Typography className="bill-list-subtitle">
                                View and manage vendor bills
                            </Typography>
                        </Box>

                        <Box className="bill-list-actions">

                            <Box className="bill-search-box">
                                <SearchRoundedIcon />

                                <input
                                    type="text"
                                    placeholder="Search bills..."
                                />
                            </Box>

                            <Button
                                variant="outlined"
                                startIcon={<FilterListRoundedIcon />}
                                className="bill-filter-button"
                            >
                                Filter
                            </Button>

                        </Box>

                    </Box>

                    {/* Table Header */}
                    <Box className="bill-table-header">
                        <Typography>Bill Number</Typography>
                        <Typography>Vendor</Typography>
                        <Typography>Bill Date</Typography>
                        <Typography>Due Date</Typography>
                        <Typography>Amount</Typography>
                        <Typography>Status</Typography>
                        <Typography>Action</Typography>
                    </Box>

                    {/* Row 1 */}
                    <Box className="bill-table-row">

                        <Typography className="bill-number">
                            BILL-001
                        </Typography>

                        <Typography>
                            ABC Suppliers
                        </Typography>

                        <Typography>
                            06 Oct 2026
                        </Typography>

                        <Typography>
                            05 Nov 2026
                        </Typography>

                        <Typography className="bill-amount">
                            ₹2,95,000
                        </Typography>

                        <Box className="bill-status pending">
                            Pending
                        </Box>

                        <Button
                            className="bill-view-button"
                            onClick={() => setShowBillDetails(true)}
                        >
                            View
                        </Button>

                    </Box>

                    {/* Row 2 */}
                    <Box className="bill-table-row">

                        <Typography className="bill-number">
                            BILL-002
                        </Typography>

                        <Typography>
                            Global Office Solutions
                        </Typography>

                        <Typography>
                            04 Oct 2026
                        </Typography>

                        <Typography>
                            03 Nov 2026
                        </Typography>

                        <Typography className="bill-amount">
                            ₹1,41,600
                        </Typography>

                        <Box className="bill-status paid">
                            Paid
                        </Box>

                        <Button
                            className="bill-view-button"
                            onClick={() => setShowBillDetails(true)}
                        >
                            View
                        </Button>

                    </Box>

                    {/* Row 3 */}
                    <Box className="bill-table-row">

                        <Typography className="bill-number">
                            BILL-003
                        </Typography>

                        <Typography>
                            TechWorld Solutions
                        </Typography>

                        <Typography>
                            02 Oct 2026
                        </Typography>

                        <Typography>
                            17 Oct 2026
                        </Typography>

                        <Typography className="bill-amount">
                            ₹72,250
                        </Typography>

                        <Box className="bill-status overdue">
                            Overdue
                        </Box>

                        <Button
                            className="bill-view-button"
                            onClick={() => setShowBillDetails(true)}
                        >
                            View
                        </Button>

                    </Box>

                    {/* Row 4 */}
                    <Box className="bill-table-row">

                        <Typography className="bill-number">
                            BILL-004
                        </Typography>

                        <Typography>
                            Bright Office Supplies
                        </Typography>

                        <Typography>
                            29 Sep 2026
                        </Typography>

                        <Typography>
                            29 Oct 2026
                        </Typography>

                        <Typography className="bill-amount">
                            ₹1,08,560
                        </Typography>

                        <Box className="bill-status draft">
                            Draft
                        </Box>

                        <Button
                            className="bill-view-button"
                            onClick={() => setShowBillDetails(true)}
                        >
                            View
                        </Button>

                    </Box>

                </CardContent>
            </Card>

            {/* New Bill Modal */}
            {showBillForm && (
                <Box className="bill-modal-overlay">

                    <Box className="bill-modal">

                        <BillForm
                            onClose={() => setShowBillForm(false)}
                        />

                    </Box>

                </Box>
            )}

        </Box>
    );
};

export default Bills;