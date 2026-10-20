import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, Box, Button, Card, CardContent, Chip, CircularProgress, Divider, Typography } from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import { useAuth } from "../../../context/AuthContext";
import { getVendorById } from "./VendorService";
import { vendorSections } from "./VendorFields";
import VendorForm from "./VendorForm";
import VendorArchiveDialog from "./VendorArchiveDialog";
import "./VendorDetails.css";
import "./VendorIntegration.css";

export default function VendorDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { canWrite } = useAuth();
    const [revision, setRevision] = useState(0);
    const [result, setResult] = useState(null);
    const [editing, setEditing] = useState(false);
    const [archiving, setArchiving] = useState(false);
    const [notice, setNotice] = useState("");
    const key = JSON.stringify([id, revision]);
    const loading = result?.key !== key;
    const vendor = loading ? null : result.vendor;

    useEffect(() => {
        const controller = new AbortController();
        getVendorById(id, controller.signal).then((data) => {
            if (!controller.signal.aborted) setResult({ key, vendor: data, error: "" });
        }).catch((error) => {
            if (!controller.signal.aborted) setResult({ key, vendor: null, error: error.message });
        });
        return () => controller.abort();
    }, [id, key, revision]);

    function refresh() { setRevision((previous) => previous + 1); }

    return <Box className="vendor-details-page">
        <Box className="vendor-details-header">
            <Box>
                <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate("/purchases/vendors")}>
                    Back to Vendors
                </Button>
                <Typography component="h1" className="vendor-details-title">Vendor Details</Typography>
                <Typography className="vendor-details-subtitle">Contact, address and purchase information</Typography>
            </Box>
            <Box className="vendor-details-actions">
                <Button variant="outlined" startIcon={<RefreshRoundedIcon />} disabled={loading} onClick={refresh}>Refresh</Button>
                {canWrite && vendor && <>
                    <Button variant="contained" startIcon={<EditRoundedIcon />} onClick={() => setEditing(true)}>Edit Vendor</Button>
                    {vendor.isActive && <Button variant="outlined" color="warning" onClick={() => setArchiving(true)}>Archive</Button>}
                </>}
            </Box>
        </Box>
        {notice && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setNotice("")}>{notice}</Alert>}
        {loading ? <Box className="vendor-feedback"><CircularProgress aria-label="Loading vendor" /></Box> :
            result.error ? <Alert severity="error" action={<Button color="inherit" onClick={refresh}>Retry</Button>}>{result.error}</Alert> :
            vendor && <Card className="vendor-details-card"><CardContent>
                <Box className="vendor-document-header">
                    <Box><Typography component="h2" className="vendor-company-name">{vendor.name}</Typography>
                        <Typography className="vendor-company-info">{vendor.companyName || "—"}</Typography></Box>
                    <Chip label={vendor.isActive ? "Active" : "Inactive"} color={vendor.isActive ? "success" : "default"} />
                </Box>
                {vendorSections.map(([title, fields]) => <Box key={title}>
                    <Divider className="vendor-details-divider" />
                    <Typography component="h3" className="vendor-section-title">{title}</Typography>
                    <Box className="vendor-info-grid">
                        {fields.map(([name, label]) => <Box key={name} className="vendor-info-item">
                            <Typography className="vendor-info-label">{label}</Typography>
                            <Typography className="vendor-info-value" sx={{ whiteSpace: "pre-wrap" }}>{vendor[name] || "—"}</Typography>
                        </Box>)}
                        {title === "Tax & Banking" && <Box className="vendor-info-item">
                            <Typography className="vendor-info-label">VAT registered (UAE)</Typography>
                            <Typography className="vendor-info-value">
                                {vendor.isVatRegistered == null ? "Not specified" : vendor.isVatRegistered ? "Yes" : "No"}
                            </Typography>
                        </Box>}
                    </Box>
                </Box>)}
            </CardContent></Card>
        }
        {canWrite && editing && vendor && <VendorForm vendor={vendor} onClose={() => setEditing(false)}
            onSaved={() => { setEditing(false); setNotice("Vendor updated."); refresh(); }} />}
        {canWrite && archiving && vendor && <VendorArchiveDialog vendor={vendor} onClose={() => setArchiving(false)}
            onArchived={() => { setArchiving(false); setNotice("Vendor archived."); refresh(); }} />}
    </Box>;
}
