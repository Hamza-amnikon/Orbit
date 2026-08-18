import "./Astra.css";

const Astra = () => {
    return (
        <div
            className="astra-page"
            style={{
                width: "100%",
                height: "calc(100vh - 160px)",
                overflow: "hidden",
            }}
        >
            <iframe
                src="https://localhost:5231/astra/osticket/scp/login.php"
                title="Astra Ticketing System"
                style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                    display: "block",
                }}
            />
        </div>
    );
};

export default Astra;