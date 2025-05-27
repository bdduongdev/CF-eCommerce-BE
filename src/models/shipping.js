import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const ShippingSchema = new Schema({
  order_id: {
    type: Schema.Types.ObjectId,
    ref: 'Order'
  },
  shipping_address: {
    type: String,
    maxlength: 255
  },
  shipping_date: {
    type: Date
  },
  shipping_status: {
    type: String,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending',
    maxlength: 50
  }
});

export default mongoose.model('Shipping', ShippingSchema);