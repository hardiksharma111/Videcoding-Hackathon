import time
from typing import List, Dict
from app.redis_cache.connection import redis_client

class RoomManager:
    PREFIX = "room:"

    @classmethod
    def join_room(cls, room_name: str, category: str):
        """Called when a user joins. Creates the room if it doesn't exist."""
        room_key = f"{cls.PREFIX}{room_name}"
        
        # If room doesn't exist, set its creation time and category
        if not redis_client.exists(room_key):
            redis_client.hset(room_key, mapping={
                "category": category,
                "created_at": int(time.time()),
                "user_count": 0
            })
            
        # Increment user count
        redis_client.hincrby(room_key, "user_count", 1)

    @classmethod
    def leave_room(cls, room_name: str):
        """Called when a user leaves. Vanishes the room if empty."""
        room_key = f"{cls.PREFIX}{room_name}"
        
        if redis_client.exists(room_key):
            new_count = redis_client.hincrby(room_key, "user_count", -1)
            
            # THE VANISHING ACT: If 0 users, delete the room completely
            if new_count <= 0:
                redis_client.delete(room_key)
                return True # Room vanished
        return False

    @classmethod
    def get_trending_rooms(cls, limit: int = 10) -> List[Dict]:
        """Fetches all active rooms and sorts them by popularity."""
        room_keys = redis_client.keys(f"{cls.PREFIX}*")
        rooms = []
        
        current_time = int(time.time())

        for key in room_keys:
            data = redis_client.hgetall(key)
            if not data:
                continue
                
            user_count = int(data.get("user_count", 0))
            created_at = int(data.get("created_at", current_time))
            
            # Simple Trending Algorithm: Heavily weights user count, slight boost for newer rooms
            age_seconds = current_time - created_at
            score = user_count / ((age_seconds / 60) + 1)**0.5 
            
            rooms.append({
                "room_name": key.replace(cls.PREFIX, ""),
                "category": data.get("category"),
                "user_count": user_count,
                "score": score
            })

        # Sort by score descending
        rooms.sort(key=lambda x: x["score"], reverse=True)
        return rooms[:limit]
