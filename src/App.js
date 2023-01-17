import React, { useState, useEffect } from "react";
import { CssVarsProvider } from "@mui/joy/styles";
import Input from "@mui/joy/Input";
import Buttons from "./Buttons";
import Sheet from "@mui/joy/Sheet";
import ChatWindows from "./ChatWindows";
import { Typography } from "@mui/joy";
import { Configuration, OpenAIApi } from "openai";

import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import Radio from "@mui/joy/Radio";
import RadioGroup from "@mui/joy/RadioGroup";

import icyBot from "./data/chatsIcy.json";
import hrBot from "./data/chatsHr.json";
import randomBot from "./data/chatsRandom.json";

function App() {
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState(icyBot);
  const [value, setValue] = React.useState("hr");
  const [input, setInput] = useState("");

  const configuration = new Configuration({
    apiKey: process.env.REACT_APP_OPEN_API_1,
  });
  const openai = new OpenAIApi(configuration);

  useEffect(() => {
    (async () => {
      const lastEntry = conversation[conversation.length - 1];
      if (lastEntry.user === "Human") {
        await getAIResponse();
      }
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation]);

  useEffect(() => {
    if (value === "icy") {
      setConversation(icyBot);
    } else if (value === "hr") {
      setConversation(hrBot);
    } else {
      setConversation(randomBot);
    }
  }, [value]);

  const handleInputChange = (event) => {
    setInput(event.target.value);
  };

  const sendMessage = () => {
    setConversation([
      ...conversation,
      {
        id: conversation.length + 1,
        user: "Human",
        message: input,
      },
    ]);

    setInput("");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  };

  const getAIResponse = async () => {
    try {
      let promptConversation = "";

      conversation.forEach((entry) => {
        if (entry.user === "Human") {
          promptConversation += `Human: ${entry.message}
          `;
        } else {
          promptConversation += `AI: ${entry.message}
          `;
        }
      });
      console.log(promptConversation);

      setLoading(true);
      const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: `This is a conversation with an AI assistant. The assistant is helpful, creative, clever, and very friendly.
        ${promptConversation}`,
        temperature: 0.3,
        max_tokens: 100,
        top_p: 0.5,
        frequency_penalty: 1.65,
        presence_penalty: 0.55,
        stop: [" Human:", " AI:"],
      });

      console.log(response.data.choices[0].text);
      setConversation([
        ...conversation,
        {
          id: conversation.length + 1,
          user: "AI",
          message: response.data.choices[0].text,
        },
      ]);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const handleChange = (event) => {
    setValue(event.target.value);
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
        <Typography sx={{ marginBottom: "40px", fontSize: "50px" }}>OpenAI Chatbot Demo</Typography>

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
              endDecorator={
                <Buttons input={input} setInput={setInput} sendMessage={sendMessage} type={value} />
              }
            />
          </Sheet>

          {/* Chat settings */}
          <Sheet
            sx={{ display: "flex", flexDirection: "row", marginTop: "20px", alignSelf: "baseline" }}
          >
            <FormControl>
              <FormLabel>Chat purpose</FormLabel>
              <RadioGroup
                defaultValue="hr"
                name="controlled-radio-buttons-group"
                value={value}
                onChange={handleChange}
                sx={{ my: 1 }}
              >
                <Radio value="hr" label="Human Resources assistant" />
                <Radio value="icy" label="CAI team-bot" />
                <Radio value="random" label="Random conversation buddy" />
              </RadioGroup>
            </FormControl>
          </Sheet>
        </Sheet>
      </Sheet>
    </CssVarsProvider>
  );
}

export default App;
