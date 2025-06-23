import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const CartItemSchema = new Schema({
  cart_id: {
    type: Schema.Types.ObjectId,
    ref: 'Cart'
  },
  variant_id: {
    type: Schema.Types.ObjectId,
    ref: 'ProductVariant'
  },
  quantity: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  added_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: 'added_at' }
});

export default mongoose.model('CartItem', CartItemSchema);