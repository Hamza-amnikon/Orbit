import "./DashboardBottom.css";

import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";

const announcements = [
  {
    title: "Annual Appraisal Process",
    description: "Annual appraisal starts from 1st June 2026.",
    color: "#2563eb",
  },
  {
    title: "Holiday Notice",
    description: "Office closed on Independence Day.",
    color: "#16a34a",
  },
  {
    title: "HR Policy Updated",
    description: "Employee handbook updated.",
    color: "#f59e0b",
  },
];

const links = [
  {
    title: "Company Policy",
    icon: <DescriptionRoundedIcon />,
  },
  {
    title: "Help Desk",
    icon: <SupportAgentRoundedIcon />,
  },
  {
    title: "User Guide",
    icon: <MenuBookRoundedIcon />,
  },
  {
    title: "Employee Directory",
    icon: <PeopleRoundedIcon />,
  },
];

function DashboardBottom() {
  return (
    <section className="dashboard-bottom">

      <div className="left-panel">

        <div className="panel-title">
          <CampaignRoundedIcon />
          <h2>Recent Announcements</h2>
        </div>

        {announcements.map((item) => (
          <div className="announcement-row" key={item.title}>

            <div
              className="dot"
              style={{ background: item.color }}
            ></div>

            <div>

              <h4>{item.title}</h4>

              <p>{item.description}</p>

            </div>

          </div>
        ))}

      </div>

      <div className="right-panel">

        <div className="panel-title">
          <LinkRoundedIcon />
          <h2>Quick Links</h2>
        </div>

        {links.map((item) => (
          <div className="quick-row" key={item.title}>

            <div className="quick-left">

              {item.icon}

              <span>{item.title}</span>

            </div>

            <ArrowForwardRoundedIcon />

          </div>
        ))}

      </div>

    </section>
  );
}

export default DashboardBottom;