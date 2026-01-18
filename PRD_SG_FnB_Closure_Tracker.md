# PRD — Singapore F&B Closure Tracker (Sheets + Apps Script + React MVP)

**Doc owner:** Forkie  
**Status:** Draft (MVP foundation)  
**Last updated:** 2026-01-17 (SGT)

---

## 1) Introduction

We are building a **simple web app** that tracks **Singapore F&B closures** in an intuitive, catchy way and serves as a **lead magnet** for our Substack publication.

The product is intentionally lightweight:
- **No user accounts**
- **Google Sheets** as the “database”
- **Google Form** (or equivalent) for public submissions
- **Google Apps Script** for automation + validation + review pipeline + Telegram notifications
- **React frontend** (Figma export already available) that reads from the curated dataset

The system must support:
1) **Public tracker** (read-only) powered by curated records  
2) **Contributor submissions** with a **clear + review** pipeline  
3) A pipeline to **collect closure-related headlines** from news sources (RSS-first) and convert them into draft submissions for review  
4) **Telegram alerts** for review-worthy items  

---

## 2) Goals

### Product goals
- Provide a **public closure tracker** that is easy to browse, filter (later), and share.
- Build a **reliable curated dataset** that can scale from manual curation to semi-automated intake.
- Capture interest and convert visitors into **Substack subscribers**.

### Operational goals
- Keep maintenance simple (Sheets + Apps Script).
- Ensure **no unverified data** is published by default.
- Make review fast: accept/reject/merge in the spreadsheet.

---

## 3) Non-goals (for MVP)

- User authentication or role-based access
- Full automated entity resolution (perfect business identification)
- Fully automated enrichment (address/category/reasons) from web search APIs
- A full internal admin dashboard beyond Google Sheets
- Real-time updates or push subscriptions for end-users

---

## 4) Users & User Stories

### A) Public visitor
- As a visitor, I can see **closures over time** and the **latest closures**.
- As a visitor, I can click a closure and see basic details + sources (v1 optional).
- As a visitor, I can submit a closure report via a form.
- As a visitor, I can subscribe to Substack via prominent CTAs.

### B) Operator / insider contributor
- As a contributor, I can submit a closure even if I do not have a URL/source.
- As a contributor, I can add helpful context (dates, reasons, notes).

### C) Admin (Forkie)
- As admin, I can review submissions in a queue and **accept/reject/merge** them.
- As admin, I get **Telegram notifications** when a submission needs review.
- As admin, I can seed the system with **headline candidates** from news sources.

---

## 5) Data Model (Google Sheets)

We use 3 tabs (tables). Only **CLOSURES** is public-facing.

### 5.1 Tab: `CLOSURES` (public; powers the website)

**Header row (canonical; keep exact names):**
```
closure_id,added_at,business_name,outlet_name,address,area,category,status,announced_date,last_day,reasons,source_urls,evidence_excerpt,short_note,tags
```

Notes:
- `status` is conservative by default: **Reported**; can be upgraded to **Confirmed** during review.
- `source_urls` may be blank.
- `evidence_excerpt` should be short (avoid reproducing long copyrighted text).

---

### 5.2 Tab: `SUBMISSIONS` (private; intake + system drafts)

**Header row (canonical; keep exact names):**
```
submission_id,submitted_at,source_type,submitter_name,submitter_contact,business_name_raw,outlet_name_raw,address_raw,area_raw,closure_claim,announced_date,last_day,reasons_claimed,evidence_url,evidence_excerpt,notes,validation_status,validation_flags,possible_duplicate,dup_match,review_status,review_action,review_notes,reviewed_at,result_closure_id
```

- `source_type`: `community` | `system_candidate`
- `review_action`: `Accept` | `Reject` | `Merge` | `Need more info`
- `review_status`: `pending` | `accepted` | `rejected` | `merged`

---

### 5.3 Tab: `CANDIDATES` (private; headline discovery)

**Header row (canonical; keep exact names):**
```
candidate_id,found_at,publisher,headline,url,published_at,matched_terms,entity_guess,area_guess,status,review_notes
```

