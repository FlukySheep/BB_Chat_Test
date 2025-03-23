import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import 'react-chat-elements/dist/main.css';
import { MessageBox, MessageList, Input } from 'react-chat-elements';
import './Chat.css'; // optional custom styling

// Connect to the Render server
const socket = io('https://chat-server-xatf.onrender.com');

const Chat = () => {
  const [nickname, setNickname] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  // Setup incoming messages
  useEffect(() => {
    socket.on('chat message', handleIncomingMessage);

    return () => {
      socket.off('chat message', handleIncomingMessage);
    };
  }, [nickname]);

  // Convert the incoming data into the format for react-chat-elements
  const handleIncomingMessage = (data) => {
    setMessages((prev) => [
      ...prev,
      {
        position: nickname === data.nickname ? 'right' : 'left',
        type: 'text',
        text: data.message,
        title: data.nickname,
        date: new Date(),
      },
    ]);
  };

  const handleSendMessage = () => {
    if (!nickname.trim() || !input.trim()) return;

    // Emit to server
    socket.emit('chat message', { nickname, message: input });

    // Also add your own message locally
    setMessages((prev) => [
      ...prev,
      {
        position: 'right',
        type: 'text',
        text: input,
        title: nickname,
        date: new Date(),
      },
    ]);

    setInput('');
  };

  return (
    <div className="chat-container">
      <h2>react-chat-elements Demo</h2>
      <div className="nickname-panel">
        <label htmlFor="nickname">Nickname:</label>
        <input
          id="nickname"
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="Choose a nickname"
          style={{ marginLeft: '8px' }}
        />
      </div>

      <div className="messages-panel">
        <MessageList
          className="message-list"
          lockable={true}
          toBottomHeight="100%"
          dataSource={messages}
        />
      </div>

      <div className="input-panel">
        <Input
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          rightButtons={
            <button onClick={handleSendMessage}>
              Send
            </button>
          }
        />
      </div>
    </div>
  );
};

export default Chat;
