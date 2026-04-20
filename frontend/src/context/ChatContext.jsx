import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import io from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

const ENDPOINT = import.meta.env.VITE_SOCKET_URL || API_URL;
var socket;

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [selectedChat, setSelectedChat] = useState();
  const [chats, setChats] = useState([]);
  const [notification, setNotification] = useState([]);

  useEffect(() => {
    if (user) {
      socket = io(ENDPOINT);
      socket.emit("setup", user);
      socket.on("connected", () => console.log("Socket Connected"));
    }
  }, [user]);

  return (
    <ChatContext.Provider
      value={{
        selectedChat,
        setSelectedChat,
        chats,
        setChats,
        notification,
        setNotification,
        socket,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