- `status`: `new` | `queued` | `promoted` | `rejected`

---

## 6) Workflows

### 6.1 Community submission → validation → review → publish
1) Public user submits via form → row lands in `SUBMISSIONS`.
2) Apps Script validates the row (checklist; no scoring).
3) Script writes:
   - `validation_status` (auto_queue | needs_review | reject)
   - `validation_flags` (comma-separated)
   - `possible_duplicate` (yes/no)
   - `review_status = pending`
4) If `needs_review`, send Telegram message to admin.
5) Admin reviews the row by setting `review_action`:
   - **Accept:** script copies normalized fields into `CLOSURES`, assigns `closure_id`, sets `result_closure_id`
   - **Reject:** script marks `review_status=rejected`
   - **Merge:** script marks `review_status=merged` and links `dup_match` / `result_closure_id`
   - **Need more info:** keep `review_status=pending` (admin may follow up externally)

### 6.2 Headline discovery → candidates → draft submissions
1) Time-triggered Apps Script job fetches RSS feeds (preferred) and identifies items matching closure keywords.
2) New items are appended to `CANDIDATES` with `status=new`.
3) A second job converts selected candidates into `SUBMISSIONS` as `source_type=system_candidate` (draft submissions).
4) Draft submissions default to `needs_review` unless the data is unusually strong.

> MVP note: “web search enrichment” can be manual for now (admin reviews candidate URL and fills missing info before Accept).

---

## 7) Validation Rules (Checklist; no scoring)

### 7.1 Flags (outputs to `validation_flags`)
**Hard reject flags (→ validation_status=reject):**
- `SPAM_GIBBERISH_NAME` (very short name / mostly symbols / repeated characters)
- `SPAM_PROFANITY_OR_ALLEGATION` (profanity, accusations; defamation risk)
- `SPAM_REPEAT_BURST` (identical submissions repeated rapidly)

**Review-required flags (→ validation_status=needs_review):**
- `MISSING_EVIDENCE_URL` (URL blank; allowed but always review)
- `MISSING_AREA_AND_ADDRESS` (both missing)
- `DATES_INCONSISTENT` (last_day < announced_date)
- `POSSIBLE_DUPLICATE` (matches an existing closure record)
- `CLAIM_UNSURE` (submitter unsure)
- `WEAK_DETAILS` (no URL + no dates + no excerpt + no address)

### 7.2 Routing logic
- If any `SPAM_*` flag → `reject`
- Else if any review-required flag → `needs_review`
- Else → `auto_queue` (still requires admin acceptance to publish)

---

## 8) Automation (Google Apps Script)

