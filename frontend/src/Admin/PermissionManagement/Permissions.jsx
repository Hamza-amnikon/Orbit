import React, { useEffect, useMemo, useState } from "react";

import {
  getPermissions,
  getRolePermissions,
  assignRolePermission,
  removeRolePermission,
} from "../Services/PermissionService";

import EmployeeService from "../AttendanceManagement/services/EmployeeService";

import { getRoles } from "../Roles/roleApi";

import "./Permissions.css";
import { menu } from "../../components/layout/Sidebar/Sidebar";
/*
|--------------------------------------------------------------------------
| Permissions Page
|--------------------------------------------------------------------------
|
| Real APIs:
|
| Employee API
|   GET /api/Employee
|
| Role API
|   GET /api/Role
|
| Permission API
|   GET /api/Permission
|
| RolePermission API
|   GET    /api/RolePermission/role/{roleId}
|   POST   /api/RolePermission
|   DELETE /api/RolePermission/role/{roleId}/permission/{permissionId}
|
|--------------------------------------------------------------------------
*/

const ACTIONS = [
  "view",
  "create",
  "edit",
  "delete",
  "approve",
  "export",
];

/* ==========================================================================
   Helpers
========================================================================== */

const firstValue = (object, keys, fallback = "") => {
  if (!object) return fallback;

  for (const key of keys) {
    if (
      object[key] !== undefined &&
      object[key] !== null &&
      object[key] !== ""
    ) {
      return object[key];
    }
  }

  return fallback;
};

const getId = (item) => {
  if (!item) return null;

  return firstValue(
    item,
    [
      "id",
      "Id",
      "ID",
      "roleId",
      "RoleId",
      "permissionId",
      "PermissionId",
    ],
    null,
  );
};

const getRoleName = (role) => {
  return String(
    firstValue(
      role,
      [
        "name",
        "Name",
        "roleName",
        "RoleName",
        "role",
        "Role",
        "title",
        "Title",
      ],
      "Unnamed Role",
    ),
  );
};

const getPermissionName = (permission) => {
  return String(
    firstValue(
      permission,
      [
        "name",
        "Name",
        "permissionName",
        "PermissionName",
        "displayName",
        "DisplayName",
        "title",
        "Title",
        "code",
        "Code",
      ],
      "Permission",
    ),
  );
};

const getModuleName = (permission) => {
  return String(
    firstValue(
      permission,
      [
        "module",
        "Module",
        "moduleName",
        "ModuleName",
        "group",
        "Group",
        "category",
        "Category",
      ],
      "HRMS",
    ),
  );
};

const getPageName = (permission) => {
  return String(
    firstValue(
      permission,
      [
        "page",
        "Page",
        "pageName",
        "PageName",
        "resource",
        "Resource",
        "resourceName",
        "ResourceName",
      ],
      getPermissionName(permission),
    ),
  );
};

const getPagePath = (permission) => {
  return String(
    firstValue(
      permission,
      [
        "path",
        "Path",
        "route",
        "Route",
        "url",
        "Url",
        "pageUrl",
        "PageUrl",
      ],
      "",
    ),
  );
};

const getAction = (permission) => {
  const value = firstValue(
    permission,
    [
      "action",
      "Action",
      "permissionType",
      "PermissionType",
      "type",
      "Type",
    ],
    "",
  );

  return String(value).toLowerCase();
};

const normalizeArray = (response) => {
  if (Array.isArray(response)) return response;

  if (response?.data && Array.isArray(response.data)) {
    return response.data;
  }

  if (response?.items && Array.isArray(response.items)) {
    return response.items;
  }

  if (response?.result && Array.isArray(response.result)) {
    return response.result;
  }

  return [];
};

const normalizeId = (id) => {
  if (id === undefined || id === null) return "";

  return String(id);
};

const toBoolean = (value) => {
  return (
    value === true ||
    value === "true" ||
    value === 1 ||
    value === "1"
  );
};

const isSameId = (a, b) => {
  return normalizeId(a) === normalizeId(b);
};

/* ==========================================================================
   Icons
========================================================================== */

const ShieldIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="permission-svg-icon"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path d="M12 3 20 6v5c0 5.5-3.4 8.8-8 10-4.6-1.2-8-4.5-8-10V6l8-3Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const UsersIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="permission-svg-icon"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const LockIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="permission-svg-icon"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <rect x="4" y="10" width="16" height="11" rx="2" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </svg>
);

const UserRoleIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="permission-svg-icon"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c.7-4 3.3-6 8-6s7.3 2 8 6" />
  </svg>
);

const PlusIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="permission-small-icon"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const SearchIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="permission-small-icon"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-4-4" />
  </svg>
);

const RefreshIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="permission-small-icon"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M20 11a8.1 8.1 0 0 0-15.5-2M4 5v4h4" />
    <path d="M4 13a8.1 8.1 0 0 0 15.5 2M20 19v-4h-4" />
  </svg>
);

const ChevronIcon = ({ open }) => (
  <svg
    viewBox="0 0 24 24"
    className={`permission-chevron ${open ? "open" : ""}`}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="m7 10 5 5 5-5" />
  </svg>
);

/* ==========================================================================
   Component
========================================================================== */

