import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Menu, MenuItem, Slider, Stack, Typography } from "@mui/material";
import PhotoCameraRoundedIcon from "@mui/icons-material/PhotoCameraRounded";
import { defaultCoverSize, getCoverCrop, getCoverSize, initialCrop } from "./profileCoverCrop";

const coverUrl = `${String(import.meta.env.VITE_DOCUMENT_API_BASE_URL || "").replace(/\/+$/, "")}/api/Document/profile-cover`;
const maxBytes = 4 * 1024 * 1024;

async function openCoverImage(file) {
    if (file.size > maxBytes) throw new Error("Choose a cover photo no larger than 4 MB.");
    return createImageBitmap(file).catch(() => {
        throw new Error("Choose a supported image, such as JPG, PNG, or WebP.");
    });
}

async function prepareCover(file, crop, coverSize) {
    const image = await openCoverImage(file);
    try {
        const { width, height, left, top } = getCoverCrop(image.width, image.height, crop, coverSize);
        const canvas = document.createElement("canvas");
        canvas.width = coverSize.width;
        canvas.height = coverSize.height;
        const context = canvas.getContext("2d", { alpha: false });
        if (!context) throw new Error("Could not prepare your cover photo.");
        context.fillStyle = "#fff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, left, top, width, height);
        return await new Promise((resolve, reject) => canvas.toBlob((blob) => {
            if (blob && blob.size <= maxBytes) resolve(blob);
            else reject(new Error("Could not prepare a cover photo under the 4 MB limit."));
        }, "image/jpeg", 0.9));
    } finally {
        image.close();
    }
}

