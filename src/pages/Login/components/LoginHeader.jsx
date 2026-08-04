import "../styles/Login.css";

import logo from "../../../assets/logo/test.png";

function LoginHeader() {
    return (
        <div className="login-header">

            <img
                src={logo}
                alt="SPARK Logo"
                className="login-header-logo"
            />

            <h2>Welcome Back</h2>

            <p>
                Sign in to continue to SPARK HRMS
            </p>

        </div>
    );
}

export default LoginHeader;