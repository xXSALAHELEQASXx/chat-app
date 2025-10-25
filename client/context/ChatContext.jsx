import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";
import assets from "../src/assets/assets";


const AI_USER = {
  _id: "AI",
  name: "ChatBot",
  avatar: <img src={assets.profile_martin}/>
};

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});

  const { socket, axios, authUser } = useContext(AuthContext);

  // Get all users
  const getUsers = async () => {
    try {
      const { data } = await axios.get("/api/messages/users");
      if (data.success) {
        setUsers(data.users);
        setUnseenMessages(data.unseenMessages);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Get messages for selected user
  const getMessages = async (userId) => {
    try {
      const { data } = await axios.get(`/api/messages/${userId}`);
      if (data.success) setMessages(data.messages);
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Send normal message
  const sendMessage = async (messageData) => {
    try {
      const { data } = await axios.post(`/api/messages/send/${selectedUser._id}`, messageData);
      if (data.success) setMessages(prev => [...prev, data.newMessage]);
      else toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Send message to AI via backend
const sendMessageToAI = async (text) => {
  try {
    console.log("Sending prompt to backend:", text);

    const response = await fetch("http://localhost:5000/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: text }),
    });

    if (!response.ok) {
      console.error("Network response was not ok:", response.status, response.statusText);
      toast.error(`Network error: ${response.status}`);
      return;
    }

    const data = await response.json();
    console.log("Raw AI response from backend:", data);

    if (!data.success) {
      console.warn("Backend returned success=false:", data);
      toast.error(data.message || "AI response failed");
      return;
    }

    if (!data.reply) {
      console.warn("Backend success=true but no reply field found:", data);
      toast.error("AI response empty");
      return;
    }

    // Add AI response to messages
    const aiMessage = {
      senderId: "AI",
      receiverId: authUser._id,
      text: data.reply,
      createdAt: new Date().toISOString(),
    };

    console.log("Adding AI message to chat:", aiMessage);
    setMessages((prev) => [...prev, aiMessage]);

  } catch (error) {
    console.error("AI message error:", error);
    toast.error("Failed to get AI response");
  }
};

  // Subscribe to messages
  const subscribeToMessages = () => {
    if (!socket) return;

    socket.on("newMessage", (newMessage) => {
      if (selectedUser && newMessage.senderId === selectedUser._id) {
        newMessage.seen = true;
        setMessages(prev => [...prev, newMessage]);
        axios.put(`/api/messages/mark/${newMessage._id}`);
      } else {
        setUnseenMessages(prev => ({
          ...prev,
          [newMessage.senderId]: prev[newMessage.senderId] ? prev[newMessage.senderId] + 1 : 1
        }));
      }
    });
  };

  const unsubscribeFromMessages = () => {
    if (socket) socket.off("newMessage");
  };

  useEffect(() => {
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [socket, selectedUser]);

  // 🧠 Save and load AI chat messages locally
useEffect(() => {
  // Load saved AI messages when opening AI chat
  if (selectedUser?._id === "AI") {
    const savedAIChat = localStorage.getItem("ai_chat");
    if (savedAIChat) {
      setMessages(JSON.parse(savedAIChat));
    }
  }
}, [selectedUser]);

useEffect(() => {
  // Save AI chat messages whenever they change
  if (selectedUser?._id === "AI") {
    localStorage.setItem("ai_chat", JSON.stringify(messages));
  }
}, [messages, selectedUser]);

  return (
    <ChatContext.Provider value={{
      messages,
      setMessages,
      users,
      selectedUser,
      getUsers,
      getMessages,
      sendMessage,
      sendMessageToAI,
      setSelectedUser,
      unseenMessages,
      setUnseenMessages
    }}>
      {children}
    </ChatContext.Provider>
  );
};