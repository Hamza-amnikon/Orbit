import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";

import { useAuth } from "../../../context/AuthContext";

import "./DashboardLayout.css";
import "../../../theme/workspace.css";

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

    const [onboardingPromptOpen, setOnboardingPromptOpen] =
        useState(false);


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

        <div className="dashboard-layout">


            {/* ==================================================
                SIDEBAR
            ================================================== */}

            <Sidebar />


            {/* ==================================================
                MAIN AREA
            ================================================== */}

            <div className="dashboard-main">


                {/* ==================================================
                    NAVBAR
                ================================================== */}

                <Navbar />


                {/* ==================================================
                    PAGE CONTENT
                ================================================== */}

                <main className="dashboard-content workspace-ui">

                    <Outlet />

                </main>


            </div>


            {/* ==================================================
                ONBOARDING PROMPT
            ================================================== */}

            {showOnboardingPrompt && (

                <div className="onboarding-prompt-overlay">


                    <div className="onboarding-prompt">


                        {/* ==================================================
                            WARNING ICON
                        ================================================== */}

                        <div className="onboarding-prompt-icon">

                            !

                        </div>


                        {/* ==================================================
                            TITLE
                        ================================================== */}

                        <h2>

                            Complete Your Onboarding

                        </h2>


                        {/* ==================================================
                            DESCRIPTION
                        ================================================== */}

                        <p>

                            Your required onboarding documents
                            have not been fully approved yet.

                        </p>


                        <p>

                            Please upload and submit all required
                            documents to get full access to Spark.

                        </p>


                        {/* ==================================================
                            REQUIRED DOCUMENTS
                        ================================================== */}

                        <p className="onboarding-required-text">

                            Required documents:

                        </p>


                        <ul className="onboarding-document-list">

                            <li>
                                Aadhaar
                            </li>

                            <li>
                                PAN
                            </li>

                            <li>
                                UAN
                            </li>

                            <li>
                                Bank
                            </li>

                            <li>
                                Education Certificate
                            </li>

                        </ul>


                        {/* ==================================================
                            SUBMIT DOCUMENTS BUTTON
                        ================================================== */}

                        <button
                            type="button"
                            onClick={handleCompleteDocuments}
                            className="onboarding-prompt-button"
                        >

                            Submit Documents

                        </button>


                    </div>

                </div>

            )}

        </div>

    );
}

export default DashboardLayout;
