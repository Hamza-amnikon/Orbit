// ============================================================
// PermissionService.js
// ============================================================

const PERMISSION_API =
  import.meta.env.VITE_PERMISSION_API_URL || "https://localhost:7146/api";

const ROLE_API =
  import.meta.env.VITE_ROLE_API_URL || "https://localhost:7294/api";

// ============================================================
// ID HELPER
// ============================================================

function normalizeId(value, fieldName = "Id") {
  // Number
  if (typeof value === "number") {
    if (Number.isInteger(value) && value > 0) {
      return value;
    }
  }

  // String number
  if (typeof value === "string") {
    const trimmed = value.trim();

    if (trimmed !== "") {
      const numberValue = Number(trimmed);

      if (Number.isInteger(numberValue) && numberValue > 0) {
        return numberValue;
      }
    }
  }

  // Object
  if (value && typeof value === "object") {
    const possibleId =
      value.roleId ??
      value.RoleId ??
      value.permissionId ??
      value.PermissionId ??
      value.id ??
      value.Id;

    if (possibleId !== undefined && possibleId !== null) {
      const numberValue = Number(possibleId);

      if (Number.isInteger(numberValue) && numberValue > 0) {
        return numberValue;
      }
    }
  }

  throw new Error(`${fieldName} must be a valid numeric ID.`);
}

// ============================================================
// HTTP REQUEST
// ============================================================

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,

    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    let message = `Request failed: ${response.status}`;

    try {
      const errorText = await response.text();

      if (errorText) {
        message = errorText;
      }
    } catch {
      // Ignore parsing errors
    }

    throw new Error(message);
  }

  // 204 No Content
  if (response.status === 204) {
    return null;
  }

  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// ============================================================
// PERMISSION API
// ============================================================

// GET
// /api/Permission

export async function getPermissions() {
  return await request(`${PERMISSION_API}/Permission`);
}

// GET
// /api/Permission/{id}

export async function getPermission(id) {
  const permissionId = normalizeId(id, "PermissionId");

  return await request(`${PERMISSION_API}/Permission/${permissionId}`);
}

// POST
// /api/Permission

export async function createPermission(permission) {
  if (!permission) {
    throw new Error("Permission data is required.");
  }

  return await request(`${PERMISSION_API}/Permission`, {
    method: "POST",

    body: JSON.stringify(permission),
  });
}

// PUT
// /api/Permission/{id}

export async function updatePermission(id, permission) {
  const permissionId = normalizeId(id, "PermissionId");

  return await request(`${PERMISSION_API}/Permission/${permissionId}`, {
    method: "PUT",

    body: JSON.stringify({
      ...permission,

      permissionId,
    }),
  });
}

// ============================================================
// ROLE API
// ============================================================

// GET
// /api/Role

export async function getRoles() {
  return await request(`${ROLE_API}/Role`);
}

// GET
// /api/Role/active

export async function getActiveRoles() {
  return await request(`${ROLE_API}/Role/active`);
}

// GET
// /api/Role/{id}

export async function getRole(id) {
  const roleId = normalizeId(id, "RoleId");

  return await request(`${ROLE_API}/Role/${roleId}`);
}

// ============================================================
// ROLE PERMISSION API
// ============================================================

// GET
// /api/RolePermission/role/{roleId}

export async function getRolePermissions(roleId) {
  const normalizedRoleId = normalizeId(roleId, "RoleId");

  return await request(
    `${PERMISSION_API}/RolePermission/role/${normalizedRoleId}`,
  );
}

// ============================================================
// ASSIGN ROLE PERMISSION
// ============================================================
//
// POST
// /api/RolePermission
//
// Body:
//
// {
//     "roleId": 1,
//     "permissionId": 5
// }
//
// ============================================================

export async function assignRolePermission(roleId, permissionId) {
  const normalizedRoleId = normalizeId(roleId, "RoleId");

  const normalizedPermissionId = normalizeId(permissionId, "PermissionId");

  const body = {
    roleId: normalizedRoleId,

    permissionId: normalizedPermissionId,
  };

  console.log("ASSIGN ROLE PERMISSION", body);

  return await request(`${PERMISSION_API}/RolePermission`, {
    method: "POST",

    body: JSON.stringify(body),
  });
}

// ============================================================
// REMOVE ROLE PERMISSION
// ============================================================
//
// DELETE
// /api/RolePermission/role/{roleId}/permission/{permissionId}
//
// ============================================================

