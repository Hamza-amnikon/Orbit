import {
  useState,
  useEffect,
  useCallback,
} from "react";

import { useNavigate } from "react-router-dom";

import "./Designation.css";


import {
  getDesignations,
  createDesignation,
  updateDesignation,
  deleteDesignation,
} from "./DesignationService";


import AddDesignation from "./AddDesignation";
import EditDesignation from "./EditDesignation";
import DesignationTable from "./DesignationTable";


import {
  Add,
  Refresh,
  Download,
  Category,
  CheckCircle,
  Cancel,
  Search,
} from "@mui/icons-material";


import {
  Button,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  MenuItem,
  Typography,
  Box,
} from "@mui/material";


import { useAuth } from "../../../context/AuthContext";


function Designations() {

  const navigate = useNavigate();


  // =========================================================
  // AUTHENTICATED EMPLOYEE
  // =========================================================

  const {
    user,
    profile,
    employeeId,
    employeeCode,
    employeeName,
    isAuthenticated,
    profileLoading,
  } = useAuth();


  // =========================================================
  // NORMALIZE EMPLOYEE ID
  // =========================================================

  const currentEmployeeId =
    employeeId ??
    profile?.employeeId ??
    profile?.EmployeeId ??
    profile?.employeeID ??
    profile?.EmployeeID ??
    user?.employeeId ??
    user?.EmployeeId ??
    user?.employeeID ??
    user?.EmployeeID ??
    null;


  // =========================================================
  // NORMALIZE EMPLOYEE CODE
  // =========================================================

  const currentEmployeeCode =
    employeeCode ??
    profile?.employeeCode ??
    profile?.EmployeeCode ??
    user?.employeeCode ??
    user?.EmployeeCode ??
    null;


  // =========================================================
  // NORMALIZE EMPLOYEE NAME
  // =========================================================

  const currentEmployeeName =
    employeeName ??
    profile?.employeeName ??
    profile?.EmployeeName ??
    profile?.displayName ??
    profile?.DisplayName ??
    profile?.fullName ??
    profile?.FullName ??
    user?.employeeName ??
    user?.EmployeeName ??
    user?.displayName ??
    user?.DisplayName ??
    user?.name ??
    user?.Name ??
    "Employee";


  // =========================================================
  // PAGE STATE
  // =========================================================

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");


  const [designations, setDesignations] =
    useState([]);


  // =========================================================
  // DIALOG STATE
  // =========================================================

  const [openAddDialog, setOpenAddDialog] =
    useState(false);

  const [openEditDialog, setOpenEditDialog] =
    useState(false);


  const [selectedDesignation, setSelectedDesignation] =
    useState(null);


  // =========================================================
  // AUTH LOG
  // =========================================================

  useEffect(() => {

    console.log(
      "=========================================="
    );

    console.log(
      "Designations - Authenticated Employee"
    );

    console.log(
      "Authenticated:",
      isAuthenticated
    );

    console.log(
      "EmployeeId:",
      currentEmployeeId
    );

    console.log(
      "EmployeeCode:",
      currentEmployeeCode
    );

    console.log(
      "EmployeeName:",
      currentEmployeeName
    );

    console.log(
      "Profile Loading:",
      profileLoading
    );

    console.log(
      "=========================================="
    );

  }, [
    isAuthenticated,
    currentEmployeeId,
    currentEmployeeCode,
    currentEmployeeName,
    profileLoading,
  ]);


  // =========================================================
  // LOAD DESIGNATIONS
  // =========================================================

  const loadDesignations = useCallback(
    async () => {

      try {

        setLoading(true);


        console.log(
          "Loading Designations..."
        );


        const response =
          await getDesignations();


        /*
         * Support:
         *
         * response
         * response.data
         * response.items
         * response.result
         */

        let designationData = [];


        if (Array.isArray(response)) {

          designationData =
            response;

        } else if (
          Array.isArray(response?.data)
        ) {

          designationData =
            response.data;

        } else if (
          Array.isArray(response?.items)
        ) {

          designationData =
            response.items;

        } else if (
          Array.isArray(response?.result)
        ) {

          designationData =
            response.result;

        }


        console.log(
          "Designation API Response:",
          response
        );

        console.log(
          "Normalized Designations:",
          designationData
        );


        setDesignations(
          designationData
        );

      }
      catch (error) {

        console.error(
          "Error loading designations:",
          error
        );


        if (
          error?.response?.status === 401
        ) {

          alert(
            "Your session has expired. Please sign in again."
          );

        }
        else if (
          error?.response?.status === 403
        ) {

          alert(
            "You are not authorized to access Designations."
          );

        }
        else {

          console.error(
            "Unable to load Designations from the server."
          );

        }


        setDesignations([]);

      }
      finally {

        setLoading(false);

      }

    },
    []
  );


  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {

    if (!isAuthenticated) {

      setLoading(false);

      return;

    }


    loadDesignations();

  }, [
    isAuthenticated,
    loadDesignations,
  ]);


  // =========================================================
  // AUTHORIZATION CHECK
  // =========================================================

  const validateAuthenticatedEmployee = () => {

    if (!isAuthenticated) {

      alert(
        "You are not authenticated. Please sign in again."
      );

      return false;

    }


    if (
      currentEmployeeId === null ||
      currentEmployeeId === undefined ||
      currentEmployeeId === "" ||
      Number.isNaN(
        Number(currentEmployeeId)
      )
    ) {

      console.error(
        "Designations: EmployeeId is missing.",
        {
          user,
          profile,
          employeeId,
        }
      );


      alert(
        "Your Employee ID could not be determined. Please sign in again."
      );

      return false;

    }


    return true;

  };


  // =========================================================
  // REFRESH
  // =========================================================

  const refreshData = async () => {

    setSearch("");

    setStatusFilter("All");

    await loadDesignations();

  };


  // =========================================================
  // SEARCH + STATUS FILTER
  // =========================================================

  const filteredDesignations =
    designations.filter((item) => {

      const keyword =
        search
          .trim()
          .toLowerCase();


      const designationName =
        item.designationName ??
        item.DesignationName ??
        "";

      const designation =
        item.designation ??
        item.Designation ??
        "";

      const role =
        item.role ??
        item.Role ??
        "";


      const itemStatus =
        item.status ??
        item.Status ??
        "";


      const matchesSearch =
        !keyword ||
        String(designationName)
          .toLowerCase()
          .includes(keyword) ||
        String(designation)
          .toLowerCase()
          .includes(keyword) ||
        String(role)
          .toLowerCase()
          .includes(keyword);


      const matchesStatus =
        statusFilter === "All" ||
        String(itemStatus)
          .toLowerCase() ===
        statusFilter.toLowerCase();


      return (
        matchesSearch &&
        matchesStatus
      );

    });


  // =========================================================
  // OPEN EDIT
  // =========================================================

  const editDesignation = (
    designation
  ) => {

    if (
      !validateAuthenticatedEmployee()
    ) {
      return;
    }


    console.log(
      "=========================================="
    );

    console.log(
      "Opening Designation for Edit"
    );

    console.log(
      "Designation:",
      designation
    );

    console.log(
      "EmployeeId:",
      currentEmployeeId
    );

    console.log(
      "EmployeeCode:",
      currentEmployeeCode
    );

    console.log(
      "EmployeeName:",
      currentEmployeeName
    );

    console.log(
      "=========================================="
    );


    setSelectedDesignation(
      designation
    );

    setOpenEditDialog(true);

  };


  // =========================================================
  // CLOSE EDIT
  // =========================================================

  const closeEditDialog = () => {

    setOpenEditDialog(false);

    setSelectedDesignation(null);

  };


  // =========================================================
  // DELETE DESIGNATION
  // =========================================================

  const removeDesignation =
    async (id) => {

      if (
        !validateAuthenticatedEmployee()
      ) {
        return;
      }


      if (
        !window.confirm(
          "Are you sure you want to delete this Designation?"
        )
      ) {

        return;

      }


      console.log(
        "=========================================="
      );

      console.log(
        "Deleting Designation"
      );

      console.log(
        "DesignationId:",
        id
      );

      console.log(
        "Deleted By EmployeeId:",
        currentEmployeeId
      );

      console.log(
        "Deleted By EmployeeCode:",
        currentEmployeeCode
      );

      console.log(
        "Deleted By EmployeeName:",
        currentEmployeeName
      );

      console.log(
        "=========================================="
      );


      try {

        await deleteDesignation(
          id
        );


        await loadDesignations();


        alert(
          "Designation deleted successfully."
        );

      }
      catch (error) {

        console.error(
          "Delete Designation Error:",
          error
        );


        if (
          error?.response?.status === 401
        ) {

          alert(
            "Your session has expired. Please sign in again."
          );

        }
        else if (
          error?.response?.status === 403
        ) {

          alert(
            "You are not authorized to delete this Designation."
          );

        }
        else {

          alert(
            error?.response?.data?.message ??
            error?.response?.data ??
            "Unable to delete Designation."
          );

        }

      }

    };


  // =========================================================
  // CREATE DESIGNATION
  // =========================================================

  const saveDesignation =
    async (data) => {

      if (
        !validateAuthenticatedEmployee()
      ) {
        return;
      }


      console.log(
        "=========================================="
      );

      console.log(
        "Creating Designation"
      );

      console.log(
        "Designation Data:",
        data
      );

      console.log(
        "Created By EmployeeId:",
        currentEmployeeId
      );

      console.log(
        "Created By EmployeeCode:",
        currentEmployeeCode
      );

      console.log(
        "Created By EmployeeName:",
        currentEmployeeName
      );

      console.log(
        "=========================================="
      );


      try {

        /*
         * Do NOT add createdBy here.
         *
         * DesignationService sends the JWT.
         * The backend should derive CreatedBy
         * from the authenticated EmployeeId claim.
         */

        await createDesignation(
          data
        );


        setOpenAddDialog(false);


        await loadDesignations();


        alert(
          "Designation added successfully."
        );

      }
      catch (error) {

        console.error(
          "Create Designation Error:",
          error
        );


        if (
          error?.response?.status === 401
        ) {

          alert(
            "Your session has expired. Please sign in again."
          );

        }
        else if (
          error?.response?.status === 403
        ) {

          alert(
            "You are not authorized to create a Designation."
          );

        }
        else {

          alert(
            error?.response?.data?.message ??
            error?.response?.data ??
            "Unable to create Designation."
          );

        }

      }

    };


  // =========================================================
  // UPDATE DESIGNATION
  // =========================================================

  const editDesignationSave =
    async (data) => {

      if (
        !validateAuthenticatedEmployee()
      ) {
        return;
      }


      if (
        !data?.designationId
      ) {

        alert(
          "Designation ID is missing."
        );

        return;

      }


      console.log(
        "=========================================="
      );

      console.log(
        "Updating Designation"
      );

      console.log(
        "DesignationId:",
        data.designationId
      );

      console.log(
        "Designation Data:",
        data
      );

      console.log(
        "Updated By EmployeeId:",
        currentEmployeeId
      );

      console.log(
        "Updated By EmployeeCode:",
        currentEmployeeCode
      );

      console.log(
        "Updated By EmployeeName:",
        currentEmployeeName
      );

      console.log(
        "=========================================="
      );


      try {

        /*
         * Do NOT add updatedBy here.
         *
         * DesignationService sends the JWT.
         * Backend should derive UpdatedBy
         * from the authenticated EmployeeId claim.
         */

        await updateDesignation(
          data.designationId,
          data
        );


        setOpenEditDialog(false);

        setSelectedDesignation(
          null
        );


        await loadDesignations();


        alert(
          "Designation updated successfully."
        );

      }
      catch (error) {

        console.error(
          "Update Designation Error:",
          error
        );


        if (
          error?.response?.status === 401
        ) {

          alert(
            "Your session has expired. Please sign in again."
          );

        }
        else if (
          error?.response?.status === 403
        ) {

          alert(
            "You are not authorized to update this Designation."
          );

        }
        else {

          alert(
            error?.response?.data?.message ??
            error?.response?.data ??
            "Unable to update Designation."
          );

        }

      }

    };


  // =========================================================
  // NOT AUTHENTICATED
  // =========================================================

  if (!isAuthenticated) {

    return (

      <div
        className="designation-page"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >

        <Card>

          <CardContent
            sx={{
              textAlign: "center",
              padding: "40px",
            }}
          >

            <Typography
              variant="h6"
              gutterBottom
            >
              Authentication Required
            </Typography>


            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                marginBottom: 3,
              }}
            >
              Please sign in to access
              Designation Management.
            </Typography>


            <Button
              variant="contained"
              onClick={() =>
                navigate("/login")
              }
            >
              Sign In
            </Button>

          </CardContent>

        </Card>

      </div>

    );

  }


  // =========================================================
  // PAGE
  // =========================================================

  return (

    <div className="designation-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="employee-page-header">

        <div>

          <h1>
            Designation Management
          </h1>

          <p>
            Manage designations across
            your organization.
          </p>

        </div>


        <div className="header-buttons">

          <Button
            variant="outlined"
            onClick={() =>
              navigate("/employees")
            }
          >
            Previous
          </Button>


          <Button
            variant="outlined"
            startIcon={
              <Refresh />
            }
            onClick={refreshData}
            disabled={loading}
          >
            Refresh
          </Button>


          <Button
            variant="outlined"
            startIcon={
              <Download />
            }
          >
            Export
          </Button>


          <Button
            variant="contained"
            startIcon={
              <Add />
            }
            onClick={() => {

              if (
                validateAuthenticatedEmployee()
              ) {

                setOpenAddDialog(true);

              }

            }}
            disabled={
              profileLoading ||
              currentEmployeeId === null ||
              currentEmployeeId === undefined
            }
          >
            Add Designation
          </Button>

        </div>

      </div>


  

      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <div className="stats-grid">


        {/* TOTAL */}

        <Card
          className="stats-card"
        >

          <CardContent>

            <div className="stats-icon blue">

              <Category />

            </div>


            <span>
              Total Designations
            </span>


            <h2>
              {designations.length}
            </h2>

          </CardContent>

        </Card>


        {/* ACTIVE */}

        <Card
          className="stats-card"
        >

          <CardContent>

            <div className="stats-icon green">

              <CheckCircle />

            </div>


            <span>
              Active Designations
            </span>


            <h2>

              {
                designations.filter(
                  (item) =>
                    String(
                      item.status ??
                      item.Status ??
                      ""
                    ).toLowerCase() ===
                    "active"
                ).length
              }

            </h2>

          </CardContent>

        </Card>


        {/* INACTIVE */}

        <Card
          className="stats-card"
        >

          <CardContent>

            <div className="stats-icon red">

              <Cancel />

            </div>


            <span>
              Inactive Designations
            </span>


            <h2>

              {
                designations.filter(
                  (item) =>
                    String(
                      item.status ??
                      item.Status ??
                      ""
                    ).toLowerCase() ===
                    "inactive"
                ).length
              }

            </h2>

          </CardContent>

        </Card>


      </div>


      {/* =====================================================
          SEARCH / FILTER
      ===================================================== */}

      <Card
        className="toolbar-card"
      >

        <CardContent>

          <div
            className="designation-filter-row"
          >

            <TextField
              className="designation-search"
              fullWidth
              placeholder="Search Designation..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              InputProps={{
                startAdornment: (

                  <InputAdornment
                    position="start"
                  >

                    <Search />

                  </InputAdornment>

                ),
              }}
            />


            <TextField
              className="designation-status-filter"
              select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
            >

              <MenuItem value="All">
                All Status
              </MenuItem>


              <MenuItem value="Active">
                Active
              </MenuItem>


              <MenuItem value="Inactive">
                Inactive
              </MenuItem>

            </TextField>

          </div>

        </CardContent>

      </Card>


      {/* =====================================================
          TABLE
      ===================================================== */}

      {loading ? (

        <Card
          className="table-card"
        >

          <CardContent>

            <h3
              style={{
                textAlign: "center",
                padding: "40px",
              }}
            >
              Loading Designations...
            </h3>

          </CardContent>

        </Card>

      ) : (

        <Card
          className="table-card"
        >

          <CardContent>

            <DesignationTable
              designations={
                filteredDesignations
              }
              editDesignation={
                editDesignation
              }
              deleteDesignation={
                removeDesignation
              }
            />

          </CardContent>

        </Card>

      )}


      {/* =====================================================
          ADD DESIGNATION
      ===================================================== */}

      <AddDesignation
        open={openAddDialog}
        handleClose={() =>
          setOpenAddDialog(false)
        }
        handleSave={
          saveDesignation
        }
      />


      {/* =====================================================
          EDIT DESIGNATION
      ===================================================== */}

      <EditDesignation
        open={openEditDialog}
        designation={
          selectedDesignation
        }
        handleClose={
          closeEditDialog
        }
        handleUpdate={
          editDesignationSave
        }
      />

    </div>

  );

}


export default Designations;