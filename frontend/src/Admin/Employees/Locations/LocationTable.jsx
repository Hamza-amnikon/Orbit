import "./LocationTable.css";

import {
  IconButton,
  Tooltip,
} from "@mui/material";

import {
  Edit,
  Delete,
  Visibility,
} from "@mui/icons-material";

function LocationTable({
  locations = [],
  editLocation,
  deleteLocation,
}) {
  return (
    <div className="location-table-wrapper">

      {/* Header */}

      <div className="location-table-header">

        <div>

          <h2>Location List</h2>

          <p>
            {locations.length} Locations Found
          </p>

        </div>

      </div>

      {/* Table */}

      <div className="table-responsive">

        <table className="location-table">

          <thead>

            <tr>

              <th>Location Code</th>

              <th>Location Name</th>

              <th>City</th>

              <th>Country</th>

              <th>Currency Code</th>

              <th>Timezone</th>

              <th>Created Date</th>

              <th>Status</th>

              <th>Action</th>

            </tr>

          </thead>

          <tbody>

            {locations.length === 0 ? (

              <tr>

                <td
                  colSpan="9"
                  className="no-records"
                >
                  No Locations Found
                </td>

              </tr>

            ) : (

              locations.map((location) => (

                <tr key={location.locationId}>

                  <td className="location-code">
                    {location.locationCode}
                  </td>

                  <td className="location-name">
                    {location.locationName}
                  </td>

                  <td>
                    {location.city || "-"}
                  </td>

                  <td>
                    {location.country || "-"}
                  </td>

                  <td>
                    {location.currencyCode || "-"}
                  </td>

                  <td>
                    {location.timeZone || "-"}
                  </td>

                  <td>
                    {location.createdDate
                      ? new Date(location.createdDate).toLocaleDateString("en-GB")
                      : "-"}
                  </td>

                  <td>

                    <span
                      className={`status-badge ${
                        location.status === "Active"
                          ? "active"
                          : "inactive"
                      }`}
                    >
                      {location.status}
                    </span>

                  </td>

                  <td>

                    <div className="action-buttons">



                      <Tooltip title="Edit">

                        <IconButton
                          className="edit-btn"
                          onClick={() => editLocation(location)}
                        >

                          <Edit fontSize="small" />

                        </IconButton>

                      </Tooltip>

                      <Tooltip title="Delete">

                        <IconButton
                          className="delete-btn"
                          onClick={() =>
                            deleteLocation(location.locationId)
                          }
                        >

                          <Delete fontSize="small" />

                        </IconButton>

                      </Tooltip>

                    </div>

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default LocationTable;