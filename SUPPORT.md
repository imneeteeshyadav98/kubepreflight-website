# Support

This project is maintained on a best-effort basis. Community support only — there is no
guaranteed response time or SLA.

## Where to ask

- **Website bugs** (broken links, layout issues, incorrect copy on kubepreflight.com): open an
  issue in [this repository](https://github.com/imneeteeshyadav98/kubepreflight-website/issues).
- **CLI or product bugs** (scan behavior, findings, the GitHub Action, rollback assessment):
  open an issue in the [core repository](https://github.com/imneeteeshyadav98/kubepreflight/issues)
  instead — this repo only contains the website.
- **Security reports**: do not use a public issue. See [SECURITY.md](SECURITY.md).

## Before opening an issue

- Search existing issues first.
- For a CLI bug report, include the exact command, the KubePreflight version
  (`kubepreflight --help` prints usage; check your binary/image tag), the target Kubernetes
  version, and a sanitized excerpt of the output — never paste a real kubeconfig, AWS
  credentials, or unredacted cluster identifiers.
- For a website bug, include the page URL and, if visual, a screenshot or the viewport width.

## What to expect

- Issues are triaged when a maintainer has time; this is not a funded support contract.
- Pull requests are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md).
