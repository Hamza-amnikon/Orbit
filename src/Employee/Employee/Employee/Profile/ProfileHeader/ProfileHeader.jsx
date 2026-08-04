import "./ProfileHeader.css";
import { Edit } from "@mui/icons-material";

import ProfileAvatar from "./ProfileAvatar";
import ProfileDetails from "./ProfileDetails";

function ProfileHeader({ profile }) {

    if (!profile) return null;

    return (

        <section className="profile-header">

            {/* Cover Section */}

            <div className="profile-cover">

                <div className="cover-overlay"></div>

                <button className="edit-profile-btn">

                    <Edit fontSize="small" />

                    Edit Profile

                </button>

            </div>

            {/* Main Body */}

            <div className="profile-body">

                <ProfileAvatar profile={profile} />

                <ProfileDetails profile={profile} />

            </div>

        </section>

    );

}

export default ProfileHeader;