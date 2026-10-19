import ClientForm from "./ClientForm";

function AddClient({ open, handleClose, handleSave }) {
    if (!open) {
        return null;
    }

    return (
        <ClientForm
            open={open}
            handleClose={handleClose}
            handleSave={handleSave}
        />
    );
}

export default AddClient;
