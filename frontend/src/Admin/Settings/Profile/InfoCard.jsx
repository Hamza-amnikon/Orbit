import "./Profile.css";
import { Box as MuiLayoutBox, Typography as MuiText } from "@mui/material";

function InfoCard({ icon, title, children }) {
    return (
        <MuiLayoutBox className="info-card" component="div">

            <MuiLayoutBox className="info-card-header" component="div">
                {icon && <MuiLayoutBox className="section-icon info-card-icon" component="span">{icon}</MuiLayoutBox>}
                <MuiText component="h3" variant="h6">{title}</MuiText>
            </MuiLayoutBox>

            <MuiLayoutBox className="info-card-body" component="div">
                {children}
            </MuiLayoutBox>

        </MuiLayoutBox>
    );
}

export default InfoCard;
