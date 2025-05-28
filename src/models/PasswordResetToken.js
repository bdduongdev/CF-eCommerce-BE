import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const PasswordResetTokenSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  email: {
    type: String,
    required: true
  },
  token: {
    type: String,
    required: true
  },
  expires: {
    type: Date,
    required: true
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600
  }
});

export default mongoose.model('PasswordResetToken', PasswordResetTokenSchema);