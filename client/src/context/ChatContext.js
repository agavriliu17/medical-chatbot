import { createContext, useState, useEffect } from "react";
import axios from "axios";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
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

  return (
    <ChatContext.Provider value={{ chatID, loadingCompletion, setLoadingCompletion }}>
      {children}
    </ChatContext.Provider>
  );
};

export default ChatContext;
