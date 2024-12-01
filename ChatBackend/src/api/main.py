from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routers import auth, chatbot

app = FastAPI()

# CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Update as per production needs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(chatbot.router, prefix="/chatbot", tags=["Chatbot"])

@app.get("/")
def root():
    return {"message": "Welcome to the FastAPI Chatbot Application!"}
