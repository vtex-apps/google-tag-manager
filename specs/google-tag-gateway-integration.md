# Google Tag Gateway (GTG) Integration

> **Status**: Draft
> **Created**: 2026-09-15

## 1. Business Context

### Problem Statement

The `vtex.google-tag-manager` app loads Google Tag Manager (GTM) as a classic third-party (3P) script: the browser fetches `https://www.googletagmanager.com/gtm.js` directly (`pixel/head.html`). Ad blockers, Safari ITP, and similar browser restrictions increasingly block this call, causing signal loss — broken attribution, returning visitors misread as new sessions, and degraded Smart Bidding/PMax optimization for merchants relying on GTM/GA4 through this app.

Google's Tag Gateway (GTG) program addresses this by making the tag first-party (1P): the browser requests the script from the store's own domain instead of `googletagmanager.com`, and a proxy (its architecture is intentionally not finalized — see Decision 1) forwards the request to Google. This is a transport change only; it does not add new data collection beyond what the store's existing GTM container already captures.

Separately, and independently of GTG, Google requires a "Developer ID" to be present on VTEX-originated tag installations, so Google can attribute adoption to the VTEX platform (contractually restricted from being used to infer VTEX's market share).

This is one deliverable inside a larger 3-year commercial agreement between VTEX and Google; commercial terms (milestone payments, activation bonuses) are context for prioritization and are not implemented by this app — they are noted here only where they shape a technical requirement.

### Goals

- Store Framework merchants using this app can serve their GTM tag as first-party without editing storefront code ("codeless" setup, per contract Exhibit 1).
- Existing GTM event capture (page views, enhanced ecommerce events, GA4 events) is unaffected — `dataLayer` contents and event modules in `react/modules/*` do not change.
- GTG can be enabled per store/binding and rolled back per store/binding without a global app change, satisfying the contractual rollout/rollback requirement (Exhibit 2).
- If the 1P route is unavailable, the store falls back to the classic 3P tag automatically, so tracking is never fully lost.
- Developer ID is present on tag loads from this app, independent of whether GTG is enabled for that store.
- Meets the milestone gate for "GTG development complete, released for Google/VTEX testing" (Contract Milestone 1) for the Store Framework surface.

### User Stories

#### US-1: Merchant tag served first-party

- **Story**: As a merchant using the VTEX Google Tag Manager app, I want my GTM tag to load from my own domain instead of `googletagmanager.com`, so that ad blockers and browser ITP do not block my analytics and conversion tracking.
- **Acceptance Criteria**:
  - **Given** GTG is enabled for a store, **when** the storefront renders `pixel/head.html`, **then** the GTM script `src` is rewritten to a same-origin, relative path following the `{randomChars}/{siteAlias}/{base64(gtagId)}` format instead of `https://www.googletagmanager.com/gtm.js?id=...`.
  - **Given** GTG is enabled, **when** the script loads successfully, **then** `window.dataLayer` and all existing event modules (`enhancedEcommerceEvents`, `extraEvents`, `legacyEvents`, GA4 events) behave exactly as they do today — no event, trigger, or payload shape changes.
  - **Given** GTG is disabled for a store (default), **when** the page renders, **then** behavior is byte-for-byte identical to the current 3P implementation.

#### US-2: Codeless enablement

- **Story**: As a merchant, I want to adopt GTG without editing any storefront code, so that I don't need developer resources to benefit from it.
- **Acceptance Criteria**:
  - **Given** a store already has `gtmId` configured, **when** GTG is turned on for that store (see Decision 2 on who controls this), **then** no change to the merchant's GTM container, theme, or custom code is required.

#### US-3: Fail-open to classic 3P tag

- **Story**: As a merchant, I want my analytics to keep working even if the first-party route breaks, so that a proxy incident doesn't cause total tracking loss.
- **Acceptance Criteria**:
  - **Given** GTG is enabled and the 1P route becomes unhealthy, **when** the platform detects this, **then** affected stores revert to the classic 3P `googletagmanager.com` script within the contractual 24-hour window (Exhibit 2).
  - **Given** a rollback is triggered for a single store, **when** the rollback is applied, **then** only that store is affected — other stores with GTG enabled are not impacted.

#### US-4: Developer ID on every tag load

- **Story**: As VTEX platform engineering, I want a Developer ID present on every GTM tag load originated by this app, so that Google can attribute the installation to the VTEX platform per the contract.
- **Acceptance Criteria**:
  - **Given** the Developer ID value has been received from Google and configured, **when** `pixel/head.html` renders, **then** the identifier is present on the tag load, regardless of whether GTG is enabled for that store (see Open Question 1 for the exact mechanism when GTG is *not* enabled).
  - **Given** the Developer ID value has not yet been provided by Google, **when** `pixel/head.html` renders, **then** nothing breaks — the identifier is simply omitted (no hardcoded placeholder is shipped).

### Key Scenarios

| Scenario | Pre-conditions | Steps | Expected Result |
|---|---|---|---|
| Happy path — GTG enabled | Store on Store Framework, `gtmId` configured, GTG flag on for this store | Storefront page loads | Script tag points to the 1P relative path; GTM loads and fires events exactly as before; Developer ID present |
| Error case — 1P route unhealthy | GTG enabled, proxy backend (external to this app) failing health checks | Page loads while proxy is down | Fallback mechanism serves the classic 3P script within the 24h SLA window; store keeps collecting data via 3P in the interim |
| Edge case — GTG disabled, no `gtmId` set | App installed, `gtmId` empty | Page loads | Existing behavior preserved: console warning logged, no script injected (unchanged from today) |

### Functional Requirements

- Rewrite the GTM script tag's `src` in `pixel/head.html` to a same-origin relative path in the `{randomChars}/{siteAlias}/{base64(gtagId)}` format when GTG is enabled for the store.
- Base64-encode the configured `gtmId` client-side at render time (template substitution, consistent with how `settings.gtmId` is already interpolated today).
- Preserve the existing `dataLayer` initialization, `gtm.blacklist` push, and all event-forwarding modules unchanged.
- Support enabling/disabling GTG per store/binding independently (this app is already `bindingBounded`).
- Inject the Developer ID into the tag load path once VTEX receives the value from Google; source the value from app-level configuration, not a hardcoded literal, so it can be updated without assuming a specific release cadence.
- Preserve the current fallback behavior (log a warning, skip injection) when required configuration is missing.

### Non-Functional Requirements

- **Backwards compatibility**: with GTG disabled (default), output must be identical to the current shipped behavior. This ships as a semver-minor release per this repo's existing changelog convention.
- **Resilience**: the client-side rewrite must not introduce a single point of failure — if GTG-related configuration is absent or invalid, the app must fall back to the current 3P snippet rather than omit tracking entirely.
- **Performance**: no additional render-blocking work; the script tag remains `async`, and base64 encoding of a short ID is negligible at template-render time.
- **NFR-O11y**: N/A for this repository — this app only rewrites a client-side script tag and injects a static identifier; it introduces no new HTTP endpoints, workers, consumers, or outbound service calls. The GTG proxy component (architecture pending — Decision 1) will independently need to satisfy the Observability golden path (`https://github.com/vtex/diagnostics`) once its architecture is defined; that work is tracked as a dependency of this feature, not delivered by it.
- **Privacy**: no new data is collected by this app; the merchant remains the data controller (per contract §10). This app does not alter Google Consent Mode behavior — consent enforcement happens inside the Google tag itself.

### Out of Scope

- Implementing the GTG proxy/reverse-proxy itself (request forwarding to `fps.goog`, header injection, IP-to-geo resolution, cache bypass, SLA compliance). This is a separate, not-yet-assigned architecture effort — see Decision 1.
- Storefronts other than Store Framework (Fast Store, headless, fully custom themes, Activity Flow). Per the source brief, these are excluded from the initial pilot and have no defined owner yet.
- The Data Manager API (DMA) integration — a separate, lower-priority line item in the same contract.
- Any change to Google Consent Mode handling, PII redaction, or Enhanced Conversions — these are Google-side tag behaviors, not part of this app.
- Deciding between the "big-bang" (default-on) and phased activation models from the contract (§3) — this is a product/legal decision; this spec's design supports either outcome (see Decision 2).

---

## 2. Arch Decisions

### Proposed Solution

Extend `pixel/head.html` (and its supporting settings) with a conditional path: when GTG is enabled for a store, rewrite the GTM script tag to a same-origin relative URL following Google's required format instead of the current absolute `googletagmanager.com` URL. All event-capture code (`react/modules/*`) is untouched, since GTG changes transport, not data collection.

Deliberately, this app does not implement, call, or assume anything about the proxy that will actually receive that request. Google's own requirement that the script be "same-origin" means the browser-visible contract is just a relative path — whatever infrastructure answers that path (CDN edge rule, dedicated microservice, or a broader server-side tag distribution layer) is an integration boundary this app depends on, not something it implements.

### Architecture Overview

```mermaid
flowchart LR
    subgraph Browser
        A[Storefront page]
    end
    subgraph ThisApp["vtex.google-tag-manager (this spec)"]
        B["pixel/head.html<br/>tag rewrite + Developer ID"]
    end
    subgraph Undecided["Proxy backend — architecture TBD (out of scope)"]
        C["Option A: CDN edge proxy<br/>(Exhibit 1 default)"]
        D["Option B: VTEX server-side<br/>tag distribution layer"]
    end
    E[fps.goog / Google]

    A -->|"renders"| B
    B -->|"same-origin relative path<br/>{randomChars}/{siteAlias}/{base64(gtagId)}"| Undecided
    C --> E
    D --> E
```

The dotted boundary matters more than the diagram's boxes: this repository owns everything left of "same-origin relative path." Everything to the right is an external dependency whose internal shape can change without requiring a new spec for this app, as long as it keeps answering at a same-origin path.

### Alternatives Considered

| Alternative | Pros | Cons | Verdict |
|---|---|---|---|
| Hardcode the rewrite to assume Option A (CDN edge proxy) now | Matches Google's Exhibit 1 wording literally; simplest to reason about today | Couples this app to an infrastructure decision that isn't made yet; likely rework if Option B (custom server-side tag layer) is chosen | Rejected |
| Decouple via a same-origin relative path, agnostic to backend (chosen) | Works under either Option A or B; matches the "same-origin" requirement Google already mandates; minimal, reversible change | Still depends on *some* team eventually serving that path correctly | Accepted |
| Block this app's work until the proxy architecture decision is made | Zero risk of rework | Blocks the Milestone 1 gate ("GTG development complete"), which includes the client-side deliverable | Rejected |

### Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| Developer ID value not yet received from Google | Medium | High (contract itself states it's pending) | Source the value from app-level config, not a hardcoded literal; ship the injection logic now as a no-op until the value exists |
| Proxy backend location/architecture undecided | High | High | Keep this app's contract limited to emitting a same-origin relative path (Decision 1); do not assume routing internals |
| Ambiguity on whether GTG enablement is a merchant-facing toggle or a platform-controlled rollout flag | Medium | Medium | Default to platform-controlled rollout (Decision 2); escalate to product before building any new admin UI |
| Contract's "1P as default behavior" requirement (§6.1) vs. the phased/gradual rollout already being pursued (§3, §8) | High | Medium | Not resolved by this spec — flagged as Open Question 2 for the contract/product owner before GA |
| Legal/privacy review of CDN interception still pending | High | Medium | Treat as a GA-blocking dependency, not an engineering task in this repo |

### Key Decisions

#### Decision 1: The proxy backend architecture is an external, deferred dependency

- **Status**: Deferred (owned outside this repository)
- **Context**: The source brief explicitly states the proxy's home is undecided — it could be a CDN edge rule (Option A, Google's documented default) or a broader VTEX server-side tag distribution layer (Option B), and the decision has a named but unconfirmed technical owner outside this app's team.
- **Decision**: This app implements only its side of the contract: rendering a same-origin relative path in the format Google requires. It does not implement, mock, or hardcode assumptions about what serves that path.
- **Consequences**: This app can ship and pass Milestone 1 for its own scope independent of the proxy decision. The trade-off is that end-to-end GTG only works once the proxy exists somewhere; until then, the rewritten path safely 404s or should stay behind the enablement flag from Decision 2.

