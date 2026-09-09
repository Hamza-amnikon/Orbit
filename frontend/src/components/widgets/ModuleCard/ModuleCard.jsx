import "./ModuleCard.css";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

import { useAuth } from "../../../context/AuthContext";


function ModuleCard({

    title,
    description,
    icon,
    color,
    route,
    onClick

}) {

    const { hasPermission } = useAuth();


    // If this card has a route and the user
    // does not have View permission, hide it.
    if (route && !hasPermission(route, "view")) {
        return null;
    }


    return (

        <div
            className="module-card"
            onClick={() => {

                if (onClick) {
                    onClick();
                }

            }}
        >

            <div
                className="module-icon"
                style={{ background: color }}
            >

                {icon}

            </div>


            <h3>{title}</h3>

            <p>{description}</p>


            <button>

                <ArrowForwardRoundedIcon />

            </button>

        </div>

    );

}


export default ModuleCard;