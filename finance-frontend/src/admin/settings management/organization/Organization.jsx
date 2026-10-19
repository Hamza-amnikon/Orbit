import DraftModule from "../../shared/DatabaseModule";
import { moduleConfigs } from "../../shared/moduleConfigs";
import OrganizationForm from "./OrganizationForm";
import OrganizationDetails from "./OrganizationDetails";
import BranchInvoiceSettings from "./BranchInvoiceSettings";
import "./Organization.css";

export default function Organization() {
  return (
    <>
      <DraftModule config={moduleConfigs.organization} Form={OrganizationForm} Details={OrganizationDetails} />
      <BranchInvoiceSettings />
    </>
  );
}
