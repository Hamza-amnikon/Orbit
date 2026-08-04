import "./Navbar.css";

import { useEffect, useState } from "react";

import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import SearchIcon from "@mui/icons-material/Search";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

import { getProfile } from "../Services/ProfileService";

function Navbar() {

    const [profile, setProfile] = useState(null);

    useEffect(() => {

        async function loadProfile() {

            try {

                const data = await getProfile();

                setProfile(data);

            }
            catch (err) {

                console.error("Navbar:", err);

            }

        }

        loadProfile();

    }, []);

    return (

        <header className="employee-navbar">

            <div className="navbar-left">

                <h2>Dashboard</h2>

            </div>

            <div className="navbar-right">

                <div className="search-box">

                    <SearchIcon />

                    <input
                        type="text"
                        placeholder="Search..."
                    />

                </div>

                <button className="notification-btn">

                    <NotificationsNoneIcon />

                </button>

                <div className="profile">

                    <div className="avatar">

                        {profile?.photoUrl ? (

                            <img
                                src={profile.photoUrl}
                                alt={profile.displayName}
                                className="navbar-avatar-image"
                            />

                        ) : (

                            profile?.displayName
                                ?.charAt(0)
                                ?.toUpperCase() || "?"

                        )}

                    </div>

                    <div className="profile-info">

                        <h4>

                            {profile?.displayName || "Employee"}

                        </h4>

                        <span>

                            {profile?.jobTitle || "Employee"}

                        </span>

                    </div>

                    <KeyboardArrowDownIcon />

                </div>

            </div>

        </header>

    );

}

export default Navbar;