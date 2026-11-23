# CalmStep agentic development stages

Use this file as the runbook. Each stage has:

1. **Goal** — what must exist when the stage ends.
2. **Course techniques** — COMP3330 chapters to apply and later cite in the report.
3. **Decide first** — human choices. Do not ask the agent to invent these.
4. **Definition of done** — stop condition.
5. **Agent prompt** — paste as-is after filling the `DECIDE:` lines.

Work in `/Users/yerasikmac/Desktop/Courses/Year3/COMP3330/CalmStep` (this folder becomes the repo).

---

## Global rules (prepend to every prompt)

Copy this block above every stage prompt:

```
GLOBAL RULES FOR CALMSTEP
- You are implementing CalmStep for HKU COMP3330. Prefer course techniques over trendy libraries.
- Platform: Expo React Native + TypeScript, **iPhone only**. Do not add an Android app, Android package, emulator target, or APK. Backend: FastAPI + Pydantic. Shared JSON schemas for Profile and Plan.
- Map lecture Android names to iOS in comments and the report (Activity = screen, Fragment = tab/child VC, Intent extras = route params, Service = subscriber clock, SharedPreferences = settings store). Implement with iOS-safe Expo APIs.
- Safety: nicknames only; no diagnosis; no medical advice; Planner must approve before a plan reaches Supported view; Supported person never free-chats with the LLM; do not send profile text to public AI APIs.
- UX (Ch 1): one primary action per screen; Supported mode has no menus; Planner has three tabs Today / Plan / Profile; tap targets at least 56 pt; text at least 16 pt; respect iOS safe area; contrast 4.5:1; Break and Next in the bottom third; no flashing; sound off by default; reduce-motion option. Honour iOS Reduce Motion if you read the system setting.
- Architecture (Ch 14): keep Model / store / View separate. Screens do not talk to the LLM or SQLite directly.
- Concurrency (Ch 8): never block the JS/UI thread with network or LLM waits. Show loading states. Update countdown on the UI thread via a timer, not a tight loop.
- Storage (Ch 13): approved plan and profile cached locally so the Day Strip works offline.
- Markdown and comments: no LaTeX. Plain text only.
- Do not expand scope. Implement only this stage. If a decision is missing, stop and list questions instead of guessing product behaviour.
- After coding: list files changed, how to run, and which course techniques this stage demonstrates.
```

---

## Stage 0 — Freeze product and tech decisions (human, 30–60 min)

**Goal:** One page of locked answers so later agents do not thrash.

**Course techniques:** Ch 2 Inception (actors, use cases, competitive advantage, form/mobility, scope).

### Decide first

- [ ] Group number, member names, UIDs, who owns mobile / backend / content.
- [ ] Keep Expo + iPhone (locked). Do not build native Android.
- [ ] LLM path for this week: Ollama on the Mac, or a GPU VM, or recorded JSON fixtures only.
- [ ] Pictogram set and licence (ARASAAC vs custom vs emoji fallback for demo).
- [ ] Languages in UI: English only for demo, or English + Chinese strings.
- [ ] Demo device: which iPhone model/iOS version. Simulator is layout-only backup.
- [ ] Apple ID / Expo Go vs Xcode development build (needed if camera/mic/LAN HTTP is blocked in Expo Go).
- [ ] FastAPI reachability: Mac and iPhone on the same Wi-Fi; LAN IP or Cloudflare Tunnel. `localhost` on the phone will not hit the Mac.
- [ ] PIN fallback instead of QR if camera permission is awkward on demo day.

### Definition of done

A short `docs/DECISIONS.md` exists with the answers above. No code required.

**Status (18 Nov 2026):** done. See `docs/DECISIONS.md`. Group 22, Expo iOS, EN+RU, iPhone 12 + iPad Air, LAN, QR+PIN.

### Agent prompt

```
GLOBAL RULES FOR CALMSTEP
(paste global rules)

STAGE 0
Create docs/DECISIONS.md that records the following locked decisions. Do not invent team facts.

DECIDE: group_number =
DECIDE: members = (name, UID, module)
DECIDE: client = expo-iphone
DECIDE: llm_this_week = ollama | gpu-vllm | fixtures-only
DECIDE: pictograms = ...
DECIDE: ui_language = ...
DECIDE: demo_device = iPhone model and iOS version
DECIDE: install_path = expo-go | xcode-dev-build
DECIDE: api_reachability = lan | tunnel
DECIDE: linking = qr+pin | pin-only

Also write:
- actors and use cases (Ch 2): Planner, Supported, Adult-self
- out of scope list
- MVP feature IDs F1–F8
- demo-day failure plan (cached plan, no live LLM)

Do not scaffold the app yet.
```

