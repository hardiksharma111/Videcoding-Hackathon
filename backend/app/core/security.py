from datetime import datetime, timedelta
from jose import jwt
import os
import base64
import hashlib
import hmac
import secrets

SECRET_KEY = os.getenv("SECRET_KEY", "fallback-secret-for-local-dev-only")
ALGORITHM = os.getenv("ALGORITHM", "HS256")

def get_password_hash(password: str) -> str:
    iterations = 600_000
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, iterations)
    salt_b64 = base64.b64encode(salt).decode("utf-8")
    digest_b64 = base64.b64encode(digest).decode("utf-8")
    return f"pbkdf2_sha256${iterations}${salt_b64}${digest_b64}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        scheme, iterations_str, salt_b64, digest_b64 = hashed_password.split("$", 3)
        if scheme != "pbkdf2_sha256":
            return False
        iterations = int(iterations_str)
        salt = base64.b64decode(salt_b64.encode("utf-8"))
        expected = base64.b64decode(digest_b64.encode("utf-8"))
        actual = hashlib.pbkdf2_hmac("sha256", plain_password.encode("utf-8"), salt, iterations)
        return hmac.compare_digest(actual, expected)
    except Exception:
        return False

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "2880")))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
