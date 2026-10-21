import { useEffect, useState } from "react";
import { useAuthenticatedProfilePhoto } from "../../../Services/ProfilePhotoService";
import { Box as MuiLayoutBox, Typography as MuiText } from "@mui/material";

function ProfileAvatar({ profile, onPhotoStateChange }) {

    const [imageError, setImageError] = useState(false);
    const photoImageUrl = useAuthenticatedProfilePhoto(profile?.photoUrl);

    useEffect(() => {
        setImageError(false);
        onPhotoStateChange?.(null);
    }, [onPhotoStateChange, photoImageUrl]);

    const showPhoto =
        photoImageUrl &&
        profile.photoUrl.trim() !== "" &&
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
