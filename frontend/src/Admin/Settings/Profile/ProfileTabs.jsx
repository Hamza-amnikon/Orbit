import { MuiButtonMigration } from "../../../components/ui/MuiCompat.jsx";
import {
    Person,
    BusinessCenter,
    Phone,
    Folder,
    Psychology,
    History
} from "@mui/icons-material";

import "./Profile.css";
import { Box as MuiLayoutBox, Typography as MuiText } from "@mui/material";

function ProfileTabs({ activeTab, setActiveTab }) {

    const tabs = [
        {
            id: "personal",
            label: "Personal",
            icon: <Person fontSize="small" />
        },
        {
            id: "employment",
            label: "Employment",
            icon: <BusinessCenter fontSize="small" />
        },
        {
            id: "contact",
            label: "Contact",
            icon: <Phone fontSize="small" />
        },
        {
            id: "documents",
            label: "Documents",
            icon: <Folder fontSize="small" />
        },
        {
            id: "skills",
            label: "Skills",
            icon: <Psychology fontSize="small" />
        },
        {
            id: "timeline",
            label: "Timeline",
            icon: <History fontSize="small" />
        }
    ];

    return (

        <MuiLayoutBox className="profile-tabs" component="div">

            {tabs.map((tab) => (

                <MuiButtonMigration
                    key={tab.id}
                    type="button"
                    className={`profile-tab ${activeTab === tab.id ? "active" : ""}`}
                    onClick={() => setActiveTab(tab.id)}
                >
                    <MuiText className="tab-icon" component="span" variant="inherit">
                        {tab.icon}
                    </MuiText>

                    <MuiText className="tab-label" component="span" variant="inherit">
                        {tab.label}
                    </MuiText>
                </MuiButtonMigration>

            ))}

        </MuiLayoutBox>

    );

}

export default ProfileTabs;