---

## Stage 1 — Repository skeleton and IDE project (Ch 3)

**Goal:** Empty but runnable Expo app and FastAPI hello-world in the layout from the README.

**Course techniques:** Ch 3 IDEs (Xcode / Expo); Ch 2 Development phase (working prototype early); Ch 5 typed language (TypeScript analog of Kotlin null-safety: no implicit `any`).

### Decide first

- [ ] Expo SDK version (use current default unless you already standardised).
- [ ] Node package manager: npm or pnpm.
- [ ] App display name and iOS bundle identifier, e.g. `hk.hkucs.calmstep`.

### Definition of done

`npx expo start` opens a blank CalmStep screen in **Expo Go on an iPhone** (or the iOS Simulator for layout only). `uvicorn` returns `{"ok": true}`. `.env.example` lists `API_BASE_URL`, `LLM_BASE_URL`, `LLM_API_KEY`, `LLM_MODEL`. No Android project is created as a deliverable.

**Status (18 Nov 2026):** done. Expo SDK 58 TypeScript app (`hk.hkucs.calmstep`), FastAPI `GET /health`.

### Agent prompt

```
GLOBAL RULES FOR CALMSTEP
(paste global rules)

STAGE 1 — skeleton (iPhone)
DECIDE: bundle_id = hk.hkucs.calmstep
DECIDE: package_manager = npm
DECIDE: expo_sdk = default current

Create the repo layout:
  apps/mobile/     Expo TypeScript app, app.json name CalmStep, ios.bundleIdentifier DECIDE bundle_id. Do not configure an Android applicationId as a demo target.
  backend/         FastAPI app with GET /health -> {"ok": true}
  packages/shared/ empty folder with a README that says schemas come in Stage 3
  .env.example
  docker-compose.yml stub that only comments how vLLM would run on a GPU host (do not require GPU to start the app)

Mobile: one screen "CalmStep" with a subtitle "Stage 1 skeleton". TypeScript strict true.
Use Expo iOS: `npx expo start` and open on iPhone via Expo Go. Document that the phone and Mac must share Wi-Fi.
In app.json / app.config: ios.infoPlist placeholders for later NSCameraUsageDescription, NSMicrophoneUsageDescription, NSLocalNetworkUsageDescription. Safe-area aware root view.
Backend: Python 3.12-compatible, requirements.txt, README run instructions.
Update the root README "Run" section with exact iPhone commands.
Do not add navigation, AI, or storage yet. Do not generate or document an Android APK.
```

---

## Stage 2 — Information architecture as activities and fragments (Ch 6)

**Goal:** Screen graph that matches lecture Activity / Fragment thinking, implemented as iOS navigation stacks.

**Course techniques:** Ch 6 Activity (a foreground page) maps to an Expo Router screen / UIViewController. Fragment maps to a child pane (Planner tabs). Explicit Intent + extras maps to typed routes with params. Implicit Intent (open Camera) comes later. Ch 1: iOS has no hardware Back button, so use a Navigation Controller-style stack and swipe-back.

Map:

| Course idea | iOS / CalmStep |
|---|---|
| Launcher Activity | RoleGate (root screen) |
| Explicit Intent + extras | `router.push({ pathname, params })` |
| Fragment in an Activity | Planner tabs: Today, Plan, Profile |
| iOS Navigation Controller (Ch 1) | Supported stack with swipe-back |
| No UI Service | later clock; not this stage |

Screens to create as placeholders:

- RoleGate
- PlannerToday, PlannerPlan, PlannerProfile
- Interview
- PlanReview
- SupportedDay
- Break
- LinkDevice (QR or PIN)

### Decide first

- [ ] Adult-self: one account with a mode toggle, or two roles on one login.
- [ ] After approval, does the Planner stay on PlanReview or jump to Today?

### Definition of done

