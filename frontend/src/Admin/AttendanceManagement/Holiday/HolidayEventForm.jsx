import { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import {
    Alert,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    IconButton,
    MenuItem,
    Snackbar,
    TextField,
} from "@mui/material";
import { CloseRounded } from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

const API_URL = `${import.meta.env.VITE_EVENT_API_BASE_URL}/api/Event`;
const LOCATION_API = `${import.meta.env.VITE_LOCATION_API_BASE_URL}/api/location`;
const eventTypes = ["Public Holiday", "Optional Holiday", "Company Holiday", "Company Event", "Observance"];

export default function HolidayEventForm({ onClose, onSaved, selectedEvent }) {
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
    const [notice, setNotice] = useState({ open: false, message: "" });

    useEffect(() => {
        let active = true;
        axios.get(LOCATION_API)
            .then((response) => {
                const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
                if (active) setLocations(data);
            })
            .catch((error) => console.error("Error loading locations:", error));
        return () => { active = false; };
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((current) => ({ ...current, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            setSaving(true);
            const payload = {
                eventId: selectedEvent?.eventId || 0,
                ...formData,
                createdDate: new Date().toISOString().split("T")[0],
            };
            if (selectedEvent) {
                await axios.put(`${API_URL}/${selectedEvent.eventId}`, payload);
            } else {
                await axios.post(API_URL, payload);
            }
            onSaved();
            onClose();
        } catch (error) {
            console.error("Error saving holiday/event:", error);
            setNotice({ open: true, message: "Could not save the holiday or event. Please try again." });
        } finally {
            setSaving(false);
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Dialog
                open
                onClose={saving ? undefined : onClose}
                fullWidth
                maxWidth="sm"
                aria-labelledby="holiday-form-title"
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle id="holiday-form-title" sx={{ pr: 7, pb: 1 }}>
                    {selectedEvent ? "Edit Holiday / Event" : "Add Holiday / Event"}
                    <IconButton aria-label="Close" onClick={onClose} disabled={saving} sx={{ position: "absolute", right: 12, top: 12 }}>
                        <CloseRounded />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers sx={{ pt: 2.5 }}>
                    <Grid container spacing={2} component="form" id="holiday-event-form" onSubmit={handleSubmit}>
                        <Grid size={{ xs: 12 }}>
                            <TextField autoFocus required fullWidth label="Event Name" name="eventName" value={formData.eventName} onChange={handleChange} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <DatePicker
                                label="Event Date"
                                value={formData.eventDate ? dayjs(formData.eventDate) : null}
                                onChange={(value) => setFormData((current) => ({ ...current, eventDate: value?.isValid() ? value.format("YYYY-MM-DD") : "" }))}
                                format="DD-MM-YYYY"
                                slotProps={{ textField: { required: true, fullWidth: true, size: "small", className: "holiday-event-date" } }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField select required fullWidth label="Event Type" name="eventType" value={formData.eventType} onChange={handleChange}>
                                <MenuItem value="" disabled>Select event type</MenuItem>
                                {eventTypes.map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField fullWidth multiline minRows={3} label="Description" name="description" value={formData.description} onChange={handleChange} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 5 }}>
                            <TextField select fullWidth label="Status" name="status" value={formData.status} onChange={handleChange}>
                                <MenuItem value="Active">Active</MenuItem>
                                <MenuItem value="Inactive">Inactive</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 7 }}>
                            <TextField select required fullWidth label="Location" name="locationCode" value={formData.locationCode} onChange={handleChange}>
                                <MenuItem value="" disabled>Select location</MenuItem>
                                {locations.filter((location) => location.status === "Active").map((location) => (
                                    <MenuItem key={location.locationId} value={location.locationCode}>{location.locationName}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={onClose} disabled={saving} color="inherit">Cancel</Button>
                    <Button type="submit" form="holiday-event-form" variant="contained" disabled={saving}>
                        {saving ? "Saving…" : selectedEvent ? "Save Changes" : "Save Holiday / Event"}
                    </Button>
                </DialogActions>
                <Snackbar open={notice.open} autoHideDuration={4500} onClose={() => setNotice((current) => ({ ...current, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
                    <Alert severity="error" variant="filled" onClose={() => setNotice((current) => ({ ...current, open: false }))}>{notice.message}</Alert>
                </Snackbar>
            </Dialog>
        </LocalizationProvider>
    );
}
