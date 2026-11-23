# Stage 0 — Locked decisions

Frozen: 18 Nov 2026. Later stages must not override this file without an explicit human change.

---

## Locked answers

| Key | Value |
|---|---|
| group_number | 22 |
| members | Yerassyl Taisarinov, UID 3036459776 — all modules (mobile, backend, AI, content, report) unless more names are added later |
| client | expo-iphone (Expo + React Native + TypeScript). **No Android app, no APK, no Android Studio target.** iPad is the same iOS app, not a second product. |
| llm_this_week | **ollama** on the Mac (OpenAI-compatible `/v1`). If Ollama is down: **fixtures-only** JSON so the demo still runs. GPU vLLM is optional later, not required for the 23–30 Nov demo. |
| pictograms | **ARASAAC subset, bundled in the app** (see below). Emoji only if an icon file is missing. |
| ui_language | **English and Russian**. Default follows the device language; Planner settings can override. Demo script in English unless you switch. |
| demo_device | **iPhone 12** (Supported view + camera/haptics). **iPad Air** (Planner view; larger layout). Simulator is layout-only. |
| install_path | **expo-go** first on both devices (same Wi-Fi as the Mac). Switch to an Xcode development build only if Expo Go blocks camera, microphone, or LAN HTTP. |
| api_reachability | **lan** — FastAPI on the Mac, phones/tablets on the **same Wi-Fi**. Base URL is the Mac’s LAN IP (example: `http://192.168.x.x:8080`). Never `localhost` on the device. Tunnel (ngrok) only if campus Wi-Fi isolates clients. |
| linking | **qr+pin** — QR is the “phone feature”; **PIN is the demo-safe path**. See the QR vs PIN section. |

---

## Pictograms (decision + why)

Three options:

1. **ARASAAC** — pictograms made for AAC / visual schedules. Licence is typically **CC BY-NC-SA**: free for this non-commercial course app, you **must credit ARASAAC** in the UI or about screen and in the report, and you cannot treat the set as your own commercial asset. This is the strongest match to CalmStep and to the “graphics / visual elements” mark.
2. **Custom drawings** — cleanest legally if you draw them, but too slow before the demo.
3. **Emoji only** — zero licence work, looks like a chat app, weak for an autism visual schedule and weak as a Ch 10 graphics story.

**Locked:** ship a **closed catalogue** of about 30–40 ARASAAC icons (eat, school, bus, dentist, swim, break, sleep, and so on). Each plan item stores `icon_id` only, never a free-text image. Keep a tiny **emoji fallback** in code so a missing file never shows a broken image on demo day. Put the ARASAAC attribution line in Profile or an About row.

---

## QR vs PIN (what this means)

CalmStep has two roles. The Planner device holds the profile and the approved plan. The Supported device should show that plan without typing a password.

**QR linking**
- Planner screen shows a QR code (a short-lived token from FastAPI).
- Supported screen opens the camera and scans it.
- That is a real phone feature (camera), which COMP3330 likes.
- iOS will ask: “CalmStep would like to access the camera.” If you tap Don’t Allow, or if you are screen-mirroring / using the camera for Zoom, **scan fails**.

**PIN fallback**
- The same `/link/start` call also returns a **6-digit PIN** on the Planner screen (large type).
- On the Supported device you type those six digits. **No camera.**
- Same result: this device is bound to that profile and can cache the approved plan offline.

**What we locked: `qr+pin`**
- Build both.
- For a calm demo: **use PIN**. It is faster to explain in 15 seconds and cannot be killed by a permission popup.
- If there is time, scan QR once to show the camera technique, then continue the story on PIN or already-linked devices.
- Same-device demo (one iPhone, role switch): PIN or a role toggle is enough; you do not need two phones.

We are **not** choosing PIN-only, because then the report has no camera feature. We are also **not** choosing QR-only, because demo day is a bad time to fight iOS permissions.

---

## Actors and use cases (Ch 2)

| Actor | Who | Use cases |
|---|---|---|
| Planner | Parent, teacher, or adult planning for someone else | Interview, edit profile, type a day, generate, approve, show PIN/QR |
| Supported | Child or adult following the day | See Day Strip, countdown, I need a break, tick current item. No menus, no free AI chat. |
| Adult-self | One person in both roles | Same account; toggle Planner / Supported |

Form / mobility: iPhone 12 in the hand for Supported (one thumb, Break in the bottom third). iPad Air for Planner (more room for plan review). Camera and haptics on the phone; do not depend on iPad camera.

---

## Out of scope

- Android
- Diagnosis, therapy, medical advice
- Live location / Find My Family style tracking
- Photos of the person
- Free chat between the Supported person and the LLM
- Public consumer AI APIs for profile text
- N4 photo-to-icon, N5 voice, N3 weekly summary, unless F1–F8 are already solid
- App Store / Play Store listing

---

## MVP (must demo)

