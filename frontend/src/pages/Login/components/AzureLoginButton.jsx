import { Button } from "@mui/material";
import { ArrowForward } from "@mui/icons-material";

import logo from "../../../assets/logo/microsoft.png";

import { useAuth } from "../../../context/AuthContext";
import { Box as MuiLayoutBox } from "@mui/material";

function AzureLoginButton() {

    const { login } = useAuth();

    return (

        <Button
            fullWidth
            className="azure-btn"
            onClick={login}

            startIcon={
                <MuiLayoutBox
                    src={logo}
                    alt="Microsoft"
                    className="azure-logo"
                 component="img"/>
            }

            endIcon={
                <ArrowForward />
            }
        >
            Sign in with Microsoft
        </Button>

    );

}

export default AzureLoginButton;