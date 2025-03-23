import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import 'react-chat-elements/dist/main.css';
import { MessageList, Input } from 'react-chat-elements';
import './Chat.css';

const socket = io('https://chat-server-xatf.onrender.com');

const Chat = () => {
  // Remove any references that could cause repeated re-rendering
  const [nickname, setNickname] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  // Set up the socket listener only once
  useEffect(() => {
    socket.on('chat message', (data) => {
      // For safety, remove referencing nickname in determining position
      setMessages((prev) => [
        ...prev,
        {
          position: 'left', // Simplify by always placing new incoming messages on the left
          type: 'text',
          text: data.message,
          date: new Date()
        },
      ]);
    });

    return () => {
      socket.off('chat message');
    };
  }, []);

  const handleSendMessage = () => {
    if (!nickname.trim() || !input.trim()) return;

    socket.emit('chat message', { nickname, message: input });

    // Place your own messages on the right
    setMessages((prev) => [
      ...prev,
      {
        position: 'right', 
        type: 'text',
        text: input,
        date: new Date()
      }
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
          lockable
          toBottomHeight="100%"
          dataSource={messages}
        />
      </div>

      <div className="input-panel">
        <Input
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') handleSendMessage();
          }}
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
