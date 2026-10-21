import "./ProfileHeader.css";
import PhotoCameraRoundedIcon from "@mui/icons-material/PhotoCameraRounded";
import { Alert, Button, Chip, CircularProgress } from "@mui/material";
import { useRef, useState } from "react";

import ProfileAvatar from "./ProfileAvatar";
import ProfileDetails from "./ProfileDetails";
import { Box as MuiLayoutBox } from "@mui/material";

function ProfileHeader({ profile, onPhotoUpload, photoUploading, photoMessage }) {
    const fileInputRef = useRef(null);
    const [hasPhoto, setHasPhoto] = useState(null);

    if (!profile) return null;

    return (

        <MuiLayoutBox className="profile-header" component="section">

            {/* Cover Section */}

            <MuiLayoutBox className="profile-cover" component="div">

                <MuiLayoutBox className="cover-overlay" component="div"></MuiLayoutBox>

                {/* <button className="edit-profile-btn">

                    <Edit fontSize="small" />

                    Edit Profile

                </button> */}

            </MuiLayoutBox>

            {/* Main Body */}

            <MuiLayoutBox className="profile-body" component="div">

                <MuiLayoutBox className="profile-avatar-column" component="div">
                    <ProfileAvatar profile={profile} onPhotoStateChange={setHasPhoto} />
                    <Button
                        className="profile-photo-upload-button"
                        variant="contained"
                        size="small"
                        startIcon={photoUploading ? <CircularProgress size={16} color="inherit" /> : <PhotoCameraRoundedIcon />}
                        disabled={photoUploading}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {photoUploading ? "Uploading…" : profile.photoUrl ? "Change photo" : "Upload photo"}
                    </Button>
                    {hasPhoto === false && <Chip className="profile-photo-required" label="Required" size="small" color="error" />}
                    <span className="profile-photo-format-hint">Image formats · Up to 4 MB</span>
                    <input
                        ref={fileInputRef}
                        className="profile-photo-file-input"
                        type="file"
                        accept="image/*"
                        aria-label="Upload a profile photo in any image format"
                        onChange={(event) => {
                            onPhotoUpload?.(event.target.files?.[0]);
                            event.target.value = "";
                        }}
                    />
                </MuiLayoutBox>

                <ProfileDetails profile={profile} />

            </MuiLayoutBox>
            {hasPhoto === false && (
                <Alert className="profile-photo-message" severity="warning">
                    A profile photo is required before you can continue using Spark. Upload an image here.
                </Alert>
            )}
            {photoMessage?.text && (
                <Alert className="profile-photo-message" severity={photoMessage.type}>
                    {photoMessage.text}
                </Alert>
            )}

        </MuiLayoutBox>

    );

}

export default ProfileHeader;
