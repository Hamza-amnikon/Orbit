import "./DashboardCard.css";

export default function DashboardCard({
  title,
  value,
  subtitle,
  icon,
  color,
}) {
  return (
    <div className="dashboard-card">

      <div
        className="dashboard-card-icon"
        style={{ backgroundColor: color }}
      >
        {icon}
      </div>

      <div className="dashboard-card-title">
        <h4>{title}</h4>
      </div>

      <div className="dashboard-card-value">
        {value}
      </div>

      <div className="dashboard-card-subtitle">
        {subtitle}
      </div>

    </div>
  );
}