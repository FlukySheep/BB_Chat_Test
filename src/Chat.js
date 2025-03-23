import React, { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import 'react-chat-elements/dist/main.css';
import { MessageList, Input } from 'react-chat-elements';
import './Chat.css';

const socket = io('https://chat-server-xatf.onrender.com');

const Chat = () => {
  const [nickname, setNickname] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  // Additional debugging: watch the messages state changes
  useEffect(() => {
    console.log('Debug: messages updated', JSON.stringify(messages, null, 2));
  }, [messages]);

  useEffect(() => {
    // Also log the React version
    console.log('React version:', React.version);
  }, []);

  const getDateString = () => {
    // Another debug log showing the date is a string
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
      type: 'text',
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
        type: 'text',
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
      <h2>More Debugging for Minified React Error #290</h2>

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
