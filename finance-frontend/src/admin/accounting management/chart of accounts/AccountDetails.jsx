import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography,
} from "@mui/material";

function Detail({
    label,
    children,
}) {
    return (
        <Box>
            <Typography
                variant="body2"
                color="text.secondary"
            >
                {label}
            </Typography>

            <Typography
                sx={{
                    mt: 0.5,
                    overflowWrap: "anywhere",
                }}
            >
                {children ?? "—"}
            </Typography>
        </Box>
    );
}

function AccountDetails({
    account,
    onClose,
    onEdit,
}) {
    return (
        <Dialog
            open
            fullWidth
            maxWidth="md"
            onClose={onClose}
        >
            <DialogTitle>
                Account Details
            </DialogTitle>

            <DialogContent dividers>
                <Box
                    className="chart-account-details"
                    sx={{
                        display: "grid",
                        gridTemplateColumns: {
                            xs: "1fr",
                            sm: "1fr 1fr",
                        },
                        gap: 3,
                    }}
                >
                    <Detail label="Company">
                        {account.companyName}
                    </Detail>

                    <Detail label="Country and currency">
                        {account.country}
                        {" · "}
                        {account.currency}
                    </Detail>

                    <Detail label="Account code">
                        <span className="chart-account-code">
                            {account.code}
                        </span>
                    </Detail>

                    <Detail label="Account name">
                        {account.name}
                    </Detail>

                    <Detail label="Account type">
                        {account.type}
                    </Detail>

                    <Detail label="Normal balance">
                        {account.normalBalance}
                    </Detail>

                    <Detail label="Parent account">
                        {account.parentAccountCode
                            ? account.parentAccountCode +
                              " · " +
                              account.parentAccountName
                            : "Top level"}
                    </Detail>

                    <Detail label="Usage">
                        <Chip
                            size="small"
                            label={
                                account.isPostingAccount
                                    ? "Posting account"
                                    : "Group account"
                            }
                            color={
                                account.isPostingAccount
                                    ? "primary"
                                    : "default"
                            }
                        />
                    </Detail>

                    <Detail label="Status">
                        <Chip
                            size="small"
                            label={
                                account.isActive
                                    ? "Active"
                                    : "Inactive"
                            }
                            color={
                                account.isActive
                                    ? "success"
                                    : "default"
                            }
                        />
                    </Detail>

                    <Detail label="Protection">
                        {account.isSystemAccount &&
                         account.isControlAccount
                            ? "System and control account"
                            : account.isSystemAccount
                                ? "System account"
                            : account.isControlAccount
                                ? "Control account"
                                : "Standard account"}
                    </Detail>

                    <Detail label="System key">
                        {account.systemKey ||
                            "Not assigned"}
                    </Detail>

                    <Box
                        sx={{
                            gridColumn: {
                                sm: "1 / -1",
                            },
                        }}
                    >
                        <Detail label="Description">
                            {account.description ||
                                "No description"}
                        </Detail>
                    </Box>
                </Box>
            </DialogContent>

            <DialogActions>
                {onEdit && (
                    <Button
                        variant="contained"
                        onClick={onEdit}
                    >
                        Edit
                    </Button>
                )}

                <Button onClick={onClose}>
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default AccountDetails;
