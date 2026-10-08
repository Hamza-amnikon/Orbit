# Performance update note

Applied on 2026-10-07.

## What changed

- Route pages are lazy-loaded in `src/routes/AppRoutes.jsx`.
- Permission synchronization waits for an authenticated user.
- `PayslipTemplates` now follows React's hook rules.
- Onboarding polling runs every 30 seconds only while the tab is visible.
- PDF and Excel libraries are loaded only when an export action is clicked.
- `.env.example` documents the required API variables.

## Validation

- `npm run build` passes.
- `npm run lint` has zero errors.
- The initial JavaScript entry is approximately 265 KB; page and export chunks load on demand.

## Revert instruction

To undo this performance update, say: **revert the performance update from 2026-10-07**.

The affected files are:

- `src/routes/AppRoutes.jsx`
- `src/context/AuthContext.jsx`
- `src/Admin/PayrollManagement/PayslipTemplates/PayslipTemplates.jsx`
- `src/utils/exportLibraries.js`
- `src/Admin/Roles/Role.jsx`
- `src/Admin/Leave/LeaveTakenHistory/LeaveTakenHistory.jsx`
- `src/Admin/Leave/LeaveOverview/LeaveOverview.jsx`
- `src/Admin/Leave/LeaveReports/LeaveReports.jsx`
- `src/Admin/Approvals/Approval.jsx`
- `src/Admin/PayrollManagement/PayrollHistory/PayrollHistory.jsx`
- `.env.example`
