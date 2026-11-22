# CalmStep backend

Python 3.12-compatible FastAPI. Stage 5: health, interview stub, fixture generate, validate, approve.

No LLM yet. No auth on the LAN.

## Run

```
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8080
```

`--host 0.0.0.0` is required so an iPhone on the same Wi-Fi can reach the Mac. `localhost` on the phone is the phone itself.

From the Mac:

```
curl http://127.0.0.1:8080/health
curl -s -X POST http://127.0.0.1:8080/plans/generate -H 'Content-Type: application/json' -d '{}'
```

From the iPhone the base URL is the Mac LAN IP, currently documented as `http://172.20.10.4:8080` in `apps/mobile/app.json` extra and `docs/IOS_NETWORKING.md`.
