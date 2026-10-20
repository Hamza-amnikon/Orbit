import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const invoiceProxy = {
    target: "https://localhost:7173",
    changeOrigin: true,
    secure: false,
};

export default defineConfig({
    plugins: [react()],

    server: {
        proxy: {
            "/api/expenses": {
                target: "https://localhost:7128",
                changeOrigin: true,
                secure: false,
            },
            "/api/clients": {
                target: "http://localhost:5080",
                changeOrigin: true,
            },

            "/api/vendors": {
                target: "https://localhost:7179",
                changeOrigin: true,
                secure: false,
            },

            "/api/bills": {
                target: "https://localhost:7193",
                changeOrigin: true,
                secure: false,
            },

            "/api/purchase-orders": {
                target: "https://localhost:7191",
                changeOrigin: true,
                secure: false,
            },

            "/api/payments-made": {
                target: "https://localhost:7230",
                changeOrigin: true,
                secure: false,
            },

            "/api/vendor-credits": {
                target: "https://localhost:7209",
                changeOrigin: true,
                secure: false,
            },

            "/api/currencies": {
                ...invoiceProxy,
            },

            "/api/payment-modes": {
                ...invoiceProxy,
            },

            "/api/branches": {
                ...invoiceProxy,
            },

            "/api/sales-invoices": {
                ...invoiceProxy,
            },

            "/api/sales-credit-notes": {
                ...invoiceProxy,
            },

            "/api/sales-estimates": {
                target: "https://localhost:7280",
                changeOrigin: true,
                secure: false,
            },
        },
    },
});
