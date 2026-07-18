---
title: "What We Learned From a Real EKS 1.31 to 1.32 Assessment"
series: "Kubernetes Upgrade Readiness"
part: 6
targetGuide: "https://kubepreflight.com/case-study/eks-1-31-to-1-32/"
docsLink: "https://kubepreflight.com/docs/"
ctaLink: "https://kubepreflight.com/install/"
githubLink: "https://github.com/imneeteeshyadav98/kubepreflight"
caseStudyVersion: "v0.14.0"
status: "publish-ready"
---

## Short social version

Real EKS 1.31 to 1.32 upgrade: readiness score went from 19 to 57, six blockers resolved, zero new
blockers, and the comparison gate passed -- and the verdict was still BLOCKED, with a rollback
recommendation of `do_not_proceed`. A passing comparison gate means no new regressions. It does not
mean ready to upgrade. Here's the full sequence and why those are different claims.

## Long social version

Most case studies show the clean win: before broken, after fixed, ship it. This one doesn't end
that way, and that's the point. A real EKS 1.31 to 1.32 upgrade went from a readiness score of 19
to 57, resolved six of seven original blockers, introduced zero new ones, and passed its comparison
gate -- and the scan verdict was still BLOCKED, not clean. This post walks through the actual
command sequence (baseline scan, target scan, comparison, rollback assessment), the real numbers at
each step, and the specific distinction that made the difference: "comparison gate: pass" means no
new regressions against the baseline. It does not mean the cluster was ready to upgrade. Those got
conflated in the original review, and separating them was what actually mattered.

---

# What We Learned From a Real EKS 1.31 to 1.32 Assessment

This is the outcome of a real KubePreflight v0.14.0 assessment against a live EKS cluster upgrading
from 1.31 to 1.32 -- captured before any upgrade action was taken. Infrastructure identifiers were
sanitized for publication; the findings, scores, decisions, and recommendation below were not
altered.

## The starting point: BLOCKED, 19/100

The baseline scan against 1.31, before any remediation, came back BLOCKED -- a NO-GO verdict at a
readiness score of 19 out of 100, with 7 blockers and 11 warnings. That's the number a team
actually has to work from, not a hypothetical "clean cluster" scenario.

## The sequence: two scans, one comparison, one rollback check

```bash
kubepreflight scan --provider eks --cluster-name production --target-version 1.31 --findings-out baseline.json
kubepreflight scan --provider eks --cluster-name production --target-version 1.32 --findings-out findings.json
```

A baseline scan, remediation work in between, then a second scan against the target version. Then
a comparison:

```bash
kubepreflight compare --baseline baseline.json --current findings.json --markdown-out comparison.md
```

```text
Comparison: BLOCKED -> BLOCKED
Readiness score: 19 -> 57
New: 0 (0 blocker(s))  Resolved: 9 (6 blocker(s))  Changed: 0  Unchanged: 38
```

Nine findings resolved, six of them blockers, zero new blockers introduced, readiness score up 38
points. Real, measurable progress. And the verdict is still `BLOCKED -> BLOCKED` -- remediation
closed most of the gap, not all of it, and the comparison correctly reflects that instead of
rounding up to a clean pass.

## The distinction that mattered: gate pass versus ready to upgrade

`Comparison gate: pass` means this run introduced no new regressions against the baseline. It does
not mean the cluster was ready to upgrade. Those are separate claims, and conflating them is exactly
how a CI check that's actually just confirming "we didn't make it worse" gets read as "we're good to
go." The blockers that comparison gate pass didn't touch still needed remediation before this
cluster was actually clear for 1.32.

## The rollback question, checked separately

```bash
kubepreflight rollback assess --cluster-name production --output md
```

```text
Eligibility            eligible
Readiness              blocked
Recommendation         do_not_proceed
Confidence             high
```

EKS technically allowed a control-plane rollback. Readiness came back blocked. The recommendation
was `do_not_proceed`, at high confidence. Eligibility answered "can you go back if this fails." It
did not answer "should you go forward" -- and once the operational evidence was in, it didn't
support going back either. Rollback eligibility and rollback safety are different questions with
different answers, in the same assessment, on the same cluster.

## What this actually checked

The scan covered APIs, admission webhooks, CRDs, PodDisruptionBudgets, node compatibility, add-ons,
workloads, and drain risk -- evaluated against the live cluster and its manifests before the
baseline-to-target comparison ran. None of that is unique to this cluster; it's the same seven-plus
areas any Kubernetes upgrade should check, described in
[the upgrade checklist](https://kubepreflight.com/kubernetes-upgrade-checklist/).

## Reading the evidence yourself

The full report -- the baseline scan screenshot, the rollback assessment console output, and every
finding behind the numbers above -- is here:
[the EKS 1.31 → 1.32 case study](https://kubepreflight.com/case-study/eks-1-31-to-1-32/). To run the
same scan-compare-assess sequence against your own cluster, start with
[the docs](https://kubepreflight.com/docs/).

---

**Read the full case study:** [EKS 1.31 → 1.32 Case Study](https://kubepreflight.com/case-study/eks-1-31-to-1-32/)
**Docs:** [kubepreflight.com/docs](https://kubepreflight.com/docs/)
**Get started:** [Install KubePreflight](https://kubepreflight.com/install/) · [View on GitHub](https://github.com/imneeteeshyadav98/kubepreflight)
