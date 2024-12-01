import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from 'uuid';
import {
  Avatar,
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import axios from "axios";

type Message = {
  id: string; 
  sender: "user" | "bot";
  text: string;
};

type ChatRequest = {
  question: string;
  context: string;
  user_id: string;
  message_id:string;
};

export const ChatUI: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [userMessage, setUserMessage] = useState<string>("");
  const [context, setContext] = useState<string>("Onboarding");
  const [selectedMessage, setSelectedMessage] = useState<Message|null>();

  // User Authentication
  const userId = localStorage.getItem("userId");
  const handleLogout = () => {
    localStorage.removeItem("userId");
    navigate("/login");
  };

  const fetchConversations = async () => {
    try {
      if (!userId) return;
  
      const response = await axios.get(`http://localhost:8001/chatbot/conversations/${userId}`);
      const conversation = response.data.conversations; // This is an object, not an array
  
      // Extract messages from the conversation object
      const allMessages = conversation.messages.map((msg: any) => ({
        sender: msg.sender,
        text: msg.content,
        id : msg.message_id,
      }));
  
      // Set messages or a default message
      setMessages(allMessages.length > 0 ? allMessages: []);
    } catch (error : any) {
      setMessages([]);
    }
  };

  useEffect(() => {
    if (!userId) {
      navigate("/login");
    }
    fetchConversations();
  }, []);

  const sendMessage = async () => {
    if (!userMessage.trim()) return;

    const newMessage: Message = {
      id: uuidv4(),
      sender: "user",
      text: userMessage,
    };

    setMessages((prev) => [...prev, newMessage]);

    try {
      const payload: ChatRequest = {
        question: userMessage,
        message_id : newMessage.id,
        context,
        user_id: userId || "",
      };

      const response = await axios.post("http://localhost:8001/chatbot/", payload);

      const botMessage: Message = {
        id: response?.data?.message_id,
        sender: "bot",
        text: response?.data?.response || "Sorry, I couldn't understand that.",
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error communicating with the backend:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          sender: "bot",
          text: "Something went wrong. Please try again.",
        },
      ]);
    }

    setUserMessage("");
  };

  const handleContextChange = (event: SelectChangeEvent) => {
    setContext(event.target.value as string);
  };

  // Long Press Detection
  const handleLongPress = (message: Message) => {
    if (message && message.id) {
      setSelectedMessage(message);  // This should set the message with its ID
    } else {
      console.error('Message does not have an id');
    }
  };

  // Edit Message
  const handleSaveEdit = async () => {
    if (selectedMessage) {
      
      try {
        // Call the backend API to edit the message
        const response = await axios.post(`http://localhost:8001/chatbot/conversations/update`, 
          {
            message_id: 'd0e79f44-d40e-46da-920a-5546ceda2f90',
            new_content: 'Testing from react', 
            user_id:'af1b68b0-19e5-48d2-bcb0-ee4301ab64ad'
          }
        );
        console.log(response.data);
        setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg.id === selectedMessage.id ? { ...msg, text: selectedMessage.text } : msg
            ));  
  
        setSelectedMessage(null);
      } catch (error) {
        console.error("Error updating message:", error);
      }
    }
  };

  // Delete Message
  const handleDelete = async () => {
    if (selectedMessage) {
      try {
        // Call the backend API to delete the message
        await axios.delete(
          `http://localhost:8001/chatbot/conversations/${userId}`,
          {
            params: { message_id: selectedMessage.id }, // Pass `message_id` as a query parameter
          }
        );
  
        // Remove the deleted message locally
        setMessages((prevMessages) =>
          prevMessages.filter((msg) => msg.id !== selectedMessage.id)
        );
  
        // Reset the selected message
        setSelectedMessage(null);
      } catch (error) {
        console.error("Error deleting the message:", error);
      }
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: 2,
      }}
    >
      <Typography variant="h4" gutterBottom>
        Welcome to the Chat Bot
      </Typography>
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        {/* Chat Header */}
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar sx={{ bgcolor: "purple" }}>A</Avatar>
          <Typography variant="h6" sx={{ ml: 2 }}>
            Hey👋, I'm Ava, ask me your questions
          </Typography>
        </Box>

        {/* Chat Messages */}
        <Paper elevation={3} sx={{ p: 2, mb: 2, height: "400px", overflowY: "scroll" }}>
          {messages.map((message, index) => (
            <Box
              key={message.id}
              onContextMenu={(e) => {
                e.preventDefault();
                handleLongPress(message);
              }}
              display="flex"
              justifyContent={message.sender === "user" ? "flex-end" : "flex-start"}
              mb={1}
            >
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: message.sender === "user" ? "primary.main" : "grey.300",
                  color: message.sender === "user" ? "white" : "black",
                  maxWidth: "75%",
                }}
              >
                <Typography>{message.text}</Typography>
              </Box>
            </Box>
          ))}
        </Paper>

        {/* User Input */}
        <Box display="flex" gap={2}>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel id="context-label">Context</InputLabel>
            <Select
              labelId="context-label"
              value={context}
              onChange={handleContextChange}
            >
              <MenuItem value="Onboarding">Onboarding</MenuItem>
              <MenuItem value="Test">Test</MenuItem>
              <MenuItem value="Application">Application</MenuItem>
              <MenuItem value="Eligibility">Eligibility</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            placeholder="Your question"
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          />
          <Button variant="contained" onClick={sendMessage}>
            Send
          </Button>
        </Box>
      </Container>
      <Button variant="contained" color="secondary" onClick={handleLogout} sx={{ mt: 2 }}>
        Logout
      </Button>

      {/* Edit/Delete Dialog */}
      <Dialog open={Boolean(selectedMessage)} onClose={() => setSelectedMessage(null)}>
        <DialogTitle>Edit or Delete Message</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            value={selectedMessage?.text || ""}
            onChange={(e) =>
              setSelectedMessage((prev) =>
                prev ? { ...prev, text: e.target.value } : null
              )
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDelete} color="secondary">
            Delete
          </Button>
          <Button onClick={handleSaveEdit} color="primary">
            Save
          </Button>
          <Button onClick={() => setSelectedMessage(null)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
