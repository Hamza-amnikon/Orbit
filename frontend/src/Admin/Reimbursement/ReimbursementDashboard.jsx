import ModuleOverview from "../../components/ui/ModuleOverview";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
const modules = [
  { title: "Reimbursement Requests", description: "Review and manage employee reimbursement requests, receipts, approvals and rejections.", icon: <ReceiptLongRoundedIcon />, color: "#2563eb", path: "/reimbursements/requests" },
  { title: "My Reimbursements", description: "View your reimbursement requests, claim history, receipts and approval status.", icon: <AccountBalanceWalletRoundedIcon />, color: "#16a34a", path: "/reimbursements/my" },
];
export default function ReimbursementDashboard() {
  return <ModuleOverview title="Reimbursement Management" description="Manage employee expenses, claims, approvals and reimbursements from one place." modules={modules} />;
}
