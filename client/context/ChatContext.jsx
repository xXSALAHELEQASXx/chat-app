import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
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
  const saveTimeoutRef = useRef(null);

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

  // Send normal message with optimistic UI update
  const sendMessage = async (messageData) => {
    try {
      // Optimistically add message immediately
      const optimisticMessage = {
        senderId: authUser._id,
        receiverId: selectedUser._id,
        text: messageData.text,
        image: messageData.image,
        createdAt: new Date().toISOString(),
        _id: `temp-${Date.now()}` // Temporary ID
      };
      
      setMessages(prev => [...prev, optimisticMessage]);

      // Send to backend
      const { data } = await axios.post(`/api/messages/send/${selectedUser._id}`, messageData);
      
      if (data.success) {
        // Replace optimistic message with real one from server
        setMessages(prev => 
          prev.map(msg => 
            msg._id === optimisticMessage._id ? data.newMessage : msg
          )
        );
      } else {
        // Remove optimistic message on failure
        setMessages(prev => prev.filter(msg => msg._id !== optimisticMessage._id));
        toast.error(data.message);
      }
    } catch (error) {
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg._id.startsWith('temp-')));
      toast.error(error.message);
    }
  };

  // Send message to AI via backend
  const sendMessageToAI = async (text) => {
    try {
      const response = await fetch("http://localhost:5000/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text }),
      });

      if (!response.ok) {
        toast.error(`Network error: ${response.status}`);
        return;
      }

      const data = await response.json();

      if (!data.success || !data.reply) {
        toast.error(data.message || "AI response failed");
        return;
      }

      // Add AI response to messages
      const aiMessage = {
        senderId: "AI",
        receiverId: authUser._id,
        text: data.reply,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMessage]);

    } catch (error) {
      console.error("AI message error:", error);
      toast.error("Failed to get AI response");
    }
  };

  // Subscribe to messages
  const subscribeToMessages = useCallback(() => {
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
  }, [socket, selectedUser, axios]);

  const unsubscribeFromMessages = useCallback(() => {
    if (socket) socket.off("newMessage");
  }, [socket]);

  useEffect(() => {
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [subscribeToMessages, unsubscribeFromMessages]);

  // Load AI messages when opening AI chat
  useEffect(() => {
    if (selectedUser?._id === "AI") {
      const savedAIChat = localStorage.getItem("ai_chat");
      if (savedAIChat) {
        try {
          setMessages(JSON.parse(savedAIChat));
        } catch (error) {
          console.error("Failed to load AI chat:", error);
        }
      }
    }
  }, [selectedUser]);

  // Debounced save to localStorage (only for AI chat)
  useEffect(() => {
    if (selectedUser?._id === "AI" && messages.length > 0) {
      // Clear previous timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      // Save after 500ms of no changes (debounced)
      saveTimeoutRef.current = setTimeout(() => {
        localStorage.setItem("ai_chat", JSON.stringify(messages));
      }, 500);
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
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