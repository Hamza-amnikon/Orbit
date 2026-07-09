import "./StatsGrid.css";

import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import EventBusyRoundedIcon from "@mui/icons-material/EventBusyRounded";
import ConfirmationNumberRoundedIcon from "@mui/icons-material/ConfirmationNumberRounded";
import PaidRoundedIcon from "@mui/icons-material/PaidRounded";

import StatsCard from "../StatsCard/StatsCard";

function StatsGrid(){

    return(

        <div className="stats-grid">

            <StatsCard
                title="Employees"
                value="256"
                color="#2563eb"
                icon={<GroupsRoundedIcon />}
            />

            <StatsCard
                title="On Leave"
                value="18"
                color="#16a34a"
                icon={<EventBusyRoundedIcon />}
            />

            <StatsCard
                title="Open Tickets"
                value="32"
                color="#ea580c"
                icon={<ConfirmationNumberRoundedIcon />}
            />

            <StatsCard
                title="Pending Salaries"
                value="5"
                color="#9333ea"
                icon={<PaidRoundedIcon />}
            />

        </div>

    );

}

export default StatsGrid;