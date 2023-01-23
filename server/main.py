from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uuid
import json
import os
import openai
from dotenv import load_dotenv
import datetime
import re
from fastapi.middleware.cors import CORSMiddleware



app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

# TODO: Rename this
class Item(BaseModel):
    text: str


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/start_conversation")
def start_conversation():
    file_name = "conversations.json"
    conversation_id = uuid.uuid4()
    with open('conversations.json', 'r') as f:
        conversations = json.load(f)

    conversations[str(conversation_id)] = [{
        "message": "Hello, I am medical assistance chatbot. What can I help you with?",
        "type": "bot",
        "timestamp": datetime.datetime.now()
    }]

    with open(file_name, "w") as file:
        json.dump(conversations, file, default=str)

    return conversation_id


@app.post("/completion/{conversation_id}")
def completion(conversation_id: str, item: Item):
    file_name = "conversations.json"
    with open('conversations.json', 'r') as f:
        conversations = json.load(f)

    if conversation_id not in conversations:
        raise HTTPException(
            status_code=404, detail="Conversation_id not found")

    text = item.text
    conversations[conversation_id].append({
        "message": text,
        "type": "user",
        "timestamp": datetime.datetime.now()
    })

    prompt = "This is a conversation with an medical chatbot. The bot will try to diagnose the patient's disease and ask as questions about the symptoms to determine severity.\n"

    for message in conversations[conversation_id]:
        if message["type"] == "user":
            prompt += f"\nUser: {message['message']}"
        else:
            prompt += f"\nBot: {message['message']}"
    print(prompt)
    try:
        response = openai.Completion.create(model="text-davinci-003", prompt=prompt, temperature=0.2,
                                            max_tokens=100, top_p=0.5, frequency_penalty=1.65, presence_penalty=0.6,)
        completion = response["choices"][0]["text"].replace("\n\n", "")
        completion = re.sub(r"Bot: ", "", completion)

        conversations[conversation_id].append({
            "message": completion,
            "type": "bot",
            "timestamp": datetime.datetime.now()
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail="OpenAI API error")

    with open(file_name, "w") as file:
        json.dump(conversations, file, default=str)
    return conversations[conversation_id]
