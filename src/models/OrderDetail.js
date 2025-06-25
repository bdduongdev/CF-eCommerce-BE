import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const OrderDetailSchema = new Schema({
  order_id: {
    type: Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  product_variant_id: {
    type: Schema.Types.ObjectId,
    ref: 'ProductVariant',
    required: true
  },
  // Thông tin sản phẩm tại thời điểm đặt hàng (để lưu trữ lịch sử)
  product_info: {
    product_name: {
      type: String,
      required: true
    },
    color_name: {
      type: String,
      required: true
    },
    storage_name: {
      type: String,
      required: true
    },
    sku: {
      type: String,
      required: true
    },
    image_url: {
      type: String
    }
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unit_price: {
    type: Number,
    required: true,
    min: 0
  },
  total_price: {
    type: Number,
    required: true,
    min: 0
  },
  // Ghi chú cho từng sản phẩm
  note: {
    type: String,
    trim: true
  },
  // Trạng thái của từng sản phẩm trong đơn hàng
  item_status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
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
    { key: { order_id: 1 } },
    { key: { product_variant_id: 1 } },
    { key: { item_status: 1 } }
  ]
});

// Pre-save hook để tính total_price
OrderDetailSchema.pre('save', function(next) {
  if (this.quantity && this.unit_price) {
    this.total_price = this.quantity * this.unit_price;
  }
  next();
});

export default mongoose.model('OrderDetail', OrderDetailSchema);