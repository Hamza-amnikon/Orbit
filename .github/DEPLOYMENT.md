# Spark frontend CI/CD setup

The workflow in `.github/workflows/spark-frontend.yml` runs `npm ci`, `npm run lint`, and `npm run build` for pull requests and pushes that change the frontend. A push to `main` builds an artifact on a GitHub-hosted Linux runner, then deploys it to the IIS folder on `SWVMNVMPRDSPK01`.

## Configure the IIS runner once

1. In the GitHub repository, open **Settings → Actions → Runners → New self-hosted runner** and select **Windows x64**.
2. Follow GitHub's displayed setup commands on `SWVMNVMPRDSPK01`. Add the custom runner label `spark-iis` when configuring it.
3. Install and run the runner as a Windows service under an account with **Modify** permission on `C:\inetpub\wwwroot\spark`.
4. Confirm the runner shows **Idle** in the repository's Actions runner settings.

The workflow does not need deployment credentials or secrets: the runner copies the artifact directly to the local IIS folder. Keep the runner service account limited to this deployment folder and only allow trusted contributors to merge changes into `main`.

## Workflow behavior

- Pull requests to `main`: lint and build only.
- Pushes to `main`: lint, build, then deploy to `C:\inetpub\wwwroot\spark`.
- Manual run: available from **Actions → Spark frontend CI/CD → Run workflow**; deployment runs only when the selected ref is `main`.

IIS's existing `web.config` is preserved because deployment copies the generated `frontend/dist` files over the site without deleting files from the destination.
