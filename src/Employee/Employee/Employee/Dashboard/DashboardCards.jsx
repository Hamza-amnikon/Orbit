import "./DashboardCards.css";

import AccessTimeFilledIcon from "@mui/icons-material/AccessTimeFilled";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import TimerIcon from "@mui/icons-material/Timer";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";

function DashboardCards() {

    const cards = [
        {
            title: "Today's Attendance",
            value: "Present",
            icon: <AccessTimeFilledIcon />
        },
        {
            title: "Leave Balance",
            value: "12 Days",
            icon: <EventAvailableIcon />
        },
        {
            title: "Working Hours",
            value: "08:30 Hrs",
            icon: <TimerIcon />
        },
        {
            title: "Pending Tasks",
            value: "03",
            icon: <AssignmentTurnedInIcon />
        }
    ];

    return (

        <div className="dashboard-cards">

            {cards.map((card, index) => (

                <div className="dashboard-card" key={index}>

                    <div className="card-icon">
                        {card.icon}
                    </div>

                    <div className="card-content">

                        <h4>{card.title}</h4>

                        <h2>{card.value}</h2>

                    </div>

                </div>

            ))}

        </div>

    );
}

export default DashboardCards;