You can tap through every screen with dummy titles. Supported stack has no tab bar. iOS swipe-back and the header Back control behave predictably. Safe area (notch / Dynamic Island / home indicator) is respected. Deep link `/supported/day` opens SupportedDay.

**Status (22 Nov 2026):** done. Expo Router stacks/tabs. Adult-self = toggle on same account. After approve = go Today.

### Agent prompt

```
GLOBAL RULES FOR CALMSTEP
(paste global rules)

STAGE 2 — navigation as Activity/Fragment (Ch 6)
DECIDE: adult_self_mode = toggle-on-same-account | separate-role-login
DECIDE: after_approve = stay-plan-review | go-today

Use Expo Router. Treat each route as a screen (Activity analog). Planner tabs are child VCs (Fragment analog) inside the Planner stack. Supported flow is a Navigation Controller-style stack with iOS swipe-back. There is no hardware Back button.

Implement placeholder screens listed in AGENT_STAGES.md Stage 2. Each screen shows its name and one primary button to the next happy-path screen. Use SafeAreaView.

Happy path for demo rehearsal:
RoleGate -> Interview -> PlannerProfile -> PlannerPlan -> PlanReview -> PlannerToday -> SupportedDay -> Break -> back to SupportedDay.

Supported routes must not show Planner tabs.
Pass at least one extra (e.g. role=planner) as route params to mimic Intent extras.
Do not persist data. Do not call the network.
```

---

## Stage 3 — Layout system and UX constraints (Ch 1, Ch 4)

**Goal:** Visual language that you can reuse on every real screen.

**Course techniques:** Ch 1 one-thumb reach, finger-friendly 7–10 mm, legible type, visible contrast, minimise typing. Ch 4 View / ViewGroup: column = vertical LinearLayout, row = horizontal LinearLayout, overlay = Frame/Constraint analog.

### Decide first

- [ ] Colour palette (muted, high contrast; hex values).
- [ ] Font scale: default 16 / 20 / 28 sp equivalents.
- [ ] Reduce-motion default: on or off.

### Definition of done

A `theme.ts` and a few layout primitives exist. RoleGate, SupportedDay placeholder, and Break placeholder use them. Break button is in the bottom third and at least 56 pt tall (safe area above the home indicator). No dense menus on Supported screens.

**Status (22 Nov 2026):** done. Palette in `src/ui/theme.ts`. Reduce motion default on. No animation.

### Agent prompt

```
GLOBAL RULES FOR CALMSTEP
(paste global rules)

STAGE 3 — layout and UX (Ch 1, Ch 4)
DECIDE: colors = { bg, surface, text, accent, danger, track, marker }
DECIDE: reduce_motion_default = on | off

Create apps/mobile/src/ui/theme.ts and primitives:
- Screen (full-bleed column, padding)
- Row / Column (LinearLayout analog)
- PrimaryButton (minHeight 56)
- Pictogram (square Image, later wired)
- TimelineTrack (empty bar)

Restyle RoleGate, SupportedDay placeholder, Break placeholder with these primitives.
SupportedDay: NOW card on top, empty track in the middle, Break button bottom third.
No hamburger menu. No more than one primary action on Supported screens.
Add a comment at the top of theme.ts mapping each primitive to Ch 4 (View, LinearLayout, Constraint analog).
Do not implement animation yet (that is Stage 7).
```

---

## Stage 4 — Models, MVVM stores, local storage (Ch 13, Ch 14)

**Goal:** Profile Card and Day Plan as data, saved on device.

**Course techniques:** Ch 14 MVC/MVVM: Model = types + validator-free entities; ViewModel/store = load/save; View = screens. Ch 13 SharedPreferences analog (settings), SQLite (structured plan/profile), not Intents for large payloads.

Use the schemas from the proposal:

Profile: `display_name`, `answered_by` (`guardian` | `self`), `age_band`, `communication[]`, `sensory_triggers[]`, `overload_signs[]`, `coping_strategies[]`, `transition_warnings_min[]`, `motivators[]`, `must_stay_fixed[]`.

Plan: `date`, `items[]` with `start`, `end`, `title`, `icon_id`, `load`; `supports[]` with `type`, `after_item`, `reason`.

### Decide first

- [ ] SQLite library: `expo-sqlite` (preferred) vs AsyncStorage-only (weaker Ch 13 story).
- [ ] Clock: device local timezone, no conversion.

