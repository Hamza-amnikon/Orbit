import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./DashboardBottom.css";

import PersonIcon from "@mui/icons-material/Person";
import EventNoteIcon from "@mui/icons-material/EventNote";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import DescriptionIcon from "@mui/icons-material/Description";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { Box as MuiLayoutBox, Typography as MuiText } from "@mui/material";

const API_URL = `${import.meta.env.VITE_EVENT_API_BASE_URL}/api/Event`;

function DashboardBottom() {
    const navigate = useNavigate();

    const [holidays, setHolidays] = useState([]);
    const [loadingHolidays, setLoadingHolidays] = useState(true);

    // =========================================================
    // GET UPCOMING HOLIDAYS FROM EVENT API
    // =========================================================

    useEffect(() => {
        const loadHolidays = async () => {
            try {
                setLoadingHolidays(true);

                const response = await fetch(API_URL);

                if (!response.ok) {
                    throw new Error(
                        `Event API returned ${response.status}`
                    );
                }

                const result = await response.json();

                console.log("Event API Response:", result);

                // Handle common API response formats
                let eventData = [];

                if (Array.isArray(result)) {
                    eventData = result;
                } else if (Array.isArray(result?.data)) {
                    eventData = result.data;
                } else if (Array.isArray(result?.events)) {
                    eventData = result.events;
                } else if (Array.isArray(result?.items)) {
                    eventData = result.items;
                }

                // =====================================================
                // NORMALIZE EVENT DATA
                // =====================================================

                const normalizedEvents = eventData
                    .map((event) => {
                        const name =
                            event.name ??
                            event.eventName ??
                            event.title ??
                            event.eventTitle ??
                            event.holidayName ??
                            "Holiday";

                        const date =
                            event.date ??
                            event.eventDate ??
                            event.holidayDate ??
                            event.startDate ??
                            event.startDateTime;

                        if (!date) {
                            return null;
                        }

                        return {
                            id:
                                event.id ??
                                event.eventId ??
                                event.eventID ??
                                `${name}-${date}`,

                            name: name,

                            date: date,
                        };
                    })
                    .filter(Boolean);

                // =====================================================
                // ONLY UPCOMING EVENTS
                // =====================================================

                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const upcomingEvents = normalizedEvents
                    .filter((event) => {
                        const eventDate = new Date(event.date);

                        if (Number.isNaN(eventDate.getTime())) {
                            return false;
                        }

                        eventDate.setHours(0, 0, 0, 0);

                        return eventDate >= today;
                    })
                    .sort(
                        (a, b) =>
                            new Date(a.date) -
                            new Date(b.date)
                    )
                    .slice(0, 3);

                setHolidays(upcomingEvents);
            } catch (error) {
                console.error(
                    "Unable to load Event API:",
                    error
                );

                setHolidays([]);
            } finally {
                setLoadingHolidays(false);
            }
        };

        loadHolidays();
    }, []);

    // =========================================================
    // FORMAT DATE
    // =========================================================

    const formatHolidayDate = (date) => {
        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return date;
        }

        return parsedDate.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    // =========================================================
    // QUICK ACTIONS
    // =========================================================

    const goToProfile = () => {
        navigate("/employee/profile");
    };

    const goToAttendance = () => {
        navigate("/employee/attendance");
    };

    const goToLeave = () => {
        navigate("/employee/leave");
    };

    const goToDocuments = () => {
        navigate("/employee/documents");
    };

    return (
        <MuiLayoutBox className="dashboard-bottom" component="div">

            {/* =====================================================
                UPCOMING HOLIDAYS
            ===================================================== */}

            <MuiLayoutBox className="holidays-card" component="section">

                <MuiLayoutBox className="bottom-card-header" component="div">

                    <MuiLayoutBox className="bottom-title-wrapper" component="div">

                        <MuiLayoutBox className="bottom-title-icon" component="div">
                            <CalendarMonthIcon />
                        </MuiLayoutBox>

                        <MuiLayoutBox component="div">
                            <MuiText component="h3" variant="h6">Upcoming Holidays</MuiText>

                            <MuiText component="p" variant="body1">
                                Company holidays and events
                            </MuiText>
                        </MuiLayoutBox>

                    </MuiLayoutBox>

                    

                </MuiLayoutBox>

                <MuiLayoutBox className="holiday-list" component="div">

                    {loadingHolidays ? (
                        <MuiLayoutBox className="holiday-loading" component="div">
                            <MuiLayoutBox className="holiday-skeleton" component="div"></MuiLayoutBox>
                            <MuiLayoutBox className="holiday-skeleton" component="div"></MuiLayoutBox>
                            <MuiLayoutBox className="holiday-skeleton" component="div"></MuiLayoutBox>
                        </MuiLayoutBox>
                    ) : holidays.length > 0 ? (
                        holidays.map((holiday) => (
                            <MuiLayoutBox
                                className="holiday-row"
                                key={holiday.id}
                             component="div">

                                <MuiLayoutBox className="holiday-date-box" component="div">

                                    <MuiText className="holiday-day" component="span" variant="inherit">
                                        {new Date(
                                            holiday.date
                                        ).getDate()}
                                    </MuiText>

                                    <MuiText className="holiday-month" component="span" variant="inherit">
                                        {new Date(
                                            holiday.date
                                        ).toLocaleDateString(
                                            "en-US",
                                            {
                                                month: "short",
                                            }
                                        )}
                                    </MuiText>

                                </MuiLayoutBox>

                                <MuiLayoutBox className="holiday-details" component="div">

                                    <MuiText component="strong" variant="inherit">
                                        {holiday.name}
                                    </MuiText>

                                    <MuiText component="p" variant="body1">
                                        {formatHolidayDate(
                                            holiday.date
                                        )}
                                    </MuiText>

                                </MuiLayoutBox>

                            </MuiLayoutBox>
                        ))
                    ) : (
                        <MuiLayoutBox className="no-holidays" component="div">

                            <CalendarMonthIcon />

                            <MuiText component="span" variant="inherit">
                                No upcoming holidays
                            </MuiText>

                        </MuiLayoutBox>
                    )}

                </MuiLayoutBox>

            </MuiLayoutBox>



        </MuiLayoutBox>
    );
}

export default DashboardBottom;
