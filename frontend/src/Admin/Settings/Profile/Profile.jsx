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
import Documents from "./Documents";
import { Box as MuiLayoutBox, Typography as MuiText } from "@mui/material";

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
            <MuiLayoutBox className="profile-page" component="div">
                <MuiText component="h2" variant="h5">Loading Profile...</MuiText>
            </MuiLayoutBox>
        );

    }

    if (error) {

        return (
            <MuiLayoutBox className="profile-page" component="div">
                <MuiText component="h2" variant="h5">{error}</MuiText>
            </MuiLayoutBox>
        );

    }

    return (

        <MuiLayoutBox className="profile-page" component="div">

            {/* Page Title */}

            <MuiLayoutBox className="profile-title" component="div">

                <MuiText component="h1" variant="h4">My Profile</MuiText>

                <MuiText component="p" variant="body1">
                    Manage your personal and employment information.
                </MuiText>

            </MuiLayoutBox>

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

                <MuiLayoutBox className="profile-grid" component="div">

                    <ProfileInfo profile={profile} />

                </MuiLayoutBox>

            )}

            {/* ================= Employment ================= */}

            {activeTab === "employment" && (

                <MuiLayoutBox className="profile-grid" component="div">

                    <EmploymentInfo profile={profile} />

                </MuiLayoutBox>

            )}

            {/* ================= Contact ================= */}

            {activeTab === "contact" && (

                <>
                    <ContactInfo profile={profile} />

                    <MuiLayoutBox className="profile-grid" component="div">

                        <EmergencyContact profile={profile} />

                    </MuiLayoutBox>
                </>

            )}

            {/* ================= Documents ================= */}

            {activeTab === "documents" && (

                <Documents profile={profile}/>

            )}

            {/* ================= Skills ================= */}

            {activeTab === "skills" && (

                <MuiLayoutBox className="coming-soon-card" component="div">

                    <MuiText component="h2" variant="h5">Skills</MuiText>

                    <MuiText component="p" variant="body1">
                        Skills and certifications will appear here.
                    </MuiText>

                </MuiLayoutBox>

            )}

            {/* ================= Timeline ================= */}

            {activeTab === "timeline" && (

                <MuiLayoutBox className="coming-soon-card" component="div">

                    <MuiText component="h2" variant="h5">Timeline</MuiText>

                    <MuiText component="p" variant="body1">
                        Employee history and activities will appear here.
                    </MuiText>

                </MuiLayoutBox>

            )}

        </MuiLayoutBox>

    );

}

export default Profile;