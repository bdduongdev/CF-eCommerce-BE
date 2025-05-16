import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const discountSchema = new Schema({
  product_id: {
    type: Schema.Types.ObjectId,
    ref: 'Product'
  },
  discount_type: {
    type: String,
    required: true,
    enum: ['percentage', 'fixed'],
    maxlength: 20
  },
  discount_value: {
    type: Number,
    required: true
  },
  start_date: {
    type: Date,
    required: true
  },
  end_date: {
    type: Date,
    required: true
  },
  description: {
    type: String
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: 'created_at' }
});

export default mongoose.model('Discount', discountSchema);