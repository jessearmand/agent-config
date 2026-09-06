---
name: web-perf
description: Investigate page load or interaction performance using browser measurements, supplied traces, and relevant source code.
---

# Web performance

Investigate the requested page, interaction, or regression. Use evidence to explain
what is slow, under which conditions, and which change is likely to help. A narrow
performance question does not require a full site or accessibility audit.

## Select evidence and tools

Inspect available browser capabilities and tool schemas before invoking them.
Prefer suitable connected tools or supplied traces; do not navigate, reload, or
start recording merely to test whether a tool exists. Select the intended browser
and tab before taking measurements that change its state.

If tracing is unavailable, use supplied Lighthouse reports, network captures,
field data, or source inspection where useful. State what cannot be measured and
ask for missing evidence only when it blocks the requested conclusion. Do not
install a browser integration or rewrite MCP configuration as an automatic fallback.

## Measure the relevant behavior

- Record the URL or route, build/environment, viewport, device/network throttling,
  cache state, and user actions needed to reproduce the result. A reload alone
  does not establish a cold cache.
- Trace navigation for loading problems and representative interactions for
  responsiveness problems. Use the tools and insight names actually available;
  do not assume a particular MCP signature or hard-code returned identifiers.
- Separate laboratory observations from field distributions. A navigation trace
  without representative interactions cannot establish good INP. TBT can help
  diagnose blocking work but is not a substitute for measured INP.
- For regressions or before/after claims, compare equivalent conditions and repeat
  measurements enough to assess variability. Report sample count and spread or a
  suitable aggregate; do not select only the best run.
- Use current metric-specific guidance when assigning ratings. Do not apply field
  percentile criteria or device-specific Lighthouse scoring thresholds to every
  individual trace, and do not declare the site healthy from one fast page load.

## Trace causes and recommend changes

Follow the evidence into the relevant request chain, main-thread task, layout
shift, or source path. Inspect build configuration only when it helps explain the
finding. Preserve framework, caching, and loading behavior outside the task.

Distinguish observed costs, tool-estimated savings, and hypotheses. Estimated
savings are not measured improvement; zero estimated savings is not proof that an
issue has no impact under other conditions.

Before recommending removal of a resource, preload, or preconnect, check relevant
routes and interactions. Absence from one trace means only that it was not observed
there. Check dynamic usage and correctness constraints before changing loading order,
caching, code splitting, or imports. Avoid generic optimization checklists.

Include accessibility testing only when requested or directly relevant to the
interaction being investigated. An accessibility-tree snapshot alone does not
establish visual contrast, keyboard focus behavior, or overall conformance.

## Report and verify

Lead with the finding and its evidence. Include measurement conditions, relevant
metrics, uncertainty, and prioritized changes tied to the affected resource or code.
Omit sections that the task or available evidence does not support.

When implementation is authorized, make focused changes and repeat the relevant
measurement under equivalent conditions. Verify the affected behavior as well as
performance. For review-only work, leave recommendations without applying them.

## Sources

Fetch the relevant official page when metric definitions, thresholds, or tool
behavior need verification:

- [Core Web Vitals and field/lab measurement](https://web.dev/articles/vitals)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance)
- [Lighthouse scoring](https://developer.chrome.com/docs/lighthouse/performance/performance-scoring)
