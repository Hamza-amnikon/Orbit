import "./DashboardBottom.css";

import PersonIcon from "@mui/icons-material/Person";
import EventNoteIcon from "@mui/icons-material/EventNote";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import DescriptionIcon from "@mui/icons-material/Description";

function DashboardBottom() {

    const holidays = [
        {
            name: "Independence Day",
            date: "15 Aug 2026"
        },
        {
            name: "Gandhi Jayanti",
            date: "02 Oct 2026"
        },
        {
            name: "Diwali",
            date: "08 Nov 2026"
        }
    ];

    const notifications = [
        "Leave request approved",
        "Attendance updated",
        "Company meeting tomorrow",
        "New HR policy published"
    ];

    return (

        <div className="dashboard-bottom">

            <div className="notifications-card">

                <h3>Recent Notifications</h3>

                {
                    notifications.map((item,index)=>(
                        <div
                            className="notification-item"
                            key={index}
                        >
                            {item}
                        </div>
                    ))
                }

            </div>

            <div className="holidays-card">

                <h3>Upcoming Holidays</h3>

                {
                    holidays.map((holiday,index)=>(

                        <div
                            className="holiday-row"
                            key={index}
                        >

                            <div>

                                <strong>{holiday.name}</strong>

                                <p>{holiday.date}</p>

                            </div>

                        </div>

                    ))
                }

            </div>

            <div className="actions-card">

                <h3>Quick Actions</h3>

                <button>
                    <PersonIcon/>
                    View Profile
                </button>

                <button>
                    <AccessTimeIcon/>
                    Attendance
                </button>

                <button>
                    <EventNoteIcon/>
                    Apply Leave
                </button>

                <button>
                    <DescriptionIcon/>
                    Documents
                </button>

            </div>

        </div>

    );

}

export default DashboardBottom;