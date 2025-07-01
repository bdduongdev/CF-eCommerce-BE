import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const ReviewSchema = new Schema({
  product_id: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: false
  },
  variant_id: {
    type: Schema.Types.ObjectId,
    ref: 'ProductVariant',
    required: true
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  comment: {
    type: String
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

export default mongoose.model('Review', ReviewSchema);