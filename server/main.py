from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uuid
import json
import os
import openai
from dotenv import load_dotenv
import datetime;



app = FastAPI()
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
    
    conversations[str(conversation_id)] = []
    with open(file_name, "w") as file:
        json.dump(conversations, file)
    
    return conversation_id

@app.post("/completion/{conversation_id}")
def completion(conversation_id: str, item: Item):
    file_name = "conversations.json"
    with open('conversations.json', 'r') as f:
        conversations = json.load(f)
    
    if conversation_id not in conversations:
        raise HTTPException(status_code=404, detail="Conversation_id not found")
    
    text= item.text
    conversations[conversation_id].append({
        "message": text,
        "type": "user",
        "timestamp": datetime.datetime.now()
    })

    try:
        response = openai.Completion.create(model="text-davinci-003", prompt=text, temperature=0, max_tokens=100)
        completion = response["choices"][0]["text"]
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
