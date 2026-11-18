# CalmStep backend

Python 3.12-compatible FastAPI app. Stage 1 only exposes health.

## Run

From this folder:

```
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8080
```

`--host 0.0.0.0` is required so an iPhone on the same Wi-Fi can reach the Mac. `localhost` on the phone is the phone itself, not this Mac.

Check:

```
curl http://127.0.0.1:8080/health
```

Expected: `{"ok":true}`

LLM and plan APIs are not in this stage.
