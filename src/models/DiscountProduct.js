import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const DiscountProductSchema = new Schema({
  discount_id: {
    type: Schema.Types.ObjectId,
    ref: 'Discount',
    required: true
  },
  product_id: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: 'created_at' }
});

// Compound index to ensure unique discount-product combinations
DiscountProductSchema.index({ discount_id: 1, product_id: 1 }, { unique: true });

export default mongoose.model('DiscountProduct', DiscountProductSchema); 