| ID | Feature |
|---|---|
| F1 | Planner / Supported; QR **and** 6-digit PIN |
| F2 | AI onboarding interview → Profile Card |
| F3 | Profile review and edit |
| F4 | AI day plan + code validator + Planner approval |
| F5 | Day Strip |
| F6 | I need a break |
| F7 | Closed pictogram set (ARASAAC + emoji fallback) |
| F8 | Offline copy of the approved plan |

---

## Demo-day failure plan

1. Mac runs FastAPI on Wi-Fi LAN; iPhone 12 and iPad Air use `http://<mac-lan-ip>:8081`.
2. If the LLM/Ollama is dead: backend returns **fixture** Profile and Plan JSON; validator still runs.
3. If Wi-Fi is dead: open Supported on the **cached** approved plan (F8). Day Strip and Break still work.
4. If camera is awkward: **PIN**, not QR.
5. Backup: 60-second screen recording of generate → approve → Day Strip → Break.

---

## Languages

- All user-visible strings: English (`en`) and Russian (`ru`).
- Do not mix languages on one screen.
- LLM interview/plan prompts: English for the model; UI chrome stays EN/RU. Planner day-text can be either language; keep the validator language-agnostic (times, `icon_id`, rules).
- Pictogram labels in the catalogue: EN + RU.

---

## Stage 13 install (locked 22 Nov 2026)

- Build: **expo-go**. Xcode development/Ad-Hoc only if Expo Go blocks camera or LAN HTTP.
- Bundle id: **hk.hkucs.calmstep**.

---

## Stage 12 testing (locked 22 Nov 2026)

- UAT people: **scripted only**. No children. No named volunteers yet.

---

## Stage 11 N2 (locked 22 Nov 2026)

- **enable_n2 = false.** See `docs/N2_SKIPPED.md`.
- Would-have: `skip_if_reduce_motion = true` (reduce motion is already the default).

---

## Stage 10 clock (locked 22 Nov 2026)

- Lead notification before the next item: **false**. No `expo-notifications`. Sound stays off.
- Clock is a **bound** module (subscribe on focus). Not a started background service. iOS may suspend the app.

---

## Stage 9 linking (locked 22 Nov 2026)

- PIN length: **6**.
- QR TTL: **10 minutes**, HMAC-signed one-time token from FastAPI. Do not log the token.
- Camera: **expo-camera**. If permission is denied, PIN still works.
- Same-phone demo: type the PIN on Link device. Two-device: scan QR.
- After accept: profile + approved plan written to SQLite; `settings.linked_token` set. Supported Day then reads SQLite only (airplane mode).

---

## Stage 8 Break (locked 22 Nov 2026)

- Default coping if profile list is empty: **deep breaths, quiet corner, drink water**.
- Chime: **none** (no bundled ogg). Sound stays off by default; no surprise audio.
- Haptic on opening Break: **yes**, light impact. **Skip if reduce_motion**.
- “Break used” on Planner Today is **in-memory only** this session. No weekly summary (N3).

---

## Stage 7 Day Strip (locked 22 Nov 2026)

- Animation: **react-native-reanimated** (plus `react-native-worklets` for SDK 58).
- Marker time: **device local clock**. No hidden debug clock (`debug_clock = none`).
- Reduce motion (settings default on, or iOS Reduce Motion): marker snaps once per minute. Countdown still ticks every second.

---

## Stage 6 LLM (locked 22 Nov 2026)

- Provider: **Ollama** OpenAI-compatible `http://127.0.0.1:11434/v1`
- Model: **llama3.1:70b** (the 8B `llama3.1` tag is not installed on this machine; 70B is, and is more likely to return valid plan JSON. Interview still uses the scripted 10 questions when `IF_LLM_DOWN=fixtures`. Validator still checks every plan.)
- API key: empty (local Ollama)
- If LLM down: **fixtures** (scripted interview + template plan). Validator still runs. Planner still must Approve.

---

## Stage 5 server (locked 22 Nov 2026)

- Auth: **none** on the LAN.
- Default API base: `http://172.20.10.4:8081` (LAN IP plus a free port; 8080 was already in use). Change `apps/mobile/app.json` extra.apiBaseUrl when Wi-Fi or port changes.

---

## Stage 4 storage (locked 22 Nov 2026)

- SQLite: `expo-sqlite` tables `profiles`, `plans`, `settings`.
- Clock: device-local dates and `HH:MM`. No UTC conversion.
- Settings keys (SharedPreferences analog): `active_role`, `reduce_motion`, `sound_enabled`, `linked_token`.

---

## Stage 3 palette (locked 22 Nov 2026)

Muted, high contrast (4.5:1 on body text). Font 16 / 20 / 28. Reduce motion default **on**.

| Token | Hex |
|---|---|
| bg | #F4F0E6 |
| surface | #FFFcf7 |
| text | #1A1A1A |
| accent | #1A4A3A |
| danger | #8B2E2E |
| track | #D4CDBF |
| marker | #9A3412 |

---

## Still open (not Stage 0 blockers)

- Exact iOS version on the iPhone 12 and iPad Air (check Settings → General → About before Stage 13).
- Whether more Group 22 names should be added.
- GPU vLLM only if Ollama quality is too weak after Stage 6.
