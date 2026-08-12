import { useEffect, useState } from "react";
import axios from "axios";
import HolidayEventForm from "./HolidayEventForm";

import {
    AddRounded,
    EditRounded,
    DeleteOutlineRounded,
} from "@mui/icons-material";

import "./HolidayEvents.css";

const EVENT_API = "https://localhost:7234/api/Event";

export default function HolidayEvents() {

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);

    useEffect(() => {
        loadEvents();
    }, []);

    async function loadEvents() {
        try {

            setLoading(true);

            const response = await axios.get(EVENT_API);

            setEvents(response.data);

        } catch (error) {

            console.error(
                "Error loading holidays and events:",
                error
            );

        } finally {

            setLoading(false);

        }
    }

    async function deleteEvent(eventId) {

    const confirmed = window.confirm(
        "Are you sure you want to delete this holiday/event?"
    );

    if (!confirmed) {
        return;
    }

    try {

        await axios.delete(
            `${EVENT_API}/${eventId}`
        );

        // Refresh table after delete
        loadEvents();

    } catch (error) {

        console.error(
            "Error deleting holiday/event:",
            error
        );

    }
}

    return (
        <div className="holiday-events-page">

            {/* Header */}

            <div className="holiday-events-header">

                <div>
                    <h1>Holidays & Events</h1>

                    <p>
                        Manage company holidays, events and important dates.
                    </p>
                </div>

                <button
                    type="button"
                    className="add-event-btn"
                    onClick={() => setShowForm(true)}
                >
                    <AddRounded />

                    Add Holiday / Event
                </button>

            </div>


            {/* Table */}

            <div className="holiday-events-card">

                <div className="holiday-events-table-header">

                    <span>Event Name</span>
                    <span>Date</span>
                    <span>Type</span>
                    <span>Status</span>
                    <span>Actions</span>

                </div>


                {loading ? (

                    <div className="event-table-message">
                        Loading...
                    </div>

                ) : events.length === 0 ? (

                    <div className="event-table-message">
                        No holidays or events found.
                    </div>

                ) : (

                    events.map((event) => (

                        <div
                            className="holiday-events-table-row"
                            key={event.eventId}
                        >

                            <span className="event-name">
                                {event.eventName}
                            </span>

                            <span>
                                {new Date(
                                    event.eventDate
                                ).toLocaleDateString("en-GB")}
                            </span>

                            <span>
                                {event.eventType}
                            </span>

                            <span>
                                <span
                                    className={`event-status ${event.status?.toLowerCase() === "active"
                                        ? "active"
                                        : "inactive"
                                        }`}
                                >
                                    {event.status}
                                </span>
                            </span>

                            <span className="event-actions">

                                <button
    type="button"
    className="event-edit-btn"
    title="Edit"
    onClick={() => {
    setSelectedEvent(event);
    setShowForm(true);
}}
>
    <EditRounded />
</button>

                                <button
                                    type="button"
                                    className="event-delete-btn"
                                    title="Delete"
                                    onClick={() => deleteEvent(event.eventId)}
                                >
                                    <DeleteOutlineRounded />
                                </button>

                            </span>

                        </div>

                    ))

                )}

            </div>

            {showForm && (
    <HolidayEventForm
        onClose={() => {
            setShowForm(false);
            setSelectedEvent(null);
        }}
        onSaved={loadEvents}
        selectedEvent={selectedEvent}
    />
)}

        </div>
    );
}