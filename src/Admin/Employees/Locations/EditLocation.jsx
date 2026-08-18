import { useEffect, useState } from "react";
import axios from "axios";

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    Grid
} from "@mui/material";

const API = "https://localhost:7281/api/location";

function EditLocation({
    open,
    handleClose,
    handleUpdate,
    location
}) {

    const [formData, setFormData] = useState({
        locationId: "",
        locationName: "",
        locationCode: "",
        country: "",
        city: "",
        status: "Active"
    });

    const [countries, setCountries] = useState([]);
    const [cities, setCities] = useState([]);

    // =============================
    // Load Countries
    // =============================
    useEffect(() => {
        loadCountries();
    }, []);

    const loadCountries = async () => {
        try {
            const response = await axios.get(`${API}/countries`);
            setCountries(response.data);
        }
        catch (error) {
            console.log(error);
        }
    };

    // =============================
    // Load Cities
    // =============================
    const loadCities = async (country) => {
        try {
            const response = await axios.get(
                `${API}/cities/${encodeURIComponent(country)}`
            );

            setCities(response.data);
        }
        catch (error) {
            console.log(error);
        }
    };

    // =============================
    // Populate Edit Form
    // =============================
    useEffect(() => {

        if (!location) return;

        setFormData({
            locationId: location.locationId || "",
            locationName: location.locationName || "",
            locationCode: location.locationCode || "",
            country: location.country || "",
            city: location.city || "",
            status: location.status || "Active"
        });

        if (location.country) {
            loadCities(location.country);
        }

    }, [location]);

    // =============================
    // Handle Change
    // =============================
    const handleChange = async (e) => {

        const { name, value } = e.target;

        if (name === "country") {

            setFormData(prev => ({
                ...prev,
                country: value,
                city: ""
            }));

            await loadCities(value);

            return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // =============================
    // Update
    // =============================
    const onUpdate = () => {

        handleUpdate(formData);

    };

    return (

        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            maxWidth="sm"
        >

            <DialogTitle
                sx={{
                    fontWeight: 700,
                    fontSize: "1.5rem"
                }}
            >
                Edit Location
            </DialogTitle>

            <DialogContent dividers>

                <Grid container spacing={3} sx={{ mt: 0.5 }}>

                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            fullWidth
                            required
                            label="Location Name"
                            name="locationName"
                            value={formData.locationName}
                            onChange={handleChange}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            fullWidth
                            required
                            label="Location Code"
                            name="locationCode"
                            value={formData.locationCode}
                            onChange={handleChange}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            select
                            fullWidth
                            label="Country"
                            name="country"
                            value={formData.country}
                            onChange={handleChange}
                        >
                            {countries.map(country => (
                                <MenuItem
                                    key={country}
                                    value={country}
                                >
                                    {country}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            select
                            fullWidth
                            label="City"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            disabled={!formData.country}
                        >
                            {cities.map(city => (
                                <MenuItem
                                    key={city}
                                    value={city}
                                >
                                    {city}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            select
                            fullWidth
                            label="Status"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                        >
                            <MenuItem value="Active">
                                Active
                            </MenuItem>

                            <MenuItem value="Inactive">
                                Inactive
                            </MenuItem>
                        </TextField>
                    </Grid>

                </Grid>

            </DialogContent>

            <DialogActions sx={{ padding: 2 }}>

                <Button
                    onClick={handleClose}
                    color="inherit"
                >
                    Cancel
                </Button>

                <Button
                    variant="contained"
                    onClick={onUpdate}
                >
                    Update Location
                </Button>

            </DialogActions>

        </Dialog>

    );

}

export default EditLocation;