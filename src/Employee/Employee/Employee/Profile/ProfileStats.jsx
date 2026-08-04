import "./Profile.css";

import {
    CalendarMonth,
    EventAvailable,
    WorkHistory,
    AssignmentTurnedIn
} from "@mui/icons-material";

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

        <div className="profile-stats">

            {stats.map((item, index) => (

                <div className="stat-card" key={index}>

                    <div
                        className="stat-icon"
                        style={{ background: item.color }}
                    >
                        {item.icon}
                    </div>

                    <div>

                        <span>{item.title}</span>

                        <h2>{item.value}</h2>

                    </div>

                </div>

            ))}

        </div>

    );

}

export default ProfileStats;