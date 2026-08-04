export const validateEmail = (email) => {

    if (!email.trim())
        return "Email is required.";

    const regex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!regex.test(email))
        return "Please enter a valid email address.";

    return "";

};

export const validatePassword = (password) => {

    if (!password)
        return "Password is required.";

    if (password.length < 8)
        return "Password must be at least 8 characters.";

    if (password.length > 50)
        return "Password cannot exceed 50 characters.";

    return "";

};