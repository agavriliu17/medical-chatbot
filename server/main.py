from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
import uuid
import json
import os
import openai
from dotenv import load_dotenv
import datetime
import re
import cv2
import tensorflow as tf
from keras.models import load_model
from PIL import Image
import numpy as np

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
openai.api_key = "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"
print(openai.api_key)


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
                                            max_tokens=100, top_p=0.5, frequency_penalty=1.65, presence_penalty=0.6,
                                            stop=["User: "])
        completion = response["choices"][0]["text"].replace("\n\n", "")
        completion = re.sub(r"Bot: ", "", completion)

        botResponse = {
            "message": completion,
            "type": "bot",
            "timestamp": datetime.datetime.now()
        }
        conversations[conversation_id].append(botResponse)
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="OpenAI API error")

    with open(file_name, "w") as file:
        json.dump(conversations, file, default=str)
    return botResponse


@app.post("/upload_file/")
async def create_upload_file(file: UploadFile = File(...)):
    file_name = file.filename
    file_path = os.path.join(
        r"D:\facultate\Anul 3\Semestrul 1\Inteligenta Artificiala\Medical chatbot\medical-chatbot\files", file_name)
    with open(file_path, "wb") as f:
        f.write(file.file.read())
        f.close()
    INPUT_SIZE = 150
    model = load_model(
        r"D:\facultate\Anul 3\Semestrul 1\Inteligenta Artificiala\Medical chatbot\medical-chatbot\server\skincancer\skincancer.h5")
    image = cv2.imread(
        file_path)
    img = Image.fromarray(image)
    img = img.resize((INPUT_SIZE, INPUT_SIZE))
    img = np.array(img)
    input_image = np.expand_dims(img, axis=0)
    result = model.predict(input_image)
    index = 0
    max = 0
    print(result)
    for i in range(0, len(result[0])):
        if result[0][i] > max:
            max = result[0][i]
            index = i
    print(result)
    disease_predict = ""
    if index == 0:
        disease_predict = "Actinic keratosis"
    elif index == 1:
        disease_predict = "Basal cell carcinoma"
    elif index == 2:
        disease_predict = "Dermatofibroma"
    elif index == 3:
        disease_predict = "Melanoma"
    elif index == 4:
        disease_predict = "Nevus"
    elif index == 5:
        disease_predict = "Pigmented benign keratosis"
    elif index == 6:
        disease_predict = "Seborrheic keratosis"
    elif index == 7:
        disease_predict = "Squamous cell carcinoma"
    elif index == 8:
        disease_predict = "Vascular lesion"
    elif index == 8:
        disease_predict = "Normal skin"

    try:
        if disease_predict != "Normal skin":
            response = openai.Completion.create(model="text-davinci-003", prompt=disease_predict, temperature=0.2,
                                                max_tokens=100, top_p=0.5, frequency_penalty=1.65,
                                                presence_penalty=0.6,
                                                stop=["User: "])
            completion = disease_predict + " "
            completion += response["choices"][0]["text"].replace("\n\n", "")
            completion = re.sub(r"Bot: ", "", completion)
        else:
            completion = "No cancer "
            completion = re.sub(r"Bot: ", "", completion)
        botResponse = {
            "message": completion,
            "type": "bot",
            "timestamp": datetime.datetime.now()
        }
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="OpenAI API error")
    return botResponse
