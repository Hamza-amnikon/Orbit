import { useNavigate } from "react-router-dom";

import {
    EventRounded,
    BusinessRounded,
    LocationOnRounded,
    BadgeRounded,
    SecurityRounded,
    AccountTreeRounded,
    ArrowForward,
} from "@mui/icons-material";

import "./SettingsDashboard.css";

const settingsCards = [
    {
        title: "Holidays & Events",
        description: "Manage company holidays, events and important dates.",
        icon: <EventRounded fontSize="large" />,
        color: "#2563eb",
        path: "/settings/holidays-events",
    },
    {
        title: "Departments",
        description: "Manage organization departments.",
        icon: <BusinessRounded fontSize="large" />,
        color: "#16a34a",
        path: "/employees/departments",
    },
    {
        title: "Locations",
        description: "Manage office locations and regional settings.",
        icon: <LocationOnRounded fontSize="large" />,
        color: "#9333ea",
        path: "/employees/locations",
    },
    {
        title: "Employee Types",
        description: "Manage employee types and employment categories.",
        icon: <BadgeRounded fontSize="large" />,
        color: "#ea580c",
        path: "/employees/types",
    },
    {
        title: "Roles & Permissions",
        description: "Manage system roles and access permissions.",
        icon: <SecurityRounded fontSize="large" />,
        color: "#0ea5e9",
        path: "/employees/roles",
    },
    {
    title: "Employee Hierarchy",
    description: "Manage employee reporting and approval hierarchy.",
    icon: <AccountTreeRounded fontSize="large" />,
    color: "#7c3aed",
    path: "/settings/employee-hierarchy",
    },
];

export default function SettingsDashboard() {

    const navigate = useNavigate();

    return (
        <div className="settings-dashboard">

            <div className="settings-header">
                <h1>Settings</h1>

                <p>
                    Manage organization settings and system configuration.
                </p>
            </div>

            <div className="settings-grid">

                {settingsCards.map((card) => (

                    <div
                        key={card.title}
                        className="settings-card"
                        role="button"
                        tabIndex={0}
                        onClick={() => navigate(card.path)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                navigate(card.path);
                            }
                        }}
                    >

                        <div
                            className="settings-icon"
                            style={{ background: card.color }}
                        >
                            {card.icon}
                        </div>

                        <h3>{card.title}</h3>

                        <p>{card.description}</p>

                        <div className="settings-card-footer">
                            <span>Open Settings</span>
                            <ArrowForward />
                        </div>

                    </div>

                ))}

            </div>

        </div>
    );
}