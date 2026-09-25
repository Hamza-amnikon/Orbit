import React from "react";
import {
    Box,
    Card,
    CardContent,
    Typography,
} from "@mui/material";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

import "./ReimbursementDashboard.css";


const ReimbursementDashboard = () => {

    const navigate = useNavigate();

    const { hasPermission } = useAuth();


    // =========================================================
    // PERMISSIONS
    // =========================================================

    const canViewRequests = hasPermission(
        "/reimbursements/requests",
        "view"
    );

    const canViewMyReimbursements = hasPermission(
        "/reimbursements/my",
        "view"
    );


    // =========================================================
    // NAVIGATION
    // =========================================================

    const openRequests = () => {

        if (!canViewRequests) {
            return;
        }

        navigate("/reimbursements/requests");
    };


    const openMyReimbursements = () => {

        if (!canViewMyReimbursements) {
            return;
        }

        navigate("/reimbursements/my");
    };


    // =========================================================
    // ACCESS DENIED
    // =========================================================

    if (!canViewRequests && !canViewMyReimbursements) {

        return (
            <Box
                sx={{
                    padding: "60px",
                    textAlign: "center",
                }}
            >

                <Typography
                    variant="h5"
                    fontWeight={600}
                >
                    Access Denied
                </Typography>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                >
                    You do not have permission to access
                    Reimbursement Management.
                </Typography>

            </Box>
        );
    }


    // =========================================================
    // PAGE
    // =========================================================

    return (
        <Box className="reimbursement-dashboard">

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <Box className="reimbursement-header">

                <Typography
                    variant="h4"
                    className="reimbursement-title"
                >
                    Reimbursement Management
                </Typography>

                <Typography
                    variant="body1"
                    className="reimbursement-subtitle"
                >
                    Manage employee expenses, claims, approvals and
                    reimbursements from one place.
                </Typography>

            </Box>


            {/* =================================================
                MODULE CARDS
            ================================================= */}

            <Box className="reimbursement-module-grid">


                {/* =================================================
                    REIMBURSEMENT REQUESTS
                ================================================= */}

                {canViewRequests && (

                    <Card
                        elevation={0}
                        className="
                            reimbursement-module-card
                            reimbursement-requests-card
                        "
                        onClick={openRequests}
                    >

                        <CardContent className="reimbursement-card-content">

                            {/* ICON */}

                            <Box
                                className="
                                    reimbursement-module-icon
                                    reimbursement-requests-icon
                                "
                            >
                                <ReceiptLongRoundedIcon />
                            </Box>


                            {/* TITLE */}

                            <Typography
                                variant="h6"
                                className="reimbursement-card-title"
                            >
                                Reimbursement Requests
                            </Typography>


                            {/* DESCRIPTION */}

                            <Typography
                                variant="body2"
                                className="reimbursement-card-description"
                            >
                                Review and manage employee reimbursement
                                requests, receipts, approvals and rejections.
                            </Typography>


                            {/* OPEN MODULE */}

                            <Box className="reimbursement-open-module">

                                <Typography
                                    variant="body2"
                                >
                                    Open Module
                                </Typography>

                                <ArrowForwardRoundedIcon />

                            </Box>

                        </CardContent>

                    </Card>

                )}


                {/* =================================================
                    MY REIMBURSEMENTS
                ================================================= */}

                {canViewMyReimbursements && (

                    <Card
                        elevation={0}
                        className="
                            reimbursement-module-card
                            reimbursement-my-card
                        "
                        onClick={openMyReimbursements}
                    >

                        <CardContent className="reimbursement-card-content">

                            {/* ICON */}

                            <Box
                                className="
                                    reimbursement-module-icon
                                    reimbursement-my-icon
                                "
                            >
                                <AccountBalanceWalletRoundedIcon />
                            </Box>


                            {/* TITLE */}

                            <Typography
                                variant="h6"
                                className="reimbursement-card-title"
                            >
                                My Reimbursements
                            </Typography>


                            {/* DESCRIPTION */}

                            <Typography
                                variant="body2"
                                className="reimbursement-card-description"
                            >
                                View your reimbursement requests, claim
                                history, receipts and approval status.
                            </Typography>


                            {/* OPEN MODULE */}

                            <Box className="reimbursement-open-module">

                                <Typography
                                    variant="body2"
                                >
                                    Open Module
                                </Typography>

                                <ArrowForwardRoundedIcon />

                            </Box>

                        </CardContent>

                    </Card>

                )}

            </Box>

        </Box>
    );
};


export default ReimbursementDashboard;