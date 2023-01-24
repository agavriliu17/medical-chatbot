import React from "react";
import Sheet from "@mui/joy/Sheet";
import ChatBubble from "./ChatBubble";

const ChatWindows = ({ conversation }) => {
  return (
    <Sheet
      sx={{
        minHeight: "400px",
        maxHeight: "550px",
        height: "100%",
        width: "500px",
        borderRadius: "10px",
        boxShadow:
          "0 0 0 1px rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.05), 0 1px 3px 1px rgba(0, 0, 0, 0.05)",
        marginBottom: "10px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        overflowY: "scroll",
      }}
    >
      <Sheet sx={{ height: "20px" }} />
      {conversation.map((convo, index) => (
        <ChatBubble key={index} user={convo.type} text={convo.message} />
      ))}
    </Sheet>
  );
};

export default ChatWindows;
