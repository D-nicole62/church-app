# TOD Church App — Requirements Gap Analysis & Build Plan

**Live app audited:** https://church-app-ashy.vercel.app/
**Stack:** Next.js
**Source doc:** `TOD_ChurchApplication.xlsx` (Module → Recommendation/Enhancement)
**Audit date:** 2026-08-11

## How to use this file in Cursor

This is a working spec, not marketing copy. Feed it to the agent one **Phase** at a time (see
Section 6). Before starting any phase, tell Cursor to re-read Section 2 ("Guardrails") so it
doesn't touch the public site's existing behavior, routes, styling, or the live Give/Lipila flow.
Each requirement below is tagged with a status and a priority so you can triage what ships first.

Status legend: 🟢 Done · 🟡 Partial (UI exists, no backend/logic) · 🔴 Not started
Priority legend: **P0** blocking/foundational · **P1** high value · **P2** nice-to-have

---

## 1. What the live app actually is today

Everything currently live is the **public-facing marketing/engagement site**. There is
**no admin panel, no authentication, and no database-backed CRUD anywhere** — confirmed by
crawling every nav route:

| Route | What's there now |
|---|---|
| `/` | Static home page: hero, service times, vision, links out to sub-pages. |
| `/about` | Static "who we are" content. |
| `/visit` | **A real form**: first/last name, email, phone, service selection, "coming with kids" + count, "how did you hear about us", free-text note, submit button. This is functionally a lightweight visitor-intake form already. |
| `/events` | Page renders an error: *"We weren't able to load events right now."* This means there's already a fetch call wired to something (an API route or CMS) — it's just returning no data / failing. No admin UI to create events exists anywhere. |
| `/sermons` | Same pattern: *"We couldn't load sermons right now."* Fetch is wired, backend/content is empty. |
| `/groups` | Static list of 8 named ministry clusters (Cell Church, Evangelism & Missions, Church Operations, Spiritual Formation & Discipleship, Community & Engagement, Family Life & Support, Projects & Business Ventures, Care & Counselling) hard-coded in the page. Cell groups section says "announced soon" — no data, no CRUD. |
| `/children` | Static content page. |
| `/missions` | Static content page. |
| `/give` | **The most built-out feature.** Live donation flow via **Lipila** (Mobile Money + Card), with amount, purpose, mobile number, optional email. This is a real payment integration already in production. |
| `/contact` | Static contact details. |

**Conclusion:** the app is a well-built Next.js marketing/engagement front end with one real
transactional feature (Give via Lipila) and one real intake form (Visit). Everything the
spreadsheet asks for — Membership, Attendance, Finance sync to Sage, structured Events/Groups
management, Visitor follow-up tracking — requires a **new authenticated admin application**
plus supporting data models, because none of it exists yet. This matches what you said: the
admin side hasn't been started.

---

## 2. Guardrails — do not break these while building

Tell Cursor explicitly, every session:

- Do not modify the public route structure (`/`, `/about`, `/visit`, `/events`, `/sermons`,
  `/groups`, `/children`, `/missions`, `/give`, `/contact`) or their existing content/styling
  unless a task below says to.
- **Never touch the Lipila Give flow's payment logic** without an explicit task — it's live and
  handling real money.
- The `/visit` form's existing fields and submit behavior must keep working; new Visitor-module
  fields get **added**, not swapped in as a breaking redesign (see Phase 3).
- Any new `/admin` routes must be built as an isolated, authenticated section — it must not be
  reachable without login, and must not appear in the public nav.
- Keep the existing design system (fonts, colors, layout components) — extend it for admin UI,
  don't fork a second design language unless intentionally building the admin UI distinctly
  (recommended: dashboard-style layout, see Phase 1).

---

## 3. Requirements traceability matrix

### Membership module

