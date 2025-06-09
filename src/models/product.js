import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
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
  status: {
    type: String,
    enum: ['active', 'inactive', 'out_of_stock', 'discontinued'],
    default: 'active'
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
  is_deleted: {
    type: Boolean,
    default: false
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
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  indexes: [{ key: { is_deleted: 1 } }]
});

export default mongoose.model('Product', ProductSchema);