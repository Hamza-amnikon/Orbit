import { useEffect, useState } from "react";
import axios from "axios";
import { CloseRounded } from "@mui/icons-material";

const EVENT_API = "https://localhost:7234/api/Event";
const LOCATION_API = "https://localhost:7281/api/location";

export default function HolidayEventForm({
    onClose,
    onSaved,
    selectedEvent
}) {

    const [formData, setFormData] = useState({
        eventName: selectedEvent?.eventName || "",
        eventDate: selectedEvent?.eventDate || "",
        eventType: selectedEvent?.eventType || "",
        description: selectedEvent?.description || "",
        status: selectedEvent?.status || "Active",
        locationCode: selectedEvent?.locationCode || "",
    });

    const [locations, setLocations] = useState([]);
    const [saving, setSaving] = useState(false);

    // ==========================================
    // GET LOCATIONS
    // ==========================================

    useEffect(() => {

        const fetchLocations = async () => {

            try {

                const response = await axios.get(LOCATION_API);

                setLocations(response.data);

            } catch (error) {

                console.error(
                    "Error loading locations:",
                    error
                );

            }
        };

        fetchLocations();

    }, []);


    // ==========================================
    // Handle Input Change
    // ==========================================

    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value,
        });
    };


    // ==========================================
    // Save Holiday / Event
    // ==========================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            setSaving(true);

            const payload = {
                eventId: selectedEvent?.eventId || 0,
                eventName: formData.eventName,
                eventDate: formData.eventDate,
                eventType: formData.eventType,
                description: formData.description,
                status: formData.status,
                locationCode: formData.locationCode,
                createdDate: new Date()
                    .toISOString()
                    .split("T")[0],
            };

            console.log("Saving Event:", payload);


            if (selectedEvent) {

                // EDIT existing event

                await axios.put(
                    `${EVENT_API}/${selectedEvent.eventId}`,
                    payload
                );

            } else {

                // ADD new event

                await axios.post(
                    EVENT_API,
                    payload
                );
            }


            onSaved();

            onClose();

        } catch (error) {

            console.error(
                "Error saving holiday/event:",
                error
            );

        } finally {

            setSaving(false);

        }
    };


    return (

        <div className="event-modal-overlay">

            <div className="event-modal">

                {/* ================= HEADER ================= */}

                <div className="event-modal-header">

                    <div>

                        <h2>
                            Add Holiday / Event
                        </h2>

                        <p>
                            Add a company holiday or important event.
                        </p>

                    </div>

                    <button
                        type="button"
                        className="event-modal-close"
                        onClick={onClose}
                    >
                        <CloseRounded />
                    </button>

                </div>


                {/* ================= FORM ================= */}

                <form
                    className="event-form"
                    onSubmit={handleSubmit}
                >

                    {/* Event Name */}

                    <div className="event-form-group">

                        <label>
                            Event Name
                        </label>

                        <input
                            type="text"
                            name="eventName"
                            value={formData.eventName}
                            onChange={handleChange}
                            placeholder="Enter event name"
                            required
                        />

                    </div>


                    {/* Event Date + Event Type */}

                    <div className="event-form-row">

                        {/* Event Date */}

                        <div className="event-form-group">

                            <label>
                                Event Date
                            </label>

                            <input
                                type="date"
                                name="eventDate"
                                value={formData.eventDate}
                                onChange={handleChange}
                                required
                            />

                        </div>


                        {/* Event Type */}

                        <div className="event-form-group">

                            <label>
                                Event Type
                            </label>

                            <select
                                name="eventType"
                                value={formData.eventType}
                                onChange={handleChange}
                                required
                            >

                                <option value="" disabled>
                                    Select event type
                                </option>

                                <option value="Public Holiday">
                                    Public Holiday
                                </option>

                                <option value="Optional Holiday">
                                    Optional Holiday
                                </option>

                                <option value="Company Holiday">
                                    Company Holiday
                                </option>

                                <option value="Company Event">
                                    Company Event
                                </option>

                                <option value="Observance">
                                    Observance
                                </option>

                            </select>

                        </div>

                    </div>


                    {/* Description */}

                    <div className="event-form-group">

                        <label>
                            Description
                        </label>

                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                            placeholder="Enter description"
                        />

                    </div>


                    {/* ================= STATUS + LOCATION ================= */}

                    <div className="event-form-row">

                        {/* Status */}

                        <div
                            className="event-form-group"
                            style={{ flex: "0.4" }}
                        >

                            <label>
                                Status
                            </label>

                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                            >

                                <option value="Active">
                                    Active
                                </option>

                                <option value="Inactive">
                                    Inactive
                                </option>

                            </select>

                        </div>


                        {/* Location */}

                        <div
                            className="event-form-group"
                            style={{ flex: "0.6" }}
                        >

                            <label>
                                Location
                            </label>

                            <select
                                name="locationCode"
                                value={formData.locationCode}
                                onChange={handleChange}
                                required
                            >

                                <option value="" disabled>
                                    Select location
                                </option>

                                {locations
                                    .filter(
                                        (location) =>
                                            location.status === "Active"
                                    )
                                    .map((location) => (

                                        <option
                                            key={location.locationId}
                                            value={location.locationCode}
                                        >
                                            {location.locationName}
                                        </option>

                                    ))}

                            </select>

                        </div>

                    </div>


                    {/* ================= BUTTONS ================= */}

                    <div className="event-form-actions">

                        <button
                            type="button"
                            className="event-cancel-btn"
                            onClick={onClose}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="event-save-btn"
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : "Save Holiday / Event"}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}