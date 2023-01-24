import { useState, useEffect } from "react";
import Sheet from "@mui/joy/Sheet";
import Button from "@mui/joy/Button";

import IconButton from "@mui/joy/IconButton";
import CircularProgress from "@mui/joy/CircularProgress";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useDropzone } from "react-dropzone";
import axios from "axios";

const Buttons = ({ sendMessage }) => {
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const { getRootProps, getInputProps, open } = useDropzone({
    noClick: true,
    noKeyboard: true,
    onDropAccepted: (files) => {
      setFiles(files);
    },
    accept: {
      "image/jpeg": [],
      "image/png": [],
    },
  });

  useEffect(() => {
    if (files.length > 0) {
      handleUpload();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  const handleUpload = async () => {
    setLoading(true);

    const file = files[0];
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios
        .post(`http://127.0.0.1:8000/upload_file/`, formData)
        .then((res) => res.data);

      console.log(response);

      // settimeout to simulate loading
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  return (
    <Sheet
      sx={{ display: "flex", flexDirection: "row" }}
      {...getRootProps({ className: "dropzone" })}
    >
      <input {...getInputProps()} />
      <IconButton
        variant="plain"
        sx={{
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0,
          marginRight: "5px",
          "&:hover": { backgroundColor: "transparent" },
        }}
        onClick={open}
      >
        {loading ? <CircularProgress thickness={2} /> : <CloudUploadIcon />}
      </IconButton>
      <Button sx={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }} onClick={sendMessage}>
        Send
      </Button>
    </Sheet>
  );
};

export default Buttons;
