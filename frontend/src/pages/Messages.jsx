import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import Chat from '../components/Chat';
import '../styles/Messages.css';
import defaultAvatar from '../assets/default-avatar.svg';
import { ACCESS_TOKEN } from '../constants';
import { jwtDecode } from 'jwt-decode';

function getMediaUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `http://localhost:8000${path}`;
}

function Messages() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState(null);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPetsitter, setIsPetsitter] = useState(false);
  const navigate = useNavigate();
  const currentUserId = parseInt(localStorage.getItem('user_id'));

  useEffect(() => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (token) {
      const decoded = jwtDecode(token);
      setIsAdmin(decoded.role === 'admin');
    }
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem(ACCESS_TOKEN);
      if (!token) return;
      try {
        const res = await api.get('/api/v1/profile/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsPetsitter(res.data.is_petsitter || false);
      } catch (err) {
        setIsPetsitter(false);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      const response = await api.get('/api/v1/chats/');
      setChats(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching chats:', err);
      setError('Failed to load conversations');
      setLoading(false);
    }
  };

  const getOtherParticipant = (chat) => {
    if (chat.participant1 === currentUserId) {
      return {
        id: chat.participant2,
        username: chat.participant2_username,
        photo: chat.participant2_photo,
      };
    } else {
      return {
        id: chat.participant1,
        username: chat.participant1_username,
        photo: chat.participant1_photo,
      };
    }
  };

  const formatLastMessageTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' });
  };

  if (loading) {
    return (
      <div className="messages-page">
        <div className="loading-container">Loading conversations...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="messages-page">
        <div className="error-container">{error}</div>
      </div>
    );
  }

  return (
    <div className="messages-page">
      <nav className="top-nav">
        {isAdmin && (
          <Link to="/admin-users">ADMIN PANEL</Link>
        )}
        <Link to="/">HOME</Link>
        <a href="/visits">MY VISITS</a>
        <a href="/messages">MESSAGES</a>
        {!isPetsitter && (
          <Link to="/join-petsitter">JOIN AS PETSITTER</Link>
        )}
        <a href="/account">MY ACCOUNT</a>
        <a href="/logout">LOGOUT</a>
      </nav>

      <div className="messages-header">
        <h1>Messages</h1>
        <p className="messages-subtitle">Your conversations</p>
      </div>

      {chats.length === 0 ? (
        <div className="no-chats">
          <div className="no-chats-icon">💬</div>
          <h2>No messages yet</h2>
          <p>Start a conversation with a petsitter!</p>
          <button className="browse-petsitters-btn" onClick={() => navigate('/')}>
            Browse Petsitters
          </button>
        </div>
      ) : (
        <div className="chats-list">
          {chats.map((chat) => {
            const otherParticipant = getOtherParticipant(chat);
            const lastMessage = chat.last_message;
            const isUnread = chat.unread_count > 0;

            return (
              <div
                key={chat.id}
                className={`chat-item ${isUnread ? 'unread' : ''}`}
                onClick={() => setSelectedChat({
                  chatId: chat.id,
                  otherUser: otherParticipant
                })}
              >
                <div className="chat-avatar">
                  <img
                    src={otherParticipant.photo ? getMediaUrl(otherParticipant.photo) : defaultAvatar}
                    alt={otherParticipant.username}
                  />
                  {isUnread && <span className="unread-badge">{chat.unread_count}</span>}
                </div>

                <div className="chat-info">
                  <div className="chat-header-row">
                    <h3 className="chat-username">{otherParticipant.username}</h3>
                    {lastMessage && (
                      <span className="chat-time">
                        {formatLastMessageTime(lastMessage.created_at)}
                      </span>
                    )}
                  </div>

                  {lastMessage ? (
                    <p className="chat-preview">
                      {lastMessage.sender === currentUserId ? 'You: ' : ''}
                      {lastMessage.content}
                    </p>
                  ) : (
                    <p className="chat-preview no-messages">No messages yet</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedChat && (
        <Chat
          chatId={selectedChat.chatId}
          otherUserId={selectedChat.otherUser.id}
          otherUserName={selectedChat.otherUser.username}
          onClose={() => {
            setSelectedChat(null);
            fetchChats(); // Refresh chat list
          }}
        />
      )}
    </div>
  );
}

export default Messages;
