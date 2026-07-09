import "./StatsCard.css";

function StatsCard({

    title,

    value,

    icon,

    color

}){

    return(

        <div className="stats-card">

            <div
                className="stats-icon"
                style={{background:color}}
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