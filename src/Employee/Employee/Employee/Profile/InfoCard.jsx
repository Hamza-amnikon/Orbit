import "./Profile.css";

function InfoCard({ title, children }) {
    return (
        <div className="info-card">

            <div className="info-card-header">
                <h3>{title}</h3>
            </div>

            <div className="info-card-body">
                {children}
            </div>

        </div>
    );
}

export default InfoCard;