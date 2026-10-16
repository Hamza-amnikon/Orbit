import "../styles/Login.css";

import logo from "../../../assets/logo/test.png";
import Background from "../assets/login-bg.png";
import { Box as MuiLayoutBox, Typography as MuiText } from "@mui/material";

function LoginLeftPanel() {
    return (
        <MuiLayoutBox
            className="login-left"
            style={{
                backgroundImage: `url(${Background})`,
            }}
         component="div">
            <MuiLayoutBox className="login-overlay" component="div"></MuiLayoutBox>

            <MuiLayoutBox className="login-left-content" component="div">
                <MuiLayoutBox
                    src={logo}
                    alt="SPARK Logo"
                    className="login-logo"
                 component="img"/>

                <MuiText component="h1" variant="h4">Welcome to SPARK</MuiText>

                <MuiText component="p" variant="body1">
                    Secure Employee Management Platform for
                    enterprise organizations.
                </MuiText>
            </MuiLayoutBox>

            <MuiLayoutBox className="floating circle1" component="div"></MuiLayoutBox>
            <MuiLayoutBox className="floating circle2" component="div"></MuiLayoutBox>
            <MuiLayoutBox className="floating circle3" component="div"></MuiLayoutBox>
        </MuiLayoutBox>
    );
}

export default LoginLeftPanel;