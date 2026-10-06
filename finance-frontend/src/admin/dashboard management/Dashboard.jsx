import React from "react";
import "./Dashboard.css";

import {
    Box,
    Button,
    Card,
    CardContent,
    Grid,
    Stack,
    Typography,
} from "@mui/material";

import {
    TrendingUpRounded,
    TrendingDownRounded,
    AccountBalanceWalletRounded,
    ReceiptLongRounded,
    CreditCardRounded,
    ArrowUpwardRounded,
    ArrowDownwardRounded,
    AddRounded,
    ArrowForwardRounded,
} from "@mui/icons-material";

const Dashboard = () => {
    return (
        <Box className="finance-dashboard">

            {/* Page Header */}
            <Box className="dashboard-heading">
                <Box>
                    <Typography className="dashboard-title">
                        Dashboard
                    </Typography>

                    <Typography className="dashboard-subtitle">
                        Overview of your financial activity
                    </Typography>
                </Box>

                <Button
                    variant="outlined"
                    className="date-filter"
                >
                    This Month
                </Button>
            </Box>


            {/* Summary Cards */}
            <Grid
                container
                spacing={2}
                className="summary-grid"
            >

                {/* Revenue */}
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <Card className="summary-card">
                        <CardContent>

                            <Box className="card-top">
                                <Box className="card-icon">
                                    <TrendingUpRounded />
                                </Box>

                                <Typography className="positive-change">
                                    +12.5%
                                </Typography>
                            </Box>

                            <Typography className="card-label">
                                Revenue
                            </Typography>

                            <Typography className="card-value">
                                ₹12,48,500
                            </Typography>

                            <Box className="card-footer">
                                <ArrowUpwardRounded />

                                <Typography>
                                    12.5% from last month
                                </Typography>
                            </Box>

                        </CardContent>
                    </Card>
                </Grid>


                {/* Expenses */}
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <Card className="summary-card">
                        <CardContent>

                            <Box className="card-top">
                                <Box className="card-icon">
                                    <TrendingDownRounded />
                                </Box>

                                <Typography className="negative-change">
                                    +8.2%
                                </Typography>
                            </Box>

                            <Typography className="card-label">
                                Expenses
                            </Typography>

                            <Typography className="card-value">
                                ₹6,82,400
                            </Typography>

                            <Box className="card-footer">
                                <ArrowDownwardRounded />

                                <Typography>
                                    8.2% from last month
                                </Typography>
                            </Box>

                        </CardContent>
                    </Card>
                </Grid>


                {/* Accounts Receivable */}
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <Card className="summary-card">
                        <CardContent>

                            <Box className="card-top">
                                <Box className="card-icon">
                                    <ReceiptLongRounded />
                                </Box>

                                <Typography className="neutral-change">
                                    18 invoices
                                </Typography>
                            </Box>

                            <Typography className="card-label">
                                Accounts Receivable
                            </Typography>

                            <Typography className="card-value">
                                ₹4,26,750
                            </Typography>

                            <Box className="card-footer">
                                <Typography>
                                    Outstanding customer payments
                                </Typography>
                            </Box>

                        </CardContent>
                    </Card>
                </Grid>


                {/* Accounts Payable */}
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <Card className="summary-card">
                        <CardContent>

                            <Box className="card-top">
                                <Box className="card-icon">
                                    <CreditCardRounded />
                                </Box>

                                <Typography className="neutral-change">
                                    11 bills
                                </Typography>
                            </Box>

                            <Typography className="card-label">
                                Accounts Payable
                            </Typography>

                            <Typography className="card-value">
                                ₹2,18,300
                            </Typography>

                            <Box className="card-footer">
                                <Typography>
                                    Outstanding vendor payments
                                </Typography>
                            </Box>

                        </CardContent>
                    </Card>
                </Grid>

            </Grid>


            {/* Income vs Expense + Cash Bank */}
            <Grid
                container
                spacing={2}
                className="dashboard-grid"
            >

                {/* Income vs Expense */}
                <Grid size={{ xs: 12, lg: 8 }}>
                    <Card className="dashboard-card">
                        <CardContent>

                            <Box className="section-header">

                                <Box>
                                    <Typography className="section-title">
                                        Income vs Expense
                                    </Typography>

                                    <Typography className="section-subtitle">
                                        Financial performance for the last 6 months
                                    </Typography>
                                </Box>

                                <Button
                                    variant="text"
                                    endIcon={<ArrowForwardRounded />}
                                    className="view-button"
                                >
                                    View Report
                                </Button>

                            </Box>


                            {/* Chart */}
                            <Box className="chart-container">

                                <Box className="chart-y-axis">
                                    <span>₹15L</span>
                                    <span>₹10L</span>
                                    <span>₹5L</span>
                                    <span>₹0</span>
                                </Box>


                                <Box className="chart-area">

                                    <Box className="chart-lines">
                                        <span />
                                        <span />
                                        <span />
                                        <span />
                                    </Box>


                                    <Box className="bar-group bar-group-1">
                                        <Box className="bar income-bar" />
                                        <Box className="bar expense-bar" />
                                    </Box>

                                    <Box className="bar-group bar-group-2">
                                        <Box className="bar income-bar" />
                                        <Box className="bar expense-bar" />
                                    </Box>

                                    <Box className="bar-group bar-group-3">
                                        <Box className="bar income-bar" />
                                        <Box className="bar expense-bar" />
                                    </Box>

                                    <Box className="bar-group bar-group-4">
                                        <Box className="bar income-bar" />
                                        <Box className="bar expense-bar" />
                                    </Box>

                                    <Box className="bar-group bar-group-5">
                                        <Box className="bar income-bar" />
                                        <Box className="bar expense-bar" />
                                    </Box>

                                    <Box className="bar-group bar-group-6">
                                        <Box className="bar income-bar" />
                                        <Box className="bar expense-bar" />
                                    </Box>


                                    <Box className="chart-months">
                                        <span>May</span>
                                        <span>Jun</span>
                                        <span>Jul</span>
                                        <span>Aug</span>
                                        <span>Sep</span>
                                        <span>Oct</span>
                                    </Box>

                                </Box>

                            </Box>


                            {/* Chart Legend */}
                            <Stack
                                direction="row"
                                spacing={3}
                                className="chart-legend"
                            >

                                <Box>
                                    <span className="legend-dot income-dot" />
                                    Income
                                </Box>

                                <Box>
                                    <span className="legend-dot expense-dot" />
                                    Expense
                                </Box>

                            </Stack>

                        </CardContent>
                    </Card>
                </Grid>


                {/* Cash & Bank */}
                <Grid size={{ xs: 12, lg: 4 }}>
                    <Card className="dashboard-card cash-card">
                        <CardContent>

                            <Box className="section-header">

                                <Box>
                                    <Typography className="section-title">
                                        Cash & Bank
                                    </Typography>

                                    <Typography className="section-subtitle">
                                        Available balances
                                    </Typography>
                                </Box>

                                <AccountBalanceWalletRounded className="section-icon" />

                            </Box>


                            <Box className="cash-total">
                                <Typography>
                                    Total Balance
                                </Typography>

                                <Typography>
                                    ₹8,74,250
                                </Typography>
                            </Box>


                            {/* HDFC */}
                            <Box className="bank-item">

                                <Box className="bank-left">

                                    <Box className="bank-icon">
                                        B
                                    </Box>

                                    <Box>
                                        <Typography>
                                            Bank Account
                                        </Typography>

                                        <Typography>
                                            HDFC Bank •••• 4582
                                        </Typography>
                                    </Box>

                                </Box>

                                <Typography>
                                    ₹6,25,400
                                </Typography>

                            </Box>


                            {/* ICICI */}
                            <Box className="bank-item">

                                <Box className="bank-left">

                                    <Box className="bank-icon">
                                        C
                                    </Box>

                                    <Box>
                                        <Typography>
                                            Current Account
                                        </Typography>

                                        <Typography>
                                            ICICI Bank •••• 7821
                                        </Typography>
                                    </Box>

                                </Box>

                                <Typography>
                                    ₹1,98,850
                                </Typography>

                            </Box>


                            {/* Cash */}
                            <Box className="bank-item">

                                <Box className="bank-left">

                                    <Box className="bank-icon">
                                        C
                                    </Box>

                                    <Box>
                                        <Typography>
                                            Cash
                                        </Typography>

                                        <Typography>
                                            Petty Cash
                                        </Typography>
                                    </Box>

                                </Box>

                                <Typography>
                                    ₹50,000
                                </Typography>

                            </Box>


                            <Button
                                variant="outlined"
                                fullWidth
                                endIcon={<ArrowForwardRounded />}
                                className="full-width-button"
                            >
                                View Bank Accounts
                            </Button>

                        </CardContent>
                    </Card>
                </Grid>

            </Grid>


            {/* Transactions + Invoices */}
            <Grid
                container
                spacing={2}
                className="bottom-grid"
            >

                {/* Recent Transactions */}
                <Grid size={{ xs: 12, lg: 6 }}>
                    <Card className="dashboard-card">
                        <CardContent>

                            <Box className="section-header">

                                <Box>
                                    <Typography className="section-title">
                                        Recent Transactions
                                    </Typography>

                                    <Typography className="section-subtitle">
                                        Latest financial transactions
                                    </Typography>
                                </Box>

                                <Button
                                    variant="text"
                                    endIcon={<ArrowForwardRounded />}
                                    className="view-button"
                                >
                                    View All
                                </Button>

                            </Box>


                            <Box className="transaction-list">

                                <Box className="transaction-row">

                                    <Box className="transaction-icon income">
                                        <ArrowDownwardRounded />
                                    </Box>

                                    <Box className="transaction-info">

                                        <Typography>
                                            Payment Received
                                        </Typography>

                                        <Typography>
                                            ABC Technologies
                                        </Typography>

                                    </Box>

                                    <Typography className="transaction-amount positive">
                                        +₹85,000
                                    </Typography>

                                </Box>


                                <Box className="transaction-row">

                                    <Box className="transaction-icon expense">
                                        <ArrowUpwardRounded />
                                    </Box>

                                    <Box className="transaction-info">

                                        <Typography>
                                            Office Rent
                                        </Typography>

                                        <Typography>
                                            Property Management
                                        </Typography>

                                    </Box>

                                    <Typography className="transaction-amount negative">
                                        -₹45,000
                                    </Typography>

                                </Box>


                                <Box className="transaction-row">

                                    <Box className="transaction-icon income">
                                        <ArrowDownwardRounded />
                                    </Box>

                                    <Box className="transaction-info">

                                        <Typography>
                                            Invoice Payment
                                        </Typography>

                                        <Typography>
                                            Global Solutions
                                        </Typography>

                                    </Box>

                                    <Typography className="transaction-amount positive">
                                        +₹62,500
                                    </Typography>

                                </Box>


                                <Box className="transaction-row">

                                    <Box className="transaction-icon expense">
                                        <ArrowUpwardRounded />
                                    </Box>

                                    <Box className="transaction-info">

                                        <Typography>
                                            Software Subscription
                                        </Typography>

                                        <Typography>
                                            Cloud Services
                                        </Typography>

                                    </Box>

                                    <Typography className="transaction-amount negative">
                                        -₹18,750
                                    </Typography>

                                </Box>

                            </Box>

                        </CardContent>
                    </Card>
                </Grid>


                {/* Outstanding Invoices */}
                <Grid size={{ xs: 12, lg: 6 }}>
                    <Card className="dashboard-card">
                        <CardContent>

                            <Box className="section-header">

                                <Box>
                                    <Typography className="section-title">
                                        Outstanding Invoices
                                    </Typography>

                                    <Typography className="section-subtitle">
                                        Invoices requiring payment
                                    </Typography>
                                </Box>

                                <Button
                                    variant="text"
                                    endIcon={<ArrowForwardRounded />}
                                    className="view-button"
                                >
                                    View All
                                </Button>

                            </Box>


                            <Box className="invoice-list">

                                <Box className="invoice-row">

                                    <Box>
                                        <Typography>
                                            INV-2026-0012
                                        </Typography>

                                        <Typography>
                                            ABC Technologies
                                        </Typography>
                                    </Box>

                                    <Box className="invoice-right">

                                        <Typography>
                                            ₹1,25,000
                                        </Typography>

                                        <Typography className="due-warning">
                                            Due in 3 days
                                        </Typography>

                                    </Box>

                                </Box>


                                <Box className="invoice-row">

                                    <Box>
                                        <Typography>
                                            INV-2026-0018
                                        </Typography>

                                        <Typography>
                                            Global Solutions
                                        </Typography>
                                    </Box>

                                    <Box className="invoice-right">

                                        <Typography>
                                            ₹86,500
                                        </Typography>

                                        <Typography className="due-warning">
                                            Due in 5 days
                                        </Typography>

                                    </Box>

                                </Box>


                                <Box className="invoice-row">

                                    <Box>
                                        <Typography>
                                            INV-2026-0024
                                        </Typography>

                                        <Typography>
                                            TechNova Pvt Ltd
                                        </Typography>
                                    </Box>

                                    <Box className="invoice-right">

                                        <Typography>
                                            ₹72,250
                                        </Typography>

                                        <Typography className="overdue">
                                            Overdue
                                        </Typography>

                                    </Box>

                                </Box>

                            </Box>

                        </CardContent>
                    </Card>
                </Grid>

            </Grid>


            {/* Quick Actions */}
            <Card className="quick-actions-card">
                <CardContent>

                    <Box className="quick-actions-wrapper">

                        <Box>

                            <Typography className="quick-actions-title">
                                Quick Actions
                            </Typography>

                            <Typography className="quick-actions-subtitle">
                                Create and manage your financial transactions
                            </Typography>

                        </Box>


                        <Stack
                            direction="row"
                            spacing={1}
                            className="quick-actions"
                        >

                            <Button
                                variant="outlined"
                                startIcon={<AddRounded />}
                            >
                                Create Invoice
                            </Button>

                            <Button
                                variant="outlined"
                                startIcon={<AddRounded />}
                            >
                                Add Expense
                            </Button>

                            <Button
                                variant="outlined"
                                startIcon={<AddRounded />}
                            >
                                Add Customer
                            </Button>

                            <Button
                                variant="outlined"
                                startIcon={<AddRounded />}
                            >
                                Add Vendor
                            </Button>

                        </Stack>

                    </Box>

                </CardContent>
            </Card>

        </Box>
    );
};

export default Dashboard;