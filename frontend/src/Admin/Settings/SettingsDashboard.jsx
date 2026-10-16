import "./SettingsDashboard.css";

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

import ProfileHeader from "./Profile/ProfileHeader/ProfileHeader";
import ProfileStats from "./Profile/ProfileStats";
import ProfileTabs from "./Profile/ProfileTabs";
import ProfileInfo from "./Profile/ProfileInfo";
import EmploymentInfo from "./Profile/EmploymentInfo";
import ContactInfo from "./Profile/ContactInfo";
import EmergencyContact from "./Profile/EmergencyContact";
import Documents from "./Profile/Docs";

import { getProfile } from "../Services/ProfileService";
import { Box as MuiLayoutBox, Typography as MuiText } from "@mui/material";
import "./SettingsDashboard.refinement.css";

const EMPLOYEE_API_URL = `${import.meta.env.VITE_EMPLOYEE_API_BASE_URL}/api/Employee`;


export default function SettingsDashboard() {

    // =========================================================
    // URL QUERY PARAMETERS
    // =========================================================

    const [searchParams] = useSearchParams();


    // =========================================================
    // PROFILE STATE
    // =========================================================

    const [profile, setProfile] = useState(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    // =========================================================
    // ACTIVE TAB
    // =========================================================

    const [activeTab, setActiveTab] = useState(
        searchParams.get("tab") || "personal"
    );


    // =========================================================
    // UPDATE ACTIVE TAB WHEN URL CHANGES
    // =========================================================

    useEffect(() => {

        const tab = searchParams.get("tab");

        const validTabs = [
            "personal",
            "employment",
            "contact",
            "documents",
            "skills",
            "timeline"
        ];

        if (validTabs.includes(tab)) {

            setActiveTab(tab);

        } else {

            setActiveTab("personal");

        }

    }, [searchParams]);


    // =========================================================
    // AUTO SCROLL TO DOCUMENTS
    //
    // When:
    // /settings?tab=documents
    //
    // the Documents component is rendered and the page
    // automatically scrolls down to the Documents section.
    // =========================================================

    useEffect(() => {

        if (activeTab !== "documents") {
            return;
        }

        let scrollAttempts = 0;
        const maxAttempts = 10;

        const scrollToDocuments = () => {

            const documentsSection =
                document.getElementById(
                    "employee-documents-section"
                );

            if (documentsSection) {

                documentsSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

                return true;
            }

            return false;
        };


        // Try immediately
        if (scrollToDocuments()) {
            return;
        }


        // Documents may need a moment to render.
        // Retry a few times instead of requiring refresh.
        const interval = setInterval(() => {

            scrollAttempts++;

            const found = scrollToDocuments();

            if (
                found ||
                scrollAttempts >= maxAttempts
            ) {

                clearInterval(interval);

            }

        }, 150);


        return () => {

            clearInterval(interval);

        };

    }, [activeTab]);


    // =========================================================
    // LOAD PROFILE
    // =========================================================

    useEffect(() => {

        let mounted = true;

        const loadProfile = async () => {

            try {

                const data = await getProfile();

                const employeeId =
                    data?.employeeId ??
                    data?.EmployeeId ??
                    data?.employeeID ??
                    data?.EmployeeID;

                let employeeRecord = null;
                if (employeeId !== undefined && employeeId !== null && employeeId !== "") {
                    try {
                        const token = localStorage.getItem("token");
                        const employeeResponse = await axios.get(
                            `${EMPLOYEE_API_URL}/${encodeURIComponent(employeeId)}`,
                            {
                                headers: token ? { Authorization: `Bearer ${token}` } : {},
                            }
                        );
                        employeeRecord = employeeResponse.data;
                    } catch (employeeError) {
                        console.warn("Unable to load employee details for Profile:", employeeError);
                    }
                }

                const joiningDate =
                    employeeRecord?.joiningDate ??
                    employeeRecord?.JoiningDate ??
                    employeeRecord?.dateOfJoining ??
                    employeeRecord?.DateOfJoining ??
                    data?.joiningDate ??
                    data?.JoiningDate ??
                    data?.dateOfJoining ??
                    data?.DateOfJoining;

                if (mounted) {

                    setProfile({
                        ...(employeeRecord || {}),
                        ...data,
                        joinDate: joiningDate,
                        joiningDate,
                    });

                }

            }
            catch (err) {

                console.error(
                    "Settings Profile Error:",
                    err
                );

                if (mounted) {

                    setError(
                        "Failed to load profile."
                    );

                }

            }
            finally {

                if (mounted) {

                    setLoading(false);

                }

            }

        };

        loadProfile();

        return () => {

            mounted = false;

        };

    }, []);


    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {

        return (

            <MuiLayoutBox className="settings-dashboard" component="div">

                <MuiLayoutBox className="settings-header" component="div">

                    <MuiText component="h1" variant="h4">
                        Profile
                    </MuiText>

                    <MuiText component="p" variant="body1">
                        Manage your personal and system settings.
                    </MuiText>

                </MuiLayoutBox>

                <MuiLayoutBox className="settings-loading" component="div">

                    <MuiLayoutBox className="settings-loading-spinner"  component="div"/>

                    <MuiText component="span" variant="inherit">
                        Loading profile...
                    </MuiText>

                </MuiLayoutBox>

            </MuiLayoutBox>

        );

    }


    // =========================================================
    // ERROR
    // =========================================================

    if (error) {

        return (

            <MuiLayoutBox className="settings-dashboard" component="div">

                <MuiLayoutBox className="settings-header" component="div">

                    <MuiText component="h1" variant="h4">
                        Profile
                    </MuiText>

                    <MuiText component="p" variant="body1">
                        Manage your personal and system settings.
                    </MuiText>

                </MuiLayoutBox>

                <MuiLayoutBox className="settings-error" component="div">

                    {error}

                </MuiLayoutBox>

            </MuiLayoutBox>

        );

    }


    // =========================================================
    // RENDER
    // =========================================================

    return (

        <MuiLayoutBox className="settings-dashboard" component="div">

            {/* =================================================
                SETTINGS HEADER
            ================================================= */}

            <MuiLayoutBox className="settings-header" component="div">

                <MuiText component="h1" variant="h4">
                Profile
                </MuiText>

                <MuiText component="p" variant="body1">
                    Manage your profile and personal information.
                </MuiText>

            </MuiLayoutBox>


            {/* =================================================
                PROFILE HEADER
            ================================================= */}

            <MuiLayoutBox className="settings-profile-section" component="div">

                <ProfileHeader
                    profile={profile}
                />

            </MuiLayoutBox>


            {/* =================================================
                PROFILE STATISTICS
            ================================================= */}

            <ProfileStats
                profile={profile}
            />


            {/* =================================================
                PROFILE TABS
            ================================================= */}

            <MuiLayoutBox className="profile-content-layout" component="div">
                <ProfileTabs
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                />
                <MuiLayoutBox className="profile-content-panel" component="div">

                    {/* =================================================
                        PERSONAL
                    ================================================= */}

            {activeTab === "personal" && (

                <MuiLayoutBox className="profile-grid" component="div">

                    <ProfileInfo
                        profile={profile}
                    />

                </MuiLayoutBox>

            )}


            {/* =================================================
                EMPLOYMENT
            ================================================= */}

            {activeTab === "employment" && (

                <MuiLayoutBox className="profile-grid" component="div">

                    <EmploymentInfo
                        profile={profile}
                    />

                </MuiLayoutBox>

            )}


            {/* =================================================
                CONTACT
            ================================================= */}

            {activeTab === "contact" && (

                <>

                    <ContactInfo
                        profile={profile}
                    />

                    <MuiLayoutBox className="profile-grid" component="div">

                        <EmergencyContact
                            profile={profile}
                        />

                    </MuiLayoutBox>

                </>

            )}


            {/* =================================================
                DOCUMENTS
            ================================================= */}

            {activeTab === "documents" && (

                <MuiLayoutBox
                    id="employee-documents-section"
                    style={{
                        scrollMarginTop: "20px"
                    }}
                 component="div">

                    <Documents
                        profile={profile}
                    />

                </MuiLayoutBox>

            )}


            {/* =================================================
                SKILLS
            ================================================= */}

            {activeTab === "skills" && (

                <MuiLayoutBox className="coming-soon-card" component="div">

                    <MuiText component="h2" variant="h5">
                        Skills
                    </MuiText>

                    <MuiText component="p" variant="body1">
                        Skills and certifications will appear here.
                    </MuiText>

                </MuiLayoutBox>

            )}


            {/* =================================================
                TIMELINE
            ================================================= */}

            {activeTab === "timeline" && (

                <MuiLayoutBox className="coming-soon-card" component="div">

                    <MuiText component="h2" variant="h5">
                        Timeline
                    </MuiText>

                    <MuiText component="p" variant="body1">
                        Employee history and activities will appear here.
                    </MuiText>

                </MuiLayoutBox>

            )}

                </MuiLayoutBox>
            </MuiLayoutBox>

        </MuiLayoutBox>

    );

}
