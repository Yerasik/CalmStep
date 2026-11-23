# iOS networking for CalmStep (Ch 9 analog)

The course lecture uses Android `INTERNET` in the manifest. This project is iPhone-only. We did not add an Android permission.

## How the phone reaches FastAPI

1. FastAPI binds `0.0.0.0:8081` on this machine. Port 8080 is often taken on shared lab machines.
2. Expo Go’s tunnel only carries the JavaScript bundle. It does not forward port 8081, and Expo Go often blocks cleartext `http://` to a LAN address.
3. A Cloudflare HTTPS tunnel forwards the phone to this FastAPI. The app ignores `http://` base URLs and uses `extra.apiBaseUrl` when it is `https://`.
4. `localhost` / `127.0.0.1` on the iPhone is the phone itself.

Current public API (changes each time the tunnel is restarted): `https://copyright-chuck-stress-sufficient.trycloudflare.com`

LAN address of this machine, if you are on the same Wi-Fi and not using Expo Go: `http://10.21.36.11:8081`

Auth on the LAN: none.

## iOS strings and ATS

- `NSLocalNetworkUsageDescription` — why we use the local network (Ch 9 “permission to talk to a server”).
- `NSAppTransportSecurity` → `NSAllowsLocalNetworking` = true so cleartext HTTP to a LAN host is allowed for the demo. HTTPS is not required on the home/campus LAN this week.

Expo Go may still prompt for Local Network. If the chip on Planner Today stays offline, check: same Wi-Fi, uvicorn `--host 0.0.0.0`, and that `apiBaseUrl` matches `ipconfig getifaddr en0`.

## App flow (Ch 9)

App HTTP request (10 second timeout) → FastAPI → JSON → store updates UI. On failure the last SQLite approved plan is left as-is (F8).
