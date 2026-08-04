import "./Profile.css";

import { useEffect, useState } from "react";

import ProfileHeader from "./ProfileHeader/ProfileHeader";
import ProfileStats from "./ProfileStats";
import ProfileTabs from "./ProfileTabs";
import ProfileInfo from "./ProfileInfo";
import EmploymentInfo from "./EmploymentInfo";
import ContactInfo from "./ContactInfo";
import EmergencyContact from "./EmergencyContact";
import { getProfile } from "../Services/ProfileService";

function Profile() {

    const [profile, setProfile] = useState(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [activeTab, setActiveTab] = useState("personal");

    useEffect(() => {

        const loadProfile = async () => {

            try {

                const data = await getProfile();

                setProfile(data);

            }
            catch (err) {

                console.error(err);

                setError("Failed to load profile.");

            }
            finally {

                setLoading(false);

            }

        };

        loadProfile();

    }, []);

    if (loading) {

        return (
            <div className="profile-page">
                <h2>Loading Profile...</h2>
            </div>
        );

    }

    if (error) {

        return (
            <div className="profile-page">
                <h2>{error}</h2>
            </div>
        );

    }

    return (

        <div className="profile-page">

            {/* Page Title */}

            <div className="profile-title">

                <h1>My Profile</h1>

                <p>
                    Manage your personal and employment information.
                </p>

            </div>

            {/* Banner */}

            <ProfileHeader profile={profile} />

            {/* Statistics */}

            <ProfileStats profile={profile} />

            {/* Tabs */}

            <ProfileTabs
                activeTab={activeTab}
                setActiveTab={setActiveTab}
            />

            {/* ================= Personal ================= */}

            {activeTab === "personal" && (

                <div className="profile-grid">

                    <ProfileInfo profile={profile} />

                </div>

            )}

            {/* ================= Employment ================= */}

            {activeTab === "employment" && (

                <div className="profile-grid">

                    <EmploymentInfo profile={profile} />

                </div>

            )}

            {/* ================= Contact ================= */}

            {activeTab === "contact" && (

                <>
                    <ContactInfo profile={profile} />

                    <div className="profile-grid">

                        <EmergencyContact profile={profile} />

                    </div>
                </>

            )}

            {/* ================= Documents ================= */}

            {activeTab === "documents" && (

                <div className="coming-soon-card">

                    <h2>Documents</h2>

                    <p>
                        Employee documents will appear here.
                    </p>

                </div>

            )}

            {/* ================= Skills ================= */}

            {activeTab === "skills" && (

                <div className="coming-soon-card">

                    <h2>Skills</h2>

                    <p>
                        Skills and certifications will appear here.
                    </p>

                </div>

            )}

            {/* ================= Timeline ================= */}

            {activeTab === "timeline" && (

                <div className="coming-soon-card">

                    <h2>Timeline</h2>

                    <p>
                        Employee history and activities will appear here.
                    </p>

                </div>

            )}

        </div>

    );

}

export default Profile;