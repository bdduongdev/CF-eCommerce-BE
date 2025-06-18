import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
  product_name: {
    type: String,
    required: true,
    maxlength: 100
  },
  slug: {
    type: String,
    lowercase: true,
    unique: true,
    index: true
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
    maxlength: 255,
    default: "/uploads/products/default-product.jpg"
  },
  image_gallery: {
    type: [String],
    default: []
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
    { key: { is_deleted: 1 } },
    { key: { slug: 1 } }
  ]
});

// Pre-save hook to generate slug from product_name if not provided
ProductSchema.pre('save', function(next) {
  if (!this.slug && this.product_name) {
    this.slug = this.product_name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
  }
  next();
});

export default mongoose.model('Product', ProductSchema);