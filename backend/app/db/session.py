from sqlmodel import create_engine, Session, SQLModel
import os

try:
    from dotenv import load_dotenv

    load_dotenv()
except Exception:
    pass

database_url = os.getenv("DATABASE_URL", "sqlite:///./vibehack.db")

if database_url.startswith("sqlite"):
    engine = create_engine(database_url, connect_args={"check_same_thread": False})
else:
    engine = create_engine(database_url, pool_pre_ping=True)

def init_db():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
