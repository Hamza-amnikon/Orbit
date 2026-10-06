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

import VendorCreditForm from "./VendorCreditForm";
import VendorCreditDetails from "./VendorCreditDetails";

import "./VendorCredits.css";

const VendorCredits = () => {
    const [showVendorCreditForm, setShowVendorCreditForm] = useState(false);
    const [showVendorCreditDetails, setShowVendorCreditDetails] = useState(false);

    const vendorCredits = [
        {
            creditNumber: "VC-001",
            vendor: "ABC Suppliers",
            creditDate: "06 Oct 2026",
            billNumber: "BILL-001",
            amount: "₹50,000",
            status: "Issued",
        },
        {
            creditNumber: "VC-002",
            vendor: "Global Office Solutions",
            creditDate: "04 Oct 2026",
            billNumber: "BILL-002",
            amount: "₹25,000",
            status: "Applied",
        },
        {
            creditNumber: "VC-003",
            vendor: "TechWorld Solutions",
            creditDate: "02 Oct 2026",
            billNumber: "BILL-003",
            amount: "₹18,500",
            status: "Draft",
        },
        {
            creditNumber: "VC-004",
            vendor: "Bright Office Supplies",
            creditDate: "29 Sep 2026",
            billNumber: "BILL-004",
            amount: "₹12,000",
            status: "Refunded",
        },
    ];

    if (showVendorCreditDetails) {
        return (
            <VendorCreditDetails
                onBack={() => setShowVendorCreditDetails(false)}
            />
        );
    }

    if (showVendorCreditForm) {
        return (
            <VendorCreditForm
                onCancel={() => setShowVendorCreditForm(false)}
            />
        );
    }

    return (
        <Box className="vendor-credits-page">

            {/* Header */}
            <Box className="vendor-credits-header">
                <Box>
                    <Typography className="vendor-credits-title">
                        Vendor Credits
                    </Typography>

                    <Typography className="vendor-credits-subtitle">
                        Manage vendor credits and adjustments
                    </Typography>
                </Box>

                <Button
                    variant="contained"
                    startIcon={<AddRoundedIcon />}
                    className="vendor-credit-add-button"
                    onClick={() => setShowVendorCreditForm(true)}
                >
                    New Vendor Credit
                </Button>
            </Box>

            {/* Summary Cards */}
            <Box className="vendor-credit-summary-grid">

                <Card className="vendor-credit-summary-card">
                    <CardContent>
                        <Typography className="vendor-credit-card-label">
                            Total Vendor Credits
                        </Typography>

                        <Typography className="vendor-credit-card-value">
                            24
                        </Typography>
                    </CardContent>
                </Card>

                <Card className="vendor-credit-summary-card">
                    <CardContent>
                        <Typography className="vendor-credit-card-label">
                            Draft
                        </Typography>

                        <Typography className="vendor-credit-card-value">
                            5
                        </Typography>
                    </CardContent>
                </Card>

                <Card className="vendor-credit-summary-card">
                    <CardContent>
                        <Typography className="vendor-credit-card-label">
                            Issued
                        </Typography>

                        <Typography className="vendor-credit-card-value">
                            8
                        </Typography>
                    </CardContent>
                </Card>

                <Card className="vendor-credit-summary-card">
                    <CardContent>
                        <Typography className="vendor-credit-card-label">
                            Total Credit
                        </Typography>

                        <Typography className="vendor-credit-card-value">
                            ₹1,85,500
                        </Typography>
                    </CardContent>
                </Card>

            </Box>

            {/* List */}
            <Card className="vendor-credits-list-card">

                <Box className="vendor-credits-list-header">

                    <Box>
                        <Typography className="vendor-credits-list-title">
                            Vendor Credits
                        </Typography>

                        <Typography className="vendor-credits-list-subtitle">
                            View and manage vendor credit transactions
                        </Typography>
                    </Box>

                    <Box className="vendor-credits-actions">

                        <Box className="vendor-credit-search">
                            <SearchRoundedIcon />

                            <input
                                type="text"
                                placeholder="Search vendor credits..."
                            />
                        </Box>

                        <Button
                            variant="outlined"
                            startIcon={<FilterListRoundedIcon />}
                            className="vendor-credit-filter-button"
                        >
                            Filter
                        </Button>

                    </Box>

                </Box>

                <Box className="vendor-credits-table-wrapper">

                    <table className="vendor-credits-table">

                        <thead>
                            <tr>
                                <th>Credit Number</th>
                                <th>Vendor</th>
                                <th>Credit Date</th>
                                <th>Bill Number</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>

                            {vendorCredits.map((credit) => (
                                <tr key={credit.creditNumber}>

                                    <td>{credit.creditNumber}</td>

                                    <td>{credit.vendor}</td>

                                    <td>{credit.creditDate}</td>

                                    <td>{credit.billNumber}</td>

                                    <td>{credit.amount}</td>

                                    <td>
                                        <span
                                            className={`vendor-credit-status vendor-credit-status-${credit.status.toLowerCase()}`}
                                        >
                                            {credit.status}
                                        </span>
                                    </td>

                                    <td>
                                        <Button
                                            className="vendor-credit-view-button"
                                            onClick={() =>
                                                setShowVendorCreditDetails(true)
                                            }
                                        >
                                            View
                                        </Button>
                                    </td>

                                </tr>
                            ))}

                        </tbody>

                    </table>

                </Box>

            </Card>

        </Box>
    );
};

export default VendorCredits;