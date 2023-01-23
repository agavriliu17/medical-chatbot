import React, { useState, useEffect } from "react";
import { CssVarsProvider } from "@mui/joy/styles";
import Input from "@mui/joy/Input";
import Buttons from "./Buttons";
import Sheet from "@mui/joy/Sheet";
import ChatWindows from "./ChatWindows";
import { Typography } from "@mui/joy";
// import { Configuration, OpenAIApi } from "openai";
import axios from "axios";

import icyBot from "./data/chatsIcy.json";

function App() {
  const [conversation, setConversation] = useState(icyBot);
  const [input, setInput] = useState("");
  const [chatID, setChatID] = useState("");

  useEffect(() => {
    (async () => {
      const response = await axios.get("http://127.0.0.1:8000/start_conversation");

      setChatID(response.data);
    })();
  }, []);

  // const configuration = new Configuration({
  //   apiKey: process.env.REACT_APP_OPEN_API_1,
  // });
  // // const openai = new OpenAIApi(configuration);

  // useEffect(() => {
  //   (async () => {
  //     const lastEntry = conversation[conversation.length - 1];
  //     if (lastEntry.user === "Human") {
  //       await getAIResponse();
  //     }
  //   })();

  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [conversation]);

  const handleInputChange = (event) => {
    setInput(event.target.value);
  };

  // const sendMessage = () => {
  //   setConversation([
  //     ...conversation,
  //     {
  //       id: conversation.length + 1,
  //       user: "Human",
  //       message: input,
  //     },
  //   ]);

  //   setInput("");
  // };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  };

  const sendMessage = async () => {
    try {
      // let promptConversation = "";

      // conversation.forEach((entry) => {
      //   if (entry.user === "Human") {
      //     promptConversation += `Human: ${entry.message}
      //     `;
      //   } else {
      //     promptConversation += `AI: ${entry.message}
      //     `;
      //   }
      // });

      // const response = await openai.createCompletion({
      //   model: "text-davinci-003",
      //   prompt: `This is a conversation with an medical chatbot. The bot will try to diagnose the patient's disease and ask as questions about the symptoms to determine severity.
      //   ${promptConversation}`,
      //   temperature: 0.3,
      //   max_tokens: 100,
      //   top_p: 0.5,
      //   frequency_penalty: 1.65,
      //   presence_penalty: 0.55,
      //   stop: [" Human:", " AI:"],
      // });

      // setConversation([
      //   ...conversation,
      //   {
      //     id: conversation.length + 1,
      //     user: "AI",
      //     message: response.data.choices[0].text,
      //   },
      // ]);
      const textToSend = input;
      setInput("");

      const response = await axios
        .post(`http://127.0.0.1:8000/completion/${chatID}`, {
          text: textToSend,
        })
        .then((res) => res.data);

      setConversation(response);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <CssVarsProvider>
      <Sheet
        sx={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <Typography sx={{ marginBottom: "40px", fontSize: "50px" }}>
          Medical Chatbot Demo
        </Typography>

        <Sheet
          sx={{
            display: "flex",
            flexDirection: "row",
            marginBottom: "30px",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: "5rem",
          }}
        >
          {/* Main chat */}
          <Sheet>
            <ChatWindows conversation={conversation} />
            <Input
              sx={{ "--Input-decorator-childHeight": "45px", width: "500px" }}
              placeholder="Press the suggest button for inspiration"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              endDecorator={<Buttons input={input} setInput={setInput} sendMessage={sendMessage} />}
            />
          </Sheet>
        </Sheet>
      </Sheet>
    </CssVarsProvider>
  );
}

export default App;
