import React, { useEffect, useState } from "react";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

import "./VendorForm.css";

import {
  createVendor,
  updateVendor,
  getVendors,
} from "./services/vendorService";

const emptyVendor = {
  vendorCode: "",
  vendorName: "",
  email: "",
  phone: "",
  address: "",
  taxNumber: "",
  bankAccountNumber: "",
  ifscCode: "",
  status: "Active",

  vendorId: null,

  createdDate: null,
  updatedDate: null,
  updatedBy: "",
  deletedDate: null,
  deletedBy: "",
};

const VendorForm = ({
  onClose,
  onSaved,
  vendor = null,
  currentUserName = "",
}) => {
  const [form, setForm] = useState(emptyVendor);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loadingVendorCode, setLoadingVendorCode] =
    useState(true);

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
  // LOAD EXISTING VENDOR
  // =========================================================

  useEffect(() => {
    if (vendor) {
      setForm({
        vendorId: vendor.vendorId ?? null,

        vendorCode: vendor.vendorCode ?? "",
        vendorName: vendor.vendorName ?? "",
        email: vendor.email ?? "",
        phone: vendor.phone ?? "",
        address: vendor.address ?? "",
        taxNumber: vendor.taxNumber ?? "",
        bankAccountNumber:
          vendor.bankAccountNumber ?? "",
        ifscCode: vendor.ifscCode ?? "",
        status: vendor.status ?? "Active",

        createdDate: vendor.createdDate ?? null,
        updatedDate: vendor.updatedDate ?? null,
        updatedBy: vendor.updatedBy ?? "",
        deletedDate: vendor.deletedDate ?? null,
        deletedBy: vendor.deletedBy ?? "",
      });

      setLoadingVendorCode(false);
    }
  }, [vendor]);

  // =========================================================
  // GENERATE CODE ONLY FOR ADD VENDOR
  // =========================================================

  useEffect(() => {
    if (vendor) {
      return;
    }

    generateNextVendorCode();
  }, [vendor]);

  // =========================================================
  // GENERATE NEXT VENDOR CODE
  // =========================================================

  const generateNextVendorCode = async () => {
    try {
      setLoadingVendorCode(true);
      setError("");

      const result = await getVendors();

      const vendors = Array.isArray(result)
        ? result
        : [];

      let highestNumber = 0;

      vendors.forEach((vendor) => {
        const code = String(
          vendor.vendorCode || ""
        )
          .trim()
          .toUpperCase();

        const match =
          code.match(/^VEN-(\d+)$/);

        if (match) {
          const number = parseInt(
            match[1],
            10
          );

          if (
            !Number.isNaN(number) &&
            number > highestNumber
          ) {
            highestNumber = number;
          }
        }
      });

      const nextNumber =
        highestNumber + 1;

      const nextVendorCode =
        `VEN-${String(nextNumber).padStart(
          3,
          "0"
        )}`;

      setForm((previous) => ({
        ...previous,
        vendorCode: nextVendorCode,
      }));

    } catch (err) {

      console.error(
        "Failed to generate vendor code:",
        err
      );

      setForm((previous) => ({
        ...previous,
        vendorCode: "VEN-001",
      }));

      setError(
        "Unable to load existing vendors. Please verify the generated Vendor Code before saving."
      );

    } finally {

      setLoadingVendorCode(false);

    }
  };

  // =========================================================
  // HANDLE CHANGE
  // =========================================================

  const handleChange = (e) => {
    const { name } = e.target;
    let { value } = e.target;

    // =======================================================
    // VENDOR NAME
    // =======================================================

    if (name === "vendorName") {
      value = value.replace(
        /[^A-Za-z\s.&'-]/g,
        ""
      );
    }

    // =======================================================
    // PHONE
    // =======================================================

    if (name === "phone") {
      value = value
        .replace(/\D/g, "")
        .slice(0, 10);
    }

    // =======================================================
    // GST NUMBER
    // =======================================================

    if (name === "taxNumber") {
      value = value
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 15);
    }

    // =======================================================
    // BANK ACCOUNT NUMBER
    // =======================================================

    if (name === "bankAccountNumber") {
      value = value
        .replace(/\D/g, "")
        .slice(0, 18);
    }

    // =======================================================
    // IFSC CODE
    // =======================================================

    if (name === "ifscCode") {
      value = value
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 11);
    }

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    // Clear error while correcting
    if (error) {
      setError("");
    }
  };

  // =========================================================
  // HANDLE SUBMIT
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (loadingVendorCode) {
      setError(
        "Please wait while Vendor Code is being generated."
      );
      return;
    }

    const vendorCode =
      form.vendorCode.trim();

    const vendorName =
      form.vendorName.trim();

    const email =
      form.email.trim();

    const phone =
      form.phone.trim();

    const address =
      form.address.trim();

    const taxNumber =
      form.taxNumber
        .trim()
        .toUpperCase();

    const bankAccountNumber =
      form.bankAccountNumber.trim();

    const ifscCode =
      form.ifscCode
        .trim()
        .toUpperCase();

    // =======================================================
    // VENDOR CODE
    // =======================================================

    if (!vendorCode) {
      setError(
        "Vendor Code could not be generated."
      );
      return;
    }

    if (!/^VEN-\d+$/.test(vendorCode)) {
      setError("Invalid Vendor Code.");
      return;
    }

    // =======================================================
    // VENDOR NAME
    // =======================================================

    if (!vendorName) {
      setError(
        "Vendor Name is required."
      );
      return;
    }

    if (!/^[A-Za-z\s.&'-]+$/.test(vendorName)) {
      setError(
        "Vendor Name can contain only letters, spaces, and common characters."
      );
      return;
    }

    // =======================================================
    // EMAIL
    // =======================================================

    if (!email) {
      setError("Email is required.");
      return;
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setError(
        "Please enter a valid email address."
      );
      return;
    }

    // =======================================================
    // PHONE
    // =======================================================

    if (!phone) {
      setError("Phone is required.");
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      setError(
        "Phone number must contain exactly 10 digits."
      );
      return;
    }

    // =======================================================
    // ADDRESS
    // =======================================================

    if (
      address &&
      address.length < 5
    ) {
      setError(
        "Address must contain at least 5 characters."
      );
      return;
    }

    // =======================================================
    // GST NUMBER
    // =======================================================

    if (taxNumber) {
      const gstRegex =
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

      if (!gstRegex.test(taxNumber)) {
        setError(
          "Please enter a valid GST Number. Example: 27ABCDE1234F1Z5."
        );
        return;
      }
    }

    // =======================================================
    // BANK ACCOUNT
    // =======================================================

    if (bankAccountNumber) {
      if (
        !/^\d{1,18}$/.test(
          bankAccountNumber
        )
      ) {
        setError(
          "Bank Account Number must contain only numbers and maximum 18 digits."
        );
        return;
      }
    }

    // =======================================================
    // IFSC
    // =======================================================

    if (ifscCode) {
      const ifscRegex =
        /^[A-Z]{4}0[A-Z0-9]{6}$/;

      if (!ifscRegex.test(ifscCode)) {
        setError(
          "Please enter a valid IFSC Code. Example: HDFC0001234."
        );
        return;
      }
    }

    // =======================================================
    // SAVE
    // =======================================================

    try {

      setSaving(true);

      // =====================================================
      // UPDATE
      // =====================================================

      if (vendor?.vendorId) {

        await updateVendor({
          ...form,

          vendorId:
            vendor.vendorId,

          vendorCode,
          vendorName,
          email,
          phone,
          address,
          taxNumber,
          bankAccountNumber,
          ifscCode,

          status:
            form.status || "Active",

          updatedBy:
            currentUserName || null,
        });

      }

      // =====================================================
      // CREATE
      // =====================================================

      else {

        await createVendor({
          ...form,

          vendorCode,
          vendorName,
          email,
          phone,
          address,
          taxNumber,
          bankAccountNumber,
          ifscCode,

          status: "Active",
        });

      }

      // =====================================================
      // REFRESH
      // =====================================================

      if (onSaved) {
        await onSaved();
      }

      setForm(emptyVendor);

      if (onClose) {
        onClose();
      }

    } catch (err) {

      console.error(
        "Failed to save vendor:",
        err
      );

      setError(
        err?.message ||
          "Failed to save vendor."
      );

    } finally {

      setSaving(false);

    }
  };

  return (
    <div
      className="vendor-modal-overlay"
      onMouseDown={(e) => {
        if (
          e.target === e.currentTarget &&
          !saving
        ) {
          onClose();
        }
      }}
    >

      <div className="vendor-modal">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="vendor-modal-header">

          <div>

            <h2>
              {vendor
                ? "Update Vendor"
                : "Add Vendor"}
            </h2>

            <p>
              {vendor
                ? "Update vendor information."
                : "Add a new company vendor."}
            </p>

          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
          >
            <CloseRoundedIcon />
          </button>

        </div>

        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && (

          <div className="vendor-form-error">
            {error}
          </div>

        )}

        {/* =====================================================
            FORM
        ===================================================== */}

        <form onSubmit={handleSubmit}>

          <div className="vendor-form-grid">

            {/* =================================================
                VENDOR CODE
            ================================================= */}

            <div className="vendor-form-group">

              <label>
                Vendor Code *
              </label>

              <input
                type="text"
                name="vendorCode"
                value={
                  loadingVendorCode
                    ? "Generating..."
                    : form.vendorCode
                }
                readOnly
                placeholder="Generating vendor code..."
              />

            </div>

            {/* =================================================
                VENDOR NAME
            ================================================= */}

            <div className="vendor-form-group">

              <label>
                Vendor Name *
              </label>

              <input
                type="text"
                name="vendorName"
                value={form.vendorName}
                onChange={handleChange}
                placeholder="Enter vendor name"
              />

            </div>

            {/* =================================================
                EMAIL
            ================================================= */}

            <div className="vendor-form-group">

              <label>
                Email *
              </label>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter email"
              />

            </div>

            {/* =================================================
                PHONE
            ================================================= */}

            <div className="vendor-form-group">

              <label>
                Phone *
              </label>

              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                maxLength={10}
                inputMode="numeric"
              />

            </div>

            {/* =================================================
                ADDRESS
            ================================================= */}

            <div className="vendor-form-group vendor-form-full">

              <label>
                Address
              </label>

              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Enter vendor address"
                rows="3"
              />

            </div>

            {/* =================================================
                GST
            ================================================= */}

            <div className="vendor-form-group">

              <label>
                GST Number
              </label>

              <input
                type="text"
                name="taxNumber"
                value={form.taxNumber}
                onChange={handleChange}
                placeholder="27ABCDE1234F1Z5"
                maxLength={15}
              />

            </div>

            {/* =================================================
                BANK ACCOUNT
            ================================================= */}

            <div className="vendor-form-group">

              <label>
                Bank Account Number
              </label>

              <input
                type="text"
                name="bankAccountNumber"
                value={
                  form.bankAccountNumber
                }
                onChange={handleChange}
                placeholder="Enter bank account number"
                maxLength={18}
                inputMode="numeric"
              />

            </div>

            {/* =================================================
                IFSC
            ================================================= */}

            <div className="vendor-form-group">

              <label>
                IFSC Code
              </label>

              <input
                type="text"
                name="ifscCode"
                value={form.ifscCode}
                onChange={handleChange}
                placeholder="HDFC0001234"
                maxLength={11}
              />

            </div>

            {/* =================================================
                STATUS
            ================================================= */}

            <div className="vendor-form-group">

              <label>
                Status
              </label>

              <select
                name="status"
                value={form.status}
                onChange={handleChange}
              >

                <option value="Active">
                  Active
                </option>

                <option value="Inactive">
                  Inactive
                </option>

              </select>

            </div>

            {/* =================================================
                AUDIT INFORMATION
                ONLY FOR UPDATE
            ================================================= */}

            {vendor && (

              <div className="vendor-form-full vendor-audit-section">

                <div className="vendor-audit-header">

                  <h3>
                    Audit Information
                  </h3>

                  <p>
                    Vendor activity history
                  </p>

                </div>

                <div className="vendor-audit-grid">

                  {/* CREATED DATE */}

                  <div className="vendor-form-group">

                    <label>
                      Created Date
                    </label>

                    <input
                      type="text"
                      value={formatDate(
                        form.createdDate
                      )}
                      readOnly
                    />

                  </div>

                  {/* UPDATED DATE */}

                  <div className="vendor-form-group">

                    <label>
                      Updated Date
                    </label>

                    <input
                      type="text"
                      value={formatDate(
                        form.updatedDate
                      )}
                      readOnly
                    />

                  </div>

                  {/* UPDATED BY */}

                  <div className="vendor-form-group">

                    <label>
                      Updated By
                    </label>

                    <input
                      type="text"
                      value={
                        form.updatedBy || "-"
                      }
                      readOnly
                    />

                  </div>

                  {/* DELETED DATE */}

                  <div className="vendor-form-group">

                    <label>
                      Deleted Date
                    </label>

                    <input
                      type="text"
                      value={formatDate(
                        form.deletedDate
                      )}
                      readOnly
                    />

                  </div>

                  {/* DELETED BY */}

                  <div className="vendor-form-group">

                    <label>
                      Deleted By
                    </label>

                    <input
                      type="text"
                      value={
                        form.deletedBy || "-"
                      }
                      readOnly
                    />

                  </div>

                </div>

              </div>

            )}

          </div>

          {/* =====================================================
              FOOTER
          ===================================================== */}

          <div className="vendor-modal-footer">

            <button
              type="button"
              className="vendor-cancel-btn"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="vendor-save-btn"
              disabled={
                saving ||
                loadingVendorCode
              }
            >
              {saving
                ? "Saving..."
                : vendor
                  ? "Update Vendor"
                  : "Save Vendor"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
};

export default VendorForm;