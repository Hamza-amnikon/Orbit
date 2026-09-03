import { useState } from "react";

function ProfileAvatar({ profile }) {

    const [imageError, setImageError] = useState(false);

    const showPhoto =
        profile.photoUrl &&
        profile.photoUrl.trim() !== "" &&
        !imageError;
console.log("Profile:", profile);
console.log("Photo URL:", profile.photoUrl);
    return (

        <div className="profile-avatar-wrapper">

            <div className="profile-avatar">

                {showPhoto ? (

<img
    src={profile.photoUrl}
    alt={profile.displayName}
    className="profile-avatar-image"
    onLoad={() => console.log("Image loaded")}
    onError={(e) => {
        console.log("Image failed:", e.target.src);
        setImageError(true);
    }}
/>

                ) : (

                    <div className="profile-avatar-letter">

                        {profile.displayName?.charAt(0).toUpperCase()}

                    </div>

                )}

                <span className="profile-online"></span>

            </div>

        </div>

    );

}

export default ProfileAvatar;