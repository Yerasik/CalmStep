# CalmStep iPhone install (Ch 2, Ch 16)

Group 22. Bundle id: `hk.hkucs.calmstep`. **Build path: Expo Go** (Stage 0). App Store listing is not required for COMP3330.

Demo devices: **iPhone 12** (Supported) and **iPad Air** (Planner). Simulator is layout-only.

This project is **iPhone / iPad (iOS) only**.

---

## 1. Same Wi-Fi

Mac, iPhone, and iPad on the **same Wi-Fi**. `localhost` on the phone is the phone, not the Mac.

Find the Mac LAN IP:

```
ipconfig getifaddr en0
```

Set that host in `apps/mobile/app.json` → `expo.extra.apiBaseUrl` and in `apps/mobile/src/api/config.ts` `DEFAULT_API_BASE`, for example `http://192.168.x.x:8081`. Also `.env.example` / `.env` `API_BASE_URL` on the Mac. Never `http://127.0.0.1:8081` on the device.

Port **8081** (8080 is often taken on lab machines). FastAPI must bind all interfaces: `--host 0.0.0.0`.

---

## 2. Backend on the Mac

```
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8081
```

Check from the Mac: `curl http://127.0.0.1:8081/health` → `{"ok":true}`.

Optional LLM: Ollama at `http://127.0.0.1:11434/v1` model `llama3.1:70b`. Generate can take up to ~3 minutes on first load. If Ollama is down, FastAPI returns fixtures/templates. Validator still runs. Planner still must Approve.

---

## 3. Expo Go (what we ship for the demo)

1. On the iPhone / iPad: App Store → install **Expo Go** (signed by Apple for your Apple ID; you do not submit CalmStep to the App Store).
2. On the Mac, Node 20+ (SDK 58). Then:

```
cd apps/mobile
npx expo start
```

On this lab image, if `/usr/bin/node` is too old, use `bash apps/mobile/scripts/start-expo.sh` (Metro on **8082**).

3. Scan the Expo QR with the Camera app or Expo Go.
4. Allow **Local Network** if iOS asks.

Teaching staff: bring the provisioned iPhone with Expo Go already installed, same Wi-Fi as the presenting Mac, `apiBaseUrl` updated to that Mac’s IP.

---

## 4. Xcode development build (only if Expo Go blocks camera or LAN HTTP)

Not the default. Analog of Ch 2 **development / Ad-Hoc**: Xcode installs a development-signed app on a device registered to your team. Not In-House, not App Store.

1. `cd apps/mobile && npx expo prebuild --platform ios` (or open the generated `ios` folder).
2. Open `ios/*.xcworkspace` in Xcode.
3. Select the **physical iPhone 12**, your **Development Team**, bundle id `hk.hkucs.calmstep`.
4. Run. Apple signs the binary with your **development certificate** and a **provisioning profile** (public/private key pair). Ch 16 analog: you are not shipping a self-signed APK; iOS requires Apple’s signature.
5. App Store Connect / TestFlight are not required for COMP3330.

---

## 5. Info.plist usage strings (what is actually used)

| Key | Used? | Why |
|---|---|---|
| `NSCameraUsageDescription` | **Yes** | Scan Planner QR (PIN still works if denied). |
| `NSLocalNetworkUsageDescription` | **Yes** | Reach FastAPI on the LAN. |
| `NSAppTransportSecurity` → `NSAllowsLocalNetworking` | **Yes** | Cleartext **HTTP** to the Mac on the LAN (ATS exception for local networking). |
| `NSMicrophoneUsageDescription` | **No (runtime)** | Placeholder only. N2 loudness is skipped (`docs/N2_SKIPPED.md`). CalmStep does not record audio. |

There is no location usage string. Location is out of scope.

---

## 6. Signing in one sentence (Ch 2 / Ch 16)

Expo Go is already signed by Apple. A custom `.ipa` would be signed with a **development certificate** for class demo. COMP3330 does not require App Store review.

---

## 7. Offline fallback (F8)

Approve a plan once while the API is reachable. SQLite keeps profile + approved plan. Turn on **airplane mode**. Supported Day and Break still run from cache. Generate/interview/link need the Mac.

If live LLM dies during the demo: template plan + validator, or show the 60-second backup recording (generate → approve → Day Strip → Break).

---

## 8. If it does not connect

- Same Wi-Fi, not client isolation.
- `apiBaseUrl` matches `en0`, scheme `http://`, port `8081`.
- uvicorn `--host 0.0.0.0`.
- Planner Today server chip: connected vs offline. Offline is OK for Day Strip after Approve.
