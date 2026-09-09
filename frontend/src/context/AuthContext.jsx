import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback
} from "react";

import authService from "../Admin/Services/authService";
import { getProfile } from "../Admin/Services/ProfileService";
import {
    getRolePermissions,
    getPermissions
} from "../Admin/Services/PermissionService";
const AuthContext = createContext(null);


export function AuthProvider({ children }) {

    const [user, setUser] = useState(null);

    const [profile, setProfile] = useState(null);

    const [permissions, setPermissions] = useState([]);

    const [permissionCatalog, setPermissionCatalog] = useState([]);

    const [loading, setLoading] = useState(true);

    const [profileLoading, setProfileLoading] = useState(false);


    /*
    =========================================================
    LOAD PROFILE
    =========================================================
    */

const loadProfile = useCallback(async () => {

    const token =
        localStorage.getItem("token");


    if (!token) {

        setProfile(null);

        setPermissions([]);

        setPermissionCatalog([]);

        setProfileLoading(false);

        return null;

    }


    try {

        setProfileLoading(true);


        console.log(
            "AuthContext: Loading authenticated employee profile..."
        );


        // -------------------------------------------------
        // LOAD EMPLOYEE PROFILE
        // -------------------------------------------------

        const profileData =
            await getProfile();


        console.log(
            "AuthContext Profile:",
            profileData
        );


        setProfile(profileData);


        // -------------------------------------------------
        // LOAD ALL PERMISSION DEFINITIONS
        // -------------------------------------------------

        const allPermissions =
            await getPermissions();


        console.log(
            "AuthContext Permission Catalog:",
            allPermissions
        );


        setPermissionCatalog(
            allPermissions || []
        );


        // -------------------------------------------------
        // LOAD ROLE PERMISSIONS
        // -------------------------------------------------

        const roleId =
            profileData?.roleId;


        if (roleId) {

            const rolePermissions =
                await getRolePermissions(roleId);


            console.log(
                "AuthContext Role Permissions:",
                rolePermissions
            );


            setPermissions(
                rolePermissions || []
            );

        } else {

            console.warn(
                "AuthContext: No roleId found in profile."
            );


            setPermissions([]);

        }


        // -------------------------------------------------
        // KEEP TOKEN + EMPLOYEE PROFILE TOGETHER
        // -------------------------------------------------

        setUser({

            token,

            ...profileData

        });


        return profileData;

    }
    catch (error) {

        console.error(
            "AuthContext Profile Error:",
            error
        );


        setProfile(null);

        setPermissions([]);

        setPermissionCatalog([]);


        setUser({

            token

        });


        return null;

    }
    finally {

        setProfileLoading(false);

    }

}, []);


    /*
    =========================================================
    CHECK AUTHENTICATION
    =========================================================
    */

    const checkAuth = useCallback(async () => {

        const token =
            localStorage.getItem("token");


        console.log(
            "AuthContext: Token exists:",
            !!token
        );


        /*
        -----------------------------------------------------
        NO TOKEN
        -----------------------------------------------------
        */

        if (!token) {

            setUser(null);

            setProfile(null);

            setLoading(false);

            return;

        }


        /*
        -----------------------------------------------------
        TOKEN EXISTS
        -----------------------------------------------------
        */

        setUser({

            token

        });


        /*
        Authentication state can now be considered loaded.
        */

        setLoading(false);


        /*
        -----------------------------------------------------
        Load current employee profile.
        -----------------------------------------------------
        */

        await loadProfile();

    }, [loadProfile]);


    /*
    =========================================================
    INITIAL AUTH CHECK
    =========================================================
    */

    useEffect(() => {

        checkAuth();

    }, [checkAuth]);


    /*
    =========================================================
    LOGIN
    =========================================================

    Starts Microsoft authentication.

    The backend will eventually redirect to:

        /auth/callback?token=...

    =========================================================
    */

    const login = () => {

        console.log(
            "AuthContext: Starting Microsoft login..."
        );


        authService.login();

    };


    /*
    =========================================================
    COMPLETE LOGIN
    =========================================================

    Called by AuthCallback.jsx after the backend sends
    the JWT back to the frontend.

    Backend flow:

        Microsoft
            ↓
        AuthController /me
            ↓
        Generate JWT
            ↓
        /auth/callback?token=JWT

    =========================================================
    */

    const completeLogin = useCallback(async (token) => {

        console.log(
            "AuthContext: Completing authentication..."
        );


        /*
        -----------------------------------------------------
        Validate token
        -----------------------------------------------------
        */

        if (!token) {

            throw new Error(
                "Authentication token was not provided."
            );

        }


        /*
        -----------------------------------------------------
        Save JWT
        -----------------------------------------------------
        */

        localStorage.setItem(
            "token",
            token
        );


        console.log(
            "AuthContext: Token saved successfully."
        );


        /*
        -----------------------------------------------------
        Temporary authenticated user
        -----------------------------------------------------
        */

        setUser({

            token

        });


        /*
        -----------------------------------------------------
        Load the employee associated with this token.
        -----------------------------------------------------
        */

        setProfileLoading(true);


        try {

            const profileData =
                await getProfile();


            setProfile(profileData);


const roleId = profileData?.roleId;


// -------------------------------------------------
// LOAD ALL PERMISSION DEFINITIONS
// -------------------------------------------------

const allPermissions =
    await getPermissions();

console.log(
    "AuthContext Permission Catalog:",
    allPermissions
);

setPermissionCatalog(
    allPermissions || []
);


// -------------------------------------------------
// LOAD ROLE PERMISSIONS
// -------------------------------------------------

let rolePermissions = [];

if (roleId) {

    rolePermissions =
        await getRolePermissions(roleId);

    console.log(
        "AuthContext Role Permissions:",
        rolePermissions
    );

    setPermissions(
        rolePermissions || []
    );

} else {

    setPermissions([]);

}


/*
-----------------------------------------------------
GET INITIAL LOGIN ROUTE

If exactly one permission has View enabled,
open that page directly.

If more than one page has View enabled,
keep the existing Dashboard flow.

Uses the existing permission catalog dynamically.
No page/route is hardcoded here.
-----------------------------------------------------
*/

const getPermissionId = (permission) => {

    return (
        permission?.permissionId ??
        permission?.PermissionId ??
        permission?.permissionID ??
        permission?.PermissionID ??
        permission?.id ??
        permission?.Id ??
        permission?.permission?.id ??
        permission?.permission?.PermissionId ??
        null
    );

};

const getPermissionPath = (permission) => {

    return (
        permission?.path ??
        permission?.Path ??
        permission?.route ??
        permission?.Route ??
        permission?.url ??
        permission?.Url ??
        permission?.pageUrl ??
        permission?.PageUrl ??
        permission?.permissionPath ??
        permission?.PermissionPath ??
        permission?.pagePath ??
        permission?.PagePath ??
        permission?.permission?.path ??
        permission?.permission?.Path ??
        permission?.permission?.route ??
        permission?.permission?.Route ??
        null
    );

};

const isEnabled = (value) =>
    value === true ||
    value === "true" ||
    value === 1 ||
    value === "1";

const viewRoutes = (allPermissions || []).filter(
    (permission) => {

        const permissionId =
            getPermissionId(permission);

        const rolePermission =
            (rolePermissions || []).find(
                (item) =>
                    String(
                        getPermissionId(item)
                    ) === String(permissionId)
            );

        return (
            getPermissionPath(permission) &&
            rolePermission &&
            (
                isEnabled(rolePermission.canView) ||
                isEnabled(rolePermission.CanView)
            )
        );
    }
);

/*
-----------------------------------------------------
CHOOSE LOGIN PAGE

Only permissions selected in Permission Management
are considered here.

Sidebar/layout items are NOT considered separately.

If a selected View page has selected child pages,
the parent page is used as the landing page.

Example:
  /attendance
  /attendance/my-attendance
  /attendance/logs

  -> /attendance

If there is no selected parent page, keep the
existing Dashboard behavior.
-----------------------------------------------------
*/

const selectedViewRoutes = viewRoutes
    .map((permission) => getPermissionPath(permission))
    .filter(Boolean);

const parentViewRoutes = selectedViewRoutes.filter(
    (route) =>
        selectedViewRoutes.some(
            (childRoute) =>
                childRoute !== route &&
                childRoute.startsWith(
                    `${route.replace(/\/$/, "")}/`
                )
        )
);

const initialRoute =
    parentViewRoutes.length > 0
        ? parentViewRoutes.sort(
            (a, b) =>
                a.split("/").filter(Boolean).length -
                b.split("/").filter(Boolean).length
        )[0]
        : selectedViewRoutes.length === 1
            ? selectedViewRoutes[0]
            : "/dashboard";


            console.log(
                "AuthContext: Initial Login Route:",
                initialRoute
            );


            console.log(
                "AuthContext: Authenticated Employee:",
                profileData
            );


            /*
            -------------------------------------------------
            Save employee profile
            -------------------------------------------------
            */

            setProfile(
                profileData
            );


            /*
            -------------------------------------------------
            Save token + profile
            -------------------------------------------------
            */

            setUser({

                token,

                ...profileData

            });


            return {
                ...profileData,
                initialRoute
            };

        }
        catch (error) {

            console.error(
                "AuthContext: Failed to load employee profile:",
                error
            );


            /*
            -------------------------------------------------
            Remove invalid authentication token.

            If the JWT cannot be used to retrieve the
            authenticated employee, we should not leave the
            application in a partially authenticated state.
            -------------------------------------------------
            */

            localStorage.removeItem(
                "token"
            );


            setUser(null);

            setProfile(null);


            throw error;

        }
        finally {

            setProfileLoading(false);

        }

    }, []);


    /*
    =========================================================
    LOGOUT
    =========================================================
    */

    const logout = () => {

        console.log(
            "AuthContext: Logging out..."
        );


        /*
        Clear frontend authentication state.
        */

        localStorage.removeItem(
            "token"
        );

        localStorage.removeItem(
            "role"
        );


        setUser(null);

        setProfile(null);


        /*
        Let authService perform its logout redirect.
        */

        authService.logout();

    };


    /*
    =========================================================
    CURRENT LOGGED-IN EMPLOYEE ID
    =========================================================
    */

    const employeeId =

        profile?.employeeId ??
        profile?.EmployeeId ??
        profile?.employeeID ??
        profile?.EmployeeID ??

        user?.employeeId ??
        user?.EmployeeId ??
        user?.employeeID ??
        user?.EmployeeID ??

        null;


    /*
    =========================================================
    CURRENT EMPLOYEE CODE
    =========================================================
    */

    const employeeCode =

        profile?.employeeCode ??
        profile?.EmployeeCode ??
        profile?.employeeCODE ??

        user?.employeeCode ??
        user?.EmployeeCode ??

        null;


    /*
    =========================================================
    CURRENT EMPLOYEE NAME
    =========================================================
    */

    const employeeName =

        profile?.employeeName ??
        profile?.EmployeeName ??

        profile?.displayName ??
        profile?.DisplayName ??

        profile?.name ??
        profile?.Name ??

        profile?.fullName ??
        profile?.FullName ??

        user?.employeeName ??
        user?.EmployeeName ??

        user?.displayName ??
        user?.DisplayName ??

        user?.name ??

        null;


    /*
    =========================================================
    EMAIL
    =========================================================
    */

    const email =

        profile?.email ??
        profile?.Email ??

        user?.email ??
        user?.Email ??

        null;


    /*
    =========================================================
    DEPARTMENT
    =========================================================
    */

    const department =

        profile?.department ??
        profile?.Department ??

        profile?.departmentName ??
        profile?.DepartmentName ??

        user?.department ??
        user?.Department ??

        null;


    /*
    =========================================================
    DESIGNATION
    =========================================================
    */

    const designation =

        profile?.designation ??
        profile?.Designation ??

        profile?.designationName ??
        profile?.DesignationName ??

        profile?.jobTitle ??
        profile?.JobTitle ??

        user?.designation ??
        user?.Designation ??

        null;


    /*
    =========================================================
    STATUS
    =========================================================
    */

    const status =

        profile?.status ??
        profile?.Status ??

        user?.status ??
        user?.Status ??

        null;


    /*
    =========================================================
    TEMPORARY FULL ACCESS
    =========================================================

    For now everyone has access to the complete HRMS.

    Real PermissionManagement will be connected later.
    =========================================================
    */

    const role = "Admin";

    const roleId = profile?.roleId ?? user?.roleId ?? null;

// =========================================================
// PERMISSION HELPERS
// =========================================================

const normalizePath = (path) => {

    if (!path) {
        return "";
    }

    let normalized = path
        .trim()
        .toLowerCase();

    // "/" and "/dashboard" should be treated as the same page
    if (normalized === "/") {
        return "/dashboard";
    }

    // Remove trailing slash
    if (
        normalized.length > 1 &&
        normalized.endsWith("/")
    ) {
        normalized = normalized.slice(0, -1);
    }

    return normalized;
};


// =========================================================
// GET PERMISSION ID
// =========================================================

const getPermissionId = (permission) => {

    return (
        permission?.permissionId ??
        permission?.PermissionId ??
        permission?.permissionID ??
        permission?.PermissionID ??
        permission?.id ??
        permission?.Id ??
        permission?.permission?.id ??
        permission?.permission?.PermissionId ??
        null
    );

};


// =========================================================
// GET PERMISSION PATH
// =========================================================

const getPermissionPath = (permission) => {

    return (
        permission?.path ??
        permission?.Path ??

        permission?.route ??
        permission?.Route ??

        permission?.url ??
        permission?.Url ??

        permission?.pageUrl ??
        permission?.PageUrl ??

        permission?.permissionPath ??
        permission?.PermissionPath ??

        permission?.pagePath ??
        permission?.PagePath ??

        permission?.permission?.path ??
        permission?.permission?.Path ??

        permission?.permission?.route ??
        permission?.permission?.Route ??

        permission?.permission?.url ??
        permission?.permission?.Url ??

        permission?.permission?.pageUrl ??
        permission?.permission?.PageUrl ??

        permission?.permission?.pagePath ??
        permission?.permission?.PagePath ??

        null
    );

};


// =========================================================
// CHECK USER PERMISSION
// =========================================================

const hasPermission = (
    path,
    action = "view"
) => {

    const normalizedPath =
        normalizePath(path);


    if (!normalizedPath) {
        return false;
    }


    // Find the permission definition
    const permissionDefinition =
        permissionCatalog.find(
            (permission) =>
                normalizePath(
                    getPermissionPath(permission)
                ) === normalizedPath
        );


  if (!permissionDefinition) {
    return false;
}


    const permissionId =
        getPermissionId(
            permissionDefinition
        );


    if (!permissionId) {
        return false;
    }


    // Find the permission assigned to this user's role
    const rolePermission =
        permissions.find(
            (permission) =>
                String(
                    getPermissionId(permission)
                ) === String(permissionId)
        );


    if (!rolePermission) {
        return false;
    }


    // Supports true, "true", 1 and "1"
    const isEnabled = (value) => {

        return (
            value === true ||
            value === "true" ||
            value === 1 ||
            value === "1"
        );

    };


    switch (action.toLowerCase()) {

        case "view":

            return (
                isEnabled(
                    rolePermission.canView
                ) ||
                isEnabled(
                    rolePermission.CanView
                )
            );


        case "create":

            return (
                isEnabled(
                    rolePermission.canCreate
                ) ||
                isEnabled(
                    rolePermission.CanCreate
                )
            );


        case "edit":

            return (
                isEnabled(
                    rolePermission.canEdit
                ) ||
                isEnabled(
                    rolePermission.CanEdit
                )
            );


        case "delete":

            return (
                isEnabled(
                    rolePermission.canDelete
                ) ||
                isEnabled(
                    rolePermission.CanDelete
                )
            );


        case "approve":

            return (
                isEnabled(
                    rolePermission.canApprove
                ) ||
                isEnabled(
                    rolePermission.CanApprove
                )
            );


        case "export":

            return (
                isEnabled(
                    rolePermission.canExport
                ) ||
                isEnabled(
                    rolePermission.CanExport
                )
            );


        default:

            return false;

    }

};


    /*
    =========================================================
    PROVIDER
    =========================================================
    */

    return (

        <AuthContext.Provider
            value={{

                /*
                ---------------------------------------------
                Authentication
                ---------------------------------------------
                */

                user,

                loading,

                isAuthenticated:
                    !!user,


                /*
                ---------------------------------------------
                Profile
                ---------------------------------------------
                */

                profile,

                profileLoading,

                permissionCatalog,


                permissions,

                hasPermission,


                refreshProfile:
                    loadProfile,


                /*
                ---------------------------------------------
                CURRENT EMPLOYEE
                ---------------------------------------------
                */

                employeeId,

                employeeCode,

                employeeName,

                email,

                department,

                designation,

                status,


                /*
                ---------------------------------------------
                TEMPORARY ACCESS
                ---------------------------------------------
                */

                role,

                roleId,

                /*
                ---------------------------------------------
                ACTIONS
                ---------------------------------------------
                */

                login,

                completeLogin,

                logout,

                checkAuth

            }}
        >

            {children}

        </AuthContext.Provider>

    );

}


/*
=========================================================
USE AUTH
=========================================================
*/

export function useAuth() {

    return useContext(
        AuthContext
    );

}