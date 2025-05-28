import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const CouponSchema = new Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    maxlength: 50
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
  min_order_amount: {
    type: Number
  },
  max_uses: {
    type: Number
  },
  uses_count: {
    type: Number,
    default: 0
  },
  start_date: {
    type: Date
  },
  end_date: {
    type: Date
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: { createdAt: 'created_at' }
});

export default mongoose.model('Coupon', CouponSchema);