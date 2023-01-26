import { createContext, useState, useEffect } from "react";
import axios from "axios";

const ChatContext = createContext();

const startingConversation = [
  {
    message: "Hello, I am medical assistance chatbot. What can I help you with?",
    type: "bot",
    timestamp: new Date().getTime(),
  },
];

export const ChatProvider = ({ children }) => {
  const [conversation, setConversation] = useState(startingConversation);
  const [chatID, setChatID] = useState("");
  const [loadingCompletion, setLoadingCompletion] = useState(false);

  useEffect(() => {
    (async () => {
      if (!chatID) {
        const response = await axios.get("http://127.0.0.1:8000/start_conversation");

        setChatID(response.data);
      }
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addMessage = (message, type) => {
    if (type === "user") {
      setConversation([
        ...conversation,
        {
          message,
          type: "user",
          timestamp: new Date().getTime(),
        },
      ]);
    } else if (type === "image") {
      setConversation([
        ...conversation,
        {
          message,
          type: "user",
          timestamp: new Date().getTime(),
          image: true,
        },
      ]);
    } else {
      console.log(conversation);
      setConversation((prev) => [...prev, message]);
    }
  };

  return (
    <ChatContext.Provider
      value={{ conversation, addMessage, chatID, loadingCompletion, setLoadingCompletion }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export default ChatContext;
