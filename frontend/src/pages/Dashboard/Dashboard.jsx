import { useMemo } from "react";

import WelcomeBanner
    from "../../components/widgets/WelcomeBanner/WelcomeBanner";

import StatsGrid
    from "../../components/widgets/StatsGrid/StatsGrid";

import ModulesGrid
    from "../../components/widgets/ModulesGrid/ModulesGrid";

import DashboardBottom
    from "../../components/widgets/DashboardBottom/DashboardBottom";

import { useAuth }
    from "../../context/AuthContext";


function Dashboard() {

    /*
    =========================================================
    AUTHENTICATED USER
    =========================================================
    */

    const {
        user,
        profile,
        employeeId,
        employeeCode,
        employeeName,
        email,
        department,
        designation,
        status,
        role,
        isAuthenticated
    } = useAuth();


    /*
    =========================================================
    DISPLAY NAME
    =========================================================
    */

    const displayName =
        employeeName ||
        profile?.employeeName ||
        profile?.EmployeeName ||
        profile?.displayName ||
        profile?.DisplayName ||
        user?.employeeName ||
        user?.EmployeeName ||
        user?.displayName ||
        user?.DisplayName ||
        user?.name ||
        "Employee";


    /*
    =========================================================
    FIRST NAME
    =========================================================
    */

    const firstName =
        String(displayName)
            .trim()
            .split(/\s+/)[0] ||
        "Employee";


    /*
    =========================================================
    NORMALIZED DASHBOARD USER
    =========================================================
    */

    const dashboardUser = useMemo(() => {

        return {

            employeeId:
                employeeId ?? null,

            employeeCode:
                employeeCode ?? null,

            employeeName:
                displayName,

            firstName:
                firstName,

            email:
                email ?? null,

            department:
                department ?? null,

            designation:
                designation ?? null,

            status:
                status ?? null,

            role:
                role ?? "Employee"

        };

    }, [
        employeeId,
        employeeCode,
        displayName,
        firstName,
        email,
        department,
        designation,
        status,
        role
    ]);


    /*
    =========================================================
    AUTHENTICATION CHECK
    =========================================================
    */

    if (!isAuthenticated) {

        return (

            <div
                style={{
                    minHeight: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "40px"
                }}
            >

                <div
                    style={{
                        textAlign: "center"
                    }}
                >

                    <h2>
                        Authentication Required
                    </h2>

                    <p>
                        Please sign in to access your dashboard.
                    </p>

                </div>

            </div>

        );

    }


    /*
    =========================================================
    DASHBOARD
    =========================================================
    */

    return (

        <div className="spark-dashboard-page">

            <WelcomeBanner
                user={dashboardUser}
                profile={profile}
                employeeId={employeeId}
                employeeCode={employeeCode}
                employeeName={displayName}
                firstName={firstName}
                department={department}
                designation={designation}
                status={status}
                role={role}
            />


            <StatsGrid
                user={dashboardUser}
                profile={profile}
                employeeId={employeeId}
                employeeCode={employeeCode}
                employeeName={displayName}
                department={department}
                designation={designation}
                status={status}
                role={role}
            />


            <ModulesGrid
                user={dashboardUser}
                profile={profile}
                employeeId={employeeId}
                employeeCode={employeeCode}
                employeeName={displayName}
                role={role}
            />


            <DashboardBottom
                user={dashboardUser}
                profile={profile}
                employeeId={employeeId}
                employeeCode={employeeCode}
                employeeName={displayName}
                role={role}
            />

        </div>

    );

}


export default Dashboard;