### Definition of done

Seed a sample profile and a sample approved plan. Kill the app, reopen, PlannerProfile and SupportedDay still show the seed. Settings (role, reduce-motion, sound) persist like SharedPreferences.

**Status (22 Nov 2026):** done. expo-sqlite, stores, seed Kit + Monday plan. No FastAPI.

### Agent prompt

```
GLOBAL RULES FOR CALMSTEP
(paste global rules)

STAGE 4 — storage and MVVM (Ch 13, Ch 14)
DECIDE: sqlite = expo-sqlite
DECIDE: timezone = device-local

In packages/shared, define TypeScript types for Profile and DayPlan matching AGENT_STAGES Stage 4 field lists. Export the same shapes as JSON Schema files.

In mobile:
- sqlite tables: profiles, plans, settings
- settings key-value: active_role, reduce_motion, sound_enabled, linked_token (SharedPreferences analog)
- stores: profileStore, planStore, settingsStore
- seed one child-like nickname profile and one Monday plan with 6 items and 1 break support

Wire PlannerProfile to load/edit/save profile (local only).
Wire SupportedDay to read the latest approved plan (still static cards, no motion).
Screens must not contain SQL.
Do not call FastAPI yet.
```

---

## Stage 5 — FastAPI server connection (Ch 9)

**Goal:** Phone talks to your backend over HTTP JSON. LLM can still be a stub.

**Course techniques:** Ch 9 typical flow: app HTTP request → server program → database/file → JSON response → UI update. GET vs POST. Timeouts. Check connectivity before fetch. Do work off the UI thread (async). iOS has no INTERNET manifest permission; instead document Local Network usage, ATS, and why the iPhone uses the Mac LAN IP.

Endpoints (minimum):

- `GET /health`
- `POST /interview/turn` (stub: echo next question from a script)
- `POST /plans/generate` (stub: ignore LLM, return fixture plan JSON)
- `POST /plans/validate`
- `POST /plans/{id}/approve`

### Decide first

- [ ] Auth for demo: none on LAN, or a static `X-Demo-Token`.
- [ ] How the phone reaches the API on a real device (LAN IP of the Mac, not `localhost`).

### Definition of done

From the **physical iPhone** (not only Simulator), Plan screen can hit `/health` and `/plans/generate` (stub) and show JSON. Failures show a calm error, not a crash. Timeouts are finite.

**Status (22 Nov 2026):** done. FastAPI stubs + 10s apiClient. Auth none. Base `http://172.20.10.4:8081`. See `docs/IOS_NETWORKING.md`.

### Agent prompt

```
GLOBAL RULES FOR CALMSTEP
(paste global rules)

STAGE 5 — server connection (Ch 9)
DECIDE: auth_header = none | X-Demo-Token: ...
DECIDE: default_api_base = (LAN URL the iPhone can reach, e.g. http://192.168.x.x:8080)

Implement FastAPI endpoints listed in Stage 5. Validate bodies with Pydantic models copied from packages/shared JSON Schema.

`POST /plans/validate` implements the Stage 6 rules even if generate is still a fixture.
`POST /plans/{id}/approve` writes approved=true so mobile can cache.

Mobile apiClient:
- base URL from extra/config
- GET/POST JSON
- 10s timeout
- never parse on assumption of success
- on failure, keep last cached approved plan

Add a tiny "Server" status chip on PlannerToday (connected / offline).
Do not call a real LLM yet; generate returns a fixture that still passes validate.
Document iOS networking for the report (Ch 9 analog): NSLocalNetworkUsageDescription, App Transport Security exception for LAN HTTP if used, and that `localhost` on the phone is not the Mac. Do not mention Android INTERNET permission as something we implemented.
```

---

## Stage 6 — AI interview, plan generation, code checks

**Goal:** The COMP3330 “AI technique”: LLM proposes, code checks, human approves.

**Course techniques:** Ch 9 POST with body; Ch 8 do not block UI; Ch 14 business rules live in Model/validator, not in the View. Peer-notes topic begins here.

Validator rules (reject and retry max 2, then fixture/template):

