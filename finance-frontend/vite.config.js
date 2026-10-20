import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const invoiceProxy = {
    target: "https://localhost:7173",
    changeOrigin: true,
    secure: false,
};

export default defineConfig({
    plugins: [react()],
<<<<<<< HEAD
    server: {
        proxy: {
=======

    server: {
        proxy: {
            "/api/expenses": {
                target: "https://localhost:7128",
                changeOrigin: true,
                secure: false,
            },
>>>>>>> aa1e4a9f74574849eb8f784b0674a71d22345bdc
            "/api/clients": {
                target: "http://localhost:5080",
                changeOrigin: true,
            },
<<<<<<< HEAD
=======

>>>>>>> aa1e4a9f74574849eb8f784b0674a71d22345bdc
            "/api/vendors": {
                target: "https://localhost:7179",
                changeOrigin: true,
                secure: false,
            },
<<<<<<< HEAD
=======

>>>>>>> aa1e4a9f74574849eb8f784b0674a71d22345bdc
            "/api/bills": {
                target: "https://localhost:7193",
                changeOrigin: true,
                secure: false,
            },
<<<<<<< HEAD
=======

>>>>>>> aa1e4a9f74574849eb8f784b0674a71d22345bdc
            "/api/purchase-orders": {
                target: "https://localhost:7191",
                changeOrigin: true,
                secure: false,
            },
<<<<<<< HEAD
            "/api/currencies": { ...invoiceProxy },
            "/api/payment-modes": { ...invoiceProxy },
            "/api/branches": { ...invoiceProxy },
            "/api/sales-invoices": { ...invoiceProxy },
            "/api/sales-credit-notes": { ...invoiceProxy },
=======

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

>>>>>>> aa1e4a9f74574849eb8f784b0674a71d22345bdc
            "/api/sales-estimates": {
                target: "https://localhost:7280",
                changeOrigin: true,
                secure: false,
            },
        },
    },
<<<<<<< HEAD
});
=======
});
>>>>>>> aa1e4a9f74574849eb8f784b0674a71d22345bdc
