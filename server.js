const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const socket = require('socket.io');
const userRoutes = require('./routes/userRoutes');
const { connect } = require('http2');
const Messages = require('./model/messageModel');
const User = require('./model/userModel');
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

async function getLastMessagesFromRoom(room) {
  let roomMessages = await Messages.aggregate([
    { $match: { to: room } },
    { $group: { _id: '$date', messageByDate: { $push: '$$ROOT' } } },
  ]);
  return roomMessages;
}

function sortRoomMessagesByDate(messages) {
  return messages.sort(function (a, b) {
    let date1 = a._id.split('/');
    let date2 = b._id.split('/');

    date1 = date1[2] + date1[0] + date1[1];
    date2 = date2[2] + date2[0] + date2[1];
    return date1 < date2 ? -1 : 1;
  });
}

io.on('connection', (socket) => {
  socket.on('new-user', async () => {
    const members = await User.find();
    io.emit('new-user', members);
  });

  socket.on('join-room', async (room) => {
    socket.join(room);
    let roomMessages = await getLastMessagesFromRoom(room);
    roomMessages = sortRoomMessagesByDate(roomMessages);
    socket.emit('room-messages', roomMessages);
    // //sending message to room
    io.to(room).emit('room-messages', roomMessages);
    socket.broadcast.emit('notifications', room);
  });

  socket.on('message-room', async (room, content, sender, time, date) => {
    const newMessage = await Messages.create({
      content,
      from: sender,
      time,
      date,
      to: room,
    });
    let roomMessages = await getLastMessagesFromRoom(room);
    roomMessages = sortRoomMessagesByDate(roomMessages);

    //sending message to room
    io.to(room).emit('room-messages', roomMessages);
    socket.broadcast.emit('notifications', room);
  });

  app.delete('/logout', async (req, res) => {
    try {
      const { _id, newMessage } = req.body; 
      const user = await User.findById(_id);
      user.status = 'offline';
      user.newMessage = newMessage;
      await user.save();
      const members = await User.find();
      socket.broadcast.emit('new-user', members);
      res.status(200).json({ message: 'successfully logout' });
    } catch (e) {
      res.status(400).json({ message: 'logout unsuccessful', data: {} });
    }
  });
});

app.get('/rooms', (req, res) => {
  res.json(rooms);
});

server.listen(PORT, () => {
  console.log(`server running on ${PORT}`);
});

app.use('/', userRoutes);