#### Decision 2: GTG enablement is modeled as a platform-controlled rollout flag, not a new merchant setting

- **Status**: Accepted (assumption — see Open Question 2)
- **Context**: Exhibit 2 requires per-store test/launch/rollback capability. Sections 3 and 8 of the source brief indicate engineering is already building toward a phased, gradual rollout rather than the contract's alternative "big-bang" default-on model.
- **Decision**: Model enablement as an internal rollout control (e.g., a feature flag evaluated per store/binding), not a new field in `settingsSchema`. The merchant-facing configuration surface (`gtmId`, `allowCustomHtmlTags`, `sendGA4Events`) does not change.
- **Consequences**: Merchants get GTG transparently once their store is included in the rollout; no new admin UI is required, which keeps setup "codeless" per Exhibit 1. If product later decides merchants should be able to opt in/out themselves, a new setting can be added without touching the core rewrite logic.

#### Decision 3: Developer ID is a platform constant, not a merchant-configurable setting

- **Status**: Accepted
- **Context**: The Developer ID is a single static value assigned by Google to VTEX as a platform, not something that varies per merchant.
- **Decision**: Keep it out of `settingsSchema` (which is merchant-facing input); source it from app-level configuration that can be updated independently of merchant settings.
- **Consequences**: No merchant ever sees or configures this value; a single config change (or minor release) updates it for every store once Google provides it.

