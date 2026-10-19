// Validate Employee Form
import { showReactAlert } from "../../components/ui/ReactPromptProvider";

export function validateEmployee(employeeName, email, department) {

  // Check Employee Name
  if (employeeName.trim() === "") {
    showReactAlert("Please enter Employee Name");
    return false;
  }

  // Check Email
  if (email.trim() === "") {
    showReactAlert("Please enter Email");
    return false;
  }

  // Email Format Validation
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email)) {
    showReactAlert("Please enter a valid Email");
    return false;
  }

  // Check Department
  if (department.trim() === "") {
    showReactAlert("Please enter Department");
    return false;
  }

  return true;
}
