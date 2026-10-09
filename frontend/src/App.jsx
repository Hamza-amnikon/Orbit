import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <>
      <AppRoutes />
      <div
        style={{
          position: "fixed",
          right: "20px",
          bottom: "20px",
          zIndex: 99999,
          padding: "12px 18px",
          borderRadius: "10px",
          background: "#16a34a",
          color: "#ffffff",
          fontSize: "14px",
          fontWeight: 700,
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.24)",
        }}
      >
        CI/CD deployment test successful
      </div>
    </>
  );
}

export default App;
