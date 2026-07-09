import { useState } from "react";
import EmployeeForm from "./EmployeeForm";

function AddEmployee() {

    const [employeeName,setEmployeeName]=useState("");
    const [email,setEmail]=useState("");
    const [department,setDepartment]=useState("");
    const [mobile,setMobile]=useState("");
    const [gender,setGender]=useState("");
    const [designation,setDesignation]=useState("");
    const [joiningDate,setJoiningDate]=useState("");
    const [status,setStatus]=useState("Active");

    function addEmployee(){

        console.log("Save");

    }

    return(

        <EmployeeForm

            employeeName={employeeName}
            setEmployeeName={setEmployeeName}

            email={email}
            setEmail={setEmail}

            department={department}
            setDepartment={setDepartment}

            mobile={mobile}
            setMobile={setMobile}

            gender={gender}
            setGender={setGender}

            designation={designation}
            setDesignation={setDesignation}

            joiningDate={joiningDate}
            setJoiningDate={setJoiningDate}

            status={status}
            setStatus={setStatus}

            addEmployee={addEmployee}

        />

    );

}

export default AddEmployee;