### Implementation Plan

1. **Phase 1 — Internal release (Contract Milestone 1)**: Implement the conditional script-tag rewrite and Developer ID injection, both disabled/no-op by default. Ship behind the rollout flag from Decision 2, enabled only for VTEX/Google internal test sites.
2. **Phase 2 — Customer testing (toward Milestone 2)**: Enable the flag for the agreed Store Framework pilot cohort. This app's only responsibility here is that the rewritten path resolves once the (still separately-owned) proxy exists; the `/healthy` and `/?validate_geo=healthy` checks from Exhibit 1 §6.3 are the proxy's responsibility, not this app's.
3. **Phase 3 — Ramp to GA (Milestone 3)**: Expand flag rollout percentage per the agreed ramp schedule, store by store, using the same per-store rollback capability from Decision 2.
4. **Phase 4 — Post-GA**: Investigate Fast Store, headless, and Activity Flow coverage as a separate initiative (no owner assigned yet per the source brief).

---

## 3. Technical Contract

### Data Models

No persistent data models are introduced. The only structured input is the existing `settingsSchema` in `manifest.json` (`gtmId`, `allowCustomHtmlTags`, `sendGA4Events`), which is unchanged by this feature.

### Interfaces

- **`pixel/head.html` template variables** (existing, unchanged): `{{settings.gtmId}}`, `{{settings.sendGA4Events}}`, `{{ blacklist }}`.
- **New internal contract**: a same-origin relative URL emitted by this app in place of the current absolute script `src`:
  ```
  /{randomChars}/{siteAlias}/{base64(gtagId)}
  ```
  `randomChars` and `siteAlias` are provided by whatever serves the proxy side (Decision 1); this app is responsible only for base64-encoding `gtmId` and composing the path, not for generating or validating the other two segments.
