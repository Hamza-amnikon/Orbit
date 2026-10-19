import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, Box, Button, Card, CardContent, Chip, CircularProgress, Typography } from "@mui/material";
import { ArrowBack, Edit } from "@mui/icons-material";
import { useAuth } from "../../../context/AuthContext";
import { getClientById, updateClient } from "./ClientService";
import { fieldsForCountry } from "./ClientFields";
import EditClient from "./EditClient";
import "./ClientDetails.css";

function ClientDetails() {
    const { id } = useParams();

    return <ClientDetailsPage key={id} id={id} />;
}

function ClientDetailsPage({ id }) {
    const navigate = useNavigate();
    const { canWrite } = useAuth();
    const [client, setClient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [revision, setRevision] = useState(0);

    useEffect(() => {
        const controller = new AbortController();

        async function loadClient() {
            try {
                const record = await getClientById(id, controller.signal);

                if (!controller.signal.aborted) {
                    setClient(record);
                }
            } catch (loadError) {
                if (!controller.signal.aborted) {
                    setError(loadError.message);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        loadClient();
        return () => controller.abort();
    }, [id, revision]);

    async function saveClient(data) {
        const updated = await updateClient(client.id, data);
        setClient(updated);
        setOpenEditDialog(false);
        setNotice("Client updated.");
    }

    async function reloadClient() {
        const updated = await getClientById(client.id);
        setClient(updated);
    }

    return (
        <Box className="client-details-page">
            <Box className="client-details-header">
                <Box>
                    <Typography className="client-details-title">
                        {client?.name || "Client Details"}
                    </Typography>
                    <Typography>{client?.code}</Typography>
                </Box>

                <Box className="client-details-header-actions">
                    <Button startIcon={<ArrowBack />} onClick={() => navigate("/sales/clients")}>
                        Back to Clients
                    </Button>

                    {client && canWrite && (
                        <Button variant="contained" startIcon={<Edit />} onClick={() => setOpenEditDialog(true)}>
                            Edit Client
                        </Button>
                    )}
                </Box>
            </Box>

            {notice && (
                <Alert severity="success" onClose={() => setNotice("")} sx={{ mb: 2 }}>
                    {notice}
                </Alert>
            )}

            {error && (
                <Alert
                    severity="error"
                    action={
                        <Button color="inherit" onClick={() => {
                            setLoading(true);
                            setError("");
                            setRevision((previous) => previous + 1);
                        }}>
                            Retry
                        </Button>
                    }
                >
                    {error}
                </Alert>
            )}

            {loading && <CircularProgress aria-label="Loading client" />}

            {!loading && !error && client && (
                <Card>
                    <CardContent>
                        <Box className="client-info-grid">
                            {fieldsForCountry(client.country).map(([name, label]) => (
                                <Box key={name}>
                                    <Typography color="text.secondary" variant="body2">{label}</Typography>
                                    <Typography>
                                        {typeof client[name] === "boolean"
                                            ? client[name] ? "Yes" : "No"
                                            : client[name] || "—"}
                                    </Typography>
                                </Box>
                            ))}

                            <Box>
                                <Typography color="text.secondary" variant="body2">Managing branch</Typography>
                                <Typography>{client.branch}</Typography>
                            </Box>

                            <Box>
                                <Typography color="text.secondary" variant="body2">Billing currency</Typography>
                                <Typography>{client.currency}</Typography>
                            </Box>

                            <Chip
                                size="small"
                                label={client.isActive ? "Active" : "Archived"}
                                color={client.isActive ? "success" : "default"}
                            />
                        </Box>
                    </CardContent>
                </Card>
            )}

            {client && canWrite && openEditDialog && (
                <EditClient
                    open
                    client={client}
                    handleClose={() => setOpenEditDialog(false)}
                    handleUpdate={saveClient}
                    handleReload={reloadClient}
                />
            )}
        </Box>
    );
}

export default ClientDetails;