export async function removeRolePermission(roleId, permissionId) {
  const normalizedRoleId = normalizeId(roleId, "RoleId");

  const normalizedPermissionId = normalizeId(permissionId, "PermissionId");

  return await request(
    `${PERMISSION_API}/RolePermission/role/${normalizedRoleId}/permission/${normalizedPermissionId}`,
    {
      method: "DELETE",
    },
  );
}

// ============================================================
// SAVE ROLE PERMISSIONS
// ============================================================
//
// permissions:
//
// [
//   {
//      permissionId: 1,
//      enabled: true
//   }
// ]
//
// currentPermissionIds:
//
// [1, 5, 8]
//
// ============================================================

export async function saveRolePermissions(
  roleId,
  permissions = [],
  currentPermissionIds = [],
) {
  const normalizedRoleId = normalizeId(roleId, "RoleId");

  if (!Array.isArray(permissions)) {
    throw new Error("permissions must be an array.");
  }

  if (!Array.isArray(currentPermissionIds)) {
    throw new Error("currentPermissionIds must be an array.");
  }

  // ----------------------------------------------------------
  // SELECTED
  // ----------------------------------------------------------

  const selectedPermissionIds = permissions

    .filter((permission) => permission?.enabled === true)

    .map((permission) =>
      normalizeId(
        permission?.permissionId ??
          permission?.PermissionId ??
          permission?.id ??
          permission?.Id,

        "PermissionId",
      ),
    );

  const selectedIds = [...new Set(selectedPermissionIds)];

  // ----------------------------------------------------------
  // CURRENT
  // ----------------------------------------------------------

  const currentIds = [
    ...new Set(
      currentPermissionIds.map((permission) =>
        normalizeId(
          permission?.permissionId ??
            permission?.PermissionId ??
            permission?.id ??
            permission?.Id ??
            permission,

          "PermissionId",
        ),
      ),
    ),
  ];

  // ----------------------------------------------------------
  // TO ADD
  // ----------------------------------------------------------

  const toAdd = selectedIds.filter(
    (permissionId) => !currentIds.includes(permissionId),
  );

  // ----------------------------------------------------------
  // TO REMOVE
  // ----------------------------------------------------------

  const toRemove = currentIds.filter(
    (permissionId) => !selectedIds.includes(permissionId),
  );

  console.log("=================================");

  console.log("SAVE ROLE PERMISSIONS");

  console.log("Role ID:", normalizedRoleId);

  console.log("Selected:", selectedIds);

  console.log("Current:", currentIds);

  console.log("Add:", toAdd);

  console.log("Remove:", toRemove);

  console.log("=================================");

  // ----------------------------------------------------------
  // ADD
  // ----------------------------------------------------------

  for (const permissionId of toAdd) {
    await assignRolePermission(normalizedRoleId, permissionId);
  }

  // ----------------------------------------------------------
  // REMOVE
  // ----------------------------------------------------------

  for (const permissionId of toRemove) {
    await removeRolePermission(normalizedRoleId, permissionId);
  }

  return true;
}

// ============================================================
// LOAD PERMISSION PAGE
// ============================================================

export async function getPermissionPageData() {
  const [roles, permissions] = await Promise.all([
    getRoles(),

    getPermissions(),
  ]);

  return {
    roles: Array.isArray(roles) ? roles : [],

    permissions: Array.isArray(permissions) ? permissions : [],
  };
}

// ============================================================
// ROLE + PERMISSIONS
// ============================================================

export async function getRolePermissionData(roleId) {
  const normalizedRoleId = normalizeId(roleId, "RoleId");

  const [role, rolePermissions] = await Promise.all([
    getRole(normalizedRoleId),

    getRolePermissions(normalizedRoleId),
  ]);

  return {
    role,

    rolePermissions: Array.isArray(rolePermissions) ? rolePermissions : [],
  };
}

// ============================================================
// DEFAULT EXPORT
// ============================================================

const PermissionService = {
  getPermissions,

  getPermission,

  createPermission,

  updatePermission,

  getRoles,

  getActiveRoles,

  getRole,

  getRolePermissions,

  assignRolePermission,

  removeRolePermission,

  saveRolePermissions,

  getPermissionPageData,

  getRolePermissionData,
};

export default PermissionService;
