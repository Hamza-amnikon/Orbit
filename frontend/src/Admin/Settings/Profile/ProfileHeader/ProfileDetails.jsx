import {
    Badge,
    Apartment,
    CalendarMonth,
    Email,
    LocationOn,
    Phone,
    Verified
} from "@mui/icons-material";
import { Box as MuiLayoutBox, Typography as MuiText } from "@mui/material";

function ProfileDetails({ profile }) {

    return (

        <MuiLayoutBox className="profile-details" component="div">

            {/* ==========================
                TOP ROW
            =========================== */}

            <MuiLayoutBox className="profile-top" component="div">

                <MuiLayoutBox component="div">

                    <MuiText className="employee-name" component="h1" variant="h4">

                        {profile.displayName}

                    </MuiText>

                    <MuiLayoutBox className="employee-title" component="div">

                        {profile.jobTitle}

                    </MuiLayoutBox>

                    <MuiLayoutBox className="employee-company" component="div">

                        <Apartment fontSize="small" />

                        {profile.companyName}

                    </MuiLayoutBox>

                    <MuiLayoutBox className="employee-location" component="div">

                        <LocationOn fontSize="small" />

                        {profile.city}, {profile.country}

                    </MuiLayoutBox>

                </MuiLayoutBox>

                <MuiLayoutBox className="employee-status" component="div">

                    <MuiText className="status-badge" component="span" variant="inherit">

                        <Verified fontSize="small" />

                        {profile.status}

                    </MuiText>

                </MuiLayoutBox>

            </MuiLayoutBox>

            {/* ==========================
                CONTACT BAR
            =========================== */}

            <MuiLayoutBox className="contact-bar" component="div">

                <MuiLayoutBox className="contact-item" component="div">

                    <Email />

                    <MuiLayoutBox component="div">

                        <MuiText component="span" variant="inherit">Email</MuiText>

                        <MuiText component="strong" variant="inherit">{profile.email}</MuiText>

                    </MuiLayoutBox>

                </MuiLayoutBox>

                <MuiLayoutBox className="contact-item" component="div">

                    <Phone />

                    <MuiLayoutBox component="div">

                        <MuiText component="span" variant="inherit">Phone</MuiText>

                        <MuiText component="strong" variant="inherit">{profile.mobilePhone}</MuiText>

                    </MuiLayoutBox>

                </MuiLayoutBox>

                <MuiLayoutBox className="contact-item" component="div">

                    <Badge />

                    <MuiLayoutBox component="div">

                        <MuiText component="span" variant="inherit">Employee ID</MuiText>

                        <MuiText component="strong" variant="inherit">{profile.azureEmployeeId}</MuiText>

                    </MuiLayoutBox>

                </MuiLayoutBox>

                <MuiLayoutBox className="contact-item" component="div">

                    <CalendarMonth />

                    <MuiLayoutBox component="div">

                        <MuiText component="span" variant="inherit">Join Date</MuiText>

                        <MuiText component="strong" variant="inherit">{profile.joinDate
                            }</MuiText>

                    </MuiLayoutBox>

                </MuiLayoutBox>

            </MuiLayoutBox>

        </MuiLayoutBox>

    );

}

export default ProfileDetails;