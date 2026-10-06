import React, { useState } from "react";
import CustomerForm from "./CustomerForm";
import { useNavigate } from "react-router-dom";
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

import "./Customers.css";

const Customers = () => {
    const [searchTerm, setSearchTerm] = useState("");
    <input
    type="text"
    placeholder="Search customers..."
    value={searchTerm}
    onChange={(event) => setSearchTerm(event.target.value)}
/>

const navigate = useNavigate();

    const [showCustomerForm, setShowCustomerForm] = useState(false);
    return (
        <Box className="customers-page">

            {/* Page Header */}
            <Box className="customers-header">

                <Box>
                    <Typography className="customers-title">
                        Customers
                    </Typography>

                    <Typography className="customers-subtitle">
                        Manage your customers and their financial information
                    </Typography>
                </Box>

                

<Button
    variant="contained"
    startIcon={<AddRoundedIcon />}
    className="add-customer-button"
    onClick={() => setShowCustomerForm(true)}
>
    New Customer
</Button>

            </Box>



            {showCustomerForm && (
    <CustomerForm
        onClose={() => setShowCustomerForm(false)}
    />
)}


            {/* Summary Cards */}
            <Box className="customer-summary">

                <Card className="customer-summary-card">
                    <CardContent>
                        <Typography className="summary-label">
                            Total Customers
                        </Typography>

                        <Typography className="summary-value">
                            248
                        </Typography>
                    </CardContent>
                </Card>


                <Card className="customer-summary-card">
                    <CardContent>
                        <Typography className="summary-label">
                            Active Customers
                        </Typography>

                        <Typography className="summary-value">
                            231
                        </Typography>
                    </CardContent>
                </Card>


                <Card className="customer-summary-card">
                    <CardContent>
                        <Typography className="summary-label">
                            Outstanding
                        </Typography>

                        <Typography className="summary-value">
                            ₹4,26,750
                        </Typography>
                    </CardContent>
                </Card>


                <Card className="customer-summary-card">
                    <CardContent>
                        <Typography className="summary-label">
                            This Month
                        </Typography>

                        <Typography className="summary-value">
                            ₹12,48,500
                        </Typography>
                    </CardContent>
                </Card>

            </Box>


            {/* Customer List */}
            <Card className="customers-table-card">
                <CardContent>

                    {/* Table Header */}
                    <Box className="customers-table-header">

                        <Typography className="customers-table-title">
                            Customer List
                        </Typography>

                        <Box className="customer-actions">

                            <Box className="customer-search">
                                <SearchRoundedIcon />

                                <input
                                    type="text"
                                    placeholder="Search customers..."
                                />
                            </Box>

                            <Button
                                variant="outlined"
                                startIcon={<FilterListRoundedIcon />}
                                className="filter-button"
                            >
                                Filter
                            </Button>

                        </Box>

                    </Box>


                    {/* Table */}
                    <Box className="customers-table">

                        <Box className="table-row table-header-row">

                            <Typography>
                                Customer
                            </Typography>

                            <Typography>
                                Contact
                            </Typography>

                            <Typography>
                                Outstanding
                            </Typography>

                            <Typography>
                                Status
                            </Typography>

                            <Typography>
                                Actions
                            </Typography>

                        </Box>


                        {/* Customer 1 */}
                        <Box className="table-row">

                            <Box>
                                <Typography className="customer-name">
                                    ABC Technologies
                                </Typography>

                                <Typography className="customer-code">
                                    CUST-001
                                </Typography>
                            </Box>

                            <Box>
                                <Typography>
                                    Rahul Sharma
                                </Typography>

                                <Typography className="customer-secondary">
                                    rahul@abctech.com
                                </Typography>
                            </Box>

                            <Typography className="outstanding-amount">
                                ₹1,25,000
                            </Typography>

                            <Typography className="status-active">
                                Active
                            </Typography>

                            <Button
    className="view-button"
    onClick={() => navigate("/sales/customers/1")}
>
    View
</Button>

                        </Box>


                        {/* Customer 2 */}
                        <Box className="table-row">

                            <Box>
                                <Typography className="customer-name">
                                    Global Solutions
                                </Typography>

                                <Typography className="customer-code">
                                    CUST-002
                                </Typography>
                            </Box>

                            <Box>
                                <Typography>
                                    Priya Mehta
                                </Typography>

                                <Typography className="customer-secondary">
                                    priya@globalsolutions.com
                                </Typography>
                            </Box>

                            <Typography className="outstanding-amount">
                                ₹86,500
                            </Typography>

                            <Typography className="status-active">
                                Active
                            </Typography>

                            <Button
    className="view-button"
    onClick={() => navigate("/sales/customers/2")}
>
    View
</Button>

                        </Box>


                        {/* Customer 3 */}
                        <Box className="table-row">

                            <Box>
                                <Typography className="customer-name">
                                    TechNova Pvt Ltd
                                </Typography>

                                <Typography className="customer-code">
                                    CUST-003
                                </Typography>
                            </Box>

                            <Box>
                                <Typography>
                                    Amit Patel
                                </Typography>

                                <Typography className="customer-secondary">
                                    amit@technova.com
                                </Typography>
                            </Box>

                            <Typography className="outstanding-amount">
                                ₹72,250
                            </Typography>

                            <Typography className="status-active">
                                Active
                            </Typography>

                            <Button
    className="view-button"
    onClick={() => navigate("/sales/customers/3")}
>
    View
</Button>

                        </Box>


                        {/* Customer 4 */}
                        <Box className="table-row">

                            <Box>
                                <Typography className="customer-name">
                                    Bright Enterprises
                                </Typography>

                                <Typography className="customer-code">
                                    CUST-004
                                </Typography>
                            </Box>

                            <Box>
                                <Typography>
                                    Neha Shah
                                </Typography>

                                <Typography className="customer-secondary">
                                    neha@bright.com
                                </Typography>
                            </Box>

                            <Typography className="outstanding-amount">
                                ₹48,000
                            </Typography>

                            <Typography className="status-active">
                                Active
                            </Typography>

                            <Button
    className="view-button"
    onClick={() => navigate("/sales/customers/4")}
>
    View
</Button>

                        </Box>

                    </Box>

                </CardContent>
            </Card>

        </Box>
    );
};

export default Customers;