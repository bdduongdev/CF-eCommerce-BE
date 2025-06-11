import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const WishlistItemSchema = new Schema({
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
  }
}, {
  timestamps: { createdAt: 'added_at' }
});

export default mongoose.model('WishlistItem', WishlistItemSchema);