- **`window.dataLayer`**: unchanged. All existing pushes (`gtm.blacklist`, GTM's own `gtm.start` event) and all event modules under `react/modules/` keep their current shape and are unaffected by the transport change.

### Integration Points

- **VTEX Pixel Manager** (`vtex.pixel-interfaces`, existing `pixel` policy): unchanged; this app continues to listen for the same `PixelMessage` events via `window.addEventListener('message', handleEvents)`.
- **GTG proxy backend** (external, architecture pending — Decision 1): this app's only integration surface with it is the relative URL format above. No direct calls, health checks, or header injection are implemented in this repository.
- **Rollout/feature-flag mechanism** (Decision 2): to be wired once the specific platform mechanism is confirmed with product; not yet part of this app's dependencies.

### Invariants & Constraints

- With GTG disabled, output is byte-for-byte identical to the current 3P implementation — no regression for the ~96% of non-headless stores not in the initial pilot.
- The base64-encoded `gtagId` segment must stay within the 100-character path limit implied by Google's format (Exhibit 1 §6.1); given typical `GTM-XXXXXXX` / `AW-XXXXXXXXXX` ID lengths, this is not expected to be a practical constraint but should be validated once real IDs are tested end-to-end.
- Developer ID injection must be a no-op (not a broken placeholder) whenever the value is unset.
- `dataLayer` semantics, event names, and payload shapes defined in `react/modules/*` must never change as a side effect of this feature — GTG is a transport change only.

---

## Open Questions

These are called out explicitly rather than resolved by assumption, per the ambiguity noted in the source brief:

1. **Developer ID delivery mechanism for non-GTG stores.** Exhibit 1 §6.2 specifies the Developer ID travels as an `X-Gtg-Developer-Id` HTTP header added by the proxy — which only exists once GTG is active for a store. Section 5 of the source brief separately describes Developer ID as something injected "at GTM script load," implying a possible client-side mechanism independent of GTG (relevant for the ~96% of stores not on GTG yet, whose tag adoption Google presumably still wants attributed). This spec does not assume which is correct; it needs confirmation with Google/product before Decision 3 can be implemented for non-GTG stores.
2. **Activation model impact on this app's rollout mechanism.** If VTEX ultimately accepts the contract's "big-bang" default-on model (§3) instead of the phased rollout assumed in Decision 2, this app's enablement mechanism would need to change from a gradual rollout flag to an unconditional default — a product/legal decision, not an engineering one, tracked here so it isn't lost.
