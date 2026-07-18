---
title: "Why Kubernetes Upgrades Fail Even When the Control Plane Upgrade Succeeds"
series: "Kubernetes Upgrade Readiness"
part: 1
targetGuide: "https://kubepreflight.com/kubernetes-upgrade-checklist/"
docsLink: "https://kubepreflight.com/docs/"
ctaLink: "https://kubepreflight.com/install/"
githubLink: "https://github.com/imneeteeshyadav98/kubepreflight"
status: "publish-ready"
---

## Short social version

A Kubernetes control-plane upgrade can succeed and your platform can still break. Removed APIs,
strict PodDisruptionBudgets, unreachable admission webhooks, and version-pinned add-ons are
usually invisible until the upgrade is already in progress. Here's why "the upgrade completed" and
"the platform is fine" are two different claims -- and how to check the second one before you find
out the hard way.

## Long social version

"The control plane upgraded cleanly" is the sentence that shows up in almost every Kubernetes
upgrade postmortem, right before the part where something else broke. A managed control plane
upgrading successfully tells you the control plane is fine. It does not tell you whether your
manifests still reference an API that no longer exists, whether a PodDisruptionBudget will let
node drain make progress, whether an admission webhook is reachable, or whether your CoreDNS and
CSI driver versions are still compatible with the new version. Those are separate questions, and a
green upgrade dashboard answers none of them. This post walks through the four failure categories
that show up most often -- API removal, admission webhooks, disruption budgets, and add-on
compatibility -- with a concrete example of each, and how to check for all four before you open a
maintenance window, not during one.

---

# Why Kubernetes Upgrades Fail Even When the Control Plane Upgrade Succeeds

If you've run more than one Kubernetes upgrade, you've probably seen this pattern: the control
plane reports a successful version bump, and then something unrelated breaks a few minutes or a
few days later. An ingress controller stops picking up new routes. A CronJob silently stops
running. A webhook starts rejecting every request in a namespace. None of these are control-plane
bugs. They're consequences of an upgrade that succeeded at the one thing everyone was watching --
the version number -- while quietly breaking several things nobody was.

## The control plane answers one question, not four

A Kubernetes upgrade actually needs four separate readiness checks, and a successful control-plane
upgrade only ever answers one of them.

**Did the API server come up on the new version?** This is what most tooling watches, and it's the
easiest to verify. It is also the least informative signal about whether your workloads are safe.

**Do your manifests, Helm charts, and controllers still use APIs that exist on the new version?**
Kubernetes removes deprecated APIs on a schedule, and removal is not gradual -- an object using a
removed `apiVersion` simply cannot be created, updated, or reconciled anymore. `extensions/v1beta1
Ingress` was removed in 1.22. `policy/v1beta1 PodSecurityPolicy` and `batch/v1beta1 CronJob` were
both removed in 1.25. If a controller in your cluster still emits objects on one of these, it keeps
working right up until the version that removes it, and then it doesn't.

**Can workloads still be safely disrupted during and after the upgrade?** Node upgrades mean pods
get evicted and rescheduled. A PodDisruptionBudget that's stricter than your actual redundancy
allows -- or a singleton workload with no PDB at all -- can stall node drain indefinitely,
independent of whether the control plane itself is healthy.

**Are add-ons and admission webhooks still compatible?** CoreDNS, your CSI driver, cert-manager, an
ingress controller, and any custom admission webhook all have their own version constraints against
the Kubernetes API. An admission webhook with an unreachable backend, an overly broad selector, or
an API version the new control plane no longer serves can start silently rejecting requests --
sometimes for one namespace, sometimes for the whole cluster.

## A concrete example: the webhook that "worked yesterday"

A validating webhook configuration that pinned `admissionregistration.k8s.io/v1beta1` worked fine
right up until the control plane stopped serving that version -- removed in 1.22, same release that
removed several other `v1beta1` APIs at once. Nothing about the webhook's *logic* changed. The
control plane upgrade succeeded. The webhook just silently stopped being registered, and every
create or update it was supposed to validate went through unchecked (or, depending on the failure
policy, started getting rejected outright). Neither failure mode shows up in a "control plane
upgraded successfully" dashboard.

## Checking all four before the window opens

The fix isn't more control-plane monitoring -- it's checking the other three questions before the
maintenance window, not during it: scan manifests and Helm chart templates for removed and
deprecated APIs against your actual target version, check PodDisruptionBudgets against real replica
counts and scheduling constraints, and verify webhook reachability, API versions, and add-on
compatibility ahead of time.

That's the exact sequence [KubePreflight](https://kubepreflight.com/) runs in one read-only scan:

```bash
kubepreflight scan \
  --target-version 1.32 \
  --output all
```

The scan correlates deprecated/removed APIs, admission webhook health, PodDisruptionBudget and
eviction constraints, node and kubelet skew, and add-on compatibility into one blocker/warning/info
result -- so you're reading one evidence-backed report instead of manually cross-referencing four
different failure modes. It's read-only: it never applies a change, never performs the upgrade, and
never touches cluster state.

We put the specific checklist -- what to verify in each of the four areas above, plus a
before/during/after change-window checklist -- into a single reference:
[the Kubernetes upgrade checklist](https://kubepreflight.com/kubernetes-upgrade-checklist/).

If you want to run this yourself, [the docs](https://kubepreflight.com/docs/) walk through install,
a first scan, reading the findings, and wiring exit codes into CI.

---

**Read the full guide:** [Kubernetes Upgrade Checklist](https://kubepreflight.com/kubernetes-upgrade-checklist/)
**Docs:** [kubepreflight.com/docs](https://kubepreflight.com/docs/)
**Get started:** [Install KubePreflight](https://kubepreflight.com/install/) · [View on GitHub](https://github.com/imneeteeshyadav98/kubepreflight)
