import "./Profile.css";

import {
    Email,
    Phone,
    Home,
    Public,
    Business,
    LocationCity
} from "@mui/icons-material";

function ContactInfo({ profile }) {

    if (!profile) return null;

    return (

        <div className="profile-section">

            <div className="section-header">

                <div className="section-icon">

                    <Phone />

                </div>

                <div>

                    <h3>Contact Information</h3>

                    <p>Your official contact and address details</p>

                </div>

            </div>

            <div className="section-body">

                <div className="profile-item">

                    <Email className="item-icon" />

                    <div>

                        <label>Email Address</label>

                        <span>{profile.email || "-"}</span>

                    </div>

                </div>

                <div className="profile-item">

                    <Phone className="item-icon" />

                    <div>

                        <label>Mobile Number</label>

                        <span>{profile.mobilePhone || "-"}</span>

                    </div>

                </div>

                <div className="profile-item">

                    <Business className="item-icon" />

                    <div>

                        <label>Company</label>

                        <span>{profile.companyName || "-"}</span>

                    </div>

                </div>

                <div className="profile-item">

                    <Home className="item-icon" />

                    <div>

                        <label>Street Address</label>

                        <span>{profile.streetAddress || "-"}</span>

                    </div>

                </div>

                <div className="profile-item">

                    <LocationCity className="item-icon" />

                    <div>

                        <label>City</label>

                        <span>{profile.city || "-"}</span>

                    </div>

                </div>

                <div className="profile-item">

                    <Public className="item-icon" />

                    <div>

                        <label>State</label>

                        <span>{profile.state || "-"}</span>

                    </div>

                </div>

                <div className="profile-item">

                    <Public className="item-icon" />

                    <div>

                        <label>Country</label>

                        <span>{profile.country || "-"}</span>

                    </div>

                </div>

                <div className="profile-item">

                    <LocationCity className="item-icon" />

                    <div>

                        <label>Postal Code</label>

                        <span>{profile.postalCode || "-"}</span>

                    </div>

                </div>

            </div>

        </div>

    );

}

export default ContactInfo;