import DraftModule from "../../shared/DatabaseModule";
import { moduleConfigs } from "../../shared/moduleConfigs";
import BankAccountForm from "./BankAccountForm";
import BankAccountDetails from "./BankAccountDetails";
import "./BankAccounts.css";

export default function BankAccounts() {
  return <DraftModule config={moduleConfigs.accounts} Form={BankAccountForm} Details={BankAccountDetails} />;
}

