import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const productSchema = new Schema({
  product_name: {
    type: String,
    required: true,
    maxlength: 100
  },
  description: {
    type: String
  },
  price: {
    type: Number,
    required: true
  },
  stock_quantity: {
    type: Number,
    required: true,
    default: 0
  },
  category_id: {
    type: Schema.Types.ObjectId,
    ref: 'Category'
  },
  color_id: {
    type: Schema.Types.ObjectId,
    ref: 'ProductColor'
  },
  storage_id: {
    type: Schema.Types.ObjectId,
    ref: 'ProductStorage'
  },
  image_url: {
    type: String,
    maxlength: 255
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

export default mongoose.model('Product', productSchema);