import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const RefreshTokenSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  refresh_token: {
    type: String,
    required: true,
    maxlength: 500
  },
  user_agent: {
    type: String,
    maxlength: 255
  },
  ip_address: {
    type: String,
    maxlength: 50
  },
  is_revoked: {
    type: Boolean,
    default: false
  },
  expires_at: {
    type: Date,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('RefreshToken', RefreshTokenSchema);