### 8.1 Required Script Properties (secrets)
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`

### 8.2 Triggers
1) **On form submit** (installable trigger)
   - `onFormSubmit(e)` → validate new submission row

2) **On edit** (installable trigger)
   - `onEdit(e)` → if edit is in column `review_action`, run `handleReviewAction(row)`

3) **Time-driven** (installable trigger)
   - `fetchCandidates()` — every 6–12 hours (RSS-first)
   - `draftSubmissionsFromCandidates()` — every 6–12 hours (optional; can be manual at first)

### 8.3 Function map (foundation)
- `sendTelegram(message: string): void`
- `normalize(text: string): string`
- `buildClosuresIndex(): Set<string>`
- `validateSubmissionRow(rowObj, closuresIndex): { validation_status, flags, possible_duplicate, dup_match? }`
- `acceptSubmission(row: number): void` (append to `CLOSURES`)
- `rejectSubmission(row: number): void`
- `mergeSubmission(row: number): void`
- `fetchCandidates(): void` (RSS fetch + keyword match)
- `draftSubmissionsFromCandidates(): void`

> Implementation detail: ID sequencing can be stored in Script Properties (e.g., `SEQ_C`, `SEQ_S`, `SEQ_H`).

---

## 9) Telegram Notifications

### When to notify
- Immediately on `needs_review` submissions.
- (Optional) daily digest: number of `auto_queue` submissions and new candidates.

### Message template (MVP)
```
🧾 Needs review
Business: {business_name_raw}
Area: {area_raw}
Claim: {closure_claim}
URL: {evidence_url or (none)}
Flags: {validation_flags}
```

---

## 10) Frontend (React; Figma export)

### 10.1 Existing components (from Figma export)
- `Header`
- `HeadlineCounter`
- `RecentClosures`
- `MainTable` (currently sheet iframe)
- `SubmissionCTA` (opens Google Form)
- `EventsAndArticles`
- `Footer`

### 10.2 Data source
The frontend reads from **published** `CLOSURES` (CSV or JSON).

**Preferred MVP:** Publish `CLOSURES` to web as CSV and fetch it client-side (with caching in the browser).

### 10.3 Wiring plan (foundation)
Create a lightweight data layer:
- `src/app/data/closures.ts`
  - `fetchClosures(): Promise<Closure[]>`
  - `getRecentClosures(closures, n=3): Closure[]`
  - `getMonthlyCounts(closures): Record<string, number>` keyed by `YYYY-MM`

Then update components:
- `HeadlineCounter` uses `getMonthlyCounts()` to display counts by selected month/year.
- `RecentClosures` uses `getRecentClosures()`.
- `MainTable`:
  - MVP: keep iframe (lowest effort)
  - v1+: render real table with existing UI components.

### 10.4 Lead magnet (Substack)
Add prominent CTAs:
- Header CTA button → Substack subscribe URL
- Optional mid-page CTA component near `SubmissionCTA`

### 10.5 Configuration (env vars)
Use Vite env vars (no hardcoding):
- `VITE_SUBSTACK_URL`
- `VITE_GOOGLE_FORM_URL`
- `VITE_SHEETS_EMBED_URL` (if keeping iframe)
- `VITE_CLOSURES_CSV_URL` (for data fetch)

---

## 11) Acceptance Criteria (MVP Foundation)

### Data + automation
- Sheets tabs exist with canonical headers.
- New form submissions land in `SUBMISSIONS`.
- Apps Script writes validation outputs:
  - `validation_status`, `validation_flags`, `possible_duplicate`, `review_status=pending`
- If `needs_review`, Telegram notification is sent.
- Admin sets `review_action=Accept` → record is appended to `CLOSURES` with `closure_id`.
- No submission is published without explicit admin accept.

### Frontend
- Homepage renders with live data from `CLOSURES`:
  - HeadlineCounter shows counts for selected month/year
  - RecentClosures shows latest 3 closures
  - MainTable shows closures (iframe OK for MVP)
- Substack CTA is visible and links correctly.
- Submit CTA opens the contribution form.

---

## 12) Risks & Mitigations

- **False reports / defamation risk:** Default “Reported” status; require admin accept; flag allegations for review/reject.
- **Duplicate businesses/outlets:** Duplicate detection uses business+area/address; admin merge workflow.
- **RSS feed changes / missing feeds:** RSS-first; fallback to manual candidate entry until search API is added.
- **Google Apps Script quotas:** Keep fetch frequency modest; cache feed results; only send Telegram on `needs_review`.

---

## 13) Milestones (suggested)

1) **M1 — Sheet + Form + Review pipeline**
   - Headers + form writing to SUBMISSIONS
   - Apps Script validation + review_action handling
   - Telegram alerts

2) **M2 — Frontend reads from CLOSURES**
   - Replace mock data in HeadlineCounter + RecentClosures
   - Add Substack CTA wiring
   - Keep table iframe for speed

3) **M3 — Candidate ingestion (RSS)**
   - Populate CANDIDATES automatically
   - Draft system submissions for admin review

4) **M4 — Table UX upgrade**
   - Replace iframe with real table + filters

---

## 14) Appendix — Closure Keywords (starter)

Use as RSS candidate filter (case-insensitive):
- closing, closure, shutters, shuttered, ceases operations, last day, bid farewell, shutting down, closed permanently
- “will be closing”, “we are closing”, “end of the road”, “thank you for your support”

