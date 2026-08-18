import "./CalendarWidget.css";

import EventAvailableIcon from "@mui/icons-material/EventAvailable";

const holidays = [
    {
        date: "15 Aug",
        day: "Friday",
        name: "Independence Day"
    },
    {
        date: "27 Aug",
        day: "Wednesday",
        name: "Ganesh Chaturthi"
    },
    {
        date: "02 Oct",
        day: "Thursday",
        name: "Gandhi Jayanti"
    }
];

export default function CalendarWidget() {

    return (

        <div className="holiday-list">

            {holidays.map((holiday, index) => (

                <div className="holiday-card" key={index}>

                    <div className="holiday-icon">
                        <EventAvailableIcon />
                    </div>

                    <div className="holiday-details">

                        <h4>{holiday.name}</h4>

                        <p>{holiday.date} • {holiday.day}</p>

                    </div>

                </div>

            ))}

        </div>

    );

}