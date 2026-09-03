import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./DashboardBottom.css";

import PersonIcon from "@mui/icons-material/Person";
import EventNoteIcon from "@mui/icons-material/EventNote";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import DescriptionIcon from "@mui/icons-material/Description";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

const EVENT_API = "https://localhost:7234";

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

                /*
                 * EventService.API
                 *
                 * If your controller route is:
                 *   [Route("api/[controller]")]
                 *
                 * and controller is EventController,
                 * this becomes:
                 *
                 *   https://localhost:7234/api/Event
                 */

                const response = await fetch(
                    `${EVENT_API}/api/Event`
                );

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
        <div className="dashboard-bottom">

            {/* =====================================================
                UPCOMING HOLIDAYS
            ===================================================== */}

            <section className="holidays-card">

                <div className="bottom-card-header">

                    <div className="bottom-title-wrapper">

                        <div className="bottom-title-icon">
                            <CalendarMonthIcon />
                        </div>

                        <div>
                            <h3>Upcoming Holidays</h3>

                            <p>
                                Company holidays and events
                            </p>
                        </div>

                    </div>

                    <button
                        className="view-events-button"
                        onClick={() =>
                            navigate("/employee/attendance")
                        }
                    >
                        View All
                    </button>

                </div>

                <div className="holiday-list">

                    {loadingHolidays ? (
                        <div className="holiday-loading">
                            <div className="holiday-skeleton"></div>
                            <div className="holiday-skeleton"></div>
                            <div className="holiday-skeleton"></div>
                        </div>
                    ) : holidays.length > 0 ? (
                        holidays.map((holiday) => (
                            <div
                                className="holiday-row"
                                key={holiday.id}
                            >

                                <div className="holiday-date-box">

                                    <span className="holiday-day">
                                        {new Date(
                                            holiday.date
                                        ).getDate()}
                                    </span>

                                    <span className="holiday-month">
                                        {new Date(
                                            holiday.date
                                        ).toLocaleDateString(
                                            "en-US",
                                            {
                                                month: "short",
                                            }
                                        )}
                                    </span>

                                </div>

                                <div className="holiday-details">

                                    <strong>
                                        {holiday.name}
                                    </strong>

                                    <p>
                                        {formatHolidayDate(
                                            holiday.date
                                        )}
                                    </p>

                                </div>

                            </div>
                        ))
                    ) : (
                        <div className="no-holidays">

                            <CalendarMonthIcon />

                            <span>
                                No upcoming holidays
                            </span>

                        </div>
                    )}

                </div>

            </section>


            {/* =====================================================
                QUICK ACTIONS
            ===================================================== */}

            <section className="actions-card">

                <div className="bottom-card-header">

                    <div className="bottom-title-wrapper">

                        <div className="bottom-title-icon">
                            <EventNoteIcon />
                        </div>

                        <div>
                            <h3>Quick Actions</h3>

                            <p>
                                Frequently used actions
                            </p>
                        </div>

                    </div>

                </div>


                <div className="quick-actions">

                    <button
                        onClick={goToProfile}
                        className="quick-action"
                    >

                        <span className="quick-action-icon">
                            <PersonIcon />
                        </span>

                        <span className="quick-action-text">
                            <strong>View Profile</strong>
                            <small>
                                View your employee profile
                            </small>
                        </span>

                    </button>


                    <button
                        onClick={goToAttendance}
                        className="quick-action"
                    >

                        <span className="quick-action-icon">
                            <AccessTimeIcon />
                        </span>

                        <span className="quick-action-text">
                            <strong>Attendance</strong>
                            <small>
                                Check your attendance
                            </small>
                        </span>

                    </button>


                    <button
                        onClick={goToLeave}
                        className="quick-action"
                    >

                        <span className="quick-action-icon">
                            <EventNoteIcon />
                        </span>

                        <span className="quick-action-text">
                            <strong>Apply Leave</strong>
                            <small>
                                Submit a leave request
                            </small>
                        </span>

                    </button>


                    <button
                        onClick={goToDocuments}
                        className="quick-action"
                    >

                        <span className="quick-action-icon">
                            <DescriptionIcon />
                        </span>

                        <span className="quick-action-text">
                            <strong>Documents</strong>
                            <small>
                                View your documents
                            </small>
                        </span>

                    </button>

                </div>

            </section>

        </div>
    );
}

export default DashboardBottom;