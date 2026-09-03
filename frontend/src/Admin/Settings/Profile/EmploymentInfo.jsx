import "./Profile.css";

import { Work } from "@mui/icons-material";

import InfoCard from "./InfoCard";
import InfoRow from "./InfoRow";

function EmploymentInfo({ profile }) {

    if (!profile) return null;

    return (

        <InfoCard
            icon={<Work />}
            title="Employment Information"
        >

<InfoRow
    label="Employee ID"
    value={profile.azureEmployeeId || "-"}
/>

            <InfoRow
                label="Employee Code"
                value={profile.employeeCode || "-"}
            />

            <InfoRow
                label="Company"
                value={profile.companyName || "-"}
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
                label="Office Location"
                value={profile.officeLocation || "-"}
            />

            <InfoRow
                label="Employment Status"
                value={profile.status || "-"}
            />

            <InfoRow
                label="Manager Name "
                value={profile.managerName || "-"}
            />

        </InfoCard>

    );

}

export default EmploymentInfo;