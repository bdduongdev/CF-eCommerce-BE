import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const ProductVariantSchema = new Schema({
  product_id: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  color_id: {
    type: Schema.Types.ObjectId,
    ref: 'ProductColor',
    required: true
  },
  storage_id: {
    type: Schema.Types.ObjectId,
    ref: 'ProductStorage',
    required: true
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
  image_url: {
    type: String,
    maxlength: 255,
  },
  image_gallery: {
    type: [String],
    default: []
  },
  sku: {
    type: String,
    unique: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'out_of_stock'],
    default: 'active'
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
  indexes: [
    { key: { product_id: 1, color_id: 1, storage_id: 1 }, unique: true },
    { key: { sku: 1 } }
  ]
});

export default mongoose.model('ProductVariant', ProductVariantSchema); 