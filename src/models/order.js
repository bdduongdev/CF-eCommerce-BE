import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  coupon_id: {
    type: Schema.Types.ObjectId,
    ref: 'Coupon'
  },
  order_date: {
    type: Date,
    default: Date.now
  },
  total_amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending',
    maxlength: 50
  }
}, {
  timestamps: { createdAt: 'order_date' }
});

export default mongoose.model('Order', orderSchema);