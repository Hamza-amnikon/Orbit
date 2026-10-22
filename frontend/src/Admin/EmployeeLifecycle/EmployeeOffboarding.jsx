import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowBackRounded as BackIcon,
  CheckCircleOutlineRounded as CheckIcon,
  DownloadRounded as DownloadIcon,
  ExitToAppRounded as ExitIcon,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from "@mui/material";
import { jsPDF } from "jspdf";
import "./EmployeeLifecycle.css";

const exitTasks = [
  ["handover", "Complete knowledge and work handover"],
  ["assets", "Return company assets and equipment"],
  ["access", "Revoke system and building access"],
  ["finance", "Complete finance and expense clearance"],
  ["hr", "Complete HR exit discussion and documentation"],
];

export default function EmployeeOffboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [completed, setCompleted] = useState(false);
  const [employee, setEmployee] = useState({ name: "", employeeId: "", designation: "", lastWorkingDay: "", reason: "" });
  const [tasks, setTasks] = useState({});
  const updateEmployee = (field) => (event) => setEmployee((current) => ({ ...current, [field]: event.target.value }));

  const continueToClearance = () => {
    if (Object.values(employee).some((value) => !value.trim())) {
      setError("Complete all employee and exit details before continuing.");
      return;
    }
    setError("");
    setStep(1);
  };

  const continueToReview = () => {
    if (exitTasks.some(([key]) => !tasks[key])) {
      setError("Confirm each clearance item before reviewing the exit plan.");
      return;
    }
    setError("");
    setStep(2);
  };

  const dateLabel = employee.lastWorkingDay
    ? new Date(`${employee.lastWorkingDay}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })
    : "";

  const downloadExitPlan = () => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const left = 22;
    const width = doc.internal.pageSize.getWidth() - left * 2;
    const addParagraph = (text, y) => {
      const lines = doc.splitTextToSize(text, width);
      doc.text(lines, left, y);
      return y + lines.length * 6;
    };

    doc.setFillColor(30, 64, 175);
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 36, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(19);
    doc.text("AMNIKON TECHNOLOGIES", left, 17);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("EMPLOYEE EXIT PLAN", left, 27);

    doc.setTextColor(35, 45, 65);
    doc.setFontSize(11);
    let y = 52;
    doc.setFont("helvetica", "bold");
    doc.text("Employee details", left, y);
    doc.setFont("helvetica", "normal");
    y += 9;
    y = addParagraph(`Employee: ${employee.name}`, y);
    y = addParagraph(`Employee ID: ${employee.employeeId}`, y);
    y = addParagraph(`Designation: ${employee.designation}`, y);
    y = addParagraph(`Last working day: ${dateLabel}`, y);
    y = addParagraph(`Reason for leaving: ${employee.reason}`, y);
    y += 8;
    doc.setFont("helvetica", "bold");
    doc.text("Exit clearance checklist", left, y);
    doc.setFont("helvetica", "normal");
    y += 9;
    exitTasks.forEach(([, label]) => {
      y = addParagraph(`[x] ${label}`, y);
    });
    y += 8;
    doc.setFontSize(9);
    addParagraph("Prepared in SPARK Employee Lifecycle. This PDF is a checklist record; it does not itself revoke access, process final pay, or update the employee record.", y);

    doc.save(`Exit-Plan-${employee.employeeId.replace(/[^a-z0-9]+/gi, "-")}.pdf`);
    setCompleted(true);
  };

  return (
    <Box className="employee-lifecycle-page onboarding-page">
      <Button className="lifecycle-back-button" startIcon={<BackIcon />} onClick={() => navigate("/employee-lifecycle")}>
        Employee Lifecycle
      </Button>
      <header className="lifecycle-header onboarding-header">
        <div>
          <Typography variant="h4" component="h1">Employee Offboarding</Typography>
          <Typography color="text.secondary">Prepare an employee exit plan and track the required clearances.</Typography>
        </div>
        <ExitIcon className="lifecycle-header-icon" aria-hidden="true" />
      </header>

      <Stepper activeStep={step} alternativeLabel className="lifecycle-stepper">
        {["Exit details", "Clearance", "Review plan"].map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
      </Stepper>

      {error && <Alert severity="error" role="alert" sx={{ mb: 2 }}>{error}</Alert>}

      {completed ? (
        <section className="onboarding-complete-panel">
          <div className="onboarding-complete-icon"><CheckIcon /></div>
          <Typography variant="h5" component="h2">Exit plan prepared</Typography>
          <Typography color="text.secondary">The exit plan PDF was downloaded for {employee.name}. This local workflow has not saved the plan to SPARK.</Typography>
          <Button variant="contained" startIcon={<DownloadIcon />} onClick={downloadExitPlan}>Download exit plan again</Button>
          <Button variant="outlined" onClick={() => navigate("/employee-lifecycle")}>Back to Employee Lifecycle</Button>
        </section>
      ) : (
        <div className="offboarding-panel">
          {step === 0 && <section className="onboarding-form-panel">
            <Typography variant="h6" component="h2">Employee and exit details</Typography>
            <Typography color="text.secondary" className="onboarding-panel-description">Enter the employee details to start the exit plan.</Typography>
            <div className="onboarding-form-grid">
              <TextField label="Employee name" required value={employee.name} onChange={updateEmployee("name")} inputProps={{ maxLength: 160 }} slotProps={{ inputLabel: { shrink: true } }} />
              <TextField label="Employee ID" required value={employee.employeeId} onChange={updateEmployee("employeeId")} inputProps={{ maxLength: 60 }} slotProps={{ inputLabel: { shrink: true } }} />
              <TextField label="Designation" required value={employee.designation} onChange={updateEmployee("designation")} inputProps={{ maxLength: 120 }} slotProps={{ inputLabel: { shrink: true } }} />
              <TextField label="Last working day" required type="date" value={employee.lastWorkingDay} onChange={updateEmployee("lastWorkingDay")} slotProps={{ inputLabel: { shrink: true } }} />
              <TextField label="Reason for leaving" required value={employee.reason} onChange={updateEmployee("reason")} multiline minRows={3} inputProps={{ maxLength: 500 }} className="onboarding-form-wide" slotProps={{ inputLabel: { shrink: true } }} />
            </div>
            <Button variant="contained" onClick={continueToClearance}>Continue to clearance</Button>
          </section>}

          {step === 1 && <section className="onboarding-form-panel">
            <Typography variant="h6" component="h2">Exit clearance checklist</Typography>
            <Typography color="text.secondary" className="onboarding-panel-description">Confirm each item after it has been completed by the responsible team.</Typography>
            <div className="offboarding-checklist">
              {exitTasks.map(([key, label]) => <FormControlLabel key={key} control={<Checkbox checked={Boolean(tasks[key])} onChange={(event) => setTasks((current) => ({ ...current, [key]: event.target.checked }))} />} label={label} />)}
            </div>
            <div className="onboarding-actions">
              <Button variant="outlined" onClick={() => setStep(0)}>Back to exit details</Button>
              <Button variant="contained" onClick={continueToReview}>Review exit plan</Button>
            </div>
          </section>}

          {step === 2 && <section className="onboarding-review-panel">
            <Typography variant="h6" component="h2">Review exit plan</Typography>
            <Typography color="text.secondary">Confirm the exit details and completed clearance checklist.</Typography>
            <div className="offer-preview-facts onboarding-review-facts">
              <div><span>Employee</span><b>{employee.name}</b></div>
              <div><span>Employee ID</span><b>{employee.employeeId}</b></div>
              <div><span>Designation</span><b>{employee.designation}</b></div>
              <div><span>Last working day</span><b>{dateLabel}</b></div>
              <div><span>Reason</span><b>{employee.reason}</b></div>
            </div>
            <Typography variant="subtitle1" component="h3">Clearances</Typography>
            <ul className="offboarding-review-list">
              {exitTasks.map(([key, label]) => <li key={key}><CheckIcon aria-hidden="true" />{label}</li>)}
            </ul>
            <div className="onboarding-actions">
              <Button variant="outlined" onClick={() => setStep(1)}>Back to checklist</Button>
              <Button variant="contained" startIcon={<DownloadIcon />} onClick={downloadExitPlan}>Download exit plan PDF</Button>
            </div>
          </section>}
        </div>
      )}
    </Box>
  );
}
