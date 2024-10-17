import mongoose from 'mongoose';

const traderProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  performance: {
    allTime: Number,
    lastMonth: Number,
    lastWeek: Number
  },
  // Add other social trading related fields as needed
}, { timestamps: true });

export const TraderProfile = mongoose.model('TraderProfile', traderProfileSchema);