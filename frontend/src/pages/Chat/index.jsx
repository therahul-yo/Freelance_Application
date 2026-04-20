import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import io from "socket.io-client";
import Button from "../../components/Button";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const ENDPOINT = import.meta.env.VITE_SOCKET_URL || API_URL;
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
  const [sending, setSending] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Initialize socket
  useEffect(() => {
    if (!user) return;
    
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    
    socket.on("message recieved", (newMsg) => {
      if (selectedChat && selectedChat._id === newMsg.chat._id) {
        setMessages(prev => [...prev, newMsg]);
      }
      fetchChats();
    });

    return () => {
      if (socket) {
        socket.off("message recieved");
        socket.disconnect();
      }
    };
  }, [user, selectedChat]);

  // Fetch chats on load
  useEffect(() => {
    if (user) fetchChats();
  }, [user]);

  // Handle navigation state (when coming from "Hire Me" button)
  useEffect(() => {
    if (location.state?.selectedChatId && chats.length > 0) {
      const chat = chats.find(c => c._id === location.state.selectedChatId);
      if (chat) {
        setSelectedChat(chat);
        fetchMessages(chat._id);
        // Clear the state to prevent re-selection on refresh
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state, chats]);

  // Scroll to bottom on new messages
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
    setMessages([]);
    fetchMessages(chat._id);
  };

  const sendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !selectedChat || sending) return;

    setSending(true);
    const messageText = newMessage;
    setNewMessage("");

    try {
      const { data } = await axios.post(`${ENDPOINT}/api/message`, {
        content: messageText,
        chatId: selectedChat._id
      });
      
      if (socket) socket.emit("new message", data);
      setMessages(prev => [...prev, data]);
      fetchChats();
    } catch (error) {
      console.error("Send message error:", error);
      toast.error("Failed to send message");
      setNewMessage(messageText); // Restore message on failure
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getChatName = (chat) => {
    if (!chat?.users) return "Chat";
    const otherUser = chat.users.find(u => u._id !== user?._id);
    return otherUser?.name || "Chat";
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
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
              <p style={{ color: "var(--color-text-secondary)", marginBottom: "8px", fontSize: "14px" }}>
                No conversations yet
              </p>
              <p style={{ color: "var(--color-text-tertiary)", fontSize: "13px" }}>
                {user.role === "client" 
                  ? "Browse talent and click 'Hire Me' to start a chat"
                  : "Apply to jobs or wait for clients to contact you"
                }
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
                  transition: "background 0.15s"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <h4 style={{ fontSize: "14px" }}>{getChatName(chat)}</h4>
                  <span style={{ fontSize: "11px", color: "var(--color-text-tertiary)" }}>
                    {formatChatTime(chat.latestMessage?.createdAt || chat.createdAt)}
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
              <div>
                <h3 style={{ fontSize: "16px" }}>{getChatName(selectedChat)}</h3>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
              {messages.length === 0 ? (
                <div style={{ textAlign: "center", marginTop: "40px" }}>
                  <p style={{ color: "var(--color-text-tertiary)", marginBottom: "8px" }}>
                    No messages yet
                  </p>
                  <p style={{ fontSize: "13px", color: "var(--color-text-tertiary)" }}>
                    Send a message to start the conversation!
                  </p>
                </div>
              ) : (
                messages.map(msg => (
                  <div
                    key={msg._id}
                    style={{
                      display: "flex",
                      justifyContent: msg.sender?._id === user._id ? "flex-end" : "flex-start",
                      marginBottom: "16px"
                    }}
                  >
                    <div style={{
                      maxWidth: "60%",
                      background: msg.sender?._id === user._id ? "var(--color-bg-tertiary)" : "var(--color-bg-secondary)",
                      padding: "12px 16px",
                      borderRadius: msg.sender?._id === user._id ? "16px 16px 4px 16px" : "16px 16px 16px 4px"
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
                  disabled={sending}
                />
                <Button type="submit" disabled={sending || !newMessage.trim()}>
                  {sending ? "..." : "Send"}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "40px", marginBottom: "16px" }}>💬</p>
              <h3 style={{ fontSize: "18px", marginBottom: "8px" }}>Your Messages</h3>
              <p style={{ fontSize: "14px", color: "var(--color-text-secondary)" }}>
                Select a conversation to start chatting
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
