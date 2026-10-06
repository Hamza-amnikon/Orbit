import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import Dashboard from "./admin/dashboard management/Dashboard";
import Customers from "./admin/sales management/customers/Customers";
import CustomerDetails from "./admin/sales management/customers/CustomerDetails";
import Estimates from "./admin/sales management/estimates/Estimates";
import SalesOrders from "./admin/sales management/salesOrders/SalesOrders";
import Invoices from "./admin/sales management/invoices/Invoices";
import CreditNotes from "./admin/sales management/credit notes/CreditNotes";
import PaymentReceived from "./admin/sales management/payments received/PaymentReceived";
import Vendors from "./admin/purchases management/vendors/Vendors";
import PurchaseOrders from "./admin/purchases management/purchase orders/PurchaseOrders";
import Bills from "./admin/purchases management/bills/Bills";
import VendorCredits from "./admin/purchases management/vendor credits/VendorCredits";
import PaymentsMade from "./admin/purchases management/Payments Made/PaymentsMade";

function App() {
    return (
        <BrowserRouter>
            <Routes>

                <Route element={<MainLayout />}>

                    <Route
                        path="/"
                        element={<Dashboard />}
                    />

                    <Route
                        path="/sales/customers"
                        element={<Customers />}
                    />

                    <Route
    path="/sales/estimates"
    element={<Estimates />}
/>

                    <Route
    path="/sales/customers/:id"
    element={<CustomerDetails />}
/>
<Route path="/sales/orders" element={<SalesOrders />} />

<Route
    path="/sales/invoices"
    element={<Invoices />}
/>

<Route
    path="/sales/credit-notes"
    element={<CreditNotes />}
/>

<Route
    path="/sales/payments"
    element={<PaymentReceived />}
/>

<Route path="/purchases/vendors" element={<Vendors />} />


<Route
    path="/purchases/orders"
    element={<PurchaseOrders />}
/>

<Route path="/purchases/bills" element={<Bills />} />

<Route
    path="/purchases/vendor-credits"
    element={<VendorCredits />}
/>
<Route
    path="/purchases/payments"
    element={<PaymentsMade />}
/>

                </Route>

            </Routes>
        </BrowserRouter>
    );
}

export default App;