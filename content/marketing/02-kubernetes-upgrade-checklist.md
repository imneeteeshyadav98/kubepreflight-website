---
title: "The Kubernetes Upgrade Checklist Platform Teams Should Use"
series: "Kubernetes Upgrade Readiness"
part: 2
targetGuide: "https://kubepreflight.com/kubernetes-upgrade-checklist/"
docsLink: "https://kubepreflight.com/docs/"
ctaLink: "https://kubepreflight.com/install/"
githubLink: "https://github.com/imneeteeshyadav98/kubepreflight"
status: "publish-ready"
---

## Short social version

Most Kubernetes upgrade checklists are a paragraph of advice. This one is seven areas, a go/no-go
result table, and a before/during/after operational checklist -- the same structure a platform team
would actually run through for a real maintenance window, not just Kubernetes-specific but
applicable to any distribution.

## Long social version

Every Kubernetes upgrade checklist we could find fell into one of two categories: a generic
"read the release notes" paragraph, or a vendor-specific document scoped to one managed offering.
Neither answers the actual operational question a platform team has the week before a maintenance
window: what, specifically, do we check, in what order, and what do we do with the result? This
post breaks the checklist into seven concrete areas -- preparation, API compatibility, admission
webhooks, workloads and disruption, nodes and capacity, add-ons and controllers, and cluster health
-- plus a four-outcome result table (blocker, warning, info, incomplete evidence) so "I ran the
checklist" turns into an actual decision, not just a checked box.

---

# The Kubernetes Upgrade Checklist Platform Teams Should Use

A checklist is only useful if it turns into a decision. "We reviewed the deprecation guide" is not
a decision. "Two blockers, both resolved, zero warnings, evidence complete -- proceed" is. This
post is the operational version of a Kubernetes upgrade checklist: seven areas to check, in the
order that matters, and what to do with what you find.

## The seven areas

**1. Pre-upgrade preparation.** Before any technical check: current version, target version, a
supported upgrade path between them, a scheduled maintenance window, a documented rollback and
recovery plan, verified backups, confirmed cluster access for whoever is running the change, and
clear ownership and sign-off. Skipping this step is how a technically clean upgrade still turns
into a confusing incident -- not because anything broke, but because nobody agreed on who owns the
decision to proceed.

**2. API compatibility.** Removed and deprecated APIs across live cluster objects, raw manifests,
Helm chart templates, and anything a controller or operator creates on your behalf. This has to run
against your target version specifically -- an API can be deprecated for several releases before
it's actually removed, and "it still works today" is not evidence that it will keep working.

**3. Admission webhooks.** Backend availability, supported API versions, timeout configuration,
failure policy (`Ignore` vs. `Fail`), namespace and object selectors, certificate validity, and
service reachability. An admission webhook that silently stops being registered -- because its own
`admissionregistration.k8s.io` API version was removed -- can block or silently skip validation for
every request it was supposed to cover.

**4. Workloads and disruption.** Unhealthy Deployments and StatefulSets, pods stuck pending,
crash-looping containers, replica counts relative to disruption budgets, PodDisruptionBudgets that
are too strict to allow drain, singleton workloads with no redundancy, `hostPath`/local-PV usage,
anti-affinity and topology spread constraints, and `hostPort` usage that limits rescheduling. This
is the category most upgrade checklists skip entirely, and it's the one that actually stalls node
drain mid-upgrade.

**5. Nodes and capacity.** Kubelet version skew against the target control-plane version, `NotReady`
nodes, available scheduling capacity for rescheduled pods, a drain simulation before the real
maintenance window, DaemonSets that must tolerate the upgrade, local storage tied to a specific
node, and control-plane-before-nodes upgrade order.

**6. Add-ons and controllers.** CoreDNS, CSI drivers, `metrics-server`, ingress controllers,
cert-manager, `external-dns`, cloud-controller-manager components, and any custom operator your
workloads depend on. Treat add-on order as a reviewed decision, not a default -- compatibility
depends on the specific versions installed, and it is not automatically verified just because a
version bump succeeded elsewhere.

**7. Cluster health.** `APIService` availability, webhook health, DNS resolution, storage
provisioning, networking, control-plane health, any already-pending upgrades, and active incidents
that should delay the window on their own.

## Turning findings into a decision

Every check in the seven areas above resolves to one of four results:

| Result | Meaning | Action |
| --- | --- | --- |
| Blocker | Upgrade should not proceed | Resolve and re-scan |
| Warning | Upgrade may proceed with risk | Review and document |
| Info | Advisory context | Track if relevant |
| Incomplete evidence | Readiness is not fully known | Restore evidence coverage |

That last row matters more than it looks. Incomplete evidence -- a Kubernetes, AWS, or manifest
plane that couldn't be fully collected -- is not the same as a clean result, and treating it as one
is how a real gap gets waved through.

## Running the full checklist in one command

Manually working through seven areas by hand is exactly the kind of check that gets rushed the week
of a maintenance window. A single scan against your manifests or live cluster covers all seven:

```bash
kubepreflight scan \
  --target-version 1.32 \
  --output all
```

The result is a blocker/warning/info verdict with evidence for each finding, plus a readiness score
for comparing scan posture over time -- not a pass/fail black box.

The full checklist, with the before/during/after change-window operational list and the
KubePreflight scan-to-validate workflow, is here:
[the Kubernetes upgrade checklist](https://kubepreflight.com/kubernetes-upgrade-checklist/).
For the install and first-scan steps, see [the docs](https://kubepreflight.com/docs/).

---

**Read the full guide:** [Kubernetes Upgrade Checklist](https://kubepreflight.com/kubernetes-upgrade-checklist/)
**Docs:** [kubepreflight.com/docs](https://kubepreflight.com/docs/)
**Get started:** [Install KubePreflight](https://kubepreflight.com/install/) · [View on GitHub](https://github.com/imneeteeshyadav98/kubepreflight)
