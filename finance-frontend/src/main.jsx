import React from "react";
import ReactDOM from "react-dom/client";
import FinanceThemeProvider from "./styles/FinanceThemeProvider";

import App from "./App";

import "./index.css";
import "./styles/finance-ui.css";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <FinanceThemeProvider>
            <App />
        </FinanceThemeProvider>
    </React.StrictMode>
);
