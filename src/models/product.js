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
  status: {
    type: String,
    enum: ['active', 'inactive', 'discontinued'],
    default: 'active'
  },
  category_id: {
    type: Schema.Types.ObjectId,
    ref: 'Category'
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