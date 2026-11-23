# CalmStep

An AI-assisted visual day planner for COMP3330 (2026–2027). A Planner builds a personalised day. A Supported person follows it on one calm timeline screen.

Use `AGENT_STAGES.md` to build the remaining stages one at a time. Stage 1 skeleton is in `apps/mobile` and `backend`.

**Tagline:** A planner builds the day. The supported person follows it on a simple moving timeline.

**Course:** COMP3330 Interactive Mobile Application Design and Programming  
**Demo target:** iPhone (one platform is enough; no Android build)  
**Final freeze:** 4 Dec 2026 23:59  
**Demo window:** 23 / 26 / 30 Nov 2026

---

## Why this app

People who need predictability (including many autistic users) rely on visual schedules. Existing apps such as Kids ToDo List make the caregiver drag every card by hand. CalmStep:

1. Interviews once and stores a **Profile Card** (triggers, coping steps, fixed routines).
2. Turns a short day description into a **checked plan** the Planner must approve.
3. Shows the Supported person a **Day Strip**: large pictograms, a “you are here” marker, a countdown, and one **I need a break** button.

Not diagnosis, not therapy, not live location tracking.

---

## Grading map (50% project)

From `COMP3330_Project.pdf` and the assessment instructions:

| Deliverable | Weight | What “good” looks like here |
|---|---|---|
| App proposal (already written) | 10% | Scope, similar apps, methods, tools, timeline |
| Presentation and demo | 5% | Key functions on a laptop screen share; 5 minutes |
| App trailer | 10% | 1 minute, plays in Windows Media Player; title, group, idea, screens, how-to |
| Workable app + source | 5% | Runnable on iPhone (Expo Go or Xcode); README with run steps |
| Report (max 15 A4 pages) | 10% | 3 original bullets; screens; techniques; tests; limits; self-learned tech |
| Peer learning notes | 10% | One AI usage taught to juniors; ~10 pages Word or ~20 slides |

The project is also judged on **innovation**, **techniques applied** (phone features, audio/visual, AI, effects), and **user experience**. Grade descriptors reward skillful use of course concepts, not a polished commercial product.

---

## Stack (locked unless you change it in Stage 0)

| Layer | Choice | Course chapter it demonstrates (iOS equivalent) |
|---|---|---|
| Client | Expo + React Native + TypeScript on iPhone; Xcode when a native build is needed | Ch 3 IDEs (Xcode); Ch 5 typed syntax analog |
| Navigation | Expo Router stacks/tabs = iOS Navigation Controller + child VCs | Ch 1 iOS has no hardware Back, so a stack; Ch 6 Activity/Fragment analog |
| UI | Flex layouts, 56 pt targets, high contrast, safe area + home indicator | Ch 1 UX; Ch 4 Layout |
| Local data | SQLite for plans/profile; key-value for settings | Ch 13 Data Storage |
| Architecture | MVVM-style: models, stores, screens | Ch 14 Design Pattern |
| Network | HTTP(S) JSON to FastAPI; Local Network permission on iOS | Ch 9 Server Connection |
| AI | Self-hosted LLM (Ollama local, vLLM on GPU for demo) | Project “AI technique” + peer notes |
| Clock / reminders | Background-safe interval; do not block UI thread | Ch 7 Service analog (no wake lock on iOS) |
| Graphics | Pictogram `Image`; Reanimated Day Strip | Ch 10 Graphics |
| Multimedia | Optional short cue sounds via `expo-av`; sound off by default | Ch 11 Multimedia |
| Camera | QR device linking; Camera + Photo usage strings | Ch 12 camera as a phone feature |
| Sensors | Optional mic loudness (N2), no recording stored | Ch 12 Sensor |
| Test | Unit tests on validator; scripted UAT on a real iPhone | Ch 15 Testing |
| Ship | Development-signed iOS app (Expo Go or Xcode ad-hoc); not App Store | Ch 2 iOS distribution; Ch 16 signing analog |

The course lectures use Android examples. COMP3330 still allows Xcode / React Native, and only one platform is required. This repo **does not ship an Android variant**. In the report, name the iOS API or Expo module next to the lecture idea (for example: Activity → screen, Service → subscriber clock, SharedPreferences → AsyncStorage/SQLite settings).

---

## Intended repo layout (after Stage 1)

```
CalmStep/
  README.md
  AGENT_STAGES.md
  apps/mobile/          Expo app
  backend/              FastAPI
  packages/shared/      Profile + Plan TypeScript/JSON Schema
  docs/                 Report, trailer script, peer notes (later)
  docker-compose.yml    GPU host only
  .env.example
```

---

## Must-have features (demo these)

| ID | Feature |
|---|---|
| F1 | Planner / Supported roles; QR linking (PIN fallback) |
| F2 | AI onboarding interview → Profile Card JSON |
| F3 | Profile review and edit |
| F4 | AI day plan + code validator + Planner approval |
| F5 | Day Strip timeline with current-activity card |
| F6 | I need a break + personal coping steps |
| F7 | Closed pictogram set |
| F8 | Offline copy of the approved plan |

Cut first if time runs out: N4 photo-to-icon, N5 voice, N3 weekly summary, N1 social stories, then N2 noise. If F1 is late, use a PIN mode switch.

---

## Remaining calendar (today is 16 Nov 2026)

You have about **one week until the first demo date** and **eighteen days until final submission**. Do not start optional features until F1–F8 work on a phone.