1. No overlapping items; all inside waking hours 06:00–22:00 unless `must_stay_fixed` says otherwise.
2. Every `icon_id` exists in the closed icon list.
3. Every `must_stay_fixed` entry is present at the stated time.
4. After any `load=high` item, at least 10 minutes buffer or an explicit break support.
5. At most 2 consecutive high-load items.
6. At most 8 items (Day Strip must fit).

### Decide first

- [ ] LLM provider this week: Ollama OpenAI-compatible `/v1` or fixtures if Ollama is not installed.
- [ ] Model name.
- [ ] Interview max questions: 10.

### Definition of done

Planner can finish a scripted interview and see a Profile Card. Planner types “school 8–3, dentist 16:00, swimming” and gets a plan, validator output, and Approve. Invalid model output is retried then replaced by a template. Supported view still only updates after Approve.

**Status (22 Nov 2026):** done. Ollama `/v1` + fixtures fallback. Interview max 10. Validator retries then template. Planner Approve writes SQLite.

### Agent prompt

```
GLOBAL RULES FOR CALMSTEP
(paste global rules)

STAGE 6 — AI proposes, code checks, human approves
DECIDE: llm_base_url =
DECIDE: llm_model =
DECIDE: llm_api_key =
DECIDE: if_llm_down = fixtures

Backend:
- llm_client using OpenAI-compatible chat.completions
- request json_schema / response_format when the server supports it; always Pydantic-validate afterwards
- interview: one question at a time, max 10, then emit Profile JSON. System prompt: short literal sentences; no medical advice; no diagnosis; questions about sensory load, early signs, coping, transitions, motivators, must-stay-fixed only
- generate: input = {profile, day_text, icon_catalog}; output = DayPlan JSON; icons only from catalog
- validate: rules 1–6 in AGENT_STAGES Stage 6; return {ok, violations[]}
- retry generate at most twice on violations, then return a deterministic template plan plus violations noted for the Planner

Mobile:
- Interview screen talks only to interview API via a store
- Plan screen: text box, Generate, show items + one-line reason for each support, Validate badges, Approve button
- Approve writes SQLite approved plan (F8)

Include a closed icon catalog JSON (id, label, asset name). Placeholder PNGs are OK.
Write backend/PROMPTING.md with the system prompts (needed for peer notes).
```

---

## Stage 7 — Day Strip graphics and animation (Ch 10)

**Goal:** The Supported “wow” screen.

**Course techniques:** Ch 10 ImageView analog (pictogram PNG), moving an image, simple animation, touch. Ch 8 countdown must hop to the UI thread (React state / Reanimated, not a background thread mutating views). Ch 1 reduce-motion: if on, jump the marker once per minute instead of sliding.

### Decide first

- [ ] Motion library: `react-native-reanimated` (preferred) vs `Animated`.
- [ ] Marker means “now” from device clock, not a fake demo clock — unless you add a hidden debug clock for rehearsal.

### Definition of done

Six pictograms sit on a track. A marker sits at “now”. Current card title, until-time, and remaining minutes update. Reduce-motion works. App idle for a few minutes still tracks time without jank.

**Status (22 Nov 2026):** done. Reanimated marker. Device clock only (`debug_clock = none`). Reduce motion snaps each minute.

### Agent prompt

```
GLOBAL RULES FOR CALMSTEP
(paste global rules)

STAGE 7 — Day Strip (Ch 10 graphics, Ch 8 timer)
DECIDE: animation = reanimated
DECIDE: debug_clock = hidden-triple-tap-on-time | none

Implement SupportedDay for real:
- NOW card: large pictogram (Image), title, until time, remaining minutes
- Track: items as a horizontal strip of Image pictograms with start times
- Marker "you are here" positioned by (now - startOfDay) / wakingWindow
- If settings.reduce_motion: snap marker on a 60s cadence, no continuous interpolation
- Else: smooth interpolate, 60 fps cap, no flashing
- Use approved plan from SQLite; if empty, show a calm empty state, not a crash

Countdown: update once per second via an interval that only setStates; clear interval on unmount (lifecycle analog of onPause/onDestroy).
Do not add sound in this stage.
```

---

## Stage 8 — Break flow, haptics, multimedia (Ch 11)

**Goal:** F6 plus optional quiet audio/haptic feedback.

**Course techniques:** Ch 11 MediaPlayer analog for a short cue (`expo-av`); SoundPool analog = short ogg/mp3 under 1 MB. Default sound off. Ch 1 no surprise audio. Haptics as extra phone feature.

