import {
    useEffect,
    useState
} from "react";

import { AuthContext } from "./AuthContext";

function DevelopmentFinanceAuth({ children })
{
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() =>
    {
        const controller = new AbortController();

        async function restoreSession()
        {
            try
            {
                const response = await fetch("/api/development-admin/session", {
                    signal: controller.signal
                });

                if (response.ok)
                {
                    const session = await response.json();

                    if (!controller.signal.aborted)
                    {
                        setUser(session);
                    }
                }
            }
            catch
            {
                // The login form can retry once the Role Service is available.
            }
            finally
            {
                if (!controller.signal.aborted)
                {
                    setLoading(false);
                }
            }
        }

        restoreSession();

        return () => controller.abort();
    }, []);

    async function signIn(username, password)
    {
        const response = await fetch("/api/development-admin/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                password
            })
        });

        const session = await response.json().catch(() => null);

        if (!response.ok || !session?.name)
        {
            throw new Error(session?.message || "Sign-in failed. Try again shortly.");
        }

        setUser(session);
    }

    async function signOut()
    {
        const response = await fetch("/api/development-admin/logout", {
            method: "POST"
        });

        if (!response.ok && response.status !== 401)
        {
            throw new Error("Sign-out failed. Try again.");
        }

        setUser(null);
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                canWrite: Boolean(user),
                loading,
                signIn,
                signOut
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function FinanceAuth({
    children
})
{
    if (import.meta.env.DEV)
    {
        return (
            <DevelopmentFinanceAuth>
                {children}
            </DevelopmentFinanceAuth>
        );
    }

    return <AuthContext.Provider value={{
        user: {
            name: "Finance",
            role: "Admin"
        },
        canWrite: true
    }}>
      {children}
    </AuthContext.Provider>;
}