| When | Outcome |
|---|---|
| 16 Nov | Stage 0 decisions frozen; repo skeleton |
| 17 Nov | Navigation, dummy screens, SQLite models |
| 18 Nov | FastAPI + mock LLM + validator |
| 19 Nov | Interview + plan generate + approval |
| 20 Nov | Day Strip + break screen |
| 21 Nov | QR/PIN, offline cache, haptics/audio |
| 22 Nov | Demo script, backup recorded plan, freeze extras |
| 23–30 Nov | Live demo |
| 1–3 Dec | Trailer, report, peer notes, tests, iPhone install notes |
| 4 Dec 23:59 | Submit everything |

---

## Safety rules (do not drop these)

- Human in the loop: nothing reaches the Supported view until the Planner approves.
- No free chat for the Supported person.
- Nicknames only; no diagnosis field; no photos of the person required.
- Profile text stays on your server (or local Ollama). Do not send it to a public consumer AI API.
- No medical or diagnostic claims in UI copy or model prompts.
- Test with adult volunteers or scripted scenarios. Do not test with children.

---

## How to develop with an agent

1. Open `AGENT_STAGES.md`.
2. Resolve the **Decide first** list for that stage (human).
3. Paste the **Agent prompt** into a new Cursor agent chat scoped to this folder.
4. Stop when the **Definition of done** is true. Commit.
5. Do not skip stages. Later prompts assume earlier files exist.

---

## Run (iPhone / iPad only)

Full install, signing, ATS, and offline notes: **`docs/INSTALL.md`**. Bundle id `hk.hkucs.calmstep`. Demo: Expo Go. iPhone 12 + iPad Air, same Wi-Fi as the Mac.

**Phone**

Expo SDK 58 needs **Node 20+**. If this machine’s `/usr/bin/node` is too old, use the wrapper (Metro on **8082**):

```
cd apps/mobile
npx expo start
# lab image fallback:
bash scripts/start-expo.sh
```

Install **Expo Go** from the App Store. Scan the Expo QR. Simulator is layout-only.

Stage 2 rehearsal path: RoleGate → Interview → Profile → Plan → PlanReview → Today → SupportedDay → Break → back.

Stage 4: first launch seeds nickname **Kit** and an approved Monday plan in SQLite. Kill Expo Go and reopen: Planner Profile and Supported Day still show that data. Sound starts off; reduce motion starts on.

Stage 6: Interview talks to `POST /interview/turn` (one question, max 10, then Profile). Plan tab: type a day (try `school 8–3, dentist 16:00, swimming`), Generate, read validator badges, Approve to SQLite. Ollama on the Mac is optional; if it is down the backend returns a scripted interview and a template plan. Supported view still only changes after Approve.

Stage 7: Supported Day is the Day Strip. Large NOW pictogram, until-time, remaining minutes, six (or more) track pictograms, and a “you are here” marker on 06:00–22:00. Reduce motion (on by default) snaps the marker each minute; turn it off in Profile to see the Reanimated slide. No sound in this stage.

Stage 8: **I need a break** lists this profile’s coping steps (Kit seed: headphones, quiet corner, water). Empty list uses deep breaths / quiet corner / drink water. One **Done** button. Light haptic on open unless reduce motion is on. No chime file. Planner Today can show “break used” for this app session only.

Stage 9: Planner Today/Profile show a 6-digit PIN and QR (10 minutes). Supported **Link with PIN or QR** types the PIN (demo-safe) or scans with the camera. That writes the profile and approved plan to SQLite. Airplane mode: open Supported Day; it still reads the cache. No location APIs.

Stage 10: one `clockService` interval. Supported Day and Planner Today subscribe on focus and unsubscribe on blur. Leave and return: no duplicate timers; marker uses the device clock. No lead notification. No LLM in this module. iOS may still suspend the app.

Stage 11: N2 microphone loudness is **skipped**. Reasons: `docs/N2_SKIPPED.md`. Break stays a button, not a live mic.

Stage 12: `cd backend && python3 -m pytest -q` (validator rules 1–6). Phone smoke and UAT script: `docs/TEST_SCRIPT.md`.

Deep link to SupportedDay (Expo Go): after the app is open, the path is `/supported/day`. Scheme: `calmstep://supported/day`.

**API**

```
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8081
```

From this machine: `curl http://127.0.0.1:8081/health` should print `{"ok":true}`.

Copy `.env.example` to `.env` if you keep a local copy. The iPhone reads `extra.apiBaseUrl` in `apps/mobile/app.json` (now `http://172.20.10.4:8081`). iOS notes: `docs/IOS_NETWORKING.md`.

Demo on a **physical iPhone 12** (Supported) and **iPad Air** (Planner). Camera and haptics need a real device. Keep a cached approved plan so the Day Strip still works if the LLM host is down. LAN HTTP: `docs/INSTALL.md` and `docs/IOS_NETWORKING.md`.

---

## Peer learning notes topic (suggested)

**Deploying an open-source LLM (Ollama locally, vLLM in Docker on a GPU) and forcing schema-valid JSON for a mobile app.**

That is one AI usage, explained for juniors, which matches CLO 5 and the 10% peer notes.

---

## Licence note

Pictograms must have a clear licence. ARASAAC is typically CC BY-NC-SA (attribution, non-commercial). Record the source in the report.
