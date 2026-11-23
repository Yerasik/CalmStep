# CalmStep test script (Ch 15)

UAT people: **scripted only** (no named adult volunteers yet). Do not test with children.

Course analog: Android UI Exerciser Monkey is not used. iOS path is this written tap script plus pytest on `/plans/validate`.

---

## Smoke (about 5 minutes, physical iPhone 12)

Mac and iPhone on the same Wi-Fi. FastAPI: `uvicorn app.main:app --host 0.0.0.0 --port 8081`. Expo Go on the phone. `apiBaseUrl` in `apps/mobile/app.json` is the Mac LAN IP, not `localhost`.

1. Install / open Expo Go. Scan the Expo QR. App opens on RoleGate. **Pass / fail:** ___
2. Continue as Planner. Finish or skip through Interview if the LLM is down (fixture questions). Open Profile: nickname Kit (or the interview nickname). **Pass / fail:** ___
3. Plan tab. Day text: `school 8–3, dentist 16:00, swimming`. Generate. Items appear. Validate badge ok or issues listed. **Pass / fail:** ___
4. Approve. Open Supported Day. NOW card + pictogram strip + “you are here” marker. **Pass / fail:** ___
5. I need a break. Coping steps for this profile. Done returns to the strip. **Pass / fail:** ___
6. Airplane mode on. Kill and reopen Supported Day (or RoleGate → Open as Supported). Cached plan still shows. **Pass / fail:** ___
7. Airplane mode off. Planner Today: 6-digit PIN visible (or “server offline” if Wi-Fi still off). **Pass / fail:** ___

If Generate fails: template plan is still valid; Approve still required. If camera is awkward: PIN, not QR.

Ran on demo phone (date / who): _______________________

---

## IO table (template / generate, LLM may be down)

`POST /plans/generate` with Kit profile. Item counts below are the **template** path (deterministic). Live LLM may differ; validator still applies. Max 8 items.

| Input `day_text` | Expected items (template) | Notes |
|---|---|---|
| *(empty)* | 6 | Seed Monday fixture |
| `school 8-3, dentist 16:00, swimming` | 7 | Breakfast, school, lunch, quiet, school, dentist, swim |
| `school 8-3` | 5 | Breakfast, morning school, lunch, quiet, afternoon school |
| `dentist 16:00` | 3 | Breakfast, lunch, dentist |

Fill after a live LLM run if used: items proposed ___ / items edited by Planner ___ / validator ok on first try ___ / after retry ___ / template used yes/no ___

---

## UAT script (10 minutes, adults only)

**Consent:** This is a course prototype (HKU COMP3330 Group 22). Nickname only. No diagnosis, no medical advice. You may stop at any time. We will not test with children.

1. (2 min) RoleGate: Planner vs Supported. One primary action. Text readable (16 pt).
2. (2 min) Type a short day. Generate. Say whether the items match the text.
3. (2 min) Approve. Open Supported Day. Can you tell what is NOW without a menu?
4. (2 min) Break. Are the coping steps calm? Done back to the strip.
5. (2 min) Optional: PIN link or airplane mode. Any crash?

Observer notes: time-to-plan by hand vs Generate: _______  % items edited: _______  crashes: _______

---

## Compatibility

| Target | Use | Result |
|---|---|---|
| iOS Simulator | Layout only (safe area, type size, tabs). No camera, haptics, or LAN demo. | ___ |
| iPhone 12 (Supported) | Day Strip, Break, camera/PIN, airplane mode | ___ |
| iPad Air (Planner) | Interview, Plan, Profile, PIN/QR | ___ |

---

## Non-functional notes (fill on a real run)

| Metric | Value |
|---|---|
| Cold load time (RoleGate visible) | ___ s |
| Generate / AI latency (or template) | ___ s |
| `/plans/validate` pytest | pass / fail |
| Crash during smoke | yes / no |
| Battery note (Supported Day idle 3 min) | ___ |

---

## Security notes (not a pentest)

- Profile text goes to FastAPI on the LAN and local Ollama only. No public consumer AI API.
- No diagnosis field. Interview prompt forbids medical advice.
- Linking token is HMAC-signed, 10 minute TTL, one-time. Do not log it.
- Nicknames only. Auth on the LAN: none (campus demo).
- N2 microphone skipped (`docs/N2_SKIPPED.md`). No audio files written.

---

## Pytest (Mac)

```
cd backend
python3 -m pytest -q
```

Covers `/plans/validate` rules 1–6 and a passing fixture plan.
