import "./Profile.css";

import {
    CalendarMonth,
    EventAvailable,
    WorkHistory,
    AssignmentTurnedIn
} from "@mui/icons-material";
import { Box as MuiLayoutBox, Typography as MuiText } from "@mui/material";

function ProfileStats() {

    const stats = [
        {
            icon: <EventAvailable />,
            title: "Attendance",
            value: "98%",
            color: "#22c55e"
        },
        {
            icon: <CalendarMonth />,
            title: "Leave Balance",
            value: "12 Days",
            color: "#2563eb"
        },
        {
            icon: <WorkHistory />,
            title: "Experience",
            value: "2 Years",
            color: "#f59e0b"
        },
        {
            icon: <AssignmentTurnedIn />,
            title: "Projects",
            value: "08",
            color: "#8b5cf6"
        }
    ];

    return (

        <MuiLayoutBox className="profile-stats" component="div">

            {stats.map((item, index) => (

                <MuiLayoutBox className="stat-card" key={index} component="div">

                    <MuiLayoutBox
                        className="stat-icon"
                        style={{ background: item.color }}
                     component="div">
                        {item.icon}
                    </MuiLayoutBox>

                    <MuiLayoutBox component="div">

                        <MuiText component="span" variant="inherit">{item.title}</MuiText>

                        <MuiText component="h2" variant="h5">{item.value}</MuiText>

                    </MuiLayoutBox>

                </MuiLayoutBox>

            ))}

        </MuiLayoutBox>

    );

}

export default ProfileStats;