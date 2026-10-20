import {
    Button,
    Chip,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";

import "./ClientsTable.css";

function ClientsTable({
    clients,
    canWrite,
    busy,
    handleView,
    handleEdit,
    handleArchive,
}) {
    return (
        <TableContainer>
            <Table aria-label="Clients" className="clients-table">
                <TableHead>
                    <TableRow>
                        {[
                            "Client",
                            "Company",
                            "Contact",
                            "Location",
                            "Branch / Currency",
                            "Status",
                            "Actions",
                        ].map((label) => (
                            <TableCell key={label}>{label}</TableCell>
                        ))}
                    </TableRow>
                </TableHead>

                <TableBody>
                    {clients.map((client) => (
                        <TableRow key={client.id}>
                            <TableCell>
                                <Typography fontWeight={600}>
                                    {client.name}
                                </Typography>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    {client.code}
                                </Typography>
                            </TableCell>

                            <TableCell>
                                {client.companyName || "—"}
                            </TableCell>

                            <TableCell>
                                {client.contactPerson || "—"}
                                <br />
                                {client.email || client.phone || "—"}
                            </TableCell>

                            <TableCell>
                                {[client.city, client.state, client.country]
                                    .filter(Boolean)
                                    .join(", ") || "—"}
                            </TableCell>

                            <TableCell>
                                {client.branch} · {client.currency}
                            </TableCell>

                            <TableCell>
                                <Chip
                                    size="small"
                                    label={
                                        client.isActive ? "Active" : "Archived"
                                    }
                                    color={
                                        client.isActive ? "success" : "default"
                                    }
                                />
                            </TableCell>

                            <TableCell>
                                <Stack direction="row" spacing={1}>
                                    <Button
                                        onClick={() => handleView(client)}
                                        disabled={busy}
                                    >
                                        View
                                    </Button>

                                    {canWrite && (
                                        <Button
                                            onClick={() => handleEdit(client)}
                                            disabled={busy}
                                        >
                                            Edit
                                        </Button>
                                    )}

                                    {canWrite && client.isActive && (
                                        <Button
                                            color="error"
                                            onClick={() => handleArchive(client)}
                                            disabled={busy}
                                        >
                                            Archive
                                        </Button>
                                    )}
                                </Stack>
                            </TableCell>
                        </TableRow>
                    ))}

                    {clients.length === 0 && (
                        <TableRow>
                            <TableCell
                                colSpan={7}
                                align="center"
                                sx={{ py: 5 }}
                            >
                                No clients found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export default ClientsTable;