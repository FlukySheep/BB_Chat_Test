import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { ChatFeed, Message } from 'react-chat-ui';
import './Chat.css'; // We'll create this file for custom styling

// Connect to the Render server
const socket = io('https://chat-server-xatf.onrender.com');

const Chat = () => {
  // We'll store messages in the format used by react-chat-ui
  const [messages, setMessages] = useState([]);
  const [nickname, setNickname] = useState('');
  const [input, setInput] = useState('');

  useEffect(() => {
    // Listen for incoming messages from the server
    socket.on('chat message', handleIncomingMessage);

    // Cleanup listener on component unmount
    return () => {
      socket.off('chat message');
    };
  }, []);

  // Convert data from the server into a "Message" object for react-chat-ui
  const handleIncomingMessage = (data) => {
    const newMessage = new Message({
      id: data.nickname === nickname ? 0 : data.nickname, // 0 is the "client user"
      message: data.message,
      senderName: data.nickname,
    });
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleSendMessage = () => {
    if (!nickname.trim() || !input.trim()) return;

    const data = { nickname, message: input };
    socket.emit('chat message', data);

    // We also add our own message to the local array
    const newMessage = new Message({
      id: 0, // by convention, "0" is current user
      message: input,
      senderName: nickname,
    });
    setMessages((prev) => [...prev, newMessage]);

    setInput('');
  };

  return (
    <div className="chat-container">
      <h2>React Chat UI</h2>
      <div className="nickname-panel">
        <label htmlFor="nickname">Nickname:</label>
        <input
          id="nickname"
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="Choose a nickname"
        />
      </div>
      <div className="chat-feed-container">
        <ChatFeed
          messages={messages}
          showSenderName
          bubbleStyles={{
            text: {
              fontSize: 16,
            },
            chatbubble: {
              borderRadius: 15,
              padding: 10,
            },
          }}
        />
      </div>
      <div className="input-panel">
        <input
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chat;
