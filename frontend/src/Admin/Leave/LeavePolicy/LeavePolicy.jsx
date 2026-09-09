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
} from "@mui/material";

import LeavePolicyForm from "./LeavePolicyForm";
import "./LeavePolicyForm.css";
import "./LeavePolicy.css";
import { useAuth } from "../../../context/AuthContext";


const LEAVE_POLICY_API = "https://localhost:7206/api/LeavePolicy";
const LEAVE_TYPE_API = "https://localhost:7206/api/LeaveType";


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

            alert(
                error.response?.data ||
                "Unable to create leave policy."
            );
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

        });

        setShowForm(true);
    };


    const handleDelete = async (policy) => {

        if (!canDelete) return;

        const confirmed = window.confirm(
            `Are you sure you want to delete the leave policy for ${getLeaveTypeName(policy.leaveTypeId)}?`
        );

        if (!confirmed) return;

        try {
            await axios.delete(
                `${LEAVE_POLICY_API}/${policy.leavePolicyId}`
            );

            await fetchData();
        } catch (error) {
            console.error(
                "Error deleting leave policy:",
                error
            );

            alert(
                error.response?.data ||
                "Unable to delete leave policy."
            );
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

            <Card className="leave-policy-header-card">

                <Box className="leave-policy-header">

                    {/* TITLE */}

                    <Box>

                        <Typography
                            component="h1"
                            className="leave-policy-title"
                        >
                            Leave Policies
                        </Typography>

                        <Typography
                            component="p"
                            className="leave-policy-description"
                        >
                            Configure company leave rules and
                            policies.
                        </Typography>

                    </Box>


                    {/* ACTION BUTTONS */}

                    <Stack
                        direction="row"
                        className="leave-policy-actions"
                    >

                        {/* PREVIOUS */}

                        <Button
                            className="policy-previous-btn"
                            onClick={() =>
                                navigate("/leave")
                            }
                        >
                            ← Previous
                        </Button>


                        {/* REFRESH */}

                        <Button
                            className="policy-refresh-btn"
                            onClick={fetchData}
                        >
                            ↻ Refresh
                        </Button>


                        {/* ADD LEAVE POLICY */}

                        {canCreate && (
                            <Button
                                className="policy-add-btn"
                                onClick={() => {

                                    resetForm();

                                    setShowForm(true);

                                }}
                            >
                                + Add Leave Policy
                            </Button>
                        )}

                    </Stack>

                </Box>

            </Card>


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

                {loading ? (

                    <Box className="leave-policy-loading">

                        <Typography>
                            Loading leave policies...
                        </Typography>

                    </Box>

                ) : (

                    <TableContainer>

                        <Table className="leave-policy-table">

                            {/* ==================================================
                                TABLE HEADER
                            ================================================== */}

                            <TableHead>

                                <TableRow>

                                    <TableCell>
                                        Leave Type
                                    </TableCell>

                                    <TableCell>
                                        Entitlement
                                    </TableCell>

                                    <TableCell>
                                        Accrual
                                    </TableCell>

                                    <TableCell>
                                        Paid
                                    </TableCell>

                                    <TableCell>
                                        Effective From
                                    </TableCell>

                                    <TableCell>
                                        Status
                                    </TableCell>

                                    <TableCell>
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

                                            <TableCell>

                                                {getLeaveTypeName(
                                                    policy.leaveTypeId
                                                )}

                                            </TableCell>


                                            {/* ENTITLEMENT */}

                                            <TableCell>

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

                                            <TableCell>

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

                                            <TableCell>

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

                                            <TableCell>

                                                {canEdit && (
                                                    <Button
                                                        className="policy-edit-btn"
                                                        onClick={() =>
                                                            handleEdit(
                                                                policy
                                                            )
                                                        }
                                                    >
                                                        Edit
                                                    </Button>
                                                )}

                                                {canDelete && (
                                                    <Button
                                                        className="policy-delete-btn"
                                                        onClick={() =>
                                                            handleDelete(policy)
                                                        }
                                                    >
                                                        Delete
                                                    </Button>
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

        </Box>
    );
}