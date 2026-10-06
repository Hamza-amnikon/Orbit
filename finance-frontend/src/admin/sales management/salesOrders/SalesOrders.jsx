import React, { useState } from "react";
import SalesOrderDetails from "./SalesOrderDetails";

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

import SalesOrderForm from "./SalesOrderForm";

import "./SalesOrders.css";

const SalesOrders = () => {
    const [showSalesOrderForm, setShowSalesOrderForm] = useState(false);
    const [selectedSalesOrder, setSelectedSalesOrder] = useState(null);
    if (selectedSalesOrder) {
    return (
        <SalesOrderDetails
            onBack={() => setSelectedSalesOrder(null)}
        />
    );
}

    return (
        <Box className="sales-orders-page">

            {/* Header */}
            <Box className="sales-orders-header">

                <Box>
                    <Typography className="sales-orders-title">
                        Sales Orders
                    </Typography>

                    <Typography className="sales-orders-subtitle">
                        Create and manage customer sales orders
                    </Typography>
                </Box>

                <Button
                    variant="contained"
                    startIcon={<AddRoundedIcon />}
                    className="new-sales-order-button"
                    onClick={() => setShowSalesOrderForm(true)}
                >
                    New Sales Order
                </Button>

            </Box>


            {/* Summary Cards */}
            <Box className="sales-order-summary">

                <Card className="sales-order-summary-card">
                    <CardContent>
                        <Typography className="sales-order-summary-label">
                            Total Orders
                        </Typography>

                        <Typography className="sales-order-summary-value">
                            36
                        </Typography>
                    </CardContent>
                </Card>


                <Card className="sales-order-summary-card">
                    <CardContent>
                        <Typography className="sales-order-summary-label">
                            Draft
                        </Typography>

                        <Typography className="sales-order-summary-value">
                            8
                        </Typography>
                    </CardContent>
                </Card>


                <Card className="sales-order-summary-card">
                    <CardContent>
                        <Typography className="sales-order-summary-label">
                            Confirmed
                        </Typography>

                        <Typography className="sales-order-summary-value">
                            22
                        </Typography>
                    </CardContent>
                </Card>


                <Card className="sales-order-summary-card">
                    <CardContent>
                        <Typography className="sales-order-summary-label">
                            Cancelled
                        </Typography>

                        <Typography className="sales-order-summary-value">
                            6
                        </Typography>
                    </CardContent>
                </Card>

            </Box>


            {/* Sales Order List */}
            <Card className="sales-orders-table-card">

                <CardContent>

                    {/* Table Header */}
                    <Box className="sales-orders-table-header">

                        <Typography className="sales-orders-table-title">
                            Sales Order List
                        </Typography>


                        <Box className="sales-order-actions">

                            <Box className="sales-order-search">

                                <SearchRoundedIcon />

                                <input
                                    type="text"
                                    placeholder="Search sales orders..."
                                />

                            </Box>


                            <Button
                                variant="outlined"
                                startIcon={<FilterListRoundedIcon />}
                                className="sales-order-filter-button"
                            >
                                Filter
                            </Button>

                        </Box>

                    </Box>


                    {/* Table Header Row */}
                    <Box className="sales-order-row sales-order-header-row">

                        <Typography>
                            Sales Order
                        </Typography>

                        <Typography>
                            Customer
                        </Typography>

                        <Typography>
                            Date
                        </Typography>

                        <Typography>
                            Amount
                        </Typography>

                        <Typography>
                            Status
                        </Typography>

                        <Typography>
                            Actions
                        </Typography>

                    </Box>


                    {/* Sales Order 1 */}
                    <Box className="sales-order-row">

                        <Box>
                            <Typography className="sales-order-number">
                                SO-001
                            </Typography>

                            <Typography className="sales-order-secondary">
                                Website Development
                            </Typography>
                        </Box>

                        <Typography>
                            ABC Technologies
                        </Typography>

                        <Typography>
                            06 Oct 2026
                        </Typography>

                        <Typography className="sales-order-amount">
                            ₹88,500
                        </Typography>

                        <Typography className="sales-order-status status-confirmed">
                            Confirmed
                        </Typography>

                        <Button
    onClick={() => setSelectedSalesOrder("SO-001")}
>
    View
</Button>

                    </Box>


                    {/* Sales Order 2 */}
                    <Box className="sales-order-row">

                        <Box>
                            <Typography className="sales-order-number">
                                SO-002
                            </Typography>

                            <Typography className="sales-order-secondary">
                                Software Development
                            </Typography>
                        </Box>

                        <Typography>
                            Global Solutions
                        </Typography>

                        <Typography>
                            04 Oct 2026
                        </Typography>

                        <Typography className="sales-order-amount">
                            ₹1,41,600
                        </Typography>

                        <Typography className="sales-order-status status-confirmed">
                            Confirmed
                        </Typography>

                        <Button
    onClick={() => setSelectedSalesOrder("SO-002")}
>
    View
</Button>

                    </Box>


                    {/* Sales Order 3 */}
                    <Box className="sales-order-row">

                        <Box>
                            <Typography className="sales-order-number">
                                SO-003
                            </Typography>

                            <Typography className="sales-order-secondary">
                                IT Support Services
                            </Typography>
                        </Box>

                        <Typography>
                            TechNova Pvt Ltd
                        </Typography>

                        <Typography>
                            02 Oct 2026
                        </Typography>

                        <Typography className="sales-order-amount">
                            ₹57,230
                        </Typography>

                        <Typography className="sales-order-status status-draft">
                            Draft
                        </Typography>

                        <Button
    onClick={() => setSelectedSalesOrder("SO-003")}
>
    View
</Button>

                    </Box>


                    {/* Sales Order 4 */}
                    <Box className="sales-order-row">

                        <Box>
                            <Typography className="sales-order-number">
                                SO-004
                            </Typography>

                            <Typography className="sales-order-secondary">
                                Cloud Services
                            </Typography>
                        </Box>

                        <Typography>
                            Bright Enterprises
                        </Typography>

                        <Typography>
                            29 Sep 2026
                        </Typography>

                        <Typography className="sales-order-amount">
                            ₹1,08,560
                        </Typography>

                        <Typography className="sales-order-status status-cancelled">
                            Cancelled
                        </Typography>

                        <Button
    onClick={() => setSelectedSalesOrder("SO-004")}
>
    View
</Button>

                    </Box>

                </CardContent>

            </Card>


            {/* New Sales Order Modal */}
            {showSalesOrderForm && (
                <Box className="sales-order-modal-overlay">

                    <Box className="sales-order-modal">

                        <SalesOrderForm
                            onClose={() => setShowSalesOrderForm(false)}
                        />

                    </Box>

                </Box>
            )}

        </Box>
    );
};

export default SalesOrders;