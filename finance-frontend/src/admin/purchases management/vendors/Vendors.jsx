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

import VendorForm from "./VendorForm";
import VendorDetails from "./VendorDetails";

import "./Vendors.css";

const Vendors = () => {
    const [showVendorForm, setShowVendorForm] = useState(false);
    const [showVendorDetails, setShowVendorDetails] = useState(false);

    /* =========================================
       VENDOR DETAILS
    ========================================= */
    if (showVendorDetails) {
        return (
            <VendorDetails
                onBack={() => setShowVendorDetails(false)}
            />
        );
    }

    return (
        <Box className="vendors-page">

            {/* =========================================
                PAGE HEADER
            ========================================= */}
            <Box className="vendors-header">

                <Box>
                    <Typography className="vendors-title">
                        Vendors
                    </Typography>

                    <Typography className="vendors-subtitle">
                        Manage your suppliers and vendors
                    </Typography>
                </Box>

                <Button
                    variant="contained"
                    startIcon={<AddRoundedIcon />}
                    className="add-vendor-button"
                    onClick={() => setShowVendorForm(true)}
                >
                    New Vendor
                </Button>

            </Box>

            {/* =========================================
                SUMMARY CARDS
            ========================================= */}
            <Box className="vendor-summary-grid">

                <Card className="vendor-summary-card">
                    <CardContent>
                        <Typography className="vendor-summary-label">
                            Total Vendors
                        </Typography>

                        <Typography className="vendor-summary-value">
                            36
                        </Typography>
                    </CardContent>
                </Card>

                <Card className="vendor-summary-card">
                    <CardContent>
                        <Typography className="vendor-summary-label">
                            Active Vendors
                        </Typography>

                        <Typography className="vendor-summary-value">
                            29
                        </Typography>
                    </CardContent>
                </Card>

                <Card className="vendor-summary-card">
                    <CardContent>
                        <Typography className="vendor-summary-label">
                            Payables
                        </Typography>

                        <Typography className="vendor-summary-value">
                            ₹4,85,600
                        </Typography>
                    </CardContent>
                </Card>

                <Card className="vendor-summary-card">
                    <CardContent>
                        <Typography className="vendor-summary-label">
                            Inactive Vendors
                        </Typography>

                        <Typography className="vendor-summary-value">
                            7
                        </Typography>
                    </CardContent>
                </Card>

            </Box>

            {/* =========================================
                VENDOR LIST
            ========================================= */}
            <Card className="vendor-list-card">

                <CardContent className="vendor-list-content">

                    {/* List Header */}
                    <Box className="vendor-list-header">

                        <Box>
                            <Typography className="vendor-list-title">
                                Vendor List
                            </Typography>

                            <Typography className="vendor-list-subtitle">
                                View and manage your vendors
                            </Typography>
                        </Box>

                        <Box className="vendor-list-actions">

                            {/* Search */}
                            <Box className="vendor-search-box">

                                <SearchRoundedIcon />

                                <input
                                    type="text"
                                    placeholder="Search vendors..."
                                />

                            </Box>

                            {/* Filter */}
                            <Button
                                variant="outlined"
                                startIcon={<FilterListRoundedIcon />}
                                className="vendor-filter-button"
                            >
                                Filter
                            </Button>

                        </Box>

                    </Box>

                    {/* =========================================
                        TABLE HEADER
                    ========================================= */}
                    <Box className="vendor-table-header">

                        <Typography>
                            Vendor
                        </Typography>

                        <Typography>
                            Vendor Code
                        </Typography>

                        <Typography>
                            Contact Person
                        </Typography>

                        <Typography>
                            Phone
                        </Typography>

                        <Typography>
                            Payable
                        </Typography>

                        <Typography>
                            Status
                        </Typography>

                        <Typography>
                            Action
                        </Typography>

                    </Box>

                    {/* =========================================
                        ROW 1
                    ========================================= */}
                    <Box className="vendor-table-row">

                        <Box>
                            <Typography className="vendor-name">
                                ABC Suppliers
                            </Typography>

                            <Typography className="vendor-email">
                                accounts@abcsuppliers.com
                            </Typography>
                        </Box>

                        <Typography className="vendor-code">
                            VEN-001
                        </Typography>

                        <Typography>
                            Rahul Sharma
                        </Typography>

                        <Typography>
                            9876543210
                        </Typography>

                        <Typography className="vendor-amount">
                            ₹1,25,000
                        </Typography>

                        <Box className="vendor-status active">
                            Active
                        </Box>

                        <Button
                            className="vendor-view-button"
                            onClick={() => setShowVendorDetails(true)}
                        >
                            View
                        </Button>

                    </Box>

                    {/* =========================================
                        ROW 2
                    ========================================= */}
                    <Box className="vendor-table-row">

                        <Box>
                            <Typography className="vendor-name">
                                Global Office Solutions
                            </Typography>

                            <Typography className="vendor-email">
                                sales@globaloffice.com
                            </Typography>
                        </Box>

                        <Typography className="vendor-code">
                            VEN-002
                        </Typography>

                        <Typography>
                            Priya Mehta
                        </Typography>

                        <Typography>
                            9988776655
                        </Typography>

                        <Typography className="vendor-amount">
                            ₹86,500
                        </Typography>

                        <Box className="vendor-status active">
                            Active
                        </Box>

                        <Button
                            className="vendor-view-button"
                            onClick={() => setShowVendorDetails(true)}
                        >
                            View
                        </Button>

                    </Box>

                    {/* =========================================
                        ROW 3
                    ========================================= */}
                    <Box className="vendor-table-row">

                        <Box>
                            <Typography className="vendor-name">
                                TechWorld Solutions
                            </Typography>

                            <Typography className="vendor-email">
                                finance@techworld.com
                            </Typography>
                        </Box>

                        <Typography className="vendor-code">
                            VEN-003
                        </Typography>

                        <Typography>
                            Amit Patel
                        </Typography>

                        <Typography>
                            9123456780
                        </Typography>

                        <Typography className="vendor-amount">
                            ₹72,250
                        </Typography>

                        <Box className="vendor-status active">
                            Active
                        </Box>

                        <Button
                            className="vendor-view-button"
                            onClick={() => setShowVendorDetails(true)}
                        >
                            View
                        </Button>

                    </Box>

                    {/* =========================================
                        ROW 4
                    ========================================= */}
                    <Box className="vendor-table-row">

                        <Box>
                            <Typography className="vendor-name">
                                Bright Office Supplies
                            </Typography>

                            <Typography className="vendor-email">
                                billing@brightoffice.com
                            </Typography>
                        </Box>

                        <Typography className="vendor-code">
                            VEN-004
                        </Typography>

                        <Typography>
                            Neha Shah
                        </Typography>

                        <Typography>
                            9012345678
                        </Typography>

                        <Typography className="vendor-amount">
                            ₹48,000
                        </Typography>

                        <Box className="vendor-status inactive">
                            Inactive
                        </Box>

                        <Button
                            className="vendor-view-button"
                            onClick={() => setShowVendorDetails(true)}
                        >
                            View
                        </Button>

                    </Box>

                </CardContent>

            </Card>

            {/* =========================================
                NEW VENDOR FORM MODAL
            ========================================= */}
            {showVendorForm && (
                <Box className="vendor-modal-overlay">

                    <Box className="vendor-modal">

                        <VendorForm
                            onClose={() => setShowVendorForm(false)}
                        />

                    </Box>

                </Box>
            )}

        </Box>
    );
};

export default Vendors;