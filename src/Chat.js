import React, { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import './Chat.css';

const socket = io('https://chat-server-xatf.onrender.com');

const StickerList = [
  'https://cdn-icons-png.flaticon.com/512/742/742751.png',
  'https://cdn-icons-png.flaticon.com/512/742/742753.png',
  'https://cdn-icons-png.flaticon.com/512/742/742748.png'
];

const ChatComponent = () => {
  const [nickname, setNickname] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [showStickers, setShowStickers] = useState(false);

  useEffect(() => {
    console.log('Debug: messages updated', JSON.stringify(messages, null, 2));
  }, [messages]);

  const getDateString = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Send a text message
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
      nickname
    };
    setMessages((prev) => [...prev, outgoingMsg]);
    setInput('');
  };

  // Send a sticker message
  const handleSendSticker = (stickerUrl) => {
    if (!nickname.trim()) return;

    const payload = { nickname, message: `STICKER:${stickerUrl}` };
    console.log('Debug: Emitting sticker =>', JSON.stringify(payload));

    socket.emit('chat message', payload);

    const outgoingMsg = {
      position: 'right',
      type: 'sticker',
      stickerUrl,
      date: getDateString(),
      nickname
    };
    setMessages((prev) => [...prev, outgoingMsg]);
    setShowStickers(false);
  };

  // Handle incoming messages from other users
  const handleIncomingMessage = useCallback(
    (data) => {
      console.log('Debug: Incoming data =>', JSON.stringify(data));
      if (data.nickname === nickname) {
        return; // skip own message
      }
      let messageType = 'text';
      let stickerUrl = '';
      // Check if it's a sticker
      if (data.message.startsWith('STICKER:')) {
        messageType = 'sticker';
        stickerUrl = data.message.replace('STICKER:', '');
      }

      const incomingMsg = {
        position: 'left',
        type: messageType,
        text: messageType === 'text' ? data.message : '',
        stickerUrl,
        date: getDateString(),
        nickname: data.nickname
      };
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

  const toggleStickers = () => {
    setShowStickers((prev) => !prev);
  };

  return (
    <div className="chat-container">
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

      <div className="messages-panel">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`messageRow ${msg.position}`}
          >
            <div
              className={`messageBubble ${
                msg.position === 'left' ? 'leftBubble' : 'rightBubble'
              }`}
            >
              <span className="messageNickname">{msg.nickname}:</span>
              {msg.type === 'sticker' && msg.stickerUrl ? (
                <img
                  src={msg.stickerUrl}
                  alt="Sticker"
                  style={{ maxHeight: '80px', display: 'block', marginTop: '4px' }}
                />
              ) : (
                <span>{msg.text}</span>
              )}
              <div className="messageTime">{msg.date}</div>
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
        <button onClick={handleSendMessage}>Send</button>
        <button onClick={toggleStickers} style={{ marginLeft: '6px' }}>
          Stickers
        </button>
      </div>

      {showStickers && (
        <div
          style={{
            backgroundColor: '#eee',
            padding: '10px',
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          {StickerList.map((url) => (
            <img
              key={url}
              src={url}
              alt="Sticker"
              style={{ width: '50px', height: '50px', margin: '0 5px', cursor: 'pointer' }}
              onClick={() => handleSendSticker(url)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatComponent;