### Decide first

- [ ] Break steps: from profile `coping_strategies` only, or add a default three-step fallback.
- [ ] Sound files: silence for demo vs one soft chime.

### Definition of done

Break button opens coping steps for *this* profile. Done returns to Day Strip. Sound respects settings. Haptic on break, skipped if reduce-motion or if you decide haptics off.

**Status (22 Nov 2026):** done. Profile coping steps + default fallback. Haptic on open (skipped if reduce motion). Chime none. Today remembers break used in RAM only.

### Agent prompt

```
GLOBAL RULES FOR CALMSTEP
(paste global rules)

STAGE 8 — break, haptics, multimedia (Ch 11)
DECIDE: default_coping = ["deep breaths", "quiet corner", "drink water"]
DECIDE: chime = none | bundled-ogg
DECIDE: haptic_on_break = true

Break screen:
- title "I need a break"
- list coping_strategies from the cached profile; if empty use default_coping
- each step has icon_id if present
- one Done button bottom third
- no AI chat

On opening Break:
- if sound_enabled and chime bundled, play once with expo-av (MediaPlayer analog); never loop
- if haptic_on_break, one light impact

PlannerToday may later show "break used" in memory only; do not build weekly summary (N3).
```

---

## Stage 9 — Roles, camera QR, offline (F1, F8)

**Goal:** Two devices or two roles on one device.

**Course techniques:** Ch 12 camera as a mobility feature (Ch 2 form/mobility). Ch 6 implicit Intent analog: “scan a QR”. Ch 13 cache. Ch 16: linking token is a secret; do not log it.

### Decide first

- [ ] Same-phone demo: role switch with PIN is mandatory even if QR works.
- [ ] QR payload: signed one-time token from FastAPI, TTL 10 minutes.

### Definition of done

Planner shows a QR (or 6-digit PIN). Supported role enters PIN or scans. After that, SupportedDay loads that profile’s approved plan offline. Turning on airplane mode still shows the plan.

**Status (22 Nov 2026):** done. PIN 6 + QR 10 min. expo-camera. PIN works if camera denied. Accept caches profile+plan.

### Agent prompt

```
GLOBAL RULES FOR CALMSTEP
(paste global rules)

STAGE 9 — linking and offline (camera + Ch 13)
DECIDE: pin_length = 6
DECIDE: qr_ttl_minutes = 10
DECIDE: camera_lib = expo-camera

Backend: POST /link/start -> {pin, qr_payload, expires_at}; POST /link/accept -> {profile_id, plan if approved}.

Mobile:
- Planner Profile/Today: show PIN and QR
- Supported LinkDevice: camera scan OR PIN field (large targets)
- Set NSCameraUsageDescription in app.json (iOS will reject camera without it)
- On success, save profile+approved plan into SQLite and settings.linked_token
- If camera permission denied, PIN path still works (demo-safe on iPhone)
- Airplane-mode test path: SupportedDay reads SQLite only

Do not add location APIs. Out of scope.
```

---

## Stage 10 — Service-like clock and process hygiene (Ch 7, Ch 2 lifecycle)

**Goal:** Timekeeping that survives leaving the screen, without a forever-on background daemon (iOS will suspend the app).

**Course techniques:** Ch 7 started vs bound service analog: a clock module screens subscribe to (bound), stops if no screen needs it. Do not use an Android wake lock and do not fight iOS suspension. Ch 2 lifecycle: subscribe on focus, unsubscribe on blur. Ch 8: do not do LLM work in a fake background service. Optional: UNUserNotificationCenter analog via `expo-notifications`.

### Decide first

- [ ] Optional local notification 5 minutes before next item: yes for demo or skip.

### Definition of done

Leaving SupportedDay and returning does not duplicate intervals. Marker is correct. Optional notification only if decided yes, and it uses the approved plan, sound off by default.

**Status (22 Nov 2026):** done. Bound clockService, one interval, focus/blur. `lead_notification = false`. No wake lock.

### Agent prompt

