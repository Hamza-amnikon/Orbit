import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";

import { useAuth } from "../../../context/AuthContext";

import "./DashboardLayout.css";

function DashboardLayout() {
    const navigate = useNavigate();

    const {
        sparkAccessGranted,
        sparkAccessLoading,
        profileLoading
    } = useAuth();

    const [onboardingPromptOpen, setOnboardingPromptOpen] = useState(false);

    // ==========================================================
    // SHOW ONBOARDING PROMPT WHEN ACCESS IS NOT GRANTED
    // ==========================================================

    useEffect(() => {
        if (
            !sparkAccessLoading &&
            !profileLoading &&
            !sparkAccessGranted
        ) {
            setOnboardingPromptOpen(true);
        } else if (sparkAccessGranted) {
            setOnboardingPromptOpen(false);
        }
    }, [
        sparkAccessGranted,
        sparkAccessLoading,
        profileLoading
    ]);

    // ==========================================================
    // OPEN DOCUMENTS TAB DIRECTLY
    // ==========================================================

    const handleCompleteDocuments = () => {
        // Close popup
        setOnboardingPromptOpen(false);

        // Open Settings directly on Documents tab
        navigate("/settings?tab=documents");
    };

    // ==========================================================
    // ONBOARDING PROMPT VISIBILITY
    // ==========================================================

    const showOnboardingPrompt =
        onboardingPromptOpen &&
        !sparkAccessLoading &&
        !profileLoading &&
        !sparkAccessGranted;

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

                <main className="dashboard-content">
                    <Outlet />
                </main>

            </div>

            {/* ==================================================
                ONBOARDING PROMPT
            ================================================== */}

            {showOnboardingPrompt && (
                <div className="onboarding-prompt-overlay">

                    <div className="onboarding-prompt">

                        {/* WARNING ICON */}
                        <div className="onboarding-prompt-icon">
                            !
                        </div>

                        {/* TITLE */}
                        <h2>
                            Complete Your Onboarding
                        </h2>

                        {/* DESCRIPTION */}
                        <p>
                            Your required onboarding documents
                            have not been fully approved yet.
                        </p>

                        <p>
                            Please upload and submit all required
                            documents to get full access to Spark.
                        </p>

                        {/* REQUIRED DOCUMENTS */}
                        <p className="onboarding-required-text">
                            Required documents:
                        </p>

                        <ul className="onboarding-document-list">
                            <li>Aadhaar</li>
                            <li>PAN</li>
                            <li>UAN</li>
                            <li>Bank</li>
                            <li>Education Certificate</li>
                        </ul>

                        {/* BUTTON */}
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