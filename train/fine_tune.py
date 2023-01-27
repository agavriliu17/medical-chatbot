import json

model = []
file = "intents.json"

with open(file) as f:
    data = json.load(f)
    for intent in data['intents']:
        for pattern in intent['patterns']:
            model.append(
                {"prompt": pattern, "completion": intent["responses"][0]})
            # print(pattern, intent['tag'])

# write models in json file
with open('model.json', 'w') as f:
    json.dump(model, f)
