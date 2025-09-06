import mongoose from 'mongoose';

const warningSchema = new mongoose.Schema({
  userId: {
    type: String,
    ref: 'User',
    required: true
  },
  response: { // Add this field for user responses
    type: String,
    default: null
  },
  respondedAt: { // Add timestamp for when user responded
    type: Date,
    default: null
  },
  adminId: {
    type: String,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  is_read: { type: Boolean, default: false },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    default: null,
  },
  status: {
    type: String,
    enum: ['active', 'resolved'],
    default: 'active'
  },
  isResolved: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  resolvedAt: {
    type: Date,
    default: null,
  }
}, { timestamps: true });

export default mongoose.models.Warning || mongoose.model('Warning', warningSchema);