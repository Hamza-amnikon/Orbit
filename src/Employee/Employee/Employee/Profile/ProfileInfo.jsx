import "./Profile.css";

import { Person } from "@mui/icons-material";
import InfoCard from "./InfoCard";
import InfoRow from "./InfoRow";

function ProfileInfo({ profile }) {

    if (!profile) return null;

    return (

        <InfoCard
            icon={<Person />}
            title="Personal Information"
        >

            <InfoRow
                label="Full Name"
                value={profile.displayName || "-"}
            />

            {/* <InfoRow
                label="Employee Code"
                value={profile.employeeCode || "-"}
            /> */}

            <InfoRow
                label="Email"
                value={profile.email || "-"}
            />

            <InfoRow
                label="Mobile"
                value={profile.mobilePhone || "-"}
            />

            <InfoRow
                label="Department"
                value={profile.department || "-"}
            />

            <InfoRow
                label="Designation"
                value={profile.jobTitle || "-"}
            />

            <InfoRow
                label="Company"
                value={profile.companyName || "-"}
            />

            <InfoRow
                label="Status"
                value={profile.status || "-"}
            />

        </InfoCard>

    );

}

export default ProfileInfo;