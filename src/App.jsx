import Sidebar from "./components/Sidebar";
import DashboardCards from "./components/DashboardCards";
import { useState } from "react";
import Employee from "./components/Employee";

function App() {
const [page, setPage] = useState("Home");
  return (
    <div style={{ display: "flex" }}>

       <Sidebar setPage={setPage} />
      <div
  style={{
    padding: "20px",
    width: "100%",
    minHeight: "100vh"
  }}
>
  {page === "Home" && (
  <>
    <h1>Good Morning, Mahinoor 👋</h1>
    <p>Welcome back! Here's what's happening today.</p>
    <DashboardCards />
  </>
)}

{page === "HRMS" && <Employee />}

</div>

    </div>
  );
}

export default App;