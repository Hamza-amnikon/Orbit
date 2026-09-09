import "./StatsGrid.css";

import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import EventBusyRoundedIcon from "@mui/icons-material/EventBusyRounded";
import ConfirmationNumberRoundedIcon from "@mui/icons-material/ConfirmationNumberRounded";
import PaidRoundedIcon from "@mui/icons-material/PaidRounded";

import StatsCard from "../StatsCard/StatsCard";


function StatsGrid() {

    const stats = [

        {
            title: "Employees",
            value: "256",
            color: "#2563eb",
            icon: <GroupsRoundedIcon />,
            route: "/employees"
        },

        {
            title: "On Leave",
            value: "18",
            color: "#16a34a",
            icon: <EventBusyRoundedIcon />,
            route: "/leave"
        },

        {
            title: "Open Tickets",
            value: "32",
            color: "#ea580c",
            icon: <ConfirmationNumberRoundedIcon />,
            route: "/tickets"
        },

        {
            title: "Pending Salaries",
            value: "5",
            color: "#9333ea",
            icon: <PaidRoundedIcon />,
            route: "/payroll"
        }

    ];


    return (

        <div className="stats-grid">

            {
                stats.map((stat) => (

                    <StatsCard
                        key={stat.title}
                        title={stat.title}
                        value={stat.value}
                        color={stat.color}
                        icon={stat.icon}
                        route={stat.route}
                    />

                ))
            }

        </div>

    );

}


export default StatsGrid;