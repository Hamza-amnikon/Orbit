import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    useMemo
} from "react";

import authService from "../Admin/Services/authService";

import { getProfile } from "../Admin/Services/ProfileService";

import {
    getRolePermissions,
    getPermissions
} from "../Admin/Services/PermissionService";


const AuthContext = createContext(null);


/*
=========================================================
ONBOARDING API
=========================================================
*/

const ONBOARDING_API_URL =
    import.meta.env.VITE_ONBOARDING_API_URL ||
    "https://localhost:5126";


/*
=========================================================
AUTH PROVIDER
=========================================================
*/

export function AuthProvider({ children }) {

    /*
    =========================================================
    AUTHENTICATION STATE
    =========================================================
    */

    const [user, setUser] = useState(null);

    const [profile, setProfile] = useState(null);


    /*
    =========================================================
    PERMISSIONS
    =========================================================
    */

    const [permissions, setPermissions] = useState([]);

    const [permissionCatalog, setPermissionCatalog] =
        useState([]);


    /*
    =========================================================
    LOADING
    =========================================================
    */

    const [loading, setLoading] = useState(true);

    const [profileLoading, setProfileLoading] =
        useState(false);


    /*
    =========================================================
    ONBOARDING ACCESS
    =========================================================

    false = employee does NOT have all documents approved

    true = all required documents are approved
    */

    const [sparkAccessGranted, setSparkAccessGranted] =
        useState(false);

    const [sparkAccessLoading, setSparkAccessLoading] =
        useState(true);


    /*
    =========================================================
    CHECK SPARK ACCESS
    =========================================================

    Required documents are checked by the backend.

    The backend must return:

    {
        success: true,
        employeeId: 38,
        accessGranted: true
    }

    Only when all required documents are approved
    should accessGranted be true.
    =========================================================
    */

    const checkSparkAccess = useCallback(
        async (
            currentEmployeeId,
            showLoading = true
        ) => {

            if (!currentEmployeeId) {

                console.warn(
                    "AuthContext: Employee ID not available for Spark access check."
                );

                setSparkAccessGranted(false);

                if (showLoading) {
                    setSparkAccessLoading(false);
                }

                return false;
            }


            try {

                if (showLoading) {
                    setSparkAccessLoading(true);
                }


                console.log(
                    "AuthContext: Checking Spark document access...",
                    currentEmployeeId
                );


                const response = await fetch(
                    `${ONBOARDING_API_URL}/api/Onboarding/${currentEmployeeId}/access`
                );


                if (!response.ok) {

                    throw new Error(
                        `Spark access API returned ${response.status}`
                    );

                }


                const data = await response.json();


                const accessGranted =
                    data?.accessGranted === true;


                console.log(
                    "AuthContext: Spark Access:",
                    accessGranted
                );


                setSparkAccessGranted(
                    accessGranted
                );


                return accessGranted;

            }
            catch (error) {

                console.error(
                    "AuthContext: Spark access check failed:",
                    error
                );


                /*
                IMPORTANT:

                If the onboarding API fails, do NOT give
                full Spark access.

                The employee can still login and reach
                Settings to complete documents.
                */

                setSparkAccessGranted(false);

                return false;

            }
            finally {

                if (showLoading) {
                    setSparkAccessLoading(false);
                }

            }

        },
        []
    );


    /*
    =========================================================
    LOAD PROFILE
    =========================================================
    */

    const loadProfile = useCallback(
        async () => {

            const token =
                localStorage.getItem("token");


            /*
            -------------------------------------------------
            NO TOKEN
            -------------------------------------------------
            */

            if (!token) {

                setProfile(null);

                setPermissions([]);

                setPermissionCatalog([]);

                setSparkAccessGranted(false);

                setSparkAccessLoading(false);

                setProfileLoading(false);

                return null;
            }


            try {

                setProfileLoading(true);


                console.log(
                    "AuthContext: Loading authenticated employee profile..."
                );


                /*
                -------------------------------------------------
                LOAD EMPLOYEE PROFILE
                -------------------------------------------------
                */

                const profileData =
                    await getProfile();


                console.log(
                    "AuthContext Profile:",
                    profileData
                );


                setProfile(
                    profileData
                );


                /*
                -------------------------------------------------
                GET EMPLOYEE ID
                -------------------------------------------------
                */

                const currentEmployeeId =

                    profileData?.employeeId ??
                    profileData?.EmployeeId ??
                    profileData?.employeeID ??
                    profileData?.EmployeeID ??
                    null;


                console.log(
                    "AuthContext Employee ID:",
                    currentEmployeeId
                );


                /*
                -------------------------------------------------
                CHECK DOCUMENT APPROVAL
                -------------------------------------------------
                */

                await checkSparkAccess(
                    currentEmployeeId
                );


                /*
                -------------------------------------------------
                LOAD ALL PERMISSION DEFINITIONS
                -------------------------------------------------
                */

                const allPermissions =
                    await getPermissions();


                console.log(
                    "AuthContext Permission Catalog:",
                    allPermissions
                );


                setPermissionCatalog(
                    allPermissions || []
                );


                /*
                -------------------------------------------------
                LOAD ROLE PERMISSIONS
                -------------------------------------------------
                */

                const roleId =
                    profileData?.roleId;


                if (roleId) {

                    const rolePermissions =
                        await getRolePermissions(
                            roleId
                        );


                    console.log(
                        "AuthContext Role Permissions:",
                        rolePermissions
                    );


                    setPermissions(
                        rolePermissions || []
                    );

                }
                else {

                    console.warn(
                        "AuthContext: No roleId found in profile."
                    );


                    setPermissions([]);

                }


                /*
                -------------------------------------------------
                KEEP TOKEN + PROFILE TOGETHER
                -------------------------------------------------
                */

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

                setSparkAccessGranted(false);


                /*
                -------------------------------------------------
                KEEP AUTHENTICATED STATE IF TOKEN EXISTS
                -------------------------------------------------
                */

                setUser({

                    token

                });


                return null;

            }
            finally {

                setProfileLoading(false);

            }

        },
        [
            checkSparkAccess
        ]
    );


    /*
    =========================================================
    CHECK AUTHENTICATION
    =========================================================
    */

    const checkAuth = useCallback(
        async () => {

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

                setSparkAccessGranted(false);

                setSparkAccessLoading(false);

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
            -----------------------------------------------------
            AUTHENTICATION STATE LOADED
            -----------------------------------------------------
            */

            setLoading(false);


            /*
            -----------------------------------------------------
            LOAD CURRENT EMPLOYEE PROFILE
            -----------------------------------------------------
            */

            await loadProfile();

        },
        [
            loadProfile
        ]
    );


    /*
    =========================================================
    INITIAL AUTH CHECK
    =========================================================
    */

    useEffect(
        () => {

            checkAuth();

        },
        [
            checkAuth
        ]
    );


    /*
    =========================================================
    LOGIN
    =========================================================

    Microsoft authentication remains unchanged.
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

    Called by AuthCallback.jsx after the backend
    sends the JWT back to the frontend.
    =========================================================
    */

    const completeLogin =
        useCallback(
            async (token) => {

                console.log(
                    "AuthContext: Completing authentication..."
                );


                /*
                -------------------------------------------------
                VALIDATE TOKEN
                -------------------------------------------------
                */

                if (!token) {

                    throw new Error(
                        "Authentication token was not provided."
                    );

                }


                /*
                -------------------------------------------------
                SAVE JWT
                -------------------------------------------------
                */

                localStorage.setItem(
                    "token",
                    token
                );


                console.log(
                    "AuthContext: Token saved successfully."
                );


                /*
                -------------------------------------------------
                TEMPORARY AUTHENTICATED USER
                -------------------------------------------------
                */

                setUser({

                    token

                });


                /*
                -------------------------------------------------
                LOAD EMPLOYEE PROFILE
                -------------------------------------------------
                */

                setProfileLoading(true);


                try {

                    const profileData =
                        await getProfile();


                    setProfile(
                        profileData
                    );


                    /*
                    -------------------------------------------------
                    GET EMPLOYEE ID
                    -------------------------------------------------
                    */

                    const currentEmployeeId =

                        profileData?.employeeId ??
                        profileData?.EmployeeId ??
                        profileData?.employeeID ??
                        profileData?.EmployeeID ??
                        null;


                    console.log(
                        "AuthContext: Employee ID:",
                        currentEmployeeId
                    );


                    /*
                    -------------------------------------------------
                    CHECK DOCUMENT APPROVAL
                    -------------------------------------------------
                    */

                    await checkSparkAccess(
                        currentEmployeeId
                    );


                    /*
                    -------------------------------------------------
                    ROLE
                    -------------------------------------------------
                    */

                    const roleId =
                        profileData?.roleId;


                    /*
                    -------------------------------------------------
                    LOAD ALL PERMISSION DEFINITIONS
                    -------------------------------------------------
                    */

                    const allPermissions =
                        await getPermissions();


                    console.log(
                        "AuthContext Permission Catalog:",
                        allPermissions
                    );


                    setPermissionCatalog(
                        allPermissions || []
                    );


                    /*
                    -------------------------------------------------
                    LOAD ROLE PERMISSIONS
                    -------------------------------------------------
                    */

                    let loginRolePermissions =
                        [];


                    if (roleId) {

                        const rolePermissions =
                            await getRolePermissions(
                                roleId
                            );


                        console.log(
                            "AuthContext Role Permissions:",
                            rolePermissions
                        );


                        loginRolePermissions =
                            rolePermissions || [];


                        setPermissions(
                            loginRolePermissions
                        );

                    }
                    else {

                        setPermissions([]);

                    }


                    console.log(
                        "AuthContext: Authenticated Employee:",
                        profileData
                    );


                    /*
                    -------------------------------------------------
                    SAVE EMPLOYEE PROFILE
                    -------------------------------------------------
                    */

                    setProfile(
                        profileData
                    );


                    /*
                    -------------------------------------------------
                    SAVE TOKEN + PROFILE
                    -------------------------------------------------
                    */

                    setUser({

                        token,

                        ...profileData

                    });


                    return {

                        ...profileData

                    };

                }
                catch (error) {

                    console.error(
                        "AuthContext: Failed to load employee profile:",
                        error
                    );


                    /*
                    -------------------------------------------------
                    IMPORTANT

                    Authentication has failed only if
                    profile loading itself fails.
                    -------------------------------------------------
                    */

                    localStorage.removeItem(
                        "token"
                    );


                    setUser(null);

                    setProfile(null);

                    setSparkAccessGranted(false);

                    throw error;

                }
                finally {

                    setProfileLoading(false);

                }

            },
            [
                checkSparkAccess
            ]
        );


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
        -------------------------------------------------
        CLEAR FRONTEND AUTHENTICATION STATE
        -------------------------------------------------
        */

        localStorage.removeItem(
            "token"
        );

        localStorage.removeItem(
            "role"
        );


        setUser(null);

        setProfile(null);

        setPermissions([]);

        setPermissionCatalog([]);

        setSparkAccessGranted(false);

        setSparkAccessLoading(false);


        /*
        -------------------------------------------------
        LET AUTHSERVICE PERFORM LOGOUT REDIRECT
        -------------------------------------------------
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
    AUTOMATIC SPARK ACCESS REFRESH
    =========================================================

    If HR approves the final required document while the
    employee is already logged in, the frontend will re-check
    the onboarding API every 10 seconds.

    When the API returns:

        accessGranted: true

    Spark access is immediately unlocked without requiring
    logout/login or a page refresh.

    The background check is silent so the whole application
    does not show a loading screen every 10 seconds.
    =========================================================
    */

    useEffect(() => {

        if (!user || !employeeId) {
            return;
        }

        // Check immediately.
        checkSparkAccess(
            employeeId,
            false
        );

        // Continue checking for HR approval changes.
        const accessRefreshInterval =
            setInterval(() => {

                checkSparkAccess(
                    employeeId,
                    false
                );

            }, 10000);

        return () => {

            clearInterval(
                accessRefreshInterval
            );

        };

    }, [
        user,
        employeeId,
        checkSparkAccess
    ]);


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
    TEMPORARY ROLE
    =========================================================
    */

    const role = "Admin";

    const roleId =

        profile?.roleId ??
        user?.roleId ??

        null;


    /*
    =========================================================
    PERMISSION HELPERS
    =========================================================
    */

    const normalizePath = (path) => {

        if (!path) {

            return "";

        }


        let normalized =
            path
                .trim()
                .toLowerCase();


        /*
        -------------------------------------------------
        "/" and "/dashboard"
        are treated as the same page.
        -------------------------------------------------
        */

        if (normalized === "/") {

            return "/dashboard";

        }


        /*
        -------------------------------------------------
        REMOVE TRAILING SLASH
        -------------------------------------------------
        */

        if (
            normalized.length > 1 &&
            normalized.endsWith("/")
        ) {

            normalized =
                normalized.slice(
                    0,
                    -1
                );

        }


        return normalized;

    };


    /*
    =========================================================
    GET PERMISSION ID
    =========================================================
    */

    const getPermissionId =
        (permission) => {

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


    /*
    =========================================================
    GET PERMISSION PATH
    =========================================================
    */

    const getPermissionPath =
        (permission) => {

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


    /*
    =========================================================
    GET MODULE LOGIN ROUTE
    =========================================================
    */

    const moduleLoginRoutes =
        useMemo(
            () => {

                const routes = {};


                if (
                    !Array.isArray(
                        permissionCatalog
                    ) ||
                    !Array.isArray(
                        permissions
                    ) ||
                    permissionCatalog.length === 0 ||
                    permissions.length === 0
                ) {

                    return routes;

                }


                const isEnabled =
                    (value) =>

                        value === true ||
                        value === "true" ||
                        value === 1 ||
                        value === "1";


                /*
                -------------------------------------------------
                BUILD PERMISSION ID
                -> PERMISSION DEFINITION
                -------------------------------------------------
                */

                const permissionById =
                    new Map();


                permissionCatalog.forEach(
                    (permission) => {

                        const id =
                            getPermissionId(
                                permission
                            );


                        if (
                            id !== null &&
                            id !== undefined
                        ) {

                            permissionById.set(
                                String(id),
                                permission
                            );

                        }

                    }
                );


                /*
                -------------------------------------------------
                BUILD MODULE
                -> SELECTED LOGIN ROUTE
                -------------------------------------------------
                */

                const loginRouteByModule =
                    new Map();


                permissions.forEach(
                    (rolePermission) => {

                        const isLoginPage =
                            rolePermission?.isLoginPage ??
                            rolePermission?.IsLoginPage ??
                            false;


                        const canView =
                            rolePermission?.canView ??
                            rolePermission?.CanView ??
                            false;


                        if (
                            !isEnabled(
                                isLoginPage
                            ) ||
                            !isEnabled(
                                canView
                            )
                        ) {

                            return;

                        }


                        const permissionId =
                            getPermissionId(
                                rolePermission
                            );


                        if (
                            permissionId === null ||
                            permissionId === undefined
                        ) {

                            return;

                        }


                        const permissionDefinition =
                            permissionById.get(
                                String(
                                    permissionId
                                )
                            );


                        if (
                            !permissionDefinition
                        ) {

                            return;

                        }


                        const moduleName =

                            permissionDefinition?.module ??
                            permissionDefinition?.Module ??
                            permissionDefinition?.moduleName ??
                            permissionDefinition?.ModuleName ??

                            "";


                        const loginRoute =
                            getPermissionPath(
                                permissionDefinition
                            );


                        if (
                            !String(
                                moduleName
                            ).trim() ||
                            !loginRoute
                        ) {

                            return;

                        }


                        const moduleKey =
                            String(
                                moduleName
                            )
                                .trim()
                                .toLowerCase();


                        /*
                        -------------------------------------------------
                        ONE LOGIN PAGE PER MODULE
                        -------------------------------------------------
                        */

                        if (
                            !loginRouteByModule.has(
                                moduleKey
                            )
                        ) {

                            loginRouteByModule.set(
                                moduleKey,
                                normalizePath(
                                    loginRoute
                                )
                            );

                        }

                    }
                );


                /*
                -------------------------------------------------
                CONNECT EVERY MODULE ENTRY
                ROUTE TO ITS LOGIN ROUTE
                -------------------------------------------------
                */

                permissionCatalog.forEach(
                    (moduleDefinition) => {

                        const moduleRoute =
                            normalizePath(
                                getPermissionPath(
                                    moduleDefinition
                                )
                            );


                        if (!moduleRoute) {

                            return;

                        }


                        const moduleName =

                            moduleDefinition?.module ??
                            moduleDefinition?.Module ??
                            moduleDefinition?.moduleName ??
                            moduleDefinition?.ModuleName ??

                            "";


                        const moduleKey =
                            String(
                                moduleName
                            )
                                .trim()
                                .toLowerCase();


                        if (!moduleKey) {

                            return;

                        }


                        const loginRoute =
                            loginRouteByModule.get(
                                moduleKey
                            );


                        if (loginRoute) {

                            routes[moduleRoute] =
                                loginRoute;

                        }

                    }
                );


                return routes;

            },
            [
                permissions,
                permissionCatalog
            ]
        );


    /*
    =========================================================
    GET MODULE LOGIN ROUTE
    =========================================================
    */

    const getModuleLoginRoute =
        useCallback(
            (moduleRoute) => {

                const normalizedModuleRoute =
                    normalizePath(
                        moduleRoute
                    );


                if (!normalizedModuleRoute) {

                    return null;

                }


                return (
                    moduleLoginRoutes[
                        normalizedModuleRoute
                    ] || null
                );

            },
            [
                moduleLoginRoutes
            ]
        );


    /*
    =========================================================
    CHECK USER PERMISSION
    =========================================================
    */

    const hasPermission = (
        path,
        action = "view"
    ) => {

        const normalizedPath =
            normalizePath(
                path
            );


        if (!normalizedPath) {

            return false;

        }


        /*
        -------------------------------------------------
        ONBOARDING SETTINGS ACCESS
        -------------------------------------------------

        Employees who have not completed all required
        documents must still be able to access Settings
        and upload/complete their documents.

        This does NOT grant access to other Spark modules.
        AppRoutes.jsx OnboardingGuard blocks those routes.
        -------------------------------------------------
        */

        const isSettingsRoute =
            normalizedPath === "/settings" ||
            normalizedPath.startsWith("/settings/");

        if (
            !sparkAccessGranted &&
            isSettingsRoute
        ) {
            return true;
        }


        /*
        -------------------------------------------------
        FIND PERMISSION DEFINITION
        -------------------------------------------------
        */

        const permissionDefinition =
            permissionCatalog.find(
                (permission) =>

                    normalizePath(
                        getPermissionPath(
                            permission
                        )
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


        /*
        -------------------------------------------------
        FIND ROLE PERMISSION
        -------------------------------------------------
        */

        const rolePermission =
            permissions.find(
                (permission) =>

                    String(
                        getPermissionId(
                            permission
                        )
                    ) ===
                    String(
                        permissionId
                    )
            );


        if (!rolePermission) {

            return false;

        }


        /*
        -------------------------------------------------
        SUPPORTS:
        true
        "true"
        1
        "1"
        -------------------------------------------------
        */

        const isEnabled =
            (value) => {

                return (

                    value === true ||
                    value === "true" ||
                    value === 1 ||
                    value === "1"

                );

            };


        switch (
            action.toLowerCase()
        ) {

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
                AUTHENTICATION
                ---------------------------------------------
                */

                user,

                loading,

                isAuthenticated:
                    !!user,


                /*
                ---------------------------------------------
                PROFILE
                ---------------------------------------------
                */

                profile,

                profileLoading,


                /*
                ---------------------------------------------
                SPARK DOCUMENT ACCESS
                ---------------------------------------------
                */

                sparkAccessGranted,

                sparkAccessLoading,

                checkSparkAccess,


                /*
                ---------------------------------------------
                PERMISSIONS
                ---------------------------------------------
                */

                permissionCatalog,

                permissions,

                hasPermission,

                getModuleLoginRoute,


                /*
                ---------------------------------------------
                REFRESH PROFILE
                ---------------------------------------------
                */

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