import ModuleOverview from "../../../components/ui/ModuleOverview";
import { DashboardRounded, FactCheckRounded, HistoryRounded, CategoryRounded, AccountBalanceWalletRounded, PolicyRounded, AssessmentRounded } from "@mui/icons-material";
const cards = [
    {
        title: "Leave Dashboard",
        description: "View leave summary, statistics and approvals.",
        icon: <DashboardRounded fontSize="large" />,
        color: "#2563eb",
        path: "/leave/overview",
    },
    {
        title: "Leave Requests",
        description: "Review and manage employee leave requests.",
        icon: <FactCheckRounded fontSize="large" />,
        color: "#16a34a",
        path: "/leave/requests",
    },
    {
        title: "Leave Taken History",
        description: "View employees' previous leave records.",
        icon: <HistoryRounded fontSize="large" />,
        color: "#9333ea",
        path: "/leave/history",
    },
    {
        title: "Leave Types",
        description: "Manage annual, sick, casual and other leave types.",
        icon: <CategoryRounded fontSize="large" />,
        color: "#ea580c",
        path: "/leave/types",
    },
    {
        title: "Leave Balance",
        description: "View and manage employee leave balances.",
        icon: <AccountBalanceWalletRounded fontSize="large" />,
        color: "#d00cea",
        path: "/leave/balance",
    },
    {
        title: "Leave Policies",
        description: "Configure company leave rules and policies.",
        icon: <PolicyRounded fontSize="large" />,
        color: "#0ea5e9",
        path: "/leave/policies",
    },
    {
        title: "Leave Reports",
        description: "View leave reports and analytics.",
        icon: <AssessmentRounded fontSize="large" />,
        color: "#14b8a6",
        path: "/leave/reports",
    },
    {
        title: "My Leave",
        description: "View your leave requests and balances.",
        icon: <AssessmentRounded fontSize="large" />,
        color: "#101312",
        path: "/leave/my-leave",
    },
];


export default function LeaveDashboard() {
  return <ModuleOverview title="Leave Management" description="Manage employee leaves, approvals, balances and policies from one place." modules={cards} />;
}
