import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useLocation, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import io from "socket.io-client";
import Button from "../../components/Button";

const ENDPOINT = "http://localhost:5001";
let socket;

const Chat = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const messagesEndRef = useRef(null);
  
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [socketConnected, setSocketConnected] = useState(false);

  // Initialize socket
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    
    return () => {
      if (socket) socket.disconnect();
    };
  }, [user]);

  // Fetch user's chats
  useEffect(() => {
    if (user) {
      fetchChats();
    }
  }, [user]);

  // Handle incoming chat from navigation
  useEffect(() => {
    if (location.state?.selectedChatId && chats.length > 0) {
      const chat = chats.find(c => c._id === location.state.selectedChatId);
      if (chat) {
        setSelectedChat(chat);
        fetchMessages(chat._id);
      }
    }
  }, [location.state, chats]);

  // Listen for new messages
  useEffect(() => {
    if (!socket) return;
    
    const handleNewMessage = (newMsg) => {
      if (selectedChat && selectedChat._id === newMsg.chat._id) {
        setMessages(prev => [...prev, newMsg]);
      }
      fetchChats();
    };

    socket.on("message recieved", handleNewMessage);

    return () => {
      socket.off("message recieved", handleNewMessage);
    };
  }, [selectedChat]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchChats = async () => {
    try {
      const { data } = await axios.get(`${ENDPOINT}/api/chat`);
      setChats(data);
    } catch (error) {
      console.error("Error fetching chats:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      const { data } = await axios.get(`${ENDPOINT}/api/message/${chatId}`);
      setMessages(data);
      if (socket) socket.emit("join chat", chatId);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const selectChat = (chat) => {
    setSelectedChat(chat);
    fetchMessages(chat._id);
  };

  const sendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    try {
      const { data } = await axios.post(`${ENDPOINT}/api/message`, {
        content: newMessage,
        chatId: selectedChat._id
      });
      
      if (socket) socket.emit("new message", data);
      setMessages(prev => [...prev, data]);
      setNewMessage("");
      fetchChats();
    } catch (error) {
      console.error("Send message error:", error);
      toast.error("Failed to send message");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getChatName = (chat) => {
    if (!chat.users) return "Chat";
    const otherUser = chat.users.find(u => u._id !== user._id);
    return otherUser?.name || "Chat";
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatChatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 24) return formatTime(dateString);
    if (hours < 48) return "Yesterday";
    return date.toLocaleDateString();
  };

  if (!user) return null;

  return (
    <div style={{ display: "flex", height: "calc(100vh - 57px)" }}>
      {/* Chat List Sidebar */}
      <div style={{ 
        width: "320px", 
        borderRight: "1px solid var(--color-border)",
        display: "flex",
        flexDirection: "column"
      }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--color-border)" }}>
          <h2 style={{ fontSize: "18px" }}>Messages</h2>
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {loading ? (
            <p style={{ padding: "20px", color: "var(--color-text-secondary)" }}>Loading...</p>
          ) : chats.length === 0 ? (
            <div style={{ padding: "40px 20px", textAlign: "center" }}>
              <p style={{ color: "var(--color-text-secondary)", marginBottom: "16px", fontSize: "14px" }}>
                No conversations yet
              </p>
              <p style={{ color: "var(--color-text-tertiary)", fontSize: "13px" }}>
                Start a conversation by hiring a freelancer or applying to a job
              </p>
            </div>
          ) : (
            chats.map(chat => (
              <div
                key={chat._id}
                onClick={() => selectChat(chat)}
                style={{
                  padding: "16px 20px",
                  borderBottom: "1px solid var(--color-border)",
                  cursor: "pointer",
                  background: selectedChat?._id === chat._id ? "var(--color-bg-secondary)" : "transparent",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <h4 style={{ fontSize: "14px" }}>{getChatName(chat)}</h4>
                  <span style={{ fontSize: "11px", color: "var(--color-text-tertiary)" }}>
                    {formatChatTime(chat.latestMessage?.createdAt)}
                  </span>
                </div>
                <p style={{ 
                  fontSize: "13px", 
                  color: "var(--color-text-secondary)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap"
                }}>
                  {chat.latestMessage?.content || "Start a conversation"}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {selectedChat ? (
          <>
            <div style={{ 
              padding: "16px 24px", 
              borderBottom: "1px solid var(--color-border)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <h3 style={{ fontSize: "16px" }}>{getChatName(selectedChat)}</h3>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
              {messages.length === 0 ? (
                <p style={{ textAlign: "center", color: "var(--color-text-tertiary)" }}>
                  No messages yet. Say hello!
                </p>
              ) : (
                messages.map(msg => (
                  <div
                    key={msg._id}
                    style={{
                      display: "flex",
                      justifyContent: msg.sender._id === user._id ? "flex-end" : "flex-start",
                      marginBottom: "16px"
                    }}
                  >
                    <div style={{
                      maxWidth: "60%",
                      background: msg.sender._id === user._id ? "var(--color-bg-tertiary)" : "var(--color-bg-secondary)",
                      padding: "12px 16px",
                      borderRadius: msg.sender._id === user._id ? "16px 16px 4px 16px" : "16px 16px 16px 4px"
                    }}>
                      <p style={{ fontSize: "14px", lineHeight: "1.5" }}>{msg.content}</p>
                      <p style={{ fontSize: "11px", color: "var(--color-text-tertiary)", marginTop: "6px" }}>
                        {formatTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} style={{ padding: "16px 24px", borderTop: "1px solid var(--color-border)" }}>
              <div style={{ display: "flex", gap: "12px" }}>
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="input-field"
                  style={{ flex: 1 }}
                />
                <Button type="submit">Send</Button>
              </div>
            </form>
          </>
        ) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ textAlign: "center" }}>
              <h3 style={{ fontSize: "18px", marginBottom: "8px" }}>Select a conversation</h3>
              <p style={{ fontSize: "14px", color: "var(--color-text-secondary)" }}>
                Choose a chat from the list to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
