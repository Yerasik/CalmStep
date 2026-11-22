# iOS networking for CalmStep (Ch 9 analog)

The course lecture uses Android `INTERNET` in the manifest. This project is iPhone-only. We did not add an Android permission.

## How the phone reaches FastAPI

1. Mac and iPhone on the same Wi-Fi.
2. FastAPI binds `0.0.0.0:8080` (all interfaces), not only loopback.
3. The app uses `http://<Mac-LAN-IP>:8080` from Expo `extra.apiBaseUrl`.
4. `localhost` / `127.0.0.1` on the iPhone is the phone itself. It will never hit the Mac.

Current demo IP (update when the Mac joins another network): `http://172.20.10.4:8080`

Auth on the LAN: none.

## iOS strings and ATS

- `NSLocalNetworkUsageDescription` — why we use the local network (Ch 9 “permission to talk to a server”).
- `NSAppTransportSecurity` → `NSAllowsLocalNetworking` = true so cleartext HTTP to a LAN host is allowed for the demo. HTTPS is not required on the home/campus LAN this week.

Expo Go may still prompt for Local Network. If the chip on Planner Today stays offline, check: same Wi-Fi, uvicorn `--host 0.0.0.0`, and that `apiBaseUrl` matches `ipconfig getifaddr en0`.

## App flow (Ch 9)

App HTTP request (10 second timeout) → FastAPI → JSON → store updates UI. On failure the last SQLite approved plan is left as-is (F8).
