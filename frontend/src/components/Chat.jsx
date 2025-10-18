import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import '../styles/Chat.css';

const Chat = ({ chatId, otherUserId, otherUserName, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [ws, setWs] = useState(null);
  const messagesEndRef = useRef(null);
  const currentUserId = parseInt(localStorage.getItem('user_id'));
  const messageIdsRef = useRef(new Set());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize chat
  useEffect(() => {
    const initializeChat = async () => {
      try {
        let currentChatId = chatId;

        // If no chatId, create or get chat
        if (!currentChatId && otherUserId) {
          const response = await api.post('/api/v1/chats/create/', {
            other_user_id: otherUserId,
          });
          currentChatId = response.data.id;
        }

        if (currentChatId) {
          // Load message history
          const messagesResponse = await api.get(`/api/v1/chats/${currentChatId}/messages/`);
          const historyMessages = messagesResponse.data;
          setMessages(historyMessages);

          // Track existing message IDs
          historyMessages.forEach(msg => {
            messageIdsRef.current.add(msg.id);
          });

          // Connect to WebSocket
          const token = localStorage.getItem('access');
          const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
          const wsUrl = `${wsProtocol}//localhost:8000/ws/chat/${currentChatId}/?token=${token}`;

          const websocket = new WebSocket(wsUrl);

          websocket.onopen = () => {
            console.log('WebSocket connected');
          };

          websocket.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === 'message') {
              const incomingMessage = data.message;

              // Only add message if we haven't seen it before
              if (!messageIdsRef.current.has(incomingMessage.id)) {
                messageIdsRef.current.add(incomingMessage.id);
                setMessages((prev) => [...prev, incomingMessage]);
              }
            }
          };

          websocket.onerror = (error) => {
            console.error('WebSocket error:', error);
          };

          websocket.onclose = () => {
            console.log('WebSocket disconnected');
          };

          setWs(websocket);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error initializing chat:', error);
        setLoading(false);
      }
    };

    initializeChat();

    // Cleanup on unmount
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [chatId, otherUserId]);

  const sendMessage = (e) => {
    e.preventDefault();

    if (!newMessage.trim() || !ws) return;

    const messageData = {
      type: 'message',
      content: newMessage.trim(),
    };

    ws.send(JSON.stringify(messageData));
    setNewMessage('');
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return <div className="chat-loading">Ładowanie czatu...</div>;
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3>Czat z {otherUserName}</h3>
        <button className="chat-close-btn" onClick={onClose}>✕</button>
      </div>

      <div className="chat-messages">
        {messages.map((message) => {
          const messageSender = parseInt(message.sender);
          const isSent = messageSender === currentUserId;

          return (
            <div
              key={message.id}
              className={`chat-message ${isSent ? 'sent' : 'received'}`}
            >
              <div className="message-content">
                <p>{message.content}</p>
                <span className="message-time">{formatTime(message.created_at)}</span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-form" onSubmit={sendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Napisz wiadomość..."
          className="chat-input"
        />
        <button type="submit" className="chat-send-btn" disabled={!newMessage.trim()}>
          Wyślij
        </button>
      </form>
    </div>
  );
};

export default Chat;
