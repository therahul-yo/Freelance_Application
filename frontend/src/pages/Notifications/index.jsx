import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useNotifications } from "../../context/NotificationContext";
import { formatRelativeDate } from "../../utils/formatters";
import Button from "../../components/Button";

const Notifications = () => {
  const { notifications, markAsRead, markAllAsRead, fetchNotifications } = useNotifications();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case "message":
        return "💬";
      case "bid":
        return "📄";
      case "acceptance":
        return "✅";
      case "delivery":
        return "📦";
      case "completion":
        return "🎉";
      default:
        return "🔔";
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "message": return "var(--nb-blue)";
      case "bid": return "var(--nb-purple)";
      case "acceptance": return "var(--nb-lime)";
      case "delivery": return "var(--nb-orange)";
      case "completion": return "var(--nb-yellow)";
      default: return "var(--nb-yellow)";
    }
  };

  return (
    <div className="container page-section">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <span className="badge badge-pink" style={{ marginBottom: 12 }}>🔔 Updates</span>
          <h1 style={{ fontSize: 36, fontFamily: 'var(--font-display)', textTransform: 'uppercase' }}>
            Your Notifications
          </h1>
        </div>
        {notifications.some((n) => !n.isRead) && (
          <Button variant="outline" onClick={markAllAsRead}>
            ✓ Mark all as read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="card-static" style={{ textAlign: "center", padding: "60px 24px", background: 'var(--nb-cream)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔕</div>
          <p style={{ color: "var(--nb-text-secondary)", fontSize: 16 }}>No notifications yet.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {notifications.map((notification) => (
            <div
              key={notification._id}
              className={`card notification-item ${!notification.isRead ? 'unread' : ''}`}
              style={{
                opacity: notification.isRead ? 0.7 : 1,
                background: notification.isRead ? 'var(--nb-white)' : 'var(--nb-cream)',
              }}
            >
              <div 
                className="notification-icon"
                style={{ background: getNotificationColor(notification.type) }}
              >
                {getNotificationIcon(notification.type)}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ marginBottom: 8, fontWeight: 600, fontSize: 15, lineHeight: 1.4 }}>
                  {notification.content}
                </p>
                <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, color: "var(--nb-text-muted)", fontWeight: 700, textTransform: 'uppercase' }}>
                    {formatRelativeDate(notification.createdAt)}
                  </span>
                  <Link
                    to={notification.link}
                    style={{ 
                      fontSize: 13, 
                      color: "var(--nb-hot-pink)", 
                      fontWeight: 700,
                      borderBottom: '2px solid var(--nb-hot-pink)',
                    }}
                    onClick={() => markAsRead(notification._id)}
                  >
                    View Details →
                  </Link>
                  {!notification.isRead && (
                    <button
                      onClick={() => markAsRead(notification._id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--nb-text-muted)",
                        fontSize: 12,
                        cursor: "pointer",
                        fontWeight: 600,
                        textDecoration: "underline",
                        boxShadow: 'none',
                        padding: 0,
                      }}
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
