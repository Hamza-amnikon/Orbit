import { MuiTableBodyMigration, MuiTableCellMigration, MuiTableHeadMigration, MuiTableMigration, MuiTableRowMigration } from "../../../components/ui/MuiCompat.jsx";
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
import { Box as MuiLayoutBox, Typography as MuiText } from "@mui/material";

function LocationTable({
  locations = [],
  editLocation,
  deleteLocation,
}) {
  return (
    <MuiLayoutBox className="location-table-wrapper" component="div">

      {/* Header */}

      <MuiLayoutBox className="location-table-header" component="div">

        <MuiLayoutBox component="div">

          <MuiText component="h2" variant="h5">Location List</MuiText>

          <MuiText component="p" variant="body1">
            {locations.length} Locations Found
          </MuiText>

        </MuiLayoutBox>

      </MuiLayoutBox>

      {/* Table */}

      <MuiLayoutBox className="table-responsive" component="div">

        <MuiTableMigration className="location-table">

          <MuiTableHeadMigration>

            <MuiTableRowMigration>

              <MuiTableCellMigration>Location Code</MuiTableCellMigration>

              <MuiTableCellMigration>Location Name</MuiTableCellMigration>

              <MuiTableCellMigration>City</MuiTableCellMigration>

              <MuiTableCellMigration>Country</MuiTableCellMigration>

              <MuiTableCellMigration>Currency Code</MuiTableCellMigration>

              <MuiTableCellMigration>Timezone</MuiTableCellMigration>

              <MuiTableCellMigration>Created Date</MuiTableCellMigration>

              <MuiTableCellMigration>Status</MuiTableCellMigration>

              <MuiTableCellMigration>Action</MuiTableCellMigration>

            </MuiTableRowMigration>

          </MuiTableHeadMigration>

          <MuiTableBodyMigration>

            {locations.length === 0 ? (

              <MuiTableRowMigration>

                <MuiTableCellMigration
                  colSpan="9"
                  className="no-records"
                >
                  No Locations Found
                </MuiTableCellMigration>

              </MuiTableRowMigration>

            ) : (

              locations.map((location) => (

                <MuiTableRowMigration key={location.locationId}>

                  <MuiTableCellMigration className="location-code">
                    {location.locationCode}
                  </MuiTableCellMigration>

                  <MuiTableCellMigration className="location-name">
                    {location.locationName}
                  </MuiTableCellMigration>

                  <MuiTableCellMigration>
                    {location.city || "-"}
                  </MuiTableCellMigration>

                  <MuiTableCellMigration>
                    {location.country || "-"}
                  </MuiTableCellMigration>

                  <MuiTableCellMigration>
                    {location.currencyCode || "-"}
                  </MuiTableCellMigration>

                  <MuiTableCellMigration>
                    {location.timeZone || "-"}
                  </MuiTableCellMigration>

                  <MuiTableCellMigration>
                    {location.createdDate
                      ? new Date(location.createdDate).toLocaleDateString("en-GB")
                      : "-"}
                  </MuiTableCellMigration>

                  <MuiTableCellMigration>

                    <MuiText
                      className={`status-badge ${
                        location.status === "Active"
                          ? "active"
                          : "inactive"
                      }`}
                     component="span" variant="inherit">
                      {location.status}
                    </MuiText>

                  </MuiTableCellMigration>

                  <MuiTableCellMigration>

                    <MuiLayoutBox className="action-buttons" component="div">



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
                            deleteLocation(location)
                          }
                        >

                          <Delete fontSize="small" />

                        </IconButton>

                      </Tooltip>

                    </MuiLayoutBox>

                  </MuiTableCellMigration>

                </MuiTableRowMigration>

              ))

            )}

          </MuiTableBodyMigration>

        </MuiTableMigration>

      </MuiLayoutBox>

    </MuiLayoutBox>
  );
}

export default LocationTable;
