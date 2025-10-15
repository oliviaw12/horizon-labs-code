from fastapi import FastAPI, Response

# Lightweight ping app used exclusively for warm-up cron jobs. It intentionally
# avoids importing heavy LLM or database modules so the process starts quickly.
app = FastAPI(title="Horizon Labs Ping")


@app.get("/ping")
def ping() -> dict[str, str]:
    return {"status": "ok"}


@app.head("/ping")
def ping_head() -> Response:
    return Response(status_code=200)
