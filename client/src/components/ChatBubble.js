import React from "react";
import Sheet from "@mui/joy/Sheet";
import Avatar from "@mui/joy/Avatar";
import Typography from "@mui/joy/Typography";

import AiAvatar from "../images/chatbot_avatar.webp";
import { LoadingChat } from "./LoadingChat";

const ChatBubble = ({ user = "bot", text, loading }) => {
  return (
    <Sheet
      sx={{
        display: "flex",
        flexDirection: "row",
        justifyContent: user === "bot" ? "flex-start" : "flex-end",
        alignItems: "flex-start",
      }}
    >
      {user === "bot" && (
        <Avatar src={AiAvatar} sx={{ width: "40px", height: "40px", margin: "10px" }} />
      )}
      <Sheet
        sx={{
          backgroundColor: "#f1f0f0",
          borderRadius: "10px",
          padding: "10px 15px",
          margin: "10px",
          maxWidth: "300px",
        }}
      >
        {loading ? <LoadingChat /> : <Typography>{text}</Typography>}
      </Sheet>
      {user !== "bot" && (
        <Avatar
          src="https://avatars.githubusercontent.com/u/75184750?v=4"
          sx={{ width: "40px", height: "40px", margin: "10px" }}
        />
      )}
    </Sheet>
  );
};

export default ChatBubble;
