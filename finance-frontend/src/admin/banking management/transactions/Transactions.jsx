import DraftModule from "../../shared/DatabaseModule";
import { moduleConfigs } from "../../shared/moduleConfigs";
import TransactionForm from "./TransactionForm";
import TransactionDetails from "./TransactionDetails";
import "./Transactions.css";

export default function Transactions() {
  return <DraftModule config={moduleConfigs.transactions} Form={TransactionForm} Details={TransactionDetails} />;
}

