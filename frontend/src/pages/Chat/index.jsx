import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import io from "socket.io-client";
import Button from "../../components/Button";
import { useAuth } from "../../context/AuthContext";
import api, { SOCKET_URL } from "../../lib/api";
import { formatRelativeDate, getUserInitials } from "../../utils/formatters";

let socket;

const chatAvatarColors = ['var(--nb-pink)', 'var(--nb-blue)', 'var(--nb-lime)', 'var(--nb-yellow)', 'var(--nb-purple)', 'var(--nb-orange)'];

const Chat = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const messagesEndRef = useRef(null);
  const selectedChatRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  const loadChats = async () => {
    const { data } = await api.get("/chat");
    setChats(data);
    return data;
  };

  const handleHireNow = async () => {
    if (!selectedChat?.contextBidId) return;
    try {
      await api.put(`/bids/${selectedChat.contextBidId}/accept`);
      toast.success("Freelancer hired successfully!");
      loadChats();
      // Hide button after success
      setSelectedChat(prev => ({ ...prev, contextBidId: null }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Hiring failed");
    }
  };

  const handleOrderGig = async () => {
    if (!selectedChat?.contextId) return;
    try {
      await api.post(`/gigs/${selectedChat.contextId}/purchase`);
      toast.success("Gig ordered successfully! Project is now in-progress.");
      loadChats();
      // Hide button after success
      setSelectedChat(prev => ({ ...prev, contextType: null }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Order failed");
    }
  };

  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    socket = io(SOCKET_URL, { withCredentials: true });
    socket.emit("setup", user);

    socket.on("message received", (incomingMessage) => {
      if (selectedChatRef.current?._id === incomingMessage.chat?._id) {
        setMessages((current) => [...current, incomingMessage]);
      }

      loadChats().catch(() => {});
    });

    return () => {
      socket?.disconnect();
    };
  }, [navigate, user]);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      try {
        const nextChats = await loadChats();
        const requestedChatId = location.state?.selectedChatId;

        if (requestedChatId) {
          const requestedChat = nextChats.find((chat) => chat._id === requestedChatId);
          if (requestedChat) {
            setSelectedChat(requestedChat);
          }
          window.history.replaceState({}, document.title);
        } else if (nextChats[0]) {
          setSelectedChat((current) => current || nextChats[0]);
        }
      } catch {
        toast.error("Could not load conversations");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [location.state, user]);

  useEffect(() => {
    if (!selectedChat) return;

    const loadMessages = async () => {
      try {
        const { data } = await api.get(`/message/${selectedChat._id}`);
        setMessages(data);
        socket?.emit("join chat", selectedChat._id);
      } catch {
        toast.error("Could not load messages");
      }
    };

    loadMessages();
  }, [selectedChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (event) => {
    event?.preventDefault();

    if (!newMessage.trim() || !selectedChat || sending) {
      return;
    }

    const draft = newMessage;
    setNewMessage("");
    setSending(true);

    try {
      const { data } = await api.post("/message", {
        chatId: selectedChat._id,
        content: draft.trim(),
      });

      socket?.emit("new message", data);
      setMessages((current) => [...current, data]);
      await loadChats();
    } catch (error) {
      setNewMessage(draft);
      toast.error(error.response?.data?.message || "Message failed to send");
    } finally {
      setSending(false);
    }
  };

  const getOtherUser = (chat) =>
    chat?.users?.find((chatUser) => chatUser._id !== user?._id);

  if (!user) return null;

  return (
    <div className="container page-section">
      <div className="card-static chat-container">
        {/* Sidebar */}
        <div className="chat-sidebar">
          <div className="chat-sidebar-header">
            <h1 style={{ fontSize: 26, marginBottom: 4, fontFamily: 'var(--font-display)', textTransform: 'uppercase' }}>
              💬 Messages
            </h1>
            <p style={{ color: "var(--nb-text-secondary)", fontSize: 13 }}>
              Every hiring conversation in one place.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            {loading ? (
              <div style={{ padding: 20 }} className="neo-loading">Loading conversations...</div>
            ) : chats.length === 0 ? (
              <div style={{ padding: 24 }}>
                <p style={{ color: "var(--nb-text-secondary)", marginBottom: 12 }}>
                  No conversations yet.
                </p>
                <Button variant="outline" onClick={() => navigate(user.role === "client" ? "/gigs" : "/projects")}>
                  {user.role === "client" ? "Browse gigs" : "Browse projects"}
                </Button>
              </div>
            ) : (
              chats.map((chat, idx) => {
                const otherUser = getOtherUser(chat);
                const active = selectedChat?._id === chat._id;

                return (
                  <button
                    key={chat._id}
                    type="button"
                    onClick={() => setSelectedChat(chat)}
                    className={`chat-contact ${active ? 'active' : ''}`}
                  >
                    <div style={{ display: "flex", gap: 12 }}>
                      <div
                        className="chat-contact-avatar"
                        style={{ background: chatAvatarColors[idx % chatAvatarColors.length] }}
                      >
                        {getUserInitials(otherUser?.name)}
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: 12,
                            marginBottom: 4,
                          }}
                        >
                          <p style={{ fontWeight: 700, fontFamily: 'var(--font-heading)', fontSize: 14 }}>
                            {otherUser?.name || "Conversation"}
                          </p>
                          <span style={{ color: "var(--nb-text-muted)", fontSize: 11, fontWeight: 600 }}>
                            {formatRelativeDate(chat.latestMessage?.createdAt || chat.createdAt)}
                          </span>
                        </div>
                        <p
                          style={{
                            color: "var(--nb-text-secondary)",
                            fontSize: 13,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {chat.latestMessage?.content || "Start the conversation"}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Main */}
        <div className="chat-main">
          {selectedChat ? (
            <>
              <div className="chat-header">
                <div
                  className="chat-header-avatar"
                >
                  {getUserInitials(getOtherUser(selectedChat)?.name)}
                </div>
                <div>
                  <h2 style={{ fontSize: 22, fontFamily: 'var(--font-heading)' }}>
                    {getOtherUser(selectedChat)?.name || "Conversation"}
                  </h2>
                  <p style={{ color: "var(--nb-text-secondary)", fontSize: 13 }}>
                    {getOtherUser(selectedChat)?.profile?.title || "Marketplace member"}
                  </p>
                </div>
              </div>

              {selectedChat.contextTitle && (
                <div className="chat-context-bar">
                  <p style={{ fontSize: 13, color: "var(--nb-text-secondary)" }}>
                    Discussing: <strong>{selectedChat.contextTitle}</strong>
                  </p>
                  <div style={{ display: "flex", gap: 8 }}>
                    {user.role === "client" &&
                      selectedChat.contextType === "project" &&
                      selectedChat.contextBidId && (
                        <Button style={{ padding: "6px 16px", fontSize: 12 }} onClick={handleHireNow}>
                          ✅ Hire Now
                        </Button>
                      )}
                    {user.role === "client" &&
                      selectedChat.contextType === "gig" &&
                      selectedChat.contextId && (
                        <Button style={{ padding: "6px 16px", fontSize: 12 }} onClick={handleOrderGig}>
                          🛒 Order Gig
                        </Button>
                      )}
                  </div>
                </div>
              )}

              <div className="chat-messages">
                {messages.length === 0 ? (
                  <div className="card-static" style={{ textAlign: "center", background: 'var(--nb-cream)', padding: 32 }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>👋</div>
                    No messages yet. Break the ice and set the next step.
                  </div>
                ) : (
                  messages.map((message) => {
                    const mine = message.sender?._id === user._id;

                    return (
                      <div
                        key={message._id}
                        style={{
                          display: "flex",
                          justifyContent: mine ? "flex-end" : "flex-start",
                          marginBottom: 14,
                        }}
                      >
                        <div className={`chat-bubble ${mine ? 'chat-bubble-mine' : 'chat-bubble-other'}`}>
                          <p style={{ whiteSpace: "pre-wrap" }}>{message.content}</p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={sendMessage} className="chat-input-bar">
                <textarea
                  className="input-field"
                  rows="2"
                  placeholder="Write your message..."
                  value={newMessage}
                  onChange={(event) => setNewMessage(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      sendMessage(event);
                    }
                  }}
                  style={{ resize: "none", boxShadow: 'none' }}
                />
                <Button type="submit" disabled={sending}>
                  {sending ? "..." : "Send →"}
                </Button>
              </form>
            </>
          ) : (
            <div style={{ padding: 40, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>💬</div>
              <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: 8, fontSize: 22 }}>Select a conversation</h3>
              <p style={{ color: 'var(--nb-text-secondary)' }}>Choose a chat from the sidebar to start messaging.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
