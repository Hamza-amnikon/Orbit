import { useEffect, useState } from "react";
import { getProfile } from "./ProfileService";

export default function useProfile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const data = await getProfile();
                setProfile(data);
            } catch (err) {
                console.error(err);
                setError("Unable to load profile.");
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, []);

    return {
        profile,
        loading,
        error,
    };
}