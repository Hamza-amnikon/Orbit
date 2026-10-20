import { useRef, useState } from "react";
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { archiveVendor, getVendorById } from "./VendorService";

export default function VendorArchiveDialog({ vendor, onClose, onArchived }) {
    const [current, setCurrent] = useState(vendor);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [conflict, setConflict] = useState(false);
    const locked = useRef(false);

    async function archive() {
        if (locked.current) return;
        locked.current = true;
        setBusy(true);
        setError("");
        try {
            await archiveVendor(current.id, current.rowVersion);
            onArchived();
        } catch (archiveError) {
            setError(archiveError.message);
            setConflict(archiveError.status === 409);
        } finally {
            locked.current = false;
            setBusy(false);
        }
    }

    async function reload() {
        if (locked.current) return;
        locked.current = true;
        setBusy(true);
        try {
            setCurrent(await getVendorById(current.id));
            setError("");
            setConflict(false);
        } catch (loadError) {
            setError(loadError.message);
        } finally {
            locked.current = false;
            setBusy(false);
        }
    }

    return <Dialog open fullWidth maxWidth="xs" aria-labelledby="vendor-archive-title"
        onClose={() => { if (!busy) onClose(); }}>
        <DialogTitle id="vendor-archive-title">Archive vendor?</DialogTitle>
        <DialogContent>
            <DialogContentText>
                Archive "{current.name}"? The vendor becomes inactive. Existing details and purchase history are kept.
            </DialogContentText>
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            {!current.isActive && <Alert severity="info" sx={{ mt: 2 }}>This vendor is already inactive.</Alert>}
            {conflict && <Button sx={{ mt: 1 }} onClick={reload} disabled={busy}>Refresh vendor before confirming</Button>}
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose} disabled={busy}>Cancel</Button>
            <Button variant="contained" color="warning" onClick={archive}
                disabled={busy || conflict || !current.isActive || !current.rowVersion}>
                {busy ? "Archiving..." : "Archive Vendor"}
            </Button>
        </DialogActions>
    </Dialog>;
}
