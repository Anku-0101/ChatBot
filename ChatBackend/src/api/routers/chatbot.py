import uuid
from fastapi import APIRouter,HTTPException
from models.schemas import Input, Message, Conversation, EditMessageRequest
from database.crud import read_faq_data, save_conversation,get_conversations, update_message, delete_message

router = APIRouter()


@router.post("/")
async def chat(query: Input):
    user_input = query.question.lower()
    user_id = query.user_id
    category = query.context
    faq_data = read_faq_data()
    response = None

    questions = faq_data[category.lower()]
    for question, answer in questions.items():
        if question.lower() in user_input.lower():  # Case-insensitive comparison
            response = answer
            break

    # Create the user-bot exchange
    user_message = Message(sender="user", content=query.question, message_id = query.message_id)
    bot_message = Message(sender="bot", content=response or "I'm sorry, I couldn't find an answer to that.", message_id=str(uuid.uuid4()))
    
    # Create the conversation and save it
    conversation = Conversation(user_id=user_id, messages=[user_message, bot_message])
    save_conversation(conversation)

    return {"response": response, "message_id" : bot_message.message_id}

@router.get("/conversations/{user_id}")
async def get_user_conversations(user_id: str):
    conversations = get_conversations(user_id)
    if not conversations:
        raise HTTPException(status_code=404, detail="No conversations found.")
    return {"conversations": conversations}

@router.post("/conversations/update")
async def edit_conversation(message_data : EditMessageRequest):
    print("method hit")
    success = update_message(message_data.user_id, message_data.message_id, message_data.new_content)
    if not success:
        raise HTTPException(status_code=404, detail="Message not found.")
    return {"message": "Message updated successfully."}

@router.delete("/conversations/{user_id}")
async def delete_conversation(user_id: str, message_id: str):
    success = delete_message(user_id, message_id)
    if not success:
        raise HTTPException(status_code=404, detail="Message not found.")
    return {"message": "Message deleted successfully."}