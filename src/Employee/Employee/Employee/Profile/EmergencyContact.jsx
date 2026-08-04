import "./Profile.css";

import {
    Person,
    Favorite,
    Phone,
    Home
} from "@mui/icons-material";

function EmergencyContact({ profile }) {

    if (!profile) return null;

    return (

        <div className="profile-section">

            <div className="section-header">

                <div className="section-icon emergency-icon">

                    <Favorite />

                </div>

                <div>

                    <h3>Emergency Contact</h3>

                    <p>Primary emergency contact details</p>

                </div>

            </div>

            <div className="section-body">

                <div className="profile-item">

                    <Person className="item-icon" />

                    <div>

                        <label>Contact Person</label>

                        <span>{profile.emergencyContactName || "-"}</span>

                    </div>

                </div>

                <div className="profile-item">

                    <Favorite className="item-icon" />

                    <div>

                        <label>Relationship</label>

                        <span>{profile.emergencyRelationship || "-"}</span>

                    </div>

                </div>

                <div className="profile-item">

                    <Phone className="item-icon" />

                    <div>

                        <label>Phone Number</label>

                        <span>{profile.emergencyPhone || "-"}</span>

                    </div>

                </div>

                <div className="profile-item">

                    <Home className="item-icon" />

                    <div>

                        <label>Address</label>

                        <span>{profile.emergencyAddress || "-"}</span>

                    </div>

                </div>

            </div>

        </div>

    );

}

export default EmergencyContact;