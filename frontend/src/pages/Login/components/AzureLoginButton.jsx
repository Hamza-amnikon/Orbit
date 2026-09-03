import { Button } from "@mui/material";
import { ArrowForward } from "@mui/icons-material";

import logo from "../../../assets/logo/microsoft.png";

import { useAuth } from "../../../context/AuthContext";

function AzureLoginButton() {

    const { login } = useAuth();

    return (

        <Button
            fullWidth
            className="azure-btn"
            onClick={login}

            startIcon={
                <img
                    src={logo}
                    alt="Microsoft"
                    className="azure-logo"
                />
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