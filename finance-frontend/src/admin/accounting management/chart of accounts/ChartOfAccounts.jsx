import DraftModule from "../../shared/DatabaseModule";
import { moduleConfigs } from "../../shared/moduleConfigs";
import AccountForm from "./AccountForm";
import AccountDetails from "./AccountDetails";
import "./ChartOfAccounts.css";

export default function ChartOfAccounts() {
  return <DraftModule config={moduleConfigs.chart} Form={AccountForm} Details={AccountDetails} />;
}

