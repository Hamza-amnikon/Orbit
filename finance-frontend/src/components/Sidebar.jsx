import React, { useState } from "react";
import {
    Drawer,
    Box,
    Typography,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Collapse,
} from "@mui/material";

import { NavLink } from "react-router-dom";

import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import AccountBalanceRoundedIcon from "@mui/icons-material/AccountBalanceRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import RequestQuoteRoundedIcon from "@mui/icons-material/RequestQuoteRounded";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import AccountTreeRoundedIcon from "@mui/icons-material/AccountTreeRounded";
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import ExpandLessRoundedIcon from "@mui/icons-material/ExpandLessRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";

import "./Sidebar.css";

const Sidebar = () => {
    const [openSales, setOpenSales] = useState(true);
    const [openPurchases, setOpenPurchases] = useState(true);
    const [openBanking, setOpenBanking] = useState(true);
    const [openAccounting, setOpenAccounting] = useState(false);
    const [openReports, setOpenReports] = useState(false);
    const [openSettings, setOpenSettings] = useState(false);

    const menuItem = (icon, title, onClick, open) => (
        <ListItemButton
            className="sidebar-item"
            onClick={onClick}
        >
            <ListItemIcon className="sidebar-icon">
                {icon}
            </ListItemIcon>

            <ListItemText
                primary={title}
                className="sidebar-text"
            />

            {open ? (
                <ExpandLessRoundedIcon className="sidebar-expand-icon" />
            ) : (
                <ExpandMoreRoundedIcon className="sidebar-expand-icon" />
            )}
        </ListItemButton>
    );

    const childItem = (title, path) => (
        <ListItemButton
            component={NavLink}
            to={path}
            className="sidebar-child"
        >
            <ListItemText primary={title} />
        </ListItemButton>
    );

    return (
        <Drawer
            variant="permanent"
            className="finance-sidebar"
        >
            {/* Logo */}
            <Box className="sidebar-logo">
                <AccountBalanceRoundedIcon className="sidebar-logo-icon" />

                <Typography className="sidebar-logo-text">
                    FINANCE
                </Typography>
            </Box>

            <List className="sidebar-list">

                {/* Dashboard */}
                <ListItemButton
                    component={NavLink}
                    to="/"
                    className="sidebar-item"
                >
                    <ListItemIcon className="sidebar-icon">
                        <DashboardRoundedIcon />
                    </ListItemIcon>

                    <ListItemText primary="Dashboard" />
                </ListItemButton>


                {/* SALES */}
                <Typography className="sidebar-section-title">
                    SALES
                </Typography>

                {menuItem(
                    <PeopleAltRoundedIcon />,
                    "Sales",
                    () => setOpenSales(!openSales),
                    openSales
                )}

                <Collapse
                    in={openSales}
                    timeout="auto"
                    unmountOnExit
                >
                    <List disablePadding>
                        {childItem("Customers", "/sales/customers")}
                        {childItem("Estimates", "/sales/estimates")}
                        {childItem("Sales Orders", "/sales/orders")}
                        {childItem("Invoices", "/sales/invoices")}
                        {childItem("Credit Notes", "/sales/credit-notes")}
                        {childItem("Payments Received", "/sales/payments")}
                    </List>
                </Collapse>


                {/* PURCHASES */}
                <Typography className="sidebar-section-title">
                    PURCHASES
                </Typography>

                {menuItem(
                    <ShoppingCartRoundedIcon />,
                    "Purchases",
                    () => setOpenPurchases(!openPurchases),
                    openPurchases
                )}

                <Collapse
                    in={openPurchases}
                    timeout="auto"
                    unmountOnExit
                >
                    <List disablePadding>
                        {childItem("Vendors", "/purchases/vendors")}
                        {childItem("Purchase Orders", "/purchases/orders")}
                        {childItem("Bills", "/purchases/bills")}
                        {childItem("Vendor Credits", "/purchases/vendor-credits")}
                        {childItem("Payments Made", "/purchases/payments")}
                    </List>
                </Collapse>


                {/* EXPENSES */}
                <Typography className="sidebar-section-title">
                    EXPENSES
                </Typography>

                <ListItemButton
                    component={NavLink}
                    to="/expenses"
                    className="sidebar-item"
                >
                    <ListItemIcon className="sidebar-icon">
                        <ReceiptLongRoundedIcon />
                    </ListItemIcon>

                    <ListItemText primary="Expenses" />
                </ListItemButton>

                <ListItemButton
                    component={NavLink}
                    to="/expenses/claims"
                    className="sidebar-item"
                >
                    <ListItemIcon className="sidebar-icon">
                        <RequestQuoteRoundedIcon />
                    </ListItemIcon>

                    <ListItemText primary="Expense Claims" />
                </ListItemButton>


                {/* BANKING */}
                <Typography className="sidebar-section-title">
                    BANKING
                </Typography>

                {menuItem(
                    <AccountBalanceWalletRoundedIcon />,
                    "Banking",
                    () => setOpenBanking(!openBanking),
                    openBanking
                )}

                <Collapse
                    in={openBanking}
                    timeout="auto"
                    unmountOnExit
                >
                    <List disablePadding>
                        {childItem("Bank Accounts", "/banking/accounts")}
                        {childItem("Transactions", "/banking/transactions")}
                        {childItem("Bank Reconciliation", "/banking/reconciliation")}
                    </List>
                </Collapse>


                {/* ACCOUNTING */}
                <Typography className="sidebar-section-title">
                    ACCOUNTING
                </Typography>

                {menuItem(
                    <AccountTreeRoundedIcon />,
                    "Accounting",
                    () => setOpenAccounting(!openAccounting),
                    openAccounting
                )}

                <Collapse
                    in={openAccounting}
                    timeout="auto"
                    unmountOnExit
                >
                    <List disablePadding>
                        {childItem("Chart of Accounts", "/accounting/chart-of-accounts")}
                        {childItem("Journal Entries", "/accounting/journal-entries")}
                        {childItem("General Ledger", "/accounting/general-ledger")}
                        {childItem("Trial Balance", "/accounting/trial-balance")}
                    </List>
                </Collapse>


                {/* REPORTS */}
                <Typography className="sidebar-section-title">
                    REPORTS
                </Typography>

                {menuItem(
                    <AssessmentRoundedIcon />,
                    "Reports",
                    () => setOpenReports(!openReports),
                    openReports
                )}

                <Collapse
                    in={openReports}
                    timeout="auto"
                    unmountOnExit
                >
                    <List disablePadding>
                        {childItem("Financial Reports", "/reports/financial")}
                        {childItem("Tax Reports", "/reports/tax")}
                        {childItem("Sales Reports", "/reports/sales")}
                        {childItem("Expense Reports", "/reports/expenses")}
                    </List>
                </Collapse>


                {/* SETTINGS */}
                <Typography className="sidebar-section-title">
                    SETTINGS
                </Typography>

                {menuItem(
                    <SettingsRoundedIcon />,
                    "Settings",
                    () => setOpenSettings(!openSettings),
                    openSettings
                )}

                <Collapse
                    in={openSettings}
                    timeout="auto"
                    unmountOnExit
                >
                    <List disablePadding>
                        {childItem("Organization", "/settings/organization")}
                        {childItem("Users", "/settings/users")}
                        {childItem("Roles & Permissions", "/settings/roles")}
                        {childItem("Tax Settings", "/settings/tax")}
                    </List>
                </Collapse>

            </List>
        </Drawer>
    );
};

export default Sidebar;