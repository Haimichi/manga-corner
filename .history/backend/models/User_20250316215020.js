const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Vui lòng cung cấp tên người dùng'],
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Vui lòng cung cấp email'],
    unique: true,
    lowercase: true,
    // validate: [validator.isEmail, 'Vui lòng cung cấp email hợp lệ']
  },
  password: {
    type: String,
    required: [true, 'Vui lòng cung cấp mật khẩu'],
    minlength: 6,
    select: false
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationOTP: String,
  emailVerificationExpires: Date,
  avatar: {
    type: String,
    default: 'default-avatar.jpg'
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  translatorInfo: {
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    languages: [String],
    experience: String,
    application: {
      message: String,
      applyDate: Date
    }
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
  createdAt: {
    type: Date,
    default: Date.now
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(inputPassword) {
  return await bcrypt.compare(inputPassword, this.password);
};

userSchema.methods.matchPassword = async function(enteredPassword) {
  try {
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (error) {
    console.error('Lỗi khi so sánh mật khẩu:', error);
    throw new Error('Lỗi xác thực mật khẩu');
  }
};

userSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

module.exports = mongoose.model('User', userSchema);