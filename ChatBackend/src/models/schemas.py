from pydantic import BaseModel
from typing import List, Optional
import datetime

class Input(BaseModel):
    question: str
    context: str
    user_id: str
    message_id: str

class Message(BaseModel):
    sender: str  # "user" or "bot"
    content: str
    message_id: str
    timestamp: Optional[datetime.datetime] = datetime.datetime.utcnow()

class Conversation(BaseModel):
    user_id: str
    messages: List[Message]  # List of user-bot exchanges
    timestamp: Optional[datetime.datetime] = datetime.datetime.utcnow()


class User(BaseModel):
    username: str
    password: str

class EditMessageRequest(BaseModel):
    message_id: str
    new_content: str
    user_id :str
