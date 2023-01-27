import React, { useState, useEffect, useContext } from "react";
import { CssVarsProvider } from "@mui/joy/styles";
import Input from "@mui/joy/Input";
import Buttons from "./components/Buttons";
import Sheet from "@mui/joy/Sheet";
import ChatWindows from "./components/ChatWindows";
import { Typography } from "@mui/joy";
import ChatContext from "./context/ChatContext";
import axios from "axios";

function App() {
  const [input, setInput] = useState("");
  const { conversation, addMessage, chatID, setLoadingCompletion } = useContext(ChatContext);

  useEffect(() => {
    (async () => {
      const lastEntry = conversation[conversation.length - 1];
      if (lastEntry.type === "user" && !lastEntry.image) {
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
    if (!input) return;

    addMessage(input, "user");
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

      addMessage(response, "bot");
    } catch (error) {
      addMessage(
        {
          message: "Sorry, I'm having trouble connecting to the server. Please try again later.",
          type: "bot",
          timestamp: new Date().getTime(),
        },
        "bot"
      );
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
        <Typography sx={{ marginBottom: "40px", fontSize: "50px", marginTop: "50px" }}>
          Medical Chatbot Demo
        </Typography>

        {/* Main chat */}
        <Sheet sx={{ height: "100%", marginBottom: "2rem" }}>
          <ChatWindows conversation={conversation} />
          <Input
            sx={{ "--Input-decorator-childHeight": "45px", width: "500px" }}
            placeholder="Type your message here..."
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            endDecorator={<Buttons sendMessage={sendMessage} />}
          />
        </Sheet>
      </Sheet>
    </CssVarsProvider>
  );
}

export default App;
