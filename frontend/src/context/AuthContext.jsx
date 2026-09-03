import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback
} from "react";

import authService from "../Admin/Services/authService";
import { getProfile } from "../Admin/Services/ProfileService";

const AuthContext = createContext(null);


export function AuthProvider({ children }) {

    const [user, setUser] = useState(null);

    const [profile, setProfile] = useState(null);

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
            setProfileLoading(false);

            return null;

        }


        try {

            setProfileLoading(true);

            console.log(
                "AuthContext: Loading authenticated employee profile..."
            );


            const profileData =
                await getProfile();


            console.log(
                "AuthContext Profile:",
                profileData
            );


            setProfile(profileData);


            /*
            -------------------------------------------------
            Keep token + employee profile together.
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


            /*
            -------------------------------------------------
            Token exists but profile request failed.
            -------------------------------------------------
            */

            setProfile(null);

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


            return profileData;

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