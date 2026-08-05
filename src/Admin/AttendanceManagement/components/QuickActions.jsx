import "./QuickActions.css";

import { useNavigate } from "react-router-dom";

import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ScheduleIcon from "@mui/icons-material/Schedule";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import EventIcon from "@mui/icons-material/Event";

const actions = [
    {
        title: "Attendance Logs",
        icon: <AccessTimeIcon />,
        color: "#2563EB",
        path: "/attendance/logs"
    },
    {
        title: "Shift Management",
        icon: <ScheduleIcon />,
        color: "#10B981",
        path: "/attendance/shifts"
    },
    {
        title: "Regularization",
        icon: <AssignmentTurnedInIcon />,
        color: "#F59E0B",
        path: "/attendance/regularization"
    },
    {
        title: "Holidays",
        icon: <EventIcon />,
        color: "#8B5CF6",
        path: "/attendance/holidays"
    }
];

export default function QuickActions() {

    const navigate = useNavigate();

    return (

        <div className="quick-actions">

            {actions.map((action, index) => (

                <div
                    key={index}
                    className="quick-action-card"
                    onClick={() => navigate(action.path)}
                >

                    <div
                        className="quick-action-icon"
                        style={{ background: action.color }}
                    >
                        {action.icon}
                    </div>

                    <h4>{action.title}</h4>

                </div>

            ))}

        </div>

    );

}