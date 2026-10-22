import { Box, Typography } from "@mui/material";
import EventNoteRounded from "@mui/icons-material/EventNoteRounded";
import BeachAccessRounded from "@mui/icons-material/BeachAccessRounded";
import HistoryRounded from "@mui/icons-material/HistoryRounded";
import { useAuth } from "../../context/AuthContext";
import ModuleOverview from "../../components/ui/ModuleOverview";

const reportModules = [
  {
    title: "Attendance Reports",
    description: "Review attendance summaries and time records.",
    path: "/attendance/reports",
    icon: <EventNoteRounded />,
    color: "#2563eb",
  },
  {
    title: "Leave Reports",
    description: "Review leave requests and usage summaries.",
    path: "/leave/reports",
    icon: <BeachAccessRounded />,
    color: "#16a34a",
  },
  {
    title: "Payroll History",
    description: "Review recorded payroll runs and totals.",
    path: "/payroll/history",
    icon: <HistoryRounded />,
    color: "#9333ea",
  },
];

function Reports() {
  const { hasPermission } = useAuth();

  if (!hasPermission("/reports", "view")) {
    return (
      <Box
        className="reports-access-denied"
        sx={{ px: 3, py: 7, textAlign: "center" }}
      >
        <Typography component="h2" variant="h5">
          Access Denied
        </Typography>
        <Typography component="p" variant="body1">
          You do not have permission to access this page.
        </Typography>
      </Box>
    );
  }

  return (
    <ModuleOverview
      title="Reports"
      description="View organization reporting tools and summaries."
      modules={reportModules}
    />
  );
}

export default Reports;
