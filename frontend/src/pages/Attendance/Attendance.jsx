import axios from "axios";
import { useEffect, useState } from "react";
import AttendanceTable from "./AttendanceTable";
function Attendance() {

  const [attendanceList, setAttendanceList] = useState([]);

  useEffect(() => {
    getAttendance();
  }, []);

  const getAttendance = async () => {
    try {
      const response = await axios.get("https://localhost:7289/api/Attendance");
     console.log("Response:", response.data);

      setAttendanceList(response.data);
    } catch (error) {
      console.log(error);
    }
  };
  

  return (
    <>
      <AttendanceTable attendanceList={attendanceList} />
    </>
  );
}


export default Attendance;