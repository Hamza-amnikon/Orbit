import "./SettingsDashboard.css";

import { useEffect, useState } from "react";

import ProfileHeader from "./Profile/ProfileHeader/ProfileHeader";
import ProfileStats from "./Profile/ProfileStats";
import ProfileTabs from "./Profile/ProfileTabs";
import ProfileInfo from "./Profile/ProfileInfo";
import EmploymentInfo from "./Profile/EmploymentInfo";
import ContactInfo from "./Profile/ContactInfo";
import EmergencyContact from "./Profile/EmergencyContact";
import Documents from "./Profile/Documents";

import { getProfile } from "../Services/ProfileService";


export default function SettingsDashboard() {

    const [profile, setProfile] = useState(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [activeTab, setActiveTab] = useState("personal");


    // =========================================================
    // LOAD PROFILE
    // =========================================================

    useEffect(() => {

        let mounted = true;

        const loadProfile = async () => {

            try {

                const data = await getProfile();

                if (mounted) {

                    setProfile(data);

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

            <div className="settings-dashboard">

                <div className="settings-header">

                    <h1>
                        Settings
                    </h1>

                    <p>
                        Manage your personal and system settings.
                    </p>

                </div>

                <div className="settings-loading">

                    <div className="settings-loading-spinner" />

                    <span>
                        Loading profile...
                    </span>

                </div>

            </div>

        );

    }


    // =========================================================
    // ERROR
    // =========================================================

    if (error) {

        return (

            <div className="settings-dashboard">

                <div className="settings-header">

                    <h1>
                        Settings
                    </h1>

                    <p>
                        Manage your personal and system settings.
                    </p>

                </div>

                <div className="settings-error">

                    {error}

                </div>

            </div>

        );

    }


    // =========================================================
    // RENDER
    // =========================================================

    return (

        <div className="settings-dashboard">

            {/* =================================================
                SETTINGS HEADER
            ================================================= */}

            <div className="settings-header">

                <h1>
                    Profile Settings
                </h1>

                <p>
                    Manage your profile and personal information.
                </p>

            </div>


            {/* =================================================
                PROFILE HEADER
            ================================================= */}

            <div className="settings-profile-section">

                <ProfileHeader
                    profile={profile}
                />

            </div>


            {/* =================================================
                PROFILE STATISTICS
            ================================================= */}

            <ProfileStats
                profile={profile}
            />


            {/* =================================================
                PROFILE TABS
            ================================================= */}

            <ProfileTabs
                activeTab={activeTab}
                setActiveTab={setActiveTab}
            />


            {/* =================================================
                PERSONAL
            ================================================= */}

            {activeTab === "personal" && (

                <div className="profile-grid">

                    <ProfileInfo
                        profile={profile}
                    />

                </div>

            )}


            {/* =================================================
                EMPLOYMENT
            ================================================= */}

            {activeTab === "employment" && (

                <div className="profile-grid">

                    <EmploymentInfo
                        profile={profile}
                    />

                </div>

            )}


            {/* =================================================
                CONTACT
            ================================================= */}

            {activeTab === "contact" && (

                <>

                    <ContactInfo
                        profile={profile}
                    />

                    <div className="profile-grid">

                        <EmergencyContact
                            profile={profile}
                        />

                    </div>

                </>

            )}


            {/* =================================================
                DOCUMENTS
            ================================================= */}

            {activeTab === "documents" && (

                <Documents
                    profile={profile}
                />

            )}


            {/* =================================================
                SKILLS
            ================================================= */}

            {activeTab === "skills" && (

                <div className="coming-soon-card">

                    <h2>
                        Skills
                    </h2>

                    <p>
                        Skills and certifications will appear here.
                    </p>

                </div>

            )}


            {/* =================================================
                TIMELINE
            ================================================= */}

            {activeTab === "timeline" && (

                <div className="coming-soon-card">

                    <h2>
                        Timeline
                    </h2>

                    <p>
                        Employee history and activities will appear here.
                    </p>

                </div>

            )}

        </div>

    );

}