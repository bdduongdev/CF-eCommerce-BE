import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const orderDetailSchema = new Schema({
  order_id: {
    type: Schema.Types.ObjectId,
    ref: 'Order'
  },
  product_id: {
    type: Schema.Types.ObjectId,
    ref: 'Product'
  },
  quantity: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  note: {
    type: String
  }
});

export default mongoose.model('OrderDetail', orderDetailSchema);