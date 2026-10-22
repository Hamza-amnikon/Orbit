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
import { useAuth } from "../../context/AuthContext";
import { Box as MuiLayoutBox, Typography as MuiText } from "@mui/material";
import "./SettingsDashboard.refinement.css";

const EMPLOYEE_API_URL = `${import.meta.env.VITE_EMPLOYEE_API_BASE_URL}/api/Employee`;
const DOCUMENT_API_URL = `${import.meta.env.VITE_DOCUMENT_API_BASE_URL}/api/Document`;


export default function SettingsDashboard() {

    const { updateProfile } = useAuth();

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
    const [photoUploading, setPhotoUploading] = useState(false);
    const [photoMessage, setPhotoMessage] = useState({ type: "", text: "" });


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
                    const currentProfile = {
                        ...(employeeRecord || {}),
                        ...data,
                        joinDate: joiningDate,
                        joiningDate,
                    };
                    setProfile(currentProfile);
                    updateProfile?.(currentProfile);

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

    }, [updateProfile]);

    const handleProfilePhotoUpload = async (file) => {
        if (!file) return;

        const extension = file.name.split(".").pop()?.toLowerCase();
        const commonImageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "avif", "tif", "tiff"];
        // Accept browser-supported image formats and normalize them for
        // consistent storage through the document service.
        if (!file.type.startsWith("image/") && !commonImageExtensions.includes(extension)) {
            setPhotoMessage({ type: "error", text: "Choose an image file." });
            return;
        }
        if (file.size > 4 * 1024 * 1024) {
            setPhotoMessage({ type: "error", text: "The photo must be 4 MB or smaller." });
            return;
        }

        setPhotoUploading(true);
        setPhotoMessage({ type: "", text: "" });
        try {
            const bitmap = await createImageBitmap(file).catch(() => {
                throw new Error("This image format cannot be opened by your browser. Try JPG, PNG, WebP, GIF, or BMP.");
            });
            const maxDimension = 1024;
            const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
            const canvas = document.createElement("canvas");
            canvas.width = Math.max(1, Math.round(bitmap.width * scale));
            canvas.height = Math.max(1, Math.round(bitmap.height * scale));
            const context = canvas.getContext("2d");
            if (!context) {
                bitmap.close();
                throw new Error("Could not prepare the selected photo.");
            }
            context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
            bitmap.close();

            const jpegBlob = await new Promise((resolve, reject) => {
                canvas.toBlob(
                    (blob) => blob ? resolve(blob) : reject(new Error("Could not convert the selected image. Choose a common image format and try again.")),
                    "image/jpeg",
                    0.88,
                );
            });
            const baseName = file.name.replace(/\.[^.]+$/, "") || "profile-photo";
            const uploadFile = new File([jpegBlob], `${baseName}.jpg`, { type: "image/jpeg" });

            if (uploadFile.size > 4 * 1024 * 1024) {
                setPhotoMessage({ type: "error", text: "The prepared photo is larger than 4 MB. Choose a smaller image." });
                return;
            }

            const formData = new FormData();
            formData.append("file", uploadFile);
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Your Spark session has expired. Sign in again.");
            await axios.post(`${DOCUMENT_API_URL}/profile-photo`, formData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            let refreshedProfile = null;
            try {
                refreshedProfile = await getProfile();
            } catch (refreshError) {
                // The upload is already persisted; keep the successful result even
                // if the profile refresh endpoint is temporarily unavailable.
                console.warn("Profile photo uploaded, but profile refresh failed:", refreshError);
            }
            const currentProfile = {
                ...(profile || {}),
                ...(refreshedProfile || {}),
            };
            const updatedPhotoUrl = refreshedProfile?.photoUrl ?? refreshedProfile?.PhotoUrl ?? currentProfile?.photoUrl;
            const versionedPhotoUrl = updatedPhotoUrl ? `${updatedPhotoUrl.split("?")[0]}?v=${Date.now()}` : updatedPhotoUrl;
            const updatedProfile = { ...currentProfile, photoUrl: versionedPhotoUrl };
            window.dispatchEvent(new Event("spark:profile-photo-updated"));
            setProfile(updatedProfile);
            updateProfile?.(updatedProfile);
            setPhotoMessage({ type: "success", text: "Your profile photo has been updated." });
        } catch (uploadError) {
            console.error("Profile photo upload failed:", uploadError);
            setPhotoMessage({
                type: "error",
                text: uploadError.response?.data?.message || uploadError.message || "Could not upload the photo. Please try again.",
            });
        } finally {
            setPhotoUploading(false);
        }
    };


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
                    onPhotoUpload={handleProfilePhotoUpload}
                    photoUploading={photoUploading}
                    photoMessage={photoMessage}
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
