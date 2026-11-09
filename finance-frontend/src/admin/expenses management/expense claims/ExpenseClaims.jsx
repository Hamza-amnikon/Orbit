import { useState } from "react";
import {
    Alert,
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    List,
    ListItem,
    ListItemText,
    Stack,
    TextField,
    Typography
} from "@mui/material";
import { useAuth } from "../../../live/AuthContext";
import {
    money,
    today,
    useLoad
} from "../../../live/data";
import {
    Page,
    Records,
    Feedback
} from "../../../live/shared";
import { moduleConfigs } from "../../shared/moduleConfigs";
import {
    claimRequest,
    claimChoices,
    claimAccounts,
    claimTransitions
} from "./ExpenseClaimService";
import ExpenseClaimForm from "./ExpenseClaimForm";
import ExpenseClaimDetails from "./ExpenseClaimDetails";
import "./ExpenseClaims.css";
export default function ExpenseClaims()
{
    const {
        user,
        canWrite
    } = useAuth();
    const [operator, setOperator] = useState(() => sessionStorage.getItem("orbit.claim.operator") || "");
    const [operatorInput, setOperatorInput] = useState(operator);
    const actor = user?.id || operator;
    const role = user?.role || "";
    const admin = role === "Admin";
    const request = (path, options) => claimRequest(path, actor, role, options);
    const list = useLoad(signal => actor ? request("", {
        signal
    }) : [], [actor, role]);
    const choices = useLoad(claimChoices, []);
    const [edit, setEdit] = useState(null);
    const [detail, setDetail] = useState(null);
    const [change, setChange] = useState(null);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const accounts = useLoad(signal => claimAccounts(detail?.companyId, signal), [detail?.companyId]);
    const branches = choices.data?.branches || [];
    const config = moduleConfigs.claims;
    const fields = config.fields.filter(field => field.name !== "rateToInr").map(field => field.name === "branch" ? {
        ...field,
        options: branches.map(row => row.name)
    } : field.name === "currency" ? {
        ...field,
        options: choices.data?.currencies || []
    } : field);
    const editFields = fields.filter(field => field.name !== "status");
    const canEdit = row => canWrite && row.status === "Draft" && (admin || row.createdBy?.trim().toLowerCase() === actor.trim().toLowerCase());
    const rows = (list.data || []).filter(row => `${row.reference} ${row.employee} ${row.branch} ${row.category} ${row.status}`.toLowerCase().includes(search.toLowerCase()));
    function open(row)
    {
        setError("");
        const branch = branches.find(row => row.currency) || branches[0];
        setEdit(row ? {
            ...row
        } : {
            requestId: crypto.randomUUID(),
            rowVersion: "",
            branch: branch?.name || "",
            companyId: branch?.accountingCompanyId,
            currency: branch?.currency || "",
            date: today(),
            reference: "",
            employee: "",
            amount: "",
            category: "",
            purpose: "",
            notes: ""
        });
    }
    function update(value)
    {
        if (value.branch !== edit.branch)
        {
            const branch = branches.find(row => row.name === value.branch);
            value = {
                ...value,
                companyId: branch?.accountingCompanyId,
                currency: branch?.currency || ""
            };
        }
        setEdit(value);
    }
    async function run(action, message)
    {
        setBusy(true);
        setError("");
        try
        {
            await action();
            setEdit(null);
            setDetail(null);
            setChange(null);
            setNotice(message);
            list.refresh();
        } catch (failure)
        {
            setError(failure.message);
        } finally
        {
            setBusy(false);
        }
    }
    function save(event)
    {
        event.preventDefault();
        const invalid = editFields.find(field => field.required && !String(edit[field.name] ?? "").trim());
        if (invalid)
        {
            setError(`${invalid.label} is required.`);
            return;
        }
        return run(() => request(edit.id ? `/${edit.id}` : "", {
            method: edit.id ? "PUT" : "POST",
            body: {
                ...edit,
                amount: Number(edit.amount)
            }
        }), "Expense claim saved.");
    }
    function confirm(event)
    {
        event.preventDefault();
        return run(() => request(`/${detail.id}/status`, {
            method: "PATCH",
            body: {
                ...change,
                rowVersion: detail.rowVersion
            }
        }), `Status changed to ${change.status}.`);
    }
    async function upload(event)
    {
        const file = event.target.files?.[0];
        if (!file) return;
        setBusy(true);
        setError("");
        try
        {
            if (file.size > 5 * 1024 * 1024) throw new Error("Receipt must be no larger than 5 MB.");
            const body = new FormData();
            body.append("file", file);
            body.append("rowVersion", detail.rowVersion);
            setDetail(await request(`/${detail.id}/receipts`, {
                method: "POST",
                body
            }));
            list.refresh();
        } catch (failure)
        {
            setError(failure.message);
        } finally
        {
            setBusy(false);
            event.target.value = "";
        }
    }
    async function download(receipt)
    {
        try
        {
            const blob = await request(`/${detail.id}/receipts/${receipt.id}`, {
                download: true
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = receipt.fileName;
            link.click();
            URL.revokeObjectURL(url);
        } catch (failure)
        {
            setError(failure.message);
        }
    }
    const options = type => (accounts.data || []).filter(row => row.type === type).map(row => ({
        value: row.id,
        label: `${row.code} · ${row.name}`
    }));
    const actionFields = change?.status === "Approved" ? [{
        name: "approvedDate",
        label: "Approval date",
        type: "date",
        required: true
    }, {
        name: "expenseAccountId",
        label: "Expense ledger account",
        required: true,
        options: options("Expense")
    }, {
        name: "payableAccountId",
        label: "Employee payable ledger account",
        required: true,
        options: options("Liability")
    }] : change?.status === "Paid" ? [{
        name: "paidDate",
        label: "Paid date",
        type: "date",
        required: true
    }, {
        name: "paymentReference",
        label: "Payment reference",
        required: true
    }, {
        name: "paymentAccountId",
        label: "Bank / cash ledger account",
        required: true,
        options: options("Asset")
    }] : change?.status === "Rejected" ? [{
        name: "reason",
        label: "Rejection reason",
        required: true
    }] : [];
    return <Page
        title={config.title}
        subtitle={config.subtitle}
        action={canWrite && <Button
        variant="contained"
        disabled={!actor || choices.loading || !!choices.error}
        onClick={() => open()}
    >New Expense Claim</Button>}
    >
    {!user?.id && <Alert severity="warning" sx={{
            mb: 2
        }}>Local testing mode: operator names are recorded for workflow testing, not verified sign-in. Use a different operator to approve a submitted claim. Authentication will be connected later.</Alert>}
    {!user?.id && <Stack direction="row" sx={{
            gap: 2,
            mb: 2
        }}><TextField
            size="small"
            label="Working as"
            value={operatorInput}
            onChange={event => setOperatorInput(event.target.value)}
        />
      <Button disabled={busy || !operatorInput.trim()} onClick={() =>
            {
                const name = operatorInput.trim();
                sessionStorage.setItem("orbit.claim.operator", name);
                setOperator(name);
                setEdit(null);
                setDetail(null);
                setChange(null);
                setPage(1);
                setError("");
            }}>Use operator</Button></Stack>}
    <Alert severity="info" sx={{
            mb: 2
        }}>Submit a draft for approval by a different administrator. Approved claims create expense and employee-payable ledger entries. Marking Paid records a reimbursement and settles the payable; it does not send money through a bank.</Alert>
    {notice && <Alert
            severity="success"
            sx={{
            mb: 2
        }}
            onClose={() => setNotice("")}
        >{notice}</Alert>}
    {error && !edit && !detail && <Alert severity="error" sx={{
            mb: 2
        }}>{error}</Alert>}
    <Feedback
            loading={choices.loading}
            error={choices.error}
            retry={choices.refresh}
        />
    <Records
            {...list}
            rows={rows.slice((page - 1) * 25, page * 25)}
            total={rows.length}
            page={page}
            setPage={setPage}
            search={search}
            setSearch={setSearch}
            columns={[{
            label: "Branch",
            render: row => row.branch
        }, {
            label: "Claim reference",
            render: row => row.reference
        }, {
            label: "Employee",
            render: row => row.employee
        }, {
            label: "Date",
            render: row => row.date
        }, {
            label: "Category",
            render: row => row.category
        }, {
            label: "Amount",
            render: row => money(row.amount, row.currency)
        }, {
            label: "Status",
            render: row => <Chip size="small" label={row.status} />
        }, {
            label: "Actions",
            render: row => <Stack direction="row"><Button onClick={() =>
            {
                    setError("");
                    setDetail(row);
                }}>View</Button>{canEdit(row) && <Button onClick={() => open(row)}>Edit</Button>}</Stack>
        }]}
        />
    {edit && <Dialog
            open
            fullWidth
            maxWidth="md"
            onClose={busy ? undefined : () => setEdit(null)}
        ><form onSubmit={save}><DialogTitle>{edit.id ? "Edit" : "New"} Expense Claim</DialogTitle><DialogContent dividers>
      {error && <Alert severity="error" sx={{
                        mb: 2
                    }}>{error}</Alert>}<ExpenseClaimForm
                        fields={editFields}
                        value={edit}
                        onChange={update}
                        disabled={busy}
                    />
    </DialogContent><DialogActions><Button disabled={busy} onClick={() => setEdit(null)}>Cancel</Button><Button
            type="submit"
            variant="contained"
            disabled={busy}
        >{busy ? "Saving…" : "Save"}</Button></DialogActions></form></Dialog>}
    {detail && !change && <ExpenseClaimDetails
            title="Expense Claim"
            fields={[...fields, {
            name: "createdBy",
            label: "Created by"
        }, {
            name: "approvedBy",
            label: "Approved by"
        }, {
            name: "decisionReason",
            label: "Decision reason"
        }, {
            name: "paidDate",
            label: "Paid date"
        }, {
            name: "paymentReference",
            label: "Payment reference"
        }]}
            record={detail}
            onClose={() => setDetail(null)}
            actions={canWrite ? claimTransitions(detail, actor, admin).map(status => <Button
            key={status}
            disabled={busy}
            onClick={() =>
        {
            setError("");
            setChange({
                status,
                reason: "",
                approvedDate: today(),
                paidDate: today(),
                paymentReference: ""
            });
        }}
        >{status}</Button>) : []}
        >
      {error && <Alert severity="error">{error}</Alert>}
      <Typography fontWeight={700} sx={{
                mt: 3
            }}>Attachments</Typography><List>{detail.receipts?.map(receipt => <ListItem key={receipt.id} secondaryAction={<Button onClick={() => download(receipt)}>Download</Button>}><ListItemText primary={receipt.fileName} secondary={`${Math.ceil(receipt.size / 1024)} KB`} /></ListItem>)}</List>
      {canEdit(detail) && <Button
                component="label"
                disabled={busy || detail.receipts?.length >= 10}
                variant="outlined"
            >Upload receipt<input
                hidden
                type="file"
                accept="application/pdf,image/png,image/jpeg"
                onChange={upload}
            /></Button>}
      <Box sx={{
                mt: 3
            }}><Typography fontWeight={700}>History</Typography>{detail.history?.map(item => <Typography
                key={item.id}
                variant="body2"
                sx={{
                    mt: 1
                }}
            >{item.status} · {item.actor} · {new Date(item.atUtc + (item.atUtc.endsWith("Z") ? "" : "Z")).toLocaleString()} {item.reason && `· ${item.reason}`}</Typography>)}</Box>
    </ExpenseClaimDetails>}
    {change && <Dialog
            open
            fullWidth
            maxWidth="sm"
            onClose={busy ? undefined : () => setChange(null)}
        ><form onSubmit={confirm}><DialogTitle>Change status to {change.status}?</DialogTitle><DialogContent dividers>
      {error && <Alert severity="error" sx={{
                        mb: 2
                    }}>{error}</Alert>}
      {["Approved", "Paid"].includes(change.status) && <Feedback
                loading={accounts.loading}
                error={accounts.error}
                retry={accounts.refresh}
            />}
      <ExpenseClaimForm
                fields={actionFields}
                value={change}
                onChange={value => setChange({
                        ...value,
                        ...Object.fromEntries(["expenseAccountId", "payableAccountId", "paymentAccountId"].filter(key => value[key]).map(key => [key, Number(value[key])]))
                    })}
                disabled={busy}
            />
    </DialogContent><DialogActions><Button disabled={busy} onClick={() => setChange(null)}>Cancel</Button><Button
            type="submit"
            variant="contained"
            disabled={busy || ["Approved", "Paid"].includes(change.status) && (accounts.loading || !!accounts.error)}
        >{busy ? "Saving…" : "Confirm"}</Button></DialogActions></form></Dialog>}
  </Page>;
}
