import React, { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { ChatFeed, Message as ChatMessage } from 'react-chat-ui';
import './Chat.css';

// We are using the server on Render
const socket = io('https://chat-server-xatf.onrender.com');

const Chat = () => {
  const [nickname, setNickname] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  // Log messages for debugging
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
      id: 0, // Represent the current user
      message: input,
      senderName: nickname,
      dateString: getDateString(),
    };
    console.log('Debug: Adding outgoing message =>', JSON.stringify(outgoingMsg));

    setMessages((prev) => [...prev, outgoingMsg]);
    setInput('');
  };

  const handleIncomingMessage = useCallback(
    (data) => {
      console.log('Debug: Incoming data =>', JSON.stringify(data));

      // If it's from ourselves, skip
      if (data.nickname === nickname) {
        console.log('Debug: Skipping own message...');
        return;
      }

      const incomingMsg = {
        id: 1, // Represent other user
        message: data.message,
        senderName: data.nickname,
        dateString: getDateString(),
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

  // Convert our messages to react-chat-ui compatible
  const chatMessages = messages.map((msg) => {
    return new ChatMessage({
      id: msg.id,
      message: msg.message,
      senderName: msg.senderName,
      // The library doesn't handle date natively, so let's store as a custom property
      customJson: { dateString: msg.dateString },
    });
  });

  return (
    <div className="chat-container">
      <h2>Mobile Messenger-style Chat with react-chat-ui</h2>

      {/* Nickname input */}
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

      {/* Chat feed */}
      <div className="messages-panel" style={{ height: '400px', overflowY: 'auto', border: '1px solid #ccc', margin: '10px 0' }}>
        <ChatFeed
          messages={chatMessages}
          showSenderName
          bubbleStyles={{
            text: {
              fontSize: 16
            },
            chatbubble: {
              borderRadius: 20,
              padding: 10
            }
          }}
        />
      </div>

      {/* Input panel */}
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
