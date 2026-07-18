---
title: "How Removed Kubernetes APIs Break Upgrades"
series: "Kubernetes Upgrade Readiness"
part: 3
targetGuide: "https://kubepreflight.com/kubernetes-deprecated-api-checker/"
docsLink: "https://kubepreflight.com/docs/"
ctaLink: "https://kubepreflight.com/install/"
githubLink: "https://github.com/imneeteeshyadav98/kubepreflight"
status: "publish-ready"
---

## Short social version

`kubectl` only warns about deprecated APIs when you're actively applying against them. It says
nothing about the manifest sitting in your repo, the Helm chart template nobody re-rendered, or the
controller that's been quietly emitting a removed `apiVersion` for months. Here's where deprecated
APIs actually hide, a reference table of commonly removed ones, and how to check before the
apply fails.

## Long social version

The Kubernetes deprecation guide tells you what was removed in each release. It cannot tell you
whether your own manifests, chart templates, or controllers still reference one of them --that
check has to run against your actual source and cluster state, and `kubectl`'s built-in deprecation
warnings only cover requests that are actively being made, not YAML sitting in a repo or an
unrendered Helm template. This post covers the six places a deprecated or removed API actually
hides, a reference table of commonly removed Kubernetes APIs with their real removal versions, and
the difference between "deprecated" (still works, scheduled for removal) and "removed" (the apply
just fails).

---

# How Removed Kubernetes APIs Break Upgrades

A removed Kubernetes API doesn't degrade gracefully. It doesn't log a warning and keep working with
reduced functionality. An object using an `apiVersion` the API server no longer serves simply
cannot be created, updated, or reconciled -- the request fails outright. The dangerous part is that
this failure is invisible right up until something tries to act on the object against the new
version, which for a resource that hasn't changed in months might be the exact moment of your
upgrade.

## Deprecated versus removed

These are two different states, and conflating them is how teams get caught off guard.
**Deprecated** means the API still works, but it's scheduled for removal in a specific future
minor version -- you have time, but the clock is running. **Removed** means it's gone: the API
server doesn't recognize the `apiVersion` anymore, and any request against it fails. An API is
typically deprecated for multiple releases before removal, which is exactly why "it still works"
is not evidence that it's safe -- it just means you haven't hit the removal version yet.

## Where deprecated APIs actually hide

**Live cluster objects.** An object already applied to the cluster can carry an old `apiVersion`
indefinitely if nothing has re-applied or reconciled it since it was deprecated. It sits there,
technically fine, until the version that removes its `apiVersion` entirely.

**Raw manifests.** YAML in a repository is never validated by the cluster until someone applies
it -- by the time that happens, the upgrade window has already started.

**Helm chart templates.** A chart version bump does not help if the template source itself still
renders a removed `apiVersion`. You have to check the rendered template for the version you
actually deploy, not the chart's semantic version number.

**Controllers and operators.** Some controllers create or reconcile objects using an API version
pinned in their own code, independent of anything you deploy yourself -- upgrading your own
manifests doesn't touch this.

**CRDs and conversion webhooks.** A `CustomResourceDefinition` without a working conversion webhook
can strand existing custom resources the moment their served version changes.

**CI and pull requests.** Catching a removed `apiVersion` in a pull request is strictly cheaper than
catching it during the maintenance window -- but only if something is actually checking manifests
and rendered chart templates as part of CI, not just linting syntax.

## A reference table, not a guess

A short, non-exhaustive list of commonly removed and deprecated Kubernetes APIs, sourced from the
Kubernetes Deprecated API Migration Guide:

| API and kind | Replacement | Removed in |
| --- | --- | --- |
| `extensions/v1beta1 Deployment` | `apps/v1` | 1.16 |
| `extensions/v1beta1 Ingress` | `networking.k8s.io/v1` | 1.22 |
| `apiextensions.k8s.io/v1beta1 CustomResourceDefinition` | `apiextensions.k8s.io/v1` | 1.22 |
| `admissionregistration.k8s.io/v1beta1` (Validating/Mutating)WebhookConfiguration | `admissionregistration.k8s.io/v1` | 1.22 |
| `policy/v1beta1 PodSecurityPolicy` | Pod Security Admission or a policy engine | 1.25 |
| `policy/v1beta1 PodDisruptionBudget` | `policy/v1` | 1.25 |
| `batch/v1beta1 CronJob` | `batch/v1` | 1.25 |
| `autoscaling/v2beta2 HorizontalPodAutoscaler` | `autoscaling/v2` | 1.26 |
| `flowcontrol.apiserver.k8s.io/v1beta3` FlowSchema / PriorityLevelConfiguration | `flowcontrol.apiserver.k8s.io/v1` | 1.32 |

Always check the specific target version you're upgrading to -- an API can be deprecated for
several releases before it's actually removed, and this table is a starting reference, not a
substitute for checking your target version directly.

## Checking your own manifests before a cluster exists

You don't need a live cluster to check for this. A manifests-only scan works against raw YAML and
rendered Helm chart templates directly:

```bash
kubepreflight scan \
  --manifests-only \
  --manifests ./k8s \
  --helm-chart ./charts/my-app \
  --target-version 1.32 \
  --output all
```

`--manifests-only` skips kubeconfig and cloud-provider collection entirely, which is what makes it
usable in CI or before a cluster for the target version even exists. The report's API Compatibility
summary groups every affected object by `apiVersion` and kind, separate from the rest of the
findings, so you can see the blast radius at a glance. KubePreflight identifies affected objects and
suggests a replacement `apiVersion` -- it does not edit manifests, apply changes, or perform the
migration for you.

The full reference table and a field-by-field breakdown of the API Compatibility summary are here:
[the Kubernetes deprecated API checker](https://kubepreflight.com/kubernetes-deprecated-api-checker/).
For install and first-scan steps, see [the docs](https://kubepreflight.com/docs/).

---

**Read the full guide:** [Kubernetes Deprecated API Checker](https://kubepreflight.com/kubernetes-deprecated-api-checker/)
**Docs:** [kubepreflight.com/docs](https://kubepreflight.com/docs/)
**Get started:** [Install KubePreflight](https://kubepreflight.com/install/) · [View on GitHub](https://github.com/imneeteeshyadav98/kubepreflight)
