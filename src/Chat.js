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

  // Instead of storing a Date object, store a string to avoid serialization issues
  const getDateString = () => {
    return new Date().toISOString();
  };

  // Log any data being sent to 'chat message'
  const handleSendMessage = () => {
    if (!nickname.trim() || !input.trim()) return;

    const payload = { nickname, message: input };
    console.log('Emitting chat message:', payload);

    socket.emit('chat message', payload);

    // Store date as a string
    const outgoingMsg = {
      position: 'right',
      type: 'text',
      text: input,
      date: getDateString(),
    };
    console.log('Adding outgoing message to state:', outgoingMsg);

    setMessages((prev) => [...prev, outgoingMsg]);
    setInput('');
  };

  // Stable callback for incoming messages
  const handleIncomingMessage = useCallback(
    (data) => {
      console.log('Incoming data from server:', data);

      // If it's our own message, skip
      if (data.nickname === nickname) return;

      const incomingMsg = {
        position: 'left',
        type: 'text',
        text: data.message,
        date: getDateString(),
      };
      console.log('Adding incoming message to state:', incomingMsg);

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
      <h2>Debugging React Error #290 (Store Date as String)</h2>

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
