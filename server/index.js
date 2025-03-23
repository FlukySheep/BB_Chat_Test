const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3001',
    methods: ['GET', 'POST']
  }
});

// Enable CORS
app.use(cors({
  origin: 'http://localhost:3001',
  methods: ['GET','POST']
}));

app.get('/', (req, res) => {
    res.send('Chat server is running');
});

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Change the port to 4000 to avoid conflicts
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
