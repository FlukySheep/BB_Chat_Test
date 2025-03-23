import React, { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import './Chat.css';

// Remove react-chat-elements usage and show a basic UI for debugging
const socket = io('https://chat-server-xatf.onrender.com');

const Chat = () => {
  const [nickname, setNickname] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    console.log('Debug: messages updated', JSON.stringify(messages, null, 2));
  }, [messages]);

  useEffect(() => {
    console.log('React version:', React.version);
  }, []);

  const getDateString = () => {
    const dateStr = new Date().toISOString();
    console.log('Debug: Generating date string =>', dateStr);
    return dateStr;
  };

  const handleSendMessage = () => {
    if (!nickname.trim() || !input.trim()) return;

    const payload = { nickname, message: input };
    console.log('Debug: Emitting chat message =>', JSON.stringify(payload));

    socket.emit('chat message', payload);

    const outgoingMsg = {
      position: 'right',
      text: input,
      date: getDateString(),
    };
    console.log('Debug: Adding outgoing message =>', JSON.stringify(outgoingMsg));

    setMessages((prev) => [...prev, outgoingMsg]);
    setInput('');
  };

  const handleIncomingMessage = useCallback(
    (data) => {
      console.log('Debug: Incoming data =>', JSON.stringify(data));

      if (data.nickname === nickname) {
        console.log('Debug: Skipping own message...');
        return;
      }

      const incomingMsg = {
        position: 'left',
        text: data.message,
        date: getDateString(),
      };
      console.log('Debug: Adding incoming message =>', JSON.stringify(incomingMsg));

      setMessages((prev) => [...prev, incomingMsg]);
    },
    [nickname]
  );

  useEffect(() => {
    socket.on('chat message', handleIncomingMessage);
    return () => {
      socket.off('chat message', handleIncomingMessage);
    };
  }, [handleIncomingMessage]);

  return (
    <div className="chat-container">
      <h2>Basic Chat (No react-chat-elements)</h2>

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
        {messages.map((msg, i) => (
          <div
            key={i}
            className="message"
            style={{
              textAlign: msg.position === 'right' ? 'right' : 'left',
              margin: '5px 0'
            }}
          >
            <div
              style={{
                display: 'inline-block',
                padding: '8px 12px',
                borderRadius: '12px',
                backgroundColor: msg.position === 'right' ? '#cce5ff' : '#eeeeee'
              }}
            >
              <strong>{msg.position === 'right' ? nickname : 'Other'}: </strong>
              {msg.text}
              <div style={{ fontSize: '0.8em', color: '#666' }}>
                {msg.date}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="input-panel">
        <input
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') handleSendMessage();
          }}
        />
        <button onClick={handleSendMessage}>
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
