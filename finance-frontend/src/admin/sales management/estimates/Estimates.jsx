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

import EstimateDetails from "./EstimateDetails";
import EstimateForm from "./EstimateForm";

import "./Estimates.css";

const Estimates = () => {
    const [showEstimateForm, setShowEstimateForm] = useState(false);
    const [selectedEstimate, setSelectedEstimate] = useState(null);

    /*
     * If an estimate is selected,
     * show Estimate Details page.
     */
    if (selectedEstimate) {
        return (
            <EstimateDetails
                onBack={() => setSelectedEstimate(null)}
            />
        );
    }

    return (
        <Box className="estimates-page">

            {/* Header */}
            <Box className="estimates-header">

                <Box>
                    <Typography className="estimates-title">
                        Estimates
                    </Typography>

                    <Typography className="estimates-subtitle">
                        Create and manage customer estimates
                    </Typography>
                </Box>

                <Button
                    variant="contained"
                    startIcon={<AddRoundedIcon />}
                    className="new-estimate-button"
                    onClick={() => setShowEstimateForm(true)}
                >
                    New Estimate
                </Button>

            </Box>


            {/* Summary Cards */}
            <Box className="estimate-summary">

                <Card className="estimate-summary-card">
                    <CardContent>

                        <Typography className="estimate-summary-label">
                            Total Estimates
                        </Typography>

                        <Typography className="estimate-summary-value">
                            48
                        </Typography>

                    </CardContent>
                </Card>


                <Card className="estimate-summary-card">
                    <CardContent>

                        <Typography className="estimate-summary-label">
                            Draft
                        </Typography>

                        <Typography className="estimate-summary-value">
                            12
                        </Typography>

                    </CardContent>
                </Card>


                <Card className="estimate-summary-card">
                    <CardContent>

                        <Typography className="estimate-summary-label">
                            Sent
                        </Typography>

                        <Typography className="estimate-summary-value">
                            18
                        </Typography>

                    </CardContent>
                </Card>


                <Card className="estimate-summary-card">
                    <CardContent>

                        <Typography className="estimate-summary-label">
                            Accepted
                        </Typography>

                        <Typography className="estimate-summary-value">
                            18
                        </Typography>

                    </CardContent>
                </Card>

            </Box>


            {/* Estimate List */}
            <Card className="estimates-table-card">

                <CardContent>

                    {/* Table Header */}
                    <Box className="estimates-table-header">

                        <Typography className="estimates-table-title">
                            Estimate List
                        </Typography>


                        <Box className="estimate-actions">

                            <Box className="estimate-search">

                                <SearchRoundedIcon />

                                <input
                                    type="text"
                                    placeholder="Search estimates..."
                                />

                            </Box>


                            <Button
                                variant="outlined"
                                startIcon={<FilterListRoundedIcon />}
                                className="estimate-filter-button"
                            >
                                Filter
                            </Button>

                        </Box>

                    </Box>


                    {/* Table Header Row */}
                    <Box className="estimate-row estimate-header-row">

                        <Typography>
                            Estimate
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


                    {/* Estimate 1 */}
                    <Box className="estimate-row">

                        <Box>

                            <Typography className="estimate-number">
                                EST-001
                            </Typography>

                            <Typography className="estimate-secondary">
                                Website Development
                            </Typography>

                        </Box>

                        <Typography>
                            ABC Technologies
                        </Typography>

                        <Typography>
                            05 Oct 2026
                        </Typography>

                        <Typography className="estimate-amount">
                            ₹75,000
                        </Typography>

                        <Typography className="estimate-status status-sent">
                            Sent
                        </Typography>

                        <Button
                            className="estimate-view-button"
                            onClick={() => setSelectedEstimate("EST-001")}
                        >
                            View
                        </Button>

                    </Box>


                    {/* Estimate 2 */}
                    <Box className="estimate-row">

                        <Box>

                            <Typography className="estimate-number">
                                EST-002
                            </Typography>

                            <Typography className="estimate-secondary">
                                Software Development
                            </Typography>

                        </Box>

                        <Typography>
                            Global Solutions
                        </Typography>

                        <Typography>
                            03 Oct 2026
                        </Typography>

                        <Typography className="estimate-amount">
                            ₹1,20,000
                        </Typography>

                        <Typography className="estimate-status status-accepted">
                            Accepted
                        </Typography>

                        <Button
                            className="estimate-view-button"
                            onClick={() => setSelectedEstimate("EST-002")}
                        >
                            View
                        </Button>

                    </Box>


                    {/* Estimate 3 */}
                    <Box className="estimate-row">

                        <Box>

                            <Typography className="estimate-number">
                                EST-003
                            </Typography>

                            <Typography className="estimate-secondary">
                                IT Support Services
                            </Typography>

                        </Box>

                        <Typography>
                            TechNova Pvt Ltd
                        </Typography>

                        <Typography>
                            01 Oct 2026
                        </Typography>

                        <Typography className="estimate-amount">
                            ₹48,500
                        </Typography>

                        <Typography className="estimate-status status-draft">
                            Draft
                        </Typography>

                        <Button
                            className="estimate-view-button"
                            onClick={() => setSelectedEstimate("EST-003")}
                        >
                            View
                        </Button>

                    </Box>


                    {/* Estimate 4 */}
                    <Box className="estimate-row">

                        <Box>

                            <Typography className="estimate-number">
                                EST-004
                            </Typography>

                            <Typography className="estimate-secondary">
                                Cloud Services
                            </Typography>

                        </Box>

                        <Typography>
                            Bright Enterprises
                        </Typography>

                        <Typography>
                            28 Sep 2026
                        </Typography>

                        <Typography className="estimate-amount">
                            ₹92,000
                        </Typography>

                        <Typography className="estimate-status status-rejected">
                            Rejected
                        </Typography>

                        <Button
                            className="estimate-view-button"
                            onClick={() => setSelectedEstimate("EST-004")}
                        >
                            View
                        </Button>

                    </Box>

                </CardContent>

            </Card>


            {/* New Estimate Modal */}
            {showEstimateForm && (
                <Box className="estimate-modal-overlay">

                    <Box className="estimate-modal">

                        <EstimateForm
                            onClose={() => setShowEstimateForm(false)}
                        />

                    </Box>

                </Box>
            )}

        </Box>
    );
};

export default Estimates;