import "./DashboardCard.css";
import { Box as MuiLayoutBox, Typography as MuiText } from "@mui/material";

export default function DashboardCard({
  title,
  value,
  subtitle,
  icon,
  color,
  onClick,
  selected = false,
}) {
  return (
    <MuiLayoutBox
      className={`dashboard-card${onClick ? " dashboard-card-interactive" : ""}${selected ? " dashboard-card-selected" : ""}`}
      component={onClick ? "button" : "div"}
      type={onClick ? "button" : undefined}
      onClick={onClick}
      aria-pressed={onClick ? selected : undefined}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >

      <MuiLayoutBox
        className="dashboard-card-icon"
        style={{ backgroundColor: color }}
       component="div">
        {icon}
      </MuiLayoutBox>

      <MuiLayoutBox className="attendance-summary-content" component="div">
        <MuiLayoutBox className="attendance-summary-heading" component="div">
          <MuiText component="h4" variant="subtitle1">{title}</MuiText>
          <MuiText component="strong" variant="inherit">{value}</MuiText>
        </MuiLayoutBox>
        <MuiText className="attendance-summary-subtitle" component="span" variant="inherit">{subtitle}</MuiText>
      </MuiLayoutBox>

    </MuiLayoutBox>
  );
}
