const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const socket = require('socket.io');
const userRoutes = require('./routes/userRoutes');
const { connect } = require('http2');
const Messages = require('./model/messageModel')
require('./connection');
dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
const rooms = ['general', 'tech', 'crypto', 'finance'];

const server = require('http').createServer(app);

const PORT = 5000;

const io = socket(server, {
  cors: {
    origin: 'http://localhost:3000',
    method: ['GET', 'POST'],
  },
});


app.get('/rooms', (req, res) => {
  res.json(rooms)
})

async function getLastMessagesFromRoom(room){
  let roomMessages = await Messages.aggregate([
    {$match: {to: room}},
    {$group: {_id: '$date', messageByDate: {push: '$$ROOT'}}}
  ])
  return roomMessages;
}

io.on('connection', (socket) => {
socket.on('join-room', async (room) => {
  socket.join(room);
  let roomMessages = await getLastMessagesFromRoom(room)
})
})
  
server.listen(PORT, () => {
  console.log(`server running on ${PORT}`);
});

app.use('/', userRoutes);


