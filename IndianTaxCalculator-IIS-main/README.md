# Indian Tax Calculator — portable source / IIS edition

This source includes the Spark-inspired calculator, administrator monitor, private same-origin API, exact final annual tax (no final rounding), historical rules and detailed PDF generator. The live hosted Site has not been changed by this export.

## Quick start

Install Node.js 24 LTS with npm. From this folder:

```powershell
npm install
Copy-Item .env.example .env
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Paste the generated secret into ADMIN_TOKEN in .env. Set PUBLIC_ORIGIN=http://127.0.0.1:3000 for local testing. Then:

```powershell
npm run build
npm test
npm start
```

Open http://127.0.0.1:3000. Administrator view: /admin, using ADMIN_TOKEN. A compiled dist folder is included for immediate startup; rebuild after frontend changes. Node runs the API and PDF generation. This application requires a server runtime and cannot be hosted as static HTML alone.

## IIS deployment

1. Copy this application to a local server directory such as C:\Apps\IndianTaxCalculator. Keep source, .env and SQLite data outside the IIS website's physical root; prefer local NTFS over OneDrive or a network share for live SQLite files.
2. Install Node.js 24 LTS, IIS URL Rewrite 2 and Application Request Routing (ARR). Enable ARR **Server Proxy Settings > Enable proxy**. This follows Microsoft's reverse-proxy architecture: https://learn.microsoft.com/en-us/iis/extensions/url-rewrite-module/reverse-proxy-with-url-rewrite-v2-and-application-request-routing
3. Run npm install and npm run build in the application directory. Create .env and set PUBLIC_ORIGIN to your exact external HTTPS origin, e.g. https://tax.company.com (no trailing path). HOST=127.0.0.1 and PORT=3000 must match iis/web.config. Generate a unique ADMIN_TOKEN. Leave monitoring/email fields empty until configured.
4. Create an IIS site with physical path set to this package's **iis** subdirectory, not the source root. Bind your hostname and HTTPS certificate. The provided web.config redirects HTTP to HTTPS and proxies all requests to 127.0.0.1:3000. Enable Anonymous Authentication for the basic setup; admin access is separately protected by the token. If calculator access must be internal-only, configure IIS Windows Authentication, network access restrictions or your identity gateway and test it before exposure.
5. Run the Node process as a continuously running Windows service under a dedicated non-admin account, using your organization's service manager (for example WinSW). Executable: full path to node.exe; arguments: --env-file=.env server.mjs; working directory: application root. Set automatic startup and restart on failure. Grant read access to application files and write access only to the SQLite data directory. Start the service before opening the site. IIS does not launch Node automatically.
6. Visit the HTTPS root, calculate a salary, download its PDF and open /admin with your key. Verify unauthenticated /api/admin returns 401. Node listens only on loopback; do not expose port 3000 externally. Use a dedicated site hostname; subpath/virtual-directory deployment is not configured.

This export was built and tested with Node 24.19.0 on Windows. IIS/ARR installation, certificates and Windows service behavior must be validated on your deployment server; no IIS server configuration was changed during export.

## Other web servers

Use the same Node application behind nginx, Apache, Caddy or another reverse proxy. Forward requests to 127.0.0.1:3000, serve HTTPS, and set PUBLIC_ORIGIN accordingly. No ChatGPT sign-in, Cloudflare Workers, D1 or Sites credentials are needed. React frontend is built with Vite; the backend uses Node HTTP, built-in SQLite and the original tax engine.

## Files and operations

- src/: calculator/admin interface and dashboard styles.
- lib/tax.ts: historical tax engine, deductions, rebates, marginal relief, surcharge, cess and official legal references.
- lib/report.ts: downloadable multipage PDF, with no final rounding adjustment.
- lib/storage.ts: automatic SQLite schema initialization; no salary calculations are stored.
- lib/activation.ts: server-only enacted-rule interpretation integration contract; no rule-editing endpoint.
- server.mjs: API and compiled frontend host.
- iis/web.config: IIS reverse proxy configuration.
- scripts/tax.test.mjs: historical/boundary and arbitrary-precision regression tests.

Taxable-income rounding remains applied. Final annual tax and post-tax annual income preserve fractional rupees. Monthly estimates are displayed to two decimals. Seed law review remains dated 2026-10-01; this source export does not reverify legislation.

Monthly monitoring requires a Windows Task Scheduler/cron job that POSTs to /api/monitor/check with Authorization: Bearer MONITOR_TOKEN. Source fingerprint changes retain last verified rules and produce interpretation alerts. Set MAIL_API_KEY (Resend), MAIL_FROM and ADMIN_EMAIL to deliver alerts; no email credentials are supplied. A validated official-document interpretation adapter is still required to confidently activate new enacted rules; fingerprint checking alone never modifies rules. Proposed rules never activate. Future financial years remain disallowed.

Back up SQLite using an SQLite-aware online backup or stop the service and copy the database together with any -wal/-shm files. Preserve it across upgrades. Secrets belong in .env or protected service environment variables; do not commit, serve or share .env. The calculator API is same-origin and not offered as a public third-party API; same-origin enforcement is not user authentication. Protect the site at IIS if visitor access must be private.
