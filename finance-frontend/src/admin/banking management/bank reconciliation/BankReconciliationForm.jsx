import ModuleForm from "../../shared/ModuleForm";
import { Alert } from "@mui/material";
import { money } from "../../../live/data";
export default function BankReconciliationForm(props) {
  const cents = name => Math.round(Number(props.value[name] || 0) * 100);
  const difference = (cents("statementBalance") + cents("outstandingDeposits") - cents("outstandingWithdrawals") - cents("bookBalance")) / 100;
  return <><ModuleForm {...props} /><Alert severity={difference === 0 ? "success" : "warning"}>
    Adjusted statement minus book balance: {money(difference)}. Draft comparison only; transactions are not matched or posted.
  </Alert></>;
}
