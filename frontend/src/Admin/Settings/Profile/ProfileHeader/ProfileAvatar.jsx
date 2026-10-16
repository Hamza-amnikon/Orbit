import { useState } from "react";
import { Box as MuiLayoutBox, Typography as MuiText } from "@mui/material";

function ProfileAvatar({ profile }) {

    const [imageError, setImageError] = useState(false);

    const showPhoto =
        profile.photoUrl &&
        profile.photoUrl.trim() !== "" &&
        !imageError;
console.log("Profile:", profile);
console.log("Photo URL:", profile.photoUrl);
    return (

        <MuiLayoutBox className="profile-avatar-wrapper" component="div">

            <MuiLayoutBox className="profile-avatar" component="div">

                {showPhoto ? (

<MuiLayoutBox
    src={profile.photoUrl}
    alt={profile.displayName}
    className="profile-avatar-image"
    onLoad={() => console.log("Image loaded")}
    onError={(e) => {
        console.log("Image failed:", e.target.src);
        setImageError(true);
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