import React, { useState, useEffect } from 'react';
import api from '../api';
import '../styles/NotificationDropdown.css';

function NotificationDropdown({ onClose, onNotificationRead }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/api/v1/notifications/');
      setNotifications(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.patch(`/api/v1/notifications/${notificationId}/read/`);
      setNotifications(notifications.map(notif =>
        notif.id === notificationId ? { ...notif, is_read: true } : notif
      ));
      onNotificationRead();
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/api/v1/notifications/read-all/');
      setNotifications(notifications.map(notif => ({ ...notif, is_read: true })));
      onNotificationRead();
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'visit_created':
        return '📅';
      case 'visit_confirmed':
        return '✅';
      case 'visit_canceled':
        return '❌';
      case 'review_received':
        return '⭐';
      default:
        return '🔔';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Przed chwilą';
    if (diffMins < 60) return `${diffMins} min temu`;
    if (diffHours < 24) return `${diffHours} godz. temu`;
    if (diffDays < 7) return `${diffDays} dni temu`;
    return date.toLocaleDateString('pl-PL');
  };

  if (loading) {
    return (
      <div className="notification-dropdown">
        <div className="notification-header">
          <h3>Notyfikacje</h3>
        </div>
        <div className="notification-loading">Ładowanie...</div>
      </div>
    );
  }

  return (
    <div className="notification-dropdown">
      <div className="notification-header">
        <h3>Notyfikacje</h3>
        {notifications.some(n => !n.is_read) && (
          <button className="mark-all-read-btn" onClick={markAllAsRead}>
            Oznacz wszystkie jako przeczytane
          </button>
        )}
      </div>

      <div className="notification-list">
        {notifications.length === 0 ? (
          <div className="no-notifications">Brak notyfikacji</div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
              onClick={() => !notification.is_read && markAsRead(notification.id)}
            >
              <div className="notification-icon">
                {getNotificationIcon(notification.notification_type)}
              </div>
              <div className="notification-content">
                <div className="notification-title">{notification.title}</div>
                <div className="notification-message">{notification.message}</div>
                <div className="notification-time">{formatDate(notification.created_at)}</div>
              </div>
              {!notification.is_read && <div className="unread-indicator"></div>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default NotificationDropdown;
