import { useState, useEffect } from "react";
import Sheet from "@mui/joy/Sheet";
import Button from "@mui/joy/Button";

import IconButton from "@mui/joy/IconButton";
import CircularProgress from "@mui/joy/CircularProgress";
import EmojiObjectsOutlinedIcon from "@mui/icons-material/EmojiObjectsOutlined";
import { Configuration, OpenAIApi } from "openai";

const PROMPTS = {
  empty:
    "Will autocomplete the user's text with an possible question he has about Conversational Artificial Intelligence team from E.on",
  filled:
    "Will autocomplete the user's text with an possible question he has about Conversational Artificial Intelligence team from E.on. Will think like an e.on employee and will only give short completions:",
};

const Buttons = ({ input, setInput, sendMessage }) => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");

  useEffect(() => {
    const formattedResponse = response.replace(/\s+/g, " ").trim();
    setInput(input + " " + formattedResponse);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  const configuration = new Configuration({
    apiKey: process.env.REACT_APP_OPEN_API_1,
  });
  const openai = new OpenAIApi(configuration);

  const handleRequest = async () => {
    try {
      let prompt = `${PROMPTS.filled} 
        ${input}`;
      if (input === "") {
        prompt = PROMPTS.empty;
      }

      setLoading(true);
      const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: prompt,
        temperature: 0,
        max_tokens: 33,
        top_p: 0.5,
        frequency_penalty: 1.65,
        presence_penalty: 0.55,
      });

      setResponse(response.data.choices[0].text);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  return (
    <Sheet sx={{ display: "flex", flexDirection: "row" }}>
      <IconButton
        variant="plain"
        sx={{
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0,
          marginRight: "5px",
          "&:hover": { backgroundColor: "transparent" },
        }}
        onClick={handleRequest}
      >
        {loading ? <CircularProgress thickness={2} /> : <EmojiObjectsOutlinedIcon />}
      </IconButton>
      <Button sx={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }} onClick={sendMessage}>
        Send
      </Button>
    </Sheet>
  );
};

export default Buttons;
