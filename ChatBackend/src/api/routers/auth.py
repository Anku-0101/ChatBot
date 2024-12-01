from fastapi import APIRouter, HTTPException
from models.schemas import User
from core.security import generate_token
from database.crud import register_user, authenticate_user

router = APIRouter()

@router.post("/register")
def register(user: User):
    if register_user(user.username, user.password):
        return {"message": "User registered successfully, log-in to continue"}
    raise HTTPException(status_code=400, detail="User already exists, log-in to continue")

@router.post("/login")
def login(user: User):
    user_id = authenticate_user(user.username, user.password)
    if user_id:
        token = generate_token(user_id)  # Use user_id to generate the token
        return {"token": token, "userId":user_id}
    raise HTTPException(status_code=401, detail="Invalid credentials, Enter valid credentials or register new user")
