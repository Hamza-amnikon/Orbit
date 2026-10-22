import { useNavigate } from "react-router-dom";
import {
  ArrowForwardRounded as ArrowIcon,
  AssignmentIndRounded as OnboardingIcon,
  ExitToAppRounded as OffboardingIcon,
  WorkHistoryRounded as LifecycleIcon,
} from "@mui/icons-material";
import { Box, Button, Chip, Typography } from "@mui/material";
import "./EmployeeLifecycle.css";

export default function EmployeeLifecycle() {
  const navigate = useNavigate();

  return (
    <Box className="employee-lifecycle-page">
      <header className="lifecycle-header">
        <div>
          <Typography variant="h4" component="h1">Employee Lifecycle</Typography>
          <Typography color="text.secondary">Manage employee onboarding and offboarding workflows.</Typography>
        </div>
        <LifecycleIcon className="lifecycle-header-icon" aria-hidden="true" />
      </header>

      <section className="lifecycle-cards" aria-label="Employee lifecycle workflows">
        <article className="lifecycle-card lifecycle-card-onboarding">
          <span className="lifecycle-card-icon"><OnboardingIcon /></span>
          <Chip label="Available" size="small" />
          <Typography variant="h5" component="h2">Onboarding</Typography>
          <Typography color="text.secondary">Enter a new hire’s details and prepare a downloadable offer letter PDF.</Typography>
          <Button variant="contained" endIcon={<ArrowIcon />} onClick={() => navigate("/employee-lifecycle/onboarding")}>
            Start onboarding
          </Button>
        </article>

        <article className="lifecycle-card lifecycle-card-offboarding">
          <span className="lifecycle-card-icon"><OffboardingIcon /></span>
          <Chip label="Ready" color="success" size="small" />
          <Typography variant="h5" component="h2">Offboarding</Typography>
          <Typography color="text.secondary">A guided exit workflow for employee transitions, clearances, and final documentation.</Typography>
          <Button variant="outlined" endIcon={<ArrowIcon />} onClick={() => navigate("/employee-lifecycle/offboarding")}>
            Start offboarding
          </Button>
        </article>
      </section>
    </Box>
  );
}
