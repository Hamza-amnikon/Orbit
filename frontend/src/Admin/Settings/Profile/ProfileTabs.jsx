import {
    Person,
    BusinessCenter,
    Phone,
    Folder,
    Psychology,
    History
} from "@mui/icons-material";

import "./Profile.css";

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

        <div className="profile-tabs">

            {tabs.map((tab) => (

                <button
                    key={tab.id}
                    type="button"
                    className={`profile-tab ${activeTab === tab.id ? "active" : ""}`}
                    onClick={() => setActiveTab(tab.id)}
                >
                    <span className="tab-icon">
                        {tab.icon}
                    </span>

                    <span className="tab-label">
                        {tab.label}
                    </span>
                </button>

            ))}

        </div>

    );

}

export default ProfileTabs;