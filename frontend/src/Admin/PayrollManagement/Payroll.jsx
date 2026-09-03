import React from "react";
import {
    Box,
    Card,
    CardContent,
    Grid,
    Typography,
    Button,
} from "@mui/material";

import DashboardCustomizeIcon from "@mui/icons-material/DashboardCustomize";
import GroupIcon from "@mui/icons-material/Group";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import PercentIcon from "@mui/icons-material/Percent";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import HistoryIcon from "@mui/icons-material/History";
import BarChartIcon from "@mui/icons-material/BarChart";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import { useNavigate } from "react-router-dom";

function Payroll() {
    const navigate = useNavigate();

    const payrollModules = [
        {
            title: "Payroll Dashboard",
            description:
                "View payroll overview, summary, statistics and insights.",
            icon: <DashboardCustomizeIcon />,
            color: "#2563eb",
            route: "/payroll/dashboard",
        },
        {
            title: "Employees Payroll",
            description:
                "Manage employee salaries, assign payroll and salary structures.",
            icon: <GroupIcon />,
            color: "#16a34a",
            route: "/payroll/employees",
        },
        {
            title: "Salary Components",
            description:
                "Manage earnings, allowances, bonuses and other salary components.",
            icon: <AccountBalanceWalletIcon />,
            color: "#9333ea",
            route: "/payroll/salary-components",
        },
        {
            title: "Deductions",
            description:
                "Manage tax, PF, ESI, loan and other deduction components.",
            icon: <PercentIcon />,
            color: "#ea580c",
            route: "/payroll/deductions",
        },
        {
            title: "Payslip Templates",
            description:
                "Create and manage payslip templates and layouts.",
            icon: <ReceiptLongIcon />,
            color: "#d946ef",
            route: "/payroll/payslip-templates",
        },
        {
            title: "Payroll Process",
            description:
                "Run payroll, calculate salaries and generate payslips.",
            icon: <CurrencyRupeeIcon />,
            color: "#0891b2",
            route: "/payroll/process",
        },
        {
            title: "Payroll History",
            description:
                "View payroll run history, records and details.",
            icon: <HistoryIcon />,
            color: "#0d9488",
            route: "/payroll/history",
        },
        {
            title: "Payroll Reports",
            description:
                "View and export payroll reports and analytics.",
            icon: <BarChartIcon />,
            color: "#eab308",
            route: "/payroll/reports",
        },
               {
            title: "My Payslip",
            description:
                "View and export payroll reports and analytics.",
            icon: <BarChartIcon />,
            color: "#030303",
            route: "/employee/payroll",
        },
    ];

    const handleOpenModule = (module) => {
        navigate(module.route);
    };

    return (
        <Box
            className="pm-payroll-page"
            sx={{
                minHeight: "100vh",
                backgroundColor: "#f5f7fb",
                p: {
                    xs: 2,
                    sm: 3,
                    md: 5,
                },
                boxSizing: "border-box",
            }}
        >
            {/* ================================
                PAGE HEADER
            ================================= */}

            <Box className="pm-payroll-page-header" sx={{ mb: 4 }}>
                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: 700,
                        color: "#172033",
                        fontSize: {
                            xs: "26px",
                            md: "32px",
                        },
                    }}
                >
                    Payroll Management
                </Typography>

                <Typography
                    sx={{
                        mt: 1,
                        color: "#718096",
                        fontSize: "15px",
                        lineHeight: 1.6,
                    }}
                >
                    Manage payroll processing, salary structures,
                    deductions, and employee payments.
                </Typography>
            </Box>

            {/* ================================
                PAYROLL MODULES
            ================================= */}

            <Grid container spacing={3} className="pm-payroll-module-grid">
                {payrollModules.map((module) => (
                    <Grid
                        key={module.title}
                        size={{
                            xs: 12,
                            sm: 6,
                            md: 4,
                            lg: 3,
                        }}
                    >
                        <Card
                            className="pm-payroll-module-card"
                            elevation={0}
                            sx={{
                                height: "100%",
                                minHeight: 340,
                                borderRadius: "18px",
                                border: "1px solid #e7ebf2",
                                backgroundColor: "#ffffff",
                                boxShadow:
                                    "0 2px 5px rgba(15,23,42,0.025), 0 8px 24px rgba(15,23,42,0.035)",
                                transition:
                                    "transform 0.2s ease, box-shadow 0.2s ease",

                                "&:hover": {
                                    transform: "translateY(-4px)",
                                    boxShadow:
                                        "0 8px 25px rgba(15,23,42,0.08)",
                                },
                            }}
                        >
                            <CardContent
                                sx={{
                                    height: "100%",
                                    boxSizing: "border-box",
                                    p: 3.5,
                                    display: "flex",
                                    flexDirection: "column",

                                    "&:last-child": {
                                        pb: 3.5,
                                    },
                                }}
                            >
                                {/* ICON */}

                                <Box
                                    className="pm-payroll-module-icon"
                                    sx={{
                                        width: 72,
                                        height: 72,
                                        borderRadius: "18px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        backgroundColor: module.color,
                                        color: "#ffffff",
                                        mb: 3,

                                        "& svg": {
                                            fontSize: 34,
                                        },
                                    }}
                                >
                                    {module.icon}
                                </Box>

                                {/* CONTENT */}

                                <Box className="pm-payroll-module-content" sx={{ flex: 1 }}>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            fontWeight: 700,
                                            color: "#172033",
                                            fontSize: "20px",
                                        }}
                                    >
                                        {module.title}
                                    </Typography>

                                    <Typography
                                        sx={{
                                            mt: 1.5,
                                            color: "#718096",
                                            fontSize: "14px",
                                            lineHeight: 1.8,
                                        }}
                                    >
                                        {module.description}
                                    </Typography>
                                </Box>

                                {/* OPEN MODULE */}

                                <Button
                                    className="pm-payroll-open-module"
                                    variant="text"
                                    onClick={() =>
                                        handleOpenModule(module)
                                    }
                                    endIcon={<span className="pm-payroll-arrow"><ArrowForwardIcon /></span>}
                                    sx={{
                                        alignSelf: "flex-start",
                                        mt: 3,
                                        p: 0,
                                        color: "#2563eb",
                                        fontSize: "14px",
                                        fontWeight: 700,
                                        textTransform: "none",

                                        "&:hover": {
                                            backgroundColor:
                                                "transparent",
                                        },
                                    }}
                                >
                                    Open Module
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}

export default Payroll;