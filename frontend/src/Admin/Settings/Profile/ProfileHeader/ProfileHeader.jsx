import "./ProfileHeader.css";
import { Edit } from "@mui/icons-material";

import ProfileAvatar from "./ProfileAvatar";
import ProfileDetails from "./ProfileDetails";
import { Box as MuiLayoutBox } from "@mui/material";

function ProfileHeader({ profile }) {

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

                <ProfileAvatar profile={profile} />

                <ProfileDetails profile={profile} />

            </MuiLayoutBox>

        </MuiLayoutBox>

    );

}

export default ProfileHeader;