function useObjectUrl(blob) {
    const [imageUrl, setImageUrl] = useState("");
    useEffect(() => {
        if (!blob) {
            setImageUrl("");
            return undefined;
        }
        const url = URL.createObjectURL(blob);
        setImageUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [blob]);
    return imageUrl;
}

export default function ProfileCover() {
    const fileInput = useRef(null);
    const bannerRef = useRef(null);
    const [menuAnchor, setMenuAnchor] = useState(null);
    const [cover, setCover] = useState(null);
    const [busy, setBusy] = useState(true);
    const [error, setError] = useState("");
    const [editorOpen, setEditorOpen] = useState(false);
    const [draft, setDraft] = useState(null);
    const [coverSize, setCoverSize] = useState(defaultCoverSize);
    const [crop, setCrop] = useState(initialCrop);
    const [editorError, setEditorError] = useState("");
    const imageUrl = useObjectUrl(cover);
    const draftUrl = useObjectUrl(draft?.file);
    const frame = draft && getCoverCrop(draft.width, draft.height, crop, coverSize);

    useEffect(() => {
        const controller = new AbortController();
        axios.get(coverUrl, { responseType: "blob", signal: controller.signal,
            validateStatus: status => status === 200 || status === 404 })
            .then(response => {
                if (!controller.signal.aborted && response.status === 200) setCover(response.data);
            })
            .catch(() => { if (!controller.signal.aborted) setError("Could not load your cover photo."); })
            .finally(() => { if (!controller.signal.aborted) setBusy(false); });
        return () => controller.abort();
    }, []);

    const openEditor = () => {
        setMenuAnchor(null);
        setError("");
        setEditorError("");
        setCoverSize(getCoverSize(bannerRef.current?.getBoundingClientRect()));
        setEditorOpen(true);
    };

    const closeEditor = () => {
        setEditorOpen(false);
        setDraft(null);
    };

    async function selectCover(file) {
        if (!file || busy) return;
        setBusy(true);
        setEditorError("");
        try {
            const image = await openCoverImage(file);
            setDraft({ file, width: image.width, height: image.height });
            setCrop(initialCrop);
            image.close();
        } catch (failure) {
            setEditorError(failure.message);
        } finally {
            setBusy(false);
        }
    }

    async function uploadCover() {
        if (!draft || busy) return;
        setBusy(true);
        setEditorError("");
        try {
            const blob = await prepareCover(draft.file, crop, coverSize);
            const form = new FormData();
            form.append("file", blob, "profile-cover.jpg");
            await axios.post(coverUrl, form);
            setCover(blob);
            closeEditor();
        } catch (failure) {
            setEditorError(failure.response?.data?.message || (axios.isAxiosError(failure)
                ? "Could not save your cover photo." : failure.message));
        } finally {
            setBusy(false);
        }
    }

    async function removeCover() {
        setMenuAnchor(null);
        setBusy(true);
        setError("");
        try {
            await axios.delete(coverUrl);
            setCover(null);
        } catch (failure) {
            setError(failure.response?.data?.message || "Could not remove your cover photo.");
        } finally {
            setBusy(false);
        }
    }

    return (
        <Box ref={bannerRef} className={`profile-cover${imageUrl ? " profile-cover-custom" : ""}`}>
            {imageUrl ? <img className="profile-cover-image" src={imageUrl} alt="" /> :
                <Box className="cover-overlay" aria-hidden="true" />}
            <Button className="profile-cover-control" variant="contained" size="small"
                startIcon={busy ? <CircularProgress size={14} color="inherit" /> : <PhotoCameraRoundedIcon />}
                disabled={busy} aria-haspopup={cover ? "menu" : undefined}
                aria-expanded={cover ? Boolean(menuAnchor) : undefined}
                onClick={(event) => cover ? setMenuAnchor(event.currentTarget) : openEditor()}>
                {cover ? "Edit cover" : "Add cover photo"}
            </Button>
            <input ref={fileInput} hidden type="file" accept="image/*" aria-label="Choose a cover photo up to 4 MB"
                onChange={(event) => {
                    const file = event.target.files?.[0];
                    event.target.value = "";
                    selectCover(file);
                }} />
            <Menu className="profile-cover-menu" anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
                <MenuItem onClick={() => { openEditor(); selectCover(cover); }}>Adjust current photo</MenuItem>
                <MenuItem onClick={openEditor}>Replace cover photo</MenuItem>
                <MenuItem onClick={removeCover}>Remove cover photo</MenuItem>
            </Menu>
            <Dialog className="profile-cover-editor" open={editorOpen} onClose={() => !busy && closeEditor()} fullWidth maxWidth="sm" aria-labelledby="cover-editor-title">
                <DialogTitle id="cover-editor-title">Edit cover photo</DialogTitle>
                <DialogContent>
                    <Stack spacing={2}>
                        <Typography variant="body2" color="text.secondary">
                            Size for your top banner is <strong>{coverSize.width} × {coverSize.height} px</strong>. Choose an image up to 4 MB. Use the preview to keep important details in the strip.
                        </Typography>
                        {editorError && <Alert severity="error">{editorError}</Alert>}
                        {frame && draftUrl && <>
                            <Box aria-label="Cover photo preview" sx={{ position: "relative", overflow: "hidden",
                                aspectRatio: `${coverSize.width}/${coverSize.height}`, backgroundColor: "#fff", border: 1, borderColor: "divider", borderRadius: 2 }}>
                                <Box component="img" alt="Crop preview" src={draftUrl} sx={{ display: "block", position: "absolute", maxWidth: "none",
                                    width: `${frame.width / coverSize.width * 100}%`, height: `${frame.height / coverSize.height * 100}%`,
                                    left: `${frame.left / coverSize.width * 100}%`, top: `${frame.top / coverSize.height * 100}%` }} />
                            </Box>
                            <Typography variant="caption" color="text.secondary">Selected image {draft.width} × {draft.height} px</Typography>
                            <Box>
                                <Typography id="cover-zoom-label" variant="body2">Zoom</Typography>
                                <Slider aria-labelledby="cover-zoom-label" min={1} max={3} step={0.01} value={crop.zoom} disabled={busy}
                                    getAriaValueText={value => `${Math.round(value * 100)} percent`}
                                    onChange={(_, value) => setCrop(current => ({ ...current, zoom: value }))} />
                            </Box>
                            {frame.width > coverSize.width + 0.1 && <Box>
                                <Typography id="cover-horizontal-label" variant="body2">Horizontal position</Typography>
                                <Slider aria-labelledby="cover-horizontal-label" value={crop.horizontal} disabled={busy}
                                    onChange={(_, value) => setCrop(current => ({ ...current, horizontal: value }))} />
                            </Box>}
                            {frame.height > coverSize.height + 0.1 && <Box>
                                <Typography id="cover-vertical-label" variant="body2">Vertical position</Typography>
                                <Slider aria-labelledby="cover-vertical-label" value={crop.vertical} disabled={busy}
                                    onChange={(_, value) => setCrop(current => ({ ...current, vertical: value }))} />
                            </Box>}
                        </>}
                        <Button variant="outlined" disabled={busy} onClick={() => fileInput.current?.click()} sx={{ alignSelf: "flex-start" }}>
                            {draft ? "Choose another photo" : "Choose photo"}
                        </Button>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button disabled={busy} onClick={closeEditor}>Cancel</Button>
                    <Button disabled={!draft || busy} variant="contained" onClick={uploadCover}>Save cover</Button>
                </DialogActions>
            </Dialog>
            {error && <Alert severity="error" className="profile-cover-error" onClose={() => setError("")}>{error}</Alert>}
        </Box>
    );
}
