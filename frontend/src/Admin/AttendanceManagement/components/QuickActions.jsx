import "./QuickActions.css";

import { useNavigate } from "react-router-dom";

import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ScheduleIcon from "@mui/icons-material/Schedule";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import EventIcon from "@mui/icons-material/Event";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { Box as MuiLayoutBox, Typography as MuiText, ButtonBase as MuiActionButton } from "@mui/material";

const actions = [
    {
        title: "Attendance Logs",
        description: "Review daily check-ins and attendance records.",
        icon: <AccessTimeIcon />,
        color: "#2563EB",
        path: "/attendance/logs"
    },
    {
        title: "Shift Management",
        description: "View employee shift assignments.",
        icon: <ScheduleIcon />,
        color: "#10B981",
        path: "/attendance/shifts"
    },

    {
        title: "Holidays",
        description: "Manage upcoming holidays and events.",
        icon: <EventIcon />,
        color: "#8B5CF6",
        path: "/attendance/holidays"
    },
    {
        title: "Reports",
        description: "Explore attendance summaries and reports.",
        icon: <AssignmentTurnedInIcon />,
        color: "#42b996",
        path: "/attendance/reports"
    }
];

export default function QuickActions() {

    const navigate = useNavigate();

    return (

        <MuiLayoutBox className="quick-actions" component="div">

            {actions.map((action) => (

                <MuiActionButton
                    key={action.title}
                    className="quick-action-card"
                    onClick={() => navigate(action.path)}
                    aria-label={`Open ${action.title}`}
                    component="button"
                    type="button">

                    <MuiLayoutBox
                        className="quick-action-icon"
                        style={{ "--quick-action-color": action.color }}
                     component="div">
                        {action.icon}
                    </MuiLayoutBox>

                    <MuiLayoutBox className="quick-action-copy" component="div">
                        <MuiText className="quick-action-title" component="h4" variant="subtitle1">{action.title}</MuiText>
                        <MuiText className="quick-action-description" component="p" variant="body2">{action.description}</MuiText>
                    </MuiLayoutBox>
                    <ArrowForwardRoundedIcon className="quick-action-arrow" />

                </MuiActionButton>

            ))}

        </MuiLayoutBox>

    );

}
