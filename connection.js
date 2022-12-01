const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(
  process.env.DB_USER,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  () => {
    console.log('CONNECTED TO MONGODB');
  }
);
