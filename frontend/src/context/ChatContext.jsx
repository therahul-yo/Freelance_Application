/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import io from "socket.io-client";
import { SOCKET_URL } from "../lib/api";

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

var socket;

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [selectedChat, setSelectedChat] = useState();
  const [chats, setChats] = useState([]);
  const [notification, setNotification] = useState([]);

  useEffect(() => {
    if (user) {
      socket = io(SOCKET_URL, { withCredentials: true });
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
