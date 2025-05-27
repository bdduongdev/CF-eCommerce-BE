import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const PaymentSchema = new Schema({
  order_id: {
    type: Schema.Types.ObjectId,
    ref: 'Order'
  },
  payment_date: {
    type: Date,
    default: Date.now
  },
  amount: {
    type: Number,
    required: true
  },
  payment_method: {
    type: String,
    maxlength: 50
  }
}, {
  timestamps: { createdAt: 'payment_date' }
});

export default mongoose.model('Payment', PaymentSchema);