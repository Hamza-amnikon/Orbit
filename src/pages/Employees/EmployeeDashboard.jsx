import "./EmployeeDashboard.css";
import { useNavigate } from "react-router-dom";
import {
  PersonAddAlt1,
  Groups,
  Apartment,
  Badge,
  ArrowForward,
} from "@mui/icons-material";

const cards = [
  {
    title: "Add Employee",
    description: "Create a new employee profile.",
    icon: <PersonAddAlt1 fontSize="large" />,
    color: "#2563eb",
    path: "/employees/add",
  },
  {
    title: "Employee List",
    description: "View, edit and delete employees.",
    icon: <Groups fontSize="large" />,
    color: "#16a34a",
    path: "/employees/list",
  },
  {
    title: "Departments",
    description: "Manage company departments.",
    icon: <Apartment fontSize="large" />,
    color: "#9333ea",
    path: "/employees/departments",
  },
  {
    title: "Designations",
    description: "Manage employee designations.",
    icon: <Badge fontSize="large" />,
    color: "#ea580c",
    path: "/employees/designations",
  },
];

export default function EmployeeDashboard() {
  const navigate = useNavigate();

  const openPage = (path) => {
    navigate(path);
  };

  return (
    <div className="employee-dashboard">

      <div className="employee-header">
        <h1>Employee Management</h1>

        <p>
          Manage employees, departments and organizational
          structure from one place.
        </p>
      </div>

      <div className="employee-grid">

        {cards.map((card, index) => (

          <div
            key={card.title}
            className="employee-card fade-up"
            style={{
              animationDelay: `${index * 0.1}s`,
            }}
            role="button"
            tabIndex={0}
            onClick={() => openPage(card.path)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                openPage(card.path);
              }
            }}
          >

            <div
              className="employee-icon"
              style={{
                background: card.color,
              }}
            >
              {card.icon}
            </div>

            <h3>{card.title}</h3>

            <p>{card.description}</p>

            <div className="card-footer">
              <span>Open Module</span>

              <ArrowForward />
            </div>

          </div>

        ))}

      </div>

    </div>
  );
}