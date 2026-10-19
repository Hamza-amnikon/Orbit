import "./EmployeeDashboard.css";

import { useNavigate } from "react-router-dom";

import {
    PersonAddAlt1,
    Groups,
    Apartment,
    Badge,
    LocationOnRounded,
    ArrowForward,
    HomeRounded,
} from "@mui/icons-material";

import { useAuth } from "../../../context/AuthContext";
import { Box as MuiLayoutBox, Typography as MuiText, ButtonBase as MuiActionButton } from "@mui/material";
import { showReactAlert } from "../../../components/ui/ReactPromptProvider";


// =====================================================
// EMPLOYEE MANAGEMENT MODULES
// =====================================================

const cards = [

    {
        title: "Add Employee",

        description:
            "Create a new employee profile.",

        icon:
            <PersonAddAlt1 />,

        color: "#2563eb",

        path:
            "/employees/add",
    },


    {
        title: "Employee List",

        description:
            "View, edit and delete employees.",

        icon:
            <Groups />,

        color: "#16a34a",

        path:
            "/employees/list",
    },


    {
        title: "Departments",

        description:
            "Manage company departments.",

        icon:
            <Apartment />,

        color: "#9333ea",

        path:
            "/employees/departments",
    },


    {
        title: "Designations",

        description:
            "Manage employee designations.",

        icon:
            <Badge />,

        color: "#ea580c",

        path:
            "/employees/designations",
    },


    {
        title: "Locations",

        description:
            "Manage employee locations.",

        icon:
            <LocationOnRounded />,

        color: "#d00cea",

        path:
            "/employees/locations",
    },


    {
        title: "Roles",

        description:
            "Manage employee roles.",

        icon:
            <Badge />,

        color: "#0ea5e9",

        path:
            "/employees/roles",
    },


    {
        title: "Employee Type",

        description:
            "Manage employee types.",

        icon:
            <Badge />,

        color: "#14b8a6",

        path:
            "/employees/types",
    },


    {
        title: "Employee Hierarchy",

        description:
            "Manage employee hierarchy.",

        icon:
            <Badge />,

        color: "#14b8a6",

        path:
            "/employees/EmployeeHierarchy",
    },

];


// =====================================================
// COMPONENT
// =====================================================

export default function EmployeeDashboard() {

    const navigate =
        useNavigate();


    const {
        user,
        profile,
        employeeId,
        employeeCode,
        employeeName,
        email,
        department,
        designation,
        isAuthenticated,
        hasPermission,
    } = useAuth();


    // ===================================================
    // LOGGED-IN EMPLOYEE
    // ===================================================

    const loggedInEmployee = {

        employeeId:
            employeeId ??
            profile?.employeeId ??
            profile?.EmployeeId ??
            user?.employeeId ??
            user?.EmployeeId ??
            null,


        employeeCode:
            employeeCode ??
            profile?.employeeCode ??
            profile?.EmployeeCode ??
            user?.employeeCode ??
            user?.EmployeeCode ??
            null,


        employeeName:
            employeeName ??
            profile?.employeeName ??
            profile?.EmployeeName ??
            profile?.displayName ??
            profile?.DisplayName ??
            user?.employeeName ??
            user?.EmployeeName ??
            "Employee",


        email:
            email ??
            profile?.email ??
            profile?.Email ??
            user?.email ??
            user?.Email ??
            null,


        department:
            department ??
            profile?.department ??
            profile?.Department ??
            null,


        designation:
            designation ??
            profile?.designation ??
            profile?.Designation ??
            null,

    };


    // ===================================================
    // DEBUG
    // ===================================================

    console.log(
        "EmployeeDashboard - Authenticated Employee:",
        loggedInEmployee
    );


    // ===================================================
    // OPEN MODULE
    // ===================================================

    const openPage = (path) => {

        if (!isAuthenticated) {

            console.error(
                "EmployeeDashboard: User is not authenticated."
            );

            navigate("/login");

            return;
        }


        if (!loggedInEmployee.employeeId) {

            console.error(
                "EmployeeDashboard: EmployeeId is missing."
            );

            showReactAlert(
                "Your Employee ID could not be determined. Please login again."
            );

            return;
        }


        console.log(
            "Opening Employee Management Module:",
            path
        );


        navigate(path);

    };


    // ===================================================
    // PERMISSION FILTER
    // ===================================================

    const allowedCards =
        cards.filter(
            (card) =>
                hasPermission(
                    card.path,
                    "view"
                )
        );


    // ===================================================
    // RENDER
    // ===================================================

    return (

        <MuiLayoutBox className="employee-dashboard" component="div">


            {/* =================================================
                DECORATIVE HEADER BACKGROUND
            ================================================= */}

            <MuiLayoutBox className="employee-dashboard-decoration" component="div">

                <MuiLayoutBox className="employee-decoration-circle circle-one"  component="div"/>

                <MuiLayoutBox className="employee-decoration-circle circle-two"  component="div"/>

                <MuiLayoutBox className="employee-decoration-circle circle-three"  component="div"/>

            </MuiLayoutBox>


            {/* =================================================
                HEADER
            ================================================= */}

            <MuiLayoutBox className="employee-header" component="div">


                {/* BREADCRUMB */}

                <MuiLayoutBox className="employee-breadcrumb" component="div">

                    <HomeRounded />

                    <MuiText component="span" variant="inherit">
                        /
                    </MuiText>

                    <MuiText component="span" variant="inherit">
                        Employees
                    </MuiText>

                </MuiLayoutBox>


                {/* TITLE */}

                <MuiText component="h1" variant="h4">
                    Employees Management
                </MuiText>


                {/* SUBTITLE */}

                <MuiText component="p" variant="body1">
                    Manage employees, departments and organizational
                    structure from one place.
                </MuiText>

            </MuiLayoutBox>


            {/* =================================================
                MODULE GRID
            ================================================= */}

            <MuiLayoutBox className="employee-grid" component="div">

                {allowedCards.map(
                    (card, index) => (

                        <MuiActionButton
                            key={card.title}

                            className="employee-card"

                            style={{
                                "--card-color":
                                    card.color,

                                animationDelay:
                                    `${index * 0.06}s`,
                            }}

                            role="button"

                            tabIndex={0}

                            onClick={() =>
                                openPage(
                                    card.path
                                )
                            }
                         component="div">


                            {/* =================================
                                ICON
                            ================================= */}

                            <MuiLayoutBox
                                className="employee-icon"

                                style={{
                                    background:
                                        card.color,
                                }}
                             component="div">

                                {card.icon}

                            </MuiLayoutBox>


                            {/* =================================
                                TITLE
                            ================================= */}

                            <MuiText component="h3" variant="h6">
                                {card.title}
                            </MuiText>


                            {/* =================================
                                DESCRIPTION
                            ================================= */}

                            <MuiText component="p" variant="body1">
                                {card.description}
                            </MuiText>


                            {/* =================================
                                FOOTER
                            ================================= */}

                            <MuiLayoutBox className="card-footer" component="div">

                                <MuiText component="span" variant="inherit">
                                    Open Module
                                </MuiText>


                                <MuiLayoutBox className="card-arrow" component="div">

                                    <ArrowForward />

                                </MuiLayoutBox>

                            </MuiLayoutBox>

                        </MuiActionButton>

                    )
                )}

            </MuiLayoutBox>


        </MuiLayoutBox>

    );
}
