import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./LeavePolicy.css";
import LeavePolicyForm from "./LeavePolicyForm";
import "./LeavePolicyForm.css";

const LEAVE_POLICY_API = "https://localhost:7206/api/LeavePolicy";
const LEAVE_TYPE_API = "https://localhost:7206/api/LeaveType";

export default function LeavePolicy() {
    const navigate = useNavigate();

    const [policies, setPolicies] = useState([]);
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);

            const [policyResponse, typeResponse] = await Promise.all([
                axios.get(LEAVE_POLICY_API),
                axios.get(LEAVE_TYPE_API),
            ]);

            setPolicies(policyResponse.data);
            setLeaveTypes(typeResponse.data);
        } catch (error) {
            console.error("Error loading leave policies:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const getLeaveTypeName = (leaveTypeId) => {
        const leaveType = leaveTypes.find(
            (type) => type.leaveTypeId === leaveTypeId
        );

        return leaveType ? leaveType.leaveTypeName : "Unknown";
    };


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


    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const payload = {
                leaveTypeId: Number(formData.leaveTypeId),
                annualEntitlement: Number(formData.annualEntitlement),
                accrualType: formData.accrualType,

                isPaid: formData.isPaid,
                prorateForNewJoiners: formData.prorateForNewJoiners,
                allowHalfDay: formData.allowHalfDay,
                allowCarryForward: formData.allowCarryForward,

                maxCarryForwardDays: formData.allowCarryForward
                    ? Number(formData.maxCarryForwardDays)
                    : 0,

                maxConsecutiveDays: Number(formData.maxConsecutiveDays),
                minNoticeDays: Number(formData.minNoticeDays),

                requiresDocument: formData.requiresDocument,

                documentAfterDays: formData.requiresDocument
                    ? Number(formData.documentAfterDays)
                    : 0,

                requiresApproval: formData.requiresApproval,

                effectiveFrom: formData.effectiveFrom,

                effectiveTo: formData.effectiveTo
                    ? formData.effectiveTo
                    : null,

                status: formData.status,
            };

            console.log("Sending Policy:", payload);

            if (editingPolicy) {
                await axios.put(
                    `${LEAVE_POLICY_API}/${editingPolicy.leavePolicyId}`,
                    {
                        ...payload,
                        leavePolicyId: editingPolicy.leavePolicyId,
                    }
                );
            } else {
                await axios.post(LEAVE_POLICY_API, payload);
            }

            await fetchData();

            setShowForm(false);

            setEditingPolicy(null);

        } catch (error) {
            console.error("Error creating leave policy:", error);

            alert(
                error.response?.data ||
                "Unable to create leave policy."
            );
        }
    };

    const handleEdit = (policy) => {
        setEditingPolicy(policy);

        setFormData({
            leaveTypeId: policy.leaveTypeId,
            annualEntitlement: policy.annualEntitlement,
            accrualType: policy.accrualType,

            isPaid: policy.isPaid,
            prorateForNewJoiners: policy.prorateForNewJoiners,
            allowHalfDay: policy.allowHalfDay,
            allowCarryForward: policy.allowCarryForward,

            maxCarryForwardDays: policy.maxCarryForwardDays,
            maxConsecutiveDays: policy.maxConsecutiveDays,
            minNoticeDays: policy.minNoticeDays,

            requiresDocument: policy.requiresDocument,
            documentAfterDays: policy.documentAfterDays,
            requiresApproval: policy.requiresApproval,

            effectiveFrom: policy.effectiveFrom,
            effectiveTo: policy.effectiveTo || "",
            status: policy.status,
        });

        setShowForm(true);
    };


    return (
        <div className="leave-policy-page">
            <div className="leave-policy-header">
                <div>
                    <h1>Leave Policies</h1>
                    <p>Configure company leave rules and policies.</p>
                </div>

                <div className="leave-policy-actions">
                    <button
                        className="policy-previous-btn"
                        onClick={() => navigate("/leave")}
                    >
                        ← Previous
                    </button>

                    <button
                        className="policy-refresh-btn"
                        onClick={fetchData}
                    >
                        ↻ Refresh
                    </button>

                    <button
                        className="policy-add-btn"
                        onClick={() => {
                            resetForm();
                            setShowForm(true);
                        }}
                    >
                        + Add Leave Policy
                    </button>
                </div>
            </div>

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

            <div className="leave-policy-table-container">
                {loading ? (
                    <p>Loading leave policies...</p>
                ) : (
                    <table className="leave-policy-table">
                        <thead>
                            <tr>
                                <th>Leave Type</th>
                                <th>Entitlement</th>
                                <th>Accrual</th>
                                <th>Paid</th>
                                <th>Effective From</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {policies.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="no-policy-data">
                                        No leave policies found.
                                    </td>
                                </tr>
                            ) : (
                                policies.map((policy) => (
                                    <tr key={policy.leavePolicyId}>
                                        <td>{getLeaveTypeName(policy.leaveTypeId)}</td>

                                        <td>
                                            {policy.annualEntitlement} Days
                                        </td>

                                        <td>{policy.accrualType}</td>

                                        <td>{policy.isPaid ? "Yes" : "No"}</td>

                                        <td>{policy.effectiveFrom}</td>

                                        <td>
                                            <span
                                                className={
                                                    policy.status === "Active"
                                                        ? "policy-status active"
                                                        : "policy-status inactive"
                                                }
                                            >
                                                {policy.status}
                                            </span>
                                        </td>

                                        <td>
                                            <button
                                                className="policy-edit-btn"
                                                onClick={() => handleEdit(policy)}
                                            >
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}