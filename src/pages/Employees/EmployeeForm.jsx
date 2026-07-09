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
  employeeTypes = [],
  employeeType,
  setEmployeeType,
  locations = [],
  location,
  setLocation,
  status,
  setStatus,
  addEmployee,
}) {
  const isFormValid =
    employeeName.trim() !== "" &&
    email.trim() !== "" &&
    department.trim() !== "";

  return (
    <div className="employee-form-card">

      <div className="form-header">
        <h2>Add Employee</h2>

        <p>
          Fill in the employee details below.
        </p>
      </div>

      <div className="form-row">

        {/* Employee Name */}

        <div className="form-group">
          <label>
            Employee Name <span className="required">*</span>
          </label>

          <input
            type="text"
            placeholder="Enter employee name"
            value={employeeName}
            onChange={(e) => setEmployeeName(e.target.value)}
          />
        </div>

        {/* Email */}

        <div className="form-group">
          <label>
            Email Address <span className="required">*</span>
          </label>

          <input
            type="email"
            placeholder="Enter employee email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Department */}

        <div className="form-group">
          <label>
            Department <span className="required">*</span>
          </label>

          <input
            type="text"
            placeholder="Enter department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          />
        </div>

        {/* Mobile */}

        <div className="form-group">
          <label>Mobile</label>

          <input
            type="text"
            placeholder="Enter mobile number"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
          />
        </div>

        {/* Gender */}

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

        {/* Employee Type */}

        <div className="form-group">
          <label>Employee Type</label>

          <select
            value={employeeType}
            onChange={(e) => setEmployeeType(e.target.value)}
          >
            <option value="">Select Employee Type</option>

            {employeeTypes.length > 0 ? (
              employeeTypes.map((item) => (
                <option
                  key={item.employeeTypeId}
                  value={item.employeeTypeId}
                >
                  {item.typeName}
                </option>
              ))
            ) : (
              <option disabled>No Employee Types Available</option>
            )}
          </select>
        </div>

        {/* Location */}

        <div className="form-group">
          <label>Location</label>

          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          >
            <option value="">Select Location</option>

            {locations.length > 0 ? (
              locations.map((item) => (
                <option
                  key={item.locationId}
                  value={item.locationId}
                >
                  {item.locationName}
                </option>
              ))
            ) : (
              <option disabled>No Locations Available</option>
            )}
          </select>
        </div>

        {/* Designation */}

        <div className="form-group">
          <label>Designation</label>

          <input
            type="text"
            placeholder="Enter designation"
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
          />
        </div>

        {/* Joining Date */}

        <div className="form-group">
          <label>Joining Date</label>

          <input
            type="date"
            value={joiningDate}
            onChange={(e) => setJoiningDate(e.target.value)}
          />
        </div>

        {/* Status */}

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

      </div>

      <div className="form-actions">

        <button
          type="button"
          className="save-btn"
          onClick={addEmployee}
          disabled={!isFormValid}
        >
          Save Employee
        </button>

      </div>

    </div>
  );
}

export default EmployeeForm;