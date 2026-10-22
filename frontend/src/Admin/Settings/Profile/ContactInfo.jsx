import "./Profile.css";

import {
    Email,
    Phone,
    Home,
    Public,
    Business,
    LocationCity
} from "@mui/icons-material";
import { Box as MuiLayoutBox, Typography as MuiText } from "@mui/material";

function ContactInfo({ profile }) {

    if (!profile) return null;

    const city = String(profile.city || "").trim().replace(/,+\s*$/, "").trim();

    return (

        <MuiLayoutBox className="profile-section" component="div">

            <MuiLayoutBox className="section-header" component="div">

                <MuiLayoutBox className="section-icon" component="div">

                    <Phone />

                </MuiLayoutBox>

                <MuiLayoutBox component="div">

                    <MuiText component="h3" variant="h6">Contact Information</MuiText>

                    <MuiText component="p" variant="body1">Your official contact and address details</MuiText>

                </MuiLayoutBox>

            </MuiLayoutBox>

            <MuiLayoutBox className="section-body" component="div">

                <MuiLayoutBox className="profile-item" component="div">

                    <Email className="item-icon" />

                    <MuiLayoutBox component="div">

                        <MuiLayoutBox component="label">Email Address</MuiLayoutBox>

                        <MuiText component="span" variant="inherit">{profile.email || "-"}</MuiText>

                    </MuiLayoutBox>

                </MuiLayoutBox>

                <MuiLayoutBox className="profile-item" component="div">

                    <Phone className="item-icon" />

                    <MuiLayoutBox component="div">

                        <MuiLayoutBox component="label">Mobile Number</MuiLayoutBox>

                        <MuiText component="span" variant="inherit">{profile.mobilePhone || "-"}</MuiText>

                    </MuiLayoutBox>

                </MuiLayoutBox>

                <MuiLayoutBox className="profile-item" component="div">

                    <Business className="item-icon" />

                    <MuiLayoutBox component="div">

                        <MuiLayoutBox component="label">Company</MuiLayoutBox>

                        <MuiText component="span" variant="inherit">{profile.companyName || "-"}</MuiText>

                    </MuiLayoutBox>

                </MuiLayoutBox>

                <MuiLayoutBox className="profile-item" component="div">

                    <Home className="item-icon" />

                    <MuiLayoutBox component="div">

                        <MuiLayoutBox component="label">Street Address</MuiLayoutBox>

                        <MuiText component="span" variant="inherit">{profile.streetAddress || "-"}</MuiText>

                    </MuiLayoutBox>

                </MuiLayoutBox>

                <MuiLayoutBox className="profile-item" component="div">

                    <LocationCity className="item-icon" />

                    <MuiLayoutBox component="div">

                        <MuiLayoutBox component="label">City</MuiLayoutBox>

                        <MuiText component="span" variant="inherit">{city || "-"}</MuiText>

                    </MuiLayoutBox>

                </MuiLayoutBox>

                <MuiLayoutBox className="profile-item" component="div">

                    <Public className="item-icon" />

                    <MuiLayoutBox component="div">

                        <MuiLayoutBox component="label">State</MuiLayoutBox>

                        <MuiText component="span" variant="inherit">{profile.state || "-"}</MuiText>

                    </MuiLayoutBox>

                </MuiLayoutBox>

                <MuiLayoutBox className="profile-item" component="div">

                    <Public className="item-icon" />

                    <MuiLayoutBox component="div">

                        <MuiLayoutBox component="label">Country</MuiLayoutBox>

                        <MuiText component="span" variant="inherit">{profile.country || "-"}</MuiText>

                    </MuiLayoutBox>

                </MuiLayoutBox>

                <MuiLayoutBox className="profile-item" component="div">

                    <LocationCity className="item-icon" />

                    <MuiLayoutBox component="div">

                        <MuiLayoutBox component="label">Postal Code</MuiLayoutBox>

                        <MuiText component="span" variant="inherit">{profile.postalCode || "-"}</MuiText>

                    </MuiLayoutBox>

                </MuiLayoutBox>

            </MuiLayoutBox>

        </MuiLayoutBox>

    );

}

export default ContactInfo;
