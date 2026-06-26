import "./EmployeeForm.css";
function EmployeeForm({
  showForm,
  employeeName,
  setEmployeeName,
  email,
  setEmail,
  department,
  setDepartment,
  mobile,
  setMobile,
  gender,
  setGender,
  designation,
  setDesignation,
  joiningDate,
  setJoiningDate,
  status,
  setStatus,
  addEmployee
}) {
  return (
    <>
      <div className="employee-form-card">

  <h3 className="form-title">
    Add Employee
  </h3>

  <div className="form-row">

    <div className="form-group">
      <label>Employee Name</label>
      <input
        type="text"
        placeholder="Enter employee name"
        value={employeeName}
        onChange={(e) => setEmployeeName(e.target.value)}
      />
    </div>

    <div className="form-group">
      <label>Employee Email</label>
      <input
        type="email"
        placeholder="Enter employee email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
    </div>

    <div className="form-group">
      <label>Department</label>
      <input
        type="text"
        placeholder="Enter department"
        value={department}
        onChange={(e) => setDepartment(e.target.value)}
      />
    </div>

    <div className="form-group">
  <label>Mobile</label>
  <input
    type="text"
    placeholder="Enter mobile number"
    value={mobile}
    onChange={(e) => setMobile(e.target.value)}
  />
     </div>
    <div className="form-group">
  <label>Gender</label>

  <select
    value={gender}
    onChange={(e) => setGender(e.target.value)}
  >
    <option value="">Select Gender</option>
    <option value="Male">Male</option>
    <option value="Female">Female</option>
    <option value="Other">Other</option>
  </select>
</div>

   <div className="form-group">
  <label>Designation</label>

  <input
    type="text"
    placeholder="Enter designation"
    value={designation}
    onChange={(e) => setDesignation(e.target.value)}
  />
</div>

<div className="form-group">
  <label>Joining Date</label>

  <input
    type="date"
    value={joiningDate}
    onChange={(e) => setJoiningDate(e.target.value)}
  />
</div>
   
   <div className="form-group">
  <label>Status</label>

  <select
    value={status}
    onChange={(e) => setStatus(e.target.value)}
  >
    <option value="Active">Active</option>
    <option value="Inactive">Inactive</option>
  </select>
</div>

    <button
      className="save-btn"
      onClick={addEmployee}
    >
      Save Employee
    </button>

  </div>

</div>
    </>
  );
}

export default EmployeeForm;