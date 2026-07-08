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
    icon: <PersonAddAlt1 />,
    color: "#2563eb",
    path: "/employees/add",
  },
  {
    title: "Employee List",
    description: "View and manage employees.",
    icon: <Groups />,
    color: "#16a34a",
    path: "/employees/list",
  },
  {
    title: "Departments",
    description: "Manage company departments.",
    icon: <Apartment />,
    color: "#9333ea",
    path: "/employees/departments",
  },
  {
    title: "Designations",
    description: "Manage employee positions.",
    icon: <Badge />,
    color: "#ea580c",
    path: "/employees/designations",
  },
];

export default function EmployeeDashboard() {
  const navigate = useNavigate();

  return (
    <div className="employee-dashboard">
      <div className="employee-header">
        <h1>Employee Management</h1>

        <p>
          Manage employees, departments and organizational structure.
        </p>
      </div>

      <div className="employee-grid">
        {cards.map((card) => (
          <div
            key={card.title}
            className="employee-card"
            onClick={() => navigate(card.path)}
          >
            <div
              className="employee-icon"
              style={{ background: card.color }}
            >
              {card.icon}
            </div>

            <h3>{card.title}</h3>

            <p>{card.description}</p>

            <div className="card-footer">
              <span>Open</span>

              <ArrowForward />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}