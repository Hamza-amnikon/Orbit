import React, { useState } from "react";
import "./CustomerForm.css";
import {
    Box,
    Button,
    Card,
    CardContent,
    TextField,
    Typography,
} from "@mui/material";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";

const CustomerForm = ({ onClose }) => {
    const [formData, setFormData] = useState({
        customerName: "",
        companyName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        country: "India",
        gstNumber: "",
    });

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        console.log("Customer:", formData);
    };

    return (
        <Card className="customer-form-card">

            <CardContent>

                <Box className="customer-form-header">
                    <Box>
                        <Typography className="customer-form-title">
                            New Customer
                        </Typography>

                        <Typography className="customer-form-subtitle">
                            Add customer information
                        </Typography>
                    </Box>

                    <Button
                        onClick={onClose}
                        className="customer-close-button"
                    >
                        <CloseRoundedIcon />
                    </Button>
                </Box>


                <Box
                    component="form"
                    onSubmit={handleSubmit}
                    className="customer-form"
                >

                    <TextField
                        label="Customer Name"
                        name="customerName"
                        value={formData.customerName}
                        onChange={handleChange}
                        required
                        fullWidth
                    />

                    <TextField
                        label="Company Name"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        fullWidth
                    />

                    <TextField
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        fullWidth
                    />

                    <TextField
                        label="Phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        fullWidth
                    />

                    <TextField
                        label="Address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        multiline
                        rows={2}
                        fullWidth
                    />

                    <TextField
                        label="City"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        fullWidth
                    />

                    <TextField
                        label="State"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        fullWidth
                    />

                    <TextField
                        label="Country"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        fullWidth
                    />

                    <TextField
                        label="GST Number"
                        name="gstNumber"
                        value={formData.gstNumber}
                        onChange={handleChange}
                        fullWidth
                    />


                    <Box className="customer-form-actions">

                        <Button
                            variant="outlined"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            variant="contained"
                            startIcon={<SaveRoundedIcon />}
                        >
                            Save Customer
                        </Button>

                    </Box>

                </Box>

            </CardContent>

        </Card>
    );
};

export default CustomerForm;