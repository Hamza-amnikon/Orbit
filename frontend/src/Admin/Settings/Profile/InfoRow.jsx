import "./Profile.css";

function InfoRow({ label, value }) {
    return (

        <div className="info-row">

            <span className="info-label">
                {label}
            </span>

            <span className="info-value">
                {value}
            </span>

        </div>

    );
}

export default InfoRow;