import {
  useState,
  useEffect,
  useCallback,
} from "react";

import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

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
  ArrowBack,
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
  CardActionArea,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";


import { useAuth } from "../../../context/AuthContext";
import { Box as MuiLayoutBox, Typography as MuiText } from "@mui/material";


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
    hasPermission,
  } = useAuth();

  // =========================================================
  // PERMISSIONS
  // =========================================================

  const permissionRoute = "/employees/designations";

  const canView = hasPermission(permissionRoute, "view");
  const canCreate = hasPermission(permissionRoute, "create");
  const canEdit = hasPermission(permissionRoute, "edit");
  const canDelete = hasPermission(permissionRoute, "delete");
  const canExport = hasPermission(permissionRoute, "export");


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

  const [toast, setToast] = useState({ open: false, message: "", severity: "info" });
  const [designationToDelete, setDesignationToDelete] = useState(null);

  const showToast = useCallback((message, severity = "info") => {
    setToast({ open: true, message, severity });
  }, []);


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

          showToast("Your session has expired. Please sign in again.", "error");

        }
        else if (
          error?.response?.status === 403
        ) {

          showToast("You are not authorized to access Designations.", "error");

        }
        else {

          showToast("Unable to load Designations from the server.", "error");

        }


        setDesignations([]);

      }
      finally {

        setLoading(false);

      }

    },
    [showToast]
  );


  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {

    if (!isAuthenticated) {

      setLoading(false);

      return;

    }

    if (!canView) {
      setLoading(false);
      return;
    }


    loadDesignations();

  }, [
    isAuthenticated,
    canView,
    loadDesignations,
  ]);


  // =========================================================
  // AUTHORIZATION CHECK
  // =========================================================

  const validateAuthenticatedEmployee = () => {

    if (!isAuthenticated) {

      showToast("You are not authenticated. Please sign in again.", "error");

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


      showToast("Your Employee ID could not be determined. Please sign in again.", "error");

      return false;

    }


    return true;

  };


  // =========================================================
  // REFRESH
  // =========================================================

  const refreshData = async () => {

    if (!canView) {
      return;
    }

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

  const activeDesignationCount = designations.filter(
    (item) => String(item.status ?? item.Status ?? "").toLowerCase() === "active"
  ).length;
  const inactiveDesignationCount = designations.filter(
    (item) => String(item.status ?? item.Status ?? "").toLowerCase() === "inactive"
  ).length;

  const resetDesignationFilters = () => {
    setSearch("");
    setStatusFilter("All");
  };

  const exportDesignationsToExcel = () => {
    if (!filteredDesignations.length) {
      showToast("There are no designations to export.", "info");
      return;
    }

    const rows = filteredDesignations.map((item, index) => ({
      "No.": index + 1,
      Designation: item.designationName ?? item.DesignationName ?? item.designation ?? item.Designation ?? "-",
      Description: item.description ?? item.Description ?? "-",
      "Created Date": item.createdDate ?? item.CreatedDate ?? item.createdAt ?? item.CreatedAt
        ? new Date(item.createdDate ?? item.CreatedDate ?? item.createdAt ?? item.CreatedAt).toLocaleDateString("en-GB")
        : "-",
      Status: item.status ?? item.Status ?? "-",
    }));
    const worksheet = XLSX.utils.json_to_sheet(rows);
    worksheet["!cols"] = [
      { wch: 8 }, { wch: 30 }, { wch: 42 }, { wch: 18 }, { wch: 14 },
    ];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Designations");
    XLSX.writeFile(workbook, `Spark_Designations_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };


  // =========================================================
  // OPEN EDIT
  // =========================================================

  const editDesignation = (
    designation
  ) => {

    if (!canEdit) {
      return;
    }

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

      if (!canDelete) {
        return;
      }

      if (
        !validateAuthenticatedEmployee()
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


        showToast("Designation deleted successfully.", "success");

      }
      catch (error) {

        console.error(
          "Delete Designation Error:",
          error
        );


        if (
          error?.response?.status === 401
        ) {

          showToast("Your session has expired. Please sign in again.", "error");

        }
        else if (
          error?.response?.status === 403
        ) {

          showToast("You are not authorized to delete this Designation.", "error");

        }
        else {

          showToast(error?.response?.data?.message ?? error?.response?.data ?? "Unable to delete Designation.", "error");

        }

      }

    };


  // =========================================================
  // CREATE DESIGNATION
  // =========================================================

  const saveDesignation =
    async (data) => {

      if (!canCreate) {
        return;
      }

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


        showToast("Designation added successfully.", "success");

      }
      catch (error) {

        console.error(
          "Create Designation Error:",
          error
        );


        if (
          error?.response?.status === 401
        ) {

          showToast("Your session has expired. Please sign in again.", "error");

        }
        else if (
          error?.response?.status === 403
        ) {

          showToast("You are not authorized to create a Designation.", "error");

        }
        else {

          showToast(error?.response?.data?.message ?? error?.response?.data ?? "Unable to create Designation.", "error");

        }

      }

    };


  // =========================================================
  // UPDATE DESIGNATION
  // =========================================================

  const editDesignationSave =
    async (data) => {

      if (!canEdit) {
        return;
      }

      if (
        !validateAuthenticatedEmployee()
      ) {
        return;
      }


      if (
        !data?.designationId
      ) {

        showToast("Designation ID is missing.", "error");

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


        showToast("Designation updated successfully.", "success");

      }
      catch (error) {

        console.error(
          "Update Designation Error:",
          error
        );


        if (
          error?.response?.status === 401
        ) {

          showToast("Your session has expired. Please sign in again.", "error");

        }
        else if (
          error?.response?.status === 403
        ) {

          showToast("You are not authorized to update this Designation.", "error");

        }
        else {

          showToast(error?.response?.data?.message ?? error?.response?.data ?? "Unable to update Designation.", "error");

        }

      }

    };


  // =========================================================
  // VIEW PERMISSION
  // =========================================================

  if (!canView) {
    return null;
  }


  // =========================================================
  // NOT AUTHENTICATED
  // =========================================================

  if (!isAuthenticated) {

    return (

      <MuiLayoutBox
        className="designation-page"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
       component="div">

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

      </MuiLayoutBox>

    );

  }


  // =========================================================
  // PAGE
  // =========================================================

  return (

    <MuiLayoutBox className="designation-page" component="div">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <MuiLayoutBox className="employee-page-header" component="div">

        <MuiLayoutBox className="designation-page-title" component="div">

          <Tooltip title="Back to employee management">
            <IconButton
              className="designation-back-button"
              aria-label="Back to employee management"
              onClick={() => navigate("/employees")}
            >
              <ArrowBack />
            </IconButton>
          </Tooltip>

          <MuiLayoutBox className="designation-page-title-copy" component="div">

          <MuiText component="h1" variant="h4">
            Designation Management
          </MuiText>

          <MuiText component="p" variant="body1">
            Manage designations across
            your organization.
          </MuiText>
          </MuiLayoutBox>

        </MuiLayoutBox>


        <MuiLayoutBox className="header-buttons" component="div">

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


          {canExport && (
            <Button
              variant="outlined"
              startIcon={
                <Download />
              }
            onClick={exportDesignationsToExcel}
            disabled={loading || filteredDesignations.length === 0}
            >
              Export Excel
            </Button>
          )}


          {canCreate && (
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
          )}

        </MuiLayoutBox>

      </MuiLayoutBox>


  

      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <MuiLayoutBox className="stats-grid" component="div">


        {/* TOTAL */}

        <Card
          className={`stats-card ${statusFilter === "All" && !search ? "is-selected" : ""}`}
        >
          <CardActionArea className="stats-card-action-area" onClick={resetDesignationFilters} aria-label={`Show all ${designations.length} designations`}>
          <CardContent>

            <MuiLayoutBox className="stats-icon blue" component="div">

              <Category />

            </MuiLayoutBox>


            <MuiText component="span" variant="inherit">
              Total Designations
            </MuiText>


            <MuiText component="h2" variant="h5">
              {designations.length}
            </MuiText>

          </CardContent>
          </CardActionArea>
        </Card>


        {/* ACTIVE */}

        <Card
          className={`stats-card ${statusFilter === "Active" ? "is-selected" : ""}`}
        >
          <CardActionArea className="stats-card-action-area" onClick={() => setStatusFilter(statusFilter === "Active" ? "All" : "Active")} aria-pressed={statusFilter === "Active"}>
          <CardContent>

            <MuiLayoutBox className="stats-icon green" component="div">

              <CheckCircle />

            </MuiLayoutBox>


            <MuiText component="span" variant="inherit">
              Active Designations
            </MuiText>


            <MuiText component="h2" variant="h5">

              {activeDesignationCount}

            </MuiText>

          </CardContent>
          </CardActionArea>
        </Card>


        {/* INACTIVE */}

        <Card
          className={`stats-card ${statusFilter === "Inactive" ? "is-selected" : ""}`}
        >
          <CardActionArea className="stats-card-action-area" onClick={() => setStatusFilter(statusFilter === "Inactive" ? "All" : "Inactive")} aria-pressed={statusFilter === "Inactive"}>
          <CardContent>

            <MuiLayoutBox className="stats-icon red" component="div">

              <Cancel />

            </MuiLayoutBox>


            <MuiText component="span" variant="inherit">
              Inactive Designations
            </MuiText>


            <MuiText component="h2" variant="h5">

              {inactiveDesignationCount}

            </MuiText>

          </CardContent>
          </CardActionArea>
        </Card>


      </MuiLayoutBox>


      {/* =====================================================
          SEARCH / FILTER
      ===================================================== */}

      <Card
        className="toolbar-card"
      >

        <CardContent>

          <MuiLayoutBox
            className="designation-filter-row"
           component="div">

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
              slotProps={{ input: {
                startAdornment: (

                  <InputAdornment
                    position="start"
                  >

                    <Search />

                  </InputAdornment>

                ),
              } }}
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

          </MuiLayoutBox>

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

            <MuiText
              style={{
                textAlign: "center",
                padding: "40px",
              }}
             component="h3" variant="h6">
              Loading Designations...
            </MuiText>

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
                (id) => {
                  const designation = designations.find((item) =>
                    String(item.designationId ?? item.DesignationId ?? item.designationID ?? item.DesignationID) === String(id)
                  );
                  setDesignationToDelete(designation || { designationId: id });
                }
              }
              canEdit={canEdit}
              canDelete={canDelete}
              onNotify={showToast}
            />

          </CardContent>

        </Card>

      )}


      {/* =====================================================
          ADD DESIGNATION
      ===================================================== */}

      {canCreate && (
        <AddDesignation
          open={openAddDialog}
          handleClose={() =>
            setOpenAddDialog(false)
          }
          handleSave={
            saveDesignation
          }
          onNotify={showToast}
        />
      )}


      {/* =====================================================
          EDIT DESIGNATION
      ===================================================== */}

      {canEdit && (
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
          onNotify={showToast}
        />
      )}

      <Dialog
        open={Boolean(designationToDelete)}
        onClose={() => setDesignationToDelete(null)}
        aria-labelledby="delete-designation-title"
      >
        <DialogTitle id="delete-designation-title">Delete designation?</DialogTitle>
        <DialogContent>
          Are you sure you want to delete {designationToDelete?.designationName || designationToDelete?.DesignationName || designationToDelete?.designation || "this designation"}?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDesignationToDelete(null)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={async () => {
              const id = designationToDelete?.designationId ?? designationToDelete?.DesignationId ?? designationToDelete?.designationID ?? designationToDelete?.DesignationID;
              setDesignationToDelete(null);
              if (id) await removeDesignation(id);
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={toast.open}
        autoHideDuration={5000}
        onClose={() => setToast((current) => ({ ...current, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setToast((current) => ({ ...current, open: false }))}
          severity={toast.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>

    </MuiLayoutBox>

  );

}


export default Designations;
