const mongoose = require('mongoose');
const schema = mongoose.Schema;
const messageSchema = new schema({
  content: String,
  from: Object,
  socketid: String,
  time: String,
  date: String,
  to: String,
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
