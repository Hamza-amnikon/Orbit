import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import {
    Box,
    Typography,
    Card,
    CardContent,
    Button,
    Breadcrumbs,
} from "@mui/material";

import PolicyRoundedIcon from "@mui/icons-material/PolicyRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";

import "./Policy.css";

const Policy = () => {
    const navigate = useNavigate();
    const { hasPermission } = useAuth();

    /*
     * ============================================================
     * PERMISSION-BASED ACCESS
     * ============================================================
     *
     * No Admin / Employee roles are hardcoded.
     *
     * Access is controlled completely through
     * Permission Management.
     */

    const canManagePolicies = hasPermission(
        "/policy-management",
        "view"
    );

    const canViewCompanyPolicies = hasPermission(
        "/company-policies",
        "view"
    );

    /*
     * ============================================================
     * AVAILABLE POLICY MODULES
     * ============================================================
     */

    const policyModules = [];

    /*
     * Policy Dashboard
     *
     * Permission:
     * /policy-management -> view
     */

    if (canManagePolicies) {
        policyModules.push({
            title: "Policy Dashboard",

            description:
                "Create, edit, publish and manage company policies.",

            path: "/policy-management",

            icon: <PolicyRoundedIcon />,

            className: "policy-card-blue",
        });
    }

    /*
     * Company Policies
     *
     * Permission:
     * /company-policies -> view
     */

    if (canViewCompanyPolicies) {
        policyModules.push({
            title: "Company Policies",

            description:
                "View published company policies, guidelines and important information.",

            path: "/company-policies",

            icon: <DescriptionRoundedIcon />,

            className: "policy-card-green",
        });
    }

    /*
     * ============================================================
     * RENDER
     * ============================================================
     */

    return (
        <Box className="policy-page">

            {/* =====================================================
                BREADCRUMB
            ====================================================== */}

            <Box className="policy-breadcrumb-wrapper">

                <Breadcrumbs
                    separator="/"
                    aria-label="policy breadcrumb"
                    className="policy-breadcrumb"
                >
                    <Box className="policy-breadcrumb-home">
                        <HomeRoundedIcon />
                    </Box>

                    <Typography className="policy-breadcrumb-current">
                        Policy
                    </Typography>
                </Breadcrumbs>

            </Box>

            {/* =====================================================
                HEADER
            ====================================================== */}

            <Box className="policy-header">

                <Typography
                    component="h1"
                    className="policy-header-title"
                >
                    Policy Management
                </Typography>

                <Typography
                    component="p"
                    className="policy-header-description"
                >
                    Manage company policies, guidelines,
                    acknowledgements and policy history.
                </Typography>

            </Box>

            {/* =====================================================
                POLICY MODULES
            ====================================================== */}

            {policyModules.length > 0 ? (

                <Box className="policy-module-grid">

                    {policyModules.map((module) => (

                        <Card
                            key={module.title}
                            className={`policy-module-card ${module.className}`}
                            elevation={0}
                        >

                            <CardContent className="policy-module-card-content">

                                {/* =================================================
                                    MODULE ICON
                                ================================================== */}

                                <Box className="policy-module-icon">
                                    {module.icon}
                                </Box>

                                {/* =================================================
                                    MODULE CONTENT
                                ================================================== */}

                                <Box className="policy-module-content">

                                    <Typography
                                        component="h2"
                                        className="policy-module-title"
                                    >
                                        {module.title}
                                    </Typography>

                                    <Typography
                                        component="p"
                                        className="policy-module-description"
                                    >
                                        {module.description}
                                    </Typography>

                                </Box>

                                {/* =================================================
                                    OPEN MODULE
                                ================================================== */}

                                <Button
                                    type="button"
                                    className="policy-open-module"
                                    onClick={() =>
                                        navigate(module.path)
                                    }
                                    disableRipple
                                    endIcon={
                                        <Box className="policy-arrow">
                                            <ArrowForwardRoundedIcon />
                                        </Box>
                                    }
                                >
                                    <span>
                                        Open Module
                                    </span>
                                </Button>

                                {/* =================================================
                                    DECORATION
                                ================================================== */}

                                <Box className="policy-card-decoration" />

                            </CardContent>

                        </Card>

                    ))}

                </Box>

            ) : (

                /* =====================================================
                   NO PERMISSION STATE
                ====================================================== */

                <Card
                    className="policy-empty-card"
                    elevation={0}
                >

                    <CardContent>

                        <Box className="policy-empty-icon">
                            <PolicyRoundedIcon />
                        </Box>

                        <Typography
                            variant="h6"
                            className="policy-empty-title"
                        >
                            No Policy Modules Available
                        </Typography>

                        <Typography
                            className="policy-empty-description"
                        >
                            You currently do not have permission
                            to access any policy modules.
                        </Typography>

                    </CardContent>

                </Card>

            )}

        </Box>
    );
};

export default Policy;