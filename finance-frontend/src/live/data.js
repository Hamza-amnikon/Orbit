import { useEffect, useState } from "react";
export const money = (value, currency = "INR") => new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(value ?? 0);
export const today = () => { const date = new Date(); return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`; };
export function useLoad(loader, dependencies) {
  const [state, setState] = useState({ data: null, loading: true, error: "" });
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setState({ data: null, loading: true, error: "" });
    Promise.resolve().then(() => loader(controller.signal)).then(data => { if (!controller.signal.aborted) setState({ data, loading: false, error: "" }); })
      .catch(error => { if (!controller.signal.aborted) setState({ data: null, loading: false, error: error.message === "Failed to fetch" ? "Cannot reach the finance server. Check that the backend is running." : error.message }); });
    return () => controller.abort();
    // The caller supplies primitive keys for the requested resource and filters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies, revision]);
  return { ...state, refresh: () => setRevision(value => value + 1) };
}
