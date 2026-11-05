import { useEffect, useState } from "react";
import { Favorite, Home, Person, Phone } from "@mui/icons-material";
import { Alert, Box, Button, TextField, Typography } from "@mui/material";
import { updateEmergencyContact } from "../../Services/ProfileService";
import "./Profile.css";

const fields = [
    { key: "emergencyContactName", label: "Contact Person", icon: Person, maxLength: 150 },
    { key: "emergencyRelationship", label: "Relationship", icon: Favorite, maxLength: 100 },
    { key: "emergencyPhone", label: "Phone Number", icon: Phone, maxLength: 32 },
    { key: "emergencyAddress", label: "Address", icon: Home, maxLength: 500 },
];

const contactFromProfile = (profile) => Object.fromEntries(
    fields.map(({ key }) => [key, profile?.[key] ?? ""])
);

export default function EmergencyContact({ profile, onUpdated }) {
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState(() => contactFromProfile(profile));
    const [message, setMessage] = useState(null);

    useEffect(() => {
        if (!editing) setForm(contactFromProfile(profile));
    }, [profile, editing]);

    if (!profile) return null;

    const save = async () => {
        setSaving(true);
        setMessage(null);
        try {
            const updated = await updateEmergencyContact(form);
            onUpdated?.(updated);
            setEditing(false);
            setMessage({ severity: "success", text: "Emergency contact saved in SPARK." });
        } catch (error) {
            setMessage({
                severity: "error",
                text: error.response?.data?.message || "Could not save the emergency contact. Please try again.",
            });
        } finally {
            setSaving(false);
        }
    };

    const cancel = () => {
        setForm(contactFromProfile(profile));
        setEditing(false);
        setMessage(null);
    };

    return (
        <Box className={`profile-section emergency-contact-section${editing ? " is-editing" : ""}`}>
            <Box className="section-header">
                <Box className="section-icon emergency-icon"><Favorite /></Box>
                <Box className="emergency-contact-heading">
                    <Typography component="h3" variant="h6">Emergency Contact</Typography>
                    <Typography component="p">Primary emergency contact details</Typography>
                </Box>
                {!editing && <Button variant="outlined" disabled={profile.emergencyContactUnavailable} onClick={() => { setMessage(null); setEditing(true); }}>Edit contact</Button>}
            </Box>

            {profile.emergencyContactUnavailable && <Alert severity="warning" className="emergency-contact-message">Emergency contact data is temporarily unavailable.</Alert>}
            {message && <Alert severity={message.severity} className="emergency-contact-message">{message.text}</Alert>}

            <Box className="section-body">
                {fields.map(({ key, label, icon: Icon, maxLength }) => (
                    <Box className="profile-item emergency-contact-item" key={key}>
                        <Icon className="item-icon" />
                        <Box className="emergency-contact-value">
                            {editing ? (
                                <>
                                    <Box component="label" htmlFor={`emergency-${key}`}>{label}</Box>
                                    <TextField
                                        id={`emergency-${key}`}
                                        className="emergency-contact-field"
                                        fullWidth
                                        placeholder={`Enter ${label.toLowerCase()}`}
                                        value={form[key]}
                                        onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
                                        disabled={saving}
                                        multiline={key === "emergencyAddress"}
                                        minRows={key === "emergencyAddress" ? 2 : undefined}
                                        type={key === "emergencyPhone" ? "tel" : "text"}
                                        slotProps={{ htmlInput: { maxLength } }}
                                    />
                                </>
                            ) : (
                                <>
                                    <Box component="label">{label}</Box>
                                    <Typography component="span">{profile[key] || "-"}</Typography>
                                </>
                            )}
                        </Box>
                    </Box>
                ))}
            </Box>

            {editing && (
                <Box className="emergency-contact-actions">
                    <Button onClick={cancel} disabled={saving}>Cancel</Button>
                    <Button variant="contained" onClick={save} disabled={saving}>
                        {saving ? "Saving…" : "Save contact"}
                    </Button>
                </Box>
            )}
        </Box>
    );
}
