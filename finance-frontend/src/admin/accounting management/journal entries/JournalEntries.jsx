import DraftModule from "../../shared/DatabaseModule";
import { moduleConfigs } from "../../shared/moduleConfigs";
import JournalEntryForm from "./JournalEntryForm";
import JournalEntryDetails from "./JournalEntryDetails";
import "./JournalEntries.css";

export default function JournalEntries() {
  return <DraftModule config={moduleConfigs.journals} Form={JournalEntryForm} Details={JournalEntryDetails} />;
}

