# CalmStep backend

Python 3.12-compatible FastAPI. Stage 6: interview and plan generate via Ollama OpenAI-compatible `/v1`, then Pydantic + rules 1–6. If the LLM is down, fixtures/templates still return. No auth on the LAN.

Prompts: `PROMPTING.md`.

## Run

```
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8081
```

`--host 0.0.0.0` is required so an iPhone on the same Wi-Fi can reach the Mac. `localhost` on the phone is the phone itself.

From the Mac:

```
curl http://127.0.0.1:8081/health
curl -s -X POST http://127.0.0.1:8081/plans/generate -H 'Content-Type: application/json' \
  -d '{"day_text":"school 8-3, dentist 16:00, swimming"}'
curl -s -X POST http://127.0.0.1:8081/link/start -H 'Content-Type: application/json' -d '{}'
```

Validator tests (Ch 15):

```
python3 -m pytest -q
```

Optional: copy `../.env.example` to `../.env`. Default LLM is `http://127.0.0.1:11434/v1` model `llama3.1:70b`.

From the iPhone the base URL is the Mac LAN IP, currently documented as `http://172.20.10.4:8081` in `apps/mobile/app.json` extra and `docs/IOS_NETWORKING.md`.
