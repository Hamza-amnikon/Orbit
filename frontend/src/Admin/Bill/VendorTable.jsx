import React, { useState } from "react";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

import "./VendorTable.css";

import VendorForm from "./VendorForm";
import { deleteVendor } from "./services/vendorService";

const VendorTable = ({
  vendors = [],
  currentUserName = "",
  onSaved,
}) => {
  // =========================================================
  // FILTER STATES
  // =========================================================

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedStatus, setAppliedStatus] = useState("");

  // =========================================================
  // VIEW / UPDATE
  // =========================================================

  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  // =========================================================
  // DELETE
  // =========================================================

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // =========================================================
  // DATE FORMAT
  // =========================================================

  const formatDate = (date) => {
    if (!date) return "-";

    const formattedDate = new Date(date);

    if (Number.isNaN(formattedDate.getTime())) {
      return date;
    }

    return formattedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // =========================================================
  // APPLY FILTERS
  // =========================================================

  const handleApplyFilters = () => {
    setAppliedSearch(search.trim());
    setAppliedStatus(status);
  };

  // =========================================================
  // RESET FILTERS
  // =========================================================

  const handleResetFilters = () => {
    setSearch("");
    setStatus("");

    setAppliedSearch("");
    setAppliedStatus("");
  };

  // =========================================================
  // VIEW VENDOR
  // =========================================================

  const handleViewVendor = (vendor) => {
    setSelectedVendor(vendor);
    setShowViewDialog(true);
  };

  // =========================================================
  // CLOSE VIEW
  // =========================================================

  const handleCloseView = () => {
    setShowViewDialog(false);
    setSelectedVendor(null);
  };

  // =========================================================
  // UPDATE VENDOR
  // =========================================================

  const handleUpdateVendor = (vendor) => {
    setSelectedVendor(vendor);
    setShowEditForm(true);
  };

  // =========================================================
  // CLOSE UPDATE
  // =========================================================

  const handleCloseEdit = () => {
    setShowEditForm(false);
    setSelectedVendor(null);
  };

  // =========================================================
  // AFTER UPDATE
  // =========================================================

  const handleVendorUpdated = async () => {
    if (onSaved) {
      await onSaved();
    }

    setShowEditForm(false);
    setSelectedVendor(null);
  };

  // =========================================================
  // OPEN DELETE DIALOG
  // =========================================================

  const handleDeleteClick = (vendor) => {
    setVendorToDelete(vendor);
    setDeleteError("");
    setDeleteDialogOpen(true);
  };

  // =========================================================
  // CLOSE DELETE DIALOG
  // =========================================================

  const handleCloseDeleteDialog = () => {
    if (deleting) return;

    setDeleteDialogOpen(false);
    setVendorToDelete(null);
    setDeleteError("");
  };

  // =========================================================
  // CONFIRM DELETE
  // =========================================================

  const handleConfirmDelete = async () => {
    if (!vendorToDelete?.vendorId) {
      return;
    }

    try {
      setDeleting(true);
      setDeleteError("");

      await deleteVendor(
        vendorToDelete.vendorId,
        currentUserName || null
      );

      // Refresh vendor table
      if (onSaved) {
        await onSaved();
      }

      setDeleteDialogOpen(false);
      setVendorToDelete(null);
    } catch (error) {
      setDeleteError(
        error?.message || "Failed to delete vendor."
      );
    } finally {
      setDeleting(false);
    }
  };

  // =========================================================
  // FILTER VENDORS
  // =========================================================

  const filteredVendors = vendors.filter((vendor) => {
    const searchText = appliedSearch.toLowerCase();

    const matchesSearch =
      !searchText ||
      String(vendor.vendorId || "")
        .toLowerCase()
        .includes(searchText) ||
      (vendor.vendorCode || "")
        .toLowerCase()
        .includes(searchText) ||
      (vendor.vendorName || "")
        .toLowerCase()
        .includes(searchText) ||
      (vendor.email || "")
        .toLowerCase()
        .includes(searchText) ||
      (vendor.phone || "")
        .toLowerCase()
        .includes(searchText) ||
      (vendor.address || "")
        .toLowerCase()
        .includes(searchText) ||
      (vendor.taxNumber || "")
        .toLowerCase()
        .includes(searchText) ||
      (vendor.bankAccountNumber || "")
        .toLowerCase()
        .includes(searchText) ||
      (vendor.ifscCode || "")
        .toLowerCase()
        .includes(searchText);

    const matchesStatus =
      !appliedStatus ||
      (vendor.status || "").toLowerCase() ===
        appliedStatus.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <>
      {/* =====================================================
          VENDOR TABLE
      ===================================================== */}

      <div className="vendor-table-card">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="vendor-table-header">

          <div>
            <h3>Vendors</h3>

            <p>
              Manage company vendors
            </p>
          </div>

          <span className="vendor-count">
            {filteredVendors.length} Vendors
          </span>

        </div>

        {/* =====================================================
            FILTERS
        ===================================================== */}

        <div className="vendor-table-filters">

          <div className="vendor-search-box">

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search by vendor ID, code, name, email..."
            />

          </div>

          <select
            className="vendor-status-filter"
            value={status}
            onChange={(e) =>
              setStatus(e.target.value)
            }
          >
            <option value="">
              All Status
            </option>

            <option value="Active">
              Active
            </option>

            <option value="Inactive">
              Inactive
            </option>
          </select>

          <button
            type="button"
            className="vendor-filter-btn"
            onClick={handleApplyFilters}
          >
            Apply
          </button>

          <button
            type="button"
            className="vendor-reset-btn"
            onClick={handleResetFilters}
          >
            Reset
          </button>

        </div>

        {/* =====================================================
            TABLE
        ===================================================== */}

        <div className="vendor-table-wrapper">

          <table className="vendor-table">

            <thead>
              <tr>

                <th>Vendor ID</th>

                <th>Vendor Code</th>

                <th>Vendor Name</th>

                <th>Email</th>

                <th>Phone</th>

                <th>Address</th>

                <th>GST Number</th>

                <th>Bank Account Number</th>

                <th>IFSC Code</th>

                <th>Status</th>

                <th>Created Date</th>

                <th>Updated Date</th>

                <th>Action</th>

              </tr>
            </thead>

            <tbody>

              {/* =================================================
                  NO VENDORS
              ================================================= */}

              {vendors.length === 0 ? (

                <tr>

                  <td
                    colSpan="13"
                    className="vendor-table-empty"
                  >
                    No vendors found.
                  </td>

                </tr>

              ) : filteredVendors.length === 0 ? (

                <tr>

                  <td
                    colSpan="13"
                    className="vendor-table-empty"
                  >
                    No vendors match the selected filters.
                  </td>

                </tr>

              ) : (

                filteredVendors.map((vendor) => (

                  <tr
                    key={vendor.vendorId}
                  >

                    <td>
                      {vendor.vendorId || "-"}
                    </td>

                    <td>
                      {vendor.vendorCode || "-"}
                    </td>

                    <td>
                      {vendor.vendorName || "-"}
                    </td>

                    <td>
                      {vendor.email || "-"}
                    </td>

                    <td>
                      {vendor.phone || "-"}
                    </td>

                    <td>
                      {vendor.address || "-"}
                    </td>

                    <td>
                      {vendor.taxNumber || "-"}
                    </td>

                    <td>
                      {vendor.bankAccountNumber || "-"}
                    </td>

                    <td>
                      {vendor.ifscCode || "-"}
                    </td>

                    <td>

                      <span
                        className={
                          vendor.status === "Active"
                            ? "vendor-status-active"
                            : "vendor-status-inactive"
                        }
                      >
                        {vendor.status || "-"}
                      </span>

                    </td>

                    <td>
                      {formatDate(
                        vendor.createdDate
                      )}
                    </td>

                    <td>
                      {formatDate(
                        vendor.updatedDate
                      )}
                    </td>

                    {/* =================================================
                        ACTIONS
                    ================================================= */}

                    <td>

                      <div className="vendor-actions">

                        {/* VIEW */}

                        <button
                          type="button"
                          className="vendor-view-action"
                          onClick={() =>
                            handleViewVendor(vendor)
                          }
                        >
                          View
                        </button>

                        {/* UPDATE */}

                        <button
                          type="button"
                          className="vendor-update-action"
                          onClick={() =>
                            handleUpdateVendor(vendor)
                          }
                        >
                          Update
                        </button>

                        {/* DELETE */}

                        <button
                          type="button"
                          className="vendor-delete-action"
                          onClick={() =>
                            handleDeleteClick(vendor)
                          }
                        >
                          Delete
                        </button>

                      </div>

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* =========================================================
          VIEW VENDOR - MUI DIALOG
      ========================================================= */}

      <Dialog
        open={showViewDialog}
        onClose={handleCloseView}
        fullWidth
        maxWidth="sm"
      >

        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "18px",
            fontWeight: 700,
          }}
        >

          Vendor Details

          <Button
            onClick={handleCloseView}
            sx={{
              minWidth: "32px",
              width: "32px",
              height: "32px",
              padding: 0,
            }}
          >
            <CloseRoundedIcon />
          </Button>

        </DialogTitle>

        <Divider />

        <DialogContent>

          {selectedVendor && (

            <div className="vendor-view-grid">

              <div className="vendor-view-item">
                <span>Vendor ID</span>
                <strong>
                  {selectedVendor.vendorId || "-"}
                </strong>
              </div>

              <div className="vendor-view-item">
                <span>Vendor Code</span>
                <strong>
                  {selectedVendor.vendorCode || "-"}
                </strong>
              </div>

              <div className="vendor-view-item">
                <span>Vendor Name</span>
                <strong>
                  {selectedVendor.vendorName || "-"}
                </strong>
              </div>

              <div className="vendor-view-item">
                <span>Email</span>
                <strong>
                  {selectedVendor.email || "-"}
                </strong>
              </div>

              <div className="vendor-view-item">
                <span>Phone</span>
                <strong>
                  {selectedVendor.phone || "-"}
                </strong>
              </div>

              <div className="vendor-view-item">
                <span>Status</span>
                <strong>
                  {selectedVendor.status || "-"}
                </strong>
              </div>

              <div className="vendor-view-item">
                <span>GST Number</span>
                <strong>
                  {selectedVendor.taxNumber || "-"}
                </strong>
              </div>

              <div className="vendor-view-item">
                <span>IFSC Code</span>
                <strong>
                  {selectedVendor.ifscCode || "-"}
                </strong>
              </div>

              <div className="vendor-view-item">
                <span>Bank Account Number</span>
                <strong>
                  {selectedVendor.bankAccountNumber || "-"}
                </strong>
              </div>

              <div className="vendor-view-item vendor-view-full">
                <span>Address</span>
                <strong>
                  {selectedVendor.address || "-"}
                </strong>
              </div>

              {/* =================================================
                  AUDIT INFORMATION
              ================================================= */}

              <div className="vendor-view-section-title">
                Audit Information
              </div>

              <div className="vendor-view-item">
                <span>Created Date</span>
                <strong>
                  {formatDate(
                    selectedVendor.createdDate
                  )}
                </strong>
              </div>

              <div className="vendor-view-item">
                <span>Updated Date</span>
                <strong>
                  {formatDate(
                    selectedVendor.updatedDate
                  )}
                </strong>
              </div>

              <div className="vendor-view-item">
                <span>Updated By</span>
                <strong>
                  {selectedVendor.updatedBy || "-"}
                </strong>
              </div>

              <div className="vendor-view-item">
                <span>Deleted Date</span>
                <strong>
                  {formatDate(
                    selectedVendor.deletedDate
                  )}
                </strong>
              </div>

              <div className="vendor-view-item">
                <span>Deleted By</span>
                <strong>
                  {selectedVendor.deletedBy || "-"}
                </strong>
              </div>

            </div>

          )}

        </DialogContent>

        <DialogActions>

          <Button
            onClick={handleCloseView}
            variant="outlined"
          >
            Close
          </Button>

        </DialogActions>

      </Dialog>

      {/* =========================================================
          UPDATE VENDOR FORM
      ========================================================= */}

      {showEditForm && selectedVendor && (

        <VendorForm
          vendor={selectedVendor}
          currentUserName={currentUserName}
          onClose={handleCloseEdit}
          onSaved={handleVendorUpdated}
        />

      )}

      {/* =========================================================
          DELETE CONFIRMATION - MUI DIALOG
      ========================================================= */}

      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        fullWidth
        maxWidth="xs"
      >

        <DialogTitle
          sx={{
            fontSize: "18px",
            fontWeight: 700,
          }}
        >
          Delete Vendor
        </DialogTitle>

        <DialogContent>

          <div
            style={{
              fontSize: "14px",
              color: "#475467",
              lineHeight: 1.7,
              paddingTop: "4px",
            }}
          >

            <div>
              <strong>Vendor:</strong>{" "}
              {vendorToDelete?.vendorName || "-"}
            </div>

            <div>
              <strong>Vendor ID:</strong>{" "}
              {vendorToDelete?.vendorId || "-"}
            </div>

            <div
              style={{
                marginTop: "12px",
              }}
            >
              Are you sure you want to delete this vendor?
            </div>

            <div
              style={{
                marginTop: "12px",
              }}
            >
              <strong>Action:</strong>{" "}
              Deactivate Vendor
            </div>

            <div>
              <strong>Performed By:</strong>{" "}
              {currentUserName || "-"}
            </div>

            <div
              style={{
                marginTop: "12px",
              }}
            >
              The vendor will be marked as{" "}
              <strong>Inactive</strong>.
            </div>

          </div>

          {deleteError && (

            <div
              style={{
                marginTop: "14px",
                padding: "10px 12px",
                borderRadius: "6px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#dc2626",
                fontSize: "12px",
              }}
            >
              {deleteError}
            </div>

          )}

        </DialogContent>

        <DialogActions
          sx={{
            padding: "16px 24px",
            gap: "8px",
          }}
        >

          <Button
            onClick={handleCloseDeleteDialog}
            variant="outlined"
            disabled={deleting}
          >
            Cancel
          </Button>

          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            disabled={deleting}
          >
            {deleting
              ? "Deleting..."
              : "Delete"}
          </Button>

        </DialogActions>

      </Dialog>

    </>
  );
};

export default VendorTable;