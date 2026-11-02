import { useState } from "react";

import {
    Box,
    MenuItem,
    TextField,
} from "@mui/material";

import { Editor } from "../../../live/shared";

import {
    createAccount,
    updateAccount,
} from "./ChartOfAccountsService";

const accountTypes = [
    "Asset",
    "Liability",
    "Equity",
    "Income",
    "Expense",
];

const normalBalances = [
    "Debit",
    "Credit",
];

function AccountForm({
    account,
    companies,
    parentAccounts,
    onClose,
    onSaved,
}) {
    const [value, setValue] = useState({
        companyId: account.companyId,
        code: account.code || "",
        name: account.name || "",
        type: account.type || "Asset",
        normalBalance:
            account.normalBalance || "Debit",
        parentAccountId:
            account.parentAccountId ?? "",
        isPostingAccount:
            account.isPostingAccount ?? true,
        isActive:
            account.isActive ?? true,
        description:
            account.description || "",
        rowVersion:
            account.rowVersion || "",
    });

    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    const isEditing = Boolean(account.id);

    const availableParents = parentAccounts.filter(
        parent =>
            parent.id !== account.id &&
            parent.type === value.type &&
            parent.isActive &&
            !parent.isPostingAccount
    );

    function change(name, fieldValue) {
        setValue(current => ({
            ...current,
            [name]: fieldValue,
        }));
    }

    function changeType(type) {
        const normalBalance =
            type === "Asset" ||
            type === "Expense"
                ? "Debit"
                : "Credit";

        setValue(current => ({
            ...current,
            type,
            normalBalance,
            parentAccountId: "",
        }));
    }

    async function submit(event) {
        event.preventDefault();

        setBusy(true);
        setError("");

        try {
            const fields = {
                code: value.code.trim(),
                name: value.name.trim(),
                type: value.type,
                normalBalance:
                    value.normalBalance,
                parentAccountId:
                    value.parentAccountId === ""
                        ? null
                        : Number(
                            value.parentAccountId
                        ),
                isPostingAccount:
                    Boolean(
                        value.isPostingAccount
                    ),
                description:
                    value.description.trim(),
            };

            let savedAccount;

            if (isEditing) {
                savedAccount = await updateAccount(
                    account.id,
                    account.companyId,
                    {
                        ...fields,
                        isActive:
                            Boolean(value.isActive),
                        rowVersion:
                            value.rowVersion,
                    }
                );
            } else {
                savedAccount = await createAccount({
                    ...fields,
                    companyId:
                        Number(value.companyId),
                });
            }

            onSaved(savedAccount);
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setBusy(false);
        }
    }

    return (
        <Editor
            title={
                isEditing
                    ? "Edit Account"
                    : "New Account"
            }
            onClose={onClose}
            onSubmit={submit}
            busy={busy}
            error={error}
        >
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "1fr",
                        sm: "1fr 1fr",
                    },
                    gap: 2,
                    py: 1,
                }}
            >
                <TextField
                    select
                    required
                    label="Company"
                    value={String(value.companyId)}
                    disabled
                >
                    {companies.map(company => (
                        <MenuItem
                            key={company.id}
                            value={String(company.id)}
                        >
                            {company.name} ·{" "}
                            {company.currency}
                        </MenuItem>
                    ))}
                </TextField>

                <TextField
                    required
                    label="Account code"
                    value={value.code}
                    inputProps={{ maxLength: 30 }}
                    helperText="Four digits recommended; letters are also supported"
                    onChange={event =>
                        change(
                            "code",
                            event.target.value
                        )
                    }
                />

                <TextField
                    required
                    label="Account name"
                    value={value.name}
                    inputProps={{ maxLength: 160 }}
                    onChange={event =>
                        change(
                            "name",
                            event.target.value
                        )
                    }
                />

                <TextField
                    select
                    required
                    label="Account type"
                    value={value.type}
                    onChange={event =>
                        changeType(
                            event.target.value
                        )
                    }
                >
                    {accountTypes.map(type => (
                        <MenuItem
                            key={type}
                            value={type}
                        >
                            {type}
                        </MenuItem>
                    ))}
                </TextField>

                <TextField
                    select
                    required
                    label="Normal balance"
                    value={value.normalBalance}
                    onChange={event =>
                        change(
                            "normalBalance",
                            event.target.value
                        )
                    }
                >
                    {normalBalances.map(balance => (
                        <MenuItem
                            key={balance}
                            value={balance}
                        >
                            {balance}
                        </MenuItem>
                    ))}
                </TextField>

                <TextField
                    select
                    label="Parent account"
                    value={String(
                        value.parentAccountId
                    )}
                    onChange={event =>
                        change(
                            "parentAccountId",
                            event.target.value
                        )
                    }
                >
                    <MenuItem value="">
                        No parent account
                    </MenuItem>

                    {availableParents.map(parent => (
                        <MenuItem
                            key={parent.id}
                            value={String(parent.id)}
                        >
                            {parent.code} ·{" "}
                            {parent.name}
                        </MenuItem>
                    ))}
                </TextField>

                <TextField
                    select
                    required
                    label="Account usage"
                    value={String(
                        value.isPostingAccount
                    )}
                    onChange={event =>
                        change(
                            "isPostingAccount",
                            event.target.value ===
                                "true"
                        )
                    }
                >
                    <MenuItem value="false">
                        Group account
                    </MenuItem>

                    <MenuItem value="true">
                        Posting account
                    </MenuItem>
                </TextField>

                {isEditing && (
                    <TextField
                        select
                        required
                        label="Status"
                        value={String(
                            value.isActive
                        )}
                        onChange={event =>
                            change(
                                "isActive",
                                event.target.value ===
                                    "true"
                            )
                        }
                    >
                        <MenuItem value="true">
                            Active
                        </MenuItem>

                        <MenuItem value="false">
                            Inactive
                        </MenuItem>
                    </TextField>
                )}

                <TextField
                    label="Description"
                    value={value.description}
                    multiline
                    minRows={3}
                    inputProps={{ maxLength: 500 }}
                    sx={{
                        gridColumn: {
                            sm: "1 / -1",
                        },
                    }}
                    onChange={event =>
                        change(
                            "description",
                            event.target.value
                        )
                    }
                />
            </Box>
        </Editor>
    );
}

export default AccountForm;