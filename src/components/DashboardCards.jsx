import Card from "./Card";
function DashboardCards() {
  return (
    <div
      style={{
        display: "flex",
        gap: "20px",
        marginTop: "20px",
        flexWrap: "wrap"
      }}
    >
       
     <Card number="256" title="Total Employees" />
     <Card number="18" title="On Leave Today" />
     <Card number="32" title="Open Tickets" />
     <Card number="5" title="Pending Salaries" />
     <Card number="10" title="Reject Leave" />
     <Card number="3" title="Onbording Pending" />
    </div>
  );
}

export default DashboardCards;