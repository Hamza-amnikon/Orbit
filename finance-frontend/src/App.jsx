import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import { FinanceAuth } from "./live/Auth";
import Dashboard from "./live/Dashboard";
import Parties from "./live/Parties";
import Documents from "./live/Documents";
import Payments from "./live/Payments";
import { adminModuleRoutes } from "./admin/moduleRoutes";

export default function App() {
  return <BrowserRouter><FinanceAuth><Routes><Route element={<MainLayout />}>
    <Route path="/" element={<Dashboard />} />
    <Route path="/sales/customers" element={<Parties key="Customer" kind="Customer" />} />
    <Route path="/sales/customers/:id" element={<Parties key="CustomerDetail" kind="Customer" />} />
    <Route path="/purchases/vendors" element={<Parties key="Vendor" kind="Vendor" />} />
    {[["sales/estimates", "Estimate"], ["sales/orders", "SalesOrder"], ["sales/invoices", "Invoice"], ["sales/credit-notes", "CreditNote"], ["purchases/orders", "PurchaseOrder"], ["purchases/bills", "Bill"], ["purchases/vendor-credits", "VendorCredit"]].map(([path, kind]) => <Route key={path} path={`/${path}`} element={<Documents key={kind} kind={kind} />} />)}
    <Route path="/sales/payments" element={<Payments key="Received" direction="Received" />} />
    <Route path="/purchases/payments" element={<Payments key="Made" direction="Made" />} />
    {adminModuleRoutes.map(([, path, Component]) => <Route key={path} path={path} element={<Component />} />)}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Route></Routes></FinanceAuth></BrowserRouter>;
}
