const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Vui lòng nhập tên người dùng'],
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Vui lòng nhập email'],
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Vui lòng nhập mật khẩu'],
    minlength: 6,
    select: false
  },
  avatar: {
    type: String,
    default: 'default-avatar.jpg'
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  bio: {
    type: String,
    maxLength: [200, 'Giới thiệu không được quá 200 ký tự']
  },
  dateOfBirth: Date,
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  socialLinks: {
    facebook: String,
    twitter: String,
    instagram: String
  },
  readingHistory: [{
    manga: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Manga'
    },
    lastChapter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chapter'
    },
    lastReadAt: {
      type: Date,
      default: Date.now
    }
  }],
  favoriteGenres: [String],
  notifications: {
    email: {
      type: Boolean,
      default: true
    },
    newChapter: {
      type: Boolean,
      default: true
    },
    comments: {
      type: Boolean,
      default: true
    }
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

module.exports = mongoose.model('User', userSchema);