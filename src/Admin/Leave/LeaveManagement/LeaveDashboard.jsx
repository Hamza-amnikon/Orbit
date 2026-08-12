import "./LeaveDashboard.css";
import "../../Employees/EmployeeManagement/EmployeeDashboard.css";
import { useNavigate } from "react-router-dom";

import {
    DashboardRounded,
    FactCheckRounded,
    HistoryRounded,
    CategoryRounded,
    AccountBalanceWalletRounded,
    PolicyRounded,
    AssessmentRounded,
    ArrowForward,
} from "@mui/icons-material";

const cards = [
    {
        title: "Leave Dashboard",
        description: "View leave summary, statistics and approvals.",
        icon: <DashboardRounded fontSize="large" />,
        color: "#2563eb",
        path: "/leave/dashboard",
    },
    {
        title: "Leave Requests",
        description: "Review and manage employee leave requests.",
        icon: <FactCheckRounded fontSize="large" />,
        color: "#16a34a",
        path: "/leave/requests",
    },
    {
        title: "Leave Taken History",
        description: "View employees' previous leave records.",
        icon: <HistoryRounded fontSize="large" />,
        color: "#9333ea",
        path: "/leave/history",
    },
    {
        title: "Leave Types",
        description: "Manage annual, sick, casual and other leave types.",
        icon: <CategoryRounded fontSize="large" />,
        color: "#ea580c",
        path: "/leave/types",
    },
    {
        title: "Leave Balance",
        description: "View and manage employee leave balances.",
        icon: <AccountBalanceWalletRounded fontSize="large" />,
        color: "#d00cea",
        path: "/leave/balance",
    },
    {
        title: "Leave Policies",
        description: "Configure company leave rules and policies.",
        icon: <PolicyRounded fontSize="large" />,
        color: "#0ea5e9",
        path: "/leave/policies",
    },
    {
        title: "Leave Reports",
        description: "View leave reports and analytics.",
        icon: <AssessmentRounded fontSize="large" />,
        color: "#14b8a6",
        path: "/leave/reports",
    },
];

export default function LeaveDashboard() {

    const navigate = useNavigate();

    const openPage = (path) => {
        navigate(path);
    };

    return (
        <div className="employee-dashboard">

            <div className="employee-header">
                <h1>Leave Management</h1>

                <p>
                    Manage employee leaves, approvals, balances and policies
                    from one place.
                </p>
            </div>

            <div className="employee-grid">

                {cards.map((card, index) => (

                    <div
                        key={card.title}
                        className="employee-card fade-up"
                        style={{
                            animationDelay: `${index * 0.1}s`,
                        }}
                        role="button"
                        tabIndex={0}
                        onClick={() => openPage(card.path)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                openPage(card.path);
                            }
                        }}
                    >

                        <div
                            className="employee-icon"
                            style={{
                                background: card.color,
                            }}
                        >
                            {card.icon}
                        </div>

                        <h3>{card.title}</h3>

                        <p>{card.description}</p>

                        <div className="card-footer">
                            <span>Open Module</span>
                            <ArrowForward />
                        </div>

                    </div>

                ))}

            </div>

        </div>
    );
}