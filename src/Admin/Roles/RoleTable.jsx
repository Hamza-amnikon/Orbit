import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";

import Swal from "sweetalert2";

import { deleteRole } from "./RoleService";

function RoleTable({
  roles,

  fetchRoles,

  setEditRole,

  setShowForm,
}) {
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete Role?",

      text: "This role will be permanently deleted.",

      icon: "warning",

      showCancelButton: true,

      confirmButtonColor: "#ef4444",

      cancelButtonColor: "#64748b",

      confirmButtonText: "Delete",

      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteRole(id);

      await fetchRoles();

      Swal.fire({
        icon: "success",

        title: "Deleted",

        text: "Role deleted successfully.",

        timer: 1800,

        showConfirmButton: false,
      });
    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: "error",

        title: "Oops...",

        text: "Unable to delete role.",
      });
    }
  };

  return (
    <table className="role-table">
      <thead>
        <tr>
          <th>ID</th>

          <th>Role</th>

          <th>Created Date</th>

          <th>Status</th>

          <th style={{ textAlign: "center" }}>Action</th>
        </tr>
      </thead>

      <tbody>
        {roles.length > 0 ? (
          roles.map((role, index) => (
            <tr key={role.roleId}>
              <td>{index + 1}</td>

              <td>
                <strong>{role.role}</strong>
              </td>

              <td>{role.createdDate}</td>

              <td>
                <span
                  className={
                    role.status?.toLowerCase() === "active"
                      ? "status-active"
                      : "status-inactive"
                  }
                >
                  {role.status}
                </span>
              </td>

              <td>
                <div className="role-actions">
                  
                  <button
                    className="edit-btn"
                    title="Edit Role"
                    onClick={() => {
                      setEditRole(role);

                      setShowForm(true);
                    }}
                  >
                    <EditRoundedIcon fontSize="small" />
                  </button>

                  <button
                    className="delete-btn"
                    title="Delete Role"
                    onClick={() => handleDelete(role.roleId)}
                  >
                    <DeleteRoundedIcon fontSize="small" />
                  </button>
                </div>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td
              colSpan="5"
              style={{
                textAlign: "center",

                padding: "50px",
              }}
            >
              <div className="role-empty">
                <h3>No Roles Found</h3>

                <p>
                  Click
                  <strong> Add Role </strong>
                  to create your first role.
                </p>
              </div>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

export default RoleTable;
