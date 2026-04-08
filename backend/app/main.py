import os
from contextlib import asynccontextmanager
from pathlib import Path

import socketio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.api import auth, rooms, users
from app.db.session import init_db
from app.sockets.server import sio
import app.sockets.chat  # Register socket events.


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("👻 Waking up the ghosts... (Initializing DB)")
    init_db()
    yield
    print("⚰️ Server going to sleep...")


app = FastAPI(
    title="Vibehack API",
    description="The backend for the anonymous, reputation-based chat.",
    version="1.0.0",
    lifespan=lifespan,
)


def _allowed_origins():
    raw = os.getenv("CORS_ORIGINS", "")
    from_env = [item.strip() for item in raw.split(",") if item.strip()]
    return from_env or ["*"]


app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins(),
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(rooms.router, prefix="/api/rooms", tags=["Rooms"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])


@app.get("/health")
def health_check():
    return {"status": "ok"}


FRONTEND_DIR = Path(__file__).resolve().parents[2] / "frontend"
if FRONTEND_DIR.exists():
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIR)), name="frontend-assets")


@app.get("/")
def serve_frontend_root():
    index_file = FRONTEND_DIR / "index.html"
    if index_file.exists():
        return FileResponse(index_file)
    return {"message": "Frontend not found. Start from backend/api routes."}


@app.get("/{path:path}")
def serve_frontend_fallback(path: str):
    if path.startswith("api/") or path.startswith("docs") or path.startswith("openapi"):
        return {"message": "Not Found"}

    target = FRONTEND_DIR / path
    if target.exists() and target.is_file():
        return FileResponse(target)

    index_file = FRONTEND_DIR / "index.html"
    if index_file.exists():
        return FileResponse(index_file)
    return {"message": "Frontend not found."}


socket_app = socketio.ASGIApp(sio, other_asgi_app=app)
