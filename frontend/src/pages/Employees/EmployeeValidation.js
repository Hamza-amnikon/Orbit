// Validate Employee Form

export function validateEmployee(employeeName, email, department) {

  // Check Employee Name
  if (employeeName.trim() === "") {
    alert("Please enter Employee Name");
    return false;
  }

  // Check Email
  if (email.trim() === "") {
    alert("Please enter Email");
    return false;
  }

  // Email Format Validation
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email)) {
    alert("Please enter a valid Email");
    return false;
  }

  // Check Department
  if (department.trim() === "") {
    alert("Please enter Department");
    return false;
  }

  return true;
}