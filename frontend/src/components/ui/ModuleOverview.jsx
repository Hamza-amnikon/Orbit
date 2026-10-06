import { Link } from "react-router-dom";
import HomeRounded from "@mui/icons-material/HomeRounded";
import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";
import { useAuth } from "../../context/AuthContext";
import "./ModuleOverview.css";

export default function ModuleOverview({ title, description, modules }) {
  const { hasPermission } = useAuth();
  const visibleModules = modules.filter((module) =>
    hasPermission(module.path || module.route, "view"),
  );

  return (
    <section className="module-overview">
      <div className="module-overview-decoration" aria-hidden="true" />
      <nav className="module-overview-breadcrumb" aria-label="Breadcrumb">
        <Link to="/dashboard" aria-label="Dashboard"><HomeRounded /></Link>
        <span aria-hidden="true">/</span>
        <span>{title}</span>
      </nav>
      <header className="module-overview-header">
        <h1>{title}</h1>
        <p>{description}</p>
      </header>
      {visibleModules.length ? (
        <div className="module-overview-grid">
          {visibleModules.map((module) => (
            <Link
              key={module.path || module.route}
              to={module.path || module.route}
              className="module-overview-card"
              style={{ "--module-color": module.color }}
            >
              <span className="module-overview-icon" aria-hidden="true">{module.icon}</span>
              <h2>{module.title}</h2>
              <p>{module.description}</p>
              <span className="module-overview-footer">
                <span>Open Module</span>
                <span className="module-overview-arrow" aria-hidden="true"><ArrowForwardRounded /></span>
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="module-overview-empty">
          <h2>No modules available</h2>
          <p>You do not currently have permission to access these modules.</p>
        </div>
      )}
    </section>
  );
}
