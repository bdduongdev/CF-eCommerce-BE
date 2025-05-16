import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const orderStatusHistorySchema = new Schema({
  order_id: {
    type: Schema.Types.ObjectId,
    ref: 'Order'
  },
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'],
    maxlength: 50
  },
  changed_by: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  changed_at: {
    type: Date,
    default: Date.now
  },
  note: {
    type: String
  }
}, {
  timestamps: { createdAt: 'changed_at' }
});

export default mongoose.model('OrderStatusHistory', orderStatusHistorySchema);