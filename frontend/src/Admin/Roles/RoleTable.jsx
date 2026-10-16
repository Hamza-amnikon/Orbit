import { MuiButtonMigration, MuiTableBodyMigration, MuiTableCellMigration, MuiTableHeadMigration, MuiTableMigration, MuiTableRowMigration } from "../../components/ui/MuiCompat.jsx";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";

import { Box as MuiLayoutBox, Typography as MuiText } from "@mui/material";

function RoleTable({
  roles,
  setEditRole,
  setShowForm,
  setPendingDelete,
  canEdit,
  canDelete,
}) {
  return (
    <MuiTableMigration className="role-table">
      <MuiTableHeadMigration>
        <MuiTableRowMigration>
          <MuiTableCellMigration>ID</MuiTableCellMigration>

          <MuiTableCellMigration>Role</MuiTableCellMigration>

          <MuiTableCellMigration>Created Date</MuiTableCellMigration>

          <MuiTableCellMigration>Status</MuiTableCellMigration>

          <MuiTableCellMigration style={{ textAlign: "center" }}>Action</MuiTableCellMigration>
        </MuiTableRowMigration>
      </MuiTableHeadMigration>

      <MuiTableBodyMigration>
        {roles.length > 0 ? (
          roles.map((role, index) => (
            <MuiTableRowMigration key={role.roleId}>
              <MuiTableCellMigration>{index + 1}</MuiTableCellMigration>

              <MuiTableCellMigration>
                <MuiText component="strong" variant="inherit">{role.role}</MuiText>
              </MuiTableCellMigration>

              <MuiTableCellMigration>{role.createdDate}</MuiTableCellMigration>

              <MuiTableCellMigration>
                <MuiText
                  className={
                    role.status?.toLowerCase() === "active"
                      ? "status-active"
                      : "status-inactive"
                  }
                 component="span" variant="inherit">
                  {role.status}
                </MuiText>
              </MuiTableCellMigration>

              <MuiTableCellMigration>
                <MuiLayoutBox className="role-actions" component="div">

                  {/* EDIT */}
                  {canEdit && (
                    <MuiButtonMigration
                      className="edit-btn"
                      title="Edit Role"
                      onClick={() => {
                        setEditRole(role);

                        setShowForm(true);
                      }}
                    >
                      <EditRoundedIcon fontSize="small" />
                    </MuiButtonMigration>
                  )}

                  {/* DELETE */}
                  {canDelete && (
                    <MuiButtonMigration
                      className="delete-btn"
                      title="Delete Role"
                      onClick={() => setPendingDelete(role)}
                    >
                      <DeleteRoundedIcon fontSize="small" />
                    </MuiButtonMigration>
                  )}

                </MuiLayoutBox>
              </MuiTableCellMigration>
            </MuiTableRowMigration>
          ))
        ) : (
          <MuiTableRowMigration>
            <MuiTableCellMigration
              colSpan="5"
              style={{
                textAlign: "center",

                padding: "50px",
              }}
            >
              <MuiLayoutBox className="role-empty" component="div">
                <MuiText component="h3" variant="h6">No Roles Found</MuiText>

                <MuiText component="p" variant="body1">
                  Click
                  <MuiText component="strong" variant="inherit"> Add Role </MuiText>
                  to create your first role.
                </MuiText>
              </MuiLayoutBox>
            </MuiTableCellMigration>
          </MuiTableRowMigration>
        )}
      </MuiTableBodyMigration>
    </MuiTableMigration>
  );
}

export default RoleTable;
