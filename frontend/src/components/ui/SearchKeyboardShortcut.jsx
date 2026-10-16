import { useEffect } from "react";

/** Lets users focus the current page's search field with Ctrl+K. */
export default function SearchKeyboardShortcut() {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== "k") return;

      const searchFields = Array.from(
        document.querySelectorAll('input[placeholder*="Search" i]:not([disabled])'),
      );
      const target = searchFields.find((field) => field.getClientRects().length > 0);
      if (!target) return;

      event.preventDefault();
      target.focus();
      target.select?.();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return null;
}
