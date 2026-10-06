import ModuleOverview from "../../components/ui/ModuleOverview";
import DashboardCustomizeIcon from "@mui/icons-material/DashboardCustomize";
import GroupIcon from "@mui/icons-material/Group";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import PercentIcon from "@mui/icons-material/Percent";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import HistoryIcon from "@mui/icons-material/History";
import BarChartIcon from "@mui/icons-material/BarChart";
const payrollModules = [
        {
            title: "Payroll Dashboard",
            description:
                "View payroll overview, summary, statistics and insights.",
            icon: <DashboardCustomizeIcon />,
            color: "#2563eb",
            route: "/payroll/dashboard",
        },
        {
            title: "Employees Payroll",
            description:
                "Manage employee salaries, assign payroll and salary structures.",
            icon: <GroupIcon />,
            color: "#16a34a",
            route: "/payroll/employees",
        },
        {
            title: "Salary Components",
            description:
                "Manage earnings, allowances, bonuses and other salary components.",
            icon: <AccountBalanceWalletIcon />,
            color: "#9333ea",
            route: "/payroll/salary-components",
        },
        {
            title: "Deductions",
            description:
                "Manage tax, PF, ESI, loan and other deduction components.",
            icon: <PercentIcon />,
            color: "#ea580c",
            route: "/payroll/deductions",
        },
        {
            title: "Payslip Templates",
            description:
                "Create and manage payslip templates and layouts.",
            icon: <ReceiptLongIcon />,
            color: "#d946ef",
            route: "/payroll/payslip-templates",
        },
        {
            title: "Payroll Process",
            description:
                "Run payroll, calculate salaries and generate payslips.",
            icon: <CurrencyRupeeIcon />,
            color: "#0891b2",
            route: "/payroll/process",
        },
        {
            title: "Payroll History",
            description:
                "View payroll run history, records and details.",
            icon: <HistoryIcon />,
            color: "#0d9488",
            route: "/payroll/history",
        },
        {
            title: "Payroll Reports",
            description:
                "View and export payroll reports and analytics.",
            icon: <BarChartIcon />,
            color: "#eab308",
            route: "/payroll/reports",
        },
        {
            title: "My Payslip",
            description:
                "View and export payroll reports and analytics.",
            icon: <BarChartIcon />,
            color: "#030303",
            route: "/employee/payroll",
        },
    ];


export default function Payroll() {
  return <ModuleOverview title="Payroll Management" description="Manage payroll processing, salary structures, deductions, and employee payments." modules={payrollModules} />;
}
