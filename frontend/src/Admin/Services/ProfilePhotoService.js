import { useEffect, useState } from "react";

let cachedEndpoint = "";
let cachedToken = "";
let cachedObjectUrl = "";
let pendingToken = "";
let pendingPhotoRequest = null;

function canonicalEndpoint(photoUrl) {
    if (!photoUrl) return "";
    const url = new URL(photoUrl, window.location.origin);
    url.search = "";
    url.hash = "";
    return url.toString();
}

export async function loadAuthenticatedProfilePhoto(photoUrl, { refresh = false, signal } = {}) {
    const endpoint = canonicalEndpoint(photoUrl);
    if (!endpoint) return null;

    const token = localStorage.getItem("token");
    if (!token) throw new Error("Your Spark session has expired. Sign in again.");
    if (!refresh && endpoint === cachedEndpoint && token === cachedToken) return cachedObjectUrl || null;
    if (!refresh && pendingPhotoRequest && token === pendingToken) return pendingPhotoRequest;

    pendingToken = token;
    pendingPhotoRequest = fetch(endpoint, {
        cache: "no-store",
        headers: { Authorization: `Bearer ${token}` },
        signal,
    }).then(async (response) => {
        if (response.status === 404) {
            if (cachedObjectUrl) URL.revokeObjectURL(cachedObjectUrl);
            cachedEndpoint = endpoint;
            cachedToken = token;
            cachedObjectUrl = "";
            return null;
        }
        if (!response.ok) throw new Error(`Profile photo API returned ${response.status}.`);

        const objectUrl = URL.createObjectURL(await response.blob());
        if (cachedObjectUrl && cachedObjectUrl !== objectUrl) URL.revokeObjectURL(cachedObjectUrl);
        cachedEndpoint = endpoint;
        cachedToken = token;
        cachedObjectUrl = objectUrl;
        return objectUrl;
    }).finally(() => {
        pendingPhotoRequest = null;
        pendingToken = "";
    });

    return pendingPhotoRequest;
}

export function useAuthenticatedProfilePhoto(photoUrl) {
    const [imageUrl, setImageUrl] = useState("");

    useEffect(() => {
        let active = true;
        const load = (refresh = false) => {
            if (!photoUrl) {
                setImageUrl("");
                return;
            }
            loadAuthenticatedProfilePhoto(photoUrl, { refresh })
                .then((url) => { if (active) setImageUrl(url || ""); })
                .catch(() => { if (active) setImageUrl(""); });
        };

        load();
        const onPhotoUpdated = () => load(true);
        window.addEventListener("spark:profile-photo-updated", onPhotoUpdated);
        return () => {
            active = false;
            window.removeEventListener("spark:profile-photo-updated", onPhotoUpdated);
        };
    }, [photoUrl]);

    return imageUrl;
}
