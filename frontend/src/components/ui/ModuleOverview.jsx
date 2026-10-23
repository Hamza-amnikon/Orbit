import { Link } from "react-router-dom";
import HomeRounded from "@mui/icons-material/HomeRounded";
import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";
import { useAuth } from "../../context/AuthContext";
import "./ModuleOverview.css";
import { Box as MuiLayoutBox, Typography as MuiText } from "@mui/material";

export default function ModuleOverview({ title, description, modules }) {
  const { hasPermission } = useAuth();
  const visibleModules = modules.filter((module) =>
    hasPermission(module.permissionPath || module.path || module.route, "view"),
  );

  return (
    <MuiLayoutBox className="module-overview" component="section">
      <MuiLayoutBox className="module-overview-decoration" aria-hidden="true"  component="div"/>
      <MuiLayoutBox className="module-overview-breadcrumb" aria-label="Breadcrumb" component="nav">
        <Link to="/dashboard" aria-label="Dashboard"><HomeRounded /></Link>
        <MuiText aria-hidden="true" component="span" variant="inherit">/</MuiText>
        <MuiText component="span" variant="inherit">{title}</MuiText>
      </MuiLayoutBox>
      <MuiLayoutBox className="module-overview-header" component="header">
        <MuiText component="h1" variant="h4">{title}</MuiText>
        <MuiText component="p" variant="body1">{description}</MuiText>
      </MuiLayoutBox>
      {visibleModules.length ? (
        <MuiLayoutBox className="module-overview-grid" component="div">
          {visibleModules.map((module) => (
            <Link
              key={module.path || module.route}
              to={module.path || module.route}
              className="module-overview-card"
              style={{ "--module-color": module.color }}
            >
              <MuiText className="module-overview-icon" aria-hidden="true" component="span" variant="inherit">{module.icon}</MuiText>
              <MuiText component="h2" variant="h5">{module.title}</MuiText>
              <MuiText component="p" variant="body1">{module.description}</MuiText>
              <MuiText className="module-overview-footer" component="span" variant="inherit">
                <MuiText component="span" variant="inherit">Open Module</MuiText>
                <MuiText className="module-overview-arrow" aria-hidden="true" component="span" variant="inherit"><ArrowForwardRounded /></MuiText>
              </MuiText>
            </Link>
          ))}
        </MuiLayoutBox>
      ) : (
        <MuiLayoutBox className="module-overview-empty" component="div">
          <MuiText component="h2" variant="h5">No modules available</MuiText>
          <MuiText component="p" variant="body1">You do not currently have permission to access these modules.</MuiText>
        </MuiLayoutBox>
      )}
    </MuiLayoutBox>
  );
}
