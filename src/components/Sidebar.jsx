/*side menu */
import "./Sidebar.css";
function Sidebar({ setPage }) {
  return (
    <div
      style={{
        width: "250px",
        height: "100vh",
        background: "#0d1b4c",
        color: "white",
        padding: "20px"
      }}
    >
      <h2>MyCompany</h2>

      <p
  className="menu-item"
  onClick={() => setPage("Home")}
>
   Home
</p>

<p
  className="menu-item"
  onClick={() => setPage("HRMS")}
>
   HRMS
</p>
      
    </div>
  );
}

export default Sidebar;



