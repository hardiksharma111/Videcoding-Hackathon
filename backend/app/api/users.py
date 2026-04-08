from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.db.session import get_session
from app.db.models import User, UserRead
from app.api.deps import get_current_user
from app.redis_cache.connection import redis_client

router = APIRouter()

@router.get("/me", response_model=UserRead)
def get_my_dashboard(current_user: User = Depends(get_current_user)):
    """The frontend calls this to load the Dashboard stats."""
    return current_user

@router.get("/ghost/{ghost_name}")
def get_ghost_profile(ghost_name: str, db: Session = Depends(get_session)):
    """When a user clicks on a ghost in the chatroom to see their bio."""
    # 1. Look up the pointer in Redis
    real_username = redis_client.get(f"ghost_pointer:{ghost_name}")
    if not real_username:
        raise HTTPException(status_code=404, detail="Ghost vanished or does not exist.")
        
    # 2. Fetch their public info from Postgres
    user = db.exec(select(User).where(User.username == real_username)).first()
    
    # 3. ONLY return the safe data (No permanent username!)
    return {
        "ghost_name": ghost_name,
        "bio": user.bio,
        "auth_points": user.auth_points
    }

@router.post("/gift/{ghost_name}")
def gift_authenticity_point(
    ghost_name: str, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_session)
):
    """Transfer an authenticity point to a ghost."""
    # 1. Look up who the ghost really is
    target_username = redis_client.get(f"ghost_pointer:{ghost_name}")
    
    if not target_username:
        raise HTTPException(status_code=404, detail="Ghost not found.")
    
    if target_username == current_user.username:
        raise HTTPException(status_code=400, detail="You cannot gift points to yourself!")

    # 2. Find the target user in Postgres
    target_user = db.exec(select(User).where(User.username == target_username)).first()
    
    # 3. Add the point and save to the permanent database
    target_user.auth_points += 1
    db.add(target_user)
    db.commit()
    
    return {"message": f"Successfully gifted a point to {ghost_name}!"}
