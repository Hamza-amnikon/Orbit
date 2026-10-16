import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Box, Button, Chip, CircularProgress, Typography } from "@mui/material";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import "./CalendarWidget.css";

const EVENT_API = `${import.meta.env.VITE_EVENT_API_BASE_URL}/api/Event`;

function getLocalDate(value) {
    if (!value) return null;
    const dateOnly = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
    const parsed = dateOnly
        ? new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]))
        : new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export default function CalendarWidget() {
    const navigate = useNavigate();
    const [holidays, setHolidays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        let active = true;
        const loadHolidays = async () => {
            try {
                setLoading(true);
                setHasError(false);
                const response = await axios.get(EVENT_API);
                const payload = response.data;
                const rows = Array.isArray(payload)
                    ? payload
                    : [payload?.data, payload?.events, payload?.items].find(Array.isArray) || [];
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const upcoming = rows
                    .map((event) => {
                        const date = getLocalDate(event.eventDate ?? event.date ?? event.holidayDate ?? event.startDate);
                        return {
                            id: event.eventId ?? event.id ?? `${event.eventName ?? event.name}-${date?.getTime()}`,
                            name: event.eventName ?? event.name ?? event.title ?? event.holidayName ?? "Holiday",
                            type: event.eventType ?? event.type ?? "Holiday",
                            status: String(event.status ?? "Active").toLowerCase(),
                            date,
                        };
                    })
                    .filter((event) => event.date && event.date >= today && event.status !== "inactive")
                    .sort((a, b) => a.date - b.date)
                    .slice(0, 4);
                if (active) setHolidays(upcoming);
            } catch (error) {
                console.error("Unable to load upcoming holidays:", error);
                if (active) setHasError(true);
            } finally {
                if (active) setLoading(false);
            }
        };
        loadHolidays();
        return () => { active = false; };
    }, []);

    const formatWeekday = (date) => date.toLocaleDateString("en-IN", { weekday: "short" });
    const formatMonth = (date) => date.toLocaleDateString("en-IN", { month: "short" });
    const daysAway = (date) => Math.round((date - new Date(new Date().setHours(0, 0, 0, 0))) / 86400000);

    return (
        <Box className="holiday-list">
            {loading ? (
                <Box className="holiday-widget-state"><CircularProgress size={22} /><Typography>Loading upcoming holidays…</Typography></Box>
            ) : hasError ? (
                <Box className="holiday-widget-state"><Typography color="text.secondary">Could not load holidays right now.</Typography></Box>
            ) : holidays.length === 0 ? (
                <Box className="holiday-widget-state"><EventAvailableIcon /><Typography color="text.secondary">No upcoming holidays scheduled.</Typography></Box>
            ) : (
                holidays.map((holiday) => (
                    <Box className="holiday-card" key={holiday.id}>
                        <Box className="holiday-date-badge" aria-label={holiday.date.toLocaleDateString("en-IN")}>
                            <Typography component="span">{formatWeekday(holiday.date)}</Typography>
                            <Typography component="strong">{holiday.date.getDate()}</Typography>
                            <Typography component="span">{formatMonth(holiday.date)}</Typography>
                        </Box>
                        <Box className="holiday-details">
                            <Typography component="h4">{holiday.name}</Typography>
                            <Typography component="p">{holiday.type}</Typography>
                        </Box>
                        <Chip size="small" label={daysAway(holiday.date) === 0 ? "Today" : `In ${daysAway(holiday.date)} days`} />
                    </Box>
                ))
            )}
            <Button className="holiday-widget-link" endIcon={<ArrowForwardRoundedIcon />} onClick={() => navigate("/attendance/Holiday")}>
                View all holidays
            </Button>
        </Box>
    );
}
