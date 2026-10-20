import { IconButton, Tooltip } from "@mui/material";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import { useColorMode } from "../styles/ColorModeContext";

export default function ThemeToggle() {
  const { mode, toggleMode } = useColorMode();
  const label = `Switch to ${mode === "light" ? "dark" : "light"} mode`;
  return <Tooltip title={label}><IconButton aria-label={label} onClick={toggleMode} color="inherit">
    {mode === "light" ? <DarkModeRoundedIcon /> : <LightModeRoundedIcon />}
  </IconButton></Tooltip>;
}
