import lightLogo from "../assets/merit/merit-light.png";
import darkLogo from "../assets/merit/merit-dark-stacked.png";

export const loginConfig = {
    branding: {
        name: "MERIT",
        lightLogo,
        darkLogo,
        logoAlt: "MERIT Finance Management",
        fullForm: [
            {
                initial: "M",
                remainder: "anagement",
                separator: " of "
            },
            {
                initial: "E",
                remainder: "xpenses",
                separator: ", "
            },
            {
                initial: "R",
                remainder: "evenue",
                separator: ", "
            },
            {
                initial: "I",
                remainder: "nvoices",
                separator: " & "
            },
            {
                initial: "T",
                remainder: "ransactions",
                separator: "."
            }
        ]
    },

    page: {
        title: "Sign in | MERIT",
        heading: "Sign in to MERIT",
        description: "Use your company Microsoft account to continue.",
        footer: "Your finance workspace"
    },

    signIn: {
        buttonLabel: "Continue with Microsoft",
        setupMessage:
            "Microsoft sign-in is not connected yet. Your administrator needs to complete the SSO setup."
    },

    access: {
        description: "Access is available to approved users.",
        help: "Need access? Contact your administrator."
    },

    theme: {
        switchToLight: "Switch to light mode",
        switchToDark: "Switch to dark mode"
    }
};