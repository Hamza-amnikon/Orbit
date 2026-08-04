import {
    Badge,
    Apartment,
    CalendarMonth,
    Email,
    LocationOn,
    Phone,
    Verified
} from "@mui/icons-material";

function ProfileDetails({ profile }) {

    return (

        <div className="profile-details">

            {/* ==========================
                TOP ROW
            =========================== */}

            <div className="profile-top">

                <div>

                    <h1 className="employee-name">

                        {profile.displayName}

                    </h1>

                    <div className="employee-title">

                        {profile.jobTitle}

                    </div>

                    <div className="employee-company">

                        <Apartment fontSize="small" />

                        {profile.companyName}

                    </div>

                    <div className="employee-location">

                        <LocationOn fontSize="small" />

                        {profile.city}, {profile.country}

                    </div>

                </div>

                <div className="employee-status">

                    <span className="status-badge">

                        <Verified fontSize="small" />

                        {profile.status}

                    </span>

                </div>

            </div>

            {/* ==========================
                CONTACT BAR
            =========================== */}

            <div className="contact-bar">

                <div className="contact-item">

                    <Email />

                    <div>

                        <span>Email</span>

                        <strong>{profile.email}</strong>

                    </div>

                </div>

                <div className="contact-item">

                    <Phone />

                    <div>

                        <span>Phone</span>

                        <strong>{profile.mobilePhone}</strong>

                    </div>

                </div>

                <div className="contact-item">

                    <Badge />

                    <div>

                        <span>Employee ID</span>

                        <strong>{profile.azureEmployeeId}</strong>

                    </div>

                </div>

                <div className="contact-item">

                    <CalendarMonth />

                    <div>

                        <span>Join Date</span>

                        <strong>{profile.joinDate
                            }</strong>

                    </div>

                </div>

            </div>

        </div>

    );

}

export default ProfileDetails;