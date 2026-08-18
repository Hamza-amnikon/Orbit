import { useState, useEffect } from "react";
import axios from "axios";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
} from "@mui/material";

function AddLocation({ open, handleClose, handleSave }) {
  const [location, setLocation] = useState({
    locationName: "",
    locationCode: "",
    country: "",
    city: "",
    status: "Active",
  });

  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);

  // ===============================
  // LOAD COUNTRIES
  // ===============================

  useEffect(() => {
    if (open) {
      loadCountries();
    }
  }, [open]);

  const loadCountries = async () => {
    try {
      const response = await axios.get(
        "https://localhost:7281/api/location/countries",
      );

      setCountries(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  // ===============================
  // LOAD CITIES
  // ===============================

  const loadCities = async (country) => {
    try {
      const response = await axios.get(
        `https://localhost:7281/api/location/cities/${country}`,
      );

      console.log("Country:", country);
      console.log("Cities:", response.data);

      setCities(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  // ===============================
  // HANDLE CHANGE
  // ===============================

  const handleChange = async (e) => {
    const { name, value } = e.target;

    if (name === "country") {
      setLocation({
        ...location,
        country: value,
        city: "",
        locationCode: "",
      });

      await loadCities(value);

      return;
    }

    if (name === "city") {
      const selectedCity = cities.find((c) => c.city === value);

      setLocation({
        ...location,
        city: value,
        locationCode: selectedCity?.locationCode || "",
      });

      return;
    }

    setLocation({
      ...location,
      [name]: value,
    });
  };

  // ===============================
  // SAVE
  // ===============================

  const onSave = () => {
    console.log("Sending Location:", location);

    handleSave(location);

    setLocation({
      locationName: "",
      locationCode: "",
      country: "",
      city: "",
      status: "Active",
    });

    setCities([]);
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle
        sx={{
          fontWeight: 700,
          fontSize: "1.5rem",
        }}
      >
        Add New Location
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              required
              label="Location Name"
              name="locationName"
              value={location.locationName}
              onChange={handleChange}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Location Code"
              name="locationCode"
              value={location.locationCode}
              InputProps={{
                readOnly: true,
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              select
              fullWidth
              label="Country"
              name="country"
              value={location.country}
              onChange={handleChange}
            >
              {countries.map((country) => (
                <MenuItem key={country} value={country}>
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
              value={location.city}
              onChange={handleChange}
              disabled={!location.country}
            >
              {cities.map((city) => (
                <MenuItem key={city.locationCode} value={city.city}>
                  {city.city}
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
              value={location.status}
              onChange={handleChange}
            >
              <MenuItem value="Active">Active</MenuItem>

              <MenuItem value="Inactive">Inactive</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ padding: 2 }}>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>

        <Button variant="contained" onClick={onSave}>
          Save Location
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddLocation;
