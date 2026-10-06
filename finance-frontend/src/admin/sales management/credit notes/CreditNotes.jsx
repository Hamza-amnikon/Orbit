import React, { useState } from "react";

import {
    Box,
    Button,
    Card,
    CardContent,
    Typography,
} from "@mui/material";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";

import CreditNoteForm from "./CreditNoteForm";
import CreditNoteDetails from "./CreditNoteDetails";
import "./CreditNotes.css";

const CreditNotes = () => {
    const [showCreditNoteForm, setShowCreditNoteForm] = useState(false);
    const [showCreditNoteDetails, setShowCreditNoteDetails] = useState(false);
    const [isEditingCreditNote, setIsEditingCreditNote] = useState(false);

    if (showCreditNoteDetails) {
        return (
            <CreditNoteDetails
                onBack={() => setShowCreditNoteDetails(false)}
                onEdit={() => {
                    setShowCreditNoteDetails(false);
                    setIsEditingCreditNote(true);
                }}
            />
        );
    }

    return (
        <Box className="credit-notes-page">

            {/* Page Header */}
            <Box className="credit-notes-header">

                <Box>
                    <Typography className="credit-notes-title">
                        Credit Notes
                    </Typography>

                    <Typography className="credit-notes-subtitle">
                        Create and manage customer credit notes
                    </Typography>
                </Box>

                <Button
                    variant="contained"
                    startIcon={<AddRoundedIcon />}
                    className="add-credit-note-button"
                    onClick={() => setShowCreditNoteForm(true)}
                >
                    New Credit Note
                </Button>

            </Box>

            {/* Summary Cards */}
            <Box className="credit-note-summary-grid">

                <Card className="credit-note-summary-card">
                    <CardContent>
                        <Typography className="credit-note-summary-label">
                            Total Credit Notes
                        </Typography>

                        <Typography className="credit-note-summary-value">
                            24
                        </Typography>
                    </CardContent>
                </Card>

                <Card className="credit-note-summary-card">
                    <CardContent>
                        <Typography className="credit-note-summary-label">
                            Draft
                        </Typography>

                        <Typography className="credit-note-summary-value">
                            5
                        </Typography>
                    </CardContent>
                </Card>

                <Card className="credit-note-summary-card">
                    <CardContent>
                        <Typography className="credit-note-summary-label">
                            Issued
                        </Typography>

                        <Typography className="credit-note-summary-value">
                            8
                        </Typography>
                    </CardContent>
                </Card>

                <Card className="credit-note-summary-card">
                    <CardContent>
                        <Typography className="credit-note-summary-label">
                            Applied
                        </Typography>

                        <Typography className="credit-note-summary-value">
                            7
                        </Typography>
                    </CardContent>
                </Card>

                <Card className="credit-note-summary-card">
                    <CardContent>
                        <Typography className="credit-note-summary-label">
                            Refunded
                        </Typography>

                        <Typography className="credit-note-summary-value">
                            4
                        </Typography>
                    </CardContent>
                </Card>

            </Box>

            {/* Credit Note List */}
            <Card className="credit-note-list-card">

                <CardContent className="credit-note-list-content">

                    <Box className="credit-note-list-header">

                        <Box>
                            <Typography className="credit-note-list-title">
                                Credit Note List
                            </Typography>

                            <Typography className="credit-note-list-subtitle">
                                View and manage customer credit notes
                            </Typography>
                        </Box>

                        <Box className="credit-note-list-actions">

                            <Box className="credit-note-search-box">

                                <SearchRoundedIcon />

                                <input
                                    type="text"
                                    placeholder="Search credit notes..."
                                />

                            </Box>

                            <Button
                                variant="outlined"
                                startIcon={<FilterListRoundedIcon />}
                                className="credit-note-filter-button"
                            >
                                Filter
                            </Button>

                        </Box>

                    </Box>

                    {/* Table Header */}
                    <Box className="credit-note-table-header">

                        <Typography>Credit Note</Typography>
                        <Typography>Customer</Typography>
                        <Typography>Invoice</Typography>
                        <Typography>Credit Date</Typography>
                        <Typography>Amount</Typography>
                        <Typography>Status</Typography>
                        <Typography>Action</Typography>

                    </Box>

                    {/* Row 1 */}
                    <Box className="credit-note-table-row">

                        <Typography className="credit-note-number">
                            CN-001
                        </Typography>

                        <Typography>
                            ABC Technologies
                        </Typography>

                        <Typography>
                            INV-001
                        </Typography>

                        <Typography>
                            06 Oct 2026
                        </Typography>

                        <Typography className="credit-note-amount">
                            ₹10,000
                        </Typography>

                        <Box className="credit-note-status issued">
                            Issued
                        </Box>

<Button
    className="credit-note-view-button"
    onClick={() => setShowCreditNoteDetails(true)}
>
    View
</Button>

                    </Box>

                    {/* Row 2 */}
                    <Box className="credit-note-table-row">

                        <Typography className="credit-note-number">
                            CN-002
                        </Typography>

                        <Typography>
                            Global Solutions
                        </Typography>

                        <Typography>
                            INV-002
                        </Typography>

                        <Typography>
                            04 Oct 2026
                        </Typography>

                        <Typography className="credit-note-amount">
                            ₹15,500
                        </Typography>

                        <Box className="credit-note-status applied">
                            Applied
                        </Box>

<Button
    className="credit-note-view-button"
    onClick={() => setShowCreditNoteDetails(true)}
>
    View
</Button>

                    </Box>

                    {/* Row 3 */}
                    <Box className="credit-note-table-row">

                        <Typography className="credit-note-number">
                            CN-003
                        </Typography>

                        <Typography>
                            TechNova Pvt Ltd
                        </Typography>

                        <Typography>
                            INV-003
                        </Typography>

                        <Typography>
                            02 Oct 2026
                        </Typography>

                        <Typography className="credit-note-amount">
                            ₹8,250
                        </Typography>

                        <Box className="credit-note-status draft">
                            Draft
                        </Box>

<Button
    className="credit-note-view-button"
    onClick={() => setShowCreditNoteDetails(true)}
>
    View
</Button>

                    </Box>

                    {/* Row 4 */}
                    <Box className="credit-note-table-row">

                        <Typography className="credit-note-number">
                            CN-004
                        </Typography>

                        <Typography>
                            Bright Enterprises
                        </Typography>

                        <Typography>
                            INV-004
                        </Typography>

                        <Typography>
                            29 Sep 2026
                        </Typography>

                        <Typography className="credit-note-amount">
                            ₹12,000
                        </Typography>

                        <Box className="credit-note-status refunded">
                            Refunded
                        </Box>

<Button
    className="credit-note-view-button"
    onClick={() => setShowCreditNoteDetails(true)}
>
    View
</Button>

                    </Box>

                </CardContent>

            </Card>

            {/* Credit Note Form Modal */}
{(showCreditNoteForm || isEditingCreditNote) && (
    <Box className="credit-note-modal-overlay">

        <Box className="credit-note-modal">

            <CreditNoteForm
                onClose={() => {
                    setShowCreditNoteForm(false);
                    setIsEditingCreditNote(false);
                }}
            />

        </Box>

    </Box>
)}

        </Box>
    );
};

export default CreditNotes;