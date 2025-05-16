import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const wishlistSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  note: {
    type: String
  }
}, {
  timestamps: { createdAt: 'created_at' }
});

export default mongoose.model('Wishlist', wishlistSchema);