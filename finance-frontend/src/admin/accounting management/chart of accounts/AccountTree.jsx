import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Alert,
    Button,
    Chip,
    IconButton,
    Tooltip,
    Typography,
} from "@mui/material";

import ChevronRightRoundedIcon from
    "@mui/icons-material/ChevronRightRounded";

import ExpandMoreRoundedIcon from
    "@mui/icons-material/ExpandMoreRounded";

function compareAccounts(left, right) {
    return left.code.localeCompare(
        right.code,
        undefined,
        {
            numeric: true,
            sensitivity: "base",
        }
    );
}

function createHierarchy(accounts) {
    const accountsById = new Map(
        accounts.map(account => [
            account.id,
            {
                ...account,
                children: [],
            },
        ])
    );

    const roots = [];

    for (const account of accountsById.values()) {
        const parent = account.parentAccountId
            ? accountsById.get(
                account.parentAccountId
            )
            : null;

        if (parent) {
            parent.children.push(account);
        } else {
            roots.push(account);
        }
    }

    function sortBranch(branch) {
        branch.sort(compareAccounts);

        for (const account of branch) {
            sortBranch(account.children);
        }
    }

    sortBranch(roots);

    return roots;
}

function AccountTreeRow({
    account,
    depth,
    expanded,
    onToggle,
    canWrite,
    disabled,
    onView,
    onEdit,
}) {
    const hasChildren =
        account.children.length > 0;

    const isExpanded =
        expanded.has(account.id);

    return (
        <>
            <div
                className="chart-tree-row"
                role="treeitem"
                aria-level={depth + 1}
                aria-expanded={
                    hasChildren
                        ? isExpanded
                        : undefined
                }
            >
                <div
                    className="chart-tree-account"
                    style={{
                        "--chart-tree-depth": depth,
                    }}
                >
                    {hasChildren ? (
                        <Tooltip
                            title={
                                isExpanded
                                    ? "Collapse"
                                    : "Expand"
                            }
                        >
                            <IconButton
                                size="small"
                                aria-label={
                                    isExpanded
                                        ? "Collapse " +
                                          account.name
                                        : "Expand " +
                                          account.name
                                }
                                onClick={() =>
                                    onToggle(
                                        account.id
                                    )
                                }
                            >
                                {isExpanded ? (
                                    <ExpandMoreRoundedIcon />
                                ) : (
                                    <ChevronRightRoundedIcon />
                                )}
                            </IconButton>
                        </Tooltip>
                    ) : (
                        <span
                            className="chart-tree-leaf-space"
                            aria-hidden="true"
                        />
                    )}

                    <Typography
                        component="span"
                        className="chart-account-code"
                    >
                        {account.code}
                    </Typography>

                    <Typography
                        component="span"
                        fontWeight={
                            hasChildren ? 700 : 500
                        }
                    >
                        {account.name}
                    </Typography>
                </div>

                <div className="chart-tree-type">
                    <Chip
                        size="small"
                        variant="outlined"
                        label={account.type}
                    />
                </div>

                <div className="chart-tree-balance">
                    {account.normalBalance}
                </div>

                <div className="chart-tree-usage">
                    <Chip
                        size="small"
                        label={
                            account.isPostingAccount
                                ? "Posting"
                                : "Group"
                        }
                        color={
                            account.isPostingAccount
                                ? "primary"
                                : "default"
                        }
                    />
                </div>

                <div className="chart-tree-status">
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
                </div>

                <div className="chart-tree-action">
                    <Button
                        size="small"
                        disabled={disabled}
                        onClick={() =>
                            onView(account)
                        }
                    >
                        View
                    </Button>

                    {canWrite &&
                     !account.isSystemAccount &&
                     !account.isControlAccount && (
                        <Button
                            size="small"
                            disabled={disabled}
                            onClick={() =>
                                onEdit(account)
                            }
                        >
                            Edit
                        </Button>
                    )}
                </div>
            </div>

            {hasChildren &&
             isExpanded &&
             account.children.map(child => (
                <AccountTreeRow
                    key={child.id}
                    account={child}
                    depth={depth + 1}
                    expanded={expanded}
                    onToggle={onToggle}
                    canWrite={canWrite}
                    disabled={disabled}
                    onView={onView}
                    onEdit={onEdit}
                />
             ))}
        </>
    );
}

export default function AccountTree({
    accounts,
    canWrite,
    disabled,
    onView,
    onEdit,
}) {
    const hierarchy = useMemo(
        () => createHierarchy(accounts),
        [accounts]
    );

    const [expanded, setExpanded] =
        useState(new Set());

    useEffect(() => {
        setExpanded(
            new Set(
                accounts
                    .filter(account =>
                        !account.isPostingAccount
                    )
                    .map(account => account.id)
            )
        );
    }, [accounts]);

    function toggle(accountId) {
        setExpanded(current => {
            const next = new Set(current);

            if (next.has(accountId)) {
                next.delete(accountId);
            } else {
                next.add(accountId);
            }

            return next;
        });
    }

    if (!accounts.length) {
        return (
            <Alert severity="info">
                No accounts exist for this company.
            </Alert>
        );
    }

    return (
        <div
            className="chart-tree"
            role="tree"
            aria-label="Chart of Accounts hierarchy"
        >
            <div className="chart-tree-header">
                <div>Account</div>
                <div>Type</div>
                <div>Normal balance</div>
                <div>Usage</div>
                <div>Status</div>
                <div>Actions</div>
            </div>

            {hierarchy.map(account => (
                <AccountTreeRow
                    key={account.id}
                    account={account}
                    depth={0}
                    expanded={expanded}
                    onToggle={toggle}
                    canWrite={canWrite}
                    disabled={disabled}
                    onView={onView}
                    onEdit={onEdit}
                />
            ))}
        </div>
    );
}
