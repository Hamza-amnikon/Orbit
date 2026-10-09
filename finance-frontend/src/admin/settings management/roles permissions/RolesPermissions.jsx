import { Alert, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { Page } from "../../../live/shared";
import "./RolesPermissions.css";

const permissions = [["View finance records and reports", true, true, true], ["Create and update finance records", true, true, false], ["Issue documents and record payments", true, true, false], ["Manage users and view audit history", true, false, false], ["Edit organization and tax settings", true, false, false]];
export default function RolesPermissions() {
  return <Page title="Roles & Permissions" subtitle="Current application roles">
    <Alert severity="info" sx={{ mb: 2 }}>Roles are enforced by the backend. Custom roles and permission changes are not supported yet.</Alert>
    <Card><CardContent><TableContainer><Table><TableHead><TableRow>{["Permission", "Admin", "Finance", "Viewer"].map(label => <TableCell key={label}>{label}</TableCell>)}</TableRow></TableHead>
      <TableBody>{permissions.map(([label, ...values]) => <TableRow key={label}><TableCell>{label}</TableCell>{values.map((allowed, index) => <TableCell key={index}>{allowed ? "Allowed" : "—"}</TableCell>)}</TableRow>)}</TableBody>
    </Table></TableContainer></CardContent></Card>
  </Page>;
}
