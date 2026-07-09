import "./Navbar.css";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";

function Navbar() {
    return (
        <header className="navbar">

            <div className="navbar-left">

                <button className="menu-btn">
                    <MenuRoundedIcon />
                </button>

                <div className="search-box">

                    <SearchRoundedIcon />

                    <input
                        type="text"
                        placeholder="Search employees, tickets..."
                    />

                </div>

            </div>

            <div className="navbar-right">

                <button className="icon-btn">
                    <NotificationsNoneRoundedIcon />
                    <span className="badge">3</span>
                </button>

                <button className="icon-btn">
                    <SettingsOutlinedIcon />
                </button>

                <div className="user-profile">

                    <div className="avatar">
                        H
                    </div>

                    <div>

                        <h4>Hamza</h4>

                        <p>Administrator</p>

                    </div>

                </div>

            </div>

        </header>
    );
}

export default Navbar;