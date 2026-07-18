---
title: "Using KubePreflight Exit Codes in GitHub Actions, GitLab CI, Jenkins, and Shell"
series: "Kubernetes Upgrade Readiness"
part: 5
targetGuide: "https://kubepreflight.com/kubernetes-upgrade-ci-guide/"
docsLink: "https://kubepreflight.com/docs/"
ctaLink: "https://github.com/imneeteeshyadav98/kubepreflight"
githubLink: "https://github.com/imneeteeshyadav98/kubepreflight"
dockerImagePinnedTo: "ghcr.io/imneeteeshyadav98/kubepreflight:0.15.0-redaction"
status: "publish-ready"
---

## Short social version

Catching a removed API or a new upgrade blocker in a pull request is cheaper than catching it
during the maintenance window. There's a first-party GitHub Action for GitHub Actions -- for GitLab
CI, Jenkins, or anything else, it's five documented exit codes and an ordinary Docker pipeline
step. No plugin required.

## Long social version

A Kubernetes upgrade readiness check only pays off if it runs before the change lands, not after.
That means CI, and CI means a decision: absolute gate or comparison gate, blocking merges from day
one or rolling out gradually, and -- if you're not on GitHub Actions -- how to wire an exit code
into GitLab CI or Jenkins without a dedicated integration. This post covers all of it: the five-code
exit contract every example relies on, working snippets for a plain shell script, `.gitlab-ci.yml`,
and a Jenkinsfile stage, and a staged rollout so a new gate doesn't just get disabled the first time
it's inconvenient.

---

# Using KubePreflight Exit Codes in GitHub Actions, GitLab CI, Jenkins, and Shell

There's no such thing as a Jenkins plugin or a GitLab CI template for KubePreflight, and there
doesn't need to be. The CLI and its Docker image return a documented exit code that any CI system
can branch on. This post is the practical version: the contract, then four working examples.

## The contract

| Code | Meaning | CI handling |
| --- | --- | --- |
| 0 | Clean | No blockers or warnings. |
| 1 | Warnings only | Review before proceeding, especially in CI. |
| 2 | Blockers found | Treat as a failed readiness gate. |
| 3 | Evidence incomplete | Requested evidence could not be fully collected -- do not treat as clean. |
| 4 | Execution failure | Failed before a trustworthy report existed, e.g. kubeconfig or collector failure. |

Exit code 3 is the one people get wrong most often. It does not mean the scan passed with an
asterisk -- it means the scan couldn't fully collect the evidence it was asked to collect. Most
pipelines should fail the job on 3 the same way they fail on 2, not treat it as a soft pass.

## Two ways to gate

**Absolute gate** fails the job on any blocker in a fresh scan. It's the right default if your
repository is clean today.

**Comparison gate** fails only on new blockers versus a baseline scan. It's the better fit for a
repository that already carries pre-existing findings you can't fix in a single pull request --
otherwise the first gated PR has to fix everything at once just to pass.

## Four pipelines, one exit code

**Any CI: shell script.**

```bash
set +e
docker run --rm -v "$PWD:/work" -w /work ghcr.io/imneeteeshyadav98/kubepreflight:0.15.0-redaction scan \
  --manifests-only \
  --manifests ./deploy \
  --target-version 1.32 \
  --output all \
  --output-dir ./kubepreflight-report
status=$?
set -e

case "$status" in
  0) echo "KubePreflight clean";;
  1) echo "KubePreflight warnings present";;
  2) echo "KubePreflight blockers present"; exit 1;;
  3) echo "KubePreflight evidence incomplete"; exit 1;;
  4) echo "KubePreflight execution failed before a trustworthy report was produced"; exit 1;;
  *) echo "Unexpected KubePreflight exit code: $status"; exit 1;;
esac
```

**GitLab CI.** The image has a fixed `ENTRYPOINT`, so the job needs `entrypoint: [""]` to run the
binary directly instead of through it:

```yaml
kubepreflight-scan:
  stage: test
  image:
    name: ghcr.io/imneeteeshyadav98/kubepreflight:0.15.0-redaction
    entrypoint: [""]
  script:
    - /usr/local/bin/kubepreflight scan --manifests-only --manifests ./deploy --target-version 1.32 --output all
  artifacts:
    when: always
    paths:
      - findings.json
      - report.html
```

**Jenkinsfile stage.**

```groovy
stage('KubePreflight scan') {
  steps {
    sh '''
      set +e
      docker run --rm -v "$PWD:/work" -w /work ghcr.io/imneeteeshyadav98/kubepreflight:0.15.0-redaction scan \
        --manifests-only --manifests ./deploy --target-version 1.32 --output all
      status=$?
      set -e
      if [ "$status" -eq 2 ] || [ "$status" -ge 3 ]; then
        exit 1
      fi
    '''
  }
}
```

**GitHub Actions.** This is the one system with a first-party action, wrapping the same scan with
PR-comment output and a dedicated comparison-gate mode -- see
[the GitHub Action reference](https://kubepreflight.com/github-action/) for the full workflow.

## Rolling out a merge-blocking gate without it getting disabled

A gate that blocks merges from day one, before anyone trusts the signal, gets disabled the first
time it's inconvenient. A staged rollout holds up better:

1. Run the scan in report-only mode first -- upload the artifact, don't fail the build yet.
2. Review a week or two of runs to separate real findings from noise.
3. Decide absolute vs. comparison gate based on how clean the current baseline actually is.
4. Turn on `--redact-sensitive-identifiers` before any report becomes a build artifact or PR
   comment -- reports can otherwise carry AWS ARNs, account IDs, and internal node hostnames.
5. Flip the gate to merge-blocking once the team trusts the signal.
6. Keep reports as evidence, attached to the change record -- not just visible in a CI log that
   rotates out in a few weeks.

The full guide -- gate strategy, all four pipeline examples, and the rollout checklist -- is here:
[the Kubernetes upgrade CI guide](https://kubepreflight.com/kubernetes-upgrade-ci-guide/). For the
full exit-code reference and install steps, see [the docs](https://kubepreflight.com/docs/).

---

**Read the full guide:** [Kubernetes Upgrade CI Guide](https://kubepreflight.com/kubernetes-upgrade-ci-guide/)
**Docs:** [kubepreflight.com/docs](https://kubepreflight.com/docs/)
**Get started:** [View on GitHub](https://github.com/imneeteeshyadav98/kubepreflight) · [Install KubePreflight](https://kubepreflight.com/install/)
