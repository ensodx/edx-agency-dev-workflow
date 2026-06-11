# Exception Report

**Phase:** <!-- e.g. 0.3 -->
**Date:** <!-- YYYY-MM-DD -->
**Blocked task:** <!-- task ID and description from tasks.md -->
**Handoff:** <!-- path to handoff-builder.json -->

---

## What was being implemented

<!-- One paragraph: the feature or fix the builder was working on, and the specific
     implementation step that triggered this blocker. -->

---

## The blocker

<!-- Describe the constraint precisely. Include:
     - The exact error, conflict, or incompatibility encountered
     - Which library, service, policy, or external system is involved
     - Why this cannot be resolved within the current ADR without external input -->

---

## Why this requires human approval

<!-- Explain what makes this a strategic blocker rather than a technical one.
     Examples of strategic blockers:
     - The proposed fix requires a library with a paid or restricted license
     - The proposed fix changes the public API surface of the project
     - The proposed fix involves a dependency that conflicts with a stated security policy
     - The proposed fix requires a budget or infrastructure decision
     - The proposed fix changes scope beyond the current phase boundary -->

---

## Options

<!-- List 2-3 concrete options. Do NOT pick one -- that is the human's decision.
     For each option: describe it, list the tradeoffs, and note any constraints it
     would impose on downstream phases. -->

### Option A: <!-- short name -->

**Description:** ...

**Tradeoffs:** ...

**Downstream impact:** ...

---

### Option B: <!-- short name -->

**Description:** ...

**Tradeoffs:** ...

**Downstream impact:** ...

---

### Option C (if applicable): <!-- short name -->

**Description:** ...

**Tradeoffs:** ...

**Downstream impact:** ...

---

## What is needed to proceed

<!-- Be specific about what the human must decide, approve, or provide before the
     architect can rearchitect. Examples:
     - "Approve switching from library X to library Y"
     - "Confirm whether the project has an enterprise license for service Z"
     - "Decide whether phase scope should expand to include feature W"

     Once the human has made the decision, they should update the relevant ADR
     (or confirm the existing one stands) and resume the phase. -->