```
GLOBAL RULES FOR CALMSTEP
(paste global rules)

STAGE 10 — lifecycle and clock module (Ch 7, Ch 8)
DECIDE: lead_notification = false | true

Create a clockService module:
- subscribers (bound-service analog)
- screens register on focus, unregister on blur
- single interval owner
- computes now, current item, remaining seconds

Hook SupportedDay and PlannerToday.
If lead_notification is true, schedule one local notification for the next transition using profile.transition_warnings_min[0] if present; honour sound_enabled=false.

Do not try to keep the iPhone awake. Do not keep running LLM jobs in background.
Document in a short comment how this maps to started/bound services (lecture) vs iOS app suspension (what we actually ship).
```

---

## Stage 11 — Optional phone sensors (Ch 12) — only if F1–F8 are solid

**Goal:** N2 noise-level offer-a-break, or skip.

**Course techniques:** Ch 12 sensors are weak or missing in Simulator; register on resume, unregister on pause; check availability; power. Microphone for relative loudness **without storing audio**. Request NSMicrophoneUsageDescription. Location remains out of scope.

### Decide first

- [ ] Build N2 or skip.
- [ ] Threshold source: profile trigger `noise` severity vs a single constant.

### Definition of done if building N2

On a real iPhone, loud sound offers Break. No wav/pcm saved. PlannerToday can show last offer time in memory. Simulator path disabled with a message.

**Status (22 Nov 2026):** skipped. `enable_n2 = false`. See `docs/N2_SKIPPED.md`.

### Agent prompt

```
GLOBAL RULES FOR CALMSTEP
(paste global rules)

STAGE 11 — optional microphone loudness (Ch 12)
DECIDE: enable_n2 = true | false
If enable_n2 is false, write docs/N2_SKIPPED.md with why, and stop.

If true:
- use expo-av metering or equivalent
- register in SupportedDay on focus, unregister on blur (Ch 12 onResume/onPause)
- compare to profile noise threshold; debounce 10s
- never write audio to disk
- if over threshold, offer Break screen; do not auto-navigate without a confirm dialog (Planner-approved behaviour: offer, do not force)
- skip entirely if reduce_motion and you decide it is too stimulating: DECIDE: skip_if_reduce_motion = true
```

---

## Stage 12 — Testing and evaluation (Ch 15)

**Goal:** Evidence for the report, not a huge test suite.

**Course techniques:** Ch 15 functional / IO tests, UAT, smoke, regression, compatibility (iPhone + Simulator), crash rate, API latency for AI, battery note. UI Exerciser Monkey is Android-only; on iOS use a written tap script plus validator unit tests.

### Decide first

- [ ] Who are the adult UAT volunteers (no children).
- [ ] Metrics to quote: time-to-plan by hand vs AI; % AI items edited; validator pass rate before/after retry.

### Definition of done

`backend` has pytest IO tests for validator (overlap, bad icon, missing fixed routine, too many items). Mobile has a `docs/TEST_SCRIPT.md` smoke path matching the 5-minute demo. You ran it once on the demo phone.

**Status (22 Nov 2026):** done. pytest 8 passed on `/plans/validate` rules 1–6. `docs/TEST_SCRIPT.md`. UAT = scripted only. Smoke on the physical iPhone still to tick in that file.

### Agent prompt

```
GLOBAL RULES FOR CALMSTEP
(paste global rules)

STAGE 12 — testing (Ch 15)
DECIDE: uat_people = adult volunteers names or "scripted only"

Add pytest tests for /plans/validate covering violations 1–6.
Add a fixture plan that passes.
Add docs/TEST_SCRIPT.md:
- smoke (Ch 15): install, open, generate, approve, day strip, break, airplane mode
- IO table: input day_text -> expected items count
- UAT script: 10 minutes, no children, consent line
- compatibility: iOS Simulator (layout only) + named physical iPhone
- non-functional notes to fill: load time, AI latency, crash yes/no
- security notes (not a pentest): no public LLM, no diagnosis field, token not logged

Do not add new features.
```

---

## Stage 13 — iPhone install and signing notes (Ch 2, Ch 16)

**Goal:** Teaching staff can run the app on an iPhone you bring, or follow Expo Go steps. You can explain signing without App Store submission.

**Course techniques:** Ch 2 iOS distribution: Ad-Hoc (Xcode to a provisioned device), In-House, App Store. We use **development / Ad-Hoc**, not the App Store. Ch 16 signing analog: Apple signs with your development certificate and provisioning profile (public/private key pair). Provide install steps.

### Decide first

