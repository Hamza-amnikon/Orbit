import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Pagination,
    TextField,
    Typography,
} from "@mui/material";
import { Add, Refresh } from "@mui/icons-material";
import { useAuth } from "../../../context/AuthContext";
import { archiveClient, createClient, getClientById, getClients, updateClient } from "./ClientService";
import AddClient from "./AddClient";
import EditClient from "./EditClient";
import ClientsTable from "./ClientsTable";
import "./Clients.css";

const pageSize = 25;

function Clients() {
    const navigate = useNavigate();
    const { canWrite } = useAuth();

    const [clients, setClients] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [archiving, setArchiving] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [revision, setRevision] = useState(0);

    useEffect(() => {
        const controller = new AbortController();

        async function loadClients(signal) {
            try {
                const result = await getClients({ page, pageSize, search }, signal);

                if (!signal.aborted) {
                    const lastPage = Math.max(1, Math.ceil(result.total / pageSize));

                    if (page > lastPage) {
                        setPage(lastPage);
                    } else {
                        setClients(result.data);
                        setTotal(result.total);
                    }
                }
            } catch (loadError) {
                if (!signal.aborted) {
                    setError(loadError.message);
                }
            } finally {
                if (!signal.aborted) {
                    setLoading(false);
                }
            }
        }

        loadClients(controller.signal);

        return () => controller.abort();
    }, [page, search, revision]);

    function refreshClients() {
        setLoading(true);
        setError("");
        setRevision((previous) => previous + 1);
    }

    async function saveClient(data) {
        await createClient(data);
        setOpenAddDialog(false);
        setNotice("Client created.");
        refreshClients();
    }

    async function editClient(data) {
        await updateClient(selectedClient.id, data);
        setSelectedClient(null);
        setNotice("Client updated.");
        refreshClients();
    }

    async function reloadSelectedClient() {
        const client = await getClientById(selectedClient.id);
        setSelectedClient(client);
    }

    async function archiveSelectedClient(client) {
        if (!window.confirm(`Archive "${client.name}"?`)) {
            return;
        }

        setArchiving(true);
        setError("");

        try {
            await archiveClient(client.id, client.rowVersion);
            setNotice("Client archived.");
            refreshClients();
        } catch (archiveError) {
            setError(archiveError.message);
        } finally {
            setArchiving(false);
        }
    }

    return (
        <Box className="clients-page">
            <Box className="clients-header">
                <Box>
                    <Typography className="clients-title">Clients</Typography>
                    <Typography className="clients-subtitle">
                        Manage clients and their contact and billing information.
                    </Typography>
                </Box>

                <Box className="client-actions">
                    <Button
                        variant="outlined"
                        startIcon={<Refresh />}
                        onClick={refreshClients}
                        disabled={loading || archiving}
                    >
                        Refresh
                    </Button>

                    {canWrite && (
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={() => setOpenAddDialog(true)}
                        >
                            Add Client
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
                    sx={{ mb: 2 }}
                    action={<Button color="inherit" onClick={refreshClients}>Retry</Button>}
                >
                    {error}
                </Alert>
            )}

            <Card>
                <CardContent>
                    <Box className="clients-toolbar">
                        <TextField
                            label="Search clients"
                            size="small"
                            value={search}
                            onChange={(event) => {
                                setLoading(true);
                                setError("");
                                setSearch(event.target.value);
                                setPage(1);
                            }}
                            slotProps={{ htmlInput: { maxLength: 200 } }}
                        />

                        <Typography color="text.secondary">
                            {total} matching clients
                        </Typography>
                    </Box>

                    {loading ? (
                        <Box sx={{ py: 5, textAlign: "center" }}>
                            <CircularProgress aria-label="Loading clients" />
                        </Box>
                    ) : !error && (
                        <>
                            <ClientsTable
                                clients={clients}
                                canWrite={canWrite}
                                busy={archiving}
                                handleView={(client) => navigate(`/sales/clients/${client.id}`)}
                                handleEdit={setSelectedClient}
                                handleArchive={archiveSelectedClient}
                            />

                            <Pagination
                                sx={{ mt: 2 }}
                                count={Math.max(1, Math.ceil(total / pageSize))}
                                page={page}
                                onChange={(_, nextPage) => {
                                    setLoading(true);
                                    setError("");
                                    setPage(nextPage);
                                }}
                                disabled={archiving}
                            />
                        </>
                    )}
                </CardContent>
            </Card>

            {canWrite && (
                <AddClient
                    open={openAddDialog}
                    handleClose={() => setOpenAddDialog(false)}
                    handleSave={saveClient}
                />
            )}

            {canWrite && selectedClient && (
                <EditClient
                    open
                    client={selectedClient}
                    handleClose={() => setSelectedClient(null)}
                    handleUpdate={editClient}
                    handleReload={reloadSelectedClient}
                />
            )}
        </Box>
    );
}

export default Clients;
