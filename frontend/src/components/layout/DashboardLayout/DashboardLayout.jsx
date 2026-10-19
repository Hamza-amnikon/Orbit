import { MuiButtonMigration } from "../../ui/MuiCompat.jsx";
import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";

import { useAuth } from "../../../context/AuthContext";
import { useColorMode } from "../../../context/ColorModeContext";

import "./DashboardLayout.css";
import "../../../theme/workspace.css";
import { Box as MuiLayoutBox, Typography as MuiText } from "@mui/material";

function DashboardLayout() {

    const navigate = useNavigate();
    const location = useLocation();
    const { mode } = useColorMode();

    const {
        sparkAccessGranted,
        sparkAccessLoading,
        profileLoading,
        onboardingStep,
        pendingPolicyIds = [],
    } = useAuth();


    // ==========================================================
    // ONBOARDING PROMPT STATE
    // ==========================================================

    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [onboardingPromptOpen, setOnboardingPromptOpen] =
        useState(false);
    const [policyPromptDismissed, setPolicyPromptDismissed] =
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

        // Wait until authentication/profile/access
        // information has finished loading.
        if (
            sparkAccessLoading ||
            profileLoading
        ) {

            return;
        }

        // Once access is granted, there is nothing left to prompt.
        if (sparkAccessGranted || onboardingStep === "complete") {
            setOnboardingPromptOpen(false);
            setPolicyPromptDismissed(false);
            return;
        }

        // Show the policy prompt once on entry. Keep it dismissed while the
        // employee reads and acknowledges policies, even as the pending list updates.
        if (onboardingStep === "policies") {
            if (!policyPromptDismissed) {
                setOnboardingPromptOpen(true);
            }
            return;
        }


        // If employee is already on the Documents page,
        // don't cover the upload UI with the popup.
        if (isDocumentsPage) {

            setOnboardingPromptOpen(false);

            return;
        }


        // Employee does not have full access.
        setPolicyPromptDismissed(false);
        setOnboardingPromptOpen(true);

    }, [
        sparkAccessGranted,
        onboardingStep,
        sparkAccessLoading,
        profileLoading,
        isDocumentsPage,
        policyPromptDismissed
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

    const handleReviewPolicies = () => {
        setPolicyPromptDismissed(true);
        setOnboardingPromptOpen(false);
        navigate("/company-policies");
    };


    // ==========================================================
    // ONBOARDING PROMPT VISIBILITY
    // ==========================================================

    const isPolicyAcknowledgementStage = onboardingStep === "policies";

    const showOnboardingPrompt =
        onboardingPromptOpen &&
        !sparkAccessLoading &&
        !profileLoading &&
        !sparkAccessGranted &&
        (isPolicyAcknowledgementStage || (onboardingStep === "documents" && !isDocumentsPage));


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

                <MuiLayoutBox
                    className={`onboarding-prompt-overlay${isPolicyAcknowledgementStage ? ` onboarding-prompt-overlay--policies onboarding-prompt-overlay--${mode}` : ""}`}
                    component="div"
                >


                    <MuiLayoutBox
                        className={`onboarding-prompt${isPolicyAcknowledgementStage ? ` onboarding-prompt--policies onboarding-prompt--${mode}` : ""}`}
                        component="div"
                    >


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

                            {isPolicyAcknowledgementStage ? "Review Company Policies" : "Complete Your Onboarding"}

                        </MuiText>


                        {/* ==================================================
                            DESCRIPTION
                        ================================================== */}

                        <MuiText component="p" variant="body1">

                            {isPolicyAcknowledgementStage
                                ? "Your onboarding documents are approved. Please read and acknowledge every required company policy before continuing to Spark."
                                : "Your required onboarding documents have not been fully approved yet."}

                        </MuiText>


                        {!isPolicyAcknowledgementStage && (
                            <MuiText component="p" variant="body1">
                                Please upload and submit all required documents to get full access to Spark.
                            </MuiText>
                        )}


                        {/* ==================================================
                            REQUIRED DOCUMENTS
                        ================================================== */}

                        <MuiText className="onboarding-required-text" component="p" variant="body1">
                            {isPolicyAcknowledgementStage
                                ? `Policies awaiting your acknowledgement: ${pendingPolicyIds.length}`
                                : "Required documents:"}
                        </MuiText>


                        <MuiLayoutBox className="onboarding-document-list" component="ul">

                            {isPolicyAcknowledgementStage ? (
                                <>
                                    <MuiLayoutBox component="li">Open and read each required policy in full.</MuiLayoutBox>
                                    <MuiLayoutBox component="li">Acknowledge each policy after reviewing it.</MuiLayoutBox>
                                    <MuiLayoutBox component="li">Access unlocks as soon as every required policy is acknowledged.</MuiLayoutBox>
                                </>
                            ) : <>

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

                            </>}

                        </MuiLayoutBox>


                        {/* ==================================================
                            SUBMIT DOCUMENTS BUTTON
                        ================================================== */}

                        <MuiButtonMigration
                            type="button"
                            onClick={isPolicyAcknowledgementStage ? handleReviewPolicies : handleCompleteDocuments}
                            className="onboarding-prompt-button"
                        >

                            {isPolicyAcknowledgementStage ? "Review Policies" : "Submit Documents"}

                        </MuiButtonMigration>


                    </MuiLayoutBox>

                </MuiLayoutBox>

            )}

        </MuiLayoutBox>

    );
}

export default DashboardLayout;
