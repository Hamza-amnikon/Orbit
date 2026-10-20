import DraftModule from "../../shared/DatabaseModule";
import { moduleConfigs } from "../../shared/moduleConfigs";
import ExpenseClaimForm from "./ExpenseClaimForm";
import ExpenseClaimDetails from "./ExpenseClaimDetails";
import "./ExpenseClaims.css";

export default function ExpenseClaims() {
  return <DraftModule config={moduleConfigs.claims} Form={ExpenseClaimForm} Details={ExpenseClaimDetails} />;
}

