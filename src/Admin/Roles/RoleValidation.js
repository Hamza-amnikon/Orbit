const RoleValidation = (role) => {
    const errors = {};

    if (!role.roleName.trim()) {
        errors.roleName = "Role Name is required";
    }

    return errors;
};

export default RoleValidation;