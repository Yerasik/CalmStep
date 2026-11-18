from fastapi import FastAPI
from pydantic import BaseModel


class HealthResponse(BaseModel):
    ok: bool


app = FastAPI(title="CalmStep API")


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    """Ch 9 analog: a typed JSON ping. Screens will call this via a store later, not directly."""
    return HealthResponse(ok=True)
