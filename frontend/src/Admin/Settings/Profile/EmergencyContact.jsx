import "./Profile.css";

import {
    Person,
    Favorite,
    Phone,
    Home
} from "@mui/icons-material";
import { Box as MuiLayoutBox, Typography as MuiText } from "@mui/material";

function EmergencyContact({ profile }) {

    if (!profile) return null;

    return (

        <MuiLayoutBox className="profile-section" component="div">

            <MuiLayoutBox className="section-header" component="div">

                <MuiLayoutBox className="section-icon emergency-icon" component="div">

                    <Favorite />

                </MuiLayoutBox>

                <MuiLayoutBox component="div">

                    <MuiText component="h3" variant="h6">Emergency Contact</MuiText>

                    <MuiText component="p" variant="body1">Primary emergency contact details</MuiText>

                </MuiLayoutBox>

            </MuiLayoutBox>

            <MuiLayoutBox className="section-body" component="div">

                <MuiLayoutBox className="profile-item" component="div">

                    <Person className="item-icon" />

                    <MuiLayoutBox component="div">

                        <MuiLayoutBox component="label">Contact Person</MuiLayoutBox>

                        <MuiText component="span" variant="inherit">{profile.emergencyContactName || "-"}</MuiText>

                    </MuiLayoutBox>

                </MuiLayoutBox>

                <MuiLayoutBox className="profile-item" component="div">

                    <Favorite className="item-icon" />

                    <MuiLayoutBox component="div">

                        <MuiLayoutBox component="label">Relationship</MuiLayoutBox>

                        <MuiText component="span" variant="inherit">{profile.emergencyRelationship || "-"}</MuiText>

                    </MuiLayoutBox>

                </MuiLayoutBox>

                <MuiLayoutBox className="profile-item" component="div">

                    <Phone className="item-icon" />

                    <MuiLayoutBox component="div">

                        <MuiLayoutBox component="label">Phone Number</MuiLayoutBox>

                        <MuiText component="span" variant="inherit">{profile.emergencyPhone || "-"}</MuiText>

                    </MuiLayoutBox>

                </MuiLayoutBox>

                <MuiLayoutBox className="profile-item" component="div">

                    <Home className="item-icon" />

                    <MuiLayoutBox component="div">

                        <MuiLayoutBox component="label">Address</MuiLayoutBox>

                        <MuiText component="span" variant="inherit">{profile.emergencyAddress || "-"}</MuiText>

                    </MuiLayoutBox>

                </MuiLayoutBox>

            </MuiLayoutBox>

        </MuiLayoutBox>

    );

}

export default EmergencyContact;