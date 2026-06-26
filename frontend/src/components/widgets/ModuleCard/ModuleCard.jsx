import "./ModuleCard.css";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

function ModuleCard({

    title,
    description,
    icon,
    color,
    onClick 

}){

    return(

        <div   className="module-card"
               onClick={() => {
                {
              onClick();
            }
        }}>
            
            <div
                className="module-icon"
                style={{background:color}}
            >

                {icon}

            </div>

            
<h3>{title}</h3>
            <p>{description}</p>

            <button>

                <ArrowForwardRoundedIcon/>

            </button>

        </div>

    );

}

export default ModuleCard;