| # | Requirement | Status | Priority | Notes |
|---|---|---|---|---|
| 1 | Auto-generate unique Membership Number on record creation | 🔴 | P0 | No membership records exist yet — build with the module itself. |
| 2 | Cell Group field populated from active cell groups list, + add/update capability | 🔴 | P1 | Depends on Groups module (Section 3, Groups) existing first. |
| 3 | Ministry Involvement as dropdown from approved ministries | 🔴 | P1 | The 8 ministry clusters on `/groups` are a ready-made seed list. |
| 4 | Family/Household Link, searchable dropdown | 🔴 | P2 | Needs a `Household` entity + search UI (combobox). |
| 5 | Mandatory Campus field | 🔴 | P0 | Campus is referenced by Membership, Visitors, and Attendance — model it once, reuse everywhere. |
| 6 | Region field | 🔴 | P1 | Simple enum/lookup field. |
| 7 | Sync new members to Sage via API | 🔴 | P1 | **Blocked on Sage API credentials/spec from the user.** Build the member-create flow with a sync queue/webhook stub now so integration is a drop-in later. |

### Attendance module

| # | Requirement | Status | Priority | Notes |
|---|---|---|---|---|
| 1 | Record total attendance per service, categorized (men / women / boys / girls) | 🔴 | P1 | Simple count-entry form per service instance. |
| 2 | Cell Group Attendance capture by Cell Group Leaders, predefined form | 🔴 | P2 | **Blocked on the "required data format" the user is sharing separately.** Build the Cell Group entity and a generic attendance-entry form now; finalize fields once the format arrives. |

### Finance module

| # | Requirement | Status | Priority | Notes |
|---|---|---|---|---|
| 1 | Sync tithes/offerings/donations/payments to Sage via API | 🟡 | P0 | The **Give (Lipila)** flow already captures amount, purpose, and payer — it's the natural source of truth. Add a post-payment hook that pushes the transaction to Sage once credentials/API spec are provided. Also needs an admin-recorded path for in-person/cash giving, since not everything goes through Lipila. |

### Events module

| # | Requirement | Status | Priority | Notes |
|---|---|---|---|---|
| 1 | Send reminders to a specific group of people | 🔴 | P1 | Needs Events CRUD (admin) + a notification channel (email/SMS/WhatsApp — decide provider). |
| 2 | Track who will attend an event (RSVP) | 🔴 | P1 | The public `/events` page already has a broken data fetch — this is the natural place to attach RSVP once events have real data. |

### Groups module (new, centralized)

| # | Requirement | Status | Priority | Notes |
|---|---|---|---|---|
| — | Centralized module for Cell Groups, Ministries, Committees, Choirs, Departments, etc. | 🔴 | P0 | The public `/groups` page's 8 clusters become the seed data for "group types" / top-level groups. |
| — | Create/manage group types | 🔴 | P0 | |
| — | Assign one or more leaders per group | 🔴 | P0 | |
| — | Add/remove members from groups | 🔴 | P0 | |
| — | Group-based notifications/announcements/reminders | 🔴 | P1 | Shared notification infrastructure with Events module — build once, reuse. |
| — | Attendance tracking for meetings/events | 🔴 | P1 | Shared with Attendance module. |
| — | Activity logging + activity reports | 🔴 | P2 | **Blocked on sample cell-group reports the user is sharing separately.** Build a generic activity-log entity now; finalize report layout once samples arrive. |
| — | Membership/leadership history | 🔴 | P2 | Requires an audit-log pattern on group membership changes. |
| — | Reports: membership, attendance trends, activity levels | 🔴 | P2 | |

### Visitors module (new)

