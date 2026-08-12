export default function LeavePolicyForm({
  formData,
  setFormData,
  leaveTypes,
  editingPolicy,
  onSubmit,
  onCancel,
}) {
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <div className="policy-form-card">
      <div className="policy-form-header">
        <div>
          <h2>
  {editingPolicy ? "Edit Leave Policy" : "Add Leave Policy"}
</h2>
          <p>
  {editingPolicy
    ? "Update the selected leave policy rules."
    : "Configure entitlement, accrual and leave rules."}
</p>
        </div>

        <button
          type="button"
          className="policy-close-btn"
          onClick={onCancel}
        >
          ×
        </button>
      </div>

      <form onSubmit={onSubmit}>
        <h3>Basic Policy</h3>

        <div className="policy-form-grid">
          <div className="policy-form-group">
            <label>Leave Type *</label>

            <select
              name="leaveTypeId"
              value={formData.leaveTypeId}
              onChange={handleChange}
              required
            >
              <option value="">Select Leave Type</option>

              {leaveTypes.map((type) => (
                <option
                  key={type.leaveTypeId}
                  value={type.leaveTypeId}
                >
                  {type.leaveTypeName}
                </option>
              ))}
            </select>
          </div>

          <div className="policy-form-group">
            <label>Annual Entitlement *</label>

            <input
              type="number"
              name="annualEntitlement"
              value={formData.annualEntitlement}
              onChange={handleChange}
              min="1"
              placeholder="e.g. 12"
              required
            />
          </div>

          <div className="policy-form-group">
            <label>Accrual Type *</label>

            <select
              name="accrualType"
              value={formData.accrualType}
              onChange={handleChange}
            >
              <option value="Monthly">Monthly</option>
              <option value="Yearly">Yearly</option>
              <option value="Event Based">Event Based</option>
              <option value="None">None</option>
            </select>
          </div>

          <div className="policy-form-group">
            <label>Effective From *</label>

            <input
              type="date"
              name="effectiveFrom"
              value={formData.effectiveFrom}
              onChange={handleChange}
              required
            />
          </div>

          <div className="policy-form-group">
            <label>Effective To</label>

            <input
              type="date"
              name="effectiveTo"
              value={formData.effectiveTo}
              onChange={handleChange}
            />
          </div>

          <div className="policy-form-group">
            <label>Status</label>

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <h3>Leave Rules</h3>

        <div className="policy-checkbox-grid">
          <label>
            <input
              type="checkbox"
              name="isPaid"
              checked={formData.isPaid}
              onChange={handleChange}
            />
            Paid Leave
          </label>

          <label>
            <input
              type="checkbox"
              name="prorateForNewJoiners"
              checked={formData.prorateForNewJoiners}
              onChange={handleChange}
            />
            Prorate for New Joiners
          </label>

          <label>
            <input
              type="checkbox"
              name="allowHalfDay"
              checked={formData.allowHalfDay}
              onChange={handleChange}
            />
            Allow Half Day
          </label>

          <label>
            <input
              type="checkbox"
              name="allowCarryForward"
              checked={formData.allowCarryForward}
              onChange={handleChange}
            />
            Allow Carry Forward
          </label>
        </div>

        <div className="policy-form-grid">
          {formData.allowCarryForward && (
            <div className="policy-form-group">
              <label>Max Carry Forward Days</label>

              <input
                type="number"
                name="maxCarryForwardDays"
                value={formData.maxCarryForwardDays}
                onChange={handleChange}
                min="0"
              />
            </div>
          )}

          <div className="policy-form-group">
            <label>Max Consecutive Days</label>

            <input
              type="number"
              name="maxConsecutiveDays"
              value={formData.maxConsecutiveDays}
              onChange={handleChange}
              min="1"
            />
          </div>

          <div className="policy-form-group">
            <label>Minimum Notice Days</label>

            <input
              type="number"
              name="minNoticeDays"
              value={formData.minNoticeDays}
              onChange={handleChange}
              min="0"
            />
          </div>
        </div>

        <h3>Approval & Documents</h3>

        <div className="policy-checkbox-grid">
          <label>
            <input
              type="checkbox"
              name="requiresApproval"
              checked={formData.requiresApproval}
              onChange={handleChange}
            />
            Approval Required
          </label>

          <label>
            <input
              type="checkbox"
              name="requiresDocument"
              checked={formData.requiresDocument}
              onChange={handleChange}
            />
            Document Required
          </label>
        </div>

        {formData.requiresDocument && (
          <div className="policy-form-grid">
            <div className="policy-form-group">
              <label>Document Required After Days</label>

              <input
                type="number"
                name="documentAfterDays"
                value={formData.documentAfterDays}
                onChange={handleChange}
                min="0"
              />
            </div>
          </div>
        )}

        <div className="policy-form-buttons">
          <button
            type="button"
            className="policy-cancel-btn"
            onClick={onCancel}
          >
            Cancel
          </button>

          <button type="submit" className="policy-save-btn">
  {editingPolicy ? "Update Policy" : "Save Policy"}
</button>
        </div>
      </form>
    </div>
  );
}