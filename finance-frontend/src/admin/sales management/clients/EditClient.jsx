import ClientForm from "./ClientForm";

function EditClient({ open, client, handleClose, handleUpdate, handleReload }) {
    if (!open) {
        return null;
    }

    return (
        <ClientForm
            key={`${client.id}:${client.rowVersion}`}
            open={open}
            client={client}
            handleClose={handleClose}
            handleSave={handleUpdate}
            handleReload={handleReload}
        />
    );
}

export default EditClient;
