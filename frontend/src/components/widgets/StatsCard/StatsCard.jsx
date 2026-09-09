import "./StatsCard.css";

import { useAuth } from "../../../context/AuthContext";


function StatsCard({

    title,
    value,
    icon,
    color,
    route

}) {

    const { hasPermission } = useAuth();


    // Hide the card when View permission is disabled
    if (route && !hasPermission(route, "view")) {
        return null;
    }


    return (

        <div className="stats-card">

            <div
                className="stats-icon"
                style={{ background: color }}
            >

                {icon}

            </div>

            <div>

                <p>{title}</p>

                <h2>{value}</h2>

            </div>

        </div>

    );

}


export default StatsCard;