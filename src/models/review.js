import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  product_id: {
    type: Schema.Types.ObjectId,
    ref: 'Product'
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String
  },
  review_date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: 'review_date' }
});

export default mongoose.model('Review', reviewSchema);