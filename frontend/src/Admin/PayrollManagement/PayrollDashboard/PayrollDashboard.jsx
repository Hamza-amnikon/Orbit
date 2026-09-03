import React from "react";
import {
    Box,
    Card,
    CardContent,
    Grid,
    Typography,
    Button,
    Select,
    MenuItem,
    LinearProgress,
} from "@mui/material";

import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import PendingOutlinedIcon from "@mui/icons-material/PendingOutlined";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";

import "./PayrollDashboard.css";

function PayrollDashboard() {
    const [month, setMonth] = React.useState("May 2026");

    const summaryCards = [
        {
            title: "Total Payroll",
            value: "₹24,85,000",
            subtitle: "+12.4% from Apr 2026",
            icon: <AccountBalanceWalletOutlinedIcon />,
            color: "blue",
            positive: true,
        },
        {
            title: "Employees Processed",
            value: "156",
            subtitle: "Active employees",
            icon: <GroupsOutlinedIcon />,
            color: "green",
        },
        {
            title: "Net Salary Paid",
            value: "₹21,66,250",
            subtitle: "87.1% of total payroll",
            icon: <TrendingUpOutlinedIcon />,
            color: "purple",
        },
        {
            title: "Total Deductions",
            value: "₹2,18,750",
            subtitle: "8.8% of total payroll",
            icon: <ReceiptLongOutlinedIcon />,
            color: "orange",
        },
        
    ];

    const payrollOverview = [
        {
            month: "Dec",
            value: 68,
        },
        {
            month: "Jan",
            value: 76,
        },
        {
            month: "Feb",
            value: 72,
        },
        {
            month: "Mar",
            value: 84,
        },
        {
            month: "Apr",
            value: 80,
        },
        {
            month: "May",
            value: 92,
        },
    ];

    const departments = [
        {
            name: "IT Department",
            amount: "₹9,25,000",
            percentage: 74,
        },
        {
            name: "HR Department",
            amount: "₹4,80,000",
            percentage: 52,
        },
        {
            name: "Finance Department",
            amount: "₹3,65,000",
            percentage: 40,
        },
        {
            name: "Sales Department",
            amount: "₹4,10,000",
            percentage: 45,
        },
        {
            name: "Operations",
            amount: "₹3,05,000",
            percentage: 33,
        },
    ];

    const handleRunPayroll = () => {
        console.log("Run Payroll:", month);
    };

    const handleQuickAction = (action) => {
        console.log("Quick Action:", action);
    };

    return (
        <Box className="pd-payroll-dashboard">

            {/* =========================
                HEADER
            ========================= */}

            <Box className="pd-payroll-dashboard-header">

                <Box>
                    <Typography className="pd-payroll-dashboard-title">
                        Payroll Dashboard
                    </Typography>

                    <Typography className="pd-payroll-dashboard-subtitle">
                        Monitor payroll, salaries, deductions and employee payments.
                    </Typography>
                </Box>

                <Box className="pd-payroll-dashboard-header-actions">

                    <Select
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        className="pd-payroll-month-select"
                        size="small"
                    >
                        <MenuItem value="May 2026">
                            May 2026
                        </MenuItem>

                        <MenuItem value="April 2026">
                            April 2026
                        </MenuItem>

                        <MenuItem value="March 2026">
                            March 2026
                        </MenuItem>

                        <MenuItem value="February 2026">
                            February 2026
                        </MenuItem>
                    </Select>

                    <Button
                        className="pd-run-payroll-button"
                        variant="contained"
                        startIcon={<PlayArrowIcon />}
                        onClick={handleRunPayroll}
                    >
                        Run Payroll
                    </Button>

                </Box>

            </Box>


            {/* =========================
                SUMMARY CARDS
            ========================= */}

            <Grid
                container
                spacing={2.5}
                className="pd-payroll-summary-grid"
            >

                {summaryCards.map((card) => (
                    <Grid
                        key={card.title}
                        size={{
                            xs: 12,
                            sm: 6,
                            lg: 3,
                        }}
                    >

                        <Card className="pd-payroll-summary-card">

                            <CardContent>

                                <Box className="pd-summary-card-top">

                                    <Box>
                                        <Typography className="pd-summary-card-title">
                                            {card.title}
                                        </Typography>

                                        <Typography className="pd-summary-card-value">
                                            {card.value}
                                        </Typography>

                                        <Typography
                                            className={
                                                card.positive
                                                    ? "pd-summary-card-subtitle pd-positive"
                                                    : "pd-summary-card-subtitle"
                                            }
                                        >
                                            {card.subtitle}
                                        </Typography>
                                    </Box>

                                    <Box
                                        className={`pd-summary-card-icon pd-${card.color}`}
                                    >
                                        {card.icon}
                                    </Box>

                                </Box>

                            </CardContent>

                        </Card>

                    </Grid>
                ))}

            </Grid>


            {/* =========================
                OVERVIEW + STATUS
            ========================= */}

            <Grid
                container
                spacing={2.5}
                className="pd-payroll-main-grid"
            >

                {/* Payroll Overview */}

                <Grid
                    size={{
                        xs: 12,
                        lg: 8,
                    }}
                >

                    <Card className="pd-payroll-panel">

                        <CardContent>

                            <Typography className="pd-panel-title">
                                Payroll Overview
                            </Typography>

                            <Typography className="pd-panel-subtitle">
                                {month} payroll breakdown
                            </Typography>

                            <Box className="pd-payroll-chart">

                                <Box className="pd-payroll-chart-bars">

                                    {payrollOverview.map((item) => (
                                        <Box
                                            className="pd-payroll-chart-column"
                                            key={item.month}
                                        >

                                            <Box
                                                className="pd-payroll-chart-bar"
                                                style={{
                                                    height: `${item.value * 2}px`,
                                                }}
                                            />

                                            <Typography className="pd-payroll-chart-label">
                                                {item.month}
                                            </Typography>

                                        </Box>
                                    ))}

                                </Box>

                            </Box>

                        </CardContent>

                    </Card>

                </Grid>


                {/* Payroll Status */}

                <Grid
                    size={{
                        xs: 12,
                        lg: 4,
                    }}
                >

                    <Card className="pd-payroll-panel pd-payroll-status-panel">

                        <CardContent>

                            <Typography className="pd-panel-title">
                                Payroll Status
                            </Typography>

                            <Typography className="pd-panel-subtitle">
                                Current payroll processing status
                            </Typography>


                            {/* Completed */}

                            <Box className="pd-payroll-status-item pd-completed">

                                <Box className="pd-status-icon pd-completed-icon">
                                    <TaskAltOutlinedIcon />
                                </Box>

                                <Box className="pd-status-content">

                                    <Typography className="pd-status-title">
                                        Payroll Completed
                                        <span>Done</span>
                                    </Typography>

                                    <Typography className="pd-status-date">
                                        20 May 2026
                                    </Typography>

                                </Box>

                            </Box>


                            {/* Upcoming */}

                            <Box className="pd-payroll-status-item pd-upcoming">

                                <Box className="pd-status-icon pd-upcoming-icon">
                                    <PendingOutlinedIcon />
                                </Box>

                                <Box className="pd-status-content">

                                    <Typography className="pd-status-title">
                                        Next Payroll
                                        <span>Upcoming</span>
                                    </Typography>

                                    <Typography className="pd-status-date">
                                        20 June 2026
                                    </Typography>

                                </Box>

                            </Box>


                            {/* Progress */}

                            <Box className="pd-payroll-progress-section">

                                <Box className="pd-payroll-progress-header">

                                    <Typography>
                                        Payroll completion
                                    </Typography>

                                    <Typography>
                                        100%
                                    </Typography>

                                </Box>

                                <LinearProgress
                                    variant="determinate"
                                    value={100}
                                    className="pd-payroll-progress"
                                />

                            </Box>

                        </CardContent>

                    </Card>

                </Grid>

            </Grid>


            {/* =========================
                DEPARTMENT + QUICK ACTIONS
            ========================= */}

            <Grid
                container
                spacing={2.5}
                className="pd-payroll-bottom-grid"
            >

                {/* Department Payroll */}

                <Grid
                    size={{
                        xs: 12,
                        lg: 8,
                    }}
                >

                    <Card className="pd-payroll-panel pd-department-panel">

                        <CardContent>

                            <Typography className="pd-panel-title">
                                Department Payroll
                            </Typography>

                            <Typography className="pd-panel-subtitle">
                                Payroll distribution by department
                            </Typography>


                            <Box className="pd-department-list">

                                {departments.map((department) => (
                                    <Box
                                        className="pd-department-item"
                                        key={department.name}
                                    >

                                        <Box className="pd-department-header">

                                            <Typography>
                                                {department.name}
                                            </Typography>

                                            <Typography>
                                                {department.amount}
                                            </Typography>

                                        </Box>

                                        <LinearProgress
                                            variant="determinate"
                                            value={department.percentage}
                                            className="pd-department-progress"
                                        />

                                    </Box>
                                ))}

                            </Box>

                        </CardContent>

                    </Card>

                </Grid>


                {/* Quick Actions */}

                <Grid
                    size={{
                        xs: 12,
                        lg: 4,
                    }}
                >

                    <Card className="pd-payroll-panel pd-quick-actions-panel">

                        <CardContent>

                            <Typography className="pd-panel-title">
                                Quick Actions
                            </Typography>


                            <Box className="pd-quick-actions">

                                <Button
                                    className="pd-quick-action-button"
                                    onClick={() =>
                                        handleQuickAction("Run Payroll")
                                    }
                                    startIcon={<PlayArrowIcon />}
                                    endIcon={<ArrowForwardIcon />}
                                >
                                    Run Payroll
                                </Button>


                                <Button
                                    className="pd-quick-action-button"
                                    onClick={() =>
                                        handleQuickAction("Generate Payslips")
                                    }
                                    startIcon={<DescriptionOutlinedIcon />}
                                    endIcon={<ArrowForwardIcon />}
                                >
                                    Generate Payslips
                                </Button>


                                <Button
                                    className="pd-quick-action-button"
                                    onClick={() =>
                                        handleQuickAction("Payroll Reports")
                                    }
                                    startIcon={<AssessmentOutlinedIcon />}
                                    endIcon={<ArrowForwardIcon />}
                                >
                                    Payroll Reports
                                </Button>

                            </Box>

                        </CardContent>

                    </Card>

                </Grid>

            </Grid>

        </Box>
    );
}

export default PayrollDashboard; 