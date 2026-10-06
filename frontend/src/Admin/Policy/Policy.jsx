import ModuleOverview from "../../components/ui/ModuleOverview";
import PolicyRoundedIcon from "@mui/icons-material/PolicyRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
const modules = [
  { title: "Policy Dashboard", description: "Create, edit, publish and manage company policies.", path: "/policy-management", icon: <PolicyRoundedIcon />, color: "#2563eb" },
  { title: "Company Policies", description: "View published company policies, guidelines and important information.", path: "/company-policies", icon: <DescriptionRoundedIcon />, color: "#16a34a" },
];
export default function Policy() {
  return <ModuleOverview title="Policy Management" description="Manage company policies, guidelines, acknowledgements and policy history." modules={modules} />;
}
