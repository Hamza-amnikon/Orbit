import "./DashboardCard.css";

export default function DashboardCard({
    title,
    value,
    subtitle,
    icon,
    color
}) {
    return (
        <div className="dashboard-card">

            <div
                className="dashboard-card-icon"
                style={{ backgroundColor: color }}
            >
                {icon}
            </div>

            <div className="dashboard-card-content">
                <span>{title}</span>
                <h2>{value}</h2>
                <p>{subtitle}</p>
            </div>

        </div>
    );
}