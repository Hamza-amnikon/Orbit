import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout/DashboardLayout";
import { FinanceAuth } from "../live/Auth";

import Dashboard from "../live/Dashboard";
import Vendors from "../admin/purchases management/vendors/Vendors";
import VendorDetails from "../admin/purchases management/vendors/VendorDetails";
<<<<<<< HEAD
=======
import VendorCredits from "../admin/purchases management/vendor credits/VendorCredits";
>>>>>>> aa1e4a9f74574849eb8f784b0674a71d22345bdc
import Bills from "../admin/purchases management/bills/Bills";
import BillDetails from "../admin/purchases management/bills/BillDetails";
import PurchaseOrders from "../admin/purchases management/purchase orders/PurchaseOrders";
import PurchaseOrderDetails from "../admin/purchases management/purchase orders/PurchaseOrderDetails";
import Documents from "../live/Documents";
<<<<<<< HEAD
import Payments from "../live/Payments";
=======
import PaymentsMade from "../admin/purchases management/Payments Made/PaymentsMade";
import PaymentMadeDetails from "../admin/purchases management/Payments Made/PaymentMadeDetails";
>>>>>>> aa1e4a9f74574849eb8f784b0674a71d22345bdc

import Clients from "../admin/sales management/clients/Clients";
import ClientDetails from "../admin/sales management/clients/ClientDetails";
import Invoices from "../admin/sales management/invoices/Invoices";
import Estimates from "../admin/sales management/estimates/Estimates";
import CreditNotes from "../admin/sales management/credit notes/CreditNotes";
import PaymentReceived from "../admin/sales management/payments received/PaymentReceived";

import { adminModuleRoutes } from "../admin/moduleRoutes";

const documentRoutes = [
    ["/sales/orders", "SalesOrder"],
<<<<<<< HEAD
    ["/purchases/vendor-credits", "VendorCredit"],
=======
>>>>>>> aa1e4a9f74574849eb8f784b0674a71d22345bdc
];

function AppRoutes() {
    return (
        <BrowserRouter>
            <FinanceAuth>
                <Routes>
                    <Route element={<DashboardLayout />}>
                        <Route path="/" element={<Dashboard />} />

                        <Route
                            path="/sales/estimates"
                            element={<Estimates />}
                        />

                        <Route
                            path="/sales/credit-notes"
                            element={<CreditNotes />}
                        />

                        <Route
                            path="/sales/clients"
                            element={<Clients />}
                        />

                        <Route
                            path="/sales/clients/:id"
                            element={<ClientDetails />}
                        />

                        <Route
                            path="/sales/customers"
                            element={
                                <Navigate to="/sales/clients" replace />
                            }
                        />

                        <Route
                            path="/sales/customers/:id"
                            element={<ClientDetails />}
                        />

                        <Route
                            path="/sales/invoices"
                            element={<Invoices />}
                        />

                        <Route
                            path="/purchases/vendors"
                            element={
                                <Vendors />
                            }
                        />

                        <Route path="/purchases/vendors/:id" element={<VendorDetails />} />

                        <Route path="/purchases/bills" element={<Bills />} />
                        <Route path="/purchases/bills/:id" element={<BillDetails />} />
                        <Route path="/purchases/orders" element={<PurchaseOrders />} />
                        <Route path="/purchases/orders/:id" element={<PurchaseOrderDetails />} />

<<<<<<< HEAD
=======
                        <Route
                            path="/purchases/vendor-credits"
                            element={<VendorCredits />}
                        />

>>>>>>> aa1e4a9f74574849eb8f784b0674a71d22345bdc
                        {documentRoutes.map(([path, kind]) => (
                            <Route
                                key={path}
                                path={path}
                                element={
                                    <Documents key={kind} kind={kind} />
                                }
                            />
                        ))}

                        <Route
                            path="/sales/payments"
                            element={<PaymentReceived />}
                        />

                        <Route
                            path="/purchases/payments"
<<<<<<< HEAD
                            element={
                                <Payments
                                    key="Made"
                                    direction="Made"
                                />
                            }
=======
                            element={<PaymentsMade />}
                        />

                        <Route
                            path="/purchases/payments/:id"
                            element={<PaymentMadeDetails />}
>>>>>>> aa1e4a9f74574849eb8f784b0674a71d22345bdc
                        />

                        {adminModuleRoutes
                            .filter(([, path]) => path !== "/sales/invoices")
                            .map(([, path, Component]) => (
                                <Route
                                    key={path}
                                    path={path}
                                    element={<Component />}
                                />
                            ))}

                        <Route
                            path="*"
                            element={<Navigate to="/" replace />}
                        />
                    </Route>
                </Routes>
            </FinanceAuth>
        </BrowserRouter>
    );
}

<<<<<<< HEAD
export default AppRoutes;
=======
export default AppRoutes;
>>>>>>> aa1e4a9f74574849eb8f784b0674a71d22345bdc