- [ ] Expo Go on your Apple ID, or an Xcode development build on a registered iPhone.
- [ ] Bundle id final.

### Definition of done

`docs/INSTALL.md` with: Mac + iPhone same Wi-Fi, Expo Go QR (or Xcode Run), FastAPI LAN URL, ATS/LAN notes, backend start, backup screen recording if live LLM dies. No Android APK instructions.

**Status (22 Nov 2026):** done. `docs/INSTALL.md`. Build = Expo Go. Bundle id `hk.hkucs.calmstep`.

### Agent prompt

```
GLOBAL RULES FOR CALMSTEP
(paste global rules)

STAGE 13 — iPhone install notes (Ch 2, Ch 16)
DECIDE: build = expo-go | xcode-dev
DECIDE: bundle_id = hk.hkucs.calmstep

Produce docs/INSTALL.md:
- Expo Go: install from App Store, same Wi-Fi, npx expo start, scan QR
- If build is xcode-dev: open ios in Xcode, select the physical iPhone, development team, Run (Ad-Hoc/development analog from Ch 2)
- Info.plist usage strings actually used (camera, mic, local network)
- that iOS apps are signed with a development certificate; App Store is not required for COMP3330
- how to set API_BASE_URL to the Mac LAN IP (never localhost on device)
- ATS exception if HTTP is used on LAN
- offline fallback

Update README run steps to iPhone only. Do not document Play Store, APK, or Android Studio.
```

---

## Stage 14 — Trailer, report, peer notes (assessment wrap)

**Goal:** The non-code 25% (trailer 10 + report 10 + notes 10) plus demo script (5).

**Course techniques:** Ch 2 deployment/stabilisation; CLO 4 writing and presentation; CLO 5 peer teaching of one AI usage.

### Decide first

- [ ] Trailer voiceover language.
- [ ] Peer notes format: Word ~10 pages vs PPT ~20.
- [ ] Three original contribution bullets for the report.

### Definition of done

`docs/DEMO_SCRIPT.md` (5:00). `docs/TRAILER_SCRIPT.md` (1:00, required title cards). `docs/REPORT_OUTLINE.md` matching the official 15-page list. `docs/PEER_NOTES_OUTLINE.md` for vLLM/Ollama structured JSON.

### Agent prompt

```
GLOBAL RULES FOR CALMSTEP
(paste global rules)

STAGE 14 — assessment documents, not features
DECIDE: trailer_language = English
DECIDE: peer_format = ppt | docx
DECIDE: three_bullets =
  1. ...
  2. ...
  3. ...

Write:
docs/DEMO_SCRIPT.md — 5 minutes: idea 60s, generate+approve 90s, Day Strip 90s, break+offline 60s, buffer.
docs/TRAILER_SCRIPT.md — 60 seconds, Windows-Media-Player-safe content list: app title, group number, names, key idea, key screens, how to use. No copyrighted music.
docs/REPORT_OUTLINE.md — sections exactly from the assessment instructions (title, group, 3 bullets, idea source, how to use, key screens, key features/technical contributions including AI and phone features, future plan, testing and issues, limitations, self-learned tech). Leave placeholders for screenshots.
docs/PEER_NOTES_OUTLINE.md — junior-friendly tutorial: what an LLM server is, Ollama vs vLLM, OpenAI-compatible API, JSON schema, why the validator exists, what not to send to public APIs. Do not paste vendor docs.

Do not change app code except README links to these docs.
```

---

## Suggested Cursor workflow

1. One chat per stage. Do not continue a messy chat into the next stage.
2. After each stage: run the app, then commit (only when you ask the agent to commit).
3. If the agent drifts (extra screens, extra AI features), stop and paste: “Revert scope to this stage’s definition of done.”
4. Keep lecture PDFs closed unless a prompt asks to map a chapter; the mapping is already in this file so the report can cite Chapter numbers.
5. Before the demo, rehearse once on the physical iPhone with the LLM off to prove F8. Rehearse screen-mirroring the iPhone to the laptop for Zoom.

## Order if you are behind

Must ship: Stages 0–8, 12 (script only), 13, 14.  
Compress: Stage 9 PIN-only. Skip 11. Stage 10 only if the timer leaks.  
Never skip: validator, Planner approval, Day Strip, Break, offline cache.
