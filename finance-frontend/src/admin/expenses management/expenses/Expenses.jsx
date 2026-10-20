import DraftModule from "../../shared/DatabaseModule";
import { moduleConfigs } from "../../shared/moduleConfigs";
import ExpenseForm from "./ExpenseForm";
import ExpenseDetails from "./ExpenseDetails";
import "./Expenses.css";

export default function Expenses() {
  return <DraftModule config={moduleConfigs.expenses} Form={ExpenseForm} Details={ExpenseDetails} />;
}