export default function Permissions() {
  const [roles, setRoles] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [permissions, setPermissions] = useState([]);

  const [selectedRole, setSelectedRole] = useState(null);

  const [rolePermissions, setRolePermissions] = useState([]);

  const [selectedPermissions, setSelectedPermissions] = useState(
    new Set(),
  );

  const [permissionActions, setPermissionActions] = useState({});

  const [loginPages, setLoginPages] = useState({});

  const [expandedModules, setExpandedModules] = useState(new Set());

  const [roleSearch, setRoleSearch] = useState("");
  const [pageSearch, setPageSearch] = useState("");

  const [activeTab, setActiveTab] = useState("roles");

  // User Permissions (read-only, inherited from the employee's role)
  const [userSearch, setUserSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserPermissions, setSelectedUserPermissions] = useState([]);
  const [loadingUserPermissions, setLoadingUserPermissions] = useState(false);

  const [loading, setLoading] = useState(true);

  const [loadingRolePermissions, setLoadingRolePermissions] =
    useState(false);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  /* ========================================================================
     Find module for a permission ID
  ======================================================================== */

  const getModuleForPermissionId = (permissionId) => {
    const permission = permissions.find((item) =>
      isSameId(getId(item), permissionId),
    );

    return permission
      ? getModuleName(permission)
      : "HRMS";
  };

  /* ========================================================================
     Load initial data
  ======================================================================== */

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        rolesResponse,
        employeeResponse,
        permissionResponse,
      ] = await Promise.all([
        getRoles(),
        EmployeeService.getAllEmployees(),
        getPermissions(),
      ]);

      const rolesData = normalizeArray(rolesResponse);
      const employeeData = normalizeArray(employeeResponse);
      const permissionData = normalizeArray(permissionResponse);

      setRoles(rolesData);
      setEmployees(employeeData);
      setPermissions(permissionData);

      /*
      |--------------------------------------------------------------------------
      | Automatically select first role
      |--------------------------------------------------------------------------
      */

      if (rolesData.length > 0) {
        setSelectedRole((currentRole) => {
          if (!currentRole) {
            return rolesData[0];
          }

          const stillExists = rolesData.find((role) =>
            isSameId(
              getId(role),
              getId(currentRole),
            ),
          );

          return stillExists || rolesData[0];
        });
      } else {
        setSelectedRole(null);
      }

      /*
      |--------------------------------------------------------------------------
      | Expand all modules initially
      |--------------------------------------------------------------------------
      */

      const modules = new Set(
        permissionData.map((permission) =>
          getModuleName(permission),
        ),
      );

      setExpandedModules(modules);
    } catch (err) {
      console.error(
        "Permission page load error:",
        err,
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load permission data.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* ========================================================================
     Load selected role permissions
  ======================================================================== */

  useEffect(() => {
    const loadRolePermissions = async () => {
      if (!selectedRole) {
        setRolePermissions([]);
        setSelectedPermissions(new Set());
        setPermissionActions({});
        setLoginPages({});
        return;
      }

      const roleId = getId(selectedRole);

      if (!roleId) {
        setRolePermissions([]);
        setSelectedPermissions(new Set());
        setPermissionActions({});
        setLoginPages({});
        return;
      }

      try {
        setLoadingRolePermissions(true);
        setError("");

        const response = await getRolePermissions(roleId);

        const data = normalizeArray(response);

        setRolePermissions(data);

        /*
        |--------------------------------------------------------------------------
        | Store assigned permission IDs
        |--------------------------------------------------------------------------
        */

        const assignedIds = new Set();
        const loadedActions = {};
        const loadedLoginPages = {};

        data.forEach((item) => {
          const permissionId = firstValue(
            item,
            [
              "permissionId",
              "PermissionId",
              "permissionID",
              "PermissionID",
              "id",
              "Id",
            ],
            null,
          );

          if (
            permissionId === null ||
            permissionId === undefined
          ) {
            return;
          }

          const id = normalizeId(permissionId);

          const isLoginPage = toBoolean(
            item.isLoginPage ??
            item.IsLoginPage ??
            false,
          );

          if (isLoginPage) {
            const moduleName = getModuleForPermissionId(id);
            loadedLoginPages[moduleName] = id;
          }

          const actions = {
            view:
              item.canView ??
              item.CanView ??
              false,

            create:
              item.canCreate ??
              item.CanCreate ??
              false,

            edit:
              item.canEdit ??
              item.CanEdit ??
              false,

            delete:
              item.canDelete ??
              item.CanDelete ??
              false,

            approve:
              item.canApprove ??
              item.CanApprove ??
              false,

            export:
              item.canExport ??
              item.CanExport ??
              false,
          };

          loadedActions[id] = actions;

          if (Object.values(actions).some(Boolean)) {
            assignedIds.add(id);
          }
        });

        setPermissionActions(loadedActions);
        setSelectedPermissions(assignedIds);
        setLoginPages(loadedLoginPages);

      } catch (err) {
        console.error(
          "Unable to load role permissions:",
          err,
        );

        setRolePermissions([]);
        setSelectedPermissions(new Set());
        setPermissionActions({});

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to load permissions for this role.",
        );
      } finally {
        setLoadingRolePermissions(false);
      }
    };

    loadRolePermissions();
  }, [selectedRole]);

  /* ========================================================================
     Normalize permission structure
  ======================================================================== */

  const permissionRows = useMemo(() => {
    return permissions.map((permission, index) => {
      const id =
        getId(permission) ??
        firstValue(
          permission,
          [
            "permissionId",
            "PermissionId",
          ],
          `permission-${index}`,
        );

      const module = getModuleName(permission);
      const page = getPageName(permission);
      const path = getPagePath(permission);
      const action = getAction(permission);

      return {
        raw: permission,
        id,
        module,
        page,
        path,
        action,
      };
    });
  }, [permissions]);

  /* ========================================================================
     Group pages by module
  ======================================================================== */

const modules = useMemo(() => {
  const grouped = {};

  permissionRows.forEach((permission) => {
    const moduleName =
      permission.module || "HRMS";

    if (!grouped[moduleName]) {
      grouped[moduleName] = [];
    }

    grouped[moduleName].push(permission);
  });

  const getMenuIndex = (module) => {
    const indexes = module.pages
      .map((page) => page.path?.toLowerCase())
      .filter(Boolean)
      .map((pagePath) => {
        const menuItem = menu.find((item) => {
          const permissionPath =
            item.permissionPath?.toLowerCase();

          return (
            permissionPath &&
            (
              pagePath === permissionPath ||
              pagePath.startsWith(`${permissionPath}/`)
            )
          );
        });

        return menuItem
          ? menu.indexOf(menuItem)
          : 999;
      });

    return indexes.length > 0
      ? Math.min(...indexes)
      : 999;
  };

  return Object.entries(grouped)
    .map(([moduleName, pages]) => ({
      moduleName,
      pages,
    }))
    .sort(
      (a, b) =>
        getMenuIndex(a) -
        getMenuIndex(b)
    );
}, [permissionRows, menu]);

  /* ========================================================================
     Filter roles
  ======================================================================== */

  const filteredRoles = useMemo(() => {
    const search = roleSearch
      .trim()
      .toLowerCase();

    if (!search) return roles;

    return roles.filter((role) =>
      getRoleName(role)
        .toLowerCase()
        .includes(search),
    );
  }, [roles, roleSearch]);

  /* ========================================================================
     Filter pages
  ======================================================================== */

  const filteredModules = useMemo(() => {
    const search = pageSearch
      .trim()
      .toLowerCase();

    if (!search) return modules;

    return modules
      .map((module) => {
        const moduleMatches =
          module.moduleName
            .toLowerCase()
            .includes(search);

        const pages = module.pages.filter(
          (page) => {
            return (
              page.page
                .toLowerCase()
                .includes(search) ||
              page.path
                .toLowerCase()
                .includes(search)
            );
          },
        );

        if (moduleMatches) {
          return module;
        }

        if (pages.length > 0) {
          return {
            ...module,
            pages,
          };
        }

        return null;
      })
      .filter(Boolean);
  }, [modules, pageSearch]);

  /* ========================================================================
     Stats
  ======================================================================== */

  const totalRoles = roles.length;

  const totalUsers = employees.length;

  const totalPermissions = permissions.length;

  /* ========================================================================
     Permission matching
  ======================================================================== */

  const hasPermission = (permissionId) => {
    return selectedPermissions.has(
      normalizeId(permissionId),
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Some APIs represent a permission as:
  |
  | Employees.View
  | Employees.Create
  |
  | Other APIs return:
  |
  | page = Employees
  | action = View
  |
  | We support both.
  |--------------------------------------------------------------------------
  */

  const findPermissionForAction = (
    page,
    action,
  ) => {
    const normalizedAction =
      action.toLowerCase();

    return page.find((permission) => {
      if (
        permission.action &&
        permission.action === normalizedAction
      ) {
        return true;
      }

      const combined =
        `${permission.page}.${permission.action}`.toLowerCase();

      const permissionName =
        getPermissionName(
          permission.raw,
        ).toLowerCase();

      return (
        permissionName.includes(
          `.${normalizedAction}`,
        ) ||
        permissionName.includes(
          ` ${normalizedAction}`,
        ) ||
        combined.endsWith(
          `.${normalizedAction}`,
        )
      );
    });
  };

  /* ========================================================================
     Toggle one permission
  ======================================================================== */

  const togglePermission = (
    permission,
    action = "view",
  ) => {
    if (!permission?.id) return;

    const permissionId =
      normalizeId(permission.id);

    setPermissionActions((previous) => {
      const current =
        previous[permissionId] || {
          view: false,
          create: false,
          edit: false,
          delete: false,
          approve: false,
          export: false,
        };

      const updated = {
        ...current,
        [action]: !current[action],
      };

      if (action === "view" && !updated.view) {
        const moduleName =
          permission.module || "HRMS";

        if (
          isSameId(
            loginPages[moduleName],
            permissionId,
          )
        ) {
          setLoginPages((previous) => {
            const next = { ...previous };
            delete next[moduleName];
            return next;
          });
        }
      }

      const hasAnyAction =
        Object.values(updated).some(Boolean);

      setSelectedPermissions(
        (selectedPrevious) => {
          const next = new Set(
            selectedPrevious,
          );

          if (hasAnyAction) {
            next.add(permissionId);
          } else {
            next.delete(permissionId);
          }

          return next;
        },
      );

      return {
        ...previous,
        [permissionId]: updated,
      };
    });
  };

  /* ========================================================================
     Toggle module
  ======================================================================== */

  const toggleModule = (module) => {
    const pages = module.pages.filter(
      (page) =>
        page.id !== null &&
        page.id !== undefined,
    );

    if (pages.length === 0) return;

    const pageIds = pages.map((page) =>
      normalizeId(page.id),
    );

    const moduleSelected =
      pageIds.every((id) =>
        selectedPermissions.has(id),
      );

    setPermissionActions((previous) => {
      const next = {
        ...previous,
      };

      pages.forEach((page) => {
        const id = normalizeId(page.id);

        next[id] = {
          view: !moduleSelected,
          create: !moduleSelected,
          edit: !moduleSelected,
          delete: !moduleSelected,
          approve: !moduleSelected,
          export: !moduleSelected,
        };
      });

      return next;
    });

    setSelectedPermissions((previous) => {
      const next = new Set(previous);

      pageIds.forEach((id) => {
        if (moduleSelected) {
          next.delete(id);
        } else {
          next.add(id);
        }
      });

      return next;
    });

    if (moduleSelected) {
      const moduleName = module.moduleName;

      if (loginPages[moduleName]) {
        setLoginPages((previous) => {
          const next = { ...previous };
          delete next[moduleName];
          return next;
        });
      }
    }
  };

  /* ========================================================================
     Toggle all permissions
  ======================================================================== */

  const allPermissionIds = useMemo(() => {
    return permissionRows
      .map((permission) => permission.id)
      .filter(
        (id) =>
          id !== null &&
          id !== undefined &&
          id !== "",
      )
      .map(normalizeId);
  }, [permissionRows]);

  const allSelected =
    allPermissionIds.length > 0 &&
    allPermissionIds.every((id) =>
      selectedPermissions.has(id),
    );

  const toggleAll = () => {
    const shouldSelectAll =
      !allSelected;

    setPermissionActions((previous) => {
      const next = {
        ...previous,
      };

      allPermissionIds.forEach((id) => {
        next[id] = {
          view: shouldSelectAll,
          create: shouldSelectAll,
          edit: shouldSelectAll,
          delete: shouldSelectAll,
          approve: shouldSelectAll,
          export: shouldSelectAll,
        };
      });

      return next;
    });

    setSelectedPermissions(
      shouldSelectAll
        ? new Set(allPermissionIds)
        : new Set(),
    );

    if (!shouldSelectAll) {
      setLoginPages({});
    }
  };

  /* ========================================================================
     Expand / collapse module
  ======================================================================== */

  const toggleModuleExpanded = (
    moduleName,
  ) => {
    setExpandedModules((previous) => {
      const next = new Set(previous);

      if (next.has(moduleName)) {
        next.delete(moduleName);
      } else {
        next.add(moduleName);
      }

      return next;
    });
  };

  /* ========================================================================
     Select role
  ======================================================================== */

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setSuccessMessage("");
    setError("");
  };


  const selectLoginPage = (permission) => {
    if (!permission?.id) return;

    const permissionId = normalizeId(permission.id);

    const actions =
      permissionActions[permissionId] || {};

    if (!toBoolean(actions.view)) {
      setError(
        "Login page must have View permission.",
      );
      return;
    }

    const moduleName =
      permission.module || "HRMS";

    setError("");

    setLoginPages((previous) => ({
      ...previous,
      [moduleName]: permissionId,
    }));
  };

  /* ========================================================================
     Save permissions
  ======================================================================== */

  const savePermissions = async () => {
    if (!selectedRole) {
      setError(
        "Please select a role first.",
      );
      return;
    }

    const roleId = getId(selectedRole);

    if (!roleId) {
      setError(
        "Selected role does not have a valid ID.",
      );
      return;
    }

    for (const [moduleName, permissionId] of Object.entries(
      loginPages,
    )) {
      const loginActions =
        permissionActions[permissionId] || {};

      if (!toBoolean(loginActions.view)) {
        setError(
          `Login page for ${moduleName} must have View permission.`,
        );
        return;
      }
    }

    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");

      const existingMap = {};

      rolePermissions.forEach((item) => {
        const permissionId = firstValue(
          item,
          [
            "permissionId",
            "PermissionId",
            "permissionID",
            "PermissionID",
            "id",
            "Id",
          ],
          null,
        );

        if (
          permissionId !== null &&
          permissionId !== undefined
        ) {
          existingMap[
            normalizeId(permissionId)
          ] = item;
        }
      });

      /*
      |--------------------------------------------------------------------------
      | Save every page with its six action permissions
      |--------------------------------------------------------------------------
      */

      for (const permission of permissionRows) {
        if (
          permission.id === null ||
          permission.id === undefined ||
          permission.id === ""
        ) {
          continue;
        }

        const permissionId =
          normalizeId(permission.id);

        const actions =
          permissionActions[
            permissionId
          ] || {
            view: false,
            create: false,
            edit: false,
            delete: false,
            approve: false,
            export: false,
          };

        const hasAnyAction =
          Object.values(actions).some(
            Boolean,
          );

        const existing =
          existingMap[permissionId];

        /*
        |--------------------------------------------------------------------------
        | Remove permission when all actions are unchecked
        |--------------------------------------------------------------------------
        */

        if (!hasAnyAction) {
          if (existing) {
            await removeRolePermission(
              roleId,
              permissionId,
            );
          }

          continue;
        }

        /*
        |--------------------------------------------------------------------------
        | Create or update permission
        |--------------------------------------------------------------------------
        */

        const moduleName =
          permission.module || "HRMS";

        const isLoginPage = isSameId(
          loginPages[moduleName],
          permissionId,
        );

        console.log("LOGIN DEBUG:", {
          moduleName,
          loginPages,
          permissionId,
          isLoginPage,
        });

        await assignRolePermission({
          roleId: roleId,
          permissionId: permissionId,
          canView: Boolean(
            actions.view,
          ),
          canCreate: Boolean(
            actions.create,
          ),
          canEdit: Boolean(
            actions.edit,
          ),
          canDelete: Boolean(
            actions.delete,
          ),
          canApprove: Boolean(
            actions.approve,
          ),
          canExport: Boolean(
            actions.export,
          ),
          isLoginPage: isLoginPage,
        });
      }

      /*
      |--------------------------------------------------------------------------
      | Reload role permissions
      |--------------------------------------------------------------------------
      */

      const updatedResponse =
        await getRolePermissions(
          roleId,
        );

      const updatedData =
        normalizeArray(
          updatedResponse,
        );

      setRolePermissions(
        updatedData,
      );

      const updatedActions = {};
      const updatedIds = new Set();
      const updatedLoginPages = {};

      updatedData.forEach((item) => {
        const permissionId =
          firstValue(
            item,
            [
              "permissionId",
              "PermissionId",
              "permissionID",
              "PermissionID",
              "id",
              "Id",
            ],
            null,
          );

        if (
          permissionId === null ||
          permissionId === undefined
        ) {
          return;
        }

        const id =
          normalizeId(permissionId);

        const isLoginPage = toBoolean(
          item.isLoginPage ??
          item.IsLoginPage ??
          false,
        );

        if (isLoginPage) {
          const moduleName = getModuleForPermissionId(id);
          updatedLoginPages[moduleName] = id;
        }

        const actions = {
          view:
            item.canView ??
            item.CanView ??
            false,

          create:
            item.canCreate ??
            item.CanCreate ??
            false,

          edit:
            item.canEdit ??
            item.CanEdit ??
            false,

          delete:
            item.canDelete ??
            item.CanDelete ??
            false,

          approve:
            item.canApprove ??
            item.CanApprove ??
            false,

          export:
            item.canExport ??
            item.CanExport ??
            false,
        };

        updatedActions[id] =
          actions;

        if (
          Object.values(actions).some(
            Boolean,
          )
        ) {
          updatedIds.add(id);
        }
      });

      setPermissionActions(
        updatedActions,
      );

      setSelectedPermissions(
        updatedIds,
      );

      setLoginPages(
        updatedLoginPages,
      );

      setSuccessMessage(
        `Permissions saved for ${getRoleName(
          selectedRole,
        )}.`,
      );
    } catch (err) {
      console.error(
        "Save permissions error:",
        err,
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to save permissions.",
      );
    } finally {
      setSaving(false);
    }
  };

  /* ========================================================================
     Cancel changes
  ======================================================================== */

  const cancelChanges = () => {
    const assignedIds = new Set();
    const restoredActions = {};
    const restoredLoginPages = {};

    rolePermissions.forEach((item) => {
      const permissionId =
        firstValue(
          item,
          [
            "permissionId",
            "PermissionId",
            "permissionID",
            "PermissionID",
            "id",
            "Id",
          ],
          null,
        );

      if (
        permissionId === null ||
        permissionId === undefined
      ) {
        return;
      }

      const id =
        normalizeId(permissionId);

      const isLoginPage = toBoolean(
        item.isLoginPage ??
        item.IsLoginPage ??
        false,
      );

      if (isLoginPage) {
        const moduleName = getModuleForPermissionId(id);
        restoredLoginPages[moduleName] = id;
      }

      const actions = {
        view:
          item.canView ??
          item.CanView ??
          false,

        create:
          item.canCreate ??
          item.CanCreate ??
          false,

        edit:
          item.canEdit ??
          item.CanEdit ??
          false,

        delete:
          item.canDelete ??
          item.CanDelete ??
          false,

        approve:
          item.canApprove ??
          item.CanApprove ??
          false,

        export:
          item.canExport ??
          item.CanExport ??
          false,
      };

      restoredActions[id] =
        actions;

      if (
        Object.values(actions).some(
          Boolean,
        )
      ) {
        assignedIds.add(id);
      }
    });

    setPermissionActions(
      restoredActions,
    );

    setSelectedPermissions(
      assignedIds,
    );

    setLoginPages(
      restoredLoginPages,
    );

    setSuccessMessage("");
    setError("");
  };

  /* ========================================================================
     USER PERMISSIONS - READ ONLY
     ======================================================================== */

  const getEmployeeId = (employee) =>
    firstValue(employee, ["employeeId", "EmployeeId", "id", "Id"], null);

  const getEmployeeAzureId = (employee) =>
    firstValue(employee, ["azureEmployeeId", "AzureEmployeeId"], "-");

  const getEmployeeName = (employee) =>
    String(
      firstValue(
        employee,
        ["employeeName", "EmployeeName", "name", "Name"],
        "Unnamed Employee",
      ),
    );

  const getEmployeeCode = (employee) =>
    String(firstValue(employee, ["employeeCode", "EmployeeCode"], "-"));

  const getEmployeeEmail = (employee) =>
    String(firstValue(employee, ["email", "Email"], "-"));

  const getEmployeeRoleId = (employee) =>
    firstValue(employee, ["roleId", "RoleId"], null);

  const getRoleForEmployee = (employee) => {
    const roleId = getEmployeeRoleId(employee);
    return roles.find((role) => isSameId(getId(role), roleId)) || null;
  };

  const filteredUsers = useMemo(() => {
    const search = userSearch.trim().toLowerCase();
    if (!search) return employees;

    return employees.filter((employee) => {
      const role = getRoleForEmployee(employee);
      return [
        getEmployeeName(employee),
        getEmployeeAzureId(employee),
        getEmployeeCode(employee),
        getEmployeeEmail(employee),
        getRoleName(role),
      ].some((value) =>
        String(value || "").toLowerCase().includes(search),
      );
    });
  }, [employees, roles, userSearch]);

  const userPermissionRows = useMemo(() => {
    const rolePermissionMap = new Map();

    selectedUserPermissions.forEach((item) => {
      const permissionId = firstValue(
        item,
        [
          "permissionId",
          "PermissionId",
          "permissionID",
          "PermissionID",
          "id",
          "Id",
        ],
        null,
      );

      if (permissionId !== null && permissionId !== undefined) {
        rolePermissionMap.set(normalizeId(permissionId), item);
      }
    });

    return permissionRows.map((permission) => {
      const rolePermission = rolePermissionMap.get(
        normalizeId(permission.id),
      );

      return {
        ...permission,
        view: toBoolean(
          rolePermission?.canView ?? rolePermission?.CanView ?? false,
        ),
        create: toBoolean(
          rolePermission?.canCreate ?? rolePermission?.CanCreate ?? false,
        ),
        edit: toBoolean(
          rolePermission?.canEdit ?? rolePermission?.CanEdit ?? false,
        ),
        delete: toBoolean(
          rolePermission?.canDelete ?? rolePermission?.CanDelete ?? false,
        ),
        approve: toBoolean(
          rolePermission?.canApprove ?? rolePermission?.CanApprove ?? false,
        ),
        export: toBoolean(
          rolePermission?.canExport ?? rolePermission?.CanExport ?? false,
        ),
      };
    });
  }, [permissionRows, selectedUserPermissions]);

  const userPermissionModules = useMemo(() => {
    const grouped = {};

    userPermissionRows.forEach((permission) => {
      const moduleName = permission.module || "HRMS";
      if (!grouped[moduleName]) grouped[moduleName] = [];
      grouped[moduleName].push(permission);
    });

    return Object.entries(grouped)
      .map(([moduleName, pages]) => ({ moduleName, pages }))
      .sort((a, b) => {
        const aIndex = modules.findIndex(
          (module) => module.moduleName === a.moduleName,
        );
        const bIndex = modules.findIndex(
          (module) => module.moduleName === b.moduleName,
        );
        return (
          (aIndex === -1 ? 999 : aIndex) -
          (bIndex === -1 ? 999 : bIndex)
        );
      });
  }, [userPermissionRows, modules]);

  const userPermissionCount = useMemo(
    () =>
      userPermissionRows.reduce(
        (count, permission) =>
          count +
          ACTIONS.filter((action) => permission[action]).length,
        0,
      ),
    [userPermissionRows],
  );

  const selectUser = async (employee) => {
    setSelectedUser(employee);
    setSelectedUserPermissions([]);
    setError("");
    setSuccessMessage("");

    const roleId = getEmployeeRoleId(employee);

    if (roleId === null || roleId === undefined || roleId === "") {
      return;
    }

    try {
      setLoadingUserPermissions(true);

      const response = await getRolePermissions(roleId);
      setSelectedUserPermissions(normalizeArray(response));
    } catch (err) {
      console.error("Unable to load user role permissions:", err);
      setSelectedUserPermissions([]);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load permissions for this user's role.",
      );
    } finally {
      setLoadingUserPermissions(false);
    }
  };

  /* ========================================================================
     Refresh
  ======================================================================== */

  const refreshPage = async () => {
    setSuccessMessage("");
    setError("");
    await loadData();
  };

  /* ========================================================================
     Render permission checkbox
  ======================================================================== */

  const renderPermissionCheckbox = (
    permission,
    action,
  ) => {
    if (!permission?.id) {
      return (
        <span className="permission-dash">
          —
        </span>
      );
    }

    const permissionId =
      normalizeId(permission.id);

    const actions =
      permissionActions[
        permissionId
      ] || {
        view: false,
        create: false,
        edit: false,
        delete: false,
        approve: false,
        export: false,
      };

    return (
      <input
        type="checkbox"
        className="permission-checkbox"
        checked={Boolean(
          actions[action],
        )}
        onChange={() =>
          togglePermission(
            permission,
            action,
          )
        }
      />
    );
  };

  /* ========================================================================
     Loading
  ======================================================================== */

  if (loading) {
    return (
      <div className="permissions-page">
        <div className="permissions-loading">
          <div className="permissions-spinner" />

          <h3>
            Loading Permissions
          </h3>

          <p>
            Loading roles, employees and
            permissions...
          </p>
        </div>
      </div>
    );
  }

  /* ========================================================================
     Main UI
  ======================================================================== */

  return (
    <div className="permissions-page">

      {/* ================================================================
          PAGE HEADER
      ================================================================ */}

      <div className="permissions-header">

        <div className="permissions-title-section">

          <div className="permissions-title-icon">
            <ShieldIcon />
          </div>

          <div>

            <h1>
              Permissions
            </h1>

            <p>
              Manage role-based access to
              pages and actions.
            </p>

            <div className="permissions-breadcrumb">

              <span>
                Dashboard
              </span>

              <span>
                ›
              </span>

              <span>
                Access Control
              </span>

              <span>
                ›
              </span>

              <strong>
                Permissions
              </strong>

            </div>

          </div>

        </div>

        <div className="permissions-header-actions">

          <button
            type="button"
            className="permission-refresh-button"
            onClick={refreshPage}
            disabled={loading}
            title="Refresh"
          >
            <RefreshIcon />
          </button>

          <button
            type="button"
            className="permission-save-top"
            onClick={savePermissions}
            disabled={
              !selectedRole ||
              saving
            }
          >
            <span>
              ▣
            </span>

            {saving
              ? "Saving..."
              : "Save Permissions"}
          </button>

        </div>

      </div>

      {/* ================================================================
          ERROR / SUCCESS
      ================================================================ */}

      {error && (
        <div className="permission-alert permission-alert-error">
          <strong>
            Error:
          </strong>{" "}
          {error}
        </div>
      )}

      {successMessage && (
        <div className="permission-alert permission-alert-success">
          {successMessage}
        </div>
      )}

      {/* ================================================================
          STAT CARDS
      ================================================================ */}

      <div className="permission-stat-grid">

        <div className="permission-stat-card">

          <div className="permission-stat-icon blue">
            <ShieldIcon />
          </div>

          <div className="permission-stat-content">

            <span>
              Total Roles
            </span>

            <strong>
              {totalRoles}
            </strong>

            <small>
              Active roles in system
            </small>

          </div>

        </div>

        <div className="permission-stat-card">

          <div className="permission-stat-icon green">
            <UsersIcon />
          </div>

          <div className="permission-stat-content">

            <span>
              Total Users
            </span>

            <strong>
              {totalUsers}
            </strong>

            <small>
              Users with assigned roles
            </small>

          </div>

        </div>

        <div className="permission-stat-card">

          <div className="permission-stat-icon purple">
            <LockIcon />
          </div>

          <div className="permission-stat-content">

            <span>
              Total Permissions
            </span>

            <strong>
              {totalPermissions}
            </strong>

            <small>
              System permissions
            </small>

          </div>

        </div>

      </div>

      {/* ================================================================
          TABS
      ================================================================ */}

      <div className="permission-tabs">

        <button
          type="button"
          className={
            activeTab === "roles"
              ? "permission-tab active"
              : "permission-tab"
          }
          onClick={() =>
            setActiveTab("roles")
          }
        >
          <ShieldIcon />

          Role Permissions
        </button>

        <button
          type="button"
          className={
            activeTab === "users"
              ? "permission-tab active"
              : "permission-tab"
          }
          onClick={() =>
            setActiveTab("users")
          }
        >
          <UsersIcon />

          User Permissions
        </button>

      </div>

      {/* ================================================================
          USER PERMISSIONS TAB
      ================================================================ */}

      {activeTab === "users" && (
        <div className="permission-user-layout">

          <aside className="permission-user-panel">
            <div className="permission-user-panel-header">
              <div>
                <h2>Users</h2>
                <p>{employees.length} employees</p>
              </div>
              <span className="permission-user-count">
                {filteredUsers.length}
              </span>
            </div>

            <div className="permission-user-search">
              <SearchIcon />
              <input
                type="text"
                placeholder="Search users..."
                value={userSearch}
                onChange={(event) => setUserSearch(event.target.value)}
              />
            </div>

            <div className="permission-user-list">
              {filteredUsers.length === 0 ? (
                <div className="permission-user-no-data">
                  No employees found.
                </div>
              ) : (
                filteredUsers.map((employee) => {
                  const role = getRoleForEmployee(employee);
                  const employeeId = getEmployeeId(employee);
                  const isSelected =
                    selectedUser &&
                    isSameId(getEmployeeId(selectedUser), employeeId);

                  return (
                    <button
                      key={employeeId ?? getEmployeeAzureId(employee)}
                      type="button"
                      className={
                        isSelected
                          ? "permission-user-item selected"
                          : "permission-user-item"
                      }
                      onClick={() => selectUser(employee)}
                    >
                      <div className="permission-user-avatar">
                        {getEmployeeName(employee).charAt(0).toUpperCase()}
                      </div>

                      <div className="permission-user-info">
                        <strong>{getEmployeeName(employee)}</strong>
                        <span>
                          Azure ID: {getEmployeeAzureId(employee)}
                        </span>
                        <small>{getRoleName(role)}</small>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          <section className="permission-user-content">
            {!selectedUser ? (
              <div className="permission-user-empty">
                <div className="permission-user-empty-icon">
                  <UsersIcon />
                </div>
                <h3>Select an employee</h3>
                <p>
                  Select an employee from the list to view the permissions
                  inherited from their role.
                </p>
              </div>
            ) : (
              <>
                <div className="permission-user-detail-header">
                  <div className="permission-user-detail-main">
                    <div className="permission-user-detail-avatar">
                      {getEmployeeName(selectedUser).charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <h2>{getEmployeeName(selectedUser)}</h2>

                      <div className="permission-user-meta">
                        <span>
                          Azure Employee ID:{" "}
                          <strong>{getEmployeeAzureId(selectedUser)}</strong>
                        </span>
                        <span>
                          Employee Code:{" "}
                          <strong>{getEmployeeCode(selectedUser)}</strong>
                        </span>
                        <span>
                          Email:{" "}
                          <strong>{getEmployeeEmail(selectedUser)}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="permission-user-role-card">
                    <UserRoleIcon />
                    <div>
                      <span>Role</span>
                      <strong>
                        {getRoleName(getRoleForEmployee(selectedUser))}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="permission-user-summary">
                  <div>
                    <strong>{userPermissionCount}</strong>
                    <span>Granted actions</span>
                  </div>
                  <div>
                    <strong>
                      {
                        userPermissionRows.filter(
                          (permission) => permission.view,
                        ).length
                      }
                    </strong>
                    <span>Viewable pages</span>
                  </div>
                  <div>
                    <strong>{userPermissionModules.length}</strong>
                    <span>Modules</span>
                  </div>
                </div>

                {loadingUserPermissions ? (
                  <div className="permission-user-loading">
                    Loading permissions...
                  </div>
                ) : (
                  <div className="permission-user-table-wrapper">
                    <table className="permission-user-table">
                      <thead>
                        <tr>
                          <th>PAGE</th>
                          <th>VIEW</th>
                          <th>CREATE</th>
                          <th>EDIT</th>
                          <th>DELETE</th>
                          <th>APPROVE</th>
                          <th>EXPORT</th>
                        </tr>
                      </thead>

                      <tbody>
                        {userPermissionModules.map((module) => (
                          <React.Fragment key={module.moduleName}>
                            <tr className="permission-user-module-row">
                              <td colSpan="7">
                                <strong>{module.moduleName}</strong>
                                <span>{module.pages.length} pages</span>
                              </td>
                            </tr>

                            {module.pages.map((permission) => (
                              <tr
                                key={normalizeId(permission.id)}
                                className="permission-user-page-row"
                              >
                                <td>
                                  <div>
                                    <strong>{permission.page}</strong>
                                    {permission.path && (
                                      <span>{permission.path}</span>
                                    )}
                                  </div>
                                </td>

                                {ACTIONS.map((action) => (
                                  <td key={action}>
                                    
{permission[action] ? (
  <span className="permission-user-check">
    ✓
  </span>
) : (
  <span className="permission-user-cross">
    ✕
  </span>
)}

                                  </td>
                                ))}

                              </tr>
                            ))}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="permission-user-readonly-note">
                  <LockIcon />
                  <span>
                    Permissions are inherited from the employee's role and
                    are read-only here. To change access, update the role in{" "}
                    <strong>Role Permissions</strong>.
                  </span>
                </div>
              </>
            )}
          </section>

        </div>
      )}

      {/* ================================================================
          ROLE PERMISSIONS TAB
      ================================================================ */}

      {activeTab === "roles" && (
        <div className="permission-management-layout">

          {/* ============================================================
              LEFT ROLE PANEL
          ============================================================ */}

          <aside className="permission-role-panel">

            <div className="permission-role-panel-header">

              <h2>
                Roles
              </h2>

            </div>

            <div className="permission-role-search">

              <SearchIcon />

              <input
                type="text"
                placeholder="Search roles..."
                value={roleSearch}
                onChange={(event) =>
                  setRoleSearch(
                    event.target.value,
                  )
                }
              />

            </div>

            <div className="permission-role-list">

              {filteredRoles.length === 0 && (
                <div className="permission-no-data">
                  No roles found.
                </div>
              )}

              {filteredRoles.map(
                (role, index) => {

                  const roleId =
                    getId(role);

                  const selected =
                    selectedRole &&
                    isSameId(
                      getId(
                        selectedRole,
                      ),
                      roleId,
                    );

                  return (
                    <button
                      type="button"
                      key={
                        roleId ??
                        `role-${index}`
                      }
                      className={
                        selected
                          ? "permission-role-item selected"
                          : "permission-role-item"
                      }
                      onClick={() =>
                        handleRoleSelect(
                          role,
                        )
                      }
                    >

                      <div className="permission-role-avatar">
                        <UserRoleIcon />
                      </div>

                      <div className="permission-role-info">

                        <strong>
                          {getRoleName(
                            role,
                          )}
                        </strong>

                        <span>

                          {firstValue(
                            role,
                            [
                              "userCount",
                              "UserCount",
                              "usersCount",
                              "UsersCount",
                              "employeeCount",
                              "EmployeeCount",
                            ],
                            "",
                          )
                            ? `${firstValue(
                                role,
                                [
                                  "userCount",
                                  "UserCount",
                                  "usersCount",
                                  "UsersCount",
                                  "employeeCount",
                                  "EmployeeCount",
                                ],
                                0,
                              )} Users`
                            : "Role"}

                        </span>

                      </div>

                    </button>
                  );
                },
              )}

            </div>

          </aside>

          {/* ============================================================
              RIGHT PERMISSION PANEL
          ============================================================ */}

          <section className="permission-content-panel">

            <div className="permission-content-header">

              <div>

                <h2>

                  Permissions for{" "}

                  <span>
                    {selectedRole
                      ? getRoleName(
                          selectedRole,
                        )
                      : "Select a Role"}
                  </span>

                </h2>

                <p>
                  Manage what this role can
                  access and modify.
                </p>

              </div>

              <label className="permission-select-all">

                <span>
                  Select All
                </span>

                <input
                  type="checkbox"
                  className="permission-checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  disabled={
                    !selectedRole ||
                    allPermissionIds.length ===
                      0
                  }
                />

              </label>

            </div>

            <div className="permission-page-search">

              <SearchIcon />

              <input
                type="text"
                placeholder="Search pages..."
                value={pageSearch}
                onChange={(event) =>
                  setPageSearch(
                    event.target.value,
                  )
                }
              />

            </div>

            {loadingRolePermissions && (
              <div className="permission-loading-role">
                Loading role permissions...
              </div>
            )}

            {/* ========================================================
                PERMISSION TABLE
            ======================================================== */}

            <div className="permission-table-wrapper">

              <table className="permission-table">

                <thead>

                  <tr>

                    <th className="permission-page-column">
                      PAGE
                    </th>

                    <th>
                      LOGIN
                    </th>

                    <th>
                      VIEW
                    </th>

                    <th>
                      CREATE
                    </th>

                    <th>
                      EDIT
                    </th>

                    <th>
                      DELETE
                    </th>

                    <th>
                      APPROVE
                    </th>

                    <th>
                      EXPORT
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredModules.length === 0 && (
                    <tr>

                      <td
                        colSpan="8"
                        className="permission-no-pages"
                      >
                        No permissions/pages
                        found.
                      </td>

                    </tr>
                  )}

                  {filteredModules.map(
                    (module) => {

                      const moduleOpen =
                        expandedModules.has(
                          module.moduleName,
                        );

                      const modulePermissionIds =
                        module.pages
                          .map(
                            (page) =>
                              page.id,
                          )
                          .filter(
                            (id) =>
                              id !== null &&
                              id !== undefined,
                          )
                          .map(
                            normalizeId,
                          );

                      const moduleSelected =
                        modulePermissionIds.length >
                          0 &&
                        modulePermissionIds.every(
                          (id) =>
                            selectedPermissions.has(
                              id,
                            ),
                        );

                      return (
                        <React.Fragment
                          key={
                            module.moduleName
                          }
                        >

                          {/* MODULE */}

                          <tr className="permission-module-row">

                            <td>

                              <div className="permission-module-name">

                                <button
                                  type="button"
                                  className="permission-module-toggle"
                                  onClick={() =>
                                    toggleModuleExpanded(
                                      module.moduleName,
                                    )
                                  }
                                >
                                  <ChevronIcon
                                    open={
                                      moduleOpen
                                    }
                                  />
                                </button>

                                <ShieldIcon />

                                <strong>
                                  {
                                    module.moduleName
                                  }
                                </strong>

                                <span className="permission-count-badge">
                                  {
                                    module.pages
                                      .length
                                  }
                                </span>

                              </div>

                            </td>

                            <td
                              colSpan="7"
                              className="permission-module-action"
                            >

                              <label>

                                <span>
                                  Select all
                                  permissions
                                  for this
                                  module.
                                </span>

                                <input
                                  type="checkbox"
                                  className="permission-checkbox"
                                  checked={
                                    moduleSelected
                                  }
                                  onChange={() =>
                                    toggleModule(
                                      module,
                                    )
                                  }
                                />

                              </label>

                            </td>

                          </tr>

                          {/* PAGES */}

                          {moduleOpen &&
                            module.pages.map(
                              (
                                permission,
                                index,
                              ) => (
                                <tr
                                  className="permission-page-row"
                                  key={`${normalizeId(
                                    permission.id,
                                  )}-${index}`}
                                >

                                  <td>

                                    <div className="permission-page-name">

                                      <strong>
                                        {
                                          permission.page
                                        }
                                      </strong>

                                      {permission.path && (
                                        <span>
                                          {
                                            permission.path
                                          }
                                        </span>
                                      )}

                                    </div>

                                  </td>

                                  <td>
                                    <input
                                      type="radio"
                                      name={`loginPage-${module.moduleName}`}
                                      className="permission-checkbox"
                                      checked={isSameId(
                                        loginPages[
                                          module.moduleName
                                        ],
                                        normalizeId(
                                          permission.id,
                                        ),
                                      )}
                                      onChange={() =>
                                        selectLoginPage(
                                          permission,
                                        )
                                      }
                                      disabled={
                                        !toBoolean(
                                          permissionActions[
                                            normalizeId(
                                              permission.id,
                                            )
                                          ]?.view,
                                        )
                                      }
                                      title={
                                        toBoolean(
                                          permissionActions[
                                            normalizeId(
                                              permission.id,
                                            )
                                          ]?.view,
                                        )
                                          ? "Set as login page"
                                          : "View permission is required"
                                      }
                                    />
                                  </td>

                                  <td>
                                    {renderPermissionCheckbox(
                                      permission,
                                      "view",
                                    )}
                                  </td>

                                  <td>
                                    {renderPermissionCheckbox(
                                      permission,
                                      "create",
                                    )}
                                  </td>

                                  <td>
                                    {renderPermissionCheckbox(
                                      permission,
                                      "edit",
                                    )}
                                  </td>

                                  <td>
                                    {renderPermissionCheckbox(
                                      permission,
                                      "delete",
                                    )}
                                  </td>

                                  <td>
                                    {renderPermissionCheckbox(
                                      permission,
                                      "approve",
                                    )}
                                  </td>

                                  <td>
                                    {renderPermissionCheckbox(
                                      permission,
                                      "export",
                                    )}
                                  </td>

                                </tr>
                              ),
                            )}

                        </React.Fragment>
                      );
                    },
                  )}

                </tbody>

              </table>

            </div>

            {/* ========================================================
                FOOTER
            ======================================================== */}

            <div className="permission-footer">

              <div className="permission-footer-summary">

                <strong>
                  {
                    selectedPermissions.size
                  }
                </strong>

                <span>
                  permissions selected
                </span>

                <i />

                <strong>
                  {modules.length}
                </strong>

                <span>
                  Modules
                </span>

                <i />

                <strong>
                  {permissionRows.length}
                </strong>

                <span>
                  Pages
                </span>

              </div>

              <div className="permission-footer-actions">

                <button
                  type="button"
                  className="permission-cancel-button"
                  onClick={
                    cancelChanges
                  }
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="permission-save-button"
                  onClick={
                    savePermissions
                  }
                  disabled={
                    !selectedRole ||
                    saving
                  }
                >

                  <span>
                    ▣
                  </span>

                  {saving
                    ? "Saving..."
                    : "Save Changes"}

                </button>

              </div>

            </div>

          </section>

        </div>
      )}

    </div>
  );
}