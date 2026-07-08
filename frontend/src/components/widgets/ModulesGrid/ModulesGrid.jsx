import "./ModulesGrid.css";
import { useNavigate } from "react-router-dom";
import ModuleCard from "../ModuleCard/ModuleCard";

import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import EventBusyRoundedIcon from "@mui/icons-material/EventBusyRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import ConfirmationNumberRoundedIcon from "@mui/icons-material/ConfirmationNumberRounded";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import PaidRoundedIcon from "@mui/icons-material/PaidRounded";
import PercentRoundedIcon from "@mui/icons-material/PercentRounded";
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";

function ModulesGrid(){
    const navigate = useNavigate();

    const modules=[

        {
            title:"HRMS",
            description:"Manage employees, attendance and organization.",
            icon:<GroupsRoundedIcon/>,
            color:"#2563eb",
        },

        {
            title:"Leave Management",
            description:"Approve and manage employee leave requests.",
            icon:<EventBusyRoundedIcon/>,
            color:"#16a34a"
        },

        {
            title:"Employee Management",
            description:"Manage employee profiles and departments.",
            icon:<PersonOutlineRoundedIcon/>,
            color:"#9333ea",
            route: "/employees"

        
        },

        {
            title:"Ticketing",
            description:"Raise and track support tickets.",
            icon:<ConfirmationNumberRoundedIcon/>,
            color:"#ea580c",
            route: "/tickets"
        },

        {
            title:"Administration",
            description:"Manage company settings and permissions.",
            icon:<AdminPanelSettingsRoundedIcon/>,
            color:"#0f766e"
        },

        {
            title:"Salary",
            description:"Process employee salaries and payroll.",
            icon:<PaidRoundedIcon/>,
            color:"#dc2626"
        },

        {
            title:"Deductions",
            description:"PF, ESI, Tax and other deductions.",
            icon:<PercentRoundedIcon/>,
            color:"#ca8a04"
        },

        {
            title:"Reports",
            description:"Generate HR and payroll reports.",
            icon:<AssessmentRoundedIcon/>,
            color:"#2563eb"
        }

    ];

    return(

        <section className="modules">

            <h2>Modules</h2>

            <div className="modules-grid">

                {

                    modules.map((module)=>(

                        <ModuleCard
                            key={module.title}
                            {...module}
                            onClick={() => {
    console.log("Clicked:", module.title);
    console.log("Route:", module.route);

    if (module.route) {
        navigate(module.route);
    }
                           }}
                        />

                    ))

                }

            </div>

        </section>

    );

}

export default ModulesGrid;