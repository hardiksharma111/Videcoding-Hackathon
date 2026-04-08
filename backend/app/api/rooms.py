from fastapi import APIRouter
from app.redis_cache.manager import RoomManager

router = APIRouter()

@router.get("/trending")
def get_trending_rooms():
    """
    Returns the top active chatrooms. 
    If all rooms are empty, it returns an empty list.
    """
    rooms = RoomManager.get_trending_rooms()
    return {"trending_rooms": rooms}
