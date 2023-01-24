import React, { useState, useEffect, useContext } from "react";
import { CssVarsProvider } from "@mui/joy/styles";
import Input from "@mui/joy/Input";
import Buttons from "./components/Buttons";
import Sheet from "@mui/joy/Sheet";
import ChatWindows from "./components/ChatWindows";
import { Typography } from "@mui/joy";
import ChatContext from "./context/ChatContext";
import axios from "axios";

const startingConversation = [
  {
    message: "Hello, I am medical assistance chatbot. What can I help you with?",
    type: "bot",
    timestamp: new Date().getTime(),
  },
];

function App() {
  const [conversation, setConversation] = useState(startingConversation);
  const [input, setInput] = useState("");
  const { chatID, setLoadingCompletion } = useContext(ChatContext);

  useEffect(() => {
    (async () => {
      const lastEntry = conversation[conversation.length - 1];
      console.log(lastEntry);
      if (lastEntry.type === "user") {
        await getAIResponse(lastEntry.message);
      }
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation]);

  const handleInputChange = (event) => {
    setInput(event.target.value);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  };

  const sendMessage = async () => {
    setConversation([
      ...conversation,
      {
        message: input,
        type: "user",
        timestamp: new Date().getTime(),
      },
    ]);
    setInput("");
  };

  const getAIResponse = async (message) => {
    try {
      setLoadingCompletion(true);
      const response = await axios
        .post(`http://127.0.0.1:8000/completion/${chatID}`, {
          text: message,
        })
        .then((res) => res.data);

      setConversation([...conversation, response]);
    } catch (error) {
      console.log(error);
    }

    setLoadingCompletion(false);
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
              endDecorator={<Buttons sendMessage={sendMessage} />}
            />
          </Sheet>
        </Sheet>
      </Sheet>
    </CssVarsProvider>
  );
}

export default App;
