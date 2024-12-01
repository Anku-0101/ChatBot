import json
import uuid
from models.schemas import Conversation, Message
from pathlib import Path

FAQ_FILE = Path(__file__).parent / "faq_data.txt"
USERS_FILE = Path(__file__).parent / "users.txt"
CONVERSATIONS_FILE = Path(__file__).parent / "conversations.json"

if not CONVERSATIONS_FILE.exists() or CONVERSATIONS_FILE.stat().st_size == 0:  # Check if the file is empty
    with open(CONVERSATIONS_FILE, "w") as f:
        json.dump({}, f)

def save_conversation(conversation: Conversation):
    # Load the existing data or initialize an empty dictionary if the file is empty
    try:
        with open(CONVERSATIONS_FILE, "r") as f:
            data = json.load(f)
    except (json.JSONDecodeError, FileNotFoundError):
        data = {}

    # If the user_id doesn't exist, create an entry for it
    if conversation.user_id not in data:
        data[conversation.user_id] = {"user_id": conversation.user_id, "messages": []}

    # Add the new messages to the existing conversation for this user_id
    existing_messages = data[conversation.user_id]["messages"]
    new_messages = conversation.dict()["messages"]
    data[conversation.user_id]["messages"] = existing_messages + new_messages

    # Save the updated data back to the file
    with open(CONVERSATIONS_FILE, "w") as f:
        json.dump(data, f, indent=4, default=str)


def get_conversations(user_id: str):
    with open(CONVERSATIONS_FILE, "r") as f:
        data = json.load(f)
    
    return data.get(user_id, [])

def update_message(user_id: str, message_id: str, new_content: str):
    # Load conversations from file
    with open(CONVERSATIONS_FILE, "r") as f:
        data = json.load(f)

    # Check if the user exists in the data
    if user_id not in data:
        return False  # User not found

    # Find the conversation containing the message with the given message_id
    user_conversations = data[user_id]

    for message in user_conversations["messages"]:
        if message["message_id"] == message_id:
            message["content"] = new_content

            # Save the updated data back to the file
            with open(CONVERSATIONS_FILE, "w") as f:
                json.dump(data, f, default=str)

            return True  # Successfully updated the message

    return False  # Message not found


def delete_message(user_id: str, message_id: str):
    with open(CONVERSATIONS_FILE, "r") as f:
        data = json.load(f)

    # Check if the user exists in the data
    if user_id not in data:
        return False  # User not found

    # Find the conversation containing the message with the given message_id
    user_conversations = data[user_id]

    # Filter out the message with the given message_id
    updated_messages = [
        message for message in user_conversations["messages"]
        if message["message_id"] != message_id
    ]

    # If the length of messages hasn't changed, the message_id was not found
    if len(updated_messages) == len(user_conversations["messages"]):
        return False  # Message not found

    # Update the messages list for the user
    user_conversations["messages"] = updated_messages

    # Save the updated data back to the file
    with open(CONVERSATIONS_FILE, "w") as f:
        json.dump(data, f, default=str)

    return True  # Successfully deleted the message


# FAQ operations
def read_faq_data():
    if not FAQ_FILE.exists():
        return {}
    with open(FAQ_FILE, "r") as f:
        return json.load(f)

def write_faq_data(data):
    with open(FAQ_FILE, "w") as f:
        json.dump(data, f, indent=4)

# User operations
def register_user(username, password):
    if not USERS_FILE.exists():
        USERS_FILE.touch()
    # Check if the username already exists
    with open(USERS_FILE, "r") as f:
        users = f.readlines()
    for user in users:
        _, saved_username, _ = user.strip().split(":")
        if username == saved_username:
            return False  # User already exists

    # If the username doesn't exist, register the user
    user_id = str(uuid.uuid4())  # Generate a unique ID
    with open(USERS_FILE, "a") as f:
        f.write(f"{user_id}:{username}:{password}\n")
    return True

def authenticate_user(username, password):
    if not USERS_FILE.exists():
        return None  # No users registered yet
    with open(USERS_FILE, "r") as f:
        users = f.readlines()
    for user in users:
        user_id, saved_username, saved_password = user.strip().split(":")
        if username == saved_username and password == saved_password:
            return user_id  # Return the user_id upon successful authentication
    return None  # Invalid credentials

