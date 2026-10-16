import "./Profile.css";
import { Box as MuiLayoutBox, Typography as MuiText } from "@mui/material";

function InfoRow({ label, value }) {
    return (

        <MuiLayoutBox className="info-row" component="div">

            <MuiText className="info-label" component="span" variant="inherit">
                {label}
            </MuiText>

            <MuiText className="info-value" component="span" variant="inherit">
                {value}
            </MuiText>

        </MuiLayoutBox>

    );
}

export default InfoRow;