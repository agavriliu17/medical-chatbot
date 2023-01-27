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
openai.api_key = os.getenv("OPENAI_API_KEY")

class TextPayload(BaseModel):
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
def completion(conversation_id: str, item: TextPayload):
    file_name = "conversations.json"
    with open('conversations.json', 'r') as f:
        conversations = json.load(f)

    if conversation_id not in conversations:
        raise HTTPException(
            status_code=404, detail="Conversation_id not found")

    text = item.text
    if text[-1] not in [".", "?", "!"]:
        text += "."

    conversations[conversation_id].append({
        "message": text,
        "type": "user",
        "timestamp": datetime.datetime.now()
    })

    prompt = "This is a conversation with Nurse Mary, an medical chatbot specialised in dermatology but also with general medical knowledge. The bot will try to diagnose the patient's disease and ask as questions about the symptoms to determine severity. Users also can upload photos of their skin.\n"

    for message in conversations[conversation_id]:
        if message["type"] == "user":
            prompt += f"\nUser: {message['message']}"
        else:
            prompt += f"\nBot: {message['message']}"
    try:
        response = openai.Completion.create(model="davinci:ft-personal-2023-01-26-23-12-46", prompt=prompt, temperature=0.2,
                                            max_tokens=100, top_p=0.5, frequency_penalty=1.65, presence_penalty=1.2,
                                            stop=["User: "])
        completion = response["choices"][0]["text"].replace("\n\n", "")
        completion = re.sub(r"Bot:", "", completion)

        if (completion == ""):
            completion = "I don't think I've understand, please try again"

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


@app.post("/upload_file/{conversation_id}")
async def create_upload_file(conversation_id: str, file: UploadFile = File(...)):
    with open('conversations.json', 'r') as f:
        conversations = json.load(f)

    if conversation_id not in conversations:
        raise HTTPException(
            status_code=404, detail="Conversation_id not found")

    file_name = file.filename
    file_path = os.path.join(
        r"/Users/agavriliu/Documents/repos/medical-chatbot/server/files", file_name)

    # detect skin
    with open(file_path, "wb") as f:
        f.write(file.file.read())
        f.close()

    INPUT_SIZE = 150
    model = load_model(
        r"/Users/agavriliu/Documents/repos/medical-chatbot/train/skin_validation.h5", compile=False)
    model.compile()
    image = cv2.imread(
        file_path)
    img = Image.fromarray(image)
    img = img.resize((INPUT_SIZE, INPUT_SIZE))
    img = np.array(img)
    input_image = np.expand_dims(img, axis=0)
    result = model.predict(input_image)

    skin = False
    if result[0][0] <= result[0][1]:
        skin = True

    if not skin:
        completion = "Please provide an valid image of your affected skin, also check if the image is not blurred or too dark."
        botResponse = {
            "message": completion,
            "type": "bot",
            "timestamp": datetime.datetime.now()
        }
        conversations[conversation_id].append(botResponse)
        return botResponse

    else:
        INPUT_SIZE = 150
        model = load_model(
            r"/Users/agavriliu/Documents/repos/medical-chatbot/train/skincancer.h5", compile=False)
        model.compile()

        image = cv2.imread(file_path)
        img = Image.fromarray(image)
        img = img.resize((INPUT_SIZE, INPUT_SIZE))
        img = np.array(img)
        input_image = np.expand_dims(img, axis=0)
        result = model.predict(input_image)
        index = 0
        max = 0

        for i in range(0, len(result[0])):
            if result[0][i] > max:
                max = result[0][i]
                index = i

        disease_predict = ""
        DISEASES = ["actinic keratosis", "basal cell carcinoma", "dermatofibroma", "melanoma", "nevus",
                    "pigmented benign keratosis", "seborrheic keratosis", "squamous cell carcinoma", "vascular lesion", "healthy skin"]
        disease_predict = "You're a medical chatbot and you need to tell your patient that he has" + \
            DISEASES[index]

        try:
            response = openai.Completion.create(model="text-davinci-003", prompt=disease_predict, temperature=0.2,
                                                max_tokens=100, top_p=0.5, frequency_penalty=1.65,
                                                presence_penalty=0.6,
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

        with open("conversations.json", "w") as file:
            json.dump(conversations, file, default=str)
        return botResponse
