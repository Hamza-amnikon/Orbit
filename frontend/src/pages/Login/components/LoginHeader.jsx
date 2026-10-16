import "../styles/Login.css";

import logo from "../../../assets/logo/test.png";
import { Box as MuiLayoutBox, Typography as MuiText } from "@mui/material";

function LoginHeader() {
    return (
        <MuiLayoutBox className="login-header" component="div">

            <MuiLayoutBox
                src={logo}
                alt="SPARK Logo"
                className="login-header-logo"
             component="img"/>

            <MuiText component="h2" variant="h5">Welcome Back</MuiText>

            <MuiText component="p" variant="body1">
                Sign in to continue to SPARK HRMS
            </MuiText>

        </MuiLayoutBox>
    );
}

export default LoginHeader;