| # | Requirement | Status | Priority | Notes |
|---|---|---|---|---|
| — | Visitor registration (name, phone, email, gender, DOB, area, campus, invited-by, first visit date, service attended, prayer request, interested ministry) | 🟡 | P0 | The `/visit` public form already captures name, email, phone, service, and a free-text note. **Extend this form** to add: gender, DOB, residential area, campus, invited-by, prayer request, interested ministry — rather than building a separate intake form. |
| — | Follow-up assignment (Pastor/Elder/Deacon/Cell Leader) + interaction logging (call/SMS/WhatsApp/visit/email) with date, officer, outcome, next follow-up date | 🔴 | P0 | Pure admin-side feature — no public-facing equivalent exists. |
| — | Visitor status pipeline (First-Time → ... → Member Registered / No Longer Attending) | 🔴 | P0 | Model as an enum + status-change log for the history trail. |
| — | Automated reminders (follow-up due, not contacted in X days, returned for another service, attended multiple times but no cell group) | 🔴 | P1 | Needs a scheduled job (cron) — depends on notification infra from Events/Groups. |
| — | Visitor analytics (first-timers by service/campus/month, return rate, awaiting follow-up, conversion rate, avg. time-to-member) | 🔴 | P2 | Build after the core Visitor + status data exists — these are just queries/dashboards over it. |
| — | One-click convert Visitor → Member, carrying details over, generating Membership Number | 🔴 | P1 | Needs Membership module built first. |
| — | Integration: Membership, Groups, Attendance, Communications, Pastoral Care | 🔴 | P2 | Falls out naturally once each module shares the same underlying entities (Person, Campus, Group). |

---

## 4. Cross-cutting design decision: one "Person" model

Every module above references the same human being in different roles — a Visitor becomes a
Member, a Member leads a Cell Group, a Member is also counted in Attendance and Finance.
**Do not build separate, disconnected tables per module.** Model once:

- `Person` (name, contact info, campus, region, gender, DOB) — the shared core.
- `Visitor` extends/references `Person` with visitor-specific fields (status, invited-by, etc.).
- `Member` extends/references `Person` with membership-specific fields (membership number,
  cell group, ministry involvement, household link).
- `Household`, `Campus`, `Region`, `Group` (with `type`: cell group / ministry / committee /
  choir / department), `GroupMembership` (person ↔ group, with role: leader/member), `Event`,
  `EventRSVP`, `AttendanceRecord`, `FollowUpInteraction`, `Transaction` (finance).

This is the single most important architectural decision in this project — get it right in
Phase 1 and every later module becomes a thin layer on top of it.

---

## 5. Proposed admin-side architecture

- **Routing:** `/admin/*` as a route group in the Next.js App Router (`app/admin/...`), fully
  separate layout from the public site, gated by middleware.
- **Auth:** Add authentication (e.g. NextAuth.js/Auth.js or Clerk) with roles: `Super Admin`,
  `Campus Admin`, `Finance Officer`, `Cell Group Leader`, `Follow-up Officer`. Route- and
  action-level permission checks, not just hiding UI.
- **Database:** Postgres (Supabase or Neon pair well with Vercel) + Prisma ORM for typed models
  matching Section 4.
- **File/media:** if events/sermons need images or audio, use a storage bucket (Supabase
  Storage or Vercel Blob) rather than committing files to the repo.
- **Server actions / API routes:** prefer Next.js Server Actions for admin CRUD (simpler, typed,
  no separate REST layer needed) and reserve `app/api/*` routes for things external systems call
  into — e.g. the eventual Sage webhook and the Lipila payment callback if not already an API
  route.
- **Sage integration:** build as an isolated `lib/integrations/sage.ts` module with a queue
  table (`SyncQueue`) so member-creation and finance transactions write a "pending sync" row
  immediately, and a background job pushes to Sage once credentials/API spec are available.
  This lets you finish Membership and Finance UI now without being blocked on Sage access.
