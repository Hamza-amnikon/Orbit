# Spark CI/CD for IIS

The workflow is `.github/workflows/spark-ci-cd.yml`.

## GitHub setup

1. Add a self-hosted GitHub Actions runner on `SWVMNVMPRDSPK01`.
2. Give it these labels: `self-hosted`, `windows`, `spark-iis`.
3. Create a GitHub environment named `production` and require an approval reviewer.
4. Add the environment variable `IIS_SITE_PATH` containing the absolute IIS site folder, for example `C:\inetpub\wwwroot\Spark`.
5. Add the `VITE_*` variables listed in `frontend/.env.example` to the `production` environment. These are build-time values; they must be present before the build job runs.
6. Ensure the runner service account has write permission to that folder.

## How it runs

- Every push to `main` installs dependencies, runs lint, builds the frontend, and stores a 14-day `dist` artifact.
- Deployment is intentionally manual: open Actions, select `Spark CI/CD`, choose `Run workflow`, and approve the `production` environment.
- The deploy copies the artifact into the configured IIS folder. It does not stop the app pool and does not delete unrelated files.

## IIS requirements

- Configure the IIS site to point at `IIS_SITE_PATH`.
- Add URL Rewrite and a rewrite rule for an SPA so unknown routes serve `index.html`.
- Configure the same `VITE_*` API values used by the production build. Vite embeds these values at build time, so configure them as GitHub Actions environment variables before the build.
