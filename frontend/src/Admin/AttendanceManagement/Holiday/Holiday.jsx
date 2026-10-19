import { MuiButtonMigration } from "../../../components/ui/MuiCompat.jsx";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import HolidayEventForm from "./HolidayEventForm";

import {
    AddRounded,
    EditRounded,
    DeleteOutlineRounded,
    ArrowBackRounded,
    FileDownloadOutlined,
    SearchRounded,
} from "@mui/icons-material";

import { Alert, Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, InputAdornment, MenuItem, Snackbar, TextField } from "@mui/material";
import { exportRowsToExcel } from "../../../utils/exportExcel";

import "./HolidayEvents.css";

import { useAuth } from "../../../context/AuthContext";
import { Box as MuiLayoutBox, Typography as MuiText } from "@mui/material";

const API_URL = `${import.meta.env.VITE_EVENT_API_BASE_URL}/api/Event`;

const LOCATION_API =
    `${import.meta.env.VITE_LOCATION_API_BASE_URL}/api/location`;

export default function HolidayEvents() {
    const navigate = useNavigate();

    const { hasPermission } = useAuth();

    const permissionRoute = "/attendance/Holiday";

    const canView = hasPermission(permissionRoute, "view");
    const canCreate = hasPermission(permissionRoute, "create");
    const canEdit = hasPermission(permissionRoute, "edit");
    const canDelete = hasPermission(permissionRoute, "delete");

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [locations, setLocations] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [notice, setNotice] = useState({ open: false, message: "", severity: "success" });

    useEffect(() => {

        if (!canView) {
            return;
        }

        loadEvents();
        loadLocations();

    }, [canView]);

    async function loadEvents() {
        try {
            setLoading(true);

            const response = await axios.get(API_URL);

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

    async function loadLocations() {
        try {
            const response = await axios.get(LOCATION_API);

            setLocations(response.data);

        } catch (error) {
            console.error(
                "Error loading locations:",
                error
            );
        }
    }

    function getLocationName(locationCode) {

        const location = locations.find(
            (location) =>
                location.locationCode === locationCode
        );

        return location?.locationName || "-";
    }

    async function deleteEvent(eventId) {

        if (!canDelete) {
            return;
        }

        try {

            await axios.delete(
                `${API_URL}/${eventId}`
            );

            // Refresh table after delete
            loadEvents();
            setDeleteTarget(null);
            setNotice({ open: true, severity: "success", message: "Holiday or event deleted." });

        } catch (error) {

            console.error(
                "Error deleting holiday/event:",
                error
            );
            setNotice({ open: true, severity: "error", message: "Could not delete this holiday or event." });
        }
    }

    const normalizedEvents = Array.isArray(events) ? events : [];
    const filteredEvents = normalizedEvents.filter((event) => {
        const query = search.trim().toLowerCase();
        const matchesSearch = !query || [event.eventName, event.eventType, getLocationName(event.locationCode)].some((value) => String(value || "").toLowerCase().includes(query));
        const matchesStatus = !statusFilter || String(event.status || "").toLowerCase() === statusFilter.toLowerCase();
        return matchesSearch && matchesStatus;
    });
    const activeCount = normalizedEvents.filter((event) => String(event.status || "").toLowerCase() === "active").length;
    const inactiveCount = normalizedEvents.filter((event) => String(event.status || "").toLowerCase() === "inactive").length;

    async function handleExport() {
        try {
            await exportRowsToExcel(filteredEvents.map((event) => ({ ...event, locationName: getLocationName(event.locationCode) })), [
                ["Event Name", "eventName"], ["Date", (event) => event.eventDate ? new Date(event.eventDate).toLocaleDateString("en-GB") : ""],
                ["Type", "eventType"], ["Location", "locationName"], ["Status", "status"],
            ], "Holidays-and-Events.xlsx", "Holidays");
            setNotice({ open: true, severity: "success", message: `Exported ${filteredEvents.length} holidays and events.` });
        } catch (error) {
            console.error("Holiday export error", error);
            setNotice({ open: true, severity: "error", message: "Could not export holidays and events." });
        }
    }

    if (!canView) {
        return null;
    }

    return (
        <MuiLayoutBox className="holiday-events-page" component="div">

            {/* Header */}

            <MuiLayoutBox className="holiday-events-header" component="div">

                <MuiLayoutBox className="attendance-header-leading" component="div">
                    <IconButton aria-label="Back to Attendance" onClick={() => navigate("/attendance")} className="attendance-back-button"><ArrowBackRounded /></IconButton>

                <MuiLayoutBox component="div">

                    <MuiText component="h1" variant="h4">
                        Holidays & Events
                    </MuiText>

                    <MuiText component="p" variant="body1">
                        Manage company holidays, events and important dates.
                    </MuiText>

                </MuiLayoutBox>
                </MuiLayoutBox>

                <MuiLayoutBox className="holiday-events-header-actions" component="div">
                <Button variant="outlined" startIcon={<FileDownloadOutlined />} onClick={handleExport}>Export Excel</Button>
                {canCreate && (
                    <MuiButtonMigration
                        type="button"
                        className="add-event-btn"
                        onClick={() => setShowForm(true)}
                    >
                        <AddRounded />

                        Add Holiday / Event
                    </MuiButtonMigration>
                )}
                </MuiLayoutBox>

            </MuiLayoutBox>

            <Grid container spacing={2} className="holiday-summary-grid">
                {[
                    { label: "All Holidays & Events", count: normalizedEvents.length, value: "" },
                    { label: "Active", count: activeCount, value: "Active" },
                    { label: "Inactive", count: inactiveCount, value: "Inactive" },
                ].map((item) => <Grid key={item.label} size={{ xs: 12, sm: 4 }}><Card component="button" type="button" className={`holiday-summary-card ${statusFilter === item.value ? "selected" : ""}`} onClick={() => setStatusFilter((current) => current === item.value ? "" : item.value)} aria-pressed={statusFilter === item.value}><CardContent><span>{item.label}</span><strong>{item.count}</strong></CardContent></Card></Grid>)}
            </Grid>

            <MuiLayoutBox className="holiday-filter-card" component="div">
                <TextField fullWidth placeholder="Search holiday, event, type or location..." value={search} onChange={(event) => setSearch(event.target.value)} slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchRounded color="action" /></InputAdornment> } }} />
                <TextField select label="Status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><MenuItem value="">All Status</MenuItem><MenuItem value="Active">Active</MenuItem><MenuItem value="Inactive">Inactive</MenuItem></TextField>
            </MuiLayoutBox>


            {/* Table */}

            <MuiLayoutBox className="holiday-events-card" component="div">

                {/* Table Header */}

                <MuiLayoutBox className="holiday-events-table-header" component="div">

                    <MuiText component="span" variant="inherit">
                        Event Name
                    </MuiText>

                    <MuiText component="span" variant="inherit">
                        Date
                    </MuiText>

                    <MuiText component="span" variant="inherit">
                        Type
                    </MuiText>

                    <MuiText component="span" variant="inherit">
                        Location
                    </MuiText>

                    <MuiText component="span" variant="inherit">
                        Status
                    </MuiText>

                    <MuiText component="span" variant="inherit">
                        Actions
                    </MuiText>

                </MuiLayoutBox>


                {/* Loading */}

                {loading ? (

                    <MuiLayoutBox className="event-table-message" component="div">
                        Loading...
                    </MuiLayoutBox>

                ) : filteredEvents.length === 0 ? (

                    <MuiLayoutBox className="event-table-message" component="div">
                        No holidays or events found.
                    </MuiLayoutBox>

                ) : (

                    /* Event Rows */

                    filteredEvents.map((event) => (

                        <MuiLayoutBox
                            className="holiday-events-table-row"
                            key={event.eventId}
                         component="div">

                            {/* Event Name */}

                            <MuiText className="event-name" component="span" variant="inherit">
                                {event.eventName}
                            </MuiText>


                            {/* Date */}

                            <MuiText component="span" variant="inherit">
                                {new Date(
                                    event.eventDate
                                ).toLocaleDateString("en-GB")}
                            </MuiText>


                            {/* Type */}

                            <MuiText component="span" variant="inherit">
                                {event.eventType}
                            </MuiText>


                            {/* Location */}

                            <MuiText component="span" variant="inherit">
                                {getLocationName(
                                    event.locationCode
                                )}
                            </MuiText>


                            {/* Status */}

                            <MuiText component="span" variant="inherit">

                                <MuiText
                                    className={`event-status ${
                                        event.status?.toLowerCase() === "active"
                                            ? "active"
                                            : "inactive"
                                    }`}
                                 component="span" variant="inherit">
                                    {event.status}
                                </MuiText>

                            </MuiText>


                            {/* Actions */}

                            <MuiText className="event-actions" component="span" variant="inherit">

                                {/* Edit */}

                                {canEdit && (
                                    <MuiButtonMigration
                                        type="button"
                                        className="event-edit-btn"
                                        title="Edit"
                                        onClick={() => {
                                            setSelectedEvent(event);
                                            setShowForm(true);
                                        }}
                                    >
                                        <EditRounded />
                                    </MuiButtonMigration>
                                )}


                                {/* Delete */}

                                {canDelete && (
                                    <MuiButtonMigration
                                        type="button"
                                        className="event-delete-btn"
                                        title="Delete"
                                        onClick={() => setDeleteTarget(event)}
                                    >
                                        <DeleteOutlineRounded />
                                    </MuiButtonMigration>
                                )}

                            </MuiText>

                        </MuiLayoutBox>

                    ))

                )}

            </MuiLayoutBox>


            {/* Add / Edit Form */}

            {showForm && (canCreate || canEdit) && (

                <HolidayEventForm

                    onClose={() => {
                        setShowForm(false);
                        setSelectedEvent(null);
                    }}

                    onSaved={loadEvents}

                    selectedEvent={selectedEvent}

                />

            )}

            <Dialog className="holiday-delete-dialog" open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
                <DialogTitle>Delete holiday or event?</DialogTitle>
                <DialogContent>Delete “{deleteTarget?.eventName}”? This action cannot be undone.</DialogContent>
                <DialogActions><Button onClick={() => setDeleteTarget(null)}>Cancel</Button><Button color="error" variant="contained" onClick={() => deleteEvent(deleteTarget?.eventId)}>Delete</Button></DialogActions>
            </Dialog>

            <Snackbar open={notice.open} autoHideDuration={4500} onClose={() => setNotice((current) => ({ ...current, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
                <Alert severity={notice.severity} variant="filled" onClose={() => setNotice((current) => ({ ...current, open: false }))}>{notice.message}</Alert>
            </Snackbar>

        </MuiLayoutBox>
    );
}
