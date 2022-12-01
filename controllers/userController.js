const User = require('../model/userModel');
const axios = require('axios');

const signup = async (req, res) => {
  try {
    const { name, email, password, picture } = req.body;
    console.log(req.body);
    const user = await User.create({ name, email, password, picture });
    res.status(201).json(user);
  } catch (error) {
    console.log(error);
    let msg = '';
    if (error.code === 11000) {
      msg = 'user already exists';
    } else {
      msg = error.message;
    }
    res.status(400).json(msg);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findByCredentials(email, password);
    await user.save();
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json(error.message);
  }
};

module.exports = {
  signup,
  login,
};
