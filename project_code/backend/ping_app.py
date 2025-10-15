from fastapi import FastAPI, Response

# Lightweight ping app used exclusively for warm-up cron jobs. It intentionally
# avoids importing heavy LLM or database modules so the process starts quickly.
#
# When this app is mounted under a prefix (for example, the main FastAPI mounts
# it at `/ping`), the internal routes must live at `/` so the combined path is
# `/ping` or `/ping/` and does not introduce redirect loops.
app = FastAPI(title="Horizon Labs Ping")


@app.get("/")
def ping() -> dict[str, str]:
    return {"status": "ok"}


@app.head("/")
def ping_head() -> Response:
    return Response(status_code=200)
