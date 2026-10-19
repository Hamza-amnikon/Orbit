import { MuiButtonMigration } from "../../ui/MuiCompat.jsx";
import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";

import { useAuth } from "../../../context/AuthContext";

import "./DashboardLayout.css";
import "../../../theme/workspace.css";
import { Box as MuiLayoutBox, Typography as MuiText } from "@mui/material";

function DashboardLayout() {

    const navigate = useNavigate();
    const location = useLocation();

    const {
        sparkAccessGranted,
        sparkAccessLoading,
        profileLoading
    } = useAuth();


    // ==========================================================
    // ONBOARDING PROMPT STATE
    // ==========================================================

    const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
    const [onboardingPromptOpen, setOnboardingPromptOpen] =
        useState(false);

    useEffect(() => {
        const toggleSidebar = () => {
            setSidebarCollapsed((collapsed) => !collapsed);
        };

        window.addEventListener("oya:toggle-sidebar", toggleSidebar);
        return () => window.removeEventListener("oya:toggle-sidebar", toggleSidebar);
    }, []);


    // ==========================================================
    // CHECK IF USER IS CURRENTLY ON DOCUMENTS PAGE
    // ==========================================================

    const isDocumentsPage =
        location.pathname === "/settings" &&
        new URLSearchParams(location.search).get("tab") === "documents";


    // ==========================================================
    // SHOW ONBOARDING PROMPT
    // ==========================================================

    useEffect(() => {

        // If access has already been granted,
        // close the prompt.
        if (sparkAccessGranted) {

            setOnboardingPromptOpen(false);

            return;
        }


        // Wait until authentication/profile/access
        // information has finished loading.
        if (
            sparkAccessLoading ||
            profileLoading
        ) {

            return;
        }


        // If employee is already on the Documents page,
        // don't cover the upload UI with the popup.
        if (isDocumentsPage) {

            setOnboardingPromptOpen(false);

            return;
        }


        // Employee does not have full access.
        setOnboardingPromptOpen(true);

    }, [
        sparkAccessGranted,
        sparkAccessLoading,
        profileLoading,
        isDocumentsPage
    ]);


    // ==========================================================
    // OPEN DOCUMENTS DIRECTLY
    // ==========================================================

    const handleCompleteDocuments = () => {

        // Close popup first.
        setOnboardingPromptOpen(false);


        // Go directly to the Documents tab.
        navigate("/settings?tab=documents");

    };


    // ==========================================================
    // ONBOARDING PROMPT VISIBILITY
    // ==========================================================

    const showOnboardingPrompt =
        onboardingPromptOpen &&
        !sparkAccessLoading &&
        !profileLoading &&
        !sparkAccessGranted &&
        !isDocumentsPage;


    // ==========================================================
    // RENDER
    // ==========================================================

    return (

        <MuiLayoutBox
            className={`dashboard-layout${sidebarCollapsed ? " sidebar-collapsed" : ""}`}
            component="div"
        >


            {/* ==================================================
                SIDEBAR
            ================================================== */}

            <Sidebar />


            {/* ==================================================
                MAIN AREA
            ================================================== */}

            <MuiLayoutBox className="dashboard-main" component="div">


                {/* ==================================================
                    NAVBAR
                ================================================== */}

                <Navbar />


                {/* ==================================================
                    PAGE CONTENT
                ================================================== */}

                <MuiLayoutBox className="dashboard-content workspace-ui" component="main">

                    <Outlet />

                </MuiLayoutBox>


            </MuiLayoutBox>


            {/* ==================================================
                ONBOARDING PROMPT
            ================================================== */}

            {showOnboardingPrompt && (

                <MuiLayoutBox className="onboarding-prompt-overlay" component="div">


                    <MuiLayoutBox className="onboarding-prompt" component="div">


                        {/* ==================================================
                            WARNING ICON
                        ================================================== */}

                        <MuiLayoutBox className="onboarding-prompt-icon" component="div">

                            !

                        </MuiLayoutBox>


                        {/* ==================================================
                            TITLE
                        ================================================== */}

                        <MuiText component="h2" variant="h5">

                            Complete Your Onboarding

                        </MuiText>


                        {/* ==================================================
                            DESCRIPTION
                        ================================================== */}

                        <MuiText component="p" variant="body1">

                            Your required onboarding documents
                            have not been fully approved yet.

                        </MuiText>


                        <MuiText component="p" variant="body1">

                            Please upload and submit all required
                            documents to get full access to Spark.

                        </MuiText>


                        {/* ==================================================
                            REQUIRED DOCUMENTS
                        ================================================== */}

                        <MuiText className="onboarding-required-text" component="p" variant="body1">

                            Required documents:

                        </MuiText>


                        <MuiLayoutBox className="onboarding-document-list" component="ul">

                            <MuiLayoutBox component="li">
                                Aadhaar
                            </MuiLayoutBox>

                            <MuiLayoutBox component="li">
                                PAN
                            </MuiLayoutBox>

                            <MuiLayoutBox component="li">
                                Bank
                            </MuiLayoutBox>

                            <MuiLayoutBox component="li">
                                Education Certificate
                            </MuiLayoutBox>

                        </MuiLayoutBox>


                        {/* ==================================================
                            SUBMIT DOCUMENTS BUTTON
                        ================================================== */}

                        <MuiButtonMigration
                            type="button"
                            onClick={handleCompleteDocuments}
                            className="onboarding-prompt-button"
                        >

                            Submit Documents

                        </MuiButtonMigration>


                    </MuiLayoutBox>

                </MuiLayoutBox>

            )}

        </MuiLayoutBox>

    );
}

export default DashboardLayout;
