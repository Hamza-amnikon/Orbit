import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import {
    Box,
    Card,
    Button,
    Typography,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Snackbar,
    Alert,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";

import LeavePolicyForm from "./LeavePolicyForm";
import "./LeavePolicyForm.css";
import "./LeavePolicy.css";
import { useAuth } from "../../../context/AuthContext";


const LEAVE_POLICY_API =
    `${import.meta.env.VITE_LEAVE_API_BASE_URL}/api/LeavePolicy`;

const LEAVE_TYPE_API =
    `${import.meta.env.VITE_LEAVE_API_BASE_URL}/api/LeaveType`;


export default function LeavePolicy() {

    const navigate = useNavigate();
    const { hasPermission } = useAuth();

    const permissionRoute = "/leave/policies";
    const canView = hasPermission(permissionRoute, "view");
    const canCreate = hasPermission(permissionRoute, "create");
    const canEdit = hasPermission(permissionRoute, "edit");
    const canDelete = hasPermission(permissionRoute, "delete");

    const [policies, setPolicies] = useState([]);
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showForm, setShowForm] = useState(false);

    const [editingPolicy, setEditingPolicy] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [notice, setNotice] = useState(null);

    const [formData, setFormData] = useState({

        leaveTypeId: "",
        annualEntitlement: "",
        accrualType: "Monthly",

        isPaid: true,
        prorateForNewJoiners: true,
        allowHalfDay: true,
        allowCarryForward: false,

        maxCarryForwardDays: 0,
        maxConsecutiveDays: "",
        minNoticeDays: 0,

        requiresDocument: false,
        documentAfterDays: 0,
        requiresApproval: true,

        effectiveFrom: "",
        effectiveTo: "",
        status: "Active",

        // Employee Type Eligibility
        eligibleEmployeeTypes: ["Full-Time"],

    });


    /* ==========================================================
       FETCH DATA
    ========================================================== */

    const fetchData = async () => {

        try {

            setLoading(true);

            const [policyResponse, typeResponse] =
                await Promise.all([
                    axios.get(LEAVE_POLICY_API),
                    axios.get(LEAVE_TYPE_API),
                ]);

            setPolicies(policyResponse.data);
            setLeaveTypes(typeResponse.data);

        } catch (error) {

            console.error(
                "Error loading leave policies:",
                error
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {
        fetchData();
    }, []);


    /* ==========================================================
       GET LEAVE TYPE NAME
    ========================================================== */

    const getLeaveTypeName = (leaveTypeId) => {

        const leaveType = leaveTypes.find(
            (type) =>
                type.leaveTypeId === leaveTypeId
        );

        return leaveType
            ? leaveType.leaveTypeName
            : "Unknown";
    };


    /* ==========================================================
       RESET FORM
    ========================================================== */

    const resetForm = () => {

        setFormData({

            leaveTypeId: "",
            annualEntitlement: "",
            accrualType: "Monthly",

            isPaid: true,
            prorateForNewJoiners: true,
            allowHalfDay: true,
            allowCarryForward: false,

            maxCarryForwardDays: 0,
            maxConsecutiveDays: "",
            minNoticeDays: 0,

            requiresDocument: false,
            documentAfterDays: 0,
            requiresApproval: true,

            effectiveFrom: "",
            effectiveTo: "",
            status: "Active",

            // Employee Type Eligibility
            eligibleEmployeeTypes: ["Full-Time"],

        });

        setEditingPolicy(null);
    };


    /* ==========================================================
       SUBMIT FORM
    ========================================================== */

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (editingPolicy ? !canEdit : !canCreate) {
            return;
        }

        try {

            const payload = {

                leaveTypeId:
                    Number(formData.leaveTypeId),

                annualEntitlement:
                    Number(formData.annualEntitlement),

                accrualType:
                    formData.accrualType,

                isPaid:
                    formData.isPaid,

                prorateForNewJoiners:
                    formData.prorateForNewJoiners,

                allowHalfDay:
                    formData.allowHalfDay,

                allowCarryForward:
                    formData.allowCarryForward,

                maxCarryForwardDays:
                    formData.allowCarryForward
                        ? Number(formData.maxCarryForwardDays)
                        : 0,

                maxConsecutiveDays:
                    Number(formData.maxConsecutiveDays),

                minNoticeDays:
                    Number(formData.minNoticeDays),

                requiresDocument:
                    formData.requiresDocument,

                documentAfterDays:
                    formData.requiresDocument
                        ? Number(formData.documentAfterDays)
                        : 0,

                requiresApproval:
                    formData.requiresApproval,

                effectiveFrom:
                    formData.effectiveFrom,

                effectiveTo:
                    formData.effectiveTo
                        ? formData.effectiveTo
                        : null,

                status:
                    formData.status,

                // Employee Type Eligibility
                appliesToFullTime:
                    Array.isArray(formData.eligibleEmployeeTypes) &&
                    formData.eligibleEmployeeTypes.includes("Full-Time"),

                appliesToPartTime:
                    Array.isArray(formData.eligibleEmployeeTypes) &&
                    formData.eligibleEmployeeTypes.includes("Part-Time"),

                appliesToIntern:
                    Array.isArray(formData.eligibleEmployeeTypes) &&
                    formData.eligibleEmployeeTypes.includes("Intern"),

            };


            console.log(
                "Sending Policy:",
                payload
            );


            /* ==================================================
               UPDATE
            ================================================== */

            if (editingPolicy) {

                await axios.put(
                    `${LEAVE_POLICY_API}/${editingPolicy.leavePolicyId}`,
                    {
                        ...payload,

                        leavePolicyId:
                            editingPolicy.leavePolicyId,
                    }
                );

            }

            /* ==================================================
               CREATE
            ================================================== */

            else {

                await axios.post(
                    LEAVE_POLICY_API,
                    payload
                );

            }


            await fetchData();

            setShowForm(false);

            setEditingPolicy(null);


        } catch (error) {

            console.error(
                "Error creating leave policy:",
                error
            );

            setNotice({
                severity: "error",
                message: typeof error.response?.data === "string"
                    ? error.response.data
                    : "Unable to save the leave policy.",
            });
        }
    };


    /* ==========================================================
       EDIT POLICY
    ========================================================== */

    const handleEdit = (policy) => {

        if (!canEdit) return;

        setEditingPolicy(policy);

        setFormData({

            leaveTypeId:
                policy.leaveTypeId,

            annualEntitlement:
                policy.annualEntitlement,

            accrualType:
                policy.accrualType,

            isPaid:
                policy.isPaid,

            prorateForNewJoiners:
                policy.prorateForNewJoiners,

            allowHalfDay:
                policy.allowHalfDay,

            allowCarryForward:
                policy.allowCarryForward,

            maxCarryForwardDays:
                policy.maxCarryForwardDays,

            maxConsecutiveDays:
                policy.maxConsecutiveDays,

            minNoticeDays:
                policy.minNoticeDays,

            requiresDocument:
                policy.requiresDocument,

            documentAfterDays:
                policy.documentAfterDays,

            requiresApproval:
                policy.requiresApproval,

            effectiveFrom:
                policy.effectiveFrom,

            effectiveTo:
                policy.effectiveTo || "",

            status:
                policy.status,

            // Employee Type Eligibility
            eligibleEmployeeTypes: [
                ...(policy.appliesToFullTime ? ["Full-Time"] : []),
                ...(policy.appliesToPartTime ? ["Part-Time"] : []),
                ...(policy.appliesToIntern ? ["Intern"] : []),
            ],

        });

        setShowForm(true);
    };


    const handleDelete = (policy) => {
        if (!canDelete) return;
        setDeleteTarget(policy);
    };

    const confirmDelete = async () => {
        if (!canDelete || !deleteTarget || deleting) return;
        setDeleting(true);
        try {
            await axios.delete(
                `${LEAVE_POLICY_API}/${deleteTarget.leavePolicyId}`
            );
            setDeleteTarget(null);
            await fetchData();
        } catch (error) {
            console.error(
                "Error deleting leave policy:",
                error
            );
            setNotice({
                severity: "error",
                message: typeof error.response?.data === "string"
                    ? error.response.data
                    : "Unable to delete the leave policy.",
            });
        } finally {
            setDeleting(false);
        }
    };


    /* ==========================================================
       PAGE
    ========================================================== */

    if (!canView) {
        return (
            <Box
                className="leave-policy-page"
                sx={{ padding: "60px", textAlign: "center" }}
            >
                <Typography variant="h5">
                    Access Denied
                </Typography>

                <Typography sx={{ mt: 1 }}>
                    You do not have permission to access this page.
                </Typography>
            </Box>
        );
    }

    return (

        <Box className="leave-policy-page">

            {/* ==================================================
                HEADER CARD
            ================================================== */}

            <Box className="leave-policy-header">
                <IconButton
                    className="policy-back-btn"
                    onClick={() => navigate("/leave")}
                    aria-label="Back to Leave Management"
                >
                    <ArrowBackRoundedIcon />
                </IconButton>

                <Box className="leave-policy-heading-group">
                    <Typography component="h1" className="leave-policy-title">
                        Leave Policies
                    </Typography>

                    <Typography component="p" className="leave-policy-description">
                        Configure company leave rules and policies.
                    </Typography>
                </Box>

                <Stack direction="row" className="leave-policy-actions">
                    <Button
                        className="policy-refresh-btn"
                        startIcon={<RefreshRoundedIcon />}
                        onClick={fetchData}
                    >
                        Refresh
                    </Button>
                    {canCreate && (
                        <Button
                            className="policy-add-btn"
                            startIcon={<AddRoundedIcon />}
                            onClick={() => {
                                resetForm();
                                setShowForm(true);
                            }}
                        >
                            Add Leave Policy
                        </Button>
                    )}
                </Stack>
            </Box>


            {/* ==================================================
                ADD / EDIT FORM
            ================================================== */}

            {showForm && (

                <LeavePolicyForm

                    formData={formData}

                    setFormData={setFormData}

                    leaveTypes={leaveTypes}

                    editingPolicy={editingPolicy}

                    onSubmit={handleSubmit}

                    onCancel={() => {

                        resetForm();

                        setShowForm(false);

                    }}

                />

            )}


            {/* ==================================================
                TABLE CARD
            ================================================== */}

            <Card className="leave-policy-table-container">

                <Box className="leave-policy-table-heading">
                    <Box>
                        <Typography component="h2" className="leave-policy-table-title">
                            Leave Policy Rules
                        </Typography>
                        <Typography component="p" className="leave-policy-table-subtitle">
                            Entitlements and conditions configured for each leave type.
                        </Typography>
                    </Box>
                    <Chip
                        label={`${policies.length} ${policies.length === 1 ? "policy" : "policies"}`}
                        size="small"
                        className="leave-policy-count"
                    />
                </Box>

                {loading ? (

                    <Box className="leave-policy-loading">

                        <Typography>
                            Loading leave policies...
                        </Typography>

                    </Box>

                ) : (

                    <TableContainer>

                        <Table className="leave-policy-table" size="medium">
                            <colgroup>
                                <col style={{ width: "20%" }} />
                                <col style={{ width: "14%" }} />
                                <col style={{ width: "14%" }} />
                                <col style={{ width: "10%" }} />
                                <col style={{ width: "18%" }} />
                                <col style={{ width: "11%" }} />
                                <col style={{ width: "13%" }} />
                            </colgroup>

                            {/* ==================================================
                                TABLE HEADER
                            ================================================== */}

                            <TableHead>

                                <TableRow>

                                    <TableCell>
                                        Leave Type
                                    </TableCell>

                                    <TableCell align="center">
                                        Entitlement
                                    </TableCell>

                                    <TableCell>
                                        Accrual
                                    </TableCell>

                                    <TableCell align="center">
                                        Paid
                                    </TableCell>

                                    <TableCell>
                                        Effective From
                                    </TableCell>

                                    <TableCell align="center">
                                        Status
                                    </TableCell>

                                    <TableCell align="center">
                                        Actions
                                    </TableCell>

                                </TableRow>

                            </TableHead>


                            {/* ==================================================
                                TABLE BODY
                            ================================================== */}

                            <TableBody>

                                {policies.length === 0 ? (

                                    <TableRow>

                                        <TableCell
                                            colSpan={7}
                                            className="no-policy-data"
                                        >
                                            No leave policies found.
                                        </TableCell>

                                    </TableRow>

                                ) : (

                                    policies.map((policy) => (

                                        <TableRow
                                            key={
                                                policy.leavePolicyId
                                            }
                                        >

                                            {/* LEAVE TYPE */}

                                            <TableCell className="policy-leave-type-cell">

                                                {getLeaveTypeName(
                                                    policy.leaveTypeId
                                                )}

                                            </TableCell>


                                            {/* ENTITLEMENT */}

                                            <TableCell align="center">

                                                {
                                                    policy.annualEntitlement
                                                }{" "}
                                                Days

                                            </TableCell>


                                            {/* ACCRUAL */}

                                            <TableCell>

                                                {
                                                    policy.accrualType
                                                }

                                            </TableCell>


                                            {/* PAID */}

                                            <TableCell align="center">

                                                {
                                                    policy.isPaid
                                                        ? "Yes"
                                                        : "No"
                                                }

                                            </TableCell>


                                            {/* EFFECTIVE FROM */}

                                            <TableCell>

                                                {
                                                    policy.effectiveFrom
                                                }

                                            </TableCell>


                                            {/* STATUS */}

                                            <TableCell align="center">

                                                <Chip
                                                    label={
                                                        policy.status
                                                    }
                                                    className={
                                                        policy.status ===
                                                        "Active"
                                                            ? "policy-status active"
                                                            : "policy-status inactive"
                                                    }
                                                />

                                            </TableCell>


                                            {/* ACTION */}

                                            <TableCell align="center" className="policy-actions-cell">
                                                {canEdit && (
                                                    <Tooltip title="Edit policy">
                                                        <IconButton
                                                            className="policy-edit-btn"
                                                            aria-label="Edit leave policy"
                                                            onClick={() => handleEdit(policy)}
                                                        >
                                                            <EditRoundedIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                                {canDelete && (
                                                    <Tooltip title="Delete policy">
                                                        <IconButton
                                                            className="policy-delete-btn"
                                                            aria-label="Delete leave policy"
                                                            onClick={() => handleDelete(policy)}
                                                        >
                                                            <DeleteRoundedIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </TableCell>

                                        </TableRow>

                                    ))

                                )}

                            </TableBody>

                        </Table>

                    </TableContainer>

                )}

            </Card>

            <Dialog
                open={Boolean(deleteTarget)}
                onClose={() => !deleting && setDeleteTarget(null)}
                fullWidth
                maxWidth="xs"
                className="leave-policy-delete-dialog"
            >
                <DialogTitle>Delete leave policy?</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete the policy for{" "}
                    <strong>{deleteTarget ? getLeaveTypeName(deleteTarget.leaveTypeId) : "this leave type"}</strong>?
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setDeleteTarget(null)}
                        disabled={deleting}
                        className="policy-delete-cancel-btn"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={confirmDelete}
                        disabled={deleting}
                        variant="contained"
                        className="policy-delete-confirm-btn"
                        startIcon={<DeleteRoundedIcon />}
                    >
                        {deleting ? "Deleting…" : "Delete policy"}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={Boolean(notice)}
                autoHideDuration={4500}
                onClose={() => setNotice(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert
                    severity={notice?.severity || "error"}
                    variant="filled"
                    onClose={() => setNotice(null)}
                >
                    {notice?.message}
                </Alert>
            </Snackbar>

        </Box>
    );
}