- **Notifications:** one shared `lib/notifications/` module (email via e.g. Resend, SMS/WhatsApp
  via e.g. Africa's Talking or Twilio) used by Events reminders, Group announcements, and
  Visitor follow-up reminders — build once.
- **Scheduled jobs:** Vercel Cron (or a small queue) for the automated visitor follow-up
  reminders and any recurring digest reports.

---

## 6. Build plan — phases for Cursor

Work top to bottom. Each phase should be a separate Cursor session/PR so the diffs stay
reviewable. Re-paste Section 2 (Guardrails) at the start of every phase.

**Phase 0 — Foundations (P0, do first)**
- Set up Postgres + Prisma, define the `Person`/`Campus`/`Region`/`Household`/`Group`/
  `GroupMembership` core schema from Section 4.
- Add auth + role-based access under `/admin`, with a login page and a protected layout shell
  (sidebar nav, empty dashboard).
- Seed `Campus` and the 8 existing ministry clusters from the live `/groups` page as initial
  `Group` records (type = ministry).

**Phase 1 — Groups module (P0)**
- Admin CRUD for groups (create/edit group, set type, assign leaders, add/remove members).
- Wire the public `/groups` page's "cell groups" section to read from real data instead of the
  static "announced soon" placeholder.

**Phase 2 — Membership module (P0/P1)**
- Member CRUD with auto-generated Membership Number, mandatory Campus, Region, Cell Group
  dropdown (from Phase 1 data), Ministry Involvement dropdown, Household link/search.
- Sage sync stub (`SyncQueue` row on create) — do not attempt live Sage calls until
  credentials/spec are supplied.

**Phase 3 — Visitors module (P0)**
- Extend the existing public `/visit` form with the additional fields from Section 3 (gender,
  DOB, residential area, campus, invited-by, prayer request, interested ministry) — keep all
  existing fields and behavior intact.
- Build admin views: visitor list with status pipeline, follow-up assignment, interaction
  logging, and the one-click "Convert to Member" action (depends on Phase 2).

**Phase 4 — Attendance module (P1)**
- Service-level attendance entry (men/women/boys/girls counts) in admin.
- Cell Group attendance entry form — start generic, refine once the user's data-format spec
  arrives.

**Phase 5 — Events module (P1)**
- Admin CRUD for events; fix the public `/events` page's broken fetch to read real data.
- RSVP capture on the public event page.
- Reminder sending to a selected audience (group, campus, or all).

**Phase 6 — Finance module (P0 for Sage hookup once available)**
- Admin view of all Give/Lipila transactions (should already exist as data — just needs an
  admin UI).
- Manual transaction entry for cash/in-person giving.
- Sage sync stub identical pattern to Membership; go live once API spec arrives.

**Phase 7 — Notifications & reminders (P1)**
- Shared email/SMS module used by Events, Groups, and Visitor follow-up reminders.
- Cron job for the four automated visitor reminder conditions in Section 3.

**Phase 8 — Reporting & analytics (P2)**
- Visitor analytics dashboard (conversion rate, avg. time-to-member, etc.).
- Group membership/attendance/activity reports — finalize once sample cell-group reports
  arrive from the user.

---

## 7. Open items to resolve with the user before/while building

These are explicitly called out in the spreadsheet as "will be shared separately" or otherwise
unspecified — flag them rather than guessing:

1. **Sage API details** — endpoint, auth method, payload schema for both Membership sync and
   Finance sync (spreadsheet says "APIs that will be provided").
2. **Cell Group Attendance data format** — spreadsheet says "required data format will be
   shared separately."
3. **Sample cell-group activity reports** — needed to finalize the Groups reporting UI.
4. **Notification provider preference** — email only, or also SMS/WhatsApp for the Zambian
   context (relevant given Mobile Money is already central to Give).
5. **Admin roles/permissions** — confirm the exact role list and what each role can see/do
   (proposed in Section 5, needs sign-off).

---

## 8. Suggested environment variables (add as each phase needs them)

```
DATABASE_URL=              # Supabase pooled URL (port 6543, ?pgbouncer=true)
DIRECT_URL=                # Supabase session URL (port 5432)
AUTH_SECRET=               # openssl rand -base64 32
AUTH_URL=                  # https://church-app-ashy.vercel.app (production) or http://localhost:3000 (local)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY= # optional; server-side Supabase usage
SAGE_API_BASE_URL=
SAGE_API_KEY=
LIPILA_API_KEY=            # confirm existing var name from current Give integration
EMAIL_PROVIDER_API_KEY=
SMS_PROVIDER_API_KEY=
```
