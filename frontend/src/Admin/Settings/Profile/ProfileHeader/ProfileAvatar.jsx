import { useEffect, useState } from "react";
import { loadAuthenticatedProfilePhoto } from "../../../Services/ProfilePhotoService";
import { Box as MuiLayoutBox, Typography as MuiText } from "@mui/material";

function ProfileAvatar({ profile, onPhotoStateChange }) {

    const [imageError, setImageError] = useState(false);
    const [photoImageUrl, setPhotoImageUrl] = useState("");
    const profilePhotoUrl = profile?.photoUrl ?? profile?.PhotoUrl ?? "";

    useEffect(() => {
        const controller = new AbortController();
        let active = true;
        setPhotoImageUrl("");
        setImageError(false);
        onPhotoStateChange?.(null);

        if (!profilePhotoUrl || !profilePhotoUrl.trim()) {
            onPhotoStateChange?.(false);
            return () => {
                active = false;
                controller.abort();
            };
        }

        const loadPhoto = (refresh = false) => loadAuthenticatedProfilePhoto(profilePhotoUrl, { refresh, signal: controller.signal })
            .then((url) => {
                if (!active || controller.signal.aborted) return;
                if (url) {
                    setPhotoImageUrl(url);
                } else {
                    onPhotoStateChange?.(false);
                }
            })
            .catch(() => {
                if (active && !controller.signal.aborted) onPhotoStateChange?.(false);
            });

        const onPhotoUpdated = () => loadPhoto(true);
        loadPhoto();
        window.addEventListener("spark:profile-photo-updated", onPhotoUpdated);

        return () => {
            active = false;
            controller.abort();
            window.removeEventListener("spark:profile-photo-updated", onPhotoUpdated);
        };
    }, [onPhotoStateChange, profilePhotoUrl]);

    const showPhoto =
        photoImageUrl &&
        profilePhotoUrl.trim() !== "" &&
        !imageError;
    return (

        <MuiLayoutBox className="profile-avatar-wrapper" component="div">

            <MuiLayoutBox className="profile-avatar" component="div">

                {showPhoto ? (

<MuiLayoutBox
    src={photoImageUrl}
    alt={profile.displayName}
    className="profile-avatar-image"
    onLoad={() => onPhotoStateChange?.(true)}
    onError={() => {
        setImageError(true);
        onPhotoStateChange?.(false);
    }}
 component="img"/>

                ) : (

                    <MuiLayoutBox className="profile-avatar-letter" component="div">

                        {profile.displayName?.charAt(0).toUpperCase()}

                    </MuiLayoutBox>

                )}

                <MuiText className="profile-online" component="span" variant="inherit"></MuiText>

            </MuiLayoutBox>

        </MuiLayoutBox>

    );

}

export default ProfileAvatar;
