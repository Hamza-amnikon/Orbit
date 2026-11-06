# Finance frontend deployment

The repository-root workflow `.github/workflows/finance-frontend-cicd.yml` builds this app and deploys it to the IIS default website on `SWVMNVMNPDDEP01` after every push to `mahinoor`.

The site root is `C:\inetpub\wwwroot`, served at `http://SWVMNVMNPDDEP01/` (subject to the host's DNS and network access). The workflow copies the built static files while preserving the server's `web.config`, which contains the IIS API proxy and React Router fallback rules.

## One-time GitHub Actions runner setup

The deployment job uses a self-hosted Windows runner on the target host with the custom label `finance-frontend-deploy`. It checks that it is running on `SWVMNVMNPDDEP01` before building or copying files.

1. In the repository, open **Settings → Actions → Runners → New self-hosted runner**, choose **Windows x64**, and follow GitHub's current download instructions on `SWVMNVMNPDDEP01`.
2. Configure the runner for `https://github.com/Hamza-amnikon/Orbit` with the label `finance-frontend-deploy`. Keep GitHub's default `self-hosted`, `Windows`, and `X64` labels.
3. Install and start the runner as a Windows service. The service account needs Modify access to its runner directory and `C:\inetpub\wwwroot`. Keep these permissions scoped to those folders.

The runner registration token is short-lived. Generate it in GitHub Settings and enter it directly on the target host; do not commit it or store it in this file.

This repository is public. A self-hosted runner can execute repository workflow code on the server, so restrict who may push to `mahinoor` and review workflow changes before they reach that branch.

