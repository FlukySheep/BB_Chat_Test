import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const socket = io('https://chat-server-xatf.onrender.com');

const Chat = () => {
    const [nickname, setNickname] = useState('');
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        socket.on('chat message', (msg) => {
            setMessages((prevMessages) => [...prevMessages, msg]);
        });

        return () => {
            socket.off('chat message');
        };
    }, []);

    const handleSendMessage = () => {
        if (nickname && message) {
            const msg = { nickname, message };
            socket.emit('chat message', msg);
            setMessage('');
        }
    };

    return (
        <div>
            <h2>Chat Room</h2>
            <input
                type="text"
                placeholder="Enter your nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
            />
            <input
                type="text"
                placeholder="Type a message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
            />
            <button onClick={handleSendMessage}>Send</button>
            <div>
                {messages.map((msg, index) => (
                    <div key={index}>
                        <strong>{msg.nickname}: </strong>{msg.message}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Chat;
