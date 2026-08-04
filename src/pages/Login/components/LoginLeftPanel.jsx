import "../styles/Login.css";

import logo from "../../../assets/logo/test.png";
import Background from "../assets/login-bg.png";

function LoginLeftPanel() {
    return (
        <div
            className="login-left"
            style={{
                backgroundImage: `url(${Background})`,
            }}
        >
            <div className="login-overlay"></div>

            <div className="login-left-content">
                <img
                    src={logo}
                    alt="SPARK Logo"
                    className="login-logo"
                />

                <h1>Welcome to SPARK</h1>

                <p>
                    Secure Employee Management Platform for
                    enterprise organizations.
                </p>
            </div>

            <div className="floating circle1"></div>
            <div className="floating circle2"></div>
            <div className="floating circle3"></div>
        </div>
    );
}

export default LoginLeftPanel;