import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const wishlistItemSchema = new Schema({
  wishlist_id: {
    type: Schema.Types.ObjectId,
    ref: 'Wishlist'
  },
  product_id: {
    type: Schema.Types.ObjectId,
    ref: 'Product'
  },
  added_at: {
    type: Date,
    default: Date.now
  },
  note: {
    type: String
  }
}, {
  timestamps: { createdAt: 'added_at' }
});

export default mongoose.model('WishlistItem', wishlistItemSchema);