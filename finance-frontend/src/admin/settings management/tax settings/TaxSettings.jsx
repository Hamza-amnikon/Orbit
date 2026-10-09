import DraftModule from "../../shared/DatabaseModule";
import { moduleConfigs } from "../../shared/moduleConfigs";
import TaxSettingForm from "./TaxSettingForm";
import TaxSettingDetails from "./TaxSettingDetails";
import "./TaxSettings.css";

export default function TaxSettings() {
  return <DraftModule config={moduleConfigs.tax} Form={TaxSettingForm} Details={TaxSettingDetails} />;
}

