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

import PurchaseOrderForm from "./PurchaseOrderForm";
import PurchaseOrderDetails from "./PurchaseOrderDetails";

import "./PurchaseOrders.css";

const PurchaseOrders = () => {
    const [showPurchaseOrderForm, setShowPurchaseOrderForm] = useState(false);
    const [showPurchaseOrderDetails, setShowPurchaseOrderDetails] =
        useState(false);

    if (showPurchaseOrderDetails) {
        return (
            <PurchaseOrderDetails
                onBack={() => setShowPurchaseOrderDetails(false)}
            />
        );
    }

    return (
        <Box className="purchase-orders-page">

            {/* Header */}
            <Box className="purchase-orders-header">
                <Box>
                    <Typography className="purchase-orders-title">
                        Purchase Orders
                    </Typography>

                    <Typography className="purchase-orders-subtitle">
                        Create and manage purchase orders for your vendors
                    </Typography>
                </Box>

                <Button
                    variant="contained"
                    startIcon={<AddRoundedIcon />}
                    className="add-purchase-order-button"
                    onClick={() => setShowPurchaseOrderForm(true)}
                >
                    New Purchase Order
                </Button>
            </Box>

            {/* Summary Cards */}
            <Box className="purchase-order-summary-grid">

                <Card className="purchase-order-summary-card">
                    <CardContent>
                        <Typography className="purchase-order-summary-label">
                            Total Purchase Orders
                        </Typography>

                        <Typography className="purchase-order-summary-value">
                            42
                        </Typography>
                    </CardContent>
                </Card>

                <Card className="purchase-order-summary-card">
                    <CardContent>
                        <Typography className="purchase-order-summary-label">
                            Draft
                        </Typography>

                        <Typography className="purchase-order-summary-value">
                            8
                        </Typography>
                    </CardContent>
                </Card>

                <Card className="purchase-order-summary-card">
                    <CardContent>
                        <Typography className="purchase-order-summary-label">
                            Confirmed
                        </Typography>

                        <Typography className="purchase-order-summary-value">
                            26
                        </Typography>
                    </CardContent>
                </Card>

                <Card className="purchase-order-summary-card">
                    <CardContent>
                        <Typography className="purchase-order-summary-label">
                            Cancelled
                        </Typography>

                        <Typography className="purchase-order-summary-value">
                            8
                        </Typography>
                    </CardContent>
                </Card>

            </Box>

            {/* Purchase Order List */}
            <Card className="purchase-order-list-card">
                <CardContent className="purchase-order-list-content">

                    <Box className="purchase-order-list-header">
                        <Box>
                            <Typography className="purchase-order-list-title">
                                Purchase Order List
                            </Typography>

                            <Typography className="purchase-order-list-subtitle">
                                View and manage purchase orders
                            </Typography>
                        </Box>

                        <Box className="purchase-order-list-actions">

                            <Box className="purchase-order-search-box">
                                <SearchRoundedIcon />

                                <input
                                    type="text"
                                    placeholder="Search purchase orders..."
                                />
                            </Box>

                            <Button
                                variant="outlined"
                                startIcon={<FilterListRoundedIcon />}
                                className="purchase-order-filter-button"
                            >
                                Filter
                            </Button>

                        </Box>
                    </Box>

                    {/* Table Header */}
                    <Box className="purchase-order-table-header">
                        <Typography>Purchase Order</Typography>
                        <Typography>Vendor</Typography>
                        <Typography>Order Date</Typography>
                        <Typography>Expected Date</Typography>
                        <Typography>Amount</Typography>
                        <Typography>Status</Typography>
                        <Typography>Action</Typography>
                    </Box>

                    {/* Row 1 */}
                    <Box className="purchase-order-table-row">

                        <Typography className="purchase-order-number">
                            PO-001
                        </Typography>

                        <Typography>
                            ABC Suppliers
                        </Typography>

                        <Typography>
                            06 Oct 2026
                        </Typography>

                        <Typography>
                            15 Oct 2026
                        </Typography>

                        <Typography className="purchase-order-amount">
                            ₹5,90,000
                        </Typography>

                        <Box className="purchase-order-status confirmed">
                            Confirmed
                        </Box>

                        <Button
                            className="purchase-order-view-button"
                            onClick={() => setShowPurchaseOrderDetails(true)}
                        >
                            View
                        </Button>

                    </Box>

                    {/* Row 2 */}
                    <Box className="purchase-order-table-row">

                        <Typography className="purchase-order-number">
                            PO-002
                        </Typography>

                        <Typography>
                            Global Office Solutions
                        </Typography>

                        <Typography>
                            04 Oct 2026
                        </Typography>

                        <Typography>
                            12 Oct 2026
                        </Typography>

                        <Typography className="purchase-order-amount">
                            ₹1,41,600
                        </Typography>

                        <Box className="purchase-order-status confirmed">
                            Confirmed
                        </Box>

                        <Button
                            className="purchase-order-view-button"
                            onClick={() => setShowPurchaseOrderDetails(true)}
                        >
                            View
                        </Button>

                    </Box>

                    {/* Row 3 */}
                    <Box className="purchase-order-table-row">

                        <Typography className="purchase-order-number">
                            PO-003
                        </Typography>

                        <Typography>
                            TechWorld Solutions
                        </Typography>

                        <Typography>
                            02 Oct 2026
                        </Typography>

                        <Typography>
                            10 Oct 2026
                        </Typography>

                        <Typography className="purchase-order-amount">
                            ₹72,250
                        </Typography>

                        <Box className="purchase-order-status draft">
                            Draft
                        </Box>

                        <Button
                            className="purchase-order-view-button"
                            onClick={() => setShowPurchaseOrderDetails(true)}
                        >
                            View
                        </Button>

                    </Box>

                    {/* Row 4 */}
                    <Box className="purchase-order-table-row">

                        <Typography className="purchase-order-number">
                            PO-004
                        </Typography>

                        <Typography>
                            Bright Office Supplies
                        </Typography>

                        <Typography>
                            29 Sep 2026
                        </Typography>

                        <Typography>
                            07 Oct 2026
                        </Typography>

                        <Typography className="purchase-order-amount">
                            ₹1,08,560
                        </Typography>

                        <Box className="purchase-order-status cancelled">
                            Cancelled
                        </Box>

                        <Button
                            className="purchase-order-view-button"
                            onClick={() => setShowPurchaseOrderDetails(true)}
                        >
                            View
                        </Button>

                    </Box>

                </CardContent>
            </Card>

            {/* New Purchase Order Modal */}
            {showPurchaseOrderForm && (
                <Box className="purchase-order-modal-overlay">

                    <Box className="purchase-order-modal">

                        <PurchaseOrderForm
                            onClose={() => setShowPurchaseOrderForm(false)}
                        />

                    </Box>

                </Box>
            )}

        </Box>
    );
};

export default PurchaseOrders;