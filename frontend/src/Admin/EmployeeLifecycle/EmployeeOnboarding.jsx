import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowBackRounded as BackIcon,
  DownloadRounded as DownloadIcon,
  PictureAsPdfRounded as PdfIcon,
} from "@mui/icons-material";
import { Alert, Box, Button, Step, StepLabel, Stepper, TextField, Typography } from "@mui/material";
import { jsPDF } from "jspdf";
import "./EmployeeLifecycle.css";

const initialValues = { firstName: "", lastName: "", address: "", joiningDate: "", designation: "", ctc: "" };

const formatDate = (value) => value
  ? new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })
  : "[Joining date]";

const formatCtc = (value) => value
  ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(value))
  : "[Annual CTC]";

export default function EmployeeOnboarding() {
  const navigate = useNavigate();
  const [values, setValues] = useState(initialValues);
  const [error, setError] = useState("");
  const [activeStep, setActiveStep] = useState(0);
  const [offerGenerated, setOfferGenerated] = useState(false);

  const fullName = useMemo(() => `${values.firstName} ${values.lastName}`.trim() || "[Employee name]", [values.firstName, values.lastName]);
  const update = (field) => (event) => setValues((current) => ({ ...current, [field]: event.target.value }));

  const validateDetails = () => {
    if (Object.values(values).some((value) => !String(value).trim()) || !Number.isFinite(Number(values.ctc)) || Number(values.ctc) <= 0) {
      setError("Complete all fields and enter a positive annual CTC before continuing.");
      return false;
    }
    setError("");
    return true;
  };

  const downloadOfferLetter = () => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const left = 22;
    const pageWidth = doc.internal.pageSize.getWidth();
    const bodyWidth = pageWidth - left * 2;
    const body = (text, y, options = {}) => {
      const lines = doc.splitTextToSize(text, bodyWidth);
      doc.text(lines, left, y, options);
      return y + lines.length * 6;
    };

    doc.setFillColor(30, 64, 175);
    doc.rect(0, 0, pageWidth, 36, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("AMNIKON TECHNOLOGIES", left, 17);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("OFFER OF EMPLOYMENT", left, 27);

    doc.setTextColor(35, 45, 65);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    let y = 52;
    doc.text(`Date: ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}`, left, y);
    y += 13;
    y = body(`To, ${fullName}`, y);
    y = body(values.address, y);
    y += 8;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text("Subject: Offer of Employment", left, y);
    y += 13;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    y = body(`Dear ${values.firstName},`, y);
    y += 4;
    y = body(`We are pleased to offer you the position of ${values.designation} at Amnikon Technologies. Your expected date of joining is ${formatDate(values.joiningDate)}.`, y);
    y += 4;
    y = body(`Your annual Cost to Company (CTC) will be ${formatCtc(values.ctc)}. The detailed compensation structure and applicable terms will be shared by the company as part of your employment documentation.`, y);
    y += 4;
    y = body("Please confirm your acceptance of this offer and coordinate with the HR team regarding the documents required to complete your onboarding.", y);
    y += 6;
    y = body("We look forward to welcoming you to the team.", y);
    y += 15;
    y = body("Sincerely,", y);
    y += 12;
    doc.setFont("helvetica", "bold");
    y = body("Human Resources", y);
    doc.setFont("helvetica", "normal");
    body("Amnikon Technologies", y);

    doc.save(`Offer-Letter-${fullName.replace(/[^a-z0-9]+/gi, "-")}.pdf`);
    setOfferGenerated(true);
    setActiveStep(2);
  };

  return (
    <Box className="employee-lifecycle-page onboarding-page">
      <Button className="lifecycle-back-button" startIcon={<BackIcon />} onClick={() => navigate("/employee-lifecycle")}>
        Employee Lifecycle
      </Button>
      <header className="lifecycle-header onboarding-header">
        <div>
          <Typography variant="h4" component="h1">Employee Onboarding</Typography>
          <Typography color="text.secondary">Add the new hire’s details and generate an offer letter PDF.</Typography>
        </div>
        <PdfIcon className="lifecycle-header-icon" aria-hidden="true" />
      </header>

      <Stepper activeStep={activeStep} alternativeLabel className="lifecycle-stepper">
        {["Employee details", "Review offer", "Offer prepared"].map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
      </Stepper>

      {error && <Alert severity="error" role="alert" sx={{ mb: 2 }}>{error}</Alert>}

      {activeStep === 0 && <div className="onboarding-layout onboarding-layout-single">
        <section className="onboarding-form-panel">
          <Typography variant="h6" component="h2">Employee details</Typography>
          <Typography color="text.secondary" className="onboarding-panel-description">All fields are required for the offer letter.</Typography>
          <div className="onboarding-form-grid">
            <TextField label="First name" required value={values.firstName} onChange={update("firstName")} autoComplete="given-name" inputProps={{ maxLength: 80 }} slotProps={{ inputLabel: { shrink: true } }} />
            <TextField label="Last name" required value={values.lastName} onChange={update("lastName")} autoComplete="family-name" inputProps={{ maxLength: 80 }} slotProps={{ inputLabel: { shrink: true } }} />
            <TextField label="Address" required value={values.address} onChange={update("address")} multiline minRows={3} inputProps={{ maxLength: 500 }} className="onboarding-form-wide" autoComplete="street-address" slotProps={{ inputLabel: { shrink: true } }} />
            <TextField label="Joining date" required type="date" value={values.joiningDate} onChange={update("joiningDate")} slotProps={{ inputLabel: { shrink: true } }} />
            <TextField label="Designation" required value={values.designation} onChange={update("designation")} autoComplete="organization-title" inputProps={{ maxLength: 120 }} slotProps={{ inputLabel: { shrink: true } }} />
            <TextField label="Annual CTC (INR)" required type="number" value={values.ctc} onChange={update("ctc")} inputProps={{ min: 1, step: 1000 }} helperText="Enter the annual cost to company in rupees." className="onboarding-form-wide" slotProps={{ inputLabel: { shrink: true } }} />
          </div>
          <Button variant="contained" size="large" endIcon={<DownloadIcon />} onClick={() => validateDetails() && setActiveStep(1)}>
            Review offer letter
          </Button>
        </section>
        <aside className="onboarding-process-aside">
          <Typography variant="h6" component="h2">Onboarding workflow</Typography>
          <ol>
            <li><b>Enter employee details</b><span>Name, address, joining date, designation, and CTC.</span></li>
            <li><b>Review the offer</b><span>Confirm that the details are correct before preparing the PDF.</span></li>
            <li><b>Download the offer</b><span>Generate a PDF copy for the candidate.</span></li>
          </ol>
        </aside>
      </div>}

      {activeStep === 1 && <div className="onboarding-layout">
        <section className="onboarding-review-panel">
          <Typography variant="h6" component="h2">Review employee details</Typography>
          <Typography color="text.secondary">Check the information below before generating the offer letter.</Typography>
          <div className="offer-preview-facts onboarding-review-facts">
            <div><span>Employee</span><b>{fullName}</b></div>
            <div><span>Address</span><b>{values.address}</b></div>
            <div><span>Joining date</span><b>{formatDate(values.joiningDate)}</b></div>
            <div><span>Designation</span><b>{values.designation}</b></div>
            <div><span>Annual CTC</span><b>{formatCtc(values.ctc)}</b></div>
          </div>
          <div className="onboarding-actions">
            <Button variant="outlined" onClick={() => setActiveStep(0)}>Back to details</Button>
            <Button variant="contained" startIcon={<DownloadIcon />} onClick={downloadOfferLetter}>Generate offer letter PDF</Button>
          </div>
        </section>
        <aside className="offer-preview-panel" aria-label="Offer letter preview">
          <div className="offer-preview-brand">
            <Typography variant="subtitle1" component="strong">AMNIKON TECHNOLOGIES</Typography>
            <Typography variant="overline">OFFER OF EMPLOYMENT</Typography>
          </div>
          <div className="offer-preview-content">
            <Typography variant="body2" color="text.secondary">Date: {new Date().toLocaleDateString("en-IN")}</Typography>
            <Typography variant="h6" component="h2">Offer of Employment</Typography>
            <div className="offer-preview-recipient">
              <Typography><b>To:</b> {fullName}</Typography>
              <Typography color="text.secondary">{values.address || "[Employee address]"}</Typography>
            </div>
            <Typography>Dear {values.firstName || "[First name]"},</Typography>
            <Typography color="text.secondary">We are pleased to offer you the position of <b>{values.designation || "[Designation]"}</b> at Amnikon Technologies, with an expected joining date of <b>{formatDate(values.joiningDate)}</b>.</Typography>
            <div className="offer-preview-facts">
              <div><span>Candidate</span><b>{fullName}</b></div>
              <div><span>Joining date</span><b>{formatDate(values.joiningDate)}</b></div>
              <div><span>Annual CTC</span><b>{formatCtc(values.ctc)}</b></div>
            </div>
            <Typography color="text.secondary">We look forward to welcoming you to the team.</Typography>
            <Typography>Sincerely,<br /><b>Human Resources</b><br />Amnikon Technologies</Typography>
          </div>
        </aside>
      </div>}

      {activeStep === 2 && offerGenerated && <section className="onboarding-complete-panel">
        <div className="onboarding-complete-icon"><DownloadIcon /></div>
        <Typography variant="h5" component="h2">Offer letter prepared</Typography>
        <Typography color="text.secondary">The PDF was downloaded. This local workflow has not yet created an employee record or saved this offer to SPARK.</Typography>
        <div className="onboarding-actions">
          <Button variant="outlined" onClick={() => setActiveStep(1)}>Review offer</Button>
          <Button variant="contained" startIcon={<DownloadIcon />} onClick={downloadOfferLetter}>Download PDF again</Button>
        </div>
      </section>}
    </Box>
  );
}
