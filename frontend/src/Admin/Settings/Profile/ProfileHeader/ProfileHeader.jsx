import "./ProfileHeader.css";
import PhotoCameraRoundedIcon from "@mui/icons-material/PhotoCameraRounded";
import { Alert, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import { useRef, useState } from "react";

import ProfileAvatar from "./ProfileAvatar";
import ProfileDetails from "./ProfileDetails";
import { Box as MuiLayoutBox } from "@mui/material";

function ProfileHeader({ profile, onPhotoUpload, photoUploading, photoMessage }) {
    const fileInputRef = useRef(null);
    const [hasPhoto, setHasPhoto] = useState(null);

    if (!profile) return null;

    const profilePhotoUrl = profile.photoUrl ?? profile.PhotoUrl ?? "";
    const photoMissing = !profilePhotoUrl || hasPhoto === false;
    const photoPromptOpen = photoMissing && photoMessage?.type !== "success";

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
                        {photoUploading ? "Uploading…" : profilePhotoUrl ? "Change photo" : "Upload photo"}
                    </Button>
                    {hasPhoto === false && <Chip className="profile-photo-required" label="Required" size="small" color="error" />}
                    {!profilePhotoUrl && (
                        <span className="profile-photo-format-hint">Image formats · Up to 4 MB</span>
                    )}
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
            {photoMessage?.text && (
                <Alert className="profile-photo-message" severity={photoMessage.type}>
                    {photoMessage.text}
                </Alert>
            )}

            <Dialog
                className="profile-photo-required-dialog"
                open={photoPromptOpen}
                onClose={() => {}}
                disableEscapeKeyDown
                aria-labelledby="profile-photo-required-title"
                aria-describedby="profile-photo-required-description"
            >
                <DialogTitle id="profile-photo-required-title">Add your profile photo</DialogTitle>
                <DialogContent>
                    <Typography id="profile-photo-required-description" variant="body1">
                        A profile photo is required to use Spark. Upload a photo to continue; access will be available once any other onboarding requirements are complete.
                    </Typography>
                    {photoMessage?.type === "error" && (
                        <Alert severity="error" sx={{ mt: 2 }}>{photoMessage.text}</Alert>
                    )}
                    <Typography className="profile-photo-dialog-hint" variant="body2">
                        Choose an image up to 4 MB.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button
                        variant="contained"
                        startIcon={photoUploading ? <CircularProgress size={16} color="inherit" /> : <PhotoCameraRoundedIcon />}
                        disabled={photoUploading}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {photoUploading ? "Uploading…" : "Upload photo"}
                    </Button>
                </DialogActions>
            </Dialog>

        </MuiLayoutBox>

    );

}

export default ProfileHeader;
