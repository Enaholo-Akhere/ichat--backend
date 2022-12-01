const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');
const schema = mongoose.Schema;

const userSchema = new schema(
  {
    name: {
      type: String,
      required: [true, 'cannot be blank'],
    },
    email: {
      type: String,
      lowercase: true,
      unique: true,
      required: [true, 'cannot be blank'],
      index: true,
      validate: [isEmail, 'invalid email'],
    },
    password: {
      type: String,
      required: [true, 'cannot be blank'],
    },
    picture: {
      type: String,
    },
    newMessage: {
      type: Object,
      default: {},
    },
    status: {
      type: String,
      default: 'online',
    },
  },
  { timestamps: true, minimize: false }
);

userSchema.pre('save', function (next) {
  const user = this;
  if (!user.isModified('password')) return next();

  bcrypt.genSalt(10, function (err, salt) {
    if (err) return next(err);
    bcrypt.hash(user.password, salt, function (err, hashedPassword) {
      if (err) return next(err);

      user.password = hashedPassword;
      next();
    });
  });
});

userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();
  delete userObject.password;
  return userObject;
};

userSchema.statics.findByCredentials = async function (email, password) {
  const user = await User.findOne({ email });
  if (!user) throw new Error('invalid email or password');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error('invalid email or password');
  return user;
};

const User = mongoose.model('Users', userSchema);

module.exports = User;
