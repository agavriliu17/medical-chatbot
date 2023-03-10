import React from "react";
import Sheet from "@mui/joy/Sheet";
import Avatar from "@mui/joy/Avatar";
import Typography from "@mui/joy/Typography";

import AiAvatar from "../images/chatbot_avatar.webp";
import { LoadingChat } from "./LoadingChat";

const ChatBubble = ({ user = "bot", text, loading, image = false }) => {
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
        {image ? (
          <img
            src={text}
            alt="Patient disease"
            style={{
              display: "block",
              maxWidth: "275px",
              maxHeight: "125px",
              width: "auto",
              height: "auto",
            }}
          />
        ) : loading ? (
          <LoadingChat />
        ) : (
          <Typography>{text}</Typography>
        )}
      </Sheet>
      {user !== "bot" && (
        <Avatar
          src="https://api.dicebear.com/5.x/shapes/svg?seed=Miss%20kitty"
          sx={{ width: "40px", height: "40px", margin: "10px" }}
        />
      )}
    </Sheet>
  );
};

export default ChatBubble;
